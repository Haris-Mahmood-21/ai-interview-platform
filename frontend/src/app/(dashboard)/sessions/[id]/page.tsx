"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Lightbulb, MessageSquare, Plus } from "lucide-react";
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
      <AppShell className="max-w-4xl">
        <div className="space-y-6">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-white/5" />
          <div className="glass h-64 animate-pulse rounded-2xl" />
          <div className="glass h-40 animate-pulse rounded-2xl" />
          <div className="glass h-40 animate-pulse rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!data) return null;

  const { attempt, responses } = data;
  const domain = getDomain(attempt.category);

  return (
    <AppShell className="max-w-4xl">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="-ml-2 text-muted-foreground">
            <Link href="/dashboard">
              <ArrowLeft /> Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-white/10">
            <Link href={`/config?category=${attempt.category}`}>
              <Plus /> Practise again
            </Link>
          </Button>
        </div>

        {/* Summary hero */}
        <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="bg-brand-gradient absolute -right-24 -top-24 size-72 rounded-full opacity-15 blur-3xl" />
          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center">
            <ScoreRing score={attempt.total_score} size={148} stroke={12} label="Final" />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl bg-gradient-to-br",
                    domain.tile
                  )}
                >
                  <domain.icon className="size-5 text-white" />
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    TONE_SOFT[scoreTone(attempt.total_score)]
                  )}
                >
                  {scoreVerdict(attempt.total_score)}
                </span>
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                {domain.label} interview
              </h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" /> {attempt.date}
                </span>
                <span className="capitalize">{attempt.mode} mode</span>
                {typeof attempt.time_taken === "number" && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" /> {formatDuration(attempt.time_taken)}
                  </span>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-sm">
                {[
                  { label: "Coding · 40%", value: attempt.coding_score },
                  { label: "Theory · 60%", value: attempt.theory_score },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/[0.04] p-3">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="mt-1 font-display text-2xl font-bold tabular-nums">
                      {Math.round(s.value)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Response feedback */}
        {responses.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Question feedback</h2>
            {responses.map((r: any, i: number) => (
              <motion.article
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="glass rounded-2xl p-5 sm:p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="bg-brand-gradient grid size-7 place-items-center rounded-full text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      Question {i + 1}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums",
                      TONE_SOFT[scoreTone(r.score)]
                    )}
                  >
                    {Math.round(r.score)}%
                  </span>
                </div>

                <blockquote className="mb-4 line-clamp-3 border-l-2 border-white/15 pl-4 text-sm italic text-secondary-foreground">
                  {r.user_answer}
                </blockquote>

                {r.ai_feedback && (
                  <div className="space-y-3 rounded-xl bg-white/[0.03] p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-cyan">
                      <MessageSquare className="size-3.5" /> AI feedback
                    </p>
                    <p className="text-sm leading-relaxed text-secondary-foreground">
                      {r.ai_feedback.overall_feedback}
                    </p>
                    {r.ai_feedback.improvement_suggestions && (
                      <p className="flex gap-2 rounded-lg border border-warning/15 bg-warning/[0.05] p-3 text-sm text-secondary-foreground">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" />
                        {r.ai_feedback.improvement_suggestions}
                      </p>
                    )}
                  </div>
                )}
              </motion.article>
            ))}
          </section>
        )}

        {responses.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Detailed response feedback is not available for this session.
            </p>
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}