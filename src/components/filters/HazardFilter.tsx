import { useFilterStore } from "@/store/useFilterStore";
import { getHazardHex } from "@/lib/colors";
import type { DamFeature, HazardPotential } from "@/types/dam";

const HAZARDS: HazardPotential[] = ["High", "Significant", "Low", "Undetermined"];

interface HazardFilterProps {
  features: DamFeature[];
}

export function HazardFilter({ features }: HazardFilterProps) {
  const { hazard, toggleHazard } = useFilterStore();

  const counts = features.reduce<Record<string, number>>((acc, f) => {
    const h = f.properties.hazardPotential;
    acc[h] = (acc[h] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <fieldset className="border-b border-border-subtle px-3 py-3">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        Hazard Class
        {hazard.size > 0 && (
          <span className="ml-1 text-accent">({hazard.size})</span>
        )}
      </legend>
      <div className="space-y-1.5">
        {HAZARDS.map((h) => (
          <label key={h} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={hazard.has(h)}
              onChange={() => toggleHazard(h)}
              className="h-3.5 w-3.5 accent-accent"
              aria-label={`Filter by ${h} hazard`}
            />
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: getHazardHex(h) }}
              aria-hidden="true"
            />
            <span className="flex-1 text-sm text-text-secondary">{h}</span>
            <span className="tabular-nums text-xs text-text-tertiary">
              {(counts[h] ?? 0).toLocaleString()}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
