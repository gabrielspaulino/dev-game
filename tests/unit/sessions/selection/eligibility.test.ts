import { describe, it, expect } from "vitest";
import {
  filterEligible,
  DEFAULT_ELIGIBILITY_CONFIG,
} from "@/modules/sessions/domain/selection/eligibility";
import type {
  QuestionCandidate,
  UserQuestionHistoryEntry,
} from "@/modules/sessions/domain/selection/types";

function makeCandidate(id: string): QuestionCandidate {
  return {
    questionId: id,
    questionVersionId: `${id}-v1`,
    primarySkillId: "skill-1",
    difficulty: "MEDIUM",
    questionType: "SINGLE_CHOICE",
    criticality: "NORMAL",
    estimatedTimeSeconds: 60,
    skillIds: ["skill-1"],
  };
}

describe("Eligibility", () => {
  const now = new Date("2026-07-23T12:00:00Z");

  it("includes candidates with no history", () => {
    const candidates = [makeCandidate("q1"), makeCandidate("q2")];
    const history = new Map<string, UserQuestionHistoryEntry>();
    const recent = new Set<string>();

    const result = filterEligible(candidates, history, recent, now);
    expect(result).toHaveLength(2);
  });

  it("excludes recently answered questions", () => {
    const candidates = [makeCandidate("q1"), makeCandidate("q2")];
    const history = new Map<string, UserQuestionHistoryEntry>();
    const recent = new Set(["q1"]);

    const result = filterEligible(candidates, history, recent, now);
    expect(result).toHaveLength(1);
    expect(result[0]!.questionId).toBe("q2");
  });

  it("excludes questions before their next eligible date", () => {
    const candidates = [makeCandidate("q1")];
    const history = new Map<string, UserQuestionHistoryEntry>([
      [
        "q1",
        {
          questionId: "q1",
          lastAnsweredAt: new Date("2026-07-23T06:00:00Z"),
          totalAttempts: 1,
          correctCount: 1,
          lastResult: true,
          nextEligibleAt: new Date("2026-07-25T00:00:00Z"),
        },
      ],
    ]);
    const recent = new Set<string>();

    const result = filterEligible(candidates, history, recent, now);
    expect(result).toHaveLength(0);
  });

  it("includes questions past their next eligible date", () => {
    const candidates = [makeCandidate("q1")];
    const history = new Map<string, UserQuestionHistoryEntry>([
      [
        "q1",
        {
          questionId: "q1",
          lastAnsweredAt: new Date("2026-07-20T06:00:00Z"),
          totalAttempts: 1,
          correctCount: 1,
          lastResult: true,
          nextEligibleAt: new Date("2026-07-22T00:00:00Z"),
        },
      ],
    ]);
    const recent = new Set<string>();

    const result = filterEligible(candidates, history, recent, now);
    expect(result).toHaveLength(1);
  });

  it("applies cooldown for questions attempted many times", () => {
    const candidates = [makeCandidate("q1")];
    const history = new Map<string, UserQuestionHistoryEntry>([
      [
        "q1",
        {
          questionId: "q1",
          lastAnsweredAt: new Date("2026-07-23T10:00:00Z"),
          totalAttempts: 3,
          correctCount: 1,
          lastResult: false,
          nextEligibleAt: null,
        },
      ],
    ]);
    const recent = new Set<string>();

    const result = filterEligible(candidates, history, recent, now, DEFAULT_ELIGIBILITY_CONFIG);
    expect(result).toHaveLength(0);
  });
});
