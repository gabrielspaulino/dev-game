"use client";

import type { TrackStyle } from "@/lib/track-styles";
import type { DifficultyTier } from "@/lib/types";
import { getStreakEncouragement } from "@/lib/progress";
import { TrophyIcon, TargetIcon, BoltIcon, FireIcon } from "@/components/Icons";
import { ShareResult } from "./ShareResult";

interface QuizResultScreenProps {
  trackStyle: TrackStyle;
  xpEarned: number;
  correctCount: number;
  totalQuestions: number;
  difficulty: DifficultyTier;
  streak: number;
  onContinue: () => void;
}

export function QuizResultScreen({
  trackStyle,
  xpEarned,
  correctCount,
  totalQuestions,
  difficulty,
  streak,
  onContinue,
}: QuizResultScreenProps) {
  const accuracy = Math.round((correctCount / totalQuestions) * 100);
  const isPerfect = correctCount === totalQuestions;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-6 text-center">
      <div className="animate-bounce-once mb-4">
        {isPerfect ? (
          <TrophyIcon className="h-24 w-24 text-fg" />
        ) : accuracy >= 60 ? (
          <TargetIcon className="h-24 w-24 text-fg" />
        ) : (
          <BoltIcon className="h-24 w-24 text-fg" />
        )}
      </div>

      <h1 className="mb-1 font-mono text-3xl font-black text-fg">
        {isPerfect ? "Zero bugs!" : accuracy >= 60 ? "Build succeeded!" : "Debug harder!"}
      </h1>
      <p className={`mb-6 font-mono text-sm font-medium ${trackStyle.textClass}`}>
        {trackStyle.title}
      </p>

      <div className="mb-6 flex items-center gap-2 rounded-full bg-orange-50 px-5 py-2 dark:bg-orange-950/40">
        <FireIcon className="h-7 w-7 text-orange-500" />
        <span className="font-mono text-lg font-bold text-orange-600 dark:text-orange-400">
          {streak}-day streak
        </span>
      </div>

      <p className="mb-8 max-w-xs text-sm text-fg-muted">{getStreakEncouragement(streak)}</p>

      <div className="mb-10 flex gap-4">
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
          value={`${correctCount}/${totalQuestions}`}
          color="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="mb-6">
        <p className="mb-3 font-mono text-xs text-fg-muted">{"// share_your_result"}</p>
        <ShareResult
          correctCount={correctCount}
          totalQuestions={totalQuestions}
          trackTitle={trackStyle.title}
          difficulty={difficulty}
          streak={streak}
        />
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-xs rounded-2xl bg-emerald-500 py-4 font-mono text-lg font-bold text-white shadow-lg transition-all hover:bg-emerald-400 active:scale-95"
      >
        {"> continue"}
      </button>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-surface-raised px-5 py-3">
      <span className={`font-mono text-xl font-black ${color}`}>{value}</span>
      <span className="text-xs text-fg-muted">{label}</span>
    </div>
  );
}
