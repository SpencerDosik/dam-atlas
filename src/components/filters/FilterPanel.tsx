import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { useFilterStore } from "@/store/useFilterStore";
import { countActiveFilters } from "@/lib/filterDams";
import { HazardFilter } from "./HazardFilter";
import { ConditionFilter } from "./ConditionFilter";
import { StateFilter } from "./StateFilter";
import { OwnerFilter } from "./OwnerFilter";
import { PurposeFilter } from "./PurposeFilter";
import { RangeFilter } from "./RangeFilter";
import type { DamFeature } from "@/types/dam";

interface FilterPanelProps {
  features: DamFeature[];
  filteredCount: number;
}

export function FilterPanel({ features, filteredCount }: FilterPanelProps) {
  const { filterPanelOpen, setFilterPanelOpen } = useUiStore();
  const filters = useFilterStore();
  const activeCount = countActiveFilters(filters);
  const totalCount = features.length;

  const purposeCounts = features.reduce<Record<string, number>>((acc, f) => {
    const p = f.properties.primaryPurpose;
    if (p) acc[p] = (acc[p] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <aside
      aria-label="Filter options"
      className={`flex h-full flex-col border-r border-border-subtle bg-bg-elevated transition-all duration-200 ${
        filterPanelOpen ? "w-72" : "w-12"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border-subtle p-2">
        {filterPanelOpen && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-sm font-semibold text-text-primary">Filters</span>
            {activeCount > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-bg-base">
                {activeCount}
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => setFilterPanelOpen(!filterPanelOpen)}
          className="ml-auto rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label={filterPanelOpen ? "Collapse filter panel" : "Expand filter panel"}
        >
          {filterPanelOpen ? <ChevronLeft size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
        </button>
      </div>

      {filterPanelOpen && (
        <>
          <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
            <span className="text-xs text-text-secondary">
              Showing{" "}
              <span className="tabular-nums font-medium text-text-primary">
                {filteredCount.toLocaleString()}
              </span>{" "}
              of {totalCount.toLocaleString()} dams
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <HazardFilter features={features} />
            <ConditionFilter features={features} />
            <StateFilter features={features} />
            <OwnerFilter features={features} />
            <PurposeFilter purposes={purposeCounts} />
            <RangeFilter
              label="Dam Height (ft)"
              min={0}
              max={1000}
              value={filters.heightRange}
              onChange={filters.setHeightRange}
              formatValue={(v) => `${v} ft`}
            />
            <RangeFilter
              label="Max Storage (af)"
              min={0}
              max={1e9}
              value={filters.storageRange}
              onChange={filters.setStorageRange}
              formatValue={(v) => {
                if (v >= 1e9) return "1B+ af";
                if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M af`;
                if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K af`;
                return `${v} af`;
              }}
              logScale
            />
          </div>

          <div className="border-t border-border-subtle p-3">
            <button
              onClick={filters.reset}
              disabled={activeCount === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset Filters
              {activeCount > 0 && (
                <span className="rounded-full bg-bg-hover px-1.5 py-0.5 text-xs">{activeCount}</span>
              )}
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
