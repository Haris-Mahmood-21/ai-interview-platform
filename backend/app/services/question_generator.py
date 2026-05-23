import json
import random

from sqlalchemy.orm import Session

from app.models.generated_paper import GeneratedPaper
from app.models.question import Question
from app.models.resume_profile import ResumeProfile
from app.services.gemini_client import call_gemini

# How many questions per interview paper
CODING_COUNT = 2
THEORY_COUNT = 3


def get_general_paper(db: Session, user_id: int, category: str) -> dict:
    """
    Generate an interview paper from the curated question bank.
    Picks questions the user hasn't seen recently.
    """
    # Get questions already seen by this user in this category
    seen_papers = (
        db.query(GeneratedPaper)
        .filter(
            GeneratedPaper.user_id == user_id,
            GeneratedPaper.source == "general",
        )
        .all()
    )

    seen_ids = set()
    for paper in seen_papers:
        try:
            ids = json.loads(paper.questions_json)
            seen_ids.update(ids)
        except (json.JSONDecodeError, TypeError):
            pass

    # Fetch coding questions for this category
    coding_qs = (
        db.query(Question)
        .filter(
            Question.category == category,
            Question.type == "coding",
            ~Question.id.in_(seen_ids),
        )
        .all()
    )

    # Fetch theory questions for this category
    theory_qs = (
        db.query(Question)
        .filter(
            Question.category == category,
            Question.type == "theory",
            ~Question.id.in_(seen_ids),
        )
        .all()
    )

    # If not enough unseen questions, allow repeats
    if len(coding_qs) < CODING_COUNT:
        coding_qs = (
            db.query(Question)
            .filter(Question.category == category, Question.type == "coding")
            .all()
        )

    if len(theory_qs) < THEORY_COUNT:
        theory_qs = (
            db.query(Question)
            .filter(Question.category == category, Question.type == "theory")
            .all()
        )

    # Randomly select questions
    selected_coding = random.sample(coding_qs, min(CODING_COUNT, len(coding_qs)))
    selected_theory = random.sample(theory_qs, min(THEORY_COUNT, len(theory_qs)))
    selected = selected_coding + selected_theory

    if not selected:
        raise ValueError(f"No questions found for category: {category}")

    # Save the generated paper to prevent repeats
    question_ids = [q.id for q in selected]
    paper = GeneratedPaper(
        user_id=user_id,
        source="general",
        questions_json=json.dumps(question_ids),
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)

    return _format_paper(paper.id, selected, "general")


def get_resume_paper(db: Session, user_id: int, category: str) -> dict:
    """
    Generate a personalized interview paper based on the user's resume profile.
    Uses Gemini to generate questions tailored to their skills and projects.
    """
    profile = (
        db.query(ResumeProfile)
        .filter(ResumeProfile.user_id == user_id)
        .first()
    )

    if not profile:
        raise ValueError(
            "No resume found. Please upload your resume first."
        )

    skills = json.loads(profile.extracted_skills or "[]")
    projects = json.loads(profile.extracted_projects or "[]")

    if not skills and not projects:
        raise ValueError(
            "Could not extract enough information from your resume. "
            "Please ensure your resume lists your technical skills and projects."
        )

    # Generate personalized questions via Gemini
    ai_questions = _generate_resume_questions(skills, projects, category)

    # Supplement with questions from the question bank
    bank_questions = (
        db.query(Question)
        .filter(
            Question.category == category,
            Question.type == "theory",
        )
        .all()
    )
    bank_sample = random.sample(bank_questions, min(2, len(bank_questions)))

    # Build the combined paper
    all_questions = ai_questions + [
        {
            "id": q.id,
            "type": q.type,
            "difficulty": q.difficulty,
            "question_text": q.question_text,
            "test_cases": json.loads(q.test_cases) if q.test_cases else None,
            "source": "bank",
        }
        for q in bank_sample
    ]

    # Store the paper (only bank question IDs — AI questions are ephemeral)
    bank_ids = [q.id for q in bank_sample]
    paper = GeneratedPaper(
        user_id=user_id,
        source="resume",
        questions_json=json.dumps(bank_ids),
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)

    return {
        "paper_id": paper.id,
        "source": "resume",
        "category": category,
        "questions": all_questions,
    }


def _generate_resume_questions(
    skills: list[str],
    projects: list[dict],
    category: str,
) -> list[dict]:
    """Use Gemini to generate interview questions tailored to the candidate's profile."""

    skills_str = ", ".join(skills[:15])  # limit for prompt size
    projects_str = "\n".join([
        f"- {p.get('title', 'Project')}: {p.get('description', '')}"
        for p in projects[:5]
    ])

    prompt = f"""You are a senior software engineer creating a personalized technical interview.

The candidate has these skills: {skills_str}

Their projects:
{projects_str if projects_str else "No projects listed"}

Generate exactly 3 technical interview questions for the {category.upper()} domain that:
1. Are directly relevant to the skills and projects listed above
2. Mix theory and practical understanding
3. Are appropriate for a junior to mid-level software engineer
4. Are specific — not generic questions anyone would get

Return only a JSON array. Each item must have these exact fields:
- "type": "theory" or "coding"
- "difficulty": "easy", "medium", or "hard"
- "question_text": the full question text
- "test_cases": null (for theory) or a brief description of what to test (for coding)

No markdown, no explanation, just the JSON array:
[
  {{
    "type": "theory",
    "difficulty": "medium",
    "question_text": "...",
    "test_cases": null
  }}
]"""

    raw = call_gemini(prompt)

    try:
        import re
        clean = re.sub(r"```json|```", "", raw).strip()
        questions = json.loads(clean)
        if isinstance(questions, list):
            return [
                {
                    "id": f"ai_{i}",
                    "type": q.get("type", "theory"),
                    "difficulty": q.get("difficulty", "medium"),
                    "question_text": q.get("question_text", ""),
                    "test_cases": q.get("test_cases"),
                    "source": "ai_generated",
                }
                for i, q in enumerate(questions[:3])
                if q.get("question_text")
            ]
    except (json.JSONDecodeError, ValueError):
        pass

    return []  # fallback — bank questions will cover it


def _format_paper(paper_id: int, questions: list, source: str) -> dict:
    """Format questions into a consistent paper structure."""
    return {
        "paper_id": paper_id,
        "source": source,
        "questions": [
            {
                "id": q.id,
                "type": q.type,
                "difficulty": q.difficulty,
                "question_text": q.question_text,
                "test_cases": json.loads(q.test_cases) if q.test_cases else None,
                "source": "bank",
            }
            for q in questions
        ],
    }