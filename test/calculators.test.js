// Maths and text checks for the six free calculators (src/tools/calc-*.js) and the kit's number handling.
// Run: npm test   (plain Node, no dependencies)
const assert = require('assert');
const kit = require('../src/tools/calc-kit.js');
const C = {
  tiers: require('../src/tools/calc-tiers.js'), accelerator: require('../src/tools/calc-accelerator.js'),
  split: require('../src/tools/calc-split.js'), holiday: require('../src/tools/calc-holiday.js'),
  absence: require('../src/tools/calc-absence.js'), quota: require('../src/tools/calc-quota.js')
};
let n = 0;
const eq = (a, b, msg) => { assert.ok(Math.abs(a - b) < 0.005, `${msg}: ${a} != ${b}`); n++; };
const is = (a, b, msg) => { assert.strictEqual(a, b, msg); n++; };

// number parsing and formatting (Danish 1.000 / 12,5; English 1,000 / 12.5)
is(kit.parse('1.250.000', 'da', 'kr'), 1250000, 'da thousands');
is(kit.parse('1,250,000', 'en', 'kr'), 1250000, 'en thousands');
is(kit.parse('12,5', 'da', 'pct'), 12.5, 'da decimal comma');
is(kit.parse('12.5', 'da', 'pct'), 12.5, 'dot decimal on a Danish page');
is(kit.parse('1.5', 'en', 'x'), 1.5, 'en multiplier');
is(kit.parse('', 'da', 'kr'), null, 'empty');
is(kit.fmtKr(1234567, 'da'), '1.234.567 kr.', 'da kr');
is(kit.fmtKr(1234567, 'en'), '1,234,567 DKK', 'en DKK');
is(kit.fmtPct(12.5, 'da'), '12,5 %', 'da pct');
is(kit.fmtPct(12.5, 'en'), '12.5%', 'en pct');

// Trappemodel: 420.000 kr. with 5 % to 200.000, 8 % to 350.000, 10 % to 500.000, 12 % above
const T = { sales: 420000, limits: [200000, 350000, 500000], rates: [5, 8, 10, 12] };
eq(C.tiers.calc(Object.assign({ method: 'marginal' }, T)).commission, 29000, 'tiers marginal');
eq(C.tiers.calc(Object.assign({ method: 'whole' }, T)).commission, 42000, 'tiers whole amount');
eq(C.tiers.calc({ method: 'whole', sales: 350000, limits: T.limits, rates: T.rates }).commission, 35000, 'limit reached at the limit');
eq(C.tiers.calc({ method: 'marginal', sales: 600000, limits: [200000, 350000, null], rates: [5, 8, 10, 12] }).commission, 10000 + 12000 + 25000, 'empty tier 3 → open tier at the 3rd rate');
// same as the commission calculator's tiered example (Provisionsberegner: 30.400 kr.)
eq(C.tiers.calc({ method: 'marginal', sales: 420000, limits: [200000, 350000], rates: [5, 8, 12] }).commission, 30400, 'matches /provisionsberegner');

// Accelerator: quota 350.000, sales 420.000, 8 %, 1,5x
const A = { quota: 350000, sales: 420000, base: 8, how: 'mult', mult: 1.5 };
eq(C.accelerator.calc(A).commission, 36400, 'accelerator marginal');
eq(C.accelerator.calc(Object.assign({}, A, { retro: true })).commission, 50400, 'accelerator retroactive');
eq(C.accelerator.calc(Object.assign({}, A, { how: 'rate', high: 15 })).commission, 38500, 'rate 15 % = /provisionsberegner 38.500');
eq(C.accelerator.calc(Object.assign({}, A, { cap: 30000 })).commission, 30000, 'cap');
eq(C.accelerator.calc(A).extra, 2800, 'extra vs flat');
assert.deepStrictEqual(C.accelerator.scenarios(A).map(s => Math.round(s.commission)), [22400, 28000, 36400, 49000]); n++;

