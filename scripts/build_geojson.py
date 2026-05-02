#!/usr/bin/env python3
"""
build_geojson.py  —  NID → GeoJSON/JSON preprocessor
Usage:
  python scripts/build_geojson.py
  python scripts/build_geojson.py --input-csv path/to/nid.csv
  python scripts/build_geojson.py --no-download  # uses cached data/cache/nid_raw.csv
  python scripts/build_geojson.py --output-dir data/
"""
from __future__ import annotations

import argparse
import json
import math
import os
import random
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import requests
from tqdm import tqdm

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
CACHE_DIR = DATA_DIR / ".cache"
CACHE_CSV = CACHE_DIR / "nid_raw.csv"

NID_URLS = [
    "https://nid.sec.usace.army.mil/api/nation/csv",
    "https://nid.sec.usace.army.mil/api/dams/all/csv",
]

# ---------------------------------------------------------------------------
# Valid sets
# ---------------------------------------------------------------------------
VALID_HAZARD = {"High", "Significant", "Low", "Undetermined"}
VALID_CONDITION = {"Satisfactory", "Fair", "Poor", "Unsatisfactory", "Not Rated"}
VALID_OWNER_TYPES = {
    "Federal", "State", "Local Government", "Public Utility", "Private", "Other"
}
VALID_STATES = {
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
    "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
    "VA","WA","WV","WI","WY","DC","PR","VI","GU","AS","MP",
}

STATE_NAMES = {
    "AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California",
    "CO":"Colorado","CT":"Connecticut","DE":"Delaware","FL":"Florida","GA":"Georgia",
    "HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa",
    "KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland",
    "MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi",
    "MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire",
    "NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina",
    "ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania",
    "RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee",
    "TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington",
    "WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming","DC":"District of Columbia",
    "PR":"Puerto Rico","VI":"U.S. Virgin Islands","GU":"Guam","AS":"American Samoa",
    "MP":"Northern Mariana Islands",
}

# ---------------------------------------------------------------------------
# Risk score
# ---------------------------------------------------------------------------
HAZARD_WEIGHT = {"High": 100, "Significant": 60, "Low": 20, "Undetermined": 0}
CONDITION_WEIGHT = {"Poor": 100, "Unsatisfactory": 100, "Fair": 60,
                    "Satisfactory": 20, "Not Rated": 40}


def compute_risk_score(hazard: str, condition: str) -> int:
    return round(0.6 * HAZARD_WEIGHT.get(hazard, 0) + 0.4 * CONDITION_WEIGHT.get(condition, 40))


def compute_risk_tier(score: int) -> str:
    if score >= 80: return "Critical"
    if score >= 60: return "Elevated"
    if score >= 40: return "Moderate"
    if score >= 20: return "Low"
    return "Minimal"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def nullable_float(val) -> float | None:
    try:
        f = float(val)
        return None if math.isnan(f) else f
    except (TypeError, ValueError):
        return None


def normalize_str(val) -> str | None:
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return None
    s = str(val).strip()
    return s if s else None


def normalize_hazard(val) -> str:
    s = normalize_str(val) or ""
    for k in VALID_HAZARD:
        if k.lower() == s.lower():
            return k
    return "Undetermined"


def normalize_condition(val) -> str:
    s = normalize_str(val) or ""
    for k in VALID_CONDITION:
        if k.lower() == s.lower():
            return k
    return "Not Rated"


def normalize_owner(val) -> str | None:
    s = normalize_str(val) or ""
    for k in VALID_OWNER_TYPES:
        if k.lower() == s.lower():
            return k
    return None


# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------
def download_csv() -> Path:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    for url in NID_URLS:
        print(f"  Trying {url} …")
        try:
            r = requests.get(url, timeout=120, stream=True)
            if r.status_code == 200:
                total = int(r.headers.get("content-length", 0))
                with open(CACHE_CSV, "wb") as f:
                    with tqdm(total=total, unit="B", unit_scale=True, desc="  Download") as bar:
                        for chunk in r.iter_content(chunk_size=65536):
                            f.write(chunk)
                            bar.update(len(chunk))
                print(f"  Saved to {CACHE_CSV}")
                return CACHE_CSV
            else:
                print(f"  HTTP {r.status_code} — trying fallback")
        except requests.RequestException as e:
            print(f"  Error: {e} — trying fallback")

    print("ERROR: All NID endpoints failed. Use --input-csv to provide a local CSV file.")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Load + clean
