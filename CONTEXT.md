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

- Three CSV exports live in `data/` (larger `v_*` view exports, ~80 MB total):
  - `v_hotel_pricing_pg.csv`  — ~232k rows, 36 columns
  - `v_flight_pricing_pg.csv` — ~6k rows, 52 columns
  - `v_flight_booking_curve_pg.csv` — ~218k rows, 12 columns
  - These cover **2 destinations** but a wide time range (~184–314 weekly
    periods, 2024–2027) and many hotels/room categories; some rows are sparse
    (placeholder names, `$0` fares/ADR) — the UI shows them faithfully.
- The filenames mirror the Postgres views they are exported from
  (**`v_hotel_pricing`**, **`v_flight_pricing`**, **`v_flight_booking_curve`**);
  the `_pg` suffix marks them as Postgres view exports.
- **Schema-normalization layer** (`data-loader.js`, `normalizeFlightRow` /
  `normalizeHotelRow`): the view exports renamed/dropped columns and ship LF &
  occupancy as **0–1 fractions** (not 0–100). The normalizer maps the new names
  (`flight_category`→`category`, `forecast_lf`→`forecast_lf_pct`×100,
  `current_occ`→`current_occ_pct`×100, `last_modified_by`→`last_modified_by_name`,
  `hotel_inventory_id`→`inventory_id`, …) and derives the dropped ones
  (`fare_delta_*`, `ros_pct_of_target`, `cheapest_comp_fare`, `comp_delta`,
  `current_lf_pct`, `adr_delta`, `margin_delta`). It is backward-compatible, so
  the older mock schema still loads. `capacity_alert` has **no column** in this
  export, so capacity-alert badges are blank (honest empty state).
- `data/data-loader.js` fetches the CSVs, parses them with PapaParse, and
  reshapes the flat pricing rows into the nested `HOTEL_DATA` / `FLIGHT_DATA`
  structures the pages render from. It also loads `FLIGHT_BOOKING_CURVE_DATA`,
  rebuilds `CHECK_IN_WEEKS`, `BRANDS`, `DESTINATIONS` and `REVENUE_MANAGERS`
  from the CSV, and prints a **console data-gap report**
  (`DataLoader.reportDataGaps`).
- `data/data.js` is now a **thin "empty globals" contract** (~50 lines): it
  declares the global names the app reads (`HOTEL_DATA`, `FLIGHT_DATA`,
  `FLIGHT_BOOKING_CURVE_DATA`, `CHECK_IN_WEEKS`, `BRANDS`, `DESTINATIONS`,
  `REVENUE_MANAGERS`, plus the
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

Shared assets: `styles.css`, `data.js` (empty globals contract), `data-loader.js`
(CSV loader), `chart.local.js` (chart shim), `filters.js` (header filters).

## Data honesty / known gaps

The demo deliberately shows **only data that comes from the CSVs**. Anything
without a CSV backing is blanked (empty state) rather than fabricated, and is
enumerated in the console gap report. Current gaps and partial-backed areas:

- **Notes / comments** — no notes column in the loaded CSVs.
- **Flight booking curves** are backed by
  `v_flight_booking_curve_pg.csv`. Its `entity_id`s match the
  pricing `flight_date_id`s exactly (all 864 flights), so every flight resolves
  to an **"Exact curve"** match. The fallback chain (route/date → destination+gateway
  → destination-wide) remains in place for any flight without an exact row, and a
  flight with no curve rows at all still shows "No booking history data available".
- **Fare / price history** ("price worm") — no historical fare time series.
- **Booking sparklines** — no booking snapshots.
- **Hotel cost-change detail** (old/new cost, change $/%, date) — the CSV
  carries only a `has_cost_change` boolean, so detail columns are blank.
- **Publish / audit change log** — no price-change-log columns. There is no
  publish/approval/status column, so the **"Pending approval" KPI is blank** on
  both pages (it previously proxied the unrelated `auto_changed` flag).
- **No invented alert thresholds.** Alerts use only the real target columns: a
  flight is "behind target" when `current_lf_pct < target_lf_pct` / rate of sale
  `< 100%` of `rate_of_sale_target`; capacity alerts come from `capacity_alert`.
  The hotel CSV has **no occupancy target/plan column**, so "Hotels behind plan"
  and "High demand" KPIs are **blank**, the hotel fast/slow-seller row badges are
  removed, and the copilot declines to flag "behind plan" (it lists lowest
  forecast occupancy instead). No hardcoded cutoffs or tolerance buffers.
- **RM Copilot narrative** — demand drivers, "why" explanations
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
