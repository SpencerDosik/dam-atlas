interface FilteredCountBadgeProps {
  filteredCount: number;
  totalCount: number;
}

export function FilteredCountBadge({ filteredCount, totalCount }: FilteredCountBadgeProps) {
  return (
    <div
      className="absolute left-4 top-4 z-10 rounded-full bg-bg-overlay/80 px-3 py-1 text-xs text-text-secondary glass shadow-panel"
      aria-live="polite"
      aria-atomic="true"
    >
      Showing{" "}
      <span className="tabular-nums font-medium text-text-primary">
        {filteredCount.toLocaleString()}
      </span>{" "}
      of{" "}
      <span className="tabular-nums">{totalCount.toLocaleString()}</span> dams
    </div>
  );
}
