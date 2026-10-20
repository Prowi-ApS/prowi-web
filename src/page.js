/* ---- Page behaviour: ported from Prowi Homepage.dc.html (Claude Design) to the Webflow DOM ---- */
(function () {
  'use strict';
  var d = document, w = window;
  var root = d.querySelector('.pw-root'); if (!root) return;
  var LANG = ((d.documentElement.getAttribute('lang') || 'da').toLowerCase().indexOf('en') === 0) ? 'en' : 'da';
  var DA = LANG === 'da';
  var EASE = 'cubic-bezier(0.2,0.6,0.2,1)', EM = 'cubic-bezier(0.2,0.8,0.2,1)', SPRING = 'cubic-bezier(0.3,1.25,0.5,1)';
  var REDUCED = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Webflow suffixes a class with "-1" when the same name is created twice (e.g. the platform rail marker is
  // .pw-1xbspa4-1 on the live page). Every .pw-xxx in a selector therefore also matches .pw-xxx-1.
  var SUPPORTS_IS = (function () { try { d.querySelector(':is(a)'); return true; } catch (e) { return false; } })();
  var tol = function (sel) { return SUPPORTS_IS ? sel.replace(/\.(pw-[a-z0-9-]*[a-z0-9])(?![a-z0-9-])/g, function (m, c) { return /-1$/.test(c) ? m : ':is(.' + c + ',.' + c + '-1)'; }) : sel; };
  var q = function (sel, el) { return (el || d).querySelector(tol(sel)); };
  var qa = function (sel, el) { return Array.prototype.slice.call((el || d).querySelectorAll(tol(sel))); };
  var vw = function () { return d.documentElement.clientWidth || w.innerWidth; };
  var vh = function () { return w.innerHeight || d.documentElement.clientHeight || 800; };
  var raf = w.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  // scroll may happen on the window or on an inner scroll container (embeds, previews): listen to both
  var onScroll = function (fn) {
    var h = function () { raf(fn); };
    w.addEventListener('scroll', h, { passive: true });
    d.addEventListener('scroll', h, { passive: true, capture: true });
  };
  var tween = function (ms, fn, ease, delay) {
    var t0 = performance.now() + (delay || 0);
    var step = function (now) {
      var p = Math.max(0, Math.min(1, (now - t0) / ms));
      var e = ease ? ease(p) : (1 - Math.pow(1 - p, 3));
      fn(e, p);
      if (p < 1) raf(step);
    };
    raf(step);
  };
  var easeInOut = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  var easeOut4 = function (p) { return 1 - Math.pow(1 - p, 4); };
  var fmtDa = function (n) { return Math.round(n).toLocaleString('da-DK'); };
  var fmtEn = function (n) { return Math.round(n).toLocaleString('en-GB'); };
  var sceneProps = function (el, patch) {
    if (!el) return;
    var cur = {}; try { cur = JSON.parse(el.getAttribute('data-scene-props') || '{}'); } catch (e) {}
    el.setAttribute('data-scene-props', JSON.stringify(Object.assign(cur, patch)));
    if (w.__pwScenes) w.__pwScenes.setProps(el, patch);
  };
  var once = function (el, cb, threshold, rootMargin) {
    if (!el) return;
    if (!w.IntersectionObserver) { cb(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); cb(); }
    }, { threshold: threshold == null ? 0.35 : threshold, rootMargin: rootMargin || '0px' });
    io.observe(el);
  };

  /* ---------- CSS the page behaviour needs ---------- */
  var style = d.createElement('style');
  style.textContent = [
    '@keyframes pwRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    '@keyframes pwFadeIn{from{opacity:0}to{opacity:1}}',
    '@keyframes pwCharIn{0%{opacity:0;color:#46D3F7}55%{opacity:1;color:#B9F0FF}100%{opacity:1;color:inherit}}',
    '@keyframes pwLineIn{from{opacity:0;transform:translate3d(0,0.6em,0)}to{opacity:1;transform:none}}',
    '@keyframes pwMenuIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}',
    '@keyframes pwBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}',
    '@keyframes pwResProg{from{transform:scaleX(0)}to{transform:scaleX(1)}}',
    '@keyframes pwRiseA{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '.pw-embed--live{display:grid;grid-template-columns:minmax(0,1fr);justify-items:stretch;border-color:transparent;color:inherit;font-size:inherit}',
    '.pw-js [data-pw-rv]{opacity:0;transform:translateY(14px)}',
    '.pw-js [data-pw-rv].is-in{opacity:1;transform:none;transition:opacity 650ms ' + EASE + ',transform 650ms ' + EASE + '}',
    '.pw-js .pw-chip-xyqeqn{animation:pwBob 4.2s ease-in-out infinite}',
    '.pw-js .pw-chip-1px27ed{animation:pwBob 4.8s ease-in-out 0.9s infinite}',
    '.pw-js .pw-chip-12zvky8{animation:pwBob 3.9s ease-in-out 1.7s infinite}',
    '.pw-burger{display:none;align-items:center;justify-content:center;width:40px;height:40px;border:0;border-radius:8px;background:var(--_prowi---pw-bg-subtle,#F4F1FE);color:var(--_prowi---pw-dark-purple,#110663);cursor:pointer}',
    '@media (max-width:991px){.pw-burger{display:inline-flex}}',
    '.pw-menu{position:fixed;inset:0;z-index:9000;background:linear-gradient(155deg,#0C0550 0%,#1B0E80 52%,#3826A8 100%);color:#fff;display:flex;flex-direction:column;padding:clamp(16px,4vw,40px);overflow:auto;animation:pwMenuIn 320ms ' + EASE + ' both;font-family:inherit}',
    '.pw-menu__top{display:flex;justify-content:space-between;align-items:center;gap:12px}',
    '.pw-menu__close{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:0 14px 0 18px;height:40px;font:inherit;font-size:14px;font-weight:600;cursor:pointer}',
    '.pw-menu__nav{display:flex;flex-direction:column;margin:auto 0;padding:40px 0;max-width:900px}',
    '.pw-menu__nav a{font-size:clamp(32px,6vw,64px);font-weight:220;letter-spacing:-.02em;line-height:1.15;color:#fff;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.14);transition:padding-left 220ms ' + EASE + ',color 220ms;text-decoration:none}',
    '.pw-menu__nav a:hover{padding-left:16px;color:#46D3F7}',
    '.pw-menu__foot{display:flex;gap:12px;flex-wrap:wrap;align-items:center}',
    '.pw-menu__foot a{color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 18px;border-radius:12px;border:1px solid rgba(255,255,255,.25)}',
    '.pw-menu__foot a.is-cta{background:#fff;color:#110663;border-color:#fff}',
    '.pw-menu__logo svg{height:28px;width:auto;display:block}',
    'body.pw-menu-open{overflow:hidden}',
    '@media (prefers-reduced-motion:reduce){.pw-js [data-pw-rv]{opacity:1;transform:none;transition:none}.pw-js .pw-chip-xyqeqn,.pw-js .pw-chip-1px27ed,.pw-js .pw-chip-12zvky8{animation:none}}'
  ].join('\n');
  d.head.appendChild(style);
  d.documentElement.classList.add('pw-js');

  /* ---------- Routes per locale (for the burger menu + language switch) ---------- */
  var ROUTES = {
    da: { why: '#why', platform: '/platform', app: '/medarbejder-app', customers: '/kunder', pricing: '/pris', about: '/om-os', careers: '/karriere', demo: '/demo', login: 'https://app.prowi.io/login' },
    en: { why: '#why', platform: '/en/platform', app: '/en/employee-app', customers: '/en/customers', pricing: '/en/pricing', about: '/en/about-us', careers: '/en/careers', demo: '/en/demo', login: 'https://app.prowi.io/login' }
  };
  var NAVTXT = {
    da: { why: 'Hvorfor Prowi', platform: 'Platform', app: 'Sælger-app', customers: 'Kunder', pricing: 'Priser', about: 'Om os', careers: 'Karriere', login: 'Log ind', cta: 'Book demo', menu: 'Menu', close: 'Luk' },
    en: { why: 'Why Prowi', platform: 'Platform', app: 'Rep app', customers: 'Customers', pricing: 'Pricing', about: 'About', careers: 'Careers', login: 'Log in', cta: 'Book a demo', menu: 'Menu', close: 'Close' }
  };

  /* ---------- Logo: gradient id repair + hover turn ---------- */
  function logo(svg, key) {
    if (!svg) return;
    var grad = q('linearGradient', svg);
    var pieces = qa('g.pw-1fatfip', svg);
    if (grad && pieces[0]) {
      var id = 'pwlg-' + key;
      grad.setAttribute('id', id);
      // absolute reference so the gradient resolves even when the page carries a <base href>
      var ref = 'url("' + (w.location.href.split('#')[0]) + '#' + id + '")';
      var p = q('path', pieces[0]); if (p) p.setAttribute('fill', ref);
    }
    if (pieces.length < 3 || REDUCED) return;
    var moves = [[79.37, -79.37], [11.9, 115.08], [-115.1, -11.5]];
    var busy = false, t;
    var set = function (on) {
      pieces.forEach(function (g, i) {
        g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center';
        g.style.transition = 'transform 700ms ' + SPRING + (on ? '' : ' 350ms');
        g.style.transform = on ? 'translate(' + moves[i][0] + 'px,' + moves[i][1] + 'px) rotate(-180deg)' : 'translate(0px,0px) rotate(0deg)';
      });
    };
    svg.addEventListener('mouseenter', function () {
      if (busy) return; busy = true; set(true);
      clearTimeout(t); t = setTimeout(function () { set(false); setTimeout(function () { busy = false; }, 750); }, 1150);
    });
  }
  logo(q('svg.pw-euqjl6'), 'nav');
  logo(q('svg.pw-188pd8c'), 'foot');

  /* ---------- Nav: hover pill, morphing dropdown, language switch, burger ---------- */
  (function nav() {
    var bar = q('.pw-15nxiuc'), navEl = q('.pw-nav-jyzet9'); if (!bar || !navEl) return;
    var pill = q('.pw-1d24f59', navEl);
    var card = q('.pw-card-qla7m8', navEl);
    var panels = card ? qa('.pw-i3u8tj', card) : [];
    var trigs = qa(':scope > a, :scope > button', navEl);
    var ddTrigs = trigs.filter(function (t) { return t.classList.contains('pw-btn-1c1wip1'); });
    var open = -1, prev = -1, closeT;
    ddTrigs.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); if (t.tagName === 'A') t.setAttribute('href', '#'); });
    function movePill(el) {
      if (!pill) return;
      if (!el) { pill.style.opacity = '0'; pill.style.width = '0px'; return; }
      pill.style.left = el.offsetLeft + 'px'; pill.style.width = el.offsetWidth + 'px'; pill.style.opacity = '1';
    }
    function layout() {
      if (!card || open < 0) return;
      var c = panels[open]; if (!c) return;
      var tr = ddTrigs[open];
      var wdt = c.offsetWidth, hgt = c.offsetHeight;
      var barR = bar.getBoundingClientRect(), navR = navEl.getBoundingClientRect();
      var maxX = barR.right - navR.left - wdt - 20;
      var x = Math.max(-navEl.offsetLeft + 8, Math.min(tr ? tr.offsetLeft : 0, maxX));
      card.style.width = wdt + 'px'; card.style.height = hgt + 'px'; card.style.left = x + 'px';
    }
    function render() {
      if (!card) return;
      var isOpen = open >= 0, wasOpen = prev >= 0;
      card.style.visibility = (isOpen || wasOpen) ? 'visible' : 'hidden';
      card.style.transition = isOpen && wasOpen ? ('left 320ms ' + EM + ', width 320ms ' + EM + ', height 320ms ' + EM + ', opacity 160ms') : ('opacity 200ms ' + EM + ', transform 260ms ' + EM + ', left 0ms, width 0ms, height 0ms');
      card.style.opacity = isOpen ? '1' : '0';
      card.style.transform = isOpen ? 'none' : 'translateY(-8px) scale(0.98)';
      card.style.pointerEvents = isOpen ? 'auto' : 'none';
      panels.forEach(function (p, i) {
        var on = i === open;
        p.style.opacity = on ? '1' : '0';
        p.style.transform = on ? 'none' : (i < open ? 'translateX(-28px)' : 'translateX(28px)');
        p.style.transition = on ? ('opacity 220ms ' + EM + ' 60ms, transform 300ms ' + EM) : ('opacity 140ms, transform 300ms ' + EM);
        p.style.pointerEvents = on ? 'auto' : 'none';
      });
      ddTrigs.forEach(function (t, i) { t.setAttribute('aria-expanded', i === open ? 'true' : 'false'); t.style.color = i === open ? '#110663' : ''; });
      if (isOpen) layout();
    }
    function setOpen(i) { clearTimeout(closeT); prev = open; open = i; render(); }
    function scheduleClose() { clearTimeout(closeT); closeT = setTimeout(function () { prev = open; open = -1; movePill(null); render(); }, 140); }
    trigs.forEach(function (t) {
      t.addEventListener('mouseenter', function () {
        clearTimeout(closeT); movePill(t);
        var i = ddTrigs.indexOf(t);
        if (i >= 0) setOpen(i); else if (open >= 0) { prev = open; open = -1; render(); }
      });
      if (ddTrigs.indexOf(t) >= 0) {
        t.addEventListener('click', function (e) { e.preventDefault(); var i = ddTrigs.indexOf(t); if (open === i) { prev = open; open = -1; render(); } else setOpen(i); });
      }
    });
    if (card) { card.addEventListener('mouseenter', function () { clearTimeout(closeT); }); }
    navEl.addEventListener('mouseleave', scheduleClose);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open >= 0) { prev = open; open = -1; movePill(null); render(); } });
    w.addEventListener('resize', layout);

    // Language switch: roll the letters on hover, navigate to the other locale on click
    var lb = q('.pw-btn-dl0ske', bar);
    if (lb) {
      var cols = qa('.pw-1h1vmy3, .pw-cbc1e9', lb);
      var roll = function (on) { cols.forEach(function (c) { c.style.transform = on ? 'translateY(-1em)' : 'none'; }); };
      lb.addEventListener('mouseenter', function () { roll(true); });
      lb.addEventListener('mouseleave', function () { roll(false); });
      lb.setAttribute('aria-label', DA ? 'Switch to English' : 'Skift til dansk');
      var target = function () {
        var p = w.location.pathname;
        if (DA) return '/en' + (p === '/' ? '' : p) + w.location.search + w.location.hash;
        p = p.replace(/^\/en(\/|$)/, '/'); return (p || '/') + w.location.search + w.location.hash;
      };
      if (lb.tagName === 'A') lb.setAttribute('href', target());
      lb.addEventListener('click', function (e) { e.preventDefault(); w.location.href = target(); });
    }

    // Burger + full-screen menu (≤991px)
    var right = q('.pw-gg18i', bar);
    if (right) {
      var T = NAVTXT[LANG], R = ROUTES[LANG];
      var btn = d.createElement('button'); btn.type = 'button'; btn.className = 'pw-burger'; btn.setAttribute('aria-label', T.menu);
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>';
      right.appendChild(btn);
      var menu = null;
      var closeMenu = function () { if (menu) { menu.remove(); menu = null; d.body.classList.remove('pw-menu-open'); } };
      btn.addEventListener('click', function () {
        if (menu) { closeMenu(); return; }
        menu = d.createElement('div'); menu.className = 'pw-menu'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', T.menu);
        var logoSvg = q('svg.pw-euqjl6'); var logoHtml = logoSvg ? logoSvg.outerHTML.replace(/fill="#110663"/g, 'fill="#FFFFFF"').replace(/fill="url\(#[^)]*\)"/, 'fill="#FFFFFF"') : '';
        var links = ['why', 'platform', 'app', 'customers', 'pricing', 'about', 'careers'].map(function (k) { return '<a href="' + R[k] + '">' + T[k] + '</a>'; }).join('');
        menu.innerHTML = '<div class="pw-menu__top"><span class="pw-menu__logo">' + logoHtml + '</span><button type="button" class="pw-menu__close">' + T.close + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div><nav class="pw-menu__nav">' + links + '</nav><div class="pw-menu__foot"><a class="is-cta" href="' + R.demo + '">' + T.cta + '</a><a href="' + R.login + '">' + T.login + '</a></div>';
        d.body.appendChild(menu); d.body.classList.add('pw-menu-open');
        q('.pw-menu__close', menu).addEventListener('click', closeMenu);
        qa('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
      });
      d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
      w.addEventListener('resize', function () { if (vw() > 991) closeMenu(); });
    }
    // "Why Prowi" anchor → the problem section
    var why = trigs[0]; var prob = qa('section', root)[2];
    if (why && why.getAttribute('href') === '#why' && prob) prob.id = 'why';
  })();

  /* ---------- Hero: staged intro + figure parallax ---------- */
  (function hero() {
    var sec = q('section', root); if (!sec) return;
    var h1 = q('h1', sec), kick = q('.pw-link-1wca5rj', sec), sub = q('.pw-p-1p8m0wq', sec), ctas = q('.pw-zn8x3h', sec);
    var fig = q('.pw-1uzws7q', sec) || q('.pw-rcufr0', sec);
    var scene = q('.pw-embed[data-component="LiveMoment"]', sec);
    var seen = false, introDone = false;
    // figure parallax: tilts in as it scrolls up; 0 at bottom edge → 1 when its centre reaches 50% of the viewport
    var reveal = function () {
      if (!fig || REDUCED) return;
      var r = fig.getBoundingClientRect(), H = vh();
      var p = Math.max(0, Math.min(1, (H - r.top) / Math.max(1, H - (H * 0.5 - r.height / 2))));
      var e = 1 - Math.pow(1 - p, 3);
      fig.style.transformOrigin = '50% 0%';
      fig.style.transform = 'perspective(1100px) rotateX(' + ((1 - e) * 34).toFixed(2) + 'deg) translateY(' + ((1 - e) * 160).toFixed(1) + 'px) scale(' + (0.86 + 0.14 * e).toFixed(4) + ')';
      fig.style.opacity = (0.25 + 0.75 * e).toFixed(3);
      if (!seen && (r.top + r.height / 2) < H * 0.62) { seen = true; finish(); }
    };
    if (fig) { fig.style.willChange = 'transform, opacity'; }
    var timers = [];
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var finish = function () {
      if (introDone) return; introDone = true;
      timers.forEach(clearTimeout);
      [kick, sub, ctas].forEach(function (el) { if (el) { el.style.opacity = ''; el.style.animation = ''; } });
      if (h1) qa('span.pw-ch', h1).forEach(function (s) { s.style.opacity = ''; s.style.animation = ''; });
      if (sub) qa('span.pw-ln', sub).forEach(function (s) { s.style.opacity = ''; s.style.animation = ''; });
      sceneProps(scene, { hold: false });
    };
    if (REDUCED || !h1) { finish(); }
    else {
      // hold the scene until the intro has run
      sceneProps(scene, { hold: true });
      // title: wrap characters
      var chars = [];
      var wrap = function (node) {
        if (node.nodeType === 3) {
          var frag = d.createDocumentFragment();
          Array.from(node.nodeValue).forEach(function (ch) {
            if (ch === ' ' || ch === '\n') { frag.appendChild(d.createTextNode(' ')); return; }
            var s = d.createElement('span'); s.className = 'pw-ch'; s.textContent = ch; s.style.opacity = '0'; frag.appendChild(s); chars.push(s);
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1 && node.tagName !== 'BR') { Array.from(node.childNodes).forEach(wrap); }
      };
      Array.from(h1.childNodes).forEach(wrap);
      // subtitle: wrap sentences
      var lines = [];
      if (sub) {
        var tn = (function find(n) { if (n.nodeType === 3 && n.nodeValue.trim()) return n; for (var i = 0; i < n.childNodes.length; i++) { var r = find(n.childNodes[i]); if (r) return r; } return null; })(sub);
        if (tn) {
          var txt = tn.nodeValue; var sents = txt.match(/[^.!?]+[.!?]+["»]?/g) || [txt];
          var frag = d.createDocumentFragment();
          sents.forEach(function (s) { var sp = d.createElement('span'); sp.className = 'pw-ln'; sp.textContent = s.trim(); sp.style.display = 'inline-block'; sp.style.marginRight = '0.3em'; sp.style.opacity = '0'; frag.appendChild(sp); lines.push(sp); frag.appendChild(d.createTextNode(' ')); });
          tn.parentNode.replaceChild(frag, tn);
        }
      }
      if (kick) kick.style.opacity = '0';
      if (ctas) ctas.style.opacity = '0';
      var navEnd = 120 + 520 + 160;
      at(navEnd, function () { chars.forEach(function (s, i) { s.style.animation = 'pwCharIn 520ms ' + EM + ' ' + (i * 28) + 'ms both'; }); });
      var titleEnd = navEnd + chars.length * 28 + 520;
      var DUR = [760, 560, 440, 360], GAP = [340, 240, 170, 120];
      at(titleEnd - 100 + 380, function () {
        var acc = 0;
        lines.forEach(function (s, i) {
          var dur = DUR[Math.min(i, 3)];
          at(acc, function () { s.style.animation = 'pwLineIn ' + dur + 'ms ' + EM + ' both'; });
          acc += dur + GAP[Math.min(i, 3)];
        });
        at(acc + 220, function () {
          if (kick) kick.style.animation = 'pwFadeIn 500ms linear both';
          if (ctas) ctas.style.animation = 'pwRise 700ms ' + EASE + ' both';
        });
        at(acc + 800, function () { sceneProps(scene, { hold: false }); });
        at(acc + 2000, finish);
      });
    }
    reveal();
    onScroll(reveal);
    w.addEventListener('resize', reveal);
  })();

  /* ---------- Section reveals (fade + 14px rise at 94% of the viewport) ---------- */
  (function reveals() {
    var secs = qa(':scope > section', root).slice(1);
    var targets = [];
    secs.forEach(function (sec) {
      var cont = sec.firstElementChild; if (!cont) return;
      var blocks = qa(':scope > *', cont);
      blocks.forEach(function (b) {
        var kids = qa(':scope > *', b);
        // grids: reveal each cell; otherwise the block itself
        (kids.length > 1 && kids.length < 9 ? kids : [b]).forEach(function (el) { if (el.tagName === 'SECTION' || el.tagName === 'FOOTER') return; el.setAttribute('data-pw-rv', ''); targets.push(el); });
      });
    });
    // the platform panel column: each panel separately
    var col = q('.pw-17h8c7n'); if (col) { col.removeAttribute('data-pw-rv'); qa(':scope > *', col).forEach(function (p) { p.setAttribute('data-pw-rv', ''); targets.push(p); }); }
    // the footer must never be held back
    qa('footer [data-pw-rv], footer', root).forEach(function (el) { el.removeAttribute('data-pw-rv'); });
    var show = function (el) { el.classList.add('is-in'); };
    if (!w.IntersectionObserver || REDUCED) { targets.forEach(show); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (t) { io.observe(t); });
    // anything already in view at load
    var check = function () { targets.forEach(function (t) { var r = t.getBoundingClientRect(); if (r.top < vh() * 0.94 && r.bottom > 0) show(t); }); };
    check(); setTimeout(check, 400);
  })();

  /* ---------- Platform rail: active panel marker + click to scroll ---------- */
  (function rail() {
    var col = q('.pw-17h8c7n'), list = q('.pw-1p2arix'), marker = q('.pw-1xbspa4'); if (!col || !list) return;
    var panels = qa(':scope > *', col), items = qa(':scope > *', list).filter(function (el) { return el !== marker; });
    if (!panels.length || !items.length) return;
    var active = 0;
    var ON = 'pw-1jruqq2-1', OFF = 'pw-5bd4s2-1';
    var ONS = ['pw-1jruqq2', ON], OFFS = ['pw-5bd4s2', OFF];
    var paint = function () {
      items.forEach(function (it, i) {
        var on = i === active;
        ONS.forEach(function (c) { it.classList.toggle(c, on); }); OFFS.forEach(function (c) { it.classList.toggle(c, !on); });
        it.setAttribute('aria-current', on ? 'true' : 'false');
      });
      if (marker) {
        var k = items[active]; marker.style.top = k.offsetTop + 'px'; marker.style.height = k.offsetHeight + 'px'; marker.style.opacity = '1';
        // sit on the container rail's left hairline, like the design (indLeft)
        var railEl = q('.pw-rail', col.closest('section') || d);
        if (railEl && railEl.offsetWidth > 0) { var dx = railEl.getBoundingClientRect().left - list.getBoundingClientRect().left - 0.5; marker.style.left = (Math.round(dx * 2) / 2) + 'px'; }
      }
      var narrow = vw() < 1024;
      panels.forEach(function (p, i) { var inner = p.firstElementChild || p; inner.style.transition = 'opacity 500ms ' + EASE; inner.style.opacity = (narrow || i === active) ? '1' : '0.32'; });
    };
    var scan = function () {
      var H = vh(), best = -1, bestD = Infinity;
      panels.forEach(function (p, i) { var r = p.getBoundingClientRect(); var dd = Math.abs((r.top + Math.min(r.height, H) / 2) - H / 2); if (r.bottom > 0 && r.top < H && dd < bestD) { bestD = dd; best = i; } });
      if (best >= 0 && best !== active) { active = best; paint(); }
    };
    items.forEach(function (it, i) {
      it.style.cursor = 'pointer';
      it.addEventListener('click', function (ev) { ev.preventDefault(); var p = panels[i]; if (!p) return; p.style.scrollMarginTop = (vw() < 1024 ? 122 : 88) + 'px'; try { p.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { p.scrollIntoView(true); } });
    });
    paint(); scan();
    onScroll(scan);
    w.addEventListener('resize', paint);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(paint);
  })();

  /* ---------- Q4 chart: chips slide in from "next quarter", bar fills, amount counts ---------- */
  (function quarter() {
    var sec = qa(':scope > section', root)[6]; if (!sec) return;
    var amt = q('.pw-1a2ayao', sec), pct = q('.pw-q7j6jf', sec), bar = q('.pw-chip-1ru4571', sec), delta = q('.pw-gbjrr', sec), deltaAmt = q('.pw-18ncb01', sec), nextSub = q('.pw-d951eq', sec);
    var slip = [q('.pw-7e0pbz', sec), q('.pw-1kvl86r', sec), q('.pw-j3zbwd', sec)];
    if (!amt || !bar) return;
    var txt = function (el, s) { var n = (function f(x) { if (x.nodeType === 3 && x.nodeValue.trim()) return x; for (var i = 0; i < x.childNodes.length; i++) { var r = f(x.childNodes[i]); if (r) return r; } return null; })(el); if (n) n.nodeValue = s; else el.textContent = s; };
    var fmtAmt = function (v) { return DA ? fmtDa(v * 2.5) + ' kr.' : '€' + fmtEn(v); };
    var START = 412000, END = 486000, from = [84, 93, 102], to = [70, 66, 72];
    // initial state
    txt(amt, fmtAmt(START)); txt(pct, '86%'); pct.style.color = '#110663'; pct.style.transition = 'color 400ms ease';
    bar.style.width = '86%'; bar.style.background = 'linear-gradient(90deg,#B68FF8,#4C39CA)'; bar.style.transition = 'width 2600ms ' + EM + ', background 600ms ease';
    if (delta) { delta.style.opacity = '0'; delta.style.transform = 'translateY(6px)'; delta.style.transition = 'opacity 600ms ' + EM + ' 1500ms, transform 600ms ' + EM + ' 1500ms'; }
    if (nextSub) { nextSub.style.opacity = '1'; nextSub.style.transition = 'opacity 600ms ease 900ms'; }
    slip.forEach(function (c, i) { if (!c) return; c.style.left = from[i] + '%'; c.style.opacity = '0.6'; c.style.boxShadow = 'inset 0 0 0 1px rgba(17,6,99,0.14)'; c.style.transition = 'left 1100ms ' + EM + ' ' + (i * 650) + 'ms, opacity 500ms ease ' + (i * 650 + 500) + 'ms, box-shadow 500ms ease ' + (i * 650 + 500) + 'ms'; });
    if (REDUCED) { go(0); return; }
    once(sec, function () { setTimeout(function () { go(1); }, 600); }, 0.3);
    function go(anim) {
      slip.forEach(function (c, i) { if (!c) return; c.style.left = to[i] + '%'; c.style.opacity = '1'; c.style.boxShadow = '0 1px 2px rgba(17,6,99,0.06), 0 4px 10px -4px rgba(17,6,99,0.18), inset 0 0 0 1px rgba(17,6,99,0.08)'; });
      if (delta) { delta.style.opacity = '1'; delta.style.transform = 'none'; }
      if (nextSub) nextSub.style.opacity = '0.5';
      var apply = function (v) {
        var p = Math.round(v / 480000 * 100);
        txt(amt, fmtAmt(v)); txt(pct, p + '%');
        pct.style.color = p >= 100 ? '#0E8A5F' : '#110663';
        bar.style.width = Math.min(100, p) + '%';
        bar.style.background = p >= 100 ? 'linear-gradient(90deg,#4C39CA,#0E8A5F)' : 'linear-gradient(90deg,#B68FF8,#4C39CA)';
        if (deltaAmt) txt(deltaAmt, DA ? '+' + fmtDa(Math.max(0, v - START) * 2.5) + ' kr.' : '+€' + fmtEn(Math.max(0, v - START)));
      };
      if (!anim) { apply(END); return; }
      tween(2600, function (e) { apply(START + (END - START) * e); }, easeOut4, 400);
    }
  })();

  /* ---------- Results: rule chips cycle, click to pick ---------- */
  (function results() {
    var sec = qa(':scope > section', root)[7]; if (!sec) return;
    var chips = qa('.pw-1gc0p0r > *', sec), does = q('.pw-p-xhb5vf', sec), gets = q('.pw-p-1d9iysi', sec);
    if (chips.length < 2 || !does || !gets) return;
    var ROWS = { da: [["+2 % på flerårige kontrakter", "Beder om den treårige, ikke den etårige.", "Længere kontrakter. Kunder der bliver."], ["12 % over 100 % af mål", "Trækker næste deal ind i dette kvartal for at komme over stregen.", "Omsætning der lander nu, ikke næste periode."], ["Clawback ved churn inden 90 dage", "Kvalificerer hårdere. Oversælger mindre.", "Færre dårlige kunder i bøgerne."], ["SPIFF på den nye produktlinje", "Åbner med den i hver demo.", "En lancering der faktisk sælger."], ["Bonus ved betaling, ikke ved underskrift", "Følger op på fakturaen, ikke kun kontrakten.", "Penge i banken. Færre afskrivninger."]], en: [["+2% on multi-year contracts", "Ask for the three-year, not the one-year.", "Longer contracts. Customers that stay."], ["12% above 100% of target", "Pull the next deal into this quarter to cross the line.", "Revenue that lands now, not next period."], ["Clawback on churn within 90 days", "Qualify harder. Oversell less.", "Fewer bad-fit customers on the books."], ["SPIFF on the new product line", "Lead with it in every demo.", "A launch that actually sells."], ["Bonus on payment received, not signature", "Chase the invoice, not just the contract.", "Cash in the bank. Fewer write-offs."]] }[LANG];
    var ON = 'pw-btn-1msmcar', OFF = 'pw-btn-wyrlu0';
    var sel = 0, manual = false, timer = null, auto = false;
    var setText = function (el, s) { var n = (function f(x) { if (x.nodeType === 3 && x.nodeValue.trim()) return x; for (var i = 0; i < x.childNodes.length; i++) { var r = f(x.childNodes[i]); if (r) return r; } return null; })(el); if (n) n.nodeValue = s; else el.textContent = s; };
    var paint = function () {
      chips.forEach(function (c, i) {
        var on = i === sel;
        c.classList.toggle(ON, on); c.classList.toggle(OFF, !on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
        var prog = c.lastElementChild;
        if (prog && prog.getAttribute('aria-hidden') === 'true') {
          prog.className = on ? 'pw-r8kn5f' : 'pw-1ikvs9x';
          prog.style.animation = (on && auto && !manual) ? 'pwResProg 3500ms linear both' : 'none';
          prog.style.display = on && auto && !manual ? '' : 'none';
        }
      });
      var r = ROWS[sel] || ROWS[0];
      does.style.transition = gets.style.transition = 'opacity 180ms';
      does.style.opacity = gets.style.opacity = '0';
      setTimeout(function () { setText(does, r[1]); setText(gets, r[2]); does.style.opacity = gets.style.opacity = '1'; }, 180);
    };
    chips.forEach(function (c, i) {
      c.setAttribute('href', '#'); c.setAttribute('role', 'button');
      c.addEventListener('click', function (e) { e.preventDefault(); manual = true; clearInterval(timer); sel = i; paint(); });
    });
    var start = function () { if (manual || REDUCED) return; auto = true; paint(); timer = setInterval(function () { sel = (sel + 1) % ROWS.length; paint(); }, 3500); };
    once(sec, function () { setTimeout(start, 600); }, 0.3);
  })();

  /* ---------- Top performers: Jordan fills to 108% and takes first place ---------- */
  (function board() {
    var panel = qa('.pw-17h8c7n > *')[1]; if (!panel) return;
    var rows = qa('.pw-1gc0u29 > *', panel); if (rows.length < 3 || REDUCED) return;
    var marie = rows[0], jordan = rows[1], amara = rows[2];
    var THEME = { gold: ['#FFF6DB', '#FEE9A8', '#FDD65B', 'linear-gradient(90deg,#A16207,#EAB308)'], green: ['#E8FBEF', '#BBF7D0', '#86EFAC', 'linear-gradient(90deg,#027A48,#22C55E)'], purple: ['#EEEAFB', '#D9CFF6', '#B9A8EC', 'linear-gradient(90deg,#2217B7,#7C5CE6)'] };
    var theme = function (row, t) { var blobs = qa(':scope > span[aria-hidden="true"]', row).slice(0, 3); blobs.forEach(function (b, i) { b.style.background = t[i]; b.style.transition = 'background 450ms ' + EASE; }); var fill = q('.pw-chip-1dg3j6g > span', row); if (fill) { fill.style.background = t[3]; fill.style.transition = 'width 1200ms ' + EASE + ', background 450ms ' + EASE; } };
    var jFill = q('.pw-chip-1dg3j6g > span', jordan), jPct = q('.pw-grid-bti9gp', jordan);
    // initial standings: Marie 1st (gold), Amara 2nd (green), Jordan 3rd (purple, 78%)
    theme(marie, THEME.gold); theme(amara, THEME.green); theme(jordan, THEME.purple);
    if (jFill) jFill.style.width = '78%'; if (jPct) jPct.textContent = '78%';
    var list = rows[0].parentNode;
    list.insertBefore(jordan, amara.nextSibling); // order: Marie, Amara, Jordan
    once(panel, function () {
      setTimeout(function () {
        if (jFill) jFill.style.width = '100%';
        tween(1200, function (e) { if (jPct) jPct.textContent = Math.round(78 + 30 * e) + '%'; }, easeInOut);
        setTimeout(function () {
          // FLIP: Jordan moves to the top
          var before = rows.map(function (r) { return r.getBoundingClientRect().top; });
          list.insertBefore(jordan, marie);
          theme(jordan, THEME.gold); theme(marie, THEME.green); theme(amara, THEME.purple);
          rows.forEach(function (r, i) { var dy = before[i] - r.getBoundingClientRect().top; r.style.transition = 'none'; r.style.transform = 'translateY(' + dy + 'px)'; });
          raf(function () { rows.forEach(function (r) { r.style.transition = 'transform 600ms ' + EASE; r.style.transform = 'none'; }); });
        }, 1200 + 300);
      }, 250);
    }, 0.35);
  })();

  /* ---------- Getting started: cards land one after another ---------- */
  (function timeline() {
    var grid = q('.pw-grid-1o3s0ox'); if (!grid || REDUCED) return;
    var cards = qa(':scope > *', grid); cards.forEach(function (c) { c.style.opacity = '0'; });
    once(grid, function () { cards.forEach(function (c, i) { setTimeout(function () { c.style.animation = 'pwRiseA 600ms ' + EM + ' both'; c.style.opacity = ''; }, 400 + i * 700); }); }, 0.4);
  })();

  /* ---------- Footer: copyright year ---------- */
  qa('footer span, footer div', root).forEach(function (el) {
    if (el.children.length === 0 && /©\s*\d{4}/.test(el.textContent)) el.textContent = el.textContent.replace(/©\s*\d{4}/, '© ' + new Date().getFullYear());
  });
})();
