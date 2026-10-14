"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CircleAlert, Lock, Mail } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import AuthLayout, { AuthSpinner } from "@/components/auth/AuthLayout";
import IconField from "@/components/auth/IconField";

export default function LoginPage() {
  const router = useRouter();

  const {
    setAuth,
    isAuthenticated,
    _hasHydrated,
    logout,
  } = useAuthStore();

  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear stale auth state if token missing
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token && isAuthenticated) {
      logout();
    }

    setMounted(true);
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data: tokenData } = await api.post("/auth/login", form);

      const { data: userData } = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      setAuth(userData, tokenData.access_token);

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  // Wait for hydration + mount
  if (!_hasHydrated || !mounted) {
    return <AuthSpinner />;
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your interview preparation."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger"
              >
                <CircleAlert className="size-4 shrink-0" />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <IconField
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          required
        />

        <IconField
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          required
        />

        <Button
          type="submit"
          variant="gradient"
          size="xl"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}