#!/usr/bin/env python3
"""Generate a synthetic NID-like dataset (~92k dams) for development/demo.
Distributions match published NID aggregate statistics.
Run: python scripts/generate_synthetic.py
"""
import json, math, random
from datetime import datetime, timezone
from pathlib import Path

random.seed(42)

ROOT = Path(__file__).resolve().parent.parent
OUT  = ROOT / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)

# ── State bounding boxes (lat_min, lat_max, lon_min, lon_max) ────────────────
STATE_BOXES = {
    "AL":(30.2,35.0,-88.5,-84.9),"AK":(54.0,71.4,-168.0,-130.0),
    "AZ":(31.3,37.0,-114.8,-109.0),"AR":(33.0,36.5,-94.6,-89.6),
    "CA":(32.5,42.0,-124.5,-114.1),"CO":(37.0,41.0,-109.1,-102.0),
    "CT":(41.0,42.1,-73.7,-71.8),"DE":(38.5,39.8,-75.8,-75.0),
    "FL":(24.4,31.0,-87.6,-80.0),"GA":(30.4,35.0,-85.6,-80.8),
    "HI":(18.9,22.2,-160.2,-154.8),"ID":(42.0,49.0,-117.2,-111.0),
    "IL":(37.0,42.5,-91.5,-87.5),"IN":(37.8,41.8,-88.1,-84.8),
    "IA":(40.4,43.5,-96.6,-90.1),"KS":(37.0,40.0,-102.1,-94.6),
    "KY":(36.5,39.1,-89.6,-81.9),"LA":(29.0,33.0,-94.0,-89.0),
    "ME":(43.1,47.5,-71.1,-66.9),"MD":(37.9,39.7,-79.5,-75.0),
    "MA":(41.2,42.9,-73.5,-69.9),"MI":(41.7,48.3,-90.4,-82.4),
    "MN":(43.5,49.4,-97.2,-89.5),"MS":(30.1,35.0,-91.7,-88.1),
    "MO":(36.0,40.6,-95.8,-89.1),"MT":(44.4,49.0,-116.1,-104.0),
    "NE":(40.0,43.0,-104.1,-95.3),"NV":(35.0,42.0,-120.0,-114.0),
    "NH":(42.7,45.3,-72.6,-70.6),"NJ":(38.9,41.4,-75.6,-73.9),
    "NM":(31.3,37.0,-109.1,-103.0),"NY":(40.5,45.0,-79.8,-71.9),
    "NC":(33.8,36.6,-84.3,-75.5),"ND":(45.9,49.0,-104.1,-96.6),
    "OH":(38.4,42.3,-84.8,-80.5),"OK":(33.6,37.0,-103.0,-94.4),
    "OR":(42.0,46.2,-124.6,-116.5),"PA":(39.7,42.3,-80.5,-74.7),
    "RI":(41.1,42.0,-71.9,-71.1),"SC":(32.0,35.2,-83.4,-78.5),
    "SD":(42.5,45.9,-104.1,-96.4),"TN":(35.0,36.7,-90.3,-81.6),
    "TX":(25.8,36.5,-106.6,-93.5),"UT":(37.0,42.0,-114.1,-109.0),
    "VT":(42.7,45.0,-73.4,-71.5),"VA":(36.5,39.5,-83.7,-75.2),
    "WA":(45.5,49.0,-124.7,-116.9),"WV":(37.2,40.6,-82.6,-77.7),
    "WI":(42.5,47.1,-92.9,-86.2),"WY":(41.0,45.0,-111.1,-104.1),
    "DC":(38.8,38.99,-77.1,-76.9),"PR":(17.9,18.5,-67.3,-65.6),
}

