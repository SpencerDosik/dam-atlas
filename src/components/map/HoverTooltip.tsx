import { useEffect, useState } from "react";
import { useSelectionStore } from "@/store/useSelectionStore";
import { getHazardHex } from "@/lib/colors";
import type { DamFeature } from "@/types/dam";

interface HoverTooltipProps {
  features?: DamFeature[];
}

export function HoverTooltip({ features = [] }: HoverTooltipProps) {
  const { hoveredNidId } = useSelectionStore();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const feature = hoveredNidId ? features.find((f) => f.properties.nidId === hoveredNidId) : null;

  if (!hoveredNidId || !feature) return null;

  const p = feature.properties;
  const x = Math.min(position.x + 12, window.innerWidth - 260);
  const y = Math.min(position.y + 12, window.innerHeight - 100);

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-40 max-w-60 rounded-lg border border-border-strong bg-bg-overlay px-3 py-2 shadow-panel"
      style={{ left: x, top: y }}
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: getHazardHex(p.hazardPotential) }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="truncate font-medium text-text-primary text-sm">{p.name}</p>
          <p className="text-xs text-text-secondary">{p.state}</p>
          <p className="text-xs text-text-tertiary">
            {p.hazardPotential} Hazard / {p.condition}
          </p>
          <p className="mt-1 tabular-nums text-xs text-text-secondary">
            {p.damHeight !== null ? `Height ${p.damHeight} ft` : "Height —"}
            {" · "}
            <span>Risk {p.riskScore}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
