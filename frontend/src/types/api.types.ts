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
  followup_questions: string[];
  has_followups: boolean;
  total_score: number;
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
  question_id: number;
  results: CodeTestResult[];
  score: number;
  passed_count: number;
  total_count: number;
}

export interface ResumeProfile {
  id: number;
  user_id: number;
  extracted_skills: string[];
  extracted_projects: { title: string; description: string }[];
}