/* Prowi commission calculator (/provisionsberegner, /en/commission-calculator).
   Standalone: no dependency on the site bundle (dist/prowi-2026.js). Loaded only on its own page via
   page-level custom code, pinned by commit with an SRI hash.

   The static Webflow markup is the default state (fast sats, 420.000 kr. sales, 350.000 kr. quota).
   This script swaps the [data-input] spans for real inputs, wires the [data-mode] / [data-period] /
   [data-retro] toggles and re-renders the [data-o] outputs. In Node it exports the pure maths and
   formatting (used by the tests and by the generator of the static markup). */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof document !== 'undefined' && document.querySelector) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
    else api.mount(document);
  }
})(this, function () {
  'use strict';

  var NB = ' '; // between number and unit, so "33.600 kr." never wraps

  /* ---------------- strings ---------------- */
  var STR = {
    da: {
      kr: 'kr.', pctSpace: true, dash: '—',
      sum_fast: '{rate} af {sales}',
      sum_tiers: 'Trappemodel med {n} trin på {sales} i salg',
      sum_accel: '{base} op til målet og {high} over målet',
      sum_retro_yes: 'Målet er nået: {high} af hele salget',
      sum_retro_no: 'Målet er ikke nået: {base} af hele salget',
      sum_noquota: 'Intet mål angivet: {base} af hele salget',
      sum_db: '{rate} af {db} i dækningsbidrag',
      row_all: 'Hele salget',
      row_tier: 'Trin {i}: {from}–{to}',
      row_tier_last: 'Trin {i}: over {from}',
      row_under: 'Op til målet på {q}',
      row_over: 'Over målet på {q}',
      row_retro_yes: 'Hele salget, målet er nået',
      row_retro_no: 'Hele salget, målet er ikke nået',
      row_noquota: 'Hele salget (intet mål angivet)',
      row_db: 'Dækningsbidrag: {dg} af {sales}',
      row_calc: '{basis} × {rate}',
      row_cap: 'Loft over provision',
      row_cap_calc: 'Maks. {cap} i perioden',
      row_total: 'Provision i alt',
      row_total_calc: 'Effektiv sats {eff} af salget',
      row_total_calc_none: 'Intet salg i perioden',
      att_none: 'Angiv et mål for at se målopfyldelsen.',
      att_over: '{diff} over målet.',
      att_under: '{diff} under målet.',
      att_exact: 'Præcis på målet.',
      total_base1: 'Grundløn {base} + provision {c}',
      total_baseN: 'Grundløn {m} × {baseM} + provision {c}',
      total_nobase: 'Ingen grundløn angivet. Kun provision.',
      warn: 'Loftet begrænser provisionen. Uden loft ville den være {raw}',
      live: 'Provision: {c}, effektiv sats: {eff}, målopfyldelse: {att}, samlet løn: {total}',
      grp_mode: 'Provisionsmodel', grp_period: 'Periode', grp_retro: 'Hvornår gælder den høje sats'
    },
    en: {
      kr: 'DKK', pctSpace: false, dash: '—',
      sum_fast: '{rate} of {sales}',
      sum_tiers: 'Tiered plan with {n} tiers on {sales} in sales',
      sum_accel: '{base} up to quota and {high} above quota',
      sum_retro_yes: 'Quota reached: {high} on all sales',
      sum_retro_no: 'Quota not reached: {base} on all sales',
      sum_noquota: 'No quota entered: {base} on all sales',
      sum_db: '{rate} of {db} in gross margin',
      row_all: 'All sales',
      row_tier: 'Tier {i}: {from}–{to}',
      row_tier_last: 'Tier {i}: above {from}',
      row_under: 'Up to the quota of {q}',
      row_over: 'Above the quota of {q}',
      row_retro_yes: 'All sales, quota reached',
      row_retro_no: 'All sales, quota not reached',
      row_noquota: 'All sales (no quota entered)',
      row_db: 'Gross margin: {dg} of {sales}',
      row_calc: '{basis} × {rate}',
      row_cap: 'Commission cap',
      row_cap_calc: 'Max {cap} in the period',
      row_total: 'Total commission',
      row_total_calc: 'Effective rate {eff} of sales',
      row_total_calc_none: 'No sales in the period',
      att_none: 'Enter a quota to see attainment.',
      att_over: '{diff} above quota.',
      att_under: '{diff} below quota.',
      att_exact: 'Exactly on quota.',
      total_base1: 'Base salary {base} + commission {c}',
      total_baseN: 'Base salary {m} × {baseM} + commission {c}',
      total_nobase: 'No base salary entered. Commission only.',
      warn: 'The cap limits the commission. Without the cap it would be {raw}',
      live: 'Commission: {c}, effective rate: {eff}, quota attainment: {att}, total pay: {total}',
      grp_mode: 'Commission model', grp_period: 'Period', grp_retro: 'When the higher rate applies'
    }
  };
  function tpl(s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k] == null ? m : o[k]; }); }
  // end a sentence with a full stop, unless it already ends with one ("33.600 kr.")
  function stop(s) { return /\.$/.test(s) ? s : s + '.'; }

  /* ---------------- numbers ---------------- */
  function group(intStr, lang) { return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.'); }
  // whole number with thousands separators; amounts are shown to the krone
  function fmtNum(n, lang) {
    var r = Math.round(Number(n) || 0);
    if (r === 0) r = 0; // no "-0"
    return (r < 0 ? '−' : '') + group(String(Math.abs(r)), lang);
  }
  function fmtKr(n, lang) { return fmtNum(n, lang) + NB + STR[lang === 'en' ? 'en' : 'da'].kr; }
  // percent value (10 = 10 %), at most `dec` decimals, trailing zeros trimmed
  function fmtPct(p, lang, dec) {
    if (p == null || !isFinite(p)) return STR[lang === 'en' ? 'en' : 'da'].dash;
    var k = dec == null ? 2 : dec, f = Math.pow(10, k);
    var v = Math.round(p * f) / f;
    if (v === 0) v = 0;
    var s = String(Math.abs(v));
    if (s.indexOf('e') > -1) s = Math.abs(v).toFixed(k).replace(/\.?0+$/, '');
    var parts = s.split('.');
    var out = group(parts[0], lang) + (parts[1] ? (lang === 'en' ? '.' : ',') + parts[1] : '');
    return (v < 0 ? '−' : '') + out + (lang === 'en' ? '%' : NB + '%');
  }
  /* Parse what a person typed. Danish: "1.250.000" and "2,5". English: "1,250,000" and "2.5".
     kind 'pct' also takes "2.5" on a Danish page (a dot followed by one or two digits is a decimal point
     there, never a thousands separator). Returns null for an empty field. Negative input is not allowed. */
  function parse(str, lang, kind) {
    var s = String(str == null ? '' : str).replace(/[\s ]/g, '').replace(/kr\.?|dkk|%/gi, '');
    if (!/[0-9]/.test(s)) return null;
    if (lang === 'en') s = s.replace(/,/g, '');
    else if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    else if (!(kind === 'pct' && /^\d*\.\d{1,2}$/.test(s))) s = s.replace(/\./g, '');
    s = s.replace(/[^0-9.]/g, '');
    var i = s.indexOf('.');
    if (i > -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
    var v = parseFloat(s);
    return isFinite(v) ? v : null;
  }

  /* ---------------- maths ---------------- */
  function nz(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }
  /* p: { mode: 'fast'|'tiers'|'accel'|'db', sales, quota, baseMonthly, months, cap (null/0 = none),
          rate, t1, r1, t2, r2, r3, accBase, accHigh, retro, dg, dbRate }  (rates in percent)
     Returns the rows of the breakdown and the totals. */
  function calc(p) {
    var mode = p.mode || 'fast';
    var sales = nz(p.sales), quota = nz(p.quota), months = nz(p.months) || 1;
    var rows = [];
    function row(key, basis, rate, extra) {
      var r = { key: key, basis: basis, rate: nz(rate), amount: basis * nz(rate) / 100 };
      for (var k in extra) r[k] = extra[k];
      rows.push(r);
    }
    var reached = quota > 0 && sales >= quota;
    if (mode === 'tiers') {
      // marginal: each rate applies only to the part of sales inside its tier
      // a tier whose upper limit is not above the previous one has no width and is left out
      var L1 = nz(p.t1), L2 = Math.max(L1, nz(p.t2)), ti = 0;
      if (L1 > 0) row('tier', Math.min(sales, L1), p.r1, { i: ++ti, from: 0, to: L1 });
      if (L2 > L1) row('tier', Math.max(0, Math.min(sales, L2) - L1), p.r2, { i: ++ti, from: L1, to: L2 });
      row('tier', Math.max(0, sales - L2), p.r3, { i: ++ti, from: L2, to: null, last: true });
    } else if (mode === 'accel') {
      if (!quota) row('noquota', sales, p.accBase);
      else if (p.retro) {
        // retroactive: once the quota is reached (>= 100 %), the higher rate applies to all sales
        if (reached) row('retro_yes', sales, p.accHigh);
        else row('retro_no', sales, p.accBase);
      } else {
        row('under', Math.min(sales, quota), p.accBase);
        row('over', Math.max(0, sales - quota), p.accHigh);
      }
    } else if (mode === 'db') {
      var dg = nz(p.dg);
      row('db', sales * dg / 100, p.dbRate, { dg: dg });
    } else {
      row('all', sales, p.rate);
    }
    var raw = 0;
    for (var i = 0; i < rows.length; i++) raw += rows[i].amount;
    var cap = nz(p.cap);
    var capped = cap > 0 && raw > cap;
    var commission = capped ? cap : raw;
    var basePeriod = nz(p.baseMonthly) * months;
    return {
      mode: mode, rows: rows, raw: raw, cap: cap, capped: capped, capCut: capped ? raw - cap : 0,
      commission: commission,
      eff: sales > 0 ? commission / sales * 100 : null,           // percent of sales
      att: quota > 0 ? sales / quota * 100 : null,                 // percent of quota
      reached: reached, sales: sales, quota: quota, months: months,
      basePeriod: basePeriod, total: basePeriod + commission
    };
  }

  /* ---------------- texts for a result (shared by the page and the static-markup generator) ---------------- */
  function view(p, lang) {
    lang = lang === 'en' ? 'en' : 'da';
    var S = STR[lang], r = calc(p);
    var K = function (n) { return fmtKr(n, lang); }, P = function (n, d) { return fmtPct(n, lang, d); };
    var rows = r.rows.map(function (x) {
      var label;
      if (x.key === 'tier') label = tpl(x.last ? S.row_tier_last : S.row_tier, { i: x.i, from: x.last ? K(x.from) : fmtNum(x.from, lang), to: K(x.to) });
      else if (x.key === 'under' || x.key === 'over') label = tpl(S['row_' + x.key], { q: K(r.quota) });
      else if (x.key === 'db') label = tpl(S.row_db, { dg: P(x.dg), sales: K(r.sales) });
      else label = S['row_' + x.key];
      return { label: label, calc: tpl(S.row_calc, { basis: K(x.basis), rate: P(x.rate) }), amount: K(x.amount) };
    });
    if (r.capped) rows.push({ label: S.row_cap, calc: tpl(S.row_cap_calc, { cap: K(r.cap) }), amount: K(-r.capCut) });
    var total = { label: S.row_total, calc: r.eff == null ? S.row_total_calc_none : tpl(S.row_total_calc, { eff: P(r.eff, 1) }), amount: K(r.commission) };

    var summary, x0 = r.rows[0];
    if (r.mode === 'tiers') summary = tpl(S.sum_tiers, { n: r.rows.length, sales: K(r.sales) });
    else if (r.mode === 'accel') {
      var o = { base: P(p.accBase), high: P(p.accHigh) };
      summary = tpl(x0.key === 'noquota' ? S.sum_noquota : x0.key === 'retro_yes' ? S.sum_retro_yes : x0.key === 'retro_no' ? S.sum_retro_no : S.sum_accel, o);
    } else if (r.mode === 'db') summary = tpl(S.sum_db, { rate: P(x0.rate), db: K(x0.basis) });
    else summary = tpl(S.sum_fast, { rate: P(x0.rate), sales: K(r.sales) });

    var attNote;
    if (r.att == null) attNote = S.att_none;
    else if (r.sales > r.quota) attNote = tpl(S.att_over, { diff: K(r.sales - r.quota) });
    else if (r.sales < r.quota) attNote = tpl(S.att_under, { diff: K(r.quota - r.sales) });
    else attNote = S.att_exact;

    var baseM = nz(p.baseMonthly), totalNote;
    if (!baseM) totalNote = S.total_nobase;
    else if (r.months === 1) totalNote = tpl(S.total_base1, { base: K(r.basePeriod), c: K(r.commission) });
    else totalNote = tpl(S.total_baseN, { m: r.months, baseM: K(baseM), c: K(r.commission) });

    var out = {
      commission: K(r.commission), summary: summary,
      warn: r.capped ? stop(tpl(S.warn, { raw: K(r.raw) })) : '',
      eff: P(r.eff, 1), att: P(r.att, 0), attWidth: r.att == null ? 0 : Math.min(100, r.att),
      attNote: attNote, total: K(r.total), totalNote: totalNote,
      rows: rows, totalRow: total, result: r
    };
    out.live = stop(tpl(S.live, { c: out.commission, eff: out.eff, att: out.att, total: out.total }));
    return out;
  }

  /* ---------------- page ---------------- */
  var CSS = '.pw-cc-js .pw-tool__input{font-family:inherit;font-variant-numeric:tabular-nums;letter-spacing:inherit;line-height:normal;padding:0;margin:0;width:100%;height:auto;-webkit-appearance:none;appearance:none;box-shadow:none}' +
    '.pw-cc-js .pw-tool__input::placeholder{color:#A1A0BD;opacity:1}' +
    '.pw-cc-js .pw-tool__input-box:focus-within{border-color:#4C39CA;box-shadow:0 0 0 4px rgba(76,57,202,.18)}' +
    '.pw-cc-js [role="radio"]:focus-visible{outline:2px solid #4C39CA;outline-offset:2px}' +
    '.pw-cc-js label{cursor:pointer;margin:0;font-weight:inherit}' +
    '.pw-cc-js .pw-cc__hero-value{transition:transform 300ms cubic-bezier(.2,.8,.2,1)}';

  function mount(doc) {
    var root = doc.querySelector('[data-tool="commission"]');
    if (!root || root.getAttribute('data-cc-ready')) return;
    root.setAttribute('data-cc-ready', '1');
    var lang = /^en/i.test(doc.documentElement.getAttribute('lang') || '') ? 'en' : 'da';
    var S = STR[lang];
    if (!doc.getElementById('pw-cc-css')) {
      var st = doc.createElement('style'); st.id = 'pw-cc-css'; st.textContent = CSS; doc.head.appendChild(st);
    }
    root.classList.add('pw-cc-js');

    // English links the site bundle cannot map (blog posts have their own EN slugs)
    if (lang === 'en') Array.prototype.forEach.call(doc.querySelectorAll('a[data-cc-en]'), function (a) { a.setAttribute('href', a.getAttribute('data-cc-en')); });

    var state = { mode: 'fast', months: 1, retro: false, v: {} };
    var kinds = {};

    /* inputs: swap each span for an <input>, and its label span for a <label> */
    Array.prototype.forEach.call(root.querySelectorAll('[data-input]'), function (span) {
      var key = span.getAttribute('data-input'), kind = span.getAttribute('data-kind') || 'kr';
      kinds[key] = kind;
      var def = span.getAttribute('data-default');
      var v = def == null ? parse(span.textContent, lang, kind) : (def === '' ? null : Number(def));
      var inp = doc.createElement('input');
      inp.type = 'text';
      inp.id = 'pw-cc-' + key;
      inp.className = span.className;
      inp.setAttribute('inputmode', kind === 'pct' ? 'decimal' : 'numeric');
      inp.setAttribute('autocomplete', 'off');
      inp.setAttribute('data-input', key);
      if (def === '') inp.placeholder = span.textContent.trim();
      inp.value = v == null ? '' : (kind === 'pct' ? fmtPct(v, lang).replace(/\s*%$/, '').replace(NB, '') : fmtNum(v, lang));
      var field = span.closest('.pw-tool__field');
      var lab = field && field.firstElementChild;
      if (lab && !lab.contains(span) && lab.tagName !== 'LABEL') {
        var l = doc.createElement('label');
        l.className = lab.className; l.textContent = lab.textContent; l.htmlFor = inp.id;
        lab.parentNode.replaceChild(l, lab);
      }
      var hint = field && field.querySelector('.pw-ote__hint');
      if (hint) { hint.id = inp.id + '-hint'; inp.setAttribute('aria-describedby', hint.id); }
      span.parentNode.replaceChild(inp, span);
      state.v[key] = v;
      inp.addEventListener('input', function () { onType(inp, key, kind); });
      inp.addEventListener('keydown', function (e) { onKey(e, inp, key, kind); });
      inp.addEventListener('blur', function () {
        var x = state.v[key];
        inp.value = x == null ? '' : (kind === 'pct' ? fmtPct(x, lang).replace(/\s*%$/, '').replace(NB, '') : fmtNum(x, lang));
      });
    });

    function onType(inp, key, kind) {
      var raw = inp.value;
      if (kind === 'kr') {
        // regroup the digits as the person types and keep the caret after the same digit
        var caret = inp.selectionStart == null ? raw.length : inp.selectionStart;
        var digitsBefore = raw.slice(0, caret).replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '').length;
        var dec = lang === 'en' ? '.' : ',';
        var intPart = raw.split(dec)[0];
        var v = parse(intPart, lang, 'kr');
        var f = v == null ? '' : fmtNum(v, lang);
        if (f !== raw) {
          inp.value = f;
          var pos = 0, seen = 0;
          while (pos < f.length && seen < digitsBefore) { if (/[0-9]/.test(f.charAt(pos))) seen++; pos++; }
          try { inp.setSelectionRange(pos, pos); } catch (e) { /* not focused */ }
        }
        state.v[key] = v;
      } else {
        var clean = raw.replace(lang === 'en' ? /[^0-9.]/g : /[^0-9.,]/g, '');
        if (clean !== raw) inp.value = clean;
        state.v[key] = parse(clean, lang, 'pct');
      }
      render();
    }
    // Up/Down step the value (Shift = 10 x). Stops propagation so the site bundle's own stepper does not step twice.
    function onKey(e, inp, key, kind) {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault(); e.stopPropagation();
      var v = state.v[key] || 0, a = Math.abs(v);
      var step = kind === 'pct' ? (a < 10 ? 0.5 : 1) : (a >= 10000 ? Math.pow(10, Math.floor(Math.log(a) / Math.LN10) - 1) : a >= 1000 ? 100 : 10);
      if (e.shiftKey) step *= 10;
      var nv = Math.max(0, Math.round((v + (e.key === 'ArrowUp' ? 1 : -1) * step) / step) * step);
      nv = Math.round(nv * 100) / 100;
      state.v[key] = nv;
      inp.value = kind === 'pct' ? fmtPct(nv, lang).replace(/\s*%$/, '').replace(NB, '') : fmtNum(nv, lang);
      render();
    }

    /* toggles: single-choice groups built from links (href="#"); role=radio with roving tabindex */
    function setOn(el, on) { el.className = el.className.replace(/--(on|off)\b/, on ? '--on' : '--off'); }
    function wire(attr, label, initial, apply) {
      var opts = Array.prototype.slice.call(root.querySelectorAll('[' + attr + ']'));
      if (!opts.length) return;
      var grp = opts[0].parentNode;
      grp.setAttribute('role', 'radiogroup');
      grp.setAttribute('aria-label', label);
      var cur = initial;
      opts.forEach(function (a) { if (/--on\b/.test(a.className)) cur = a.getAttribute(attr); });
      function paint() {
        opts.forEach(function (a) {
          var on = a.getAttribute(attr) === cur;
          setOn(a, on);
          a.setAttribute('aria-checked', on ? 'true' : 'false');
          a.setAttribute('tabindex', on ? '0' : '-1');
        });
      }
      function pick(val, focus) {
        cur = val; paint(); apply(val);
        if (focus) opts.forEach(function (a) { if (a.getAttribute(attr) === val) a.focus(); });
        render();
      }
      opts.forEach(function (a, i) {
        a.setAttribute('role', 'radio');
        a.addEventListener('click', function (e) { e.preventDefault(); pick(a.getAttribute(attr)); });
        a.addEventListener('keydown', function (e) {
          var k = e.key, j = -1;
          if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % opts.length;
          else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + opts.length) % opts.length;
          else if (k === 'Home') j = 0; else if (k === 'End') j = opts.length - 1;
          else if (k === ' ' || k === 'Enter') { e.preventDefault(); pick(a.getAttribute(attr)); return; }
          if (j > -1) { e.preventDefault(); pick(opts[j].getAttribute(attr), true); }
        });
      });
      paint(); apply(cur);
    }
    wire('data-mode', S.grp_mode, 'fast', function (v) {
      state.mode = v;
      Array.prototype.forEach.call(root.querySelectorAll('[data-panel]'), function (p) {
        var on = p.getAttribute('data-panel') === v;
        p.className = p.className.replace(/pw-cc__panel(--off)?\b/, on ? 'pw-cc__panel' : 'pw-cc__panel--off');
      });
    });
    wire('data-period', S.grp_period, '1', function (v) { state.months = Number(v) || 1; });
    wire('data-retro', S.grp_retro, '0', function (v) { state.retro = v === '1'; });

    function out(k) { return root.querySelector('[data-o="' + k + '"]'); }
    function setText(k, v) { var el = out(k); if (el && el.textContent !== v) el.textContent = v; }

    function params() {
      var v = state.v;
      return {
        mode: state.mode, months: state.months, retro: state.retro,
        sales: v.sales, quota: v.quota, baseMonthly: v.base, cap: v.cap,
        rate: v.rate, t1: v.t1, r1: v.r1, t2: v.t2, r2: v.r2, r3: v.r3,
        accBase: v.accBase, accHigh: v.accHigh, dg: v.dg, dbRate: v.dbRate
      };
    }

    var liveTimer = 0, lastCommission = null;
    function render() {
      var w = view(params(), lang);
      setText('commission', w.commission);
      setText('summary', w.summary);
      var warn = out('warn');
      if (warn) { warn.textContent = w.warn; warn.style.display = w.warn ? 'block' : 'none'; }
      setText('eff', w.eff);
      setText('att', w.att);
      var bar = out('attbar'); if (bar) bar.style.width = w.attWidth + '%';
      setText('attnote', w.attNote);
      setText('total', w.total);
      setText('totalnote', w.totalNote);
      var box = out('rows');
      if (box) {
        while (box.firstChild) box.removeChild(box.firstChild);
        w.rows.concat([w.totalRow]).forEach(function (r, i, arr) {
          var row = doc.createElement('div');
          row.className = i === arr.length - 1 ? 'pw-cc__row--total' : 'pw-cc__row';
          row.setAttribute('role', 'row');
          var main = doc.createElement('div'); main.className = 'pw-cc__row-main'; main.setAttribute('role', 'cell');
          var lb = doc.createElement('span'); lb.className = 'pw-cc__row-label'; lb.textContent = r.label;
          var cl = doc.createElement('span'); cl.className = 'pw-cc__row-calc'; cl.textContent = r.calc;
          main.appendChild(lb); main.appendChild(cl);
          var am = doc.createElement('span'); am.className = 'pw-cc__row-amount'; am.setAttribute('role', 'cell'); am.textContent = r.amount;
          row.appendChild(main); row.appendChild(am);
          box.appendChild(row);
        });
      }
      var hero = out('commission');
      if (hero && lastCommission !== null && lastCommission !== w.commission) {
        hero.style.transform = 'scale(1.015)';
        setTimeout(function () { hero.style.transform = 'none'; }, 160);
      }
      lastCommission = w.commission;
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () { setText('live', w.live); }, 500);
    }
    render();
  }

  return { calc: calc, view: view, parse: parse, fmtNum: fmtNum, fmtKr: fmtKr, fmtPct: fmtPct, STR: STR, mount: mount };
});
