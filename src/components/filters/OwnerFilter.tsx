import { useFilterStore } from "@/store/useFilterStore";
import type { DamFeature, OwnerType } from "@/types/dam";

const OWNER_TYPES: OwnerType[] = [
  "Federal",
  "State",
  "Local Government",
  "Public Utility",
  "Private",
  "Other",
];

interface OwnerFilterProps {
  features: DamFeature[];
}

export function OwnerFilter({ features }: OwnerFilterProps) {
  const { ownerTypes, toggleOwnerType } = useFilterStore();

  const counts = features.reduce<Record<string, number>>((acc, f) => {
    const o = f.properties.ownerType;
    if (o) acc[o] = (acc[o] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <fieldset className="border-b border-border-subtle px-3 py-3">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        Owner Type
        {ownerTypes.size > 0 && <span className="ml-1 text-accent">({ownerTypes.size})</span>}
      </legend>
      <div className="space-y-1.5">
        {OWNER_TYPES.map((o) => (
          <label key={o} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={ownerTypes.has(o)}
              onChange={() => toggleOwnerType(o)}
              className="h-3.5 w-3.5 accent-accent"
              aria-label={`Filter by owner type ${o}`}
            />
            <span className="flex-1 text-sm text-text-secondary">{o}</span>
            <span className="tabular-nums text-xs text-text-tertiary">
              {(counts[o] ?? 0).toLocaleString()}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
