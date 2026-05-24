import json
import re

from app.services.gemini_client import call_gemini
from app.services.retriever import retrieve_context

DOMAIN_MAP = {
    "dsa": "dsa",
    "os": "os",
    "ml": "ml",
    "web": "web",
}


def build_evaluation_prompt(
    question: str,
    user_answer: str,
    context_chunks: list[str],
) -> str:
    context = "\n\n---\n\n".join(context_chunks)

    return f"""You are a fair and encouraging technical interviewer evaluating a junior to mid-level software engineering candidate.

Use the following reference material to evaluate the answer:

REFERENCE MATERIAL:
{context}

INTERVIEW QUESTION:
{question}

CANDIDATE'S ANSWER:
{user_answer}

EVALUATION GUIDELINES:
- This is a junior/mid-level candidate, not a PhD. Reward correct understanding even if the answer is not exhaustive.
- A correct answer with basic explanation deserves at least 15/25 per criterion.
- Only penalize heavily if the answer is factually wrong or shows fundamental misunderstanding.
- Partial credit: if they get the concept right but miss details, score 16-20 not 5-10.
- Depth: don't expect textbook completeness. Reward practical understanding.
- Be specific in explanations so the candidate knows exactly what to improve.

Evaluate on exactly these 4 criteria. Each is scored 0-25:
- Correctness (0-25): Is the answer factually accurate?
- Clarity (0-25): Is the explanation clear and well-structured?
- Depth (0-25): Does it go beyond surface level? (junior standard, not expert)
- Conceptual Understanding (0-25): Does the candidate grasp the underlying concept?

Return your evaluation as valid JSON only, no markdown, no code blocks:

{{
  "correctness": {{
    "score": <0-25>,
    "explanation": "<specific feedback>"
  }},
  "clarity": {{
    "score": <0-25>,
    "explanation": "<specific feedback>"
  }},
  "depth": {{
    "score": <0-25>,
    "explanation": "<specific feedback>"
  }},
  "conceptual_understanding": {{
    "score": <0-25>,
    "explanation": "<specific feedback>"
  }},
  "total_score": <sum of all 4>,
  "overall_feedback": "<2-3 sentences of constructive feedback>",
  "improvement_suggestions": "<specific topics to study or practice>"
}}"""


def evaluate_theory_answer(
    question: str,
    user_answer: str,
    domain: str,
) -> dict:
    """
    Full RAG evaluation pipeline:
    1. Retrieve relevant context from ChromaDB
    2. Build structured prompt
    3. Call Gemini
    4. Parse and return JSON response
    """

    # Step 1: Retrieve context
    context_chunks = retrieve_context(
        query=f"{question} {user_answer}",
        domain=DOMAIN_MAP.get(domain, "dsa"),
    )

    if not context_chunks:
        # Fallback: evaluate without context
        context_chunks = ["No specific reference material available for this query."]

    # Step 2: Build prompt
    prompt = build_evaluation_prompt(question, user_answer, context_chunks)

    # Step 3: Call Gemini
    raw_response = call_gemini(prompt)

    # Step 4: Parse JSON response
    return parse_evaluation_response(raw_response)


def parse_evaluation_response(raw: str) -> dict:
    """Parse Gemini's JSON response, with fallback on failure."""
    try:
        # Strip any accidental markdown code fences
        clean = re.sub(r"```json|```", "", raw).strip()
        return json.loads(clean)
    except (json.JSONDecodeError, ValueError):
        # Return a safe fallback so the endpoint never crashes
        return {
            "correctness": {"score": 0, "explanation": "Could not parse evaluation."},
            "clarity": {"score": 0, "explanation": "Could not parse evaluation."},
            "depth": {"score": 0, "explanation": "Could not parse evaluation."},
            "conceptual_understanding": {"score": 0, "explanation": "Could not parse evaluation."},
            "total_score": 0,
            "overall_feedback": "Evaluation failed. Please try again.",
            "improvement_suggestions": "N/A",
        }