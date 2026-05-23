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

    return f"""You are a senior software engineer evaluating a candidate's answer in a technical interview.

Use the following reference material to evaluate the answer:

REFERENCE MATERIAL:
{context}

INTERVIEW QUESTION:
{question}

CANDIDATE'S ANSWER:
{user_answer}

Evaluate the answer on exactly these 4 criteria. For each criterion, give a score from 0 to 25 and a brief explanation.

Return your evaluation as valid JSON only, with no extra text, no markdown, no code blocks:

{{
  "correctness": {{
    "score": <0-25>,
    "explanation": "<what was correct or incorrect>"
  }},
  "clarity": {{
    "score": <0-25>,
    "explanation": "<how clearly the answer was communicated>"
  }},
  "depth": {{
    "score": <0-25>,
    "explanation": "<how deeply the topic was explored>"
  }},
  "conceptual_understanding": {{
    "score": <0-25>,
    "explanation": "<whether the candidate understands the underlying concepts>"
  }},
  "total_score": <sum of all 4 scores>,
  "overall_feedback": "<2-3 sentences of constructive overall feedback>",
  "improvement_suggestions": "<specific things the candidate should study or practice>"
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