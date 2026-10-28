/* Delt provision-beregner / Split commission calculator. Root: [data-tool="split"] (markup built by calc-kit.js).
   Pool = deal value × commission rate, split between up to three reps by share (%). Up to two overlay roles (e.g. a
   solution consultant or a sales manager) earn their own rate on the full deal value, either on top of the split or
   taken out of the pool before it is split. Shares that do not add up to 100 % are flagged. */
(function () {
  function nz(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }

  // p: { value, rate (pct), shares: [a, b, c] (pct), overlays: [o1, o2] (pct of deal value), mode: 'top'|'pool' }
  function calc(p) {
    var value = nz(p.value), rate = nz(p.rate), pool = value * rate / 100;
    var ovl = (p.overlays || []).map(function (o, i) { return { i: i + 1, rate: nz(o), amount: value * nz(o) / 100 }; }).filter(function (o) { return o.rate > 0; });
    var ovlSum = 0; ovl.forEach(function (o) { ovlSum += o.amount; });
    var fromPool = p.mode === 'pool';
    var splitPool = fromPool ? Math.max(0, pool - ovlSum) : pool;
    var shares = (p.shares || []).map(function (s, i) { return { i: i, share: nz(s) }; });
    var shareSum = 0; shares.forEach(function (s) { shareSum += s.share; });
    var reps = shares.filter(function (s) { return s.share > 0; }).map(function (s) { return { i: s.i, share: s.share, amount: splitPool * s.share / 100 }; });
    var repSum = 0; reps.forEach(function (r) { repSum += r.amount; });
    var total = repSum + ovlSum;
    return {
      value: value, rate: rate, pool: pool, splitPool: splitPool, fromPool: fromPool, overlays: ovl, ovlSum: ovlSum,
      reps: reps, repSum: repSum, shareSum: shareSum, total: total, totalRate: value > 0 ? total / value * 100 : null,
      overPool: fromPool && ovlSum > pool
    };
  }

  var NAMES = { da: ['Sælger A', 'Sælger B', 'Sælger C'], en: ['Rep A', 'Rep B', 'Rep C'] };
  var strings = {
    da: {
      mode: 'Overlay-roller betales', m_top: 'Oveni splittet', m_top_sub: 'Sælgernes andele påvirkes ikke', m_pool: 'Af puljen', m_pool_sub: 'Overlay trækkes fra, før puljen deles',
      value: 'Dealens værdi', rate: 'Provisionssats', a: 'Sælger A, andel', b: 'Sælger B, andel', c: 'Sælger C, andel (valgfri)',
      shareHint: 'Andelene skal normalt give 100 % tilsammen.', o1: 'Overlay-rolle 1, sats af dealen (valgfri)', o1hint: 'Fx en løsningskonsulent eller en specialist.',
      o2: 'Overlay-rolle 2, sats af dealen (valgfri)', o2hint: 'Fx salgschefen.', none: 'Ingen',
      kicker: 'Samlet provision på dealen', sub: '{rate} af {value} fordelt på {n} sælgere{o}', sub_o: ' plus {m} overlay-roller', sub_o1: ' plus 1 overlay-rolle',
      warn_sum: 'Andelene giver {s} tilsammen, ikke 100 %. Tjek splittet.', warn_pool: 'Overlay-rollerne er større end puljen, så der er intet tilbage til sælgerne.',
      totalRate: 'Samlet sats', totalRate_note: 'Al provision på dealen ÷ dealens værdi.',
      reps: 'Til sælgerne', reps_note: 'Pulje {pool}. Andele i alt {s}.', reps_note_pool: 'Pulje {pool} minus overlay {o}. Andele i alt {s}.',
      ovl: 'Til overlay-roller', ovl_note_top: 'Betales oveni splittet.', ovl_note_pool: 'Trukket fra puljen.', ovl_none: 'Ingen overlay-roller angivet.',
      rows: 'Fordeling', row_rep: '{name}, {share}', row_rep_calc: '{pool} × {share}', row_ovl: 'Overlay-rolle {i}', row_ovl_calc: '{value} × {rate}',
      row_total: 'Provision i alt', row_total_calc: 'Samlet sats {r} af dealen',
      f_top: 'Sælgerens provision = dealens værdi × sats × andel. Overlay = dealens værdi × overlay-sats, betalt oveni.',
      f_pool: 'Pulje = dealens værdi × sats. Overlay = dealens værdi × overlay-sats, trukket fra puljen. Resten deles efter andelene.',
      x_top: 'Med overlay oveni koster dealen mere i alt, men sælgernes split er uændret. Det er det mest almindelige, når en specialist eller leder skal belønnes uden at tage fra sælgerne.',
      x_pool: 'Med overlay af puljen er dealens samlede provision fast, og overlay-rollerne betales af det, sælgerne ellers ville have fået.',
      fine: 'Beregningen er vejledende og før skat. Skriv altid reglerne for delt provision ind i provisionsaftalen. Prowi fordeler provisionen automatisk ud fra de roller, der står på dealen i CRM.',
      live: 'Samlet provision: {t}. Til sælgerne: {r}. Til overlay-roller: {o}.'
    },
    en: {
      mode: 'Overlay roles are paid', m_top: 'On top of the split', m_top_sub: 'Reps’ shares are not affected', m_pool: 'From the pool', m_pool_sub: 'Overlay comes out before the pool is split',
      value: 'Deal value', rate: 'Commission rate', a: 'Rep A, share', b: 'Rep B, share', c: 'Rep C, share (optional)',
      shareHint: 'The shares normally add up to 100%.', o1: 'Overlay role 1, rate of the deal (optional)', o1hint: 'E.g. a solution consultant or a specialist.',
      o2: 'Overlay role 2, rate of the deal (optional)', o2hint: 'E.g. the sales manager.', none: 'None',
      kicker: 'Total commission on the deal', sub: '{rate} of {value} split between {n} reps{o}', sub_o: ' plus {m} overlay roles', sub_o1: ' plus 1 overlay role',
      warn_sum: 'The shares add up to {s}, not 100%. Check the split.', warn_pool: 'The overlay roles are larger than the pool, so nothing is left for the reps.',
      totalRate: 'Total rate', totalRate_note: 'All commission on the deal ÷ deal value.',
      reps: 'To the reps', reps_note: 'Pool {pool}. Shares in total {s}.', reps_note_pool: 'Pool {pool} minus overlay {o}. Shares in total {s}.',
      ovl: 'To overlay roles', ovl_note_top: 'Paid on top of the split.', ovl_note_pool: 'Taken from the pool.', ovl_none: 'No overlay roles entered.',
      rows: 'Split', row_rep: '{name}, {share}', row_rep_calc: '{pool} × {share}', row_ovl: 'Overlay role {i}', row_ovl_calc: '{value} × {rate}',
      row_total: 'Total commission', row_total_calc: 'Total rate {r} of the deal',
      f_top: 'Rep commission = deal value × rate × share. Overlay = deal value × overlay rate, paid on top.',
      f_pool: 'Pool = deal value × rate. Overlay = deal value × overlay rate, taken from the pool. The rest is split by the shares.',
      x_top: 'With overlay on top, the deal costs more in total, but the reps’ split is unchanged. This is the most common setup when a specialist or manager is rewarded without taking from the reps.',
      x_pool: 'With overlay from the pool, the total commission on the deal is fixed, and the overlay roles are paid from what the reps would otherwise have earned.',
      fine: 'The calculation is a guide, before tax. Always write the split rules into the commission agreement. Prowi splits commission automatically from the roles on the deal in your CRM.',
      live: 'Total commission: {t}. To the reps: {r}. To overlay roles: {o}.'
    }
  };

  function params(state) {
    var v = state.v;
    return { value: v.value, rate: v.rate, shares: [v.a, v.b, v.c], overlays: [v.o1, v.o2], mode: state.t.mode };
  }

  function view(state, lang, H, S) {
    var r = calc(params(state)), tpl = H.tpl, K = H.K, P = H.P;
    var rows = r.reps.map(function (x) {
      return { label: tpl(S.row_rep, { name: NAMES[lang][x.i], share: P(x.share) }), calc: tpl(S.row_rep_calc, { pool: K(r.splitPool), share: P(x.share) }), amount: K(x.amount) };
    });
    r.overlays.forEach(function (o) { rows.push({ label: tpl(S.row_ovl, { i: o.i }), calc: tpl(S.row_ovl_calc, { value: K(r.value), rate: P(o.rate) }), amount: K(o.amount) }); });
    rows.push({ total: true, label: S.row_total, calc: tpl(S.row_total_calc, { r: P(r.totalRate, 2) }), amount: K(r.total) });
    var m = r.overlays.length;
    var warn = r.overPool ? S.warn_pool : (r.reps.length && Math.abs(r.shareSum - 100) > 0.001 ? tpl(S.warn_sum, { s: P(r.shareSum) }) : '');
    var hero = K(r.total);
    return {
      kicker: S.kicker, hero: hero, warn: warn,
      sub: tpl(S.sub, { rate: P(r.rate), value: K(r.value), n: r.reps.length, o: m ? (m === 1 ? S.sub_o1 : tpl(S.sub_o, { m: m })) : '' }),
      metrics: [
        { label: S.reps, value: K(r.repSum), note: tpl(r.fromPool ? S.reps_note_pool : S.reps_note, { pool: K(r.pool), o: K(r.ovlSum), s: P(r.shareSum) }) },
        { label: S.ovl, value: K(r.ovlSum), note: m ? (r.fromPool ? S.ovl_note_pool : S.ovl_note_top) : S.ovl_none },
        { label: S.totalRate, value: P(r.totalRate, 2), note: S.totalRate_note }
      ],
      sections: [{ title: S.rows, rows: rows }],
      formula: r.fromPool ? S.f_pool : S.f_top,
      explain: r.fromPool ? S.x_pool : S.x_top,
      fine: S.fine,
      live: tpl(S.live, { t: hero, r: K(r.repSum), o: K(r.ovlSum) })
    };
  }

  var def = {
    id: 'split', strings: strings, calc: calc, params: params, view: view,
    toggles: [{ key: 'mode', label: 'mode', big: true, def: 'top',
      opts: [{ v: 'top', label: 'm_top', sub: 'm_top_sub' }, { v: 'pool', label: 'm_pool', sub: 'm_pool_sub' }] }],
    fields: [
      { key: 'value', kind: 'kr', def: 300000, label: 'value' },
      { key: 'rate', kind: 'pct', def: 10, label: 'rate' },
      { key: 'a', kind: 'pct', def: 60, label: 'a', max: 100 },
      { key: 'b', kind: 'pct', def: 40, label: 'b', max: 100 },
      { key: 'c', kind: 'pct', def: null, label: 'c', placeholder: 'none', max: 100, hint: 'shareHint' },
      { key: 'o1', kind: 'pct', def: 2, label: 'o1', placeholder: 'none', hint: 'o1hint' },
      { key: 'o2', kind: 'pct', def: 1, label: 'o2', placeholder: 'none', hint: 'o2hint' }
    ],
    layout: ['value', 'rate', 'a', 'b', 'c', 'o1', 'o2']
  };

  if (typeof module === 'object' && module.exports) { module.exports = def; return; }
  if (!document.querySelector('[data-tool="split"]')) return;
  if (window.__pwCalcMount) window.__pwCalcMount(def); else (window.__pwCalcQ = window.__pwCalcQ || []).push(def);
})();
