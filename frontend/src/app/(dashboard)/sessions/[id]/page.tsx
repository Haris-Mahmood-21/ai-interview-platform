"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  CodeXml,
  Compass,
  FileText,
  LayoutDashboard,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Terminal,
  XCircle,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import ScoreRing from "@/components/ui/score-ring";
import {
  formatDuration,
  getDomain,
  scoreTone,
  scoreVerdict,
  TONE_SOFT,
} from "@/lib/domains";
import { cn } from "@/lib/utils";
import {
  AttemptDetail,
  AttemptResponseItem,
  CodeTestResult,
  FollowupAnswerItem,
  TheoryEvaluation,
} from "@/types/api.types";

function extractEvaluation(evalObj: unknown): TheoryEvaluation | null {
  if (!evalObj || typeof evalObj !== "object") return null;
  if ("evaluation" in evalObj) {
    const inner = (evalObj as { evaluation?: unknown }).evaluation;
    if (inner && typeof inner === "object") {
      return inner as TheoryEvaluation;
    }
  }
  return evalObj as TheoryEvaluation;
}

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [data, setData] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    api
      .get(`/dashboard/attempts/${params.id}`)
      .then((res) => {
        // Handle both flattened and nested attempt formats
        const item: AttemptDetail = res.data?.attempt
          ? { ...res.data.attempt, responses: res.data.responses || [] }
          : res.data;
        setData(item);
      })
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [_hasHydrated, isAuthenticated, params.id, router]);

  const toggleExpand = (idx: number) => {
    setExpandedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAll = (expand: boolean) => {
    if (!data?.responses) return;
    const update: Record<number, boolean> = {};
    data.responses.forEach((_, idx) => {
      update[idx] = expand;
    });
    setExpandedCards(update);
  };

  const areAllExpanded = useMemo(() => {
    if (!data?.responses?.length) return false;
    return data.responses.every((_, idx) => expandedCards[idx]);
  }, [data, expandedCards]);

  // Coding test case metrics
  const testCaseStats = useMemo(() => {
    if (!data?.responses) return { passed: 0, total: 0 };
    let passed = 0;
    let total = 0;

    data.responses.forEach((r) => {
      if (r.type === "coding") {
        if (r.code_result?.results && r.code_result.results.length > 0) {
          total += r.code_result.results.length;
          passed += r.code_result.results.filter((tc: CodeTestResult) => tc.passed).length;
        } else if (typeof r.code_result?.total_count === "number" && r.code_result.total_count > 0) {
          total += r.code_result.total_count;
          passed += r.code_result.passed_count || 0;
        }
      }
    });

    return { passed, total };
  }, [data]);

  // Rubric averages across theory questions
  const rubricAverages = useMemo(() => {
    if (!data?.responses) return null;
    const theoryItems = data.responses.filter(
      (r) => r.type === "theory" && extractEvaluation(r.evaluation)
    );
    if (!theoryItems.length) return null;

    let correctness = 0;
    let clarity = 0;
    let depth = 0;
    let conceptual = 0;
    let count = 0;

    theoryItems.forEach((r) => {
      const ev = extractEvaluation(r.evaluation);
      if (ev) {
        correctness += ev.correctness?.score ?? 0;
        clarity += ev.clarity?.score ?? 0;
        depth += ev.depth?.score ?? 0;
        conceptual += ev.conceptual_understanding?.score ?? 0;
        count++;
      }
    });

    if (count === 0) return null;

    return {
      correctness: Math.round(correctness / count),
      clarity: Math.round(clarity / count),
      depth: Math.round(depth / count),
      conceptual: Math.round(conceptual / count),
    };
  }, [data]);

  // Executive AI verdict summary
  const executiveVerdict = useMemo(() => {
    if (!data) return "";
    const total = data.total_score;
    if (total >= 85) {
      return "Outstanding performance across all interview dimensions. Demonstrates crisp algorithmic reasoning, clean modular code, and comprehensive theoretical grounding.";
    }
    if (total >= 70) {
      return "Strong technical capabilities with solid problem decomposition. Good execution across core requirements with opportunities to refine edge cases and architectural trade-offs.";
    }
    if (total >= 50) {
      return "Solid baseline understanding demonstrated. Expanding practical implementation drills and sharpening conceptual definitions will accelerate readiness.";
    }
    return "Identified foundational areas for growth. Review the detailed feedback and improvement recommendations below to target your next practice session.";
  }, [data]);

  if (loading) {
    return (
      <AppShell className="max-w-4xl space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="h-9 w-32 animate-pulse rounded-lg bg-white/5" />
          <div className="h-9 w-32 animate-pulse rounded-lg bg-white/5" />
        </div>
        <div className="glass h-64 animate-pulse rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass h-40 animate-pulse rounded-2xl" />
          <div className="glass h-40 animate-pulse rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="glass h-24 animate-pulse rounded-2xl" />
          <div className="glass h-24 animate-pulse rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell className="max-w-2xl">
        <div className="glass rounded-3xl p-8 text-center sm:p-12">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-white/5">
            <FileText className="size-7 text-muted-foreground" />
          </span>
          <h2 className="text-xl font-bold tracking-tight">Session not found</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            The interview session you requested could not be retrieved. It may have been removed or belongs to another account.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="gradient" asChild>
              <Link href="/dashboard">
                <LayoutDashboard /> Return to dashboard
              </Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const domain = getDomain(data.category);
  const totalScore = Math.round(data.total_score);
  const codingScore = Math.round(data.coding_score);
  const theoryScore = Math.round(data.theory_score);
  const responses = data.responses || [];

  return (
    <AppShell className="max-w-4xl space-y-8 pb-16">
      {/* ── Top Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="-ml-3 text-muted-foreground hover:text-foreground">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" /> Dashboard
              </Link>
            </Button>
            <span className="text-muted-foreground/40">/</span>
            <span className="bg-brand-gradient inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-white">
              <Sparkles className="size-3" /> Session #{data.id}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {domain.label} Interview Debrief
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" asChild className="border-white/10">
            <Link href={`/config?category=${data.category}`}>
              <RotateCcw className="size-4" /> Practice again
            </Link>
          </Button>
          <Button variant="gradient" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" /> Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Hero Score Card ── */}
      <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="bg-brand-gradient absolute -right-24 -top-24 size-80 rounded-full opacity-15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex justify-center sm:justify-start">
            <ScoreRing
              score={totalScore}
              size={150}
              stroke={13}
              label="Overall"
            />
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className={cn("grid size-8 place-items-center rounded-lg bg-gradient-to-br text-white", domain.tile)}>
                <domain.icon className="size-4" />
              </span>
              <span className="text-base font-bold text-foreground">
                {domain.label}
              </span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE_SOFT[scoreTone(totalScore)])}>
                {scoreVerdict(totalScore)}
              </span>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground capitalize">
                {data.mode === "resume" ? "Resume mode" : "General mode"}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-secondary-foreground sm:max-w-xl">
              {executiveVerdict}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" /> {data.date}
              </span>
              {typeof data.time_taken === "number" && data.time_taken > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {formatDuration(data.time_taken)} duration
                </span>
              )}
              {testCaseStats.total > 0 && (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" />
                  {testCaseStats.passed} of {testCaseStats.total} test cases passed
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Weighted Breakdown Metric Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Coding Assessment · 40% */}
        <div className="glass rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CodeXml className="size-4 text-brand-cyan" /> Coding Assessment · 40%
            </span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold tabular-nums", TONE_SOFT[scoreTone(codingScore)])}>
              {codingScore}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tabular-nums">{codingScore}%</span>
            <span className="text-xs text-muted-foreground">weighted average</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Test cases passed</span>
              <span className="font-semibold text-foreground">
                {testCaseStats.passed} / {testCaseStats.total} (
                {testCaseStats.total ? Math.round((testCaseStats.passed / testCaseStats.total) * 100) : 0}%)
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="bg-brand-cyan h-full rounded-full transition-all duration-700"
                style={{
                  width: `${testCaseStats.total ? (testCaseStats.passed / testCaseStats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Conceptual Understanding · 60% */}
        <div className="glass rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Brain className="size-4 text-brand-violet" /> Conceptual Understanding · 60%
            </span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold tabular-nums", TONE_SOFT[scoreTone(theoryScore)])}>
              {theoryScore}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tabular-nums">{theoryScore}%</span>
            <span className="text-xs text-muted-foreground">weighted average</span>
          </div>

          {rubricAverages ? (
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="rounded-lg bg-white/[0.03] p-2">
                <span className="text-muted-foreground">Correctness</span>
                <p className="font-semibold text-foreground tabular-nums">{rubricAverages.correctness}/25</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-2">
                <span className="text-muted-foreground">Clarity</span>
                <p className="font-semibold text-foreground tabular-nums">{rubricAverages.clarity}/25</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-2">
                <span className="text-muted-foreground">Depth</span>
                <p className="font-semibold text-foreground tabular-nums">{rubricAverages.depth}/25</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-2">
                <span className="text-muted-foreground">Concepts</span>
                <p className="font-semibold text-foreground tabular-nums">{rubricAverages.conceptual}/25</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Evaluated by Gemini AI based on clarity, depth, and conceptual precision.</p>
          )}
        </div>
      </div>

      {/* ── Question-by-Question Detailed Feedback ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Question-by-Question Audit
            </h2>
            <p className="text-xs text-muted-foreground">
              {responses.length} questions evaluated in this session
            </p>
          </div>

          {responses.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleAll(!areAllExpanded)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {areAllExpanded ? "Collapse all" : "Expand all"}
            </Button>
          )}
        </div>

        {responses.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No detailed question records found for this historical session.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((res: AttemptResponseItem, idx: number) => {
              const isCoding = res.type === "coding";
              const score = Math.round(res.score || 0);
              const isExpanded = !!expandedCards[idx];

              // Normalize evaluation object
              const evaluation = extractEvaluation(res.evaluation);

              // Extract followups
              const followups = res.followup_answers || [];

              return (
                <article
                  key={res.id || idx}
                  className="glass rounded-2xl overflow-hidden transition-all duration-200 border border-white/[0.07]"
                >
                  {/* Header Toggle Bar */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(idx)}
                    className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-brand-gradient grid size-7 place-items-center rounded-full text-xs font-bold text-white shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {isCoding ? "Coding Challenge" : "Theory Question"}
                          </span>
                          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase text-muted-foreground">
                            {res.difficulty || "medium"}
                          </span>
                        </div>
                        <p className="line-clamp-1 text-sm font-medium text-foreground mt-0.5">
                          {res.question_text || `Question ${idx + 1}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums", TONE_SOFT[scoreTone(score)])}>
                        {score}%
                      </span>
                      <ChevronDown
                        className={cn("size-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")}
                      />
                    </div>
                  </button>

                  {/* Collapsible Content */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/[0.06] p-5 sm:p-6 space-y-5"
                      >
                        {/* Full Question Text */}
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                            Question Prompt
                          </span>
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line bg-white/[0.02] rounded-xl p-3.5 border border-white/[0.05]">
                            {res.question_text || "Question prompt not recorded."}
                          </p>
                        </div>

                        {/* Candidate Submission */}
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                            Your Submitted Solution
                          </span>

                          {isCoding ? (
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]">
                              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5 capitalize">
                                  <Terminal className="size-3.5" />{" "}
                                  {res.language ? `${res.language} Solution` : "Code Solution"}
                                </span>
                                <span>{res.user_answer?.split("\n").length || 0} lines</span>
                              </div>
                              <pre className="max-h-64 overflow-x-auto p-4 font-mono text-xs leading-relaxed text-secondary-foreground">
                                <code>{res.user_answer || "# No code submitted"}</code>
                              </pre>
                            </div>
                          ) : (
                            <blockquote className="border-l-2 border-primary/50 pl-4 py-1 text-sm italic text-secondary-foreground bg-white/[0.01] rounded-r-lg">
                              {res.user_answer || "No response submitted."}
                            </blockquote>
                          )}
                        </div>

                        {/* Coding Test Cases */}
                        {isCoding && res.code_result?.results && res.code_result.results.length > 0 && (
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                              Test Case Verification
                            </span>
                            <div className="space-y-2">
                              {res.code_result.results.map((tc: CodeTestResult, tcIdx: number) => (
                                <div
                                  key={tcIdx}
                                  className={cn(
                                    "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-xs",
                                    tc.passed
                                      ? "border-success/20 bg-success/[0.03]"
                                      : "border-danger/20 bg-danger/[0.03]"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {tc.passed ? (
                                      <CheckCircle2 className="size-4 text-success shrink-0" />
                                    ) : (
                                      <XCircle className="size-4 text-danger shrink-0" />
                                    )}
                                    <span className="font-semibold text-foreground">
                                      Test Case {tc.test_case || tcIdx + 1}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 font-mono text-[0.7rem]">
                                    <span className="text-muted-foreground">
                                      Expected: <span className="text-foreground">{tc.expected}</span>
                                    </span>
                                    <span className="text-muted-foreground">
                                      Actual:{" "}
                                      <span className={tc.passed ? "text-success" : "text-danger"}>
                                        {tc.actual || tc.error || "(none)"}
                                      </span>
                                    </span>
                                    {tc.time && (
                                      <span className="text-muted-foreground/70">
                                        {Math.round(parseFloat(tc.time) * 1000)}ms
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Theory Rubric & Feedback */}
                        {!isCoding && evaluation && (
                          <div className="space-y-3">
                            {/* Rubric metrics */}
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                                AI Scoring Dimensions
                              </span>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {[
                                  { label: "Correctness", val: evaluation.correctness?.score },
                                  { label: "Clarity", val: evaluation.clarity?.score },
                                  { label: "Depth", val: evaluation.depth?.score },
                                  { label: "Conceptual", val: evaluation.conceptual_understanding?.score },
                                ].map((item) => (
                                  <div key={item.label} className="rounded-xl bg-white/[0.03] p-2.5 text-center">
                                    <span className="text-[0.7rem] text-muted-foreground">{item.label}</span>
                                    <p className="font-display text-base font-bold tabular-nums text-foreground mt-0.5">
                                      {item.val ?? 0}/25
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Examiner commentary */}
                            <div className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.05] space-y-2">
                              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-cyan">
                                <MessageSquare className="size-3.5" /> Examiner Feedback
                              </span>
                              <p className="text-sm leading-relaxed text-secondary-foreground">
                                {evaluation.overall_feedback || "Answer evaluated."}
                              </p>
                            </div>

                            {/* Improvement Suggestions */}
                            {evaluation.improvement_suggestions && (
                              <div className="flex gap-2.5 rounded-xl border border-warning/20 bg-warning/[0.04] p-3.5 text-xs text-secondary-foreground">
                                <Lightbulb className="size-4 shrink-0 text-warning mt-0.5" />
                                <div>
                                  <span className="font-semibold text-warning block mb-0.5">
                                    Growth Suggestion
                                  </span>
                                  {evaluation.improvement_suggestions}
                                </div>
                              </div>
                            )}

                            {/* Follow-up Challenges if any */}
                            {followups.length > 0 && (
                              <div className="mt-3 space-y-3 rounded-2xl bg-white/[0.02] p-4 border border-white/[0.06]">
                                <div className="flex items-center justify-between">
                                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Sparkles className="size-3 text-primary" /> Follow-Up Challenges ({followups.length})
                                  </span>
                                  <span className="text-[0.65rem] text-muted-foreground">
                                    AI Probing Questions
                                  </span>
                                </div>

                                 <div className="space-y-3">
                                  {followups.map((fa: FollowupAnswerItem, faIdx: number) => {
                                    const faEval = extractEvaluation(fa.evaluation);
                                    const rawTotal =
                                      fa.evaluation &&
                                      "total_score" in fa.evaluation &&
                                      typeof fa.evaluation.total_score === "number"
                                        ? fa.evaluation.total_score
                                        : faEval?.total_score;
                                    const faScore = Math.round(rawTotal ?? 0);
                                    const faTone = scoreTone(faScore);

                                    return (
                                      <div
                                        key={faIdx}
                                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-2.5 text-xs"
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-start gap-2 min-w-0 flex-1">
                                            <span className="font-semibold text-primary shrink-0 mt-0.5">
                                              Q{faIdx + 1}:
                                            </span>
                                            <p className="font-medium text-foreground leading-snug">
                                              {fa.question}
                                            </p>
                                          </div>
                                          {fa.evaluation && (
                                            <span
                                              className={cn(
                                                "rounded-full px-2 py-0.5 font-mono text-[0.7rem] font-bold shrink-0 tabular-nums",
                                                TONE_SOFT[faTone]
                                              )}
                                            >
                                              {faScore}%
                                            </span>
                                          )}
                                        </div>

                                        <div className="rounded-lg bg-black/25 p-2.5 border border-white/[0.04]">
                                          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                                            Your Response
                                          </span>
                                          <p className="italic text-secondary-foreground whitespace-pre-line text-[0.8rem] leading-relaxed">
                                            {fa.answer || "No response submitted."}
                                          </p>
                                        </div>

                                        {faEval?.overall_feedback && (
                                          <div className="rounded-lg bg-brand-cyan/[0.04] p-2.5 border border-brand-cyan/20 space-y-1">
                                            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand-cyan flex items-center gap-1">
                                              <MessageSquare className="size-3" /> Examiner Evaluation
                                            </span>
                                            <p className="text-[0.78rem] text-secondary-foreground leading-relaxed">
                                              {faEval.overall_feedback}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Footer Actions ── */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
        <Button variant="outline" asChild className="border-white/10 w-full sm:w-auto">
          <Link href="/config">
            <Compass className="size-4" /> Start another topic
          </Link>
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" asChild className="border-white/10 flex-1 sm:flex-none">
            <Link href={`/config?category=${data.category}`}>
              <RotateCcw className="size-4" /> Practice again
            </Link>
          </Button>
          <Button variant="gradient" asChild className="flex-1 sm:flex-none">
            <Link href="/dashboard">
              Go to dashboard <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}