"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Plus, Trophy, Layers, Target, Sparkles, ArrowRight } from "lucide-react";
import AppShell, { PageHeader } from "@/components/layout/AppShell";
import MetricCards, { type Metric } from "@/components/dashboard/MetricCards";
import ScoreTrendChart from "@/components/dashboard/ScoreTrendChart";
import DomainRadar from "@/components/dashboard/DomainRadar";
import DomainStatsTable from "@/components/dashboard/DomainStatsTable";
import SessionHistoryTable from "@/components/dashboard/SessionHistoryTable";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

export interface RecentAttempt {
  id: number;
  category: string;
  mode: string;
  coding_score: number;
  theory_score: number;
  total_score: number;
  time_taken: number;
  date: string;
}

export interface DomainStat {
  category: string;
  attempts: number;
  avg_score: number;
  best_score: number;
}

export interface ScoreTrendPoint {
  session: number;
  score: number;
  date: string;
  category: string;
}

interface DashboardData {
  total_sessions: number;
  avg_score: number;
  best_score: number;
  recent_attempts: RecentAttempt[];
  domain_stats: DomainStat[];
  score_trend: ScoreTrendPoint[];
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Panel({
  title,
  subtitle,
  children,
  className = "",
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass rounded-2xl p-5 sm:p-6 ${className}`}
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </motion.section>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;

    // Check both Zustand state AND localStorage token
    const token = localStorage.getItem("access_token");
    if (!isAuthenticated || !token) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);
  
  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    api
      .get("/dashboard/stats")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mounted, isAuthenticated]);

  if (!mounted || loading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
              <div className="h-9 w-72 animate-pulse rounded-lg bg-white/5" />
            </div>
            <div className="h-12 w-44 animate-pulse rounded-xl bg-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass h-32 animate-pulse rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="glass h-80 animate-pulse rounded-2xl" />
            <div className="glass h-80 animate-pulse rounded-2xl" />
          </div>
          <div className="glass h-64 animate-pulse rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const firstName = user?.name?.split(" ")[0];
  const sessions = data?.total_sessions ?? 0;

  const metrics: Metric[] = [
    {
      label: "Sessions",
      value: sessions,
      sub: "interviews completed",
      icon: Activity,
      tile: "from-violet-500 to-indigo-500",
    },
    {
      label: "Average",
      value: data?.avg_score ? Math.round(data.avg_score) : null,
      suffix: "%",
      sub: "across all sessions",
      icon: Target,
      tile: "from-sky-400 to-cyan-500",
    },
    {
      label: "Best",
      value: data?.best_score ? Math.round(data.best_score) : null,
      suffix: "%",
      sub: "personal best",
      icon: Trophy,
      tile: "from-amber-400 to-orange-500",
    },
    {
      label: "Domains",
      value: data?.domain_stats?.length ?? 0,
      suffix: "/4",
      sub: "domains practised",
      icon: Layers,
      tile: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow={greeting()}
        title={
          <>
            Welcome back{firstName ? ", " : ""}
            {firstName && <span className="text-gradient">{firstName}</span>}
          </>
        }
        description="Track your interview performance and keep improving."
        action={
          <Button variant="gradient" size="xl" asChild>
            <Link href="/config">
              <Plus /> New interview
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        {/* First-run banner */}
        {sessions === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-primary/25 p-6"
          >
            <div className="bg-brand-gradient absolute inset-0 opacity-[0.12]" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="bg-brand-gradient grid size-12 place-items-center rounded-2xl">
                  <Sparkles className="size-5 text-white" />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold">Start your first interview</p>
                  <p className="text-sm text-muted-foreground">
                    Choose a domain or upload your resume. It takes less than a minute to set up.
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild className="border-white/15 bg-white/5">
                <Link href="/config">
                  Get started <ArrowRight />
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

        <MetricCards metrics={metrics} />

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Panel title="Score trend" subtitle="Your total score per session" delay={0.1}>
            <ScoreTrendChart data={data?.score_trend ?? []} />
          </Panel>
          <Panel title="Skill radar" subtitle="Average vs best by domain" delay={0.15}>
            <DomainRadar stats={data?.domain_stats ?? []} />
          </Panel>
        </div>

        <Panel title="Performance by domain" delay={0.2}>
          <DomainStatsTable stats={data?.domain_stats ?? []} />
        </Panel>

        <Panel title="Session history" subtitle="Click a session to see the breakdown" delay={0.25}>
          <SessionHistoryTable attempts={data?.recent_attempts ?? []} />
        </Panel>
      </div>
    </AppShell>
  );
}