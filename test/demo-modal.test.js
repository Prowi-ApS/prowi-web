// Book demo pop-up (src/page.js demo(), hardened in v1.25.61), checked in headless Chromium against fixtures built from
// the Webflow footer component (DA markup) and the broken English markup of 2026-11-03 (labels without their inputs):
//  a) DA markup: unchanged behaviour (open in place, step 1 Webflow form submit with name + email, questions, Cal.com
//     prefill, dataLayer events), no warnings
//  b) EN labels without inputs: inputs rebuilt with the DA ids/names/types, modal opens, submit works; also with every
//     field (hidden fields, submit) gone
//  c) links to /en/demo, /en/demo-2026, /en/book-demo, absolute URLs, #demo-form open the pop-up and never navigate
//  d) on /demo and /en/demo the page CTA opens the pop-up (no auto-open without #demo-form, as before)
//  e) the language switch (header .pw-nav__lang, Webflow .w-locales-*, [hreflang]) is never a demo trigger: on /demo and
//     /en/demo it goes to the other-language demo page, elsewhere to the other-language page
//  f) no form / no pop-up markup at all: the pop-up still opens, straight on the Cal.com calendar
// Needs Playwright + a Chromium build; prints SKIP when neither is installed (the rest of npm test is plain Node).
// PW_DIST=<folder holding dist/> runs it against another build (used to show the v1.25.59 behaviour).
const http = require('http'), fs = require('fs'), path = require('path');
let chromium = null;
for (const p of ['playwright', '/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright']) {
  try { chromium = require(p).chromium; break; } catch (e) {}
}
const exe = (() => {
  const base = '/opt/pw-browsers';
  try { for (const d of fs.readdirSync(base)) { const f = path.join(base, d, 'chrome-headless-shell-linux64', 'chrome-headless-shell'); if (fs.existsSync(f)) return f; } } catch (e) {}
  return undefined;
})();
if (!chromium) { console.log('demo-modal: SKIP (playwright not installed)'); process.exit(0); }
const ROOT = process.env.PW_DIST || path.join(__dirname, '..');

const hidden = [['pw-demo-reps', 'Reps on commission'], ['pw-demo-crm', 'CRM'], ['pw-demo-source', 'Heard about Prowi'], ['pw-demo-utm-source', 'utm_source'],
  ['pw-demo-utm-medium', 'utm_medium'], ['pw-demo-utm-campaign', 'utm_campaign'], ['pw-demo-referrer', 'Referrer'], ['pw-demo-page', 'Page']]
  .map(([id, n]) => `<input class="w-input" maxlength="256" name="${n}" data-name="${n}" type="hidden" id="${id}">`).join('');
const opts = (k, a) => `<div class="pw-dm__q" data-q="${k}"><span class="pw-dm__qt" data-dm-t="q${k === 'reps' ? 1 : k === 'crm' ? 2 : 3}">?</span><div class="pw-dm__opts" role="radiogroup">` +
  a.map(o => `<a class="pw-dm__opt" data-opt="${o}" role="radio" href="#">${o}</a>`).join('') + '</div></div>';
