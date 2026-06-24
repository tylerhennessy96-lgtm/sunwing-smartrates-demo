# Dynamica SmartRates Static Demo

This repository contains the Sunwing/Dynamica SmartRates demo as a static,
CSV-backed web application.

There is no runtime API, backend service, database connection, or secrets
configuration in the current delivery path. The browser loads committed CSV
exports from the same origin as the HTML pages, and the Docker image bakes
`data/` directly into nginx.

## Runtime Shape

- Static web root: `data/`
- Local server script: `serve-demo.ps1`
- Container server: nginx on port `8080`
- Runtime data source: committed CSV files in `data/`
- Browser network access: same-origin static assets and CSVs only

## Required Runtime Data

The active Packages workflow expects these committed files to exist in `data/`:

| File | Primary date field | Used by |
| --- | --- | --- |
| `v_package_pricing_pg.csv` | `departure_date` | Packages page |
| `curves_outbound.json` | generated | Outbound booking curves |
| `curves_inbound.json` | generated | Inbound booking curves |
| `curves_hotel.json` | generated | Hotel booking curves |

The raw booking-curve CSV exports are local build inputs and are ignored because
they are too large for the static repo/image. Regenerate the committed compact
JSON after replacing those raw exports:

```powershell
python .\scripts\build_booking_curves.py
```

## Local Run

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve-demo.ps1
```

Then open:

```text
http://localhost:8099/flight.html
http://localhost:8099/hotel.html
http://localhost:8099/pricing.html
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

## Data Refresh Process

1. Export the package pricing CSV and raw booking-curve CSVs from the approved
   source.
2. Sanitize the files so they contain no secrets, credentials, customer PII, or
   non-demo data.
3. Replace `data/v_package_pricing_pg.csv` and the local raw curve CSVs in
   `data/`.
4. Run `python .\scripts\build_booking_curves.py`.
5. Run `python .\scripts\validate_csv_contract.py`.
6. Start the local server and smoke-test `pricing.html`.

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

The UI intentionally shows only values present in the CSVs. Features without
CSV backing render as empty states or explain the missing data in the RM
Copilot. Examples include persistent notes, publish/audit history, detailed
cost-change history, and package autopilot rules.
