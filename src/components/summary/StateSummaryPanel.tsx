import { useState } from "react";
import { useUiStore } from "@/store/useUiStore";
import { useFilterStore } from "@/store/useFilterStore";
import type { Summary, StateSummary } from "@/types/dam";

interface StateSummaryPanelProps {
  summary: Summary;
}

type SortKey = "count" | "highHazard" | "averageHeight" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "count", label: "Most dams" },
  { value: "highHazard", label: "Most high-hazard" },
  { value: "averageHeight", label: "Highest avg height" },
  { value: "name", label: "Alphabetical" },
];

export function StateSummaryPanel({ summary }: StateSummaryPanelProps) {
  const [sortBy, setSortBy] = useState<SortKey>("count");
  const { setView } = useUiStore();
  const { toggleState } = useFilterStore();

  const sorted = [...summary.byState].sort((a, b) => {
    switch (sortBy) {
      case "count":
        return b.count - a.count;
      case "highHazard":
        return b.highHazard - a.highHazard;
      case "averageHeight":
        return b.averageHeight - a.averageHeight;
      case "name":
        return a.name.localeCompare(b.name);
    }
  });

  function handleStateClick(s: StateSummary) {
    toggleState(s.state);
    setView("map");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-bg-base">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-text-primary">State Summary</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs text-text-tertiary">
            Sort:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-md border border-border-strong bg-bg-overlay px-2 py-1 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((s) => (
            <StateCard key={s.state} data={s} onClick={() => handleStateClick(s)} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface StateCardProps {
  data: StateSummary;
  onClick: () => void;
}

function StateCard({ data, onClick }: StateCardProps) {
  const highPct = data.count > 0 ? (data.highHazard / data.count) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-border-subtle bg-bg-elevated p-4 text-left transition-colors hover:border-border-strong hover:bg-bg-hover"
      aria-label={`${data.name}: ${data.count.toLocaleString()} dams, ${data.highHazard.toLocaleString()} high hazard. Click to filter.`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">{data.name}</p>
          <p className="text-xs text-text-tertiary">{data.state}</p>
        </div>
        <span className="tabular-nums text-lg font-bold text-text-primary">
          {data.count.toLocaleString()}
        </span>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-bg-overlay">
        <div
          className="h-full rounded-full bg-hazard-high transition-all"
          style={{ width: `${highPct}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="flex justify-between text-xs text-text-tertiary">
        <span>
          <span className="tabular-nums text-hazard-high">{data.highHazard.toLocaleString()}</span>{" "}
          high hazard ({highPct.toFixed(0)}%)
        </span>
        <span className="tabular-nums">
          {data.averageHeight > 0 ? `avg ${data.averageHeight.toFixed(0)} ft` : "—"}
        </span>
      </div>
    </button>
  );
}
