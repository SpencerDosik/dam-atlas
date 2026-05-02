import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { computeRiskScore, computeRiskTier } from "@/lib/riskScore";
import type { HazardPotential, Condition } from "@/types/dam";

interface Fixture {
  hazard: HazardPotential;
  condition: Condition;
  expectedScore: number;
  expectedTier: string;
}

const fixturesPath = resolve(__dirname, "../../data/riskScore.fixtures.json");

function loadFixtures(): Fixture[] {
  try {
    const raw = readFileSync(fixturesPath, "utf-8");
    return JSON.parse(raw) as Fixture[];
  } catch {
    return [];
  }
}

describe("computeRiskScore", () => {
  it("High hazard + Poor condition = 100", () => {
    expect(computeRiskScore("High", "Poor")).toBe(100);
  });

  it("High hazard + Satisfactory condition = 68", () => {
    expect(computeRiskScore("High", "Satisfactory")).toBe(68);
  });

  it("Low hazard + Satisfactory condition = 20", () => {
    expect(computeRiskScore("Low", "Satisfactory")).toBe(20);
  });

  it("Undetermined hazard + Not Rated condition = 16", () => {
    expect(computeRiskScore("Undetermined", "Not Rated")).toBe(16);
  });

  it("Significant hazard + Fair condition = 60", () => {
    expect(computeRiskScore("Significant", "Fair")).toBe(60);
  });
});

describe("computeRiskTier", () => {
  it("80 -> Critical", () => expect(computeRiskTier(80)).toBe("Critical"));
  it("79 -> Elevated", () => expect(computeRiskTier(79)).toBe("Elevated"));
  it("60 -> Elevated", () => expect(computeRiskTier(60)).toBe("Elevated"));
  it("59 -> Moderate", () => expect(computeRiskTier(59)).toBe("Moderate"));
  it("40 -> Moderate", () => expect(computeRiskTier(40)).toBe("Moderate"));
  it("39 -> Low", () => expect(computeRiskTier(39)).toBe("Low"));
  it("20 -> Low", () => expect(computeRiskTier(20)).toBe("Low"));
  it("19 -> Minimal", () => expect(computeRiskTier(19)).toBe("Minimal"));
  it("0 -> Minimal", () => expect(computeRiskTier(0)).toBe("Minimal"));
});

describe("riskScore fixtures", () => {
  const fixtures = loadFixtures();

  if (fixtures.length === 0) {
    it("fixtures file not found — skipping", () => {});
    return;
  }

  fixtures.forEach((f, i) => {
    it(`fixture ${i}: ${f.hazard}/${f.condition} -> ${f.expectedScore} (${f.expectedTier})`, () => {
      const score = computeRiskScore(f.hazard, f.condition);
      expect(score).toBe(f.expectedScore);
      expect(computeRiskTier(score)).toBe(f.expectedTier);
    });
  });
});
