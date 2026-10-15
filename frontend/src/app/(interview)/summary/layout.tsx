import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";

function SummarySkeleton() {
  return (
    <div className="relative isolate min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
        <div className="glass h-64 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="glass h-32 animate-pulse rounded-2xl" />
          <div className="glass h-32 animate-pulse rounded-2xl" />
        </div>
      </main>
    </div>
  );
}

export default function SummaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<SummarySkeleton />}>{children}</Suspense>;
}

