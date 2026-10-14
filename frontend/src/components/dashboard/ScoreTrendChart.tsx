"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartLine } from "lucide-react";

interface TrendPoint {
  session: number;
  score: number;
  date: string;
  category: string;
}

export default function ScoreTrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/5">
          <ChartLine className="size-5 text-muted-foreground" />
        </span>
        <p className="text-sm text-muted-foreground">
          No data yet — complete an interview to see your trend
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--brand-violet)" />
            <stop offset="100%" stopColor="var(--brand-cyan)" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="oklch(1 0 0 / 0.06)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ stroke: "oklch(1 0 0 / 0.15)" }}
          contentStyle={{
            backgroundColor: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            fontSize: "12px",
            color: "var(--foreground)",
            boxShadow: "0 10px 30px -10px rgb(0 0 0 / 0.6)",
          }}
          labelStyle={{ color: "var(--muted-foreground)" }}
          formatter={((value: unknown) => [`${value}%`, "Score"]) as never}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="url(#trendStroke)"
          strokeWidth={3}
          fill="url(#trendFill)"
          dot={{ fill: "var(--background)", stroke: "var(--chart-1)", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: "var(--brand-cyan)", stroke: "var(--background)", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}