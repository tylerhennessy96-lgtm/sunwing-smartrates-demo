# Dynamica SmartRates — Project Context

> Living context document. Keep this current so any teammate (or future
> session) can get oriented quickly. Verified against the codebase on
> 2026-06-08; correct it whenever the project changes.

## Project

**Dynamica SmartRates** — a revenue management (RMS) demo built by
**Simon-Kucher** for **Sunwing** (a tour operator). It demonstrates
revenue management across **flights, hotels and packages**: pricing
recommendations, autopilot rules, alerts, competitor positioning and an
RM Copilot assistant.

Branding note: the nav bar shows **DYNAMICA / SmartRates** (the product),
while the page `<title>` tags still read "… — Sunwing RMS" (the client
deployment). Product name to use going forward: **Dynamica SmartRates**.

## Purpose

Show how an RM team would review and action pricing:

- Per destination / week / route-or-hotel-or-room recommendations
  (current vs recommended fare/ADR, margin, deltas).
- Load factor / occupancy vs forecast and target.
- Competitor fare comparison (flights).
- Autopilot rules, alerts, price/margin controls, LOS rules (Parameters page).
- An **RM Copilot** that answers questions using only figures present in
  the data (see "Data honesty" below).

## Tech stack

- **Frontend:** pure HTML + CSS + vanilla JS. No framework, no build step.
- **Charts:** `data/chart.local.js` — a **minimal, custom Chart.js-compatible
  shim** written for this demo (NOT the full Chart.js library). It implements
  just the `new Chart(...)` surface the pages use, so the container needs no
  browser-time downloads.
- **CSV parsing:** **PapaParse**, vendored locally at
  `data/vendor/papaparse.min.js` (v5.4.1).
- **Fonts:** the CSS references `Archivo`, `Inter` and `JetBrains Mono` by
  name, but no font files are vendored and no font CDN is allowed under the
  CSP — so they currently fall back to the system sans-serif / monospace
  stack. (If the Archivo/Inter look is required, the font files must be
  vendored locally and `@font-face`-declared.)
- **Server:** nginx (Alpine), serving static files.
- **Packaging:** Docker; CI/CD on Simon-Kucher GitLab.

## Data architecture

**Current state — CSV-driven:**

- Two CSV exports live in `data/`:
  - `mock_v_hotel_pricing.csv`  — ~3,456 rows, 41 columns
  - `mock_v_flight_pricing.csv` — ~864 rows, 61 columns
- The filenames mirror the Postgres views they are exported from:
  **`v_hotel_pricing`** and **`v_flight_pricing`** (the `mock_v_` prefix
  marks them as mocked view exports).
- `data/data-loader.js` fetches both CSVs, parses them with PapaParse, and
  reshapes the flat rows into the nested `HOTEL_DATA` / `FLIGHT_DATA`
  structures the pages render from. It also rebuilds `CHECK_IN_WEEKS`,
  `BRANDS`, `DESTINATIONS` and `REVENUE_MANAGERS` from the CSV, and prints a
  **console data-gap report** (`DataLoader.reportDataGaps`).
- `data/data.js` is now a **thin "empty globals" contract** (~50 lines): it
  declares the global names the app reads (`HOTEL_DATA`, `FLIGHT_DATA`,
  `CHECK_IN_WEEKS`, `BRANDS`, `DESTINATIONS`, `REVENUE_MANAGERS`, plus the
  still-referenced non-CSV arrays and two lookup helpers) as **empty**, and
  `data-loader.js` fills the CSV-backed ones at runtime. All hand-generated
  seed data was **removed** (recoverable from git at commit `3f9eb6b` / tag
  `v1.1.0`). **There is no fabricated fallback anymore** — if the CSV fails to
  load, the globals stay empty and the UI shows empty states.

**Future state (planned):**

- A **FastAPI** backend serving the same view-shaped data from a
  **Postgres** database, replacing the static CSV exports.
- The CSV column contract (the `v_hotel_pricing` / `v_flight_pricing`
  shape) is the integration boundary, so the frontend should not need to
  change when the API lands — only `data-loader.js`'s source.

## Serving layout

`data/` is the **web root** in both environments — `hotel.html`,
`flight.html`, the CSVs and `vendor/` are all siblings at runtime:

- **Docker:** `Dockerfile` → `COPY data/ /srv/www/` (nginx root `/srv/www`,
  listens on `:8080`, `/health` endpoint).
- **Local dev:** `serve-demo.ps1` → serves `data/` over
  `http://localhost:8099/` (so `fetch()` can load the CSVs;
  opening the HTML via `file://` will not work).

## Key pages (`data/`)

