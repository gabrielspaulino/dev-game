"use client";

import type { UserProgress } from "@/lib/types";
import { getStreakEncouragement } from "@/lib/progress";
import { getStudyTrack } from "@/lib/daily-quiz-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icon, FireIcon, CheckCircleIcon } from "@/components/Icons";

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
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-line bg-surface-overlay">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <span className="font-mono text-lg font-bold text-fg">
            <span className="text-fg-muted">&lt;</span>
            DevGame
            <span className="text-fg-muted"> /&gt;</span>
          </span>
          <div className="flex items-center gap-3">
            {track && (
              <span
                className={`flex items-center gap-1.5 font-mono text-sm font-medium ${track.textClass}`}
              >
                <Icon name={track.icon} className="inline h-4 w-4" />
                {track.title}
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-8">
        <div className="mb-8 w-full rounded-2xl border-2 border-orange-300 bg-orange-50 p-6 text-center dark:border-orange-500/30 dark:bg-gradient-to-br dark:from-orange-950/40 dark:to-surface-raised">
          <FireIcon className="mx-auto mb-1 h-12 w-12 text-orange-500" />
          <div className="font-mono text-4xl font-black text-orange-600 dark:text-orange-400">
            {progress.streak}
          </div>
          <div className="mb-3 font-mono text-sm font-medium text-orange-500 dark:text-orange-300/80">
            commit streak
          </div>
          <p className="text-sm text-fg-secondary">{getStreakEncouragement(progress.streak)}</p>
        </div>

        <div className="mb-8 grid w-full grid-cols-3 gap-3">
          <StatCard
            label="Level"
            value={`${level}`}
            color="text-emerald-600 dark:text-emerald-400"
            icon="$"
          />
          <StatCard
            label="Total XP"
            value={`${progress.xp}`}
            color="text-indigo-600 dark:text-indigo-400"
            icon="+"
          />
          <StatCard
            label="Commits"
            value={`${Object.keys(progress.completedLessons).length}`}
            color="text-amber-600 dark:text-amber-400"
            icon="#"
          />
        </div>

        <div className="mb-8 w-full">
          <div className="mb-1 flex justify-between font-mono text-xs text-fg-muted">
            <span>Level {level}</span>
            <span>
              {xpInLevel} / {XP_PER_LEVEL} XP
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-inset">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>

        <div className="mb-8 w-full rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-950/20">
          <CheckCircleIcon className="mx-auto mb-2 h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          <h2 className="mb-1 font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">
            All tests passing.
          </h2>
          <p className="font-mono text-sm text-fg-muted">
            {"> "}Process exited. Next build scheduled for tomorrow.
          </p>
        </div>

        <button
          onClick={onChangeTopic}
          className="w-full rounded-2xl border-2 border-line-strong py-3 font-mono text-sm font-medium text-fg-muted transition-all hover:border-fg-muted hover:text-fg-secondary"
        >
          {">"} git checkout [branch]
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
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-surface-raised p-4">
      <span className="font-mono text-lg text-fg-muted">{icon}</span>
      <span className={`font-mono text-xl font-black ${color}`}>{value}</span>
      <span className="text-xs text-fg-muted">{label}</span>
    </div>
  );
}
