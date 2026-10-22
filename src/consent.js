/* Cookie consent (replaces Conzent). One first-party cookie "pw_consent" = "v1.s<0|1>.m<0|1>.<unix time>", 12 months,
   on .prowi.io (covers www and the bare domain). Categories: necessary (always), statistics (HubSpot analytics +
   OctoReports + Google analytics_storage), marketing (Google ad_* signals + HubSpot advertisement).
   The site head (Webflow site custom code) reads the same cookie before HubSpot/GTM load, sets
   window.disableHubSpotCookieBanner and pushes the stored state to HubSpot and Google consent mode; this file is the UI,
   the "Cookie settings" footer link and the update when a visitor chooses. HubSpot itself always loads (forms, chat);
   it only sets tracking cookies once statistics is accepted. */
(function () {
  if (window.__pwConsentUi) return; window.__pwConsentUi = true;
  var d = document, w = window, NAME = 'pw_consent';
  var EN = /^en/i.test(d.documentElement.getAttribute('lang') || '') || /^\/en(\/|$)/.test(w.location.pathname);
  var T = EN ? {
    title: 'Cookies on prowi.io',
    body: 'We use necessary cookies to make the site work. With your consent we also use cookies for statistics and marketing, so we can see how the site is used and improve it. You can change your choice at any time under Cookie settings at the bottom of the page.',
    more: 'Read more', moreHref: '/en/privacy',
    all: 'Accept all', none: 'Only necessary', custom: 'Customise', save: 'Save my choices',
    nec: 'Necessary', necP: 'Make the site work, e.g. your cookie choice and forms. Always on.',
    stat: 'Statistics', statP: 'Help us understand how the site is used (HubSpot).',
    mkt: 'Marketing', mktP: 'Used to measure and target our ads (Google).',
    always: 'Always on', link: 'Cookie settings', label: 'Cookie consent'
  } : {
    title: 'Cookies på prowi.io',
    body: 'Vi bruger nødvendige cookies til at få siden til at virke. Med dit samtykke bruger vi også cookies til statistik og marketing, så vi kan se, hvordan siden bruges, og forbedre den. Du kan altid ændre dit valg under Cookieindstillinger nederst på siden.',
    more: 'Læs mere', moreHref: '/privacy',
    all: 'Accepter alle', none: 'Kun nødvendige', custom: 'Tilpas', save: 'Gem mine valg',
    nec: 'Nødvendige', necP: 'Får siden til at virke, fx dit cookievalg og formularer. Altid aktive.',
    stat: 'Statistik', statP: 'Hjælper os med at forstå, hvordan siden bruges (HubSpot).',
    mkt: 'Marketing', mktP: 'Bruges til at måle og målrette vores annoncer (Google).',
    always: 'Altid aktive', link: 'Cookieindstillinger', label: 'Samtykke til cookies'
  };

  var read = function () {
    var m = d.cookie.match(/(?:^|;\s*)pw_consent=([^;]+)/); if (!m) return null;
    var v = decodeURIComponent(m[1]).split('.');
    if (v[0] !== 'v1') return null;
    return { s: v[1] === 's1', m: v[2] === 'm1' };
  };
  var write = function (c) {
    var host = w.location.hostname, dom = /(^|\.)prowi\.io$/.test(host) ? ';domain=.prowi.io' : '';
    d.cookie = NAME + '=' + encodeURIComponent('v1.s' + (c.s ? 1 : 0) + '.m' + (c.m ? 1 : 0) + '.' + Math.round(Date.now() / 1000)) +
      ';path=/;max-age=31536000;SameSite=Lax' + (w.location.protocol === 'https:' ? ';Secure' : '') + dom;
  };
  var octoFired = false;
  var apply = function (c, prev) {
    var g = function (x) { return x ? 'granted' : 'denied'; };
    if (typeof w.gtag === 'function') w.gtag('consent', 'update', { analytics_storage: g(c.s), ad_storage: g(c.m), ad_user_data: g(c.m), ad_personalization: g(c.m) });
    w.dataLayer = w.dataLayer || []; w.dataLayer.push({ event: 'pw_consent_update', pw_statistics: c.s, pw_marketing: c.m });
    w._hsp = w._hsp || [];
    w._hsp.push(['setHubSpotConsent', { analytics: c.s, advertisement: c.m, functionality: c.s }]);
    // withdrawn: drop HubSpot's tracking cookies
    if (prev && prev.s && !c.s) w._hsp.push(['revokeCookieConsent']);
    if (c.s && !octoFired) { octoFired = true; try { d.dispatchEvent(new CustomEvent('prowiConsentGranted')); } catch (e) {} }
  };

  var css = '#pw-cc{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:2147483000;margin:0 auto;max-width:760px;' +
    'background:#fff;color:#110663;border:1px solid rgba(17,6,99,.12);border-radius:16px;box-shadow:0 18px 50px -12px rgba(17,6,99,.28);' +
    'font:400 14px/1.5 inherit;font-family:inherit;padding:18px 20px;box-sizing:border-box;animation:pwCcIn .32s cubic-bezier(.2,.8,.2,1) both}' +
    '@keyframes pwCcIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
    '#pw-cc *{box-sizing:border-box}' +
    '#pw-cc h2{margin:0 0 6px;font-size:15px;line-height:1.35;font-weight:500;color:#110663;letter-spacing:0}' +
    '#pw-cc p{margin:0;font-size:13.5px;line-height:1.5;color:#34326C}' +
    '#pw-cc a{color:#4C39CA;text-decoration:underline;text-underline-offset:2px}' +
    '#pw-cc .pw-cc__row{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;align-items:center}' +
    '#pw-cc button{font:inherit;font-size:14px;font-weight:500;line-height:1;cursor:pointer;border-radius:999px;padding:11px 18px;min-height:40px;border:1.5px solid #4C39CA;transition:background .14s,color .14s,border-color .14s}' +
    '#pw-cc .pw-cc__yes{background:#4C39CA;color:#fff}#pw-cc .pw-cc__yes:hover{background:#110663;border-color:#110663}' +
    '#pw-cc .pw-cc__no{background:#fff;color:#4C39CA}#pw-cc .pw-cc__no:hover{background:#F4F1FE}' +
    '#pw-cc .pw-cc__more{background:none;border-color:transparent;color:#34326C;text-decoration:underline;text-underline-offset:2px;padding:11px 6px}' +
    '#pw-cc button:focus-visible{outline:2px solid #110663;outline-offset:2px}' +
    '#pw-cc .pw-cc__cats{display:none;margin-top:14px;border-top:1px solid rgba(17,6,99,.1)}#pw-cc.is-custom .pw-cc__cats{display:block}' +
    '#pw-cc.is-custom .pw-cc__more{display:none}' +
    '#pw-cc .pw-cc__cat{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(17,6,99,.1)}' +
    '#pw-cc .pw-cc__cat b{display:block;font-weight:500;font-size:14px;color:#110663}#pw-cc .pw-cc__cat span{display:block;font-size:13px;color:#6664A0;margin-top:2px}' +
    '#pw-cc .pw-cc__fixed{flex:none;font-size:12.5px;color:#1E9E6A;font-weight:500;white-space:nowrap;padding-top:2px}' +
    '#pw-cc input[type=checkbox]{flex:none;-webkit-appearance:none;appearance:none;width:40px;height:24px;border-radius:999px;background:#D9D6EA;position:relative;cursor:pointer;margin:0;transition:background .16s}' +
    '#pw-cc input[type=checkbox]::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(17,6,99,.25);transition:transform .16s}' +
    '#pw-cc input[type=checkbox]:checked{background:#4C39CA}#pw-cc input[type=checkbox]:checked::after{transform:translateX(16px)}' +
    '#pw-cc input[type=checkbox]:focus-visible{outline:2px solid #110663;outline-offset:2px}' +
    '#pw-cc .pw-cc__save{display:none}#pw-cc.is-custom .pw-cc__save{display:inline-block}' +
    '@media (max-width:560px){#pw-cc{left:10px;right:10px;padding:16px}#pw-cc .pw-cc__yes,#pw-cc .pw-cc__no,#pw-cc .pw-cc__save{flex:1 1 140px}}' +
    '@media (prefers-reduced-motion:reduce){#pw-cc{animation:none}}';

  var box = null, prevState = null;
  var close = function () { if (box) { box.remove(); box = null; } };
  var choose = function (c) { var p = read() || prevState; write(c); apply(c, p); prevState = c; close(); };
  var open = function (custom) {
    if (box) { if (custom) box.classList.add('is-custom'); return; }
    if (!d.getElementById('pw-cc-css')) { var st = d.createElement('style'); st.id = 'pw-cc-css'; st.textContent = css; d.head.appendChild(st); }
    var cur = read() || { s: false, m: false };
    box = d.createElement('div'); box.id = 'pw-cc'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', T.label);
    if (custom) box.className = 'is-custom';
    box.innerHTML = '<h2>' + T.title + '</h2><p>' + T.body + ' <a href="' + T.moreHref + '">' + T.more + '</a></p>' +
      '<div class="pw-cc__cats">' +
      '<div class="pw-cc__cat"><div><b>' + T.nec + '</b><span>' + T.necP + '</span></div><div class="pw-cc__fixed">' + T.always + '</div></div>' +
      '<label class="pw-cc__cat"><div><b>' + T.stat + '</b><span>' + T.statP + '</span></div><input type="checkbox" data-c="s"' + (cur.s ? ' checked' : '') + ' aria-label="' + T.stat + '"></label>' +
      '<label class="pw-cc__cat"><div><b>' + T.mkt + '</b><span>' + T.mktP + '</span></div><input type="checkbox" data-c="m"' + (cur.m ? ' checked' : '') + ' aria-label="' + T.mkt + '"></label>' +
      '</div><div class="pw-cc__row">' +
      '<button type="button" class="pw-cc__yes">' + T.all + '</button>' +
      '<button type="button" class="pw-cc__no">' + T.none + '</button>' +
      '<button type="button" class="pw-cc__save pw-cc__no">' + T.save + '</button>' +
      '<button type="button" class="pw-cc__more">' + T.custom + '</button></div>';
    box.querySelector('.pw-cc__yes').addEventListener('click', function () { choose({ s: true, m: true }); });
    box.querySelector('.pw-cc__no:not(.pw-cc__save)').addEventListener('click', function () { choose({ s: false, m: false }); });
    box.querySelector('.pw-cc__save').addEventListener('click', function () {
      choose({ s: box.querySelector('[data-c="s"]').checked, m: box.querySelector('[data-c="m"]').checked });
    });
    box.querySelector('.pw-cc__more').addEventListener('click', function () { box.classList.add('is-custom'); });
    d.body.appendChild(box);
  };
  w.prowiCookieSettings = function () { open(true); };

  // footer: "Cookie settings" next to the privacy link; any [data-cookie-settings] or href="#cookie-settings" also opens it
  var addLink = function () {
    var priv = Array.prototype.filter.call(d.querySelectorAll('.pw-footer a.pw-footer__link'), function (a) { return /\/privacy\/?$/.test(a.getAttribute('href') || ''); })[0];
    if (priv && !d.querySelector('[data-cookie-settings]')) {
      var a = d.createElement('a'); a.href = '#cookie-settings'; a.className = priv.className; a.setAttribute('data-cookie-settings', '');
      a.textContent = T.link; priv.parentNode.insertBefore(a, priv.nextSibling);
    }
  };
  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-settings],a[href="#cookie-settings"]');
    if (t) { e.preventDefault(); open(true); }
  });

  var start = function () {
    addLink();
    var c = read();
    if (c) { prevState = c; if (c.s) { octoFired = true; try { d.dispatchEvent(new CustomEvent('prowiConsentGranted')); } catch (e) {} } return; }
    // first visit: show after first paint so the banner never competes with the page for loading
    setTimeout(function () { open(false); }, 600);
  };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();
})();
