/* Kvote-beregner / Sales quota calculator. Root: [data-tool="quota"] (markup built by calc-kit.js).
   Company revenue target for the sales team (year) → total quota with over-assignment (quotas add up to more than
   the target, because not every rep reaches 100 %) → monthly quota per fully ramped rep, split by capacity in
   "rep months". Ramped reps count 12 months each. New reps start in a given month and ramp linearly: with a ramp of
   L months, month k of the ramp is k/(L+1) of a full quota (3 months: 25 %, 50 %, 75 %), then 100 %. */
(function () {
  function nz(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }

  function rampShare(k, L) { return k <= L ? k / (L + 1) : 1; }
  // p: { target, over (pct), reps, newReps, start (1-12), ramp (months) }
  function calc(p) {
    var target = nz(p.target), over = nz(p.over), reps = nz(p.reps), newReps = nz(p.newReps);
    var start = Math.min(12, Math.max(1, Math.round(nz(p.start) || 1))), L = Math.min(11, Math.round(nz(p.ramp)));
    var total = target * (1 + over / 100);
    var months = [], sumNew = 0;
    for (var m = start; m <= 12; m++) { var f = rampShare(m - start + 1, L); months.push({ month: m, k: m - start + 1, share: f }); sumNew += f; }
    var capacity = reps * 12 + newReps * sumNew;
    var monthly = capacity > 0 ? total / capacity : 0;
    var fullFrom = start + L; // first month at full quota
    return {
      target: target, over: over, reps: reps, newReps: newReps, start: start, ramp: L, total: total, buffer: total - target,
      months: months, sumNew: sumNew, capacity: capacity, monthly: monthly, annual: monthly * 12,
      newRepYear: monthly * sumNew, fullFrom: fullFrom <= 12 ? fullFrom : null,
      rampRows: months.filter(function (x) { return x.k <= L; }).map(function (x) { return { k: x.k, month: x.month, share: x.share, quota: monthly * x.share }; })
    };
  }

  var MON = {
    da: ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };
  var strings = {
    da: {
      target: 'Omsætningsmål for salgsteamet (år)', target_hint: 'Den omsætning, salgsteamet samlet skal skabe i året.',
      over: 'Over-assignment', over_hint: 'Kvoterne sættes samlet højere end målet, fordi ikke alle når 100 %. 10-20 % er almindeligt.',
      reps: 'Fuldt oplærte sælgere', newReps: 'Nye sælgere i år (valgfri)', start: 'Nye sælgere starter i måned', start_hint: '1 = januar, 12 = december.',
      ramp: 'Opstartsperiode', ramp_hint: 'Kvoten trappes lineært op. Med 3 måneder er den 25 %, 50 % og 75 % af fuld kvote, derefter 100 %.',
      none: '0',
      kicker: 'Månedskvote pr. fuldt oplært sælger', sub: '{annual} om året. Kvoterne summer til {total} ({over} over målet på {target})',
      annual: 'Årskvote, fuldt oplært sælger', annual_note: '12 × månedskvoten.',
      newRep: 'Årskvote, ny sælger', newRep_note: 'Starter i {m}. Fuld kvote fra {full}.', newRep_note_nofull: 'Starter i {m}. Når ikke fuld kvote i år.', newRep_none: 'Ingen nye sælgere angivet.',
      cap: 'Kapacitet', cap_unit: '{n} sælgermåneder', cap_note: '{reps} × 12 + {newReps} nye × {sum}.', cap_note_nonew: '{reps} sælgere × 12 måneder.',
      rows: 'Fra mål til kvote', r_target: 'Omsætningsmål', r_over: 'Over-assignment', r_over_calc: '{target} × {over}', r_total: 'Kvoter i alt',
      r_cap: 'Kapacitet i sælgermåneder', r_cap_calc: '{reps} × 12 + {newReps} × {sum}', r_monthly: 'Månedskvote, fuldt oplært sælger', r_monthly_calc: '{total} / {cap}',
      ramp_rows: 'Opstart for en ny sælger', r_ramp: 'Måned {k} ({month})', r_ramp_calc: '{share} af fuld kvote',
      f: 'Månedskvote = omsætningsmål × (1 + over-assignment) / (fuldt oplærte × 12 + nye sælgeres måneder vægtet med opstarten)',
      x: 'Kapaciteten tæller sælgermåneder: en fuldt oplært sælger tæller 12, mens en ny sælger kun tæller de måneder, hun er ansat, vægtet med opstarten. Så kvoterne passer til den kapacitet, I faktisk har.',
      fine: 'Beregningen er vejledende. Sæson, territorier og pipeline kan give grund til at fordele kvoterne anderledes. Prowi viser målopfyldelsen live pr. sælger, ud fra salget i jeres CRM.',
      live: 'Månedskvote: {c}. Årskvote: {a}. Kvoter i alt: {t}.'
    },
    en: {
      target: 'Revenue target for the sales team (year)', target_hint: 'The revenue the sales team must bring in during the year.',
      over: 'Over-assignment', over_hint: 'Quotas add up to more than the target, because not every rep reaches 100%. 10-20% is common.',
      reps: 'Fully ramped reps', newReps: 'New reps this year (optional)', start: 'New reps start in month', start_hint: '1 = January, 12 = December.',
      ramp: 'Ramp period', ramp_hint: 'The quota ramps up linearly. With 3 months it is 25%, 50% and 75% of a full quota, then 100%.',
      none: '0',
      kicker: 'Monthly quota per fully ramped rep', sub: '{annual} a year. Quotas add up to {total} ({over} above the target of {target})',
      annual: 'Annual quota, fully ramped rep', annual_note: '12 × the monthly quota.',
      newRep: 'Annual quota, new rep', newRep_note: 'Starts in {m}. Full quota from {full}.', newRep_note_nofull: 'Starts in {m}. Does not reach full quota this year.', newRep_none: 'No new reps entered.',
      cap: 'Capacity', cap_unit: '{n} rep months', cap_note: '{reps} × 12 + {newReps} new × {sum}.', cap_note_nonew: '{reps} reps × 12 months.',
      rows: 'From target to quota', r_target: 'Revenue target', r_over: 'Over-assignment', r_over_calc: '{target} × {over}', r_total: 'Total quotas',
      r_cap: 'Capacity in rep months', r_cap_calc: '{reps} × 12 + {newReps} × {sum}', r_monthly: 'Monthly quota, fully ramped rep', r_monthly_calc: '{total} / {cap}',
      ramp_rows: 'Ramp for a new rep', r_ramp: 'Month {k} ({month})', r_ramp_calc: '{share} of a full quota',
      f: 'Monthly quota = revenue target × (1 + over-assignment) / (ramped reps × 12 + new reps’ months weighted by the ramp)',
      x: 'Capacity counts rep months: a fully ramped rep counts 12, while a new rep only counts the months she is employed, weighted by the ramp. So the quotas fit the capacity you actually have.',
      fine: 'The calculation is a guide. Seasonality, territories and pipeline can be reasons to spread quotas differently. Prowi shows quota attainment live per rep, from the sales in your CRM.',
      live: 'Monthly quota: {c}. Annual quota: {a}. Total quotas: {t}.'
    }
  };

  function params(state) {
    var v = state.v;
    return { target: v.target, over: v.over, reps: v.reps, newReps: v.newReps, start: v.start, ramp: v.ramp };
  }

  function view(state, lang, H, S) {
    var r = calc(params(state)), tpl = H.tpl, K = H.K, P = H.P, N = H.N, M = MON[lang];
    var rows = [
      { label: S.r_target, calc: '', amount: K(r.target) },
      { label: S.r_over, calc: tpl(S.r_over_calc, { target: K(r.target), over: P(r.over) }), amount: '+' + K(r.buffer) },
      { label: S.r_total, calc: '', amount: K(r.total) },
      { label: S.r_cap, calc: tpl(S.r_cap_calc, { reps: N(r.reps, 2), newReps: N(r.newReps, 2), sum: N(r.sumNew, 2) }), amount: N(r.capacity, 2) },
      { total: true, label: S.r_monthly, calc: tpl(S.r_monthly_calc, { total: K(r.total), cap: N(r.capacity, 2) }), amount: K(r.monthly) }
    ];
    var sections = [{ title: S.rows, rows: rows }];
    if (r.newReps && r.rampRows.length) sections.push({ title: S.ramp_rows, rows: r.rampRows.map(function (x) {
      return { label: tpl(S.r_ramp, { k: x.k, month: M[x.month - 1] }), calc: tpl(S.r_ramp_calc, { share: P(x.share * 100, 0) }), amount: K(x.quota) };
    }) });
    var newNote = !r.newReps ? S.newRep_none : r.fullFrom ? tpl(S.newRep_note, { m: M[r.start - 1], full: M[r.fullFrom - 1] }) : tpl(S.newRep_note_nofull, { m: M[r.start - 1] });
    var hero = K(r.monthly);
    return {
      kicker: S.kicker, hero: hero,
      sub: tpl(S.sub, { annual: K(r.annual), total: K(r.total), over: P(r.over), target: K(r.target) }),
      metrics: [
        { label: S.annual, value: K(r.annual), note: S.annual_note },
        { label: S.newRep, value: r.newReps ? K(r.newRepYear) : '—', note: newNote },
        { label: S.cap, value: tpl(S.cap_unit, { n: N(r.capacity, 2) }), note: r.newReps ? tpl(S.cap_note, { reps: N(r.reps, 2), newReps: N(r.newReps, 2), sum: N(r.sumNew, 2) }) : tpl(S.cap_note_nonew, { reps: N(r.reps, 2) }) }
      ],
      sections: sections, formula: S.f, explain: S.x, fine: S.fine,
      live: tpl(S.live, { c: hero, a: K(r.annual), t: K(r.total) })
    };
  }

  var def = {
    id: 'quota', strings: strings, calc: calc, params: params, view: view,
    toggles: [],
    fields: [
      { key: 'target', kind: 'kr', def: 12000000, label: 'target', hint: 'target_hint' },
      { key: 'over', kind: 'pct', def: 15, label: 'over', hint: 'over_hint', max: 100 },
      { key: 'reps', kind: 'dec', def: 6, label: 'reps', step: 1, max: 1000 },
      { key: 'newReps', kind: 'dec', def: 2, label: 'newReps', placeholder: 'none', step: 1, max: 1000 },
      { key: 'start', kind: 'int', def: 4, label: 'start', hint: 'start_hint', min: 1, max: 12, show: function (s) { return nz(s.v.newReps) > 0; } },
      { key: 'ramp', kind: 'int', def: 3, label: 'ramp', hint: 'ramp_hint', unit: { da: 'mdr.', en: 'months' }, max: 11, show: function (s) { return nz(s.v.newReps) > 0; } }
    ],
    layout: ['target', 'over', { pair: ['reps', 'newReps'] }, 'start', 'ramp']
  };

  if (typeof module === 'object' && module.exports) { module.exports = def; return; }
  if (!document.querySelector('[data-tool="quota"]')) return;
  if (window.__pwCalcMount) window.__pwCalcMount(def); else (window.__pwCalcQ = window.__pwCalcQ || []).push(def);
})();
