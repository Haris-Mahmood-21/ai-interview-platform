"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    api
      .get(`/dashboard/attempts/${params.id}`)
      .then((res) => setData(res.data))
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600 text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { attempt, responses } = data;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-white text-sm transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-lg font-bold text-white capitalize">
                {attempt.category.toUpperCase()} Interview
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {attempt.date} · {attempt.mode} mode
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-indigo-400">
                {attempt.total_score}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Final Score</p>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Coding (40%)", value: attempt.coding_score },
              { label: "Theory (60%)", value: attempt.theory_score },
              { label: "Total", value: attempt.total_score },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-gray-800 rounded-xl p-4 text-center"
              >
                <p className="text-xs text-gray-500 mb-2">{s.label}</p>
                <p
                  className={`text-2xl font-bold ${
                    s.value >= 80
                      ? "text-green-400"
                      : s.value >= 60
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {s.value}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Response feedback */}
        {responses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Question Feedback
            </h2>
            {responses.map((r: any, i: number) => (
              <div
                key={r.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500">
                    Question {i + 1}
                  </p>
                  <span
                    className={`text-sm font-semibold ${
                      r.score >= 80
                        ? "text-green-400"
                        : r.score >= 60
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {r.score}%
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-3 italic line-clamp-2">
                  "{r.user_answer}"
                </p>

                {r.ai_feedback && (
                  <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      AI Feedback
                    </p>
                    <p className="text-sm text-gray-300">
                      {r.ai_feedback.overall_feedback}
                    </p>
                    {r.ai_feedback.improvement_suggestions && (
                      <p className="text-xs text-gray-500 mt-2">
                        💡 {r.ai_feedback.improvement_suggestions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {responses.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">
              Detailed response feedback is not available for this session.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}