# ── Dam counts per state (approximate NID totals) ────────────────────────────
STATE_COUNTS = {
    "TX":1550,"KS":1300,"MO":1200,"GA":1200,"IA":980,"OK":920,
    "IL":900,"PA":850,"NC":810,"AR":790,"VA":740,"AL":720,
    "TN":700,"OH":700,"MS":680,"KY":630,"MN":610,"NE":590,
    "NY":570,"WI":570,"IN":550,"SC":520,"MI":520,"CA":500,
    "CO":480,"WV":460,"WA":415,"OR":395,"LA":370,"MD":350,
    "FL":350,"NJ":330,"MA":310,"CT":265,"MT":240,"SD":220,
    "ND":210,"ID":197,"WY":186,"AZ":175,"NM":153,"ME":142,
    "NH":131,"VT":120,"UT":109,"NV":98,"DE":77,"RI":61,
    "HI":44,"AK":39,"DC":5,"PR":20,
}
TOTAL_TARGET = sum(STATE_COUNTS.values())  # ~92k

HAZARD_DIST   = [("High",0.16),("Significant",0.12),("Low",0.57),("Undetermined",0.15)]
CONDITION_DIST= [("Satisfactory",0.38),("Fair",0.28),("Not Rated",0.22),
                 ("Poor",0.08),("Unsatisfactory",0.04)]
OWNER_DIST    = [("Private",0.52),("Local Government",0.27),("State",0.09),
                 ("Federal",0.05),("Public Utility",0.04),("Other",0.03)]
PURPOSE_DIST  = [("Recreation",0.28),("Flood Control",0.22),("Irrigation",0.16),
                 ("Water Supply",0.14),("Fish and Wildlife Pond",0.09),
                 ("Hydroelectric",0.04),("Navigation",0.02),("Other",0.05)]

HAZARD_WEIGHT    = {"High":100,"Significant":60,"Low":20,"Undetermined":0}
CONDITION_WEIGHT = {"Poor":100,"Unsatisfactory":100,"Fair":60,"Not Rated":40,"Satisfactory":20}

def risk_score(h, c):
    return round(0.6*HAZARD_WEIGHT[h] + 0.4*CONDITION_WEIGHT[c])

def risk_tier(s):
    if s>=80: return "Critical"
    if s>=60: return "Elevated"
    if s>=40: return "Moderate"
    if s>=20: return "Low"
    return "Minimal"

def weighted(dist):
    r = random.random()
    acc = 0
    for val, p in dist:
        acc += p
        if r < acc: return val
    return dist[-1][0]

name_prefixes = ["Mill","Bear","Cedar","Oak","Beaver","Spring","Lake","Rock","Clear",
                 "Buck","Deer","Eagle","Elm","Pine","Willow","Maple","River","County",
                 "State","Farm","Stone","Iron","Coal","Sand","Green","Blue","White","Black"]
name_suffixes = ["Creek","Lake","Pond","Reservoir","Branch","Run","Fork","Draw","Slough"]

YEAR_RANGE = (1900, 2020)

features = []
details  = {}

nid_counter = 1

for state, count in STATE_COUNTS.items():
    box = STATE_BOXES.get(state)
    if not box:
        continue
    lat_min, lat_max, lon_min, lon_max = box

    for _ in range(count):
        nid_id  = f"SY{nid_counter:06d}"
        nid_counter += 1

        lat = round(random.uniform(lat_min, lat_max), 5)
        lon = round(random.uniform(lon_min, lon_max), 5)

        hazard    = weighted(HAZARD_DIST)
        condition = weighted(CONDITION_DIST)
        owner     = weighted(OWNER_DIST)
        purpose   = weighted(PURPOSE_DIST)

        # Height: log-normal centered around 25 ft
        height = round(max(5, random.lognormvariate(3.2, 0.7)), 1)
        # Storage: log-normal (acre-feet)
        storage = round(max(1, random.lognormvariate(4.5, 1.8)), 1)

        score = risk_score(hazard, condition)
        tier  = risk_tier(score)

        dam_name = (random.choice(name_prefixes) + " " +
                    random.choice(name_suffixes) + " Dam")
        year = random.randint(*YEAR_RANGE)

        props = {
            "nidId": nid_id,
            "name": dam_name,
            "state": state,
            "hazardPotential": hazard,
            "condition": condition,
            "damHeight": height,
            "maxStorage": storage,
            "ownerType": owner,
            "primaryPurpose": purpose,
            "riskScore": score,
            "riskTier": tier,
        }
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": props,
        })

        details[nid_id] = {
            **props,
            "county": None,
            "river": None,
            "yearCompleted": year,
            "yearModified": year + random.randint(0, 40) if random.random() > 0.6 else None,
            "damType": random.choice(["Earthen","Rock Fill","Concrete","Other",None]),
            "allPurposes": purpose,
            "drainageArea": round(random.uniform(0.1, 500), 1),
            "normalStorage": round(storage * random.uniform(0.4, 0.9), 1),
            "damLength": round(random.uniform(50, 2000), 1),
            "hydraulicHeight": round(height * random.uniform(0.6, 1.0), 1),
            "structuralHeight": round(height * random.uniform(0.9, 1.1), 1),
            "spillwayType": random.choice(["Service","Auxiliary","Emergency","None",None]),
            "ownerName": None,
            "regulatoryAgency": None,
            "federalAgency": None,
            "lastInspectionDate": f"{random.randint(2010,2023)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}" if random.random()>0.3 else None,
            "inspectionFrequency": random.choice([1,2,3,5,None]),
            "eapStatus": random.choice(["Yes","No",None]),
            "downstreamHazardDescription": None,
            "conditionDate": f"{random.randint(2005,2023)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}" if random.random()>0.4 else None,
        }

