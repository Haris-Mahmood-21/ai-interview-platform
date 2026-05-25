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
    if data.mode not in {"general", "resume"}:
        raise HTTPException(
            status_code=400,
            detail="Mode must be either 'general' or 'resume'",
        )

    if data.mode == "general" and not data.category:
        raise HTTPException(
            status_code=400,
            detail="Please select a domain for general mode.",
        )

    if data.category and data.category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Domain must be one of: {', '.join(VALID_CATEGORIES)}",
        )

    try:
        if data.mode == "general":
            paper = get_general_paper(
                db=db,
                user_id=current_user.id,
                category=data.category,
            )
        else:
            paper = get_resume_paper(
                db=db,
                user_id=current_user.id,
                category=data.category,
            )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate paper: {str(e)}",
        )

    paper["category"] = paper.get("category", data.category or "")

    return paper


class SaveAttemptRequest(BaseModel):
    category: str
    mode: str
    coding_score: float
    theory_score: float
    time_taken: int


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
    db.commit()
    db.refresh(attempt)

    return SaveAttemptResponse(
        attempt_id=attempt.id,
        total_score=total,
    )