const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'data', name), 'utf8');
const Papa = require(path.join(root, 'data', 'vendor', 'papaparse.min.js'));

async function testFlightCoverage() {
  const context = {
    console, Papa,
    fetch: async url => ({ ok: true, text: async () => read(path.basename(url)) }),
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read('data.js'), context);
  vm.runInContext(read('data-loader.js'), context);
  const rows = await context.DataLoader.loadFlightRows();
  const tree = context.DataLoader.buildFlightData(rows);
  const dates = Array.from(tree.destinations).flatMap(d => Array.from(d.routes)
    .flatMap(r => Array.from(r.dates).flatMap(context.flightDays)));
  assert.equal(dates.length, rows.length, 'Every CSV departure must survive grouping');
  assert.deepEqual(dates.map(d => d.id).sort(), Array.from(rows, r => String(r.flight_date_id)).sort());
  assert.equal(tree.destinations.reduce((n, d) => n + d.totalFlights, 0), rows.length);
  assert.equal(tree.destinations.reduce((n, d) => n + d.totalCapacity, 0),
    rows.reduce((n, r) => n + Number(r.capacity_total), 0));
  context.__testRows = rows;
  vm.runInContext('DataLoader.applyToGlobals([], __testRows, [])', context);
  dates.forEach(d => assert.equal(context.getFlightDateById(d.id).date.id, d.id));

  const sample = Object.assign({}, rows[0], {
    route_id: 'TEST', destination_id: 'PUJ', week_start: '2026-06-07',
  });
  const input = [
    { flight_date_id: 'C', departure_date: '2026-06-12', capacity_total: 150, sold_total: 105, current_lf_pct: 70 },
    { flight_date_id: 'A', departure_date: '2026-06-08', capacity_total: 100, sold_total: 40, current_lf_pct: 40 },
    { flight_date_id: 'B', departure_date: '2026-06-09', capacity_total: 200, sold_total: 120, current_lf_pct: 60 },
    { flight_date_id: 'D', route_id: 'SPARSE', departure_date: '2026-06-16', week_start: '2026-06-14' },
  ].map(r => Object.assign({}, sample, r));
  const grouped = context.DataLoader.buildFlightData(input);
  const routes = grouped.destinations[0].routes;
  const week = routes.find(r => r.id === 'TEST').dates[0];
  assert.deepEqual(Array.from(week.days, d => d.id), ['A', 'B', 'C']);
  assert.equal(week.capacity, 450);
  assert.equal(week.sold, 265);
  assert.ok(Math.abs(week.currentLF - 265 / 450) < 1e-12);
  assert.equal(routes.find(r => r.id === 'SPARSE').dates[0], null);
  assert.equal(routes.find(r => r.id === 'SPARSE').dates[1].id, 'D');
  console.log(`PASS: all ${rows.length} flight dates, totals, daily lookups, and sparse weekly grouping`);
}

function testChartPoints() {
  const arcs = [], fills = [], strokes = [];
  const ctx = {
    setTransform() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {},
    closePath() {}, fillRect() {}, fillText() {}, setLineDash() {}, save() {}, restore() {},
    measureText: text => ({ width: String(text).length * 6 }),
    arc: (x, y, radius) => arcs.push({ x, y, radius }),
    fill() { fills.push(this.fillStyle); },
    stroke() { strokes.push(this.strokeStyle); },
  };
  const canvas = {
    parentNode: { nodeType: 1, clientWidth: 640, clientHeight: 240 },
    style: {}, getContext: () => ctx,
    getBoundingClientRect: () => ({ width: 640, height: 240 }),
  };
  const context = { window: { devicePixelRatio: 1, addEventListener() {}, removeEventListener() {} } };
  vm.createContext(context);
  vm.runInContext(read('chart.local.js'), context);
  new context.window.Chart(canvas, {
    data: {
      labels: [0, 1, 2, 3],
      datasets: [{
        data: [10, null, 20, 30], showLine: false, borderColor: '#f5a623',
        pointRadius: [5, 5, 0, 4],
        pointBackgroundColor: ['#f5a623', '#f5a623', '#f5a623', '#ff9900'],
      }],
    },
  });
  assert.deepEqual(arcs.map(p => p.radius), [5, 4], 'Skip null points and zero-radius markers');
  assert.deepEqual(fills, ['#f5a623', '#ff9900']);
  assert.ok(!strokes.includes('#f5a623'), 'A marker-only dataset must not draw connecting lines');
  arcs.length = 0;
  new context.window.Chart(canvas, {
    data: { labels: [0, 1], datasets: [{ data: [10, 20], pointRadius: 2 }] },
  });
  assert.deepEqual(arcs.map(p => p.radius), [2, 2]);
  console.log('PASS: scalar/array point radii, per-point colors, null points, and marker-only datasets');
}

testFlightCoverage().then(testChartPoints).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
