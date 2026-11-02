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
is(kit.fmtKr(1234567, 'en'), '$1,234,567', 'en defaults to USD, en-US format');
is(kit.fmtKr(1234567, 'en', 'EUR'), '€1,234,567', 'en EUR');
is(kit.fmtKr(1234567, 'en', 'GBP'), '£1,234,567', 'en GBP');
is(kit.fmtKr(1234567, 'en', 'DKK'), '1,234,567 DKK', 'en DKK after the number');
is(kit.fmtKr(1234567, 'en', 'XYZ'), '$1,234,567', 'unknown currency falls back to USD');
is(kit.fmtKr(1234567, 'da', 'USD'), '1.234.567 kr.', 'da is always kr., whatever is asked');
is(kit.fmtKr(-1000, 'en'), '−$1,000', 'minus before the symbol');
is(kit.fmtKr2(1000.5, 'en'), '$1,000.50', 'en cents');
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
    // currency: Danish kr. only; English USD by default, never DKK/kr./krone (v1.25.55)
    if (lang === 'da') { assert.ok(!/[$€£]|DKK/.test(all), k + ' da: foreign currency ' + all.match(/.{30}([$€£]|DKK).{10}/)); n++; }
    else if (d.currency === 'DKK') {
      // Danish-law calculators: DKK after the number, US number format, Danish start values
      assert.ok(/\d,\d{3}\u00a0DKK/.test(all) && !/[$€£]|kr\.|krone/.test(all), k + ' en: DKK default ' + all.slice(0, 200)); n++;
    } else {
      assert.ok(!/DKK|\bkr\b|kr\.|krone/i.test(all), k + ' en: DKK/kr. in ' + all.match(/.{30}(DKK|kr\.|krone).{10}/i)); n++;
      if (d.fields.some(f => f.kind === 'kr')) { assert.ok(/\$\d/.test(all), k + ' en: USD amounts'); n++; }
    }
  }
}
// English start values: every amount field has a USD-sized value (DKK ÷ about 7, clean round numbers)
is(Object.entries(C).filter(([k, d]) => d.currency === 'DKK').map(([k]) => k).join(), 'holiday,absence', 'Danish-law calculators default to DKK');
for (const [k, d] of Object.entries(C)) for (const f of d.fields) if (f.kind === 'kr' && d.currency === 'DKK') { is(f.en, undefined, k + '.' + f.key + ': keeps the DKK start value in English'); }
for (const [k, d] of Object.entries(C)) for (const f of d.fields) if (f.kind === 'kr' && f.def != null && d.currency !== 'DKK') {
  assert.ok(typeof f.en === 'number' && f.en > 0 && f.en < f.def, k + '.' + f.key + ': no USD start value'); n++;
  const r = f.def / f.en; assert.ok(r > 5.5 && r < 8.5, k + '.' + f.key + ': ' + f.def + ' -> ' + f.en + ' is not about ÷7'); n++;
  assert.ok(f.en % 100 === 0, k + '.' + f.key + ': USD start value not rounded'); n++;
}
// USD maths on the English defaults (same rates, so only the amounts scale)
eq(C.tiers.calc({ method: 'marginal', sales: 60000, limits: [30000, 50000, 70000], rates: [5, 8, 10, 12] }).commission, 4100, 'tiers EN default $4,100');
eq(C.accelerator.calc({ quota: 50000, sales: 60000, base: 8, how: 'mult', mult: 1.5 }).commission, 5200, 'accelerator EN default $5,200');

