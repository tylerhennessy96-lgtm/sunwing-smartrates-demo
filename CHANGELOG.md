# Changelog

Append-only history of notable changes. **Newest entries at the top.**

Format:

```
## YYYY-MM-DD — Short title
- What changed
- Why
```

---

## 2026-06-18 — Packages accordion + booking-curve panel
- Packages table is now an accordion: parent rows are hotel offerings (sum of
  room nights sold shown at parent; blank at room-class level), expanding to
  room-type sub-rows. Removed the Flight # column; "Price"/"Rec Price" became
  "Prices From"/"Rec. From Price"; dropped the struck-through "was" price and
  added a `$` to the editable Price/Margin inputs; Sold/Pickup tooltips clarified
  (room nights; pickup is a hotel figure, not flight).
- Clicking a parent row opens a booking-curve panel that slides up from the
  bottom (dark, Flight-tab style) with three charts (outbound / inbound flight,
  hotel) stacked on a shared days-to-departure x-axis.
- Booking-curve data: `scripts/build_booking_curves.py` aggregates the large raw
  per-package exports (~420 MB, git-ignored) into compact `curves_*.json` (~0.5 MB
  total) keyed by flight / hotel-week; the panel lazy-loads and renders them with
  `chart.local.js`. Offerings without a matching curve show an honest empty state.
- Default Pricing landing is the Packages page (nav-tab now points to
  `pricing.html` on the flight/hotel/parameters pages).
- Dropped `v_flight_booking_curve_pg.csv` from the CSV contract validator (the
  per-flight curve export was removed in favour of the aggregated curves).
- Why: make the packages view explorable down to room type and surface booking
  curves per offering without shipping hundreds of MB of raw data.

## 2026-06-17 — Packages tab: columns, filters, editable margin, system fonts
- Packages table reshaped around the larger `v_package_pricing_pg.csv` export:
  surfaced flight forecast LF (`outbound`/`return`) and pickup pax (7d/14d)
  columns; added blank `Sold STLY` and `Hotel Fcst` columns (no backing column
  yet — honest em-dash placeholders); changed `Sold / Alloc` to `Sold`; removed
  the TO, Time dep./arr., Bagg., Pkg LF, Ret LF, RT LF, and Margin % columns.
- Room type moved out of its own `Room Desc` column to a sub-line under the
  Hotel cell; the region badge now stacks under the destination name.
