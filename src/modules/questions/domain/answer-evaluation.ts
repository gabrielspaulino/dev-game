import type { Question, Difficulty } from "./question";

export interface AnswerInput {
  selectedOptionIds?: string[];
  orderedItemIds?: string[];
}

export interface AnswerFeedback {
  isCorrect: boolean;
  correctOptionIds: string[];
  explanation: string;
  skillIds: string[];
  difficulty: Difficulty;
  userSelectedIds: string[];
  incorrectReasons: string[];
}

export function evaluateAnswer(
  question: Question,
  answer: AnswerInput,
  correctAnswer: unknown,
): AnswerFeedback {
  const userIds = answer.selectedOptionIds ?? [];

  let isCorrect: boolean;
  let correctOptionIds: string[] = [];

  if (question.type === "ORDERING") {
    const items = question.orderingItems ?? [];
    const expected = items
      .slice()
      .sort((a, b) => a.correctPosition - b.correctPosition)
      .map((i) => i.id);
    const submitted = answer.orderedItemIds ?? [];
    isCorrect =
      expected.length === submitted.length && expected.every((id, idx) => id === submitted[idx]);
  } else if (question.type === "MULTIPLE_CHOICE") {
    const correct = extractCorrectIds(correctAnswer);
    correctOptionIds = correct;
    const correctSet = new Set(correct);
    const userSet = new Set(userIds);
    isCorrect = correctSet.size === userSet.size && [...correctSet].every((id) => userSet.has(id));
  } else if (question.type === "TRUE_FALSE") {
    const correct = extractCorrectIds(correctAnswer);
    correctOptionIds = correct;
    isCorrect = userIds.length === 1 && correct.length === 1 && userIds[0] === correct[0];
  } else {
    const correct = extractCorrectIds(correctAnswer);
    correctOptionIds = correct;
    isCorrect = userIds.length === 1 && correct.length === 1 && userIds[0] === correct[0];
  }

  const incorrectReasons: string[] = [];
  if (!isCorrect) {
    if (question.type === "MULTIPLE_CHOICE") {
      const missed = correctOptionIds.filter((id) => !userIds.includes(id));
      const extra = userIds.filter((id) => !correctOptionIds.includes(id));
      if (missed.length > 0) incorrectReasons.push("Missing correct answers");
      if (extra.length > 0) incorrectReasons.push("Selected incorrect options");
    } else if (question.type === "ORDERING") {
      incorrectReasons.push("Items are not in the correct order");
    } else {
      incorrectReasons.push("The selected option is not correct");
    }
  }

  return {
    isCorrect,
    correctOptionIds,
    explanation: question.explanation,
    skillIds: question.skillIds,
    difficulty: question.difficulty,
    userSelectedIds: userIds,
    incorrectReasons,
  };
}

function extractCorrectIds(correctAnswer: unknown): string[] {
  if (Array.isArray(correctAnswer)) return correctAnswer as string[];
  if (typeof correctAnswer === "string") return [correctAnswer];
  if (
    correctAnswer !== null &&
    typeof correctAnswer === "object" &&
    "ids" in (correctAnswer as Record<string, unknown>)
  ) {
    return (correctAnswer as { ids: string[] }).ids;
  }
  return [];
}
