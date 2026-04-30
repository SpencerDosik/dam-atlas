import { describe, it, expect, beforeEach } from "vitest";
import { parseUrlState, serializeUrlState } from "@/lib/urlState";
import type { FilterState } from "@/store/useFilterStore";
import type { ViewState } from "@/store/useViewStore";

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

const defaultCamera: ViewState = {
  longitude: -98.5,
  latitude: 39.5,
  zoom: 3.5,
  pitch: 45,
  bearing: 0,
};

describe("URL state serialization", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("serializes and parses hazard filter", () => {
    serializeUrlState(
      makeFilters({ hazard: new Set(["High", "Low"]) }),
      "map",
      null,
      defaultCamera
    );
    const state = parseUrlState();
    expect(state.filters.hazard).toBeDefined();
    expect(state.filters.hazard!.has("High")).toBe(true);
    expect(state.filters.hazard!.has("Low")).toBe(true);
  });

  it("serializes and parses selected dam", () => {
    serializeUrlState(makeFilters(), "map", "ND12345", defaultCamera);
    const state = parseUrlState();
    expect(state.selectedDam).toBe("ND12345");
  });

  it("serializes and parses view", () => {
    serializeUrlState(makeFilters(), "table", null, defaultCamera);
    const state = parseUrlState();
    expect(state.view).toBe("table");
  });

  it("serializes and parses camera in hash", () => {
    serializeUrlState(makeFilters(), "map", null, {
      longitude: -118.2,
      latitude: 36.0,
      zoom: 8.5,
      pitch: 60,
      bearing: 15,
    });
    const state = parseUrlState();
    expect(state.camera?.longitude).toBeCloseTo(-118.2, 2);
    expect(state.camera?.latitude).toBeCloseTo(36.0, 2);
    expect(state.camera?.zoom).toBeCloseTo(8.5, 1);
  });

  it("does not include default view in URL params", () => {
    serializeUrlState(makeFilters(), "map", null, defaultCamera);
    expect(window.location.search).not.toContain("view=map");
  });

  it("includes non-default view in URL params", () => {
    serializeUrlState(makeFilters(), "summary", null, defaultCamera);
    expect(window.location.search).toContain("view=summary");
  });
});
