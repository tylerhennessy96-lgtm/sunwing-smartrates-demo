// ── Sunwing Revenue Management — Seed Data ──────────────────
// All prices in CAD ($). All data fictional and for demo use only.

const BRANDS     = ['Sunwing', 'WestJet Vacations'];
const REGIONS    = ['All', 'Caribbean', 'Mexico', 'Central America', 'Europe', 'Sun & Sand'];
const GATEWAYS   = ['YYZ', 'YVR', 'YWG', 'YUL', 'YYC', 'YOW', 'YHZ'];
const TRIP_DURATIONS = [7, 10, 14];

const REVENUE_MANAGERS = ['All RMs', 'Sarah Chen', 'Marcus Webb', 'Priya Patel', 'Jordan Kim', 'David Okafor', 'Lisa Tran'];
const SALES_MANAGERS   = ['All Sales', 'Tom Reyes', 'Diana Novak', 'Amir Hassan', 'Chloe Martin'];

// ── Destinations ───────────────────────────────────────────
const DESTINATIONS = [
  // ── Caribbean ──
  { id: 'PUJ', name: 'Punta Cana',      region: 'Caribbean',       country: 'Dominican Republic',  departureGateway: 'YYZ', revenueManager: 'Sarah Chen',   salesManager: 'Tom Reyes'    },
  { id: 'MBJ', name: 'Montego Bay',     region: 'Caribbean',       country: 'Jamaica',             departureGateway: 'YYZ', revenueManager: 'Marcus Webb',  salesManager: 'Diana Novak'  },
  { id: 'VRA', name: 'Varadero',        region: 'Caribbean',       country: 'Cuba',                departureGateway: 'YUL', revenueManager: 'Marcus Webb',  salesManager: 'Diana Novak'  },
  { id: 'NAS', name: 'Nassau',          region: 'Caribbean',       country: 'Bahamas',             departureGateway: 'YYZ', revenueManager: 'David Okafor', salesManager: 'Tom Reyes'    },
  { id: 'AUA', name: 'Aruba',           region: 'Caribbean',       country: 'Aruba',               departureGateway: 'YYZ', revenueManager: 'Jordan Kim',   salesManager: 'Diana Novak'  },
  { id: 'BGI', name: 'Barbados',        region: 'Caribbean',       country: 'Barbados',            departureGateway: 'YYZ', revenueManager: 'Lisa Tran',    salesManager: 'Diana Novak'  },
  { id: 'UVF', name: 'St. Lucia',       region: 'Caribbean',       country: 'Saint Lucia',         departureGateway: 'YYZ', revenueManager: 'Lisa Tran',    salesManager: 'Diana Novak'  },
  { id: 'PLS', name: 'Turks & Caicos',  region: 'Caribbean',       country: 'Turks and Caicos',    departureGateway: 'YYZ', revenueManager: 'David Okafor', salesManager: 'Tom Reyes'    },
  { id: 'POP', name: 'Puerto Plata',    region: 'Caribbean',       country: 'Dominican Republic',  departureGateway: 'YWG', revenueManager: 'Priya Patel',  salesManager: 'Amir Hassan'  },

  // ── Mexico ──
  { id: 'CUN', name: 'Cancun',          region: 'Mexico',          country: 'Mexico',              departureGateway: 'YYZ', revenueManager: 'Sarah Chen',   salesManager: 'Tom Reyes'    },
  { id: 'SJD', name: 'Los Cabos',       region: 'Mexico',          country: 'Mexico',              departureGateway: 'YVR', revenueManager: 'Priya Patel',  salesManager: 'Amir Hassan'  },
  { id: 'PVR', name: 'Puerto Vallarta', region: 'Mexico',          country: 'Mexico',              departureGateway: 'YVR', revenueManager: 'Jordan Kim',   salesManager: 'Chloe Martin' },
  { id: 'MID', name: 'Riviera Maya',    region: 'Mexico',          country: 'Mexico',              departureGateway: 'YYZ', revenueManager: 'David Okafor', salesManager: 'Tom Reyes'    },
  { id: 'HUX', name: 'Huatulco',        region: 'Mexico',          country: 'Mexico',              departureGateway: 'YYC', revenueManager: 'Priya Patel',  salesManager: 'Amir Hassan'  },
  { id: 'MZT', name: 'Mazatlan',        region: 'Mexico',          country: 'Mexico',              departureGateway: 'YYC', revenueManager: 'Jordan Kim',   salesManager: 'Amir Hassan'  },
  { id: 'CZM', name: 'Cozumel',         region: 'Mexico',          country: 'Mexico',              departureGateway: 'YUL', revenueManager: 'Jordan Kim',   salesManager: 'Chloe Martin' },
  { id: 'ZIH', name: 'Ixtapa',          region: 'Mexico',          country: 'Mexico',              departureGateway: 'YYZ', revenueManager: 'Lisa Tran',    salesManager: 'Chloe Martin' },

  // ── Central America ──
  { id: 'RTB', name: 'Roatan',          region: 'Central America', country: 'Honduras',            departureGateway: 'YYZ', revenueManager: 'David Okafor', salesManager: 'Amir Hassan'  },
  { id: 'LIR', name: 'Liberia',         region: 'Central America', country: 'Costa Rica',          departureGateway: 'YYZ', revenueManager: 'Lisa Tran',    salesManager: 'Amir Hassan'  },
  { id: 'PTY', name: 'Panama City',     region: 'Central America', country: 'Panama',              departureGateway: 'YYZ', revenueManager: 'David Okafor', salesManager: 'Tom Reyes'    },

  // ── Europe ──
  { id: 'LIS', name: 'Lisbon',          region: 'Europe',          country: 'Portugal',            departureGateway: 'YYZ', revenueManager: 'Sarah Chen',   salesManager: 'Tom Reyes'    },
  { id: 'BCN', name: 'Barcelona',       region: 'Europe',          country: 'Spain',               departureGateway: 'YYZ', revenueManager: 'Marcus Webb',  salesManager: 'Diana Novak'  },
  { id: 'FCO', name: 'Rome',            region: 'Europe',          country: 'Italy',               departureGateway: 'YYZ', revenueManager: 'Marcus Webb',  salesManager: 'Diana Novak'  },
  { id: 'ATH', name: 'Athens',          region: 'Europe',          country: 'Greece',              departureGateway: 'YYZ', revenueManager: 'Priya Patel',  salesManager: 'Amir Hassan'  },
  { id: 'AMS', name: 'Amsterdam',       region: 'Europe',          country: 'Netherlands',         departureGateway: 'YYZ', revenueManager: 'Jordan Kim',   salesManager: 'Chloe Martin' },

  // ── Sun & Sand (long-haul) ──
  { id: 'MLE', name: 'Maldives',        region: 'Sun & Sand',      country: 'Maldives',            departureGateway: 'YYZ', revenueManager: 'David Okafor', salesManager: 'Tom Reyes'    },
  { id: 'DXB', name: 'Dubai',           region: 'Sun & Sand',      country: 'United Arab Emirates',departureGateway: 'YYZ', revenueManager: 'Lisa Tran',    salesManager: 'Diana Novak'  },
  { id: 'HKT', name: 'Phuket',          region: 'Sun & Sand',      country: 'Thailand',            departureGateway: 'YVR', revenueManager: 'David Okafor', salesManager: 'Chloe Martin' },
];

// Assign a brand to each destination (alternating for variety; deterministic)
DESTINATIONS.forEach((d, i) => {
  d.brand = (i % 2 === 0) ? 'Sunwing' : 'WestJet Vacations';
});

// ── Shared helpers ─────────────────────────────────────────
function _fmtDate(d) {
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  const yr = String(d.getFullYear()).slice(-2);
  return `${mo}/${da}/${yr}`;
}

function _seededRandom(seed) {
  // Simple deterministic PRNG so the demo is stable across reloads
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ── Flight Only seed ───────────────────────────────────────
const GATEWAY_NAMES = {
  YYZ: 'Toronto',
  YVR: 'Vancouver',
  YWG: 'Winnipeg',
  YOW: 'Ottawa',
  YHZ: 'Halifax',
  YUL: 'Montreal',
  YYC: 'Calgary',
};

const _FLIGHT_CATEGORIES = {
  'Own Flight': { fareMin: 380, fareMax: 650, marginMin:  80, marginMax: 160 },
  'Risk Block': { fareMin: 320, fareMax: 550, marginMin:  50, marginMax: 120 },
  '3rd Party':  { fareMin: 280, fareMax: 480, marginMin:  30, marginMax:  80 },
};

// Route specs: which flights exist on which destination
const _FLIGHT_ROUTES = {
  CUN: [
    { flightNum: 'WS2401', origin: 'YYZ', category: 'Own Flight' },
    { flightNum: 'WS2403', origin: 'YVR', category: 'Own Flight' },
    { flightNum: 'AC9821', origin: 'YYZ', category: 'Risk Block' },
  ],
  PUJ: [
    { flightNum: 'WS2601', origin: 'YYZ', category: 'Own Flight' },
    { flightNum: 'WG5501', origin: 'YWG', category: 'Risk Block' },
  ],
  VRA: [
    { flightNum: 'WS2201', origin: 'YYZ', category: 'Own Flight' },
    { flightNum: 'WG5301', origin: 'YOW', category: '3rd Party'  },
  ],
  MBJ: [
    { flightNum: 'WS2801', origin: 'YYZ', category: 'Own Flight' },
    { flightNum: 'WG5701', origin: 'YHZ', category: 'Risk Block' },
  ],
  MID: [
    { flightNum: 'WS2501', origin: 'YYZ', category: 'Own Flight' },
    { flightNum: 'WG5401', origin: 'YYC', category: 'Risk Block' },
  ],
  SJD: [
    { flightNum: 'WS3001', origin: 'YYZ', category: 'Own Flight' },
    { flightNum: 'WS3003', origin: 'YVR', category: 'Own Flight' },
  ],
  BGI: [
    { flightNum: 'WS3201', origin: 'YYZ', category: 'Own Flight' },
    { flightNum: 'WG5801', origin: 'YOW', category: 'Risk Block' },
  ],
  NAS: [
    { flightNum: 'WS3401', origin: 'YYZ', category: 'Own Flight' },
    { flightNum: 'WG5901', origin: 'YWG', category: '3rd Party'  },
  ],
  PVR: [
    { flightNum: 'WS2701', origin: 'YYZ', category: 'Own Flight' },
    { flightNum: 'WS2703', origin: 'YVR', category: 'Own Flight' },
  ],
};

// 16 rolling weekly departure dates starting from next Monday
function _generateFlightDepartureDates() {
  const today = new Date();
  const dow = today.getDay();
  const offset = dow === 0 ? 1 : (8 - dow) % 7 || 7;
  const start = new Date();
  start.setDate(today.getDate() + offset);
  return Array.from({ length: 16 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i * 7);
    return d;
  });
}

const _FLIGHT_DEPARTURE_DATES = _generateFlightDepartureDates();

// Routes with an explicit daily-flight count per week. Others default to 5.
const _FLIGHT_DAYS_PER_WEEK = {
  'WS2401': 7,
  'WS2601': 6,
  'WS2201': 5,
  'WS2801': 6,
  'WS2403': 5,
};
const _DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Weekday fare multipliers (Mon cheapest, Sat/Sun slightly up)
const _DOW_FARE_MULT = [1.08, 0.93, 0.92, 0.95, 0.98, 1.05, 1.10]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
const _DEP_TIME_POOL = ['06:30', '08:45', '11:20', '13:05', '14:55', '17:30', '20:15'];

// Autopilot rule names applied ~30% of daily flights
const _AUTOPILOT_RULES = [
  'LF > 85% — premium pricing',
  'Competitor undercut — match-lower',
  'Days-to-dep < 14 — last-minute surge',
  'Midweek midseason optimiser',
  'Own-flight yield floor',
  'Risk-block pace recovery',
];

