"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CircleAlert, Lock, Mail, User } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import AuthLayout, { AuthSpinner } from "@/components/auth/AuthLayout";
import IconField from "@/components/auth/IconField";

export default function RegisterPage() {
  const router = useRouter();

  const { setAuth, isAuthenticated, _hasHydrated } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated) {
    return <AuthSpinner />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);

      const { data: tokenData } = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const { data: userData } = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      setAuth(userData, tokenData.access_token);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const pwLen = form.password.length;
  const strength = pwLen === 0 ? 0 : pwLen < 8 ? 1 : pwLen < 12 ? 2 : 3;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start preparing for your next technical interview."
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
                {typeof error === "string" ? error : "Registration failed"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <IconField
          id="name"
          label="Full name"
          icon={User}
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Muhammad Haris"
          required
        />

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

        <div>
          <IconField
            id="password"
            label="Password"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 8 characters"
            minLength={8}
            required
          />
          {/* Simple length-based strength meter */}
          <div className="mt-2 flex gap-1.5" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  strength >= i
                    ? strength === 1
                      ? "bg-danger"
                      : strength === 2
                      ? "bg-warning"
                      : "bg-success"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

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
              Creating account…
            </>
          ) : (
            <>
              Create account <ArrowRight />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}