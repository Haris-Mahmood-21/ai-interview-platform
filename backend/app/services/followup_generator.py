import json
import re

from app.services.gemini_client import call_gemini


def generate_followup_questions(
    original_question: str,
    user_answer: str,
    evaluation: dict,
) -> list[str]:
    """
    Generate 1-2 follow-up questions based on the candidate's answer
    and where they showed weakness in the evaluation.
    """
    total_score = evaluation.get("total_score", 100)
    weak_areas = []

    for criterion in ["correctness", "clarity", "depth", "conceptual_understanding"]:
        data = evaluation.get(criterion, {})
        if isinstance(data, dict) and data.get("score", 25) < 15:
            weak_areas.append(criterion)

    prompt = f"""You are a technical interviewer conducting a software engineering interview.

The candidate just answered this question:
QUESTION: {original_question}

THEIR ANSWER: {user_answer}

Their score was {total_score}/100. Weak areas: {", ".join(weak_areas) if weak_areas else "none identified"}.

Generate 1-2 follow-up questions that:
1. Probe deeper into areas where they were weak or unclear
2. Are natural and conversational, as a real interviewer would ask
3. Are directly related to their specific answer

Return only a JSON array of strings, no extra text:
["follow-up question 1", "follow-up question 2"]"""

    raw = call_gemini(prompt)

    try:
        clean = re.sub(r"```json|```", "", raw).strip()
        questions = json.loads(clean)
        if isinstance(questions, list):
            return [q for q in questions if isinstance(q, str)][:2]
    except (json.JSONDecodeError, ValueError):
        pass

    return ["Can you elaborate on your answer?"]