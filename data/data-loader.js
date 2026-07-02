// ── Sunwing RMS — real-data loader ──────────────────────────
// Loads the static CSV exports and reshapes them into the globals the dashboards
// render from. data.js stays in place only as an empty global contract; if the
// required pricing CSVs fail, the UI renders empty states.
//
// Served layout note: the Dockerfile copies `data/` to the nginx web root,
// so hotel.html / flight.html and the CSVs are siblings at runtime. We try a
// few relative paths so this also works when opened from the repo root.
(function (global) {
  'use strict';

  // Optional demo date window. Leave both null to read whatever date range the
  // CSV exports contain — the dashboards derive their week columns and the week
  // picker from the loaded rows, so a wider (or narrower) range just works.
  // Set one or both to an ISO date (e.g. '2026-07-01') to clamp the loaded rows
  // to a fixed window — used previously to pin the demo to a single quarter.
  const ACTIVE_START_DATE_ISO = null;
  const ACTIVE_END_DATE_ISO = null;

  const HOTEL_CSV_CANDIDATES = [
    './v_hotel_pricing_pg.csv',              // nginx web root (data/ flattened)
    './data/v_hotel_pricing_pg.csv',         // repo-root served
    './application/data/v_hotel_pricing_pg.csv',
  ];
  const FLIGHT_CSV_CANDIDATES = [
    './v_flight_pricing_pg.csv',
    './data/v_flight_pricing_pg.csv',
    './application/data/v_flight_pricing_pg.csv',
  ];
  const FLIGHT_BOOKING_CURVE_CSV_CANDIDATES = [
    './v_flight_booking_curve_pg.csv',
    './data/v_flight_booking_curve_pg.csv',
    './application/data/v_flight_booking_curve_pg.csv',
  ];
  const PACKAGE_CSV_CANDIDATES = [
    './v_package_pricing_pg.csv',
    './data/v_package_pricing_pg.csv',
    './application/data/v_package_pricing_pg.csv',
  ];

  // Columns that should be coerced to real booleans after parsing.
  const BOOL_COLS = ['has_cost_change', 'auto_changed', 'price_locked', 'capacity_alert'];

  // ── small helpers ─────────────────────────────────────────
  function num(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : parseFloat(v);
    return isNaN(n) ? null : n;
  }
  function bool(v) {
    if (v === true || v === 1) return true;
    if (v === false || v === 0 || v === null || v === undefined) return false;
    const s = String(v).trim().toLowerCase();
    // Accept Postgres-style 't'/'f' and y/n in addition to true/1.
    return s === '1' || s === 'true' || s === 't' || s === 'yes' || s === 'y';
  }
  function pctToFrac(v) {
    // CSV stores occupancy / load factor as 0–100; the UI helpers expect 0–1.
    const n = num(v);
    return n === null ? 0 : n / 100;
  }
  // Parse the two date formats the exports use — flight ships ISO
  // "YYYY-MM-DD", hotel ships US "MM/DD/YYYY" (or "MM/DD/YY") — to a canonical
  // ISO string. Anything unrecognised → '' so callers can treat it as undated.
  function isoDate(s) {
    if (s === null || s === undefined || s === '') return '';
    const str = String(s).trim();
    let m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);            // ISO YYYY-MM-DD
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})/);    // US M/D/YYYY or M/D/YY
    if (m) {
      const yr = m[3].length === 2 ? `20${m[3]}` : m[3];
      return `${yr}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
    }
    return '';
  }
  function toMMDDYY(s) {
    // → "07/05/26" (matches data.js _fmtDate so the week-picker / date-range
    // filters parse it as a local date). Handles ISO and US inputs.
    const iso = isoDate(s);
    if (!iso) return (s === null || s === undefined) ? '' : String(s).trim();
    const p = iso.split('-'); // [YYYY, MM, DD]
    return `${p[1]}/${p[2]}/${p[0].slice(-2)}`;
  }
  function sundayWeekStartIso(s) {
    const iso = isoDate(s);
    if (!iso) return '';
    const p = iso.split('-').map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }
  function lfToPct(v) {
    const n = num(v);
    if (n === null) return null;
    return Math.abs(n) <= 1 ? n * 100 : n;
  }
  function isWithinActiveDateWindow(s) {
    // Unbounded when no window is configured — read every row the CSV contains.
    if (!ACTIVE_START_DATE_ISO && !ACTIVE_END_DATE_ISO) return true;
    const iso = isoDate(s);
    if (!iso) return true; // keep undated rows
    if (ACTIVE_START_DATE_ISO && iso < ACTIVE_START_DATE_ISO) return false;
    if (ACTIVE_END_DATE_ISO && iso > ACTIVE_END_DATE_ISO) return false;
    return true;
  }
  function weekLabelWithYear(label, weekStartIso) {
    const year = isoDate(weekStartIso).slice(0, 4);
    const base = label || (weekStartIso ? `Wk ${toMMDDYY(weekStartIso).slice(0, 5)}` : '');
    if (!base || !year || /\b\d{4}\b/.test(base)) return base;
    return `${base} ${year}`;
  }
  function hhmm(s) {
    if (!s) return '';
    const m = String(s).match(/^(\d{1,2}:\d{2})/);
    return m ? m[1] : String(s);
  }
  function uniq(arr) {
    return Array.from(new Set(arr));
  }
  function round2(x) { return Math.round(x * 100) / 100; }
  function sumBy(arr, f) { return arr.reduce((s, x) => s + (f(x) || 0), 0); }
  function avgBy(arr, f) { return arr.length ? sumBy(arr, f) / arr.length : 0; }
  function modeNonNull(values) {
    const counts = {};
    let best = null, bestN = 0;
    values.forEach(v => {
      if (v === null || v === undefined || v === '') return;
      counts[v] = (counts[v] || 0) + 1;
      if (counts[v] > bestN) { bestN = counts[v]; best = v; }
    });
    return best;
  }

  // group an array into a Map keyed by f(item), preserving insertion order
  function groupBy(arr, f) {
    const m = new Map();
    arr.forEach(item => {
      const k = f(item);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(item);
    });
    return m;
  }

  // Ordered, de-duplicated week list (ascending by ISO week_start).
  function weekOrder(rows) {
    const seen = new Map(); // iso week_start → label
    rows.forEach(r => { if (r.week_start != null) seen.set(r.week_start, r.week_label); });
    return Array.from(seen.keys()).sort().map(ws => ({
      weekStartIso: ws,
      weekStart: toMMDDYY(ws),
      weekLabel: weekLabelWithYear(seen.get(ws), ws),
    }));
  }

  // ── Schema normalization (Postgres view export → loader contract) ─────────
  // The CSV exports mirror the source `v_*` views, whose column names/units
  // drifted from the contract the loader + pages were written against. These map
  // the new names and DERIVE the columns the export dropped, so the rest of the
  // app (and the KPI/alert logic) is unchanged. Both functions are written to be
  // backward-compatible: if an old-schema column is already present they keep it,
  // so either export shape loads.
  function normalizeFlightRow(r) {
    const capEco = num(r.capacity_eco) || 0;
    const capBiz = num(r.capacity_biz) || 0;
    const soldEco = num(r.sold_eco) || 0;
    const soldBiz = num(r.sold_biz) || 0;
    const capTot = num(r.curve_flight_capacity) ?? num(r.capacity_total) ?? (capEco + capBiz);
    const soldTot = num(r.curve_current_booked_seats) ?? num(r.sold_total) ?? (soldEco + soldBiz);
    const cfe = num(r.current_fare_eco), rfe = num(r.rec_fare_eco);
    const cfb = num(r.current_fare_biz), rfb = num(r.rec_fare_biz);
    const comps = [num(r.comp1_fare), num(r.comp2_fare)].filter(v => v !== null && v > 0);
    const cheapest = comps.length ? Math.min.apply(null, comps) : null;
    const ros = num(r.rate_of_sale), rosT = num(r.rate_of_sale_target);
    const fLf = lfToPct(r.curve_forecast_final_lf) ?? lfToPct(r.forecast_lf);
    const tLf = lfToPct(r.curve_target_same_time_last_year_lf) ?? lfToPct(r.target_lf);
    const fLfBiz = lfToPct(r.forecast_lf_biz), tLfBiz = lfToPct(r.target_lf_biz);
    const currentLf = lfToPct(r.curve_current_lf)
      ?? lfToPct(r.current_lf_pct)
      ?? lfToPct(r.current_lf_eco)
      ?? (capTot ? (soldTot / capTot) * 100 : null);
    const departureIso = isoDate(r.departure_date || r.flight_date);
    const weekStartIso = isoDate(r.week_start) || sundayWeekStartIso(departureIso);
    const ratio = num(r.beds_to_seats_ratio);
    const has = (k) => r[k] !== undefined && r[k] !== null && r[k] !== '';
    return Object.assign({}, r, {
      departure_date: has('departure_date') ? r.departure_date : departureIso,
      week_start: has('week_start') ? isoDate(r.week_start) : weekStartIso,
      week_label: has('week_label') ? r.week_label : weekLabelWithYear('', weekStartIso),
      destination_name: has('destination_name') ? r.destination_name : (r.dest_airport_code || r.destination_id),
      origin_city: has('origin_city') ? r.origin_city : r.origin_code,
      region_name: has('region_name') ? r.region_name : '',
      brand_name: has('brand_name') ? r.brand_name : '',
      category:      r.flight_category != null ? r.flight_category : r.category,
      capacity_total: capTot,
      sold_total: soldTot,
      unsold_total:  has('unsold_total') ? r.unsold_total : Math.max(0, capTot - soldTot),
      // The view ships LF as 0–1 fractions; the loader's pctToFrac expects 0–100.
      forecast_lf_pct: fLf != null ? fLf : lfToPct(r.forecast_lf_pct),
      target_lf_pct:   tLf != null ? tLf : lfToPct(r.target_lf_pct),
      forecast_lf_biz_pct: fLfBiz != null ? fLfBiz : lfToPct(r.forecast_lf_biz_pct),
      target_lf_biz_pct:   tLfBiz != null ? tLfBiz : lfToPct(r.target_lf_biz_pct),
      current_lf_pct: currentLf,
      fare_delta_eco:  has('fare_delta_eco') ? num(r.fare_delta_eco)
                        : ((cfe != null && rfe != null) ? rfe - cfe : null),
      fare_delta_biz:  has('fare_delta_biz') ? num(r.fare_delta_biz)
                        : ((cfb != null && rfb != null) ? rfb - cfb : null),
      ros_pct_of_target: has('ros_pct_of_target') ? num(r.ros_pct_of_target)
                        : ((ros != null && rosT) ? (ros / rosT) * 100 : null),
      cheapest_comp_fare: has('cheapest_comp_fare') ? num(r.cheapest_comp_fare) : cheapest,
      comp_delta:      has('comp_delta') ? num(r.comp_delta)
                        : ((cheapest != null && cfe != null) ? cfe - cheapest : null),
      beds_seats_label: has('beds_seats_label') ? r.beds_seats_label
                        : (ratio == null ? null
                           : ratio < 0.85 ? 'Under-bedded'
                           : ratio > 1.15 ? 'Over-bedded' : 'Balanced'),
      last_modified_by_name: r.last_modified_by_name != null ? r.last_modified_by_name : r.last_modified_by,
      // capacity_alert: no column in this export → left absent (alerts blank).
    });
  }
  function normalizeHotelRow(r) {
    const cAdr = num(r.current_adr), rAdr = num(r.rec_adr);
    const cMar = num(r.current_margin), rMar = num(r.rec_margin);
    const fOcc = num(r.forecast_occ), cOcc = num(r.current_occ);
    const has = (k) => r[k] !== undefined && r[k] !== null && r[k] !== '';
    return Object.assign({}, r, {
      inventory_id:     r.inventory_id != null ? r.inventory_id : r.hotel_inventory_id,
      forecast_occ_pct: fOcc != null ? fOcc * 100 : num(r.forecast_occ_pct),
      current_occ_pct:  cOcc != null ? cOcc * 100 : num(r.current_occ_pct),
      adr_delta:        has('adr_delta') ? num(r.adr_delta)
                         : ((cAdr != null && rAdr != null) ? rAdr - cAdr : null),
      margin_delta:     has('margin_delta') ? num(r.margin_delta)
                         : ((cMar != null && rMar != null) ? rMar - cMar : null),
      margin_pct:       has('margin_pct') ? num(r.margin_pct) : num(r.current_margin_pct),
      last_modified_by_name: r.last_modified_by_name != null ? r.last_modified_by_name : r.last_modified_by,
    });
  }

  // ── CSV fetch + parse + clean ─────────────────────────────
  async function fetchFirstOk(candidates, label) {
    let lastErr = null;
    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          console.info(`[data-loader] ${label} loaded from ${url}`);
          return await res.text();
        }
        lastErr = new Error(`${url} → HTTP ${res.status}`);
      } catch (e) {
        lastErr = e;
      }
    }
    throw new Error(`Could not load ${label} CSV (tried ${candidates.length} paths): ${lastErr}`);
  }

  async function fetchOptionalFirstOk(candidates, label) {
    try {
      return await fetchFirstOk(candidates, label);
    } catch (e) {
      console.warn(`[data-loader] optional ${label} CSV not loaded:`, e);
      return null;
    }
  }

  function parseCsv(text) {
    if (typeof Papa === 'undefined') {
      throw new Error('PapaParse is not loaded');
    }
    const out = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    return out.data.map(cleanRow);
  }

  function cleanRow(row) {
    const clean = {};
    Object.keys(row).forEach(k => {
      let v = row[k];
      // Normalise "NULL" sentinel strings to real null.
      if (typeof v === 'string' && v.trim() === 'NULL') v = null;
      clean[k] = v;
    });
    // Coerce the known boolean columns.
    BOOL_COLS.forEach(c => { if (c in clean) clean[c] = bool(clean[c]); });
    return clean;
  }

  // ── Per-dataset loaders (so a page fetches only what it renders) ──────────
  async function loadHotelRows() {
    const text = await fetchFirstOk(HOTEL_CSV_CANDIDATES, 'hotel pricing');
    return parseCsv(text).map(normalizeHotelRow)
      .filter(r => isWithinActiveDateWindow(r.week_start));
  }
  async function loadFlightRows() {
    const text = await fetchFirstOk(FLIGHT_CSV_CANDIDATES, 'flight pricing');
    return parseCsv(text).map(normalizeFlightRow)
      .filter(r => isWithinActiveDateWindow(r.departure_date));
  }
  async function loadCurveRows() {
    // The booking-curve export keeps its original schema, so it needs no remap.
    const text = await fetchOptionalFirstOk(FLIGHT_BOOKING_CURVE_CSV_CANDIDATES, 'flight booking curve');
    return text ? parseCsv(text).filter(r => isWithinActiveDateWindow(r.departure_date)) : [];
  }

  // Public: load the requested CSVs (default: all). Pages pass flags so they
  // fetch/parse only what they need — the flight page skips the 27 MB curve
  // (lazy-loaded on demand) and the hotel page skips the flight + curve exports.
  async function loadData(opts) {
    opts = opts || {};
    const [hotelData, flightData, flightBookingCurveData] = await Promise.all([
      opts.hotel  === false ? Promise.resolve([]) : loadHotelRows(),
      opts.flight === false ? Promise.resolve([]) : loadFlightRows(),
      opts.curve  === false ? Promise.resolve([]) : loadCurveRows(),
    ]);
    return { hotelData, flightData, flightBookingCurveData };
  }

  // ── Hotel: flat rows → nested HOTEL_DATA shape ────────────
  const CLASS_MAP = { EXC: 'Exclusive', COM: 'Commodity' };

  function buildHotelWeek(r) {
    const curADR = num(r.current_adr);
    const recADR = num(r.rec_adr);
    const adrDelta = num(r.adr_delta);
    return {
      id: String(r.inventory_id),
      weekLabel: weekLabelWithYear(r.week_label, r.week_start),
      weekStart: toMMDDYY(r.week_start),
      allocation: num(r.allocation) || 0,
      sold: num(r.sold) || 0,
      supplierCost: num(r.supplier_cost_pn) || 0,
      currentADR: curADR || 0,
      recADR: recADR || 0,
      deltaADR: adrDelta !== null ? adrDelta : ((recADR || 0) - (curADR || 0)),
      forecastOcc: pctToFrac(r.forecast_occ_pct),
      currentOcc: pctToFrac(r.current_occ_pct),
      currentMargin: num(r.current_margin),
      recMargin: num(r.rec_margin),
      marginDelta: num(r.margin_delta),
      marginPct: num(r.margin_pct),
      hasCostChange: bool(r.has_cost_change),
      autoChanged: bool(r.auto_changed),
      autoChangedRule: r.auto_changed_rule || null,
      locked: bool(r.price_locked),
    };
  }

  function buildHotelData(rows) {
    const weeks = weekOrder(rows);
    const weekIdxByIso = new Map(weeks.map((w, i) => [w.weekStartIso, i]));

    const destinations = [];
    const byDest = groupBy(rows, r => r.destination_id);

    byDest.forEach((destRows, destId) => {
      const first = destRows[0];
      const byHotel = groupBy(destRows, r => r.hotel_id);
      const hotels = [];

      byHotel.forEach((hotelRows, hotelId) => {
        const hFirst = hotelRows[0];
        const byCat = groupBy(hotelRows, r => r.room_category_id);
        const categories = [];

        byCat.forEach((catRows, catId) => {
          // Align this category's weeks to the global ordering.
          const checkInWeeks = new Array(weeks.length).fill(null);
          catRows.forEach(r => {
            const idx = weekIdxByIso.get(r.week_start);
            if (idx != null) checkInWeeks[idx] = buildHotelWeek(r);
          });
          const present = checkInWeeks.filter(Boolean);
          const allocation = sumBy(present, w => w.allocation);
          const sold = sumBy(present, w => w.sold);
          const avgCurrentADR = avgBy(present, w => w.currentADR);
          const avgRecADR = avgBy(present, w => w.recADR);
          const cFirst = catRows[0];
          categories.push({
            id: String(catId),
            name: cFirst.room_category_name,
            sortOrder: num(cFirst.room_sort_order) || 0,
            allocation,
            sold,
            soldPct: allocation ? round2(sold / allocation) : 0,
            avgCurrentADR: Math.round(avgCurrentADR),
            avgRecADR: Math.round(avgRecADR),
            deltaADR: Math.round(avgRecADR - avgCurrentADR),
            forecastOcc: round2(avgBy(present, w => w.forecastOcc)),
            currentOcc: round2(avgBy(present, w => w.currentOcc)),
            checkInWeeks,
          });
        });
        categories.sort((a, b) => a.sortOrder - b.sortOrder);

        const allWeeks = categories.flatMap(c => c.checkInWeeks.filter(Boolean));
        const allocation = sumBy(categories, c => c.allocation);
        const sold = sumBy(categories, c => c.sold);
        const avgCurrentADR = avgBy(categories, c => c.avgCurrentADR);
        const avgRecADR = avgBy(categories, c => c.avgRecADR);
        hotels.push({
          id: String(hotelId),
          name: hFirst.hotel_name,
          classification: CLASS_MAP[hFirst.classification] || hFirst.classification,
          stars: Number(hFirst.stars) || 0,
          allocation,
          sold,
          soldPct: allocation ? round2(sold / allocation) : 0,
          avgCurrentADR: Math.round(avgCurrentADR),
          avgRecADR: Math.round(avgRecADR),
          deltaADR: Math.round(avgRecADR - avgCurrentADR),
          forecastOcc: round2(avgBy(categories, c => c.forecastOcc)),
          currentOcc: round2(avgBy(categories, c => c.currentOcc)),
          hasCostChange: allWeeks.some(w => w.hasCostChange),
          categories,
        });
      });
      hotels.sort((a, b) => a.id.localeCompare(b.id));

      const allocation = sumBy(hotels, h => h.allocation);
      const sold = sumBy(hotels, h => h.sold);
      destinations.push({
        id: String(destId),
        name: first.destination_name,
        region: first.region_name,
        country: first.region_name,
        brand: first.brand_name,
        departureGateway: '',
        revenueManager: modeNonNull(destRows.map(r => r.last_modified_by_name)) || '—',
        totalHotels: hotels.length,
        allocation,
        sold,
        soldPct: allocation ? round2(sold / allocation) : 0,
        avgCurrentADR: Math.round(avgBy(hotels, h => h.avgCurrentADR)),
        avgRecADR: Math.round(avgBy(hotels, h => h.avgRecADR)),
        deltaADR: Math.round(avgBy(hotels, h => h.avgRecADR) - avgBy(hotels, h => h.avgCurrentADR)),
        forecastOcc: round2(avgBy(hotels, h => h.forecastOcc)),
        currentOcc: round2(avgBy(hotels, h => h.currentOcc)),
        hotels,
      });
    });
    destinations.sort((a, b) => a.name.localeCompare(b.name));
    return { destinations, weeks };
  }

  // ── Flight: flat rows → nested FLIGHT_DATA shape ──────────
  const CAT_MAP = { OWN: 'Own Flight', RSK: 'Risk Block', '3RD': '3rd Party' };

  function buildCabin(r, isBiz) {
    const fc = isBiz ? 'biz' : 'eco';
    const cap = num(r[`capacity_${fc}`]) || 0;
    return {
      capacity: cap,
      sold: num(r[`sold_${fc}`]) || 0,
      currentFare: num(r[`current_fare_${fc}`]) || 0,
      recFare: num(r[`rec_fare_${fc}`]) || 0,
      currentMargin: num(r[`current_margin_${fc}`]) || 0,
      recMargin: num(r[`rec_margin_${fc}`]) || 0,
      deltaFare: num(r[`fare_delta_${fc}`]) || 0,
      forecastLF: pctToFrac(isBiz && r.forecast_lf_biz_pct != null ? r.forecast_lf_biz_pct : r.forecast_lf_pct),
      targetLF: pctToFrac(isBiz && r.target_lf_biz_pct != null ? r.target_lf_biz_pct : r.target_lf_pct),
      rateOfSale: num(r.rate_of_sale) || 0,
      rateOfSaleTarget: num(r.rate_of_sale_target) || 0,
      comp1Fare: num(r.comp1_fare) || 0,
      comp2Fare: num(r.comp2_fare) || 0,
      autoChanged: bool(r.auto_changed),
      autoChangedRule: r.auto_changed_rule || null,
    };
  }

  function buildFlightDate(r) {
    const economy = buildCabin(r, false);
    const hasBiz = (num(r.capacity_biz) || 0) > 0;
    const business = hasBiz ? buildCabin(r, true) : null;
    return {
      id: String(r.flight_date_id),
      departureDate: toMMDDYY(r.departure_date),
      departureTime: hhmm(r.departure_time),
      weekLabel: weekLabelWithYear(r.week_label, r.week_start),
      weekStart: toMMDDYY(r.week_start),
      capacity: num(r.capacity_total) || 0,
      sold: num(r.sold_total) || 0,
      unsold: num(r.unsold_total) || 0,
      // Date-level fare/margin uses economy as the reference (matches data.js).
      currentFare: economy.currentFare,
      recFare: economy.recFare,
      currentMargin: economy.currentMargin,
      recMargin: economy.recMargin,
      deltaFare: economy.deltaFare,
      forecastLF: pctToFrac(r.forecast_lf_pct),
      targetLF: pctToFrac(r.target_lf_pct),
      currentLF: pctToFrac(r.current_lf_pct),
      rateOfSale: num(r.rate_of_sale) || 0,
      rateOfSaleTarget: num(r.rate_of_sale_target) || 0,
      rosPctOfTarget: num(r.ros_pct_of_target),
      comp1Fare: num(r.comp1_fare) || 0,
      comp2Fare: num(r.comp2_fare) || 0,
      cheapestCompFare: num(r.cheapest_comp_fare),
      compDelta: num(r.comp_delta),
      bedsToSeatsRatio: num(r.beds_to_seats_ratio),
      bedsSeatsLabel: r.beds_seats_label,
      hasCostChange: bool(r.has_cost_change),
      locked: bool(r.price_locked),
      capacityAlert: bool(r.capacity_alert),
      autoChanged: bool(r.auto_changed),
      autoChangedRule: r.auto_changed_rule || null,
      lastEvaluatedAt: r.last_evaluated_at || null,
      economy,
      business,
    };
  }

  function buildFlightData(rows) {
    const weeks = weekOrder(rows);
    const weekIdxByIso = new Map(weeks.map((w, i) => [w.weekStartIso, i]));

    const destinations = [];
    const byDest = groupBy(rows, r => r.destination_id);

    byDest.forEach((destRows, destId) => {
      const first = destRows[0];
      const byRoute = groupBy(destRows, r => r.route_id);
      const routes = [];

      byRoute.forEach((routeRows, routeId) => {
        const rFirst = routeRows[0];
        const dates = new Array(weeks.length).fill(null);
        routeRows.forEach(r => {
          const idx = weekIdxByIso.get(r.week_start);
          if (idx != null) dates[idx] = buildFlightDate(r);
        });
        const present = dates.filter(Boolean);
        const avgCurrentFare = avgBy(present, d => d.currentFare);
        const avgRecFare = avgBy(present, d => d.recFare);
        const avgCurrentMargin = avgBy(present, d => d.currentMargin);
        const avgRecMargin = avgBy(present, d => d.recMargin);
        routes.push({
          id: String(routeId),
          flightNum: rFirst.flight_num,
          origin: rFirst.origin_code,
          originName: rFirst.origin_city,
          destination: rFirst.dest_airport_code,
          category: CAT_MAP[rFirst.category] || rFirst.category,
          totalCapacity: sumBy(present, d => d.capacity),
          totalSold: sumBy(present, d => d.sold),
          avgForecastLF: round2(avgBy(present, d => d.forecastLF)),
          avgTargetLF: round2(avgBy(present, d => d.targetLF)),
          avgCurrentFare: Math.round(avgCurrentFare),
          avgRecFare: Math.round(avgRecFare),
          deltaFare: Math.round(avgRecFare - avgCurrentFare),
          avgCurrentMargin: Math.round(avgCurrentMargin),
          avgRecMargin: Math.round(avgRecMargin),
          deltaMargin: Math.round(avgRecMargin - avgCurrentMargin),
          hasCostChange: present.some(d => d.hasCostChange),
          dates,
        });
      });
      routes.sort((a, b) => a.id.localeCompare(b.id));

      const allDates = routes.flatMap(r => r.dates.filter(Boolean));
      destinations.push({
        id: String(destId),
        name: first.destination_name,
        region: first.region_name,
        country: first.region_name,
        brand: first.brand_name,
        revenueManager: modeNonNull(destRows.map(r => r.last_modified_by_name)) || '—',
        totalRoutes: routes.length,
        totalFlights: allDates.length,
        totalCapacity: sumBy(routes, r => r.totalCapacity),
        totalSold: sumBy(routes, r => r.totalSold),
        avgForecastLF: round2(avgBy(allDates, d => d.forecastLF)),
        avgTargetLF: round2(avgBy(allDates, d => d.targetLF)),
        avgCurrentFare: Math.round(avgBy(allDates, d => d.currentFare)),
        avgRecFare: Math.round(avgBy(allDates, d => d.recFare)),
        deltaFare: Math.round(avgBy(allDates, d => d.recFare) - avgBy(allDates, d => d.currentFare)),
        routes,
      });
    });
    destinations.sort((a, b) => a.name.localeCompare(b.name));
    return { destinations, weeks };
  }

  // Build the destination list used by the cascading header filters.
  function buildDestList(hotelRows, flightRows) {
    const byId = new Map();
    [...(hotelRows || []), ...(flightRows || [])].forEach(r => {
      if (r.destination_id == null || byId.has(r.destination_id)) return;
      byId.set(r.destination_id, {
        id: String(r.destination_id),
        name: r.destination_name,
        region: r.region_name,
        country: r.region_name,
        brand: r.brand_name,
        revenueManager: r.last_modified_by_name || '—',
      });
    });
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  // ── Mutate the data.js globals in place ───────────────────
  // HOTEL_DATA / FLIGHT_DATA / FLIGHT_BOOKING_CURVE_DATA / CHECK_IN_WEEKS /
  // BRANDS / DESTINATIONS / REVENUE_MANAGERS are `const` arrays declared in data.js. We can't rebind
  // them, but we can swap their contents — the rest of the app reads the same
  // array reference, so it transparently picks up the CSV-derived data.
  // (data.js, filters.js, data-loader.js and the inline scripts all share the
  // global lexical scope, so these names resolve directly — no eval, which the
  // page's Content-Security-Policy would block anyway.)
  function swap(arr, items) {
    arr.length = 0;
    items.forEach(x => arr.push(x));
  }

  function applyToGlobals(hotelRows, flightRows, flightBookingCurveRows) {
    const hotel = buildHotelData(hotelRows);
    const flight = buildFlightData(flightRows);

    if (typeof HOTEL_DATA !== 'undefined') swap(HOTEL_DATA, hotel.destinations);
    if (typeof FLIGHT_DATA !== 'undefined') swap(FLIGHT_DATA, flight.destinations);
    if (typeof FLIGHT_BOOKING_CURVE_DATA !== 'undefined') swap(FLIGHT_BOOKING_CURVE_DATA, flightBookingCurveRows || []);
    // Week index list for the shared header picker and hotel calendar. Flight
    // calendar columns are derived from loaded FLIGHT_DATA because flight
    // departures can start inside a week whose week_start predates the window.
    if (typeof CHECK_IN_WEEKS !== 'undefined') {
      swap(CHECK_IN_WEEKS, (hotel.weeks.length ? hotel.weeks : flight.weeks)
        .map(w => ({ weekLabel: w.weekLabel, weekStart: w.weekStart })));
    }

    const allRows = [...(hotelRows || []), ...(flightRows || [])];
    const brands = uniq(allRows.map(r => r.brand_name).filter(Boolean));
    const regions = uniq(allRows.map(r => r.region_name).filter(Boolean));
    const rms = uniq(allRows.map(r => r.last_modified_by_name)
      .filter(v => v !== null && v !== undefined && v !== '' && v !== 'NULL'));

    if (typeof BRANDS !== 'undefined') swap(BRANDS, brands);
    if (typeof DESTINATIONS !== 'undefined') swap(DESTINATIONS, buildDestList(hotelRows, flightRows));
    if (typeof REVENUE_MANAGERS !== 'undefined') swap(REVENUE_MANAGERS, ['All RMs', ...rms]);

    return { hotel, flight, brands, regions, rms };
  }

  // ── Data-gap report ───────────────────────────────────────
  // Columns the dashboards expect to read for their UI data points.
  const EXPECTED_HOTEL_COLS = [
    'destination_name', 'hotel_name', 'room_category_name', 'classification', 'stars',
    'week_label', 'week_start', 'allocation', 'sold', 'supplier_cost_pn',
    'current_adr', 'rec_adr', 'adr_delta', 'current_margin', 'rec_margin', 'margin_delta', 'margin_pct',
    'current_occ_pct', 'forecast_occ_pct', 'has_cost_change', 'auto_changed', 'price_locked',
    'last_modified_by_name',
  ];
  const EXPECTED_FLIGHT_COLS = [
    'destination_name', 'flight_num', 'origin_code', 'dest_airport_code', 'category',
    'week_label', 'week_start', 'departure_date', 'departure_time',
    'capacity_eco', 'capacity_biz', 'capacity_total', 'sold_eco', 'sold_biz', 'sold_total', 'unsold_total',
    'current_lf_pct', 'forecast_lf_pct', 'target_lf_pct',
    'current_fare_eco', 'rec_fare_eco', 'fare_delta_eco', 'current_margin_eco', 'rec_margin_eco',
    'current_fare_biz', 'rec_fare_biz', 'rate_of_sale', 'rate_of_sale_target', 'ros_pct_of_target',
    'comp1_name', 'comp1_fare', 'comp2_name', 'comp2_fare', 'cheapest_comp_fare', 'comp_delta',
    'beds_to_seats_ratio', 'beds_seats_label', 'has_cost_change', 'auto_changed', 'price_locked',
    'capacity_alert', 'last_modified_by_name',
  ];
  const EXPECTED_FLIGHT_BOOKING_CURVE_COLS = [
    'product_type', 'entity_id', 'destination_id', 'gateway_code', 'flight_num',
    'departure_date', 'snapshot_date', 'days_to_departure', 'sold_cumulative',
    'capacity', 'sold_pct', 'curve_type',
  ];
  // UI features with no backing column in the loaded CSVs. Each of these now shows
  // an empty state / blank in the UI instead of fabricated data.
  const KNOWN_FEATURE_GAPS = [
    'Notes / comments (📝 icon + notes modal) — no notes column in the loaded CSVs',
    'Fare / price history (price-worm chart) — no historical fare time series; chart shows "No fare history data available"',
    'Booking sparklines (recent-pace mini charts) — no booking snapshots; shown as empty',
    'Hotel cost-change detail (old cost, new cost, change $/%, date received) — only a has_cost_change boolean, so the Cost Change Exceptions detail columns are blank',
    'Publish / audit change log (Publish Changes count, PENDING / pending-publish state) — no price-change-log columns to persist or count pending edits',
    'RM Copilot narrative — demand drivers, "why" explanations and price-elasticity projections are not in the CSV; the copilot states only CSV-derived figures and declines the rest',
    'Package autopilot rules (flight.html rules drawer, PACKAGE_RULES) — no CSV source; the rules list renders empty',
    'Parameters config (autopilot rules, alerts, price/margin controls, LOS rules) — configuration, not pricing data; every section is now blanked to an empty state ("not yet connected to a data source")',
    'Competitor table (flight) — renders from CSV comp columns where present (comp1_fare / comp2_fare / cheapest_comp_fare / comp_delta); blank where those columns are empty',
  ];

  function colStatus(rows, expected) {
    if (!rows || !rows.length) return { missing: expected.slice(), empty: [] };
    const present = new Set(Object.keys(rows[0]));
    const missing = [], empty = [];
    expected.forEach(c => {
      if (!present.has(c)) { missing.push(c); return; }
      const anyValue = rows.some(r => r[c] !== null && r[c] !== undefined && r[c] !== '');
      if (!anyValue) empty.push(c);
    });
    return { missing, empty };
  }

  function reportDataGaps(hotelRows, flightRows, flightBookingCurveRows) {
    const h = colStatus(hotelRows, EXPECTED_HOTEL_COLS);
    const f = colStatus(flightRows, EXPECTED_FLIGHT_COLS);
    const bc = colStatus(flightBookingCurveRows, EXPECTED_FLIGHT_BOOKING_CURVE_COLS);
    const featureGaps = KNOWN_FEATURE_GAPS.slice();
    if (!flightBookingCurveRows || !flightBookingCurveRows.length) {
      featureGaps.unshift('Flight booking-curve history (cumulative % sold over days-to-departure) — no booking-curve CSV loaded; chart shows "No booking history data available"');
    }
    const group = (typeof console.groupCollapsed === 'function')
      ? console.groupCollapsed.bind(console) : console.log.bind(console);
    const groupEnd = (typeof console.groupEnd === 'function') ? console.groupEnd.bind(console) : function () {};
    const bold = 'font-weight:bold';

    group('%c[data-loader] DATA GAP REPORT — anything blank in the UI is listed here', bold);

    // ── 1. Columns expected by the UI but MISSING from the CSV ──
    group('%c1. Columns expected but missing from the CSV', bold);
    console.log('Hotel CSV  — missing columns:', h.missing.length ? h.missing : '(none — all expected columns present)');
    console.log('Flight CSV — missing columns:', f.missing.length ? f.missing : '(none — all expected columns present)');
    console.log('Flight booking-curve CSV — missing columns:', bc.missing.length ? bc.missing : '(none — all expected columns present)');
    groupEnd();

    // ── 2. Columns present but ENTIRELY EMPTY (every row null/blank) ──
    group('%c2. Columns present but entirely empty', bold);
    console.log('Hotel CSV  — empty columns:', h.empty.length ? h.empty : '(none)');
    console.log('Flight CSV — empty columns:', f.empty.length ? f.empty : '(none)');
    console.log('Flight booking-curve CSV — empty columns:', bc.empty.length ? bc.empty : '(none)');
    groupEnd();

    // ── 3. UI features with NO CSV backing at all (blanked / empty state) ──
    group('%c3. UI features with NO CSV backing (shown blank / empty state)', bold);
    featureGaps.forEach(g => console.log('   • ' + g));
    groupEnd();

    groupEnd();
    return { hotel: h, flight: f, flightBookingCurve: bc, featureGaps };
  }

  // ── Packages: flat rows → nested PACKAGE_DATA tree ────────
  // pricing.html renders a Destination → Week → Gateway → Package tree. The
  // package export already bundles flight + hotel + package economics per row,
  // so one row = one bookable package (unique package_id).
  function buildPackageLeaf(r) {
    const ros = num(r.rate_of_sale), rosT = num(r.rate_of_sale_target);
    let pace = 'on track';
    if (rosT && rosT > 0) {
      const ratio = (ros || 0) / rosT;
      pace = ratio >= 1 ? 'ahead' : ratio >= 0.8 ? 'on track' : 'behind';
    } else if (ros != null) {
      pace = ros > 0 ? 'ahead' : 'behind';
    }
    const price = num(r.current_package_price) || 0;
    const cost = num(r.estimated_total_cost);
    const totalCost = cost != null ? cost : (price - (num(r.current_margin) || 0));
    const dur = num(r.duration) || 0;
    return {
      id: String(r.package_id),
      destId: String(r.destination_id),
      destination: r.destination_name,
      region: r.region_name,
      gateway: String(r.origin_code),
      gatewayCity: r.origin_city || String(r.origin_code),
      duration: dur,
      packageName: r.meal_plan_name || r.service_type || 'Package',
      mealPlan: r.meal_plan_name || r.service_type || '',
      tourOperator: r.tour_operator_code || '',
      departureDate: r.departure_date || '',
      returnDate: r.return_date || '',
      flightNum: String(r.origin_code || ''),
      flightRoute: `→ ${r.destination_id}`,
      hotelId: String(r.hotel_id || r.hotel_name || ''),
      hotel: r.hotel_name,
      roomCategory: r.room_category_name,
      hotelStars: num(r.stars) || 0,
      checkInWeek: r.week_label || `Wk ${toMMDDYY(r.week_start)}`,
      checkInDate: toMMDDYY(r.week_start),
      // Room-night metrics (hotel-level, split per room class) — summed to the
      // offering total at the parent row; blank at room-class level.
      soldPackages: num(r.hotel_current_booked_room_nights) || 0,
      soldStly: num(r.hotel_target_same_time_last_year_room_nights) || 0,
      hotelForecast: num(r.hotel_forecast_final_room_nights) || 0,
      currentPrice: price,
      regularPrice: num(r.regular_price) || 0,
      recPrice: num(r.rec_package_price) || 0,
      totalCost: totalCost,
      recMargin: num(r.rec_margin) || 0,
      bookingPace: pace,
      hasCostChange: r.has_cost_change === 't' || r.has_cost_change === true || r.has_cost_change === 'true',
      // Forecast final flight load factors (0–1 fractions) + recent pickup pax.
      outboundForecastLf: num(r.outbound_flight_forecast_final_lf),
      returnForecastLf: num(r.return_flight_forecast_final_lf),
      pickupPax1d: num(r.pickup_pax_1d),
      pickupPax3d: num(r.pickup_pax_3d),
      pickupPax7d: num(r.pickup_pax_7d),
    };
  }

  function buildPackageData(rows) {
    const destinations = [];
    const byDest = groupBy(rows, r => r.destination_id);
    byDest.forEach((destRows, destId) => {
      const first = destRows[0];
      const byWeek = groupBy(destRows, r => r.week_start);
      const weekKeys = Array.from(byWeek.keys())
        .sort((a, b) => String(isoDate(a)).localeCompare(String(isoDate(b))));
      const checkInWeeks = weekKeys.map((wkStart, wi) => {
        const weekRows = byWeek.get(wkStart);
        const wf = weekRows[0];
        const byGw = groupBy(weekRows, r => r.origin_code);
        const gateways = [];
        byGw.forEach((gwRows, gw) => {
          const durations = gwRows.map(buildPackageLeaf)
            .sort((a, b) => a.duration - b.duration || String(a.hotel).localeCompare(String(b.hotel)));
          gateways.push({ gateway: String(gw), gatewayCity: gwRows[0].origin_city || String(gw), durations });
        });
        gateways.sort((a, b) => a.gateway.localeCompare(b.gateway));
        return {
          idx: wi,
          label: wf.week_label || `Wk ${toMMDDYY(wkStart)}`,
          date: toMMDDYY(wkStart),
          weekStartIso: isoDate(wkStart),
          gateways,
        };
      });
      destinations.push({
        id: String(destId),
        name: first.destination_name,
        region: first.region_name,
        destId: String(destId),
        brand: first.brand_name,
        revenueManager: modeNonNull(destRows.map(r => r.last_modified_by)) || '—',
        checkInWeeks,
      });
    });
    destinations.sort((a, b) => a.name.localeCompare(b.name));
    return destinations;
  }

  // Load ONLY the package CSV (the packages page doesn't need the 80 MB
  // hotel/flight/curve exports), date-filtered to the active window.
  async function loadPackageData() {
    const text = await fetchFirstOk(PACKAGE_CSV_CANDIDATES, 'package pricing');
    return parseCsv(text).filter(r => isWithinActiveDateWindow(r.departure_date));
  }

  // Fill PACKAGE_DATA + the header-filter globals from package rows so the
  // packages page works standalone (no hotel/flight load).
  function applyPackagesToGlobals(packageRows) {
    const destinations = buildPackageData(packageRows);
    if (typeof PACKAGE_DATA !== 'undefined') swap(PACKAGE_DATA, destinations);

    const brands = uniq(packageRows.map(r => r.brand_name).filter(Boolean));
    const regions = uniq(packageRows.map(r => r.region_name).filter(Boolean));
    const rms = uniq(packageRows.map(r => r.last_modified_by)
      .filter(v => v !== null && v !== undefined && v !== '' && v !== 'NULL'));
    if (typeof BRANDS !== 'undefined') swap(BRANDS, brands);
    if (typeof REVENUE_MANAGERS !== 'undefined') swap(REVENUE_MANAGERS, ['All RMs', ...rms]);

    const destMap = new Map();
    packageRows.forEach(r => {
      if (r.destination_id == null || destMap.has(r.destination_id)) return;
      destMap.set(r.destination_id, {
        id: String(r.destination_id), name: r.destination_name,
        region: r.region_name, country: r.region_name,
        brand: r.brand_name, revenueManager: r.last_modified_by || '—',
      });
    });
    if (typeof DESTINATIONS !== 'undefined') {
      swap(DESTINATIONS, Array.from(destMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
    }
    return { destinations, brands, regions, rms };
  }

  // ── exports ───────────────────────────────────────────────
  global.loadData = loadData;
  global.loadPackageData = loadPackageData;
  global.DataLoader = {
    loadData,
    loadPackageData,
    loadHotelRows,
    loadFlightRows,
    loadCurveRows,
    buildHotelData,
    buildFlightData,
    buildPackageData,
    buildDestList,
    applyToGlobals,
    applyPackagesToGlobals,
    reportDataGaps,
  };
})(window);
