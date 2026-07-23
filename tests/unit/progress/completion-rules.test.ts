import { describe, it, expect } from "vitest";
import {
  evaluateModuleCompletion,
  evaluateCourseCompletion,
  canAchieveMastery,
  DEFAULT_MODULE_COMPLETION_CONFIG,
  DEFAULT_COURSE_COMPLETION_CONFIG,
  type ModuleEvaluation,
  type CourseEvaluation,
  type SkillMasterySnapshot,
} from "@/modules/progress/domain/completion-rules";

function makeModuleEval(overrides: Partial<ModuleEvaluation> = {}): ModuleEvaluation {
  return {
    allMandatoryLessonsCompleted: true,
    skillMasteries: [
      { skillId: "s1", mastery: 80 },
      { skillId: "s2", mastery: 75 },
    ],
    challengeScorePercent: 80,
    ...overrides,
  };
}

function makeCourseEval(overrides: Partial<CourseEvaluation> = {}): CourseEvaluation {
  return {
    allMandatoryModulesCompleted: true,
    skillMasteries: [
      { skillId: "s1", mastery: 80 },
      { skillId: "s2", mastery: 75 },
    ],
    finalAssessmentScorePercent: 80,
    ...overrides,
  };
}

describe("Completion Rules", () => {
  describe("evaluateModuleCompletion", () => {
    it("passes with all criteria met", () => {
      const result = evaluateModuleCompletion(makeModuleEval(), DEFAULT_MODULE_COMPLETION_CONFIG);
      expect(result.isComplete).toBe(true);
      expect(result.reasons).toHaveLength(0);
    });

    it("fails if mandatory lessons incomplete", () => {
      const result = evaluateModuleCompletion(
        makeModuleEval({ allMandatoryLessonsCompleted: false }),
        DEFAULT_MODULE_COMPLETION_CONFIG,
      );
      expect(result.isComplete).toBe(false);
      expect(result.reasons).toContain("Not all mandatory lessons are completed");
    });

    it("fails if average mastery below threshold", () => {
      const result = evaluateModuleCompletion(
        makeModuleEval({
          skillMasteries: [
            { skillId: "s1", mastery: 60 },
            { skillId: "s2", mastery: 50 },
          ],
        }),
        DEFAULT_MODULE_COMPLETION_CONFIG,
      );
      expect(result.isComplete).toBe(false);
      expect(result.reasons.some((r) => r.includes("Average mastery"))).toBe(true);
    });

    it("fails if any skill below minimum mastery", () => {
      const result = evaluateModuleCompletion(
        makeModuleEval({
          skillMasteries: [
            { skillId: "s1", mastery: 90 },
            { skillId: "s2", mastery: 40 },
          ],
        }),
        DEFAULT_MODULE_COMPLETION_CONFIG,
      );
      expect(result.isComplete).toBe(false);
      expect(result.reasons.some((r) => r.includes("below minimum mastery"))).toBe(true);
    });

    it("fails if challenge not attempted", () => {
      const result = evaluateModuleCompletion(
        makeModuleEval({ challengeScorePercent: null }),
        DEFAULT_MODULE_COMPLETION_CONFIG,
      );
      expect(result.isComplete).toBe(false);
      expect(result.reasons).toContain("Module challenge not attempted");
    });

    it("fails if challenge score below threshold", () => {
      const result = evaluateModuleCompletion(
        makeModuleEval({ challengeScorePercent: 50 }),
        DEFAULT_MODULE_COMPLETION_CONFIG,
      );
      expect(result.isComplete).toBe(false);
      expect(result.reasons.some((r) => r.includes("Challenge score"))).toBe(true);
    });

    it("accumulates multiple reasons", () => {
      const result = evaluateModuleCompletion(
        makeModuleEval({
          allMandatoryLessonsCompleted: false,
          challengeScorePercent: null,
        }),
        DEFAULT_MODULE_COMPLETION_CONFIG,
      );
      expect(result.reasons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("evaluateCourseCompletion", () => {
    it("passes with all criteria met", () => {
      const result = evaluateCourseCompletion(makeCourseEval(), DEFAULT_COURSE_COMPLETION_CONFIG);
      expect(result.isComplete).toBe(true);
    });

    it("fails if mandatory modules incomplete", () => {
      const result = evaluateCourseCompletion(
        makeCourseEval({ allMandatoryModulesCompleted: false }),
        DEFAULT_COURSE_COMPLETION_CONFIG,
      );
      expect(result.isComplete).toBe(false);
      expect(result.reasons).toContain("Not all mandatory modules are completed");
    });

    it("fails if final assessment not attempted", () => {
      const result = evaluateCourseCompletion(
        makeCourseEval({ finalAssessmentScorePercent: null }),
        DEFAULT_COURSE_COMPLETION_CONFIG,
      );
      expect(result.isComplete).toBe(false);
      expect(result.reasons).toContain("Final assessment not attempted");
    });

    it("fails if final assessment score below threshold", () => {
      const result = evaluateCourseCompletion(
        makeCourseEval({ finalAssessmentScorePercent: 50 }),
        DEFAULT_COURSE_COMPLETION_CONFIG,
      );
      expect(result.isComplete).toBe(false);
      expect(result.reasons.some((r) => r.includes("Final assessment score"))).toBe(true);
    });
  });

  describe("canAchieveMastery", () => {
    it("returns true when average mastery exceeds threshold", () => {
      const skills: SkillMasterySnapshot[] = [
        { skillId: "s1", mastery: 90 },
        { skillId: "s2", mastery: 85 },
      ];
      expect(canAchieveMastery(skills, DEFAULT_COURSE_COMPLETION_CONFIG)).toBe(true);
    });

    it("returns false when average mastery is below threshold", () => {
      const skills: SkillMasterySnapshot[] = [
        { skillId: "s1", mastery: 80 },
        { skillId: "s2", mastery: 75 },
      ];
      expect(canAchieveMastery(skills, DEFAULT_COURSE_COMPLETION_CONFIG)).toBe(false);
    });

    it("returns false for empty skills", () => {
      expect(canAchieveMastery([], DEFAULT_COURSE_COMPLETION_CONFIG)).toBe(false);
    });
  });
});
