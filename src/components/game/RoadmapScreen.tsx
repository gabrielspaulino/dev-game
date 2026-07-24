"use client";

import type { UserProgress } from "@/lib/types";
import type { TrackStyle } from "@/lib/track-styles";
import type { TrackStats } from "@/app/actions/questions";
import { getTrackStyle } from "@/lib/track-styles";
import { getStreakEncouragement } from "@/lib/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icon, FireIcon } from "@/components/Icons";

interface RoadmapScreenProps {
  progress: UserProgress;
  trackStats: TrackStats[];
  onStartQuiz: (category: string) => void;
}

const XP_PER_LEVEL = 100;
export const QUESTIONS_PER_TRACK = 10;

export function RoadmapScreen({ progress, trackStats, onStartQuiz }: RoadmapScreenProps) {
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
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4">
          <div className="flex items-center gap-2">
            <FireIcon className="h-7 w-7 text-orange-500" />
            <div>
              <div className="font-mono text-xl font-black text-orange-600 dark:text-orange-400">
                {progress.streak}
              </div>
              <div className="font-mono text-xs text-fg-muted">streak</div>
            </div>
          </div>
          <div className="h-10 w-px bg-line" />
          <div>
            <div className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
              Lv.{level}
            </div>
            <div className="font-mono text-xs text-fg-muted">{progress.xp} XP</div>
          </div>
          <div className="ml-auto flex-1">
            <div className="mb-1 text-right font-mono text-xs text-fg-faint">
              {xpInLevel}/{XP_PER_LEVEL}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-inset">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>

        {progress.streak > 0 && (
          <p className="mb-6 text-center text-sm text-fg-muted">
            {getStreakEncouragement(progress.streak)}
          </p>
        )}

        <h2 className="mb-1 font-mono text-lg font-bold text-fg">{"// choose_your_stack"}</h2>
        <p className="mb-4 text-sm text-fg-muted">
          Pick a theme and start a quiz with random questions.
        </p>

        <div className="space-y-3">
          {trackStats.map((stat) => {
            const style = getTrackStyle(stat.category);
            const answered = (progress.answeredSlugs[stat.category] ?? []).length;
            const target = stat.skillCount * QUESTIONS_PER_TRACK;
            const pct = target > 0 ? Math.min(100, Math.round((answered / target) * 100)) : 0;

            return (
              <TrackCard
                key={stat.category}
                style={style}
                progressPct={pct}
                isSelected={progress.selectedTopicId === stat.category}
                onStart={() => onStartQuiz(stat.category)}
              />
            );
          })}
        </div>

        {trackStats.length === 0 && (
          <div className="rounded-2xl border border-line bg-surface-raised p-8 text-center">
            <p className="font-mono text-fg-muted">No questions available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TrackCard({
  style,
  progressPct,
  isSelected,
  onStart,
}: {
  style: TrackStyle;
  progressPct: number;
  isSelected: boolean;
  onStart: () => void;
}) {
  return (
    <button
      onClick={onStart}
      className={`w-full rounded-2xl border-2 p-5 text-left transition-all duration-150 active:scale-[0.98] ${
        isSelected
          ? `${style.borderClass} bg-surface-raised`
          : "border-line-strong bg-surface-raised hover:border-fg-muted"
      }`}
    >
      <div className="flex items-center gap-4">
        <Icon name={style.icon} className="h-9 w-9 text-fg-secondary" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-fg">{style.title}</span>
            {isSelected && (
              <span className={`font-mono text-xs font-medium ${style.textClass}`}>current</span>
            )}
          </div>
          <div className="text-sm text-fg-muted">{style.description}</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-inset">
              <div
                className={`h-full rounded-full ${style.bgClass} transition-all duration-500`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="font-mono text-xs text-fg-faint">{progressPct}%</span>
          </div>
        </div>
        <span className={`font-mono text-sm font-bold ${style.textClass}`}>&gt;</span>
      </div>
    </button>
  );
}
