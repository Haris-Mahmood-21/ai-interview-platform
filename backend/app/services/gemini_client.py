from google import genai
from google.genai import types

from app.config import settings

_client: genai.Client | None = None

# Default timeout for Gemini calls (seconds)
GEMINI_TIMEOUT = 60


def get_gemini_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options=types.HttpOptions(timeout=GEMINI_TIMEOUT * 1000),
        )
    return _client


def get_gemini_model():
    """Warmup helper for lifespan event in app.main."""
    return get_gemini_client()


def call_gemini(
    prompt: str,
    max_output_tokens: int = 8192,
    response_mime_type: str | None = None,
) -> str:
    """Send a prompt to Gemini using the official google-genai SDK and return the text response.

    Args:
        prompt: The input prompt text.
        max_output_tokens: Cap on output length. With reasoning models like
            gemini-2.5-flash, thinking tokens count towards this limit, so
            it must be sufficiently high (default 8192) to avoid truncation.
        response_mime_type: Optional MIME type (e.g. 'application/json')
            to enforce structured JSON output.
    """
    client = get_gemini_client()
    config_args = {"max_output_tokens": max_output_tokens}
    if response_mime_type:
        config_args["response_mime_type"] = response_mime_type

    config = types.GenerateContentConfig(**config_args)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=config,
    )

    if response.text:
        return response.text

    if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
        return "".join(
            getattr(p, "text", "") for p in response.candidates[0].content.parts
        )

    return ""