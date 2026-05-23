from pydantic import BaseModel
from typing import Optional


class QuestionOut(BaseModel):
    id: int | str       # str for AI-generated questions
    type: str
    difficulty: str
    question_text: str
    test_cases: Optional[list | str] = None
    source: str = "bank"

    class Config:
        from_attributes = True


class InterviewPaperResponse(BaseModel):
    paper_id: int
    source: str         # general or resume
    category: str = ""
    questions: list[QuestionOut]


class CodeSubmissionRequest(BaseModel):
    question_id: int
    source_code: str
    language: str       # python, javascript, java, cpp


class CodeSubmissionResponse(BaseModel):
    question_id: int
    results: list[dict]
    score: float
    passed_count: int
    total_count: int