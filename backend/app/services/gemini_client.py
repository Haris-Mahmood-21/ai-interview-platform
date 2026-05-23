import google.generativeai as genai

from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

_model = None


def get_gemini_model():
    global _model
    if _model is None:
        _model = genai.GenerativeModel("gemini-2.5-flash")
    return _model


def call_gemini(prompt: str) -> str:
    """Send a prompt to Gemini and return the text response."""
    model = get_gemini_model()
    response = model.generate_content(prompt)
    return response.text