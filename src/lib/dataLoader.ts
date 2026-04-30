import type { DamFeatureCollection, DamDetail, Summary } from "@/types/dam";

const BASE_URL = import.meta.env.VITE_DATA_BASE_URL ?? "/data";

export async function loadGeoJson(): Promise<DamFeatureCollection> {
  const res = await fetch(`${BASE_URL}/dams.geojson`);
  if (!res.ok) throw new Error(`Failed to load dams.geojson: ${res.status} ${res.url}`);
  return res.json() as Promise<DamFeatureCollection>;
}

export async function loadSummary(): Promise<Summary> {
  const res = await fetch(`${BASE_URL}/summary.json`);
  if (!res.ok) throw new Error(`Failed to load summary.json: ${res.status} ${res.url}`);
  return res.json() as Promise<Summary>;
}

export async function loadDetails(): Promise<Record<string, DamDetail>> {
  const res = await fetch(`${BASE_URL}/dams.details.json`);
  if (!res.ok) throw new Error(`Failed to load dams.details.json: ${res.status} ${res.url}`);
  return res.json() as Promise<Record<string, DamDetail>>;
}

export async function loadDetail(nidId: string): Promise<DamDetail | null> {
  try {
    const all = await loadDetails();
    return all[nidId] ?? null;
  } catch {
    return null;
  }
}
