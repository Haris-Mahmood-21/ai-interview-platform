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
  followupAnswers?: { question: string; answer: string; evaluation?: TheoryEvaluationResponse }[];
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

  setPaper: (paperId: number, category: string, mode: string, questions: Question[]) => void;
  setResult: (index: number, result: Partial<QuestionResult>) => void;
  nextQuestion: () => void;
  completeInterview: () => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  paperId: null,
  category: "",
  mode: "",
  questions: [],
  currentIndex: 0,
  results: [],
  isComplete: false,

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
    }),

  setResult: (index, result) =>
    set((state) => {
      const results = [...state.results];
      results[index] = { ...results[index], ...result };
      return { results };
    }),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
    })),

  completeInterview: () => set({ isComplete: true }),

  reset: () =>
    set({
      paperId: null,
      category: "",
      mode: "",
      questions: [],
      currentIndex: 0,
      results: [],
      isComplete: false,
    }),
}));