// The page: mount in a small DOM (test/_dom.js). EN: currency menu, USD by default, switching changes the symbol only,
// remembered per viewer in localStorage, works without storage. DA: no menu, kr. (v1.25.55)
const { makeDoc } = require('./_dom');
function mountIn(lang, storage, d) {
  const doc = makeDoc(lang, storage); global.window = doc.defaultView;
  const root = doc.createElement('div'); root.setAttribute('data-tool', d.id); doc.body.appendChild(root);
  const api = kit.mount(doc, d);
  return { doc, root, api, hero: () => root.querySelector('.pw-calc__value').textContent, sel: root.querySelector('[data-currency-select]') };
}
{
  const store = {}, m = mountIn('en', store, C.tiers);
  is(m.hero(), '$4,100', 'EN mounts in USD with US number format');
  is(m.root.getAttribute('data-currency'), 'USD', 'EN data-currency');
  assert.ok(m.sel && m.sel.tagName === 'SELECT', 'EN has a currency menu'); n++;
  is(m.sel.children.map(o => o.value).join(), 'USD,EUR,GBP,DKK', 'menu options');
  const lab = m.root.querySelector('label[for="' + m.sel.id + '"]');
  is(lab && lab.textContent, 'Currency', 'menu has a visible label tied to it');
  const box = m.root.querySelector('.pw-calc__box');
  is(box.firstChild.className + ' ' + box.firstChild.textContent, 'pw-calc__unit $', 'USD symbol before the amount');
  is(m.root.querySelector('[data-input="sales"]').value, '60,000', 'EN start value $60,000');
  m.sel.value = 'EUR'; m.sel.dispatchEvent(new Event('change'));
  is(m.hero(), '€4,100', 'switch to EUR: same number, new symbol');
  is(store['pw-calc-currency'], 'EUR', 'choice saved in localStorage');
  m.sel.value = 'DKK'; m.sel.dispatchEvent(new Event('change'));
  is(m.hero(), '4,100 DKK', 'switch to DKK: symbol after the number');
  is(box.lastChild.textContent, 'DKK', 'DKK unit after the amount');
  is(m.root.querySelector('[data-input="sales"]').value, '60,000', 'inputs keep their numbers (no conversion)');
  m.sel.value = 'GBP'; m.sel.dispatchEvent(new Event('change'));
  is(m.hero(), '£4,100', 'switch to GBP');
  assert.ok(m.root.querySelector('.pw-calc__band').innerHTML.indexOf('£30,000–£50,000') > -1, 'tier range carries the symbol on both ends'); n++;
  assert.ok(!/DKK|kr\./.test(m.root.querySelector('.pw-calc__band').innerHTML) && /£/.test(m.root.querySelector('.pw-calc__band').innerHTML), 'breakdown follows the currency'); n++;
  // a second visit starts in the saved currency
  is(mountIn('en', store, C.accelerator).hero(), '£5,200', 'saved currency is used on the next calculator');
}
{
  // two calculators on one page follow the same choice
  const doc = makeDoc('en', {}); global.window = doc.defaultView;
  for (const id of ['tiers', 'split']) { const r = doc.createElement('div'); r.setAttribute('data-tool', id); doc.body.appendChild(r); }
  const a = kit.mount(doc, C.tiers), b = kit.mount(doc, C.split);
  const s = a.root.querySelector('[data-currency-select]'); s.value = 'EUR'; s.dispatchEvent(new Event('change'));
  is(b.currency() + ' ' + b.root.querySelector('[data-currency-select]').value, 'EUR EUR', 'other calculator on the page follows');
}
{
  const m = mountIn('en', 'throw', C.tiers);
  is(m.hero(), '$4,100', 'blocked storage: USD');
  m.sel.value = 'EUR'; m.sel.dispatchEvent(new Event('change'));
  is(m.hero(), '€4,100', 'blocked storage: switching still works');
  is(mountIn('en', { 'pw-calc-currency': 'BTC' }, C.tiers).hero(), '$4,100', 'unknown saved value: USD');
}
{
  const m = mountIn('da', { 'pw-calc-currency': 'EUR' }, C.tiers);
  is(m.hero(), '29.000 kr.', 'DA unchanged: kr., Danish format, DKK start values (ignores a saved EN choice)');
  is(m.sel, null, 'DA has no currency menu');
  is(m.root.querySelector('[data-input="sales"]').value, '420.000', 'DA start value 420.000');
  is(m.root.querySelector('.pw-calc__box').lastChild.textContent, 'kr.', 'DA unit after the amount');
}
{
  // holiday-pay and sick-pay (Danish law): DKK by default on English pages, menu shown, own memory
  const store = { 'pw-calc-currency': 'USD' }; // a USD choice made on another calculator
  const h = mountIn('en', store, C.holiday);
  is(h.hero(), '12,600 DKK', 'holiday EN: DKK default with the Danish start values, US number format');
  is(h.root.querySelector('[data-input="prior"]').value, '168,000', 'holiday EN start value 168,000');
  is(h.sel && h.sel.value, 'DKK', 'holiday EN: menu shown, DKK selected');
  is(h.root.querySelector('.pw-calc__box').lastChild.textContent, 'DKK', 'holiday EN: DKK after the amount');
  const a = mountIn('en', store, C.absence);
  is(a.hero(), '12,273 DKK', 'sick-pay EN: DKK default, not flipped by the shared USD choice');
  a.sel.value = 'EUR'; a.sel.dispatchEvent(new Event('change'));
  is(a.hero(), '€12,273', 'sick-pay EN: viewer can still switch');
  is(store['pw-calc-currency-dk'] + ' ' + store['pw-calc-currency'], 'EUR USD', 'choice saved under its own key; the shared key is untouched');
  is(mountIn('en', store, C.holiday).hero(), '€12,600', 'an explicit choice on a Danish-law calculator is remembered for both');
  is(mountIn('en', store, C.tiers).hero(), '$4,100', 'and does not flip the other calculators');
  is(mountIn('en', 'throw', C.absence).hero(), '12,273 DKK', 'blocked storage: DKK');
  // on one page: a switch on tiers does not move holiday-pay, and the other way round
  const doc = makeDoc('en', {}); global.window = doc.defaultView;
  for (const id of ['tiers', 'holiday-pay']) { const r = doc.createElement('div'); r.setAttribute('data-tool', id); doc.body.appendChild(r); }
  const t = kit.mount(doc, C.tiers), hp = kit.mount(doc, C.holiday);
  const ts = t.root.querySelector('[data-currency-select]'); ts.value = 'GBP'; ts.dispatchEvent(new Event('change'));
  is(t.currency() + ' ' + hp.currency(), 'GBP DKK', 'same page: tiers switch leaves holiday-pay on DKK');
  is(mountIn('da', { 'pw-calc-currency-dk': 'EUR' }, C.holiday).hero(), '12.600 kr.', 'holiday DA unchanged');
}
console.log('calculators: ' + n + ' checks passed');
process.exit(0); // the kit's live-region timer would otherwise keep Node waiting
