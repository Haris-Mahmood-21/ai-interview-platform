import { cn } from "@/lib/utils";

/**
 * Ambient page backdrop: soft brand-coloured glows + faint grid,
 * fixed behind all content. Purely decorative.
 */
export default function AmbientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]" />
      <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-brand-indigo/25 blur-[120px]" />
      <div className="absolute -top-20 -left-40 h-[380px] w-[380px] rounded-full bg-brand-violet/20 blur-[110px]" />
      <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-brand-cyan/10 blur-[120px]" />
    </div>
  );
}

