import type { DamFeature } from "@/types/dam";

export function exportCsv(features: DamFeature[], filename = "dams.csv"): void {
  const headers = [
    "nidId",
    "name",
    "state",
    "latitude",
    "longitude",
    "hazardPotential",
    "condition",
    "damHeight",
    "maxStorage",
    "ownerType",
    "primaryPurpose",
    "riskScore",
    "riskTier",
  ];

  const rows = features.map((f) => {
    const [lon, lat] = f.geometry.coordinates;
    const p = f.properties;
    return [
      p.nidId,
      `"${(p.name ?? "").replace(/"/g, '""')}"`,
      p.state,
      lat.toFixed(6),
      lon.toFixed(6),
      p.hazardPotential,
      p.condition,
      p.damHeight ?? "",
      p.maxStorage ?? "",
      p.ownerType ?? "",
      `"${(p.primaryPurpose ?? "").replace(/"/g, '""')}"`,
      p.riskScore,
      p.riskTier,
    ].join(",");
  });

  const content = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
