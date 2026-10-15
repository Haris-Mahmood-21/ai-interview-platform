"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import AppShell, { PageHeader } from "@/components/layout/AppShell";
import AIThinking from "@/components/interview/AIThinking";
import api from "@/lib/api";
import { useInterviewStore } from "@/store/interviewStore";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  CircleAlert,
  CloudUpload,
  FileText,
  Library,
  RotateCcw,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { DOMAINS, getDomain } from "@/lib/domains";
import { cn } from "@/lib/utils";

const CATEGORIES = DOMAINS;

const MODES = [
  {
    id: "general",
    label: "General Mode",
    desc: "Questions from our curated question bank",
    icon: Library,
  },
  {
    id: "resume",
    label: "Resume Mode",
    desc: "Personalised questions based on your CV",
    icon: FileText,
    badge: "AI",
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

function SectionTitle({ step, title, hint }: { step: number; title: string; hint?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="bg-brand-gradient grid size-7 place-items-center rounded-full text-xs font-bold text-white">
          {step}
        </span>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {hint}
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative w-full rounded-2xl border p-5 text-left transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
        selected
          ? "border-primary/60 bg-primary/[0.09] shadow-[0_0_0_1px_var(--primary),0_12px_40px_-12px_var(--primary)]"
          : "border-white/[0.07] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]",
        className
      )}
    >
      <span
        className={cn(
          "absolute right-4 top-4 grid size-5 place-items-center rounded-full border transition-colors duration-150",
          selected
            ? "border-transparent bg-primary text-white"
            : "border-white/15 text-transparent"
        )}
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
      {children}
    </button>
  );
}

