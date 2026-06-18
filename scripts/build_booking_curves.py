"""Collapse the large per-package booking-curve CSV exports into compact,
browser-loadable JSON the Packages booking-curve panel reads on demand.

The raw exports (outbound_booking_curve.csv / inbound_booking_curve.csv /
hotel_booking_curve.csv) are ~420 MB combined — one ~40-point curve per
package_id, which a static browser app cannot fetch/parse. Their package_id
hashes don't match the pricing data and the hotel_id encodings differ, but the
flight keys (origin, destination, date, duration) and the hotel keys
(destination, week_start, duration) DO match. So we aggregate to those levels:

  * outbound/inbound -> true flight load factor = sum(booked) / sum(capacity)
    per (key, days_to_departure, curve_type)
  * hotel -> room nights summed per (key, weeks_to_stay, curve_type), then
    normalised to a 0-1 cumulative share (weeks_to_stay * 7 = days, so all
    three charts share one "days" x-axis)

Output: data/curves_outbound.json, curves_inbound.json, curves_hotel.json
keyed by "a|b|c|d" -> { ACTUAL|TARGET|FORECAST: [[x, y], ...] } (x ascending).
"""

from __future__ import annotations

import csv
import json
from collections import defaultdict
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data"
TYPES = ("ACTUAL", "TARGET", "FORECAST")


def _f(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


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
    """room nights summed -> normalised 0-1, keyed by dest|week_start|duration."""
    # key -> weeks_to_stay -> curve_type -> roomnights_sum
    acc = defaultdict(lambda: defaultdict(lambda: defaultdict(float)))
    path = DATA / "hotel_booking_curve.csv"
    with path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            key = f"{row['destination_id']}|{row['week_start']}|{row['duration']}"
            ct = row["curve_type"]
            if ct not in TYPES:
                continue
            try:
                w = int(float(row["weeks_to_stay"]))
            except (TypeError, ValueError):
                continue
            acc[key][w][ct] += _f(row["roomnights"])

    out = {}
    for key, ws in acc.items():
        peak = max((rn for w in ws.values() for rn in w.values()), default=0.0)
        series = {t: [] for t in TYPES}
        for w in sorted(ws):
            for ct, rn in ws[w].items():
                y = round(rn / peak, 4) if peak > 0 else 0.0
                series[ct].append([w * 7, y])  # weeks -> days, shared x-axis
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
