"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  ChartNoAxesCombined,
  CircleCheck,
  CloudUpload,
  CodeXml,
  Database,
  FileText,
  MessagesSquare,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import AmbientBackground from "@/components/layout/AmbientBackground";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import ScoreRing from "@/components/ui/score-ring";
import { DOMAINS } from "@/lib/domains";
import { useAuthStore } from "@/store/authStore";

const FEATURES = [
  {
    icon: FileText,
    title: "Resume-aware questions",
    desc: "Upload your CV and the platform extracts your skills and projects to generate interview questions tailored to you.",
  },
  {
    icon: ScanSearch,
    title: "RAG-grounded evaluation",
    desc: "Answers are scored against a curated knowledge base retrieved from ChromaDB, so feedback stays accurate and consistent.",
  },
  {
    icon: SquareTerminal,
    title: "Live code execution",
    desc: "Write solutions in Python, JavaScript, Java or C++ and run them against hidden test cases through Judge0.",
  },
  {
    icon: MessagesSquare,
    title: "Adaptive follow-ups",
    desc: "Like a real interviewer, the AI probes deeper with follow-up questions when your answer leaves gaps.",
  },
  {
    icon: ShieldCheck,
    title: "Rubric-based scoring",
    desc: "Every answer is graded on correctness, clarity, depth and conceptual understanding, with a short explanation for each score.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Progress analytics",
    desc: "Track score trends, see your strengths per domain and review every past session in detail.",
  },
];

const STEPS = [
  {
    icon: CloudUpload,
    title: "Configure",
    desc: "Choose a domain or upload your resume for a personalised paper.",
  },
  {
    icon: CodeXml,
    title: "Interview",
    desc: "Answer theory and coding questions in a realistic interview environment.",
  },
  {
    icon: Sparkles,
    title: "Improve",
    desc: "Get instant AI feedback, follow-ups and analytics to close your gaps.",
  },
];

const STACK = [
  { name: "Google Gemini", icon: Bot },
  { name: "ChromaDB", icon: Database },
  { name: "FastAPI", icon: Zap },
  { name: "Next.js", icon: CodeXml },
  { name: "Judge0", icon: SquareTerminal },
  { name: "PostgreSQL", icon: Database },
];

