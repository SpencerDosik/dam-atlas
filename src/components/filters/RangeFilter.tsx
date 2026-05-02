interface RangeFilterProps {
  label: string;
  min?: number;
  max: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
  formatValue: (v: number) => string;
  logScale?: boolean;
}

export function RangeFilter({
  label,
  max,
  value,
  onChange,
  formatValue,
  logScale = false,
}: RangeFilterProps) {
  function toSlider(v: number): number {
    if (!logScale) return v;
    if (v <= 0) return 0;
    return (Math.log10(v) / Math.log10(max)) * 100;
  }

  function fromSlider(s: number): number {
    if (!logScale) return s;
    if (s <= 0) return 0;
    return Math.pow(10, (s / 100) * Math.log10(max));
  }

  const [minSlider, maxSlider] = [toSlider(value[0]), toSlider(value[1])];

  return (
    <fieldset className="border-b border-border-subtle px-3 py-3">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        {label}
      </legend>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="tabular-nums">{formatValue(value[0])}</span>
          <span className="tabular-nums">{formatValue(value[1])}</span>
        </div>
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={logScale ? 100 : max}
            value={minSlider}
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              const newMin = logScale ? fromSlider(raw) : raw;
              if (newMin <= value[1]) onChange([Math.round(newMin), value[1]]);
            }}
            className="w-full accent-accent"
            aria-label={`${label} minimum`}
          />
          <input
            type="range"
            min={0}
            max={logScale ? 100 : max}
            value={maxSlider}
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              const newMax = logScale ? fromSlider(raw) : raw;
              if (newMax >= value[0]) onChange([value[0], Math.round(newMax)]);
            }}
            className="w-full accent-accent"
            aria-label={`${label} maximum`}
          />
        </div>
      </div>
    </fieldset>
  );
}
