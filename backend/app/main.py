from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.exceptions import general_exception_handler, validation_exception_handler
from app.routers import auth, code, dashboard, questions, resume, theory

app = FastAPI(
    title="AI Interview Platform",
    description="Backend API for AI-powered interview preparation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGINS],
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