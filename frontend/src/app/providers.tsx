"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {/* Honour the OS "reduce motion" setting for all framer-motion animations */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
      <Toaster position="top-right" richColors theme="dark" />
    </QueryClientProvider>
  );
}