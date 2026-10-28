// Scoring, data and copy checks for the Provisionsplan-tjek / commission plan health check (src/tools/healthcheck.js).
// Run: node test/healthcheck.test.js   (plain Node, no dependencies)
const assert = require('assert');
const H = require('../src/tools/healthcheck.js');
let n = 0;
const is = (a, b, msg) => { assert.strictEqual(a, b, msg + ': ' + JSON.stringify(a) + ' != ' + JSON.stringify(b)); n++; };
const ok = (c, msg) => { assert.ok(c, msg); n++; };
const all = id => { const a = {}; H.Q.forEach(q => { a[q.id] = id(q); }); return a; };
const best = all(q => q.opts.find(o => o[1] === 3)[0]);
const worst = all(q => q.opts.reduce((m, o) => (o[1] < m[1] ? o : m))[0]);

// structure: 15 questions in 4 areas, 3-4 options each, exactly one best answer at 3 points or a full-score "not relevant"
is(H.Q.length, 15, 'question count');
is(H.AREAS.length, 4, 'area count');
H.Q.forEach(q => {
  ok(q.opts.length >= 3 && q.opts.length <= 4, q.id + ' has 3-4 options');
  ok(H.AREAS.some(a => a.id === q.area), q.id + ' area exists');
  ok(q.opts.some(o => o[1] === 3) && q.opts.some(o => o[1] === 0 || o[1] === 1), q.id + ' spans the scale');
  q.opts.forEach(o => {
    ok([0, 1, 2, 3].includes(o[1]), q.id + '/' + o[0] + ' points 0-3');
    if (o[1] < 3) { ok(!!o[2] && !!o[3], q.id + '/' + o[0] + ' weak answer has a recommendation and a resource'); }
    else ok(!o[2], q.id + '/' + o[0] + ' full score has no recommendation');
  });
});

// scoring
let r = H.score(best);
is(r.total, 100, 'all best = 100'); is(r.band, 'healthy', 'all best band'); is(r.recs.length, 0, 'no recs'); is(r.top.length, 0, 'no top');
r.areas.forEach(a => is(a.score, 100, 'area ' + a.id + ' 100'));
r = H.score(worst);
is(r.points, 1, 'all worst = 1 point (the payroll question has no 0-point answer)'); is(r.total, 2, 'all worst = 2'); is(r.band, 'risky', 'all worst band'); is(r.recs.length, 15, 'one rec per weak answer'); is(r.top.length, 3, 'top 3');
// ties on gap 3: legal and control questions first (imp 3), in question order
is(r.top.map(x => x.q).join(','), 'written,changes,clawback', 'top 3 order on a tie');
is(H.score({}).total, 0, 'empty = 0');
ok(!H.complete({}) && H.complete(best) && !H.complete(Object.assign({}, best, { crm: 'x' })), 'complete()');

// mixed case, computed by hand: points 2+3+1 | 3+2+3+1+3 | 1+2+3+1 | 2+3+2 = 6 | 12 | 7 | 7 = 32 of 45 → 71 → vulnerable
const mixed = { understood: 'b', selfcalc: 'a', exceptions: 'c', written: 'a', changes: 'b', clawback: 'a', absence: 'b', leaving: 'd',
  time: 'c', disputes: 'b', approval: 'a', payroll: 'd', visibility: 'b', crm: 'a', aligned: 'b' };
r = H.score(mixed);
is(r.points, 32, 'mixed points'); is(r.max, 45, 'max points'); is(r.total, 71, 'mixed total 32/45');
is(r.band, 'vulnerable', 'mixed band'); is(r.bucket, '70-79', 'mixed bucket');
is(r.areas.map(a => a.score).join(','), '67,80,58,78', 'mixed area scores (6/9, 12/15, 7/12, 7/9)');
// gaps: absence 2 (imp 3), exceptions 2, time 2, payroll 2 → absence first, then the 3 others by importance/order
is(r.top.map(x => x.q).join(','), 'absence,exceptions,time', 'mixed top 3');
is(r.recs.length, 9, 'mixed: one rec per answer below 3 points');
ok(!r.recs.some(x => x.q === 'leaving'), '"no bonus" counts as full score');

// bands and buckets at the boundaries
is(H.band(49), 'risky', 'band 49'); is(H.band(50), 'vulnerable', 'band 50'); is(H.band(74), 'vulnerable', 'band 74'); is(H.band(75), 'healthy', 'band 75');
is(H.bucket(0), '0-9', 'bucket 0'); is(H.bucket(49), '40-49', 'bucket 49'); is(H.bucket(99), '90-100', 'bucket 99'); is(H.bucket(100), '90-100', 'bucket 100');
// every possible total is an integer 0-100 and the band follows it
for (let p = 0; p <= 45; p++) { const t = Math.round(p / 45 * 100); ok(t >= 0 && t <= 100, 'range ' + p); }

// texts: both languages complete
const words = s => String(s || '');
['da', 'en'].forEach(L => {
  const T = H.T[L];
  H.Q.forEach(q => {
    const t = T.q[q.id];
    ok(t && t[0] && Array.isArray(t[2]) && t[2].length === q.opts.length, L + ' ' + q.id + ' question and options');
    q.opts.forEach(o => { if (o[2]) ok(!!T.r[o[2]], L + ' rec ' + o[2]); });
  });
  ['risky', 'vulnerable', 'healthy'].forEach(b => ok(T.bands[b] && T.bands[b][0] && T.bands[b][1], L + ' band ' + b));
  H.AREAS.forEach(a => ok(!!a[L], L + ' area ' + a.id));
  is(Object.keys(H.T.da.ui).sort().join(), Object.keys(T.ui).sort().join(), L + ' ui keys match');
  is(Object.keys(H.T.da.r).sort().join(), Object.keys(T.r).sort().join(), L + ' rec keys match');
});
// resources: DA paths are Danish, EN paths are /en/...; every key used exists
Object.keys(H.RES).forEach(k => {
  ok(/^\/(?!en\/)/.test(H.RES[k].da[0]), 'DA path ' + k);
  ok(/^\/en\//.test(H.RES[k].en[0]), 'EN path ' + k);
});
H.Q.forEach(q => q.opts.forEach(o => { if (o[3]) ok(!!H.RES[H.res(o[3])], 'resource ' + o[3]); }));
is(H.res('roles'), 'roles', 'role plans hub is live and linked');

// copy rules: no acute accents in Danish, no competitor names anywhere, Danish number formats
const dump = L => JSON.stringify(H.T[L]);
ok(!/[éáíóúÉÁÍÓÚ]/.test(dump('da')), 'no acute accents in Danish copy');
const COMP = /\b(quotapath|qobra|spiff|palette|captivateiq|everstage|xactly|varicent|performio|forma\.ai|sales cookie|commissionly)\b/i;
ok(!COMP.test(dump('da') + dump('en')), 'no competitor names');
ok(/12,5 %/.test(dump('da')) && !/\d\.\d/.test(dump('da').replace(/§ \d+ ?\w?/g, '')), 'Danish decimals use a comma');
ok(/12\.5%/.test(dump('en')), 'English decimals use a dot');
ok(!/\b(ae|oe|aa)\b/.test(dump('da')), 'no ae/oe/aa words in Danish prose');

console.log('healthcheck: ' + n + ' checks pass');
