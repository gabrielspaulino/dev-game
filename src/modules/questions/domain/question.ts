export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "EXPERT"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_NUMERIC: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  EXPERT: 4,
};

export const REASONING_LEVELS = ["RECOGNIZE", "APPLY", "ANALYZE", "COMBINE"] as const;
export type ReasoningLevel = (typeof REASONING_LEVELS)[number];

export const QUESTION_TYPES = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "CODE_OUTPUT",
  "BUG_IDENTIFICATION",
  "ORDERING",
  "CODE_COMPLETION",
  "ARCHITECTURE_SCENARIO",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_STATUSES = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export const CRITICALITIES = ["NORMAL", "IMPORTANT", "CRITICAL"] as const;
export type Criticality = (typeof CRITICALITIES)[number];

export const SKILL_ROLES = ["PRIMARY", "SECONDARY", "CONTEXT"] as const;
export type SkillRole = (typeof SKILL_ROLES)[number];

export const SELECTION_REASONS = [
  "NEW_CONTENT",
  "CURRENT_TOPIC",
  "SPACED_REVIEW",
  "WEAK_SKILL",
  "PREREQUISITE_CHECK",
  "CHALLENGE",
  "FINAL_ASSESSMENT",
] as const;
export type SelectionReason = (typeof SELECTION_REASONS)[number];

export interface QuestionOption {
  id: string;
  optionKey: string;
  content: string;
  displayOrder: number;
  explanation?: string;
}

export interface OrderingItem {
  id: string;
  text: string;
  correctPosition: number;
}

export interface Skill {
  id: string;
  parentSkillId: string | null;
  code: string;
  name: string;
  description: string | null;
  category: string;
  isActive: boolean;
}

export interface QuestionVersion {
  id: string;
  questionId: string;
  versionNumber: number;
  title: string | null;
  prompt: string;
  content: Record<string, unknown>;
  correctAnswer: unknown;
  generalExplanation: string;
  practicalContext: string | null;
}

export interface Question {
  id: string;
  slug: string;
  type: QuestionType;
  prompt: string;
  code?: string;
  explanation: string;
  difficulty: Difficulty;
  reasoningLevel: ReasoningLevel;
  status: QuestionStatus;
  criticality: Criticality;
  primarySkillId: string;
  skillIds: string[];
  options?: QuestionOption[];
  orderingItems?: OrderingItem[];
  isMandatory: boolean;
  currentVersionNumber: number;
  estimatedTimeSeconds?: number;
}

export function getCorrectOptionIds(question: Question): string[] {
  return (question.options ?? []).filter((o) => o.optionKey === "correct").map((o) => o.id);
}

export function isDifficultQuestion(question: Question): boolean {
  return question.difficulty === "HARD" || question.difficulty === "EXPERT";
}

export function difficultyToNumeric(difficulty: Difficulty): number {
  return DIFFICULTY_NUMERIC[difficulty];
}

export function numericToDifficulty(value: number): Difficulty {
  if (value <= 1) return "EASY";
  if (value <= 2) return "MEDIUM";
  if (value <= 3) return "HARD";
  return "EXPERT";
}
