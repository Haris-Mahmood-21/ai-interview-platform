from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.schemas.question import InterviewPaperResponse
from app.services.question_generator import get_general_paper, get_resume_paper

router = APIRouter(prefix="/questions", tags=["Question Generation"])

VALID_CATEGORIES = {"dsa", "os", "ml", "web"}


class GeneratePaperRequest(BaseModel):
    category: str       # dsa, os, ml, web
    mode: str           # general, resume


@router.post("/generate", response_model=InterviewPaperResponse)
def generate_paper(
    data: GeneratePaperRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Category must be one of: {', '.join(VALID_CATEGORIES)}"
        )

    if data.mode not in {"general", "resume"}:
        raise HTTPException(
            status_code=400,
            detail="Mode must be either 'general' or 'resume'"
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
            detail=f"Failed to generate paper: {str(e)}"
        )

    # Add category to paper for response
    paper["category"] = data.category
    return paper