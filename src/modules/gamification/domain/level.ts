export interface LevelThreshold {
  level: number;
  xpRequired: number;
}

export const DEFAULT_LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 100 },
  { level: 3, xpRequired: 300 },
  { level: 4, xpRequired: 600 },
  { level: 5, xpRequired: 1_000 },
  { level: 6, xpRequired: 1_500 },
  { level: 7, xpRequired: 2_200 },
  { level: 8, xpRequired: 3_000 },
  { level: 9, xpRequired: 4_000 },
  { level: 10, xpRequired: 5_000 },
  { level: 15, xpRequired: 12_000 },
  { level: 20, xpRequired: 25_000 },
  { level: 25, xpRequired: 50_000 },
  { level: 30, xpRequired: 100_000 },
];

export function calculateLevel(
  totalXp: number,
  thresholds: LevelThreshold[] = DEFAULT_LEVEL_THRESHOLDS,
): number {
  let level = 1;
  for (const t of thresholds) {
    if (totalXp >= t.xpRequired) {
      level = t.level;
    } else {
      break;
    }
  }
  return level;
}

export function xpForNextLevel(
  totalXp: number,
  thresholds: LevelThreshold[] = DEFAULT_LEVEL_THRESHOLDS,
): { currentLevel: number; xpInLevel: number; xpToNext: number } | null {
  const currentLevel = calculateLevel(totalXp, thresholds);
  const currentThreshold = thresholds.find((t) => t.level === currentLevel);
  const nextThreshold = thresholds.find((t) => t.level > currentLevel);

  if (!currentThreshold || !nextThreshold) return null;

  const xpInLevel = totalXp - currentThreshold.xpRequired;
  const xpToNext = nextThreshold.xpRequired - currentThreshold.xpRequired;

  return { currentLevel, xpInLevel, xpToNext };
}
