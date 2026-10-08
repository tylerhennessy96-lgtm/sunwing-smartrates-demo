# Dynamica SmartRates Static Demo

This repository contains the Sunwing/Dynamica SmartRates demo as a static,
CSV-backed web application.

There is no runtime API, backend service, database connection, or secrets
configuration in the current delivery path. The browser loads committed CSV
exports from the same origin as the HTML pages, and the Docker image bakes
`data/` directly into nginx.

## Runtime Shape

- Static web root: `data/`
- Local server: Python HTTP server serving `data/`
- Container server: nginx on port `8080`
- Runtime data source: committed CSV files in `data/`
- Browser network access: same-origin static assets and CSVs only

## Required Runtime Data

The active Packages workflow expects these committed files to exist in `data/`:

| File | Primary date field | Used by |
| --- | --- | --- |
| `v_package_pricing_pg.csv` | `departure_date` | Packages page |
| `v_flight_pricing_pg.csv` | `departure_date` | Flights page and calendar view |
| `curves_outbound.json` | generated | Outbound booking curves |
| `curves_inbound.json` | generated | Inbound booking curves |
| `curves_hotel.json` | generated | Hotel booking curves; absolute room nights keyed by destination, hotel, Sunday week start, and duration |

The raw booking-curve CSV exports are local build inputs and are ignored because
they are too large for the static repo/image. Regenerate the committed compact
JSON after replacing those raw exports. `.dockerignore` also excludes these
raw files from the container build:

```powershell
python .\scripts\build_booking_curves.py
```

Hotel curves should stay keyed at `destination_id|hotel_id|week_start|duration`.
Using only destination/week/duration will over-aggregate hotel targets.

Current demo interaction notes:

- Flights supports margin-only what-if adjustments in the list view; fare
  editing remains hidden.
- Packages supports manual price changes, accepted/rejected recommendations,
  alert filtering, and a `Sup` column showing cumulative supplementary price
  adjustment from base price.

## Local Run

From the repository root:

```powershell
python -m http.server 8099 --bind 127.0.0.1 --directory data
```

Then open:

```text
http://localhost:8099/flight.html
http://localhost:8099/hotel.html
http://localhost:8099/pricing.html
http://localhost:8099/parameters.html
```

An optional local `serve-demo.ps1` helper is ignored by Git and is not included
in a fresh checkout. When available, it can also serve the demo:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve-demo.ps1
```

Opening the HTML files directly with `file://` will not work because the pages
fetch CSVs through the browser.

## CSV Validation

Run the static data-contract check before committing CSV changes:

```powershell
python .\scripts\validate_csv_contract.py
```

The validator checks that each required CSV exists, contains the required
columns, has at least one row, and has parseable package dates.

With Node.js available, run the focused flight and chart regression checks:

```powershell
node .\scripts\test_frontend_regressions.js
```

These check flight-date coverage, weekly totals, sparse weeks, daily lookups,
and point-marker rendering without adding frontend dependencies.

## Package Parameters

`data/parameters.html` currently supports package alert thresholds, package
rules, and package price-control guardrails. These settings are saved in browser
localStorage via `data/package-parameters.js` and drive the Alerts column plus
conditional formatting in `data/pricing.html`. Package rules can be scoped down
to Region -> Destination -> Date -> Hotel and include date windows, old
flight-tab rule concepts, actions, guardrails, and priorities. Package price
controls are limited to min/max price and min/max margin. Flight and hotel
parameter sections remain blank until they have backing configuration data.

## Flight Calendar

`data/flight.html` loads `data/v_flight_pricing_pg.csv` for both list and
week/month calendar views and supports margin-only what-if adjustments.
Calendar/list LF values use
`curve_current_lf`, `curve_forecast_final_lf`, and
`curve_target_same_time_last_year_lf`; booked seats use
`curve_current_booked_seats`.

Route/week rows retain every departure in a `days` collection, with summed
capacity and booked seats. Expand the list to see individual flights. Calendar
cells and detail panels aggregate only the departures in the selected week or
month, including weeks that cross month boundaries. Full-range advanced-filter
sliders do not hide data until the user narrows a bound, so forecasts above
100% remain visible.

## Data Refresh Process

1. Export the package pricing CSV and raw booking-curve CSVs from the approved
   source.
2. Sanitize the files so they contain no secrets, credentials, customer PII, or
   non-demo data.
3. Replace `data/v_package_pricing_pg.csv`, `data/v_flight_pricing_pg.csv` when
   flight pricing changes, and the local raw curve CSVs in `data/`.
4. Run `python .\scripts\build_booking_curves.py`.
5. Run `python .\scripts\validate_csv_contract.py`.
6. Start the local server and smoke-test `flight.html` and `pricing.html`.

No real database credentials, AWS values, secret ARNs, or personal-user details
belong in this repository.

## Deployment

Deployment is a static container:

```powershell
docker build -t sunwing-smartrates-application .
docker run --rm -p 8080:8080 sunwing-smartrates-application
```

The container copies `data/` into nginx and serves the app. There is no API
deployment step and no runtime DB/secrets setup for this app.

## Known Data Gaps

The Hotels tab is intentionally empty in this demo: no
`data/v_hotel_pricing_pg.csv` is supplied. Hotel occupancy on Flights is also
blank; package hotel metrics and booking curves still use the package and
hotel-curve exports.

The October 2026 refresh has 29,095 package rows and 272 flight rows. The
rebuilt hotel curves match every package row; the raw flight-curve exports
omit matches for 210 outbound and 280 inbound package rows, which display the
existing no-curve state. The booking-panel demo date remains `2026-05-27`.

The UI intentionally shows only values present in the CSVs. Features without
CSV backing render as empty states or explain the missing data in the RM
Copilot. Examples include persistent notes, publish/audit history, detailed
cost-change history, package autopilot rules, and persistence for in-browser
package selections or price overrides before publish. The package price-history
chart is mock demo data, not a committed time series. Its orange markers show
mock margin changes; the tooltip displays the price, lead time, and margin
change for a marker.
