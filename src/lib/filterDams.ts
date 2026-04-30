import type { DamFeature } from "@/types/dam";
import type { FilterState } from "@/store/useFilterStore";

export function filterDams(features: DamFeature[], filters: FilterState): DamFeature[] {
  return features.filter((f) => {
    const p = f.properties;

    if (filters.hazard.size > 0 && !filters.hazard.has(p.hazardPotential)) return false;
    if (filters.condition.size > 0 && !filters.condition.has(p.condition)) return false;
    if (filters.states.size > 0 && !filters.states.has(p.state)) return false;
    if (filters.ownerTypes.size > 0 && p.ownerType && !filters.ownerTypes.has(p.ownerType))
      return false;
    if (filters.purposes.size > 0 && p.primaryPurpose && !filters.purposes.has(p.primaryPurpose))
      return false;

    const height = p.damHeight;
    if (height !== null) {
      if (height < filters.heightRange[0] || height > filters.heightRange[1]) return false;
    }

    const storage = p.maxStorage;
    if (storage !== null) {
      if (storage < filters.storageRange[0] || storage > filters.storageRange[1]) return false;
    }

    return true;
  });
}

export function isFiltersActive(filters: FilterState): boolean {
  return (
    filters.hazard.size > 0 ||
    filters.condition.size > 0 ||
    filters.states.size > 0 ||
    filters.ownerTypes.size > 0 ||
    filters.purposes.size > 0 ||
    filters.heightRange[0] > 0 ||
    filters.heightRange[1] < 1000 ||
    filters.storageRange[0] > 0 ||
    filters.storageRange[1] < 1e9 ||
    filters.searchQuery.trim().length > 0
  );
}

export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.hazard.size > 0) count++;
  if (filters.condition.size > 0) count++;
  if (filters.states.size > 0) count++;
  if (filters.ownerTypes.size > 0) count++;
  if (filters.purposes.size > 0) count++;
  if (filters.heightRange[0] > 0 || filters.heightRange[1] < 1000) count++;
  if (filters.storageRange[0] > 0 || filters.storageRange[1] < 1e9) count++;
  if (filters.searchQuery.trim().length > 0) count++;
  return count;
}
