from unittest.mock import MagicMock, patch

from app.services.rag_evaluator import parse_evaluation_response, build_evaluation_prompt


def test_parse_valid_json():
    raw = '''{
        "correctness": {"score": 20, "explanation": "Good"},
        "clarity": {"score": 18, "explanation": "Clear"},
        "depth": {"score": 15, "explanation": "Could go deeper"},
        "conceptual_understanding": {"score": 22, "explanation": "Strong"},
        "total_score": 75,
        "overall_feedback": "Good answer overall.",
        "improvement_suggestions": "Study load factors more."
    }'''
    result = parse_evaluation_response(raw)
    assert result["total_score"] == 75
    assert result["correctness"]["score"] == 20


def test_parse_json_with_markdown_fences():
    raw = '```json\n{"correctness": {"score": 10, "explanation": "ok"}, "clarity": {"score": 10, "explanation": "ok"}, "depth": {"score": 10, "explanation": "ok"}, "conceptual_understanding": {"score": 10, "explanation": "ok"}, "total_score": 40, "overall_feedback": "ok", "improvement_suggestions": "more"}\n```'
    result = parse_evaluation_response(raw)
    assert result["total_score"] == 40


def test_parse_invalid_json_returns_fallback():
    raw = "Sorry, I cannot evaluate this."
    result = parse_evaluation_response(raw)
    assert result["total_score"] == 0
    assert "overall_feedback" in result


def test_build_prompt_contains_question():
    prompt = build_evaluation_prompt(
        question="What is a binary search tree?",
        user_answer="A BST is a tree where left < root < right.",
        context_chunks=["BST properties: left child smaller, right child larger."],
    )
    assert "binary search tree" in prompt
    assert "BST" in prompt
    assert "left < root < right" in prompt