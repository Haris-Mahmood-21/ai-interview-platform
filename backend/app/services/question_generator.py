import json
import random
import re

from sqlalchemy.orm import Session

from app.models.attempt import Attempt
from app.models.generated_paper import GeneratedPaper
from app.models.resume_profile import ResumeProfile
from app.services.gemini_client import call_gemini

CODING_COUNT = 2
THEORY_COUNT = 3

DOMAIN_LABELS = {
    "dsa": "Data Structures and Algorithms",
    "oop": "Object-Oriented Programming",
    "ml": "Machine Learning",
    "react": "React and Frontend Development",
}

def get_user_difficulty(db: Session, user_id: int, category: str) -> str:
    """
    Determine appropriate difficulty based on recent performance.
    Returns: 'easy', 'medium', or 'hard'
    """
    recent = (
        db.query(Attempt)
        .filter(
            Attempt.user_id == user_id,
            Attempt.category == category,
        )
        .order_by(Attempt.date.desc())
        .limit(3)
        .all()
    )

    if not recent:
        return "easy"  # first time — start easy

    avg = sum(a.total_score for a in recent) / len(recent)

    if avg >= 78:
        return "hard"
    elif avg >= 55:
        return "medium"
    else:
        return "easy"


def get_already_seen_questions(db: Session, user_id: int) -> list[str]:
    """
    Return a list of question texts the user has already been asked.
    Used to tell Gemini what NOT to generate.
    """
    papers = (
        db.query(GeneratedPaper)
        .filter(GeneratedPaper.user_id == user_id)
        .order_by(GeneratedPaper.created_at.desc())
        .limit(10)
        .all()
    )

    seen = []
    for paper in papers:
        try:
            data = json.loads(paper.questions_json)
            # questions_json now stores full question objects
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and "question_text" in item:
                        seen.append(item["question_text"][:80])
        except (json.JSONDecodeError, TypeError):
            pass

    return seen[:15]  # limit prompt size


def build_generation_prompt(
    domain: str,
    difficulty: str,
    skills: list[str],
    projects: list[dict],
    seen_questions: list[str],
    mode: str,
) -> str:
    domain_label = DOMAIN_LABELS.get(domain, domain)

    # Build personalization context
    if mode == "resume" and (skills or projects):
        skills_str = ", ".join(skills[:12]) if skills else "not specified"
        projects_str = "\n".join([
            f"- {p.get('title', '')}: {p.get('description', '')[:100]}"
            for p in projects[:4]
        ]) if projects else "not specified"
        personalization = f"""
CANDIDATE PROFILE:
Skills: {skills_str}
Projects:
{projects_str}

Make questions directly relevant to their background.
"""
    else:
        personalization = f"""
Generate standard {difficulty} difficulty questions for {domain_label}.
"""

    # Build avoid list
    if seen_questions:
        avoid = "\n".join([f"- {q}" for q in seen_questions[:10]])
        avoid_block = f"""
IMPORTANT — Do NOT generate questions similar to these already-asked ones:
{avoid}
"""
    else:
        avoid_block = ""

    return f"""You are a senior software engineer creating a technical interview for a junior/mid-level candidate.

DOMAIN: {domain_label}
DIFFICULTY: {difficulty}
{personalization}
{avoid_block}

Generate exactly {CODING_COUNT + THEORY_COUNT} interview questions:
- {CODING_COUNT} coding questions (type: "coding")
- {THEORY_COUNT} theory/conceptual questions (type: "theory")

Requirements for coding questions:
- Must be solvable in Python in under 20 minutes
- Include a clear example with input and expected output
- Set "test_cases" as a list of 3 test objects with "input" and "expected" fields
- The "input" field must be valid Python assignment statements ending with a print() call
  Example: "nums = [1,2,3]\\ntarget = 5\\nprint(twoSum(nums, target))"
- The "expected" field must be the exact printed output

Requirements for theory questions:
- Should test conceptual understanding, not memorization
- Should be answerable in 3-5 sentences by a junior engineer
- Set "test_cases" to null

Return ONLY a valid JSON array. No markdown, no explanation, no code blocks:
[
  {{
    "type": "coding",
    "difficulty": "{difficulty}",
    "question_text": "full question with example",
    "test_cases": [
      {{"input": "x = 5\\nprint(myFunc(x))", "expected": "25"}},
      {{"input": "x = 0\\nprint(myFunc(x))", "expected": "0"}},
      {{"input": "x = 3\\nprint(myFunc(x))", "expected": "9"}}
    ]
  }},
  {{
    "type": "theory",
    "difficulty": "{difficulty}",
    "question_text": "conceptual question",
    "test_cases": null
  }}
]"""