- Price and margin are both editable and linked via `margin = price - totalCost`
  (price stays the single source of truth, so they can't drift).
- Added Hotel / Gateway / Nights header filters (derived from the loaded CSV);
  fixed the "Select weeks" date filter, which was a no-op on packages — it now
  matches on the picker's Monday anchor (package `week_start` is Sunday-based).
- Hid the Flight Only / Hotel Only subtabs while those tabs are in development;
  removed the single-item "New Recommendations" sub-subtab and its dead code.
- Replaced the unloaded named fonts (`Archivo`/`Inter`/`JetBrains Mono`, which
  silently fell back to differing generics) with `--font-sans` / `--font-mono`
  system-font CSS variables across all pages — consistent, no downloads.
- Added `scripts/validate_csv_contract.py` static data-contract check.
- Why: adapt the UI to the richer package export, make pricing/margin directly
  adjustable, give RMs hotel/gateway/nights/week filtering, and standardize
  typography without any external font dependency.

## 2026-06-16 — Make the frontend read any CSV date range
- `data-loader.js` no longer clamps loaded rows to a hard-coded Jul–Sep 2026
  window. `ACTIVE_START_DATE_ISO` / `ACTIVE_END_DATE_ISO` are now optional
  (default `null` = unbounded); `isWithinActiveDateWindow` keeps every row when
  no window is set, and still clamps if either bound is configured.
- Everything downstream already adapts to the data: week columns
  (`CHECK_IN_WEEKS`) and the "Select weeks" picker are derived from the loaded
  rows, and pages only apply a date filter once a range is actually selected
  (no selection = show all). So a wider (or narrower) export just works.
- `scripts/validate_csv_contract.py` mirrors this: `START_DATE` / `END_DATE`
  default to `None`, so the contract accepts any range while still checking
  required columns, non-empty rows, and parseable dates.

## 2026-06-16 — Re-trim swapped-in realistic CSV exports
- New, more realistic mock exports replaced all four `data/v_*.csv` files (full
  62/52/36/12-column schemas again, spanning 2024–2027). Re-ran the trim:
  - Columns → per-file used set (same keep-lists as before; schemas matched):
    package 62→31, hotel 36→28, flight 52→44, curve 12 (unchanged).
  - Rows → trimmed to the Jul 1–Sep 30 2026 demo window (the loader already
    filters to this at runtime), matching the approved-window process:
    hotel 232,408→19,618, flight 6,037→413, curve 218,662→4,719,
    package 29,095→19,580. Combined size ~71MB → ~11MB.
- `validate_csv_contract.py` passes; date ranges sit inside the window.
- (Renamed the duplicate-download `v_package_pricing_pg 1.csv` back to
  `v_package_pricing_pg.csv` so the loader finds it.)

## 2026-06-16 — Fix Hotel tab freeze on the larger CSV exports
- The Hotel recommendations table built one row per destination × check-in week
  for the whole dataset at once. With the larger export (11,775 destinations ×
  92 distinct week_starts ≈ 1.08M rows) the single `innerHTML` assignment locked
  the tab so it never painted.
- `renderRecsTable` now renders in batches of 300 dest-week rows with a "Show
  more" control (mirrors the Packages tab), resetting to the first page on
  header-filter, advanced-filter, and sort changes. The row-count bar still
  reflects the true total matched.
- Also skipped the per-row advanced-filter match allocation for rows beyond the
  page cap when no advanced filters are active, so the count pass stays cheap
  across the large dest×week space.
- Not caused by the column trim below — row/destination counts are unchanged;
  this was a pre-existing scale regression from swapping in the larger exports.

## 2026-06-16 — Trim CSV exports to per-file used columns
- Reduced each `data/v_*.csv` export to only the columns its page/loader
  actually reads (derived from `data-loader.js` builders, including the
  dynamic `_${eco|biz}` cabin keys):
  - `v_package_pricing_pg.csv`: 62 → 31 cols (14.5 MB → 8.4 MB) — dropped unused
    economics/keys (air fares, est. hotel/air cost, flight_*/hotel_occ, ADRs,
    supplier cost, beds:seats, classification, room_category_id, *_code, locks).
  - `v_hotel_pricing_pg.csv`: 36 → 28 cols (6.3 MB → 4.8 MB).
  - `v_flight_pricing_pg.csv`: 52 → 44 cols — dropped total_beds/total_seats,
    *_lf_biz, region_id/brand_id, lock_reason/until.
  - `v_flight_booking_curve_pg.csv`: unchanged (all 12 cols used).
  - Common drops: `region_id`, `brand_id`, `lock_reason`, `lock_until`
    (names used; values never read — region_name/brand_name carry the data).
- Updated `scripts/validate_csv_contract.py` required-column lists for the
  flight and package contracts to match the trimmed schema (CI stays green).
- Why: the CSVs are the runtime data source; carrying columns nothing renders
  inflated payloads (esp. the package export) with no benefit.

## 2026-06-15 — Flatten Packages tab to a single flat table
- Replaced the 4-level accordion (Destination → Hotel → Gateway → Week →
  package) on the Packages tab (`data/pricing.html`) with one flat row per
  package, modeled on the tour-operator booking-results layout:
  Destination (with an inline ⚠ cost-change indicator), Hotel (+stars),
  Room Desc, Nt, TO, Dates (dep/return), Gateway,
  Flight #, Time dep./arr., Bagg., Sold/Alloc, LF, Price (editable, with the
  regular "was" price struck through below), Rec Price, Δ$, margins, Margin %,
  Pace, and a Book (Revnet/WEB) + Notes/Lock actions cell.
