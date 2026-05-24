interface Metric {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export default function MetricCards({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5"
        >
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            {m.label}
          </p>
          <p className={`text-3xl font-bold ${m.color || "text-white"}`}>
            {m.value}
          </p>
          {m.sub && (
            <p className="text-xs text-gray-500 mt-1">{m.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}