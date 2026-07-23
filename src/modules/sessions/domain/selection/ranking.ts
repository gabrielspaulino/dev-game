import type { Difficulty } from "../../../questions/domain/question";
import { difficultyToNumeric } from "../../../questions/domain/question";
import type {
  QuestionCandidate,
  UserSkillMastery,
  UserQuestionHistoryEntry,
  ScoredCandidate,
  ScoreBreakdown,
} from "./types";

export interface RankingWeights {
  difficultyMatch: number;
  recency: number;
  novelty: number;
  skillPriority: number;
  criticality: number;
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  difficultyMatch: 0.3,
  recency: 0.2,
  novelty: 0.25,
  skillPriority: 0.15,
  criticality: 0.1,
};

export function rankCandidates(
  candidates: QuestionCandidate[],
  masteries: Map<string, UserSkillMastery>,
  history: Map<string, UserQuestionHistoryEntry>,
  focusSkillIds: Set<string>,
  now: Date,
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS,
): ScoredCandidate[] {
  return candidates
    .map((candidate) => scoreCandidate(candidate, masteries, history, focusSkillIds, now, weights))
    .sort((a, b) => b.score - a.score);
}

function scoreCandidate(
  candidate: QuestionCandidate,
  masteries: Map<string, UserSkillMastery>,
  history: Map<string, UserQuestionHistoryEntry>,
  focusSkillIds: Set<string>,
  now: Date,
  weights: RankingWeights,
): ScoredCandidate {
  const mastery = masteries.get(candidate.primarySkillId);
  const entry = history.get(candidate.questionId);

  const breakdown: ScoreBreakdown = {
    difficultyMatch: scoreDifficultyMatch(candidate.difficulty, mastery),
    recency: scoreRecency(entry, now),
    novelty: scoreNovelty(entry),
    skillPriority: scoreSkillPriority(candidate, focusSkillIds),
    criticality: scoreCriticality(candidate.criticality),
  };

  const score =
    breakdown.difficultyMatch * weights.difficultyMatch +
    breakdown.recency * weights.recency +
    breakdown.novelty * weights.novelty +
    breakdown.skillPriority * weights.skillPriority +
    breakdown.criticality * weights.criticality;

  const selectionReason = determineSelectionReason(candidate, mastery, entry);

  return { candidate, score, selectionReason, breakdown };
}

function scoreDifficultyMatch(
  difficulty: Difficulty,
  mastery: UserSkillMastery | undefined,
): number {
  if (!mastery) return 0.5;

  const targetNumeric = difficultyToNumeric(mastery.targetDifficulty);
  const candidateNumeric = difficultyToNumeric(difficulty);
  const diff = Math.abs(targetNumeric - candidateNumeric);

  if (diff === 0) return 1.0;
  if (diff === 1) return 0.7;
  if (diff === 2) return 0.3;
  return 0.1;
}

function scoreRecency(entry: UserQuestionHistoryEntry | undefined, now: Date): number {
  if (!entry) return 1.0;

  const daysSince = (now.getTime() - entry.lastAnsweredAt.getTime()) / (24 * 60 * 60 * 1000);

  if (daysSince < 1) return 0.0;
  if (daysSince < 3) return 0.3;
  if (daysSince < 7) return 0.6;
  if (daysSince < 21) return 0.8;
  return 1.0;
}

function scoreNovelty(entry: UserQuestionHistoryEntry | undefined): number {
  if (!entry) return 1.0;

  if (entry.totalAttempts === 1) return 0.5;
  if (entry.totalAttempts <= 3) return 0.3;
  return 0.1;
}

function scoreSkillPriority(candidate: QuestionCandidate, focusSkillIds: Set<string>): number {
  if (focusSkillIds.size === 0) return 0.5;
  if (focusSkillIds.has(candidate.primarySkillId)) return 1.0;
  if (candidate.skillIds.some((id) => focusSkillIds.has(id))) return 0.7;
  return 0.2;
}

function scoreCriticality(criticality: "NORMAL" | "IMPORTANT" | "CRITICAL"): number {
  switch (criticality) {
    case "CRITICAL":
      return 1.0;
    case "IMPORTANT":
      return 0.7;
    case "NORMAL":
      return 0.4;
  }
}

function determineSelectionReason(
  candidate: QuestionCandidate,
  mastery: UserSkillMastery | undefined,
  entry: UserQuestionHistoryEntry | undefined,
):
  | "NEW_CONTENT"
  | "CURRENT_TOPIC"
  | "SPACED_REVIEW"
  | "WEAK_SKILL"
  | "PREREQUISITE_CHECK"
  | "CHALLENGE"
  | "FINAL_ASSESSMENT" {
  if (!entry) return "NEW_CONTENT";

  if (mastery && mastery.mastery < 30) return "WEAK_SKILL";

  if (entry.nextEligibleAt) return "SPACED_REVIEW";

  if (
    mastery &&
    difficultyToNumeric(candidate.difficulty) > difficultyToNumeric(mastery.targetDifficulty)
  ) {
    return "CHALLENGE";
  }

  return "CURRENT_TOPIC";
}