- Removed the tree machinery (expand sets, toggle handlers, per-node
  aggregation rows); pagination is now row-based ("Show next 250 packages").
- Extended the package leaf in `data/data-loader.js` with `tourOperator`,
  `departureDate`, `returnDate`, `mealPlan`, `regularPrice`, and `hasCostChange`
  from existing CSV columns.
- Flight #, Time dep./arr., and Bagg. columns render as blank ("—") cells —
  the package CSV carries no per-flight schedule or baggage data, so nothing is
  fabricated.
- Why: requested simpler, scannable package layout matching the shared
  booking-results reference; the accordion was no longer needed.

## 2026-06-15 - Pivot to CSV-only static delivery
- Scrapped the API/backend delivery path for this app. Runtime data now comes
  solely from the committed CSV exports in `data/`; there is no frontend
  dependency on FastAPI, Postgres, DB credentials, or runtime secrets.
- Trimmed all CSVs to the approved demo window, July 1, 2026 through
  September 30, 2026 inclusive, and updated `data-loader.js` to enforce that
  window at runtime.
- Added `scripts/validate_csv_contract.py` and a GitLab
  `test:csv-contract` job to validate required CSV files, required columns,
  row counts, and date-window compliance.
- Replaced the generic README and refreshed `CONTEXT.md` around the static
  CSV-only operating model.
- Removed the obsolete in-repo FastAPI scaffold from `application/backend/`.
- Optimized the Packages tab renderer with cached package tree leaves and
  aggregates plus batched destination rendering, so the page no longer draws
  every destination row up front.

## 2026-06-11 — Load-performance: per-page CSVs, lazy curve, gzip (no data changes)
- Loader split into per-dataset loaders (`loadHotelRows` / `loadFlightRows` /
  `loadCurveRows`); `loadData(opts)` now fetches only the requested files.
- Flight page: renders from the flight CSV first (~0.6 MB gzipped) and loads the
  72 MB hotel export in the **background** (only feeds the Hotel Occ % column,
  which shows "—" until it arrives). Beds:Seats already uses the flight CSV's own
  column, so it's immediate.
- Booking curve (27 MB) is now **lazy** — fetched on demand the first time a
  Booking Curve is opened (with a "Loading…" state), not on every page load.
- Hotel page: loads ONLY the hotel CSV — dropped the flight (2.7 MB) and curve
  (27 MB) exports it never used.
- gzip enabled in `nginx.conf` and the dev `serve-demo.ps1` for CSV/JS/HTML:
  measured flight 2.7→0.59 MB, hotel 72→19 MB over the wire.
- No CSV/data files were modified.

## 2026-06-11 — Wire up the Packages tab from v_package_pricing_pg.csv
- Added `v_package_pricing_pg.csv` (~29k rows; one row per bookable package,
  bundling flight + hotel + package economics) and wired the previously-blanked
  Packages tab (`pricing.html`) to it.
- `data-loader.js`: added `loadPackageData()` (fetches ONLY the package CSV —
  not the 80 MB hotel/flight/curve exports — date-filtered to the active
  window), `buildPackageData()` (flat rows → Destination → Week → Gateway →
  Package tree the page renders), and `applyPackagesToGlobals()` (fills
  PACKAGE_DATA + the Brand/Region/Destination/RM filter globals from the package
  rows so the page works standalone). Exposed both on `DataLoader`.
- `pricing.html`: loads PapaParse + `data-loader.js`, replaced the forced
  "No package data" empty state with the real tree render, and added an async
  boot that loads the package CSV, populates globals, then renders.
- Pkg LF / sold / alloc use the row's hotel occupancy; margin = package price −
  estimated total cost; booking pace from rate_of_sale vs target.
- Updated the data-gap list (packages no longer a gap) and the docs.

## 2026-06-10 — Future-only date window + working calendar/list date filter
- Loader filters rows to `week_start` / `departure_date` >= `MIN_ACTIVE_DATE_ISO`
  (`2026-05-01`) so only future-dated weeks load, and stamps the year into week
  labels (`weekLabelWithYear`) since the data now spans 2024–2027.
- Fixed the header **Select weeks** filter on flight.html, which wasn't filtering
  the table: it took the week's reference date from `routes[0]` only, but routes
  fly different week-sets in this data (ISL/MXB each have many routes flying ~4 of
  83 weeks), so `routes[0]` was empty for most weeks and the filter was skipped.
  Now it uses the first route that actually flies each week.
- Calendar view: the date filter now narrows the week **columns** (was rendering
  all ~83 weeks and only blanking out-of-range cells), keyed off each week's
  original index; and filter changes now re-render the calendar (the handler
  previously only re-rendered the list view).
- Week picker shows the year and opens on the first loaded week.

## 2026-06-10 — Swap in the larger v_* mock exports + schema-normalization layer
- Replaced the small mock CSVs with the larger Postgres-view exports (~80 MB:
  hotel ~232k rows, flight ~6k, curve ~218k) under the `v_*_pg.csv` names. These
  cover 2 destinations across ~184–314 weekly periods (2024–2027); some rows are
  sparse (placeholder names, `$0` values) and render as-is.
- Added `normalizeFlightRow` / `normalizeHotelRow` to `data-loader.js`: the view
  exports renamed columns and ship LF/occupancy as 0–1 fractions, so the layer
  remaps names (`flight_category`→`category`, `forecast_lf`→`forecast_lf_pct`×100,
  `current_occ`→`current_occ_pct`×100, `last_modified_by`→`last_modified_by_name`,
  `hotel_inventory_id`→`inventory_id`, …) and derives the dropped columns
  (`fare_delta_*`, `ros_pct_of_target`, `cheapest_comp_fare`, `comp_delta`,
  `current_lf_pct`, `adr_delta`, `margin_delta`). Backward-compatible, so the old
  schema still loads. Extended `bool()` for Postgres `t`/`f`.
- `capacity_alert` is absent from this export → capacity-alert badges blank
  (honest empty state), consistent with the no-fabricated-data rule.
- Note: earlier entries today (beds:seats spread, "21 capacity alerts", 864
  flights) describe the *previous* small dataset and are superseded by this swap.
- Heads-up: ~232k rows parse/reshape client-side, so first load is heavy.

## 2026-06-10 — Remove fabricated alert thresholds from the KPI bars
- Flight KPIs: "Pending approval" had no backing column — it was the count of
  `auto_changed` rows mislabeled as "waiting to publish"; now blanked. "Rate of
  sale alerts" used an invented `< 75%` cutoff; now the definitional "behind
  target pace" = `ros_pct_of_target < 100`. Also fixed a sign error: "Competitor
  undercuts" counted `comp_delta < 0` (where WE are cheaper) but should be `> 0`
  (competitor priced below us).
- Removed the invented `targetLF − 0.05` (5-point) tolerance from the row/route
  alert flags and the "behind LF" advanced filter — "behind target" now means
  `forecastLF < targetLF` off the real `target_lf_pct` column, no made-up buffer.
- Hotel KPIs: "Pending approval" was the same `auto_changed` proxy → blanked.
  "Hotels behind plan" (`<60`) and "High demand" (`≥75`) had no target-occupancy
  column to stand on → both blanked (no honest threshold exists).