// variant: full (DA markup) | labels (EN 2026-11-03: labels without inputs) | bare (labels only: no hidden fields, no submit) | noform | nomodal
function modal(variant) {
  if (variant === 'nomodal') return '';
  const lab = variant === 'full'
    ? `<label class="pw-demo-modal__label">Navn<input class="pw-demo-modal__input w-input" maxlength="256" name="Name" data-name="Name" placeholder="Dit navn" type="text" id="pw-demo-name" required="" autocomplete="name"></label>
       <label class="pw-demo-modal__label">Arbejdsmail<input class="pw-demo-modal__input w-input" maxlength="256" name="Email" data-name="Email" placeholder="you@company.com" type="email" id="pw-demo-email" required="" autocomplete="email"><span class="pw-demo-modal__error">Brug venligst din arbejdsmail.</span></label>`
    : `<label for="" class="pw-demo-modal__label">Name</label><label for="" class="pw-demo-modal__label">Work email<span class="pw-demo-modal__error pw-demo-modal__error">Please use your work email.</span></label>`;
  const form = variant === 'noform' ? '' : `<div class="pw-demo-modal__form-block w-form"><form id="wf-form-Book-demo" name="wf-form-Book-demo" data-name="Book demo" method="get" class="pw-demo-modal__form">
      <div class="pw-demo-modal__row">${lab}</div>${variant === 'bare' ? '' : hidden + '<input type="submit" data-wait="Sender …" class="pw-demo-modal__submit w-button" value="Book demo">'}</form>
      <div class="pw-demo-modal__done w-form-done"><div class="pw-demo-modal__done-inner"></div></div><div class="pw-demo-modal__fail w-form-fail"><div class="pw-demo-modal__fail-text">Fejl</div></div></div>`;
  const head = (n, t) => `<div class="pw-dm__head"><span class="pw-dm__badge"><span>${n}</span></span><span class="pw-dm__htext"><span class="pw-dm__htitle" data-dm-t="s${n}">${t}</span><span class="pw-dm__sum"></span></span>${n < 3 ? '<a class="pw-dm__change" data-dm-t="change" role="button" href="#">Ret</a>' : ''}</div>`;
  return `<div class="pw-demo-modal" role="dialog" aria-modal="true" aria-label="Book demo"><span class="pw-demo-modal__backdrop" aria-hidden="true"></span><div class="pw-demo-modal__panel">
  <a class="pw-demo-modal__close" aria-label="Luk" href="#">x</a><div class="pw-dm"><div class="pw-dm__grid"><div class="pw-dm__side"><span class="pw-dm__role" data-dm-t="role">Medstifter af Prowi</span></div><div class="pw-dm__steps">
   <div class="pw-dm__step" data-step="1">${head(1, 'Din arbejdsmail')}<div class="pw-dm__body pw-dm__body--form">${form}</div></div>
   <div class="pw-dm__step" data-step="2">${head(2, 'Om dit team')}<div class="pw-dm__body"><div class="pw-dm__prog"><div class="pw-dm__bar"><div class="pw-dm__bar-fill"></div></div><span class="pw-dm__count"></span></div>
     ${opts('reps', ['1–10', '11–30', '31–100', '100+'])}${opts('crm', ['HubSpot', 'Salesforce', 'Pipedrive', 'Attio', 'Other'])}${opts('src', ['HubSpot Marketplace', 'Google', 'LinkedIn'])}
     <div class="pw-dm__qnav"><a class="pw-dm__back" role="button" href="#"><span data-dm-t="back">Tilbage</span></a><a class="pw-dm__skip" data-dm-t="skip" role="button" href="#">Spring over</a></div></div></div>
   <div class="pw-dm__step" data-step="3">${head(3, 'Vælg et tidspunkt')}<div class="pw-dm__body"><div class="pw-dm__calbox"><span class="pw-dm__loading" data-dm-t="loading">Henter</span><div class="pw-dm__locked"></div><div class="pw-dm__cal" id="my-cal-inline-30min"></div></div></div></div>
  </div></div><div class="pw-dm__booked"><p class="pw-dm__bk-p"></p><a class="pw-dm__bk-back" data-dm-t="backsite" role="button" href="#">Tilbage</a></div></div></div></div>`;
}
function page(urlPath, variant) {
  const en = /^\/en(\/|$)/.test(urlPath), demoPage = /^\/(en\/)?demo$/.test(urlPath);
  const twin = demoPage ? (en ? '/demo' : '/en/demo') : (en ? '/x' : '/en/x');
  const P = en ? '/en' : '';
  return `<!doctype html><html lang="${en ? 'en' : 'da'}"><head><meta charset="utf-8">
<link rel="alternate" hreflang="${en ? 'da' : 'en'}" href="${twin}"><link rel="alternate" hreflang="${en ? 'en' : 'da'}" href="${urlPath}">
<style>.pw-demo-modal{display:none;position:fixed;inset:0;z-index:9999}.pw-demo-modal.is-open{display:flex}</style>
<script>window.__sub=null;document.addEventListener('submit',function(e){window.__sub=Array.from(new FormData(e.target).entries());});
window.__warn=[];var _w=console.warn;console.warn=function(){window.__warn.push(Array.from(arguments).join(' '));_w.apply(console,arguments);};</script></head>
<body><div class="pw-root">
<div class="pw-nav"><nav class="pw-nav__menu"></nav>
 <a class="pw-nav__lang" href="#"><span class="pw-nav__lang-first"><span class="pw-nav__lang-letter">${en ? 'EN' : 'DA'}</span></span><span class="pw-nav__lang-second"><span class="pw-nav__lang-letter">${en ? 'DA' : 'EN'}</span></span></a>
 <a id="nav-cta" class="pw-cta-close" href="${P}/demo"><span class="pw-cta__label">${en ? 'Book a demo' : 'Book demo'}</span></a></div>
<div class="w-locales-list"><a id="wf-locale" hreflang="${en ? 'da' : 'en'}" class="w-locales-item w-locales-link" href="${twin}">${en ? 'DA' : 'EN'}</a></div>
<main>
 ${demoPage ? `<section class="pw-demo"><h1 class="pw-demo__title">Demo</h1><a id="page-cta" class="pw-cta-demo" href="#demo-form"><span class="pw-cta__label"><span>Book et opkald på 30 minutter</span></span></a>
   <a id="self-cta" class="pw-cta-close" href="${urlPath}"><span class="pw-cta__label">Book</span></a></section>` : ''}
 <a id="l-path" href="${P}/demo">x</a><a id="l-2026" href="${P}/demo-2026">x</a><a id="l-book" href="${P}/book-demo">x</a>
 <a id="l-abs" href="https://www.prowi.io${P}/demo?utm_source=x">x</a><a id="l-hash" href="#demo-form">x</a>
 <a id="l-text" class="pw-cta-platform" href="/somewhere">${en ? 'Book a demo' : 'Book demo'}</a>
 <a id="l-src" href="#" data-demo-source="health-check">x</a><a id="l-other" href="${P}/pricing">Pricing</a>
</main>
<footer class="pw-footer"><a id="foot-demo" class="pw-footer__link" href="${P}/demo"><span>Book demo</span></a>${modal(variant)}</footer>
</div><script src="/dist/prowi-2026.js"></script></body></html>`;
}
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname.startsWith('/dist/')) {
    const f = path.join(ROOT, u.pathname); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': 'application/javascript; charset=utf-8' }); return fs.createReadStream(f).pipe(res);
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(page(u.pathname, u.searchParams.get('v') || (/^\/en/.test(u.pathname) ? 'labels' : 'full')));
});
let fail = 0, n = 0;
const ok = (name, c, x) => { n++; if (!c) { fail++; console.log('FAIL ' + name + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); } };

