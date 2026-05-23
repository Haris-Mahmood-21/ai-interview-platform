import chromadb
from chromadb.config import Settings

from app.config import settings

_client = None


def get_chroma_client() -> chromadb.HttpClient:
    """
    Returns a singleton ChromaDB HTTP client.
    Connects to the ChromaDB container running via Docker.
    """
    global _client
    if _client is None:
        _client = chromadb.HttpClient(
            host=settings.CHROMA_HOST,
            port=settings.CHROMA_PORT,
            settings=Settings(anonymized_telemetry=False),
        )
    return _client


def get_or_create_collection(name: str):
    """Get or create a named collection in ChromaDB."""
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"},
    )