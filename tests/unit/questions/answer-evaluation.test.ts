import { describe, it, expect } from "vitest";
import { evaluateAnswer, type AnswerInput } from "@/modules/questions/domain/answer-evaluation";
import type { Question } from "@/modules/questions/domain/question";

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "q1",
    type: "multiple-choice",
    prompt: "What is 2+2?",
    explanation: "Basic math",
    difficulty: 1,
    skillIds: ["math-basics"],
    isMandatory: false,
    options: [
      { id: "a", text: "3", isCorrect: false },
      { id: "b", text: "4", isCorrect: true },
      { id: "c", text: "5", isCorrect: false },
    ],
    ...overrides,
  };
}

describe("evaluateAnswer", () => {
  describe("multiple-choice", () => {
    it("marks correct answer", () => {
      const result = evaluateAnswer(makeQuestion(), { selectedOptionIds: ["b"] });
      expect(result.isCorrect).toBe(true);
      expect(result.correctOptionIds).toEqual(["b"]);
      expect(result.incorrectReasons).toHaveLength(0);
    });

    it("marks incorrect answer", () => {
      const result = evaluateAnswer(makeQuestion(), { selectedOptionIds: ["a"] });
      expect(result.isCorrect).toBe(false);
      expect(result.incorrectReasons).toContain("The selected option is not correct");
    });

    it("includes skill and difficulty in feedback", () => {
      const result = evaluateAnswer(makeQuestion({ difficulty: 3, skillIds: ["s1", "s2"] }), {
        selectedOptionIds: ["b"],
      });
      expect(result.skillIds).toEqual(["s1", "s2"]);
      expect(result.difficulty).toBe(3);
    });
  });

  describe("multiple-correct", () => {
    const mcq = makeQuestion({
      type: "multiple-correct",
      options: [
        { id: "a", text: "A", isCorrect: true },
        { id: "b", text: "B", isCorrect: true },
        { id: "c", text: "C", isCorrect: false },
      ],
    });

    it("marks correct when all correct options selected", () => {
      const result = evaluateAnswer(mcq, { selectedOptionIds: ["a", "b"] });
      expect(result.isCorrect).toBe(true);
    });

    it("marks incorrect when a correct option is missing", () => {
      const result = evaluateAnswer(mcq, { selectedOptionIds: ["a"] });
      expect(result.isCorrect).toBe(false);
      expect(result.incorrectReasons).toContain("Missing correct answers");
    });

    it("marks incorrect when an extra wrong option is selected", () => {
      const result = evaluateAnswer(mcq, { selectedOptionIds: ["a", "b", "c"] });
      expect(result.isCorrect).toBe(false);
      expect(result.incorrectReasons).toContain("Selected incorrect options");
    });
  });

  describe("ordering", () => {
    const orderQ = makeQuestion({
      type: "ordering",
      options: undefined,
      orderingItems: [
        { id: "s1", text: "Step 1", correctPosition: 1 },
        { id: "s2", text: "Step 2", correctPosition: 2 },
        { id: "s3", text: "Step 3", correctPosition: 3 },
      ],
    });

    it("marks correct order", () => {
      const result = evaluateAnswer(orderQ, { orderedItemIds: ["s1", "s2", "s3"] });
      expect(result.isCorrect).toBe(true);
    });

    it("marks incorrect order", () => {
      const result = evaluateAnswer(orderQ, { orderedItemIds: ["s2", "s1", "s3"] });
      expect(result.isCorrect).toBe(false);
      expect(result.incorrectReasons).toContain("Items are not in the correct order");
    });

    it("marks incorrect when missing items", () => {
      const result = evaluateAnswer(orderQ, { orderedItemIds: ["s1", "s2"] });
      expect(result.isCorrect).toBe(false);
    });
  });

  describe("code-output / bug-identification / architecture-scenario", () => {
    it("evaluates as single-choice for code-output", () => {
      const q = makeQuestion({ type: "code-output" });
      const result = evaluateAnswer(q, { selectedOptionIds: ["b"] });
      expect(result.isCorrect).toBe(true);
    });

    it("evaluates as single-choice for bug-identification", () => {
      const q = makeQuestion({ type: "bug-identification" });
      const result = evaluateAnswer(q, { selectedOptionIds: ["a"] });
      expect(result.isCorrect).toBe(false);
    });

    it("evaluates as single-choice for architecture-scenario", () => {
      const q = makeQuestion({ type: "architecture-scenario" });
      const result = evaluateAnswer(q, { selectedOptionIds: ["b"] });
      expect(result.isCorrect).toBe(true);
    });
  });

  it("returns explanation in feedback", () => {
    const result = evaluateAnswer(makeQuestion({ explanation: "Because math" }), {
      selectedOptionIds: ["a"],
    });
    expect(result.explanation).toBe("Because math");
  });

  it("tracks user selected IDs", () => {
    const result = evaluateAnswer(makeQuestion(), { selectedOptionIds: ["a", "c"] });
    expect(result.userSelectedIds).toEqual(["a", "c"]);
  });
});
