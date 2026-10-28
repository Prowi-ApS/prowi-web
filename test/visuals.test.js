// Detector and parser checks for the article visuals (src/tools/visuals.js), on real CMS samples saved from Webflow on
// 2026-10-28 (test/visuals-samples.json: tables, lists and glossary examples that must and must not get a visual).
// Run: npm test   (plain Node, no dependencies)
const assert = require('assert');
const V = require('../src/tools/visuals.js');
const S = require('./visuals-samples.json');
let n = 0;
const is = (a, b, msg) => { assert.deepStrictEqual(a, b, msg); n++; };
const yes = (c, msg) => { assert.ok(c, msg); n++; };

// ---- numbers: strict per language
const pv = (s, l) => { const p = V.parseVal(s, l); return p && [p.v, p.u]; };
is(pv('1.000,5', 'da'), [1000.5, ''], 'da 1.000,5');
is(pv('12,5 %', 'da'), [12.5, '%'], 'da 12,5 %');
is(pv('300.000 kr.', 'da'), [300000, 'kr'], 'da kr.');
is(pv('2.500.000 DKK', 'da'), [2500000, 'kr'], 'da DKK suffix');
is(pv('−4.500 kr.', 'da'), [-4500, 'kr'], 'da minus sign');
is(pv('$1,000.5', 'en'), [1000.5, '$'], 'en $1,000.5');
is(pv('12.5%', 'en'), [12.5, '%'], 'en 12.5%');
is(pv('DKK 91,244', 'en'), [91244, 'kr'], 'en DKK prefix');
is(pv('-$10,800', 'en'), [-10800, '$'], 'en negative dollars');
is(pv('DKK -800', 'en'), [-800, 'kr'], 'en sign after currency');
is(pv('€24,000', 'en'), [24000, '€'], 'en euro');
is(pv('$100K', 'en'), [100000, '$'], 'en K');
is(pv('1,5x', 'da'), [1.5, 'x'], 'da multiplier');
is(pv('1.5x', 'da'), null, 'English decimal on a Danish page is not read');
is(pv('1.000', 'en'), [1, ''], 'en plain 1.000 is one');
is(pv('$12.000', 'en'), null, 'Danish thousands with $ on an English page is not trusted');
is(pv('12 %kr.', 'da'), null, 'two units');
is(pv('ca. 5', 'da'), null, 'words are not numbers');
is(pv('7% på ALT', 'da'), null, 'trailing words');
is(V.parseRate('12% (1.5x multiplier)', 'en').v, 12, 'rate with a bracket note'); n++;
is(V.parseRate('0,8x rate', 'da').v, 0.8, 'rate word after a multiplier'); n++;
const pr = (s, l) => { const r = V.parseRange(s, l); return r && [r.lo, r.hi, r.u]; };
is(pr('0 - 300.000 DKK', 'da'), [0, 300000, 'kr'], 'da range');
is(pr('300.001 - 600.000 DKK', 'da'), [300001, 600000, 'kr'], 'da range 2');
is(pr('600.001+ DKK', 'da'), [600001, Infinity, 'kr'], 'open range with unit after +');
is(pr('$45,001 - $90,000', 'en'), [45001, 90000, '$'], 'en range');
is(pr('81-100%', 'en'), [81, 100, '%'], 'pct range');
is(pr('0-50% af quota', 'da'), [0, 50, '%'], 'range with "af quota"');
is(pr('Over 120 %', 'da'), [120, Infinity, '%'], 'over');
is(pr('Under 50%', 'en'), [0, 50, '%'], 'under');
is(pr('150%+', 'en'), [150, Infinity, '%'], 'n%+');
is(pr('100-80%', 'en'), null, 'descending range');
is(pr('Trin 1', 'da'), null, 'label is not a range');

