import { describe, it, expect } from "vitest";
import {
  determineLessonStatus,
  buildTargetedReview,
  canTransition,
  DEFAULT_LESSON_COMPLETION_CONFIG,
  type LessonAttemptResult,
} from "@/modules/progress/domain/lesson-status";

function makeAttempt(overrides: Partial<LessonAttemptResult> = {}): LessonAttemptResult {
  return {
    totalQuestions: 10,
    correctAnswers: 8,
    failedCriticalSkills: false,
    incorrectQuestionIds: ["q3", "q7"],
    weakSkillIds: [],
    ...overrides,
  };
}

describe("Lesson Status", () => {
  describe("determineLessonStatus", () => {
    it("returns COMPLETED when score >= 70% and no critical failures", () => {
      expect(determineLessonStatus(makeAttempt(), DEFAULT_LESSON_COMPLETION_CONFIG)).toBe(
        "COMPLETED",
      );
    });

    it("returns COMPLETED at exactly 70%", () => {
      expect(
        determineLessonStatus(makeAttempt({ correctAnswers: 7 }), DEFAULT_LESSON_COMPLETION_CONFIG),
      ).toBe("COMPLETED");
    });

    it("returns COMPLETED_REVIEW_REQUIRED below 70%", () => {
      expect(
        determineLessonStatus(makeAttempt({ correctAnswers: 6 }), DEFAULT_LESSON_COMPLETION_CONFIG),
      ).toBe("COMPLETED_REVIEW_REQUIRED");
    });

    it("returns COMPLETED_REVIEW_REQUIRED when critical skills failed", () => {
      expect(
        determineLessonStatus(
          makeAttempt({ failedCriticalSkills: true }),
          DEFAULT_LESSON_COMPLETION_CONFIG,
        ),
      ).toBe("COMPLETED_REVIEW_REQUIRED");
    });
  });

  describe("buildTargetedReview", () => {
    it("includes incorrect question IDs", () => {
      const review = buildTargetedReview(makeAttempt(), DEFAULT_LESSON_COMPLETION_CONFIG);
      expect(review.incorrectQuestionIds).toEqual(["q3", "q7"]);
    });

    it("includes weak skill IDs", () => {
      const review = buildTargetedReview(
        makeAttempt({ weakSkillIds: ["s1"] }),
        DEFAULT_LESSON_COMPLETION_CONFIG,
      );
      expect(review.weakSkillIds).toEqual(["s1"]);
    });

    it("caps question count at targetedReviewSize", () => {
      const review = buildTargetedReview(
        makeAttempt({
          incorrectQuestionIds: ["q1", "q2", "q3", "q4", "q5", "q6"],
        }),
        DEFAULT_LESSON_COMPLETION_CONFIG,
      );
      expect(review.questionCount).toBe(5);
    });
  });

  describe("canTransition", () => {
    it("allows NOT_STARTED → IN_PROGRESS", () => {
      expect(canTransition("NOT_STARTED", "IN_PROGRESS")).toBe(true);
    });

    it("blocks NOT_STARTED → COMPLETED", () => {
      expect(canTransition("NOT_STARTED", "COMPLETED")).toBe(false);
    });

    it("allows IN_PROGRESS → COMPLETED", () => {
      expect(canTransition("IN_PROGRESS", "COMPLETED")).toBe(true);
    });

    it("allows IN_PROGRESS → COMPLETED_REVIEW_REQUIRED", () => {
      expect(canTransition("IN_PROGRESS", "COMPLETED_REVIEW_REQUIRED")).toBe(true);
    });

    it("allows COMPLETED → MASTERED", () => {
      expect(canTransition("COMPLETED", "MASTERED")).toBe(true);
    });

    it("allows COMPLETED_REVIEW_REQUIRED → IN_PROGRESS", () => {
      expect(canTransition("COMPLETED_REVIEW_REQUIRED", "IN_PROGRESS")).toBe(true);
    });

    it("blocks MASTERED → any other status", () => {
      expect(canTransition("MASTERED", "COMPLETED")).toBe(false);
      expect(canTransition("MASTERED", "IN_PROGRESS")).toBe(false);
    });
  });
});
