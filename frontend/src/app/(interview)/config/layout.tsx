import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";

function ConfigSkeleton() {
  return (
    <div className="relative isolate min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
          <div className="h-9 w-64 animate-pulse rounded-lg bg-white/5" />
          <div className="h-4 w-96 animate-pulse rounded bg-white/5" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="glass h-40 animate-pulse rounded-2xl" />
            <div className="glass h-56 animate-pulse rounded-2xl" />
          </div>
          <div className="glass h-96 animate-pulse rounded-2xl" />
        </div>
      </main>
    </div>
  );
}

// useSearchParams() in the config page requires a Suspense boundary
// for production builds (static prerender bail-out).
export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ConfigSkeleton />}>{children}</Suspense>;
}

