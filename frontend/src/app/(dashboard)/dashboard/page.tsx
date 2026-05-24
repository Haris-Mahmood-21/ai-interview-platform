"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import MetricCards from "@/components/dashboard/MetricCards";
import ScoreTrendChart from "@/components/dashboard/ScoreTrendChart";
import DomainStatsTable from "@/components/dashboard/DomainStatsTable";
import SessionHistoryTable from "@/components/dashboard/SessionHistoryTable";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

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
    if (mounted && !isAuthenticated) {
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
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-10 w-36 bg-gray-800 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
          <div className="h-48 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
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
          ? "text-green-400"
          : (data?.avg_score ?? 0) >= 60
          ? "text-yellow-400"
          : "text-white",
    },
    {
      label: "Best Score",
      value: data?.best_score ? `${data.best_score}%` : "—",
      sub: "personal best",
      color: "text-indigo-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user?.name ? `${user.name}'s Dashboard` : "Dashboard"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Track your interview performance over time
            </p>
          </div>
          <Link
            href="/config"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            New Interview →
          </Link>
        </div>

        {/* Metric cards */}
        <MetricCards metrics={metrics} />

        {/* Score trend */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-white mb-5">
            Score Trend
          </h2>
          <ScoreTrendChart data={data?.score_trend ?? []} />
        </div>

        {/* Domain stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-white mb-5">
            Performance by Domain
          </h2>
          <DomainStatsTable stats={data?.domain_stats ?? []} />
        </div>

        {/* Session history */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-white mb-5">
            Session History
          </h2>
          <SessionHistoryTable attempts={data?.recent_attempts ?? []} />
        </div>

      </div>
    </div>
  );
}