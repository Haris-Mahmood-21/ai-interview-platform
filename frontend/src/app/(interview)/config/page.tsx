"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import api from "@/lib/api";
import { useInterviewStore } from "@/store/interviewStore";

const CATEGORIES = [
  {
    id: "dsa",
    label: "Data Structures & Algorithms",
    icon: "🧠",
    desc: "Arrays, trees, graphs, sorting, DP",
  },
  {
    id: "oop",
    label: "Object-Oriented Programming",
    icon: "🧩",
    desc: "Classes, inheritance, SOLID, design patterns",
  },
  {
    id: "ml",
    label: "Machine Learning",
    icon: "🤖",
    desc: "Supervised learning, neural networks, evaluation",
  },
  {
    id: "react",
    label: "React & Frontend",
    icon: "⚛️",
    desc: "Hooks, state management, Next.js, performance",
  },
];

const MODES = [
  {
    id: "general",
    label: "General Mode",
    desc: "Questions from our curated question bank",
    icon: "📚",
  },
  {
    id: "resume",
    label: "Resume Mode",
    desc: "Personalized questions based on your CV",
    icon: "📄",
  },
];

const SKILL_DOMAIN_MAP: Record<string, string> = {
  react: "react",
  nextjs: "react",
  "next.js": "react",
  typescript: "react",
  javascript: "react",
  tailwind: "react",
  redux: "react",
  vue: "react",
  angular: "react",
  css: "react",
  html: "react",
  frontend: "react",

  pytorch: "ml",
  tensorflow: "ml",
  "scikit-learn": "ml",
  pandas: "ml",
  numpy: "ml",
  "machine learning": "ml",
  ml: "ml",
  "deep learning": "ml",

  java: "oop",
  "c++": "oop",
  "c#": "oop",
  kotlin: "oop",
  swift: "oop",

  algorithms: "dsa",
  "data structures": "dsa",
};

function detectDomainFromSkills(skills: string[]): string | null {
  const counts: Record<string, number> = {};

  for (const skill of skills) {
    const domain = SKILL_DOMAIN_MAP[skill.toLowerCase()];
    if (domain) {
      counts[domain] = (counts[domain] || 0) + 1;
    }
  }

  if (!Object.keys(counts).length) return null;

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export default function ConfigPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setPaper = useInterviewStore((s) => s.setPaper);

  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadedSkills, setUploadedSkills] = useState<string[]>([]);
  const [autoDetected, setAutoDetected] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cat = searchParams.get("category");

    if (cat && CATEGORIES.find((c) => c.id === cat)) {
      setCategory(cat);
    }
  }, [searchParams]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const { data } = await api.post("/resume/upload", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const skills: string[] = data.extracted_skills || [];

      setUploadedSkills(skills);
      setUploadDone(true);

      const detected = detectDomainFromSkills(skills);

      if (detected && !category) {
        setCategory(detected);
        setAutoDetected(true);
      }
    } catch {
      setError("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleStart = async () => {
    if (mode === "general" && !category) {
      setError("Please select a domain for general mode.");
      return;
    }

    if (mode === "resume" && !uploadDone) {
      setError("Please upload your resume first.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/questions/generate", {
        category: category || undefined,
        mode,
      });

      setPaper(data.paper_id, data.category, mode, data.questions);
      router.push("/session");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to generate interview. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white">
            Configure your interview
          </h1>

          <p className="text-gray-400 mt-1 text-sm">
            Choose your domain and interview mode to get started
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
            Interview Mode
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);

                  if (m.id === "general") {
                    setAutoDetected(false);
                  }
                }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  mode === m.id
                    ? "border-indigo-500 bg-indigo-950"
                    : "border-gray-800 bg-gray-900 hover:border-gray-600"
                }`}
              >
                <div className="text-2xl mb-2">{m.icon}</div>
                <div className="text-sm font-medium text-white">{m.label}</div>
                <div className="text-xs text-gray-500 mt-1">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {mode === "resume" && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
              Upload Resume
            </h2>

            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                uploadDone
                  ? "border-green-600 bg-green-950"
                  : "border-gray-700 bg-gray-900 hover:border-gray-500"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleUpload}
              />

              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400 text-sm">Parsing resume...</p>
                </div>
              ) : uploadDone ? (
                <div>
                  <p className="text-green-400 text-sm font-medium mb-3">
                    ✓ Resume uploaded successfully
                  </p>

                  {uploadedSkills.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs mb-2">
                        Detected {uploadedSkills.length} skills:
                      </p>

                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {uploadedSkills.slice(0, 14).map((s) => (
                          <span
                            key={s}
                            className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 text-sm">
                    Drop your PDF resume here or click to browse
                  </p>

                  <p className="text-gray-600 text-xs mt-1">
                    Max 5MB · PDF only
                  </p>
                </div>
              )}
            </div>

            {autoDetected && category && (
              <div className="mt-3 flex items-center gap-2 text-xs text-indigo-400 bg-indigo-950 border border-indigo-900 rounded-lg px-3 py-2">
                <span>✨</span>
                <span>
                  Domain auto-selected based on your resume skills. You can
                  change it below.
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
            {mode === "resume"
              ? "Domain Override (optional)"
              : "Select Domain"}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setAutoDetected(false);
                }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  category === cat.id
                    ? "border-indigo-500 bg-indigo-950"
                    : "border-gray-800 bg-gray-900 hover:border-gray-600"
                }`}
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="text-sm font-medium text-white">
                  {cat.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{cat.desc}</div>
              </button>
            ))}
          </div>

          {mode === "resume" && (
            <p className="text-xs text-gray-600 mt-2">
              {category
                ? "You selected a domain. Gemini will focus questions here."
                : "No domain selected — Gemini will pick the best one from your resume."}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={
            loading ||
            (mode === "general" && !category) ||
            (mode === "resume" && !uploadDone)
          }
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>

              {mode === "resume" && !category
                ? "Analyzing resume and generating interview..."
                : "Generating your personalized interview..."}
            </span>
          ) : (
            "Start Interview →"
          )}
        </button>

        {mode === "resume" && !uploadDone && (
          <p className="text-center text-xs text-gray-600 mt-3">
            Upload your resume to enable resume mode
          </p>
        )}
      </div>
    </div>
  );
}