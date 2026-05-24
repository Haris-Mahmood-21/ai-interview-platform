from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
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
    avg_score = round(sum(a.total_score for a in attempts) / total_sessions, 1)
    best_score = round(max(a.total_score for a in attempts), 1)

    # Recent 10 attempts
    recent_attempts = [
        AttemptSummary(
            id=a.id,
            category=a.category,
            mode=a.mode,
            coding_score=round(a.coding_score, 1),
            theory_score=round(a.theory_score, 1),
            total_score=round(a.total_score, 1),
            time_taken=a.time_taken,
            date=a.date.strftime("%b %d, %Y"),
        )
        for a in attempts[:10]
    ]

    # Domain stats
    domain_map: dict[str, list[float]] = {}
    for a in attempts:
        if a.category not in domain_map:
            domain_map[a.category] = []
        domain_map[a.category].append(a.total_score)

    domain_stats = [
        DomainStats(
            category=cat,
            attempts=len(scores),
            avg_score=round(sum(scores) / len(scores), 1),
            best_score=round(max(scores), 1),
        )
        for cat, scores in domain_map.items()
    ]

    # Score trend — last 10 attempts chronologically
    trend_attempts = sorted(attempts[-10:], key=lambda a: a.date)
    score_trend = [
        {
            "session": i + 1,
            "score": round(a.total_score, 1),
            "date": a.date.strftime("%b %d"),
            "category": a.category,
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
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Attempt not found")

    responses = (
        db.query(Response)
        .filter(Response.attempt_id == attempt_id)
        .all()
    )

    return {
        "attempt": {
            "id": attempt.id,
            "category": attempt.category,
            "mode": attempt.mode,
            "coding_score": attempt.coding_score,
            "theory_score": attempt.theory_score,
            "total_score": attempt.total_score,
            "time_taken": attempt.time_taken,
            "date": attempt.date.strftime("%b %d, %Y %H:%M"),
        },
        "responses": [
            {
                "id": r.id,
                "question_id": r.question_id,
                "user_answer": r.user_answer,
                "ai_feedback": json.loads(r.ai_feedback) if r.ai_feedback else None,
                "score": r.score,
                "is_correct": r.is_correct,
            }
            for r in responses
        ],
    }