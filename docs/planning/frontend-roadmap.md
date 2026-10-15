# Frontend Redesign Plan — AI Interview Platform

## Context for Claude 
Next.js 16 (App Router) + React 19 + TypeScript project — an AI-powered technical
interview practice platform (resume-based question generation, live coding via
Monaco + Judge0, theory Q&A with RAG-based follow-ups, results dashboard).
Backend is FastAPI (separate folder) — **do not touch `/backend`, API contracts,
or Zustand store shape. This is a frontend-only visual/UX pass.**

This work happens AFTER a backend performance pass (see `backend-planning.md`).
Loading states in this plan must be calibrated to the backend's real,
post-optimization latency — not generic indefinite spinners. Approximate
post-optimization latency to design around:
  - Interview start (question generation): ~5-8 sec
  - Theory answer evaluation: ~3-5 sec
  - Code submission: ~2-4 sec (parallelized test cases)

## Current Stack
- Next.js 16, React 19, TypeScript
- Tailwind CSS v4 (`@theme inline` syntax, no `tailwind.config.js`)
- shadcn/ui installed (`components.json` → style: "radix-nova", baseColor: "neutral",
  cssVariables: true) but **not actually wired** — `globals.css` still has the default
  Next.js scaffold (`--background`, `--foreground` only)
- State: Zustand (`authStore`, `interviewStore`)
- Data: TanStack Query, Axios (`lib/api.ts`)
- Monaco Editor (code questions), Recharts (dashboard charts), Sonner (toasts),
  next-themes (installed, unused), lucide-react icons

## Problem Statement (audit findings)
1. **No real design system.** Colors are hardcoded utility classes repeated across
   files (`bg-gray-950`, `bg-gray-900`, `bg-indigo-600`, `text-gray-400`...) instead
   of theme tokens. Same indigo/gray palette is used consistently enough to formalize
   — but it's not centralized.
2. **shadcn components exist but are bypassed.** `components/ui/button.tsx`,
   `card.tsx`, `dialog.tsx` etc. are present but login/register/Navbar use raw
   `<input>`/`<button>` with manual classes instead of the shadcn primitives.
3. **No motion.** No Framer Motion (not even installed) — all state transitions
   (question change, score reveal, tab switches) are instant/jarring.
4. **Only Inter font** — no monospace font for the Monaco code editor page to pair
   visually with the UI font.
5. **Inconsistent spacing/card patterns** across config/session/dashboard pages —
   each page reinvents its own card/border/radius styling.
6. **Generic loading states.** Current `loading` booleans just render a spinner
   with no context — during the slowest operations (question generation, theory
   evaluation, code submission) the user has no sense of progress.

## Design Direction (confirmed)
- **Theme:** Dark only (matches existing gray-950/indigo palette + Haris's portfolio
  branding — consistent dark aesthetic across his work). No light/toggle needed.
- **Animation level:** Moderate — Framer Motion page/element transitions, hover and
  tap micro-interactions, skeleton loaders, animated score/progress reveals. No
  heavy background effects, particles, or glow-heavy "premium SaaS" treatment —
  this is an FYP (final year project); polish should read as intentional and
  explainable in a defense, not decorative.
- **Scope:** Full pass — auth (login/register), interview flow (config/session),
  dashboard (dashboard/sessions/[id]), and shared components (Navbar, cards, tables,
  charts) — all in one pass, one consistent system applied everywhere at once
  (not page-by-page patches).

## Phase 1 — Design System Foundation (do this FIRST, nothing else until this is solid)
- Define real shadcn CSS variables in `globals.css`: `--background`, `--foreground`,
  `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--muted`,
  `--muted-foreground`, `--border`, `--input`, `--ring`, `--destructive`,
  `--radius`, plus semantic success/warning colors (used today via green-400/
  yellow-400/red-400 for easy/medium/hard difficulty and correct/incorrect states)
- Base palette: keep the existing gray-950/900/800 + indigo-600 identity (don't
  invent a new color scheme) — just tokenize it properly
- Add a monospace font (e.g. JetBrains Mono / Geist Mono) alongside Inter, wired via
  `@theme inline`, used specifically in the Monaco editor surroundings and code-related
  UI
- Install `framer-motion`
- Establish reusable patterns: card style, spacing scale, typography scale — document
  these as the base every page below must follow

## Phase 2 — Shared Components
- Rebuild `Navbar.tsx` using shadcn primitives + tokens, add active-route
  highlighting, subtle transition on hover states
- Migrate raw `<button>`/`<input>` usage everywhere to shadcn `Button`, `Input`
  (`Input` isn't in `components/ui` yet — add it), `Card`, `Badge`
- `FeedbackDisplay.tsx`, `MetricCards.tsx`, `DomainStatsTable.tsx`,
  `SessionHistoryTable.tsx`, `ScoreTrendChart.tsx` — apply the same card/token system,
  add entrance animation (fade/slide on mount) via Framer Motion

## Phase 3 — Auth Pages (login, register)
- Rebuild with shadcn `Card` + `Input` + `Button` instead of raw elements
- Animated form entrance, animated error state (shake/fade instead of instant div)
- Keep all existing logic (`useAuthStore`, `api.post` calls, redirect behavior)
  exactly as-is — visual layer only

## Phase 4 — Interview Flow (config, session) — highest priority, most complex
- `config/page.tsx` (428 lines): visual pass on domain/mode/difficulty selection —
  clearer selected-state, consistent card grid
- `session/page.tsx` (570 lines): the core UX — question card, Monaco editor panel,
  timer/progress, follow-up modal, feedback reveal. Needs the most care:
  - Smooth transition between questions (not an instant swap)
  - Animated progress bar
  - Polished difficulty badges using tokenized colors (currently inline
    `DIFFICULTY_COLORS` map — keep the logic, retheme the values)
  - **Loading states must be tied to actual backend latency points, not generic
    spinners:**
    - Interview start (paper generation, ~5-8 sec): a proper loading screen with
      an animated progress indicator or rotating status text ("Generating your
      questions..."), not a bare spinner
    - Theory answer submit (~3-5 sec): "Evaluating your answer..." state
    - Code submit (~2-4 sec): per-test-case progress feel (e.g. "Running test 1
      of 3...") since test cases now run in parallel on the backend

## Phase 5 — Dashboard
- `dashboard/page.tsx`, `sessions/[id]/page.tsx`
- Recharts `ScoreTrendChart` — retheme to match tokens (currently likely default
  chart colors)
- Animated number count-up for `MetricCards`, staggered table row entrance

## Final Phase — Update frontend README.md
Current `frontend/README.md` is unedited `create-next-app` boilerplate. Replace with:
- Short project intro (what this app does)
- Design system note (shadcn + CSS tokens + Framer Motion, dark theme only)
- Setup/run instructions (keep accurate to actual scripts in `package.json`)

## Hard Constraints
- Do not modify: `/backend`, `lib/api.ts` request signatures, Zustand store
  shape/actions, `types/api.types.ts`
- Do not rename routes or change the `(auth)/(interview)/(dashboard)` route groups
- Keep all existing `useEffect` auth/redirect/hydration logic untouched — this is
  fragile (hydration guards, token checks) and out of scope
- One shared token system — no page should invent its own one-off colors
- State assumptions before writing code; do not silently change architectural
  decisions — flag them instead
- Self-review after each module before moving to the next phase