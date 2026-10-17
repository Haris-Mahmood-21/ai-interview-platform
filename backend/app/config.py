from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_backend_dir = Path(__file__).resolve().parent.parent
_env_path = _backend_dir / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(_env_path, ".env"),
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = "sqlite:///./app.db"

    # JWT
    SECRET_KEY: str = "default_secret_key_for_development_replace_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # External APIs
    GEMINI_API_KEY: str = ""
    JUDGE0_API_KEY: str = ""
    JUDGE0_BASE_URL: str = "https://judge0-ce.p.rapidapi.com"
    JUDGE0_PYTHON_LANGUAGE_ID: int = 71
    JUDGE0_JAVASCRIPT_LANGUAGE_ID: int = 63
    JUDGE0_JAVA_LANGUAGE_ID: int = 62
    JUDGE0_CPP_LANGUAGE_ID: int = 54

    # ChromaDB
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001

    # App
    UPLOAD_DIR: str = "./uploads"
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:3000"


settings = Settings()