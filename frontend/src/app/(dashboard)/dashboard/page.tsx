"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for client-side hydration before checking auth
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white">
            Welcome back{user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Ready to practice? Start a new interview session below.
          </p>
        </div>

        {/* Quick start card */}
        <div className="bg-indigo-950 border border-indigo-800 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">
                Start a new interview
              </h2>
              <p className="text-indigo-300 text-sm">
                Choose your domain and practice with AI-powered feedback
              </p>
            </div>
            <Link
              href="/config"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              Start Interview →
            </Link>
          </div>
        </div>

        {/* Domain cards */}
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
          Available Domains
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-10">
          {[
            { id: "dsa", icon: "🧮", label: "Data Structures & Algorithms", desc: "Arrays, trees, graphs, DP" },
            { id: "os", icon: "⚙️", label: "Operating Systems", desc: "Processes, memory, scheduling" },
            { id: "ml", icon: "🤖", label: "Machine Learning", desc: "Models, evaluation, neural nets" },
            { id: "web", icon: "🌐", label: "Web Development", desc: "HTTP, auth, databases, React" },
          ].map((domain) => (
            <Link
              key={domain.id}
              href={`/config?category=${domain.id}`}
              className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 transition-colors"
            >
              <div className="text-2xl mb-3">{domain.icon}</div>
              <div className="text-sm font-medium text-white mb-1">{domain.label}</div>
              <div className="text-xs text-gray-500">{domain.desc}</div>
            </Link>
          ))}
        </div>

        {/* Placeholder for future analytics */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-white font-medium mb-1">Performance Dashboard</h3>
          <p className="text-gray-500 text-sm">
            Complete your first interview to see your scores and progress here.
          </p>
        </div>

      </div>
    </div>
  );
}