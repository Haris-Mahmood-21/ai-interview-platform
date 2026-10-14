# AI Interview Platform 🎯

An enterprise-grade, AI-powered technical interview preparation platform that simulates real-world technical interviews using Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and real-time code execution.

Built with a high-performance **FastAPI** backend and an engaging, presentation-ready **Next.js 16** (App Router) frontend, the platform leverages **Google Gemini**, **ChromaDB**, **PostgreSQL**, and **Judge0** to provide adaptive, domain-specific interview simulations.

---

## ✨ Key Features

- **Domain-Specific & Adaptive Question Generation:** Dynamically generates balanced technical interview papers (2 coding problems + 3 conceptual theory questions) across key domains: **DSA**, **OOP**, **Machine Learning**, and **React & Frontend**.
- **Resume-Based Personalization:** Upload a PDF resume to extract skills and project experience, automatically detecting your domain and generating tailored questions matching your background.
- **In-Browser Code Execution (Monaco Editor + Judge0):** Solve coding challenges in a live code editor with custom dark syntax highlighting and concurrent test case evaluation via the Judge0 API.
- **RAG-Powered Theory Evaluation:** Theory answers are graded in context using ChromaDB vector retrieval, evaluating candidates across 4 distinct rubric dimensions: **Correctness**, **Clarity**, **Depth**, and **Conceptual Understanding**.
- **Post-Interview Result Summary (`/summary`):** Immediate debrief upon session completion with a radial score meter, 40/60 weighted coding/theory score breakdown, test verification results, examiner feedback, and concrete improvement suggestions before heading to the dashboard.
- **Skill Radar & Analytics Dashboard:** Visual progress tracking featuring a multi-domain performance radar (`DomainRadar`), chronological score trend charts, domain stats, and expandable session attempt history.
- **Presentation-Ready Midnight-Navy UI:** Dark-mode design system with ambient glow lighting, glassmorphic cards, and typography pairing **Sora** (display/metrics) + **Plus Jakarta Sans** (UI body) + **JetBrains Mono** (code).
- **Secure Authentication:** Robust JWT-based authentication system with protected interview sessions and dashboard history.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling & Theme:** Tailwind CSS v4, custom tokenized midnight-navy design system (`globals.css`)
- **UI Components:** shadcn/ui primitives, Radix UI, Lucide React
- **Motion & Visuals:** Framer Motion (animated entrances and interactive cards), custom ambient lighting
- **State Management:** Zustand, TanStack Query
- **Editor & Charts:** Monaco Editor (`@monaco-editor/react`), Recharts (Score Trend & Domain Radar)

