"use client";

import type { UserProgress } from "@/lib/types";
import { getStreakEncouragement } from "@/lib/progress";
import { getStudyTrack } from "@/lib/daily-quiz-data";

interface DashboardProps {
  progress: UserProgress;
  onChangeTopic: () => void;
}

const XP_PER_LEVEL = 100;

export function Dashboard({ progress, onChangeTopic }: DashboardProps) {
  const track = progress.selectedTopicId ? getStudyTrack(progress.selectedTopicId) : null;

  const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1;
  const xpInLevel = progress.xp % XP_PER_LEVEL;
  const xpPct = (xpInLevel / XP_PER_LEVEL) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/95">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <span className="text-lg font-bold text-white">DevGame</span>
          {track && (
            <span className={`text-sm font-medium ${track.textClass}`}>
              {track.icon} {track.title}
            </span>
          )}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-8">
        {/* Streak section */}
        <div className="mb-8 w-full rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-950/40 to-slate-800 p-6 text-center">
          <div className="mb-1 text-5xl">🔥</div>
          <div className="text-4xl font-black text-orange-400">{progress.streak}</div>
          <div className="mb-3 text-sm font-medium text-orange-300/80">
            {progress.streak === 1 ? "day streak" : "day streak"}
          </div>
          <p className="text-sm text-slate-300">{getStreakEncouragement(progress.streak)}</p>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid w-full grid-cols-3 gap-3">
          <StatCard label="Level" value={`${level}`} color="text-emerald-400" icon="⭐" />
          <StatCard label="Total XP" value={`${progress.xp}`} color="text-indigo-400" icon="💎" />
          <StatCard
            label="Quizzes"
            value={`${Object.keys(progress.completedLessons).length}`}
            color="text-amber-400"
            icon="📝"
          />
        </div>

        {/* XP progress bar */}
        <div className="mb-8 w-full">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Level {level}</span>
            <span>
              {xpInLevel} / {XP_PER_LEVEL} XP to next level
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>

        {/* Today's status */}
        <div className="mb-8 w-full rounded-2xl border-2 border-emerald-500/30 bg-emerald-950/20 p-6 text-center">
          <div className="mb-2 text-4xl">✅</div>
          <h2 className="mb-1 text-xl font-bold text-emerald-400">Today&apos;s quiz complete!</h2>
          <p className="text-sm text-slate-400">
            Come back tomorrow for a new set of questions. Consistency is the key to mastery!
          </p>
        </div>

        {/* Change topic */}
        <button
          onClick={onChangeTopic}
          className="w-full rounded-2xl border-2 border-slate-700 py-3 text-sm font-medium text-slate-400 transition-all hover:border-slate-500 hover:text-slate-200"
        >
          Change study track
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-700 bg-slate-800 p-4">
      <span className="text-lg">{icon}</span>
      <span className={`text-xl font-black ${color}`}>{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
