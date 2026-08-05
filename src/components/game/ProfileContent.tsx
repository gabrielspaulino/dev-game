"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { updateProfile } from "@/app/actions/auth";
import {
  getCategoryProgress,
  getCurrentSlot,
  getLevelProgress,
  getLevelTotal,
  isCategoryComplete,
} from "@/lib/progress";
import { getTrackStyle, CATEGORY_ORDER, SKILL_ORDER } from "@/lib/track-styles";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { Icon, FireIcon, TrophyIcon, BoltIcon, ChartIcon } from "@/components/Icons";
import { DIFFICULTY_LABELS } from "@/lib/types";
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

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getRecentDays(progress: UserProgress): string[] {
  if (!progress.activityDates || progress.activityDates.length === 0) return [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const cutoffStr = formatLocalDate(cutoff);
  return progress.activityDates.filter((d) => d >= cutoffStr);
}

function ActivityGrid({ activeDays }: { activeDays: string[] }) {
  const today = new Date();
  const cells: { date: string; active: boolean }[] = [];
  const activeSet = new Set(activeDays);

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
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
  const { user, loading: authLoading, progress, refresh } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);

  function startEditing() {
    setFirstName(user?.user_metadata?.first_name ?? "");
    setLastName(user?.user_metadata?.last_name ?? "");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await updateProfile(firstName, lastName);
    if (!error) {
      await refresh();
      setEditing(false);
    }
    setSaving(false);
  }

  if (authLoading || !progress) {
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
  const categories = CATEGORY_ORDER.filter((c) => SKILL_ORDER[c] && categoriesWithQuestions.has(c));

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
          <div className="mb-4">
            {editing ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full rounded-lg border border-line bg-surface-raised px-3 py-1.5 font-mono text-sm text-fg placeholder:text-fg-faint focus:border-emerald-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full rounded-lg border border-line bg-surface-raised px-3 py-1.5 font-mono text-sm text-fg placeholder:text-fg-faint focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-emerald-500 px-3 py-1 font-mono text-xs font-bold text-white transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-line px-3 py-1 font-mono text-xs font-bold text-fg-muted transition-all hover:border-fg-muted active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  {(user.user_metadata?.first_name || user.user_metadata?.last_name) && (
                    <p className="font-mono text-base font-bold text-fg">
                      {[user.user_metadata.first_name, user.user_metadata.last_name]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  )}
                  <p className="truncate font-mono text-sm text-fg-muted">{user.email}</p>
                </div>
                <button
                  onClick={startEditing}
                  className="shrink-0 rounded-lg border border-line px-2.5 py-1 font-mono text-xs text-fg-muted transition-all hover:border-fg-muted hover:text-fg active:scale-95"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
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
            {categories
              .filter((category) => getCategoryProgress(progress, category) > 0)
              .map((category) => {
                const style = getTrackStyle(category);
                const isComplete = isCategoryComplete(progress, category);
                const slot = getCurrentSlot(progress, category);
                const currentDifficulty = slot?.difficulty ?? "EASY";

                const levelAnswered = getLevelProgress(progress, category, currentDifficulty);
                const levelTotal = getLevelTotal(category);
                const pct = isComplete
                  ? 100
                  : levelTotal > 0
                    ? Math.min(100, Math.round((levelAnswered / levelTotal) * 100))
                    : 0;

                const skills = SKILL_ORDER[category] ?? [];
                let totalCorrect = 0;
                let totalAttempted = 0;
                for (const skill of skills) {
                  const skillDiffStats = progress.difficultyStats[skill];
                  if (skillDiffStats) {
                    for (const d of DIFFICULTIES) {
                      totalCorrect += skillDiffStats[d].correct;
                      totalAttempted += skillDiffStats[d].answered;
                    }
                  }
                }
                const catAccuracy =
                  totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

                let justUnlocked = false;
                if (!isComplete && currentDifficulty !== "EASY") {
                  let answeredAtDifficulty = 0;
                  for (const skill of skills) {
                    answeredAtDifficulty +=
                      progress.slotProgress[`${skill}:${currentDifficulty}`] ?? 0;
                  }
                  justUnlocked = answeredAtDifficulty === 0;
                }

                return (
                  <div key={category} className="rounded-xl border border-line bg-surface p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name={style.icon} className={`h-5 w-5 ${style.textClass}`} />
                      <span className="text-sm font-bold text-fg">{category}</span>
                      <span className="ml-auto font-mono text-xs text-fg-faint">
                        {isComplete ? "Complete" : DIFFICULTY_LABELS[currentDifficulty]}
                      </span>
                    </div>
                    <div className="mb-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-inset">
                        <div
                          className={`h-full rounded-full ${style.bgClass} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-fg-faint">{pct}%</span>
                    </div>
                    <div className="font-mono text-xs">
                      <div className="flex gap-4 text-fg-muted">
                        {totalAttempted > 0 && <span>{catAccuracy}% accuracy</span>}
                      </div>
                      {justUnlocked && (
                        <p className="mt-1 text-emerald-500">
                          {"→ "}
                          {currentDifficulty === "MEDIUM"
                            ? "Foundations complete — ready for intermediate"
                            : "Intermediate complete — ready for advanced"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            {categories.filter((c) => getCategoryProgress(progress, c) > 0).length === 0 && (
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