- Swept the rest of the hardcoded thresholds (per request):
  - Hotel row flags: removed the 🔥 fast-seller / 🐢 slow-seller badges
    (soldPct>0.80/0.85, <0.35 & <60d) — no occupancy target to judge demand by;
    only the real cost-change ⚠️ remains.
  - Hotel copilot: dropped the "undersold (<50%)" count, reframed the
    room-category answer to rank by real sold % (no "below 50%" claim), and the
    "behind plan" answer now says there's no occupancy target/plan and lists the
    lowest forecast-occupancy hotels instead of using a `<0.60` cutoff.
  - Flight row-copilot beds:seats wording used `0.95/1.05`; aligned to the CSV /
    table cut-points (`0.85/1.15`).
- Left in place (real or definitional, not fabricated): LF-vs-target & rate-of-
  sale alerts (real target columns), capacity alerts (`capacity_alert`), comp
  undercuts, and pure colour-tiering of real values (occ/margin badges, calendar
  heat). The hotel Undersold/Oversold advanced-filter toggles (50/90) are kept as
  user query tools, not dashboard claims — flag if you want those gone too.
- Why: the dashboard must show only CSV-backed figures; invented thresholds and
  column proxies look authoritative but are fabricated.

## 2026-06-10 — Fix "everything Under-bedded": use the CSV beds:seats ratio
- `bedsSeatsRatio()` was dividing raw hotel allocation (~7.4k room-nights/dest)
  by total flight seats (~18k), two different units over different periods, so
  it returned ~0.4 for every destination and the badge showed "Under-bedded"
  everywhere. It now averages the flight CSV's own `beds_to_seats_ratio`
  (already loaded as `bedsToSeatsRatio`) over the flights at that week.
- Result is the spread the CSV intends — 3 Under / 4 Balanced / 2 Over across the
  9 destinations (e.g. Riviera Maya → Balanced, Varadero → Over-bedded). The
  `ratioBadge` thresholds (0.85 / 1.15) already match the CSV's own label cuts.
- Made the ratio per-week (it varies per flight in the CSV): the dest-week row
  and both row-copilot scopes now pass `datesAtWeek` instead of the whole dest.
- Note: capacity alerts were already correct — driven by the real `capacity_alert`
  column (21 of 864 flight rows), shown on a dest-week row when any flight is
  flagged; left unchanged.

## 2026-06-10 — Stop competitor fares leaking into Beds/Seats & Hotel Occ columns
- On the flight New Recommendations table, the **Beds/Seats** and **Hotel Occ %**
  columns were rendering economy competitor fares (`comp1Fare`/`comp2Fare`) on
  the flight-date (level 3) and cabin-class (level 4) rows — under headers that
  mean hotel metrics. The destination row correctly shows beds:seats + hotel occ
  there, and the route row already blanks them; levels 3–4 now match the route
  row with a `—` instead of the mislabeled comp prices.
- Removed the now-unused `compA`/`compB`/`compDelta` locals. Competitor fares are
  unaffected elsewhere (Competitor Analysis tab, the comp-delta advanced filter,
  and the competitor detail panel all still use them).
- Why: beds:seats ratio and hotel occupancy are destination/week-level hotel
  metrics with no per-flight meaning; backfilling those cells with competitor
  fares put data under the wrong column headers.

## 2026-06-10 — Rename CSV exports to clean `v_*_pg.csv` view names
- Renamed the three data files to mirror the Postgres views with a `_pg`
  suffix, dropping the `mock_` prefix and `_mapped` tag:
  - `mock_v_hotel_pricing.csv` → `v_hotel_pricing_pg.csv`
  - `mock_v_flight_pricing.csv` → `v_flight_pricing_pg.csv`
  - `mock_v_flight_booking_curve_pg_mapped.csv` → `v_flight_booking_curve_pg.csv`
- Updated the loader candidate lists (`data-loader.js`), the `data.js` contract
  comments, and CONTEXT.md to the new names; verified all three serve 200 and
  no `mock_v_`/`_mapped` references remain.
- Why: align the static exports with the source view names, so the CSV contract
  reads cleanly.

