"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import axios from "axios";
import type { Monaco } from "@monaco-editor/react";
import FeedbackDisplay from "@/components/interview/FeedbackDisplay";
import AIThinking from "@/components/interview/AIThinking";
import AmbientBackground from "@/components/layout/AmbientBackground";
import { LogoMark } from "@/components/brand/Logo";
import ScoreRing from "@/components/ui/score-ring";
import { useInterviewStore } from "@/store/interviewStore";
import api from "@/lib/api";
import {
  TheoryEvaluationResponse,
  CodeSubmissionResponse,
  FollowupResponse,
} from "@/types/api.types";
import { getDomain } from "@/lib/domains";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  CodeXml,
  Flag,
  LoaderCircle,
  LogOut,
  MessageSquare,
  RotateCcw,
  Send,
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[420px] place-items-center text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-success bg-success/10 ring-success/25",
  medium: "text-warning bg-warning/10 ring-warning/25",
  hard: "text-danger bg-danger/10 ring-danger/25",
};

const LANGUAGE_OPTIONS = ["python", "javascript", "java", "cpp"];
const LANGUAGE_LABELS: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
};

const DEFAULT_CODE = "# Write your solution here\n";

/** Custom Monaco theme matching the app palette. */
function defineEditorTheme(monaco: Monaco) {
  monaco.editor.defineTheme("aip-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b7394", fontStyle: "italic" },
      { token: "keyword", foreground: "c4a7ff" },
      { token: "string", foreground: "7ee2c4" },
      { token: "number", foreground: "f7c37a" },
      { token: "type", foreground: "7cc7ff" },
    ],
    colors: {
      "editor.background": "#0e1122",
      "editor.lineHighlightBackground": "#ffffff08",
      "editorLineNumber.foreground": "#4b5170",
      "editorLineNumber.activeForeground": "#a5adcf",
      "editorCursor.foreground": "#8b7bff",
      "editor.selectionBackground": "#6d5dfc40",
      "editorIndentGuide.background1": "#ffffff0d",
    },
  });
}

