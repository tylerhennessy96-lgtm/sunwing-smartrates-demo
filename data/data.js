// ── Dynamica SmartRates — global data contract ──────────────────────────────
// This file used to hold a large hand-generated seed dataset. As of 2026-06-09
// the app shows ONLY data that comes from the pricing CSVs, so the seed has
// been removed. (The original generated data is preserved in git history at
// commit 3f9eb6b / tag v1.1.0 if you ever need to see what was there.)
//
// What remains is a thin CONTRACT: the global names the rest of the app reads,
// declared empty. `data-loader.js` loads the CSVs and fills the CSV-backed
// globals in place (HOTEL_DATA / FLIGHT_DATA / FLIGHT_BOOKING_CURVE_DATA /
// CHECK_IN_WEEKS / BRANDS / DESTINATIONS / REVENUE_MANAGERS). If the CSV fails to load, these stay empty
// and the UI shows honest empty states — nothing is fabricated.
//
// Globals with NO CSV source (competitor detail, publish/audit log, packages,
// parameters config, package rules) stay empty; their UI features render empty
// states and are enumerated by DataLoader.reportDataGaps().

// ── CSV-backed: filled at runtime by data-loader.js (empty until then) ──
const BRANDS           = [];   // ← CSV brand_name
const DESTINATIONS     = [];   // ← CSV destination rows {id,name,region,country,brand,revenueManager}
const REVENUE_MANAGERS = [];   // ← CSV last_modified_by_name (loader prepends 'All RMs')
const HOTEL_DATA       = [];   // ← built from v_hotel_pricing_pg.csv
const FLIGHT_DATA      = [];   // ← built from v_flight_pricing_pg.csv
const FLIGHT_BOOKING_CURVE_DATA = []; // ← built from v_flight_booking_curve_pg.csv
const CHECK_IN_WEEKS   = [];   // ← week index list derived from the CSVs

// ── No CSV source yet → features render empty states (see reportDataGaps) ──
// Flight page
const COMPETITOR_FLIGHT_DATA = [];   // competitor table reads CSV comp cols; this fallback stays empty
const FLIGHT_PUBLISHED_DATA  = [];   // publish / audit change log — no CSV columns
const PACKAGE_RULES          = [];   // package autopilot rules — no CSV source
// Hotel page
const COST_CHANGE_DATA        = [];  // cost-change DETAIL — CSV carries only a has_cost_change flag
const PUBLISHED_HOTEL_CHANGES = [];  // publish / audit change log — no CSV columns
// Packages page (pricing.html) — no package CSV exists
const PACKAGE_DATA   = [];
// Parameters page — configuration, no CSV source (page shows empty states)
const PARAMETERS_DATA   = {};
const PARAM_FIELD_GROUPS = [];
const ALERT_SEVERITIES   = [];

// ── Lookups over the CSV-filled globals (used by flight.html / hotel.html) ──
// These keep working once data-loader.js has populated FLIGHT_DATA / HOTEL_DATA;
// before that (or on CSV failure) they simply return null.
function flightDays(date) {
  return date ? (date.days || [date]) : [];
}

function getFlightDateById(dateId) {
  for (const d of FLIGHT_DATA) {
    for (const r of d.routes) {
      // r.dates is indexed by week and can be sparse (null gaps) — guard each entry.
      const hit = r.dates.find(x => x && x.id === dateId);
      if (hit) return { destination: d, route: r, date: hit };
      // Search inside per-week days
      for (const weekDate of r.dates) {
        if (!weekDate || !weekDate.days) continue;
        const dayHit = weekDate.days.find(x => x.id === dateId);
        if (dayHit) return { destination: d, route: r, date: dayHit, weekDate };
      }
    }
  }
  return null;
}

function getCheckInWeekById(weekId) {
  for (const d of HOTEL_DATA) {
    for (const h of d.hotels) {
      for (const c of h.categories) {
        const hit = c.checkInWeeks.find(w => w.id === weekId);
        if (hit) return { destination: d, hotel: h, category: c, week: hit };
      }
    }
  }
  return null;
}