function _makeFlightDay(parentId, baseDate, dayIdxInWeek, spec, rand, category, idx, flightNum) {
  // Pick the day-of-week offset: cycle through Mon, Tue, Thu, Fri, Sat, Sun, Wed depending on how many flights the route has
  const offsetCycle = [0, 1, 3, 4, 5, 6, 2]; // Mon, Tue, Thu, Fri, Sat, Sun, Wed
  const dayOffset = offsetCycle[dayIdxInWeek % 7];
  const d = new Date(baseDate);
  d.setDate(d.getDate() + dayOffset);
  const dow = d.getDay();

  // Total aircraft capacity varies 150-220
  const baseCap = category === 'Own Flight' ? 195 : category === 'Risk Block' ? 178 : 158;
  const totalCap = Math.max(150, Math.min(220, baseCap + Math.round((rand() - 0.5) * 30)));

  // Business only on Own Flight — 15-25% of total seats
  const hasBusiness = category === 'Own Flight';
  const busRatio = hasBusiness ? (0.15 + rand() * 0.10) : 0;
  const busCap = Math.round(totalCap * busRatio);
  const ecoCap = totalCap - busCap;

  // Load factor drift with some variance per day (shared baseline per class, slight offset for business)
  const weeksOut = idx;
  const targetLF    = Math.round((0.78 - weeksOut * 0.025) * 100) / 100;
  const ecoForecast = Math.max(0.35, Math.min(0.98, targetLF + (rand() - 0.5) * 0.32));
  const busForecast = hasBusiness ? Math.max(0.30, Math.min(0.95, targetLF - 0.05 + (rand() - 0.5) * 0.28)) : 0;
  const ecoSold = Math.round(ecoCap * Math.max(0, ecoForecast - 0.06 - rand() * 0.12));
  const busSold = hasBusiness ? Math.round(busCap * Math.max(0, busForecast - 0.05 - rand() * 0.10)) : 0;

  const daysLeft = Math.max(7, 7 * (idx + 2));
  const ecoRosTarget = Math.round(((ecoCap * targetLF - ecoSold) / daysLeft) * 10) / 10;
  const ecoRos       = Math.round((ecoRosTarget * (0.5 + rand() * 1.0)) * 10) / 10;
  const busRosTarget = hasBusiness ? Math.round(((busCap * (targetLF - 0.05) - busSold) / daysLeft) * 10) / 10 : 0;
  const busRos       = hasBusiness ? Math.round((busRosTarget * (0.5 + rand() * 1.0)) * 10) / 10 : 0;

  // Economy fare
  const dowMult = _DOW_FARE_MULT[dow];
  const baseFare = spec.fareMin + rand() * (spec.fareMax - spec.fareMin);
  const ecoCurrFare = Math.round(baseFare * dowMult);
  const ecoRecFare  = Math.max(spec.fareMin, ecoCurrFare + Math.round((rand() - 0.4) * 70));
  const ecoCurrMargin = Math.round(spec.marginMin + rand() * (spec.marginMax - spec.marginMin));
  const ecoRecMargin  = Math.max(spec.marginMin, ecoCurrMargin + Math.round((rand() - 0.45) * 40));
  const ecoComp1 = Math.round(ecoCurrFare + (rand() - 0.45) * 120);
  const ecoComp2 = Math.round(ecoCurrFare + (rand() - 0.55) * 150);

  // Business fare: 2.5x – 4x economy
  const busMult    = hasBusiness ? (2.5 + rand() * 1.5) : 0;
  const busCurrFare = hasBusiness ? Math.round(ecoCurrFare * busMult) : 0;
  const busRecFare  = hasBusiness ? Math.max(busCurrFare - 200, busCurrFare + Math.round((rand() - 0.4) * 180)) : 0;
  // Business margin scales roughly with fare
  const busCurrMargin = hasBusiness ? Math.round(ecoCurrMargin * (busMult * 0.9)) : 0;
  const busRecMargin  = hasBusiness ? Math.max(busCurrMargin - 80, busCurrMargin + Math.round((rand() - 0.45) * 120)) : 0;
  const busComp1 = hasBusiness ? Math.round(busCurrFare + (rand() - 0.45) * 220) : 0;
  const busComp2 = hasBusiness ? Math.round(busCurrFare + (rand() - 0.55) * 260) : 0;

  const departureTime = _DEP_TIME_POOL[dayIdxInWeek % _DEP_TIME_POOL.length];

  // Auto-changed flags — independent per cabin class (~30% each)
  const ecoAutoChanged = rand() < 0.30;
  const ecoAutoChangedRule = ecoAutoChanged
    ? _AUTOPILOT_RULES[Math.floor(rand() * _AUTOPILOT_RULES.length)]
    : null;
  const busAutoChanged = hasBusiness ? (rand() < 0.30) : false;
  const busAutoChangedRule = busAutoChanged
    ? _AUTOPILOT_RULES[Math.floor(rand() * _AUTOPILOT_RULES.length)]
    : null;
  // Day-level flag true if either class was auto-changed (used by calendar / alerts)
  const autoChanged = ecoAutoChanged || busAutoChanged;
  const autoChangedRule = ecoAutoChanged ? ecoAutoChangedRule : busAutoChangedRule;

  // Top-level aggregates: combine eco + biz for capacity/sold/LF; use economy for headline fare/margin
  const combinedSold = ecoSold + busSold;
  const combinedForecastLF = Math.round((combinedSold / totalCap) * 100) / 100;

  const economy = {
    capacity: ecoCap,
    sold: ecoSold,
    currentFare: ecoCurrFare,
    recFare: ecoRecFare,
    currentMargin: ecoCurrMargin,
    recMargin: ecoRecMargin,
    deltaFare: ecoRecFare - ecoCurrFare,
    deltaMargin: ecoRecMargin - ecoCurrMargin,
    targetLF,
    forecastLF: Math.round(ecoForecast * 100) / 100,
    rateOfSale: ecoRos,
    rateOfSaleTarget: ecoRosTarget,
    comp1Fare: ecoComp1,
    comp2Fare: ecoComp2,
    autoChanged: ecoAutoChanged,
    autoChangedRule: ecoAutoChangedRule,
  };
  const business = hasBusiness ? {
    capacity: busCap,
    sold: busSold,
    currentFare: busCurrFare,
    recFare: busRecFare,
    currentMargin: busCurrMargin,
    recMargin: busRecMargin,
    deltaFare: busRecFare - busCurrFare,
    deltaMargin: busRecMargin - busCurrMargin,
    targetLF: Math.round((targetLF - 0.05) * 100) / 100,
    forecastLF: Math.round(busForecast * 100) / 100,
    rateOfSale: busRos,
    rateOfSaleTarget: busRosTarget,
    comp1Fare: busComp1,
    comp2Fare: busComp2,
    autoChanged: busAutoChanged,
    autoChangedRule: busAutoChangedRule,
  } : null;

  return {
    id: `${parentId}-${_DOW_LABELS[dow]}`,
    departureDate: _fmtDate(d),
    departureTime,
    // Combined totals (for backward compat at route/week aggregation)
    capacity: totalCap,
    sold: combinedSold,
    targetLF,
    forecastLF: combinedForecastLF,
    // Headline fare/margin at this level uses economy (representative consumer fare)
    rateOfSale: ecoRos,
    rateOfSaleTarget: ecoRosTarget,
    currentFare: ecoCurrFare,
    recFare: ecoRecFare,
    deltaFare: ecoRecFare - ecoCurrFare,
    currentMargin: ecoCurrMargin,
    recMargin: ecoRecMargin,
    deltaMargin: ecoRecMargin - ecoCurrMargin,
    comp1Fare: ecoComp1,
    comp2Fare: ecoComp2,
    hasCostChange: rand() > 0.92,
    locked: false,
    autoChanged,
    autoChangedRule,
    // Cabin-class breakdown
    economy,
    business,
  };
}

function _makeFlightDate(routeId, idx, category, rand, flightNum) {
  const spec = _FLIGHT_CATEGORIES[category];
  const dep = _FLIGHT_DEPARTURE_DATES[idx];

  // Determine how many daily flights this route+week has
  const dayCount = _FLIGHT_DAYS_PER_WEEK[flightNum] || 5;

  const parentId = `${routeId}-W${idx + 1}`;
  const days = Array.from({ length: dayCount }, (_, di) =>
    _makeFlightDay(parentId, dep, di, spec, rand, category, idx, flightNum)
  );

  // Aggregate the week from its days
  const capacity = days.reduce((s, x) => s + x.capacity, 0);
  const sold     = days.reduce((s, x) => s + x.sold, 0);
  const avgTargetLF   = days.reduce((s, x) => s + x.targetLF, 0) / days.length;
  const avgForecastLF = days.reduce((s, x) => s + x.forecastLF, 0) / days.length;
  const avgRos       = days.reduce((s, x) => s + x.rateOfSale, 0) / days.length;
  const avgRosTarget = days.reduce((s, x) => s + x.rateOfSaleTarget, 0) / days.length;
  const avgCurFare = Math.round(days.reduce((s, x) => s + x.currentFare, 0) / days.length);
  const avgRecFare = Math.round(days.reduce((s, x) => s + x.recFare, 0) / days.length);
  const avgCurMargin = Math.round(days.reduce((s, x) => s + x.currentMargin, 0) / days.length);
  const avgRecMargin = Math.round(days.reduce((s, x) => s + x.recMargin, 0) / days.length);
  const avgComp1 = Math.round(days.reduce((s, x) => s + x.comp1Fare, 0) / days.length);
  const avgComp2 = Math.round(days.reduce((s, x) => s + x.comp2Fare, 0) / days.length);

  // Week-level cabin class aggregates — used by calendar detail panel
  const ecoDays = days.map(d => d.economy).filter(Boolean);
  const busDays = days.map(d => d.business).filter(Boolean);
  const _avg = (arr, f) => Math.round(arr.reduce((s, x) => s + f(x), 0) / arr.length);
  const weekEconomy = ecoDays.length ? {
    capacity:      ecoDays.reduce((s, x) => s + x.capacity, 0),
    sold:          ecoDays.reduce((s, x) => s + x.sold, 0),
    currentFare:   _avg(ecoDays, x => x.currentFare),
    recFare:       _avg(ecoDays, x => x.recFare),
    currentMargin: _avg(ecoDays, x => x.currentMargin),
    recMargin:     _avg(ecoDays, x => x.recMargin),
    targetLF:      ecoDays[0].targetLF,
    forecastLF:    Math.round((ecoDays.reduce((s, x) => s + x.forecastLF, 0) / ecoDays.length) * 100) / 100,
    comp1Fare:     _avg(ecoDays, x => x.comp1Fare),
    comp2Fare:     _avg(ecoDays, x => x.comp2Fare),
  } : null;
  const weekBusiness = busDays.length ? {
    capacity:      busDays.reduce((s, x) => s + x.capacity, 0),
    sold:          busDays.reduce((s, x) => s + x.sold, 0),
    currentFare:   _avg(busDays, x => x.currentFare),
    recFare:       _avg(busDays, x => x.recFare),
    currentMargin: _avg(busDays, x => x.currentMargin),
    recMargin:     _avg(busDays, x => x.recMargin),
    targetLF:      busDays[0].targetLF,
    forecastLF:    Math.round((busDays.reduce((s, x) => s + x.forecastLF, 0) / busDays.length) * 100) / 100,
    comp1Fare:     _avg(busDays, x => x.comp1Fare),
    comp2Fare:     _avg(busDays, x => x.comp2Fare),
  } : null;

  return {
    id: parentId,
    departureDate: _fmtDate(dep),
    departureTime: days[0].departureTime,
    capacity,
    sold,
    targetLF: Math.round(avgTargetLF * 100) / 100,
    forecastLF: Math.round(avgForecastLF * 100) / 100,
    rateOfSale: Math.round(avgRos * 10) / 10,
    rateOfSaleTarget: Math.round(avgRosTarget * 10) / 10,
    currentFare: avgCurFare,
    recFare: avgRecFare,
    deltaFare: avgRecFare - avgCurFare,
    currentMargin: avgCurMargin,
    recMargin: avgRecMargin,
    deltaMargin: avgRecMargin - avgCurMargin,
    comp1Fare: avgComp1,
    comp2Fare: avgComp2,
    hasCostChange: days.some(x => x.hasCostChange),
    locked: false,
    economy: weekEconomy,
    business: weekBusiness,
    days,
  };
}

function _makeFlightRoute(destId, routeSpec, destIdx, routeIdx) {
  const rand = _seededRandom((destIdx + 17) * 6301 + (routeIdx + 1) * 53);
  const routeId = `${destId}-${routeSpec.flightNum}`;
  const dates = _FLIGHT_DEPARTURE_DATES.map((_, i) =>
    _makeFlightDate(routeId, i, routeSpec.category, rand, routeSpec.flightNum)
  );
  const totalCapacity = dates.reduce((s, d) => s + d.capacity, 0);
  const totalSold = dates.reduce((s, d) => s + d.sold, 0);
  const avgForecastLF = dates.reduce((s, d) => s + d.forecastLF, 0) / dates.length;
  const avgTargetLF   = dates.reduce((s, d) => s + d.targetLF, 0) / dates.length;
  const avgCurrentFare = Math.round(dates.reduce((s, d) => s + d.currentFare, 0) / dates.length);
  const avgRecFare     = Math.round(dates.reduce((s, d) => s + d.recFare, 0) / dates.length);
  const avgCurrentMargin = Math.round(dates.reduce((s, d) => s + d.currentMargin, 0) / dates.length);
  const avgRecMargin     = Math.round(dates.reduce((s, d) => s + d.recMargin, 0) / dates.length);

  return {
    id: routeId,
    flightNum: routeSpec.flightNum,
    origin: routeSpec.origin,
    originName: GATEWAY_NAMES[routeSpec.origin] || routeSpec.origin,
    destination: destId,
    category: routeSpec.category,
    totalCapacity,
    totalSold,
    avgForecastLF: Math.round(avgForecastLF * 100) / 100,
    avgTargetLF:   Math.round(avgTargetLF * 100) / 100,
    avgCurrentFare,
    avgRecFare,
    deltaFare: avgRecFare - avgCurrentFare,
    avgCurrentMargin,
    avgRecMargin,
    deltaMargin: avgRecMargin - avgCurrentMargin,
    hasCostChange: dates.some(d => d.hasCostChange),
    dates,
  };
}

