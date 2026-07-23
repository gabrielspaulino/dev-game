import { describe, it, expect } from "vitest";
import {
  createSessionPlan,
  getMixCounts,
} from "@/modules/sessions/domain/selection/session-planner";
import { DEFAULT_SESSION_SIZE } from "@/modules/sessions/domain/session-policy";

describe("SessionPlanner", () => {
  it("creates a daily session plan with default size", () => {
    const plan = createSessionPlan({
      userId: "user-1",
      sessionType: "daily",
    });

    expect(plan.sessionType).toBe("daily");
    expect(plan.userId).toBe("user-1");
    expect(plan.targetQuestionCount).toBe(DEFAULT_SESSION_SIZE.dailySession);
  });

  it("creates a lesson session plan", () => {
    const plan = createSessionPlan({
      userId: "user-1",
      sessionType: "lesson",
      lessonId: "lesson-1",
    });

    expect(plan.sessionType).toBe("lesson");
    expect(plan.lessonId).toBe("lesson-1");
    expect(plan.targetQuestionCount).toBe(DEFAULT_SESSION_SIZE.lessonMax);
  });

  it("accepts custom question count", () => {
    const plan = createSessionPlan({
      userId: "user-1",
      sessionType: "daily",
      questionCount: 15,
    });

    expect(plan.targetQuestionCount).toBe(15);
  });

  it("accepts custom mix overrides", () => {
    const plan = createSessionPlan({
      userId: "user-1",
      sessionType: "daily",
      mix: { review: 0.6 },
    });

    expect(plan.mix.review).toBe(0.6);
    expect(plan.mix.currentLevel).toBe(0.3);
  });

  it("calculates mix counts correctly", () => {
    const plan = createSessionPlan({
      userId: "user-1",
      sessionType: "daily",
      questionCount: 10,
    });

    const counts = getMixCounts(plan);
    const total = counts.review + counts.currentLevel + counts.newContent + counts.challenge;
    expect(total).toBe(10);
  });
});
