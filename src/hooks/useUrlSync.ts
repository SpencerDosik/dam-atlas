import { useEffect, useRef } from "react";
import { useFilterStore } from "@/store/useFilterStore";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useUiStore } from "@/store/useUiStore";
import { useViewStore } from "@/store/useViewStore";
import { serializeUrlState, parseUrlState } from "@/lib/urlState";

export function useUrlSync(): void {
  const filters = useFilterStore();
  const { selectedNidId } = useSelectionStore();
  const { view } = useUiStore();
  const camera = useViewStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const state = parseUrlState();
      if (Object.keys(state.filters).length > 0) {
        useFilterStore.getState().setFromUrl(state.filters);
      }
      if (state.view) {
        useUiStore.getState().setView(state.view as "map" | "table" | "summary");
      }
      if (state.selectedDam) {
        useSelectionStore.getState().setSelected(state.selectedDam);
        useUiStore.getState().setSidebarOpen(true);
      }
      if (state.camera) {
        useViewStore.getState().setView(state.camera);
      }
    }
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      serializeUrlState(filters, view, selectedNidId, camera);
    }, 150);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [filters, selectedNidId, view, camera]);
}