function useElapsed(startTime: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!startTime) return "00:00";
  const s = Math.max(0, Math.floor((now - startTime) / 1000));
  const m = Math.floor(s / 60);
  return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function SessionPage() {
  const router = useRouter();

  const {
    questions,
    currentIndex,
    results,
    category,
    mode,
    setResult,
    nextQuestion,
    completeInterview,
    isComplete,
    paperId,
    startTime,
    setSavedAttemptId,
  } = useInterviewStore();

  const [theoryAnswer, setTheoryAnswer] = useState("");
  const [codeAnswer, setCodeAnswer] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeFollowup, setActiveFollowup] = useState<string | null>(null);
  const [followupAnswer, setFollowupAnswer] = useState("");
  const [followupLoading, setFollowupLoading] = useState(false);

  const elapsed = useElapsed(startTime);

  const currentQuestion = questions[currentIndex];
  const currentResult = results[currentIndex];

  useEffect(() => {
    if (!paperId && questions.length === 0) {
      router.push("/config");
    }
  }, [paperId, questions.length, router]);

  useEffect(() => {
    if (isComplete) {
      router.push("/summary");
    }
  }, [isComplete, router]);

  if (!paperId && questions.length === 0) {
    return (
      <div className="relative isolate grid min-h-screen place-items-center px-4">
        <AmbientBackground />
        <div className="glass max-w-sm rounded-2xl p-8 text-center">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-white/5">
            <CodeXml className="size-5 text-muted-foreground" />
          </span>
          <p className="mb-4 text-sm text-muted-foreground">No active interview session.</p>
          <Button variant="gradient" asChild>
            <Link href="/config">
              Start a new interview <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isAnswered = currentResult?.completed;
  const isLastQuestion = currentIndex === questions.length - 1;
  const domain = getDomain(category);
  const theoryWords = theoryAnswer.trim() ? theoryAnswer.trim().split(/\s+/).length : 0;

  const handleTheorySubmit = async () => {
    if (!theoryAnswer.trim() || theoryAnswer.trim().length < 10) {
      setError("Please write at least a sentence before submitting.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data }: { data: TheoryEvaluationResponse } = await api.post(
        "/theory/evaluate",
        {
          question: currentQuestion.question_text,
          answer: theoryAnswer,
          domain: category,
        }
      );

      setResult(currentIndex, {
        answer: theoryAnswer,
        evaluation: data,
        score: data.total_score,
        completed: true,
      });

      setLoading(false);

      // Followups depend on the evaluation result, so they can't be fetched
      // in parallel — but we don't make the user wait for them. The score
      // and feedback are already on screen; followups (if any) pop in
      // a moment later.
      if (data.needs_followup_check) {
        setResult(currentIndex, { followupsLoading: true });

        try {
          const { data: followupData }: { data: FollowupResponse } =
            await api.post("/theory/followup", {
              question: currentQuestion.question_text,
              answer: theoryAnswer,
              evaluation: data.evaluation,
            });

          setResult(currentIndex, {
            followupQuestions: followupData.followup_questions,
            followupsLoading: false,
          });
        } catch {
          setResult(currentIndex, { followupsLoading: false });
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Evaluation failed. Try again.");
      } else {
        setError("Evaluation failed. Try again.");
      }
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!codeAnswer.trim()) {
      setError("Please write some code before submitting.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const normalizedCode = codeAnswer
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

      const { data }: { data: CodeSubmissionResponse } = await api.post(
        "/code/submit",
        {
          question_id: currentQuestion.id,
          source_code: normalizedCode,
          language,
        }
      );

      setResult(currentIndex, {
        answer: normalizedCode,
        codeResult: data,
        score: data.score,
        completed: true,
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail || "Code submission failed. Try again."
        );
      } else {
        setError("Code submission failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollowupSubmit = async () => {
    if (!followupAnswer.trim() || !activeFollowup) return;

    setFollowupLoading(true);

    try {
      const { data }: { data: TheoryEvaluationResponse } = await api.post(
        "/theory/evaluate",
        {
          question: activeFollowup,
          answer: followupAnswer,
          domain: category,
        }
      );

      const prev = currentResult.followupAnswers || [];

      setResult(currentIndex, {
        followupAnswers: [
          ...prev,
          {
            question: activeFollowup,
            answer: followupAnswer,
            evaluation: data,
          },
        ],
      });

      setActiveFollowup(null);
      setFollowupAnswer("");
    } catch {
      // silently fail for follow-ups
    } finally {
      setFollowupLoading(false);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      try {
        const codingScore = useInterviewStore
          .getState()
          .getAverageCodingScore();

        const theoryScore = useInterviewStore
          .getState()
          .getAverageTheoryScore();

        const elapsed = useInterviewStore.getState().getElapsedSeconds();

        const { data } = await api.post("/questions/attempts/save", {
          category,
          mode,
          coding_score: codingScore,
          theory_score: theoryScore,
          time_taken: elapsed,
        });

        if (data?.attempt_id) {
          setSavedAttemptId(data.attempt_id);
        }
      } catch (e) {
        console.error("Failed to save attempt:", e);
      }

      completeInterview();
      router.push("/summary");
    } else {
      setTheoryAnswer("");
      setCodeAnswer(DEFAULT_CODE);
      setActiveFollowup(null);
      setFollowupAnswer("");
      setError("");
      nextQuestion();
    }
  };

  const handleExit = () => {
    if (window.confirm("Leave this interview? Your progress in this session will not be saved.")) {
      router.push("/dashboard");
    }
  };

  const pendingFollowups =
    currentResult.followupQuestions?.filter(
      (fq) => !currentResult.followupAnswers?.find((fa) => fa.question === fq)
    ) ?? [];

  return (
    <div className="relative isolate min-h-screen">
      <AmbientBackground />

      {/* ── Session top bar ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <LogoMark className="size-8" />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate font-display text-sm font-semibold text-foreground">
              {domain.label}
            </p>
            <p className="text-xs capitalize text-muted-foreground">{mode} mode interview</p>
          </div>

          {/* Stepper */}
          <ol className="mx-auto flex items-center gap-1.5" aria-label="Interview progress">
            {questions.map((q, i) => {
              const done = results[i]?.completed;
              const current = i === currentIndex;
              return (
                <li key={i} className="flex items-center gap-1.5">
                  <span
                    aria-current={current ? "step" : undefined}
                    title={`Question ${i + 1}`}
                    className={cn(
                      "grid size-7 place-items-center rounded-full text-xs font-semibold transition-all",
                      done && !current && "bg-success/15 text-success ring-1 ring-success/30",
                      current && "bg-brand-gradient text-white shadow-[0_0_20px_-4px_var(--primary)]",
                      !done && !current && "bg-white/5 text-muted-foreground ring-1 ring-white/10"
                    )}
                  >
                    {done && !current ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  {i < questions.length - 1 && (
                    <span
                      className={cn(
                        "hidden h-px w-4 sm:block md:w-6",
                        done ? "bg-success/40" : "bg-white/10"
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs tabular-nums text-secondary-foreground">
              <Clock className="size-3.5 text-primary" />
              {elapsed}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExit}
              aria-label="Exit interview"
              title="Exit interview"
              className="text-muted-foreground hover:text-danger"
            >
              <LogOut />
            </Button>
          </div>
        </div>
        {/* thin progress line */}
        <div className="h-0.5 bg-white/[0.04]">
          <motion.div
            className="bg-brand-gradient h-full"
            initial={false}
            animate={{
              width: `${(results.filter((r) => r.completed).length / questions.length) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── LEFT COLUMN ── question + feedback */}
          <div className="space-y-4">
            {/* Question card */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className="glass relative overflow-hidden rounded-2xl p-6"
            >
              <div className="bg-brand-gradient absolute inset-y-0 left-0 w-1" />
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold text-primary">
                  Q{currentIndex + 1}
                  <span className="text-muted-foreground">/{questions.length}</span>
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1",
                    DIFFICULTY_COLORS[currentQuestion.difficulty]
                  )}
                >
                  {currentQuestion.difficulty}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-secondary-foreground ring-1 ring-white/10">
                  {currentQuestion.type === "coding" ? (
                    <CodeXml className="size-3" />
                  ) : (
                    <MessageSquare className="size-3" />
                  )}
                  {currentQuestion.type === "coding" ? "Coding" : "Theory"}
                </span>
              </div>

              <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-foreground sm:text-base">
                {currentQuestion.question_text}
              </p>
            </motion.div>

            {/* AI working indicator */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AIThinking variant={currentQuestion.type === "coding" ? "code" : "theory"} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Code test results */}
            {isAnswered && currentResult.codeResult && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6"
              >
                <div className="mb-5 flex items-center gap-5">
                  <ScoreRing score={currentResult.codeResult.score} size={96} stroke={8} />
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Test results
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentResult.codeResult.passed_count ??
                        currentResult.codeResult.results.filter((r) => r.passed).length}{" "}
                      of{" "}
                      {currentResult.codeResult.total_count ??
                        currentResult.codeResult.results.length}{" "}
                      test cases passed
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {currentResult.codeResult.results.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.08 }}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-sm",
                        r.passed
                          ? "border-success/20 bg-success/[0.06]"
                          : "border-danger/20 bg-danger/[0.06]"
                      )}
                    >
                      {r.passed ? (
                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />
                      ) : (
                        <CircleX className="mt-0.5 size-4 shrink-0 text-danger" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">
                            Test case {r.test_case}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              r.passed ? "text-success" : "text-danger"
                            )}
                          >
                            {r.passed ? "Passed" : "Failed"}
                          </span>
                        </div>
                        {!r.passed && (
                          <div className="mt-2 grid gap-1 rounded-lg bg-black/25 p-2.5 font-mono text-xs">
                            <p className="text-muted-foreground">
                              expected: <span className="text-success">{r.expected}</span>
                            </p>
                            <p className="break-all text-muted-foreground">
                              received: <span className="text-danger">{r.actual || r.error}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Theory feedback */}
            {isAnswered && currentResult.evaluation && (
              <FeedbackDisplay
                evaluation={currentResult.evaluation.evaluation}
                followups={[]}
                onAnswerFollowup={() => {}}
              />
            )}
          </div>

          {/* ── RIGHT COLUMN ── answer input + action buttons + follow-ups */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            {/* Coding editor */}
            {currentQuestion.type === "coding" && !isAnswered && (
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e1122] shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <div className="flex items-center gap-1" role="tablist" aria-label="Language">
                    {LANGUAGE_OPTIONS.map((l) => (
                      <button
                        key={l}
                        role="tab"
                        aria-selected={language === l}
                        onClick={() => setLanguage(l)}
                        className={cn(
                          "rounded-md px-2.5 py-1 font-mono text-xs transition-colors",
                          language === l
                            ? "bg-primary/20 text-foreground ring-1 ring-primary/40"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        )}
                      >
                        {LANGUAGE_LABELS[l]}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCodeAnswer(DEFAULT_CODE)}
                    className="text-muted-foreground"
                    title="Reset code"
                  >
                    <RotateCcw /> Reset
                  </Button>
                </div>

                <MonacoEditor
                  height="420px"
                  language={language === "cpp" ? "cpp" : language}
                  value={codeAnswer}
                  onChange={(v) => setCodeAnswer(v || "")}
                  beforeMount={defineEditorTheme}
                  theme="aip-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', Menlo, Consolas, monospace",
                    fontLigatures: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    renderLineHighlight: "all",
                  }}
                />
              </div>
            )}

            {/* Theory textarea */}
            {currentQuestion.type === "theory" && !isAnswered && (
              <div className="glass flex flex-col rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between">
                  <label
                    htmlFor="theory-answer"
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    Your answer
                  </label>
                  <span className="font-mono text-xs text-muted-foreground">
                    {theoryWords} word{theoryWords !== 1 ? "s" : ""}
                  </span>
                </div>

                <Textarea
                  id="theory-answer"
                  value={theoryAnswer}
                  onChange={(e) => setTheoryAnswer(e.target.value)}
                  placeholder="Explain your answer in detail. Include definitions, examples and trade-offs where relevant…"
                  className="min-h-[320px] w-full flex-1 resize-none rounded-xl border-white/10 bg-black/20 px-4 py-3 text-[0.95rem] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/20"
                  rows={14}
                />
              </div>
            )}

            {/* Your answer preview — after answered */}
            {isAnswered && (
              <div className="glass rounded-2xl p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Your answer
                </p>

                {currentResult.type === "coding" ? (
                  <pre className="max-h-72 overflow-auto whitespace-pre rounded-xl bg-black/30 p-4 font-mono text-xs leading-relaxed text-secondary-foreground">
                    {currentResult.answer}
                  </pre>
                ) : (
                  <p className="line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-secondary-foreground">
                    {currentResult.answer}
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    role="alert"
                    className="flex items-center gap-2 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger"
                  >
                    <CircleAlert className="size-4 shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit / Next button */}
            {!isAnswered ? (
              <Button
                variant="gradient"
                size="xl"
                onClick={
                  currentQuestion.type === "coding"
                    ? handleCodeSubmit
                    : handleTheorySubmit
                }
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    {currentQuestion.type === "coding"
                      ? "Running tests…"
                      : "Evaluating your answer…"}
                  </>
                ) : (
                  <>
                    <Send /> {currentQuestion.type === "coding" ? "Run & submit" : "Submit answer"}
                  </>
                )}
              </Button>
            ) : (
              <Button variant="gradient" size="xl" onClick={handleNext} className="w-full">
                {isLastQuestion ? (
                  <>
                    <Flag /> Finish interview
                  </>
                ) : (
                  <>
                    Next question <ArrowRight />
                  </>
                )}
              </Button>
            )}

            {/* Follow-ups */}
            {isAnswered && currentResult.followupsLoading && (
              <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
                <span className="flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary" />
                </span>
                Interviewer is considering a follow-up…
              </div>
            )}

            {isAnswered && pendingFollowups.length > 0 && (
              <div className="space-y-3">
                {pendingFollowups.map((fq, i) => {
                  const open = activeFollowup === fq;
                  return (
                    <motion.div
                      key={fq}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={cn(
                        "overflow-hidden rounded-2xl border transition-colors",
                        open
                          ? "border-primary/40 bg-primary/[0.08]"
                          : "border-primary/20 bg-white/[0.02] hover:bg-primary/[0.05]"
                      )}
                    >
                      <button
                        onClick={() => {
                          setActiveFollowup(open ? null : fq);
                          setFollowupAnswer("");
                        }}
                        aria-expanded={open}
                        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
                      >
                        <span className="bg-brand-gradient grid size-8 shrink-0 place-items-center rounded-full">
                          <Bot className="size-4 text-white" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary">
                            Interviewer follow-up
                          </span>
                          <span className="mt-0.5 block text-sm text-foreground">{fq}</span>
                        </span>
                        <motion.span
                          animate={{ rotate: open ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-1 text-muted-foreground"
                        >
                          <ChevronDown className="size-4" />
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {open && (
                          <motion.div
                            key="followup-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-primary/15 px-4 pb-4 pt-3">
                              <Textarea
                                value={followupAnswer}
                                onChange={(e) => setFollowupAnswer(e.target.value)}
                                placeholder="Answer this follow-up question…"
                                className="w-full resize-none rounded-xl border-primary/25 bg-black/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-4 focus-visible:ring-primary/20"
                                rows={4}
                                autoFocus
                              />

                              <div className="mt-3 flex gap-2">
                                <Button
                                  variant="gradient"
                                  onClick={handleFollowupSubmit}
                                  disabled={followupLoading || !followupAnswer.trim()}
                                  className="h-10 flex-1 rounded-lg"
                                >
                                  {followupLoading ? (
                                    <>
                                      <LoaderCircle className="animate-spin" /> Evaluating…
                                    </>
                                  ) : (
                                    <>
                                      <Send /> Submit answer
                                    </>
                                  )}
                                </Button>

                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    setActiveFollowup(null);
                                    setFollowupAnswer("");
                                  }}
                                  className="h-10 rounded-lg px-4 text-muted-foreground"
                                >
                                  Skip
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Answered follow-ups */}
            {isAnswered &&
              currentResult.followupAnswers &&
              currentResult.followupAnswers.length > 0 && (
                <div className="space-y-2">
                  {currentResult.followupAnswers.map((fa) => (
                    <div
                      key={fa.question}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                    >
                      <CircleCheck className="size-4 shrink-0 text-success" />
                      <p className="line-clamp-1 flex-1 text-sm text-secondary-foreground">
                        {fa.question}
                      </p>
                      {fa.evaluation && (
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {fa.evaluation.total_score}/100
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}