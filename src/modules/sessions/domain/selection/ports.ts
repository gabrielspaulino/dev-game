import type { Difficulty, SelectionReason } from "../../../questions/domain/question";
import type { QuestionCandidate, UserSkillMastery, UserQuestionHistoryEntry } from "./types";

export interface QuestionCandidateRepository {
  findPublishedBySkills(skillIds: string[], languageCode: string): Promise<QuestionCandidate[]>;
  findPublishedByLesson(lessonId: string): Promise<QuestionCandidate[]>;
  findPublishedForReview(userId: string, beforeDate: Date): Promise<QuestionCandidate[]>;
}

export interface UserMasteryRepository {
  getSkillMasteries(userId: string, skillIds: string[]): Promise<UserSkillMastery[]>;
}

export interface UserHistoryRepository {
  getQuestionHistory(
    userId: string,
    questionIds: string[],
  ): Promise<Map<string, UserQuestionHistoryEntry>>;
  getRecentlyAnsweredQuestionIds(userId: string, withinHours: number): Promise<Set<string>>;
}

export interface SessionPersistencePort {
  createSession(params: {
    userId: string;
    sessionType: string;
    lessonId?: string;
    sessionDate: string;
    questionCount: number;
    planConfig: Record<string, unknown>;
    questions: Array<{
      questionId: string;
      questionVersionId: string;
      position: number;
      selectionReason: SelectionReason;
      targetSkillId: string;
      assignedDifficulty: Difficulty;
      masteryBefore: number;
      selectionScore: number;
      selectionMetadata: Record<string, unknown>;
    }>;
  }): Promise<string>;
}
