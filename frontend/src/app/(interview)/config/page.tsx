"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import api from "@/lib/api";
import { useInterviewStore } from "@/store/interviewStore";
import { useSearchParams } from "next/navigation";

const CATEGORIES = [
  { id: "dsa", label: "Data Structures & Algorithms", icon: "🧠", desc: "Arrays, trees, graphs, sorting, DP" },
  { id: "os", label: "Operating Systems", icon: "⚙️", desc: "Processes, memory, scheduling, deadlocks" },
  { id: "ml", label: "Machine Learning", icon: "🤖", desc: "Supervised learning, neural networks, evaluation" },
  { id: "web", label: "Web Development", icon: "🌐", desc: "HTTP, databases, auth, React, system design" },
];

const MODES = [
  { id: "general", label: "General Mode", desc: "Questions from our curated question bank", icon: "📚" },
  { id: "resume", label: "Resume Mode", desc: "Personalized questions based on your CV", icon: "📄" },
];

export default function ConfigPage() {
  const router = useRouter();
  const setPaper = useInterviewStore((s) => s.setPaper);
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadedSkills, setUploadedSkills] = useState<string[]>([]);
  
  const searchParams = useSearchParams();

useEffect(() => {
  const cat = searchParams.get("category");
  if (cat && ["dsa", "os", "ml", "web"].includes(cat)) {
    setCategory(cat);
  }
}, [searchParams]);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/resume/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedSkills(data.extracted_skills || []);
      setUploadDone(true);
    } catch {
      setError("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleStart = async () => {
    if (!category) { setError("Please select a domain."); return; }
    if (mode === "resume" && !uploadDone) { setError("Please upload your resume for resume mode."); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/questions/generate", { category, mode });
      setPaper(data.paper_id, data.category, mode, data.questions);
      router.push("/session");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate interview. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white">Configure your interview</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Choose your domain and interview mode to get started
          </p>
        </div>

        {/* Domain selection */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
            Select Domain
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  category === cat.id
                    ? "border-indigo-500 bg-indigo-950"
                    : "border-gray-800 bg-gray-900 hover:border-gray-600"
                }`}
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="text-sm font-medium text-white">{cat.label}</div>
                <div className="text-xs text-gray-500 mt-1">{cat.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode selection */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
            Interview Mode
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
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

        {/* Resume upload — shown only in resume mode */}
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
                <p className="text-gray-400 text-sm">Parsing resume...</p>
              ) : uploadDone ? (
                <div>
                  <p className="text-green-400 text-sm font-medium mb-3">
                    ✓ Resume uploaded successfully
                  </p>
                  {uploadedSkills.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs mb-2">Detected skills:</p>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {uploadedSkills.slice(0, 12).map((s) => (
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
                  <p className="text-gray-600 text-xs mt-1">Max 5MB</p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={loading || !category}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm transition-colors"
        >
          {loading ? "Generating your interview paper..." : "Start Interview →"}
        </button>
      </div>
    </div>
  );
}