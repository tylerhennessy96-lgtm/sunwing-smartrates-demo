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

  // ── Multi-select pill + popover ─────────────────────────────
  // Styling/mechanics shared with the Fizz & Adisseo demos: a rounded pill
  // trigger (label + "+n" count, accent border when active) and a single
  // portaled position:fixed popover (search, select-all/clear, checkmarks,
  // selected items listed first). Public API is unchanged:
  //   initMultiSelect(wrapId, values, {defaultLabel, onChange})
  //   setMultiSelectValues(wrapId, values) / getSelected(wrapId)
  const msState = {}; // wrapId → { values, selected:Set, defaultLabel, onChange }

  function msRoot(wrapId) {
    const s = msState[wrapId];
    return s ? s.defaultLabel.replace(/^All\s+/i, '') : '';
  }

  function msBuildSkeleton(wrapId) {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return null;
    let pill = wrap.querySelector('.ms-pill');
    if (!pill) {
      wrap.innerHTML =
        '<button class="filter-pill ms-pill" type="button" aria-haspopup="listbox" aria-expanded="false">' +
          '<span class="ms-trigger-text"></span>' +
          '<span class="ms-trigger-count" hidden></span>' +
        '</button>';
      pill = wrap.querySelector('.ms-pill');
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        msOpenPopover(wrapId);
      });
    }
    return pill;
  }

  function msApplyLabel(wrapId) {
    const wrap = document.getElementById(wrapId);
    const s = msState[wrapId];
    if (!wrap || !s) return;
    const pill    = wrap.querySelector('.ms-pill');
    const textEl  = pill && pill.querySelector('.ms-trigger-text');
    const countEl = pill && pill.querySelector('.ms-trigger-count');
    if (!pill || !textEl || !countEl) return;
    const sel = Array.from(s.selected);
    if (sel.length === 0) {
      textEl.textContent = s.defaultLabel;
      countEl.hidden = true; countEl.textContent = '';
    } else if (sel.length === 1) {
      textEl.textContent = sel[0];
      countEl.hidden = true; countEl.textContent = '';
    } else {
      textEl.textContent = sel[0];
      countEl.hidden = false; countEl.textContent = '+' + (sel.length - 1);
    }
    pill.classList.toggle('active', sel.length > 0);
    pill.title = sel.length ? (msRoot(wrapId) + ': ' + sel.join(', ')) : s.defaultLabel;
    wrap.classList.toggle('has-selection', sel.length > 0);
    syncClearButton();
  }

  // Shared popover (one element, re-targeted per pill)
  let msPopover = null;
  let msActive = null;
  let msSearch = '';

  function msEnsurePopover() {
    if (msPopover) return msPopover;
    msPopover = document.createElement('div');
    msPopover.className = 'ms-popover';
    msPopover.hidden = true;
    msPopover.innerHTML =
      '<div class="ms-search-wrap">' +
        '<svg class="ms-search-icon" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
          '<circle cx="6" cy="6" r="4"/>' +
          '<line x1="9" y1="9" x2="12.5" y2="12.5" stroke-linecap="round"/>' +
        '</svg>' +
        '<input type="text" class="ms-search" placeholder="Search…">' +
      '</div>' +
      '<div class="ms-quick-actions">' +
        '<button class="ms-link" data-act="all" type="button">Select all</button>' +
        '<button class="ms-link" data-act="clear" type="button">Clear</button>' +
      '</div>' +
      '<div class="ms-options" role="listbox" aria-multiselectable="true"></div>';
    document.body.appendChild(msPopover);

    msPopover.querySelector('.ms-search').addEventListener('input', (e) => {
      msSearch = e.target.value.toLowerCase().trim();
      msRenderOptions();
    });
    msPopover.querySelector('[data-act="all"]').addEventListener('click', () => {
      const s = msActive && msState[msActive];
      if (!s) return;
      msVisibleItems().forEach(v => s.selected.add(v));
      msRenderOptions();
      msApplyLabel(msActive);
      if (s.onChange) s.onChange(F.getSelected(msActive));
    });
    msPopover.querySelector('[data-act="clear"]').addEventListener('click', () => {
      const s = msActive && msState[msActive];
      if (!s) return;
      s.selected.clear();
      msRenderOptions();
      msApplyLabel(msActive);
      if (s.onChange) s.onChange(F.getSelected(msActive));
    });
    msPopover.querySelector('.ms-options').addEventListener('click', (e) => {
      const opt = e.target.closest('.ms-option');
      const s = msActive && msState[msActive];
      if (!opt || !s) return;
      const v = opt.dataset.value;
      if (s.selected.has(v)) s.selected.delete(v); else s.selected.add(v);
      msRenderOptions();
      msApplyLabel(msActive);
      if (s.onChange) s.onChange(F.getSelected(msActive));
    });
    return msPopover;
  }

  function msVisibleItems() {
    const s = msActive && msState[msActive];
    if (!s) return [];
    if (!msSearch) return s.values;
    return s.values.filter(v => String(v).toLowerCase().includes(msSearch));
  }

  function msRenderOptions() {
    if (!msPopover || !msActive) return;
    const s = msState[msActive];
    const box = msPopover.querySelector('.ms-options');
    const visible = msVisibleItems();
    if (!visible.length) {
      box.innerHTML = '<div class="ms-empty">No matches</div>';
      return;
    }
    const sel   = visible.filter(v =>  s.selected.has(v));
    const unsel = visible.filter(v => !s.selected.has(v));
    const row = (v, checked) =>
      '<button class="ms-option" data-value="' + escapeHtml(v) + '" role="option" aria-checked="' + checked + '" type="button" title="' + escapeHtml(v) + '">' +
        '<span class="ms-check"></span><span class="ms-label">' + escapeHtml(v) + '</span>' +
      '</button>';
    let html = sel.map(v => row(v, true)).join('');
    if (sel.length && unsel.length) html += '<div class="ms-divider"></div>';
    html += unsel.map(v => row(v, false)).join('');
    box.innerHTML = html;
  }

  function msPosition(wrapId) {
    const wrap = document.getElementById(wrapId);
    const pill = wrap && wrap.querySelector('.ms-pill');
    if (!pill) return;
    const tr = pill.getBoundingClientRect();
    const minW = Math.max(tr.width, 280);
    msPopover.style.minWidth = minW + 'px';
    const pw = Math.max(msPopover.offsetWidth, minW);
    const margin = 8;
    let left = tr.left;
    if (left + pw + margin > window.innerWidth) left = window.innerWidth - pw - margin;
    if (left < margin) left = margin;
    msPopover.style.top  = (tr.bottom + 4) + 'px';
    msPopover.style.left = left + 'px';
  }

  function msOpenPopover(wrapId) {
    msEnsurePopover();
    if (msActive === wrapId) { msClosePopover(); return; }
    if (msActive) msClosePopover();
    // Close any legacy inline dropdowns (date pills) that may be open.
    document.querySelectorAll('.ms-wrap.open').forEach(w => w.classList.remove('open'));
    msActive = wrapId;
    msSearch = '';
    const search = msPopover.querySelector('.ms-search');
    search.value = '';
    search.placeholder = 'Search ' + msRoot(wrapId).toLowerCase() + '…';
    msRenderOptions();
    msPopover.hidden = false;
    msPosition(wrapId);
    const pill = document.getElementById(wrapId).querySelector('.ms-pill');
    if (pill) pill.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => search.focus());
    document.addEventListener('keydown', msOnKey);
    document.addEventListener('mousedown', msOnOutside, true);
    window.addEventListener('resize', msClosePopover);
  }
  function msClosePopover() {
    if (!msActive) return;
    const wrap = document.getElementById(msActive);
    const pill = wrap && wrap.querySelector('.ms-pill');
    if (pill) pill.setAttribute('aria-expanded', 'false');
    msActive = null;
    msPopover.hidden = true;
    document.removeEventListener('keydown', msOnKey);
    document.removeEventListener('mousedown', msOnOutside, true);
    window.removeEventListener('resize', msClosePopover);
  }
  function msOnKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); msClosePopover(); }
  }
  function msOnOutside(e) {
    if (msPopover.contains(e.target)) return;
    if (e.target.closest('.ms-pill')) return;
    msClosePopover();
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
    msApplyLabel(wrapId);
  };

  F.setMultiSelectValues = function (wrapId, values) {
    const s = msState[wrapId];
    if (!s) return;
    s.values = values.slice();
    // Drop any selected entries no longer in values
    s.selected = new Set(Array.from(s.selected).filter(v => values.includes(v)));
    if (msActive === wrapId) msRenderOptions();
    msApplyLabel(wrapId);
  };

  F.getSelected = function (wrapId) {
    return msState[wrapId] ? Array.from(msState[wrapId].selected) : [];
  };

  F.closePopover = msClosePopover;

  // ── "Clear filters" link (shown in the bar when anything is active) ──
  const clearHooks = [];
  F.onClearAll = function (fn) { if (typeof fn === 'function') clearHooks.push(fn); };

  function filterBarEl() {
    return document.getElementById('filterBar') || document.querySelector('.filter-bar');
  }
  function anyFilterActive() {
    const bar = filterBarEl();
    if (bar && bar.querySelector('.ms-wrap.has-selection')) return true;
    return Object.keys(msState).some(id => msState[id].selected.size > 0);
  }
  function syncClearButton() {
    const bar = filterBarEl();
    if (!bar) return;
    let btn = bar.querySelector('.filter-clear');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-clear';
      btn.textContent = 'Clear filters';
      btn.hidden = true;
      btn.addEventListener('click', (e) => { e.stopPropagation(); F.clearAll(); });
      bar.appendChild(btn);
    }
    btn.hidden = !anyFilterActive();
  }
  F.syncClear = syncClearButton;

  F.clearAll = function () {
    msClosePopover();
    const callbacks = new Set();
    Object.keys(msState).forEach(id => {
      const s = msState[id];
      if (s.selected.size) {
        s.selected.clear();
        if (s.onChange) callbacks.add(s.onChange);
      }
      msApplyLabel(id);
    });
    Object.keys(wpState).forEach(id => {
      const s = wpState[id];
      if (s.startWeek || s.endWeek) {
        s.startWeek = null; s.endWeek = null;
        wpRenderGrid(id);
        wpApplyLabel(id);
        if (s.onChange) callbacks.add(s.onChange);
      }
    });
    clearHooks.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } });
    callbacks.forEach(fn => { try { fn([]); } catch (e) { /* ignore */ } });
    syncClearButton();
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
    syncClearButton();
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

// ── Shared inline price-change input helpers ─────────────────
// Plain text inputs (no spinner arrows): digits only while typing, then the
// value is shown as "$12" / "-2.5%" once the field loses focus — same
// behaviour as the Fizz demo's price-change cells.
function priceInputSanitize(input) {
  input.value = input.value.replace(/[^0-9.\-]/g, '');
}
function priceInputNumber(value) {
  const n = parseFloat(String(value == null ? '' : value).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}
function applyDollarFormat(input) {
  const n = priceInputNumber(input.value);
  input.value = n == null ? '' : '$' + n;
}
function applyPctFormat(input) {
  const n = priceInputNumber(input.value);
  input.value = n == null ? '' : n + '%';
}
function priceInputKeydown(e, input) {
  if (e.key === 'Enter') { input.blur(); }
  else if (e.key === 'Escape') { input.value = input.defaultValue; input.blur(); }
}
