/* Build or buy (/byg-eller-koeb-provisionssoftware, /en/build-or-buy-commission-software; root [data-build="page"]).
   Port of the `bb` block in "Prowi Pages.dc.html": a 3-year build-vs-buy cost calculator (four sliders + Prowi plan) and a
   7-question scorer with a verdict. The static markup is the design's default state (25 reps, 12 weeks, €9,000, 20%, Business,
   all scores 3), so the page is complete without this script. Amounts are euros in both languages, formatted en-US, as in the design.
   The section reveal comes from the site-wide reveal in src/page.js. */
(function () {
  var root = document.querySelector('[data-build="page"]');
  if (!root || root.getAttribute('data-build-ready')) return;
  root.setAttribute('data-build-ready', '1');

  var EN = /^en/i.test(document.documentElement.lang || '');
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function q(sel) { return root.querySelector(sel); }

  if (!document.getElementById('pw-build-css')) {
    var st = document.createElement('style');
    st.id = 'pw-build-css';
    st.textContent =
      '[data-build="page"] input.pw-build__range{display:block;margin:0;height:16px}' +
      '[data-build="page"] [data-plan],[data-build="page"] [data-score]{-webkit-tap-highlight-color:transparent}' +
      '[data-build="page"] [data-plan]:focus-visible,[data-build="page"] [data-score]:focus-visible,[data-build="page"] input.pw-build__range:focus-visible{outline:2px solid #4C39CA;outline-offset:2px}' +
      '@media (prefers-reduced-motion: reduce){[data-build="page"] .pw-build__bar--build,[data-build="page"] .pw-build__bar--buy,[data-build="page"] [data-plan],[data-build="page"] [data-score]{transition:none!important}}';
    document.head.appendChild(st);
  }

  /* ---------- strings (DA from strings-da.js, acute accents removed per site rule) ---------- */
  var S = EN ? {
    build: 'Build', assemble: 'Assemble', buy: 'Buy',
    vBuild: 'You have a real case for building. Staff it like a product: a named owner, a maintenance budget of 15–25% a year, and a written condition for when you would retire it.',
    vAssemble: 'Buy the engine and keep your rules. This is where most commission teams land: Prowi calculates, syncs, approves and pays out, and you design the plan in Commission Studio.',
    vBuy: 'Commission is infrastructure for you, not a differentiator. Put the energy into the implementation and the plan design instead of the code.',
    first: 'first version', upkeep: 'upkeep', hosting: 'hosting and AI', reps: 'reps', months: 'months', onboarding: 'onboarding', score: 'Score'
  } : {
    build: 'Byg', assemble: 'Kombiner', buy: 'Køb',
    vBuild: 'Du har en reel grund til at bygge. Bemand det som et produkt: en navngiven ejer, et vedligeholdelsesbudget på 15–25% om året og en skriftlig betingelse for, hvornår I udfaser det.',
    vAssemble: 'Køb motoren og behold jeres regler. Her lander de fleste provisionsteams: Prowi beregner, synkroniserer, godkender og udbetaler, og I designer planen i Commission Studio.',
    vBuy: 'Provision er infrastruktur for jer, ikke det, der adskiller jer. Brug kræfterne på implementeringen og planens design i stedet for koden.',
    first: 'første version', upkeep: 'vedligehold', hosting: 'hosting og AI', reps: 'sælgere', months: 'måneder', onboarding: 'oprettelse', score: 'Score'
  };

  /* ---------- EN: static strings Webflow localization cannot reach (text beside a child span, aria-labels) ---------- */
  if (EN) {
    var LOC = {
      'Byg eller køb': 'Build or buy',
      'Sælgere på provision': 'Reps on commission',
      'Udviklerugers arbejde på første version': 'Engineering weeks for the first version',
      'Fuld udviklerudgift pr. måned': 'Loaded engineer cost per month',
      'Årligt vedligehold, andel af byggeprisen': 'Yearly upkeep, share of build cost',
      'Prowi-plan': 'Prowi plan',
      'Byg, 3 år': 'Build, 3 years',
      'Prowi, 3 år': 'Prowi, 3 years'
    };
    var ARIA = {
      'Jeres team kan bygge et værktøj til provisionsstyring på en weekend. Det dyre er at eje det.': 'Your team can build a commission management tool in a weekend. Owning it is the expensive part.',
      'Så spørgsmålet er ikke byg eller køb. Det er, hvilket lag I bygger.': 'So the question is not build or buy. It is which layer you build.'
    };
    each(root.querySelectorAll('.pw-build__kicker, .pw-build__field-label, .pw-build__plan-label'), function (el) {
      each(el.childNodes, function (n) {
        if (n.nodeType !== 3) return;
        var t = n.nodeValue.trim();
        if (LOC[t]) n.nodeValue = n.nodeValue.replace(t, LOC[t]);
      });
    });
    each(root.querySelectorAll('[aria-label]'), function (el) {
      var a = el.getAttribute('aria-label');
      if (ARIA[a]) el.setAttribute('aria-label', ARIA[a]);
    });
  }

  /* ---------- model (formulas exactly as in the design) ---------- */
  var PL = [['Starter', 37, 749], ['Business', 49, 1449], ['Prowi Plus', 89, 3449]];
  var state = { reps: 25, weeks: 12, eng: 9000, maint: 20, plan: 1, scores: [3, 3, 3, 3, 3, 3, 3] };
  function group(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function eur(n) { var r = Math.round(n); return '€' + (r < 0 ? '-' + group(-r) : group(r)); }
  function calc(s) {
    var initial = Math.round(s.weeks * s.eng / 4.33), upkeep = Math.round(initial * s.maint / 100 * 3), run = 250 * 36;
    var build = initial + upkeep + run, buy = PL[s.plan][1] * s.reps * 36 + PL[s.plan][2];
    return { initial: initial, upkeep: upkeep, run: run, build: build, buy: buy, max: Math.max(build, buy) || 1 };
  }
  function verdictOf(total) { return total > 28 ? 'build' : total >= 18 ? 'assemble' : 'buy'; }

  /* ---------- outputs ---------- */
  var out = {};
  each(root.querySelectorAll('[data-out]'), function (el) { out[el.getAttribute('data-out')] = el; });
  function setText(k, v) { if (out[k] && out[k].textContent !== v) out[k].textContent = v; }

  function renderCalc() {
    var s = state, c = calc(s);
    setText('reps', String(s.reps)); setText('weeks', String(s.weeks)); setText('eng', eur(s.eng)); setText('maint', s.maint + '%');
    setText('build', eur(c.build)); setText('buy', eur(c.buy));
    if (out['build-bar']) out['build-bar'].style.width = Math.max(4, c.build / c.max * 100) + '%';
    if (out['buy-bar']) out['buy-bar'].style.width = Math.max(4, c.buy / c.max * 100) + '%';
    setText('build-split', eur(c.initial) + ' ' + S.first + ' · ' + eur(c.upkeep) + ' ' + S.upkeep + ' · ' + eur(c.run) + ' ' + S.hosting);
    setText('buy-split', '€' + PL[s.plan][1] + ' × ' + s.reps + ' ' + S.reps + ' × 36 ' + S.months + ' · ' + eur(PL[s.plan][2]) + ' ' + S.onboarding);
    each(root.querySelectorAll('[data-plan]'), function (a) {
      var on = +a.getAttribute('data-plan') === s.plan;
      a.className = on ? 'pw-build__plan--on' : 'pw-build__plan';
      a.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function renderScore() {
    var sc = state.scores, total = sc.reduce(function (a, b) { return a + b; }, 0), v = verdictOf(total);
    each(root.querySelectorAll('[data-q]'), function (li) {
      var qi = +li.getAttribute('data-q');
      each(li.querySelectorAll('[data-score]'), function (a) {
        var val = +a.getAttribute('data-score'), sel = val === sc[qi];
        a.className = sel ? 'pw-build__pip--on' : val <= sc[qi] ? 'pw-build__pip--fill' : 'pw-build__pip';
        a.setAttribute('aria-pressed', sel ? 'true' : 'false');
      });
    });
    setText('total', total + ' / 35');
    setText('verdict', S[v]);
    setText('verdict-text', v === 'build' ? S.vBuild : v === 'assemble' ? S.vAssemble : S.vBuy);
  }

  /* ---------- inputs: placeholders -> real range inputs ---------- */
  each(root.querySelectorAll('[data-input]'), function (ph) {
    var key = ph.getAttribute('data-input');
    var inp = document.createElement('input');
    inp.type = 'range';
    inp.className = ph.className;
    inp.min = ph.getAttribute('data-min'); inp.max = ph.getAttribute('data-max'); inp.step = ph.getAttribute('data-step');
    inp.value = ph.getAttribute('data-value');
    inp.setAttribute('data-input', key);
    var field = ph.parentNode, lab = field && field.querySelector('.pw-build__field-label');
    if (lab && lab.firstChild && lab.firstChild.nodeType === 3) inp.setAttribute('aria-label', lab.firstChild.nodeValue.trim());
    state[key] = +inp.value;
    ph.parentNode.replaceChild(inp, ph);
    inp.addEventListener('input', function () { state[key] = +inp.value; renderCalc(); });
    inp.addEventListener('change', function () { state[key] = +inp.value; renderCalc(); });
  });

  function asButton(a, fn) {
    a.setAttribute('role', 'button');
    a.setAttribute('tabindex', '0');
    a.style.cursor = 'pointer';
    a.addEventListener('click', function (e) { e.preventDefault(); fn(); });
    a.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); fn(); }
    });
  }
  each(root.querySelectorAll('[data-plan]'), function (a) {
    if (/--on$/.test(a.className)) state.plan = +a.getAttribute('data-plan');
    asButton(a, function () { state.plan = +a.getAttribute('data-plan'); renderCalc(); });
  });
  each(root.querySelectorAll('[data-q]'), function (li) {
    var qi = +li.getAttribute('data-q');
    each(li.querySelectorAll('[data-score]'), function (a) {
      if (/--on$/.test(a.className)) state.scores[qi] = +a.getAttribute('data-score');
      a.setAttribute('aria-label', S.score + ' ' + a.getAttribute('data-score'));
      asButton(a, function () { state.scores[qi] = +a.getAttribute('data-score'); renderScore(); });
    });
  });
  if (REDUCED) each(root.querySelectorAll('.pw-build__bar--build,.pw-build__bar--buy'), function (b) { b.style.transition = 'none'; });

  renderCalc();
  renderScore();
})();
