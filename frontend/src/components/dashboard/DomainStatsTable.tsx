const DOMAIN_ICONS: Record<string, string> = {
  dsa: "🧠",
  oop: "🧩",
  ml: "🤖",
  react: "⚛️",
};

const DOMAIN_LABELS: Record<string, string> = {
  dsa: "Data Structures & Algorithms",
  oop: "Object-Oriented Programming",
  ml: "Machine Learning",
  react: "React & Frontend",
};

interface DomainStat {
  category: string;
  attempts: number;
  avg_score: number;
  best_score: number;
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-400 bg-green-950 border-green-900"
      : score >= 60
      ? "text-yellow-400 bg-yellow-950 border-yellow-900"
      : "text-red-400 bg-red-950 border-red-900";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}>
      {score}%
    </span>
  );
}

export default function DomainStatsTable({ stats }: { stats: DomainStat[] }) {
  if (!stats.length) {
    return (
      <div className="text-center py-8 text-gray-600 text-sm">
        No domain data yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stats.map((s) => (
        <div
          key={s.category}
          className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl"
        >
          <span className="text-xl">{DOMAIN_ICONS[s.category] || "📁"}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {DOMAIN_LABELS[s.category] || s.category}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {s.attempts} session{s.attempts !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-xs text-gray-500 mb-1">Avg</p>
              <ScorePill score={s.avg_score} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Best</p>
              <ScorePill score={s.best_score} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}