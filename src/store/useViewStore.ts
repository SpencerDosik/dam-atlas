import { create } from "zustand";

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface ViewActions {
  setView: (view: Partial<ViewState>) => void;
}

export const DEFAULT_VIEW: ViewState = {
  longitude: -98.5,
  latitude: 39.5,
  zoom: 3.5,
  pitch: 45,
  bearing: 0,
};

export const useViewStore = create<ViewState & ViewActions>((set) => ({
  ...DEFAULT_VIEW,
  setView: (view) => set((s) => ({ ...s, ...view })),
}));
