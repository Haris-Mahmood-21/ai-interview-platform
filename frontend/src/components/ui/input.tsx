import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/70 selection:bg-primary selection:text-primary-foreground flex h-11 w-full min-w-0 rounded-xl border border-input bg-white/[0.03] px-3.5 py-1 text-base outline-none transition-[color,box-shadow,border-color,background-color] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-white/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-primary/60 focus-visible:bg-white/[0.05] focus-visible:ring-4 focus-visible:ring-primary/20",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }

