import { useRef, useMemo } from "react";
import { useUiStore } from "@/store/useUiStore";
import { useFilterStore } from "@/store/useFilterStore";
import { filterDams } from "@/lib/filterDams";
import { TopBar } from "./TopBar";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { DamMap } from "@/components/map/DamMap";
import { DamTable } from "@/components/table/DamTable";
import { StateSummaryPanel } from "@/components/summary/StateSummaryPanel";
import { DamSidebar } from "@/components/sidebar/DamSidebar";
import { AboutModal } from "@/components/about/AboutModal";
import { KeyboardHints } from "./KeyboardHints";
import type { DamFeature, Summary } from "@/types/dam";

interface ShellProps {
  features: DamFeature[];
  summary: Summary;
}

export function Shell({ features, summary }: ShellProps) {
  const { view, filterPanelOpen, isMobile } = useUiStore();
  const filters = useFilterStore();
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredFeatures = useMemo(() => filterDams(features, filters), [features, filters]);

  return (
    <div className="flex h-full flex-col bg-bg-base">
      <TopBar
        features={features}
        filteredFeatures={filteredFeatures}
        summary={summary}
        searchRef={searchRef}
      />

      <div className="relative flex min-h-0 flex-1">
        {!isMobile && filterPanelOpen && (
          <FilterPanel features={features} filteredCount={filteredFeatures.length} />
        )}

        <main id="main-content" className="relative flex min-w-0 flex-1">
          {view === "map" && (
            <DamMap
              features={features}
              filteredFeatures={filteredFeatures}
              searchRef={searchRef}
            />
          )}
          {view === "table" && (
            <DamTable features={filteredFeatures} totalCount={features.length} />
          )}
          {view === "summary" && (
            <StateSummaryPanel summary={summary} />
          )}
        </main>

        <DamSidebar />
      </div>

      <AboutModal summary={summary} />
      <KeyboardHints searchRef={searchRef} />
    </div>
  );
}
