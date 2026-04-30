import type { HazardPotential, Condition, RiskTier } from "@/types/dam";

const HAZARD_WEIGHT: Record<HazardPotential, number> = {
  High: 100,
  Significant: 60,
  Low: 20,
  Undetermined: 0,
};

const CONDITION_WEIGHT: Record<Condition, number> = {
  Poor: 100,
  Unsatisfactory: 100,
  Fair: 60,
  Satisfactory: 20,
  "Not Rated": 40,
};

export function computeRiskScore(hazard: HazardPotential, condition: Condition): number {
  return Math.round(0.6 * HAZARD_WEIGHT[hazard] + 0.4 * CONDITION_WEIGHT[condition]);
}

export function computeRiskTier(score: number): RiskTier {
  if (score >= 80) return "Critical";
  if (score >= 60) return "Elevated";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Low";
  return "Minimal";
}
