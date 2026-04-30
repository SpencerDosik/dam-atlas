import { useUiStore } from "@/store/useUiStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface KeyboardHintsProps {
  searchRef: React.RefObject<HTMLInputElement | null>;
  onResetView?: () => void;
}

const SHORTCUTS = [
  { key: "/", description: "Focus search" },
  { key: "Escape", description: "Close sidebar / clear search" },
  { key: "f", description: "Toggle filter panel" },
  { key: "m", description: "Map view" },
  { key: "t", description: "Table view" },
  { key: "s", description: "Summary view" },
  { key: "?", description: "Open this shortcuts modal" },
  { key: "r", description: "Reset filters" },
  { key: "n", description: "Reset map view" },
  { key: "Tab", description: "Next dam (sidebar open)" },
  { key: "Shift+Tab", description: "Previous dam (sidebar open)" },
];

export function KeyboardHints({ searchRef, onResetView }: KeyboardHintsProps) {
  useKeyboardShortcuts(searchRef, onResetView);

  const { keyboardShortcutsOpen, setKeyboardShortcutsOpen } = useUiStore();

  if (!keyboardShortcutsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/60"
        aria-label="Close keyboard shortcuts"
        onClick={() => setKeyboardShortcutsOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        className="relative w-full max-w-lg rounded-xl border border-border-strong bg-bg-elevated p-6 shadow-panel"
      >
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Keyboard Shortcuts</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {SHORTCUTS.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-sm text-text-secondary">{description}</span>
              <kbd className="rounded bg-bg-overlay px-2 py-0.5 font-mono text-xs text-text-primary">
                {key}
              </kbd>
            </div>
          ))}
        </div>
        <button
          onClick={() => setKeyboardShortcutsOpen(false)}
          className="mt-6 text-sm text-text-secondary hover:text-text-primary"
        >
          Close
        </button>
      </div>
    </div>
  );
}
