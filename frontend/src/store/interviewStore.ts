import { create } from "zustand";
import {
  Question,
  TheoryEvaluationResponse,
  CodeSubmissionResponse,
} from "@/types/api.types";

export interface QuestionResult {
  question: Question;
  type: "coding" | "theory";
  answer: string;
  evaluation?: TheoryEvaluationResponse;
  codeResult?: CodeSubmissionResponse;
  followupAnswers?: {
    question: string;
    answer: string;
    evaluation?: TheoryEvaluationResponse;
  }[];
  score: number;
  completed: boolean;
}

interface InterviewState {
  paperId: number | null;
  category: string;
  mode: string;
  questions: Question[];
  currentIndex: number;
  results: QuestionResult[];
  isComplete: boolean;
  startTime: number | null;
  savedAttemptId: number | null;

  setPaper: (
    paperId: number,
    category: string,
    mode: string,
    questions: Question[]
  ) => void;
  setResult: (index: number, result: Partial<QuestionResult>) => void;
  nextQuestion: () => void;
  completeInterview: () => void;
  setSavedAttemptId: (id: number) => void;
  reset: () => void;

  // Computed helpers
  getAverageCodingScore: () => number;
  getAverageTheoryScore: () => number;
  getElapsedSeconds: () => number;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  paperId: null,
  category: "",
  mode: "",
  questions: [],
  currentIndex: 0,
  results: [],
  isComplete: false,
  startTime: null,
  savedAttemptId: null,

  setPaper: (paperId, category, mode, questions) =>
    set({
      paperId,
      category,
      mode,
      questions,
      currentIndex: 0,
      results: questions.map((q) => ({
        question: q,
        type: q.type,
        answer: "",
        score: 0,
        completed: false,
        followupAnswers: [],
      })),
      isComplete: false,
      startTime: Date.now(),
      savedAttemptId: null,
    }),

  setResult: (index, result) =>
    set((state) => {
      const results = [...state.results];
      results[index] = { ...results[index], ...result };
      return { results };
    }),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(
        state.currentIndex + 1,
        state.questions.length - 1
      ),
    })),

  completeInterview: () => set({ isComplete: true }),

  setSavedAttemptId: (id) => set({ savedAttemptId: id }),

  reset: () =>
    set({
      paperId: null,
      category: "",
      mode: "",
      questions: [],
      currentIndex: 0,
      results: [],
      isComplete: false,
      startTime: null,
      savedAttemptId: null,
    }),

  getAverageCodingScore: () => {
    const { results } = get();
    const coding = results.filter(
      (r) => r.type === "coding" && r.completed
    );
    if (!coding.length) return 0;
    return coding.reduce((sum, r) => sum + r.score, 0) / coding.length;
  },

  getAverageTheoryScore: () => {
    const { results } = get();
    const theory = results.filter(
      (r) => r.type === "theory" && r.completed
    );
    if (!theory.length) return 0;
    return theory.reduce((sum, r) => sum + r.score, 0) / theory.length;
  },

  getElapsedSeconds: () => {
    const { startTime } = get();
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  },
}));