"""Collapse the large per-package booking-curve CSV exports into compact,
browser-loadable JSON the Packages booking-curve panel reads on demand.

The raw exports (outbound_booking_curve.csv / inbound_booking_curve.csv /
hotel_booking_curve.csv) are ~420 MB combined — one ~40-point curve per
package_id, which a static browser app cannot fetch/parse. Their package_id
hashes don't match the pricing data and the hotel_id encodings differ, but the
flight keys (origin, destination, date, duration) and the hotel keys
(destination, hotel_id, week_start, duration) DO match. So we aggregate to those levels:

  * outbound/inbound -> true flight load factor = sum(booked) / sum(capacity)
    per (key, days_to_departure, curve_type)
  * hotel -> room nights summed per (key, lead_time_days, curve_type). The new
    hotel export includes explicit weekly `weeks_to_stay` buckets, so those are
    used as the x-axis source. Older exports fall back to Sunday-normalised
    week_start - snapshot_date.

Output: data/curves_outbound.json, curves_inbound.json, curves_hotel.json
keyed by "a|b|c|d" -> { ACTUAL|TARGET|FORECAST: [[x, y], ...] } (x ascending).
"""

from __future__ import annotations

import csv
import json
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data"
TYPES = ("ACTUAL", "TARGET", "FORECAST")


def _f(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _parse_date(value):
    try:
      return datetime.strptime(str(value).strip()[:10], "%Y-%m-%d").date()
    except (TypeError, ValueError):
      return None


def _sunday_week_start(value):
    dt = _parse_date(value)
    if dt is None:
        return None
    return dt - timedelta(days=(dt.weekday() + 1) % 7)


def build_flight(filename, date_col, out_name):
    """booked/capacity sums -> load factor, keyed by origin|dest|date|duration."""
    # key -> days_to_departure -> curve_type -> [booked_sum, cap_sum]
    acc = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: [0.0, 0.0])))
    path = DATA / filename
    with path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            key = f"{row['origin_code']}|{row['destination_id']}|{row[date_col]}|{row['duration']}"
            ct = row["curve_type"]
            if ct not in TYPES:
                continue
            try:
                x = int(float(row["days_to_departure"]))
            except (TypeError, ValueError):
                continue
            cell = acc[key][x][ct]
            cell[0] += _f(row["booked_seats"])
            cell[1] += _f(row["capacity"])

    out = {}
    for key, xs in acc.items():
        series = {t: [] for t in TYPES}
        for x in sorted(xs):
            for ct, (booked, cap) in xs[x].items():
                lf = round(booked / cap, 4) if cap > 0 else 0.0
                series[ct].append([x, lf])
        out[key] = {t: v for t, v in series.items() if v}
    _write(out, out_name)


def build_hotel(out_name):
    """room nights summed, keyed by dest|hotel_id|Sunday week_start|duration."""
    # key -> lead_time_days -> curve_type -> roomnights_sum
    acc = defaultdict(lambda: defaultdict(lambda: defaultdict(float)))
    path = DATA / "hotel_booking_curve.csv"
    with path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            week_start = _sunday_week_start(row.get("week_start"))
            if week_start is None:
                continue
            try:
                lead_days = int(float(row["weeks_to_stay"])) * 7
            except (KeyError, TypeError, ValueError):
                snapshot = _sunday_week_start(row.get("snapshot_date"))
                if snapshot is None:
                    continue
                lead_days = (week_start - snapshot).days
            if lead_days < 0:
                continue
            key = f"{row['destination_id']}|{row.get('hotel_id', '')}|{week_start.isoformat()}|{row['duration']}"
            ct = row["curve_type"]
            if ct not in TYPES:
                continue
            acc[key][lead_days][ct] += _f(row["roomnights"])

    out = {}
    for key, xs in acc.items():
        series = {t: [] for t in TYPES}
        for x in sorted(xs):
            for ct, rn in xs[x].items():
                series[ct].append([x, round(rn, 4)])
        out[key] = {t: v for t, v in series.items() if v}
    _write(out, out_name)


def _write(obj, name):
    path = DATA / name
    with path.open("w", encoding="utf-8") as f:
        json.dump(obj, f, separators=(",", ":"))
    kb = path.stat().st_size / 1024
    print(f"{name}: {len(obj):,} keys, {kb:,.0f} KB")


def main():
    build_flight("outbound_booking_curve.csv", "departure_date", "curves_outbound.json")
    build_flight("inbound_booking_curve.csv", "return_date", "curves_inbound.json")
    build_hotel("curves_hotel.json")


if __name__ == "__main__":
    main()
