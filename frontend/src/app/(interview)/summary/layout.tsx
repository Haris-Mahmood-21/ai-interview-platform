import { Suspense } from "react";

export default function SummaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}

