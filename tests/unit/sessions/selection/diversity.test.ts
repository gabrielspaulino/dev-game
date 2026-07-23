import { describe, it, expect } from "vitest";
import { selectDiverse } from "@/modules/sessions/domain/selection/diversity";
import type { ScoredCandidate } from "@/modules/sessions/domain/selection/types";

function makeScoredCandidate(
  id: string,
  score: number,
  overrides: Partial<ScoredCandidate["candidate"]> = {},
): ScoredCandidate {
  return {
    candidate: {
      questionId: id,
      questionVersionId: `${id}-v1`,
      primarySkillId: "skill-1",
      difficulty: "MEDIUM",
      questionType: "SINGLE_CHOICE",
      criticality: "NORMAL",
      estimatedTimeSeconds: 60,
      skillIds: ["skill-1"],
      ...overrides,
    },
    score,
    selectionReason: "CURRENT_TOPIC",
    breakdown: {
      difficultyMatch: 0.8,
      recency: 0.5,
      novelty: 0.5,
      skillPriority: 0.5,
      criticality: 0.5,
    },
  };
}

describe("Diversity", () => {
  it("selects up to targetCount questions", () => {
    const candidates = [
      makeScoredCandidate("q1", 0.9),
      makeScoredCandidate("q2", 0.8),
      makeScoredCandidate("q3", 0.7),
    ];

    const result = selectDiverse(candidates, 2, new Map());
    expect(result).toHaveLength(2);
  });

  it("enforces maxSameSkill limit", () => {
    const candidates = [
      makeScoredCandidate("q1", 0.9, { primarySkillId: "js" }),
      makeScoredCandidate("q2", 0.8, { primarySkillId: "js" }),
      makeScoredCandidate("q3", 0.7, { primarySkillId: "js" }),
      makeScoredCandidate("q4", 0.6, { primarySkillId: "js" }),
      makeScoredCandidate("q5", 0.5, { primarySkillId: "python" }),
    ];

    const result = selectDiverse(candidates, 5, new Map(), {
      maxSameSkill: 3,
      maxSameDifficulty: 10,
      maxSameType: 10,
    });

    const jsCount = result.filter((r) => r.targetSkillId === "js").length;
    expect(jsCount).toBe(3);
    expect(result).toHaveLength(4);
  });

  it("enforces maxSameDifficulty limit", () => {
    const candidates = [
      makeScoredCandidate("q1", 0.9, { difficulty: "EASY" }),
      makeScoredCandidate("q2", 0.8, { difficulty: "EASY" }),
      makeScoredCandidate("q3", 0.7, { difficulty: "EASY" }),
      makeScoredCandidate("q4", 0.6, { difficulty: "MEDIUM" }),
    ];

    const result = selectDiverse(candidates, 4, new Map(), {
      maxSameSkill: 10,
      maxSameDifficulty: 2,
      maxSameType: 10,
    });

    const easyCount = result.filter((r) => r.assignedDifficulty === "EASY").length;
    expect(easyCount).toBe(2);
  });

  it("assigns incrementing positions starting from 1", () => {
    const candidates = [makeScoredCandidate("q1", 0.9), makeScoredCandidate("q2", 0.8)];

    const result = selectDiverse(candidates, 3, new Map());
    expect(result[0]!.position).toBe(1);
    expect(result[1]!.position).toBe(2);
  });

  it("uses mastery from map for masteryBefore", () => {
    const candidates = [makeScoredCandidate("q1", 0.9)];
    const masteries = new Map([["skill-1", { mastery: 55 }]]);

    const result = selectDiverse(candidates, 1, masteries);
    expect(result[0]!.masteryBefore).toBe(55);
  });
});
