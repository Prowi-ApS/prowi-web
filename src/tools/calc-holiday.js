/* Feriepenge af provision-beregner / Holiday pay on commission calculator. Root: [data-tool="holiday-pay"]
   (markup built by calc-kit.js). Follows the guide /post/feriepenge-af-provision and ferieloven (LBK nr. 152 af
   20/02/2024, §§ 16-19): a salaried employee with "ferie med løn" is compensated for the commission lost because of
   the holiday (§ 17, stk. 1); on "feriegodtgørelse" it is 12,5 % of the commission lost (§ 19, stk. 1). The law has
   no fixed formula, so the calculator shows the two methods the guide uses:
   - 12,5 %: 12,5 % of the commission earned in the previous holiday year covers a full year's 25 holiday days;
     per day = that / 25 (the model the courts accepted in Højesteret 66/2015 and SHR BS-20938/2018);
   - average: commission per month (previous year / 12) / working days per month (21,67) per holiday day.
   Commission still earned during the holiday reduces the loss. Ferietillæg (1 %) is shown on the fixed salary only. */
(function () {
  function nz(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }
  var YEAR_DAYS = 25, RATE = 12.5;

  // p: { method: '125'|'avg', prior, days, workdays, earned, base }
  function calc(p) {
    var prior = nz(p.prior), days = nz(p.days), wd = nz(p.workdays) || 21.67, earned = nz(p.earned), base = nz(p.base);
    var year125 = prior * RATE / 100, perDay125 = year125 / YEAR_DAYS, gross125 = perDay125 * days;
    var month = prior / 12, perDayAvg = month / wd, grossAvg = perDayAvg * days;
    var avg = p.method === 'avg';
    var gross = avg ? grossAvg : gross125;
    var comp = Math.max(0, gross - earned);
    var other = Math.max(0, (avg ? gross125 : grossAvg) - earned);
    return {
      method: avg ? 'avg' : '125', prior: prior, days: days, workdays: wd, earned: earned, base: base,
      year125: year125, perDay125: perDay125, gross125: gross125, month: month, perDayAvg: perDayAvg, grossAvg: grossAvg,
      perDay: avg ? perDayAvg : perDay125, gross: gross, comp: comp, other: other,
      tillaeg: base * 12 * 0.01, overYear: days > YEAR_DAYS
    };
  }

  var strings = {
    da: {
      method: 'Vælg metode', m125: '12,5 % af sidste års provision', m125_sub: 'Den model, domstolene har accepteret', mavg: 'Gennemsnit pr. arbejdsdag', mavg_sub: 'Referenceperiode, som i Lock-dommen',
      prior: 'Provision i det forudgående ferieår', prior_hint: 'Fx optjent fra 1. september 2024 til 31. august 2025.',
      days: 'Feriedage, der holdes', workdays: 'Arbejdsdage pr. måned', workdays_hint: '21,67 er et gennemsnit (260 arbejdsdage / 12).',
      earned: 'Provision optjent under ferien (valgfri)', earned_hint: 'Fx fornyelser eller kollegers ordrer i distriktet. Den mindsker tabet.',
      base: 'Fast månedsløn (valgfri)', base_hint: 'Bruges kun til ferietillægget på 1 %.', none: '0', dage: 'dage',
      kicker: 'Kompensation for tabt provision', sub: '{days} feriedage × {perDay} pr. dag', sub_earned: '{days} feriedage × {perDay} pr. dag, minus {earned} optjent i ferien',
      warn_days: 'Mere end 25 feriedage. Metoden med 12,5 % dækker et helt ferieår på 25 dage.',
      perDay: 'Pr. feriedag', perDay_125: '12,5 % × {prior} / 25 dage.', perDay_avg: '{prior} / 12 / {wd} arbejdsdage.',
      other_125: 'Med gennemsnitsmetoden', other_avg: 'Med 12,5 %-metoden', other_note: 'Samme ferie, den anden metode.',
      till: 'Ferietillæg af fast løn', till_note: '1 % af årets faste løn ({base} × 12). Hvordan provision indgår i grundlaget, bør stå i aftalen.', till_none: 'Angiv fast månedsløn for at se ferietillægget på 1 %.',
      rows: 'Beregning trin for trin',
      r_year: 'Kompensation for et helt ferieår (25 dage)', r_year_calc: '12,5 % × {prior}', r_day: 'Pr. feriedag', r_day_calc: '{year} / 25',
      r_days: 'For {days} feriedage', r_days_calc: '{perDay} × {days}',
      r_month: 'Gennemsnitlig provision pr. måned', r_month_calc: '{prior} / 12', r_wday: 'Pr. arbejdsdag', r_wday_calc: '{month} / {wd} dage',
      r_earned: 'Provision optjent under ferien', r_earned_calc: 'Trækkes fra tabet',
      r_total: 'Kompensation i alt', r_total_calc: 'Udbetales som en del af lønnen under ferien',
      f125: 'Kompensation = 12,5 % × sidste års provision / 25 × antal feriedage',
      favg: 'Kompensation = sidste års provision / 12 / arbejdsdage pr. måned × antal feriedage',
      x125: '12,5 % af et års provision svarer til 25 feriedage, fordi feriegodtgørelse er 12,5 % af lønnen. Modellen er accepteret af Højesteret (sag 66/2015) og Sø- og Handelsretten (BS-20938/2018).',
      xavg: 'Gennemsnitsmetoden ser kun på de dage, sælgeren faktisk arbejder, og giver derfor et lavere beløb end 12,5 %. EU-Domstolen (C-539/12, Lock) nævner en repræsentativ referenceperiode som en mulighed.',
      fine: 'Antagelser: Sælgeren er funktionær med ferie med løn (ferieloven § 16, stk. 1 og § 17) og mister reelt provision, fordi hun holder ferie. Der er 25 feriedage om året. På feriegodtgørelse gælder det samme for provisionen: 12,5 % af den provision, der mistes (§ 19, stk. 1). Der beregnes ikke feriepenge af kompensationen (§ 19, stk. 4). Loven har ingen fast formel, så vælg en metode og skriv den ind i aftalen. Generel vejledning, ikke juridisk rådgivning. Tjek med jeres lønleverandør eller advokat. Læs mere i guiden <a href="/post/feriepenge-af-provision">Feriepenge af provision</a> og i <a href="https://www.retsinformation.dk/eli/lta/2024/152" target="_blank" rel="noopener">ferieloven på retsinformation.dk</a>.',
      live: 'Kompensation: {c}. Pr. feriedag: {d}. Den anden metode: {o}.'
    },
    en: {
      method: 'Choose a method', m125: '12.5% of last year’s commission', m125_sub: 'The model Danish courts have accepted', mavg: 'Average per working day', mavg_sub: 'A reference period, as in the Lock ruling',
      prior: 'Commission in the previous holiday year', prior_hint: 'E.g. earned from 1 September 2024 to 31 August 2025.',
      days: 'Holiday days taken', workdays: 'Working days per month', workdays_hint: '21.67 is an average (260 working days / 12).',
      earned: 'Commission earned during the holiday (optional)', earned_hint: 'E.g. renewals or colleagues’ orders in the territory. It reduces the loss.',
      base: 'Fixed monthly salary (optional)', base_hint: 'Only used for the 1% holiday supplement.', none: '0', dage: 'days',
      kicker: 'Compensation for lost commission', sub: '{days} holiday days × {perDay} per day', sub_earned: '{days} holiday days × {perDay} per day, minus {earned} earned during the holiday',
      warn_days: 'More than 25 holiday days. The 12.5% method covers a full holiday year of 25 days.',
      perDay: 'Per holiday day', perDay_125: '12.5% × {prior} / 25 days.', perDay_avg: '{prior} / 12 / {wd} working days.',
      other_125: 'With the average method', other_avg: 'With the 12.5% method', other_note: 'Same holiday, the other method.',
      till: 'Holiday supplement on fixed salary', till_note: '1% of the year’s fixed salary ({base} × 12). How commission counts in the base should be in the agreement.', till_none: 'Enter a fixed monthly salary to see the 1% holiday supplement.',
      rows: 'Step-by-step calculation',
      r_year: 'Compensation for a full holiday year (25 days)', r_year_calc: '12.5% × {prior}', r_day: 'Per holiday day', r_day_calc: '{year} / 25',
      r_days: 'For {days} holiday days', r_days_calc: '{perDay} × {days}',
      r_month: 'Average commission per month', r_month_calc: '{prior} / 12', r_wday: 'Per working day', r_wday_calc: '{month} / {wd} days',
      r_earned: 'Commission earned during the holiday', r_earned_calc: 'Deducted from the loss',
      r_total: 'Total compensation', r_total_calc: 'Paid as part of the salary during the holiday',
      f125: 'Compensation = 12.5% × last year’s commission / 25 × holiday days',
      favg: 'Compensation = last year’s commission / 12 / working days per month × holiday days',
      x125: '12.5% of a year’s commission corresponds to 25 holiday days, because holiday allowance is 12.5% of pay. The Danish Supreme Court (case 66/2015) and the Maritime and Commercial High Court (BS-20938/2018) accepted this model.',
      xavg: 'The average method only counts the days the rep actually works, so it gives a lower amount than 12.5%. The EU Court of Justice (C-539/12, Lock) mentions a representative reference period as an option.',
      fine: 'Assumptions: the rep is a salaried employee (funktionær) with paid holiday under the Danish Holiday Act (ferieloven § 16(1) and § 17) and really loses commission by taking holiday. There are 25 holiday days a year. With holiday allowance (feriegodtgørelse) the same applies to commission: 12.5% of the commission lost (§ 19(1)). No holiday pay is calculated on the compensation (§ 19(4)). The law has no fixed formula, so choose a method and write it into the agreement. General guidance, not legal advice. Check with your payroll provider or lawyer. See the glossary entry <a href="/en/glossary/holiday-pay-on-commission">Holiday pay on commission</a> and <a href="https://www.retsinformation.dk/eli/lta/2024/152" target="_blank" rel="noopener">the Holiday Act on retsinformation.dk</a> (Danish).',
      live: 'Compensation: {c}. Per holiday day: {d}. The other method: {o}.'
    }
  };

  function params(state) {
    var v = state.v;
    return { method: state.t.method, prior: v.prior, days: v.days, workdays: v.workdays, earned: v.earned, base: v.base };
  }

  function view(state, lang, H, S) {
    var r = calc(params(state)), tpl = H.tpl, K = H.K, K2 = H.K2, N = H.N;
    var avg = r.method === 'avg', rows = [];
    if (avg) {
      rows.push({ label: S.r_month, calc: tpl(S.r_month_calc, { prior: K(r.prior) }), amount: K(r.month) });
      rows.push({ label: S.r_wday, calc: tpl(S.r_wday_calc, { month: K(r.month), wd: N(r.workdays, 2) }), amount: K(r.perDayAvg) });
      rows.push({ label: tpl(S.r_days, { days: N(r.days, 2) }), calc: tpl(S.r_days_calc, { perDay: K2(r.perDayAvg), days: N(r.days, 2) }), amount: K(r.grossAvg) });
    } else {
      rows.push({ label: S.r_year, calc: tpl(S.r_year_calc, { prior: K(r.prior) }), amount: K(r.year125) });
      rows.push({ label: S.r_day, calc: tpl(S.r_day_calc, { year: K(r.year125) }), amount: K(r.perDay125) });
      rows.push({ label: tpl(S.r_days, { days: N(r.days, 2) }), calc: tpl(S.r_days_calc, { perDay: K2(r.perDay125), days: N(r.days, 2) }), amount: K(r.gross125) });
    }
    if (r.earned) rows.push({ label: S.r_earned, calc: S.r_earned_calc, amount: K(-Math.min(r.earned, r.gross)) });
    rows.push({ total: true, label: S.r_total, calc: S.r_total_calc, amount: K(r.comp) });
    var hero = K(r.comp);
    return {
      kicker: S.kicker, hero: hero,
      sub: tpl(r.earned ? S.sub_earned : S.sub, { days: N(r.days, 2), perDay: K2(r.perDay), earned: K(r.earned) }),
      warn: r.overYear && !avg ? S.warn_days : '',
      metrics: [
        { label: S.perDay, value: K2(r.perDay), note: tpl(avg ? S.perDay_avg : S.perDay_125, { prior: K(r.prior), wd: N(r.workdays, 2) }) },
        { label: avg ? S.other_avg : S.other_125, value: K(r.other), note: S.other_note },
        { label: S.till, value: r.base ? K(r.tillaeg) : '—', note: r.base ? tpl(S.till_note, { base: K(r.base) }) : S.till_none }
      ],
      sections: [{ title: S.rows, rows: rows }],
      formula: avg ? S.favg : S.f125,
      explain: avg ? S.xavg : S.x125,
      fine: S.fine,
      live: tpl(S.live, { c: hero, d: K2(r.perDay), o: K(r.other) })
    };
  }

  var def = {
    id: 'holiday-pay', strings: strings, calc: calc, params: params, view: view,
    toggles: [{ key: 'method', label: 'method', big: true, def: '125',
      opts: [{ v: '125', label: 'm125', sub: 'm125_sub' }, { v: 'avg', label: 'mavg', sub: 'mavg_sub' }] }],
    fields: [
      { key: 'prior', kind: 'kr', def: 168000, label: 'prior', hint: 'prior_hint' },
      { key: 'days', kind: 'dec', def: 15, label: 'days', unit: { da: 'dage', en: 'days' }, step: 1, max: 60 },
      { key: 'workdays', kind: 'dec', def: 21.67, label: 'workdays', hint: 'workdays_hint', unit: { da: 'dage', en: 'days' }, step: 1, max: 31, show: function (s) { return s.t.method === 'avg'; } },
      { key: 'earned', kind: 'kr', def: null, label: 'earned', placeholder: 'none', hint: 'earned_hint' },
      { key: 'base', kind: 'kr', def: 30000, label: 'base', hint: 'base_hint' }
    ],
    layout: ['prior', 'days', 'workdays', 'earned', 'base']
  };

  if (typeof module === 'object' && module.exports) { module.exports = def; return; }
  if (!document.querySelector('[data-tool="holiday-pay"]')) return;
  if (window.__pwCalcMount) window.__pwCalcMount(def); else (window.__pwCalcQ = window.__pwCalcQ || []).push(def);
})();
