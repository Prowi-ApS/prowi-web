// In-page contents module (src/tools/contents.js, v1.25.57): pure helpers, and proof that it stays off every page type
// it is not for (Insider posts, glossary, integrations, business types, landing pages). The sidebar list, the tab strip
// and the widths 360-1500 are checked in headless Chromium against the template fixtures (release notes of v1.25.57).
// Run: npm test   (plain Node, no dependencies)
const assert = require('assert');
const fs = require('fs'), path = require('path');
const C = require('../src/tools/contents.js');
const { makeDoc } = require('./_dom');
let n = 0;
const is = (a, b, msg) => { assert.deepStrictEqual(a, b, msg); n++; };
const yes = (c, msg) => { assert.ok(c, msg); n++; };

// ---- grid tracks from a computed grid-template-columns value
is(C.trackCount('315.734px 315.734px 315.734px'), 3, 'three tracks');
is(C.trackCount('430.094px 430.094px'), 2, 'two tracks');
is(C.trackCount('310px 0px'), 2, 'collapsed / implicit 0px track still counts');
is(C.trackCount('[full-start] 200px [main] 640px [end]'), 2, 'line names ignored');
is(C.trackCount('none'), 0, 'not a grid');
is(C.trackCount('repeat(auto-fit, minmax(min(100%, 280px), 1fr))'), 0, 'unresolved value: no px tracks');
// ---- the article's span
is(C.spanOf('span 2', 'auto'), 2, 'span 2');
is(C.spanOf('auto', 'span 3'), 3, 'span on the end line');
is(C.spanOf('auto', 'auto'), 1, 'auto');
is(C.spanOf('2', '4'), 2, 'explicit lines');
// ---- the decision: a column only when there is a track for the sidebar next to the article
is(C.isColumn(3, 2), true, 'story at 1440: 3 tracks, article spans 2 -> sidebar column');
is(C.isColumn(2, 2), false, 'story at 992-1076: 2 tracks -> no column (the overlap case)');
is(C.isColumn(2, 1), true, 'post-like layout 200px + 1fr');
is(C.isColumn(1, 1), false, 'single column');
is(C.besideRects({ left: 0, right: 300, width: 300 }, { left: 340, right: 1000, width: 660 }), true, 'boxes side by side');
is(C.besideRects({ left: 0, right: 300, width: 300 }, { left: 0, right: 680, width: 680 }), false, 'boxes stacked');
is(C.besideRects({ left: 0, right: 0, width: 0 }, { left: 0, right: 680, width: 680 }), false, 'hidden sidebar');
// ---- anchors
is(C.slug('Men et dealstadie blev omdøbt, og tallet var forkert i to uger'), 'men-et-dealstadie-blev-omdoebt-og-tallet-var-forkert-i-to-uger', 'Danish letters');
is(C.slug('Så de erstattede kæden'), 'saa-de-erstattede-kaeden', 'å æ');
is(C.slug('Every startup has a founder’s commission spreadsheet'), 'every-startup-has-a-founder-s-commission-spreadsheet', 'curly apostrophe');
yes(C.slug('x'.repeat(200)).length <= 64, 'slug capped');
is(C.slug('“ ”'), '', 'nothing usable');
const H = t => ({ id: '', textContent: t });
const hs = [H('Same title'), H('Same title'), { id: 'kept', textContent: 'Has id' }, H('“”')];
is(C.assignIds(hs, null, 'case-sec'), ['same-title', 'same-title-2', 'kept', 'case-sec-4'], 'unique ids, existing id kept, fallback');
is(C.num(0), '01', '01'); is(C.num(9), '10', '10');
// ---- labels (as on posts)
is(C.L.da.contents, 'Indhold', 'da label'); is(C.L.en.contents, 'Contents', 'en label');
const PAGE = fs.readFileSync(path.join(__dirname, '..', 'src', 'page.js'), 'utf8');
yes(PAGE.indexOf('"Indhold": "Contents"') > -1, 'same pair as the post sidebar label translation in page.js');
is(C.TEMPLATES[0].label, '.pw-case__aside-label', 'story label element');

