"use client";

import { useState } from "react";
import Link from "next/link";

interface AttemptSummary {
  id: number;
  category: string;
  mode: string;
  coding_score: number;
  theory_score: number;
  total_score: number;
  time_taken: number;
  date: string;
}

const DOMAIN_ICONS: Record<string, string> = {
  dsa: "🧠", oop: "🧩", ml: "🤖", react: "⚛️",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-400"
      : score >= 60
      ? "text-yellow-400"
      : "text-red-400";
  return <span className={`font-semibold ${color}`}>{score}%</span>;
}

export default function SessionHistoryTable({
  attempts,
}: {
  attempts: AttemptSummary[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!attempts.length) {
    return (
      <div className="text-center py-10 text-gray-600 text-sm">
        No sessions yet — complete your first interview to see history here
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attempts.map((a) => (
        <div
          key={a.id}
          className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
        >
          {/* Row */}
          <button
            onClick={() => setExpanded(expanded === a.id ? null : a.id)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-800 transition-colors text-left"
          >
            <span className="text-xl">{DOMAIN_ICONS[a.category] || "📁"}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-white capitalize">
                {a.category.toUpperCase()} — {a.mode} mode
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{a.date}</p>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <div className="text-center">
                <p className="mb-0.5">Coding</p>
                <ScoreBadge score={a.coding_score} />
              </div>
              <div className="text-center">
                <p className="mb-0.5">Theory</p>
                <ScoreBadge score={a.theory_score} />
              </div>
              <div className="text-center">
                <p className="mb-0.5">Total</p>
                <ScoreBadge score={a.total_score} />
              </div>
              <div className="text-center">
                <p className="mb-0.5">Time</p>
                <span className="text-gray-400">{formatTime(a.time_taken)}</span>
              </div>
              <span className="text-gray-600">
                {expanded === a.id ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {/* Expanded detail */}
          {expanded === a.id && (
            <div className="px-5 pb-4 border-t border-gray-800">
              <div className="pt-4 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="bg-gray-800 rounded-lg px-4 py-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Coding (40%)</p>
                    <ScoreBadge score={a.coding_score} />
                  </div>
                  <div className="bg-gray-800 rounded-lg px-4 py-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Theory (60%)</p>
                    <ScoreBadge score={a.theory_score} />
                  </div>
                  <div className="bg-indigo-950 border border-indigo-900 rounded-lg px-4 py-3 text-center">
                    <p className="text-xs text-indigo-400 mb-1">Final Score</p>
                    <ScoreBadge score={a.total_score} />
                  </div>
                </div>
                <Link
                  href={`/sessions/${a.id}`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-800 px-3 py-1.5 rounded-lg transition-colors"
                >
                  View full feedback →
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}