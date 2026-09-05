"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { attempt, responses } = data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div
        className="max-w-3xl mx-auto px-4 py-10 space-y-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              ← Dashboard
            </Link>
          </Button>
        </div>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-lg font-bold text-foreground capitalize">
                  {attempt.category.toUpperCase()} Interview
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {attempt.date} · {attempt.mode} mode
                </p>
              </div>
              <div className="text-right">
                <motion.p
                  className="text-3xl font-bold text-primary"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  {attempt.total_score}%
                </motion.p>
                <p className="text-xs text-muted-foreground mt-1">Final Score</p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Coding (40%)", value: attempt.coding_score },
                { label: "Theory (60%)", value: attempt.theory_score },
                { label: "Total", value: attempt.total_score },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  className="bg-secondary rounded-xl p-4 text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                >
                  <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
                  <p
                    className={`text-2xl font-bold ${
                      s.value >= 80
                        ? "text-success"
                        : s.value >= 60
                        ? "text-warning"
                        : "text-danger"
                    }`}
                  >
                    {s.value}%
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Response feedback */}
        {responses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Question Feedback
            </h2>
            {responses.map((r: any, i: number) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground">
                        Question {i + 1}
                      </p>
                      <span
                        className={`text-sm font-semibold ${
                          r.score >= 80
                            ? "text-success"
                            : r.score >= 60
                            ? "text-warning"
                            : "text-danger"
                        }`}
                      >
                        {r.score}%
                      </span>
                    </div>

                    <p className="text-sm text-secondary-foreground mb-3 italic line-clamp-2">
                      &quot;{r.user_answer}&quot;
                    </p>

                    {r.ai_feedback && (
                      <div className="bg-secondary rounded-lg p-4 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          AI Feedback
                        </p>
                        <p className="text-sm text-secondary-foreground">
                          {r.ai_feedback.overall_feedback}
                        </p>
                        {r.ai_feedback.improvement_suggestions && (
                          <p className="text-xs text-muted-foreground mt-2">
                            💡 {r.ai_feedback.improvement_suggestions}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {responses.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Detailed response feedback is not available for this session.
              </p>
            </CardContent>
          </Card>
        )}

      </motion.div>
    </div>
  );
}