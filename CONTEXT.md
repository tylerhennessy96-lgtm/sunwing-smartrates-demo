# Dynamica SmartRates - Project Context

Living context document. Keep this current so any teammate or future session can
get oriented quickly. Verified against the codebase on 2026-06-24.

## Project

**Dynamica SmartRates** is a revenue management demo built by Simon-Kucher for
Sunwing. It demonstrates pricing recommendations, alerts, competitor
positioning, package economics, and RM Copilot interactions. The current active
workflow is the Packages pricing tab; Flight and Hotel pages remain in the
static bundle but are not the primary data-refresh path.

Branding note: the nav bar shows **DYNAMICA / SmartRates**. Page titles may
still mention Sunwing RMS because this is the Sunwing deployment.

## Current Architecture

This repo is now a **CSV-only static application**.

- No runtime API.
- No FastAPI service in this repo.
- No database connection from the frontend.
- No AWS/ECS secret values or DB credentials are required at runtime.
- The Docker image bakes the static files and CSVs into nginx.

The browser loads same-origin CSV files from `data/` and `data/data-loader.js`
reshapes them into the global objects consumed by the pages.

## Tech Stack

- Frontend: pure HTML, CSS, and vanilla JavaScript.
- Charts: `data/chart.local.js`, a small local Chart.js-compatible shim.
- CSV parsing: PapaParse vendored at `data/vendor/papaparse.min.js`.
- Server: nginx on Alpine.
- Packaging: Docker.
- CI/CD: GitLab CI with static CSV validation and container build/release jobs.

## Data Contract

Required committed runtime data:

| File | Primary date field | Purpose |
| --- | --- | --- |
| `data/v_package_pricing_pg.csv` | `departure_date` | Package pricing |
| `data/curves_outbound.json` | generated | Outbound booking curves |
| `data/curves_inbound.json` | generated | Inbound booking curves |
| `data/curves_hotel.json` | generated | Hotel booking curves |

Current committed package export: **29,095 rows**.

Raw booking-curve exports are local build inputs and are intentionally ignored
because they are too large for the static image/repo:

| File | Status |
| --- | --- |
| `data/outbound_booking_curve.csv` | ignored raw source |
| `data/inbound_booking_curve.csv` | ignored raw source |
| `data/hotel_booking_curve.csv` | ignored raw source |

Rebuild the committed compact curve JSON after raw curve CSV changes:

```powershell
python .\scripts\build_booking_curves.py
```

Run the contract validator before committing data changes:

```powershell
python .\scripts\validate_csv_contract.py
```

The validator checks required package columns, non-empty row counts, and
parseable package dates.

## Serving Layout

`data/` is the web root in container/`serve-demo.ps1` environments:

- Docker: `Dockerfile` copies `data/` to `/srv/www/`, nginx listens on `8080`.
- Local: `serve-demo.ps1` serves `data/` at `http://localhost:8099/`.

Useful local URLs:

```text
http://localhost:8099/flight.html
http://localhost:8099/hotel.html
http://localhost:8099/pricing.html
```

If using a simple `python -m http.server` from the repository root instead,
open `http://127.0.0.1:8000/data/pricing.html`.

Opening pages via `file://` will not work because the browser must fetch CSVs.

## Key Pages

| Page | Purpose |
| --- | --- |
| `data/flight.html` | Flight pricing recs, load factor, competitor fares, RM Copilot |
| `data/hotel.html` | Hotel pricing recs, occupancy, cost-change flags, RM Copilot |
| `data/pricing.html` | Package pricing accordion, bulk overrides, booking curves |
| `data/parameters.html` | Configuration empty states for unconnected settings |
| `data/index.html` | Entry point |

Shared assets include `styles.css`, `data.js`, `data-loader.js`,
`chart.local.js`, `filters.js`, and vendored libraries under `data/vendor/`.

## Data Honesty

The demo reports only values that exist in the committed CSVs. Anything without
CSV backing is blanked, rendered as an empty state, or called out by the RM
Copilot. Known gaps include:

- Persistent package notes/comments.
- Publish, approval, and audit history.
- Historical fare/ADR time series.
- Detailed cost-change history beyond the CSV flag.
- Package autopilot/rule execution.
- Demand-driver and price-elasticity narratives.

`data/data.js` remains an empty-globals contract. `data/data-loader.js` fills the
CSV-backed globals and prints a console data-gap report.

## Security Posture

- No browser-time CDN or font downloads.
- PapaParse and the chart shim are local.
- CSP is locked to same-origin assets in `nginx.conf`.
- Runtime data is static CSV only.
- No credentials, secret ARNs, AWS config, or real database connection details
  should be committed.

## CI/CD

`.gitlab-ci.yml` extends the Simon-Kucher platform template and adds
`test:csv-contract`, which runs:

```text
python3 scripts/validate_csv_contract.py
```

The pipeline also keeps the existing secret detection, security, Docker build,
container scanning, and release jobs. Build/release remains tag-driven.

## Ownership

- Tyler: frontend/demo implementation.
- Fei: data loading and export support.
- Marcin / Niko: infrastructure and deployment.

The old in-repo FastAPI scaffold has been removed. Any historical backend work
is outside the current application runtime path.
