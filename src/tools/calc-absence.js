/* Provision under sygdom og barsel-beregner / Commission during sick leave and parental leave calculator.
   Root: [data-tool="sick-pay"] (markup built by calc-kit.js). Follows the guide /post/provision-under-sygdom-og-barsel
   and funktionærloven (LBK nr. 1002 af 24/08/2017) § 9, stk. 3 with §§ 5 and 7: pay during absence includes the
   commission the employee would presumably have earned; the usual estimate is the average commission over a
   reference period (3, 6 or 12 months). The estimate is pro rata for the absence days of the month and follows the
   right to pay: full pay when sick (§ 5), half pay on maternity leave up to 14 weeks after birth (§ 7, stk. 2), full
   pay if a contract or collective agreement gives it, nothing on unpaid leave. Commission from deals that close
   during the absence is either added on top or counted towards the estimate (the agreement decides). */
(function () {
  function nz(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }
  var PAY = { sick: 1, half: 0.5, full: 1, none: 0 };

  // p: { type: 'sick'|'half'|'full'|'none', ref: months, refTotal, workdays, absent, base, earnedWork, closed, closedMode: 'add'|'offset' }
  function calc(p) {
    var type = PAY[p.type] == null ? 'sick' : p.type, share = PAY[type];
    var ref = nz(p.ref) || 12, refTotal = nz(p.refTotal), wd = nz(p.workdays), absent = Math.min(nz(p.absent), wd);
    var frac = wd > 0 ? absent / wd : 0;
    var avg = refTotal / ref;
    var est = avg * frac * share;
    var closed = nz(p.closed), offset = p.closedMode === 'offset';
    // offset: deals that close during the absence count towards the estimate, so only the difference is added
    var topUp = offset ? Math.max(0, est - closed) : est;
    var absenceCommission = topUp + closed;
    var base = nz(p.base), fixedWork = base * (1 - frac), fixedAbsent = base * frac * share, fixed = fixedWork + fixedAbsent;
    var earnedWork = nz(p.earnedWork);
    return {
      type: type, share: share, ref: ref, refTotal: refTotal, workdays: wd, absent: absent, frac: frac, avg: avg, est: est,
      closed: closed, offset: offset, topUp: topUp, absenceCommission: absenceCommission,
      base: base, fixedWork: fixedWork, fixedAbsent: fixedAbsent, fixed: fixed, earnedWork: earnedWork,
      total: fixed + absenceCommission + earnedWork
    };
  }

  var strings = {
    da: {
      type: 'Type fravær', t_sick: 'Sygdom', t_sick_sub: 'Fuld løn (§ 5)', t_half: 'Barsel, halv løn', t_half_sub: '§ 7, til 14 uger efter fødslen', t_full: 'Orlov med fuld løn', t_full_sub: 'Efter overenskomst eller kontrakt', t_none: 'Orlov uden løn', t_none_sub: 'Kun dagpenge',
      ref: 'Referenceperiode', ref3: '3 mdr.', ref6: '6 mdr.', ref12: '12 mdr.',
      refTotal: 'Provision optjent i referenceperioden', refTotal_hint: 'Samlet provision i perioden ovenfor, før fraværet.',
      workdays: 'Arbejdsdage i måneden', absent: 'Fraværsdage i måneden', dage: 'dage',
      base: 'Fast månedsløn', earnedWork: 'Provision optjent på arbejdsdagene (valgfri)', earnedWork_hint: 'Handler, sælgeren selv lukker på de dage, hun arbejder.',
      closed: 'Provision fra handler, der lukker under fraværet (valgfri)', closed_hint: 'Fx handler fra pipeline, der lukkes eller faktureres, mens sælgeren er væk.',
      closedMode: 'Provisionen fra de handler', c_add: 'Lægges oveni skønnet', c_offset: 'Indgår i skønnet', none: '0',
      kicker: 'Provision for fraværsdagene', sub: '{avg} pr. måned × {absent} af {wd} arbejdsdage{share}', sub_half: ' × 50 % (halv løn)', sub_none: ' × 0 % (ingen lønret)',
      avg: 'Gennemsnit pr. måned', avg_note: '{total} / {ref} måneder.',
      fixed: 'Fast løn i måneden', fixed_note_full: 'Uændret under fraværet.', fixed_note_half: 'Halv løn for fraværsdagene.', fixed_note_none: 'Ingen løn for fraværsdagene.',
      total: 'Samlet løn i måneden', total_note: 'Fast løn + provision for fravær og arbejdsdage.',
      rows: 'Beregning trin for trin',
      r_avg: 'Gennemsnitlig provision pr. måned', r_avg_calc: '{total} / {ref}', r_est: 'Skønnet provision for fraværsdagene', r_est_calc: '{avg} × {absent} / {wd}', r_est_calc_share: '{avg} × {absent} / {wd} × {share}',
      r_closed_add: 'Handler lukket under fraværet', r_closed_add_calc: 'Lægges oveni', r_closed_off: 'Handler lukket under fraværet', r_closed_off_calc: 'Indgår i skønnet på {est}; tillæg {top}',
      r_fixed: 'Fast løn', r_fixed_calc_full: 'Uændret', r_fixed_calc: '{base} × {work} / {wd} + {base} × {absent} / {wd} × {share}',
      r_work: 'Provision for arbejdsdagene', r_work_calc: 'Optjent efter aftalen', r_total: 'Samlet løn i måneden', r_total_calc: 'Fast løn + provision',
      f: 'Skønnet provision = provision i referenceperioden / antal måneder × fraværsdage / arbejdsdage × lønandel',
      x: 'Funktionærloven siger, at lønnen under fravær skal indeholde den provision, sælgeren antagelig ville have tjent. Kan det ikke skønnes konkret, er et gennemsnit over en referenceperiode det, der er lettest at dokumentere. Lønandelen er 100 % ved sygdom, 50 % på halv løn og 0 % uden lønret.',
      fine: 'Antagelser: Sælgeren er funktionær (funktionærloven § 9, stk. 3 sammenholdt med §§ 5 og 7). Gennemsnittet over referenceperioden bruges som skøn, og fraværet regnes forholdsmæssigt af månedens arbejdsdage. Halv løn under barsel gælder fra orlovens start til 14 uger efter fødslen; overenskomst eller kontrakt kan give mere. Betaler arbejdsgiveren løn under orlov, kan arbejdsgiveren få barselsdagpengene (barselsloven § 39). Ikke-funktionærer: kontrakten eller overenskomsten afgør. Generel vejledning, ikke juridisk rådgivning. Tjek med jeres lønleverandør eller advokat. Læs mere i guiden <a href="/post/provision-under-sygdom-og-barsel">Provision under sygdom og barsel</a> og i <a href="https://www.retsinformation.dk/eli/lta/2017/1002" target="_blank" rel="noopener">funktionærloven på retsinformation.dk</a>.',
      live: 'Provision for fraværet: {c}. Samlet løn i måneden: {t}.'
    },
    en: {
      type: 'Type of absence', t_sick: 'Sick leave', t_sick_sub: 'Full pay (§ 5)', t_half: 'Maternity, half pay', t_half_sub: '§ 7, until 14 weeks after birth', t_full: 'Leave on full pay', t_full_sub: 'Under a collective agreement or contract', t_none: 'Unpaid leave', t_none_sub: 'Benefits only',
      ref: 'Reference period', ref3: '3 months', ref6: '6 months', ref12: '12 months',
      refTotal: 'Commission earned in the reference period', refTotal_hint: 'Total commission in the period above, before the absence.',
      workdays: 'Working days in the month', absent: 'Days absent in the month', dage: 'days',
      base: 'Fixed monthly salary', earnedWork: 'Commission earned on working days (optional)', earnedWork_hint: 'Deals the rep closes herself on the days she works.',
      closed: 'Commission from deals that close during the absence (optional)', closed_hint: 'E.g. pipeline deals that close or are invoiced while the rep is away.',
      closedMode: 'Commission from those deals', c_add: 'Added on top of the estimate', c_offset: 'Counted towards the estimate', none: '0',
      kicker: 'Commission for the days absent', sub: '{avg} per month × {absent} of {wd} working days{share}', sub_half: ' × 50% (half pay)', sub_none: ' × 0% (no right to pay)',
      avg: 'Average per month', avg_note: '{total} / {ref} months.',
      fixed: 'Fixed salary for the month', fixed_note_full: 'Unchanged during the absence.', fixed_note_half: 'Half pay for the days absent.', fixed_note_none: 'No pay for the days absent.',
      total: 'Total pay for the month', total_note: 'Fixed salary + commission for absence and working days.',
      rows: 'Step-by-step calculation',
      r_avg: 'Average commission per month', r_avg_calc: '{total} / {ref}', r_est: 'Estimated commission for the days absent', r_est_calc: '{avg} × {absent} / {wd}', r_est_calc_share: '{avg} × {absent} / {wd} × {share}',
      r_closed_add: 'Deals closed during the absence', r_closed_add_calc: 'Added on top', r_closed_off: 'Deals closed during the absence', r_closed_off_calc: 'Counted towards the estimate of {est}; top-up {top}',
      r_fixed: 'Fixed salary', r_fixed_calc_full: 'Unchanged', r_fixed_calc: '{base} × {work} / {wd} + {base} × {absent} / {wd} × {share}',
      r_work: 'Commission for working days', r_work_calc: 'Earned under the agreement', r_total: 'Total pay for the month', r_total_calc: 'Fixed salary + commission',
      f: 'Estimated commission = commission in the reference period / months × days absent / working days × pay share',
      x: 'The Danish Salaried Employees Act says pay during absence must include the commission the rep would presumably have earned. If that cannot be estimated case by case, an average over a reference period is the easiest to document. The pay share is 100% when sick, 50% on half pay and 0% with no right to pay.',
      fine: 'Assumptions: the rep is a salaried employee under the Danish Salaried Employees Act (funktionærloven § 9(3) with §§ 5 and 7). The average over the reference period is used as the estimate, and the absence is pro rata to the month’s working days. Half pay during maternity leave runs from the start of leave until 14 weeks after birth; a collective agreement or contract can give more. If the employer pays salary during leave, the employer can receive the parental benefit (barselsloven § 39). Not a salaried employee: the contract or collective agreement decides. General guidance, not legal advice. Check with your payroll provider or lawyer. See the glossary entry <a href="/en/glossary/commission-during-sick-leave">Commission during sick leave</a> and <a href="https://www.retsinformation.dk/eli/lta/2017/1002" target="_blank" rel="noopener">the act on retsinformation.dk</a> (Danish).',
      live: 'Commission for the absence: {c}. Total pay for the month: {t}.'
    }
  };

  function params(state) {
    var v = state.v;
    return { type: state.t.type, ref: Number(state.t.ref), refTotal: v.refTotal, workdays: v.workdays, absent: v.absent, base: v.base, earnedWork: v.earnedWork, closed: v.closed, closedMode: state.t.closedMode };
  }

  function view(state, lang, H, S) {
    var r = calc(params(state)), tpl = H.tpl, K = H.K, N = H.N, P = H.P;
    var shareTxt = P(r.share * 100, 0), o = { avg: K(r.avg), absent: N(r.absent, 2), wd: N(r.workdays, 2), share: shareTxt };
    var rows = [
      { label: S.r_avg, calc: tpl(S.r_avg_calc, { total: K(r.refTotal), ref: r.ref }), amount: K(r.avg) },
      { label: S.r_est, calc: tpl(r.share === 1 ? S.r_est_calc : S.r_est_calc_share, o), amount: K(r.est) }
    ];
    if (r.closed) rows.push(r.offset
      ? { label: S.r_closed_off, calc: tpl(S.r_closed_off_calc, { est: K(r.est), top: K(r.topUp) }), amount: K(r.closed - (r.est - r.topUp)) }
      : { label: S.r_closed_add, calc: S.r_closed_add_calc, amount: K(r.closed) });
    rows.push({ label: S.r_fixed, calc: r.share === 1 ? S.r_fixed_calc_full : tpl(S.r_fixed_calc, { base: K(r.base), work: N(r.workdays - r.absent, 2), absent: N(r.absent, 2), wd: N(r.workdays, 2), share: shareTxt }), amount: K(r.fixed) });
    if (r.earnedWork) rows.push({ label: S.r_work, calc: S.r_work_calc, amount: K(r.earnedWork) });
    rows.push({ total: true, label: S.r_total, calc: S.r_total_calc, amount: K(r.total) });
    var hero = K(r.absenceCommission);
    return {
      kicker: S.kicker, hero: hero,
      sub: tpl(S.sub, { avg: K(r.avg), absent: N(r.absent, 2), wd: N(r.workdays, 2), share: r.share === 0.5 ? S.sub_half : r.share === 0 ? S.sub_none : '' }),
      metrics: [
        { label: S.avg, value: K(r.avg), note: tpl(S.avg_note, { total: K(r.refTotal), ref: r.ref }) },
        { label: S.fixed, value: K(r.fixed), note: r.share === 1 ? S.fixed_note_full : r.share === 0 ? S.fixed_note_none : S.fixed_note_half },
        { label: S.total, value: K(r.total), note: S.total_note }
      ],
      sections: [{ title: S.rows, rows: rows }],
      formula: S.f, explain: S.x, fine: S.fine,
      live: tpl(S.live, { c: hero, t: K(r.total) })
    };
  }

  var def = {
    id: 'sick-pay', strings: strings, calc: calc, params: params, view: view,
    toggles: [
      { key: 'type', label: 'type', big: true, def: 'sick', opts: [{ v: 'sick', label: 't_sick', sub: 't_sick_sub' }, { v: 'half', label: 't_half', sub: 't_half_sub' }, { v: 'full', label: 't_full', sub: 't_full_sub' }, { v: 'none', label: 't_none', sub: 't_none_sub' }] },
      { key: 'ref', label: 'ref', def: '12', opts: [{ v: '3', label: 'ref3' }, { v: '6', label: 'ref6' }, { v: '12', label: 'ref12' }] },
      { key: 'closedMode', label: 'closedMode', def: 'add', opts: [{ v: 'add', label: 'c_add' }, { v: 'offset', label: 'c_offset' }], show: function (s) { return nz(s.v.closed) > 0; } }
    ],
    fields: [
      { key: 'refTotal', kind: 'kr', def: 216000, label: 'refTotal', hint: 'refTotal_hint' },
      { key: 'workdays', kind: 'dec', def: 22, label: 'workdays', unit: { da: 'dage', en: 'days' }, step: 1, max: 31 },
      { key: 'absent', kind: 'dec', def: 15, label: 'absent', unit: { da: 'dage', en: 'days' }, step: 1, max: 31 },
      { key: 'base', kind: 'kr', def: 35000, label: 'base' },
      { key: 'earnedWork', kind: 'kr', def: 5000, label: 'earnedWork', hint: 'earnedWork_hint', placeholder: 'none' },
      { key: 'closed', kind: 'kr', def: null, label: 'closed', hint: 'closed_hint', placeholder: 'none' }
    ],
    layout: ['toggle:ref', 'refTotal', { pair: ['workdays', 'absent'] }, 'base', 'earnedWork', 'closed', 'toggle:closedMode']
  };

  if (typeof module === 'object' && module.exports) { module.exports = def; return; }
  if (!document.querySelector('[data-tool="sick-pay"]')) return;
  if (window.__pwCalcMount) window.__pwCalcMount(def); else (window.__pwCalcQ = window.__pwCalcQ || []).push(def);
})();
