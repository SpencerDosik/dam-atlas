import { useFilterStore } from "@/store/useFilterStore";
import type { DamFeature, Condition } from "@/types/dam";

const CONDITIONS: Condition[] = ["Satisfactory", "Fair", "Poor", "Unsatisfactory", "Not Rated"];

interface ConditionFilterProps {
  features: DamFeature[];
}

export function ConditionFilter({ features }: ConditionFilterProps) {
  const { condition, toggleCondition } = useFilterStore();

  const counts = features.reduce<Record<string, number>>((acc, f) => {
    const c = f.properties.condition;
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <fieldset className="border-b border-border-subtle px-3 py-3">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        Condition
        {condition.size > 0 && <span className="ml-1 text-accent">({condition.size})</span>}
      </legend>
      <div className="space-y-1.5">
        {CONDITIONS.map((c) => (
          <label key={c} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={condition.has(c)}
              onChange={() => toggleCondition(c)}
              className="h-3.5 w-3.5 accent-accent"
              aria-label={`Filter by ${c} condition`}
            />
            <span className="flex-1 text-sm text-text-secondary">{c}</span>
            <span className="tabular-nums text-xs text-text-tertiary">
              {(counts[c] ?? 0).toLocaleString()}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
