"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, Plus, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/config", label: "New Interview", icon: Plus },
];

function initials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo href={isAuthenticated ? "/dashboard" : "/home"} />

        {isAuthenticated && (
          <>
            {/* Desktop links */}
            <div className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] p-1 md:flex">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white/[0.08] ring-1 ring-white/10"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Icon className="relative size-4" />
                    <span className="relative">{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop user area */}
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-2.5">
                <div className="bg-brand-gradient grid size-8 place-items-center rounded-full text-xs font-bold text-white ring-2 ring-white/10">
                  {initials(user?.name)}
                </div>
                <div className="hidden leading-tight lg:block">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut />
              </Button>
            </div>

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </>
        )}

        {!isAuthenticated && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="gradient" asChild className="rounded-lg px-4">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isAuthenticated && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/[0.06] md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    pathname === href
                      ? "bg-white/[0.06] text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}