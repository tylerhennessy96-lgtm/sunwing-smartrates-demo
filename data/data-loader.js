// ── Sunwing RMS — real-data loader ──────────────────────────
// Loads the two database-view CSV exports (hotel + flight pricing) and
// reshapes them into the nested HOTEL_DATA / FLIGHT_DATA structures the
// dashboards render from. data.js stays in place as a generated fallback:
// if the CSV fetch/parse fails, the pages keep their data.js data.
//
// Served layout note: the Dockerfile copies `data/` to the nginx web root,
// so hotel.html / flight.html and the CSVs are siblings at runtime. We try a
// few relative paths so this also works when opened from the repo root.
(function (global) {
  'use strict';

  const HOTEL_CSV_CANDIDATES = [
    './mock_v_hotel_pricing.csv',              // nginx web root (data/ flattened)
    './data/mock_v_hotel_pricing.csv',         // repo-root served
    './application/data/mock_v_hotel_pricing.csv',
  ];
  const FLIGHT_CSV_CANDIDATES = [
    './mock_v_flight_pricing.csv',
    './data/mock_v_flight_pricing.csv',
    './application/data/mock_v_flight_pricing.csv',
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
    return s === '1' || s === 'true';
  }
  function pctToFrac(v) {
    // CSV stores occupancy / load factor as 0–100; the UI helpers expect 0–1.
    const n = num(v);
    return n === null ? 0 : n / 100;
  }
  function toMMDDYY(s) {
    // "2026-07-05" → "07/05/26" (matches data.js _fmtDate so the existing
    // week-picker / date-range filters parse it as a local date).
    if (s === null || s === undefined || s === '') return '';
    const str = String(s).trim();
    const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[2]}/${iso[3]}/${iso[1].slice(-2)}`;
    return str; // already in some other format — leave as-is
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
      weekLabel: seen.get(ws),
    }));
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

  // Public: load + clean both CSVs, returning flat arrays of row objects.
  async function loadData() {
    const [hotelText, flightText] = await Promise.all([
      fetchFirstOk(HOTEL_CSV_CANDIDATES, 'hotel pricing'),
      fetchFirstOk(FLIGHT_CSV_CANDIDATES, 'flight pricing'),
    ]);
    const hotelData = parseCsv(hotelText);
    const flightData = parseCsv(flightText);
    return { hotelData, flightData };
  }

  // ── Hotel: flat rows → nested HOTEL_DATA shape ────────────
  const CLASS_MAP = { EXC: 'Exclusive', COM: 'Commodity' };

  function buildHotelWeek(r) {
    const curADR = num(r.current_adr);
    const recADR = num(r.rec_adr);
    const adrDelta = num(r.adr_delta);
    return {
      id: String(r.inventory_id),
      weekLabel: r.week_label,
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
      forecastLF: pctToFrac(r.forecast_lf_pct),
      targetLF: pctToFrac(r.target_lf_pct),
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
      weekLabel: r.week_label,
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
  // HOTEL_DATA / FLIGHT_DATA / CHECK_IN_WEEKS / BRANDS / DESTINATIONS /
  // REVENUE_MANAGERS are `const` arrays declared in data.js. We can't rebind
  // them, but we can swap their contents — the rest of the app reads the same
  // array reference, so it transparently picks up the CSV-derived data.
  // (data.js, filters.js, data-loader.js and the inline scripts all share the
  // global lexical scope, so these names resolve directly — no eval, which the
  // page's Content-Security-Policy would block anyway.)
  function swap(arr, items) {
    arr.length = 0;
    items.forEach(x => arr.push(x));
  }

  function applyToGlobals(hotelRows, flightRows) {
    const hotel = buildHotelData(hotelRows);
    const flight = buildFlightData(flightRows);

    if (typeof HOTEL_DATA !== 'undefined') swap(HOTEL_DATA, hotel.destinations);
    if (typeof FLIGHT_DATA !== 'undefined') swap(FLIGHT_DATA, flight.destinations);
    // Week index list — hotel & flight share the same weeks, so either works
    // for the global CHECK_IN_WEEKS the hotel page iterates by index.
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
  // UI features with no backing column in either CSV. Each of these now shows
  // an empty state / blank in the UI instead of fabricated data.
  const KNOWN_FEATURE_GAPS = [
    'Notes / comments (📝 icon + notes modal) — no notes column in either CSV',
    'Booking-curve history (cumulative % sold over days-to-departure) — no per-period booking snapshots; chart shows "No booking history data available"',
    'Fare / price history (price-worm chart) — no historical fare time series; chart shows "No fare history data available"',
    'Booking sparklines (recent-pace mini charts) — no booking snapshots; shown as empty',
    'Hotel cost-change detail (old cost, new cost, change $/%, date received) — only a has_cost_change boolean, so the Cost Change Exceptions detail columns are blank',
    'Publish / audit change log (Publish Changes count, PENDING / pending-publish state) — no price-change-log columns to persist or count pending edits',
    'RM Copilot narrative — booking-pace, demand drivers, "why" explanations and price-elasticity projections are not in the CSV; the copilot now states only CSV-derived figures and declines the rest',
    'Packages tab (pricing.html) — there is no package pricing CSV; the table shows "No package data available"',
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

  function reportDataGaps(hotelRows, flightRows) {
    const h = colStatus(hotelRows, EXPECTED_HOTEL_COLS);
    const f = colStatus(flightRows, EXPECTED_FLIGHT_COLS);
    const group = (typeof console.groupCollapsed === 'function')
      ? console.groupCollapsed.bind(console) : console.log.bind(console);
    const groupEnd = (typeof console.groupEnd === 'function') ? console.groupEnd.bind(console) : function () {};
    const bold = 'font-weight:bold';

    group('%c[data-loader] DATA GAP REPORT — anything blank in the UI is listed here', bold);

    // ── 1. Columns expected by the UI but MISSING from the CSV ──
    group('%c1. Columns expected but missing from the CSV', bold);
    console.log('Hotel CSV  — missing columns:', h.missing.length ? h.missing : '(none — all expected columns present)');
    console.log('Flight CSV — missing columns:', f.missing.length ? f.missing : '(none — all expected columns present)');
    groupEnd();

    // ── 2. Columns present but ENTIRELY EMPTY (every row null/blank) ──
    group('%c2. Columns present but entirely empty', bold);
    console.log('Hotel CSV  — empty columns:', h.empty.length ? h.empty : '(none)');
    console.log('Flight CSV — empty columns:', f.empty.length ? f.empty : '(none)');
    groupEnd();

    // ── 3. UI features with NO CSV backing at all (blanked / empty state) ──
    group('%c3. UI features with NO CSV backing (shown blank / empty state)', bold);
    KNOWN_FEATURE_GAPS.forEach(g => console.log('   • ' + g));
    groupEnd();

    groupEnd();
    return { hotel: h, flight: f, featureGaps: KNOWN_FEATURE_GAPS };
  }

  // ── exports ───────────────────────────────────────────────
  global.loadData = loadData;
  global.DataLoader = {
    loadData,
    buildHotelData,
    buildFlightData,
    buildDestList,
    applyToGlobals,
    reportDataGaps,
  };
})(window);
