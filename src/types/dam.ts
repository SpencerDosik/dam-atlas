export type HazardPotential = "High" | "Significant" | "Low" | "Undetermined";
export type Condition = "Satisfactory" | "Fair" | "Poor" | "Unsatisfactory" | "Not Rated";
export type OwnerType =
  | "Federal"
  | "State"
  | "Local Government"
  | "Public Utility"
  | "Private"
  | "Other";
export type RiskTier = "Critical" | "Elevated" | "Moderate" | "Low" | "Minimal";

export interface DamFeatureProperties {
  nidId: string;
  name: string;
  state: string;
  hazardPotential: HazardPotential;
  condition: Condition;
  damHeight: number | null;
  maxStorage: number | null;
  ownerType: OwnerType | null;
  primaryPurpose: string | null;
  riskScore: number;
  riskTier: RiskTier;
}

export interface DamFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: DamFeatureProperties;
}

export interface DamFeatureCollection {
  type: "FeatureCollection";
  features: DamFeature[];
}

export interface DamDetail extends DamFeatureProperties {
  county: string | null;
  river: string | null;
  yearCompleted: number | null;
  yearModified: number | null;
  damType: string | null;
  allPurposes: string | null;
  drainageArea: number | null;
  normalStorage: number | null;
  damLength: number | null;
  hydraulicHeight: number | null;
  structuralHeight: number | null;
  spillwayType: string | null;
  ownerName: string | null;
  regulatoryAgency: string | null;
  federalAgency: string | null;
  lastInspectionDate: string | null;
  inspectionFrequency: number | null;
  eapStatus: string | null;
  downstreamHazardDescription: string | null;
  conditionDate: string | null;
}

export interface StateSummary {
  state: string;
  name: string;
  count: number;
  highHazard: number;
  averageHeight: number;
}

export interface Summary {
  totalDams: number;
  byHazard: Record<HazardPotential, number>;
  byCondition: Record<Condition, number>;
  byOwnerType: Record<OwnerType | "Other", number>;
  byState: StateSummary[];
  byPurpose: Record<string, number>;
  generatedAt: string;
  sourceUrl: string;
}