### Backend
- **Framework:** FastAPI, Python 3.11
- **Database & ORM:** PostgreSQL, SQLAlchemy, Alembic migrations
- **Vector Database:** ChromaDB
- **AI & NLP:** Google Gemini API (`gemini-2.5-flash`), `sentence-transformers` (`all-MiniLM-L6-v2`), spaCy
- **Code Execution:** Judge0 CE API (via HTTPX concurrent workers)

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Package Management:** Poetry (Backend), pnpm / npm (Frontend)

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend (Next.js 16)"]
        UI["Landing & Auth"]
        Wizard["Interview Config (/config)"]
        Session["Live Session (/session)"]
        Summary["Result Summary (/summary)"]
        Dashboard["Analytics Dashboard (/dashboard)"]
    end

    subgraph Backend["Backend (FastAPI)"]
        API["FastAPI REST Endpoints"]
        AuthService["JWT Authentication"]
        QGen["Question Generator Service"]
        RAGEval["RAG Theory Evaluator"]
        CodeEval["Judge0 Client Runner"]
    end

    subgraph Storage["Data & External Services"]
        PG[(PostgreSQL)]
        Chroma[(ChromaDB)]
        Gemini[Google Gemini API]
        Judge0[Judge0 API Engine]
    end

    UI --> API
    Wizard --> API
    Session --> API
    Summary --> API
    Dashboard --> API

    API --> AuthService --> PG
    API --> QGen --> Gemini
    API --> RAGEval --> Chroma
    RAGEval --> Gemini
    API --> CodeEval --> Judge0
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)
- [Node.js 20+](https://nodejs.org/) & [pnpm](https://pnpm.io/) (or `npm`)
- [Python 3.11+](https://www.python.org/) & [Poetry](https://python-poetry.org/)
- API Keys: [Google Gemini API Key](https://aistudio.google.com/) & [Judge0 API Key](https://rapidapi.com/judge0-official/api/judge0-ce)

### 2. Clone the Repository
```bash
git clone https://github.com/Haris-Mahmood-21/ai-interview-platform.git
cd ai-interview-platform
```

### 3. Start Infrastructure Services
Start PostgreSQL and ChromaDB containers:
```bash
docker compose up -d
```

### 4. Backend Setup
```bash
cd backend

# Configure and install dependencies
poetry config virtualenvs.in-project true
poetry install

# Download spaCy model
poetry run python -m spacy download en_core_web_sm

# Setup environment variables
cp .env.example .env
```

Ensure your `backend/.env` file contains your credentials:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/interview_db
SECRET_KEY=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
JUDGE0_API_KEY=your_rapidapi_judge0_key_here
JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com
CHROMA_HOST=localhost
CHROMA_PORT=8001
UPLOAD_DIR=./uploads
ALLOWED_ORIGINS=http://localhost:3000
```

**Run Database Migrations & Seed Data:**
```bash
poetry run alembic upgrade head
poetry run python scripts/seed_questions.py
poetry run python scripts/ingest_knowledge_base.py
```

**Start the FastAPI Server:**
```bash
poetry run uvicorn app.main:app --reload --port 8000
```
> **API Docs & Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)

### 5. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install dependencies
pnpm install # or npm install

# Setup environment variables
cp .env.example .env.local
```

Ensure `frontend/.env.local` points to your backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Start the Next.js Dev Server:**
```bash
pnpm dev # or npm run dev
```
> **Web Application:** [http://localhost:3000](http://localhost:3000)

---

## ⚡ Performance & Reliability Optimizations

- **Reasoning Model Token Budgeting:** Question generation and theory evaluation pass explicit `max_output_tokens=8192` and `response_mime_type="application/json"` to support `gemini-2.5-flash`'s internal thinking process without truncation.
- **Concurrent Judge0 Execution:** All test cases for a submitted code solution run concurrently via `ThreadPoolExecutor`, collapsing test latency from $O(N)$ to $O(1)$.
- **Combined Evaluation & Follow-Ups:** Theory grading and targeted follow-up questions are resolved in a unified LLM pipeline call.
- **Pre-warmed AI Models:** SentenceTransformers, ChromaDB vector store, and Gemini clients are initialized on FastAPI startup (`lifespan`) to eliminate cold starts.
- **Connection Pooling:** Tuned SQLAlchemy connection pooling (`pool_size=10, max_overflow=20`) prevents socket exhaustion under concurrent session loads.

---

## 📁 Project Structure

```text
ai-interview-platform/
├── frontend/                     # Next.js 16 App Router client
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/           # Split-screen Login & Register pages
│   │   │   ├── (dashboard)/      # Dashboard & Session history
│   │   │   ├── (interview)/      # Config, Live Session, and Result Summary (/summary)
│   │   │   ├── globals.css       # Midnight-navy tokenized design system
│   │   │   └── page.tsx          # Landing page with interactive hero & metrics
│   │   ├── components/
│   │   │   ├── brand/            # AI Interview Platform logo & marks
│   │   │   ├── landing/          # Hero, features, metrics, and CTA sections
│   │   │   ├── interview/        # Monaco code runner, test cases, AIThinking loader
│   │   │   ├── dashboard/        # DomainRadar, ScoreTrendChart, MetricCards
│   │   │   └── ui/               # ScoreRing, buttons, cards, glass containers
│   │   ├── lib/                  # API client, domain definitions, score helpers
│   │   └── store/                # Zustand stores (authStore, interviewStore)
├── backend/                      # FastAPI Python backend
│   ├── app/
│   │   ├── models/               # SQLAlchemy models (User, Attempt, Question, etc.)
│   │   ├── routers/              # Questions, Code execution, Theory, Resume, Dashboard
│   │   ├── schemas/              # Pydantic validation schemas
│   │   └── services/             # Gemini client, Judge0 runner, RAG evaluator
│   ├── knowledge_base/           # Domain source markdown files & ChromaDB ingestion
│   ├── migration/                # Alembic database revision scripts
│   └── scripts/                  # Question seeder & admin scripts
├── docker-compose.yml            # PostgreSQL & ChromaDB containers
└── README.md                     # Project documentation
```

---

## 📄 License
This project is developed as a Final Year Project (FYP) for technical interview preparation.