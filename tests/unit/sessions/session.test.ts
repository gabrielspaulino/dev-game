import { describe, it, expect } from "vitest";
import {
  canSubmitAnswer,
  canCompleteSession,
  recordAnswer,
  completeSession,
  expireSession,
  type Session,
} from "@/modules/sessions/domain/session";

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "sess-1",
    userId: "user-1",
    type: "daily",
    status: "ACTIVE",
    questionIds: ["q1", "q2", "q3"],
    answeredQuestionIds: [],
    createdAt: new Date("2026-01-15T10:00:00Z"),
    completedAt: null,
    sessionDate: "2026-01-15",
    ...overrides,
  };
}

describe("Session", () => {
  describe("canSubmitAnswer", () => {
    it("allows answering a valid unanswered question", () => {
      const result = canSubmitAnswer(makeSession(), "q1");
      expect(result.allowed).toBe(true);
    });

    it("rejects if session is not active", () => {
      const result = canSubmitAnswer(makeSession({ status: "COMPLETED" }), "q1");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("COMPLETED");
    });

    it("rejects if question not in session", () => {
      const result = canSubmitAnswer(makeSession(), "q99");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("not part of this session");
    });

    it("rejects already answered question", () => {
      const result = canSubmitAnswer(makeSession({ answeredQuestionIds: ["q1"] }), "q1");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("already answered");
    });
  });

  describe("canCompleteSession", () => {
    it("allows when all questions answered", () => {
      const session = makeSession({
        answeredQuestionIds: ["q1", "q2", "q3"],
      });
      const result = canCompleteSession(session);
      expect(result.allowed).toBe(true);
    });

    it("rejects when unanswered questions remain", () => {
      const result = canCompleteSession(makeSession({ answeredQuestionIds: ["q1"] }));
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("2 question(s) not yet answered");
    });

    it("rejects when session is not active", () => {
      const result = canCompleteSession(
        makeSession({ status: "EXPIRED", answeredQuestionIds: ["q1", "q2", "q3"] }),
      );
      expect(result.allowed).toBe(false);
    });
  });

  describe("recordAnswer", () => {
    it("adds question ID to answered list", () => {
      const session = makeSession();
      const updated = recordAnswer(session, "q1");
      expect(updated.answeredQuestionIds).toEqual(["q1"]);
    });

    it("preserves existing answered questions", () => {
      const session = makeSession({ answeredQuestionIds: ["q1"] });
      const updated = recordAnswer(session, "q2");
      expect(updated.answeredQuestionIds).toEqual(["q1", "q2"]);
    });

    it("does not mutate original session", () => {
      const session = makeSession();
      recordAnswer(session, "q1");
      expect(session.answeredQuestionIds).toEqual([]);
    });
  });

  describe("completeSession", () => {
    it("sets status to COMPLETED with timestamp", () => {
      const now = new Date("2026-01-15T11:00:00Z");
      const updated = completeSession(makeSession(), now);
      expect(updated.status).toBe("COMPLETED");
      expect(updated.completedAt).toBe(now);
    });

    it("does not mutate original session", () => {
      const session = makeSession();
      completeSession(session, new Date());
      expect(session.status).toBe("ACTIVE");
    });
  });

  describe("expireSession", () => {
    it("sets status to EXPIRED", () => {
      const updated = expireSession(makeSession());
      expect(updated.status).toBe("EXPIRED");
    });

    it("does not mutate original session", () => {
      const session = makeSession();
      expireSession(session);
      expect(session.status).toBe("ACTIVE");
    });
  });
});
