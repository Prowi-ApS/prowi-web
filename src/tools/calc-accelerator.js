/* Accelerator-beregner / Commission accelerator calculator. Root: [data-tool="accelerator"] (markup built by calc-kit.js).
   A base rate up to quota and a higher rate above quota. The higher rate is entered either as a multiplier on the
   base rate (1,5 × 8 % = 12 %) or as a rate. It applies either only to sales above quota (marginal) or, once quota is
   reached (sales >= quota), to all sales (retroactive). Optional cap on the total commission for the period.
   A second table shows the payout at 80 / 100 / 120 / 150 % of quota with the same rules. */
(function () {
  function nz(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }

  // p: { quota, sales, base (pct), how: 'mult'|'rate', mult, high (pct), retro: bool, cap }
  function calc(p) {
    var quota = nz(p.quota), sales = nz(p.sales), base = nz(p.base);
    var high = p.how === 'rate' ? nz(p.high) : base * (p.mult == null ? 1 : nz(p.mult));
    var mult = base > 0 ? high / base : null;
    var rows = [], reached = quota > 0 && sales >= quota;
    if (!quota) rows.push({ key: 'noquota', basis: sales, rate: base });
    else if (p.retro) rows.push({ key: reached ? 'retro_yes' : 'retro_no', basis: sales, rate: reached ? high : base });
    else {
      rows.push({ key: 'under', basis: Math.min(sales, quota), rate: base });
      rows.push({ key: 'over', basis: Math.max(0, sales - quota), rate: high });
    }
    var raw = 0;
    rows.forEach(function (r) { r.amount = r.basis * r.rate / 100; raw += r.amount; });
    var cap = nz(p.cap), capped = cap > 0 && raw > cap, commission = capped ? cap : raw;
    var flat = sales * base / 100;
    return {
      rows: rows, raw: raw, cap: cap, capped: capped, capCut: capped ? raw - cap : 0, commission: commission,
      quota: quota, sales: sales, base: base, high: high, mult: mult, reached: reached, retro: !!p.retro,
      att: quota > 0 ? sales / quota * 100 : null, eff: sales > 0 ? commission / sales * 100 : null,
      extra: commission - flat, flat: flat
    };
  }
  function scenarios(p) {
    if (!nz(p.quota)) return [];
    return [80, 100, 120, 150].map(function (pct) {
      var q = {}; for (var k in p) q[k] = p[k];
      q.sales = nz(p.quota) * pct / 100;
      return { pct: pct, sales: q.sales, commission: calc(q).commission };
    });
  }

  var strings = {
    da: {
      retro: 'Den højere sats gælder', r_marg: 'Kun salg over målet', r_retro: 'Hele salget, når målet er nået',
      how: 'Sats over målet angives som', h_mult: 'Multiplikator', h_rate: 'Sats',
      quota: 'Mål (kvote) for perioden', sales: 'Salg i perioden', base: 'Sats op til målet', mult: 'Accelerator (multiplikator)',
      mult_hint: 'Satsen over målet er grundsatsen ganget med multiplikatoren, fx 1,5 × 8 % = 12 %.', high: 'Sats over målet',
      cap: 'Loft over provision i perioden (valgfri)', noCap: 'Intet loft',
      kicker: 'Provision i perioden',
      sub_marg: '{base} op til målet og {high} over målet ({mult})', sub_yes: 'Målet er nået: {high} af hele salget', sub_no: 'Målet er ikke nået: {base} af hele salget', sub_noquota: 'Intet mål angivet: {base} af hele salget',
      warn: 'Loftet begrænser provisionen. Uden loft ville den være {raw}.',
      att: 'Målopfyldelse', att_none: 'Angiv et mål for at se målopfyldelsen.', att_over: '{d} over målet.', att_under: '{d} under målet.', att_exact: 'Præcis på målet.',
      extra: 'Ekstra fra acceleratoren', extra_note: 'I forhold til {base} af hele salget ({flat}).',
      eff: 'Effektiv sats', eff_note: 'Provision ÷ salg i perioden.',
      rows: 'Beregning trin for trin', row_under: 'Salg op til målet på {q}', row_over: 'Salg over målet', row_yes: 'Hele salget, målet er nået', row_no: 'Hele salget, målet er ikke nået', row_noquota: 'Hele salget (intet mål angivet)',
      row_calc: '{basis} × {rate}', row_cap: 'Loft over provision', row_cap_calc: 'Maks. {cap} i perioden', row_total: 'Provision i alt', row_total_calc: 'Effektiv sats {eff} af salget', row_total_none: 'Intet salg i perioden',
      scen: 'Provision ved forskellige niveauer', scen_row: '{pct} af målet', scen_calc: 'Salg {s}',
      f_marg: 'Provision = salg op til målet × grundsats + salg over målet × grundsats × multiplikator',
      f_retro: 'Provision = hele salget × (grundsats × multiplikator, hvis målet er nået, ellers grundsats)',
      x_marg: 'Acceleratoren belønner det ekstra salg over målet. Salget op til målet giver altid grundsatsen, så der er ingen kant ved 100 %.',
      x_retro: 'Når den højere sats gælder hele salget, springer provisionen ved 100 % af målet. Det motiverer kraftigt tæt på målet, men giver en kant, som kan friste til at flytte handler.',
      fine: 'Beregningen er vejledende og før skat. Rigtige planer har ofte flere trin, gulve og clawbacks. Prowi beregner dem automatisk, handel for handel.',
      live: 'Provision: {c}, målopfyldelse: {att}, ekstra fra acceleratoren: {x}.'
    },
    en: {
      retro: 'The higher rate applies to', r_marg: 'Only sales above quota', r_retro: 'All sales once quota is reached',
      how: 'Enter the rate above quota as', h_mult: 'Multiplier', h_rate: 'Rate',
      quota: 'Quota for the period', sales: 'Sales in the period', base: 'Rate up to quota', mult: 'Accelerator (multiplier)',
      mult_hint: 'The rate above quota is the base rate times the multiplier, e.g. 1.5 × 8% = 12%.', high: 'Rate above quota',
      cap: 'Commission cap for the period (optional)', noCap: 'No cap',
      kicker: 'Commission for the period',
      sub_marg: '{base} up to quota and {high} above quota ({mult})', sub_yes: 'Quota reached: {high} on all sales', sub_no: 'Quota not reached: {base} on all sales', sub_noquota: 'No quota entered: {base} on all sales',
      warn: 'The cap limits the commission. Without the cap it would be {raw}.',
      att: 'Quota attainment', att_none: 'Enter a quota to see attainment.', att_over: '{d} above quota.', att_under: '{d} below quota.', att_exact: 'Exactly on quota.',
      extra: 'Extra from the accelerator', extra_note: 'Compared with {base} on all sales ({flat}).',
      eff: 'Effective rate', eff_note: 'Commission ÷ sales in the period.',
      rows: 'Step-by-step calculation', row_under: 'Sales up to the quota of {q}', row_over: 'Sales above quota', row_yes: 'All sales, quota reached', row_no: 'All sales, quota not reached', row_noquota: 'All sales (no quota entered)',
      row_calc: '{basis} × {rate}', row_cap: 'Commission cap', row_cap_calc: 'Max {cap} in the period', row_total: 'Total commission', row_total_calc: 'Effective rate {eff} of sales', row_total_none: 'No sales in the period',
      scen: 'Commission at different levels', scen_row: '{pct} of quota', scen_calc: 'Sales {s}',
      f_marg: 'Commission = sales up to quota × base rate + sales above quota × base rate × multiplier',
      f_retro: 'Commission = all sales × (base rate × multiplier if quota is reached, otherwise the base rate)',
      x_marg: 'The accelerator rewards the extra sales above quota. Sales up to quota always earn the base rate, so there is no cliff at 100%.',
      x_retro: 'When the higher rate applies to all sales, commission jumps at 100% of quota. That is a strong push close to quota, but the cliff can tempt reps to move deals.',
      fine: 'The calculation is a guide, before tax. Real plans often add more tiers, floors and clawbacks. Prowi calculates them automatically, deal by deal.',
      live: 'Commission: {c}, quota attainment: {att}, extra from the accelerator: {x}.'
    }
  };

  function params(state) {
    var v = state.v;
    return { quota: v.quota, sales: v.sales, base: v.base, how: state.t.how, mult: v.mult, high: v.high, retro: state.t.retro === 'retro', cap: v.cap };
  }

  function view(state, lang, H, S) {
    var p = params(state), r = calc(p), tpl = H.tpl, K = H.K, P = H.P;
    var rows = r.rows.map(function (x) {
      var label = x.key === 'under' ? tpl(S.row_under, { q: K(r.quota) }) : x.key === 'over' ? S.row_over : x.key === 'retro_yes' ? S.row_yes : x.key === 'retro_no' ? S.row_no : S.row_noquota;
      return { label: label, calc: tpl(S.row_calc, { basis: K(x.basis), rate: P(x.rate) }), amount: K(x.amount) };
    });
    if (r.capped) rows.push({ label: S.row_cap, calc: tpl(S.row_cap_calc, { cap: K(r.cap) }), amount: K(-r.capCut) });
    rows.push({ total: true, label: S.row_total, calc: r.eff == null ? S.row_total_none : tpl(S.row_total_calc, { eff: P(r.eff, 1) }), amount: K(r.commission) });
    var scen = scenarios(p).map(function (s) { return { label: tpl(S.scen_row, { pct: P(s.pct, 0) }), calc: tpl(S.scen_calc, { s: K(s.sales) }), amount: K(s.commission) }; });
    var sub;
    if (!r.quota) sub = tpl(S.sub_noquota, { base: P(r.base) });
    else if (r.retro) sub = tpl(r.reached ? S.sub_yes : S.sub_no, { base: P(r.base), high: P(r.high) });
    else sub = tpl(S.sub_marg, { base: P(r.base), high: P(r.high), mult: r.mult == null ? '—' : H.X(r.mult) });
    var attNote = r.att == null ? S.att_none : r.sales > r.quota ? tpl(S.att_over, { d: K(r.sales - r.quota) }) : r.sales < r.quota ? tpl(S.att_under, { d: K(r.quota - r.sales) }) : S.att_exact;
    var hero = K(r.commission);
    var sections = [{ title: S.rows, rows: rows }];
    if (scen.length) sections.push({ title: S.scen, rows: scen });
    return {
      kicker: S.kicker, hero: hero, sub: sub, warn: r.capped ? tpl(S.warn, { raw: K(r.raw) }) : '',
      metrics: [
        { label: S.att, value: P(r.att, 0), note: attNote, bar: r.att == null ? 0 : Math.min(100, r.att) },
        { label: S.extra, value: K(r.extra), note: tpl(S.extra_note, { base: P(r.base), flat: K(r.flat) }) },
        { label: S.eff, value: P(r.eff, 1), note: S.eff_note }
      ],
      sections: sections,
      formula: r.retro ? S.f_retro : S.f_marg,
      explain: r.retro ? S.x_retro : S.x_marg,
      fine: S.fine,
      live: tpl(S.live, { c: hero, att: P(r.att, 0), x: K(r.extra) })
    };
  }

  var def = {
    id: 'accelerator', strings: strings, calc: calc, scenarios: scenarios, params: params, view: view,
    toggles: [
      { key: 'retro', label: 'retro', big: true, def: 'marginal', opts: [{ v: 'marginal', label: 'r_marg' }, { v: 'retro', label: 'r_retro' }] },
      { key: 'how', label: 'how', def: 'mult', opts: [{ v: 'mult', label: 'h_mult' }, { v: 'rate', label: 'h_rate' }] }
    ],
    fields: [
      { key: 'quota', kind: 'kr', def: 350000, label: 'quota' },
      { key: 'sales', kind: 'kr', def: 420000, label: 'sales' },
      { key: 'base', kind: 'pct', def: 8, label: 'base' },
      { key: 'mult', kind: 'x', def: 1.5, label: 'mult', hint: 'mult_hint', show: function (s) { return s.t.how !== 'rate'; } },
      { key: 'high', kind: 'pct', def: 12, label: 'high', show: function (s) { return s.t.how === 'rate'; } },
      { key: 'cap', kind: 'kr', def: null, label: 'cap', placeholder: 'noCap' }
    ],
    layout: ['quota', 'sales', 'base', 'toggle:how', 'mult', 'high', 'cap']
  };

  if (typeof module === 'object' && module.exports) { module.exports = def; return; }
  if (!document.querySelector('[data-tool="accelerator"]')) return;
  if (window.__pwCalcMount) window.__pwCalcMount(def); else (window.__pwCalcQ = window.__pwCalcQ || []).push(def);
})();
