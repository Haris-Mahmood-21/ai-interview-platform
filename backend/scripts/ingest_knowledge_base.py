import sys
from pathlib import Path

# Add backend to path so imports work
sys.path.insert(0, str(Path(__file__).parent.parent))

from knowledge_base.kb_ingestion import ingest_all

if __name__ == "__main__":
    print("Starting knowledge base ingestion...")
    ingest_all()