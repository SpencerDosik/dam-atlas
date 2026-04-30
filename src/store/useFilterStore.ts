import { create } from "zustand";
import type { HazardPotential, Condition, OwnerType } from "@/types/dam";

export interface FilterState {
  hazard: Set<HazardPotential>;
  condition: Set<Condition>;
  states: Set<string>;
  ownerTypes: Set<OwnerType>;
  purposes: Set<string>;
  heightRange: [number, number];
  storageRange: [number, number];
  searchQuery: string;
}

interface FilterActions {
  toggleHazard: (h: HazardPotential) => void;
  toggleCondition: (c: Condition) => void;
  toggleState: (s: string) => void;
  toggleOwnerType: (o: OwnerType) => void;
  togglePurpose: (p: string) => void;
  setHeightRange: (range: [number, number]) => void;
  setStorageRange: (range: [number, number]) => void;
  setSearchQuery: (q: string) => void;
  reset: () => void;
  setFromUrl: (partial: Partial<FilterState>) => void;
}

const DEFAULT_STATE: FilterState = {
  hazard: new Set(),
  condition: new Set(),
  states: new Set(),
  ownerTypes: new Set(),
  purposes: new Set(),
  heightRange: [0, 1000],
  storageRange: [0, 1e9],
  searchQuery: "",
};

function toggleInSet<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  ...DEFAULT_STATE,

  toggleHazard: (h) => set((s) => ({ hazard: toggleInSet(s.hazard, h) })),
  toggleCondition: (c) => set((s) => ({ condition: toggleInSet(s.condition, c) })),
  toggleState: (state) => set((s) => ({ states: toggleInSet(s.states, state) })),
  toggleOwnerType: (o) => set((s) => ({ ownerTypes: toggleInSet(s.ownerTypes, o) })),
  togglePurpose: (p) => set((s) => ({ purposes: toggleInSet(s.purposes, p) })),
  setHeightRange: (range) => set({ heightRange: range }),
  setStorageRange: (range) => set({ storageRange: range }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  reset: () => set({ ...DEFAULT_STATE, hazard: new Set(), condition: new Set(), states: new Set(), ownerTypes: new Set(), purposes: new Set() }),
  setFromUrl: (partial) =>
    set((s) => ({
      ...s,
      ...partial,
    })),
}));
