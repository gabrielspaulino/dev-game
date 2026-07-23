import { describe, it, expect } from "vitest";
import { rankCandidates } from "@/modules/sessions/domain/selection/ranking";
import type {
  QuestionCandidate,
  UserSkillMastery,
  UserQuestionHistoryEntry,
} from "@/modules/sessions/domain/selection/types";

function makeCandidate(id: string, overrides: Partial<QuestionCandidate> = {}): QuestionCandidate {
  return {
    questionId: id,
    questionVersionId: `${id}-v1`,
    primarySkillId: "skill-1",
    difficulty: "MEDIUM",
    questionType: "SINGLE_CHOICE",
    criticality: "NORMAL",
    estimatedTimeSeconds: 60,
    skillIds: ["skill-1"],
    ...overrides,
  };
}

describe("Ranking", () => {
  const now = new Date("2026-07-23T12:00:00Z");

  it("ranks novel questions higher than seen ones", () => {
    const candidates = [makeCandidate("q1"), makeCandidate("q2")];

    const masteries = new Map<string, UserSkillMastery>([
      ["skill-1", { skillId: "skill-1", mastery: 40, targetDifficulty: "MEDIUM" }],
    ]);

    const history = new Map<string, UserQuestionHistoryEntry>([
      [
        "q1",
        {
          questionId: "q1",
          lastAnsweredAt: new Date("2026-07-22T12:00:00Z"),
          totalAttempts: 2,
          correctCount: 1,
          lastResult: true,
          nextEligibleAt: null,
        },
      ],
    ]);

    const ranked = rankCandidates(candidates, masteries, history, new Set(), now);
    expect(ranked[0]!.candidate.questionId).toBe("q2");
  });

  it("ranks difficulty-matched questions higher", () => {
    const candidates = [
      makeCandidate("q1", { difficulty: "EXPERT" }),
      makeCandidate("q2", { difficulty: "MEDIUM" }),
    ];

    const masteries = new Map<string, UserSkillMastery>([
      ["skill-1", { skillId: "skill-1", mastery: 40, targetDifficulty: "MEDIUM" }],
    ]);

    const history = new Map<string, UserQuestionHistoryEntry>();

    const ranked = rankCandidates(candidates, masteries, history, new Set(), now);
    expect(ranked[0]!.candidate.questionId).toBe("q2");
  });

  it("boosts focus skill candidates", () => {
    const candidates = [
      makeCandidate("q1", { primarySkillId: "skill-other" }),
      makeCandidate("q2", { primarySkillId: "skill-focus" }),
    ];

    const masteries = new Map<string, UserSkillMastery>();
    const history = new Map<string, UserQuestionHistoryEntry>();
    const focusSkills = new Set(["skill-focus"]);

    const ranked = rankCandidates(candidates, masteries, history, focusSkills, now);
    expect(ranked[0]!.candidate.questionId).toBe("q2");
  });

  it("ranks critical questions higher", () => {
    const candidates = [
      makeCandidate("q1", { criticality: "NORMAL" }),
      makeCandidate("q2", { criticality: "CRITICAL" }),
    ];

    const masteries = new Map<string, UserSkillMastery>();
    const history = new Map<string, UserQuestionHistoryEntry>();

    const ranked = rankCandidates(candidates, masteries, history, new Set(), now);
    expect(ranked[0]!.candidate.questionId).toBe("q2");
  });
});
