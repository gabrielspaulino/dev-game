export interface MasteryConfig {
  baseGain: number;
  baseLoss: number;
  difficultyGainMultiplier: number;
  difficultyLossMultiplier: number;
  hintPenaltyPercent: number;
  challengeBonusPercent: number;
  recencyDecayPerDay: number;
  maxRecencyDecay: number;
}

export const DEFAULT_MASTERY_CONFIG: MasteryConfig = {
  baseGain: 5,
  baseLoss: 3,
  difficultyGainMultiplier: 0.5,
  difficultyLossMultiplier: 0.3,
  hintPenaltyPercent: 30,
  challengeBonusPercent: 25,
  recencyDecayPerDay: 0.5,
  maxRecencyDecay: 15,
};

export const MASTERY_MIN = 0;
export const MASTERY_MAX = 100;

export interface MasteryBand {
  min: number;
  max: number;
  label: string;
}

export const MASTERY_BANDS: MasteryBand[] = [
  { min: 0, max: 29, label: "Beginner" },
  { min: 30, max: 49, label: "Developing" },
  { min: 50, max: 69, label: "Competent" },
  { min: 70, max: 84, label: "Proficient" },
  { min: 85, max: 100, label: "Advanced" },
];

export function getMasteryBand(mastery: number): string {
  for (const band of MASTERY_BANDS) {
    if (mastery >= band.min && mastery <= band.max) return band.label;
  }
  return "Beginner";
}

export function calculateMasteryGain(
  config: MasteryConfig,
  difficulty: number,
  usedHint: boolean,
  isChallenge: boolean,
): number {
  let gain = config.baseGain + difficulty * config.difficultyGainMultiplier;

  if (usedHint) {
    gain *= 1 - config.hintPenaltyPercent / 100;
  }

  if (isChallenge) {
    gain *= 1 + config.challengeBonusPercent / 100;
  }

  return Math.round(gain);
}

export function calculateMasteryLoss(config: MasteryConfig, difficulty: number): number {
  return Math.round(config.baseLoss + difficulty * config.difficultyLossMultiplier);
}

export function applyMasteryChange(
  currentMastery: number,
  isCorrect: boolean,
  config: MasteryConfig,
  difficulty: number,
  usedHint: boolean,
  isChallenge: boolean,
): number {
  if (isCorrect) {
    const gain = calculateMasteryGain(config, difficulty, usedHint, isChallenge);
    return Math.min(MASTERY_MAX, currentMastery + gain);
  }
  const loss = calculateMasteryLoss(config, difficulty);
  return Math.max(MASTERY_MIN, currentMastery - loss);
}

export function applyRecencyDecay(
  currentMastery: number,
  daysSinceLastReview: number,
  config: MasteryConfig,
): number {
  if (daysSinceLastReview <= 0) return currentMastery;
  const decay = Math.min(config.maxRecencyDecay, daysSinceLastReview * config.recencyDecayPerDay);
  return Math.max(MASTERY_MIN, Math.round(currentMastery - decay));
}
