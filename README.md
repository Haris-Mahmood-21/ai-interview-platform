# AI-Powered Interview Preparation Platform

An AI-powered interview preparation platform that simulates technical interviews using LLMs, RAG, and real-time code evaluation.

Built with FastAPI, Next.js, Gemini AI, ChromaDB, PostgreSQL, and Judge0.

---

## Features

- AI-generated technical interview questions
- Resume-based personalized interviews
- Real-time coding question evaluation
- Dynamic follow-up questions
- RAG-powered concept assistance
- Difficulty adaptation based on performance
- JWT authentication system
- Code execution using Judge0 API
- Vector search using ChromaDB
- Modern responsive UI with Next.js

---

## Tech Stack

### Frontend
- Next.js 16
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- Monaco Editor

### Backend
- FastAPI
- Python 3.11
- SQLAlchemy
- PostgreSQL
- ChromaDB
- Alembic

### AI / NLP
- Google Gemini API
- sentence-transformers
- all-MiniLM-L6-v2
- spaCy

### Infrastructure
- Docker & Docker Compose
- Judge0 API

---

## System Architecture

```text
Frontend (Next.js)
       ↓
Backend API (FastAPI)
       ↓
 ┌───────────────┬───────────────┐
 ↓               ↓               ↓
PostgreSQL    ChromaDB       Gemini API
(User Data)   (RAG Search)   (Question Generation)
```

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/Haris-Mahmood-21/ai-interview-platform.git
cd ai-interview-platform
```

---

### 2. Start Docker Services

```bash
docker compose up -d
```

---

### 3. Backend Setup

```bash
cd backend

poetry config virtualenvs.in-project true
poetry install

poetry run python -m spacy download en_core_web_sm
```

Create `.env` file:

```bash
cp .env.example .env
```

Add your environment variables:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/interview_db

SECRET_KEY=your-secret-key

GEMINI_API_KEY=your-gemini-api-key

JUDGE0_API_KEY=your-judge0-api-key

CHROMA_HOST=localhost
CHROMA_PORT=8001
```

---

### 4. Run Database Migrations

```bash
poetry run alembic upgrade head
```

---

### 5. Seed Database

```bash
poetry run python scripts/seed_questions.py
```

---

### 6. Ingest Knowledge Base

```bash
poetry run python scripts/ingest_knowledge_base.py
```

---

### 7. Start Backend Server

```bash
poetry run uvicorn app.main:app --reload --port 8000
```

Backend Docs:

```text
http://localhost:8000/docs
```

---

### 8. Frontend Setup

Open another terminal:

```bash
cd frontend

pnpm install
```

Create `.env.local`:

```bash
cp .env.example .env.local
```

---

### 9. Start Frontend

```bash
pnpm dev
```

Frontend:

```text
http://localhost:3000
```

---

## Interview Modes

### General Interview Mode
- Domain-specific interviews
- Adaptive difficulty progression
- AI-generated technical questions

### Resume Interview Mode
- Resume parsing
- Personalized interview generation
- Skill and project-based questioning

---

## Project Structure

```text
ai-interview-platform/
│
├── frontend/
│
├── backend/
│
├── docker-compose.yml
│
└── README.md
```

---

## API Documentation

FastAPI Swagger Docs:

```text
http://localhost:8000/docs
```

---

## Future Improvements

- Voice-based interviews
- AI interview analytics
- Live collaborative interviews
- Multi-language support
- Advanced interviewer personas

## Performance Notes

The backend has been optimized for lower latency across all interview flows:

- **Concurrent Judge0 test execution** — Code submissions run all test cases in parallel via `ThreadPoolExecutor` instead of sequentially, reducing worst-case coding submission latency from N×(submit+poll) to ~1×(submit+poll)
- **Combined evaluation + follow-up Gemini call** — Theory answer evaluation and follow-up question generation are merged into a single Gemini request, eliminating a second sequential round-trip on weak answers
- **Preloaded RAG model at startup** — SentenceTransformer embedding model, ChromaDB collection, and Gemini model instance are warmed during app startup via a FastAPI lifespan handler, removing cold-start latency from the first user request
- **Gemini call hardening** — All Gemini calls now have a 30-second timeout and explicit `max_output_tokens` caps matched to each prompt's needs, preventing hung requests and reducing generation time
- **Tuned DB connection pool** — SQLAlchemy engine configured with `pool_size=10, max_overflow=20` for reliable behavior under concurrent user load

---


## License

This project is developed for educational and learning purposes.