const FLIGHT_DATA = DESTINATIONS
  .filter(d => _FLIGHT_ROUTES[d.id])
  .map((d, destIdx) => {
    const routes = _FLIGHT_ROUTES[d.id].map((spec, rIdx) => _makeFlightRoute(d.id, spec, destIdx, rIdx));
    const allDates = routes.flatMap(r => r.dates);
    const totalCapacity = allDates.reduce((s, x) => s + x.capacity, 0);
    const totalSold = allDates.reduce((s, x) => s + x.sold, 0);
    return {
      id: d.id,
      name: d.name,
      region: d.region,
      country: d.country,
      brand: d.brand,
      revenueManager: d.revenueManager,
      totalRoutes: routes.length,
      totalFlights: allDates.length,
      totalCapacity,
      totalSold,
      avgForecastLF: Math.round((allDates.reduce((s, x) => s + x.forecastLF, 0) / allDates.length) * 100) / 100,
      avgTargetLF:   Math.round((allDates.reduce((s, x) => s + x.targetLF, 0) / allDates.length) * 100) / 100,
      avgCurrentFare: Math.round(allDates.reduce((s, x) => s + x.currentFare, 0) / allDates.length),
      avgRecFare:     Math.round(allDates.reduce((s, x) => s + x.recFare, 0) / allDates.length),
      deltaFare:      Math.round(allDates.reduce((s, x) => s + (x.recFare - x.currentFare), 0) / allDates.length),
      routes,
    };
  });

function getFlightDateById(dateId) {
  for (const d of FLIGHT_DATA) {
    for (const r of d.routes) {
      const hit = r.dates.find(x => x.id === dateId);
      if (hit) return { destination: d, route: r, date: hit };
      // Search inside per-week days
      for (const weekDate of r.dates) {
        if (!weekDate.days) continue;
        const dayHit = weekDate.days.find(x => x.id === dateId);
        if (dayHit) return { destination: d, route: r, date: dayHit, weekDate };
      }
    }
  }
  return null;
}

// ── Competitor Flight Data seed ────────────────────────────
const COMPETITOR_FLIGHT_DATA = [
  { id: 'CF-001', destination: 'Cancun',      flightDate: 'May 11, 2026', ourFlight: 'WS2401', ourFare: 489, comp1Name: 'Air Canada',  comp1Fare: 465, comp2Name: 'Swoop',        comp2Fare: 455, lastUpdated: '05/04/26 09:15' },
  { id: 'CF-002', destination: 'Cancun',      flightDate: 'May 18, 2026', ourFlight: 'WS2403', ourFare: 529, comp1Name: 'Air Canada',  comp1Fare: 545, comp2Name: 'Flair',        comp2Fare: 489, lastUpdated: '05/04/26 09:15' },
  { id: 'CF-003', destination: 'Cancun',      flightDate: 'May 18, 2026', ourFlight: 'AC9821', ourFare: 445, comp1Name: 'Air Canada',  comp1Fare: 439, comp2Name: 'Porter',       comp2Fare: 425, lastUpdated: '05/04/26 09:15' },
  { id: 'CF-004', destination: 'Punta Cana',  flightDate: 'May 25, 2026', ourFlight: 'WS2601', ourFare: 509, comp1Name: 'Air Canada',  comp1Fare: 529, comp2Name: 'Flair',        comp2Fare: 485, lastUpdated: '05/04/26 09:15' },
  { id: 'CF-005', destination: 'Punta Cana',  flightDate: 'Jun 01, 2026', ourFlight: 'WG5501', ourFare: 439, comp1Name: 'Sunwing',     comp1Fare: 449, comp2Name: 'Air Transat',  comp2Fare: 425, lastUpdated: '05/04/26 09:15' },
  { id: 'CF-006', destination: 'Varadero',    flightDate: 'May 18, 2026', ourFlight: 'WS2201', ourFare: 465, comp1Name: 'Air Transat', comp1Fare: 479, comp2Name: 'Cubana',       comp2Fare: 445, lastUpdated: '05/04/26 09:15' },
  { id: 'CF-007', destination: 'Varadero',    flightDate: 'Jun 01, 2026', ourFlight: 'WG5301', ourFare: 389, comp1Name: 'Air Transat', comp1Fare: 415, comp2Name: 'Sunwing',      comp2Fare: 395, lastUpdated: '05/04/26 09:15' },
  { id: 'CF-008', destination: 'Montego Bay', flightDate: 'May 11, 2026', ourFlight: 'WS2801', ourFare: 549, comp1Name: 'Air Canada',  comp1Fare: 539, comp2Name: 'Air Transat',  comp2Fare: 509, lastUpdated: '05/04/26 09:15' },
  { id: 'CF-009', destination: 'Montego Bay', flightDate: 'May 25, 2026', ourFlight: 'WG5701', ourFare: 479, comp1Name: 'Sunwing',     comp1Fare: 489, comp2Name: 'Air Transat',  comp2Fare: 495, lastUpdated: '05/04/26 09:15' },
  { id: 'CF-010', destination: 'Montego Bay', flightDate: 'Jun 08, 2026', ourFlight: 'WS2801', ourFare: 525, comp1Name: 'Air Canada',  comp1Fare: 499, comp2Name: 'Air Transat',  comp2Fare: 475, lastUpdated: '05/04/26 09:15' },
];
COMPETITOR_FLIGHT_DATA.forEach(c => {
  c.cheapestComp = Math.min(c.comp1Fare, c.comp2Fare);
  c.ourDelta = c.ourFare - c.cheapestComp;
  c.ourDeltaPct = Math.round((c.ourDelta / c.cheapestComp) * 1000) / 10;
});

// ── Flight Published Changes seed ──────────────────────────
const FLIGHT_PUBLISHED_DATA = [
  { id: 'FP-001', destination: 'Cancun',      flightNum: 'WS2401', route: 'YYZ → CUN', departureDate: 'Apr 27, 2026', oldFare: 459, newFare: 489, publishedBy: 'Sarah Chen',   publishedDate: '04/20/26', status: 'Live'      },
  { id: 'FP-002', destination: 'Cancun',      flightNum: 'WS2403', route: 'YVR → CUN', departureDate: 'May 04, 2026', oldFare: 529, newFare: 509, publishedBy: 'Sarah Chen',   publishedDate: '04/21/26', status: 'Live'      },
  { id: 'FP-003', destination: 'Cancun',      flightNum: 'AC9821', route: 'YYZ → CUN', departureDate: 'May 11, 2026', oldFare: 389, newFare: 425, publishedBy: 'Sarah Chen',   publishedDate: '04/22/26', status: 'Scheduled' },
  { id: 'FP-004', destination: 'Punta Cana',  flightNum: 'WS2601', route: 'YYZ → PUJ', departureDate: 'May 11, 2026', oldFare: 475, newFare: 509, publishedBy: 'Marcus Webb',  publishedDate: '04/22/26', status: 'Live'      },
  { id: 'FP-005', destination: 'Varadero',    flightNum: 'WS2201', route: 'YYZ → VRA', departureDate: 'May 18, 2026', oldFare: 435, newFare: 465, publishedBy: 'Marcus Webb',  publishedDate: '04/23/26', status: 'Scheduled' },
  { id: 'FP-006', destination: 'Varadero',    flightNum: 'WG5301', route: 'YOW → VRA', departureDate: 'Apr 20, 2026', oldFare: 419, newFare: 389, publishedBy: 'Priya Patel',  publishedDate: '04/14/26', status: 'Expired'   },
  { id: 'FP-007', destination: 'Montego Bay', flightNum: 'WS2801', route: 'YYZ → MBJ', departureDate: 'May 25, 2026', oldFare: 519, newFare: 549, publishedBy: 'Sarah Chen',   publishedDate: '04/24/26', status: 'Scheduled' },
  { id: 'FP-008', destination: 'Montego Bay', flightNum: 'WG5701', route: 'YHZ → MBJ', departureDate: 'May 04, 2026', oldFare: 459, newFare: 479, publishedBy: 'Marcus Webb',  publishedDate: '04/25/26', status: 'Live'      },
];
FLIGHT_PUBLISHED_DATA.forEach(p => {
  p.changeAmt = p.newFare - p.oldFare;
  p.changePct = Math.round((p.changeAmt / p.oldFare) * 1000) / 10;
});

// ── Hotel Only seed ────────────────────────────────────────
// Specific hotels by destination for the Hotel Only screen.
// Only these four destinations are seeded for Hotel Only.
const _HOTEL_SPECS = {
  CUN: [
    { id: 'CUN-H01', name: 'Riu Cancun',     classification: 'Exclusive', stars: 4 },
    { id: 'CUN-H02', name: 'Dreams Natura',  classification: 'Exclusive', stars: 5 },
    { id: 'CUN-H03', name: 'Krystal Cancun', classification: 'Commodity', stars: 3 },
  ],
  PUJ: [
    { id: 'PUJ-H01', name: 'Barcelo Bavaro',        classification: 'Exclusive', stars: 4 },
    { id: 'PUJ-H02', name: 'Hard Rock Punta Cana',  classification: 'Exclusive', stars: 5 },
    { id: 'PUJ-H03', name: 'Whala Bavaro',          classification: 'Commodity', stars: 3 },
  ],
  VRA: [
    { id: 'VRA-H01', name: 'Melia Varadero', classification: 'Exclusive', stars: 4 },
    { id: 'VRA-H02', name: 'Sol Palmeras',   classification: 'Commodity', stars: 3 },
  ],
  MBJ: [
    { id: 'MBJ-H01', name: 'Sandals Montego Bay', classification: 'Exclusive', stars: 5 },
    { id: 'MBJ-H02', name: 'Riu Montego Bay',     classification: 'Commodity', stars: 4 },
  ],
  MID: [
    { id: 'MID-H01', name: 'Now Jade Resort',     classification: 'Exclusive', stars: 5 },
    { id: 'MID-H02', name: 'Iberostar Paraiso',   classification: 'Exclusive', stars: 4 },
    { id: 'MID-H03', name: 'Gran Bahia Principe', classification: 'Commodity', stars: 4 },
  ],
  SJD: [
    { id: 'SJD-H01', name: 'Breathless Cabo', classification: 'Exclusive', stars: 5 },
    { id: 'SJD-H02', name: 'Riu Santa Fe',    classification: 'Commodity', stars: 4 },
  ],
  BGI: [
    { id: 'BGI-H01', name: 'Sandals Barbados',   classification: 'Exclusive', stars: 5 },
    { id: 'BGI-H02', name: 'Accra Beach Hotel',  classification: 'Commodity', stars: 3 },
  ],
  NAS: [
    { id: 'NAS-H01', name: 'Atlantis Paradise Island', classification: 'Exclusive', stars: 5 },
    { id: 'NAS-H02', name: 'Melia Nassau',             classification: 'Commodity', stars: 4 },
  ],
  PVR: [
    { id: 'PVR-H01', name: 'Dreams Villamagna', classification: 'Exclusive', stars: 5 },
    { id: 'PVR-H02', name: 'Krystal Grand',     classification: 'Commodity', stars: 4 },
  ],
};

const _HOTEL_ROOM_TYPES = ['Standard', 'Deluxe', 'Ocean View', 'Suite'];

// Generate 8 rolling check-in weeks starting next Monday
function _generateCheckInWeeks() {
  const today = new Date();
  const dow = today.getDay();
  const offset = dow === 0 ? 1 : (8 - dow) % 7 || 7;
  const start = new Date();
  start.setDate(today.getDate() + offset);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i * 7);
    return {
      weekLabel: `Wk ${months[d.getMonth()]} ${d.getDate()}`,
      weekStart: _fmtDate(d),
    };
  });
}

const CHECK_IN_WEEKS = _generateCheckInWeeks();

function _makeCheckInWeek(catId, weekIdx, classification, roomType, rand) {
  const { weekLabel, weekStart } = CHECK_IN_WEEKS[weekIdx];

  // Supplier cost by classification
  // Exclusive: $120-200, Commodity: $70-110
  const costBase = classification === 'Exclusive'
    ? 120 + rand() * 80
    : 70 + rand() * 40;
  const typeBump = { Standard: 0, Deluxe: 15, 'Ocean View': 35, Suite: 70 }[roomType] || 0;
  const supplierCost = Math.round(costBase + typeBump);

  // ADR ranges: Exclusive $180-320, Commodity $110-180
  const adrBase = classification === 'Exclusive'
    ? 180 + rand() * 140
    : 110 + rand() * 70;
  const currentADR = Math.round(adrBase + typeBump);

  // Rec ADR wobbles around current, never below cost + $20
  const swing = Math.round((rand() - 0.4) * 32);
  const recADR = Math.max(supplierCost + 20, currentADR + swing);

  const allocation = Math.round(28 + rand() * 42);
  const forecastOcc = Math.round((0.42 + rand() * 0.52) * 100) / 100;
  const currentOcc = Math.max(0, Math.round((forecastOcc - 0.05 - rand() * 0.22) * 100) / 100);
  const sold = Math.min(allocation, Math.round(allocation * currentOcc));

  const hasCostChange = rand() > 0.87;

  // Auto-acceptance: ~30% of room-category weeks were adjusted by the rules engine.
  const autoChanged = rand() < 0.30;
  const _HOTEL_AUTO_RULES = [
    'Hotel Demand Response',
    'Hotel Low Occ Protection',
    'Competitor Price Match',
    'Exclusive-hotel yield floor',
    'Commodity last-minute surge',
  ];
  const autoChangedRule = autoChanged
    ? _HOTEL_AUTO_RULES[Math.floor(rand() * _HOTEL_AUTO_RULES.length)]
    : null;

  return {
    id: `${catId}-W${weekIdx + 1}`,
    weekLabel,
    weekStart,
    allocation,
    sold,
    supplierCost,
    currentADR,
    recADR,
    deltaADR: recADR - currentADR,
    forecastOcc,
    currentOcc,
    hasCostChange,
    autoChanged,
    autoChangedRule,
    locked: false,
  };
}

