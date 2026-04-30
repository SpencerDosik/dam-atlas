import { describe, it, expect } from "vitest";
import { filterDams, isFiltersActive, countActiveFilters } from "@/lib/filterDams";
import type { DamFeature } from "@/types/dam";
import type { FilterState } from "@/store/useFilterStore";

function makeFeature(overrides: Partial<DamFeature["properties"]> = {}): DamFeature {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-100, 40] },
    properties: {
      nidId: "TEST001",
      name: "Test Dam",
      state: "CO",
      hazardPotential: "High",
      condition: "Poor",
      damHeight: 100,
      maxStorage: 5000,
      ownerType: "Federal",
      primaryPurpose: "Water Supply",
      riskScore: 100,
      riskTier: "Critical",
      ...overrides,
    },
  };
}

function makeFilters(overrides: Partial<FilterState> = {}): FilterState {
  return {
    hazard: new Set(),
    condition: new Set(),
    states: new Set(),
    ownerTypes: new Set(),
    purposes: new Set(),
    heightRange: [0, 1000],
    storageRange: [0, 1e9],
    searchQuery: "",
    ...overrides,
  };
}

describe("filterDams", () => {
  it("returns all features when no filters active", () => {
    const features = [makeFeature(), makeFeature({ nidId: "TEST002" })];
    expect(filterDams(features, makeFilters())).toHaveLength(2);
  });

  it("filters by hazard", () => {
    const features = [
      makeFeature({ hazardPotential: "High" }),
      makeFeature({ nidId: "B", hazardPotential: "Low" }),
    ];
    const result = filterDams(features, makeFilters({ hazard: new Set(["High"]) }));
    expect(result).toHaveLength(1);
    expect(result[0].properties.hazardPotential).toBe("High");
  });

  it("filters by condition", () => {
    const features = [
      makeFeature({ condition: "Poor" }),
      makeFeature({ nidId: "B", condition: "Satisfactory" }),
    ];
    const result = filterDams(features, makeFilters({ condition: new Set(["Poor"]) }));
    expect(result).toHaveLength(1);
  });

  it("filters by state", () => {
    const features = [
      makeFeature({ state: "CO" }),
      makeFeature({ nidId: "B", state: "TX" }),
    ];
    const result = filterDams(features, makeFilters({ states: new Set(["TX"]) }));
    expect(result).toHaveLength(1);
    expect(result[0].properties.state).toBe("TX");
  });

  it("filters by height range", () => {
    const features = [
      makeFeature({ damHeight: 50 }),
      makeFeature({ nidId: "B", damHeight: 200 }),
    ];
    const result = filterDams(features, makeFilters({ heightRange: [0, 100] }));
    expect(result).toHaveLength(1);
    expect(result[0].properties.damHeight).toBe(50);
  });

  it("combines multiple filters with AND logic", () => {
    const features = [
      makeFeature({ hazardPotential: "High", state: "CO" }),
      makeFeature({ nidId: "B", hazardPotential: "Low", state: "CO" }),
      makeFeature({ nidId: "C", hazardPotential: "High", state: "TX" }),
    ];
    const result = filterDams(
      features,
      makeFilters({ hazard: new Set(["High"]), states: new Set(["CO"]) })
    );
    expect(result).toHaveLength(1);
    expect(result[0].properties.nidId).toBe("TEST001");
  });

  it("passes features with null height when only one bound is set", () => {
    const features = [
      makeFeature({ damHeight: null }),
      makeFeature({ nidId: "B", damHeight: 500 }),
    ];
    const result = filterDams(features, makeFilters({ heightRange: [0, 1000] }));
    expect(result).toHaveLength(2);
  });
});

describe("isFiltersActive", () => {
  it("returns false for default filters", () => {
    expect(isFiltersActive(makeFilters())).toBe(false);
  });

  it("returns true when hazard filter set", () => {
    expect(isFiltersActive(makeFilters({ hazard: new Set(["High"]) }))).toBe(true);
  });

  it("returns true when search query set", () => {
    expect(isFiltersActive(makeFilters({ searchQuery: "hoover" }))).toBe(true);
  });
});

describe("countActiveFilters", () => {
  it("returns 0 for default filters", () => {
    expect(countActiveFilters(makeFilters())).toBe(0);
  });

  it("counts each active filter type once", () => {
    const filters = makeFilters({
      hazard: new Set(["High", "Low"]),
      condition: new Set(["Poor"]),
      states: new Set(["CO"]),
    });
    expect(countActiveFilters(filters)).toBe(3);
  });
});
