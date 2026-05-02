import { useEffect } from "react";
import { useUiStore } from "@/store/useUiStore";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useFilterStore } from "@/store/useFilterStore";
import { countActiveFilters } from "@/lib/filterDams";

export function useKeyboardShortcuts(
  searchRef: React.RefObject<HTMLInputElement>,
  onResetView?: () => void
): void {
  const ui = useUiStore();
  const { setSelected } = useSelectionStore();
  const filters = useFilterStore();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (e.key === "Escape") {
        if (ui.keyboardShortcutsOpen) {
          ui.setKeyboardShortcutsOpen(false);
        } else if (ui.aboutOpen) {
          ui.setAboutOpen(false);
        } else if (ui.sidebarOpen) {
          setSelected(null);
          ui.setSidebarOpen(false);
        } else if (!isInput) {
          useFilterStore.getState().setSearchQuery("");
        }
        return;
      }

      if (isInput) return;

      switch (e.key) {
        case "f":
          ui.setFilterPanelOpen(!ui.filterPanelOpen);
          break;
        case "m":
          ui.setView("map");
          break;
        case "t":
          ui.setView("table");
          break;
        case "s":
          ui.setView("summary");
          break;
        case "?":
          ui.setKeyboardShortcutsOpen(true);
          break;
        case "r": {
          const count = countActiveFilters(filters);
          if (count <= 5) {
            filters.reset();
          } else if (window.confirm(`Reset ${count} active filters?`)) {
            filters.reset();
          }
          break;
        }
        case "n":
          onResetView?.();
          break;
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ui, setSelected, filters, searchRef, onResetView]);
}
