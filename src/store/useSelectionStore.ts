import { create } from "zustand";

interface SelectionState {
  selectedNidId: string | null;
  hoveredNidId: string | null;
  setSelected: (id: string | null) => void;
  setHovered: (id: string | null) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedNidId: null,
  hoveredNidId: null,
  setSelected: (id) => set({ selectedNidId: id }),
  setHovered: (id) => set({ hoveredNidId: id }),
}));
