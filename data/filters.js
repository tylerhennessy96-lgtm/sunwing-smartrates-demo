// ── Sunwing RMS shared filter components ────────────────────
// Multi-select dropdown + week-range picker, all vanilla JS.
// Used by pricing.html, hotel.html, flight.html.
(function (global) {
  const F = {};

  // ── helpers ─────────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
  function setLabelText(wrap, text) {
    const el = wrap.querySelector('button .ms-label, button .date-range-text, button span');
    if (el) el.textContent = text;
  }

  // ── Multi-select dropdown ───────────────────────────────────
  const msState = {}; // wrapId → { values, selected:Set, defaultLabel, onChange }

  function msLabel(wrapId) {
    const s = msState[wrapId];
    if (!s) return '';
    const n = s.selected.size;
    if (n === 0) return s.defaultLabel;
    if (n === 1) return Array.from(s.selected)[0];
    // "All Regions" → "Regions"
    const root = s.defaultLabel.replace(/^All\s+/i, '');
    return `${root} (${n})`;
  }

  function msBuildSkeleton(wrapId) {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return null;
    const dropdown = wrap.querySelector('.ms-dropdown');
    if (!dropdown) return null;
    if (!dropdown.querySelector('.ms-search')) {
      dropdown.innerHTML = `
        <div class="ms-search"><input type="text" placeholder="Search…" /></div>
        <div class="ms-actions">
          <a href="#" data-action="all">Select all</a>
          <a href="#" data-action="clear">Clear</a>
        </div>
        <div class="ms-options"></div>
      `;
      const searchEl = dropdown.querySelector('.ms-search input');
      searchEl.addEventListener('input', () => msRenderOptions(wrapId));
      searchEl.addEventListener('click', e => e.stopPropagation());
      dropdown.querySelector('[data-action="all"]').addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const s = msState[wrapId];
        s.values.forEach(v => s.selected.add(v));
        msRenderOptions(wrapId);
        msApplyLabel(wrapId);
        if (s.onChange) s.onChange(F.getSelected(wrapId));
      });
      dropdown.querySelector('[data-action="clear"]').addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const s = msState[wrapId];
        s.selected.clear();
        msRenderOptions(wrapId);
        msApplyLabel(wrapId);
        if (s.onChange) s.onChange(F.getSelected(wrapId));
      });
    }
    return dropdown;
  }

  function msApplyLabel(wrapId) {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return;
    setLabelText(wrap, msLabel(wrapId));
    const s = msState[wrapId];
    if (s && s.selected.size > 0) wrap.classList.add('has-selection');
    else wrap.classList.remove('has-selection');
  }

  function msRenderOptions(wrapId) {
    const s = msState[wrapId];
    const wrap = document.getElementById(wrapId);
    if (!s || !wrap) return;
    const dropdown = wrap.querySelector('.ms-dropdown');
    const searchEl = dropdown.querySelector('.ms-search input');
    const search = (searchEl ? searchEl.value : '').toLowerCase().trim();
    const optsContainer = dropdown.querySelector('.ms-options');
    const filtered = search
      ? s.values.filter(v => v.toLowerCase().includes(search))
      : s.values;
    if (!filtered.length) {
      optsContainer.innerHTML = '<div class="ms-empty">No matches</div>';
      return;
    }
    optsContainer.innerHTML = filtered.map(v => `
      <label class="ms-option">
        <input type="checkbox" data-value="${escapeHtml(v)}" ${s.selected.has(v) ? 'checked' : ''} />
        <span>${escapeHtml(v)}</span>
      </label>
    `).join('');
    optsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        e.stopPropagation();
        const v = cb.dataset.value;
        if (cb.checked) s.selected.add(v); else s.selected.delete(v);
        msApplyLabel(wrapId);
        if (s.onChange) s.onChange(F.getSelected(wrapId));
      });
    });
  }

  F.initMultiSelect = function (wrapId, values, opts) {
    opts = opts || {};
    msState[wrapId] = {
      values: Array.isArray(values) ? values.slice() : [],
      selected: new Set(),
      defaultLabel: opts.defaultLabel || 'All',
      onChange: opts.onChange || null,
    };
    if (!msBuildSkeleton(wrapId)) return;
    msRenderOptions(wrapId);
    msApplyLabel(wrapId);
  };

  F.setMultiSelectValues = function (wrapId, values) {
    const s = msState[wrapId];
    if (!s) return;
    s.values = values.slice();
    // Drop any selected entries no longer in values
    s.selected = new Set(Array.from(s.selected).filter(v => values.includes(v)));
    msRenderOptions(wrapId);
    msApplyLabel(wrapId);
  };

  F.getSelected = function (wrapId) {
    return msState[wrapId] ? Array.from(msState[wrapId].selected) : [];
  };

  // ── Week range picker ───────────────────────────────────────
  const wpState = {}; // wrapId → { viewMonth:Date, startWeek:Date|null, endWeek:Date|null, ... }
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function getMonday(d) {
    const m = new Date(d);
    const day = m.getDay();             // 0 = Sun
    const offset = day === 0 ? -6 : 1 - day;
    m.setDate(m.getDate() + offset);
    m.setHours(0, 0, 0, 0);
    return m;
  }
  function fmtWeek(d) {
    return `Wk ${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
  }
  function parseMMDDYY(s) {
    if (!s) return null;
    const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (!m) return null;
    return new Date(2000 + Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  }
  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function weekInRange(s, wkStart) {
    if (!s.startWeek) return false;
    const t = wkStart.getTime();
    const lo = s.endWeek ? Math.min(s.startWeek.getTime(), s.endWeek.getTime()) : s.startWeek.getTime();
    const hi = s.endWeek ? Math.max(s.startWeek.getTime(), s.endWeek.getTime()) : s.startWeek.getTime();
    return t >= lo && t <= hi;
  }

  function wpBuildSkeleton(wrapId) {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return null;
    const popover = wrap.querySelector('.date-pill-popover');
    if (!popover) return null;
    if (!popover.querySelector('.wp-grid')) {
      popover.innerHTML = `
        <div class="wp-header">
          <button type="button" class="wp-nav" data-nav="prev" aria-label="Previous month">‹</button>
          <span class="wp-title"></span>
          <button type="button" class="wp-nav" data-nav="next" aria-label="Next month">›</button>
        </div>
        <div class="wp-dow">
          <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
        </div>
        <div class="wp-grid"></div>
        <div class="wp-footer">
          <a href="#" class="wp-clear">Clear</a>
        </div>
      `;
      popover.addEventListener('click', e => e.stopPropagation());
      popover.querySelector('[data-nav="prev"]').addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const s = wpState[wrapId];
        s.viewMonth.setMonth(s.viewMonth.getMonth() - 1);
        wpRenderGrid(wrapId);
      });
      popover.querySelector('[data-nav="next"]').addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const s = wpState[wrapId];
        s.viewMonth.setMonth(s.viewMonth.getMonth() + 1);
        wpRenderGrid(wrapId);
      });
      popover.querySelector('.wp-clear').addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const s = wpState[wrapId];
        s.startWeek = null; s.endWeek = null;
        wpRenderGrid(wrapId);
        wpApplyLabel(wrapId);
        if (s.onChange) s.onChange(null);
      });
    }
    return popover;
  }

  function wpRenderGrid(wrapId) {
    const s = wpState[wrapId];
    const wrap = document.getElementById(wrapId);
    if (!s || !wrap) return;
    const popover = wrap.querySelector('.date-pill-popover');
    popover.querySelector('.wp-title').textContent =
      `${MONTHS[s.viewMonth.getMonth()]} ${s.viewMonth.getFullYear()}`;

    // Build 6 week rows starting from the Monday of the week containing the 1st of the month
    const monthStart = new Date(s.viewMonth.getFullYear(), s.viewMonth.getMonth(), 1);
    let cursor = getMonday(monthStart);
    const grid = popover.querySelector('.wp-grid');
    let html = '';
    for (let i = 0; i < 6; i++) {
      const wkStart = new Date(cursor);
      const inRange = weekInRange(s, wkStart);
      const cellsHtml = Array.from({ length: 7 }, (_, j) => {
        const d = new Date(wkStart);
        d.setDate(wkStart.getDate() + j);
        const cls = d.getMonth() !== s.viewMonth.getMonth() ? 'other-month' : '';
        return `<span class="${cls}">${d.getDate()}</span>`;
      }).join('');
      html += `<div class="wp-week ${inRange ? 'selected' : ''}" data-week="${wkStart.toISOString()}">${cellsHtml}</div>`;
      cursor = new Date(cursor);
      cursor.setDate(cursor.getDate() + 7);
    }
    grid.innerHTML = html;
    grid.querySelectorAll('.wp-week').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const wkStart = new Date(el.dataset.week);
        wpHandleClick(wrapId, wkStart);
      });
    });
  }

  function wpHandleClick(wrapId, wkStart) {
    const s = wpState[wrapId];
    if (!s.startWeek || (s.startWeek && s.endWeek)) {
      s.startWeek = wkStart;
      s.endWeek = null;
    } else {
      if (wkStart.getTime() < s.startWeek.getTime()) {
        s.endWeek = s.startWeek;
        s.startWeek = wkStart;
      } else if (isSameDay(wkStart, s.startWeek)) {
        // Clicking the same week again — leave as single-week selection
        s.endWeek = null;
      } else {
        s.endWeek = wkStart;
      }
    }
    wpRenderGrid(wrapId);
    wpApplyLabel(wrapId);
    if (s.onChange) s.onChange({ start: s.startWeek, end: s.endWeek });
  }

  function wpApplyLabel(wrapId) {
    const s = wpState[wrapId];
    const wrap = document.getElementById(wrapId);
    if (!s || !wrap) return;
    const labelEl = wrap.querySelector('.date-range-text');
    if (labelEl) {
      if (!s.startWeek) {
        labelEl.textContent = s.defaultLabel;
      } else if (!s.endWeek) {
        labelEl.textContent = fmtWeek(s.startWeek);
      } else {
        labelEl.textContent = `${fmtWeek(s.startWeek)} - ${fmtWeek(s.endWeek)}`;
      }
    }
    if (s.startWeek) wrap.classList.add('has-selection');
    else wrap.classList.remove('has-selection');
  }

  F.initWeekPicker = function (wrapId, opts) {
    opts = opts || {};
    const start = opts.initialDate ? new Date(opts.initialDate) : new Date();
    start.setDate(1);
    wpState[wrapId] = {
      viewMonth: start,
      startWeek: null,
      endWeek: null,
      defaultLabel: opts.defaultLabel || 'Select dates',
      onChange: opts.onChange || null,
    };
    if (!wpBuildSkeleton(wrapId)) return;
    wpRenderGrid(wrapId);
    wpApplyLabel(wrapId);
  };

  F.getWeekRange = function (wrapId) {
    const s = wpState[wrapId];
    if (!s || !s.startWeek) return null;
    return { start: s.startWeek, end: s.endWeek };
  };

  // ── Convenience: standard filter bar setup ──────────────────
  // Wires the Brand / Region / Destination / Dates / RM dropdowns.
  // Region cascades into Destination.
  // opts.onAnyChange(activeFilters) is fired whenever any filter value changes.
  F.populateStandard = function (opts) {
    opts = opts || {};
    if (typeof BRANDS === 'undefined' || typeof DESTINATIONS === 'undefined' || typeof REVENUE_MANAGERS === 'undefined') {
      return;
    }
    const REGION_LIST = ['Caribbean', 'Mexico', 'Central America', 'Europe', 'Sun & Sand'];
    const destNames = (regionSel) => {
      const list = (!regionSel || regionSel.length === 0)
        ? DESTINATIONS
        : DESTINATIONS.filter(d => regionSel.includes(d.region));
      return list.map(d => d.name);
    };
    const fire = () => { if (opts.onAnyChange) opts.onAnyChange(F.getActiveFilters()); };

    F.initMultiSelect('fBrand', BRANDS.slice(), {
      defaultLabel: 'All Brands',
      onChange: fire,
    });
    F.initMultiSelect('fRegion', REGION_LIST, {
      defaultLabel: 'All Regions',
      onChange: (sel) => {
        F.setMultiSelectValues('fDestination', destNames(sel));
        fire();
      },
    });
    F.initMultiSelect('fDestination', destNames([]), {
      defaultLabel: 'All Destinations',
      onChange: fire,
    });

    // RM list excludes the leading 'All RMs' marker
    const rms = REVENUE_MANAGERS.filter(r => r !== 'All RMs');
    F.initMultiSelect('fRM', rms, {
      defaultLabel: 'All RMs',
      onChange: fire,
    });

    const initialWeek = (typeof CHECK_IN_WEEKS !== 'undefined' && CHECK_IN_WEEKS[0])
      ? parseMMDDYY(CHECK_IN_WEEKS[0].weekStart)
      : null;
    F.initWeekPicker('fDates', {
      defaultLabel: 'Select weeks',
      initialDate: initialWeek,
      onChange: fire,
    });
  };

  // Snapshot of the current header-filter selections.
  F.getActiveFilters = function () {
    return {
      brand:       F.getSelected('fBrand'),
      region:      F.getSelected('fRegion'),
      destination: F.getSelected('fDestination'),
      rm:          F.getSelected('fRM'),
      dates:       F.getWeekRange('fDates'),
    };
  };

  // Active filter count — useful for badges
  F.activeFilterCount = function () {
    const a = F.getActiveFilters();
    let n = 0;
    if (a.brand.length)       n++;
    if (a.region.length)      n++;
    if (a.destination.length) n++;
    if (a.rm.length)          n++;
    if (a.dates && a.dates.start) n++;
    return n;
  };

  // ── Dual-handle range slider ────────────────────────────────
  // Markup expected:
  //   <div class="dr-wrap">
  //     <div class="dr-track"></div>
  //     <div class="dr-fill"></div>
  //     <input type="range" class="dr-min" min=".." max=".." value="..">
  //     <input type="range" class="dr-max" min=".." max=".." value="..">
  //   </div>
  //   <div class="adv-range-vals"><span class="dr-min-val">..</span> — <span class="dr-max-val">..</span></div>
  F.initDualRange = function (wrap, opts) {
    opts = opts || {};
    const min = wrap.querySelector('.dr-min');
    const max = wrap.querySelector('.dr-max');
    const fill = wrap.querySelector('.dr-fill');
    // Labels live in a sibling .adv-range-vals or in a sibling element passed via opts.labels
    const labels = opts.labels || (wrap.parentNode ? wrap.parentNode.querySelector('.adv-range-vals') : null);
    const minLabel = labels ? labels.querySelector('.dr-min-val') : null;
    const maxLabel = labels ? labels.querySelector('.dr-max-val') : null;
    const fmt = opts.format || (v => String(v));

    function update(emit) {
      let lo = +min.value, hi = +max.value;
      const lim = +max.min;
      const ceil = +max.max;
      // Enforce min ≤ max by pushing whichever handle the user moved
      if (lo > hi) {
        // Determine which input changed last using event target — fallback: clamp lo
        // Simpler: clamp the min to hi - 1 (or hi)
        lo = hi;
        min.value = lo;
      }
      const total = ceil - lim || 1;
      const lpct = ((lo - lim) / total) * 100;
      const hpct = ((hi - lim) / total) * 100;
      if (fill) {
        fill.style.left  = lpct + '%';
        fill.style.width = (hpct - lpct) + '%';
      }
      if (minLabel) minLabel.textContent = fmt(lo);
      if (maxLabel) maxLabel.textContent = fmt(hi);
      if (emit && opts.onChange) opts.onChange({ min: lo, max: hi });
    }
    min.addEventListener('input', () => update(true));
    max.addEventListener('input', () => update(true));
    update(false);

    return {
      get: () => ({ min: +min.value, max: +max.value }),
      set: (lo, hi) => { min.value = lo; max.value = hi; update(false); },
      reset: () => { min.value = min.min; max.value = max.max; update(true); },
      isDefault: () => +min.value === +min.min && +max.value === +max.max,
    };
  };

  global.Filters = F;
})(window);