function HeroPreview() {
  const criteria = [
    { label: "Correctness", v: 92 },
    { label: "Clarity", v: 84 },
    { label: "Depth", v: 76 },
    { label: "Understanding", v: 88 },
  ];
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-brand-gradient opacity-25 blur-3xl" />
      <div className="glass relative rounded-3xl p-5 sm:p-6 shadow-2xl">
        {/* window chrome */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-red-400/70" />
            <span className="size-2.5 rounded-full bg-amber-400/70" />
            <span className="size-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-[0.65rem] text-muted-foreground">
            Question 3 of 5 · React
          </span>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-2 flex gap-2">
            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[0.65rem] font-semibold text-warning ring-1 ring-warning/25">
              medium
            </span>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.65rem] text-muted-foreground ring-1 ring-white/10">
              Theory
            </span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-foreground">
            Explain how React&apos;s reconciliation algorithm decides which DOM
            nodes to update.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-5">
          <ScoreRing score={85} size={108} stroke={9} label="Score" />
          <div className="space-y-2.5">
            {criteria.map((c) => (
              <div key={c.label}>
                <div className="mb-1 flex justify-between text-[0.7rem]">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className="font-mono text-foreground">{c.v}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-brand-gradient"
                    style={{ width: `${c.v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.07] p-3">
          <Bot className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-secondary-foreground">
            <span className="font-semibold text-foreground">Follow-up:</span>{" "}
            How do <code className="font-mono text-brand-cyan">key</code> props
            affect this process for lists?
          </p>
        </div>
      </div>

      {/* floating chips */}
      <div className="glass absolute -left-4 top-24 hidden animate-float items-center gap-2 rounded-xl px-3 py-2 text-xs sm:flex lg:-left-10">
        <CircleCheck className="size-4 text-success" />
        <span className="text-foreground">4/4 tests passed</span>
      </div>
      <div className="glass absolute -right-4 bottom-16 hidden items-center gap-2 rounded-xl px-3 py-2 text-xs [animation-delay:1.5s] sm:flex animate-float lg:-right-8">
        <BookOpen className="size-4 text-brand-cyan" />
        <span className="text-foreground">RAG context retrieved</span>
      </div>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuthStore();
  const primaryHref = isAuthenticated ? "/dashboard" : "/register";

  return (
    <div className="relative isolate min-h-screen overflow-x-clip">
      <AmbientBackground />
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 text-xs text-muted-foreground">
            <span className="bg-brand-gradient rounded-full px-2 py-0.5 text-[0.65rem] font-semibold text-white">
              FYP
            </span>
            AI-powered technical interview preparation
          </div>

          <h1 className="text-[2.6rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.1rem]">
            Practice smarter.
            <br />
            <span className="text-gradient">Interview better.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">AI Interview Platform</span>{" "}
            builds technical interviews from your resume, evaluates every answer
            with retrieval-augmented AI, runs your code live and shows you
            exactly where to improve.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button variant="gradient" size="xl" asChild>
              <Link href={primaryHref}>
                {isAuthenticated ? "Go to dashboard" : "Start practising free"}
                <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild className="border-white/10 bg-white/[0.03]">
              <Link href={isAuthenticated ? "/config" : "/login"}>
                {isAuthenticated ? "New interview" : "Sign in"}
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {DOMAINS.map((d) => (
              <span key={d.id} className="flex items-center gap-2">
                <span className={`grid size-6 place-items-center rounded-md bg-gradient-to-br ${d.tile}`}>
                  <d.icon className="size-3.5 text-white" />
                </span>
                {d.short}
              </span>
            ))}
          </div>
        </div>

        <HeroPreview />
      </section>

      {/* ── STATS STRIP ──────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[
            { k: "4", v: "Technical domains" },
            { k: "4", v: "Scoring criteria" },
            { k: "4", v: "Coding languages" },
            { k: "Live", v: "Code execution" },
          ].map((s) => (
            <div key={s.v} className="text-center">
              <p className="font-display text-3xl font-bold text-gradient sm:text-4xl">{s.k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Everything you need to prepare
          </h2>
          <p className="mt-4 text-muted-foreground">
            Practice questions, AI evaluation and progress tracking, all in one place.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass group relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-white/20"
            >
              <div className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
              <div className="bg-brand-gradient mb-5 grid size-11 place-items-center rounded-xl shadow-lg shadow-primary/20">
                <f.icon className="size-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Three steps to interview-ready
          </h2>
        </div>

        <div className="relative grid gap-6 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="relative text-center"
            >
              <div className="glass relative mx-auto mb-5 grid size-20 place-items-center rounded-2xl">
                <s.icon className="size-7 text-primary" />
                <span className="bg-brand-gradient absolute -right-2 -top-2 grid size-7 place-items-center rounded-full text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Built with
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {STACK.map((t) => (
            <span
              key={t.name}
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-secondary-foreground"
            >
              <t.icon className="size-4 text-brand-cyan" />
              {t.name}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 p-10 text-center sm:p-16">
          <div className="bg-brand-gradient absolute inset-0 opacity-90" />
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Ready for your next interview?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Start a mock interview and get detailed feedback within minutes.
            </p>
            <Button
              size="xl"
              asChild
              className="mt-8 bg-white text-slate-900 hover:bg-white/90"
            >
              <Link href={primaryHref}>
                Get started <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-7" />
            <Wordmark />
          </div>
          <p className="text-xs text-muted-foreground">
            Final Year Project · © {new Date().getFullYear()} AI Interview Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