export default function ConfigPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setPaper = useInterviewStore((s) => s.setPaper);

  const paramCategory = searchParams.get("category");
  const [category, setCategory] = useState<string>(() => {
    return paramCategory && CATEGORIES.find((c) => c.id === paramCategory)
      ? paramCategory
      : "";
  });
  const [prevParamCat, setPrevParamCat] = useState(paramCategory);

  if (paramCategory !== prevParamCat) {
    setPrevParamCat(paramCategory);
    if (paramCategory && CATEGORIES.find((c) => c.id === paramCategory)) {
      setCategory(paramCategory);
    }
  }

  const [mode, setMode] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadedSkills, setUploadedSkills] = useState<string[]>([]);
  const [autoDetected, setAutoDetected] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (file.type && file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setUploading(true);
    setError("");
    setFileName(file.name);

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
      setFileName("");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const resetUpload = () => {
    setUploadDone(false);
    setUploadedSkills([]);
    setFileName("");
    if (autoDetected) {
      setCategory("");
      setAutoDetected(false);
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
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Failed to generate interview. Please try again."
        );
      } else {
        setError("Failed to generate interview. Please try again.");
      }
      setLoading(false);
    }
  };

  const canStart =
    !loading &&
    !(mode === "general" && !category) &&
    !(mode === "resume" && !uploadDone);

  const selectedDomain = category ? getDomain(category) : null;
  const selectedMode = MODES.find((m) => m.id === mode)!;

  return (
    <AppShell>
      <PageHeader
        eyebrow="New interview"
        title="Configure your interview"
        description="Pick an interview mode and a domain. The AI will generate a mixed set of theory and coding questions for you."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* ── LEFT: steps ── */}
        <div className="space-y-10">
          {/* Step 1: Mode */}
          <section>
            <SectionTitle step={1} title="Interview mode" />
            <div className="grid gap-4 sm:grid-cols-2">
              {MODES.map((m) => (
                <SelectCard
                  key={m.id}
                  selected={mode === m.id}
                  onClick={() => {
                    setMode(m.id);
                    if (m.id === "general") setAutoDetected(false);
                  }}
                >
                  <span
                    className={cn(
                      "mb-4 grid size-11 place-items-center rounded-xl transition-colors",
                      mode === m.id ? "bg-brand-gradient text-white" : "bg-white/5 text-muted-foreground"
                    )}
                  >
                    <m.icon className="size-5" />
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-display text-base font-semibold text-foreground">
                      {m.label}
                    </span>
                    {m.badge && (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-primary">
                        {m.badge}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{m.desc}</span>
                </SelectCard>
              ))}
            </div>
          </section>

          {/* Resume upload */}
          <AnimatePresence initial={false}>
            {mode === "resume" && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <SectionTitle step={2} title="Upload your resume" />

                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleUpload}
                />

                {!uploadDone ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => !uploading && fileRef.current?.click()}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !uploading) {
                        e.preventDefault();
                        fileRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
                      dragging
                        ? "border-primary bg-primary/10"
                        : "border-white/12 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.04]"
                    )}
                  >
                    {uploading ? (
                      <>
                        <div className="relative mb-4 grid size-14 place-items-center">
                          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/40" />
                          <span className="bg-brand-gradient relative grid size-14 place-items-center rounded-full">
                            <WandSparkles className="size-6 text-white" />
                          </span>
                        </div>
                        <p className="font-medium text-foreground">Analysing {fileName}…</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Extracting skills and projects with AI
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-white/5">
                          <CloudUpload className="size-6 text-primary" />
                        </span>
                        <p className="font-medium text-foreground">
                          Drop your resume here or{" "}
                          <span className="text-primary underline underline-offset-4">browse</span>
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">PDF only · max 5 MB</p>
                      </>
                    )}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border border-success/25 bg-success/[0.06] p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-success/15">
                        <FileText className="size-5 text-success" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {fileName || "Resume uploaded"}
                        </p>
                        <p className="text-xs text-success">
                          Parsed successfully · {uploadedSkills.length} skills detected
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetUpload}
                        className="text-muted-foreground"
                      >
                        <RotateCcw /> Replace
                      </Button>
                    </div>

                    {uploadedSkills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {uploadedSkills.slice(0, 18).map((s, i) => (
                          <motion.span
                            key={s}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-secondary-foreground"
                          >
                            {s}
                          </motion.span>
                        ))}
                        {uploadedSkills.length > 18 && (
                          <span className="px-2 py-1 text-xs text-muted-foreground">
                            +{uploadedSkills.length - 18} more
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                <AnimatePresence>
                  {autoDetected && category && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-sm text-primary"
                    >
                      <Sparkles className="size-4 shrink-0" />
                      Domain auto-selected from your resume skills. You can change it below.
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Domain */}
          <section>
            <SectionTitle
              step={mode === "resume" ? 3 : 2}
              title={mode === "resume" ? "Domain focus (optional)" : "Choose a domain"}
              hint={
                mode === "resume" &&
                category && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCategory("");
                      setAutoDetected(false);
                    }}
                    className="text-muted-foreground hover:text-danger"
                  >
                    <X /> Clear
                  </Button>
                )
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {CATEGORIES.map((cat) => (
                <SelectCard
                  key={cat.id}
                  selected={category === cat.id}
                  onClick={() => {
                    if (mode === "resume" && category === cat.id) {
                      setCategory("");
                    } else {
                      setCategory(cat.id);
                    }
                    setAutoDetected(false);
                  }}
                >
                  <div className="flex items-start gap-4 pr-6">
                    <span
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br shadow-lg",
                        cat.tile
                      )}
                    >
                      <cat.icon className="size-6 text-white" />
                    </span>
                    <span>
                      <span className="block font-display text-base font-semibold text-foreground">
                        {cat.label}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">{cat.desc}</span>
                    </span>
                  </div>
                </SelectCard>
              ))}
            </div>

            {mode === "resume" && (
              <p className="mt-3 text-sm text-muted-foreground">
                {category
                  ? "You selected a domain. Gemini will focus the questions on it."
                  : "No domain selected. Gemini will pick the best one from your resume."}
              </p>
            )}
          </section>
        </div>

        {/* ── RIGHT: summary ── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Summary
            </p>

            <dl className="mt-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-white/5">
                  <selectedMode.icon className="size-5 text-primary" />
                </span>
                <div>
                  <dt className="text-xs text-muted-foreground">Mode</dt>
                  <dd className="text-sm font-semibold text-foreground">{selectedMode.label}</dd>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {selectedDomain ? (
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-xl bg-gradient-to-br",
                      selectedDomain.tile
                    )}
                  >
                    <selectedDomain.icon className="size-5 text-white" />
                  </span>
                ) : (
                  <span className="grid size-10 place-items-center rounded-xl border border-dashed border-white/15 text-muted-foreground">
                    ?
                  </span>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground">Domain</dt>
                  <dd className="text-sm font-semibold text-foreground">
                    {selectedDomain
                      ? selectedDomain.label
                      : mode === "resume"
                      ? "Auto (from resume)"
                      : "Not selected"}
                  </dd>
                </div>
              </div>

              {mode === "resume" && (
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-xl",
                      uploadDone ? "bg-success/15 text-success" : "bg-white/5 text-muted-foreground"
                    )}
                  >
                    {uploadDone ? <Check className="size-5" /> : <FileText className="size-5" />}
                  </span>
                  <div>
                    <dt className="text-xs text-muted-foreground">Resume</dt>
                    <dd className="text-sm font-semibold text-foreground">
                      {uploadDone ? "Uploaded" : "Required"}
                    </dd>
                  </div>
                </div>
              )}
            </dl>

            <div className="my-6 h-px bg-white/[0.06]" />

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" /> Theory + coding questions
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" /> Instant AI feedback
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" /> Adaptive follow-ups
              </li>
            </ul>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/10 px-3.5 py-3 text-sm text-danger"
                  >
                    <CircleAlert className="mt-0.5 size-4 shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="gradient"
              size="xl"
              className="mt-6 w-full"
              onClick={handleStart}
              disabled={!canStart}
            >
              Start interview <ArrowRight />
            </Button>

            {mode === "resume" && !uploadDone && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Upload your resume to enable resume mode
              </p>
            )}
            {mode === "general" && !category && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Select a domain to continue
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Full-screen generation overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md"
            >
              <AIThinking variant="generate" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}