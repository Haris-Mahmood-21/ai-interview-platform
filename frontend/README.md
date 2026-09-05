# InterviewAI — Frontend

The client-side application for **InterviewAI**, an AI-powered technical interview practice platform. Users can generate domain-specific interview questions (from a curated bank or their own resume), solve coding challenges in a live Monaco editor with Judge0 execution, answer theory questions evaluated by Gemini + RAG, and track their progress on a personal dashboard.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with `@theme inline` design tokens
- **shadcn/ui** (radix-nova style) — Button, Card, Badge, Input, Label, Dialog, Select, Textarea, Progress
- **Framer Motion** — page transitions, staggered list entrances, animated score bars, expand/collapse
- **Zustand** — auth and interview session state
- **TanStack Query** + **Axios** — data fetching
- **Monaco Editor** — live code editor for coding questions
- **Recharts** — score trend charts on the dashboard
- **Sonner** — toast notifications
- **Lucide React** — icons

## Design System

Dark-only theme built on a tokenized CSS variable system in `globals.css`. The palette formalizes the existing gray-950/indigo-600 identity:

| Token | Role | Mapped to |
|-------|------|-----------|
| `--background` | Page background | gray-950 |
| `--card` | Card/surface background | gray-900 |
| `--primary` | Actions, links, focus rings | indigo-600 |
| `--secondary` | Subtle backgrounds, hover states | gray-800 |
| `--muted-foreground` | Subdued text, labels | gray-400 |
| `--border` | Borders, dividers | gray-700 |
| `--success` / `--warning` / `--danger` | Score colors, difficulty badges | green-400 / yellow-400 / red-400 |

Fonts: **Inter** (UI) + **JetBrains Mono** (code editor and code blocks), loaded via `next/font/google` with CSS variable mode.

All shadcn components consume these tokens — no hardcoded color classes anywhere in pages or components.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

The app runs at [http://localhost:3000](http://localhost:3000). Requires the FastAPI backend running at the URL configured in `.env.local` (`NEXT_PUBLIC_API_URL`).

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── (interview)/     # Config, Session pages
│   ├── (dashboard)/     # Dashboard, Session detail pages
│   ├── globals.css      # Design system tokens + @theme inline
│   ├── layout.tsx       # Root layout (fonts, providers)
│   └── providers.tsx    # TanStack Query provider
├── components/
│   ├── ui/              # shadcn primitives (Button, Card, Input, etc.)
│   ├── layout/          # Navbar
│   ├── dashboard/       # MetricCards, ScoreTrendChart, DomainStatsTable, SessionHistoryTable
│   └── interview/       # FeedbackDisplay
├── lib/
│   ├── api.ts           # Axios instance
│   └── utils.ts         # cn() utility for class merging
├── store/               # Zustand stores (authStore, interviewStore)
└── types/               # API type definitions
```
