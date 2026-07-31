"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Question, AnswerState } from "@/lib/types";
import type { TrackStyle } from "@/lib/track-styles";
import { AskAI } from "./AskAI";

export const XP_PER_CORRECT = 10;
export const XP_PERFECT_BONUS = 25;

interface DailyQuizProps {
  questions: Question[];
  trackStyle: TrackStyle;
  onComplete: (xpEarned: number, correctCount: number, totalQuestions: number) => void;
}

function checkTypingAnswer(input: string, accepted: string[]): boolean {
  const normalized = input.trim().toLowerCase();
  return accepted.some((a) => a.trim().toLowerCase() === normalized);
}

async function validateWithAI(
  prompt: string,
  code: string | undefined,
  acceptedAnswers: string[],
  userAnswer: string,
): Promise<boolean> {
  try {
    const res = await fetch("/api/v1/validate-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, code, acceptedAnswers, userAnswer }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.correct === true;
  } catch {
    return false;
  }
}

export function DailyQuiz({ questions, trackStyle, onComplete }: DailyQuizProps) {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion: Question | undefined = questions[questionIdx];
  const isTyping = currentQuestion?.type === "typing";

  const canCheck = isTyping ? typedAnswer.trim().length > 0 : selectedOption !== null;

  const handleCheck = useCallback(async () => {
    if (!currentQuestion || !canCheck) return;

    if (currentQuestion.type === "typing") {
      if (checkTypingAnswer(typedAnswer, currentQuestion.acceptedAnswers)) {
        setAnswerState("correct");
        setCorrectCount((c) => c + 1);
      } else {
        setAnswerState("checking");
        const aiCorrect = await validateWithAI(
          currentQuestion.prompt,
          currentQuestion.code,
          currentQuestion.acceptedAnswers,
          typedAnswer,
        );
        if (aiCorrect) {
          setAnswerState("correct");
          setCorrectCount((c) => c + 1);
        } else {
          setAnswerState("incorrect");
        }
      }
    } else {
      if (selectedOption === currentQuestion.correctIndex) {
        setAnswerState("correct");
        setCorrectCount((c) => c + 1);
      } else {
        setAnswerState("incorrect");
      }
    }
  }, [selectedOption, typedAnswer, currentQuestion, canCheck]);

  const handleContinue = useCallback(() => {
    if (questionIdx + 1 >= questions.length) {
      const finalCorrect = correctCount;
      const isPerfect = finalCorrect === questions.length;
      const xp = finalCorrect * XP_PER_CORRECT + (isPerfect ? XP_PERFECT_BONUS : 0);
      onComplete(xp, finalCorrect, questions.length);
    } else {
      setQuestionIdx((i) => i + 1);
      setSelectedOption(null);
      setTypedAnswer("");
      setAnswerState("unanswered");
    }
  }, [questionIdx, questions.length, correctCount, onComplete]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (answerState === "checking") return;
      if (e.key === "Enter") {
        if (answerState === "unanswered") handleCheck();
        else handleContinue();
      }
      if (answerState === "unanswered" && currentQuestion && currentQuestion.type !== "typing") {
        const num = parseInt(e.key);
        if (num >= 1 && num <= currentQuestion.options.length) {
          setSelectedOption(num - 1);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answerState, handleCheck, handleContinue, currentQuestion]);

  const aiContext = useMemo(() => {
    if (!currentQuestion || answerState === "unanswered") return null;

    let userAnswer: string;
    let correctAnswer: string;

    if (currentQuestion.type === "typing") {
      userAnswer = typedAnswer;
      correctAnswer = currentQuestion.acceptedAnswers[0] ?? "";
    } else {
      userAnswer = selectedOption !== null ? (currentQuestion.options[selectedOption] ?? "") : "";
      correctAnswer = currentQuestion.options[currentQuestion.correctIndex] ?? "";
    }

    return {
      prompt: currentQuestion.prompt,
      code: currentQuestion.code,
      explanation: currentQuestion.explanation,
      userAnswer,
      correctAnswer,
      wasCorrect: answerState === "correct",
    };
  }, [currentQuestion, answerState, typedAnswer, selectedOption]);

  if (!currentQuestion) return null;

  const progress = (questionIdx / questions.length) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <div className="border-b border-line px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <div
            className={`font-mono text-sm font-bold uppercase tracking-widest ${trackStyle.textClass}`}
          >
            {"// "}
            {trackStyle.title.toLowerCase().replace(/\s+/g, "_")}
          </div>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-inset">
            <div
              className={`h-full rounded-full transition-all duration-500 ${trackStyle.bgClass}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-sm text-fg-muted">
            {questionIdx + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-8">
        <p
          className={`mb-6 font-mono text-sm font-bold uppercase tracking-widest ${trackStyle.textClass}`}
        >
          Question {questionIdx + 1} of {questions.length}
        </p>

        <h2 className="mb-6 text-center text-xl font-bold leading-snug text-fg">
          {currentQuestion.prompt}
        </h2>

        {currentQuestion.code && (
          <pre className="mb-6 w-full overflow-x-auto rounded-xl border border-line bg-surface-raised p-4 font-mono text-sm leading-relaxed text-emerald-600 dark:text-emerald-300">
            {currentQuestion.code}
          </pre>
        )}

        {currentQuestion.type === "typing" ? (
          <div className="w-full">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={answerState !== "unanswered"}
              placeholder="Type your answer..."
              autoFocus
              className={`w-full rounded-2xl border-2 bg-surface-raised p-4 font-mono text-fg outline-none transition-all placeholder:text-fg-faint ${
                answerState === "unanswered" || answerState === "checking"
                  ? `border-line-strong focus:${trackStyle.borderClass}`
                  : answerState === "correct"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40"
                    : "border-red-500 bg-red-50 dark:bg-red-900/40"
              }`}
            />
            {answerState === "incorrect" && (
              <p className="mt-2 font-mono text-sm text-fg-muted">
                Accepted: {currentQuestion.acceptedAnswers.join(", ")}
              </p>
            )}
          </div>
        ) : (
          <div className="grid w-full gap-3">
            {currentQuestion.options.map((option, idx) => {
              let stateClass =
                "border-line-strong bg-surface-raised text-fg-secondary hover:border-fg-muted hover:bg-surface-inset";

              if (answerState !== "unanswered") {
                if (idx === currentQuestion.correctIndex) {
                  stateClass =
                    "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
                } else if (idx === selectedOption && answerState === "incorrect") {
                  stateClass =
                    "border-red-500 bg-red-50 text-red-800 dark:bg-red-900/40 dark:text-red-200";
                } else {
                  stateClass = "border-line bg-surface-raised/50 text-fg-faint";
                }
              } else if (selectedOption === idx) {
                stateClass = `border-2 ${trackStyle.borderClass} bg-surface-raised text-fg`;
              }

              return (
                <button
                  key={idx}
                  disabled={answerState !== "unanswered"}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full rounded-2xl border-2 p-4 text-left font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-default ${stateClass}`}
                >
                  <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-current font-mono text-xs font-bold opacity-60">
                    {idx + 1}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {(answerState === "correct" || answerState === "incorrect") && (
          <div
            className={`mt-6 w-full rounded-2xl border-2 p-4 ${
              answerState === "correct"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                : "border-red-500 bg-red-50 dark:bg-red-900/30"
            }`}
          >
            <p
              className={`mb-1 font-mono font-bold ${
                answerState === "correct"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {answerState === "correct" ? "// PASS" : "// FAIL"}
            </p>
            <p className="text-sm leading-relaxed text-fg-secondary">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {aiContext && answerState !== "checking" && <AskAI context={aiContext} />}
      </div>

      <div className="sticky bottom-0 border-t border-line bg-surface-overlay px-4 py-4">
        <div className="mx-auto max-w-2xl">
          {answerState === "unanswered" ? (
            <button
              disabled={!canCheck}
              onClick={handleCheck}
              className={`w-full rounded-2xl py-4 font-mono text-lg font-bold transition-all active:scale-[0.98] ${
                !canCheck
                  ? "cursor-not-allowed bg-surface-inset text-fg-faint"
                  : `${trackStyle.bgClass} text-white shadow-lg hover:opacity-90`
              }`}
            >
              {"> check"}
            </button>
          ) : answerState === "checking" ? (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-2xl bg-surface-inset py-4 font-mono text-lg font-bold text-fg-muted transition-all"
            >
              {"$ checking"}
              <span className="animate-blink">_</span>
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className={`w-full rounded-2xl py-4 font-mono text-lg font-bold shadow-lg transition-all active:scale-[0.98] ${
                answerState === "correct"
                  ? "bg-emerald-500 text-white hover:bg-emerald-400"
                  : "bg-red-500 text-white hover:bg-red-400"
              }`}
            >
              {questionIdx + 1 >= questions.length ? "> finish" : "> next"}
            </button>
          )}
          <p className="mt-2 text-center font-mono text-xs text-fg-faint">
            {answerState === "checking"
              ? "validating your answer..."
              : `↵ to ${answerState === "unanswered" ? "check" : "continue"}`}
            {answerState === "unanswered" &&
              !isTyping &&
              "options" in currentQuestion &&
              ` · 1–${currentQuestion.options.length} to select`}
          </p>
        </div>
      </div>
    </div>
  );
}
