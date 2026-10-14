import { Suspense } from "react";

// useSearchParams() in the config page requires a Suspense boundary
// for production builds (static prerender bail-out).
export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}

