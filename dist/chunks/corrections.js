/* Corrections demo (/korrektioner): pick what happens to January's Acme deal in March and see the correction
   land on the open March statement. Ported from the Claude Design source (Prowi Pages, "corrections demo"). */
(function () {
  var root = document.querySelector('[data-tool="corrections"]');
  if (!root) return;
  if (!document.getElementById('pw-corr-css')) { var st = document.createElement('style'); st.id = 'pw-corr-css'; st.textContent = ".pw-corr__deal-value.pw-corr__deal-value--struck { color: var(--_prowi---pw-text-placeholder); text-decoration: line-through; } .pw-corr__applied.pw-corr__applied--neg { color: #F08A8A; } .pw-corr__applied.pw-corr__applied--pos { color: #7EE2A8; } .pw-corr__entry { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: var(--_prowi---pw-white); animation: pw-corr-in 420ms cubic-bezier(0.2, 0.6, 0.2, 1) both; } .pw-corr__entry-text { display: flex; flex-direction: column; gap: 1px; } .pw-corr__entry-title { font-size: 13px; font-weight: 500; color: var(--_prowi---pw-purple); } .pw-corr__entry-meta { font-size: 12px; color: var(--_prowi---pw-text-muted); } .pw-corr__entry-amount { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; color: #0E7A36; white-space: nowrap; } .pw-corr__entry-amount.pw-corr__entry-amount--neg { color: #B42318; } .pw-corr__change { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(255, 255, 255, 0.08); animation: pw-corr-in 420ms cubic-bezier(0.2, 0.6, 0.2, 1) both; } .pw-corr__change-icon { width: 22px; height: 22px; border-radius: 999px; flex: none; display: grid; place-items: center; background: rgba(70, 211, 247, 0.25); color: var(--_prowi---pw-cyan); } .pw-corr__change-icon.pw-corr__change-icon--deleted { background: rgba(240, 138, 138, 0.25); color: #F08A8A; } .pw-corr__change-text { font-size: 13px; line-height: 1.5; color: rgba(255, 255, 255, 0.9); } @keyframes pw-corr-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } } @media (prefers-reduced-motion: reduce) { .pw-corr__entry, .pw-corr__change { animation: none; } .pw-corr__deal-value, .pw-corr__applied, .pw-corr__option--on, .pw-corr__option--off { transition: none; } }"; document.head.appendChild(st); }
  var isEn = /^en/i.test(document.documentElement.lang || '');
  // Danish copy from the design (strings-da.js). Strings the design leaves untranslated stay English in both languages.
  var DA = {
    'Correction #1 → March 2026': 'Korrektion #1 → marts 2026'
  };
  function T(s) { return isEn ? s : (DA[s] || s); }

  var OLD = 10000, RATE = 0.05, BASE = 2200;
  var CX = [
    { val: 10000, type: null },
    { val: 8000, type: 'changed' },
    { val: 0, type: 'deleted' },
    { val: 14000, type: 'changed' }
  ];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function q(k) { return root.querySelector('[data-corr="' + k + '"]'); }
  var el = {
    deal: q('deal'), timeline: q('timeline'), timelineEmpty: q('timeline-empty'), applied: q('applied'),
    total: q('total'), changes: q('changes'), changesEmpty: q('changes-empty'), note: q('note')
  };
  var opts = Array.prototype.slice.call(root.querySelectorAll('[data-corr-opt]'));

  function group(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, isEn ? ',' : '.'); }
  function eur(n) { return (n < 0 ? '−' : n > 0 ? '+' : '') + '€' + group(Math.abs(Math.round(n))); }
  function plain(n) { return '€' + group(Math.round(n)); }
  // write text into the element's inner <span> when the static markup has one, else into the element itself
  function setText(node, text) {
    if (!node) return;
    var target = node.firstElementChild && node.children.length === 1 ? node.firstElementChild : node;
    if (target.textContent !== text) target.textContent = text;
  }
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  var PATH_CHANGED = 'M21 12a9 9 0 1 1-3-6.7M21 3v6h-6', PATH_DELETED = 'M18 6 6 18M6 6l12 12';

  var sel = 0, cxA = 0, raf = 0, entry = null, change = null;

  function corrOf(o) { return (o.val - OLD) * RATE; }

  function paintAmount() {
    var o = CX[sel], has = !!o.type;
    setText(el.applied, has ? eur(cxA) : '€0');
    setText(el.total, plain(BASE + cxA));
    if (entry) entry.amount.textContent = eur(cxA);
  }

  function buildEntry() {
    var row = h('div', 'pw-corr__entry');
    var txt = h('span', 'pw-corr__entry-text');
    txt.appendChild(h('span', 'pw-corr__entry-title', T('Correction #1 → March 2026')));
    var meta = h('span', 'pw-corr__entry-meta');
    txt.appendChild(meta);
    var amount = h('span', 'pw-corr__entry-amount');
    row.appendChild(txt); row.appendChild(amount);
    return { row: row, meta: meta, amount: amount };
  }
  function buildChange() {
    var row = h('div', 'pw-corr__change');
    var icon = h('span', 'pw-corr__change-icon');
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('width', '12'); svg.setAttribute('height', '12'); svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2.2');
    svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round'); svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(SVGNS, 'path');
    svg.appendChild(path); icon.appendChild(svg);
    var text = h('span', 'pw-corr__change-text');
    row.appendChild(icon); row.appendChild(text);
    return { row: row, icon: icon, path: path, text: text };
  }

  function render() {
    var o = CX[sel], has = !!o.type, corrT = corrOf(o), neg = corrT < 0, pos = corrT > 0;
    opts.forEach(function (a, i) {
      var on = i === sel;
      a.classList.toggle('pw-corr__option--on', on);
      a.classList.toggle('pw-corr__option--off', !on);
      a.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (el.deal) el.deal.classList.toggle('pw-corr__deal-value--struck', has);
    if (el.applied) {
      el.applied.classList.toggle('pw-corr__applied--neg', neg);
      el.applied.classList.toggle('pw-corr__applied--pos', pos);
    }
    if (has) {
      if (!entry && el.timeline) { entry = buildEntry(); el.timeline.insertBefore(entry.row, el.timelineEmpty || null); }
      if (!change && el.changes) { change = buildChange(); el.changes.insertBefore(change.row, el.changesEmpty || null); }
      if (entry) {
        entry.meta.textContent = (isEn ? '1 change · Jan value ' : '1 ændring · januar-værdi ') + eur(500).replace('+', '') + ' → ' + plain(o.val * RATE);
        entry.amount.classList.toggle('pw-corr__entry-amount--neg', neg);
      }
      if (change) {
        var del = o.type === 'deleted';
        change.icon.classList.toggle('pw-corr__change-icon--deleted', del);
        change.path.setAttribute('d', del ? PATH_DELETED : PATH_CHANGED);
        change.text.textContent = del
          ? (isEn ? 'Deleted: Deal ‘Acme Corp’ (€10,000) no longer matches the filter' : 'Slettet: Dealen ‘Acme Corp’ (€10.000) matcher ikke længere filteret')
          : (isEn ? 'Changed: Deal ‘Acme Corp’ value changed from €10,000 to €' : 'Ændret: Dealen ‘Acme Corp’ ændrede værdi fra €10.000 til €') + group(o.val);
      }
    } else {
      if (entry) { entry.row.parentNode.removeChild(entry.row); entry = null; }
      if (change) { change.row.parentNode.removeChild(change.row); change = null; }
    }
    if (el.timelineEmpty) el.timelineEmpty.style.display = has ? 'none' : '';
    if (el.changesEmpty) el.changesEmpty.style.display = has ? 'none' : '';
    setText(el.note, has
      ? (isEn ? 'January stays paid at €800. Correction #1 carries ' + eur(corrT) + ' into March, the only open statement. Lena sees why before approval; finance never touches January.'
        : 'Januar forbliver udbetalt med €800. Korrektion #1 fører ' + eur(corrT) + ' med ind i marts, den eneste åbne opgørelse. Lena ser hvorfor før godkendelse; økonomi rører aldrig januar.')
      : (isEn ? 'Nothing changed in January’s data, so nothing moves. Pick a scenario above.' : 'Intet er ændret i januars data, så intet flytter sig. Vælg et scenarie ovenfor.'));
    tweenTo(corrT);
  }

  function tweenTo(target) {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (reduce || cxA === target) { cxA = target; paintAmount(); return; }
    var from = cxA, t0 = null;
    function step(now) {
      if (t0 === null) t0 = now;
      var x = Math.min(1, (now - t0) / 800);
      var e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      cxA = from + (target - from) * e;
      paintAmount();
      raf = x < 1 ? requestAnimationFrame(step) : 0;
    }
    paintAmount();
    raf = requestAnimationFrame(step);
  }

  opts.forEach(function (a) {
    var i = Number(a.getAttribute('data-corr-opt'));
    a.setAttribute('role', 'button');
    a.setAttribute('tabindex', '0');
    function pick(ev) {
      if (ev) ev.preventDefault();
      if (sel === i) return;
      sel = i; render();
    }
    a.addEventListener('click', pick);
    a.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') pick(ev);
    });
  });
  render();
})();

