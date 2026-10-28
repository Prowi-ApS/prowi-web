/* Trappemodel-beregner / Tiered commission calculator. Root: [data-tool="tiers"] (markup built by calc-kit.js).
   Up to four tiers (three limits). Two methods, shown side by side so the difference is clear:
   - marginal: each rate applies only to the part of sales inside its tier (no jump at a limit);
   - whole amount: the rate of the highest tier reached applies to all sales (the commission jumps at each limit).
   A limit is "reached" when sales are at or above it. An empty limit ends the list: the open top tier then uses the
   rate after the last limit that is set. */
(function () {
  function nz(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }

  // p: { method: 'marginal'|'whole', sales, limits: [t1, t2, t3], rates: [r1, r2, r3, r4] } (rates in percent)
  function calc(p) {
    var sales = nz(p.sales), L = p.limits || [], R = p.rates || [];
    var tiers = [], lower = 0, k = 0;
    for (; k < L.length; k++) {
      var t = nz(L[k]);
      if (!(t > lower)) break;
      tiers.push({ i: k + 1, from: lower, to: t, rate: nz(R[k]) });
      lower = t;
    }
    tiers.push({ i: k + 1, from: lower, to: null, rate: nz(R[k]), last: true });
    var marginal = 0, reached = tiers[0];
    tiers.forEach(function (x) {
      x.basis = x.to == null ? Math.max(0, sales - x.from) : Math.max(0, Math.min(sales, x.to) - x.from);
      x.amount = x.basis * x.rate / 100;
      marginal += x.amount;
      if (sales >= x.from) reached = x;
    });
    var whole = sales * reached.rate / 100;
    var next = reached.last ? null : tiers[reached.i]; // tier after the one reached
    var useWhole = p.method === 'whole';
    var commission = useWhole ? whole : marginal;
    var r = {
      method: useWhole ? 'whole' : 'marginal', tiers: tiers, sales: sales, reached: reached, next: next,
      marginal: marginal, whole: whole, commission: commission, other: useWhole ? marginal : whole,
      eff: sales > 0 ? commission / sales * 100 : null,
      toNext: next ? next.from - sales : null
    };
    if (next) {
      // commission once sales reach the next limit, with each method
      var atNext = calc({ method: p.method, sales: next.from, limits: L, rates: R });
      r.atNext = atNext.commission;
    }
    return r;
  }

  var strings = {
    da: {
      method: 'Vælg metode', m_marg: 'Marginal (trinvis)', m_marg_sub: 'Hver sats gælder kun sit trin', m_whole: 'Hele beløbet', m_whole_sub: 'Det højeste nåede trins sats gælder alt salg',
      sales: 'Salg i perioden', t1: 'Trin 1 op til', r1: 'Sats trin 1', t2: 'Trin 2 op til', r2: 'Sats trin 2', t3: 'Trin 3 op til (valgfri)', r3: 'Sats trin 3', r4: 'Sats over trin 3',
      t3hint: 'Lad trin 3 stå tomt for at bruge tre trin. Når salget når en grænse, gælder næste trin.',
      noLimit: 'Intet trin 3',
      kicker: 'Provision i perioden',
      sub_marg: 'Marginal trappemodel med {n} trin på {sales}', sub_whole: 'Trin {i} er nået: {rate} af hele salget',
      eff: 'Effektiv sats', eff_note: 'Provision ÷ salg i perioden.',
      other_marg: 'Med hele beløbet', other_whole: 'Med marginal beregning',
      diff_more: '{d} mere end den valgte metode.', diff_less: '{d} mindre end den valgte metode.', diff_same: 'Samme beløb som den valgte metode.',
      next: 'Til næste trin', next_none: 'Øverste trin', next_note_marg: 'Trin {i} starter ved {t}. Salg derover giver {rate}.',
      next_note_whole: 'Ved {t} gælder {rate} af hele salget. Provisionen bliver {c}.', next_note_top: 'Salget er i det øverste trin ({rate}).',
      rows: 'Beregning trin for trin', row_tier: 'Trin {i}: {from}–{to}', row_top: 'Trin {i}: over {from}', row_calc: '{basis} × {rate}',
      row_whole: 'Hele salget, trin {i} er nået', row_total: 'Provision i alt', row_total_calc: 'Effektiv sats {eff} af salget', row_total_none: 'Intet salg i perioden',
      f_marg: 'Provision = summen af (salg inden for trinnet × trinnets sats)', f_whole: 'Provision = hele salget × satsen for det højeste trin, der er nået',
      x_marg: 'Med marginal beregning stiger provisionen jævnt. En ekstra krone giver kun den højere sats på den del af salget, der ligger over grænsen.',
      x_whole: 'Med hele beløbet springer provisionen, når en grænse nås, fordi den højere sats også gælder salget under grænsen. Den kant kan friste til at flytte handler mellem perioder.',
      fine: 'Beregningen er vejledende og før skat. Rigtige planer har ofte flere regler, fx loft, clawback og delt provision. Prowi beregner dem automatisk, handel for handel.',
      live: 'Provision: {c}, effektiv sats: {eff}, den anden metode: {o}.'
    },
    en: {
      method: 'Choose a method', m_marg: 'Marginal (tier by tier)', m_marg_sub: 'Each rate only applies inside its tier', m_whole: 'Whole amount', m_whole_sub: 'The rate of the highest tier reached applies to all sales',
      sales: 'Sales in the period', t1: 'Tier 1 up to', r1: 'Tier 1 rate', t2: 'Tier 2 up to', r2: 'Tier 2 rate', t3: 'Tier 3 up to (optional)', r3: 'Tier 3 rate', r4: 'Rate above tier 3',
      t3hint: 'Leave tier 3 empty to use three tiers. When sales reach a limit, the next tier applies.',
      noLimit: 'No tier 3',
      kicker: 'Commission for the period',
      sub_marg: 'Marginal tiered plan with {n} tiers on {sales}', sub_whole: 'Tier {i} reached: {rate} on all sales',
      eff: 'Effective rate', eff_note: 'Commission ÷ sales in the period.',
      other_marg: 'With the whole-amount method', other_whole: 'With the marginal method',
      diff_more: '{d} more than the chosen method.', diff_less: '{d} less than the chosen method.', diff_same: 'Same amount as the chosen method.',
      next: 'To the next tier', next_none: 'Top tier', next_note_marg: 'Tier {i} starts at {t}. Sales above it earn {rate}.',
      next_note_whole: 'At {t}, {rate} applies to all sales. Commission becomes {c}.', next_note_top: 'Sales are in the top tier ({rate}).',
      rows: 'Step-by-step calculation', row_tier: 'Tier {i}: {from}–{to}', row_top: 'Tier {i}: above {from}', row_calc: '{basis} × {rate}',
      row_whole: 'All sales, tier {i} reached', row_total: 'Total commission', row_total_calc: 'Effective rate {eff} of sales', row_total_none: 'No sales in the period',
      f_marg: 'Commission = sum of (sales inside the tier × the tier rate)', f_whole: 'Commission = all sales × the rate of the highest tier reached',
      x_marg: 'With the marginal method, commission rises smoothly. An extra krone only earns the higher rate on the part of sales above the limit.',
      x_whole: 'With the whole-amount method, commission jumps when a limit is reached, because the higher rate also applies to the sales below it. That cliff can tempt reps to move deals between periods.',
      fine: 'The calculation is a guide, before tax. Real plans often add more rules, e.g. caps, clawbacks and split commission. Prowi calculates them automatically, deal by deal.',
      live: 'Commission: {c}, effective rate: {eff}, other method: {o}.'
    }
  };

  function params(state) {
    var v = state.v;
    return { method: state.t.method, sales: v.sales, limits: [v.t1, v.t2, v.t3], rates: [v.r1, v.r2, v.r3, v.r4] };
  }

  function view(state, lang, H, S) {
    var r = calc(params(state)), tpl = H.tpl, K = H.K, P = H.P;
    var marg = r.method === 'marginal';
    var rows = [];
    if (marg) {
      r.tiers.forEach(function (x) {
        rows.push({ label: x.last ? tpl(S.row_top, { i: x.i, from: K(x.from) }) : tpl(S.row_tier, { i: x.i, from: H.N(x.from), to: K(x.to) }),
          calc: tpl(S.row_calc, { basis: K(x.basis), rate: P(x.rate) }), amount: K(x.amount) });
      });
    } else {
      rows.push({ label: tpl(S.row_whole, { i: r.reached.i }), calc: tpl(S.row_calc, { basis: K(r.sales), rate: P(r.reached.rate) }), amount: K(r.whole) });
    }
    rows.push({ total: true, label: S.row_total, calc: r.eff == null ? S.row_total_none : tpl(S.row_total_calc, { eff: P(r.eff, 1) }), amount: K(r.commission) });
    var d = r.other - r.commission;
    var nextVal, nextNote;
    if (!r.next) { nextVal = S.next_none; nextNote = tpl(S.next_note_top, { rate: P(r.reached.rate) }); }
    else {
      nextVal = K(r.toNext);
      nextNote = marg ? tpl(S.next_note_marg, { i: r.next.i, t: K(r.next.from), rate: P(r.next.rate) })
        : tpl(S.next_note_whole, { t: K(r.next.from), rate: P(r.next.rate), c: K(r.atNext) });
    }
    var hero = K(r.commission);
    return {
      kicker: S.kicker, hero: hero,
      sub: marg ? tpl(S.sub_marg, { n: r.tiers.length, sales: K(r.sales) }) : tpl(S.sub_whole, { i: r.reached.i, rate: P(r.reached.rate) }),
      metrics: [
        { label: S.eff, value: P(r.eff, 1), note: S.eff_note },
        { label: marg ? S.other_marg : S.other_whole, value: K(r.other), note: Math.round(d) === 0 ? S.diff_same : tpl(d > 0 ? S.diff_more : S.diff_less, { d: K(Math.abs(d)) }) },
        { label: S.next, value: nextVal, note: nextNote }
      ],
      sections: [{ title: S.rows, rows: rows }],
      formula: marg ? S.f_marg : S.f_whole,
      explain: marg ? S.x_marg : S.x_whole,
      fine: S.fine,
      live: tpl(S.live, { c: hero, eff: P(r.eff, 1), o: K(r.other) })
    };
  }

  var def = {
    id: 'tiers', strings: strings, calc: calc, params: params, view: view,
    toggles: [{ key: 'method', label: 'method', big: true, def: 'marginal',
      opts: [{ v: 'marginal', label: 'm_marg', sub: 'm_marg_sub' }, { v: 'whole', label: 'm_whole', sub: 'm_whole_sub' }] }],
    fields: [
      { key: 'sales', kind: 'kr', def: 420000, label: 'sales' },
      { key: 't1', kind: 'kr', def: 200000, label: 't1' }, { key: 'r1', kind: 'pct', def: 5, label: 'r1' },
      { key: 't2', kind: 'kr', def: 350000, label: 't2' }, { key: 'r2', kind: 'pct', def: 8, label: 'r2' },
      { key: 't3', kind: 'kr', def: 500000, label: 't3', placeholder: 'noLimit' }, { key: 'r3', kind: 'pct', def: 10, label: 'r3' },
      { key: 'r4', kind: 'pct', def: 12, label: 'r4', show: function (s) { return nz(s.v.t3) > nz(s.v.t2); } }
    ],
    layout: ['sales', { pair: ['t1', 'r1'] }, { pair: ['t2', 'r2'] }, { pair: ['t3', 'r3'], hint: 't3hint' }, 'r4']
  };

  if (typeof module === 'object' && module.exports) { module.exports = def; return; }
  if (!document.querySelector('[data-tool="tiers"]')) return;
  if (window.__pwCalcMount) window.__pwCalcMount(def); else (window.__pwCalcQ = window.__pwCalcQ || []).push(def);
})();