function _avg(arr, field) {
  if (!arr.length) return 0;
  return arr.reduce((s, x) => s + x[field], 0) / arr.length;
}

function _makeCategory(hotelId, roomType, rand, classification) {
  const catId = `${hotelId}-${roomType.slice(0, 3).toUpperCase().replace(' ', '')}`;
  const weeks = Array.from({ length: CHECK_IN_WEEKS.length }, (_, i) =>
    _makeCheckInWeek(catId, i, classification, roomType, rand)
  );
  const allocation = weeks.reduce((s, w) => s + w.allocation, 0);
  const sold = weeks.reduce((s, w) => s + w.sold, 0);
  const avgCurrentADR = _avg(weeks, 'currentADR');
  const avgRecADR = _avg(weeks, 'recADR');

  return {
    id: catId,
    name: roomType,
    allocation,
    sold,
    soldPct: allocation ? Math.round((sold / allocation) * 100) / 100 : 0,
    avgCurrentADR: Math.round(avgCurrentADR),
    avgRecADR: Math.round(avgRecADR),
    deltaADR: Math.round(avgRecADR - avgCurrentADR),
    forecastOcc: Math.round(_avg(weeks, 'forecastOcc') * 100) / 100,
    currentOcc: Math.round(_avg(weeks, 'currentOcc') * 100) / 100,
    checkInWeeks: weeks,
  };
}

function _makeDetailedHotel(spec, destIdx, hotelIdx) {
  const rand = _seededRandom((destIdx + 11) * 7919 + (hotelIdx + 1) * 37);
  const categories = _HOTEL_ROOM_TYPES.map(t => _makeCategory(spec.id, t, rand, spec.classification));
  const allocation = categories.reduce((s, c) => s + c.allocation, 0);
  const sold = categories.reduce((s, c) => s + c.sold, 0);
  const avgCurrentADR = _avg(categories, 'avgCurrentADR');
  const avgRecADR = _avg(categories, 'avgRecADR');
  const allWeeks = categories.flatMap(c => c.checkInWeeks);
  const hasCostChange = allWeeks.some(w => w.hasCostChange);

  return {
    id: spec.id,
    name: spec.name,
    classification: spec.classification,
    stars: spec.stars,
    allocation,
    sold,
    soldPct: allocation ? Math.round((sold / allocation) * 100) / 100 : 0,
    avgCurrentADR: Math.round(avgCurrentADR),
    avgRecADR: Math.round(avgRecADR),
    deltaADR: Math.round(avgRecADR - avgCurrentADR),
    forecastOcc: Math.round(_avg(categories, 'forecastOcc') * 100) / 100,
    currentOcc: Math.round(_avg(categories, 'currentOcc') * 100) / 100,
    hasCostChange,
    categories,
  };
}

const HOTEL_DATA = DESTINATIONS
  .filter(d => _HOTEL_SPECS[d.id])
  .map((d, destIdx) => {
    const hotels = _HOTEL_SPECS[d.id].map((spec, hIdx) => _makeDetailedHotel(spec, destIdx, hIdx));
    const allocation = hotels.reduce((s, h) => s + h.allocation, 0);
    const sold = hotels.reduce((s, h) => s + h.sold, 0);
    return {
      id: d.id,
      name: d.name,
      region: d.region,
      country: d.country,
      brand: d.brand,
      departureGateway: d.departureGateway,
      revenueManager: d.revenueManager,
      totalHotels: hotels.length,
      allocation,
      sold,
      soldPct: allocation ? Math.round((sold / allocation) * 100) / 100 : 0,
      avgCurrentADR: Math.round(_avg(hotels, 'avgCurrentADR')),
      avgRecADR: Math.round(_avg(hotels, 'avgRecADR')),
      deltaADR: Math.round(_avg(hotels, 'avgRecADR') - _avg(hotels, 'avgCurrentADR')),
      forecastOcc: Math.round(_avg(hotels, 'forecastOcc') * 100) / 100,
      currentOcc: Math.round(_avg(hotels, 'currentOcc') * 100) / 100,
      hotels,
    };
  });

// ── Beds:Seats ratio calibration ──────────────────────────
// Seed a realistic mix of Balanced (0.85–1.15), Under-bedded (<0.85),
// and Over-bedded (>1.15) across destinations. The Flight Only screen
// computes the badge as hotel allocation ÷ total flight seats, so we
// back-solve hotel allocation from the target ratio and the existing
// flight totalCapacity to land on the intended labels.
const _BEDS_SEATS_TARGETS = {
  CUN: 0.92, // Balanced
  PUJ: 0.78, // Under-bedded
  VRA: 1.21, // Over-bedded
  MBJ: 0.81, // Under-bedded
  MID: 0.95, // Balanced
  SJD: 1.18, // Over-bedded
  BGI: 0.88, // Balanced
  NAS: 0.74, // Under-bedded
  PVR: 1.05, // Balanced
};
(() => {
  const seatsByDest = Object.fromEntries(FLIGHT_DATA.map(f => [f.id, f.totalCapacity]));
  FLIGHT_DATA.forEach(f => {
    const r = _BEDS_SEATS_TARGETS[f.id];
    if (r != null) f.bedsToSeatsRatio = r;
  });
  HOTEL_DATA.forEach(h => {
    const ratio = _BEDS_SEATS_TARGETS[h.id];
    const seats = seatsByDest[h.id];
    if (ratio == null || !seats) return;
    h.allocation = Math.round(ratio * seats);
    h.bedsToSeatsRatio = ratio;
    h.soldPct = h.allocation ? Math.round((h.sold / h.allocation) * 100) / 100 : 0;
  });
})();

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

// ── Cost Change Exceptions seed ────────────────────────────
const COST_CHANGE_DATA = [
  { id: 'CC-001', destination: 'Cancun',      hotel: 'Riu Cancun',           roomCategory: 'Ocean View', checkInWeek: 'Wk May 11', oldCost: 165, newCost: 182, dateReceived: '05/01/26', status: 'Pending'  },
  { id: 'CC-002', destination: 'Cancun',      hotel: 'Dreams Natura',        roomCategory: 'Suite',      checkInWeek: 'Wk May 18', oldCost: 235, newCost: 215, dateReceived: '05/03/26', status: 'Reviewed' },
  { id: 'CC-003', destination: 'Punta Cana',  hotel: 'Hard Rock Punta Cana', roomCategory: 'Deluxe',     checkInWeek: 'Wk May 25', oldCost: 198, newCost: 212, dateReceived: '05/04/26', status: 'Pending'  },
  { id: 'CC-004', destination: 'Varadero',    hotel: 'Melia Varadero',       roomCategory: 'Standard',   checkInWeek: 'Wk Jun 01', oldCost: 140, newCost: 155, dateReceived: '05/05/26', status: 'Actioned' },
  { id: 'CC-005', destination: 'Montego Bay', hotel: 'Sandals Montego Bay',  roomCategory: 'Ocean View', checkInWeek: 'Wk Jun 08', oldCost: 245, newCost: 268, dateReceived: '05/06/26', status: 'Pending'  },
  { id: 'CC-006', destination: 'Punta Cana',  hotel: 'Barcelo Bavaro',       roomCategory: 'Standard',   checkInWeek: 'Wk Jun 15', oldCost: 145, newCost: 138, dateReceived: '05/06/26', status: 'Reviewed' },
  { id: 'CC-007', destination: 'Montego Bay', hotel: 'Riu Montego Bay',      roomCategory: 'Deluxe',     checkInWeek: 'Wk Jun 22', oldCost: 105, newCost: 118, dateReceived: '05/08/26', status: 'Pending'  },
  { id: 'CC-008', destination: 'Cancun',      hotel: 'Krystal Cancun',       roomCategory: 'Standard',   checkInWeek: 'Wk Jun 29', oldCost: 85,  newCost: 92,  dateReceived: '05/09/26', status: 'Pending'  },
];
COST_CHANGE_DATA.forEach(c => {
  c.changeAmt = c.newCost - c.oldCost;
  c.changePct = Math.round((c.changeAmt / c.oldCost) * 1000) / 10;
});

// ── Published Hotel Changes seed ───────────────────────────
const PUBLISHED_HOTEL_CHANGES = [
  { id: 'PC-001', destination: 'Cancun',      hotel: 'Riu Cancun',           roomCategory: 'Standard',   checkInWeek: 'Wk Apr 27', oldADR: 198, newADR: 215, publishedBy: 'Sarah Chen',  publishedDate: '04/20/26', status: 'Live'      },
  { id: 'PC-002', destination: 'Cancun',      hotel: 'Dreams Natura',        roomCategory: 'Suite',      checkInWeek: 'Wk May 04', oldADR: 395, newADR: 375, publishedBy: 'Sarah Chen',  publishedDate: '04/21/26', status: 'Live'      },
  { id: 'PC-003', destination: 'Punta Cana',  hotel: 'Hard Rock Punta Cana', roomCategory: 'Ocean View', checkInWeek: 'Wk May 11', oldADR: 285, newADR: 305, publishedBy: 'Sarah Chen',  publishedDate: '04/22/26', status: 'Scheduled' },
  { id: 'PC-004', destination: 'Varadero',    hotel: 'Melia Varadero',       roomCategory: 'Deluxe',     checkInWeek: 'Wk May 11', oldADR: 215, newADR: 228, publishedBy: 'Marcus Webb', publishedDate: '04/22/26', status: 'Live'      },
  { id: 'PC-005', destination: 'Montego Bay', hotel: 'Sandals Montego Bay',  roomCategory: 'Suite',      checkInWeek: 'Wk May 18', oldADR: 425, newADR: 445, publishedBy: 'Marcus Webb', publishedDate: '04/23/26', status: 'Scheduled' },
  { id: 'PC-006', destination: 'Punta Cana',  hotel: 'Barcelo Bavaro',       roomCategory: 'Standard',   checkInWeek: 'Wk Apr 20', oldADR: 175, newADR: 165, publishedBy: 'Sarah Chen',  publishedDate: '04/14/26', status: 'Expired'   },
  { id: 'PC-007', destination: 'Montego Bay', hotel: 'Riu Montego Bay',      roomCategory: 'Ocean View', checkInWeek: 'Wk May 25', oldADR: 195, newADR: 210, publishedBy: 'Marcus Webb', publishedDate: '04/24/26', status: 'Scheduled' },
  { id: 'PC-008', destination: 'Cancun',      hotel: 'Krystal Cancun',       roomCategory: 'Standard',   checkInWeek: 'Wk May 04', oldADR: 135, newADR: 142, publishedBy: 'Priya Patel', publishedDate: '04/25/26', status: 'Live'      },
];
PUBLISHED_HOTEL_CHANGES.forEach(p => { p.changeAmt = p.newADR - p.oldADR; });

// ── Package Rules seed ─────────────────────────────────────
const PACKAGE_RULES = [
  {
    id: 'RULE-001',
    name: 'Own Flight High LF Uplift',
    status: 'Active',
    priority: 10,
    flightCategories: ['Own Flight'],
    hotelClassifications: ['Any'],
    commitment: 'Fully Committed',
    destinations: ['All'],
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'LF %', operator: '>=', value: 80 },
    ],
    action: { type: 'Increase margin by $', value: 20, maxChange: 40, minMargin: 80, maxMargin: null },
    lastModified: '04/10/26',
    modifiedBy: 'Sarah Chen',
  },
  {
    id: 'RULE-002',
    name: 'Risk Block Distressed Inventory',
    status: 'Active',
    priority: 20,
    flightCategories: ['Risk Block'],
    hotelClassifications: ['Any'],
    commitment: 'Allotment — Not Committed',
    destinations: ['All'],
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'LF %', operator: '<', value: 50 },
      { metric: 'Days to Departure', operator: '<', value: 30 },
    ],
    action: { type: 'Decrease margin by $', value: 25, maxChange: 50, minMargin: 20, maxMargin: null },
    lastModified: '04/08/26',
    modifiedBy: 'Marcus Webb',
  },
  {
    id: 'RULE-003',
    name: 'Exclusive Hotel Premium',
    status: 'Active',
    priority: 15,
    flightCategories: ['Own Flight', 'Risk Block', '3rd Party'],
    hotelClassifications: ['Exclusive'],
    commitment: 'Any',
    destinations: ['All'],
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'Occ %', operator: '>=', value: 75 },
      { metric: 'Beds:Seats Ratio', operator: '<', value: 0.90 },
    ],
    action: { type: 'Increase margin by %', value: 8, maxChange: 60, minMargin: null, maxMargin: null },
    lastModified: '04/05/26',
    modifiedBy: 'Priya Patel',
  },
  {
    id: 'RULE-004',
    name: '3rd Party Seat Margin Floor',
    status: 'Active',
    priority: 30,
    flightCategories: ['3rd Party'],
    hotelClassifications: ['Any'],
    commitment: 'Any',
    destinations: ['All'],
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'Always apply', operator: '—', value: '' },
    ],
    action: { type: 'Set margin to $', value: 30, maxChange: null, minMargin: 30, maxMargin: null },
    lastModified: '03/28/26',
    modifiedBy: 'Jordan Kim',
  },
  {
    id: 'RULE-005',
    name: 'Caribbean Peak Season Lock',
    status: 'Active',
    priority: 5,
    flightCategories: ['Own Flight', 'Risk Block', '3rd Party'],
    hotelClassifications: ['Any'],
    commitment: 'Any',
    destinations: ['Caribbean'],
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'LF %', operator: '>=', value: 90 },
    ],
    action: { type: 'Lock price', value: '', maxChange: null, minMargin: null, maxMargin: null, flagForReview: true },
    lastModified: '04/01/26',
    modifiedBy: 'Sarah Chen',
  },
  {
    id: 'RULE-006',
    name: 'Commodity Hotel Low Occ Discount',
    status: 'Draft',
    priority: 25,
    flightCategories: ['Own Flight', 'Risk Block', '3rd Party'],
    hotelClassifications: ['Commodity'],
    commitment: 'Any',
    destinations: ['All'],
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'Occ %', operator: '<', value: 45 },
      { metric: 'Days to Departure', operator: '<', value: 21 },
    ],
    action: { type: 'Decrease margin by $', value: 15, maxChange: 30, minMargin: 0, maxMargin: null },
    lastModified: '04/12/26',
    modifiedBy: 'Lisa Tran',
  },
];

