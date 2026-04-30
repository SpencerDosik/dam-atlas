import { ChevronDown, ChevronUp } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import type { DamFeature, HazardPotential } from "@/types/dam";

interface LegendProps {
  filteredFeatures: DamFeature[];
}

const HAZARD_ITEMS: { value: HazardPotential; label: string; cssVar: string }[] = [
  { value: "High", label: "High", cssVar: "var(--hazard-high)" },
  { value: "Significant", label: "Significant", cssVar: "var(--hazard-significant)" },
  { value: "Low", label: "Low", cssVar: "var(--hazard-low)" },
  { value: "Undetermined", label: "Undetermined", cssVar: "var(--hazard-unknown)" },
];

const TIER_COLORS = [
  "var(--tier-critical)",
  "var(--tier-elevated)",
  "var(--tier-moderate)",
  "var(--tier-low)",
  "var(--tier-minimal)",
];

export function Legend({ filteredFeatures }: LegendProps) {
  const { legendCollapsed, setLegendCollapsed, colorblindMode, setColorblindMode, showDensityLayer, setShowDensityLayer } =
    useUiStore();

  const filteredCounts = filteredFeatures.reduce<Record<string, number>>((acc, f) => {
    const h = f.properties.hazardPotential;
    acc[h] = (acc[h] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="absolute bottom-12 left-4 z-10 w-52 rounded-xl border border-border-strong bg-bg-overlay/90 shadow-panel glass">
      <button
        onClick={() => setLegendCollapsed(!legendCollapsed)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary"
        aria-expanded={!legendCollapsed}
        aria-controls="legend-content"
      >
        Legend
        {legendCollapsed ? <ChevronDown size={12} aria-hidden="true" /> : <ChevronUp size={12} aria-hidden="true" />}
      </button>

      {!legendCollapsed && (
        <div id="legend-content" className="space-y-3 px-3 pb-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Hazard Potential
            </p>
            <ul className="space-y-1">
              {HAZARD_ITEMS.map(({ value, label, cssVar }) => (
                <li key={value} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: colorblindMode ? getCbColor(value) : cssVar }}
                      aria-hidden="true"
                    />
                    <span className="text-text-secondary">{label}</span>
                  </div>
                  <span className="tabular-nums text-text-tertiary">
                    {(filteredCounts[value] ?? 0).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Risk Tier
            </p>
            <div
              className="h-2 w-full rounded-full"
              style={{
                background: `linear-gradient(to right, ${TIER_COLORS.join(", ")})`,
              }}
              aria-label="Risk tier gradient from Critical (red) to Minimal (green)"
            />
            <div className="mt-0.5 flex justify-between text-xs text-text-tertiary">
              <span>Critical</span>
              <span>Minimal</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-border-subtle pt-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={showDensityLayer}
                onChange={(e) => setShowDensityLayer(e.target.checked)}
                className="h-3 w-3 accent-accent"
              />
              Density overlay (zoom ≤ 4)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={colorblindMode}
                onChange={(e) => setColorblindMode(e.target.checked)}
                className="h-3 w-3 accent-accent"
              />
              Color-blind palette
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function getCbColor(hazard: HazardPotential): string {
  switch (hazard) {
    case "High":
      return "#b91c1c";
    case "Significant":
      return "#d97706";
    case "Low":
      return "#0ea5e9";
    case "Undetermined":
      return "#64748b";
  }
}
