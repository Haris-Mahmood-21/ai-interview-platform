"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

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
      ? "text-success"
      : score >= 60
      ? "text-warning"
      : "text-danger";
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
      <div className="text-center py-10 text-muted-foreground text-sm">
        No sessions yet — complete your first interview to see history here
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attempts.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <Card>
            <CardContent className="p-0">
              {/* Row */}
              <button
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/50 transition-colors text-left rounded-xl"
              >
                <span className="text-xl">{DOMAIN_ICONS[a.category] || "📁"}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground capitalize">
                    {a.category.toUpperCase()} — {a.mode} mode
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.date}</p>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
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
                    <span className="text-secondary-foreground">{formatTime(a.time_taken)}</span>
                  </div>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform duration-200 ${
                      expanded === a.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {expanded === a.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 border-t border-border">
                      <div className="pt-4 flex items-center justify-between">
                        <div className="flex gap-4">
                          <div className="bg-secondary rounded-lg px-4 py-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Coding (40%)</p>
                            <ScoreBadge score={a.coding_score} />
                          </div>
                          <div className="bg-secondary rounded-lg px-4 py-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Theory (60%)</p>
                            <ScoreBadge score={a.theory_score} />
                          </div>
                          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-center">
                            <p className="text-xs text-primary mb-1">Final Score</p>
                            <ScoreBadge score={a.total_score} />
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/sessions/${a.id}`}>
                            View full feedback →
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}