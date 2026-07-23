import { DEFAULT_SESSION_MIX, DEFAULT_SESSION_SIZE, calculateMixCounts } from "../session-policy";
import type { SessionPlan, SessionMix } from "./types";

export interface SessionPlanRequest {
  userId: string;
  sessionType: "daily" | "lesson" | "review" | "challenge" | "final_assessment";
  lessonId?: string;
  skillFocus?: string[];
  mix?: Partial<SessionMix>;
  questionCount?: number;
}

export function createSessionPlan(request: SessionPlanRequest): SessionPlan {
  const mix: SessionMix = {
    ...DEFAULT_SESSION_MIX,
    ...request.mix,
  };

  let targetQuestionCount: number;
  if (request.questionCount !== undefined) {
    targetQuestionCount = request.questionCount;
  } else if (request.sessionType === "daily") {
    targetQuestionCount = DEFAULT_SESSION_SIZE.dailySession;
  } else if (request.sessionType === "lesson") {
    targetQuestionCount = DEFAULT_SESSION_SIZE.lessonMax;
  } else {
    targetQuestionCount = DEFAULT_SESSION_SIZE.dailySession;
  }

  return {
    sessionType: request.sessionType,
    userId: request.userId,
    targetQuestionCount,
    lessonId: request.lessonId,
    skillFocus: request.skillFocus,
    mix,
  };
}

export function getMixCounts(plan: SessionPlan): Record<keyof SessionMix, number> {
  return calculateMixCounts(plan.targetQuestionCount, plan.mix);
}
