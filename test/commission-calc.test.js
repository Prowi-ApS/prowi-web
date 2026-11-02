// Standalone commission calculator (tools-standalone/commission-calc.js, /provisionsberegner + /en/commission-calculator):
// maths and texts per language and currency, and the page in a small DOM built like the static Webflow markup
// (fields: <span class="pw-tool__input" data-input data-kind data-default> + unit span; outputs [data-o]).
// Run: npm test
const assert = require('assert');
const C = require('../tools-standalone/commission-calc.js');
const { makeDoc } = require('./_dom');
let n = 0;
const is = (a, b, msg) => { assert.strictEqual(a, b, msg); n++; };
const NB = ' ';

const DEF = { mode: 'fast', months: 1, retro: false, sales: 420000, quota: 350000, baseMonthly: 32000, cap: null,
  rate: 8, t1: 200000, r1: 5, t2: 350000, r2: 8, r3: 12, accBase: 8, accHigh: 15, dg: 35, dbRate: 20 };
// Danish: unchanged (kr., 1.000)
let w = C.view(DEF, 'da');
is(w.commission, '33.600' + NB + 'kr.', 'da commission');
is(w.total, '65.600' + NB + 'kr.', 'da total');
is(w.attNote, '70.000' + NB + 'kr. over målet.', 'da attainment note');
is(C.view(DEF, 'da', 'USD').commission, '33.600' + NB + 'kr.', 'da ignores a currency');
// English: USD by default; the other currencies only change the symbol
const EN = Object.assign({}, DEF, { sales: C.EN_DEF.sales, quota: C.EN_DEF.quota, baseMonthly: C.EN_DEF.base, t1: C.EN_DEF.t1, t2: C.EN_DEF.t2 });
w = C.view(EN, 'en');
is(w.commission, '$4,800', 'en default USD: 8% of $60,000');
is(w.total, '$9,400', 'en total pay');
is(w.totalNote, 'Base salary $4,600 + commission $4,800', 'en total note');
is(w.attNote, '$10,000 above quota.', 'en attainment note');
is(w.live, 'Commission: $4,800, effective rate: 8%, quota attainment: 120%, total pay: $9,400.', 'en live text');
is(C.view(EN, 'en', 'EUR').commission, '€4,800', 'en EUR');
is(C.view(EN, 'en', 'GBP').commission, '£4,800', 'en GBP');
is(C.view(EN, 'en', 'DKK').commission, '4,800' + NB + 'DKK', 'en DKK after the number');
is(C.view(Object.assign({}, EN, { mode: 'tiers' }), 'en').commission, '$4,300', 'en tiers: 1,500 + 1,600 + 1,200');
is(C.view(Object.assign({}, EN, { mode: 'tiers' }), 'en').rows[1].label, 'Tier 2: $30,000–$50,000', 'en tier range');
is(C.view(Object.assign({}, DEF, { mode: 'tiers' }), 'da').rows[1].label, 'Trin 2: 200.000–350.000' + NB + 'kr.', 'da tier range unchanged');
is(C.view(Object.assign({}, EN, { mode: 'accel' }), 'en').commission, '$5,500', 'en accelerator: 4,000 + 1,500');
w = C.view(Object.assign({}, EN, { cap: 4000 }), 'en');
is(w.rows[w.rows.length - 1].amount, '−$800', 'en cap row: minus before the symbol');
for (const mode of ['fast', 'tiers', 'accel', 'db']) {
  const all = JSON.stringify(C.view(Object.assign({}, EN, { mode, cap: 1000 }), 'en'));
  assert.ok(!/DKK|kr\.|krone/.test(all), mode + ' en: DKK left in ' + all); n++;
}
is(C.parse('$60,000', 'en', 'kr'), 60000, 'en typed with $');
for (const k in C.EN_DEF) { const r = DEF[k === 'base' ? 'baseMonthly' : k] / C.EN_DEF[k]; assert.ok(r > 6.5 && r < 7.5, k + ' about ÷7'); n++; }

// The page
function page(lang, storage) {
  const doc = makeDoc(lang, storage); global.window = doc.defaultView;
  const el = (tag, attrs, kids) => { const e = doc.createElement(tag); for (const k in attrs || {}) if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); (kids || []).forEach(c => e.appendChild(c)); return e; };
  const field = (key, kind, def, unit) => el('div', { class: 'pw-tool__field' }, [el('div', { text: key }),
    el('div', { class: 'pw-tool__input-box' }, [el('span', { class: 'pw-tool__input', 'data-input': key, 'data-kind': kind, 'data-default': def, text: String(def) }),
      el('span', { class: 'pw-demo__host-role', text: unit })])]);
  const U = lang === 'en' ? 'DKK' : 'kr.'; // what the static EN markup says today
  const root = el('div', { 'data-tool': 'commission' }, [
    el('div', { class: 'pw-tool__inputs' }, [field('sales', 'kr', DEF.sales, U), field('quota', 'kr', DEF.quota, U), field('rate', 'pct', 8, '%'),
      field('base', 'kr', DEF.baseMonthly, U), field('cap', 'kr', '', U)]),
    el('div', {}, ['commission', 'summary', 'warn', 'eff', 'att', 'attbar', 'attnote', 'total', 'totalnote', 'rows', 'live'].map(k => el('div', { 'data-o': k })))
  ]);
  doc.body.appendChild(root);
  C.mount(doc);
  const o = k => root.querySelector('[data-o="' + k + '"]').textContent;
  return { root, o, sel: root.querySelector('[data-currency-select]'), box: root.querySelector('.pw-tool__input-box') };
}
{
  const p = page('da', { 'pw-calc-currency': 'EUR' });
  is(p.o('commission'), '33.600' + NB + 'kr.', 'DA page unchanged');
  is(p.sel, null, 'DA page: no currency menu');
  is(p.box.lastElementChild.textContent, 'kr.', 'DA unit stays after the amount');
  is(p.root.querySelector('[data-input="sales"]').value, '420.000', 'DA start value');
}
{
  const store = {}, p = page('en', store);
  is(p.o('commission'), '$4,800', 'EN page: USD by default');
  is(p.root.querySelector('[data-input="sales"]').value, '60,000', 'EN start value $60,000 (markup carries 420000)');
  is(p.box.firstElementChild.textContent, '$', 'EN: $ before the amount (static "DKK" replaced)');
  is(p.sel.parentNode.parentNode.className, 'pw-tool__inputs', 'menu at the top of the input column');
  is(p.root.querySelector('label[for="pw-cc-currency"]').textContent, 'Currency', 'menu label');
  p.sel.value = 'EUR'; p.sel.dispatchEvent(new Event('change'));
  is(p.o('commission'), '€4,800', 'switch to EUR');
  is(store['pw-calc-currency'], 'EUR', 'saved for the next visit (shared key with the site calculators)');
  p.sel.value = 'DKK'; p.sel.dispatchEvent(new Event('change'));
  is(p.o('commission'), '4,800' + NB + 'DKK', 'switch to DKK');
  is(p.box.lastElementChild.textContent, 'DKK', 'DKK unit after the amount');
  is(p.root.querySelector('[data-input="sales"]').value, '60,000', 'numbers unchanged');
  is(page('en', store).o('commission'), '4,800' + NB + 'DKK', 'saved currency used on the next visit');
  is(page('en', 'throw').o('commission'), '$4,800', 'blocked storage: USD');
}
console.log('commission calculator: ' + n + ' checks passed');
process.exit(0);
