# Dam Hazard Atlas

An interactive 3D visualization of ~92,000 U.S. dam records from the USACE National Inventory of Dams.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/spencerdosik/dam-atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/spencerdosik/dam-atlas/actions/workflows/ci.yml)

**Live app:** https://dam-atlas.vercel.app *(placeholder — update after first deployment)*

---

## Features

- 3D extruded column map of ~92,000 U.S. dams (USACE NID)
- Height encodes physical dam height; color encodes hazard class
- Risk score (0–100) combining hazard potential and structural condition
- Filter by hazard, condition, state, owner type, purpose, height, and storage
- Fuzzy search by dam name and state
- Click any dam to view full detail in the sidebar
- Table view with virtualized rows and sorting
- State summary view with stacked hazard bars
- Export filtered results as CSV, GeoJSON, or PNG
- Shareable URLs with all filter and camera state encoded
- Dark base map (Stadia Maps) + 3D terrain (AWS Open Data)
- Color-blind palette option
- Full keyboard navigation

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 18 + TypeScript 5 + Vite 5 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Map | MapLibre GL JS 4 |
| 3D layers | deck.gl 9 |
| Tiles | Stadia Maps (Alidade Smooth Dark) |
| Terrain | AWS Terrain Tiles (Terrarium) |
| State | Zustand 4 |
| Search | Fuse.js 7 |
| Table | TanStack Table + Virtual |
| Tests | Vitest |
| Deploy | Vercel |

## Data Source

[U.S. Army Corps of Engineers National Inventory of Dams (NID)](https://nid.sec.usace.army.mil/)

Data is refreshed monthly by a GitHub Actions workflow.

## Risk Score Formula

```
risk_score = round(0.6 × hazard_weight + 0.4 × condition_weight)
```

| Hazard | Weight | Condition | Weight |
|--------|--------|-----------|--------|
| High | 100 | Poor / Unsatisfactory | 100 |
| Significant | 60 | Fair | 60 |
| Low | 20 | Not Rated | 40 |
| Undetermined | 0 | Satisfactory | 20 |

Risk tiers: Critical (≥80) · Elevated (60–79) · Moderate (40–59) · Low (20–39) · Minimal (<20)

## Local Development

### Prerequisites

- Node 20 (`nvm use` will read `.nvmrc`)
- pnpm (`npm install -g pnpm`)
- Python 3.11+

### Setup

```bash
git clone https://github.com/spencerdosik/dam-atlas
cd dam-atlas
pnpm install
cp .env.example .env.local
```

### Preprocess data (one-time or on refresh)

```bash
pip install -r scripts/requirements.txt
python scripts/build_geojson.py
```

This downloads the NID CSV, cleans it, and writes `data/dams.geojson`, `data/dams.details.json`, `data/summary.json`, and fixtures.

After preprocessing, copy or symlink the data directory to `public/data/` so Vite can serve it:

```bash
cp -r data public/data
# or on Linux/macOS:
ln -s ../../data public/data
```

### Run dev server

```bash
pnpm dev
```

No map token is needed. Stadia Maps uses HTTP Referer whitelisting; localhost is automatically allowed.

---

## Production Deployment

### 1. Deploy to Vercel

Connect the repository in the Vercel dashboard. The `vercel.json` configures the build command, install command, and cache headers automatically.

### 2. Add your domain to Stadia Maps (required)

After the first deployment, map tiles will return 401/403 until you whitelist your Vercel domain:

1. Sign up at [stadiamaps.com](https://stadiamaps.com) (free, no credit card required).
2. In the dashboard, go to **Properties** → **Authentication** → **Allowed HTTP Referers**.
3. Add your Vercel deployment URL, for example: `https://dam-atlas.vercel.app/*`
4. If you use a custom domain, add that too: `https://yourdomain.com/*`
5. Localhost (`http://localhost:*`) is allowed automatically for local development.

Until this step is complete, the map canvas will be blank in production.

### Alternative: API key auth

If you prefer to use an explicit API key instead of Referer whitelisting:

1. Create a Stadia Maps API key in their dashboard.
2. Add it to Vercel environment variables: `VITE_STADIA_API_KEY=your_key_here`
3. The style URL will automatically append `?api_key=…` when this variable is set.

---

## Project Structure

```
dam-atlas/
├── data/           Static data files (committed)
├── scripts/        Python preprocessing script
├── public/         Static assets (data symlink goes here)
└── src/
    ├── components/ React components
    ├── store/      Zustand stores
    ├── lib/        Pure utility functions
    ├── hooks/      Custom React hooks
    ├── types/      TypeScript interfaces
    └── tests/      Vitest unit tests
```

## Contributing

Pull requests are welcome. Before opening a PR:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

## Out of Scope

The following are intentionally excluded:

- Real-time data (data is static, refreshed monthly)
- User accounts or saved views
- Editing dam data
- Failure probability modeling (only consequences are shown)
- Routing, evacuation planning, or flood inundation
- Weather or hydrological integration
- Native mobile apps

## Acknowledgments

- [U.S. Army Corps of Engineers](https://www.usace.army.mil/) for the NID dataset
- [Stadia Maps](https://stadiamaps.com) for map tiles
- [MapLibre](https://maplibre.org) for open-source GL map rendering
- [deck.gl](https://deck.gl) for 3D layer rendering
- [AWS Open Data](https://registry.opendata.aws/terrain-tiles/) for terrain tiles

## License

[MIT](LICENSE)
