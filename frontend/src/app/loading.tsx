import Navbar from "@/components/layout/Navbar";

export default function RootLoading() {
  return (
    <div className="relative isolate min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
              <div className="h-9 w-64 animate-pulse rounded-lg bg-white/5" />
            </div>
            <div className="h-10 w-36 animate-pulse rounded-xl bg-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass h-32 animate-pulse rounded-2xl" />
            ))}
          </div>
          <div className="glass h-72 animate-pulse rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
