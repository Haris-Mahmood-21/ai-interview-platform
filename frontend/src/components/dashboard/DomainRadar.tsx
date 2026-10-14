"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Target } from "lucide-react";
import { DOMAINS } from "@/lib/domains";

interface DomainStat {
  category: string;
  attempts: number;
  avg_score: number;
  best_score: number;
}

/** Skill radar across all four domains (unattempted domains show 0). */
export default function DomainRadar({ stats }: { stats: DomainStat[] }) {
  if (!stats.length) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/5">
          <Target className="size-5 text-muted-foreground" />
        </span>
        <p className="text-sm text-muted-foreground">
          Your skill radar appears after your first session
        </p>
      </div>
    );
  }

  const data = DOMAINS.map((d) => {
    const s = stats.find((x) => x.category === d.id);
    return {
      domain: d.short,
      avg: s ? Math.round(s.avg_score) : 0,
      best: s ? Math.round(s.best_score) : 0,
    };
  });

  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} outerRadius="72%">
          <defs>
            <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand-violet)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--brand-cyan)" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
          <PolarAngleAxis
            dataKey="domain"
            tick={{ fill: "var(--secondary-foreground)", fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Best"
            dataKey="best"
            stroke="var(--brand-cyan)"
            strokeDasharray="4 4"
            fill="transparent"
          />
          <Radar
            name="Average"
            dataKey="avg"
            stroke="var(--brand-violet)"
            strokeWidth={2}
            fill="url(#radarFill)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      {/* Accessible text alternative for the chart */}
      <table className="sr-only">
        <caption>Average and best score per domain</caption>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Average</th>
            <th>Best</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.domain}>
              <td>{d.domain}</td>
              <td>{d.avg}</td>
              <td>{d.best}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

