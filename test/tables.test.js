// Rich-text tables (src/tools/tables.js, v1.25.62): pure helpers in plain Node, then the real thing in headless
// Chromium against a post-like fixture with the template's white-card table CSS (page code of the Insider post
// template): expand button, dialog (mouse + keyboard, focus trap, scroll lock, clone), wide tables reachable inline,
// Plausible event, DA/EN labels, opt-out, and that the visuals module (tier staircase above the table) still works.
// The browser part needs Playwright + a Chromium build; prints SKIP when neither is installed.
const assert = require('assert');
const fs = require('fs'), path = require('path');
const T = require('../src/tools/tables.js');
let n = 0;
const is = (a, b, msg) => { assert.deepStrictEqual(a, b, msg); n++; };
const yes = (c, msg) => { assert.ok(c, msg); n++; };

// ---- pure helpers
is(T.colCount([[1, 1, 1], [1, 1]]), 3, 'widest row counts');
is(T.colCount([[2, 1], [1, 1, 1, 1]]), 4, 'colspans add up');
is(T.colCount([]), 0, 'empty table');
is(T.colCount([[0, 'x']]), 2, 'bad colspans count as 1');
is(T.showButton(2, false), false, '2 columns that fit: no button');
is(T.showButton(3, false), true, '3 columns: button');
is(T.showButton(5, false), true, '5 columns: button');
is(T.showButton(2, true), true, '2 columns that overflow: button');
is(T.showButton(1, false), false, '1 column: no button');
is(T.minWidth(2), 0, '2 columns always fit the card');
is(T.minWidth(3), 480, '3 columns: 480 px on phones (as before on posts)');
is(T.minWidth(5), 660, '5 columns: 132 px per column');
is(T.canStick(146, 348, false), true, 'first column 42 % of the card: sticky');
is(T.canStick(200, 348, false), false, 'first column over half the card: not sticky');
is(T.canStick(146, 348, true), false, 'a first cell that spans columns: not sticky');
is(T.canStick(0, 348, false), false, 'no width: not sticky');
is(T.isClear('rgba(0, 0, 0, 0)'), true, 'transparent');
is(T.isClear('transparent'), true, 'transparent keyword');
is(T.isClear('rgb(255, 255, 255)'), false, 'white');
is(T.isClear('rgba(17, 6, 99, 0.12)'), false, 'hairline');
is(T.isShort('12 %'), true); is(T.isShort('  15.000\n kr. '), true); is(T.isShort(''), false); is(T.isShort('300.000 - 600.000 kr.'), false, 'longer text may wrap');
is(T.langOf('en'), 'en'); is(T.langOf('en-US'), 'en'); is(T.langOf('da'), 'da'); is(T.langOf(''), 'da');
is(T.TXT.en.expand, 'Expand table'); is(T.TXT.da.expand, 'Udvid tabel');
is(T.TXT.en.close, 'Close table'); is(T.TXT.da.close, 'Luk tabel');

