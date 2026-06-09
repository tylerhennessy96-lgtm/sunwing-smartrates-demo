# Changelog

Append-only history of notable changes. **Newest entries at the top.**

Format:

```
## YYYY-MM-DD — Short title
- What changed
- Why
```

---

## 2026-06-09 — RM Copilot: "no data / not connected" when nothing is loaded
- Added a guard to the general RM Copilot (hotel + flight): when `HOTEL_DATA` /
  `FLIGHT_DATA` is empty, the greeting and answers now say "No … pricing data is
  loaded — not connected to a data source" instead of replying with
  falsely-reassuring lines (e.g. "no flights at risk") built from empty arrays.
- Why: with the seed data removed, an unloaded/failed CSV leaves the dataset
  empty; the copilot should report that honestly rather than imply all-clear.

## 2026-06-09 — Strip all non-CSV seed data; CSV-only with honest empty states
- Reduced `data.js` from the large hand-generated seed dataset to a thin
  "empty globals" contract (~50 lines): it declares the names the app reads as
  empty and lets `data-loader.js` fill the CSV-backed ones. Removed the seed
  generators and all `_ORIG_*` copies (recoverable from git `3f9eb6b` / `v1.1.0`).
- Removed the CSV-failure fallback: if the CSVs don't load, the UI now shows
  empty states instead of fabricated seed data.
- Blanked the Parameters page — every section renders "No data available — this
  section is configuration and is not yet connected to a data source" (replacing
  the previous sample-config-with-label behavior); added to the gap report.
- Verified no remaining references to the dropped globals across the four pages,
  and that the lookup helpers (`getFlightDateById`/`getCheckInWeekById`) still
  work against the CSV-filled data.
- Why: the dashboard must show ONLY data sourced from the CSVs, so every gap is
  visible as an empty state rather than masked by hardcoded values.

## 2026-06-08 — Vendor PapaParse, lock CSP, verify zero external runtime deps
- Vendored PapaParse locally (confirmed genuine v5.4.1, MIT) and moved it to
  `data/vendor/papaparse.min.js` so it sits under the `data/` web root and ships
  in the Docker image; updated the `<script>` tags in `hotel.html` / `flight.html`
  to load the local copy instead of cdnjs.
- Tightened the nginx Content-Security-Policy to drop the
  `https://cdnjs.cloudflare.com` allowance — `script-src` is now `'self'
  'unsafe-inline'`.
- Ran a full external-reference scan across all HTML/CSS/JS and confirmed
  **zero external runtime dependencies**: no external scripts/links/fonts/CDNs,
  no analytics, and the only `fetch()` is the same-origin CSV load.
- Why: seal the container so the browser fetches nothing from outside our own
  origin, and lock the CSP down to match.

## 2026-06-08 — Set up project documentation
- Added `CONTEXT.md` (living project context: stack, data architecture, serving
  layout, known gaps, security posture, team, design system) and this
  `CHANGELOG.md`. `README.md` left untouched.
- Why: give any teammate or future session a fast, accurate way to get oriented,
  and a single place to record ongoing changes.

## 2026-06-08 — Blanked all non-CSV / fabricated data; added console gap report
- Rewrote the RM Copilot (hotel + flight) to report only figures derived from
  the CSV (occupancy, LF, fares, margin, rate of sale, competitor fares) and to
  decline questions it can't back with data (booking pace, demand drivers,
  "why" explanations, price-elasticity projections) instead of inventing them.
- Blanked features with no CSV backing: Packages tab now shows "No package data
  available"; the Parameters page is flagged "Sample configuration — not yet
  connected to a data source"; cost-change detail columns render blank.
- Bypassed the corresponding hardcoded arrays in `data.js` (emptied at runtime,
  originals preserved as `_ORIG_*`), keeping the file for reference.
- Expanded `DataLoader.reportDataGaps()` into three categories: columns expected
  but missing, columns present but empty, and UI features with no CSV backing.
- Why: the demo must clearly show where real data exists vs. where the data
  gaps are — nothing fabricated should reach the UI.

## 2026-06-08 — Vendored PapaParse locally; tightened nginx CSP
- Replaced the cdnjs PapaParse `<script>` in `hotel.html` / `flight.html` with
  the locally vendored `data/vendor/papaparse.min.js`.
- Removed the `https://cdnjs.cloudflare.com` allowance from the `script-src`
  CSP directive in `nginx.conf` (now `script-src 'self' 'unsafe-inline'`).
- Why: eliminate the last external runtime dependency so the container is fully
  self-contained and the CSP can be locked to `'self'`.

## 2026-06-08 — CSV data integration
- Added `data/data-loader.js`: loads `mock_v_hotel_pricing.csv` and
  `mock_v_flight_pricing.csv` via PapaParse and reshapes them into the nested
  `HOTEL_DATA` / `FLIGHT_DATA` structures the pages render from; also rebuilds
  the header-filter lists. `data.js` demoted to a fallback used only if the CSV
  load fails.
- Why: drive the UI from real (view-shaped) data instead of hardcoded seed data,
  as the bridge toward the planned FastAPI + Postgres backend.
