# Dynamica SmartRates - Project Context

Living context document. Keep this current so any teammate or future session can
get oriented quickly. Verified against the codebase on 2026-10-08.

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
| `data/v_flight_pricing_pg.csv` | `departure_date` | Flight pricing and calendar view |
| `data/curves_outbound.json` | generated | Outbound booking curves |
| `data/curves_inbound.json` | generated | Inbound booking curves |
| `data/curves_hotel.json` | generated | Hotel booking curves; absolute room nights keyed by destination, hotel, Sunday week start, and duration |

Current committed package export: **29,095 rows**.

Current local refresh: **29,095 package rows** and **272 flight rows**, both
covering departures from 2026-06-08 through 2026-09-07. The regenerated curve
JSONs contain 476 outbound keys, 475 inbound keys, and 2,558 hotel keys.
Hotel keys match every package row. The raw flight exports omit 3 outbound
pricing keys (210 package rows) and 4 inbound pricing keys (280 package rows);
those offerings use the existing no-curve state. The raw files contain
3,471,800 rows in total and passed checks for schema, buckets, dates, curve
types, and finite numeric values.

Flight grouping retains all 272 departures. Each route/week slot contains
either a single flight or a weekly summary with a `days` collection. Summary
totals include all departures; list rows, calendar cells, date lookups, and
margin scopes use the individual flights. Calendar month buckets filter on
actual departure dates, including weeks spanning two months. Default slider
endpoints are unbounded until narrowed, preserving forecasts over 100% and
preventing inactive advanced filters from hiding flights.

`scripts/test_frontend_regressions.js` checks complete CSV flight coverage,
totals, sparse weekly grouping, daily lookups, and chart markers using Node.js
and the already-vendored CSV parser. Browser checks also confirmed all 272
list/calendar departures, period-scoped detail panels, bulk margin changes,
and orange price-history points at desktop and mobile widths.

Hotels is intentionally empty for this demo: `v_hotel_pricing_pg.csv` is not
supplied. Flights hotel-occupancy values are therefore blank as well. This
does not affect package hotel metrics or package hotel booking curves.

Packages currently display pickup from `pickup_pax_1d`, `pickup_pax_3d`, and
`pickup_pax_7d`; the old 14-day pickup column is no longer shown.

Packages also show `Sup`, the cumulative supplementary price adjustment from
the base price. Manual price changes and accepted recommendations both flow
into this value.

The Flights page is no longer a fare-editing workflow, but it does support
margin-only what-if adjustments at destination-week, route, and flight-date
levels using paired percentage and absolute dollar inputs. Flight calendar load
factor values should read from `curve_current_lf`, `curve_forecast_final_lf`,
and `curve_target_same_time_last_year_lf` with ratio-style curve values scaled
to percentages.

Raw booking-curve exports are local build inputs and are intentionally ignored
because they are too large for the static image/repo:

| File | Status |
| --- | --- |
| `data/outbound_booking_curve.csv` | ignored raw source |
| `data/inbound_booking_curve.csv` | ignored raw source |
| `data/hotel_booking_curve.csv` | ignored raw source |

These three inputs are excluded by both `.gitignore` and `.dockerignore`;
the container ships only their generated curve JSONs.

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

Hotel booking curves are intentionally aggregated at
`destination_id|hotel_id|week_start|duration`. Do not collapse them to
destination-week-duration; that sums targets across unrelated hotels and makes
the Packages chart targets unrealistically large. The current hotel builder uses
the raw `weeks_to_stay` bucket when available and falls back to
`week_start - snapshot_date` for older exports.

## Serving Layout

`data/` is the web root in container/`serve-demo.ps1` environments:

- Docker: `Dockerfile` copies `data/` to `/srv/www/`, nginx listens on `8080`.
- Local: `python -m http.server 8099 --bind 127.0.0.1 --directory data` serves
  `data/` at `http://localhost:8099/`. The ignored `serve-demo.ps1` helper is
  optional and may be absent in a fresh checkout.

Useful local URLs:

```text
http://localhost:8099/flight.html
http://localhost:8099/hotel.html
http://localhost:8099/pricing.html
http://localhost:8099/parameters.html
```

If using a simple `python -m http.server` from the repository root instead,
run `python -m http.server 8099 --bind 127.0.0.1 --directory data` and open the
same `http://localhost:8099/...` URLs.

Opening pages via `file://` will not work because the browser must fetch CSVs.

## Key Pages

| Page | Purpose |
| --- | --- |
| `data/flight.html` | Flight load factor, margin-only what-if adjustments, competitor fares, week/month calendar view, RM Copilot |
| `data/hotel.html` | Hotels pricing and occupancy UI; intentionally empty without a hotel pricing export |
| `data/pricing.html` | Package pricing accordion, bell alert column, status column, date/advanced filters, column selector, selected-row bulk overrides, paginated rendering, booking curves |
| `data/parameters.html` | Package alert thresholds, package rules, and package price-control guardrails; flights/hotels remain blank |
| `data/index.html` | Entry point |

Shared assets include `styles.css`, `data.js`, `data-loader.js`,
`chart.local.js`, `filters.js`, `package-parameters.js`, and vendored
libraries under `data/vendor/`.

## Data Honesty

The demo reports only values that exist in the committed CSVs. Anything without
CSV backing is blanked, rendered as an empty state, or called out by the RM
Copilot. Known gaps include:

- Persistent package notes/comments.
- Persistent package selections, price overrides, and approval state; these are
  client-side demo state until publish/audit backing exists.
- Package parameter settings, including package alerts, package rules, and
  package price controls, are stored in browser localStorage for the static
  demo. Package rules now live under Parameters -> Packages as a two-pane rule
  builder carrying the old flight-tab rule concepts plus date windows. They are
  not yet server-side persisted or audited.
- Flight calendar/list load-factor fields come from `curve_current_lf`,
  `curve_forecast_final_lf`, and `curve_target_same_time_last_year_lf`; booked
  seats come from `curve_current_booked_seats`.
- Flights supports local margin-only what-if adjustments; package pricing
  remains the active price-override workflow.
- Publish, approval, and audit history.
- Historical fare/ADR time series. The Packages booking panel includes a mock
  package price-history chart for demo storytelling, with orange mock
  margin-change points and hover details. `chart.local.js` supports point radii,
  point colors, borders, and marker-only datasets without connecting lines.
- Detailed cost-change history beyond the CSV flag.
- Package autopilot/rule execution beyond the visible localStorage
  configuration.
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