def generate_questions_with_llm(
    db: Session,
    user_id: int,
    domain: str,
    mode: str,
) -> list[dict]:
    """
    Core function: ask Gemini to generate a full interview paper.
    Returns a validated list of question dicts.
    """
    # Determine difficulty from past performance
    difficulty = get_user_difficulty(db, user_id, domain)

    # Get questions to avoid
    seen_questions = get_already_seen_questions(db, user_id)

    # Get resume profile if resume mode
    skills, projects = [], []
    if mode == "resume":
        profile = (
            db.query(ResumeProfile)
            .filter(ResumeProfile.user_id == user_id)
            .first()
        )
        if profile:
            skills = json.loads(profile.extracted_skills or "[]")
            projects = json.loads(profile.extracted_projects or "[]")

    # Build and send prompt
    prompt = build_generation_prompt(
        domain=domain,
        difficulty=difficulty,
        skills=skills,
        projects=projects,
        seen_questions=seen_questions,
        mode=mode,
    )

    raw = call_gemini(prompt)

    # Parse and validate
    questions = parse_and_validate_questions(raw, difficulty)

    # If LLM fails, raise clearly
    if not questions:
        raise ValueError(
            "Failed to generate questions. Please try again."
        )

    return questions, difficulty


def parse_and_validate_questions(raw: str, difficulty: str) -> list[dict]:
    """
    Parse Gemini response into validated question list.
    Handles common formatting issues.
    """
    try:
        clean = re.sub(r"```json|```", "", raw).strip()
        data = json.loads(clean)

        if not isinstance(data, list):
            return []

        validated = []
        for i, q in enumerate(data):
            if not isinstance(q, dict):
                continue
            if not q.get("question_text", "").strip():
                continue
            if q.get("type") not in ("coding", "theory"):
                continue

            validated.append({
                "id": f"llm_{i}",
                "type": q["type"],
                "difficulty": q.get("difficulty", difficulty),
                "question_text": q["question_text"].strip(),
                "test_cases": q.get("test_cases"),
                "source": "ai_generated",
            })

        # Ensure we have the right mix
        coding = [q for q in validated if q["type"] == "coding"]
        theory = [q for q in validated if q["type"] == "theory"]

        # Take up to the counts we need
        result = coding[:CODING_COUNT] + theory[:THEORY_COUNT]
        return result

    except (json.JSONDecodeError, ValueError, KeyError):
        return []


def save_paper(
    db: Session,
    user_id: int,
    questions: list[dict],
    mode: str,
    difficulty: str,
) -> GeneratedPaper:
    """Save the generated paper to DB for history and repeat-avoidance."""
    paper = GeneratedPaper(
        user_id=user_id,
        source=mode,
        # Store full question objects so we can show history
        # and avoid repeats in future sessions
        questions_json=json.dumps(questions),
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return paper


def get_general_paper(db: Session, user_id: int, category: str) -> dict:
    questions, difficulty = generate_questions_with_llm(
        db=db,
        user_id=user_id,
        domain=category,
        mode="general",
    )

    paper = save_paper(db, user_id, questions, "general", difficulty)

    return {
        "paper_id": paper.id,
        "source": "general",
        "category": category,
        "difficulty": difficulty,
        "questions": questions,
    }


def get_resume_paper(db: Session, user_id: int, category: str) -> dict:
    # Check resume exists
    profile = (
        db.query(ResumeProfile)
        .filter(ResumeProfile.user_id == user_id)
        .first()
    )
    if not profile:
        raise ValueError(
            "No resume found. Please upload your resume first."
        )

    questions, difficulty = generate_questions_with_llm(
        db=db,
        user_id=user_id,
        domain=category,
        mode="resume",
    )

    paper = save_paper(db, user_id, questions, "resume", difficulty)

    return {
        "paper_id": paper.id,
        "source": "resume",
        "category": category,
        "difficulty": difficulty,
        "questions": questions,
    }