// ---- build: the chunk exists, is only requested where a rich-text body has a table, and the other roots are unchanged
const ROOT = path.join(__dirname, '..');
const entry = fs.readFileSync(path.join(ROOT, 'dist/prowi-2026.js'), 'utf8');
const man = JSON.parse(entry.match(/window\.__PW_CHUNKS = (\{.*?\});\n/)[1]);
yes(man['tool:tables'] && man['tool:tables'].f === 'chunks/tables.js', 'manifest has the tables chunk');
is(man['tool:tables'].s, T.SEL, 'loaded only where one of the rich-text bodies holds a table');
yes(T.SEL.split(',').every(s => / table$/.test(s)), 'every root selector ends in " table"');
is(man['tool:visuals'].s, '.pw-post__body,.pw-term__body,.pw-model__guide,.pw-type__longform,.pw-int__longform,[data-pw-visual]', 'visuals roots unchanged');
const built = fs.readFileSync(path.join(ROOT, 'dist/chunks/tables.js'), 'utf8');
yes(built.includes('Table expanded') && built.includes('Udvid tabel') && built.includes('aria-modal'), 'built chunk carries the event, the labels and the dialog');
yes(!/https?:\/\//.test(built.replace(/http:\/\/www\.w3\.org\/[a-z0-9/]+/g, '')), 'no external addresses in the chunk');

// ---- browser
let chromium = null;
for (const p of ['playwright', '/opt/npm-tools/node_modules/playwright', '/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright']) {
  try { chromium = require(p).chromium; break; } catch (e) {}
}
if (!chromium) { console.log('tables: ' + n + ' checks pass; browser part SKIP (playwright not installed)'); process.exit(0); }

// table CSS of the Insider post template's page code (footer block "white tables", 2026-10-26) + cms-insider's wrapper
const CSS = `body{margin:0;font:16px/1.5 sans-serif;background:#F7F6FD}
.col{width:var(--w,692px);margin:40px auto}
.pw-post__body table{display:table;width:100%!important;max-width:100%;border-collapse:separate!important;border-spacing:0!important;overflow:hidden;margin:24px 0 0!important;font-size:15px!important;line-height:1.5;background:#fff!important;border:1px solid rgba(17,6,99,.12)!important;border-radius:12px}
.pw-post__body th,.pw-post__body td{border:0!important;border-bottom:1px solid rgba(17,6,99,.12)!important;padding:12px 16px!important;background:transparent!important;text-align:left!important;vertical-align:top!important}
.pw-post__body th{font-size:12px!important;font-weight:600!important;text-transform:uppercase;letter-spacing:.02em;white-space:nowrap}
@media (max-width:767px){.pw-post__body table{display:block;overflow-x:auto}}
.pw-post__table-scroll{max-width:100%;overflow-x:auto}.pw-post__table-scroll > table{min-width:480px}`;
const WIDE = `<table id="wide"><thead><tr><th>Criterion (0-5)</th><th>1. Spreadsheet + export</th><th>2. Pipedrive-native fields</th><th>3. Home-built tool</th><th>4. Native marketplace app</th></tr></thead><tbody>
<tr><td>Native integration and marketplace listing</td><td>1</td><td>5</td><td>3</td><td>5</td></tr><tr><td>Real-time calculation</td><td>1</td><td>3</td><td>3</td><td>5</td></tr>
<tr><td><strong>Total (of 35)</strong></td><td><strong>17</strong></td><td><strong>20</strong></td><td><strong>19</strong></td><td><strong id="prowi">30</strong></td></tr></tbody></table>`;
const TIERS = `<table><thead><tr><th>Monthly won revenue</th><th>Commission rate</th></tr></thead><tbody><tr><td>$0 - $40,000</td><td>5%</td></tr><tr><td>$40,000 - $80,000</td><td>8%</td></tr><tr><td>Above $80,000</td><td>12%</td></tr></tbody></table>`;
const THREE = `<table><thead><tr><th>Situation</th><th>Choice</th><th>Why</th></tr></thead><tbody><tr><td>1-3 reps</td><td><a href="https://example.test/x">Spreadsheet</a></td><td>One multiplication</td></tr><tr><td>4-15 reps</td><td><a href="#sec">Native app</a></td><td>Cross-deal logic</td></tr></tbody></table>`;
const page = (lang, o = {}) => `<!doctype html><html lang="${lang}"${o.off ? ' data-no-table-expand' : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${CSS}</style>
<script>window.__ev=[];window.plausible=function(n,o){window.__ev.push([n,o&&o.props]);};</script></head><body>
<div class="col" style="--w:${o.w || 692}px"><div class="pw-post__body w-richtext"><h2 id="sec">Comparison: four ways</h2><p>Intro.</p>
${o.none ? '' : `<div class="pw-post__table-scroll">${WIDE}</div><h3>Example plan</h3><p>The rep wins deals.</p><div class="pw-post__table-scroll">${TIERS}</div><p>The rates are marginal.</p>${THREE}`}
<p style="height:1400px">Tail.</p></div></div>
<script>${fs.readFileSync(path.join(ROOT, 'dist/chunks/tables.js'), 'utf8').replace(/<\/script/g, '<\\/script')}</script>
<script>${fs.readFileSync(path.join(ROOT, 'dist/chunks/visuals.js'), 'utf8').replace(/<\/script/g, '<\\/script')}</script></body></html>`;

(async () => {
  const exe = (() => { const base = '/opt/pw-browsers'; try { for (const d of fs.readdirSync(base)) { const f = path.join(base, d, 'chrome-headless-shell-linux64', 'chrome-headless-shell'); if (fs.existsSync(f)) return f; } } catch (e) {} return undefined; })();
  let b;
  try { b = await chromium.launch(exe ? { executablePath: exe } : {}); } catch (e) { try { b = await chromium.launch(); } catch (e2) { console.log('tables: ' + n + ' checks pass; browser part SKIP (no Chromium build)'); return; } }
  const errors = [];
  const open = async (lang, o = {}, vw = 1440) => {
    const ctx = await b.newContext({ viewport: { width: vw, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.route('**/*', r => r.abort());
    await p.setContent(page(lang, o)); await p.waitForTimeout(150);
    return p;
  };
  // --- EN, desktop column (692 px)
  let p = await open('en');
  // the visuals module only inserts while the spot is off screen: scroll past the tables and back
  await p.evaluate(() => scrollTo(0, 99999)); await p.waitForTimeout(250); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100);
  let s = await p.evaluate(() => [...document.querySelectorAll('.pw-tx')].map(c => {
    const t = c.querySelector('table'), sc = c.querySelector('.pw-tx__scroll'), btn = c.querySelector('.pw-tx__btn');
    const last = t.rows[0].cells[t.rows[0].cells.length - 1].getBoundingClientRect(), cr = c.getBoundingClientRect();
    return { cls: c.className, btn: getComputedStyle(btn).display !== 'none', label: btn.getAttribute('aria-label'), type: btn.type, fits: sc.scrollWidth <= sc.clientWidth + 1, lastIn: last.right <= cr.right + 1,
      reuse: sc.classList.contains('pw-post__table-scroll'), prevVis: !!(c.previousElementSibling && c.previousElementSibling.classList.contains('pw-vis')), visInside: !!c.querySelector('.pw-vis'), parentBody: c.parentNode.classList.contains('pw-post__body') };
  }));
  is(s.length, 3, 'three tables wrapped');
  is(s.map(x => x.btn), [true, false, true], 'button on the 5- and 3-column tables, not on the 2-column one');
  is(s[0].label, 'Expand table', 'EN label'); is(s[0].type, 'button', 'a real button');
  yes(s[0].fits && s[0].lastIn, 'the 5-column table fits the 692 px column once its headers wrap: last column in view');
  yes(/pw-tx--wrap/.test(s[0].cls) && !/pw-tx--over/.test(s[0].cls), 'wrap mode, no scrolling needed');
  yes(!/pw-tx--wrap/.test(s[2].cls), 'a table that fits keeps its one-line headers');
  yes(s.every(x => /pw-tx--card/.test(x.cls) && x.parentBody), 'the card look moves to the wrapper');
  is(s.map(x => x.reuse), [true, true, false], 'the post scroll wrapper is reused, others get one');
  yes(s[1].prevVis && s.every(x => !x.visInside), 'visuals: the tier staircase sits above the card, not inside it');
  is(await p.evaluate(() => document.querySelectorAll('.pw-vis').length), 1, 'visuals: one visual (tiers) built from the wrapped table');
  is(await p.evaluate(() => { const c = document.querySelector('.pw-tx'), t = c.querySelector('table'), a = getComputedStyle(c), b = getComputedStyle(t); return [a.borderTopWidth, a.borderTopLeftRadius, a.backgroundColor, a.marginTop, b.borderTopWidth, b.marginTop, b.display]; }),
    ['1px', '12px', 'rgb(255, 255, 255)', '24px', '0px', '0px', 'table'], 'card: border, radius, background and margin on the wrapper; none left on the table');
  // dialog by mouse
  const y0 = await p.evaluate(() => { scrollTo(0, 120); return scrollY; });
  await p.locator('.pw-tx__btn').first().click();
  let d = await p.evaluate(() => { const g = document.querySelector('.pw-txd'), pn = g.querySelector('.pw-txd__panel'), t = g.querySelector('table'); const r = pn.getBoundingClientRect();
    return { hidden: g.hidden, role: pn.getAttribute('role'), modal: pn.getAttribute('aria-modal'), name: pn.getAttribute('aria-label'), rows: t.rows.length, cols: t.rows[0].cells.length, ids: g.querySelectorAll('[id]').length,
      orig: !!document.querySelector('.pw-tx #wide') && document.querySelectorAll('#prowi').length === 1, lock: document.body.style.overflow, focus: document.activeElement.className, close: g.querySelector('.pw-txd__close').getAttribute('aria-label'),
      w: Math.round(r.width), sticky: getComputedStyle(t.rows[0].cells[1]).position, exp: document.querySelector('.pw-tx__btn').getAttribute('aria-expanded'), y: scrollY, inView: r.top >= 0 && r.bottom <= innerHeight }; });
  is([d.hidden, d.role, d.modal, d.name], [false, 'dialog', 'true', 'Comparison: four ways'], 'dialog: role, aria-modal, named after the section heading');
  is([d.rows, d.cols, d.ids, d.orig], [4, 5, 0, true], 'dialog holds a copy without ids; the table itself stays in the article');
  is([d.lock, d.focus, d.close, d.exp], ['hidden', 'pw-txd__close', 'Close table', 'true'], 'page scroll locked, focus on the close button');
  is([d.w, d.sticky, d.y, d.inView], [1200, 'sticky', y0, true], '1200 px wide at 1440, sticky header row, page did not move');
  is(await p.evaluate(() => window.__ev.filter(e => e[0] === 'Table expanded')), [['Table expanded', { path: new URL(p.url()).pathname, table: 1 }]], 'Plausible: Table expanded with path and table number');
  // focus trap: Tab and Shift+Tab stay in the dialog
  const seen = new Set();
  for (let i = 0; i < 6; i++) { await p.keyboard.press('Tab'); seen.add(await p.evaluate(() => document.activeElement.closest('.pw-txd__panel') ? document.activeElement.className || document.activeElement.tagName : 'OUTSIDE')); }
  for (let i = 0; i < 3; i++) { await p.keyboard.press('Shift+Tab'); seen.add(await p.evaluate(() => document.activeElement.closest('.pw-txd__panel') ? 'in' : 'OUTSIDE')); }
  yes(!seen.has('OUTSIDE') && seen.has('pw-txd__close') && seen.has('pw-txd__body'), 'Tab cycles between the close button and the table, never out');
  await p.keyboard.press('Escape');
  is(await p.evaluate(() => [document.querySelector('.pw-txd').hidden, document.body.style.overflow, document.activeElement === document.querySelector('.pw-tx__btn'), document.querySelector('.pw-tx__btn').hasAttribute('aria-expanded'), scrollY]),
    [true, '', true, false, y0], 'Esc closes, unlocks the page and returns focus to the button');
  // keyboard: Enter on the focused button opens, close button closes
  await p.keyboard.press('Enter');
  is(await p.evaluate(() => document.querySelector('.pw-txd').hidden), false, 'Enter on the button opens the dialog');
  await p.keyboard.press('Enter'); // focus is on the close button
  is(await p.evaluate(() => document.querySelector('.pw-txd').hidden), true, 'Enter on the close button closes it');
  // backdrop click closes; third table: links kept
  await p.locator('.pw-tx__btn').nth(2).click();
  is(await p.evaluate(() => [...document.querySelectorAll('.pw-txd a')].map(a => a.getAttribute('href'))), ['https://example.test/x', '#sec'], 'links are kept in the copy');
  is(await p.evaluate(() => document.querySelector('.pw-txd__panel').getAttribute('aria-label')), 'Example plan', 'named after the nearest heading above the table');
  await p.mouse.click(8, 8);
  is(await p.evaluate(() => document.querySelector('.pw-txd').hidden), true, 'a click on the backdrop closes it');
  is(await p.evaluate(() => window.__ev.filter(e => e[0] === 'Table expanded').map(e => e[1].table)), [1, 1, 3], 'one event per opening, with the table number');
  await p.context().close();

  // --- DA, phone-wide column (350 px): scroll inside the card, first column kept, last column reachable
  p = await open('da', { w: 350 }, 390);
  s = await p.evaluate(() => { const c = document.querySelector('.pw-tx'), sc = c.querySelector('.pw-tx__scroll'), t = c.querySelector('table'), r0 = t.rows[0];
    const out = { cls: c.className, label: c.querySelector('.pw-tx__btn').getAttribute('aria-label'), tab: sc.getAttribute('tabindex'), role: sc.getAttribute('role'), name: sc.getAttribute('aria-label'), pageW: document.documentElement.scrollWidth, hint: c.querySelector('.pw-tx__hint').textContent,
      fadeR: getComputedStyle(c.querySelector('.pw-tx__fade--r')).opacity, two: document.querySelectorAll('.pw-tx')[1].className };
    sc.scrollLeft = 99999; const last = r0.cells[4].getBoundingClientRect(), first = r0.cells[0].getBoundingClientRect(), cr = c.getBoundingClientRect();
    out.lastIn = last.right <= cr.right + 1 && last.left >= cr.left; out.firstStuck = Math.abs(first.left - cr.left) <= 1.5; out.max = sc.scrollLeft; return out; });
  if (process.env.DBG) console.log(s);
  yes(/pw-tx--over/.test(s.cls) && /pw-tx--stick/.test(s.cls) && /pw-tx--r/.test(s.cls), 'phone: the 5-column table scrolls inside its card');
  is([s.label, s.tab, s.role, s.name, s.hint], ['Udvid tabel', '0', 'region', 'Tabel, kan rulles sidelæns', 'Rul →'], 'DA labels; the scroll box is focusable and named');
  yes(s.max > 0 && s.lastIn && s.firstStuck, 'scrolled to the end: last column fully in view, first column still in place');
  is(s.fadeR, '1', 'fade on the right while there is more');
  is(s.pageW, 390, 'the page itself never scrolls sideways');
  yes(!/pw-tx--over/.test(s.two) && !/pw-tx--btn/.test(s.two), 'the 2-column table simply fits (no 480 px minimum, no button)');
  await p.waitForTimeout(80);
  is(await p.evaluate(() => { const c = document.querySelector('.pw-tx'); return [c.classList.contains('pw-tx--r'), c.classList.contains('pw-tx--l'), c.classList.contains('pw-tx--seen'), getComputedStyle(c.querySelector('.pw-tx__fade--r')).opacity]; }), [false, true, true, '0'], 'at the end: right fade off, hint retired');
  await p.locator('.pw-tx__btn').first().click();
  d = await p.evaluate(() => { const pn = document.querySelector('.pw-txd__panel'), r = pn.getBoundingClientRect(), bx = pn.querySelector('.pw-txd__body'), t = bx.querySelector('table');
    return { full: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], x: bx.scrollWidth > bx.clientWidth, oy: getComputedStyle(bx).overflowY, ox: getComputedStyle(bx).overflowX, first: getComputedStyle(t.rows[1].cells[0]).position, close: pn.querySelector('.pw-txd__close').getAttribute('aria-label') }; });
  is(d.full, [0, 0, 390, 900], 'phone: the dialog is full screen');
  is([d.x, d.ox, d.oy, d.first, d.close], [true, 'auto', 'auto', 'sticky', 'Luk tabel'], 'phone dialog: scrolls on both axes, first column sticky, DA close label');
  await p.context().close();

  // --- off switch, and a body without tables
  p = await open('en', { off: true });
  is(await p.evaluate(() => [document.querySelectorAll('.pw-tx').length, !!document.getElementById('pw-tx-css')]), [0, false], 'data-no-table-expand: nothing is touched');
  await p.context().close();
  p = await open('en', { none: true });
  is(await p.evaluate(() => [document.querySelectorAll('.pw-tx,.pw-txd').length, !!document.getElementById('pw-tx-css'), !!document.querySelector('.pw-post__body table')]), [0, false, false], 'no table: no wrapper, no CSS (and the loader does not fetch the chunk)');
  await p.context().close();
  await b.close();
  is(errors, [], 'no page or console errors');
  console.log('tables: ' + n + ' checks pass');
})().catch(e => { console.error(e); process.exit(1); });
