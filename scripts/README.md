# NID Data Preprocessing

This script downloads the USACE National Inventory of Dams (NID) CSV and produces the static data files used by the frontend.

## Usage

```bash
pip install -r requirements.txt

# Download from NID API and process
python scripts/build_geojson.py

# Use a manually downloaded CSV (skip network request)
python scripts/build_geojson.py --input-csv /path/to/nid.csv

# Use the cached CSV from the last run (no network)
python scripts/build_geojson.py --no-download

# Specify a different output directory
python scripts/build_geojson.py --output-dir data/
```

## Fallback: Manual CSV Download

If both NID endpoints fail, download the CSV manually from:
- https://nid.sec.usace.army.mil/ → Download → Full Dataset → CSV

Then run:
```bash
python scripts/build_geojson.py --input-csv ~/Downloads/NID2023_U.csv
```

## Outputs

| File | Size | Description |
|------|------|-------------|
| `data/dams.geojson` | ~10 MB compressed | Lightweight features for map rendering |
| `data/dams.details.json` | ~40 MB compressed | Full detail records keyed by NID ID |
| `data/summary.json` | <1 KB | Aggregate counts for dashboard |
| `data/riskScore.fixtures.json` | <1 KB | Test fixtures for TypeScript risk score |
| `data/preprocessing-report.json` | <1 KB | Run statistics |
