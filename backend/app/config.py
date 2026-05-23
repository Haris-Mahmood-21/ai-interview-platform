from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # External APIs
    GEMINI_API_KEY: str = ""
    JUDGE0_API_KEY: str = ""
    JUDGE0_BASE_URL: str = "https://judge0-ce.p.rapidapi.com"

    # ChromaDB
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001

    # App
    UPLOAD_DIR: str = "./uploads"
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()