// ---- tier staircase
for (const t of S.tiers_true) {
  const s = V.detectTiers(t, t.lang);
  yes(s && s.tiers.length >= 3, 'tiers expected: ' + t.path + ' #' + t.k);
  for (let i = 1; i < s.tiers.length; i++) yes(s.tiers[i].rate >= s.tiers[i - 1].rate, 'rates never go down ' + t.path);
}
for (const t of S.tiers_false) is(V.detectTiers(t, t.lang), null, 'no tiers: ' + t.path + ' #' + t.k + ' ' + (t.head || []).join('|'));
// a gap between tiers or a falling rate is not a staircase
const tt = JSON.parse(JSON.stringify(S.tiers_true[1]));
tt.rows[1][1] = '350.001 - 600.000 DKK';
is(V.detectTiers(tt, 'da'), null, 'gap between tiers');
const tr = JSON.parse(JSON.stringify(S.tiers_true[1])); tr.rows[2][2] = '5%';
is(V.detectTiers(tr, 'da'), null, 'falling rate');
// example marker: only from a sentence that is an example, with one amount in the tiers' unit
const m0 = V.findMarker(V.detectTiers(S.tiers_true[0], 'da'), S.tiers_true[0].near, 'da');
is(m0 && m0.v, 2500000, 'marker: "I dette eksempel tjener en sælger, der når 2.500.000 DKK"');
is(V.findMarker(V.detectTiers(S.tiers_true[1], 'da'), S.tiers_true[1].near, 'da'), null, 'no marker without an example sentence');
is(V.findMarker(V.detectTiers(S.tiers_true[1], 'da'), ['Eksempel: en sælger med 400.000 kr. og 700.000 kr.'], 'da'), null, 'no marker when two amounts');

// ---- waterfall: the rows must add up to the total, to the last shown digit
for (const t of S.wf_true) {
  const s = V.detectWaterfall(t, t.lang);
  yes(s, 'waterfall expected: ' + t.path + ' #' + t.k);
  yes(Math.abs(s.items.reduce((a, b) => a + b.v, 0) - s.total.v) < 0.006, 'sum = total ' + t.path);
}
for (const t of S.wf_false) {
  const x = JSON.parse(JSON.stringify(t));
  if (t.mutate === 'total+1') { const last = x.rows[x.rows.length - 1]; last[last.length - 1] = last[last.length - 1].replace('75.600', '75.601'); }
  if (t.mutate === 'midtotal') x.rows.splice(1, 0, ['Total', '', '', '', '', '', 'DKK 0']);
  is(V.detectWaterfall(x, x.lang), null, 'no waterfall: ' + t.path + ' ' + (t.mutate || (t.head || []).join('|')));
}
const neg = V.detectWaterfall(S.wf_true[1], 'da');
is(neg.items.map(i => i.v), [-7500, 3000], 'signed amounts (−7.500 kr., +3.000 kr.)');

// ---- flow line
for (const f of S.flow_true) {
  const s = V.detectFlow(f.items, f.lang);
  yes(s && s.steps.length === 6, 'flow expected: ' + f.path);
}
is(V.detectFlow(S.flow_true[0].items, 'da').steps.map(s => s.label), ['Plandesign', 'Data', 'Beregning', 'Godkendelse', 'Udbetaling', 'Indsigelser'], 'step labels are the items\' own leads');
for (const f of S.flow_false) is(V.detectFlow(f.items, f.lang), null, 'no flow: ' + f.path + ' "' + f.items[0].slice(0, 40) + '"');
is(V.detectFlow(['Periode', 'Godkendelse', 'Løn'], 'da', true).steps.length, 3, 'explicit list (data-pw-visual="flow") needs no keywords');

// ---- key numbers
for (const l of S.num_true) {
  const s = V.detectNumbers(l.heading, l.items, l.lang);
  yes(s && s.cards.length === l.items.length, 'number cards expected: ' + l.path);
}
is(V.detectNumbers(S.num_true[0].heading, S.num_true[0].items, 'da').cards.map(c => c.big), ['91.244 kr.', '79.337 kr.', 'Ca. 54.800 kr.', 'Ca. 44.400 kr.', '16,7 %', '2,8 gange'], 'big numbers from the bold lead');
is(V.detectNumbers(S.num_true[2].heading, S.num_true[2].items, 'en').cards.map(c => c.big), ['48%', '$200,000', '67%', '74%', '82%'], 'big numbers from the first bold figure');
for (const l of S.num_false) is(V.detectNumbers(l.heading, l.items, l.lang), null, 'no number cards: ' + l.path + ' ' + l.heading);
is(V.detectNumbers('Om undersøgelsen', S.num_true[0].items, 'da'), null, 'only under a key findings heading');

