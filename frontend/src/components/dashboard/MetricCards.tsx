"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";

export interface Metric {
  label: string;
  value: number | null;
  suffix?: string;
  sub?: string;
  icon: LucideIcon;
  /** Tailwind gradient classes for the icon tile */
  tile: string;
}

export default function MetricCards({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.07 }}
          className="glass group relative overflow-hidden rounded-2xl p-5"
        >
          <div
            className={cn(
              "absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br opacity-15 blur-2xl transition-opacity group-hover:opacity-30",
              m.tile
            )}
          />
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {m.label}
            </p>
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl bg-gradient-to-br shadow-lg",
                m.tile
              )}
            >
              <m.icon className="size-4.5 text-white" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
            {m.value === null ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              <AnimatedNumber value={m.value} suffix={m.suffix} />
            )}
          </p>
          {m.sub && <p className="mt-1 text-xs text-muted-foreground">{m.sub}</p>}
        </motion.div>
      ))}
    </div>
  );
}