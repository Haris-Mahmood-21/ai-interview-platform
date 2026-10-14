"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Layers } from "lucide-react";
import { getDomain, scoreTone, TONE_TEXT } from "@/lib/domains";
import { cn } from "@/lib/utils";

interface DomainStat {
  category: string;
  attempts: number;
  avg_score: number;
  best_score: number;
}

export default function DomainStatsTable({ stats }: { stats: DomainStat[] }) {
  if (!stats.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/5">
          <Layers className="size-5 text-muted-foreground" />
        </span>
        <p className="text-sm text-muted-foreground">No domain data yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {stats.map((s, i) => {
        const d = getDomain(s.category);
        const tone = scoreTone(s.avg_score);
        return (
          <motion.div
            key={s.category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/12 hover:bg-white/[0.04]"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br",
                  d.tile
                )}
              >
                <d.icon className="size-5 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{d.label}</p>
                <p className="text-xs text-muted-foreground">
                  {s.attempts} session{s.attempts !== 1 ? "s" : ""} · best{" "}
                  <span className="font-medium text-secondary-foreground">
                    {Math.round(s.best_score)}%
                  </span>
                </p>
              </div>
              <p className={cn("font-display text-xl font-bold tabular-nums", TONE_TEXT[tone])}>
                {Math.round(s.avg_score)}%
              </p>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", d.tile)}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, s.avg_score)}%` }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.06 }}
              />
            </div>

            <Link
              href={`/config?category=${s.category}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Practise again <ArrowRight className="size-3" />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}