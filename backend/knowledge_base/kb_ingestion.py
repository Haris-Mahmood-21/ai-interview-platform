import os
import uuid
from pathlib import Path

from sentence_transformers import SentenceTransformer

from knowledge_base.chroma_client import get_or_create_collection

# Use the same model everywhere — critical for consistent embeddings
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
CHUNK_SIZE = 300  # target tokens per chunk
CHUNK_OVERLAP = 50  # overlap between chunks for context continuity

# Map folder names to domain labels
DOMAIN_MAP = {
    "dsa": "Data Structures and Algorithms",
    "oop": "Object-Oriented Programming",
    "ml": "Machine Learning",
    "react": "React and Frontend Development",
}

model = SentenceTransformer(EMBEDDING_MODEL)


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Split text into overlapping chunks by word count.
    Word-based chunking is simpler and works well for plain text.
    """
    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk.strip())
        start += chunk_size - overlap

    return [c for c in chunks if len(c) > 50]  # skip tiny chunks


def ingest_file(filepath: Path, domain_key: str, collection) -> int:
    """Ingest a single text file into ChromaDB. Returns number of chunks added."""
    text = filepath.read_text(encoding="utf-8")
    chunks = chunk_text(text)

    if not chunks:
        print(f"  No chunks extracted from {filepath.name}")
        return 0

    # Generate embeddings for all chunks at once (batch is faster)
    embeddings = model.encode(chunks, show_progress_bar=False).tolist()

    # Build IDs and metadata
    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [
        {
            "domain": domain_key,
            "domain_label": DOMAIN_MAP.get(domain_key, domain_key),
            "source": filepath.name,
            "chunk_index": i,
        }
        for i, _ in enumerate(chunks)
    ]

    # Add to ChromaDB
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas,
    )

    return len(chunks)


def ingest_all():
    """Ingest all source files from all domains into ChromaDB."""
    sources_dir = Path(__file__).parent / "sources"
    collection = get_or_create_collection("knowledge_base")

    total_chunks = 0

    for domain_key in DOMAIN_MAP:
        domain_dir = sources_dir / domain_key
        if not domain_dir.exists():
            print(f"  Skipping {domain_key} — directory not found")
            continue

        txt_files = list(domain_dir.glob("*.txt"))
        if not txt_files:
            print(f"  Skipping {domain_key} — no .txt files found")
            continue

        print(f"\n📚 Ingesting domain: {DOMAIN_MAP[domain_key]}")
        for filepath in txt_files:
            print(f"  Processing: {filepath.name}")
            count = ingest_file(filepath, domain_key, collection)
            print(f"  ✓ {count} chunks added")
            total_chunks += count

    print(f"\n✅ Done. Total chunks in knowledge base: {total_chunks}")
    print(f"   Collection: knowledge_base")


if __name__ == "__main__":
    ingest_all()