# ---------------------------------------------------------------------------
COLUMN_MAP = {
    # NID column name (lowercase strip) -> our field
    "nidid": "nidId",
    "dam name": "name",
    "other dam name": "otherNames",
    "state": "state",
    "county": "county",
    "river": "river",
    "city near": "cityNear",
    "year completed": "yearCompleted",
    "year modified": "yearModified",
    "dam type": "damType",
    "primary purpose": "primaryPurpose",
    "purposes": "allPurposes",
    "hazard potential classification": "hazardPotential",
    "condition assessment": "condition",
    "condition assessment date": "conditionDate",
    "dam height": "damHeight",
    "hydraulic height": "hydraulicHeight",
    "structural height": "structuralHeight",
    "max storage": "maxStorage",
    "normal storage": "normalStorage",
    "dam length": "damLength",
    "drainage area": "drainageArea",
    "spillway type": "spillwayType",
    "owner name": "ownerName",
    "owner type": "ownerType",
    "regulatory agency": "regulatoryAgency",
    "state regulated dam": "stateRegulatedDam",
    "federal agency": "federalAgency",
    "inspection date": "lastInspectionDate",
    "inspection frequency": "inspectionFrequency",
    "emergency action plan": "eapStatus",
    "downstream hazard": "downstreamHazardDescription",
    "latitude": "latitude",
    "longitude": "longitude",
    "source agency": "sourceAgency",
}


def load_and_clean(csv_path: Path, output_dir: Path) -> tuple[list, list, dict, dict]:
    print(f"  Loading {csv_path} …")
    df = pd.read_csv(csv_path, low_memory=False, encoding="utf-8", on_bad_lines="skip")

    # Normalize column names
    df.columns = [c.strip().lower() for c in df.columns]

    # Map known columns
    rename = {}
    for col in df.columns:
        if col in COLUMN_MAP:
            rename[col] = COLUMN_MAP[col]
    df = df.rename(columns=rename)

    total_rows = len(df)
    dropped = {"missingCoordinates": 0, "zeroCoordinates": 0, "outOfBounds": 0,
               "invalidState": 0, "duplicateIds": 0}

    # Coerce lat/lon
    df["latitude"] = pd.to_numeric(df.get("latitude"), errors="coerce")
    df["longitude"] = pd.to_numeric(df.get("longitude"), errors="coerce")

    # Drop missing coords
    before = len(df)
    df = df.dropna(subset=["latitude", "longitude"])
    dropped["missingCoordinates"] = before - len(df)

    # Drop zero coords
    before = len(df)
    df = df[(df["latitude"] != 0) & (df["longitude"] != 0)]
    dropped["zeroCoordinates"] = before - len(df)

    # Drop out-of-bounds
    before = len(df)
    df = df[
        (df["latitude"].between(-14.5, 71.5)) &
        (df["longitude"].between(-180, -64.5))
    ]
    dropped["outOfBounds"] = before - len(df)

    # Validate state
    if "state" in df.columns:
        before = len(df)
        df["state"] = df["state"].apply(lambda x: normalize_str(x) or "")
        df = df[df["state"].isin(VALID_STATES)]
        dropped["invalidState"] = before - len(df)

    # Handle duplicates
    if "nidId" in df.columns:
        before = len(df)
        df = df.drop_duplicates(subset=["nidId"], keep="first")
        dropped["duplicateIds"] = before - len(df)
    elif "nidid" in df.columns:
        df = df.rename(columns={"nidid": "nidId"})
        before = len(df)
        df = df.drop_duplicates(subset=["nidId"], keep="first")
        dropped["duplicateIds"] = before - len(df)

    print(f"  Cleaned: {len(df):,} rows kept from {total_rows:,} total")

    # Normalize fields
    df["hazardPotential"] = df.get("hazardPotential", pd.Series(dtype=str)).apply(normalize_hazard)
    df["condition"] = df.get("condition", pd.Series(dtype=str)).apply(normalize_condition)
    df["ownerType"] = df.get("ownerType", pd.Series(dtype=str)).apply(normalize_owner)

    # Numeric coercion
    for col in ["damHeight", "maxStorage", "normalStorage", "damLength", "drainageArea",
                "hydraulicHeight", "structuralHeight", "inspectionFrequency"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    for col in ["yearCompleted", "yearModified"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            df[col] = df[col].where(df[col].notna(), None)

    # Compute risk
    df["riskScore"] = df.apply(
        lambda r: compute_risk_score(r["hazardPotential"], r["condition"]), axis=1
    )
    df["riskTier"] = df["riskScore"].apply(compute_risk_tier)

    # Null counts
    field_null_counts = {}
    for col in ["damHeight", "condition", "maxStorage", "ownerType"]:
        if col in df.columns:
            field_null_counts[col] = int(df[col].isna().sum())

    return df, dropped, total_rows, field_null_counts


# ---------------------------------------------------------------------------
# Build outputs
# ---------------------------------------------------------------------------
def build_geojson(df: pd.DataFrame) -> dict:
    features = []
    for _, row in tqdm(df.iterrows(), total=len(df), desc="  Building GeoJSON"):
        props = {
            "nidId": normalize_str(row.get("nidId")) or "",
            "name": normalize_str(row.get("name")) or "Unnamed",
            "state": normalize_str(row.get("state")) or "",
            "hazardPotential": row["hazardPotential"],
            "condition": row["condition"],
            "damHeight": nullable_float(row.get("damHeight")),
            "maxStorage": nullable_float(row.get("maxStorage")),
            "ownerType": row.get("ownerType"),
            "primaryPurpose": normalize_str(row.get("primaryPurpose")),
            "riskScore": int(row["riskScore"]),
            "riskTier": row["riskTier"],
        }
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [round(float(row["longitude"]), 6), round(float(row["latitude"]), 6)],
            },
            "properties": props,
        })
    return {"type": "FeatureCollection", "features": features}


