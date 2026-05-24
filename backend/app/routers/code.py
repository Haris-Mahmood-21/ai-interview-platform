import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.question import Question
from app.models.user import User
from app.schemas.question import CodeSubmissionRequest, CodeSubmissionResponse
from app.services.judge0_client import submit_code
from app.services.scoring_service import calculate_coding_score

router = APIRouter(prefix="/code", tags=["Code Assessment"])


def normalize_output(output: str) -> str:
    """Normalize for comparison."""
    return output.strip().lower().replace(" ", "")


def outputs_match(actual: str, expected: str) -> bool:
    """Flexible output comparison."""
    a = normalize_output(actual)
    e = normalize_output(expected)
    if a == e:
        return True
    try:
        return float(a) == float(e)
    except ValueError:
        pass
    return False


@router.post("/submit", response_model=CodeSubmissionResponse)
def submit_code_solution(
    data: CodeSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    question = db.query(Question).filter(Question.id == data.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if question.type != "coding":
        raise HTTPException(
            status_code=400,
            detail="This endpoint is only for coding questions"
        )

    try:
        test_cases = json.loads(question.test_cases or "[]")
    except json.JSONDecodeError:
        test_cases = []

    if not test_cases:
        raise HTTPException(
            status_code=400,
            detail="This question has no test cases configured"
        )

    # Normalize line endings — fix \r\n from Windows/Monaco
    clean_code = data.source_code.replace("\r\n", "\n").replace("\r", "\n")

    results = []
    for i, tc in enumerate(test_cases):
        stdin_input = tc.get("input", "")
        expected = tc.get("expected", "").strip()

        # Combine user code + test input as one script
        # The test input lines are valid Python assignments (e.g. s = 'abcabcbb')
        # We append them after the function definition so they execute directly
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