import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * AI Interview Platform brand mark.
 * A speech bubble (the interview) containing a spark (the AI),
 * filled with the violet → cyan brand gradient.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("size-9 shrink-0", className)}
    >
      <defs>
        <linearGradient id="aip-g" x1="4" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.66 0.24 300)" />
          <stop offset="0.5" stopColor="oklch(0.6 0.21 275)" />
          <stop offset="1" stopColor="oklch(0.8 0.14 210)" />
        </linearGradient>
        <linearGradient id="aip-s" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.35" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Bubble */}
      <path
        d="M10 3h20a8 8 0 0 1 8 8v13a8 8 0 0 1-8 8h-9.5l-7.2 5.6c-.9.7-2.3.1-2.3-1.1V32A8 8 0 0 1 3 24V11a8 8 0 0 1 7-8Z"
        fill="url(#aip-g)"
      />
      <path
        d="M10 3h20a8 8 0 0 1 8 8v4H2v-4a8 8 0 0 1 8-8Z"
        fill="url(#aip-s)"
      />
      {/* AI spark */}
      <path
        d="M20.5 9.5c.5 3.9 2.6 6 6.5 6.5-3.9.5-6 2.6-6.5 6.5-.5-3.9-2.6-6-6.5-6.5 3.9-.5 6-2.6 6.5-6.5Z"
        fill="white"
      />
      <circle cx="28.5" cy="23.5" r="1.8" fill="white" fillOpacity="0.85" />
      <circle cx="13" cy="24" r="1.2" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex flex-col leading-none", className)}>
      <span className="font-display text-[0.95rem] font-bold tracking-tight text-foreground">
        AI Interview
      </span>
      <span className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Platform
      </span>
    </span>
  );
}

export default function Logo({
  href = "/",
  className,
  showWordmark = true,
}: {
  href?: string;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="AI Interview Platform home"
      className={cn("group flex items-center gap-2.5", className)}
    >
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
      {showWordmark && <Wordmark />}
    </Link>
  );
}

