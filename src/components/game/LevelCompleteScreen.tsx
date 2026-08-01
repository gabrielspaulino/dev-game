"use client";

import type { TrackStyle } from "@/lib/track-styles";
import type { DifficultyTier } from "@/lib/types";
import type { SkillAccuracy } from "@/lib/progress";
import { DIFFICULTY_LABELS } from "@/lib/types";
import { ADVANCE_THRESHOLD } from "@/lib/progress";
import { TrophyIcon, BoltIcon, TargetIcon } from "@/components/Icons";

interface LevelCompleteScreenProps {
  category: string;
  difficulty: DifficultyTier;
  trackStyle: TrackStyle;
  accuracy: number;
  skillAccuracies: SkillAccuracy[];
  isRoadmapComplete: boolean;
  improvementAreas: { skillCode: string; accuracy: number; difficulty: DifficultyTier }[];
  onAdvance: () => void;
  onRestart: () => void;
}

function formatSkillName(skillCode: string): string {
  return skillCode
    .replace(/^[a-z]+-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function LevelCompleteScreen({
  category,
  difficulty,
  trackStyle,
  accuracy,
  skillAccuracies,
  isRoadmapComplete,
  improvementAreas,
  onAdvance,
  onRestart,
}: LevelCompleteScreenProps) {
  const canAdvance = accuracy >= ADVANCE_THRESHOLD;
  const levelLabel = DIFFICULTY_LABELS[difficulty];

  return (
    <div className="flex min-h-screen flex-col items-center bg-surface p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4">
            {isRoadmapComplete ? (
              <TrophyIcon className="mx-auto h-20 w-20 text-amber-500" />
            ) : canAdvance ? (
              <TargetIcon className="mx-auto h-20 w-20 text-emerald-500" />
            ) : (
              <BoltIcon className="mx-auto h-20 w-20 text-red-500" />
            )}
          </div>

          <h1 className="mb-1 font-mono text-2xl font-black text-fg">
            {isRoadmapComplete ? "Roadmap complete!" : `${levelLabel} complete!`}
          </h1>
          <p className={`font-mono text-sm font-medium ${trackStyle.textClass}`}>{category}</p>
        </div>

        <div className="mb-6 rounded-2xl border border-line bg-surface-raised p-4 text-center">
          <p className="mb-1 font-mono text-xs text-fg-muted">Overall accuracy</p>
          <p
            className={`font-mono text-4xl font-black ${
              canAdvance
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {accuracy}%
          </p>
          {!isRoadmapComplete && (
            <p className="mt-1 font-mono text-xs text-fg-faint">
              {canAdvance
                ? "You passed the threshold!"
                : `${ADVANCE_THRESHOLD}% required to advance`}
            </p>
          )}
        </div>

        <div className="mb-6 rounded-2xl border border-line bg-surface-raised p-4">
          <p className="mb-3 font-mono text-xs font-bold text-fg-muted">{"// skill_breakdown"}</p>
          <div className="space-y-2">
            {skillAccuracies.map((s) => (
              <div key={s.skillCode} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate font-mono text-sm text-fg">
                  {formatSkillName(s.skillCode)}
                </span>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-inset">
                  <div
                    className={`h-full rounded-full transition-all ${
                      s.accuracy >= ADVANCE_THRESHOLD
                        ? "bg-emerald-500"
                        : s.accuracy >= 50
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${s.accuracy}%` }}
                  />
                </div>
                <span
                  className={`w-10 text-right font-mono text-xs font-bold ${
                    s.accuracy >= ADVANCE_THRESHOLD
                      ? "text-emerald-600 dark:text-emerald-400"
                      : s.accuracy >= 50
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {s.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {isRoadmapComplete && improvementAreas.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-50 p-4 dark:bg-amber-900/20">
            <p className="mb-3 font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
              {"// improvement_areas"}
            </p>
            <div className="space-y-1.5">
              {improvementAreas.slice(0, 5).map((area, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-mono text-xs text-amber-800 dark:text-amber-300">
                    {formatSkillName(area.skillCode)}{" "}
                    <span className="text-amber-600/60 dark:text-amber-400/60">
                      ({DIFFICULTY_LABELS[area.difficulty]})
                    </span>
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                    {area.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!canAdvance && !isRoadmapComplete && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-50 p-4 dark:bg-red-900/20">
            <p className="font-mono text-sm text-red-700 dark:text-red-400">
              You need at least {ADVANCE_THRESHOLD}% accuracy to unlock{" "}
              {difficulty === "EASY" ? "Intermediate" : "Advanced"}. Restart this level to try
              again.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {canAdvance && !isRoadmapComplete && (
            <button
              onClick={onAdvance}
              className={`w-full rounded-2xl py-4 font-mono text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 ${trackStyle.bgClass}`}
            >
              {"> continue to "}
              {difficulty === "EASY" ? "intermediate" : "advanced"}
            </button>
          )}

          <button
            onClick={onRestart}
            className={`w-full rounded-2xl border-2 py-4 font-mono text-lg font-bold transition-all active:scale-95 ${
              canAdvance || isRoadmapComplete
                ? "border-line text-fg-muted hover:border-fg-muted hover:text-fg"
                : `${trackStyle.borderClass} ${trackStyle.textClass} hover:opacity-80`
            }`}
          >
            {isRoadmapComplete ? "> restart roadmap" : "> restart level"}
          </button>

          {isRoadmapComplete && (
            <button
              onClick={onAdvance}
              className="w-full py-3 font-mono text-sm text-fg-faint transition-colors hover:text-fg-muted"
            >
              {"< back to roadmap"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
