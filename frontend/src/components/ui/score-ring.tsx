"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import AnimatedNumber from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";
import { scoreTone } from "@/lib/domains";

const TONE_STROKES = {
  success: ["oklch(0.8 0.16 165)", "oklch(0.72 0.17 150)"],
  warning: ["oklch(0.86 0.15 90)", "oklch(0.76 0.17 60)"],
  danger: ["oklch(0.74 0.19 15)", "oklch(0.64 0.22 25)"],
  brand: ["oklch(0.66 0.24 300)", "oklch(0.8 0.14 210)"],
} as const;

/**
 * Animated circular score gauge (0–max). Colour follows the score tone
 * unless `tone="brand"` is passed.
 */
export default function ScoreRing({
  score,
  max = 100,
  size = 120,
  stroke = 10,
  label,
  tone,
  className,
  showMax = false,
}: {
  score: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  tone?: keyof typeof TONE_STROKES;
  className?: string;
  showMax?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const pct = Math.max(0, Math.min(1, max ? score / max : 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const t = tone ?? scoreTone(pct * 100);
  const [from, to] = TONE_STROKES[t];
  const fontSize = Math.round(size * 0.26);

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ? `${label}: ` : ""}${Math.round(score)} out of ${max}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(1 0 0 / 0.07)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ filter: `drop-shadow(0 0 6px ${from})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-bold leading-none tabular-nums text-foreground"
          style={{ fontSize }}
        >
          <AnimatedNumber value={Math.round(score)} />
          {showMax ? (
            <span className="text-muted-foreground" style={{ fontSize: fontSize * 0.45 }}>
              /{max}
            </span>
          ) : null}
        </span>
        {label && (
          <span className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

