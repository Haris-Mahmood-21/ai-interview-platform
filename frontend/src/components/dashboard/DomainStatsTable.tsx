"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const DOMAIN_ICONS: Record<string, string> = {
  dsa: "🧠",
  oop: "🧩",
  ml: "🤖",
  react: "⚛️",
};

const DOMAIN_LABELS: Record<string, string> = {
  dsa: "Data Structures & Algorithms",
  oop: "Object-Oriented Programming",
  ml: "Machine Learning",
  react: "React & Frontend",
};

interface DomainStat {
  category: string;
  attempts: number;
  avg_score: number;
  best_score: number;
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-success/10 text-success border-success/20"
      : score >= 60
      ? "bg-warning/10 text-warning border-warning/20"
      : "bg-danger/10 text-danger border-danger/20";
  return (
    <Badge variant="outline" className={color}>
      {score}%
    </Badge>
  );
}

export default function DomainStatsTable({ stats }: { stats: DomainStat[] }) {
  if (!stats.length) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No domain data yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.category}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
        >
          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="text-xl">{DOMAIN_ICONS[s.category] || "📁"}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {DOMAIN_LABELS[s.category] || s.category}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.attempts} session{s.attempts !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Avg</p>
                    <ScorePill score={s.avg_score} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Best</p>
                    <ScorePill score={s.best_score} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}