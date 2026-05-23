from sentence_transformers import SentenceTransformer

from knowledge_base.chroma_client import get_or_create_collection

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
TOP_K = 5  # number of chunks to retrieve

_model = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL)
    return _model


def retrieve_context(query: str, domain: str, top_k: int = TOP_K) -> list[str]:
    """
    Embed the query and find the most semantically similar
    chunks in the knowledge base for the given domain.

    Returns a list of relevant text chunks.
    """
    model = get_model()
    collection = get_or_create_collection("knowledge_base")

    # Embed the query
    query_embedding = model.encode(query).tolist()

    # Query ChromaDB with domain filter
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"domain": domain},
        include=["documents", "metadatas", "distances"],
    )

    documents = results.get("documents", [[]])[0]
    return documents