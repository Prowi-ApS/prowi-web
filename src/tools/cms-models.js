/* Commission models (CMS "Provisionsmodeller"): hub finder + item-page calculator.
   Hub root: [data-models="hub"] (/provisionsmodeller). Item root: [data-models="item"] (/provisionsmodeller/<slug>).
   Ported from the MODELS / MODEL DETAIL blocks of "Prowi Pages.dc.html":
   - hub: each card draws its payout curve from the model id (hidden .pw-models__id, bound to the "model-id" field),
     complexity dots from the hidden .pw-models__cx-n (bound to "complexity"); search over name, goal, summary,
     example, pros, cons, best for, "works if" and roles; role chips + goal chips; "n af N" count; goal chips without
     hits under the current search turn pale; cards and curves re-enter on every filter change; empty state below the grid;
   - item: the calculator (inputs, slider, result, curve, 3 cells) for the model in .pw-model__id; sim configs are
     design constants keyed by model id; the "Other models" list hides the current item and keeps 4.
   Money is € in both languages (handover §14) with "." thousands; decimals use "," in Danish. */
(function () {
  var hub = document.querySelector('[data-models="hub"]');
  var item = document.querySelector('[data-models="item"]');
  if (!hub && !item) return;
  var root = hub || item;
  if (root.__pwModels) return;
  root.__pwModels = 1;
  var EN = /^en/i.test(document.documentElement.lang || '');
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---- design constants (models.js): payout curve for the hub card, step flag, complexity fallback, simulator config
  var M = {
    flat: { c: 1, curve: [[0, 0], [50, 50], [100, 100], [150, 150]], sim: { kind: 'rate', rate: 10, quota: 400000 } },
    milestone: { c: 1, step: 1, curve: [[0, 0], [100, 100], [150, 100]], sim: { kind: 'bonus', bonus: 5000, quota: 400000 } },
    accelerator: { c: 2, curve: [[0, 0], [100, 100], [150, 175]], sim: { kind: 'accel', rate: 8, rate2: 12, quota: 400000 } },
    tiered: { c: 2, curve: [[0, 0], [70, 55], [100, 100], [150, 185]], sim: { kind: 'tiers', tiers: [[70, 5], [100, 8], [999, 12]], quota: 400000 } },
    decelerator: { c: 2, curve: [[0, 0], [60, 30], [100, 100], [150, 150]], sim: { kind: 'decel', rate: 8, rateLow: 4, floor: 60, quota: 400000 } },
    margin: { c: 3, curve: [[0, 0], [100, 100], [150, 150]], sim: { kind: 'margin', rate: 20, margin: 40, quota: 400000 } },
    draw: { c: 2, curve: [[0, 60], [60, 60], [100, 100], [150, 150]], sim: { kind: 'draw', rate: 10, draw: 3000, quota: 400000 } },
    split: { c: 2, curve: [[0, 0], [100, 100], [150, 150]], sim: { kind: 'split', rate: 10, shares: [70, 20, 10], quota: 400000 } },
    team: { c: 1, step: 1, curve: [[0, 0], [100, 100], [150, 100]], sim: { kind: 'bonus', bonus: 8000, quota: 2000000 } },
    residual: { c: 2, curve: [[0, 0], [100, 100], [150, 150]], sim: { kind: 'residual', rate: 3, mrr: 5000, months: 12 } },
    clawback: { c: 2, step: 1, curve: [[0, 0], [100, 100], [150, 150]], sim: { kind: 'clawback', rate: 10, deal: 50000, windows: [[90, 100], [180, 50]] } },
    spiff: { c: 1, curve: [[0, 0], [100, 100], [150, 150]], sim: { kind: 'spiff', bonus: 500, quota: 400000 } }
  };

  // ---- strings: every JS-rendered string in English and Danish
  function t(en, da, v) {
    var s = EN ? en : da;
    if (v) for (var k in v) s = s.split('{' + k + '}').join(v[k]);
    return s;
  }

  // ---- number formatting
  function grp(n) { return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function eur(n) { return (Math.round(n) < 0 ? '-' : '') + '€' + grp(n); }
  function dec(x) { var s = String(x); return EN ? s : s.replace('.', ','); }
  function d1(x) { return dec(x.toFixed(1)); }
  function pc(x) { return dec(x) + (EN ? '%' : ' %'); }
  function kfmt(n) { return n >= 1000000 ? '€' + d1(n / 1000000) + t('m', ' mio.') : n >= 1000 ? '€' + Math.round(n / 1000) + 'k' : '€' + Math.round(n); }

  // ---- curve geometry (viewBox 300 × 110 plot, x = attainment 0–150 %, y = payout 0–200 % of target)
  function toXY(p) { return [p[0] / 150 * 300, 110 - p[1] / 200 * 100]; }
  function f1(n) { return n.toFixed(1); }
  function toStep(pts) {
    var P = pts.map(toXY), d = 'M' + f1(P[0][0]) + ' ' + f1(P[0][1]);
    for (var i = 1; i < P.length; i++) d += ' H' + f1(P[i][0]) + ' V' + f1(P[i][1]);
    return d;
  }
  function toPath(pts) { // Catmull-Rom → cubic Bézier, hard steps kept when x barely changes
    var P = pts.map(toXY), d = 'M' + f1(P[0][0]) + ' ' + f1(P[0][1]);
    for (var i = 0; i < P.length - 1; i++) {
      var p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      if (Math.abs(p2[0] - p1[0]) < 1) { d += ' L' + f1(p2[0]) + ' ' + f1(p2[1]); continue; }
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + f1(c1[0]) + ' ' + f1(c1[1]) + ' ' + f1(c2[0]) + ' ' + f1(c2[1]) + ' ' + f1(p2[0]) + ' ' + f1(p2[1]);
    }
    return d;
  }
  function toArea(pts) { return toPath(pts) + ' L' + f1(pts[pts.length - 1][0] / 150 * 300) + ' 110 L0 110 Z'; }
  function yAt(pts, x) { // payout % at attainment x (linear between points)
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      if (x <= b[0]) { var f = b[0] === a[0] ? 1 : (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * f; }
    }
    return pts[pts.length - 1][1];
  }
  function line(m, pts) { return m.step ? toStep(pts) : toPath(pts); }
  function area(m, pts) { return m.step ? toStep(pts) + ' V110 H0 Z' : toArea(pts); }

  var css = '@keyframes pwModelsIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +
    '@keyframes pwModelsDraw{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}' +
    '@keyframes pwModelsFade{from{opacity:0}to{opacity:1}}' +
    '.pw-models__goal--dim{opacity:.35}' +
    '.pw-models__empty{max-width:1120px;margin:20px auto 0;padding:48px 24px;text-align:center;border:1px solid rgba(17,6,99,.10);display:flex;flex-direction:column;gap:8px;align-items:center}' +
    '.pw-models__empty-title{font-size:18px;font-weight:400;color:#110663}' +
    '.pw-models__empty-text{font-size:14px;color:#6664A0}' +
    'input.pw-models__search-input{font-family:inherit;line-height:normal;padding:0;margin:0;-webkit-appearance:none;appearance:none;box-shadow:none;height:auto}' +
    'input.pw-models__search-input::placeholder{color:#A1A0BD;opacity:1}' +
    'input.pw-models__search-input::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}' +
    'input.pw-model__range{margin:0;height:auto;padding:0;border:0;background:none;box-shadow:none}' +
    'input.pw-tool__input::placeholder{color:#110663;opacity:.45}' +
    '.pw-model__dot{transition:cx 220ms cubic-bezier(0.2,0.6,0.2,1),cy 220ms cubic-bezier(0.2,0.6,0.2,1),x1 220ms,x2 220ms}';
  if (!document.getElementById('pw-models-css')) {
    var st = document.createElement('style');
    st.id = 'pw-models-css';
    st.textContent = css;
    document.head.appendChild(st);
  }
  function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function leaf(el) { return el && (el.querySelector('span') || el); }

  // =====================================================================================  HUB
  if (hub) {
    var cards = [].slice.call(hub.querySelectorAll('.pw-models__card'));
    var data = cards.map(function (a, i) {
      var id = txt(a.querySelector('.pw-models__id'));
      var m = M[id] || M.flat;
      var cx = Number(txt(a.querySelector('.pw-models__cx-n'))) || m.c;
      var roles = [].slice.call(a.querySelectorAll('.pw-models__roles li')).map(txt);
      var svg = a.querySelector('.pw-models__curve');
      var parts = svg ? { grad: svg.querySelector('linearGradient, lineargradient'), area: svg.querySelector('[data-m="area"]'), line: svg.querySelector('[data-m="line"]'), dot: svg.querySelector('[data-m="dot"]') } : {};
      if (parts.grad) parts.grad.setAttribute('id', 'mg-' + id + '-' + i);
      if (parts.area) { parts.area.setAttribute('d', area(m, m.curve)); parts.area.setAttribute('fill', 'url(#mg-' + id + '-' + i + ')'); }
      if (parts.line) parts.line.setAttribute('d', line(m, m.curve));
      if (parts.dot) parts.dot.setAttribute('cy', f1(110 - yAt(m.curve, 100) / 200 * 100));
      [].slice.call(a.querySelectorAll('.pw-models__cx-dot, .pw-models__cx-dot--on')).forEach(function (d, k) {
        var on = cx >= k + 1;
        d.classList.toggle('pw-models__cx-dot--on', on);
        d.classList.toggle('pw-models__cx-dot', !on);
      });
      var dots = a.querySelector('.pw-models__cx'); if (dots) dots.setAttribute('title', t('Complexity', 'Kompleksitet') + ' ' + cx + '/3');
      var text = ['.pw-models__card-name', '.pw-models__card-tag', '.pw-models__card-summary', '.pw-models__example-text', '.pw-models__best-text', '.pw-models__list', '.pw-models__meta']
        .map(function (s) { return [].slice.call(a.querySelectorAll(s)).map(function (el) { return [].slice.call(el.querySelectorAll('li')).length ? [].slice.call(el.querySelectorAll('li')).map(txt).join(' ') : txt(el); }).join(' '); }).join(' ');
      return { a: a, cell: a.parentElement && a.parentElement.classList.contains('w-dyn-item') ? a.parentElement : a, tag: txt(a.querySelector('.pw-models__card-tag')), roles: roles, text: text.toLowerCase(), parts: parts };
    });
    var total = data.length;
    var grid = hub.querySelector('.pw-models__grid');
    var gridBox = grid && grid.closest('.w-dyn-list') || grid;
    var countEl = hub.querySelector('.pw-models__count');
    var roleChips = [].slice.call(hub.querySelectorAll('[data-chip="role"]'));
    var goalChips = [].slice.call(hub.querySelectorAll('[data-chip="goal"]'));
    var state = { q: '', role: '', goal: '' };

    var ph = hub.querySelector('[data-input="mq"]'), input = null;
    if (ph) {
      input = document.createElement('input');
      input.type = 'search';
      input.className = ph.className;
      input.placeholder = t('Search models, e.g. over-performance, discounting, new hires', 'Søg i modeller, fx overpræstation, rabat, nye sælgere');
      input.setAttribute('aria-label', t('Search commission models', 'Søg i provisionsmodeller'));
      input.autocomplete = 'off';
      ph.parentNode.replaceChild(input, ph);
      input.addEventListener('input', function () { state.q = input.value; state.role = ''; state.goal = ''; render(true); });
    }
    var empty = document.createElement('div');
    empty.className = 'pw-models__empty';
    empty.style.display = 'none';
    var emptyTitle = document.createElement('span'); emptyTitle.className = 'pw-models__empty-title';
    var emptyText = document.createElement('span'); emptyText.className = 'pw-models__empty-text';
    emptyText.textContent = t('Try what you want the plan to do, e.g. “retention” or “discount”.', 'Prøv det, du vil have planen til at gøre, fx “fastholdelse” eller “rabat”.');
    empty.appendChild(emptyTitle); empty.appendChild(emptyText);
    if (gridBox && gridBox.parentNode) gridBox.parentNode.insertBefore(empty, gridBox.nextSibling);

    function wire(ch, key) {
      ch.setAttribute('role', 'button');
      ch.setAttribute('tabindex', '0');
      function go(e) {
        if (e) e.preventDefault();
        var v = ch.hasAttribute('data-all') ? '' : txt(ch);
        state[key] = state[key] === v ? '' : v;
        render(true);
      }
      ch.addEventListener('click', go);
      ch.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') go(e); });
    }
    roleChips.forEach(function (ch) { wire(ch, 'role'); });
    goalChips.forEach(function (ch) { wire(ch, 'goal'); });

    function anim(d, n) {
      if (REDUCED) return;
      var p = d.parts, k = Math.min(n, 11);
      [d.a, p.line, p.area, p.dot].forEach(function (el) { if (el) { el.style.animation = 'none'; void (el.getBoundingClientRect && el.getBoundingClientRect()); } });
      d.a.style.animation = 'pwModelsIn 420ms cubic-bezier(0.2,0.6,0.2,1) ' + k * 40 + 'ms both';
      if (p.line) { p.line.style.strokeDasharray = '600'; p.line.style.animation = 'pwModelsDraw 900ms cubic-bezier(0.2,0.6,0.2,1) ' + (120 + k * 60) + 'ms both'; }
      if (p.area) p.area.style.animation = 'pwModelsFade 700ms cubic-bezier(0.2,0.6,0.2,1) ' + (400 + k * 60) + 'ms both';
      if (p.dot) p.dot.style.animation = 'pwModelsFade 400ms cubic-bezier(0.2,0.6,0.2,1) ' + (900 + k * 60) + 'ms both';
    }
    function paintChips(chips, key, avail) {
      chips.forEach(function (ch) {
        var v = ch.hasAttribute('data-all') ? '' : txt(ch);
        var sel = state[key] === v;
        var on = key === 'goal' ? 'pw-models__goal--on' : 'pw-models__chip--on', off = key === 'goal' ? 'pw-models__goal' : 'pw-models__chip';
        ch.classList.toggle(on, sel);
        ch.classList.toggle(off, !sel);
        if (avail) ch.classList.toggle('pw-models__goal--dim', !!v && !avail[v]);
        ch.setAttribute('aria-pressed', sel ? 'true' : 'false');
      });
    }
    function render(animate) {
      var q = state.q.trim().toLowerCase();
      var hits = data.filter(function (d) { return !q || d.text.indexOf(q) !== -1; });
      var shown = hits.filter(function (d) { return (!state.goal || d.tag === state.goal) && (!state.role || d.roles.indexOf(state.role) !== -1); });
      var avail = {}; hits.forEach(function (d) { avail[d.tag] = 1; });
      var n = 0;
      data.forEach(function (d) {
        var on = shown.indexOf(d) !== -1;
        d.cell.style.display = on ? '' : 'none';
        if (on && animate) anim(d, n);
        if (on) n++;
      });
      paintChips(roleChips, 'role', null);
      paintChips(goalChips, 'goal', avail);
      if (countEl) leaf(countEl).textContent = shown.length + t(' of ', ' af ') + total;
      var none = !shown.length;
      empty.style.display = none ? '' : 'none';
      if (gridBox) gridBox.style.display = none ? 'none' : '';
      emptyTitle.textContent = t('Nothing matches “{q}”', 'Intet matcher “{q}”', { q: state.q.trim() });
    }
    render(true);
  }

  // =====================================================================================  ITEM
  if (!item) return;
  (function more() {
    var here = location.pathname.replace(/\/+$/, '').split('/').pop(), shown = 0;
    [].slice.call(item.querySelectorAll('.pw-model__more-card')).forEach(function (a) {
      var slug = (a.getAttribute('href') || '').split(/[?#]/)[0].replace(/\/+$/, '').split('/').pop();
      var hide = (!!slug && slug === here) || shown >= 4;
      var cell = a.parentElement && a.parentElement.classList.contains('w-dyn-item') ? a.parentElement : a;
      cell.style.display = hide ? 'none' : '';
      if (!hide) shown++;
    });
  })();

  var calc = item.querySelector('.pw-tool__calc');
  if (!calc) return;
  var id = txt(item.querySelector('.pw-model__id'));
  var model = M[id] || M.flat, sim = model.sim;
  var S = { att: 100, a: null, b: null };
  function o(k) { return calc.querySelector('[data-o="' + k + '"]'); }
  function set(k, v) { var el = o(k); if (el && el.textContent !== v) el.textContent = v; }
  function attr(k, a, v) { var el = o(k); if (el) el.setAttribute(a, v); }

  // Port of the simulator in renderVals(): returns fields, result, cells, curve points, axis labels.
  function compute() {
    var att = S.att;
    function nA(v, d) { return v == null ? d : v; }
    var sq = nA(S.a, sim.quota || 400000), sold = sq * att / 100;
    var QF = { label: t('Quota (annual)', 'Mål (årligt)'), unit: '€', type: 'eur', def: sim.quota || 400000 };
    var R = { fields: [], k: t('Commission', 'Provision'), v: '—', sub: '', cells: [], pts: model.curve, slider: t('Attainment', 'Målopfyldelse') };
    function base(pay) {
      return [{ k: t('Quota', 'Mål'), v: eur(sq), s: t('Annual target', 'Årligt mål') },
        { k: t('Sold at {a}', 'Solgt ved {a}', { a: pc(att) }), v: eur(sold), s: t('Commissionable revenue', 'Provisionsberettiget omsætning') },
        { k: t('Effective rate', 'Effektiv sats'), v: sold ? pc(d1(pay / sold * 100)) : '—', s: t('Payout ÷ sold', 'Udbetaling ÷ solgt') }];
    }
    var k = sim.kind, r, pay, b;
    if (k === 'rate') {
      r = nA(S.b, sim.rate); pay = sold * r / 100;
      R.fields = [QF, { label: t('Commission rate', 'Provisionssats'), unit: '%', type: 'pct', def: sim.rate }];
      R.k = t('Commission at {a}', 'Provision ved {a}', { a: pc(att) }); R.v = eur(pay); R.sub = t('{r} of {s} sold', '{r} af {s} solgt', { r: pc(r), s: eur(sold) });
      R.cells = base(pay); R.pts = [[0, 0], [150, 150]]; R.p100 = sq * r / 100;
    } else if (k === 'bonus') {
      b = nA(S.b, sim.bonus); pay = att >= 100 ? b : 0;
      R.fields = [QF, { label: t('Bonus at 100%', 'Bonus ved 100 %'), unit: '€', type: 'eur', def: sim.bonus }];
      R.k = t('Bonus at {a}', 'Bonus ved {a}', { a: pc(att) }); R.v = eur(pay);
      R.sub = att >= 100 ? t('Target hit, full bonus released', 'Målet er nået, hele bonussen udløses') : t('Nothing until 100%. {x} to go.', 'Intet før 100 %. {x} mangler.', { x: eur(sq - sold) });
      R.cells = [{ k: t('Quota', 'Mål'), v: eur(sq), s: t('Annual target', 'Årligt mål') }, { k: t('Sold at {a}', 'Solgt ved {a}', { a: pc(att) }), v: eur(sold), s: t('Commissionable revenue', 'Provisionsberettiget omsætning') }, { k: 'Bonus', v: eur(b), s: t('Fixed amount, budgetable', 'Fast beløb, kan budgetteres') }];
      R.pts = [[0, 0], [100, 100], [150, 100]]; R.p100 = b;
    } else if (k === 'accel') {
      var r1 = nA(S.b, sim.rate), r2 = sim.rate2, over = Math.max(0, sold - sq), bs = Math.min(sold, sq);
      pay = bs * r1 / 100 + over * r2 / 100;
      R.fields = [QF, { label: t('Base rate (to quota)', 'Basissats (op til målet)'), unit: '%', type: 'pct', def: sim.rate }];
      R.k = t('Commission at {a}', 'Provision ved {a}', { a: pc(att) }); R.v = eur(pay);
      R.sub = t('{r1} to quota, {r2} above', '{r1} op til målet, {r2} derover', { r1: pc(r1), r2: pc(r2) }) + (over ? t('. {x} over quota at {r2}', '. {x} over målet til {r2}', { x: eur(over), r2: pc(r2) }) : '');
      R.cells = base(pay); R.pts = r1 ? [[0, 0], [100, 100], [150, 100 + 50 * r2 / r1]] : [[0, 0], [150, 0]]; R.p100 = sq * r1 / 100;
    } else if (k === 'tiers') {
      var T = sim.tiers;
      var tierPay = function (a) { var s = 0, pv = 0; T.forEach(function (x) { var hi = Math.min(a, x[0]); if (hi > pv) s += sq * (hi - pv) / 100 * x[1] / 100; pv = Math.max(pv, hi); }); return s; };
      pay = tierPay(att);
      var P100 = sq * (0.7 * 0.05 + 0.3 * 0.08);
      R.fields = [QF];
      R.k = t('Commission at {a}', 'Provision ved {a}', { a: pc(att) }); R.v = eur(pay); R.sub = t('5% to 70%, 8% to 100%, 12% above', '5 % op til 70 %, 8 % op til 100 %, 12 % derover');
      R.cells = base(pay); R.pts = P100 ? [[0, 0], [70, tierPay(70) / P100 * 100], [100, 100], [150, tierPay(150) / P100 * 100]] : [[0, 0], [150, 0]]; R.p100 = P100;
    } else if (k === 'decel') {
      r = nA(S.b, sim.rate); var rl = sim.rateLow, fl = sim.floor;
      pay = att < fl ? sold * rl / 100 : sold * r / 100;
      R.fields = [QF, { label: t('Full rate (above {f})', 'Fuld sats (over {f})', { f: pc(fl) }), unit: '%', type: 'pct', def: sim.rate }];
      R.k = t('Commission at {a}', 'Provision ved {a}', { a: pc(att) }); R.v = eur(pay);
      R.sub = att < fl ? t('Below the {f} floor: {r} applies', 'Under gulvet på {f}: {r} gælder', { f: pc(fl), r: pc(rl) }) : t('{r} applies', '{r} gælder', { r: pc(r) });
      R.cells = base(pay); R.pts = r ? [[0, 0], [fl - 0.1, fl * rl / r], [fl, fl], [100, 100], [150, 150]] : [[0, 0], [150, 0]]; R.p100 = sq * r / 100;
    } else if (k === 'margin') {
      r = nA(S.b, sim.rate); var mg = Math.min(att, 100);
      R.fields = [{ label: t('Revenue sold (annual)', 'Solgt omsætning (årligt)'), unit: '€', type: 'eur', def: sim.quota }, { label: t('Rate on gross margin', 'Sats på bruttomargin'), unit: '%', type: 'pct', def: sim.rate }];
      R.slider = 'Margin';
      R.v = eur(sq * mg / 100 * r / 100); R.sub = t('{r} of a {m} margin on {s}', '{r} af en margin på {m} af {s}', { r: pc(r), m: pc(mg), s: eur(sq) });
      R.cells = [{ k: t('Revenue', 'Omsætning'), v: eur(sq), s: t('Sold', 'Solgt') }, { k: t('Gross margin', 'Bruttomargin'), v: eur(sq * mg / 100), s: t('{m} of revenue', '{m} af omsætningen', { m: pc(mg) }) }, { k: t('Effective rate on revenue', 'Effektiv sats på omsætningen'), v: pc(d1(mg / 100 * r)), s: t('Discounting lowers this', 'Rabatter sænker den') }];
      R.pts = [[0, 0], [100, 100], [150, 150]]; R.p100 = sq * r / 100;
    } else if (k === 'draw') {
      r = sim.rate; var dr = nA(S.b, sim.draw), earned = sold / 12 * r / 100;
      pay = Math.max(dr, earned);
      R.fields = [QF, { label: t('Monthly draw', 'Månedligt forskud'), unit: '€', type: 'eur', def: sim.draw }];
      R.k = t('Paid this month', 'Udbetalt denne måned'); R.v = eur(pay);
      R.sub = earned >= dr ? t('{e} earned, {x} above the draw', '{e} optjent, {x} over forskuddet', { e: eur(earned), x: eur(earned - dr) }) : t('{e} earned, {x} carried forward', '{e} optjent, {x} overføres', { e: eur(earned), x: eur(dr - earned) });
      R.cells = [{ k: t('Monthly quota', 'Månedligt mål'), v: eur(sq / 12), s: t('Annual ÷ 12', 'Årligt ÷ 12') }, { k: t('Earned at {a}', 'Optjent ved {a}', { a: pc(att) }), v: eur(earned), s: t('{r} of monthly sales', '{r} af månedens salg', { r: pc(r) }) }, { k: t('Draw', 'Forskud'), v: eur(dr), s: t('Guaranteed minimum', 'Garanteret minimum') }];
      var dl = sq ? dr / (sq / 12 * r / 100) * 100 : 0;
      R.pts = [[0, dl], [dl, dl], [100, 100], [150, 150]]; R.p100 = sq / 12 * r / 100;
    } else if (k === 'split') {
      r = nA(S.b, sim.rate); var cs = Math.min(att, 100), tot = sq * r / 100;
      R.fields = [{ label: t('Deal value', 'Dealværdi'), unit: '€', type: 'eur', def: sim.quota }, { label: t('Commission rate', 'Provisionssats'), unit: '%', type: 'pct', def: sim.rate }];
      R.slider = t('Closer share', 'Closerens andel');
      R.k = t('Closer receives', 'Closeren får'); R.v = eur(tot * cs / 100); R.sub = t('{c} of {t} total commission', '{c} af {t} i samlet provision', { c: pc(cs), t: eur(tot) });
      R.cells = [{ k: t('Total commission', 'Samlet provision'), v: eur(tot), s: t('{r} of the deal', '{r} af dealen', { r: pc(r) }) }, { k: 'SDR', v: eur(tot * (100 - cs) * 0.67 / 100), s: pc(Math.round((100 - cs) * 0.67)) }, { k: 'Specialist', v: eur(tot * (100 - cs) * 0.33 / 100), s: pc(Math.round((100 - cs) * 0.33)) }];
      R.pts = [[0, 0], [100, 100], [150, 150]]; R.p100 = tot;
    } else if (k === 'residual') {
      r = nA(S.b, sim.rate); var mrr = nA(S.a, sim.mrr), months = Math.round(att / 100 * 24), mo = mrr * r / 100;
      R.fields = [{ label: t('Customer MRR', 'Kundens MRR'), unit: '€', type: 'eur', def: sim.mrr }, { label: t('Residual rate', 'Løbende sats'), unit: '%', type: 'pct', def: sim.rate }];
      R.slider = t('Months active', 'Måneder aktiv');
      R.k = t('Earned over {n} months', 'Optjent over {n} måneder', { n: months }); R.v = eur(mo * months); R.sub = t('{x} every month the account is live', '{x} hver måned, kontoen er aktiv', { x: eur(mo) });
      R.cells = [{ k: t('Monthly residual', 'Månedlig provision'), v: eur(mo), s: t('{r} of MRR', '{r} af MRR', { r: pc(r) }) }, { k: t('Year one', 'År 1'), v: eur(mo * 12), s: t('12 months', '12 måneder') }, { k: t('Year two', 'År 2'), v: eur(mo * 24), s: t('Cumulative', 'Samlet') }];
      R.pts = [[0, 0], [100, 100], [150, 150]]; R.p100 = mo * 24;
    } else if (k === 'clawback') {
      r = nA(S.b, sim.rate); var deal = nA(S.a, sim.deal), days = Math.round(att / 150 * 365), w = sim.windows;
      var back = days <= w[0][0] ? w[0][1] : days <= w[1][0] ? w[1][1] : 0, paid = deal * r / 100;
      R.fields = [{ label: t('Deal value', 'Dealværdi'), unit: '€', type: 'eur', def: sim.deal }, { label: t('Commission rate', 'Provisionssats'), unit: '%', type: 'pct', def: sim.rate }];
      R.slider = t('Customer churns after', 'Kunden opsiger efter');
      R.k = back ? t('Clawed back', 'Tilbageført') : t('Kept', 'Beholdt'); R.v = eur(back ? paid * back / 100 : paid);
      R.sub = back ? t('{b} of {p} reversed at day {d}', '{b} af {p} tilbageføres på dag {d}', { b: pc(back), p: eur(paid), d: days }) : t('Churn at day {d} is outside the window', 'Opsigelse på dag {d} ligger uden for vinduet', { d: days });
      R.cells = [{ k: t('Commission paid', 'Udbetalt provision'), v: eur(paid), s: t('{r} of deal', '{r} af dealen', { r: pc(r) }) }, { k: t('Within 90 days', 'Inden for 90 dage'), v: pc(100), s: t('Full clawback', 'Fuld clawback') }, { k: t('Within 180 days', 'Inden for 180 dage'), v: pc(50), s: t('Half clawback', 'Halv clawback') }];
      R.pts = [[0, 0], [37, 50], [74, 100], [150, 100]]; R.p100 = paid;
    } else if (k === 'spiff') {
      b = nA(S.b, sim.bonus); var deals = Math.round(att / 10);
      R.fields = [QF, { label: t('SPIFF per qualifying deal', 'SPIFF pr. kvalificerende deal'), unit: '€', type: 'eur', def: sim.bonus }];
      R.slider = t('Qualifying deals (×10)', 'Kvalificerende deals (×10)');
      R.k = t('SPIFF earned', 'Optjent SPIFF'); R.v = eur(deals * b); R.sub = t('{n} deals × {b}, on top of the main plan', '{n} deals × {b}, oven i hovedplanen', { n: deals, b: eur(b) });
      R.cells = [{ k: t('Per deal', 'Pr. deal'), v: eur(b), s: t('Fixed, paid the week it closes', 'Fast beløb, udbetalt den uge dealen lukker') }, { k: 'Deals', v: String(deals), s: t('This campaign', 'Denne kampagne') }, { k: t('Budget cap', 'Budgetloft'), v: eur(b * 15), s: t('If the whole team hits', 'Hvis hele teamet rammer') }];
      R.pts = [[0, 0], [150, 150]]; R.p100 = b * 15;
    }
    R.attText = k === 'residual' ? t('{n} mo', '{n} md.', { n: Math.round(att / 100 * 24) }) : k === 'clawback' ? t('{n} d', '{n} dage', { n: Math.round(att / 150 * 365) }) : k === 'spiff' ? t('{n} deals', '{n} deals', { n: Math.round(att / 10) }) : (k === 'margin' || k === 'split') ? pc(Math.min(att, 100)) : pc(att);
    R.x = k === 'residual' ? [t('0 mo', '0 md.'), t('16 mo', '16 md.'), t('24 mo', '24 md.')] : k === 'clawback' ? [t('day 0', 'dag 0'), t('day 243', 'dag 243'), t('day 365', 'dag 365')] : k === 'spiff' ? [t('0 deals', '0 deals'), t('10 deals', '10 deals'), t('15 deals', '15 deals')] : k === 'margin' ? [t('0% margin', '0 % margin'), pc(100), ''] : k === 'split' ? [t('0% share', '0 % andel'), pc(100), ''] : [pc(0), t('100% of quota', '100 % af målet'), pc(150)];
    return R;
  }

  // ---- inputs: the markup holds two [data-input] placeholders (Webflow has no free <input>) and one for the slider
  var boxes = {};
  ['a', 'b'].forEach(function (key) {
    var span = calc.querySelector('[data-input="' + key + '"]');
    if (!span) return;
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.className = span.className;
    inp.setAttribute('data-input', key);
    span.parentNode.replaceChild(inp, span);
    boxes[key] = inp;
    inp.addEventListener('input', function () {
      var f = inp.__field || { type: 'eur' }, raw = inp.value;
      if (f.type === 'eur') {
        var caret = inp.selectionStart == null ? raw.length : inp.selectionStart;
        var before = raw.slice(0, caret).replace(/[^0-9]/g, '').replace(/^0+/, '').length;
        var digits = raw.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
        var v = digits === '' ? null : Number(digits), fm = v == null ? '' : grp(v);
        if (fm !== raw) {
          inp.value = fm;
          var pos = 0, seen = 0;
          while (pos < fm.length && seen < before) { if (/[0-9]/.test(fm.charAt(pos))) seen++; pos++; }
          try { inp.setSelectionRange(pos, pos); } catch (e) { /* ignore */ }
        }
        S[key] = v;
      } else {
        var clean = raw.replace(/[^0-9.,]/g, '');
        if (clean !== raw) inp.value = clean;
        var n = parseFloat(clean.replace(',', '.'));
        S[key] = clean === '' || isNaN(n) ? null : n;
      }
      render();
    });
  });
  var rph = calc.querySelector('[data-input="att"]');
  if (rph) {
    var range = document.createElement('input');
    range.type = 'range'; range.min = '0'; range.max = '150'; range.step = '1'; range.value = '100';
    range.className = rph.className;
    rph.parentNode.replaceChild(range, rph);
    range.addEventListener('input', function () { S.att = Number(range.value); render(); });
    boxes.att = range;
  }
  var fieldEls = [].slice.call(calc.querySelectorAll('[data-field]'));
  var dot = [o('dotline'), o('dothalo'), o('dot')];
  dot.forEach(function (el) { if (el) el.classList.add('pw-model__dot'); });

  function render() {
    var R = compute();
    fieldEls.forEach(function (el) {
      var i = Number(el.getAttribute('data-field')), f = R.fields[i], key = i ? 'b' : 'a';
      el.style.display = f ? '' : 'none';
      if (!f) return;
      set('f' + i, f.label); set('u' + i, f.unit);
      var inp = boxes[key];
      if (inp) {
        inp.__field = f;
        inp.setAttribute('inputmode', f.type === 'pct' ? 'decimal' : 'numeric');
        inp.placeholder = f.type === 'eur' ? grp(f.def) : dec(f.def);
        inp.setAttribute('aria-label', f.label);
      }
    });
    if (boxes.att) boxes.att.setAttribute('aria-label', R.slider);
    set('slider', R.slider); set('att', R.attText);
    set('k', R.k); set('v', R.v); set('sub', R.sub);
    set('ytop', kfmt(R.p100 * 2)); set('ymid', kfmt(R.p100));
    set('xlo', R.x[0]); set('xmid', R.x[1]); set('xhi', R.x[2]);
    attr('area', 'd', area(model, R.pts)); attr('line', 'd', line(model, R.pts));
    var cx = f1(S.att / 150 * 300), cy = f1(110 - yAt(R.pts, S.att) / 200 * 100);
    if (dot[0]) { dot[0].setAttribute('x1', cx); dot[0].setAttribute('x2', cx); dot[0].style.x1 = cx + 'px'; dot[0].style.x2 = cx + 'px'; }
    [dot[1], dot[2]].forEach(function (c) { if (c) { c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.style.cx = cx + 'px'; c.style.cy = cy + 'px'; } });
    R.cells.forEach(function (c, i) { set('c' + i + 'k', c.k); set('c' + i + 'v', c.v); set('c' + i + 's', c.s); });
  }
  render();
})();
