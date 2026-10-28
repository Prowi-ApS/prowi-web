/* Calculator kit for the free calculator pages (v1.25.51+): Trappemodel-, Accelerator-, Delt provision-, Feriepenge-,
   Sygdom/barsel- and Kvote-beregner. Each calculator is its own module (src/tools/calc-<name>.js) that only describes
   its fields, toggles, maths and result texts; this kit builds the markup inside the page's root element, handles
   number input (Danish 1.000 / 12,5 or English 1,000 / 12.5 by <html lang>), the toggles, the live result and the
   screen-reader summary. No external requests.

   Webflow markup per page: one empty element with the calculator's id, e.g. <div data-tool="tiers"></div>.
   Roots: [data-tool="tiers"], [data-tool="accelerator"], [data-tool="split"], [data-tool="holiday-pay"],
   [data-tool="sick-pay"], [data-tool="quota"]. The site footer counts Plausible "Calculator used" on the first input
   event inside [data-tool]; the toggles fire an input event too, so a visitor who only clicks a toggle is counted.

   Calculator modules queue themselves in window.__pwCalcQ (the loader may run them before this file) and the kit mounts
   them; after the kit has run, window.__pwCalcMount(def) mounts at once. In Node the kit exports its formatting and
   parsing helpers so the maths can be tested (test/calculators.test.js). */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  if (typeof document === 'undefined') return;
  window.__pwCalcMount = function (def) {
    var go = function () { api.mount(document, def); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  };
  var q = window.__pwCalcQ || [];
  window.__pwCalcQ = { push: function (def) { window.__pwCalcMount(def); } };
  for (var i = 0; i < q.length; i++) window.__pwCalcMount(q[i]);
})(this, function () {
  'use strict';
  var NB = ' ';

  /* ---------------- numbers ---------------- */
  function group(intStr, lang) { return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.'); }
  // number with at most `dec` decimals (trailing zeros trimmed), thousands grouped
  function fmtNum(n, lang, dec) {
    var k = dec == null ? 0 : dec, f = Math.pow(10, k);
    var v = Math.round((Number(n) || 0) * f) / f;
    if (v === 0) v = 0; // no "-0"
    var s = Math.abs(v).toFixed(k);
    if (k) s = s.replace(/\.?0+$/, '');
    var p = s.split('.');
    return (v < 0 ? '−' : '') + group(p[0], lang) + (p[1] ? (lang === 'en' ? '.' : ',') + p[1] : '');
  }
  // number with exactly `dec` decimals (amounts per day: 646,05)
  function fmtFixed(n, lang, dec) {
    var v = Number(n) || 0, s = Math.abs(v).toFixed(dec), p = s.split('.');
    if (Number(s) === 0) v = 0;
    return (v < 0 ? '−' : '') + group(p[0], lang) + (p[1] ? (lang === 'en' ? '.' : ',') + p[1] : '');
  }
  function unitKr(lang) { return lang === 'en' ? 'DKK' : 'kr.'; }
  function fmtKr(n, lang) { return fmtNum(n, lang, 0) + NB + unitKr(lang); }
  // kroner with two decimals when there are øre (646,05 kr.), none when it is a whole number (840 kr.)
  function fmtKr2(n, lang) { var v = Math.round((Number(n) || 0) * 100) / 100; return (v % 1 ? fmtFixed(v, lang, 2) : fmtNum(v, lang, 0)) + NB + unitKr(lang); }
  function fmtPct(p, lang, dec) {
    if (p == null || !isFinite(p)) return '—';
    return fmtNum(p, lang, dec == null ? 2 : dec) + (lang === 'en' ? '%' : NB + '%');
  }
  /* What a person typed. Danish: "1.250.000" and "2,5". English: "1,250,000" and "2.5". Decimal kinds also take "2.5" on a
     Danish page (a dot followed by one or two digits is a decimal point there). null for an empty field; no negatives. */
  function parse(str, lang, kind) {
    var s = String(str == null ? '' : str).replace(/[\s ]/g, '').replace(/kr\.?|dkk|%|×|x/gi, '');
    if (!/[0-9]/.test(s)) return null;
    var decimal = kind !== 'kr' && kind !== 'int';
    if (lang === 'en') s = s.replace(/,/g, '');
    else if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    else if (!(decimal && /^\d*\.\d{1,2}$/.test(s))) s = s.replace(/\./g, '');
    s = s.replace(/[^0-9.]/g, '');
    var i = s.indexOf('.');
    if (i > -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
    var v = parseFloat(s);
    if (!isFinite(v)) return null;
    if (kind === 'kr' || kind === 'int') v = Math.round(v);
    return v;
  }
  function nz(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }
  function tpl(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] == null ? m : o[k]; }); }
  function helpers(lang) {
    lang = lang === 'en' ? 'en' : 'da';
    return {
      lang: lang, nz: nz, tpl: tpl,
      K: function (n) { return fmtKr(n, lang); },
      K2: function (n) { return fmtKr2(n, lang); },
      P: function (n, d) { return fmtPct(n, lang, d); },
      N: function (n, d) { return fmtNum(n, lang, d); },
      X: function (n) { return fmtNum(n, lang, 2) + '×'; },
      F: function (n, d) { return fmtFixed(n, lang, d); }
    };
  }

  /* ---------------- styles (scoped to .pw-calc; same look as the commission and OTE calculators) ---------------- */
  var V = function (n, f) { return 'var(--_prowi---pw-' + n + ',' + f + ')'; };
  var C = {
    purple: V('purple', '#4C39CA'), dark: V('dark-purple', '#110663'), subtle: V('bg-subtle', '#F4F1FE'), base: V('base', '#EDE7E5'),
    white: V('white', '#FFFFFF'), text2: V('text-secondary', '#34326C'), muted: V('text-muted', '#5E5B98'),
    hair: V('border-hairline', 'rgba(17,6,99,0.1)'), strong: V('border-strong', 'rgba(17,6,99,0.14)')
  };
  var CSS = [
    '.pw-calc{display:grid;max-width:1120px;margin:0 auto;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:1px;border:1px solid ' + C.hair + ';background:' + C.hair + ';color:' + C.dark + ';font-size:16px;line-height:1.55;text-align:left}',
    '.pw-calc *{box-sizing:border-box}',
    '.pw-calc [hidden]{display:none!important}',
    '.pw-calc__modes{grid-column:1/-1;display:flex;flex-direction:column;gap:12px;padding:clamp(20px,2.5vw,28px) clamp(24px,3vw,40px);background:' + C.base + '}',
    '.pw-calc__tabs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr));gap:6px}',
    '.pw-calc__tab{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:10px 12px;border-radius:10px;border:1px solid ' + C.strong + ';background:' + C.white + ';color:' + C.dark + ';text-align:left;font:inherit;cursor:pointer;transition:background-color 220ms cubic-bezier(.2,.6,.2,1),color 220ms,border-color 220ms}',
    '.pw-calc__tab[aria-checked="true"]{border-color:' + C.dark + ';background:' + C.dark + ';color:#fff}',
    '.pw-calc__tab-name{font-size:13px;font-weight:500;line-height:1.35}',
    '.pw-calc__tab-sub{font-size:12px;line-height:1.35;opacity:.7}',
    '.pw-calc__inputs{display:flex;min-width:0;flex-direction:column;gap:22px;padding:clamp(24px,3vw,40px);background:' + C.base + '}',
    '.pw-calc__field{display:flex;flex-direction:column;gap:8px;min-width:0}',
    '.pw-calc__field[hidden],.pw-calc__pair[hidden]{display:none}',
    '.pw-calc__label{display:block;margin:0;font-size:13px;font-weight:500;line-height:1.4;color:' + C.text2 + ';cursor:pointer}',
    '.pw-calc__box{display:flex;height:52px;padding:0 14px;align-items:center;gap:8px;border-radius:12px;background:' + C.white + ';border:1px solid ' + C.strong + ';transition:box-shadow 140ms,border-color 140ms}',
    '.pw-calc__box:focus-within{border-color:#4C39CA;box-shadow:0 0 0 4px rgba(76,57,202,.18)}',
    '.pw-calc__input{min-width:0;width:100%;height:auto;flex:1 1 0%;margin:0;padding:0;border:0;background:transparent;outline:none;box-shadow:none;font-family:inherit;font-size:17px;font-weight:500;line-height:normal;letter-spacing:inherit;color:' + C.dark + ';font-variant-numeric:tabular-nums;-webkit-appearance:none;appearance:none}',
    '.pw-calc__input::placeholder{color:#A1A0BD;opacity:1}',
    '.pw-calc__unit{flex:none;font-size:15px;color:' + C.muted + '}',
    '.pw-calc__hint{font-size:12.5px;line-height:1.45;color:' + C.muted + '}',
    '.pw-calc__pair{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:12px;align-items:end}',
    '.pw-calc__seg{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:6px}',
    '.pw-calc__seg-btn{display:flex;align-items:center;justify-content:center;min-height:40px;padding:8px;border-radius:10px;border:1px solid ' + C.strong + ';background:' + C.white + ';color:' + C.dark + ';font:inherit;font-size:13px;font-weight:500;line-height:1.3;text-align:center;cursor:pointer;transition:background-color 220ms,color 220ms,border-color 220ms}',
    '.pw-calc__seg-btn[aria-checked="true"]{border-color:' + C.dark + ';background:' + C.dark + ';color:#fff}',
    '.pw-calc__tab:focus-visible,.pw-calc__seg-btn:focus-visible{outline:2px solid #4C39CA;outline-offset:2px}',
    '.pw-calc__results{display:grid;min-width:0;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));align-content:start;gap:1px;background:' + C.hair + '}',
    '.pw-calc__hero{position:relative;display:flex;flex-direction:column;gap:10px;grid-column:1/-1;overflow:hidden;padding:clamp(28px,3.5vw,48px);background:' + C.dark + ';color:#fff}',
    '.pw-calc__glow{position:absolute;top:-40%;right:-15%;width:50%;aspect-ratio:1/1;border-radius:50%;background-image:radial-gradient(circle,rgba(70,211,247,.2),transparent 65%);pointer-events:none}',
    '.pw-calc__kicker{position:relative;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.02em;color:rgba(255,255,255,.7)}',
    '.pw-calc__value{position:relative;display:inline-block;align-self:flex-start;max-width:100%;line-height:1;font-weight:300;letter-spacing:-.03em;white-space:nowrap;font-size:clamp(38px,5vw,64px);font-variant-numeric:tabular-nums;transition:transform 300ms cubic-bezier(.2,.8,.2,1)}',
    '.pw-calc__sub{position:relative;font-size:14px;line-height:1.5;color:rgba(255,255,255,.72)}',
    '.pw-calc__warn{position:relative;margin-top:6px;padding:10px 12px;border-radius:10px;background:rgba(201,138,0,.22);color:#ffe3a3;font-size:13px;line-height:1.5}',
    '.pw-calc__warn[hidden]{display:none}',
    '.pw-calc__card{display:flex;min-width:0;flex-direction:column;gap:12px;padding:24px;background:' + C.white + '}',
    '.pw-calc__card-label,.pw-calc__band-label{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.02em;line-height:1.4;color:' + C.muted + '}',
    '.pw-calc__metric{line-height:1;font-weight:500;letter-spacing:-.02em;white-space:nowrap;font-size:clamp(24px,2.3vw,32px);font-variant-numeric:tabular-nums}',
    '.pw-calc__bar{display:flex;height:8px;border-radius:999px;background:' + C.subtle + ';overflow:hidden}',
    '.pw-calc__bar[hidden]{display:none}',
    '.pw-calc__bar-fill{width:0;height:100%;border-radius:999px;background-image:linear-gradient(135deg,#b68ff8 0%,#2217b7 100%);transition:width 420ms cubic-bezier(.2,.6,.2,1)}',
    '.pw-calc__note{font-size:13px;line-height:1.5;color:' + C.text2 + '}',
    '.pw-calc__band{display:flex;flex-direction:column;gap:14px;grid-column:1/-1;padding:24px;background:' + C.base + '}',
    '.pw-calc__table{display:flex;flex-direction:column;border-top:1px solid ' + C.hair + '}',
    '.pw-calc__row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 16px;align-items:center;padding:12px 0;border-bottom:1px solid ' + C.hair + '}',
    '.pw-calc__row--total{border-bottom:0;padding:14px 0 4px}',
    '.pw-calc__row-main{display:flex;min-width:0;flex-direction:column;gap:2px}',
    '.pw-calc__row-label{font-size:14px;font-weight:500;line-height:1.4;color:' + C.dark + '}',
    '.pw-calc__row-calc{font-size:12.5px;line-height:1.4;color:' + C.muted + ';font-variant-numeric:tabular-nums}',
    '.pw-calc__row-amount{font-size:15px;font-weight:500;white-space:nowrap;text-align:right;color:' + C.dark + ';font-variant-numeric:tabular-nums}',
    '.pw-calc__row--total .pw-calc__row-amount{font-size:17px}',
    '.pw-calc__formula{margin:0;padding:10px 12px;border-radius:8px;background:' + C.subtle + ';font-size:14px;font-weight:500;line-height:1.5;color:' + C.dark + '}',
    '.pw-calc__explain{margin:0;font-size:14px;line-height:1.6;color:' + C.text2 + '}',
    '.pw-calc__fine{margin:0;font-size:12.5px;line-height:1.5;color:' + C.muted + '}',
    '.pw-calc__fine a,.pw-calc__explain a{color:' + C.purple + ';text-decoration:underline;text-underline-offset:3px}',
    '.pw-calc__sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;white-space:nowrap;clip-path:inset(50%)}',
    '@media (max-width:991px){.pw-calc{grid-template-columns:minmax(0,1fr) minmax(0,1.4fr)}}',
    '@media (max-width:767px){.pw-calc{grid-template-columns:minmax(0,1fr)}.pw-calc__value{white-space:normal}}',
    '@media (max-width:420px){.pw-calc__pair{grid-template-columns:minmax(0,1fr)}.pw-calc__seg{grid-auto-flow:row;grid-auto-columns:auto}}',
    '@media (prefers-reduced-motion:reduce){.pw-calc__value,.pw-calc__bar-fill,.pw-calc__tab,.pw-calc__seg-btn{transition:none}}'
  ].join('');

  /* ---------------- page ---------------- */
  function mount(doc, def) {
    var root = doc.querySelector('[data-tool="' + def.id + '"]');
    if (!root || root.getAttribute('data-calc-ready')) return;
    root.setAttribute('data-calc-ready', '1');
    var lang = /^en/i.test(doc.documentElement.getAttribute('lang') || '') ? 'en' : 'da';
    var S = def.strings[lang], H = helpers(lang);
    if (!doc.getElementById('pw-calc-css')) {
      var st = doc.createElement('style'); st.id = 'pw-calc-css'; st.textContent = CSS; (doc.head || doc.documentElement).appendChild(st);
    }
    var uid = 'pw-' + def.id;
    function el(tag, cls, text) { var n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

    var state = { v: {}, t: {} };
    var inputs = {}, fieldEls = [], toggleEls = [];
    (def.toggles || []).forEach(function (t) { state.t[t.key] = t.def; });
    (def.fields || []).forEach(function (f) { state.v[f.key] = f.def == null ? null : f.def; });
    function fmtIn(v, kind) { return v == null ? '' : kind === 'kr' || kind === 'int' ? fmtNum(v, lang, 0) : fmtNum(v, lang, 2); }
    function unitOf(f) {
      if (f.unit) return f.unit[lang] || f.unit;
      return f.kind === 'kr' ? unitKr(lang) : f.kind === 'pct' ? '%' : f.kind === 'x' ? '×' : '';
    }
    function ping(node) { try { node.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) { /* old browsers */ } }

    var calc = el('div', 'pw-calc');
    calc.setAttribute('data-calc', def.id);

    /* toggles: single-choice groups of buttons, role=radio with roving tabindex */
    function toggle(t) {
      var big = !!t.big, wrap = el('div', big ? 'pw-calc__modes' : 'pw-calc__field');
      var lab = el('div', big ? 'pw-calc__band-label' : 'pw-calc__label', S[t.label] || t.label);
      lab.id = uid + '-' + t.key + '-label';
      var grp = el('div', big ? 'pw-calc__tabs' : 'pw-calc__seg');
      grp.setAttribute('role', 'radiogroup'); grp.setAttribute('aria-labelledby', lab.id);
      var btns = t.opts.map(function (o, i) {
        var b = el('button', big ? 'pw-calc__tab' : 'pw-calc__seg-btn');
        b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('data-' + t.key, o.v);
        if (big) {
          b.appendChild(el('span', 'pw-calc__tab-name', S[o.label] || o.label));
          if (o.sub) b.appendChild(el('span', 'pw-calc__tab-sub', S[o.sub] || o.sub));
        } else b.textContent = S[o.label] || o.label;
        b.addEventListener('click', function () { pick(o.v); ping(b); });
        b.addEventListener('keydown', function (e) {
          var k = e.key, j = -1, n = t.opts.length;
          if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % n;
          else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + n) % n;
          else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1;
          if (j > -1) { e.preventDefault(); pick(t.opts[j].v); btns[j].focus(); ping(btns[j]); }
        });
        grp.appendChild(b);
        return b;
      });
      function paint() {
        btns.forEach(function (b, i) {
          var on = String(t.opts[i].v) === String(state.t[t.key]);
          b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
        });
      }
      function pick(v) { if (String(state.t[t.key]) === String(v)) return; state.t[t.key] = v; paint(); render(); }
      wrap.appendChild(lab); wrap.appendChild(grp);
      paint();
      toggleEls.push({ def: t, el: wrap });
      return wrap;
    }

    /* number fields: <label> + <input> + unit, hint linked with aria-describedby */
    function field(f) {
      var wrap = el('div', 'pw-calc__field'), id = uid + '-' + f.key;
      var lab = el('label', 'pw-calc__label', S[f.label] || f.label); lab.htmlFor = id;
      var box = el('div', 'pw-calc__box');
      var inp = el('input', 'pw-calc__input');
      inp.type = 'text'; inp.id = id; inp.setAttribute('autocomplete', 'off'); inp.setAttribute('spellcheck', 'false');
      inp.setAttribute('inputmode', f.kind === 'kr' || f.kind === 'int' ? 'numeric' : 'decimal');
      inp.setAttribute('data-input', f.key);
      if (f.placeholder) inp.placeholder = S[f.placeholder] || f.placeholder;
      inp.value = fmtIn(state.v[f.key], f.kind);
      box.appendChild(inp);
      var u = unitOf(f);
      if (u) { var us = el('span', 'pw-calc__unit', u); us.setAttribute('aria-hidden', 'true'); box.appendChild(us); }
      wrap.appendChild(lab); wrap.appendChild(box);
      if (f.hint) { var h = el('div', 'pw-calc__hint', S[f.hint] || f.hint); h.id = id + '-hint'; inp.setAttribute('aria-describedby', h.id); wrap.appendChild(h); }
      inp.addEventListener('input', function () { onType(inp, f); });
      inp.addEventListener('keydown', function (e) { onKey(e, inp, f); });
      inp.addEventListener('blur', function () { inp.value = fmtIn(state.v[f.key], f.kind); });
      inputs[f.key] = inp;
      fieldEls.push({ def: f, el: wrap });
      return wrap;
    }
    function onType(inp, f) {
      var raw = inp.value;
      if (f.kind === 'kr' || f.kind === 'int') {
        // regroup the digits while typing and keep the caret after the same digit
        var caret = inp.selectionStart == null ? raw.length : inp.selectionStart;
        var before = raw.slice(0, caret).replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '').length;
        var v = parse(raw.split(lang === 'en' ? '.' : ',')[0], lang, f.kind);
        if (v != null && f.max != null) v = Math.min(v, f.max);
        var out = v == null ? '' : fmtNum(v, lang, 0);
        if (out !== raw) {
          inp.value = out;
          var pos = 0, seen = 0;
          while (pos < out.length && seen < before) { if (/[0-9]/.test(out.charAt(pos))) seen++; pos++; }
          try { inp.setSelectionRange(pos, pos); } catch (e) { /* not focused */ }
        }
        state.v[f.key] = v;
      } else {
        var clean = raw.replace(lang === 'en' ? /[^0-9.]/g : /[^0-9.,]/g, '');
        if (clean !== raw) inp.value = clean;
        var x = parse(clean, lang, f.kind);
        if (x != null && f.max != null) x = Math.min(x, f.max);
        state.v[f.key] = x;
      }
      render();
    }
    // Up/Down step the value (Shift = 10x); stops propagation so the site's shared stepper never steps twice
    function onKey(e, inp, f) {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault(); e.stopPropagation();
      var v = state.v[f.key] || 0, a = Math.abs(v), step;
      if (f.step) step = f.step;
      else if (f.kind === 'kr') step = a >= 10000 ? Math.pow(10, Math.floor(Math.log(a) / Math.LN10) - 1) : a >= 1000 ? 100 : 10;
      else if (f.kind === 'int') step = 1;
      else if (f.kind === 'x') step = 0.1;
      else step = a < 10 ? 0.5 : 1;
      if (e.shiftKey) step *= 10;
      var nv = Math.max(f.min || 0, Math.round((v + (e.key === 'ArrowUp' ? 1 : -1) * step) / step) * step);
      if (f.max != null) nv = Math.min(nv, f.max);
      nv = Math.round(nv * 100) / 100;
      state.v[f.key] = nv; inp.value = fmtIn(nv, f.kind);
      ping(inp);
      render();
    }

    // layout: big toggles (mode band) first, then the input column, then results
    var inCol = el('div', 'pw-calc__inputs');
    (def.toggles || []).forEach(function (t) { if (t.big) calc.appendChild(toggle(t)); });
    (def.layout || []).forEach(function (item) {
      if (typeof item === 'string') {
        var t = (def.toggles || []).filter(function (x) { return x.key === item.replace(/^toggle:/, ''); })[0];
        if (/^toggle:/.test(item) && t) { inCol.appendChild(toggle(t)); return; }
        var f = (def.fields || []).filter(function (x) { return x.key === item; })[0];
        if (f) inCol.appendChild(field(f));
      } else if (item && item.pair) {
        var p = el('div', 'pw-calc__pair');
        item.pair.forEach(function (k) { var f2 = (def.fields || []).filter(function (x) { return x.key === k; })[0]; if (f2) p.appendChild(field(f2)); });
        // a hint for the pair goes under both fields, so the two boxes stay level
        if (item.hint) {
          var ph = el('div', 'pw-calc__hint', S[item.hint] || item.hint); ph.id = uid + '-' + item.pair[0] + '-hint'; ph.style.gridColumn = '1/-1';
          p.appendChild(ph);
          var fi = inputs[item.pair[0]]; if (fi) fi.setAttribute('aria-describedby', ph.id);
        }
        fieldEls.push({ def: { show: item.show }, el: p });
        inCol.appendChild(p);
      }
    });
    calc.appendChild(inCol);

    var res = el('div', 'pw-calc__results');
    var hero = el('div', 'pw-calc__hero');
    hero.appendChild(el('div', 'pw-calc__glow'));
    var kicker = el('div', 'pw-calc__kicker'), value = el('div', 'pw-calc__value'), sub = el('div', 'pw-calc__sub');
    var warn = el('div', 'pw-calc__warn'); warn.setAttribute('role', 'status'); warn.hidden = true;
    hero.appendChild(kicker); hero.appendChild(value); hero.appendChild(sub); hero.appendChild(warn);
    res.appendChild(hero);
    var cards = [0, 1, 2].map(function () {
      var c = el('div', 'pw-calc__card'), l = el('div', 'pw-calc__card-label'), m = el('div', 'pw-calc__metric');
      var bar = el('div', 'pw-calc__bar'), fill = el('div', 'pw-calc__bar-fill'), n = el('div', 'pw-calc__note');
      bar.appendChild(fill); bar.hidden = true;
      c.appendChild(l); c.appendChild(m); c.appendChild(bar); c.appendChild(n); res.appendChild(c);
      return { card: c, label: l, metric: m, bar: bar, fill: fill, note: n };
    });
    var band = el('div', 'pw-calc__band'); res.appendChild(band);
    var live = el('div', 'pw-calc__sr'); live.setAttribute('aria-live', 'polite'); res.appendChild(live);
    calc.appendChild(res);
    while (root.firstChild) root.removeChild(root.firstChild);
    root.appendChild(calc);

    // a sentence that ends on an amount in kroner ends on its own full stop ("500.000 kr." never gets "kr..")
    function tidy(t) { return t == null ? '' : String(t).replace(/kr\.\./g, 'kr.'); }
    function setText(node, t) { t = tidy(t); if (node.textContent !== t) node.textContent = t; }
    // trusted strings from the module only: allow <a href> and <strong> in fine print / explanations
    function setRich(node, html) { html = tidy(html); if (node.__h !== html) { node.innerHTML = html; node.__h = html; } }

    var lastHero = null, liveTimer = 0, reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    function render() {
      fieldEls.forEach(function (x) { var show = x.def.show ? !!x.def.show(state) : true; if (x.el.hidden === show) x.el.hidden = !show; });
      toggleEls.forEach(function (x) { var show = x.def.show ? !!x.def.show(state) : true; if (x.el.hidden === show) x.el.hidden = !show; });
      var w = def.view(state, lang, H, S);
      setText(kicker, w.kicker); setText(value, w.hero); setText(sub, w.sub);
      warn.hidden = !w.warn; setText(warn, w.warn || '');
      cards.forEach(function (c, i) {
        var m = w.metrics[i];
        c.card.hidden = !m; if (!m) return;
        setText(c.label, m.label); setText(c.metric, m.value); setText(c.note, m.note);
        c.bar.hidden = m.bar == null; if (m.bar != null) c.fill.style.width = Math.max(0, Math.min(100, m.bar)) + '%';
      });
      // breakdown band: sections of rows, then the formula, the explanation and the fine print
      var html = '';
      var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
      (w.sections || []).forEach(function (sec) {
        html += '<div class="pw-calc__band-label">' + esc(sec.title) + '</div><div class="pw-calc__table" role="table" aria-label="' + esc(sec.title) + '">';
        sec.rows.forEach(function (r) {
          html += '<div class="pw-calc__row' + (r.total ? ' pw-calc__row--total' : '') + '" role="row"><div class="pw-calc__row-main" role="cell"><span class="pw-calc__row-label">' + esc(r.label) + '</span>' +
            (r.calc ? '<span class="pw-calc__row-calc">' + esc(r.calc) + '</span>' : '') + '</div><div class="pw-calc__row-amount" role="cell">' + esc(r.amount) + '</div></div>';
        });
        html += '</div>';
      });
      if (w.formula) html += '<div class="pw-calc__band-label">' + esc(S.formulaTitle || (lang === 'en' ? 'Formula' : 'Formel')) + '</div><p class="pw-calc__formula">' + esc(w.formula) + '</p>';
      if (w.explain) html += '<p class="pw-calc__explain">' + w.explain + '</p>';
      if (w.fine) html += '<p class="pw-calc__fine">' + w.fine + '</p>';
      setRich(band, html);
      if (lastHero !== null && lastHero !== w.hero && !reduce) {
        value.style.transform = 'scale(1.015)';
        setTimeout(function () { value.style.transform = 'none'; }, 160);
      }
      lastHero = w.hero;
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () { setText(live, w.live || (w.kicker + ': ' + w.hero + '.')); }, 500);
    }
    render();
    return { state: state, render: render };
  }

  return { mount: mount, helpers: helpers, parse: parse, fmtNum: fmtNum, fmtFixed: fmtFixed, fmtKr: fmtKr, fmtPct: fmtPct, nz: nz, tpl: tpl, CSS: CSS };
});