const RULE_METRICS    = ['LF %', 'Forecast LF %', 'Rate of Sale', 'Days to Departure', 'Margin $', 'Occ %', 'Beds:Seats Ratio'];
const RULE_OPERATORS  = ['>', '<', '=', '≥', '≤', 'between'];
const RULE_ACTIONS    = [
  'Increase margin by $',
  'Decrease margin by $',
  'Increase margin by %',
  'Decrease margin by %',
  'Set margin to $',
  'Set fare to $',
  'Lock price',
  'Flag for review',
];
const HOTEL_CLASSIFICATIONS = ['Exclusive', 'Commodity', 'Any'];
const COMMITMENT_TYPES = [
  'Fully Committed',
  'Allotment — Partially Committed',
  'Allotment — Not Committed',
  'Any',
];

// ── Vacation Packages seed data ─────────────────────────────
// Nested tree: Destination → Check-in Week (8 rolling) → Departure
// Gateway → Duration leaf (7N / 10N / 14N).
const PACKAGE_DATA = (() => {
  const DESTS = [
    { id: 'CUN', name: 'Cancun',       region: 'Mexico',
      gw: [
        { g: 'YYZ', c: 'Toronto',   fn: 'WS2401', fc: 'Own Flight' },
        { g: 'YVR', c: 'Vancouver', fn: 'WS2403', fc: 'Own Flight' },
        { g: 'YWG', c: 'Winnipeg',  fn: 'AC9823', fc: 'Risk Block' },
      ],
      hotels: [
        ['Riu Cancun',                    4, 'EXC'],
        ['Hyatt Ziva Cancun',             5, 'EXC'],
        ['Moon Palace Cancun',            5, 'EXC'],
        ['Iberostar Selection Cancun',    4, 'COM'],
      ],
      pkgNames: ['Cancun Sun Escape', 'Cancun Luxury Getaway', 'Cancun All-Inclusive'],
    },
    { id: 'PUJ', name: 'Punta Cana',   region: 'Caribbean',
      gw: [
        { g: 'YYZ', c: 'Toronto', fn: 'WS2601', fc: 'Own Flight' },
        { g: 'YOW', c: 'Ottawa',  fn: 'WS2611', fc: 'Own Flight' },
        { g: 'YHZ', c: 'Halifax', fn: 'WG5510', fc: 'Risk Block' },
      ],
      hotels: [
        ['Bahia Principe Luxury Ambar', 5, 'EXC'],
        ['Iberostar Grand Bavaro',      5, 'EXC'],
        ['Secrets Royal Beach',         5, 'EXC'],
        ['Riu Palace Punta Cana',       5, 'EXC'],
      ],
      pkgNames: ['Punta Cana Paradise', 'Punta Cana Palace', 'Punta Cana Bliss'],
    },
    { id: 'VRA', name: 'Varadero',     region: 'Caribbean',
      gw: [
        { g: 'YYZ', c: 'Toronto', fn: 'WS3101', fc: 'Own Flight' },
        { g: 'YOW', c: 'Ottawa',  fn: 'WG5301', fc: '3rd Party'  },
      ],
      hotels: [
        ['Iberostar Selection Varadero', 5, 'EXC'],
        ['Paradisus Varadero',           5, 'EXC'],
        ['Melia Peninsula Varadero',     4, 'EXC'],
        ['Royalton Hicacos',             5, 'COM'],
      ],
      pkgNames: ['Varadero Beach Break', 'Varadero Classic', 'Varadero Cuban Retreat'],
    },
    { id: 'MBJ', name: 'Montego Bay',  region: 'Caribbean',
      gw: [
        { g: 'YYZ', c: 'Toronto', fn: 'WS2801', fc: 'Own Flight' },
        { g: 'YYC', c: 'Calgary', fn: 'WS2811', fc: 'Own Flight' },
      ],
      hotels: [
        ['Iberostar Rose Hall Beach', 5, 'EXC'],
        ['Riu Montego Bay',           4, 'COM'],
        ['Secrets Wild Orchid',       5, 'EXC'],
        ['Sandals Montego Bay',       5, 'EXC'],
      ],
      pkgNames: ['Montego Bay Reggae Escape', 'Montego Bay Paradise', 'Montego Bay Jewel'],
    },
    { id: 'MID', name: 'Riviera Maya', region: 'Mexico',
      gw: [
        { g: 'YYZ', c: 'Toronto',   fn: 'WS2501', fc: 'Own Flight' },
        { g: 'YVR', c: 'Vancouver', fn: 'WS2503', fc: 'Own Flight' },
      ],
      hotels: [
        ['Bahia Principe Luxury Akumal', 5, 'EXC'],
        ['Grand Velas Riviera Maya',     5, 'EXC'],
        ['Barcelo Maya Palace',          5, 'EXC'],
        ['Hyatt Ziva Riviera Cancun',    5, 'EXC'],
      ],
      pkgNames: ['Riviera Maya Beachfront', 'Riviera Maya Eco Retreat', 'Riviera Maya Classic'],
    },
  ];

  const ROOM_CATS = ['Standard', 'Deluxe', 'Ocean View', 'Suite'];
  const PACES = ['ahead', 'on track', 'behind'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // 8 rolling check-in weeks starting Apr 27 (next Monday after the demo "today" of Apr 22)
  const startDate = new Date(2026, 3, 27);
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i * 7);
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    const yr = String(d.getFullYear()).slice(-2);
    return {
      idx: i,
      label: `Wk ${MONTHS[d.getMonth()]} ${da}`,
      date: `${mo}/${da}/${yr}`,
    };
  });

  const seed = (s0) => { let s = s0; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };

  // Total cost + current margin ranges per duration; rec margin +/- from current.
  function pricing(rand, dur) {
    let tc, cm;
    if (dur === 7)       { tc = 750  + Math.round(rand() * 650);  cm = 120 + Math.round(rand() * 200); }
    else if (dur === 10) { tc = 1000 + Math.round(rand() * 800);  cm = 180 + Math.round(rand() * 270); }
    else                 { tc = 1300 + Math.round(rand() * 950);  cm = 250 + Math.round(rand() * 350); }
    const recDelta = Math.round((rand() - 0.35) * 110);
    const rm = Math.max(30, cm + recDelta);
    return { tc, cm, rm };
  }

  return DESTS.map((d, di) => {
    const rand = seed(di * 9137 + 13);
    return {
      id: d.id, name: d.name, region: d.region,
      checkInWeeks: weeks.map(wk => ({
        idx: wk.idx, label: wk.label, date: wk.date,
        gateways: d.gw.map((gw, gi) => {
          // Offer 2 or 3 of [7, 10, 14] — usually all three.
          const roll = Math.floor(rand() * 4);
          const offered = (roll === 0) ? [7, 10] : (roll === 1) ? [7, 14] : [7, 10, 14];
          const hIdx = (wk.idx + gi + di) % d.hotels.length;
          const [hotelName, stars, cls] = d.hotels[hIdx];
          const pkgName = d.pkgNames[(wk.idx + gi) % d.pkgNames.length];
          const roomCat = ROOM_CATS[(wk.idx * 2 + gi) % ROOM_CATS.length];
          return {
            gateway: gw.g, gatewayCity: gw.c,
            durations: offered.map((dur) => {
              const p = pricing(rand, dur);
              const currentPrice = p.tc + p.cm;
              const recPrice     = p.tc + p.rm;
              const alloc = 40 + Math.round(rand() * 40);
              const lf    = 0.35 + rand() * 0.55;
              const sold  = Math.min(alloc, Math.round(alloc * lf));
              const pace  = PACES[Math.floor(rand() * PACES.length)];
              return {
                id: `PKG-${d.id}-W${wk.idx}-${gw.g}-${dur}N`,
                duration: dur,
                packageName: pkgName,
                hotel: hotelName,
                roomCategory: roomCat,
                flightNum: gw.fn,
                flightRoute: `${gw.g} → ${d.id === 'MID' ? 'CUN' : d.id}`,
                flightCategory: gw.fc,
                hotelClassification: cls,
                hotelStars: stars,
                totalCost: p.tc,
                currentPrice,
                currentMargin: p.cm,
                recPrice,
                recMargin: p.rm,
                deltaMargin: p.rm - p.cm,
                soldPackages: sold,
                allocPackages: alloc,
                bookingPace: pace,
                // Denormalised ancestor meta — keeps leaf-level filter / metric helpers simple.
                destId: d.id, destination: d.name, region: d.region,
                gateway: gw.g, gatewayCity: gw.c,
                checkInWeek: wk.label, checkInDate: wk.date, checkInWeekIdx: wk.idx,
              };
            }),
          };
        }),
      })),
    };
  });
})();


