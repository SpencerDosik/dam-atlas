import { useState } from "react";
import { X } from "lucide-react";
import { useFilterStore } from "@/store/useFilterStore";
import type { DamFeature } from "@/types/dam";

interface StateFilterProps {
  features: DamFeature[];
}

export function StateFilter({ features }: StateFilterProps) {
  const { states, toggleState } = useFilterStore();
  const [query, setQuery] = useState("");

  const stateCounts = features.reduce<Record<string, number>>((acc, f) => {
    const s = f.properties.state;
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  const allStates = Object.entries(stateCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .filter(([s]) => !query || s.toLowerCase().includes(query.toLowerCase()));

  return (
    <fieldset className="border-b border-border-subtle px-3 py-3">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        State
        {states.size > 0 && <span className="ml-1 text-accent">({states.size})</span>}
      </legend>

      {states.size > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {[...states].map((s) => (
            <button
              key={s}
              onClick={() => toggleState(s)}
              className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent hover:bg-accent/30"
              aria-label={`Remove ${s} filter`}
            >
              {s}
              <X size={10} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        placeholder="Filter states…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2 w-full rounded-md border border-border-strong bg-bg-overlay px-2 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
        aria-label="Search states"
      />

      <div className="max-h-36 space-y-1 overflow-y-auto">
        {allStates.map(([s, count]) => (
          <label key={s} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={states.has(s)}
              onChange={() => toggleState(s)}
              className="h-3.5 w-3.5 accent-accent"
              aria-label={`Filter by state ${s}`}
            />
            <span className="flex-1 text-sm text-text-secondary">{s}</span>
            <span className="tabular-nums text-xs text-text-tertiary">{count.toLocaleString()}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
