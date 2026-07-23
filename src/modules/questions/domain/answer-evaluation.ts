import type { Question } from "./question";
import { getCorrectOptionIds } from "./question";

export interface AnswerInput {
  selectedOptionIds?: string[];
  orderedItemIds?: string[];
}

export interface AnswerFeedback {
  isCorrect: boolean;
  correctOptionIds: string[];
  explanation: string;
  skillIds: string[];
  difficulty: number;
  userSelectedIds: string[];
  incorrectReasons: string[];
}

export function evaluateAnswer(question: Question, answer: AnswerInput): AnswerFeedback {
  const correctIds = getCorrectOptionIds(question);
  const userIds = answer.selectedOptionIds ?? [];

  let isCorrect: boolean;

  if (question.type === "ordering") {
    const items = question.orderingItems ?? [];
    const expected = items
      .slice()
      .sort((a, b) => a.correctPosition - b.correctPosition)
      .map((i) => i.id);
    const submitted = answer.orderedItemIds ?? [];
    isCorrect =
      expected.length === submitted.length && expected.every((id, idx) => id === submitted[idx]);
  } else if (question.type === "multiple-correct") {
    const correctSet = new Set(correctIds);
    const userSet = new Set(userIds);
    isCorrect = correctSet.size === userSet.size && [...correctSet].every((id) => userSet.has(id));
  } else {
    isCorrect = userIds.length === 1 && correctIds.length === 1 && userIds[0] === correctIds[0];
  }

  const incorrectReasons: string[] = [];
  if (!isCorrect) {
    if (question.type === "multiple-correct") {
      const missed = correctIds.filter((id) => !userIds.includes(id));
      const extra = userIds.filter((id) => !correctIds.includes(id));
      if (missed.length > 0) incorrectReasons.push("Missing correct answers");
      if (extra.length > 0) incorrectReasons.push("Selected incorrect options");
    } else if (question.type === "ordering") {
      incorrectReasons.push("Items are not in the correct order");
    } else {
      incorrectReasons.push("The selected option is not correct");
    }
  }

  return {
    isCorrect,
    correctOptionIds: correctIds,
    explanation: question.explanation,
    skillIds: question.skillIds,
    difficulty: question.difficulty,
    userSelectedIds: userIds,
    incorrectReasons,
  };
}