def build_details(df: pd.DataFrame) -> dict:
    details = {}
    for _, row in tqdm(df.iterrows(), total=len(df), desc="  Building details"):
        nid_id = normalize_str(row.get("nidId")) or ""
        if not nid_id:
            continue
        details[nid_id] = {
            "nidId": nid_id,
            "name": normalize_str(row.get("name")) or "Unnamed",
            "otherNames": normalize_str(row.get("otherNames")),
            "state": normalize_str(row.get("state")) or "",
            "county": normalize_str(row.get("county")),
            "river": normalize_str(row.get("river")),
            "yearCompleted": int(row["yearCompleted"]) if pd.notna(row.get("yearCompleted")) else None,
            "yearModified": int(row["yearModified"]) if pd.notna(row.get("yearModified")) else None,
            "damType": normalize_str(row.get("damType")),
            "primaryPurpose": normalize_str(row.get("primaryPurpose")),
            "allPurposes": normalize_str(row.get("allPurposes")),
            "drainageArea": nullable_float(row.get("drainageArea")),
            "normalStorage": nullable_float(row.get("normalStorage")),
            "maxStorage": nullable_float(row.get("maxStorage")),
            "damLength": nullable_float(row.get("damLength")),
            "damHeight": nullable_float(row.get("damHeight")),
            "hydraulicHeight": nullable_float(row.get("hydraulicHeight")),
            "structuralHeight": nullable_float(row.get("structuralHeight")),
            "spillwayType": normalize_str(row.get("spillwayType")),
            "ownerName": normalize_str(row.get("ownerName")),
            "ownerType": row.get("ownerType"),
            "regulatoryAgency": normalize_str(row.get("regulatoryAgency")),
            "stateRegulatedDam": bool(row.get("stateRegulatedDam")) if pd.notna(row.get("stateRegulatedDam")) else None,
            "federalAgency": normalize_str(row.get("federalAgency")),
            "lastInspectionDate": normalize_str(row.get("lastInspectionDate")),
            "inspectionFrequency": nullable_float(row.get("inspectionFrequency")),
            "eapStatus": normalize_str(row.get("eapStatus")),
            "downstreamHazardDescription": normalize_str(row.get("downstreamHazardDescription")),
            "hazardPotential": row["hazardPotential"],
            "condition": row["condition"],
            "conditionDate": normalize_str(row.get("conditionDate")),
            "riskScore": int(row["riskScore"]),
            "riskTier": row["riskTier"],
            "sourceAgency": normalize_str(row.get("sourceAgency")) or "USACE NID",
        }
    return details


def build_summary(df: pd.DataFrame) -> dict:
    by_state = []
    for state, grp in df.groupby("state"):
        state_str = str(state)
        high_count = int((grp["hazardPotential"] == "High").sum())
        avg_height = float(grp["damHeight"].dropna().mean()) if grp["damHeight"].notna().any() else 0.0
        by_state.append({
            "state": state_str,
            "name": STATE_NAMES.get(state_str, state_str),
            "count": int(len(grp)),
            "highHazard": high_count,
            "averageHeight": round(avg_height, 1),
        })
    by_state.sort(key=lambda x: x["count"], reverse=True)

    by_hazard = {h: int((df["hazardPotential"] == h).sum()) for h in ["High", "Significant", "Low", "Undetermined"]}
    by_condition = {c: int((df["condition"] == c).sum()) for c in ["Satisfactory", "Fair", "Poor", "Unsatisfactory", "Not Rated"]}

    by_owner = {}
    if "ownerType" in df.columns:
        for ot in VALID_OWNER_TYPES:
            by_owner[ot] = int((df["ownerType"] == ot).sum())

    by_purpose = {}
    if "primaryPurpose" in df.columns:
        for purpose, cnt in df["primaryPurpose"].dropna().value_counts().items():
            by_purpose[str(purpose)] = int(cnt)

    return {
        "totalDams": int(len(df)),
        "byHazard": by_hazard,
        "byCondition": by_condition,
        "byOwnerType": by_owner,
        "byState": by_state,
        "byPurpose": by_purpose,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceUrl": "https://nid.sec.usace.army.mil/",
    }


