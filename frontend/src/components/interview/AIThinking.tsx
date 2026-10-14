"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LoaderCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const THEORY_STEPS = [
  "Retrieving reference knowledge (RAG)",
  "Analysing correctness & depth",
  "Scoring against rubric",
  "Writing personalised feedback",
];

const CODE_STEPS = [
  "Compiling your solution",
  "Running hidden test cases",
  "Measuring results",
  "Calculating score",
];

const GENERATE_STEPS = [
  "Reading your profile",
  "Selecting relevant topics",
  "Generating questions with Gemini",
  "Preparing your interview",
];

const PRESETS = {
  theory: { title: "AI is evaluating your answer", steps: THEORY_STEPS },
  code: { title: "Executing your code", steps: CODE_STEPS },
  generate: { title: "Building your interview", steps: GENERATE_STEPS },
} as const;

/**
 * Animated "AI at work" panel. Steps advance on a timer purely as a
 * visual indicator of the pipeline — it doesn't track real progress.
 */
export default function AIThinking({
  variant = "theory",
  className,
}: {
  variant?: keyof typeof PRESETS;
  className?: string;
}) {
  const { title, steps } = PRESETS[variant];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActive((a) => Math.min(a + 1, steps.length - 1)),
      1600
    );
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("glass relative overflow-hidden rounded-2xl p-6", className)}
    >
      {/* shimmering top line */}
      <div className="absolute inset-x-0 top-0 h-px animate-shimmer bg-[linear-gradient(90deg,transparent,var(--brand-cyan),var(--brand-violet),transparent)] bg-[length:200%_100%]" />

      <div className="flex items-center gap-4">
        <div className="relative grid size-12 place-items-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/40" />
          <span className="bg-brand-gradient relative grid size-12 place-items-center rounded-full">
            <Sparkles className="size-5 text-white" />
          </span>
        </div>
        <div>
          <p className="font-display text-base font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">This usually takes a few seconds…</p>
        </div>
      </div>

      <ol className="mt-6 space-y-3">
        {steps.map((s, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={s} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border transition-colors",
                  done && "border-success/40 bg-success/15 text-success",
                  current && "border-primary/50 bg-primary/15 text-primary",
                  !done && !current && "border-white/10 text-muted-foreground"
                )}
              >
                {done ? (
                  <Check className="size-3.5" />
                ) : current ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current opacity-50" />
                )}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${s}-${done}-${current}`}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    done && "text-muted-foreground line-through decoration-white/20",
                    current && "font-medium text-foreground",
                    !done && !current && "text-muted-foreground/70"
                  )}
                >
                  {s}
                </motion.span>
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