// Split: 300.000 kr. × 10 %, 60/40, overlays 2 % and 1 %
const Sp = { value: 300000, rate: 10, shares: [60, 40, null], overlays: [2, 1] };
let s = C.split.calc(Object.assign({ mode: 'top' }, Sp));
eq(s.reps[0].amount, 18000, 'split A'); eq(s.reps[1].amount, 12000, 'split B'); eq(s.ovlSum, 9000, 'overlays'); eq(s.total, 39000, 'split total on top');
s = C.split.calc(Object.assign({ mode: 'pool' }, Sp));
eq(s.reps[0].amount, 12600, 'pool A'); eq(s.total, 30000, 'pool total');

// Feriepenge af provision: the guide's example (Mette: 168.000 kr., 15 days, 30.000 kr. a month)
let h = C.holiday.calc({ method: '125', prior: 168000, days: 15, base: 30000 });
eq(h.year125, 21000, '12,5 % of a year'); eq(h.perDay125, 840, 'per day'); eq(h.comp, 12600, '15 days'); eq(h.tillaeg, 3600, 'ferietillæg 1 %');
h = C.holiday.calc({ method: 'avg', prior: 168000, days: 15, workdays: 21.67 });
eq(h.month, 14000, 'average per month'); eq(Math.round(h.perDayAvg * 100) / 100, 646.05, 'per working day'); eq(Math.round(h.comp), 9691, 'guide: 9.691 kr.');
eq(C.holiday.calc({ method: '125', prior: 168000, days: 15, earned: 2000 }).comp, 10600, 'commission earned during the holiday reduces the loss');

// Provision under sygdom og barsel: the guide's examples (Jonas and Sara)
let a = C.absence.calc({ type: 'sick', ref: 12, refTotal: 216000, workdays: 22, absent: 15, base: 35000, earnedWork: 5000 });
eq(Math.round(a.est), 12273, 'Jonas estimate'); eq(Math.round(a.total), 52273, 'Jonas total');
a = C.absence.calc({ type: 'half', ref: 12, refTotal: 144000, workdays: 22, absent: 22, base: 34000 });
eq(a.fixed, 17000, 'Sara half salary'); eq(a.est, 6000, 'Sara half commission'); eq(a.total, 23000, 'Sara total');
a = C.absence.calc({ type: 'sick', ref: 12, refTotal: 216000, workdays: 22, absent: 15, base: 35000, closed: 20000, closedMode: 'offset' });
eq(a.absenceCommission, 20000, 'offset: closed deals above the estimate');
a = C.absence.calc({ type: 'sick', ref: 12, refTotal: 216000, workdays: 22, absent: 15, base: 35000, closed: 2000, closedMode: 'offset' });
eq(Math.round(a.absenceCommission), 12273, 'offset: closed deals count towards the estimate');

// Kvote: 12 mio., 15 % over-assignment, 6 ramped reps, 2 new in April with a 3-month ramp
const q = C.quota.calc({ target: 12000000, over: 15, reps: 6, newReps: 2, start: 4, ramp: 3 });
eq(q.total, 13800000, 'total quota'); eq(q.capacity, 87, 'rep months'); eq(q.monthly * q.capacity, q.total, 'quotas add up');
eq(Math.round(q.monthly), 158621, 'monthly quota');

// every calculator renders in both languages with the same string keys
for (const [k, d] of Object.entries(C)) {
  assert.deepStrictEqual(Object.keys(d.strings.da).sort(), Object.keys(d.strings.en).sort(), k + ': DA and EN strings differ'); n++;
  for (const lang of ['da', 'en']) {
    const st = { v: {}, t: {} };
    (d.toggles || []).forEach(t => { st.t[t.key] = t.def; });
    d.fields.forEach(f => { st.v[f.key] = f.def == null ? null : f.def; });
    const w = d.view(st, lang, kit.helpers(lang), d.strings[lang]);
    assert.ok(w.hero && w.metrics.length === 3 && w.sections.length && w.formula, k + ' ' + lang + ' renders'); n++;
    const all = JSON.stringify(w);
    assert.ok(!/\{\w+\}|undefined|NaN/.test(all), k + ' ' + lang + ': unfilled placeholder or NaN in ' + all.match(/.{40}(\{\w+\}|undefined|NaN).{20}/)); n++;
    if (lang === 'da') { assert.ok(!/[éáóú]/.test(all), k + ': acute accent in Danish copy'); n++; }
  }
}
console.log('calculators: ' + n + ' checks passed');
