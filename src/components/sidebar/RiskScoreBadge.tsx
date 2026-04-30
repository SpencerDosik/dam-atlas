import { getTierHex } from "@/lib/colors";
import type { RiskTier } from "@/types/dam";

interface RiskScoreBadgeProps {
  score: number;
  tier: RiskTier;
  size?: "sm" | "lg";
}

export function RiskScoreBadge({ score, tier, size = "lg" }: RiskScoreBadgeProps) {
  const color = getTierHex(tier);
  const isLarge = size === "lg";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex items-center justify-center rounded-full font-bold tabular-nums text-white ${
          isLarge ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm"
        }`}
        style={{ backgroundColor: color }}
        aria-label={`Risk score ${score}`}
      >
        {score}
      </div>
      <span
        className={`font-medium ${isLarge ? "text-sm" : "text-xs"}`}
        style={{ color }}
      >
        {tier}
      </span>
    </div>
  );
}
