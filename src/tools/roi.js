/* Business case (ROI) calculator. Ported from the Claude Design source (Prowi Pages.dc.html, "business case").
   Static markup = default state; this module turns [data-input] spans into inputs and updates [data-roi] outputs in place. */
(function () {
  function init() {
  var root = document.querySelector('[data-tool="roi"]');
  if (!root) return;

  var isDa = !/^en/i.test(document.documentElement.lang || '');
  var DA = {
    '{g} saved, {c} for Prowi at €{p} per user per month.': '{g} sparet, {c} til Prowi ved €{p} pr. bruger pr. måned.',
    'At these inputs Prowi costs more than it saves in year one. Most teams under-estimate finance hours; check the number.': 'Med disse tal koster Prowi mere, end det sparer i år et. De fleste teams undervurderer økonomitimerne; tjek tallet.',
    '< 1 month': '< 1 måned',
    'months': 'måneder',
    'days': 'dage',
    'h': 't',
    'users': 'brugere',
    'Time until the yearly Prowi fee is covered by savings.': 'Tid, før den årlige Prowi-pris er dækket af besparelser.',
    'No payback at these inputs.': 'Ingen tilbagebetaling med disse tal.',
    '{e}% of {p} paid, 90% caught by live calculation and rep confirmation.': '{e} % af {p} udbetalt, 90 % fanget af live-beregning og sælgerens bekræftelse.'
  };
  function T(s) { return (isDa && DA[s]) || s; }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DEF = { reps: 25, paid: 900000, finH: 24, repH: 1, finCost: 65, repCost: 55, err: 1, cut: 80 };

  // thousands with '.', as the design's toLocaleString('de-DE') in both languages
  function grp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function fE(n) { return (n < 0 ? '−' : '') + '€' + grp(Math.abs(Math.round(n))); }
  function num(n) { var s = String(n); return isDa ? s.replace('.', ',') : s; }

  // --- inputs -------------------------------------------------------------
  var inputs = {};
  Array.prototype.forEach.call(root.querySelectorAll('[data-input]'), function (span) {
    var key = span.getAttribute('data-input');
    var el = document.createElement('input');
    el.type = 'text';
    el.setAttribute('inputmode', 'numeric');
    el.setAttribute('autocomplete', 'off');
    el.className = span.className;
    el.setAttribute('data-input', key);
    el.value = span.textContent;
    var field = span.parentNode && span.parentNode.parentNode;
    var lab = field && field.firstElementChild;
    if (lab && lab !== span.parentNode) el.setAttribute('aria-label', lab.textContent.trim());
    span.parentNode.replaceChild(el, span);
    el.addEventListener('input', function () { sanitize(key, el); update(true); });
    inputs[key] = el;
  });

  function sanitize(key, el) {
    var v = el.value, caret = el.selectionStart == null ? v.length : el.selectionStart, out;
    if (key === 'paid') {
      // keep digits only, re-group with dots; keep the caret after the same digit
      var digitsBefore = v.slice(0, caret).replace(/\D/g, '').length;
      var d = v.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
      out = d === '' ? '' : grp(d);
      if (out !== v) {
        el.value = out;
        var pos = 0, seen = 0;
        while (pos < out.length && seen < digitsBefore) { if (/\d/.test(out[pos])) seen++; pos++; }
        try { el.setSelectionRange(pos, pos); } catch (e) {}
      }
    } else {
      out = v.replace(/[^0-9.,]/g, '');
      if (out !== v) {
        el.value = out;
        var p2 = Math.max(0, caret - (v.length - out.length));
        try { el.setSelectionRange(p2, p2); } catch (e) {}
      }
    }
  }

  function read(key) {
    var el = inputs[key];
    var s = el ? String(el.value).trim() : '';
    if (s === '') return DEF[key];
    var n = key === 'paid' ? Number(s.replace(/\D/g, '')) : Number(s.replace(',', '.'));
    return isNaN(n) ? DEF[key] : n;
  }

  // --- outputs ------------------------------------------------------------
  var out = {};
  Array.prototype.forEach.call(root.querySelectorAll('[data-roi]'), function (el) {
    out[el.getAttribute('data-roi')] = el;
  });
  function setText(key, text) {
    var el = out[key];
    if (!el) return;
    var t = el.firstElementChild || el;
    if (t.textContent !== text) t.textContent = text;
  }
  function setWidth(key, pct) { if (out[key]) out[key].style.width = pct + '%'; }

  var shown = null, raf = 0, maxBar = 1;

  function paint(RA) {
    var gross = RA.fin + RA.rep + RA.err, net = gross - RA.cost;
    setText('net', fE(net));
    setText('gross', fE(gross));
    setText('cost', fE(RA.cost));
    setText('errV', fE(RA.err));
    setWidth('segFin', RA.fin / maxBar * 100);
    setWidth('segRep', RA.rep / maxBar * 100);
    setWidth('segErr', RA.err / maxBar * 100);
    setWidth('segCost', RA.cost / maxBar * 100);
  }

  function update(animate) {
    var reps = read('reps'), paid = read('paid'), finH = read('finH'), repH = read('repH'),
      finCost = read('finCost'), repCost = read('repCost'), errPct = read('err'), cut = read('cut') / 100;
    var perRep = reps >= 50 ? 89 : reps >= 25 ? 49 : 37; // Starter €37 / Business €49 / Prowi Plus €89 per user per month
    var t = { fin: finH * 12 * finCost * cut, rep: reps * repH * 12 * repCost * cut, err: paid * errPct / 100 * 0.9, cost: reps * perRep * 12 };
    var grossT = t.fin + t.rep + t.err, netT = grossT - t.cost;
    maxBar = Math.max(grossT, t.cost, 1);
    var payM = grossT > 0 ? t.cost / (grossT / 12) : 0;
    var hasPay = payM > 0 && payM < 60;

    if (out.net) out.net.style.color = netT < 0 ? '#F08A8A' : '';
    setText('netSub', netT >= 0
      ? T('{g} saved, {c} for Prowi at €{p} per user per month.').replace('{g}', fE(grossT)).replace('{c}', fE(t.cost)).replace('{p}', String(perRep))
      : T('At these inputs Prowi costs more than it saves in year one. Most teams under-estimate finance hours; check the number.'));
    setText('payback', hasPay ? (payM < 1 ? T('< 1 month') : payM.toFixed(1).replace('.', isDa ? ',' : '.') + ' ' + T('months')) : '—');
    setText('paybackSub', hasPay ? T('Time until the yearly Prowi fee is covered by savings.') : T('No payback at these inputs.'));
    setText('days', Math.round(finH * 12 * cut / 7.5) + ' ' + T('days'));
    setText('errSub', T('{e}% of {p} paid, 90% caught by live calculation and rep confirmation.').replace('{e}', num(errPct)).replace('{p}', fE(paid)));
    var pc = Math.round(cut * 100) + '%';
    setText('lineFin', num(finH) + ' ' + T('h') + ' × 12 × €' + num(finCost) + ' × ' + pc);
    setText('lineRep', num(reps) + ' × ' + num(repH) + ' ' + T('h') + ' × 12 × €' + num(repCost) + ' × ' + pc);
    setText('lineErr', num(errPct) + '% × ' + fE(paid) + ' × 90%');
    setText('lineCost', num(reps) + ' ' + T('users') + ' × €' + perRep + ' × 12');

    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!animate || reduce || !shown) { shown = t; paint(t); return; }
    var from = shown, t0 = performance.now(), dur = 900;
    var step = function (now) {
      var x = Math.min(1, (now - t0) / dur);
      var e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      var cur = {};
      for (var k in t) cur[k] = from[k] + (t[k] - from[k]) * e;
      shown = cur; paint(cur);
      raf = x < 1 ? requestAnimationFrame(step) : 0;
    };
    raf = requestAnimationFrame(step);
  }

  update(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