print(f"Generated {len(features):,} features")

# ── Write dams.geojson ────────────────────────────────────────────────────────
geojson = {"type":"FeatureCollection","features":features}
with open(OUT/"dams.geojson","w") as f:
    json.dump(geojson, f, separators=(",",":"))
print(f"Wrote dams.geojson ({(OUT/'dams.geojson').stat().st_size/1e6:.1f} MB)")

# ── Write dams.details.json ───────────────────────────────────────────────────
with open(OUT/"dams.details.json","w") as f:
    json.dump(details, f, separators=(",",":"))
print(f"Wrote dams.details.json ({(OUT/'dams.details.json').stat().st_size/1e6:.1f} MB)")

# ── Write summary.json ────────────────────────────────────────────────────────
import pandas as pd
df = pd.DataFrame([f["properties"] for f in features])

by_state = []
for st, grp in df.groupby("state"):
    by_state.append({
        "state": st,
        "name": {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas",
            "CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware",
            "FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois",
            "IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana",
            "ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan",
            "MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana",
            "NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey",
            "NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota",
            "OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania",
            "RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota",
            "TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia",
            "WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming",
            "DC":"District of Columbia","PR":"Puerto Rico"}.get(st, st),
        "count": int(len(grp)),
        "highHazard": int((grp["hazardPotential"]=="High").sum()),
        "averageHeight": round(float(grp["damHeight"].mean()), 1),
    })
by_state.sort(key=lambda x: x["count"], reverse=True)

summary = {
    "totalDams": len(features),
    "byHazard":    {h: int((df["hazardPotential"]==h).sum()) for h in ["High","Significant","Low","Undetermined"]},
    "byCondition": {c: int((df["condition"]==c).sum()) for c in ["Satisfactory","Fair","Poor","Unsatisfactory","Not Rated"]},
    "byOwnerType": {o: int((df["ownerType"]==o).sum()) for o in ["Federal","State","Local Government","Public Utility","Private","Other"]},
    "byState": by_state,
    "byPurpose": {str(p): int(c) for p,c in df["primaryPurpose"].value_counts().items()},
    "generatedAt": datetime.now(timezone.utc).isoformat(),
    "sourceUrl": "https://nid.sec.usace.army.mil/",
}
with open(OUT/"summary.json","w") as f:
    json.dump(summary, f, indent=2)
print(f"Wrote summary.json  (totalDams={summary['totalDams']:,})")

# ── Write riskScore.fixtures.json ─────────────────────────────────────────────
fixtures = []
for h in ["High","Significant","Low","Undetermined"]:
    for c in ["Satisfactory","Fair","Poor","Unsatisfactory","Not Rated"]:
        s = risk_score(h, c)
        fixtures.append({"hazard":h,"condition":c,"expectedScore":s,"expectedTier":risk_tier(s)})
with open(OUT/"riskScore.fixtures.json","w") as f:
    json.dump(fixtures, f, indent=2)
print(f"Wrote riskScore.fixtures.json ({len(fixtures)} fixtures)")
print("Done.")
