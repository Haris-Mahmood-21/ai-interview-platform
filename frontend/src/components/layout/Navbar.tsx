"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="border-b border-gray-800 bg-gray-900 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-white font-semibold text-sm">InterviewAI</span>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
              Dashboard
            </Link>
            <Link href="/config" className="text-gray-400 hover:text-white text-sm">
              New Interview
            </Link>
            <span className="text-gray-300 text-sm">{user?.name}</span>
            <button onClick={handleLogout} className="text-gray-500 hover:text-white text-sm">
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}