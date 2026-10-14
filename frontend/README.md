# AI Interview Platform — Frontend 🎨

The client-side web application for **AI Interview Platform**, a technical interview practice platform built for FYP presentation and real-world mock interview preparation.

Candidates can configure interviews by domain (DSA, OOP, ML, React) or tailored to their uploaded resume, write Python solutions in a custom dark Monaco editor with instant Judge0 test evaluation, answer conceptual theory questions graded by Gemini + RAG across 4 rubric dimensions, review their performance on a dedicated summary debrief page, and track long-term progress on their personal dashboard.

---

## 🛠️ Tech Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with tokenized theme system in `globals.css`
- **shadcn/ui** & **Radix UI** primitives
- **Framer Motion** — smooth page transitions, entrance animations, and interactive cards
- **Zustand** — persistent authentication and real-time interview session state
- **Monaco Editor** (`@monaco-editor/react`) — live Python editor with custom `aip-dark` theme
- **Recharts** — score trend area chart & multi-domain performance radar
- **Lucide React** — icons
- **Axios** — backend API client

---

## 🎨 Design System & Typography

Midnight-navy dark theme configured in `frontend/src/app/globals.css`:

| Token | Role | Description |
|-------|------|-------------|
| `--background` | Midnight canvas | `oklch(0.13 0.025 272)` |
| `--card` / `.glass` | Glassmorphic surface | Translucent dark surface with border highlight |
| `--brand-gradient` | Accent gradient | Violet (`oklch(0.66 0.24 300)`) → Indigo → Cyan (`oklch(0.80 0.14 210)`) |
| `--primary` | Actions & active focus | Brand violet |
| `--success` / `--warning` / `--danger` | Score tones | Semantic feedback tokens |

### Typography Hierarchy
- **Display & Headings:** `Sora` (`next/font/google`)
- **Body & Interface:** `Plus Jakarta Sans` (`next/font/google`)
- **Code & Syntax:** `JetBrains Mono` (`next/font/google`)

---

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install # or npm install

# Start development server
pnpm dev # or npm run dev

# Production build
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

The application runs at [http://localhost:3000](http://localhost:3000). Ensure `NEXT_PUBLIC_API_URL` in `.env.local` points to your running FastAPI backend (defaults to `http://localhost:8000`).

---

## 📁 Directory Structure

```text
frontend/src/
├── app/
│   ├── (auth)/                  # Split-screen Login & Register pages
│   ├── (interview)/
│   │   ├── config/              # Mode and domain configuration + resume upload
│   │   ├── session/             # Monaco code runner, theory answer, & AIThinking loader
│   │   └── summary/             # Post-interview debrief & detailed rubric feedback
│   ├── (dashboard)/
│   │   ├── dashboard/           # Metrics, ScoreTrendChart, DomainRadar, Session logs
│   │   └── sessions/[id]/       # Past attempt detail view
│   ├── globals.css              # Midnight-navy tokens and utility classes
│   ├── layout.tsx               # Root layout (Plus Jakarta Sans, Sora, JetBrains Mono)
│   └── page.tsx                 # Presentation landing page
├── components/
│   ├── auth/                    # AuthLayout, IconField
│   ├── brand/                   # Logo, LogoMark
│   ├── landing/                 # Landing hero, features, roadmap, CTA
│   ├── interview/               # Monaco code runner, test cases, AIThinking loader
│   ├── dashboard/               # DomainRadar, ScoreTrendChart, MetricCards, SessionHistory
│   ├── layout/                  # Navbar, AppShell, AmbientBackground
│   └── ui/                      # ScoreRing, Button, Card, Input, Progress
├── lib/
│   ├── api.ts                   # Axios client instance with auth interceptor
│   ├── domains.ts               # Domain definitions, color tokens, duration helpers
│   └── utils.ts                 # cn() class merge helper
├── store/
│   ├── authStore.ts             # JWT token and user authentication state
│   └── interviewStore.ts        # Live interview paper, answers, scores, and test results
└── types/
    └── api.types.ts             # TypeScript interfaces for API requests and responses
```
