from pydantic import BaseModel, ConfigDict
from typing import Optional


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | str
    type: str
    difficulty: str
    question_text: str
    test_cases: Optional[list | str] = None
    source: str = "ai_generated"


class InterviewPaperResponse(BaseModel):
    paper_id: int
    source: str
    category: str = ""
    difficulty: str = "medium"
    questions: list[QuestionOut]


class CodeSubmissionRequest(BaseModel):
    question_id: str | int        # now supports "llm_0" style IDs
    source_code: str
    language: str


class CodeSubmissionResponse(BaseModel):
    question_id: str | int
    results: list[dict]
    score: float
    passed_count: int
    total_count: int