/* OTE calculator (/ote-calculator). Port of the OTE block in Prowi Pages.dc.html.
   Static markup = default state (60.000 / 40.000 / 400.000, SMB). This module swaps the
   [data-input] spans for real inputs and updates the [data-o] outputs in place. */
(function () {
  var root = document.querySelector('[data-tool="ote"]');
  if (!root) return;

  var isEn = String(document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var DA = {
    'Enter all three figures.': 'Indtast alle tre tal.',
    'In line with the benchmark.': 'På niveau med benchmark.',
    'Quota is high for this OTE. Reps carry more risk than peers.': 'Målet er højt for denne OTE. Sælgerne bærer mere risiko end deres kolleger.',
    'Quota is low for this OTE. Commission may be expensive per euro sold.': 'Målet er lavt for denne OTE. Provisionen kan blive dyr pr. solgt euro.',
    'Base-heavy. Typical for CSM and SDR roles.': 'Grundlønstung. Typisk for CSM- og SDR-roller.',
    'Balanced. Typical for account executives.': 'Balanceret. Typisk for account executives.',
    'Variable-heavy. Typical for enterprise closers and new-business hunters.': 'Variabel-tung. Typisk for enterprise-closere og nysalgsjægere.',
    ' vs OTE': ' ift. OTE',
    'Benchmark {t} for {s}': 'Benchmark {t} for {s}',
    'Of every €100 the rep closes, {p} goes to commission at target.': 'Af hver €100 sælgeren lukker, går {p} til provision ved målet.'
  };
  function T(s) { return (!isEn && DA[s]) || s; }

  // [name, benchmark quota ÷ OTE]
  var SIZES = [['Startup', 5], ['SMB', 4], ['Scale-up', 3.5], ['Enterprise', 3]];
  var SIZE_NAME_DA = { Startup: 'startups', SMB: "SMB'er", 'Scale-up': 'scale-ups', Enterprise: 'enterprise' };
  function sizeName(n) { return isEn ? (n === 'SMB' ? 'SMBs' : n.toLowerCase() + 's') : SIZE_NAME_DA[n]; }

  function num(s) { return Number(String(s).replace(/[^0-9]/g, '')) || 0; }
  // thousands: '.' on Danish pages, ',' on English pages; decimals the other way round
  function group(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, isEn ? ',' : '.'); }
  function dec(x, k) { var s = x.toFixed(k); return isEn ? s : s.replace('.', ','); }
  function fmtE(n) { var r = Math.round(n); return (r < 0 ? '-' : '') + '€' + group(Math.abs(r)); }

  function out(k) { return root.querySelector('[data-o="' + k + '"]'); }
  function setText(k, v) { var el = out(k); if (el && el.textContent !== v) el.textContent = v; }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- inputs ----
  var tgt = { base: 0, vari: 0, quota: 0 };
  var KEYMAP = { base: 'base', 'var': 'vari', quota: 'quota' };
  Array.prototype.forEach.call(root.querySelectorAll('[data-input]'), function (span) {
    var key = span.getAttribute('data-input');
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.setAttribute('inputmode', 'numeric');
    inp.className = span.className;
    inp.value = span.textContent.trim();
    inp.setAttribute('data-input', key);
    var field = span.closest('.pw-tool__field') || span.parentNode.parentNode;
    var lab = field && field.firstElementChild;
    if (lab && lab !== span.parentNode) inp.setAttribute('aria-label', lab.textContent.trim());
    span.parentNode.replaceChild(inp, span);
    tgt[KEYMAP[key]] = num(inp.value);
    if (tgt[KEYMAP[key]]) inp.value = group(tgt[KEYMAP[key]]);
    inp.addEventListener('input', function () {
      var raw = inp.value, caret = inp.selectionStart == null ? raw.length : inp.selectionStart;
      var digitsBefore = raw.slice(0, caret).replace(/[^0-9]/g, '').replace(/^0+/, '').length;
      var v = num(raw), f = v ? group(v) : '';
      if (f !== raw) {
        inp.value = f;
        var pos = 0, seen = 0;
        while (pos < f.length && seen < digitsBefore) { if (/[0-9]/.test(f.charAt(pos))) seen++; pos++; }
        try { inp.setSelectionRange(pos, pos); } catch (e) { /* ignore */ }
      }
      tgt[KEYMAP[key]] = v;
      go();
    });
  });

  // ---- company size options ----
  var size = 1;
  var opts = root.querySelectorAll('[data-size]');
  Array.prototype.forEach.call(opts, function (a) {
    var i = Number(a.getAttribute('data-size'));
    if (a.classList.contains('pw-ote__size--on')) size = i;
    a.setAttribute('role', 'button');
    a.setAttribute('tabindex', '0');
    a.addEventListener('click', function (e) { e.preventDefault(); pick(i); });
    a.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); }
    });
  });
  function paintSizes() {
    Array.prototype.forEach.call(opts, function (a) {
      var on = Number(a.getAttribute('data-size')) === size;
      a.classList.toggle('pw-ote__size--on', on);
      a.classList.toggle('pw-ote__size--off', !on);
      a.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function pick(i) { if (i === size) return; size = i; paintSizes(); render(); }

  // ---- render ----
  var A = { base: tgt.base, vari: tgt.vari, quota: tgt.quota };
  function render() {
    var base = A.base, vari = A.vari, quota = A.quota, oteV = base + vari;
    var baseT = tgt.base, varT = tgt.vari, quotaT = tgt.quota;
    var sz = SIZES[size] || SIZES[1], bm = sz[1];
    var ratio = oteV ? quota / oteV : 0;
    var ratioT = (baseT + varT) ? quotaT / (baseT + varT) : 0;
    var diff = ratioT - bm;
    var empty = !(baseT + varT) || !quotaT;
    var verdict = T(empty ? 'Enter all three figures.' : Math.abs(diff) <= 0.4 ? 'In line with the benchmark.' : diff > 0 ? 'Quota is high for this OTE. Reps carry more risk than peers.' : 'Quota is low for this OTE. Commission may be expensive per euro sold.');
    var vColor = empty ? '#5E5B98' : Math.abs(diff) <= 0.4 ? '#0E7A36' : '#B8710A';
    var mixFixed = oteV ? Math.round(base / oteV * 100) : 0;
    var rate = quota ? vari / quota : 0;
    var per100 = rate ? '€' + dec(rate * 100, 2) : '—';

    setText('ote', fmtE(oteV));
    setText('base', fmtE(base));
    setText('var', fmtE(vari));
    setText('mix', mixFixed + ' / ' + (100 - mixFixed));
    var bar = out('mixbar'); if (bar) bar.style.width = mixFixed + '%';
    setText('mixnote', T(mixFixed >= 70 ? 'Base-heavy. Typical for CSM and SDR roles.' : mixFixed >= 55 ? 'Balanced. Typical for account executives.' : 'Variable-heavy. Typical for enterprise closers and new-business hunters.'));
    setText('ratio', ratio ? dec(ratio, 1) + '×' : '—');
    setText('bench', T('Benchmark {t} for {s}').replace('{t}', String(bm) + '×').replace('{s}', sizeName(sz[0])));
    setText('verdict', verdict);
    var vb = out('verdictbox'); if (vb) vb.style.color = vColor;
    setText('rate', rate ? dec(rate * 100, 1) + (isEn ? '%' : ' %') : '—');
    setText('per100', T('Of every €100 the rep closes, {p} goes to commission at target.').replace('{p}', per100));
    [0.8, 1, 1.2].forEach(function (pct, i) {
      setText('s' + i + 'total', fmtE(base + vari * pct));
      setText('s' + i + 'note', pct === 1 ? 'OTE' : (pct < 1 ? '-' : '+') + fmtE(Math.abs(vari * (pct - 1))) + T(' vs OTE'));
    });
    var tweening = Math.abs(base - baseT) + Math.abs(vari - varT) + Math.abs(quota - quotaT) > 0.5;
    var hero = out('ote'); hero = hero && hero.parentNode;
    if (hero) hero.style.transform = tweening ? 'scale(1.015)' : 'none';
  }

  // s-curve tween (cubic ease-in-out, 900ms) from the shown values to the new targets
  var raf = 0;
  function go() {
    if (raf) cancelAnimationFrame(raf);
    if (reduce || !window.requestAnimationFrame) { A = { base: tgt.base, vari: tgt.vari, quota: tgt.quota }; render(); return; }
    var from = { base: A.base, vari: A.vari, quota: A.quota }, to = { base: tgt.base, vari: tgt.vari, quota: tgt.quota };
    var t0 = performance.now(), dur = 900;
    function step(now) {
      var x = Math.min(1, (now - t0) / dur);
      var e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      A = { base: from.base + (to.base - from.base) * e, vari: from.vari + (to.vari - from.vari) * e, quota: from.quota + (to.quota - from.quota) * e };
      render();
      raf = x < 1 ? requestAnimationFrame(step) : 0;
    }
    raf = requestAnimationFrame(step);
  }

  paintSizes();
  render();
})();