// ---- scope: which layouts the module handles, and nothing else
is(C.TEMPLATES.map(t => t.key), ['case', 'model'], 'customer stories (contents) + commission models (un-stick only)');
is(C.TEMPLATES.map(t => !!t.contents), [true, false], 'only stories get contents (sidebar list + tab strip)');
const roots = C.TEMPLATES.map(t => t.root);
const build = fs.readFileSync(path.join(__dirname, '..', 'build.py'), 'utf8');
yes(/'contents':\['\.pw-case__story','\.pw-model__body'\]/.test(build), 'build.py loads the chunk only on story / model layouts');
const man = JSON.parse(/window\.__PW_CHUNKS = (\{.*?\});\n/.exec(fs.readFileSync(path.join(__dirname, '..', 'dist', 'prowi-2026.js'), 'utf8'))[1]);
is(man['tool:contents'] && man['tool:contents'].s, '.pw-case__story,.pw-model__body', 'built manifest: same roots');
// other templates' layout classes (from the Webflow element trees) never match a contents root
const OTHER = {
  post: ['pw-post__layout', 'pw-post__aside', 'pw-post__article', 'pw-post__body'],
  glossary: ['pw-term__grid', 'pw-term__aside', 'pw-term__article', 'pw-term__body'],
  integration: ['pw-int__body', 'pw-int__aside', 'pw-int__article', 'pw-int__longform'],
  businessType: ['pw-type__more-inner', 'pw-type__longform'],
  compare: ['pw-vs', 'pw-vs__table', 'pw-post__body'],
  landing: ['pw-root', 'pw-page', 'pw-hero', 'pw-section']
};
for (const k in OTHER) for (const cls of OTHER[k]) yes(roots.indexOf('.' + cls) < 0, k + ': ' + cls + ' is not a contents root');
// run() on those pages: no style, no attribute, no button, no dialog
for (const k in OTHER) {
  for (const lang of ['da', 'en']) {
    const doc = makeDoc(lang, {});
    let parent = doc.body;
    OTHER[k].forEach(cls => { const e = doc.createElement(cls.indexOf('aside') > -1 ? 'aside' : 'div'); e.className = cls; parent.appendChild(e); parent = e; });
    const before = JSON.stringify(doc.documentElement.querySelectorAll('div,aside,style,button').map(e => [e.tagName, e.className]));
    C.run(doc, doc.defaultView);
    const after = JSON.stringify(doc.documentElement.querySelectorAll('div,aside,style,button').map(e => [e.tagName, e.className]));
    is(after, before, k + ' (' + lang + '): DOM untouched');
    is(doc.getElementById('pw-contents-css'), null, k + ' (' + lang + '): no CSS injected');
  }
}
// switched off for a page
{
  const doc = makeDoc('da', {}); doc.body.setAttribute('data-no-contents', '');
  const s = doc.createElement('div'); s.className = 'pw-case__story'; doc.body.appendChild(s);
  C.run(doc, doc.defaultView);
  is(s.getAttribute('data-pw-cnt'), null, 'data-no-contents switches it off');
}
// the CSS only acts under the layout state the module sets (desktop look untouched while the sidebar is a column)
yes(/\[data-pw-cnt="stacked"\] \.pw-cnt-hide\{display:none!important\}/.test(C.CSS), 'sidebar hidden only when stacked');
yes(/\[data-pw-cnt="stacked"\] \.pw-cnt-unstick\{position:static!important/.test(C.CSS), 'un-stuck only when stacked');
yes(/\.pw-ptoc\.pw-ptoc--off\{display:none\}/.test(C.CSS), 'tab strip off unless stacked');
// sidebar list rules are scoped to the story sidebar, so they can never restyle the post contents list
yes(C.CSS.split('}').filter(r => /pw-post__toc/.test(r)).every(r => r.replace(/^@media[^{]*\{/, '').split('{')[0].split(',').every(x => /^(\[data-pw-cnt="side"\] )?\.(pw-case__aside|pw-cnt-railed) /.test(x.trim()))), 'post contents classes only under the story sidebar (.pw-case__aside / .pw-cnt-railed)');
yes(/\[data-pw-cnt="side"\] \.pw-cnt-railed \.pw-post__toc-item,\[data-pw-cnt="side"\] \.pw-cnt-railed \.pw-post__toc-item--on\{border-left-color:transparent\}/.test(C.CSS), 'rules on the rail only in side mode and only when aligned');
yes(/margin-left:calc\(-1 \* var\(--pw-cnt-dx,0px\)\)/.test(C.CSS) && !/--pw-toc-dx/.test(C.CSS), 'own offset variable, never the posts\' --pw-toc-dx');
yes(!/\.pw-post__(layout|aside|body|article)|\.pw-term|\.pw-int|\.pw-type/.test(C.CSS), 'no rules for other templates');
// the tab strip CSS is the post template's (page code head, 2026-10-27), only without its media query
const POST_STRIP = ['.pw-ptoc__tab{flex:none;display:flex;align-items:baseline;gap:8px;max-width:80vw;padding:14px 18px;',
  '.pw-ptoc__tab--on{background:linear-gradient(90deg,rgba(76,57,202,.18) var(--p,0%),rgba(76,57,202,.06) var(--p,0%));color:var(--_prowi---pw-dark-purple,#110663);font-weight:500}',
  '.pw-ptoc--on{opacity:1;visibility:visible;transform:none;transition:opacity 200ms,transform 200ms}'];
POST_STRIP.forEach(r => yes(C.CSS.indexOf(r) > -1, 'strip rule as on posts: ' + r.slice(0, 40)));

console.log('contents: ' + n + ' checks pass');
