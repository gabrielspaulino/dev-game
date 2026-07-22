"use client";

import type { UserProgress } from "@/lib/types";
import { MAX_HEARTS } from "@/lib/progress";

interface TopBarProps {
  progress: UserProgress;
}

const XP_PER_LEVEL = 100;

export function TopBar({ progress }: TopBarProps) {
  const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1;
  const xpInLevel = progress.xp % XP_PER_LEVEL;
  const xpPct = (xpInLevel / XP_PER_LEVEL) * 100;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 gap-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5 min-w-[60px]">
          <span className="text-2xl" role="img" aria-label="streak">
            🔥
          </span>
          <span className="text-lg font-bold text-orange-400">
            {progress.streak}
          </span>
        </div>

        {/* XP bar */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Level {level}</span>
            <span>{xpInLevel} / {XP_PER_LEVEL} XP</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-0.5 min-w-[80px] justify-end">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <span
              key={i}
              className={`text-xl transition-all ${
                i < progress.hearts ? "opacity-100" : "opacity-20 grayscale"
              }`}
              role="img"
              aria-label={i < progress.hearts ? "heart" : "lost heart"}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
