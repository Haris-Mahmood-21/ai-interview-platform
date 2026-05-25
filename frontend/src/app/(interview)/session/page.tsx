"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import FeedbackDisplay from "@/components/interview/FeedbackDisplay";
import { useInterviewStore } from "@/store/interviewStore";
import api from "@/lib/api";
import { TheoryEvaluationResponse, CodeSubmissionResponse } from "@/types/api.types";
import Link from "next/link";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400 bg-green-950 border-green-800",
  medium: "text-yellow-400 bg-yellow-950 border-yellow-800",
  hard: "text-red-400 bg-red-950 border-red-800",
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">No active interview session.</p>
          <Link href="/config" className="text-indigo-400 hover:text-indigo-300 text-sm">
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
    } catch (err: any) {
      setError(err.response?.data?.detail || "Evaluation failed. Try again.");
    } finally {
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
      // Normalize line endings before sending
      const normalizedCode = codeAnswer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

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
      setError(err.response?.data?.detail || "Code submission failed. Try again.");
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
        const codingScore = useInterviewStore.getState().getAverageCodingScore();
        const theoryScore = useInterviewStore.getState().getAverageTheoryScore();
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
  <div className="min-h-screen bg-gray-950">
    <Navbar />

    {/* Progress bar */}
    <div className="bg-gray-900 border-b border-gray-800 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <span className="text-xs text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex-1 bg-gray-800 rounded-full h-1">
          <div
            className="bg-indigo-600 h-1 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 capitalize">{category}</span>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 gap-6">
        {/* ── LEFT COLUMN ── question + feedback */}
        <div className="space-y-4">
          {/* Question card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  DIFFICULTY_COLORS[currentQuestion.difficulty]
                }`}
              >
                {currentQuestion.difficulty}
              </span>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                {currentQuestion.type === "coding" ? "Coding" : "Theory"}
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">
              {currentQuestion.question_text}
            </p>
          </div>

          {/* Code test results */}
          {isAnswered && currentResult.codeResult && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Test Results</h3>
                <span
                  className={`text-lg font-bold ${
                    currentResult.codeResult.score >= 70
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {currentResult.codeResult.score}%
                </span>
              </div>

              <div className="space-y-2">
                {currentResult.codeResult.results.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg text-xs ${
                      r.passed
                        ? "bg-green-950 border border-green-900"
                        : "bg-red-950 border border-red-900"
                    }`}
                  >
                    <span>{r.passed ? "✓" : "✗"}</span>
                    <div className="flex-1">
                      <span className="text-gray-400">
                        Test {r.test_case}: {r.passed ? "Passed" : "Failed"}
                      </span>

                      {!r.passed && (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-gray-500">Expected: {r.expected}</p>
                          <p className="text-gray-500">
                            Got: {r.actual || r.error}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                <span className="text-xs text-gray-400">Code Editor</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1"
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
            </div>
          )}

          {/* Theory textarea */}
          {currentQuestion.type === "theory" && !isAnswered && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex-1">
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">
                Your Answer
              </label>
              <textarea
                value={theoryAnswer}
                onChange={(e) => setTheoryAnswer(e.target.value)}
                placeholder="Explain your answer in detail..."
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
                rows={12}
              />
            </div>
          )}

          {/* Your answer preview */}
          {isAnswered && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                Your answer
              </p>

              {currentResult.type === "coding" ? (
                <pre className="text-xs text-gray-300 bg-gray-800 rounded-lg p-3 overflow-x-auto whitespace-pre font-mono">
                  {currentResult.answer}
                </pre>
              ) : (
                <p className="text-sm text-gray-300 whitespace-pre-line line-clamp-6">
                  {currentResult.answer}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* ── ACTION BUTTONS — Next/Submit button ── */}
          <div className="mt-auto">
            {!isAnswered ? (
              <button
                onClick={
                  currentQuestion.type === "coding"
                    ? handleCodeSubmit
                    : handleTheorySubmit
                }
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium rounded-xl py-3 text-sm transition-colors"
              >
                {loading ? "Evaluating..." : "Submit Answer"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl py-3 text-sm transition-colors"
              >
                {isLastQuestion ? "Finish Interview →" : "Next Question →"}
              </button>
            )}
          </div>

          {/* ── FOLLOW-UP — below Next button ── */}
          {isAnswered && currentResult.evaluation?.has_followups && (
            <div className="space-y-3">
              {currentResult.evaluation.followup_questions
                .filter(
                  (fq) =>
                    !currentResult.followupAnswers?.find(
                      (fa) => fa.question === fq
                    )
                )
                .map((fq, i) => (
                  <div
                    key={i}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      activeFollowup === fq
                        ? "border-indigo-700 bg-indigo-950"
                        : "border-indigo-900 bg-gray-900"
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
                      <span className="text-xs font-medium text-indigo-400 shrink-0 mt-0.5">
                        Follow-up
                      </span>
                      <span className="text-sm text-white">{fq}</span>
                      <span className="ml-auto text-gray-600 text-xs shrink-0 mt-0.5">
                        {activeFollowup === fq ? "▲" : "▼"}
                      </span>
                    </button>

                    {activeFollowup === fq && (
                      <div className="px-4 pb-4 border-t border-indigo-800">
                        <textarea
                          value={followupAnswer}
                          onChange={(e) => setFollowupAnswer(e.target.value)}
                          placeholder="Answer this follow-up question..."
                          className="w-full mt-3 bg-gray-900 border border-indigo-700 text-white rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
                          rows={4}
                          autoFocus
                        />

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={handleFollowupSubmit}
                            disabled={followupLoading || !followupAnswer.trim()}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-medium rounded-lg py-2 transition-colors"
                          >
                            {followupLoading ? "Evaluating..." : "Submit Answer"}
                          </button>

                          <button
                            onClick={() => {
                              setActiveFollowup(null);
                              setFollowupAnswer("");
                            }}
                            className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-lg transition-colors"
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
} 