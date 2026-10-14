"use client";

import { motion } from "framer-motion";
import { CircleCheck, Gauge } from "lucide-react";
import Logo from "@/components/brand/Logo";
import AmbientBackground from "@/components/layout/AmbientBackground";

const POINTS = [
  "Questions generated from your own resume",
  "Answers scored on a 4-criterion rubric with RAG",
  "Live code execution on hidden test cases",
  "Follow-up questions and progress analytics",
];

/** Split-screen frame for login / register. */
export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <AmbientBackground />

      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-white/[0.06] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-brand-gradient absolute inset-0 opacity-[0.12]" />
        <div className="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" />

        <Logo className="relative" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-lg"
        >
          <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Your personal
            <br />
            <span className="text-gradient">AI interviewer.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li
                key={p}
                className="flex items-center gap-3 text-secondary-foreground"
              >
                <CircleCheck className="size-5 shrink-0 text-success" />
                {p}
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="glass relative max-w-lg rounded-2xl p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Gauge className="size-4 text-primary" /> Evaluation rubric
          </p>
          <div className="grid grid-cols-2 gap-2">
            {["Correctness", "Clarity", "Depth", "Understanding"].map((c) => (
              <div
                key={c}
                className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-sm"
              >
                <span className="text-secondary-foreground">{c}</span>
                <span className="font-mono text-xs text-muted-foreground">/25</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </main>
    </div>
  );
}

export function AuthSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