// ── Parameters page seed data ──────────────────────────────
// Autopilot rules — automatic price adjustments with guardrails
const AUTOPILOT_RULES = [
  {
    id: 'AR-001',
    name: 'Flight Yield Autopilot',
    appliesTo: 'Flight',
    scopeSummary: 'All Own Flight routes',
    scope: { allDestinations: true, destinations: [], categories: ['Own Flight'], hotelClassifications: [] },
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'LF %', operator: 'between', value: '70-85' },
    ],
    autoAcceptMinPct: -3,
    autoAcceptMaxPct: 5,
    autoAcceptMin$: -18,
    autoAcceptMax$: 30,
    minPriceChange$: 5,
    maxSingleChange$: 45,
    maxDailyChange$: 120,
    aboveRangeAction: 'Flag for review',
    belowRangeAction: 'Flag for review',
    flagThresholdPct: 8,
    flagThreshold$: 50,
    blockThresholdPct: 15,
    blockThreshold$: 120,
    autopilotOn: true,
    evaluationFrequency: 'Every evaluation run',
    status: 'Active',
    lastTriggered: '04/22/26 08:30',
    triggeredToday: 47,
    autoAcceptedToday: 32,
    pendingReview: 8,
    modifiedBy: 'Sarah Chen',
    modifiedAt: '04/18/26 14:22',
  },
  {
    id: 'AR-002',
    name: 'Flight Distressed Inventory',
    appliesTo: 'Flight',
    scopeSummary: 'All flight routes',
    scope: { allDestinations: true, destinations: [], categories: ['Own Flight', 'Risk Block', '3rd Party'], hotelClassifications: [] },
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'LF %', operator: '<', value: 55 },
      { metric: 'Days to Departure', operator: '<', value: 45 },
    ],
    autoAcceptMinPct: -8,
    autoAcceptMaxPct: 0,
    autoAcceptMin$: -45,
    autoAcceptMax$: 0,
    minPriceChange$: 5,
    maxSingleChange$: 60,
    maxDailyChange$: 140,
    aboveRangeAction: 'Block change',
    belowRangeAction: 'Flag for review',
    flagThresholdPct: 10,
    flagThreshold$: 60,
    blockThresholdPct: 18,
    blockThreshold$: 140,
    autopilotOn: true,
    evaluationFrequency: 'Hourly',
    status: 'Active',
    lastTriggered: '04/22/26 11:05',
    triggeredToday: 18,
    autoAcceptedToday: 15,
    pendingReview: 3,
    modifiedBy: 'Marcus Webb',
    modifiedAt: '04/16/26 10:40',
    destinations: ['Cancun', 'Los Cabos'],
  },
  {
    id: 'AR-003',
    name: 'Hotel Demand Response',
    appliesTo: 'Hotel',
    scopeSummary: 'Exclusive hotels, all destinations',
    scope: { allDestinations: true, destinations: [], categories: [], hotelClassifications: ['Exclusive'] },
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'Forecast Occ %', operator: '>', value: 75 },
    ],
    autoAcceptMinPct: 0,
    autoAcceptMaxPct: 6,
    autoAcceptMin$: 0,
    autoAcceptMax$: 22,
    minPriceChange$: 3,
    maxSingleChange$: 30,
    maxDailyChange$: 80,
    aboveRangeAction: 'Flag for review',
    belowRangeAction: 'Block change',
    flagThresholdPct: 7,
    flagThreshold$: 35,
    blockThresholdPct: 12,
    blockThreshold$: 70,
    autopilotOn: true,
    evaluationFrequency: 'Every evaluation run',
    status: 'Active',
    lastTriggered: '04/22/26 09:12',
    triggeredToday: 24,
    autoAcceptedToday: 19,
    pendingReview: 5,
    modifiedBy: 'Priya Patel',
    modifiedAt: '04/14/26 15:50',
  },
  {
    id: 'AR-004',
    name: 'Hotel Low Occ Protection',
    appliesTo: 'Hotel',
    scopeSummary: 'All hotels, last 30 days',
    scope: { allDestinations: true, destinations: [], categories: [], hotelClassifications: ['Exclusive', 'Commodity'] },
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'Occ %', operator: '<', value: 40 },
      { metric: 'Days to Check-in', operator: '<', value: 30 },
    ],
    autoAcceptMinPct: -6,
    autoAcceptMaxPct: 0,
    autoAcceptMin$: -22,
    autoAcceptMax$: 0,
    minPriceChange$: 2,
    maxSingleChange$: 25,
    maxDailyChange$: 60,
    aboveRangeAction: 'Block change',
    belowRangeAction: 'Flag for review',
    flagThresholdPct: 8,
    flagThreshold$: 30,
    blockThresholdPct: 14,
    blockThreshold$: 60,
    autopilotOn: true,
    evaluationFrequency: 'On booking surge',
    status: 'Active',
    lastTriggered: '04/22/26 07:48',
    triggeredToday: 12,
    autoAcceptedToday: 9,
    pendingReview: 2,
    modifiedBy: 'Jordan Kim',
    modifiedAt: '04/10/26 09:15',
    destinations: ['Punta Cana', 'Montego Bay'],
  },
  {
    id: 'AR-005',
    name: 'Package Margin Guard',
    appliesTo: 'Package',
    scopeSummary: 'All package inventory',
    scope: { allDestinations: true, destinations: [], categories: [], hotelClassifications: [] },
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'Margin %', operator: '<', value: 15 },
    ],
    autoAcceptMinPct: 0,
    autoAcceptMaxPct: 4,
    autoAcceptMin$: 0,
    autoAcceptMax$: 60,
    minPriceChange$: 10,
    maxSingleChange$: 40,
    maxDailyChange$: 100,
    aboveRangeAction: 'Flag for review',
    belowRangeAction: 'Block change',
    flagThresholdPct: 6,
    flagThreshold$: 60,
    blockThresholdPct: 10,
    blockThreshold$: 100,
    autopilotOn: false,
    evaluationFrequency: 'Daily',
    status: 'Paused',
    lastTriggered: '04/18/26 22:10',
    triggeredToday: 0,
    autoAcceptedToday: 0,
    pendingReview: 0,
    modifiedBy: 'David Okafor',
    modifiedAt: '04/19/26 11:05',
  },
  {
    id: 'AR-006',
    name: 'Competitor Price Match',
    appliesTo: 'Flight + Hotel',
    scopeSummary: 'All flight & hotel inventory',
    scope: { allDestinations: true, destinations: [], categories: ['Own Flight', 'Risk Block', '3rd Party'], hotelClassifications: ['Exclusive', 'Commodity'] },
    conditionLogic: 'ALL',
    conditions: [
      { metric: 'Competitor Delta $', operator: '<', value: -30 },
    ],
    autoAcceptMinPct: -4,
    autoAcceptMaxPct: 0,
    autoAcceptMin$: -30,
    autoAcceptMax$: 0,
    minPriceChange$: 5,
    maxSingleChange$: 35,
    maxDailyChange$: 90,
    aboveRangeAction: 'Block change',
    belowRangeAction: 'Flag for review',
    flagThresholdPct: 6,
    flagThreshold$: 40,
    blockThresholdPct: 10,
    blockThreshold$: 90,
    autopilotOn: true,
    evaluationFrequency: 'Hourly',
    status: 'Active',
    lastTriggered: '04/22/26 10:40',
    triggeredToday: 31,
    autoAcceptedToday: 26,
    pendingReview: 5,
    modifiedBy: 'Lisa Tran',
    modifiedAt: '04/20/26 16:30',
  },
];

const AUTOPILOT_METRIC_OPTIONS = [
  'LF %', 'Forecast LF %', 'Occ %', 'Forecast Occ %',
  'Days to Departure', 'Days to Check-in', 'Rate of Sale',
  'Margin $', 'Margin %', 'Competitor Delta $',
];
const AUTOPILOT_OPERATORS = ['>', '<', '=', '≥', '≤', 'between'];
const AUTOPILOT_FREQUENCIES = [
  'Every evaluation run', 'Hourly', 'Daily', 'On booking surge',
];
const AUTOPILOT_NOTIFY_TARGETS = ['RM', 'Director', 'All RMs', 'Email'];

// Alerts — fixed permanent rows, users just edit thresholds inline.
// template has N+1 string segments for N numeric inputs in `values`.
const FLIGHT_ALERTS = [
  { id: 'FA-001', name: 'Load Factor — Low',    template: ['Below ', '%'],                       values: [60],  severity: 'High',   active: true },
  { id: 'FA-002', name: 'Load Factor — High',   template: ['Above ', '%'],                       values: [92],  severity: 'Low',    active: true },
  { id: 'FA-003', name: 'LF Behind Forecast',   template: ['> ', '% below forecast'],             values: [10],  severity: 'Medium', active: true },
  { id: 'FA-004', name: 'Booking Pace — Slow',  template: ['Below ', '% of target'],              values: [50],  severity: 'High',   active: true },
  { id: 'FA-005', name: 'Booking Pace — Fast',  template: ['Above ', '% of target'],              values: [150], severity: 'Medium', active: true },
  { id: 'FA-006', name: 'No Recent Bookings',   template: ['0 bookings in ', ' days'],            values: [3],   severity: 'High',   active: true },
  { id: 'FA-007', name: 'Margin Below Floor',   template: ['Margin < $', ''],                    values: [30],  severity: 'High',   active: true },
  { id: 'FA-008', name: 'Margin % Below',       template: ['Margin % < ', '%'],                   values: [8],   severity: 'High',   active: true },
  { id: 'FA-009', name: 'Competitor Undercut',  template: ['Comp cheaper by > $', ''],           values: [20],  severity: 'Medium', active: true },
  { id: 'FA-010', name: 'Fare Below Minimum',   template: ['Fare < $', ''],                      values: [199], severity: 'High',   active: true },
];

const HOTEL_ALERTS = [
  { id: 'HA-001', name: 'Occupancy — Low',      template: ['Below ', '%'],                       values: [50],  severity: 'High',   active: true },
  { id: 'HA-002', name: 'Occupancy — High',     template: ['Above ', '%'],                       values: [90],  severity: 'Low',    active: true },
  { id: 'HA-003', name: 'Occ Behind Forecast',  template: ['> ', '% below forecast'],             values: [10],  severity: 'Medium', active: true },
  { id: 'HA-004', name: 'Booking Pace — Slow',  template: ['Below ', '% of target'],              values: [50],  severity: 'High',   active: true },
  { id: 'HA-005', name: 'Booking Pace — Fast',  template: ['Above ', '% of target'],              values: [150], severity: 'Medium', active: true },
  { id: 'HA-006', name: 'Supplier Cost Change', template: ['Change > $', ' or ', '%'],            values: [15, 8], severity: 'High', active: true },
  { id: 'HA-007', name: 'ADR Below Minimum',    template: ['ADR < $', ''],                       values: [89],  severity: 'High',   active: true },
  { id: 'HA-008', name: 'Margin % Below',       template: ['Margin % < ', '%'],                   values: [12],  severity: 'High',   active: true },
  { id: 'HA-009', name: 'Margin Erosion',       template: ['Margin dropped > $', ''],            values: [25],  severity: 'High',   active: true },
  { id: 'HA-010', name: 'No Recent Bookings',   template: ['0 bookings in ', ' days'],            values: [3],   severity: 'High',   active: true },
];

const ALERT_SEVERITIES = ['High', 'Medium', 'Low'];

// Length-of-stay pricing rules
const LOS_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LOS_DURATION_BUCKETS = ['3-4N', '5-6N', '7N', '8-10N', '11-14N', '15N+'];

const LOS_RULES = [
  {
    id: 'LOS-001',
    name: 'Caribbean 7-Night Base',
    appliesTo: 'Package',
    scope: 'Caribbean destinations',
    baseDuration: 7,
    dayModifiers: { Mon: -2, Tue: -3, Wed: -2, Thu: 0, Fri: 3, Sat: 5, Sun: 2 },
    durationAdj:  { '3-4N': -15, '5-6N': -8, '7N': 0, '8-10N': 5, '11-14N': 8, '15N+': 12 },
    status: 'Active',
    modifiedBy: 'Sarah Chen',
    modifiedAt: '04/12/26',
    destinations: ['Punta Cana', 'Montego Bay', 'Varadero'],
  },
  {
    id: 'LOS-002',
    name: 'Mexico Flight Only',
    appliesTo: 'Flight',
    scope: 'Mexico destinations',
    baseDuration: 7,
    dayModifiers: { Mon: -3, Tue: -4, Wed: -3, Thu: 0, Fri: 5, Sat: 8, Sun: 3 },
    durationAdj:  { '3-4N': null, '5-6N': null, '7N': null, '8-10N': null, '11-14N': null, '15N+': null },
    status: 'Active',
    modifiedBy: 'Marcus Webb',
    modifiedAt: '04/08/26',
    destinations: ['Cancun', 'Los Cabos'],
  },
  {
    id: 'LOS-003',
    name: 'Caribbean Hotel EXC',
    appliesTo: 'Hotel',
    scope: 'Caribbean, Exclusive only',
    baseDuration: 7,
    dayModifiers: { Mon: 0, Tue: -1, Wed: -1, Thu: 1, Fri: 4, Sat: 6, Sun: 3 },
    durationAdj:  { '3-4N': -10, '5-6N': -5, '7N': 0, '8-10N': 6, '11-14N': 10, '15N+': 15 },
    status: 'Active',
    modifiedBy: 'Priya Patel',
    modifiedAt: '04/15/26',
    destinations: ['Punta Cana', 'Montego Bay'],
  },
  {
    id: 'LOS-004',
    name: 'Peak Season Uplift',
    appliesTo: 'Package',
    scope: 'All destinations',
    baseDuration: 7,
    dayModifiers: { Mon: 0, Tue: 0, Wed: 0, Thu: 2, Fri: 8, Sat: 12, Sun: 5 },
    durationAdj:  { '3-4N': -5, '5-6N': -2, '7N': 0, '8-10N': 8, '11-14N': 12, '15N+': 18 },
    status: 'Active',
    modifiedBy: 'David Okafor',
    modifiedAt: '04/19/26',
  },
];

// Min / max stay rules per destination
const LOS_MINMAX = [
  { id: 'MS-001', destination: 'Cancun',        minNights: 3, maxNights: 21, blackout: 'None',            active: true  },
  { id: 'MS-002', destination: 'Punta Cana',    minNights: 5, maxNights: 21, blackout: '12/22 – 01/03',   active: true  },
  { id: 'MS-003', destination: 'Varadero',      minNights: 5, maxNights: 21, blackout: 'None',            active: true  },
  { id: 'MS-004', destination: 'Montego Bay',   minNights: 4, maxNights: 14, blackout: '12/22 – 01/03',   active: true  },
  { id: 'MS-005', destination: 'Riviera Maya',  minNights: 5, maxNights: 21, blackout: '02/12 – 02/18',   active: true  },
];

// ── Cost Change Alert Thresholds ───────────────────────────
const COST_CHANGE_THRESHOLDS = [
  { id: 'CC-TH-01', supplierType: 'Hotel (EXC)',       alert$: 15, alertPct: 8, autoReprice: true,  reviewAbove$: 30, notify: ['RM', 'Director'], active: true },
  { id: 'CC-TH-02', supplierType: 'Hotel (COM)',       alert$: 10, alertPct: 5, autoReprice: true,  reviewAbove$: 20, notify: ['RM'],             active: true, destinations: ['Cancun', 'Montego Bay'] },
  { id: 'CC-TH-03', supplierType: 'Flight (Own)',      alert$: 20, alertPct: 5, autoReprice: false, reviewAbove$: 0,  reviewAlways: true, notify: ['RM', 'Director'], active: true },
  { id: 'CC-TH-04', supplierType: 'Flight (Risk Block)', alert$: 15, alertPct: 4, autoReprice: true, reviewAbove$: 25, notify: ['RM'],             active: true, destinations: ['Varadero'] },
  { id: 'CC-TH-05', supplierType: 'Flight (3rd Party)',  alert$: 10, alertPct: 3, autoReprice: true, reviewAbove$: 15, notify: ['RM'],             active: true },
];

