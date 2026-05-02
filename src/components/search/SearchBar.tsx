import { useState, useEffect, forwardRef, useRef } from "react";
import { Search, X } from "lucide-react";
import { searchDamsTop } from "@/lib/searchDams";
import { useFilterStore } from "@/store/useFilterStore";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useUiStore } from "@/store/useUiStore";
import { getHazardHex } from "@/lib/colors";
import type { DamFeature } from "@/types/dam";

interface SearchBarProps {
  features: DamFeature[];
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { features: _features },
  ref
) {
  const { searchQuery, setSearchQuery } = useFilterStore();
  const { setSelected } = useSelectionStore();
  const { setSidebarOpen } = useUiStore();
  const [results, setResults] = useState<DamFeature[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const found = searchDamsTop(searchQuery, 8);
    setResults(found);
    setOpen(found.length > 0);
    setActiveIndex(-1);
  }, [searchQuery]);

  function selectDam(dam: DamFeature) {
    setSelected(dam.properties.nidId);
    setSidebarOpen(true);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const dam = results[activeIndex];
      if (dam) selectDam(dam);
    } else if (e.key === "Escape") {
      setSearchQuery("");
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center rounded-lg border border-border-strong bg-bg-overlay px-3 py-1.5 focus-within:ring-1 focus-within:ring-accent">
        <Search size={14} className="shrink-0 text-text-tertiary" aria-hidden="true" />
        <input
          ref={ref}
          type="search"
          placeholder="Search dams…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="ml-2 w-40 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:w-56 transition-all"
          aria-label="Search dams by name or state"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-activedescendant={activeIndex >= 0 ? `result-${activeIndex}` : undefined}
          role="combobox"
          aria-expanded={open}
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(""); setOpen(false); }}
            className="ml-1 text-text-tertiary hover:text-text-secondary"
            aria-label="Clear search"
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          id="search-results"
          ref={listRef}
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-lg border border-border-strong bg-bg-overlay shadow-panel"
        >
          {results.map((dam, i) => {
            const p = dam.properties;
            return (
              <li
                key={p.nidId}
                id={`result-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-bg-hover ${
                  i === activeIndex ? "bg-bg-hover" : ""
                }`}
                onMouseDown={() => selectDam(dam)}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: getHazardHex(p.hazardPotential) }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text-primary">{p.name}</p>
                  <p className="text-xs text-text-tertiary">{p.state}</p>
                </div>
                {p.damHeight !== null && (
                  <span className="tabular-nums text-xs text-text-tertiary shrink-0">
                    {p.damHeight} ft
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
