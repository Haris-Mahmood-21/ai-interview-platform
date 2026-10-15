# Backend Speed Optimization Plan — AI Interview Platform

## Context for Claude
FastAPI backend for an AI-powered technical interview platform (Gemini-based question
generation, RAG-based theory evaluation via ChromaDB, Judge0 code execution).
**This is a backend-only performance pass. Do not touch `/frontend`. Do not change any
API request/response schemas (`app/schemas/*`) or endpoint contracts — the frontend
depends on these exactly as they are. Endpoints must behave identically, just faster.**

This work happens BEFORE the frontend redesign (see `frontend-planning.md`) — the
frontend's loading states will be calibrated against the real latency numbers this
produces.

## Current Stack
- FastAPI (all routes are sync `def`, run in Starlette's threadpool — not async)
- SQLAlchemy (sync engine), PostgreSQL
- Google Gemini (`gemini-2.5-flash`) via `google.generativeai`
- ChromaDB + `sentence-transformers` (`all-MiniLM-L6-v2`) for RAG retrieval
- Judge0 (RapidAPI) for code execution, via `httpx`

## Problem Statement (confirmed by code audit)

**1. Interview start is slow.**
`question_generator.py` generates all 5 questions (2 coding + 3 theory, with test
cases and examples) in a **single large Gemini call**. Large structured output →
inherently slow generation (8-15+ sec). This is the correct batching pattern
(not N separate calls) — the fix is trimming output size, not restructuring the call.

**2. Theory question evaluation is slow (the "between questions" delay).**
`theory.py` → `rag_evaluator.py` does, sequentially:
  1. `retrieve_context()` — loads SentenceTransformer model (lazy — cold on first
     call of server lifetime) + embeds query + queries ChromaDB
  2. `call_gemini()` — evaluation call
  3. If score is weak, `followup_generator.py` makes a **second, separate**
     `call_gemini()` for follow-up questions

     → Two sequential Gemini round-trips on a weak answer is the main "between
     question" delay.

**3. Coding question submission is slow.**
`code.py` → `judge0_client.py`: test cases are submitted to Judge0 **one at a time,
in a loop**, each with its own submit + poll cycle (`time.sleep`-based polling,
up to 10 attempts × 1.5s). For N test cases this is N sequential round-trips —
worst case 15-75+ seconds for one submission.

**4. No connection pool tuning.**
`database.py`: `create_engine(settings.DATABASE_URL)` uses SQLAlchemy defaults —
no `pool_size`/`max_overflow` set. Fine at low concurrency, a bottleneck once
multiple users hit the app at once.

## Fixes — in priority order

### Fix 1 — Parallelize Judge0 test case submission
In `code.py`'s `submit_code_solution`, replace the sequential `for i, tc in
enumerate(test_cases): submit_code(...)` loop with concurrent execution
(`concurrent.futures.ThreadPoolExecutor` is the simplest fit since routes are
sync — map `submit_code` across all test cases at once, then collect results
in original order). Biggest single win for coding question latency.

### Fix 2 — Combine theory evaluation + follow-up generation into one Gemini call
Currently `rag_evaluator.py` (evaluate) and `followup_generator.py` (follow-up)
are two separate sequential `call_gemini()` calls when the answer is weak.
Modify `build_evaluation_prompt()` in `rag_evaluator.py` to *also* ask Gemini to
return follow-up questions in the same JSON response when warranted (extend the
returned JSON schema with a `"followups": []` field, populated conditionally per
the same score thresholds already defined in `followup_generator.py`). This
removes one full round-trip on every weak answer — roughly halves worst-case
theory-submission latency. `followup_generator.py`'s scoring/threshold logic can
stay as-is for deciding IF/HOW MANY follow-ups to request in the combined prompt.

### Fix 3 — Preload models at startup
`retriever.py`'s `get_model()` and `gemini_client.py`'s `get_gemini_model()`
lazy-load on first use, meaning whichever request happens to be first pays a
cold-start tax (model loading, few extra seconds). Add a FastAPI `lifespan`
context manager in `main.py` that calls `get_model()` (and warms the Chroma
collection connection) on app startup, so the first real user request is
already warm.

### Fix 4 — Gemini call hardening
`call_gemini()` in `gemini_client.py` has no timeout and no explicit generation
config. Add:
  - A request timeout (e.g. 25-30s) so a slow/hung Gemini call doesn't hang the
    whole request indefinitely
  - Explicit `generation_config` with a reasonable `max_output_tokens` cap
    matched to what each prompt actually needs (question generation needs more
    than evaluation) — an unbounded output can pad generation time

### Fix 5 — DB connection pool tuning
`database.py`: change to
`create_engine(settings.DATABASE_URL, pool_size=10, max_overflow=20)`.
Small change, real benefit once multiple users are testing/demoing concurrently.

## Explicitly Out of Scope
- Full async migration (async SQLAlchemy engine + `async def` everywhere) — large
  rewrite, marginal benefit since Starlette already threadpools sync routes
- Dashboard query changes — `dashboard.py` is already a single query + in-Python
  aggregation, no N+1 issue, fine as-is for this scale
- Any change to `/frontend`

## Final Phase — Update root README.md
After the above fixes are implemented:
- Fix outdated tech stack line: "Next.js 14" → "Next.js 16" (already inaccurate
  even before this work)
- Add a short **Performance Notes** section documenting what was optimized:
  concurrent Judge0 test execution, combined evaluation+follow-up Gemini call,
  preloaded RAG model at startup, tuned DB connection pool — useful for FYP
  documentation/defense

## Constraints
- State assumptions before writing code; do not silently change architectural
  decisions — flag them instead
- Self-review after each fix before moving to the next
- Every endpoint's request/response shape must stay identical — only internal
  implementation and latency should change