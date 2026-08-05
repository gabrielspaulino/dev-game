export type QuestionType = "multiple-choice" | "true-false" | "typing";

interface BaseQuestion {
  id: string;
  prompt: string;
  code?: string;
  explanation: string;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice" | "true-false";
  options: string[];
  correctIndex: number;
}

interface TypingQuestion extends BaseQuestion {
  type: "typing";
  acceptedAnswers: string[];
}

export type Question = MultipleChoiceQuestion | TypingQuestion;

export interface Lesson {
  id: string;
  title: string;
  icon: string;
  xpReward: number;
  questions: Question[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string; // Tailwind color name, e.g. "amber"
  bgClass: string; // e.g. "bg-amber-500"
  borderClass: string; // e.g. "border-amber-500"
  textClass: string; // e.g. "text-amber-400"
  lessons: Lesson[];
}

export type DifficultyTier = "EASY" | "MEDIUM" | "HARD";

export const DIFFICULTY_LABELS: Record<DifficultyTier, string> = {
  EASY: "Foundations",
  MEDIUM: "Intermediate",
  HARD: "Advanced",
};

export interface TierStats {
  answered: number;
  correct: number;
}

export type CategoryDifficultyStats = Record<DifficultyTier, TierStats>;

export interface UserProgress {
  xp: number;
  streak: number;
  hearts: number;
  lastPlayedDate: string | null;
  completedLessons: Record<string, true>;
  selectedTopicId: string | null;
  dailyQuizCompletedDate: string | null;
  answeredSlugs: Record<string, string[]>;
  quizzesCompletedToday: number;
  questionsAnsweredToday: number;
  difficultyStats: Record<string, CategoryDifficultyStats>;
  slotProgress: Record<string, number>;
  activityDates: string[];
}

export type AnswerState = "unanswered" | "checking" | "correct" | "incorrect";
