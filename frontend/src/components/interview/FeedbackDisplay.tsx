import { TheoryEvaluation } from "@/types/api.types";

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
    pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
        <div
          className={`${color} h-1.5 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-10 text-right">
        {score}/25
      </span>
    </div>
  );
}

export default function FeedbackDisplay({ evaluation, followups, onAnswerFollowup }: Props) {
  const total = evaluation.total_score;
  const totalColor =
    total >= 80 ? "text-green-400" : total >= 60 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-4">
      {/* Total score */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
        <div>
          <span className="text-sm font-medium text-gray-300">Total Score</span>
          <p className="text-xs text-gray-500 mt-0.5">
            {total >= 80
              ? "Excellent — strong understanding"
              : total >= 65
              ? "Good — solid grasp of the concept"
              : total >= 50
              ? "Fair — correct direction, needs more depth"
              : "Needs work — review the fundamentals"}
          </p>
        </div>
        <span className={`text-2xl font-bold ${totalColor}`}>{total}/100</span>
      </div>

      {/* Per-criterion breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Score Breakdown
        </h3>
        {CRITERIA.map(({ key, label }) => {
          const criterion = evaluation[key];
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">{label}</span>
              </div>
              <ScoreBar score={criterion.score} />
              <p className="text-xs text-gray-500 mt-1.5">{criterion.explanation}</p>
            </div>
          );
        })}
      </div>

      {/* Overall feedback */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          Feedback
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          {evaluation.overall_feedback}
        </p>
      </div>

      {/* Improvement suggestions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          What to Study
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          {evaluation.improvement_suggestions}
        </p>
      </div>

      {/* Follow-up questions */}
      {followups.length > 0 && (
        <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4">
          <h3 className="text-xs font-medium text-indigo-400 uppercase tracking-wide mb-3">
            Follow-up Questions
          </h3>
          <div className="space-y-2">
            {followups.map((q, i) => (
              <button
                key={i}
                onClick={() => onAnswerFollowup(q)}
                className="w-full text-left text-sm text-indigo-200 bg-indigo-900 hover:bg-indigo-800 rounded-lg px-4 py-3 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}