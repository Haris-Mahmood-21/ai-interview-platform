export interface User {
  id: number;
  name: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Question {
  id: number | string;
  type: "coding" | "theory";
  difficulty: "easy" | "medium" | "hard";
  question_text: string;
  test_cases: TestCase[] | null;
  source: string;
}

export interface TestCase {
  input: string;
  expected: string;
}

export interface InterviewPaper {
  paper_id: number;
  source: "general" | "resume";
  category: string;
  questions: Question[];
}

export interface EvaluationCriterion {
  score: number;
  explanation: string;
}

export interface TheoryEvaluation {
  correctness: EvaluationCriterion;
  clarity: EvaluationCriterion;
  depth: EvaluationCriterion;
  conceptual_understanding: EvaluationCriterion;
  total_score: number;
  overall_feedback: string;
  improvement_suggestions: string;
}

export interface TheoryEvaluationResponse {
  evaluation: TheoryEvaluation;
  needs_followup_check: boolean;
  total_score: number;
  followup_questions?: string[];
  has_followups?: boolean;
}

export interface FollowupResponse {
  followup_questions: string[];
  has_followups: boolean;
}

export interface CodeTestResult {
  test_case: number;
  passed: boolean;
  expected: string;
  actual: string;
  status: string;
  error: string;
  time: string | null;
}

export interface CodeSubmissionResponse {
  question_id: number | string;
  results: CodeTestResult[];
  score: number;
  passed_count: number;
  total_count: number;
  language?: string;
}

export interface FollowupAnswerItem {
  question: string;
  answer: string;
  evaluation?: TheoryEvaluationResponse | TheoryEvaluation | null;
}

export interface AttemptResponseItem {
  id: number;
  question_id: number | string;
  user_answer: string;
  score: number;
  type: "coding" | "theory";
  difficulty: "easy" | "medium" | "hard";
  question_text: string;
  language?: string | null;
  test_cases?: TestCase[] | null;
  code_result?: CodeSubmissionResponse | null;
  evaluation?: TheoryEvaluation | null;
  followup_answers?: FollowupAnswerItem[] | null;
}

export interface AttemptDetail {
  id: number;
  date: string;
  mode: string;
  category: string;
  total_score: number;
  coding_score: number;
  theory_score: number;
  time_taken: number;
  paper_id?: number | null;
  responses: AttemptResponseItem[];
}

export interface ResumeProfile {
  id: number;
  user_id: number;
  extracted_skills: string[];
  extracted_projects: { title: string; description: string }[];
}