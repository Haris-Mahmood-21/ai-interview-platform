import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

_model = None

# Default timeout for Gemini calls (seconds)
GEMINI_TIMEOUT = 30


def get_gemini_model():
    global _model
    if _model is None:
        _model = genai.GenerativeModel("gemini-2.5-flash")
    return _model


def call_gemini(prompt: str, max_output_tokens: int = 4096) -> str:
    """Send a prompt to Gemini and return the text response.

    Args:
        prompt: The input prompt text.
        max_output_tokens: Cap on output length — larger for question
            generation, smaller for evaluation. Prevents unbounded
            generation time.
    """
    model = get_gemini_model()
    response = model.generate_content(
        prompt,
        generation_config=GenerationConfig(
            max_output_tokens=max_output_tokens,
        ),
        request_options={"timeout": GEMINI_TIMEOUT},
    )
    return response.text