"use client";

import { motion } from "framer-motion";
import { BookOpen, MessageSquare } from "lucide-react";
import { TheoryEvaluation } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import ScoreRing from "@/components/ui/score-ring";
import { scoreTone, scoreVerdict, TONE_SOFT } from "@/lib/domains";
import { cn } from "@/lib/utils";

interface Props {
  evaluation: TheoryEvaluation;
  followups: string[];
  onAnswerFollowup: (question: string) => void;
}

const CRITERIA = [
  { key: "correctness", label: "Correctness" },
  { key: "clarity", label: "Clarity" },
  { key: "depth", label: "Depth" },
  { key: "conceptual_understanding", label: "Conceptual Understanding" },
] as const;

const BAR = {
  success: "from-emerald-400 to-teal-400",
  warning: "from-amber-300 to-orange-400",
  danger: "from-rose-400 to-red-500",
} as const;

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 25) * 100;
  const tone = scoreTone(pct);
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", BAR[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="w-11 text-right font-mono text-xs tabular-nums text-secondary-foreground">
        {score}/25
      </span>
    </div>
  );
}

export default function FeedbackDisplay({ evaluation, followups, onAnswerFollowup }: Props) {
  const total = evaluation.total_score;
  const tone = scoreTone(total);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero score */}
      <div className="glass relative overflow-hidden rounded-2xl p-6">
        <div className="bg-brand-gradient absolute -right-16 -top-16 size-48 rounded-full opacity-15 blur-3xl" />
        <div className="relative flex items-center gap-6">
          <ScoreRing score={total} size={116} stroke={10} label="Score" />
          <div>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", TONE_SOFT[tone])}>
              {scoreVerdict(total)}
            </span>
            <p className="mt-3 font-display text-lg font-semibold text-foreground">
              {total >= 80
                ? "Strong understanding"
                : total >= 65
                ? "Solid grasp of the concept"
                : total >= 50
                ? "Right direction, needs more depth"
                : "Review the fundamentals"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Evaluated on 4 criteria using retrieved reference knowledge.
            </p>
          </div>
        </div>
      </div>

      {/* Per-criterion breakdown */}
      <div className="glass space-y-5 rounded-2xl p-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Score breakdown
        </h3>
        {CRITERIA.map(({ key, label }, i) => {
          const criterion = evaluation[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
            >
              <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
              <ScoreBar score={criterion.score} />
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {criterion.explanation}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Overall feedback + study suggestions */}
      <div className="grid gap-4">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">
            <MessageSquare className="size-4" /> Interviewer feedback
          </h3>
          <p className="text-sm leading-relaxed text-secondary-foreground">
            {evaluation.overall_feedback}
          </p>
        </div>

        <div className="rounded-2xl border border-warning/20 bg-warning/[0.05] p-6">
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-warning">
            <BookOpen className="size-4" /> What to study
          </h3>
          <p className="text-sm leading-relaxed text-secondary-foreground">
            {evaluation.improvement_suggestions}
          </p>
        </div>
      </div>

      {/* Follow-up questions */}
      {followups.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Follow-up Questions
          </h3>
          <div className="space-y-2">
            {followups.map((q, i) => (
              <Button
                key={i}
                variant="ghost"
                onClick={() => onAnswerFollowup(q)}
                className="h-auto w-full justify-start whitespace-normal rounded-lg bg-primary/10 px-4 py-3 text-left text-sm text-foreground hover:bg-primary/20"
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}