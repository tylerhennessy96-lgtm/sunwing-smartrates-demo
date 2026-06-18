"""Validate the static CSV contract for the SmartRates demo.

The frontend is CSV-only: these files are the runtime data source. This check
keeps CI honest by failing if a required export is missing required columns,
contains no rows, or drifts outside the committed demo date window.
"""

from __future__ import annotations

import csv
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
# Optional demo date window — mirrors data-loader.js. Leave as None to accept
# whatever date range the exports contain (the frontend reads any range); set
# both to ISO dates to pin the contract to a fixed window.
START_DATE: str | None = None
END_DATE: str | None = None


@dataclass(frozen=True)
class CsvContract:
    filename: str
    date_column: str
    required_columns: tuple[str, ...]


CONTRACTS = (
    CsvContract(
        "v_package_pricing_pg.csv",
        "departure_date",
        (
            "package_id",
            "origin_code",
            "origin_city",
            "destination_id",
            "destination_name",
            "region_name",
            "brand_name",
            "departure_date",
            "return_date",
            "duration",
            "week_start",
            "week_label",
            "hotel_id",
            "hotel_name",
            "stars",
            "room_category_name",
            "meal_plan_name",
            "service_type",
            "tour_operator_code",
            "current_package_price",
            "rec_package_price",
            "regular_price",
            "hotel_current_booked_room_nights",
            "estimated_total_cost",
            "current_margin",
            "rec_margin",
            "has_cost_change",
            "last_modified_by",
        ),
    ),
)


def iso_date(value: str) -> str:
    text = (value or "").strip()
    if not text:
        return ""

    if len(text) >= 10 and text[4] == "-" and text[7] == "-":
        return text[:10]

    for fmt in ("%m/%d/%Y", "%m/%d/%y"):
        try:
            return datetime.strptime(text, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue

    return ""


def validate_contract(contract: CsvContract) -> str:
    path = DATA_DIR / contract.filename
    if not path.exists():
        raise AssertionError(f"{contract.filename}: missing file")

    row_count = 0
    outside_window = 0
    invalid_dates = 0
    min_date: str | None = None
    max_date: str | None = None

    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        fieldnames = reader.fieldnames or []
        missing = [column for column in contract.required_columns if column not in fieldnames]
        if missing:
            raise AssertionError(f"{contract.filename}: missing columns: {', '.join(missing)}")

        for row in reader:
            row_count += 1
            value = iso_date(row.get(contract.date_column, ""))
            if not value:
                invalid_dates += 1
                continue
            min_date = value if min_date is None or value < min_date else min_date
            max_date = value if max_date is None or value > max_date else max_date
            if (START_DATE and value < START_DATE) or (END_DATE and value > END_DATE):
                outside_window += 1

    if row_count == 0:
        raise AssertionError(f"{contract.filename}: no data rows")
    if invalid_dates:
        raise AssertionError(f"{contract.filename}: {invalid_dates} invalid {contract.date_column} values")
    if outside_window:
        raise AssertionError(
            f"{contract.filename}: {outside_window} rows outside {START_DATE}..{END_DATE}"
        )

    return (
        f"{contract.filename}: {row_count:,} rows, "
        f"{contract.date_column} range {min_date}..{max_date}"
    )


def main() -> None:
    for contract in CONTRACTS:
        print(validate_contract(contract))


if __name__ == "__main__":
    main()
