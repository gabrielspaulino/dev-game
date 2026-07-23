import type { Difficulty, SelectionReason, QuestionType } from "../../../questions/domain/question";

export interface SessionPlan {
  sessionType: "daily" | "lesson" | "review" | "challenge" | "final_assessment";
  userId: string;
  targetQuestionCount: number;
  lessonId?: string;
  skillFocus?: string[];
  mix: SessionMix;
}

export interface SessionMix {
  review: number;
  currentLevel: number;
  newContent: number;
  challenge: number;
}

export interface QuestionCandidate {
  questionId: string;
  questionVersionId: string;
  primarySkillId: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  criticality: "NORMAL" | "IMPORTANT" | "CRITICAL";
  estimatedTimeSeconds: number | null;
  skillIds: string[];
}

export interface UserSkillMastery {
  skillId: string;
  mastery: number;
  targetDifficulty: Difficulty;
}

export interface UserQuestionHistoryEntry {
  questionId: string;
  lastAnsweredAt: Date;
  totalAttempts: number;
  correctCount: number;
  lastResult: boolean;
  nextEligibleAt: Date | null;
}

export interface ScoredCandidate {
  candidate: QuestionCandidate;
  score: number;
  selectionReason: SelectionReason;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  difficultyMatch: number;
  recency: number;
  novelty: number;
  skillPriority: number;
  criticality: number;
}

export interface SelectedQuestion {
  questionId: string;
  questionVersionId: string;
  position: number;
  selectionReason: SelectionReason;
  targetSkillId: string;
  assignedDifficulty: Difficulty;
  masteryBefore: number;
  selectionScore: number;
  selectionMetadata: Record<string, unknown>;
}
