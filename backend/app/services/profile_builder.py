import json

from sqlalchemy.orm import Session

from app.models.resume_profile import ResumeProfile
from app.services.resume_parser import clean_text, detect_sections, extract_text_from_pdf
from app.services.skill_extractor import extract_projects, extract_skills


def build_profile(
    db: Session,
    user_id: int,
    file_bytes: bytes,
) -> ResumeProfile:
    """
    Full pipeline:
    PDF bytes → extract text → clean → detect sections
    → extract skills & projects → save to DB
    """

    # Step 1: Extract and clean text
    raw_text = extract_text_from_pdf(file_bytes)
    clean = clean_text(raw_text)

    # Step 2: Detect sections
    sections = detect_sections(clean)

    # Step 3: Extract skills and projects
    skills = extract_skills(sections)
    projects = extract_projects(sections)

    # Step 4: Check if user already has a profile — update if yes
    existing = (
        db.query(ResumeProfile)
        .filter(ResumeProfile.user_id == user_id)
        .first()
    )

    if existing:
        existing.raw_text = clean
        existing.extracted_skills = json.dumps(skills)
        existing.extracted_projects = json.dumps(projects)
        db.commit()
        db.refresh(existing)
        return existing

    # Step 5: Create new profile
    profile = ResumeProfile(
        user_id=user_id,
        raw_text=clean,
        extracted_skills=json.dumps(skills),
        extracted_projects=json.dumps(projects),
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile