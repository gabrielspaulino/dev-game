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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-center">
      {/* Trophy / medal */}
      <div className="animate-bounce-once mb-6 text-8xl">
        {isPerfect ? "🏆" : accuracy >= 60 ? "🎯" : "💪"}
      </div>

      <h1 className="mb-2 text-3xl font-black text-white">
        {isPerfect ? "Perfect!" : accuracy >= 60 ? "Well done!" : "Keep going!"}
      </h1>
      <p className="mb-8 text-slate-400">{lessonTitle}</p>

      {/* Stats row */}
      <div className="mb-10 flex gap-6">
        <Stat label="XP earned" value={`+${xpEarned}`} color="text-emerald-400" />
        <Stat label="Accuracy" value={`${accuracy}%`} color="text-indigo-400" />
        <Stat
          label="Correct"
          value={`${correctAnswers}/${totalQuestions}`}
          color="text-amber-400"
        />
      </div>

      {/* Actions */}
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/"
          className="w-full rounded-2xl bg-emerald-500 py-4 text-center text-lg font-bold text-white shadow-lg transition-all hover:bg-emerald-400 active:scale-95"
        >
          Continue
        </Link>
        <button
          onClick={onRetry}
          className="w-full rounded-2xl border-2 border-slate-600 py-4 text-lg font-bold text-slate-300 transition-all hover:border-slate-400 hover:text-white active:scale-95"
        >
          Practice again
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-700 bg-slate-800 px-6 py-4">
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
