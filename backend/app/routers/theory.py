from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.attempt import Attempt
from app.models.response import Response
from app.models.user import User
from app.services.followup_generator import (
    generate_followup_questions,
    should_ask_followup,
)
from app.services.rag_evaluator import evaluate_theory_answer
from app.services.scoring_service import calculate_theory_score

router = APIRouter(prefix="/theory", tags=["Theory Evaluation"])


class TheoryEvaluationRequest(BaseModel):
    question: str
    answer: str
    domain: str
    attempt_id: int | None = None
    question_id: int | None = None


class TheoryEvaluationResponse(BaseModel):
    evaluation: dict
    needs_followup_check: bool
    total_score: float
    followup_questions: list[str] = []
    has_followups: bool = False


@router.post("/evaluate", response_model=TheoryEvaluationResponse)
def evaluate_theory(
    data: TheoryEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.domain not in ["dsa", "oop", "ml", "react"]:
        raise HTTPException(
            status_code=400,
            detail="Domain must be one of: dsa, oop, ml, react"
        )

    if len(data.answer.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Answer is too short. Please provide a meaningful response."
        )

    try:
        evaluation = evaluate_theory_answer(
            question=data.question,
            user_answer=data.answer,
            domain=data.domain,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}"
        )

    # Save response to DB if attempt context provided
    if data.attempt_id and data.question_id:
        import json
        response = Response(
            attempt_id=data.attempt_id,
            question_id=data.question_id,
            user_answer=data.answer,
            ai_feedback=json.dumps(evaluation),
            is_correct=evaluation.get("total_score", 0) >= 60,
            score=calculate_theory_score(evaluation),
        )
        db.add(response)
        db.commit()

    should_check, _ = should_ask_followup(evaluation)

    # Follow-ups are now generated in the same Gemini call as the evaluation
    followups = evaluation.get("followups", [])
    # Sanitize: ensure it's a list of strings
    if not isinstance(followups, list):
        followups = []
    followups = [q for q in followups if isinstance(q, str) and q.strip()]

    return TheoryEvaluationResponse(
        evaluation=evaluation,
        needs_followup_check=should_check,
        total_score=evaluation.get("total_score", 0),
        followup_questions=followups,
        has_followups=len(followups) > 0,
    )


class FollowupRequest(BaseModel):
    question: str
    answer: str
    evaluation: dict


class FollowupResponse(BaseModel):
    followup_questions: list[str]
    has_followups: bool


@router.post("/followup", response_model=FollowupResponse)
def get_followup_questions(
    data: FollowupRequest,
    current_user: User = Depends(get_current_user),
):
    # Prefer pre-generated followups from the combined evaluation call
    existing = data.evaluation.get("followups", [])
    if isinstance(existing, list) and existing:
        followups = [q for q in existing if isinstance(q, str) and q.strip()]
        if followups:
            return FollowupResponse(
                followup_questions=followups,
                has_followups=True,
            )

    # Fallback: generate separately (only if combined call didn't produce them)
    followups = generate_followup_questions(
        original_question=data.question,
        user_answer=data.answer,
        evaluation=data.evaluation,
    )

    return FollowupResponse(
        followup_questions=followups,
        has_followups=len(followups) > 0,
    )