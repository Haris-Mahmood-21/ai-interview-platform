import {
  Atom,
  Boxes,
  Brain,
  Network,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for interview domains: label, icon,
 * short description and the accent gradient used for icon tiles.
 */
export interface DomainMeta {
  id: string;
  label: string;
  short: string;
  desc: string;
  icon: LucideIcon;
  /** Tailwind classes for the gradient icon tile */
  tile: string;
  /** Solid accent color (CSS) used in charts */
  color: string;
}

export const DOMAINS: DomainMeta[] = [
  {
    id: "dsa",
    label: "Data Structures & Algorithms",
    short: "DSA",
    desc: "Arrays, trees, graphs, sorting, dynamic programming",
    icon: Network,
    tile: "from-violet-500 to-indigo-500",
    color: "var(--chart-1)",
  },
  {
    id: "oop",
    label: "Object-Oriented Programming",
    short: "OOP",
    desc: "Classes, inheritance, SOLID, design patterns",
    icon: Boxes,
    tile: "from-amber-400 to-orange-500",
    color: "var(--chart-4)",
  },
  {
    id: "ml",
    label: "Machine Learning",
    short: "ML",
    desc: "Supervised learning, neural networks, evaluation",
    icon: Brain,
    tile: "from-emerald-400 to-teal-500",
    color: "var(--chart-3)",
  },
  {
    id: "react",
    label: "React & Frontend",
    short: "React",
    desc: "Hooks, state management, Next.js, performance",
    icon: Atom,
    tile: "from-sky-400 to-cyan-500",
    color: "var(--chart-2)",
  },
];

export const DOMAIN_MAP: Record<string, DomainMeta> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d])
);

export function getDomain(id: string | undefined | null): DomainMeta {
  return (
    (id && DOMAIN_MAP[id]) || {
      id: id ?? "unknown",
      label: id ? id.toUpperCase() : "General",
      short: id ? id.toUpperCase() : "General",
      desc: "",
      icon: Boxes,
      tile: "from-slate-500 to-slate-600",
      color: "var(--chart-1)",
    }
  );
}

/** Score → semantic colour helpers (0–100 scale) */
export function scoreTone(score: number): "success" | "warning" | "danger" {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

export const TONE_TEXT = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

export const TONE_SOFT = {
  success: "bg-success/10 text-success ring-1 ring-success/25",
  warning: "bg-warning/10 text-warning ring-1 ring-warning/25",
  danger: "bg-danger/10 text-danger ring-1 ring-danger/25",
} as const;

export function scoreVerdict(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Fair";
  return "Needs work";
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r.toString().padStart(2, "0")}s` : `${r}s`;
}

