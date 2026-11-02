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
is(kit.fmtKr(1234567, 'en'), '€1,234,567', 'en defaults to EUR, en-US separators');
is(kit.fmtKr(1234567, 'en', 'USD'), '$1,234,567', 'en USD');
is(kit.fmtKr(1234567, 'en', 'GBP'), '£1,234,567', 'en GBP');
is(kit.fmtKr(1234567, 'en', 'DKK'), '1,234,567 DKK', 'en DKK after the number');
is(kit.fmtKr(1234567, 'en', 'XYZ'), '€1,234,567', 'unknown currency falls back to EUR');
is(kit.fmtKr(1234567, 'da', 'USD'), '1.234.567 kr.', 'da is always kr., whatever is asked');
is(kit.fmtKr(-1000, 'en'), '−€1,000', 'minus before the symbol');
is(kit.fmtKr2(1000.5, 'en'), '€1,000.50', 'en cents');
is(kit.fmtKr2(1000.5, 'en', 'USD'), '$1,000.50', 'en USD cents');
is(kit.fmtKr2(646.05, 'da'), '646,05 kr.', 'da øre');
is(kit.fmtKr2(840, 'en', 'DKK'), '840 DKK', 'whole amount, no decimals');
is(kit.parse('$1,250,000', 'en', 'kr'), 1250000, 'en amount typed with $');
is(kit.parse('€12,500', 'en', 'kr'), 12500, 'en amount typed with €');
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
    d.fields.forEach(f => { st.v[f.key] = kit.startVal(f, lang); });
    const w = d.view(st, lang, kit.helpers(lang, d.currency), d.strings[lang]);
    assert.ok(w.hero && w.metrics.length === 3 && w.sections.length && w.formula, k + ' ' + lang + ' renders'); n++;
    const all = JSON.stringify(w);
    assert.ok(!/\{\w+\}|undefined|NaN/.test(all), k + ' ' + lang + ': unfilled placeholder or NaN in ' + all.match(/.{40}(\{\w+\}|undefined|NaN).{20}/)); n++;
    if (lang === 'da') { assert.ok(!/[éáóú]/.test(all), k + ': acute accent in Danish copy'); n++; }
    // currency: Danish kr. only; English EUR by default, never DKK/kr./krone (v1.25.56)
    if (lang === 'da') { assert.ok(!/[$€£]|DKK/.test(all), k + ' da: foreign currency ' + all.match(/.{30}([$€£]|DKK).{10}/)); n++; }
    else if (d.currency === 'DKK') {
      // Danish-law calculators: DKK after the number, US number format, Danish start values
      assert.ok(/\d,\d{3}\u00a0DKK/.test(all) && !/[$€£]|kr\.|krone/.test(all), k + ' en: DKK default ' + all.slice(0, 200)); n++;
    } else {
      assert.ok(!/DKK|\bkr\b|kr\.|krone/i.test(all), k + ' en: DKK/kr. in ' + all.match(/.{30}(DKK|kr\.|krone).{10}/i)); n++;
      if (d.fields.some(f => f.kind === 'kr')) { assert.ok(/€\d/.test(all) && !/\$/.test(all), k + ' en: EUR amounts'); n++; }
    }
  }
}
// English start values: every amount field has a EUR-sized value (DKK ÷ 7.46, rounded to the thousand)
is(Object.entries(C).filter(([k, d]) => d.currency === 'DKK').map(([k]) => k).join(), 'holiday,absence', 'Danish-law calculators default to DKK');
for (const [k, d] of Object.entries(C)) for (const f of d.fields) if (f.kind === 'kr' && d.currency === 'DKK') { is(f.en, undefined, k + '.' + f.key + ': keeps the DKK start value in English'); }
for (const [k, d] of Object.entries(C)) for (const f of d.fields) if (f.kind === 'kr' && f.def != null && d.currency !== 'DKK') {
  assert.ok(typeof f.en === 'number' && f.en > 0 && f.en < f.def, k + '.' + f.key + ': no EUR start value'); n++;
  const r = f.def / f.en; assert.ok(r > 7.3 && r < 7.6, k + '.' + f.key + ': ' + f.def + ' -> ' + f.en + ' is not about ÷7.46'); n++;
  assert.ok(f.en % 1000 === 0, k + '.' + f.key + ': EUR start value not rounded'); n++;
}
// EUR maths on the English defaults (same rates, so only the amounts scale)
eq(C.tiers.calc({ method: 'marginal', sales: 56000, limits: [27000, 47000, 67000], rates: [5, 8, 10, 12] }).commission, 3850, 'tiers EN default €3,850');
eq(C.accelerator.calc({ quota: 47000, sales: 56000, base: 8, how: 'mult', mult: 1.5 }).commission, 4840, 'accelerator EN default €4,840');

