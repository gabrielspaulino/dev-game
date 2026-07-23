export type QuestionType = "multiple-choice" | "true-false";

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  code?: string; // optional code snippet
  options: string[];
  correctIndex: number;
  explanation: string;
}

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

export interface UserProgress {
  xp: number;
  streak: number;
  hearts: number;
  lastPlayedDate: string | null;
  completedLessons: Record<string, true>; // lessonId → true
  selectedTopicId: string | null; // e.g. "systems-design", "java", "javascript"
  dailyQuizCompletedDate: string | null; // "YYYY-MM-DD" when daily quiz was completed
}

export type AnswerState = "unanswered" | "correct" | "incorrect";