// ── Cost Change Log (recent supplier cost changes received) ──
const COST_CHANGE_LOG = [
  { id: 'CC-001', date: '04/22/26 10:14', supplier: 'Riu Cancun',                 type: 'Hotel (EXC)',       destination: 'Cancun',       oldCost: 164, newCost: 182, status: 'Pending',       marginImpact: -18 },
  { id: 'CC-002', date: '04/22/26 09:02', supplier: 'Iberostar Selection Varadero', type: 'Hotel (EXC)',     destination: 'Varadero',     oldCost: 142, newCost: 136, status: 'Auto-repriced', marginImpact:  +6 },
  { id: 'CC-003', date: '04/21/26 17:45', supplier: 'WestJet WS2401',             type: 'Flight (Own)',      destination: 'Cancun',       oldCost: 205, newCost: 224, status: 'Pending',       marginImpact: -19 },
  { id: 'CC-004', date: '04/21/26 14:30', supplier: 'Bahia Principe Luxury Ambar',type: 'Hotel (EXC)',       destination: 'Punta Cana',   oldCost: 178, newCost: 186, status: 'Auto-repriced', marginImpact:  -8 },
  { id: 'CC-005', date: '04/21/26 11:20', supplier: 'AC9821 Charter',             type: 'Flight (Risk Block)', destination: 'Cancun',     oldCost: 162, newCost: 175, status: 'Reviewed',      marginImpact: -13 },
  { id: 'CC-006', date: '04/20/26 16:08', supplier: 'Grand Velas Riviera Maya',   type: 'Hotel (EXC)',       destination: 'Riviera Maya', oldCost: 244, newCost: 218, status: 'Auto-repriced', marginImpact: +26 },
  { id: 'CC-007', date: '04/20/26 09:55', supplier: 'Oasis Cancun',               type: 'Hotel (COM)',       destination: 'Cancun',       oldCost:  89, newCost:  94, status: 'Auto-repriced', marginImpact:  -5 },
  { id: 'CC-008', date: '04/19/26 22:10', supplier: 'WS3201',                     type: 'Flight (Own)',      destination: 'Los Cabos',    oldCost: 218, newCost: 232, status: 'Pending',       marginImpact: -14 },
  { id: 'CC-009', date: '04/19/26 15:42', supplier: 'Sandos Caracol Eco Resort', type: 'Hotel (COM)',       destination: 'Riviera Maya', oldCost: 122, newCost: 128, status: 'Reviewed',      marginImpact:  -6 },
  { id: 'CC-010', date: '04/18/26 08:30', supplier: 'WG5701',                     type: 'Flight (3rd Party)', destination: 'Montego Bay', oldCost: 148, newCost: 152, status: 'Auto-repriced', marginImpact:  -4 },
];
COST_CHANGE_LOG.forEach(c => {
  c.changeAmt = c.newCost - c.oldCost;
  c.changePct = Math.round((c.changeAmt / c.oldCost) * 1000) / 10;
});

// ── Global Price Controls ──────────────────────────────────
const PRICE_CONTROLS = [
  { id: 'PC-01', appliesTo: 'Flight Economy',       minPrice:  199, maxPrice: 1499, maxSingleChange:  75, maxDailyChange: 150, active: true },
  { id: 'PC-02', appliesTo: 'Flight Business',      minPrice:  599, maxPrice: 4999, maxSingleChange: 200, maxDailyChange: 400, active: true },
  { id: 'PC-03', appliesTo: 'Hotel (EXC) / night',  minPrice:   99, maxPrice:  899, maxSingleChange:  50, maxDailyChange: 100, active: true },
  { id: 'PC-04', appliesTo: 'Hotel (COM) / night',  minPrice:   59, maxPrice:  499, maxSingleChange:  35, maxDailyChange:  75, active: true },
  { id: 'PC-05', appliesTo: 'Package 7N',           minPrice:  599, maxPrice: 4999, maxSingleChange: 150, maxDailyChange: 300, active: true, destinations: ['Cancun'] },
  { id: 'PC-06', appliesTo: 'Package 10N',          minPrice:  799, maxPrice: 6999, maxSingleChange: 200, maxDailyChange: 400, active: true },
  { id: 'PC-07', appliesTo: 'Package 14N',          minPrice:  999, maxPrice: 8999, maxSingleChange: 250, maxDailyChange: 500, active: true, destinations: ['Punta Cana'] },
];

// ── Global Margin Controls ─────────────────────────────────
const MARGIN_CONTROLS = [
  { id: 'MC-01', appliesTo: 'Flight Economy',       minMargin$:   30, maxMargin$:  400, minMarginPct:  8, maxSingleMarginChange$:  75, active: true },
  { id: 'MC-02', appliesTo: 'Flight Business',      minMargin$:  150, maxMargin$: 1200, minMarginPct: 10, maxSingleMarginChange$: 200, active: true },
  { id: 'MC-03', appliesTo: 'Hotel (EXC) / night',  minMargin$:   20, maxMargin$:  250, minMarginPct: 12, maxSingleMarginChange$:  50, active: true },
  { id: 'MC-04', appliesTo: 'Hotel (COM) / night',  minMargin$:   10, maxMargin$:  150, minMarginPct:  8, maxSingleMarginChange$:  35, active: true },
  { id: 'MC-05', appliesTo: 'Package',              minMargin$: -150, maxMargin$:  800, minMarginPct:  5, maxSingleMarginChange$: 200, active: true, destinations: ['Cancun'] },
];
// Ensure every rule has a destinations array (empty = global).
[AUTOPILOT_RULES, LOS_RULES, COST_CHANGE_THRESHOLDS, PRICE_CONTROLS, MARGIN_CONTROLS].forEach(arr => {
  arr.forEach(r => { if (!Array.isArray(r.destinations)) r.destinations = []; });
});

// ── Margin / Price Rollback Versions (named snapshots) ─────
const ROLLBACK_VERSIONS = [
  { id: 'RV-001', name: 'Pre-Easter Pricing',        timestamp: '03/28/26 18:00', changesCount: 412, description: 'Last snapshot before Easter week evaluation run.' },
  { id: 'RV-002', name: 'Post-Evaluation Apr 14',    timestamp: '04/14/26 23:15', changesCount: 287, description: 'Snapshot after the Apr 14 bulk evaluation push.' },
  { id: 'RV-003', name: 'Hurricane Season Adjustment', timestamp: '04/02/26 11:45', changesCount: 156, description: 'Caribbean inventory de-risked ahead of hurricane outlook.' },
  { id: 'RV-004', name: 'Pre-Spring Break Campaign', timestamp: '03/05/26 14:30', changesCount: 203, description: 'Baseline before Spring Break promotional window.' },
];

// ── Duration Mix — target % per destination (5 key dests) ──
const DURATION_TARGETS = [
  { destination: 'Cancun',       '3-4N':  8, '5-6N': 15, '7N': 45, '10N': 18, '14N': 10, '15N+':  4, actual: { '3-4N':  6, '5-6N': 17, '7N': 42, '10N': 20, '14N': 11, '15N+':  4 } },
  { destination: 'Punta Cana',   '3-4N':  5, '5-6N': 12, '7N': 50, '10N': 20, '14N': 10, '15N+':  3, actual: { '3-4N':  4, '5-6N': 10, '7N': 48, '10N': 22, '14N': 12, '15N+':  4 } },
  { destination: 'Varadero',     '3-4N':  6, '5-6N': 14, '7N': 48, '10N': 18, '14N': 10, '15N+':  4, actual: { '3-4N':  9, '5-6N': 18, '7N': 40, '10N': 18, '14N': 10, '15N+':  5 } },
  { destination: 'Montego Bay',  '3-4N':  4, '5-6N': 10, '7N': 52, '10N': 20, '14N': 10, '15N+':  4, actual: { '3-4N':  5, '5-6N': 11, '7N': 50, '10N': 19, '14N': 11, '15N+':  4 } },
  { destination: 'Riviera Maya', '3-4N':  6, '5-6N': 14, '7N': 46, '10N': 20, '14N': 10, '15N+':  4, actual: { '3-4N':  7, '5-6N': 14, '7N': 44, '10N': 22, '14N':  9, '15N+':  4 } },
];

// ── Duration Lock rules (period-based restrictions) ───────
const DURATION_LOCKS = [
  { id: 'DL-001', destination: 'Punta Cana',   from: '12/18/26', to: '01/06/27', allowed: ['7N', '10N', '14N'],       reason: 'Holiday peak — force longer stays', active: true  },
  { id: 'DL-002', destination: 'Cancun',       from: '03/15/26', to: '03/25/26', allowed: ['7N', '10N'],              reason: 'Spring break week — no short stays', active: true  },
  { id: 'DL-003', destination: 'Riviera Maya', from: '02/10/26', to: '02/18/26', allowed: ['5-6N', '7N', '10N', '14N'], reason: 'Reading week — minimum 5 nights', active: true  },
];

// ── Unsaleable inventory alert (simple shared config) ──────
const UNSALEABLE_ALERT = { thresholdPct: 5, active: true };

// ── Marketing activities ──────────────────────────────────
const MARKETING_ACTIVITIES = [
  {
    id: 'MA-001',
    name: 'Spring Break Caribbean Push',
    type: 'Email Campaign',
    priority: 'High',
    destinations: ['Cancun', 'Punta Cana', 'Varadero'],
    dateFrom: '03/01/26', dateTo: '03/31/26',
    searchBoost: true,
    pricingImpact: 'hold',
    priceFloor: null,
    notes: 'Feature in weekly newsletter; boost search ranking; maintain current pricing during window.',
    status: 'Active',
  },
  {
    id: 'MA-002',
    name: 'Easter Mexico Sale',
    type: 'Paid Search',
    priority: 'Medium',
    destinations: ['Cancun', 'Los Cabos', 'Riviera Maya'],
    dateFrom: '03/20/26', dateTo: '04/10/26',
    searchBoost: false,
    pricingImpact: 'floor',
    priceFloor: 1199,
    notes: 'Paid search push — enforce $1199 floor on 7N packages.',
    status: 'Scheduled',
  },
  {
    id: 'MA-003',
    name: 'Early Bird Summer Promo',
    type: 'Social Media',
    priority: 'High',
    destinations: ['Barcelona', 'Rome', 'Lisbon'],
    dateFrom: '02/15/26', dateTo: '04/15/26',
    searchBoost: true,
    pricingImpact: 'none',
    priceFloor: null,
    notes: 'Instagram + TikTok creative for summer Europe departures.',
    status: 'Active',
  },
  {
    id: 'MA-004',
    name: 'GDS Partner Weekend Deal',
    type: 'GDS Promotion',
    priority: 'Medium',
    destinations: ['Montego Bay', 'Nassau'],
    dateFrom: '04/15/26', dateTo: '04/28/26',
    searchBoost: false,
    pricingImpact: 'hold',
    priceFloor: null,
    notes: 'Sabre + Amadeus co-op promotion for Caribbean short-haul.',
    status: 'Active',
  },
  {
    id: 'MA-005',
    name: 'Hurricane Season Dynamic Offer',
    type: 'Partner Deal',
    priority: 'Low',
    destinations: ['Punta Cana', 'Varadero'],
    dateFrom: '08/01/26', dateTo: '10/31/26',
    searchBoost: true,
    pricingImpact: 'none',
    priceFloor: null,
    notes: 'Last-minute booking prompt with agency partners; no price floor.',
    status: 'Draft',
  },
];

const MARKETING_TYPES = ['Email Campaign', 'Social Media', 'Paid Search', 'GDS Promotion', 'Partner Deal', 'Other'];
const MARKETING_PRIORITIES = ['High', 'Medium', 'Low'];

// ── Fix Price reasons (shared dropdown options) ────────────
const FIX_REASONS = ['Marketing Promotion', 'Contractual Commitment', 'Group/Charter Block', 'Manual Override', 'Other'];