| Page              | Purpose                                                       |
|-------------------|---------------------------------------------------------------|
| `flight.html`     | Flight pricing recs, LF, competitor fares, RM Copilot         |
| `hotel.html`      | Hotel pricing recs, occupancy, cost-change flags, RM Copilot  |
| `pricing.html`    | Packages tab (currently blanked — no package CSV yet)         |
| `parameters.html` | Autopilot rules, alerts, price/margin controls, LOS rules     |
| `index.html`      | Small entry point                                             |

Shared assets: `styles.css`, `data.js` (fallback seed), `data-loader.js`
(CSV loader), `chart.local.js` (chart shim), `filters.js` (header filters).

## Data honesty / known gaps

The demo deliberately shows **only data that comes from the CSVs**. Anything
without a CSV backing is blanked (empty state) rather than fabricated, and is
enumerated in the console gap report. Current features with **no CSV backing**:

- **Notes / comments** — no notes column in either CSV.
- **Booking-curve history** — no per-period booking snapshots; chart shows
  "No booking history data available".
- **Fare / price history** ("price worm") — no historical fare time series.
- **Booking sparklines** — no booking snapshots.
- **Hotel cost-change detail** (old/new cost, change $/%, date) — the CSV
  carries only a `has_cost_change` boolean, so detail columns are blank.
- **Publish / audit change log** — no price-change-log columns.
- **RM Copilot narrative** — booking pace, demand drivers, "why" explanations
  and price-elasticity projections are not in the CSV; the copilot reports
  only CSV-derived figures and declines the rest. When no pricing data is
  loaded at all (CSV failed / not connected), it says "No … pricing data is
  loaded … not connected to a data source" instead of implying all-clear.
- **Packages data** — no package pricing CSV; Packages tab shows
  "No package data available".
- **Package autopilot rules** (flight rules drawer) — no CSV source; renders empty.
- **Parameters config** — configuration, not pricing data; **every section is
  blanked to an empty state** ("not yet connected to a data source").

The KPI bars compute only from CSV columns and render blank when a source
column is absent.

**Note on the Packages and Parameters pages:** `pricing.html` and
`parameters.html` do **not** load `data-loader.js`, so they have no CSV data at
all — both pages are entirely gap/empty-state pages, and their header filter
dropdowns (Brand/Region/Destination/RM) render empty. Only `hotel.html` and
`flight.html` load the CSVs. (If a populated filter bar is wanted on the
Packages/Parameters pages, add `data-loader.js` + the PapaParse script to them.)

## Security posture

- **Zero external runtime dependencies** — PapaParse and the chart shim are
  vendored locally; no browser-time CDN/font pulls. Confirmed by a full
  external-reference scan on 2026-06-08: no `http(s)://` fetches, no external
  `<script>`/`<link>`, no `@import`, no external `url()`/`@font-face`, no CDN
  references, no analytics/telemetry. The only `fetch()` is `data-loader.js`
  loading the CSVs by relative path (same-origin), and the only `http://`
  literals are XML namespace strings inside inline `data:` SVGs (not network
  requests).
- **Fonts fall back to system fonts** — `Archivo` / `Inter` / `JetBrains Mono`
  are referenced by name but not vendored, and no font CDN is permitted under
  the CSP, so the browser uses the system sans-serif / monospace stack. This is
  cosmetic, not a runtime dependency; vendoring the font files locally is the
  only way to restore the intended typography.
- **CSP locked to `'self'`** (`nginx.conf`):
  `default-src 'self' 'unsafe-inline' data: blob:; script-src 'self' 'unsafe-inline'; connect-src 'self';`
  (the previous `https://cdnjs.cloudflare.com` script-src allowance was
  removed after PapaParse was vendored).
- Hardening headers: `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `server_tokens off`.
- CI runs secret detection, SAST and container scanning (GitLab).

## CI/CD

GitLab pipeline (`.gitlab-ci.yml`) extends the Simon-Kucher platform
`build-python-application` template. Stages: secret_detection → quality →
test → build_and_push → security (container scanning) → release. Docker image
build/push and GitLab release run on tags.

## Team

- **Tyler** — frontend + backend + API
- **Fei** — database data loading
- **Marcin / Niko** — infrastructure (Postgres, container, deployment)

## Design system

- **Dark navy** top nav, **white** body / content surfaces.
- **Dynamica pink** accent: `#e91e8c` (CSS `--accent`; dim `#c2185b`).
- Positive `#27ae60`, negative `#e74c3c`.
- Type: intended **Archivo** (UI/headings) + **Inter** (body/nav) +
  **JetBrains Mono** (numeric/mono cells) — see fonts note under Tech stack.
- Logo: `engine_logo.png` in the nav, linking to the packages page.
