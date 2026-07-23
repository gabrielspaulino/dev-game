export const QUESTION_TYPES = [
  "multiple-choice",
  "multiple-correct",
  "code-output",
  "bug-identification",
  "architecture-scenario",
  "ordering",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const DIFFICULTY_MIN = 1;
export const DIFFICULTY_MAX = 5;
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface OrderingItem {
  id: string;
  text: string;
  correctPosition: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  code?: string;
  explanation: string;
  difficulty: Difficulty;
  skillIds: string[];
  options?: QuestionOption[];
  orderingItems?: OrderingItem[];
  isMandatory: boolean;
}

export function getCorrectOptionIds(question: Question): string[] {
  return (question.options ?? []).filter((o) => o.isCorrect).map((o) => o.id);
}

export function isDifficultQuestion(question: Question): boolean {
  return question.difficulty >= 4;
}