// ---- calculation strip (glossary example)
for (const e of S.expr_true) yes(V.parseExpr(e.text, e.lang), 'strip expected: ' + e.path);
for (const e of S.expr_false) is(V.parseExpr(e.text, e.lang), null, 'no strip: ' + e.path);
const ex = (t, l) => { const s = V.parseExpr(t, l); return s && s.parts.map(p => (p.op ? p.op + ' ' : '') + p.t).concat('= ' + s.result.t).join(' '); };
is(ex('12.000 kr. i provision med 6 måneders pro rata clawback: Opsiger kunden i måned 3, modregnes 12.000 × 4/6 = 8.000 kr. i næste udbetaling.', 'da'), '12.000 × 4/6 = 8.000 kr.', 'fraction');
is(ex('2.000.000 kr. solgt mod en kvote på 2.500.000 kr.: 2.000.000 ÷ 2.500.000 × 100 = 80 % kvoteopfyldelse.', 'da'), '2.000.000 ÷ 2.500.000 × 100 = 80 %', 'percent result');
is(ex('Et budget på 18.000.000 kr. × 1,125 i overallokering ÷ 4,5 fuldt produktive sælgere giver en fuld kvote på 4.500.000 kr.', 'da'), '18.000.000 kr. × 1,125 ÷ 4,5 = 4.500.000 kr.', '"giver ... på" as the equals sign, labels kept');
is(V.parseExpr('Et budget på 18.000.000 kr. × 1,125 i overallokering ÷ 4,5 fuldt produktive sælgere giver en fuld kvote på 4.400.000 kr.', 'da'), null, 'wrong result');
is(V.parseExpr('60.000 + 18.000 = 79.000 kr.', 'da'), null, 'wrong sum');
is(V.parseExpr('$9,500 - $9,000 = $500', 'en') && 1, 1, 'subtraction');
is(V.parseExpr('$1,500 × 5% = 75 kr.', 'en'), null, 'mixed currencies');
is(V.parseExpr('1.680.000 × 10 % = 168.000 kr.', 'en'), null, 'Danish numbers on an English page');
is(V.parseExpr('Kvoten er 60/25/15 fordelt', 'da'), null, 'a split is not a division');
is(ex('A $45,000 contract renews at a 3% renewal rate: $45,000 × 3% = $1,350 in renewal commission.', 'en'), '$45,000 × 3% = $1,350', 'percent operand');

// ---- calculators: exact paths only
is(V.calcFor('/post/trappemodel-provision'), 'tiers', 'tiers post');
is(V.calcFor('/en/glossary/holiday-pay-on-commission/'), 'holiday-pay', 'trailing slash');
is(V.calcFor('/post/trappemodel-provision-2'), null, 'no prefix matching');
is(V.calcFor('/provisionsmodeller/trappemodel'), null, 'commission model pages have their own calculator');
const ids = Object.keys(V.CALC); is(ids.sort(), ['accelerator', 'holiday-pay', 'quota', 'sick-pay', 'split', 'tiers'], 'calculator ids of v1.25.51');

// ---- count-up formatting keeps the token as written
const tp = V.tokenParts('Ca. 54.800 kr.', 'da');
is(V.fmtTok(tp, 54800, 'da'), 'Ca. 54.800 kr.', 'final value = original text');
is(V.fmtTok(tp, 1234.4, 'da'), 'Ca. 1.234 kr.', 'grouping kept while counting');
is(V.fmtTok(V.tokenParts('16.7%', 'en'), 8.36, 'en'), '8.4%', 'decimals kept');

console.log('visuals: ' + n + ' checks pass');
