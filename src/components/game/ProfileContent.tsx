"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { loadProgressFromServer } from "@/app/actions/auth";
import { loadProgress } from "@/lib/progress";
import { getCategoryProgress, getCategoryTotal, QUESTIONS_PER_SLOT } from "@/lib/progress";
import { getTrackStyle, CATEGORY_ORDER, SKILL_ORDER } from "@/lib/track-styles";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { Icon, FireIcon, TrophyIcon, BoltIcon, ChartIcon } from "@/components/Icons";
import type { UserProgress, DifficultyTier } from "@/lib/types";
import type { SkillStats } from "@/app/actions/questions";

const XP_PER_LEVEL = 100;
const DIFFICULTIES: DifficultyTier[] = ["EASY", "MEDIUM", "HARD"];

function getAccuracy(progress: UserProgress): number {
  let totalAnswered = 0;
  let totalCorrect = 0;
  for (const stats of Object.values(progress.difficultyStats)) {
    for (const d of DIFFICULTIES) {
      totalAnswered += stats[d].answered;
      totalCorrect += stats[d].correct;
    }
  }
  return totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
}

function getTotalAnswered(progress: UserProgress): number {
  let total = 0;
  for (const slugs of Object.values(progress.answeredSlugs)) {
    total += slugs.length;
  }
  return total;
}

function getLongestStreak(progress: UserProgress): number {
  return progress.streak;
}

function getRecentDays(progress: UserProgress): string[] {
  if (!progress.lastPlayedDate) return [];
  const days: string[] = [];
  const last = new Date(progress.lastPlayedDate + "T00:00:00");
  for (let i = 0; i < progress.streak && i < 14; i++) {
    const d = new Date(last);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function ActivityGrid({ activeDays }: { activeDays: string[] }) {
  const today = new Date();
  const cells: { date: string; active: boolean }[] = [];
  const activeSet = new Set(activeDays);

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    cells.push({ date: dateStr, active: activeSet.has(dateStr) });
  }

  return (
    <div className="flex gap-1.5">
      {cells.map((cell) => (
        <div
          key={cell.date}
          title={cell.date}
          className={`h-6 w-6 rounded-md transition-colors ${
            cell.active ? "bg-emerald-500" : "bg-surface-inset"
          }`}
        />
      ))}
    </div>
  );
}

export function ProfileContent({ skillStats }: { skillStats: SkillStats[] }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user) {
        const { data } = await loadProgressFromServer();
        if (data) {
          setProgress(data as UserProgress);
        } else {
          setProgress(loadProgress());
        }
      } else {
        setProgress(loadProgress());
      }
      setLoading(false);
    }
    if (!authLoading) load();
  }, [user, authLoading]);

  if (loading || authLoading || !progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="font-mono text-fg-muted">Loading...</p>
      </div>
    );
  }

  const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1;
  const xpInLevel = progress.xp % XP_PER_LEVEL;
  const xpPct = (xpInLevel / XP_PER_LEVEL) * 100;
  const accuracy = getAccuracy(progress);
  const totalAnswered = getTotalAnswered(progress);
  const longestStreak = getLongestStreak(progress);
  const recentDays = getRecentDays(progress);

  const categoriesWithQuestions = new Set(skillStats.map((s) => s.category));
  const categories = CATEGORY_ORDER.filter(
    (c) => SKILL_ORDER[c] && categoriesWithQuestions.has(c),
  );

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-line bg-surface-overlay">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <button
            onClick={() => router.push("/")}
            className="font-mono text-lg font-bold text-fg hover:opacity-80"
          >
            <span className="text-fg-muted">&lt;</span>
            LearningStack
            <span className="text-fg-muted"> /&gt;</span>
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
        <h1 className="mb-6 font-mono text-xl font-bold text-fg">{"// profile"}</h1>

        {user && (
          <p className="mb-4 truncate font-mono text-sm text-fg-muted">{user.email}</p>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3">
          <StatCard
            icon={<BoltIcon className="h-5 w-5 text-emerald-500" />}
            label="Total XP"
            value={`${progress.xp}`}
            sub={`Level ${level}`}
          />
          <StatCard
            icon={<FireIcon className="h-5 w-5 text-orange-500" />}
            label="Current Streak"
            value={`${longestStreak}`}
            sub={longestStreak === 1 ? "day" : "days"}
          />
          <StatCard
            icon={<TrophyIcon className="h-5 w-5 text-amber-500" />}
            label="Accuracy"
            value={`${accuracy}%`}
            sub={`${totalAnswered} answered`}
          />
          <StatCard
            icon={<ChartIcon className="h-5 w-5 text-indigo-500" />}
            label="Level Progress"
            value={`${xpInLevel}/${XP_PER_LEVEL}`}
            sub={`${Math.round(xpPct)}% to next`}
          />
        </div>

        <div className="mb-6 rounded-2xl border border-line bg-surface-raised p-4">
          <h2 className="mb-3 font-mono text-sm font-bold text-fg">{"// recent_activity"}</h2>
          {recentDays.length > 0 ? (
            <>
              <ActivityGrid activeDays={recentDays} />
              <p className="mt-2 font-mono text-xs text-fg-faint">Last 14 days</p>
            </>
          ) : (
            <p className="font-mono text-xs text-fg-muted">No activity yet. Start a quiz!</p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface-raised p-4">
          <h2 className="mb-3 font-mono text-sm font-bold text-fg">{"// category_progress"}</h2>
          <div className="space-y-3">
            {categories.map((category) => {
              const style = getTrackStyle(category);
              const answered = getCategoryProgress(progress, category);
              const total = getCategoryTotal(category);
              const pct = total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;

              const skills = SKILL_ORDER[category] ?? [];
              let totalCorrect = 0;
              let totalAttempted = 0;
              const catStats = progress.difficultyStats[category];
              if (catStats) {
                for (const d of DIFFICULTIES) {
                  totalCorrect += catStats[d].correct;
                  totalAttempted += catStats[d].answered;
                }
              }
              const catAccuracy =
                totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

              return (
                <div key={category} className="rounded-xl border border-line bg-surface p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon name={style.icon} className={`h-5 w-5 ${style.textClass}`} />
                    <span className="text-sm font-bold text-fg">{category}</span>
                    <span className="ml-auto font-mono text-xs text-fg-faint">{pct}%</span>
                  </div>
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-surface-inset">
                    <div
                      className={`h-full rounded-full ${style.bgClass} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex gap-4 font-mono text-xs text-fg-muted">
                    <span>
                      {answered}/{total} questions
                    </span>
                    {totalAttempted > 0 && <span>{catAccuracy}% accuracy</span>}
                    <span>{skills.length * DIFFICULTIES.length * QUESTIONS_PER_SLOT === answered ? "Completed" : `${skills.length} skills`}</span>
                  </div>
                </div>
              );
            })}
            {categories.length === 0 && (
              <p className="font-mono text-xs text-fg-muted">
                No progress yet. Start answering questions!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="font-mono text-xs text-fg-muted">{label}</span>
      </div>
      <div className="font-mono text-2xl font-black text-fg">{value}</div>
      <div className="font-mono text-xs text-fg-faint">{sub}</div>
    </div>
  );
}
