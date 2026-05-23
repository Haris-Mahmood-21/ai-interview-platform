from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, resume, theory

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

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(theory.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "AI Interview Platform is running"}