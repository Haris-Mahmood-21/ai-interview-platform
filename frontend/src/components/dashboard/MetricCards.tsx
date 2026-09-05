"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

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
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
        >
          <Card>
            <CardContent>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                {m.label}
              </p>
              <p className={`text-3xl font-bold ${m.color || "text-foreground"}`}>
                {m.value}
              </p>
              {m.sub && (
                <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}