def build_risk_fixtures(df: pd.DataFrame, n: int = 50) -> list:
    """Generate n input/output pairs for TypeScript test fixtures."""
    combos = []
    for hazard in ["High", "Significant", "Low", "Undetermined"]:
        for condition in ["Satisfactory", "Fair", "Poor", "Unsatisfactory", "Not Rated"]:
            score = compute_risk_score(hazard, condition)
            combos.append({
                "hazard": hazard,
                "condition": condition,
                "expectedScore": score,
                "expectedTier": compute_risk_tier(score),
            })
    # Pad with random samples from actual data
    sample_rows = df.sample(min(n - len(combos), len(df)), random_state=42)
    for _, row in sample_rows.iterrows():
        score = int(row["riskScore"])
        combos.append({
            "hazard": row["hazardPotential"],
            "condition": row["condition"],
            "expectedScore": score,
            "expectedTier": row["riskTier"],
        })
    return combos[:n]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(description="Build GeoJSON/JSON from NID data")
    parser.add_argument("--input-csv", help="Path to manually downloaded NID CSV")
    parser.add_argument("--output-dir", default="data/", help="Output directory (default: data/)")
    parser.add_argument("--no-download", action="store_true",
                        help="Skip download, use cached data/.cache/nid_raw.csv")
    args = parser.parse_args()

    output_dir = ROOT / args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=== NID Preprocessing ===")
    downloaded_at = datetime.now(timezone.utc).isoformat()

    if args.input_csv:
        csv_path = Path(args.input_csv)
        if not csv_path.exists():
            print(f"ERROR: File not found: {csv_path}")
            sys.exit(1)
        print(f"Using provided CSV: {csv_path}")
    elif args.no_download:
        if not CACHE_CSV.exists():
            print(f"ERROR: No cached CSV at {CACHE_CSV}. Run without --no-download first.")
            sys.exit(1)
        csv_path = CACHE_CSV
        print(f"Using cached CSV: {csv_path}")
    else:
        print("Downloading NID data…")
        csv_path = download_csv()

    print("Cleaning data…")
    df, dropped, total_rows, field_null_counts = load_and_clean(csv_path, output_dir)

    print("Building GeoJSON…")
    geojson = build_geojson(df)
    out_geo = output_dir / "dams.geojson"
    with open(out_geo, "w") as f:
        json.dump(geojson, f, separators=(",", ":"))
    print(f"  Wrote {out_geo} ({len(geojson['features']):,} features)")

    print("Building details…")
    details = build_details(df)
    out_det = output_dir / "dams.details.json"
    with open(out_det, "w") as f:
        json.dump(details, f, separators=(",", ":"))
    print(f"  Wrote {out_det}")

    print("Building summary…")
    summary = build_summary(df)
    out_sum = output_dir / "summary.json"
    with open(out_sum, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"  Wrote {out_sum}")

    print("Building risk score fixtures…")
    fixtures = build_risk_fixtures(df)
    out_fix = output_dir / "riskScore.fixtures.json"
    with open(out_fix, "w") as f:
        json.dump(fixtures, f, indent=2)
    print(f"  Wrote {out_fix} ({len(fixtures)} fixtures)")

    report = {
        "downloadedAt": downloaded_at,
        "totalRows": int(total_rows),
        "kept": int(len(df)),
        "dropped": {k: int(v) for k, v in dropped.items()},
        "fieldNullCounts": field_null_counts,
    }
    out_rep = output_dir / "preprocessing-report.json"
    with open(out_rep, "w") as f:
        json.dump(report, f, indent=2)
    print(f"  Wrote {out_rep}")

    print(f"\nDone. {len(df):,} dams processed.")
    print(f"  Dropped: {sum(dropped.values()):,} rows "
          f"({dropped['missingCoordinates']} missing coords, "
          f"{dropped['zeroCoordinates']} zero coords, "
          f"{dropped['outOfBounds']} out-of-bounds, "
          f"{dropped['invalidState']} invalid state, "
          f"{dropped['duplicateIds']} duplicate IDs)")


if __name__ == "__main__":
    main()
