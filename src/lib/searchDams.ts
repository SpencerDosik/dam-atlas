import Fuse, { type FuseResult } from "fuse.js";
import type { DamFeature } from "@/types/dam";

let fuseInstance: Fuse<DamFeature> | null = null;

export function initSearch(features: DamFeature[]): void {
  fuseInstance = new Fuse(features, {
    keys: ["properties.name", "properties.state"],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
  });
}

export function searchDams(query: string): FuseResult<DamFeature>[] {
  if (!fuseInstance || !query.trim()) return [];
  return fuseInstance.search(query, { limit: 50 });
}

export function searchDamsTop(query: string, limit = 8): DamFeature[] {
  const results = searchDams(query);
  return results.slice(0, limit).map((r) => r.item);
}
