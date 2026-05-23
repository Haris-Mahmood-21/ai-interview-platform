from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.services.followup_generator import generate_followup_questions
from app.services.rag_evaluator import evaluate_theory_answer

router = APIRouter(prefix="/theory", tags=["Theory Evaluation"])


class TheoryEvaluationRequest(BaseModel):
    question: str
    answer: str
    domain: str  # dsa, os, ml, web


class TheoryEvaluationResponse(BaseModel):
    evaluation: dict
    followup_questions: list[str]
    total_score: float


@router.post("/evaluate", response_model=TheoryEvaluationResponse)
def evaluate_theory(
    data: TheoryEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.domain not in ["dsa", "os", "ml", "web"]:
        raise HTTPException(
            status_code=400,
            detail="Domain must be one of: dsa, os, ml, web"
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

    followups = generate_followup_questions(
        original_question=data.question,
        user_answer=data.answer,
        evaluation=evaluation,
    )

    return TheoryEvaluationResponse(
        evaluation=evaluation,
        followup_questions=followups,
        total_score=evaluation.get("total_score", 0),
    )