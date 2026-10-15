import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.exceptions import general_exception_handler, validation_exception_handler
from app.routers import auth, code, dashboard, questions, resume, theory

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Preload heavy resources at startup so the first request is warm."""
    # Warm the SentenceTransformer embedding model (~2-3s cold load)
    try:
        from app.services.retriever import get_model
        get_model()
        logger.info("SentenceTransformer model preloaded")
    except Exception as e:
        logger.warning(f"Failed to preload embedding model: {e}")

    # Warm the ChromaDB collection connection
    try:
        from knowledge_base.chroma_client import get_or_create_collection
        get_or_create_collection("knowledge_base")
        logger.info("ChromaDB collection connection warmed")
    except Exception as e:
        logger.warning(f"Failed to warm ChromaDB connection: {e}")

    # Warm the Gemini model instance
    try:
        from app.services.gemini_client import get_gemini_model
        get_gemini_model()
        logger.info("Gemini model instance preloaded")
    except Exception as e:
        logger.warning(f"Failed to preload Gemini model: {e}")

    yield


app = FastAPI(
    title="AI Interview Platform",
    description="Backend API for AI-powered interview preparation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.ALLOWED_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(theory.router)
app.include_router(questions.router)
app.include_router(code.router)
app.include_router(dashboard.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "AI Interview Platform is running"}