// ── Parameters page (Flight / Hotel / Package Rules trees) ──
// Each node carries an `overrides` object. Fields not in overrides
// inherit from the parent, recursing up to the tab's defaults.
const PARAMETERS_DATA = (() => {
  const flightDefaults = {
    autoOn: true, minAutoPct: -5, maxAutoPct: 5, maxSingle$: 75, maxDaily$: 150,
    minMargin$: 30, minMarginPct: 8, maxMarginChange$: 200,
    minPrice$: 199, maxPrice$: 1999, maxPriceChange$: 300,
    lfLowPct: 60, lfHighPct: 92, lfAlertSev: 'High', lfAlertOn: true,
    behindForecastPct: 10, forecastAlertSev: 'Medium', forecastAlertOn: true,
    marginBelow$: 30, marginBelowPct: 8, marginAlertSev: 'High', marginAlertOn: true,
  };
  const hotelDefaults = {
    autoOn: true, minAutoPct: -5, maxAutoPct: 5, maxSingle$: 40, maxDaily$: 80,
    minMargin$: 20, minMarginPct: 12, maxMarginChange$: 80,
    minPrice$: 89, maxPrice$: 599, maxPriceChange$: 100,
    lfLowPct: 50, lfHighPct: 90, lfAlertSev: 'High', lfAlertOn: true,
    behindForecastPct: 10, forecastAlertSev: 'Medium', forecastAlertOn: true,
    marginBelow$: 20, marginBelowPct: 12, marginAlertSev: 'High', marginAlertOn: true,
    losBaseDuration: '7N', losFriSatUplift: 5, losSunThuDiscount: -3,
    losMinNights: 3, losMaxNights: 21, losRecoveryPct: 85,
  };
  const packageDefaults = {
    autoOn: true, minAutoPct: -5, maxAutoPct: 5, maxSingle$: 150, maxDaily$: 300,
    minMargin$: 50, minMarginPct: 6, maxMarginChange$: 300,
    minPrice$: 599, maxPrice$: 4999, maxPriceChange$: 400,
    lfLowPct: 60, lfHighPct: 92, lfAlertSev: 'High', lfAlertOn: true,
    behindForecastPct: 10, forecastAlertSev: 'Medium', forecastAlertOn: true,
    marginBelow$: 50, marginBelowPct: 6, marginAlertSev: 'High', marginAlertOn: true,
    losBaseDuration: '7N', losFriSatUplift: 8, losSunThuDiscount: -5,
    losMinNights: 3, losMaxNights: 21, losRecoveryPct: 80,
  };

  // Helper: stub node with an empty overrides dictionary.
  const n = (id, name, extras = {}) => Object.assign({ id, name, overrides: {} }, extras);

  // ── Flight tree: Destination → Route → Cabin Class ──
  const flight = {
    defaults: flightDefaults,
    destinations: [
      { id: 'CUN', name: 'Cancun',       region: 'Mexico',    overrides: {},
        routes: [
          { id: 'WS2401', name: 'WS2401 · YYZ → CUN',  category: 'Own Flight', overrides: {},
            classes: [ n('eco', 'Economy'), n('biz', 'Business') ] },
          { id: 'WS2403', name: 'WS2403 · YVR → CUN',  category: 'Own Flight', overrides: {},
            classes: [ n('eco', 'Economy'), n('biz', 'Business') ] },
          { id: 'AC9821', name: 'AC9821 · YYZ → CUN',  category: 'Risk Block', overrides: { minAutoPct: -8, maxAutoPct: 3 },
            classes: [ n('eco', 'Economy') ] },
        ],
      },
      { id: 'PUJ', name: 'Punta Cana',   region: 'Caribbean', overrides: { minAutoPct: -4, maxAutoPct: 4, minMargin$: 40 },
        routes: [
          { id: 'WS2601', name: 'WS2601 · YYZ → PUJ', category: 'Own Flight', overrides: {},
            classes: [ n('eco', 'Economy'), n('biz', 'Business', { overrides: { minMargin$: 150 } }) ] },
          { id: 'WG5501', name: 'WG5501 · YWG → PUJ', category: 'Risk Block', overrides: {},
            classes: [ n('eco', 'Economy') ] },
        ],
      },
      { id: 'VRA', name: 'Varadero',     region: 'Caribbean', overrides: { minAutoPct: -4, maxAutoPct: 4, minMargin$: 40 },
        routes: [
          { id: 'WS2201', name: 'WS2201 · YYZ → VRA', category: 'Own Flight', overrides: {},
            classes: [ n('eco', 'Economy'), n('biz', 'Business') ] },
        ],
      },
      { id: 'MBJ', name: 'Montego Bay',  region: 'Caribbean', overrides: { minAutoPct: -4, maxAutoPct: 4, minMargin$: 40 },
        routes: [
          { id: 'WS2801', name: 'WS2801 · YYZ → MBJ', category: 'Own Flight', overrides: {},
            classes: [ n('eco', 'Economy'), n('biz', 'Business') ] },
          { id: 'WG5701', name: 'WG5701 · YHZ → MBJ', category: 'Risk Block', overrides: {},
            classes: [ n('eco', 'Economy') ] },
        ],
      },
      { id: 'SJD', name: 'Los Cabos',    region: 'Mexico',    overrides: {},
        routes: [
          { id: 'WS3001', name: 'WS3001 · YYZ → SJD', category: 'Own Flight', overrides: {},
            classes: [ n('eco', 'Economy'), n('biz', 'Business') ] },
        ],
      },
      { id: 'MID', name: 'Riviera Maya', region: 'Mexico',    overrides: {},
        routes: [
          { id: 'WS2501', name: 'WS2501 · YYZ → MID', category: 'Own Flight', overrides: {},
            classes: [ n('eco', 'Economy'), n('biz', 'Business') ] },
        ],
      },
    ],
  };

  // ── Hotel tree: Destination → Hotel → Room Category ──
  const hotel = {
    defaults: hotelDefaults,
    destinations: [
      { id: 'CUN', name: 'Cancun',       region: 'Mexico',    overrides: {},
        hotels: [
          { id: 'riu-cun',       name: 'Riu Cancun',            overrides: {},
            rooms: [ n('std', 'Standard'), n('dlx', 'Deluxe'), n('ocv', 'Ocean View') ] },
          { id: 'hyatt-ziva-cun', name: 'Hyatt Ziva Cancun',    overrides: { minMargin$: 60, maxAutoPct: 4 },
            rooms: [ n('dlx', 'Deluxe'), n('suite', 'Suite', { overrides: { minPrice$: 349 } }) ] },
        ],
      },
      { id: 'PUJ', name: 'Punta Cana',   region: 'Caribbean', overrides: { minAutoPct: -4, maxAutoPct: 4, minMargin$: 30 },
        hotels: [
          { id: 'bahia-ambar',  name: 'Bahia Principe Luxury Ambar', overrides: {},
            rooms: [ n('dlx', 'Deluxe'), n('suite', 'Suite') ] },
          { id: 'riu-pal-puj',  name: 'Riu Palace Punta Cana',  overrides: {},
            rooms: [ n('dlx', 'Deluxe'), n('ocv', 'Ocean View') ] },
        ],
      },
      { id: 'VRA', name: 'Varadero',     region: 'Caribbean', overrides: { minAutoPct: -4, maxAutoPct: 4 },
        hotels: [
          { id: 'iberostar-vra', name: 'Iberostar Selection Varadero', overrides: {},
            rooms: [ n('dlx', 'Deluxe'), n('suite', 'Suite') ] },
        ],
      },
      { id: 'MBJ', name: 'Montego Bay',  region: 'Caribbean', overrides: { minAutoPct: -4, maxAutoPct: 4 },
        hotels: [
          { id: 'sandals-mbj',  name: 'Sandals Montego Bay',   overrides: { minMargin$: 80, maxAutoPct: 3 },
            rooms: [ n('dlx', 'Deluxe'), n('suite', 'Suite', { overrides: { minMargin$: 120 } }) ] },
          { id: 'riu-mbj',      name: 'Riu Montego Bay',       overrides: {},
            rooms: [ n('std', 'Standard'), n('ocv', 'Ocean View') ] },
        ],
      },
      { id: 'SJD', name: 'Los Cabos',    region: 'Mexico',    overrides: {},
        hotels: [
          { id: 'pueblo-bonito-sjd', name: 'Pueblo Bonito Pacifica', overrides: {},
            rooms: [ n('dlx', 'Deluxe'), n('ocv', 'Ocean View') ] },
        ],
      },
    ],
  };

  // ── Package tree: Destination → Gateway → Package Type (7N / 10N / 14N) ──
  const pkgTypes = () => ([
    n('7N',  '7 Nights'),
    n('10N', '10 Nights'),
    n('14N', '14 Nights'),
  ]);
  const pkg = {
    defaults: packageDefaults,
    destinations: [
      { id: 'CUN', name: 'Cancun',       region: 'Mexico',    overrides: {},
        gateways: [
          { id: 'YYZ', name: 'Toronto (YYZ)',   overrides: {}, packages: pkgTypes() },
          { id: 'YVR', name: 'Vancouver (YVR)', overrides: {}, packages: pkgTypes() },
          { id: 'YWG', name: 'Winnipeg (YWG)',  overrides: { minAutoPct: -6, maxAutoPct: 4 }, packages: pkgTypes() },
        ],
      },
      { id: 'PUJ', name: 'Punta Cana',   region: 'Caribbean', overrides: { minAutoPct: -4, maxAutoPct: 4, minMargin$: 60 },
        gateways: [
          { id: 'YYZ', name: 'Toronto (YYZ)',   overrides: {}, packages: pkgTypes() },
          { id: 'YOW', name: 'Ottawa (YOW)',    overrides: {}, packages: pkgTypes() },
        ],
      },
      { id: 'VRA', name: 'Varadero',     region: 'Caribbean', overrides: { minAutoPct: -4, maxAutoPct: 4 },
        gateways: [
          { id: 'YYZ', name: 'Toronto (YYZ)',   overrides: {}, packages: pkgTypes() },
          { id: 'YHZ', name: 'Halifax (YHZ)',   overrides: {}, packages: pkgTypes() },
        ],
      },
      { id: 'MBJ', name: 'Montego Bay',  region: 'Caribbean', overrides: { minAutoPct: -4, maxAutoPct: 4, minMargin$: 70 },
        gateways: [
          { id: 'YYZ', name: 'Toronto (YYZ)',   overrides: {}, packages: [
            n('7N',  '7 Nights',  { overrides: { maxAutoPct: 3 } }),
            n('10N', '10 Nights'),
            n('14N', '14 Nights', { overrides: { losRecoveryPct: 90 } }),
          ]},
          { id: 'YYC', name: 'Calgary (YYC)',   overrides: {}, packages: pkgTypes() },
        ],
      },
      { id: 'MID', name: 'Riviera Maya', region: 'Mexico',    overrides: {},
        gateways: [
          { id: 'YYZ', name: 'Toronto (YYZ)',   overrides: {}, packages: pkgTypes() },
          { id: 'YVR', name: 'Vancouver (YVR)', overrides: {}, packages: pkgTypes() },
        ],
      },
      { id: 'SJD', name: 'Los Cabos',    region: 'Mexico',    overrides: {},
        gateways: [
          { id: 'YYZ', name: 'Toronto (YYZ)',   overrides: {}, packages: pkgTypes() },
          { id: 'YVR', name: 'Vancouver (YVR)', overrides: {}, packages: pkgTypes() },
        ],
      },
    ],
  };

  return { flight, hotel, package: pkg };
})();

// Field groups shared across all three parameter tabs (LOS only on hotel/package).
const PARAM_FIELD_GROUPS = [
  { key: 'autopilot', label: 'Autopilot',       color: '#0d9488', fields: [
      { key: 'autoOn',           label: 'Auto',        type: 'toggle' },
      { key: 'minAutoPct',       label: 'Min %',       type: 'pct' },
      { key: 'maxAutoPct',       label: 'Max %',       type: 'pct' },
      { key: 'maxSingle$',       label: 'Max Single',  type: 'dollar' },
      { key: 'maxDaily$',        label: 'Max Daily',   type: 'dollar' },
  ]},
  { key: 'margin',    label: 'Margin Controls', color: '#e8007d', fields: [
      { key: 'minMargin$',       label: 'Min $',       type: 'dollar' },
      { key: 'minMarginPct',     label: 'Min %',       type: 'pct' },
      { key: 'maxMarginChange$', label: 'Max Δ $',     type: 'dollar' },
  ]},
  { key: 'price',     label: 'Price Controls',  color: '#64748b', fields: [
      { key: 'minPrice$',        label: 'Min $',       type: 'dollar' },
      { key: 'maxPrice$',        label: 'Max $',       type: 'dollar' },
      { key: 'maxPriceChange$',  label: 'Max Δ $',     type: 'dollar' },
  ]},
  { key: 'lfAlert',   label: 'LF / Occ Alerts', color: '#f59e0b', fields: [
      { key: 'lfLowPct',         label: 'Low %',       type: 'pct' },
      { key: 'lfHighPct',        label: 'High %',      type: 'pct' },
      { key: 'lfAlertSev',       label: 'Severity',    type: 'sev' },
      { key: 'lfAlertOn',        label: 'Active',      type: 'toggle' },
  ]},
  { key: 'fcAlert',   label: 'Forecast Alerts', color: '#dc2626', fields: [
      { key: 'behindForecastPct',label: 'Behind %',    type: 'pct' },
      { key: 'forecastAlertSev', label: 'Severity',    type: 'sev' },
      { key: 'forecastAlertOn',  label: 'Active',      type: 'toggle' },
  ]},
  { key: 'mgAlert',   label: 'Margin Alerts',   color: '#b91c1c', fields: [
      { key: 'marginBelow$',     label: 'Below $',     type: 'dollar' },
      { key: 'marginBelowPct',   label: 'Below %',     type: 'pct' },
      { key: 'marginAlertSev',   label: 'Severity',    type: 'sev' },
      { key: 'marginAlertOn',    label: 'Active',      type: 'toggle' },
  ]},
  { key: 'los',       label: 'Length of Stay',  color: '#7c3aed', losOnly: true, fields: [
      { key: 'losBaseDuration',  label: 'Base',        type: 'enum', options: ['7N', '10N', '14N'] },
      { key: 'losFriSatUplift',  label: 'Fri-Sat +%',  type: 'pct' },
      { key: 'losSunThuDiscount',label: 'Sun-Thu %',   type: 'pct' },
      { key: 'losMinNights',     label: 'Min N',       type: 'int' },
      { key: 'losMaxNights',     label: 'Max N',       type: 'int' },
      { key: 'losRecoveryPct',   label: 'Recovery %',  type: 'pct' },
  ]},
];