(async () => {
  await new Promise(r => srv.listen(0, r)); const B = 'http://localhost:' + srv.address().port;
  const br = await chromium.launch(exe ? { executablePath: exe } : {});
  const ctx = await br.newContext();
  await ctx.route('**/*', r => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
  const load = async (u) => {
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(B + u); await p.waitForFunction(() => document.querySelector('.pw-demo-modal') && document.querySelector('.pw-demo-modal').parentNode === document.body, null, { timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(150); return p;
  };
  const st = p => p.evaluate(() => {
    const m = document.querySelector('.pw-demo-modal'), act = document.querySelector('.pw-dm__step.is-active');
    return { open: !!m && m.classList.contains('is-open'), step: act ? act.getAttribute('data-step') : null, path: location.pathname + location.hash,
      warn: window.__warn.filter(s => s.indexOf('[prowi demo]') === 0), ev: (window.dataLayer || []).map(e => e.event) };
  });
  const calls = p => p.evaluate(() => window.Cal && window.Cal.ns && window.Cal.ns['30min'] ? Array.from(window.Cal.ns['30min'].q).map(a => Array.from(a)).filter(a => a[0] === 'inline').map(a => a[1]) : []);
  const closeM = async p => { await p.keyboard.press('Escape'); await p.waitForTimeout(300); };

  // ---- the step 1 -> 3 flow, shared by (a) and (b)
  const flow = async (p, lang, tag) => {
    await p.click('#nav-cta'); await p.waitForTimeout(200);
    let s = await st(p);
    ok(tag + ': nav CTA opens the pop-up in place', s.open && s.step === '1' && !/demo$/.test(s.path.replace(/#.*/, '')) === true, s);
    ok(tag + ': demo_open event', s.ev.includes('demo_open'), s.ev);
    const f = await p.evaluate(() => { const n = document.querySelector('#pw-demo-name'), e = document.querySelector('#pw-demo-email'), sb = document.querySelector('.pw-demo-modal form input[type="submit"]');
      return { n: n && [n.name, n.type, n.getAttribute('data-name'), n.hasAttribute('required'), n.placeholder, n.getAttribute('autocomplete'), n.closest('label') && n.closest('label').firstChild.nodeValue],
        e: e && [e.name, e.type, e.getAttribute('data-name'), e.hasAttribute('required'), e.placeholder, e.getAttribute('autocomplete'), e.closest('label') && e.closest('label').firstChild.nodeValue, !!(e.nextElementSibling && e.nextElementSibling.classList.contains('pw-demo-modal__error'))],
        sub: sb && sb.value, ids: document.querySelectorAll('#pw-demo-name').length + document.querySelectorAll('#pw-demo-email').length,
        s1: (document.querySelector('[data-dm-t="s1"]') || {}).textContent, active: document.activeElement && document.activeElement.id }; });
    const L = lang === 'da' ? { n: 'Navn', e: 'Arbejdsmail', phN: 'Dit navn', phE: 'navn@virksomhed.dk', next: 'Fortsæt', s1: 'Din arbejdsmail' } : { n: 'Name', e: 'Work email', phN: 'Your name', phE: 'name@company.com', next: 'Continue', s1: 'Your work email' };
    ok(tag + ': name input (id, name, type, not required, placeholder, label)', JSON.stringify(f.n) === JSON.stringify(['Name', 'text', 'Name', false, L.phN, 'name', L.n]), f.n);
    ok(tag + ': email input (id, name, type, required, placeholder, label, before the error)', JSON.stringify(f.e) === JSON.stringify(['Email', 'email', 'Email', true, L.phE, 'email', L.e, true]), f.e);
    ok(tag + ': one input each, submit text, step title', f.ids === 2 && f.sub === L.next && f.s1 === L.s1, f);
    // private address: blocked
    await p.fill('#pw-demo-email', 'someone@gmail.com'); await p.click('.pw-demo-modal form input[type="submit"]'); await p.waitForTimeout(100);
    s = await st(p); ok(tag + ': private email stays on step 1', s.step === '1' && !(await p.evaluate(() => window.__sub)), s);
    await p.fill('#pw-demo-name', 'Ada Test'); await p.fill('#pw-demo-email', 'ada@acme.io');
    await p.click('.pw-demo-modal form input[type="submit"]'); await p.waitForTimeout(250);
    const sub = Object.fromEntries(await p.evaluate(() => window.__sub || []));
    s = await st(p);
    ok(tag + ': step 1 form submitted with name + email + hidden fields', sub.Name === 'Ada Test' && sub.Email === 'ada@acme.io' && 'Page' in sub && 'CRM' in sub && 'utm_source' in sub && 'Referrer' in sub, sub);
    ok(tag + ': step 2 + demo_step1_done', s.step === '2' && s.ev.includes('demo_step1_done'), s);
    for (const sel of ['.pw-dm__q[data-q="reps"] .pw-dm__opt[data-opt="11–30"]', '.pw-dm__q[data-q="crm"] .pw-dm__opt[data-opt="HubSpot"]', '.pw-dm__q[data-q="src"] .pw-dm__opt[data-opt="Google"]']) { await p.click(sel); await p.waitForTimeout(380); }
    s = await st(p); const c = await calls(p);
    ok(tag + ': step 3 after the questions', s.step === '3' && s.ev.filter(e => e === 'demo_q_answered').length === 3, s);
    const cfg = c.length && c[c.length - 1].config;
    ok(tag + ': Cal.com inline prefilled (name, email, reps, crm, heardvia, notes)', cfg && cfg.name === 'Ada Test' && cfg.email === 'ada@acme.io' && cfg.reps === '11–30' && cfg.crm === 'HubSpot' && cfg.heardvia === 'Google' && /Reps on commission: 11–30/.test(cfg.notes), c);
    const hid = await p.evaluate(() => ['Reps on commission', 'CRM', 'Heard about Prowi'].map(n => document.querySelector('.pw-demo-modal input[name="' + n + '"]').value));
    ok(tag + ': hidden answer fields filled', JSON.stringify(hid) === JSON.stringify(['11–30', 'HubSpot', 'Google']), hid);
    await closeM(p); s = await st(p); ok(tag + ': Escape closes', !s.open, s);
    ok(tag + ': no page errors', !p.errs.length, p.errs);
  };

  // (a) DA markup
  let p = await load('/x');
  ok('a: DA markup -> no warnings', !(await st(p)).warn.length, (await st(p)).warn);
  await flow(p, 'da', 'a DA'); await p.close();
  // (b) EN labels without inputs (the 2026-11-03 markup), and every field gone
  for (const v of ['labels', 'bare']) {
    p = await load('/en/x?v=' + v);
    const w0 = (await st(p)).warn;
    ok('b EN ' + v + ': warns about the rebuilt fields', w0.length === 1 && /rebuilt: .*#pw-demo-name.*#pw-demo-email/.test(w0[0]) && (v === 'labels' || /#pw-demo-page.*submit/.test(w0[0])), w0);
    await flow(p, 'en', 'b EN ' + v); await p.close();
  }
  // (c) every kind of demo link opens the pop-up and never navigates
  for (const u of ['/en/x', '/x']) {
    p = await load(u);
    for (const id of ['l-path', 'l-2026', 'l-book', 'l-abs', 'l-hash', 'l-text', 'l-src', 'foot-demo', 'nav-cta']) {
      const prevented = await p.evaluate(sel => { let r = null; const h = e => { r = e.defaultPrevented; }; document.addEventListener('click', h); /* bubble: after the capture handler */ document.querySelector(sel).click(); document.removeEventListener('click', h); return r; }, '#' + id);
      await p.waitForTimeout(80); const s = await st(p);
      ok('c ' + u + ' #' + id + ': opens in place', s.open && s.path === u + (id === 'l-hash' ? '' : '') && prevented !== false, { s, prevented });
      await closeM(p);
    }
    await p.click('#l-other', { noWaitAfter: true }).catch(() => {}); await p.waitForTimeout(300);
    ok('c ' + u + ': an ordinary link still navigates', p.url().endsWith('/pricing'), p.url());
    await p.close();
  }
  // (d) the demo pages: page CTA opens the pop-up, no auto-open, #demo-form auto-opens as before
  for (const u of ['/en/demo', '/demo']) {
    p = await load(u); let s = await st(p);
    ok('d ' + u + ': no auto-open on load', !s.open, s);
    for (const id of ['page-cta', 'self-cta', 'nav-cta']) {
      await p.click('#' + id); await p.waitForTimeout(150); s = await st(p);
      ok('d ' + u + ' #' + id + ': opens the pop-up, stays on the page', s.open && s.path === u, s); await closeM(p);
    }
    ok('d ' + u + ': no page errors', !p.errs.length, p.errs); await p.close();
    p = await load(u + '#demo-form'); await p.waitForTimeout(500); s = await st(p);
    ok('d ' + u + '#demo-form: opens on arrival', s.open, s); await p.close();
  }
  // (e) language switch: never a demo trigger
  for (const [u, want] of [['/demo', '/en/demo'], ['/en/demo', '/demo'], ['/x', '/en/x'], ['/en/x', '/x']]) {
    for (const id of ['.pw-nav__lang', '#wf-locale']) {
      p = await load(u);
      const href = await p.$eval(id, a => a.getAttribute('href'));
      await Promise.all([p.waitForURL(B + want, { timeout: 3000 }).catch(() => {}), p.click(id)]);
      ok('e ' + u + ' ' + id + ' (href ' + href + '): goes to ' + want, new URL(p.url()).pathname === want, p.url());
      await p.close();
    }
  }
  // (f) no usable form / no pop-up markup: calendar straight away
  for (const v of ['noform', 'nomodal']) {
    p = await load('/en/x?v=' + v);
    await p.click('#nav-cta'); await p.waitForTimeout(200);
    const s = await st(p), c = await calls(p);
    const box = await p.evaluate(() => { const b = document.querySelector('#my-cal-inline-30min'); return !!b && document.querySelectorAll('#my-cal-inline-30min').length === 1 && !!b.closest('.pw-demo-modal'); });
    ok('f ' + v + ': opens on the calendar', s.open && (v === 'nomodal' || s.step === '3') && c.length === 1 && c[0].calLink === 'anders-goosmann/30min' && box, { s, c, box });
    ok('f ' + v + ': warned, no errors', s.warn.length >= 1 && !p.errs.length, { w: s.warn, e: p.errs });
    await p.close();
  }
  await br.close(); srv.close();
  console.log(fail ? `demo-modal: ${fail} of ${n} FAILED` : `demo-modal: ${n} checks passed`); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
