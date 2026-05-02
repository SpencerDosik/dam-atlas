import { useState } from "react";
import { X } from "lucide-react";
import { useFilterStore } from "@/store/useFilterStore";

interface PurposeFilterProps {
  purposes: Record<string, number>;
}

export function PurposeFilter({ purposes }: PurposeFilterProps) {
  const { purposes: selectedPurposes, togglePurpose } = useFilterStore();
  const [query, setQuery] = useState("");

  const sorted = Object.entries(purposes)
    .sort((a, b) => b[1] - a[1])
    .filter(([p]) => !query || p.toLowerCase().includes(query.toLowerCase()));

  return (
    <fieldset className="border-b border-border-subtle px-3 py-3">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        Primary Purpose
        {selectedPurposes.size > 0 && (
          <span className="ml-1 text-accent">({selectedPurposes.size})</span>
        )}
      </legend>

      {selectedPurposes.size > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {[...selectedPurposes].map((p) => (
            <button
              key={p}
              onClick={() => togglePurpose(p)}
              className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent hover:bg-accent/30"
              aria-label={`Remove ${p} filter`}
            >
              {p}
              <X size={10} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        placeholder="Filter purposes…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2 w-full rounded-md border border-border-strong bg-bg-overlay px-2 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
        aria-label="Search purposes"
      />

      <div className="max-h-36 space-y-1 overflow-y-auto">
        {sorted.map(([p, count]) => (
          <label key={p} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={selectedPurposes.has(p)}
              onChange={() => togglePurpose(p)}
              className="h-3.5 w-3.5 accent-accent"
              aria-label={`Filter by purpose ${p}`}
            />
            <span className="flex-1 truncate text-sm text-text-secondary">{p}</span>
            <span className="tabular-nums text-xs text-text-tertiary">{count.toLocaleString()}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
