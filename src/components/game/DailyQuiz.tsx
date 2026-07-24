"use client";

import { useState, useEffect, useCallback } from "react";
import type { Question, AnswerState } from "@/lib/types";
import type { TrackStyle } from "@/lib/track-styles";

export const XP_PER_CORRECT = 10;
export const XP_PERFECT_BONUS = 25;

interface DailyQuizProps {
  questions: Question[];
  trackStyle: TrackStyle;
  onComplete: (xpEarned: number, correctCount: number, totalQuestions: number) => void;
}

export function DailyQuiz({ questions, trackStyle, onComplete }: DailyQuizProps) {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion: Question | undefined = questions[questionIdx];

  const handleCheck = useCallback(() => {
    if (selectedOption === null || !currentQuestion) return;
    if (selectedOption === currentQuestion.correctIndex) {
      setAnswerState("correct");
      setCorrectCount((c) => c + 1);
    } else {
      setAnswerState("incorrect");
    }
  }, [selectedOption, currentQuestion]);

  const handleContinue = useCallback(() => {
    if (questionIdx + 1 >= questions.length) {
      const finalCorrect = correctCount;
      const isPerfect = finalCorrect === questions.length;
      const xp = finalCorrect * XP_PER_CORRECT + (isPerfect ? XP_PERFECT_BONUS : 0);
      onComplete(xp, finalCorrect, questions.length);
    } else {
      setQuestionIdx((i) => i + 1);
      setSelectedOption(null);
      setAnswerState("unanswered");
    }
  }, [questionIdx, questions.length, correctCount, onComplete]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (answerState === "unanswered") handleCheck();
        else handleContinue();
      }
      if (answerState === "unanswered" && currentQuestion) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= currentQuestion.options.length) {
          setSelectedOption(num - 1);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answerState, handleCheck, handleContinue, currentQuestion]);

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

        {answerState !== "unanswered" && (
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
      </div>

      <div className="sticky bottom-0 border-t border-line bg-surface-overlay px-4 py-4">
        <div className="mx-auto max-w-2xl">
          {answerState === "unanswered" ? (
            <button
              disabled={selectedOption === null}
              onClick={handleCheck}
              className={`w-full rounded-2xl py-4 font-mono text-lg font-bold transition-all active:scale-[0.98] ${
                selectedOption === null
                  ? "cursor-not-allowed bg-surface-inset text-fg-faint"
                  : `${trackStyle.bgClass} text-white shadow-lg hover:opacity-90`
              }`}
            >
              {"> check"}
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
            ↵ to {answerState === "unanswered" ? "check" : "continue"} · 1–
            {currentQuestion.options.length} to select
          </p>
        </div>
      </div>
    </div>
  );
}
