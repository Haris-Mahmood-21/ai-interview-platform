import json

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.schemas.resume import ResumeProfileResponse
from app.services.profile_builder import build_profile

router = APIRouter(prefix="/resume", tags=["Resume"])

ALLOWED_TYPES = {"application/pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/upload", response_model=ResumeProfileResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted"
        )

    # Read file bytes
    file_bytes = await file.read()

    # Validate file size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB"
        )

    try:
        profile = build_profile(
            db=db,
            user_id=current_user.id,
            file_bytes=file_bytes,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process resume: {str(e)}"
        )

    return ResumeProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        extracted_skills=json.loads(profile.extracted_skills or "[]"),
        extracted_projects=json.loads(profile.extracted_projects or "[]"),
    )


@router.get("/profile", response_model=ResumeProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.resume_profile import ResumeProfile
    import json

    profile = (
        db.query(ResumeProfile)
        .filter(ResumeProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="No resume found. Please upload your resume first."
        )

    return ResumeProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        extracted_skills=json.loads(profile.extracted_skills or "[]"),
        extracted_projects=json.loads(profile.extracted_projects or "[]"),
    )