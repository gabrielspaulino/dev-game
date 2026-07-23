import type { QuestionCandidate, UserQuestionHistoryEntry } from "./types";

export interface EligibilityConfig {
  cooldownHours: number;
  maxAttemptsBeforeCooldown: number;
}

export const DEFAULT_ELIGIBILITY_CONFIG: EligibilityConfig = {
  cooldownHours: 24,
  maxAttemptsBeforeCooldown: 3,
};

export function filterEligible(
  candidates: QuestionCandidate[],
  history: Map<string, UserQuestionHistoryEntry>,
  recentlyAnswered: Set<string>,
  now: Date,
  config: EligibilityConfig = DEFAULT_ELIGIBILITY_CONFIG,
): QuestionCandidate[] {
  return candidates.filter((candidate) => {
    if (recentlyAnswered.has(candidate.questionId)) return false;

    const entry = history.get(candidate.questionId);
    if (!entry) return true;

    if (entry.nextEligibleAt && entry.nextEligibleAt > now) return false;

    if (entry.totalAttempts >= config.maxAttemptsBeforeCooldown) {
      const cooldownMs = config.cooldownHours * 60 * 60 * 1000;
      const eligibleAfter = new Date(entry.lastAnsweredAt.getTime() + cooldownMs);
      if (now < eligibleAfter) return false;
    }

    return true;
  });
}
