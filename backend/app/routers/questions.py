import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.attempt import Attempt
from app.models.user import User
from app.schemas.question import InterviewPaperResponse
from app.services.question_generator import get_general_paper, get_resume_paper
from app.services.scoring_service import calculate_total_score

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/questions", tags=["Question Generation"])

VALID_CATEGORIES = {"dsa", "oop", "ml", "react"}


class GeneratePaperRequest(BaseModel):
    category: Optional[str] = None
    mode: str


@router.post("/generate", response_model=InterviewPaperResponse)
def generate_paper(
    data: GeneratePaperRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mode = (data.mode or "").lower().strip()
    category = data.category.lower().strip() if data.category else None

    if mode not in {"general", "resume"}:
        raise HTTPException(
            status_code=400,
            detail="Mode must be either 'general' or 'resume'",
        )

    if mode == "general" and not category:
        raise HTTPException(
            status_code=400,
            detail="Please select a domain for general mode.",
        )

    if category and category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Domain must be one of: {', '.join(VALID_CATEGORIES)}",
        )

    try:
        if mode == "general":
            paper = get_general_paper(
                db=db,
                user_id=current_user.id,
                category=category,
            )
        else:
            paper = get_resume_paper(
                db=db,
                user_id=current_user.id,
                category=category,
            )

    except ValueError as e:
        logger.warning(f"Failed to generate paper (user={current_user.id}, mode={mode}): {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error(f"Unexpected error generating paper (user={current_user.id}, mode={mode}): {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate paper: {str(e)}",
        )

    paper["category"] = paper.get("category", category or "")

    return paper


from typing import Any, Union
import json
from app.models.response import Response
from app.models.question import Question


class ResultFollowupItem(BaseModel):
    question: str
    answer: str
    evaluation: Optional[dict[str, Any]] = None


class AttemptResultItem(BaseModel):
    question_id: Optional[Union[str, int]] = None
    question_text: str
    type: str
    difficulty: Optional[str] = "medium"
    test_cases: Optional[Union[list[Any], str]] = None
    answer: Optional[str] = ""
    language: Optional[str] = "python"
    score: Optional[float] = 0.0
    completed: Optional[bool] = True
    evaluation: Optional[dict[str, Any]] = None
    code_result: Optional[dict[str, Any]] = None
    followup_answers: Optional[list[Any]] = []


class SaveAttemptRequest(BaseModel):
    category: str
    mode: str
    coding_score: float
    theory_score: float
    time_taken: int
    paper_id: Optional[int] = None
    results: Optional[list[AttemptResultItem]] = []


class SaveAttemptResponse(BaseModel):
    attempt_id: int
    total_score: float


@router.post("/attempts/save", response_model=SaveAttemptResponse)
def save_attempt(
    data: SaveAttemptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = calculate_total_score(data.coding_score, data.theory_score)

    attempt = Attempt(
        user_id=current_user.id,
        mode=data.mode,
        category=data.category,
        coding_score=data.coding_score,
        theory_score=data.theory_score,
        total_score=total,
        time_taken=data.time_taken,
    )

    db.add(attempt)
    db.flush()

    if data.results:
        for r in data.results:
            question_db_id = None
            if r.question_id is not None and str(r.question_id).isdigit():
                existing_q = db.query(Question).filter(Question.id == int(r.question_id)).first()
                if existing_q:
                    question_db_id = existing_q.id

            if question_db_id is None:
                new_q = Question(
                    category=data.category,
                    type=r.type,
                    difficulty=r.difficulty or "medium",
                    question_text=r.question_text,
                    test_cases=json.dumps(r.test_cases) if isinstance(r.test_cases, (list, dict)) else (r.test_cases or None),
                )
                db.add(new_q)
                db.flush()
                question_db_id = new_q.id

            feedback_data: dict[str, Any] = {
                "type": r.type,
                "difficulty": r.difficulty or "medium",
                "question_text": r.question_text,
                "language": r.language or "python",
            }

            if r.type == "coding":
                feedback_data["code_result"] = r.code_result
            else:
                eval_dict = r.evaluation.get("evaluation", r.evaluation) if r.evaluation else None
                feedback_data["evaluation"] = eval_dict
                feedback_data["followup_answers"] = r.followup_answers or []
                if isinstance(eval_dict, dict):
                    feedback_data["overall_feedback"] = eval_dict.get("overall_feedback")
                    feedback_data["improvement_suggestions"] = eval_dict.get("improvement_suggestions")

            is_correct = (r.score or 0) >= 60 if r.type == "theory" else ((r.score or 0) >= 100)
            resp_row = Response(
                attempt_id=attempt.id,
                question_id=question_db_id,
                user_answer=r.answer or "",
                ai_feedback=json.dumps(feedback_data),
                is_correct=is_correct,
                score=r.score or 0.0,
            )
            db.add(resp_row)

    db.commit()
    db.refresh(attempt)

    return SaveAttemptResponse(
        attempt_id=attempt.id,
        total_score=total,
    )