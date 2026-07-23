"use client";

import { getStudyTrack } from "@/lib/daily-quiz-data";
import { getStreakEncouragement } from "@/lib/progress";

interface QuizResultScreenProps {
  trackId: string;
  xpEarned: number;
  correctCount: number;
  totalQuestions: number;
  streak: number;
  onContinue: () => void;
}

export function QuizResultScreen({
  trackId,
  xpEarned,
  correctCount,
  totalQuestions,
  streak,
  onContinue,
}: QuizResultScreenProps) {
  const track = getStudyTrack(trackId);
  const accuracy = Math.round((correctCount / totalQuestions) * 100);
  const isPerfect = correctCount === totalQuestions;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-center">
      <div className="animate-bounce-once mb-4 text-8xl">
        {isPerfect ? "🏆" : accuracy >= 60 ? "🎯" : "💪"}
      </div>

      <h1 className="mb-1 text-3xl font-black text-white">
        {isPerfect ? "Perfect!" : accuracy >= 60 ? "Well done!" : "Keep going!"}
      </h1>
      <p className={`mb-6 text-sm font-medium ${track?.textClass ?? "text-slate-400"}`}>
        {track?.title} Daily Quiz
      </p>

      {/* Streak highlight */}
      <div className="mb-6 flex items-center gap-2 rounded-full bg-orange-950/40 px-5 py-2">
        <span className="text-2xl">🔥</span>
        <span className="text-lg font-bold text-orange-400">{streak}-day streak</span>
      </div>

      <p className="mb-8 max-w-xs text-sm text-slate-400">{getStreakEncouragement(streak)}</p>

      {/* Stats */}
      <div className="mb-10 flex gap-4">
        <Stat label="XP earned" value={`+${xpEarned}`} color="text-emerald-400" />
        <Stat label="Accuracy" value={`${accuracy}%`} color="text-indigo-400" />
        <Stat label="Correct" value={`${correctCount}/${totalQuestions}`} color="text-amber-400" />
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-xs rounded-2xl bg-emerald-500 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-emerald-400 active:scale-95"
      >
        Continue
      </button>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3">
      <span className={`text-xl font-black ${color}`}>{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
