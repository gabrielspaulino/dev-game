import { describe, it, expect } from "vitest";
import { evaluateAnswer } from "@/modules/questions/domain/answer-evaluation";
import type { Question } from "@/modules/questions/domain/question";

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "q1",
    slug: "q1-test",
    type: "SINGLE_CHOICE",
    prompt: "What is 2+2?",
    explanation: "Basic math",
    difficulty: "EASY",
    reasoningLevel: "RECOGNIZE",
    status: "PUBLISHED",
    criticality: "NORMAL",
    primarySkillId: "math-basics",
    skillIds: ["math-basics"],
    isMandatory: false,
    currentVersionNumber: 1,
    options: [
      { id: "a", optionKey: "A", content: "3", displayOrder: 1 },
      { id: "b", optionKey: "B", content: "4", displayOrder: 2 },
      { id: "c", optionKey: "C", content: "5", displayOrder: 3 },
    ],
    ...overrides,
  };
}

describe("evaluateAnswer", () => {
  describe("SINGLE_CHOICE", () => {
    it("marks correct answer", () => {
      const result = evaluateAnswer(makeQuestion(), { selectedOptionIds: ["b"] }, ["b"]);
      expect(result.isCorrect).toBe(true);
      expect(result.correctOptionIds).toEqual(["b"]);
      expect(result.incorrectReasons).toHaveLength(0);
    });

    it("marks incorrect answer", () => {
      const result = evaluateAnswer(makeQuestion(), { selectedOptionIds: ["a"] }, ["b"]);
      expect(result.isCorrect).toBe(false);
      expect(result.incorrectReasons).toContain("The selected option is not correct");
    });

    it("includes skill and difficulty in feedback", () => {
      const result = evaluateAnswer(
        makeQuestion({ difficulty: "HARD", skillIds: ["s1", "s2"] }),
        { selectedOptionIds: ["b"] },
        ["b"],
      );
      expect(result.skillIds).toEqual(["s1", "s2"]);
      expect(result.difficulty).toBe("HARD");
    });
  });

  describe("MULTIPLE_CHOICE", () => {
    const mcq = makeQuestion({
      type: "MULTIPLE_CHOICE",
      options: [
        { id: "a", optionKey: "A", content: "A", displayOrder: 1 },
        { id: "b", optionKey: "B", content: "B", displayOrder: 2 },
        { id: "c", optionKey: "C", content: "C", displayOrder: 3 },
      ],
    });

    it("marks correct when all correct options selected", () => {
      const result = evaluateAnswer(mcq, { selectedOptionIds: ["a", "b"] }, ["a", "b"]);
      expect(result.isCorrect).toBe(true);
    });

    it("marks incorrect when a correct option is missing", () => {
      const result = evaluateAnswer(mcq, { selectedOptionIds: ["a"] }, ["a", "b"]);
      expect(result.isCorrect).toBe(false);
      expect(result.incorrectReasons).toContain("Missing correct answers");
    });

    it("marks incorrect when an extra wrong option is selected", () => {
      const result = evaluateAnswer(mcq, { selectedOptionIds: ["a", "b", "c"] }, ["a", "b"]);
      expect(result.isCorrect).toBe(false);
      expect(result.incorrectReasons).toContain("Selected incorrect options");
    });
  });

  describe("ORDERING", () => {
    const orderQ = makeQuestion({
      type: "ORDERING",
      options: undefined,
      orderingItems: [
        { id: "s1", text: "Step 1", correctPosition: 1 },
        { id: "s2", text: "Step 2", correctPosition: 2 },
        { id: "s3", text: "Step 3", correctPosition: 3 },
      ],
    });

    it("marks correct order", () => {
      const result = evaluateAnswer(orderQ, { orderedItemIds: ["s1", "s2", "s3"] }, null);
      expect(result.isCorrect).toBe(true);
    });

    it("marks incorrect order", () => {
      const result = evaluateAnswer(orderQ, { orderedItemIds: ["s2", "s1", "s3"] }, null);
      expect(result.isCorrect).toBe(false);
      expect(result.incorrectReasons).toContain("Items are not in the correct order");
    });

    it("marks incorrect when missing items", () => {
      const result = evaluateAnswer(orderQ, { orderedItemIds: ["s1", "s2"] }, null);
      expect(result.isCorrect).toBe(false);
    });
  });

  describe("CODE_OUTPUT / BUG_IDENTIFICATION / ARCHITECTURE_SCENARIO", () => {
    it("evaluates as single-choice for CODE_OUTPUT", () => {
      const q = makeQuestion({ type: "CODE_OUTPUT" });
      const result = evaluateAnswer(q, { selectedOptionIds: ["b"] }, ["b"]);
      expect(result.isCorrect).toBe(true);
    });

    it("evaluates as single-choice for BUG_IDENTIFICATION", () => {
      const q = makeQuestion({ type: "BUG_IDENTIFICATION" });
      const result = evaluateAnswer(q, { selectedOptionIds: ["a"] }, ["b"]);
      expect(result.isCorrect).toBe(false);
    });

    it("evaluates as single-choice for ARCHITECTURE_SCENARIO", () => {
      const q = makeQuestion({ type: "ARCHITECTURE_SCENARIO" });
      const result = evaluateAnswer(q, { selectedOptionIds: ["b"] }, ["b"]);
      expect(result.isCorrect).toBe(true);
    });
  });

  it("returns explanation in feedback", () => {
    const result = evaluateAnswer(
      makeQuestion({ explanation: "Because math" }),
      {
        selectedOptionIds: ["a"],
      },
      ["b"],
    );
    expect(result.explanation).toBe("Because math");
  });

  it("tracks user selected IDs", () => {
    const result = evaluateAnswer(makeQuestion(), { selectedOptionIds: ["a", "c"] }, ["b"]);
    expect(result.userSelectedIds).toEqual(["a", "c"]);
  });
});
