"use client";

import Link from "next/link";

interface ResultScreenProps {
  xpEarned: number;
  totalQuestions: number;
  correctAnswers: number;
  lessonTitle: string;
  topicId: string;
  onRetry: () => void;
}

export function ResultScreen({
  xpEarned,
  totalQuestions,
  correctAnswers,
  lessonTitle,
  topicId: _topicId,
  onRetry,
}: ResultScreenProps) {
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const isPerfect = correctAnswers === totalQuestions;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-6 text-center">
      <div className="animate-bounce-once mb-6 text-8xl">
        {isPerfect ? "🏆" : accuracy >= 60 ? "🎯" : "💪"}
      </div>

      <h1 className="mb-2 font-mono text-3xl font-black text-fg">
        {isPerfect ? "Zero bugs!" : accuracy >= 60 ? "Build succeeded!" : "Debug harder!"}
      </h1>
      <p className="mb-8 text-fg-muted">{lessonTitle}</p>

      <div className="mb-10 flex gap-6">
        <Stat
          label="XP earned"
          value={`+${xpEarned}`}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <Stat
          label="Coverage"
          value={`${accuracy}%`}
          color="text-indigo-600 dark:text-indigo-400"
        />
        <Stat
          label="Passed"
          value={`${correctAnswers}/${totalQuestions}`}
          color="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/"
          className="w-full rounded-2xl bg-emerald-500 py-4 text-center font-mono text-lg font-bold text-white shadow-lg transition-all hover:bg-emerald-400 active:scale-95"
        >
          {"> continue"}
        </Link>
        <button
          onClick={onRetry}
          className="w-full rounded-2xl border-2 border-line-strong py-4 font-mono text-lg font-bold text-fg-secondary transition-all hover:border-fg-muted hover:text-fg active:scale-95"
        >
          {"> retry"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-surface-raised px-6 py-4">
      <span className={`font-mono text-2xl font-black ${color}`}>{value}</span>
      <span className="text-xs text-fg-muted">{label}</span>
    </div>
  );
}
