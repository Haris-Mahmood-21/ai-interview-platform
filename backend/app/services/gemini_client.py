import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

_model = None

# Default timeout for Gemini calls (seconds)
GEMINI_TIMEOUT = 60


def get_gemini_model():
    global _model
    if _model is None:
        _model = genai.GenerativeModel("gemini-2.5-flash")
    return _model


def call_gemini(
    prompt: str,
    max_output_tokens: int = 8192,
    response_mime_type: str | None = None,
) -> str:
    """Send a prompt to Gemini and return the text response.

    Args:
        prompt: The input prompt text.
        max_output_tokens: Cap on output length. With reasoning models like
            gemini-2.5-flash, thinking tokens count towards this limit, so
            it must be sufficiently high (default 8192) to avoid truncation.
        response_mime_type: Optional MIME type (e.g. 'application/json')
            to enforce structured JSON output.
    """
    model = get_gemini_model()
    config_args = {"max_output_tokens": max_output_tokens}
    if response_mime_type:
        config_args["response_mime_type"] = response_mime_type

    response = model.generate_content(
        prompt,
        generation_config=GenerationConfig(**config_args),
        request_options={"timeout": GEMINI_TIMEOUT},
    )

    try:
        return response.text
    except (ValueError, AttributeError):
        if response.candidates and response.candidates[0].content.parts:
            return "".join(
                getattr(p, "text", "") for p in response.candidates[0].content.parts
            )
        raise