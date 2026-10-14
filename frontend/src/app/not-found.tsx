import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AmbientBackground from "@/components/layout/AmbientBackground";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="relative isolate grid min-h-screen place-items-center px-4">
      <AmbientBackground />
      <div className="text-center">
        <LogoMark className="mx-auto mb-6 size-14" />
        <p className="text-gradient font-display text-8xl font-extrabold tracking-tighter">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="gradient" size="xl" asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button variant="outline" size="xl" asChild className="border-white/10">
            <Link href="/home">
              <ArrowLeft /> Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}