## 2026-06-10 — Fix chart canvas not filling its container (320px lock)
- `chart.local.js` now sizes each canvas to its PARENT wrapper
  (`position:relative; width:100%; height:NNNpx`) instead of the canvas's own
  box. A bare `<canvas>` defaults to 300×150 and `max-width:100%` only caps
  (never stretches) it, so the shim was reading ~300px, flooring to its old
  `Math.max(320,…)` minimum, and pinning every chart to 320×220 inside a much
  wider panel — the booking curve looked compressed into the left third.
- Dropped the 320×220 floor (now a small 120px guard) since the real width
  comes from the container; `flex:1` chart-boxes already resolve to ~half the
  panel before JS runs, so the canvas fills correctly in one pass.
- Affects all four shim charts (flight booking + fare, hotel booking + worm).
- Why: the earlier x-axis work was correct (points were always value-scaled);
  the remaining "squashed curve" was purely the canvas not using the full
  container width.

## 2026-06-10 — Fix booking-curve x-axis: value-scaled, non-overlapping labels
- `chart.local.js` shim now generates round, evenly-spaced x-axis ticks by VALUE
  (a 1/2/2.5/5×10ⁿ "nice ticks" helper) instead of emitting one label per data
  point. For the 0–500 days-to-departure axis this renders 0/100/…/500 rather
  than the crammed, overlapping marker labels at the dense (near-0) end.
- Labels are now centre-aligned per tick, clamped so the first/last aren't
  clipped, and skipped if they would overlap the previously drawn label
  (pixel-collision autoSkip); tick count is capped to what the plot width fits.
- Added faint vertical gridlines at ticks (only when the axis enables its grid),
  guarding against the page's per-tick `grid.color` callback being passed to
  `strokeStyle`. Point projection was already value-based and reversed correctly
  (500 left → 0 right); this is purely a tick/label fix.
- Affects every chart using the shim — flight booking-curve + fare-worm and the
  hotel booking-curve + price-worm charts.
- Why: the booking-curve chart's x-axis labels were bunched and overlapping at
  the right end; the shim lacked value-spaced ticks and overlap avoidance.

## 2026-06-10 — Swap booking-curve CSV for ID-mapped version (100% exact match)
- Replaced `mock_v_flight_booking_curve_pg.csv` with
  `mock_v_flight_booking_curve_pg_mapped.csv` (~39,900 rows, same 12-column
  schema) whose `entity_id`s match the pricing `flight_date_id`s exactly — all
  864 flights now resolve to an "Exact curve" instead of a destination-wide
  reference approximation.
- Pointed the loader's `FLIGHT_BOOKING_CURVE_CSV_CANDIDATES` at the new
  `_mapped` filename (the old file is no longer on disk), and updated CONTEXT.md
  to reflect the new file, row count and exact-match behavior.
- Why: the previous curve CSV didn't share flight IDs with the pricing data, so
  the chart fell back to approximate matches; the mapped export gives every
  flight its own real actual/target/forecast curve.

## 2026-06-10 — Flight booking-curve CSV integration
- Added `mock_v_flight_booking_curve_pg.csv` as an optional CSV source for the
  flight Booking Curve chart, exposed through `FLIGHT_BOOKING_CURVE_DATA`.
- Flight analytics now renders actual / target / forecast cumulative sold
  curves from the booking-curve CSV. Because the curve CSV does not exactly
  overlap the current pricing flight IDs/dates, the chart uses the best
  available reference match: exact entity, route/date, destination+gateway, then
  destination-wide.
- Updated the data-gap report, context doc and flight Copilot wording so the
  app no longer claims flight booking curves have no backing data.
- Why: replace the flight booking chart empty state with real CSV-backed curve
  data while preserving honest empty states where no matching curve rows exist.

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
- Why: drive the UI from real view-shaped CSV data instead of hardcoded seed
  data.
