import json
import re

from app.services.gemini_client import call_gemini

# Score thresholds
NO_FOLLOWUP_THRESHOLD = 80    # excellent answer — no follow-up needed
ONE_FOLLOWUP_THRESHOLD = 55   # decent answer — one targeted follow-up
# below 60 → two follow-ups

# Per-criterion threshold — below this score, the criterion is "weak"
WEAK_CRITERION_THRESHOLD = 13


def should_ask_followup(evaluation: dict) -> tuple[bool, int]:
    """
    Decide whether to ask follow-up questions and how many.

    Returns (should_ask: bool, count: int)
    """
    total = evaluation.get("total_score", 0)

    if total >= NO_FOLLOWUP_THRESHOLD:
        return False, 0
    elif total >= ONE_FOLLOWUP_THRESHOLD:
        return True, 1
    else:
        return True, 2


def get_weak_criteria(evaluation: dict) -> list[str]:
    """
    Return a list of criteria where the candidate scored below threshold.
    Ordered from weakest to strongest so we probe the worst gap first.
    """
    criteria = ["correctness", "clarity", "depth", "conceptual_understanding"]
    scores = []

    for criterion in criteria:
        data = evaluation.get(criterion, {})
        if isinstance(data, dict):
            score = data.get("score", 25)
            explanation = data.get("explanation", "")
            scores.append((criterion, score, explanation))

    # Sort by score ascending — weakest first
    scores.sort(key=lambda x: x[1])

    return [
        {
            "criterion": c,
            "score": s,
            "explanation": e,
        }
        for c, s, e in scores
        if s < WEAK_CRITERION_THRESHOLD
    ]


def build_followup_prompt(
    original_question: str,
    user_answer: str,
    weak_criteria: list[dict],
    count: int,
) -> str:
    """Build a targeted prompt based on specifically what was weak."""

    if weak_criteria:
        # Describe each weak area with its explanation so Gemini
        # generates questions that directly target the gap
        weak_summary = "\n".join([
            f"- {w['criterion'].replace('_', ' ').title()} "
            f"(score {w['score']}/25): {w['explanation']}"
            for w in weak_criteria[:count]
        ])
        targeting_instruction = f"""The candidate was specifically weak in these areas:
{weak_summary}

Your follow-up questions MUST directly probe these weak areas."""
    else:
        # Score was moderate overall — dig deeper into the topic generally
        targeting_instruction = (
            "The answer was correct but lacked depth. "
            "Ask questions that probe deeper understanding of the topic."
        )

    return f"""You are a senior software engineer conducting a technical interview.

The candidate just answered this question:
QUESTION: {original_question}

THEIR ANSWER: {user_answer}

{targeting_instruction}

Generate exactly {count} follow-up question{"s" if count > 1 else ""} that:
1. Are specific to what the candidate said (or failed to say)
2. Feel natural — like a real interviewer following up
3. Cannot be answered with yes or no
4. Progress from their answer rather than starting over

Return only a JSON array of strings. No explanation, no markdown, no extra text:
["question 1"{', "question 2"' if count > 1 else ""}]"""


def generate_followup_questions(
    original_question: str,
    user_answer: str,
    evaluation: dict,
) -> list[str]:
    """
    Intelligently decide whether and what follow-up questions to ask.

    Returns an empty list if the answer was strong enough.
    Returns 1-2 targeted questions otherwise.
    """

    # Step 1: Decide if follow-ups are needed at all
    should_ask, count = should_ask_followup(evaluation)

    if not should_ask:
        return []  # great answer — no follow-up

    # Step 2: Find specifically what was weak
    weak_criteria = get_weak_criteria(evaluation)

    # Step 3: Build targeted prompt
    prompt = build_followup_prompt(
        original_question=original_question,
        user_answer=user_answer,
        weak_criteria=weak_criteria,
        count=count,
    )

    # Step 4: Call Gemini
    raw = call_gemini(prompt)

    # Step 5: Parse response
    try:
        clean = re.sub(r"```json|```", "", raw).strip()
        questions = json.loads(clean)
        if isinstance(questions, list):
            return [q for q in questions if isinstance(q, str)][:count]
    except (json.JSONDecodeError, ValueError):
        pass

    # Fallback — only if parsing fails
    return ["Can you walk me through your reasoning in more detail?"]