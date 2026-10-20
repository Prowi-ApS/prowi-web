/* Fit check (/fit-check): five axes scored 1-5, a criticality multiplier, a radar shape and a pattern verdict.
   Ported from the FIT CHECK block of "Prowi Pages.dc.html". The static markup carries the export's state
   (DEFAULT below); a score saved in this browser (localStorage "prowi-fit", same key as the design) replaces it.
   The bridge section further down the page ([data-fit="reads"]) mirrors the chosen answers. */
(function () {
  var root = document.querySelector('[data-tool="fit"]');
  if (!root) return;
  if (!document.getElementById('pw-fit-css')) { var st = document.createElement('style'); st.id = 'pw-fit-css'; st.textContent = ".pw-fit__radar { display: block; height: auto; overflow: visible; position: relative; width: 100%; } .pw-fit__shape-g { transform-box: view-box; transform-origin: 180px 180px; } .pw-fit__shape { filter: none; transition: fill 750ms cubic-bezier(0.2, 0.8, 0.2, 1); } .pw-fit__dot { fill: var(--_prowi---pw-purple); opacity: 1; transition: opacity 300ms; } .pw-fit__logo { display: block; height: 40px; overflow: visible; width: auto; } .pw-fit__logo-piece { transform-box: fill-box; transform-origin: center center; } .pw-fit__reset:hover { color: var(--_prowi---pw-dark-purple); } .pw-fit__ghost-cta:hover { background: rgba(255, 255, 255, 0.08); } .pw-fit__pill--maybe { align-items: center; background: var(--_prowi---pw-white); border-radius: 999px; border: 1px solid rgba(17, 6, 99, 0.18); color: var(--_prowi---pw-dark-purple); display: inline-flex; font-size: 13px; font-weight: 600; gap: 8px; height: 32px; padding: 0px 14px; transition: background 400ms, border-color 400ms, color 400ms; } .pw-fit__pill--none { align-items: center; background: transparent; border-radius: 999px; border: 1px solid rgba(17, 6, 99, 0.14); color: var(--_prowi---pw-text-muted); display: inline-flex; font-size: 13px; font-weight: 600; gap: 8px; height: 32px; padding: 0px 14px; transition: background 400ms, border-color 400ms, color 400ms; } .pw-fit__pip--ghost { background: var(--_prowi---pw-bg-subtle); border-radius: 999px; border: 1px solid var(--_prowi---pw-light-purple); color: var(--_prowi---pw-purple); cursor: pointer; font-size: 12px; font-weight: 600; height: 34px; padding: 0px; transform: none; transition: background 750ms cubic-bezier(0.2, 0.8, 0.2, 1), color 200ms, border-color 750ms cubic-bezier(0.2, 0.8, 0.2, 1), transform 750ms cubic-bezier(0.2, 0.8, 0.2, 1); width: 34px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; user-select: none; } .pw-fit__cpip--on { background: var(--_prowi---pw-cyan); border-radius: 999px; border: 1px solid var(--_prowi---pw-cyan); color: var(--_prowi---pw-dark-purple); cursor: pointer; font-size: 12px; font-weight: 600; height: 34px; padding: 0px; transform: none; transition: background 200ms cubic-bezier(0.2, 0.8, 0.2, 1), color 200ms, border-color 200ms, transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1); width: 34px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; user-select: none; } .pw-fit__cpip--ghost { background: rgba(70, 211, 247, 0.18); border-radius: 999px; border: 1px solid var(--_prowi---pw-cyan); color: var(--_prowi---pw-cyan); cursor: pointer; font-size: 12px; font-weight: 600; height: 34px; padding: 0px; transform: none; transition: background 200ms cubic-bezier(0.2, 0.8, 0.2, 1), color 200ms, border-color 200ms, transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1); width: 34px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; user-select: none; } .pw-fit__desc--preview { color: var(--_prowi---pw-purple); font-size: 13.5px; font-style: italic; line-height: 1.45; transition: color 200ms; } .pw-fit__desc--empty { color: var(--_prowi---pw-text-placeholder); font-size: 13.5px; font-style: normal; line-height: 1.45; transition: color 200ms; } .pw-fit__crit-desc--preview { color: var(--_prowi---pw-cyan); font-size: 13.5px; font-style: italic; line-height: 1.45; transition: color 200ms; } .pw-fit__crit-desc--empty { color: rgba(255, 255, 255, 0.45); font-size: 13.5px; font-style: normal; line-height: 1.45; transition: color 200ms; } .pw-fit__crit--hot { box-shadow: rgba(70, 211, 247, 0.35) 0px 0px 0px 1px, rgba(17, 6, 99, 0.6) 0px 18px 40px -20px; } .pw-fit__mult--hot { color: var(--_prowi---pw-cyan); } @media (max-width: 991px) { .pw-fit__grid { grid-template-columns: minmax(0px, 1fr); } .pw-fit__side { position: static; } } @media (max-width: 479px) { .pw-fit__read { grid-template-columns: minmax(0px, 1fr); gap: 6px; } }"; document.head.appendChild(st); }
  var EN = /^en/i.test(document.documentElement.lang || '');
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var KEY = 'prowi-fit';
  var DEFAULT = { a: [5, 2, 4, 4, 4], c: 1 }; // the state the design export (and so the static markup) shows

  var AX = EN ? [
    ['Scale', ['Under 5 reps: a spreadsheet copes', '5–10 reps: the first queue at finance', '10–15 reps: one person owns the calculation', 'More than 15 reps: informal management breaks down', '30+ reps: several teams, several plans, one payroll run']],
    ['Compensation intensity', ['Under 10% of pay is variable', 'A small bonus on top', 'A third of pay rides on the plan', 'Half of pay is commission: every deal matters', 'Commission is the salary']],
    ['Behavior impact', ['The plan does not change what reps do', 'It nudges a little at quarter end', 'Reps know it and sometimes act on it', 'Accelerators and kickers steer what gets chased', 'The plan is the sales strategy in practice']],
    ['Model complexity', ['One flat rate on everything', 'A couple of rates by product', 'Tiers and a target', 'Accelerators, splits, kickers', 'Teams, clawbacks, several currencies']],
    ['Cost of confusion', ['Nobody asks about their number', 'A question or two at payroll', 'Corrections every quarter', 'Corrections every month, trust wearing thin', 'Reps leaving over commission']]
  ] : [
    ['Skala', ['Under 5 sælgere: et regneark rækker', '5–10 sælgere: den første kø hos finans', '10–15 sælgere: en person ejer udregningen', '15–30 sælgere: uformel styring bryder sammen', '30+ sælgere: flere teams, flere planer, en lønkørsel']],
    ['Lønintensitet', ['Under 10 % af lønnen er variabel', 'En lille bonus oveni', 'En tredjedel af lønnen afhænger af planen', 'Halvdelen er provision: hver deal betyder noget', 'Provisionen er lønnen']],
    ['Adfærdseffekt', ['Planen ændrer ikke, hvad sælgerne gør', 'Den påvirker lidt ved kvartalets slutning', 'Sælgerne kender den og handler nogle gange på den', 'Acceleratorer og kickers styrer, hvad der bliver jagtet', 'Planen er salgsstrategien i praksis']],
    ['Modelkompleksitet', ['En fast sats på alt', 'Et par satser efter produkt', 'Trin og et mål', 'Acceleratorer, splits, kickers', 'Teams, clawbacks, flere valutaer']],
    ['Pris på forvirring', ['Ingen spørger om deres tal', 'Et spørgsmål eller to ved løn', 'Rettelser hvert kvartal', 'Rettelser hver måned, tilliden slider', 'Sælgere siger op over provisionen']]
  ];
  var CRIT = EN ? ['Sales criticality', ['Sales is a side function', 'Sales is one of several engines', 'Sales drives growth', 'Everything depends on sales delivering this year', 'Sales is the company']]
    : ['Salgskritikalitet', ['Salg er en biting', 'Salg er en af flere motorer', 'Salg driver væksten', 'Alt afhænger af, at salg leverer i år', 'Salg er virksomheden']];
  var T = EN ? {
    radar: 'Radar of your scores',
    hoverAx: 'Hover a score to see what it means',
    hoverCrit: 'How much depends on sales delivering? Hover a score.',
    v0h: 'Score all five axes', v0p: function (n) { return n + ' to go. The shape and the verdict form as you tap.'; },
    v3eh: 'Strong fit, early', v3ep: 'The pattern is right, but the team is small. Build the relationship now; onboard once you pass ten reps.',
    v3h: 'Strong fit', v3p: 'The plan steers behavior and confusion is already costing you. Lead with the app: reps see the number while the period is still open.',
    v2h: 'Worth a closer look', v2pc: 'Sales is critical, so the will is there. Lead with the approval flow and one payroll file.',
    v2p: 'Some axes are high, others low. Lead with the highest axis and let the numbers make the rest of the case.',
    v1h: 'Not a fit', v1p: 'Small team, simple plan, no confusion. A spreadsheet is the right tool today. Stay in touch.',
    effect: function (c, fill) { return 'All five axes now weigh ×' + c + '. Fill ' + fill + '%' + (c >= 2 ? ', cyan glow.' : '.'); },
    effect0: 'Set the multiplier and watch the five rows above and the shape take on weight.'
  } : {
    radar: 'Radar over jeres score',
    hoverAx: 'Hold over en score for at se, hvad den betyder',
    hoverCrit: 'Hvor meget afhænger af, at salg leverer? Hold over en score.',
    v0h: 'Score alle fem akser', v0p: function (n) { return n + ' tilbage. Formen og dommen former sig, mens I taster.'; },
    v3eh: 'Fit, men tidligt', v3ep: 'Mønsteret er rigtigt, men teamet er lille. Byg relationen nu; onboard når I passerer ti sælgere.',
    v3h: 'Stærkt fit', v3p: 'Planen styrer adfærd, og forvirringen koster allerede. Før med appen: sælgerne ser tallet, mens perioden er åben.',
    v2h: 'Værd at kigge nærmere på', v2pc: 'Salg er kritisk, så viljen er der. Før med godkendelsesflowet og en lønfil.',
    v2p: 'Nogle akser er høje, andre lave. Før med den akse, der er højest, og lad regnestykket vise resten.',
    v1h: 'Ikke et fit', v1p: 'Lille team, enkel plan, ingen forvirring. Et regneark er det rigtige værktøj i dag. Hold kontakten.',
    effect: function (c, fill) { return 'Alle fem akser vejer ×' + c + '. Fyld ' + fill + ' %' + (c >= 2 ? ', cyan glød.' : '.'); },
    effect0: 'Sæt multiplikatoren, og se de fem rækker ovenfor og formen tage vægt.'
  };
  var W_ON = ['#B8A6EC', '#9F7DEE', '#7A5FE0', '#5A45D8', '#4C39CA', '#2F22A8']; // scored pips deepen with the multiplier
  var EASE = 'cubic-bezier(0.2,0.8,0.2,1)';

  /* ---------- state ---------- */
  var clamp = function (v) { v = v | 0; return v < 0 ? 0 : v > 5 ? 5 : v; };
  var norm = function (s) { var a = (s && s.a) || []; return { a: [0, 1, 2, 3, 4].map(function (i) { return clamp(a[i]); }), c: clamp(s && s.c) }; };
  var st = norm(DEFAULT), saved = null;
  try { saved = JSON.parse(window.localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
  var anim = st.a.slice(); // what the radar currently draws (tweened toward st.a)
  var hov = null; // { i: 0..4 | 'c', v: 1..5 }

  /* ---------- elements ---------- */
  var one = function (sel, el) { return (el || root).querySelector(sel); };
  var all = function (sel, el) { return Array.prototype.slice.call((el || root).querySelectorAll(sel)); };
  var setText = function (el, t) { if (!el) return; var s = (el.children.length === 1 && el.firstElementChild.tagName === 'SPAN') ? el.firstElementChild : el; if (s.textContent !== t) s.textContent = t; };
  var glow = one('[data-fit="glow"]'), radar = one('[data-fit="radar"]'), shapeG = one('[data-fit="shape-g"]'), shape = one('[data-fit="shape"]');
  var dots = all('[data-fit="dot"]'), labels = all('[data-fit="label"]');
  var pill = one('[data-fit="pill"]'), verdict = one('[data-fit="verdict"]'), mult = one('[data-fit="mult"]'), critBox = one('[data-fit="crit"]'), effect = one('[data-fit="effect"]');
  var reads = all('[data-fit="read"]', document.querySelector('[data-fit="reads"]') || root);
  var rows = all('[data-fit-axis]').map(function (box) {
    var key = box.getAttribute('data-fit-axis'), i = key === 'c' ? 'c' : +key;
    var row = box.parentNode;
    return { i: i, box: box, desc: one('[data-fit="desc"]', row), axis: one('[data-fit="axis"]', row), pips: all('a[data-v]', box) };
  });

  /* ---------- radar geometry (360x360 viewBox, radius 10..140) ---------- */
  var pt = function (i, r) { var ang = -Math.PI / 2 + i * (Math.PI * 2 / 5); return [180 + Math.cos(ang) * r, 180 + Math.sin(ang) * r]; };
  var fR = function (v) { return 10 + (v / 5) * 130; };
  var f1 = function (n) { return n.toFixed(1); };
  // rounded polygon path (12px corner radius), so the shape reads as a soft silhouette
  var roundPath = function (pts, rad) {
    var n = pts.length, d = '';
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
      var v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
      var l1 = Math.hypot(v1[0], v1[1]) || 1, l2 = Math.hypot(v2[0], v2[1]) || 1;
      var rr = Math.min(rad, l1 / 2, l2 / 2);
      var a = [p1[0] + v1[0] / l1 * rr, p1[1] + v1[1] / l1 * rr], b = [p1[0] + v2[0] / l2 * rr, p1[1] + v2[1] / l2 * rr];
      d += (i === 0 ? 'M' : 'L') + f1(a[0]) + ',' + f1(a[1]) + ' Q' + f1(p1[0]) + ',' + f1(p1[1]) + ' ' + f1(b[0]) + ',' + f1(b[1]) + ' ';
    }
    return d + 'Z';
  };
  function drawShape() {
    var verts = anim.map(function (v, i) { return pt(i, fR(v)); });
    if (shape) shape.setAttribute('d', roundPath(verts, Math.min(12, fR(Math.min.apply(null, anim)) * 0.6)).trim());
    dots.forEach(function (c, i) { if (!verts[i]) return; c.setAttribute('cx', f1(verts[i][0])); c.setAttribute('cy', f1(verts[i][1])); });
  }

  /* ---------- tween of the radar shape: 700ms, cubic-bezier(0.16,1,0.3,1) like the design ---------- */
  var bez = function (t) {
    var cx = 3 * 0.16, bx = 3 * (0.3 - 0.16) - cx, ax = 1 - cx - bx, cy = 3 * 1, by = 3 * (1 - 1) - cy, ay = 1 - cy - by, x = t;
    for (var i = 0; i < 6; i++) { var f = ((ax * x + bx) * x + cx) * x - t, d = (3 * ax * x + 2 * bx) * x + cx; if (Math.abs(d) < 1e-6) break; x -= f / d; }
    return ((ay * x + by) * x + cy) * x;
  };
  var raf = 0;
  function tween(target) {
    if (raf) cancelAnimationFrame(raf);
    if (REDUCED) { anim = target.slice(); drawShape(); return; }
    var from = anim.slice(), t0 = 0;
    var step = function (now) {
      if (!t0) t0 = now;
      var q = Math.min(1, (now - t0) / 700), e = bez(q);
      anim = from.map(function (v, i) { return v + (target[i] - v) * e; });
      drawShape();
      raf = q < 1 ? requestAnimationFrame(step) : 0;
    };
    raf = requestAnimationFrame(step);
  }
  function pulse() {
    if (REDUCED) return;
    if (shapeG && shapeG.animate) shapeG.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 750, easing: EASE });
    if (mult && mult.animate) mult.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 750, easing: EASE });
  }

  /* ---------- verdict: a pattern, not a sum ---------- */
  function verdictOf(a, c) {
    var scored = a.filter(function (v) { return v > 0; }).length;
    var hi = function (i) { return a[i] >= 4; }, strong = a.filter(function (v) { return v >= 4; }).length;
    var tier = 0; // 0 none · 1 not · 2 maybe · 3 fit
    if (scored === 5) { tier = (strong >= 3 && hi(2) && hi(4)) ? 3 : (strong >= 2 || (hi(2) || hi(4))) ? 2 : 1; if (tier === 2 && c >= 4) tier = 3; }
    var lowScale = a[0] > 0 && a[0] <= 2;
    var v = tier === 0 ? { h: T.v0h, p: T.v0p(5 - scored) }
      : tier === 3 && lowScale ? { h: T.v3eh, p: T.v3ep }
      : tier === 3 ? { h: T.v3h, p: T.v3p }
      : tier === 2 ? { h: T.v2h, p: c >= 3 ? T.v2pc : T.v2p }
      : { h: T.v1h, p: T.v1p };
    v.tier = tier;
    return v;
  }

  /* ---------- render everything except the radar shape (tweened separately) ---------- */
  function render() {
    var a = st.a, c = st.c, wOn = W_ON[c];
    var fillA = 0.08 + (c / 5) * 0.62, glowPx = c >= 2 ? 4 + (c - 2) * 6 : 0, glowA = c >= 2 ? 0.25 + (c - 2) * 0.15 : 0;
    if (glow) {
      glow.style.width = ((60 + c * 6) * vbScale) + '%';
      glow.style.background = 'radial-gradient(circle, rgba(70,211,247,' + glowA.toFixed(2) + ') 0%, rgba(70,211,247,' + (glowA * 0.4).toFixed(2) + ') 40%, rgba(70,211,247,0) 72%)';
      glow.style.filter = 'blur(' + Math.max(1, glowPx) + 'px)';
      glow.style.opacity = glowPx ? '1' : '0';
    }
    if (shape) {
      shape.setAttribute('fill', 'rgba(76,57,202,' + fillA.toFixed(3) + ')');
      shape.style.filter = c >= 4 ? 'drop-shadow(0 0 ' + (c - 3) * 6 + 'px rgba(70,211,247,0.45))' : '';
    }
    dots.forEach(function (d, i) { d.style.opacity = a[i] ? '' : '0.35'; });

    var v = verdictOf(a, c);
    if (pill) { pill.className = v.tier === 3 ? 'pw-fit__pill--fit' : v.tier === 0 ? 'pw-fit__pill--none' : 'pw-fit__pill--maybe'; setText(pill, v.h); }
    setText(verdict, v.p);

    rows.forEach(function (r) {
      var isC = r.i === 'c', ax = isC ? CRIT : AX[r.i], cur = isC ? c : a[r.i];
      var hv = hov && hov.i === r.i ? hov.v : 0, show = hv || cur;
      setText(r.desc, show ? ax[1][show - 1] : (isC ? T.hoverCrit : T.hoverAx));
      if (r.desc) { var b = isC ? 'pw-fit__crit-desc' : 'pw-fit__desc'; r.desc.className = hv && hv !== cur ? b + '--preview' : show ? b : b + '--empty'; }
      r.pips.forEach(function (p) {
        var pv = +p.getAttribute('data-v'), on = pv <= cur, ghost = !on && hv && pv <= hv && pv > cur;
        var pre = isC ? 'pw-fit__cpip--' : 'pw-fit__pip--';
        var cls = pre + (on ? (pv === cur ? 'cur' : 'on') : ghost ? 'ghost' : 'off');
        if (p.className !== cls) p.className = cls;
        if (!isC) { p.style.background = on ? wOn : ''; p.style.borderColor = on || ghost ? wOn : ''; }
        p.setAttribute('aria-pressed', on && pv === cur ? 'true' : 'false');
      });
    });

    if (mult) { setText(mult, '×' + (c || '–')); mult.classList.toggle('pw-fit__mult--hot', c >= 3); }
    if (critBox) critBox.classList.toggle('pw-fit__crit--hot', c >= 3);
    setText(effect, c ? T.effect(c, Math.round(fillA * 100)) : T.effect0);
    reads.forEach(function (el, i) { if (AX[i]) setText(el, AX[i][1][Math.max(0, (a[i] || 3) - 1)]); });
  }

  function setFit(patch) {
    if (patch.a) st.a = patch.a.map(clamp);
    if (patch.c != null) st.c = clamp(patch.c);
    try { window.localStorage.setItem(KEY, JSON.stringify({ a: st.a, c: st.c })); } catch (e) {}
    render();
    if (patch.a) tween(st.a);
    if (patch.c != null) pulse();
  }

  /* ---------- radar labels. On phones the design's labels run past the screen edge (they sit outside the
     360-unit chart): there the bottom labels centre under their vertex, the side labels wrap onto two lines,
     and the viewBox widens symmetrically just enough to hold them. Desktop keeps the design's placement. ---------- */
  var vbScale = 1, NS = 'http://www.w3.org/2000/svg';
  var mqNarrow = window.matchMedia ? window.matchMedia('(max-width: 767px)') : null;
  var orig = labels.map(function (l) { return { x: l.getAttribute('x'), y: l.getAttribute('y'), anchor: l.getAttribute('text-anchor'), size: l.getAttribute('font-size') }; });
  function layoutLabels() {
    var narrow = !!(mqNarrow && mqNarrow.matches);
    labels.forEach(function (l, i) {
      if (!AX[i]) return;
      var t = AX[i][0], sp = t.lastIndexOf(' '), o = orig[i], x = o.x, y = o.y, anchor = o.anchor;
      if (narrow && (i === 1 || i === 4)) { var q = pt(i, 150); x = f1(q[0]); }
      if (narrow && (i === 2 || i === 3)) { x = f1(pt(i, 140)[0]); anchor = 'middle'; }
      l.setAttribute('x', x); l.setAttribute('y', y); l.setAttribute('text-anchor', anchor); l.setAttribute('font-size', narrow ? '13' : o.size);
      while (l.firstChild) l.removeChild(l.firstChild);
      if (narrow && (i === 1 || i === 4) && sp > 0) {
        [t.slice(0, sp), t.slice(sp + 1)].forEach(function (part, k) {
          var ts = document.createElementNS(NS, 'tspan');
          ts.setAttribute('x', x); ts.setAttribute('dy', k ? '1.2em' : '-0.6em'); ts.textContent = part; l.appendChild(ts);
        });
      } else l.textContent = t;
    });
    if (!radar) return;
    radar.setAttribute('viewBox', '0 0 360 360'); vbScale = 1;
    if (narrow) {
      try {
        var bb = radar.getBBox();
        var hx = Math.max(180, 180 - bb.x, bb.x + bb.width - 180) + 4, hy = Math.max(180, 180 - bb.y, bb.y + bb.height - 180) + 4;
        radar.setAttribute('viewBox', [180 - hx, 180 - hy, 2 * hx, 2 * hy].map(f1).join(' '));
        vbScale = 180 / hx;
      } catch (e) {}
    }
  }
  if (radar) radar.setAttribute('aria-label', T.radar);
  layoutLabels();
  if (mqNarrow) { var relayout = function () { layoutLabels(); render(); }; if (mqNarrow.addEventListener) mqNarrow.addEventListener('change', relayout); else if (mqNarrow.addListener) mqNarrow.addListener(relayout); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layoutLabels(); render(); });
  rows.forEach(function (r) {
    var ax = r.i === 'c' ? CRIT : AX[r.i];
    setText(r.axis, ax[0]);
    r.pips.forEach(function (p) {
      var pv = +p.getAttribute('data-v');
      p.setAttribute('aria-label', ax[0] + ' ' + pv + ': ' + ax[1][pv - 1]);
      p.setAttribute('role', 'button'); p.setAttribute('tabindex', '0');
      p.addEventListener('click', function (e) {
        e.preventDefault();
        if (r.i === 'c') setFit({ c: pv }); else { var a = st.a.slice(); a[r.i] = pv; setFit({ a: a }); }
      });
      var over = function () { hov = { i: r.i, v: pv }; render(); };
      var out = function () { hov = null; render(); };
      (p.parentNode || p).addEventListener('mouseenter', over);
      p.addEventListener('focus', over);
      p.addEventListener('blur', out);
    });
    r.box.addEventListener('mouseleave', function () { hov = null; render(); });
  });
  var reset = one('[data-fit-reset]');
  if (reset) {
    reset.setAttribute('role', 'button'); reset.setAttribute('tabindex', '0');
    reset.addEventListener('click', function (e) { e.preventDefault(); setFit({ a: [0, 0, 0, 0, 0], c: 0 }); });
  }
  root.addEventListener('keydown', function (e) {
    var t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t && t.getAttribute && t.getAttribute('role') === 'button' && root.contains(t)) { e.preventDefault(); t.click(); }
  });

  /* ---------- bridge logo: gradient repair + hover turn (same as the nav/footer logo in page.js) ---------- */
  (function () {
    var svg = document.querySelector('[data-fit="logo"]');
    if (!svg) return;
    var grad = svg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'linearGradient')[0];
    var pieces = Array.prototype.slice.call(svg.querySelectorAll('g.pw-logo__mark'));
    if (grad && pieces[0]) {
      grad.setAttribute('id', 'pw-fit-lg');
      grad.setAttribute('gradientUnits', 'objectBoundingBox'); grad.removeAttribute('gradientTransform');
      grad.setAttribute('x1', '0.165'); grad.setAttribute('y1', '-0.166'); grad.setAttribute('x2', '1.163'); grad.setAttribute('y2', '0.834');
      var p = pieces[0].querySelector('path'); if (p) p.setAttribute('fill', 'url(#pw-fit-lg) #4C39CA');
    }
    if (pieces.length < 3 || REDUCED) return;
    var moves = [[79.37, -79.37], [11.9, 115.08], [-115.1, -11.5]], busy = false;
    var set = function (on) {
      pieces.forEach(function (g, i) {
        g.style.transition = 'transform 700ms cubic-bezier(0.3,1.25,0.5,1)' + (on ? '' : ' 350ms');
        g.style.transform = on ? 'translate(' + moves[i][0] + 'px,' + moves[i][1] + 'px) rotate(-180deg)' : 'translate(0px,0px) rotate(0deg)';
      });
    };
    svg.addEventListener('mouseenter', function () {
      if (busy) return; busy = true; set(true);
      setTimeout(function () { set(false); setTimeout(function () { busy = false; }, 750); }, 1150);
    });
  })();

  /* ---------- first paint: markup already shows DEFAULT; a saved score tweens in ---------- */
  render();
  drawShape();
  if (saved && saved.a) { var s = norm(saved); if (s.a.join() !== st.a.join() || s.c !== st.c) { st = s; render(); tween(st.a); } }
})();
