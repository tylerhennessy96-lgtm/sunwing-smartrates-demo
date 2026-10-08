(function (global) {
  'use strict';

  const STORAGE_KEY = 'dynamica.packageParameters.v1';

  const DEFAULT_ALERTS = {
    enabled: true,
    outFcstMin: 75,
    retFcstMin: 75,
    hotelFcstMin: 20,
    marginDeltaMin: 0,
    costChangeMin: 0,
    pickupDailyMax: 7,
  };

  const DEFAULT_PRICE = {
    minPrice: 0,
    maxPrice: 9999,
    minMargin: 0,
    maxMargin: 9999,
  };

  const DEFAULT_RULES = {
    enabled: true,
    startDate: '',
    endDate: '',
    flightCategory: 'Any',
    hotelClassification: 'Any',
    commitment: 'Any',
    conditionMetric: 'LF %',
    conditionOperator: '>=',
    conditionValue: 80,
    actionType: 'Increase margin by $',
    actionValue: 10,
    maxChange: 50,
    minMargin: 0,
    maxMargin: 9999,
    lockPrice: false,
    reviewChangeOver: 50,
    priority: 50,
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function blankState() {
    return {
      alerts: {
        defaults: clone(DEFAULT_ALERTS),
        regions: {},
        destinations: {},
      },
      price: {
        defaults: clone(DEFAULT_PRICE),
        regions: {},
        destinations: {},
        dates: {},
        hotels: {},
      },
      rules: {
        defaults: clone(DEFAULT_RULES),
        regions: {},
        destinations: {},
        dates: {},
        hotels: {},
      },
    };
  }

  function keyPart(value) {
    return String(value == null ? '' : value).trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function composeKey(parts) {
    return (parts || []).map(keyPart).join('||');
  }

  function keysForPackage(pkg) {
    const region = pkg && pkg.region;
    const destination = pkg && pkg.destination;
    const departure = pkg && pkg.departureDate;
    const returning = pkg && pkg.returnDate;
    const duration = pkg && pkg.duration;
    const hotel = pkg && pkg.hotel;
    return {
      region: composeKey([region]),
      destination: composeKey([region, destination]),
      date: composeKey([region, destination, departure, returning, duration]),
      hotel: composeKey([region, destination, departure, returning, duration, hotel]),
    };
  }

  function migrateArea(area, defaults, buckets) {
    area = area || {};
    const next = { defaults: Object.assign(clone(defaults), area.defaults || {}) };
    (buckets || []).forEach(bucket => {
      next[bucket] = Object.assign({}, area[bucket] || {});
    });
    return next;
  }

  function normalizeState(state) {
    state = state || {};
    return {
      alerts: migrateArea(state.alerts, DEFAULT_ALERTS, ['regions', 'destinations']),
      price: migrateArea(state.price, DEFAULT_PRICE, ['regions', 'destinations', 'dates', 'hotels']),
      rules: migrateArea(state.rules, DEFAULT_RULES, ['regions', 'destinations', 'dates', 'hotels']),
    };
  }

  function load() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      return normalizeState(raw ? JSON.parse(raw) : blankState());
    } catch (err) {
      console.warn('[package-parameters] using defaults; stored config could not be read:', err);
      return blankState();
    }
  }

  function save(state) {
    const normalized = normalizeState(state);
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
    } catch (err) {
      console.warn('[package-parameters] config could not be saved:', err);
    }
    return normalized;
  }

  function mergeDefined(base, override) {
    const next = Object.assign({}, base);
    Object.keys(override || {}).forEach(key => {
      if (override[key] !== undefined) next[key] = override[key];
    });
    return next;
  }

  function effectiveAlerts(state, pkg) {
    state = normalizeState(state);
    const keys = keysForPackage(pkg || {});
    return mergeDefined(
      mergeDefined(state.alerts.defaults, state.alerts.regions[keys.region]),
      state.alerts.destinations[keys.destination]
    );
  }

  function effectivePrice(state, pkg) {
    state = normalizeState(state);
    const keys = keysForPackage(pkg || {});
    return mergeDefined(
      mergeDefined(
        mergeDefined(
          mergeDefined(state.price.defaults, state.price.regions[keys.region]),
          state.price.destinations[keys.destination]
        ),
        state.price.dates[keys.date]
      ),
      state.price.hotels[keys.hotel]
    );
  }

  function effectiveRules(state, pkg) {
    state = normalizeState(state);
    const keys = keysForPackage(pkg || {});
    return mergeDefined(
      mergeDefined(
        mergeDefined(
          mergeDefined(state.rules.defaults, state.rules.regions[keys.region]),
          state.rules.destinations[keys.destination]
        ),
        state.rules.dates[keys.date]
      ),
      state.rules.hotels[keys.hotel]
    );
  }

  function metricValue(metrics, key) {
    const value = metrics && metrics[key];
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function evaluateAlerts(pkg, metrics, state) {
    const cfg = effectiveAlerts(state, pkg);
    if (!cfg.enabled) return [];
    const alerts = [];
    const out = metricValue(metrics, 'outboundForecast');
    const ret = metricValue(metrics, 'returnForecast');
    const hotel = metricValue(metrics, 'hotelForecast');
    const margin = metricValue(metrics, 'marginDelta');
    const costChange = metricValue(metrics, 'costChange');
    const pickupDaily = metricValue(metrics, 'pickupDaily');
    if (out != null && out * 100 < Number(cfg.outFcstMin)) {
      alerts.push({ key: 'OUT', label: 'OUT', title: `OUT FCST below ${cfg.outFcstMin}%` });
    }
    if (ret != null && ret * 100 < Number(cfg.retFcstMin)) {
      alerts.push({ key: 'RET', label: 'RET', title: `RET FCST below ${cfg.retFcstMin}%` });
    }
    if (hotel != null && hotel < Number(cfg.hotelFcstMin)) {
      alerts.push({ key: 'HOTEL', label: 'HOTEL', title: `HOTEL FCST below ${cfg.hotelFcstMin}` });
    }
    if (margin != null && margin < Number(cfg.marginDeltaMin)) {
      alerts.push({ key: 'MARGIN', label: 'MARGIN', title: `MARGIN DELTA below $${cfg.marginDeltaMin}` });
    }
    if (costChange != null && Math.abs(costChange) >= Number(cfg.costChangeMin)) {
      alerts.push({ key: 'COST', label: 'COST', title: `Cost change at least $${cfg.costChangeMin}` });
    }
    if (pickupDaily != null && pickupDaily > Number(cfg.pickupDailyMax)) {
      alerts.push({ key: 'PACE', label: 'PACE', title: `Pickup pace above ${cfg.pickupDailyMax} bookings/day` });
    }
    return alerts;
  }

  function metricClass(kind, value, pkg, state) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '';
    const cfg = effectiveAlerts(state, pkg);
    if (!cfg.enabled) return '';

    if (kind === 'outboundForecast') {
      const pct = n * 100;
      if (pct < Number(cfg.outFcstMin)) return 'pkg-metric-bad';
      if (pct < Number(cfg.outFcstMin) + 5) return 'pkg-metric-warn';
      return 'pkg-metric-good';
    }
    if (kind === 'returnForecast') {
      const pct = n * 100;
      if (pct < Number(cfg.retFcstMin)) return 'pkg-metric-bad';
      if (pct < Number(cfg.retFcstMin) + 5) return 'pkg-metric-warn';
      return 'pkg-metric-good';
    }
    if (kind === 'hotelForecast') {
      if (n < Number(cfg.hotelFcstMin)) return 'pkg-metric-bad';
      if (n < Number(cfg.hotelFcstMin) + 5) return 'pkg-metric-warn';
      return 'pkg-metric-good';
    }
    if (kind === 'marginDelta') {
      if (n < Number(cfg.marginDeltaMin)) return 'pkg-metric-bad';
      if (n < 0) return 'pkg-metric-warn';
      return 'pkg-metric-good';
    }
    return '';
  }

  global.PackageParameters = {
    STORAGE_KEY,
    DEFAULT_ALERTS,
    DEFAULT_PRICE,
    DEFAULT_RULES,
    blankState,
    composeKey,
    keysForPackage,
    normalizeState,
    load,
    save,
    effectiveAlerts,
    effectivePrice,
    effectiveRules,
    evaluateAlerts,
    metricClass,
  };
})(window);
