import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.generated_paper import GeneratedPaper
from app.models.question import Question
from app.models.user import User
from app.schemas.question import CodeSubmissionRequest, CodeSubmissionResponse
from app.services.judge0_client import submit_code
from app.services.scoring_service import calculate_coding_score

router = APIRouter(prefix="/code", tags=["Code Assessment"])


def normalize_output(output: str) -> str:
    return output.strip().lower().replace(" ", "")


def outputs_match(actual: str, expected: str) -> bool:
    a = normalize_output(actual)
    e = normalize_output(expected)
    if a == e:
        return True
    try:
        return float(a) == float(e)
    except ValueError:
        pass
    return False


def get_test_cases_for_question(
    question_id: str | int,
    db: Session,
    user_id: int,
) -> list[dict]:
    """
    Fetch test cases for either:
    - A DB question (integer ID)
    - An LLM-generated question (string ID like "llm_0")
    """
    # Integer ID — fetch from questions table
    if isinstance(question_id, int) or str(question_id).isdigit():
        question = db.query(Question).filter(
            Question.id == int(question_id)
        ).first()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        return json.loads(question.test_cases or "[]")

    # String ID like "llm_0" — fetch from the user's most recent paper
    # Parse index from id
    try:
        idx = int(str(question_id).replace("llm_", ""))
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid question ID format: {question_id}"
        )

    # Find most recent paper for this user
    paper = (
        db.query(GeneratedPaper)
        .filter(GeneratedPaper.user_id == user_id)
        .order_by(GeneratedPaper.created_at.desc())
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="No active interview paper found"
        )

    questions = json.loads(paper.questions_json or "[]")

    # Find the question by its llm index
    for q in questions:
        if q.get("id") == question_id or q.get("id") == f"llm_{idx}":
            test_cases = q.get("test_cases")
            if not test_cases:
                return []
            if isinstance(test_cases, str):
                return json.loads(test_cases)
            return test_cases

    raise HTTPException(
        status_code=404,
        detail=f"Question {question_id} not found in your current paper"
    )


@router.post("/submit", response_model=CodeSubmissionResponse)
def submit_code_solution(
    data: CodeSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    test_cases = get_test_cases_for_question(
        data.question_id, db, current_user.id
    )

    if not test_cases:
        raise HTTPException(
            status_code=400,
            detail="This question has no test cases configured"
        )

    # Normalize line endings
    clean_code = data.source_code.replace("\r\n", "\n").replace("\r", "\n")

    results = []
    for i, tc in enumerate(test_cases):
        stdin_input = tc.get("input", "")
        expected = tc.get("expected", "").strip()

        full_code = clean_code + "\n\n" + stdin_input

        result = submit_code(
            source_code=full_code,
            language=data.language,
            stdin="",
        )

        actual_output = result.get("stdout", "").strip()
        passed = (
            result.get("status") == "accepted"
            and outputs_match(actual_output, expected)
        )

        results.append({
            "test_case": i + 1,
            "passed": passed,
            "expected": expected,
            "actual": actual_output,
            "status": result.get("status_description", ""),
            "error": result.get("stderr") or result.get("compile_output") or "",
            "time": result.get("time"),
        })

    score = calculate_coding_score(results)
    passed_count = sum(1 for r in results if r["passed"])

    return CodeSubmissionResponse(
        question_id=data.question_id,
        results=results,
        score=score,
        passed_count=passed_count,
        total_count=len(results),
    )