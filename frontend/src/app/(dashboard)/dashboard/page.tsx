"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import MetricCards from "@/components/dashboard/MetricCards";
import ScoreTrendChart from "@/components/dashboard/ScoreTrendChart";
import DomainStatsTable from "@/components/dashboard/DomainStatsTable";
import SessionHistoryTable from "@/components/dashboard/SessionHistoryTable";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardData {
  total_sessions: number;
  avg_score: number;
  best_score: number;
  recent_attempts: any[];
  domain_stats: any[];
  score_trend: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-secondary rounded-lg animate-pulse" />
            <div className="h-10 w-36 bg-secondary rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-card ring-1 ring-foreground/10 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-card ring-1 ring-foreground/10 rounded-2xl animate-pulse" />
          <div className="h-48 bg-card ring-1 ring-foreground/10 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Sessions",
      value: data?.total_sessions ?? 0,
      sub: "interviews completed",
    },
    {
      label: "Average Score",
      value: data?.avg_score ? `${data.avg_score}%` : "—",
      sub: "across all sessions",
      color:
        (data?.avg_score ?? 0) >= 80
          ? "text-success"
          : (data?.avg_score ?? 0) >= 60
          ? "text-warning"
          : "text-foreground",
    },
    {
      label: "Best Score",
      value: data?.best_score ? `${data.best_score}%` : "—",
      sub: "personal best",
      color: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div
        className="max-w-5xl mx-auto px-4 py-10 space-y-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {user?.name ? `${user.name}'s Dashboard` : "Dashboard"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track your interview performance over time
            </p>
          </div>
          <Button asChild>
            <Link href="/config">
              New Interview →
            </Link>
          </Button>
        </div>

        {/* Metric cards */}
        <MetricCards metrics={metrics} />

        {/* Score trend */}
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-sm font-medium text-foreground mb-5">
              Score Trend
            </h2>
            <ScoreTrendChart data={data?.score_trend ?? []} />
          </CardContent>
        </Card>

        {/* Domain stats */}
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-sm font-medium text-foreground mb-5">
              Performance by Domain
            </h2>
            <DomainStatsTable stats={data?.domain_stats ?? []} />
          </CardContent>
        </Card>

        {/* Session history */}
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-sm font-medium text-foreground mb-5">
              Session History
            </h2>
            <SessionHistoryTable attempts={data?.recent_attempts ?? []} />
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
}