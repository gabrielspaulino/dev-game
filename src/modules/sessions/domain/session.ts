import type { SessionType, SessionStatus } from "./session-policy";

export interface Session {
  id: string;
  userId: string;
  type: SessionType;
  status: SessionStatus;
  questionIds: string[];
  answeredQuestionIds: string[];
  createdAt: Date;
  completedAt: Date | null;
  sessionDate: string;
}

export interface SessionAnswer {
  sessionId: string;
  questionId: string;
  selectedOptionIds: string[];
  orderedItemIds?: string[];
  isCorrect: boolean;
  usedHint: boolean;
  answeredAt: Date;
}

export function canSubmitAnswer(
  session: Session,
  questionId: string,
): { allowed: boolean; reason?: string } {
  if (session.status !== "ACTIVE") {
    return { allowed: false, reason: `Session is ${session.status}` };
  }

  if (!session.questionIds.includes(questionId)) {
    return { allowed: false, reason: "Question is not part of this session" };
  }

  if (session.answeredQuestionIds.includes(questionId)) {
    return { allowed: false, reason: "Question already answered" };
  }

  return { allowed: true };
}

export function canCompleteSession(session: Session): {
  allowed: boolean;
  reason?: string;
} {
  if (session.status !== "ACTIVE") {
    return { allowed: false, reason: `Session is ${session.status}` };
  }

  const unanswered = session.questionIds.filter((id) => !session.answeredQuestionIds.includes(id));

  if (unanswered.length > 0) {
    return {
      allowed: false,
      reason: `${unanswered.length} question(s) not yet answered`,
    };
  }

  return { allowed: true };
}

export function recordAnswer(session: Session, questionId: string): Session {
  return {
    ...session,
    answeredQuestionIds: [...session.answeredQuestionIds, questionId],
  };
}

export function completeSession(session: Session, now: Date): Session {
  return {
    ...session,
    status: "COMPLETED",
    completedAt: now,
  };
}

export function expireSession(session: Session): Session {
  return {
    ...session,
    status: "EXPIRED",
  };
}
