"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Lesson, Topic, AnswerState } from "@/lib/types";
import { loadProgress, completeLesson } from "@/lib/progress";
import { ResultScreen } from "./ResultScreen";
import { MAX_HEARTS } from "@/lib/progress";

interface LessonFlowProps {
  topic: Topic;
  lesson: Lesson;
}

export function LessonFlow({ topic, lesson }: LessonFlowProps) {
  const router = useRouter();
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [heartsLost, setHeartsLost] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [hearts, setHearts] = useState(MAX_HEARTS);

  useEffect(() => {
    const p = loadProgress();
    setHearts(p.hearts);
  }, []);

  const currentQuestion = lesson.questions[questionIdx]!;
  const progress = (questionIdx / lesson.questions.length) * 100;

  const handleCheck = useCallback(() => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;

    if (isCorrect) {
      setAnswerState("correct");
      setCorrectCount((c) => c + 1);
    } else {
      setAnswerState("incorrect");
      setHeartsLost((h) => h + 1);
      setHearts((h) => Math.max(0, h - 1));
    }
  }, [selectedOption, currentQuestion]);

  const handleContinue = useCallback(() => {
    if (questionIdx + 1 >= lesson.questions.length) {
      // Lesson complete — save progress
      const saved = loadProgress();
      completeLesson(saved, lesson.id, lesson.xpReward, heartsLost);
      setDone(true);
    } else {
      setQuestionIdx((i) => i + 1);
      setSelectedOption(null);
      setAnswerState("unanswered");
    }
  }, [questionIdx, lesson, heartsLost]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (answerState === "unanswered") handleCheck();
        else handleContinue();
      }
      if (answerState === "unanswered") {
        const num = parseInt(e.key);
        if (num >= 1 && num <= currentQuestion.options.length) {
          setSelectedOption(num - 1);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answerState, handleCheck, handleContinue, currentQuestion]);

  const handleRetry = () => {
    setQuestionIdx(0);
    setSelectedOption(null);
    setAnswerState("unanswered");
    setHeartsLost(0);
    setCorrectCount(0);
    setDone(false);
    const p = loadProgress();
    setHearts(p.hearts);
  };

  if (done) {
    return (
      <ResultScreen
        xpEarned={lesson.xpReward}
        totalQuestions={lesson.questions.length}
        correctAnswers={correctCount}
        lessonTitle={lesson.title}
        topicId={topic.id}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      {/* Lesson top bar */}
      <div className="flex items-center gap-4 border-b border-slate-800 px-4 py-4">
        <button
          onClick={() => router.push("/")}
          className="text-xl text-slate-500 transition-colors hover:text-slate-300"
          aria-label="Exit lesson"
        >
          ✕
        </button>

        {/* Progress bar */}
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${topic.bgClass}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Hearts */}
        <div className="flex gap-0.5">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <span
              key={i}
              className={`text-base transition-all ${i < hearts ? "opacity-100" : "opacity-20 grayscale"}`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* Question area */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-8">
        {/* Question number */}
        <p className={`mb-6 text-sm font-bold uppercase tracking-widest ${topic.textClass}`}>
          Question {questionIdx + 1} of {lesson.questions.length}
        </p>

        {/* Question text */}
        <h2 className="mb-6 text-center text-xl font-bold leading-snug text-white">
          {currentQuestion.prompt}
        </h2>

        {/* Code block */}
        {currentQuestion.code && (
          <pre className="mb-6 w-full overflow-x-auto rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-relaxed text-emerald-300">
            {currentQuestion.code}
          </pre>
        )}

        {/* Answer options */}
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
              stateClass = `border-2 ${topic.borderClass} bg-slate-800 text-white`;
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

        {/* Explanation banner */}
        {answerState !== "unanswered" && (
          <div
            className={`mt-6 w-full rounded-2xl border-2 p-4 ${
              answerState === "correct"
                ? "border-emerald-500 bg-emerald-900/30"
                : "border-red-500 bg-red-900/30"
            }`}
          >
            <p
              className={`mb-1 font-bold ${answerState === "correct" ? "text-emerald-400" : "text-red-400"}`}
            >
              {answerState === "correct" ? "✓ Correct!" : "✗ Not quite"}
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
                  : `${topic.bgClass} text-white shadow-lg hover:opacity-90`
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
              {questionIdx + 1 >= lesson.questions.length ? "Finish" : "Continue"}
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
