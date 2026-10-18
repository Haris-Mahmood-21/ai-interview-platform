from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import json

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.attempt import Attempt
from app.models.response import Response
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class AttemptSummary(BaseModel):
    id: int
    category: str
    mode: str
    coding_score: float
    theory_score: float
    total_score: float
    time_taken: int
    date: str


class DomainStats(BaseModel):
    category: str
    attempts: int
    avg_score: float
    best_score: float


class DashboardResponse(BaseModel):
    total_sessions: int
    avg_score: float
    best_score: float
    recent_attempts: list[AttemptSummary]
    domain_stats: list[DomainStats]
    score_trend: list[dict]


@router.get("/stats", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # All attempts for this user ordered by date
    attempts = (
        db.query(Attempt)
        .filter(Attempt.user_id == current_user.id)
        .order_by(Attempt.date.desc())
        .all()
    )

    if not attempts:
        return DashboardResponse(
            total_sessions=0,
            avg_score=0.0,
            best_score=0.0,
            recent_attempts=[],
            domain_stats=[],
            score_trend=[],
        )

    total_sessions = len(attempts)
    avg_score = round(sum((a.total_score or 0.0) for a in attempts) / total_sessions, 1)
    best_score = round(max((a.total_score or 0.0) for a in attempts), 1)

    # Recent 10 attempts
    recent_attempts = [
        AttemptSummary(
            id=a.id,
            category=a.category or "",
            mode=a.mode or "",
            coding_score=round(a.coding_score or 0.0, 1),
            theory_score=round(a.theory_score or 0.0, 1),
            total_score=round(a.total_score or 0.0, 1),
            time_taken=a.time_taken or 0,
            date=a.date.strftime("%b %d, %Y") if a.date else "",
        )
        for a in attempts[:10]
    ]

    # Domain stats
    domain_map: dict[str, list[float]] = {}
    for a in attempts:
        cat = str(a.category or "General")
        if cat not in domain_map:
            domain_map[cat] = []
        domain_map[cat].append(float(a.total_score or 0.0))

    domain_stats = [
        DomainStats(
            category=cat,
            attempts=len(scores),
            avg_score=round(sum(scores) / len(scores), 1) if scores else 0.0,
            best_score=round(max(scores), 1) if scores else 0.0,
        )
        for cat, scores in domain_map.items()
    ]

    # Score trend — last 10 attempts chronologically (most recent 10 sessions)
    recent_10 = attempts[:10]
    trend_attempts = sorted(recent_10, key=lambda a: a.date if a.date else datetime.min)
    score_trend = [
        {
            "session": i + 1,
            "score": round(a.total_score or 0.0, 1),
            "date": a.date.strftime("%b %d") if a.date else "",
            "category": a.category or "",
        }
        for i, a in enumerate(trend_attempts)
    ]

    return DashboardResponse(
        total_sessions=total_sessions,
        avg_score=avg_score,
        best_score=best_score,
        recent_attempts=recent_attempts,
        domain_stats=domain_stats,
        score_trend=score_trend,
    )


@router.get("/attempts/{attempt_id}")
def get_attempt_detail(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attempt = (
        db.query(Attempt)
        .filter(
            Attempt.id == attempt_id,
            Attempt.user_id == current_user.id,
        )
        .first()
    )

    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    responses = (
        db.query(Response)
        .filter(Response.attempt_id == attempt_id)
        .order_by(Response.id.asc())
        .all()
    )

    attempt_dict = {
        "id": attempt.id,
        "category": attempt.category or "",
        "mode": attempt.mode or "",
        "coding_score": attempt.coding_score or 0.0,
        "theory_score": attempt.theory_score or 0.0,
        "total_score": attempt.total_score or 0.0,
        "time_taken": attempt.time_taken or 0,
        "date": attempt.date.strftime("%b %d, %Y %H:%M") if attempt.date else "",
    }

    # If no responses recorded (e.g. historical attempts completed before full results saving),
    # attempt to recover question context from the closest GeneratedPaper for this user
    if not responses:
        from app.models.generated_paper import GeneratedPaper
        paper = (
            db.query(GeneratedPaper)
            .filter(
                GeneratedPaper.user_id == current_user.id,
                GeneratedPaper.created_at <= (attempt.date if attempt.date else datetime.utcnow()),
            )
            .order_by(GeneratedPaper.created_at.desc())
            .first()
        )
        if not paper:
            paper = (
                db.query(GeneratedPaper)
                .filter(GeneratedPaper.user_id == current_user.id)
                .order_by(GeneratedPaper.created_at.desc())
                .first()
            )

        if paper and paper.questions_json:
            try:
                p_questions = json.loads(paper.questions_json)
                if isinstance(p_questions, list):
                    synthetic_responses = []
                    for idx, q in enumerate(p_questions):
                        q_type = q.get("type", "theory")
                        q_score = attempt.coding_score if q_type == "coding" else attempt.theory_score
                        synthetic_responses.append({
                            "id": f"hist_{idx}",
                            "question_id": q.get("id", idx + 1),
                            "question_text": q.get("question_text", ""),
                            "type": q_type,
                            "difficulty": q.get("difficulty", "medium"),
                            "user_answer": "Detailed answer recorded in previous session format.",
                            "score": q_score,
                            "is_correct": q_score >= 60,
                            "ai_feedback": {
                                "overall_feedback": "Evaluated during past interview.",
                                "improvement_suggestions": "Review topic concepts and practice coding implementations.",
                            },
                            "evaluation": None,
                            "code_result": None,
                            "followup_answers": [],
                            "language": "python",
                        })
                    return {
                        "attempt": attempt_dict,
                        "responses": synthetic_responses,
                    }
            except Exception:
                pass

    enriched_responses = []
    for r in responses:
        feedback = {}
        if r.ai_feedback:
            try:
                feedback = json.loads(r.ai_feedback)
            except Exception:
                feedback = {"overall_feedback": r.ai_feedback}

        q_obj = r.question
        q_text = getattr(q_obj, "question_text", None) or feedback.get("question_text", "")
        q_type = getattr(q_obj, "type", None) or feedback.get("type", "theory")
        q_diff = getattr(q_obj, "difficulty", None) or feedback.get("difficulty", "medium")
        language = feedback.get("language", "python")
        eval_dict = feedback.get("evaluation")
        code_result = feedback.get("code_result")
        followup_answers = feedback.get("followup_answers", [])

        # Backward compatibility if feedback was direct evaluation dict
        if not eval_dict and q_type == "theory" and isinstance(feedback, dict) and "correctness" in feedback:
            eval_dict = feedback

        enriched_responses.append({
            "id": r.id,
            "question_id": r.question_id,
            "question_text": q_text,
            "type": q_type,
            "difficulty": q_diff,
            "user_answer": r.user_answer or "",
            "score": r.score or 0.0,
            "is_correct": r.is_correct,
            "ai_feedback": feedback,
            "evaluation": eval_dict,
            "code_result": code_result,
            "followup_answers": followup_answers,
            "language": language,
        })

    return {
        **attempt_dict,
        "attempt": attempt_dict,
        "responses": enriched_responses,
    }