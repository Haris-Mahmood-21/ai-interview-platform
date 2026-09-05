import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-secondary mb-4">404</p>
        <p className="text-foreground font-medium mb-2">Page not found</p>
        <p className="text-muted-foreground text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}