// The page: mount in a small DOM (test/_dom.js). EN: EUR by default; the unit of the first amount field is the currency
// switch (a native <select> laid over "€ ▾"); switching changes the symbol only, is remembered per viewer in localStorage
// and works without storage. DA: no switch, kr. (v1.25.56)
const { makeDoc } = require('./_dom');
function mountIn(lang, storage, d) {
  const doc = makeDoc(lang, storage); global.window = doc.defaultView;
  const root = doc.createElement('div'); root.setAttribute('data-tool', d.id); doc.body.appendChild(root);
  const api = kit.mount(doc, d);
  return { doc, root, api, hero: () => root.querySelector('.pw-calc__value').textContent, sel: root.querySelector('[data-currency-select]') };
}
const pick = (sel, v) => { sel.value = v; sel.dispatchEvent(new Event('change')); };
{
  const store = {}, m = mountIn('en', store, C.tiers);
  is(m.hero(), '€3,850', 'EN mounts in EUR: symbol first, en-US separators');
  is(m.root.getAttribute('data-currency'), 'EUR', 'EN data-currency');
  assert.ok(m.sel && m.sel.tagName === 'SELECT', 'EN has a currency switch (native select)'); n++;
  is(m.root.querySelectorAll('[data-currency-select]').length, 1, 'one switch per calculator');
  is(m.root.querySelectorAll('.pw-calc__cur').length, 1, 'no separate currency row');
  is(m.sel.children.map(o => o.value).join(), 'EUR,USD,GBP,DKK', 'switch options');
  is(m.sel.getAttribute('aria-label'), 'Currency', 'switch has an accessible name');
  const box = m.root.querySelector('[data-input="sales"]').parentNode, sw = m.sel.parentNode;
  is(sw.className + '|' + (sw.parentNode === box) + '|' + (box.firstChild === sw), 'pw-calc__cur|true|true', 'switch is the prefix of the first amount box');
  is(sw.firstChild.textContent + '|' + sw.firstChild.getAttribute('aria-hidden'), '€ ▾|true', 'switch shows "€ ▾" (decorative text, the select is what is announced)');
  const box2 = m.root.querySelector('[data-input="t1"]').parentNode;
  is(box2.firstChild.className + ' ' + box2.firstChild.textContent + ' ' + !box2.querySelector('select'), 'pw-calc__unit € true', 'other amount boxes: plain € prefix that follows');
  is(m.root.querySelector('[data-input="sales"]').value, '56,000', 'EN start value €56,000');
  pick(m.sel, 'USD');
  is(m.hero(), '$3,850', 'switch to USD: same number, new symbol');
  is(sw.firstChild.textContent + ' ' + box2.firstChild.textContent, '$ ▾ $', 'switch and other units follow');
  is(store['pw-calc-currency'], 'USD', 'choice saved in localStorage');
  pick(m.sel, 'DKK');
  is(m.hero(), '3,850 DKK', 'switch to DKK: symbol after the number');
  is(box.lastChild === sw && sw.firstChild.textContent, 'DKK ▾', 'DKK: the switch moves after the amount');
  is(box2.lastChild.textContent, 'DKK', 'DKK unit after the other amounts');
  is(m.root.querySelector('[data-input="sales"]').value, '56,000', 'inputs keep their numbers (no conversion)');
  pick(m.sel, 'GBP');
  is(m.hero(), '£3,850', 'switch to GBP');
  is(box.firstChild, sw, 'GBP: switch back in front');
  assert.ok(m.root.querySelector('.pw-calc__band').innerHTML.indexOf('£27,000–£47,000') > -1, 'tier range carries the symbol on both ends'); n++;
  assert.ok(!/DKK|kr\./.test(m.root.querySelector('.pw-calc__band').innerHTML) && /£/.test(m.root.querySelector('.pw-calc__band').innerHTML), 'breakdown follows the currency'); n++;
  // a second visit starts in the saved currency
  is(mountIn('en', store, C.accelerator).hero(), '£4,840', 'saved currency is used on the next calculator');
}
{
  // two calculators on one page follow the same choice
  const doc = makeDoc('en', {}); global.window = doc.defaultView;
  for (const id of ['tiers', 'split']) { const r = doc.createElement('div'); r.setAttribute('data-tool', id); doc.body.appendChild(r); }
  const a = kit.mount(doc, C.tiers), b = kit.mount(doc, C.split);
  pick(a.root.querySelector('[data-currency-select]'), 'USD');
  is(b.currency() + ' ' + b.root.querySelector('[data-currency-select]').value, 'USD USD', 'other calculator on the page follows');
}
{
  const m = mountIn('en', 'throw', C.tiers);
  is(m.hero(), '€3,850', 'blocked storage: EUR');
  pick(m.sel, 'USD');
  is(m.hero(), '$3,850', 'blocked storage: switching still works');
  is(mountIn('en', { 'pw-calc-currency': 'BTC' }, C.tiers).hero(), '€3,850', 'unknown saved value: EUR');
}
{
  const m = mountIn('da', { 'pw-calc-currency': 'USD' }, C.tiers);
  is(m.hero(), '29.000 kr.', 'DA unchanged: kr., Danish format, DKK start values (ignores a saved EN choice)');
  is(m.sel, null, 'DA has no currency switch');
  is(m.root.querySelector('[data-input="sales"]').value, '420.000', 'DA start value 420.000');
  is(m.root.querySelector('.pw-calc__box').lastChild.className + ' ' + m.root.querySelector('.pw-calc__box').lastChild.textContent, 'pw-calc__unit kr.', 'DA unit after the amount');
}
{
  // holiday-pay and sick-pay (Danish law): DKK by default on English pages, switch shown, own memory
  const store = { 'pw-calc-currency': 'USD' }; // a choice made on another calculator
  const h = mountIn('en', store, C.holiday);
  is(h.hero(), '12,600 DKK', 'holiday EN: DKK default with the Danish start values, US number format');
  is(h.root.querySelector('[data-input="prior"]').value, '168,000', 'holiday EN start value 168,000');
  is(h.sel && h.sel.value, 'DKK', 'holiday EN: switch shown, DKK selected');
  is(h.root.querySelector('[data-input="prior"]').parentNode.lastChild.firstChild.textContent, 'DKK ▾', 'holiday EN: "DKK ▾" after the amount');
  const a = mountIn('en', store, C.absence);
  is(a.hero(), '12,273 DKK', 'sick-pay EN: DKK default, not flipped by the shared choice');
  pick(a.sel, 'EUR');
  is(a.hero(), '€12,273', 'sick-pay EN: viewer can still switch');
  is(store['pw-calc-currency-dk'] + ' ' + store['pw-calc-currency'], 'EUR USD', 'choice saved under its own key; the shared key is untouched');
  is(mountIn('en', store, C.holiday).hero(), '€12,600', 'an explicit choice on a Danish-law calculator is remembered for both');
  is(mountIn('en', store, C.tiers).hero(), '$3,850', 'and does not flip the other calculators');
  is(mountIn('en', 'throw', C.absence).hero(), '12,273 DKK', 'blocked storage: DKK');
  const doc = makeDoc('en', {}); global.window = doc.defaultView;
  for (const id of ['tiers', 'holiday-pay']) { const r = doc.createElement('div'); r.setAttribute('data-tool', id); doc.body.appendChild(r); }
  const t = kit.mount(doc, C.tiers), hp = kit.mount(doc, C.holiday);
  pick(t.root.querySelector('[data-currency-select]'), 'GBP');
  is(t.currency() + ' ' + hp.currency(), 'GBP DKK', 'same page: tiers switch leaves holiday-pay on DKK');
  is(mountIn('da', { 'pw-calc-currency-dk': 'EUR' }, C.holiday).hero(), '12.600 kr.', 'holiday DA unchanged');
}
console.log('calculators: ' + n + ' checks passed');
process.exit(0); // the kit's live-region timer would otherwise keep Node waiting
