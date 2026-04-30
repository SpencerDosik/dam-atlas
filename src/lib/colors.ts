import type { HazardPotential, RiskTier } from "@/types/dam";

export type ColorArray = [number, number, number, number];

const HAZARD_COLORS: Record<HazardPotential, ColorArray> = {
  High: [239, 68, 68, 255],
  Significant: [245, 158, 11, 255],
  Low: [34, 197, 94, 255],
  Undetermined: [107, 114, 128, 255],
};

const HAZARD_COLORS_COLORBLIND: Record<HazardPotential, ColorArray> = {
  High: [185, 28, 28, 255],
  Significant: [217, 119, 6, 255],
  Low: [14, 165, 233, 255],
  Undetermined: [100, 116, 139, 255],
};

const TIER_HEX: Record<RiskTier, string> = {
  Critical: "#dc2626",
  Elevated: "#f97316",
  Moderate: "#eab308",
  Low: "#84cc16",
  Minimal: "#22c55e",
};

export function getHazardColor(
  hazard: HazardPotential,
  colorblind = false,
  alpha?: number
): ColorArray {
  const base = colorblind ? HAZARD_COLORS_COLORBLIND[hazard] : HAZARD_COLORS[hazard];
  if (alpha !== undefined) {
    return [base[0], base[1], base[2], alpha];
  }
  return base;
}

export function getHazardColorWithRisk(
  hazard: HazardPotential,
  riskScore: number,
  colorblind = false
): ColorArray {
  const alpha = Math.round(160 + (riskScore / 100) * 95);
  return getHazardColor(hazard, colorblind, alpha);
}

export function getTierHex(tier: RiskTier): string {
  return TIER_HEX[tier];
}

export function getHazardCssVar(hazard: HazardPotential): string {
  switch (hazard) {
    case "High":
      return "var(--hazard-high)";
    case "Significant":
      return "var(--hazard-significant)";
    case "Low":
      return "var(--hazard-low)";
    case "Undetermined":
      return "var(--hazard-unknown)";
  }
}

export function getHazardHex(hazard: HazardPotential, colorblind = false): string {
  const c = getHazardColor(hazard, colorblind);
  return `#${c[0].toString(16).padStart(2, "0")}${c[1].toString(16).padStart(2, "0")}${c[2].toString(16).padStart(2, "0")}`;
}
