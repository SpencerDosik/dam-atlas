import { create } from "zustand";

export type AppView = "map" | "table" | "summary";

interface UiState {
  sidebarOpen: boolean;
  filterPanelOpen: boolean;
  legendCollapsed: boolean;
  aboutOpen: boolean;
  exportMenuOpen: boolean;
  keyboardShortcutsOpen: boolean;
  view: AppView;
  isMobile: boolean;
  colorblindMode: boolean;
  showDensityLayer: boolean;
}

interface UiActions {
  setSidebarOpen: (open: boolean) => void;
  setFilterPanelOpen: (open: boolean) => void;
  setLegendCollapsed: (collapsed: boolean) => void;
  setAboutOpen: (open: boolean) => void;
  setExportMenuOpen: (open: boolean) => void;
  setKeyboardShortcutsOpen: (open: boolean) => void;
  setView: (view: AppView) => void;
  setIsMobile: (mobile: boolean) => void;
  setColorblindMode: (enabled: boolean) => void;
  setShowDensityLayer: (show: boolean) => void;
}

export const useUiStore = create<UiState & UiActions>((set) => ({
  sidebarOpen: false,
  filterPanelOpen: true,
  legendCollapsed: false,
  aboutOpen: false,
  exportMenuOpen: false,
  keyboardShortcutsOpen: false,
  view: "map",
  isMobile: false,
  colorblindMode: false,
  showDensityLayer: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setFilterPanelOpen: (open) => set({ filterPanelOpen: open }),
  setLegendCollapsed: (collapsed) => set({ legendCollapsed: collapsed }),
  setAboutOpen: (open) => set({ aboutOpen: open }),
  setExportMenuOpen: (open) => set({ exportMenuOpen: open }),
  setKeyboardShortcutsOpen: (open) => set({ keyboardShortcutsOpen: open }),
  setView: (view) => set({ view }),
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  setColorblindMode: (enabled) => set({ colorblindMode: enabled }),
  setShowDensityLayer: (show) => set({ showDensityLayer: show }),
}));
