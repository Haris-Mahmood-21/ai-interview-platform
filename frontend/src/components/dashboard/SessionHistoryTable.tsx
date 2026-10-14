"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Clock, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatDuration,
  getDomain,
  scoreTone,
  TONE_SOFT,
  TONE_TEXT,
} from "@/lib/domains";
import { cn } from "@/lib/utils";

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

function ScorePill({ score, className }: { score: number; className?: string }) {
  const tone = scoreTone(score);
  return (
    <span
      className={cn(
        "inline-flex min-w-12 justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
        TONE_SOFT[tone],
        className
      )}
    >
      {Math.round(score)}%
    </span>
  );
}

export default function SessionHistoryTable({
  attempts,
}: {
  attempts: AttemptSummary[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!attempts.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/5">
          <History className="size-5 text-muted-foreground" />
        </span>
        <p className="text-sm text-muted-foreground">
          No sessions yet — complete your first interview to see history here
        </p>
      </div>
    );
  }

  return (
    <div className="-mx-2">
      {/* Column header (desktop) */}
      <div className="hidden grid-cols-[1fr_80px_80px_80px_90px_24px] gap-4 px-4 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:grid">
        <span>Session</span>
        <span className="text-center">Coding</span>
        <span className="text-center">Theory</span>
        <span className="text-center">Total</span>
        <span className="text-center">Time</span>
        <span />
      </div>

      <div className="space-y-1.5">
        {attempts.map((a, i) => {
          const d = getDomain(a.category);
          const open = expanded === a.id;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className={cn(
                "rounded-xl border transition-colors",
                open
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-transparent hover:bg-white/[0.03]"
              )}
            >
              <button
                onClick={() => setExpanded(open ? null : a.id)}
                aria-expanded={open}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 text-left md:grid-cols-[1fr_80px_80px_80px_90px_24px]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br",
                      d.tile
                    )}
                  >
                    <d.icon className="size-4 text-white" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {d.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="capitalize">{a.mode}</span> mode · {a.date}
                    </p>
                  </div>
                </div>
                <span className="hidden justify-center md:flex">
                  <ScorePill score={a.coding_score} />
                </span>
                <span className="hidden justify-center md:flex">
                  <ScorePill score={a.theory_score} />
                </span>
                <span
                  className={cn(
                    "hidden text-center font-display text-base font-bold tabular-nums md:block",
                    TONE_TEXT[scoreTone(a.total_score)]
                  )}
                >
                  {Math.round(a.total_score)}%
                </span>
                <span className="hidden items-center justify-center gap-1 text-xs text-muted-foreground md:flex">
                  <Clock className="size-3" />
                  {formatDuration(a.time_taken)}
                </span>
                <span className="flex items-center gap-3">
                  <span className="md:hidden">
                    <ScorePill score={a.total_score} />
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-200",
                      open && "rotate-180"
                    )}
                  />
                </span>
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-4 border-t border-white/[0.06] px-4 pb-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-white/[0.04] px-4 py-2.5 text-center">
                          <p className="mb-1 text-[0.68rem] text-muted-foreground">Coding (40%)</p>
                          <ScorePill score={a.coding_score} />
                        </div>
                        <div className="rounded-lg bg-white/[0.04] px-4 py-2.5 text-center">
                          <p className="mb-1 text-[0.68rem] text-muted-foreground">Theory (60%)</p>
                          <ScorePill score={a.theory_score} />
                        </div>
                        <div className="rounded-lg border border-primary/25 bg-primary/10 px-4 py-2.5 text-center">
                          <p className="mb-1 text-[0.68rem] text-primary">Final score</p>
                          <ScorePill score={a.total_score} />
                        </div>
                      </div>
                      <Button variant="outline" asChild className="border-white/10">
                        <Link href={`/sessions/${a.id}`}>
                          View full feedback <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}