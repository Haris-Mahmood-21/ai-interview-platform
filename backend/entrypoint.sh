#!/usr/bin/env bash
set -e

echo "🚀 Running database migrations..."
alembic upgrade head

echo "🌱 Seeding initial question bank (if empty)..."
python scripts/seed_questions.py

echo "📚 Ingesting RAG knowledge base into ChromaDB (if empty)..."
python scripts/ingest_knowledge_base.py

echo "✅ Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
