"use client";

import { useState, useEffect, useCallback } from "react";
import type { Question, AnswerState } from "@/lib/types";
import {
  getDailyQuizQuestions,
  getStudyTrack,
  XP_PER_CORRECT,
  XP_PERFECT_BONUS,
} from "@/lib/daily-quiz-data";

interface DailyQuizProps {
  trackId: string;
  onComplete: (xpEarned: number, correctCount: number, totalQuestions: number) => void;
}

export function DailyQuiz({ trackId, onComplete }: DailyQuizProps) {
  const today = new Date().toISOString().slice(0, 10);
  const questions = getDailyQuizQuestions(trackId, today);
  const track = getStudyTrack(trackId);

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

  if (!track || !currentQuestion) return null;

  const progress = (questionIdx / questions.length) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      {/* Quiz top bar */}
      <div className="border-b border-slate-800 px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <div className={`text-sm font-bold uppercase tracking-widest ${track.textClass}`}>
            Daily Quiz
          </div>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${track.bgClass}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-slate-400">
            {questionIdx + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Question area */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-8">
        <p className={`mb-6 text-sm font-bold uppercase tracking-widest ${track.textClass}`}>
          Question {questionIdx + 1} of {questions.length}
        </p>

        <h2 className="mb-6 text-center text-xl font-bold leading-snug text-white">
          {currentQuestion.prompt}
        </h2>

        {currentQuestion.code && (
          <pre className="mb-6 w-full overflow-x-auto rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-relaxed text-emerald-300">
            {currentQuestion.code}
          </pre>
        )}

        <div className="grid w-full gap-3">
          {currentQuestion.options.map((option, idx) => {
            let stateClass =
              "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700";

            if (answerState !== "unanswered") {
              if (idx === currentQuestion.correctIndex) {
                stateClass = "border-emerald-500 bg-emerald-900/40 text-emerald-200";
              } else if (idx === selectedOption && answerState === "incorrect") {
                stateClass = "border-red-500 bg-red-900/40 text-red-200";
              } else {
                stateClass = "border-slate-700 bg-slate-800/50 text-slate-500";
              }
            } else if (selectedOption === idx) {
              stateClass = `border-2 ${track.borderClass} bg-slate-800 text-white`;
            }

            return (
              <button
                key={idx}
                disabled={answerState !== "unanswered"}
                onClick={() => setSelectedOption(idx)}
                className={`w-full rounded-2xl border-2 p-4 text-left font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-default ${stateClass}`}
              >
                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-current text-xs font-bold opacity-60">
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
                ? "border-emerald-500 bg-emerald-900/30"
                : "border-red-500 bg-red-900/30"
            }`}
          >
            <p
              className={`mb-1 font-bold ${
                answerState === "correct" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {answerState === "correct" ? "Correct!" : "Not quite"}
            </p>
            <p className="text-sm leading-relaxed text-slate-300">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="sticky bottom-0 border-t border-slate-800 bg-slate-900/95 px-4 py-4">
        <div className="mx-auto max-w-2xl">
          {answerState === "unanswered" ? (
            <button
              disabled={selectedOption === null}
              onClick={handleCheck}
              className={`w-full rounded-2xl py-4 text-lg font-bold transition-all active:scale-[0.98] ${
                selectedOption === null
                  ? "cursor-not-allowed bg-slate-700 text-slate-500"
                  : `${track.bgClass} text-white shadow-lg hover:opacity-90`
              }`}
            >
              Check
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className={`w-full rounded-2xl py-4 text-lg font-bold shadow-lg transition-all active:scale-[0.98] ${
                answerState === "correct"
                  ? "bg-emerald-500 text-white hover:bg-emerald-400"
                  : "bg-red-500 text-white hover:bg-red-400"
              }`}
            >
              {questionIdx + 1 >= questions.length ? "Finish" : "Continue"}
            </button>
          )}
          <p className="mt-2 text-center text-xs text-slate-600">
            Press Enter to {answerState === "unanswered" ? "check" : "continue"} · 1–
            {currentQuestion.options.length} to select
          </p>
        </div>
      </div>
    </div>
  );
}
