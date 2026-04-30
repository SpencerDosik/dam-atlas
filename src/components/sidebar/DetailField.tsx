interface DetailFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
  mono?: boolean;
}

export function DetailField({ label, value, mono = false }: DetailFieldProps) {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "—"
      : typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : String(value);

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-tertiary">{label}</span>
      <span className={`text-sm text-text-primary ${mono ? "tabular-nums" : ""}`}>
        {displayValue}
      </span>
    </div>
  );
}
