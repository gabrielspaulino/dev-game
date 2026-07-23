import type { ScoredCandidate, SelectedQuestion } from "./types";

export interface DiversityConfig {
  maxSameSkill: number;
  maxSameDifficulty: number;
  maxSameType: number;
}

export const DEFAULT_DIVERSITY_CONFIG: DiversityConfig = {
  maxSameSkill: 3,
  maxSameDifficulty: 4,
  maxSameType: 3,
};

export function selectDiverse(
  rankedCandidates: ScoredCandidate[],
  targetCount: number,
  masteries: Map<string, { mastery: number }>,
  config: DiversityConfig = DEFAULT_DIVERSITY_CONFIG,
): SelectedQuestion[] {
  const selected: SelectedQuestion[] = [];
  const skillCounts = new Map<string, number>();
  const difficultyCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();

  for (const scored of rankedCandidates) {
    if (selected.length >= targetCount) break;

    const { candidate, score, selectionReason } = scored;

    const skillCount = skillCounts.get(candidate.primarySkillId) ?? 0;
    if (skillCount >= config.maxSameSkill) continue;

    const diffCount = difficultyCounts.get(candidate.difficulty) ?? 0;
    if (diffCount >= config.maxSameDifficulty) continue;

    const typeCount = typeCounts.get(candidate.questionType) ?? 0;
    if (typeCount >= config.maxSameType) continue;

    const mastery = masteries.get(candidate.primarySkillId);

    selected.push({
      questionId: candidate.questionId,
      questionVersionId: candidate.questionVersionId,
      position: selected.length + 1,
      selectionReason,
      targetSkillId: candidate.primarySkillId,
      assignedDifficulty: candidate.difficulty,
      masteryBefore: mastery?.mastery ?? 0,
      selectionScore: Math.round(score * 10000) / 10000,
      selectionMetadata: {
        breakdown: scored.breakdown,
      },
    });

    skillCounts.set(candidate.primarySkillId, skillCount + 1);
    difficultyCounts.set(candidate.difficulty, diffCount + 1);
    typeCounts.set(candidate.questionType, typeCount + 1);
  }

  return selected;
}
