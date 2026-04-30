import type { HazardPotential, Condition, OwnerType } from "@/types/dam";
import type { FilterState } from "@/store/useFilterStore";
import type { ViewState } from "@/store/useViewStore";

export interface UrlState {
  filters: Partial<FilterState>;
  view?: string;
  selectedDam?: string;
  camera?: Partial<ViewState>;
}

function parseSet<T extends string>(param: string | null, valid: readonly T[]): Set<T> {
  if (!param) return new Set();
  const values = param.split(",").filter((v): v is T => valid.includes(v as T));
  return new Set(values);
}

function serializeSet(set: Set<string>): string | null {
  if (set.size === 0) return null;
  return [...set].join(",");
}

const HAZARD_VALUES: HazardPotential[] = ["High", "Significant", "Low", "Undetermined"];
const CONDITION_VALUES: Condition[] = [
  "Satisfactory",
  "Fair",
  "Poor",
  "Unsatisfactory",
  "Not Rated",
];
const OWNER_VALUES: OwnerType[] = [
  "Federal",
  "State",
  "Local Government",
  "Public Utility",
  "Private",
  "Other",
];

export function parseUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.slice(1);

  const filters: Partial<FilterState> = {};

  const hazard = parseSet(params.get("hazard"), HAZARD_VALUES);
  if (hazard.size > 0) filters.hazard = hazard;

  const condition = parseSet(params.get("condition"), CONDITION_VALUES);
  if (condition.size > 0) filters.condition = condition;

  const statesParam = params.get("states");
  if (statesParam) filters.states = new Set(statesParam.split(",").filter(Boolean));

  const owners = parseSet(params.get("owners"), OWNER_VALUES);
  if (owners.size > 0) filters.ownerTypes = owners;

  const purposesParam = params.get("purposes");
  if (purposesParam) filters.purposes = new Set(purposesParam.split(",").filter(Boolean));

  const heightMin = parseFloat(params.get("heightMin") ?? "");
  const heightMax = parseFloat(params.get("heightMax") ?? "");
  if (!isNaN(heightMin) || !isNaN(heightMax)) {
    filters.heightRange = [isNaN(heightMin) ? 0 : heightMin, isNaN(heightMax) ? 1000 : heightMax];
  }

  const storageMin = parseFloat(params.get("storageMin") ?? "");
  const storageMax = parseFloat(params.get("storageMax") ?? "");
  if (!isNaN(storageMin) || !isNaN(storageMax)) {
    filters.storageRange = [
      isNaN(storageMin) ? 0 : storageMin,
      isNaN(storageMax) ? 1e9 : storageMax,
    ];
  }

  const q = params.get("q");
  if (q) filters.searchQuery = q;

  const result: UrlState = { filters };

  const view = params.get("view");
  if (view) result.view = view;

  const dam = params.get("dam");
  if (dam) result.selectedDam = dam;

  if (hash) {
    const hashParams = new URLSearchParams(hash);
    const lon = parseFloat(hashParams.get("lon") ?? "");
    const lat = parseFloat(hashParams.get("lat") ?? "");
    const zoom = parseFloat(hashParams.get("zoom") ?? "");
    const pitch = parseFloat(hashParams.get("pitch") ?? "");
    const bearing = parseFloat(hashParams.get("bearing") ?? "");
    const camera: Partial<ViewState> = {};
    if (!isNaN(lon)) camera.longitude = lon;
    if (!isNaN(lat)) camera.latitude = lat;
    if (!isNaN(zoom)) camera.zoom = zoom;
    if (!isNaN(pitch)) camera.pitch = pitch;
    if (!isNaN(bearing)) camera.bearing = bearing;
    if (Object.keys(camera).length > 0) result.camera = camera;
  }

  return result;
}

export function serializeUrlState(
  filters: FilterState,
  view: string,
  selectedDam: string | null,
  camera: ViewState
): void {
  const params = new URLSearchParams();

  const hazard = serializeSet(filters.hazard);
  if (hazard) params.set("hazard", hazard);

  const condition = serializeSet(filters.condition);
  if (condition) params.set("condition", condition);

  const states = serializeSet(filters.states);
  if (states) params.set("states", states);

  const owners = serializeSet(filters.ownerTypes);
  if (owners) params.set("owners", owners);

  const purposes = serializeSet(filters.purposes);
  if (purposes) params.set("purposes", purposes);

  if (filters.heightRange[0] > 0) params.set("heightMin", String(filters.heightRange[0]));
  if (filters.heightRange[1] < 1000) params.set("heightMax", String(filters.heightRange[1]));

  if (filters.storageRange[0] > 0) params.set("storageMin", String(filters.storageRange[0]));
  if (filters.storageRange[1] < 1e9) params.set("storageMax", String(filters.storageRange[1]));

  if (filters.searchQuery.trim()) params.set("q", filters.searchQuery.trim());
  if (view !== "map") params.set("view", view);
  if (selectedDam) params.set("dam", selectedDam);

  const hashParts = [`lon=${camera.longitude.toFixed(4)}`, `lat=${camera.latitude.toFixed(4)}`, `zoom=${camera.zoom.toFixed(2)}`, `pitch=${camera.pitch.toFixed(1)}`, `bearing=${camera.bearing.toFixed(1)}`];
  const hash = hashParts.join("&");

  const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}#${hash}`;
  window.history.replaceState(null, "", newUrl);
}
