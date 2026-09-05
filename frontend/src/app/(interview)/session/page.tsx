"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import FeedbackDisplay from "@/components/interview/FeedbackDisplay";
import { useInterviewStore } from "@/store/interviewStore";
import api from "@/lib/api";
import {
  TheoryEvaluationResponse,
  CodeSubmissionResponse,
  FollowupResponse,
} from "@/types/api.types";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-success bg-success/10 border-success/20",
  medium: "text-warning bg-warning/10 border-warning/20",
  hard: "text-danger bg-danger/10 border-danger/20",
};

const LANGUAGE_OPTIONS = ["python", "javascript", "java", "cpp"];

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
  } = useInterviewStore();

  const [theoryAnswer, setTheoryAnswer] = useState("");
  const [codeAnswer, setCodeAnswer] = useState("# Write your solution here\n");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeFollowup, setActiveFollowup] = useState<string | null>(null);
  const [followupAnswer, setFollowupAnswer] = useState("");
  const [followupLoading, setFollowupLoading] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentResult = results[currentIndex];

  useEffect(() => {
    if (!paperId && questions.length === 0) {
      router.push("/config");
    }
  }, [paperId, questions.length, router]);

  useEffect(() => {
    if (isComplete) {
      router.push("/dashboard");
    }
  }, [isComplete, router]);

  if (!paperId && questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-4">
            No active interview session.
          </p>
          <Link
            href="/config"
            className="text-primary hover:text-primary/90 text-sm"
          >
            Start a new interview →
          </Link>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isAnswered = currentResult?.completed;
  const isLastQuestion = currentIndex === questions.length - 1;

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
    } catch (err: any) {
      setError(err.response?.data?.detail || "Evaluation failed. Try again.");
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
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Code submission failed. Try again."
      );
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

        await api.post("/questions/attempts/save", {
          category,
          mode,
          coding_score: codingScore,
          theory_score: theoryScore,
          time_taken: elapsed,
        });
      } catch (e) {
        console.error("Failed to save attempt:", e);
      }

      completeInterview();
    } else {
      setTheoryAnswer("");
      setCodeAnswer("# Write your solution here\n");
      setActiveFollowup(null);
      setFollowupAnswer("");
      setError("");
      nextQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Progress bar */}
      <div className="bg-card border-b border-border px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>

          <div className="flex-1 bg-secondary rounded-full h-1 overflow-hidden">
            <motion.div
              className="bg-primary h-1 rounded-full transition-all"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <span className="text-xs text-muted-foreground capitalize">{category}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-6">
          {/* ── LEFT COLUMN ── question + feedback */}
          <div className="space-y-4">
            {/* Question card */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        DIFFICULTY_COLORS[currentQuestion.difficulty]
                      }`}
                    >
                      {currentQuestion.difficulty}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-input"
                    >
                      {currentQuestion.type === "coding" ? "Coding" : "Theory"}
                    </Badge>
                  </div>

                  <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                    {currentQuestion.question_text}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Code test results */}
            {isAnswered && currentResult.codeResult && (
              <Card className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-foreground">
                      Test Results
                    </h3>

                    <span
                      className={`text-lg font-bold ${
                        currentResult.codeResult.score >= 70
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {currentResult.codeResult.score}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentResult.codeResult.results.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.1 }}
                        className={`flex items-start gap-3 p-3 rounded-lg text-xs border ${
                          r.passed
                            ? "bg-success/10 border-success/20"
                            : "bg-danger/10 border-danger/20"
                        }`}
                      >
                        <span className={r.passed ? "text-success" : "text-danger"}>
                          {r.passed ? "✓" : "✗"}
                        </span>

                        <div className="flex-1">
                          <span className="text-muted-foreground">
                            Test {r.test_case}: {r.passed ? "Passed" : "Failed"}
                          </span>

                          {!r.passed && (
                            <div className="mt-1 space-y-0.5">
                              <p className="text-muted-foreground">
                                Expected: {r.expected}
                              </p>
                              <p className="text-muted-foreground">
                                Got: {r.actual || r.error}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
          <div className="flex flex-col gap-4">
            {/* Coding editor */}
            {currentQuestion.type === "coding" && !isAnswered && (
              <Card className="bg-card border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground font-mono">Code Editor</span>

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-secondary border border-input text-secondary-foreground text-xs rounded px-2 py-1"
                  >
                    {LANGUAGE_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <MonacoEditor
                  height="380px"
                  language={language === "cpp" ? "cpp" : language}
                  value={codeAnswer}
                  onChange={(v) => setCodeAnswer(v || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                  }}
                />
              </Card>
            )}

            {/* Theory textarea */}
            {currentQuestion.type === "theory" && !isAnswered && (
              <Card className="bg-card border-border flex-1 flex flex-col">
                <CardContent className="p-5 flex-1 flex flex-col">
                  <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                    Your Answer
                  </label>

                  <Textarea
                    value={theoryAnswer}
                    onChange={(e) => setTheoryAnswer(e.target.value)}
                    placeholder="Explain your answer in detail..."
                    className="w-full bg-secondary border-input text-foreground rounded-lg px-4 py-3 text-sm resize-none focus-visible:ring-ring placeholder:text-muted-foreground flex-1 min-h-[250px]"
                    rows={12}
                  />
                </CardContent>
              </Card>
            )}

            {/* Your answer preview — after answered */}
            {isAnswered && (
              <Card className="bg-card border-border">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                    Your answer
                  </p>

                  {currentResult.type === "coding" ? (
                    <pre className="text-xs text-secondary-foreground bg-secondary rounded-lg p-3 overflow-x-auto whitespace-pre font-mono">
                      {currentResult.answer}
                    </pre>
                  ) : (
                    <p className="text-sm text-secondary-foreground whitespace-pre-line line-clamp-6">
                      {currentResult.answer}
                    </p>
                  )}
                </CardContent>
              </Card>
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
                  <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mt-4">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit / Next button — right below answer, no gap */}
            {!isAnswered ? (
              <Button
                onClick={
                  currentQuestion.type === "coding"
                    ? handleCodeSubmit
                    : handleTheorySubmit
                }
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-foreground font-medium rounded-xl py-6 text-sm transition-colors"
              >
                {loading
                  ? currentQuestion.type === "coding"
                    ? "Running tests..."
                    : "Evaluating your answer..."
                  : "Submit Answer"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full bg-primary hover:bg-primary/90 text-foreground font-medium rounded-xl py-6 text-sm transition-colors"
              >
                {isLastQuestion ? "Finish Interview →" : "Next Question →"}
              </Button>
            )}

            {/* Follow-up — below Next button */}
            {isAnswered && currentResult.followupsLoading && (
              <p className="text-xs text-muted-foreground px-1">
                Checking if a follow-up question is needed…
              </p>
            )}

            {isAnswered &&
              currentResult.followupQuestions &&
              currentResult.followupQuestions.length > 0 && (
              <div className="space-y-3">
                {currentResult.followupQuestions
                  .filter(
                    (fq) =>
                      !currentResult.followupAnswers?.find(
                        (fa) => fa.question === fq
                      )
                  )
                  .map((fq, i) => (
                    <Card
                      key={i}
                      className={`overflow-hidden transition-all border ${
                        activeFollowup === fq
                          ? "border-primary/30 bg-primary/10"
                          : "border-primary/20 bg-card"
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (activeFollowup === fq) {
                            setActiveFollowup(null);
                            setFollowupAnswer("");
                          } else {
                            setActiveFollowup(fq);
                            setFollowupAnswer("");
                          }
                        }}
                        className="w-full text-left px-4 py-3 flex items-start gap-2"
                      >
                        <span className="text-xs font-medium text-primary shrink-0 mt-0.5">
                          Follow-up
                        </span>

                        <span className="text-sm text-foreground flex-1">{fq}</span>

                        <span className="ml-auto text-muted-foreground shrink-0 mt-0.5">
                          <motion.div
                            animate={{ rotate: activeFollowup === fq ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </span>
                      </button>

                      <AnimatePresence>
                        {activeFollowup === fq && (
                          <motion.div
                            key="followup-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-primary/20 mt-1 pt-3">
                              <Textarea
                                value={followupAnswer}
                                onChange={(e) =>
                                  setFollowupAnswer(e.target.value)
                                }
                                placeholder="Answer this follow-up question..."
                                className="w-full bg-card border border-primary/30 text-foreground rounded-lg px-4 py-3 text-sm resize-none focus-visible:ring-ring placeholder:text-muted-foreground"
                                rows={4}
                                autoFocus
                              />

                              <div className="flex gap-2 mt-3">
                                <Button
                                  onClick={handleFollowupSubmit}
                                  disabled={
                                    followupLoading || !followupAnswer.trim()
                                  }
                                  className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-foreground text-sm font-medium"
                                >
                                  {followupLoading
                                    ? "Evaluating..."
                                    : "Submit Answer"}
                                </Button>

                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    setActiveFollowup(null);
                                    setFollowupAnswer("");
                                  }}
                                  className="px-4 bg-secondary hover:bg-secondary/80 text-muted-foreground text-sm rounded-lg transition-colors"
                                >
                                  Skip
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}