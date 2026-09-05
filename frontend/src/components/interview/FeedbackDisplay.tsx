"use client";

import { motion } from "framer-motion";
import { TheoryEvaluation } from "@/types/api.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 25) * 100;
  const color =
    pct >= 80 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-danger";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-secondary rounded-full h-1.5">
        <motion.div
          className={`${color} h-1.5 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-10 text-right">
        {score}/25
      </span>
    </div>
  );
}

export default function FeedbackDisplay({ evaluation, followups, onAnswerFollowup }: Props) {
  const total = evaluation.total_score;
  const totalColor =
    total >= 80 ? "text-success" : total >= 60 ? "text-warning" : "text-danger";

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Total score */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-secondary-foreground">Total Score</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {total >= 80
                  ? "Excellent — strong understanding"
                  : total >= 65
                  ? "Good — solid grasp of the concept"
                  : total >= 50
                  ? "Fair — correct direction, needs more depth"
                  : "Needs work — review the fundamentals"}
              </p>
            </div>
            <motion.span
              className={`text-2xl font-bold ${totalColor}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {total}/100
            </motion.span>
          </div>
        </CardContent>
      </Card>

      {/* Per-criterion breakdown */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Score Breakdown
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
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-secondary-foreground">{label}</span>
                </div>
                <ScoreBar score={criterion.score} />
                <p className="text-xs text-muted-foreground mt-1.5">{criterion.explanation}</p>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Overall feedback */}
      <Card>
        <CardContent>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Feedback
          </h3>
          <p className="text-sm text-secondary-foreground leading-relaxed">
            {evaluation.overall_feedback}
          </p>
        </CardContent>
      </Card>

      {/* Improvement suggestions */}
      <Card>
        <CardContent>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            What to Study
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {evaluation.improvement_suggestions}
          </p>
        </CardContent>
      </Card>

      {/* Follow-up questions */}
      {followups.length > 0 && (
        <Card className="bg-primary/5 ring-primary/20">
          <CardContent>
            <h3 className="text-xs font-medium text-primary uppercase tracking-wide mb-3">
              Follow-up Questions
            </h3>
            <div className="space-y-2">
              {followups.map((q, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  onClick={() => onAnswerFollowup(q)}
                  className="w-full justify-start text-left text-sm text-foreground bg-primary/10 hover:bg-primary/20 rounded-lg px-4 py-3 h-auto whitespace-normal"
                >
                  {q}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}