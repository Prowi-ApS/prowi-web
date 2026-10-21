/* Manifesto page (/manifestet, /en/manifesto; root [data-mf-root]). Port of manifesto.js from the design handover
   (MANIFESTO-HANDOVER.md §3–5): scroll-lit words, the dark curtain, the dot rail, principle headlines and the orb.
   Static markup is the readable resting state (all text ink, close section on dark purple), so the page works without
   this script. The script splits the [data-mf-lit] paragraphs into word spans (.pw-mf__em words stay purple), builds the
   24 dots and the grain layer, and owns all motion. Respects prefers-reduced-motion. */
(function () {
  var root = document.querySelector('[data-mf-root]');
  if (!root || root.getAttribute('data-mf-ready')) return;
  root.setAttribute('data-mf-ready', '1');
  var w = window, d = document;
  var reduced = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var EASE = 'cubic-bezier(0.2,0.8,0.2,1)', SWAY = 'cubic-bezier(0.45,0,0.55,1)';
  // touch screens: dim the unread words without the per-word blur (iOS WebKit paints colour fringes between blurred
  // inline spans, and it is the expensive part of every scroll frame)
  var noBlur = !!(w.matchMedia && w.matchMedia('(hover: none), (pointer: coarse)').matches);

  // The CTA label sits in a span inside a link block, which Webflow localization can't reach: translate it here.
  if (/^en/i.test(d.documentElement.getAttribute('lang') || '') || /^\/en(\/|$)/.test(w.location.pathname)) {
    root.querySelectorAll('[data-demo-source="manifesto"] span').forEach(function (s) {
      if (s.children.length === 0 && s.textContent.trim() === 'Oplev salgsmomentum') s.textContent = 'Discover sales momentum';
    });
  }

  if (!d.getElementById('pw-mf-css')) {
    var st = d.createElement('style');
    st.id = 'pw-mf-css';
    st.textContent =
      '@keyframes mfOrb{0%{border-radius:62% 38% 56% 44% / 42% 60% 40% 58%;transform:translate(-6%,2%) rotate(0deg) scale(1)}25%{border-radius:40% 60% 36% 64% / 58% 38% 62% 42%;transform:translate(7%,-5%) rotate(90deg) scale(1.14)}50%{border-radius:56% 44% 64% 36% / 36% 64% 42% 58%;transform:translate(4%,7%) rotate(180deg) scale(0.9)}75%{border-radius:38% 62% 46% 54% / 60% 40% 56% 44%;transform:translate(-8%,-4%) rotate(270deg) scale(1.1)}100%{border-radius:62% 38% 56% 44% / 42% 60% 40% 58%;transform:translate(-6%,2%) rotate(360deg) scale(1)}}' +
      '@keyframes mfGlow{0%,100%{opacity:0.45;transform:translate(-22%,-14%) scale(0.9)}50%{opacity:0.95;transform:translate(26%,18%) scale(1.3)}}' +
      '@keyframes mfOrbB{0%,100%{transform:translate(18%,12%) scale(0.72);opacity:0.5}50%{transform:translate(-20%,-16%) scale(0.95);opacity:0.8}}' +
      // the close section sits on the curtain once the script runs (static fallback: its own dark background)
      '[data-mf-ready] .pw-mf__close{background:transparent}' +
      '[data-mf-root] .pw-mf__h1{font-size:clamp(46px,min(7.6vw,11.5svh),112px)}' +
      '[data-mf-root] .pw-mf__hero{min-height:100svh}' +
      '[data-mf-root] [data-mf-w]{transition:color 120ms linear,filter 120ms linear}' +
      '[data-mf-root] [data-mf-dots-sticky]{top:calc(50svh + 264px)}' +
      '[data-mf-root] [data-mf-dot]{position:absolute;left:0;top:0;width:12px;height:12px;border-radius:3.5px;box-sizing:border-box;border:1px solid rgba(17,6,99,0.22);background:#FFFFFF;transition:background 260ms ease,border-color 260ms ease;will-change:transform,opacity,filter}' +
      '[data-mf-root] [data-mf-curtain]{height:calc(100lvh + 200px);opacity:1;display:none;will-change:transform;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 200px);mask-image:linear-gradient(to bottom,transparent 0,#000 200px);transform:translate3d(0,100lvh,0)}' +
      // the footer after the manifesto continues the dark close (it sits above the curtain)
      '.pw-mf[data-mf-ready] ~ .pw-footer{z-index:3;background:#110663;box-shadow:0 0 0 100vmax #110663;clip-path:inset(0 -100vmax);color:rgba(255,255,255,0.72)}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__col-title,.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__ticker-word{color:#FFFFFF}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__link,.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__brand{color:rgba(255,255,255,0.72)}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__link:hover{color:#FFFFFF}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__bottom,.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__social-link{color:rgba(255,255,255,0.6);border-color:rgba(255,255,255,0.14)}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__ticker-word::before{filter:invert(1) brightness(2)}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__wordmark-svg g[fill="#FFFFFF"],.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__wordmark-svg [fill="#FFFFFF"]{fill:rgba(255,255,255,0.07)}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer svg [fill="#110663"]{fill:#FFFFFF}' +
      'body.pw-mf-dark{background-color:#110663}' +
      '[data-mf-root] [data-mf-curtain] svg{position:absolute;inset:0;width:100%;height:100%;opacity:0.85;mix-blend-mode:overlay;pointer-events:none}' +
      '[data-mf-root] .pw-mf__orb{translate:-50% -50%;aspect-ratio:1}' +
      '[data-mf-root] .pw-mf__orb-a{filter:blur(26px);will-change:transform;animation:mfOrb 18s ' + SWAY + ' infinite}' +
      '[data-mf-root] .pw-mf__orb-b{filter:blur(18px);mix-blend-mode:screen;will-change:transform,opacity;animation:mfOrbB 13s ' + SWAY + ' infinite}' +
      '[data-mf-root] .pw-mf__orb-c{aspect-ratio:1;filter:blur(20px);will-change:transform,opacity;animation:mfGlow 9s ' + SWAY + ' infinite}' +
      '[data-mf-root] [data-mf-track]{transition:letter-spacing 160ms linear}' +
      '[data-mf-root] [data-mf-rv]{transition:opacity 160ms linear,transform 160ms linear;will-change:opacity,transform}' +
      '[data-mf-root] .pw-mf__cta:focus-visible{outline:2px solid #FFFFFF;outline-offset:3px}' +
      '@media (prefers-reduced-motion: reduce){[data-mf-root] [data-mf-anim],[data-mf-root] .pw-mf__orb-a,[data-mf-root] .pw-mf__orb-b,[data-mf-root] .pw-mf__orb-c{animation:none!important}[data-mf-root] [data-mf-w],[data-mf-root] [data-mf-track],[data-mf-root] [data-mf-dot]{transition:none!important}}';
    d.head.appendChild(st);
  }

  /* ---------- words: wrap every word of a lit paragraph; words inside .pw-mf__em light up purple ---------- */
  var mk = function (t, em) { var s = d.createElement('span'); s.setAttribute('data-mf-w', '1'); if (em) s.setAttribute('data-mf-em', '1'); s.textContent = t; return s; };
  Array.prototype.forEach.call(root.querySelectorAll('[data-mf-lit]'), function (p) {
    if (p.querySelector('[data-mf-w]')) return;
    var out = d.createDocumentFragment();
    var walk = function (node, em) {
      Array.prototype.forEach.call(node.childNodes, function (n) {
        if (n.nodeType === 3) {
          n.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) out.appendChild(d.createTextNode(' '));
            else out.appendChild(mk(part, em));
          });
        } else if (n.nodeType === 1) walk(n, em || (n.classList && n.classList.contains('pw-mf__em')));
      });
    };
    walk(p, false);
    p.textContent = '';
    p.appendChild(out);
  });

  /* ---------- dots: 3 × 8, tinted pattern ---------- */
  var PATTERN = [[0, 1, 0, 0, 1, 0, 0, 1], [1, 0, 0, 1, 0, 0, 1, 0], [0, 0, 1, 0, 0, 1, 0, 0]];
  var dotsBox = root.querySelector('[data-mf-dots]'), dotsSticky = root.querySelector('[data-mf-dots-sticky]');
  if (dotsBox && !dotsBox.querySelector('[data-mf-dot]')) {
    PATTERN.forEach(function (row, r) {
      row.forEach(function (f, c) {
        var s = d.createElement('span');
        s.setAttribute('data-mf-dot', '1'); s.setAttribute('data-mf-r', String(r)); s.setAttribute('data-mf-c', String(c)); if (f) s.setAttribute('data-mf-f', '1');
        s.style.background = f ? 'rgba(17,6,99,0.14)' : '#FFFFFF';
        s.style.transform = 'translate3d(' + c * 18 + 'px,' + r * 18 + 'px,0)';
        dotsBox.appendChild(s);
      });
    });
  }

  /* ---------- curtain grain ---------- */
  var curtain = root.querySelector('[data-mf-curtain]');
  if (curtain && !curtain.querySelector('svg')) {
    curtain.insertAdjacentHTML('beforeend', '<svg aria-hidden="true" focusable="false"><filter id="mfGrain"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"></feTurbulence><feColorMatrix type="saturate" values="0"></feColorMatrix><feComponentTransfer><feFuncA type="linear" slope="1.6" intercept="-0.2"></feFuncA></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#mfGrain)"></rect></svg>');
  }

  var paras = Array.prototype.map.call(root.querySelectorAll('[data-mf-lit]'), function (el) {
    return { el: el, words: Array.prototype.map.call(el.querySelectorAll('[data-mf-w]'), function (x) { return { el: x, em: x.hasAttribute('data-mf-em'), rel: 0, a: -1 }; }) };
  });
  var hero = root.querySelector('[data-mf-hero]');
  var secs = Array.prototype.slice.call(root.querySelectorAll('[data-mf-sec]'));
  var dots = Array.prototype.map.call(root.querySelectorAll('[data-mf-dot]'), function (el) {
    return { el: el, r: +el.getAttribute('data-mf-r'), c: +el.getAttribute('data-mf-c'), f: el.hasAttribute('data-mf-f'), k: '' };
  });
  var footEl = (root.parentNode && root.parentNode.querySelector('.pw-footer')) || d.querySelector('footer.pw-footer'), raf = 0, _edge = -1, _bodyDark = null, _orbRun = null, orbs = Array.prototype.slice.call(root.querySelectorAll('.pw-mf__orb-a,.pw-mf__orb-b,.pw-mf__orb-c')), _cq = -1, _dotP = -1, _dotCur = -1, _dotDark = false, _dotTop = '', revs = [], wide = (w.innerWidth || 1024) >= 720;

  // each word remembers its vertical centre relative to its paragraph, so a frame needs one rect per paragraph
  function measure() {
    paras.forEach(function (p) {
      var pr = p.el.getBoundingClientRect();
      p.words.forEach(function (x) { var r = x.el.getBoundingClientRect(); x.rel = r.top - pr.top + r.height / 2; x.a = -1; });
    });
  }
  // one reading line at 72% of the viewport: above = ink, below = dim (22% + 4px blur), smoothstep ramp of ~2 lines
  function paint() {
    var vh = w.innerHeight || 800, DIM = 0.22, focal = vh * 0.72, ramp = Math.max(80, vh * 0.14);
    paras.forEach(function (p) {
      var pr = p.el.getBoundingClientRect();
      if (pr.bottom < -vh || pr.top > vh * 2) return;
      p.words.forEach(function (x) {
        var t = reduced ? 1 : (focal - (pr.top + x.rel)) / ramp + 0.5;
        t = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
        var q = Math.round(t * 24) / 24;
        if (q === x.a) return;
        x.a = q;
        var al = (DIM + (1 - DIM) * q).toFixed(3);
        x.el.style.color = x.em ? 'rgba(76,57,202,' + al + ')' : 'rgba(17,6,99,' + al + ')';
        if (!noBlur) x.el.style.filter = q >= 1 ? 'none' : 'blur(' + ((1 - q) * 4).toFixed(2) + 'px)';
      });
    });
    // curtain: dark purple rises from the bottom with a soft top edge, a little ahead of the close section, until it
    // fills the screen (transform only: no repaint of the grain while scrolling)
    var close = secs[secs.length - 1], cq = 0;
    if (close && curtain) {
      var ct = close.getBoundingClientRect().top, lead = vh * 0.12;
      var edge = Math.round(Math.max(0, Math.min(vh, ct - lead)));
      if (footEl) { var fr = footEl.getBoundingClientRect(); if (fr.height > 0 && fr.top < vh) edge = 0; }
      cq = Math.round((1 - edge / vh) * 100) / 100;
      if (edge !== _edge) {
        _edge = edge;
        curtain.style.display = edge >= vh ? 'none' : 'block';
        curtain.style.transform = 'translate3d(0,' + (edge - 200) + 'px,0)';
        close.style.opacity = '1';
        var mean = secs[secs.length - 2]; if (mean) { var mo = Math.max(0, Math.min(1, (edge - vh * 0.15) / (vh * 0.45))); mean.style.opacity = mo.toFixed(2); }
        var dark = edge < vh * 0.5; if (dark !== _bodyDark) { _bodyDark = dark; d.body.classList.toggle('pw-mf-dark', dark); }
        var run = edge < vh; if (run !== _orbRun) { _orbRun = run; orbs.forEach(function (o) { o.style.animationPlayState = run ? 'running' : 'paused'; }); }
      }
    }
    _cq = cq;
    // reveal line = where the words above are half lit (reading line + half a ramp)
    // reveals follow the same line as the words, both ways: a unit is ink only once the words above it are
    revs.forEach(function (o) {
      var r = o.el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      var t = reduced ? 1 : (focal - (r.top + Math.min(r.height / 2, 28))) / ramp + 0.5;
      t = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
      var q = Math.round(t * 30) / 30;
      if (q === o.a) return;
      o.a = q;
      o.el.style.opacity = q.toFixed(3);
      o.el.style.transform = q >= 1 ? 'none' : 'translateY(' + ((1 - q) * 12).toFixed(1) + 'px)';
      o.tracks.forEach(function (h) { h.style.letterSpacing = wide ? (0.09 - 0.1 * q).toFixed(3) + 'em' : '-0.01em'; });
    });
    paintDots(vh);
  }
  // dots: hero grid -> 3-dot section indicator in the left margin, driven by how far the hero has scrolled off
  function paintDots(vh) {
    if (!hero || !dots.length) return;
    var hr = hero.getBoundingClientRect();
    var p = reduced ? (hr.top < -40 ? 1 : 0) : Math.max(0, Math.min(1, -hr.top / (vh * 0.45)));
    p = p * p * (3 - 2 * p); p = Math.round(p * 60) / 60;
    var cur = 0; secs.forEach(function (s, i) { if (s.getBoundingClientRect().top <= vh * 0.5) cur = i; });
    var dark = _cq > 0.5;
    if (p === _dotP && cur === _dotCur && dark === _dotDark) return;
    _dotP = p; _dotCur = cur; _dotDark = dark;
    var margin = dotsBox ? dotsBox.getBoundingClientRect().left : 0;
    var room = margin >= 18, colX = margin >= 72 ? -Math.min(190, margin - 36) : -(margin - 4), past = p > 0.5;
    if (dotsSticky) { var topV = 'calc(50svh + ' + Math.round(264 - 288 * p) + 'px)'; if (topV !== _dotTop) { _dotTop = topV; dotsSticky.style.top = topV; } }
    dots.forEach(function (o) {
      var x = o.c * 18 * (1 - p) + colX * p, y = o.r * 18, keep = o.c === 0 && room, op = keep ? 1 : 1 - p, bl = keep ? 0 : p * 4, on = past && keep && o.r === cur;
      var bg = dark ? (on ? '#FFFFFF' : 'transparent') : past ? (on ? '#110663' : '#FFFFFF') : (o.f ? 'rgba(17,6,99,0.14)' : '#FFFFFF');
      var bc = dark ? (on ? '#FFFFFF' : 'rgba(255,255,255,0.38)') : on ? '#110663' : 'rgba(17,6,99,0.22)';
      var k = x.toFixed(1) + '|' + op.toFixed(2) + '|' + bg + '|' + bc;
      if (k === o.k) return; o.k = k;
      var s = o.el.style;
      s.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y + 'px,0)'; s.opacity = op.toFixed(2);
      s.filter = bl > 0.05 ? 'blur(' + bl.toFixed(1) + 'px)' : 'none'; s.background = bg; s.borderColor = bc;
    });
  }

  /* ---------- reveals: each principle (its [n] number, headline and line together) and each section headline fades in
     when it reaches the reading line, so nothing below the line is ink before the words above it. Principle headlines
     also settle their tracking (wide screens only). Static markup stays visible without the script. ---------- */
  var units = [];
  Array.prototype.forEach.call(root.querySelectorAll('[data-mf-track]'), function (h) { var u = h.closest('.pw-mf__item') || h; if (units.indexOf(u) < 0) units.push(u); });
  Array.prototype.forEach.call(root.querySelectorAll('[data-mf-sec] h2'), function (h) {
    if (!h.closest('[data-mf-hero]') && secs.indexOf(h.closest('[data-mf-sec]')) !== secs.length - 1 && units.indexOf(h) < 0) units.push(h);
  });
  // every other text block in the story sections (e.g. "It means:") follows the same line, so nothing is ink below blurred text
  secs.forEach(function (sec, i) {
    if (i === secs.length - 1 || sec.closest('[data-mf-hero]')) return;
    Array.prototype.forEach.call(sec.querySelectorAll('p, h2, h3, h4, li, blockquote'), function (el) {
      if (el.hasAttribute('data-mf-lit') || el.closest('[data-mf-lit]') || el.querySelector('[data-mf-lit]')) return;
      if (units.some(function (u) { return u === el || u.contains(el) || el.contains(u); })) return;
      units.push(el);
    });
  });
  revs = units.map(function (u) {
    u.setAttribute('data-mf-rv', '1');
    return { el: u, a: -1, tracks: u.matches('[data-mf-track]') ? [u] : Array.prototype.slice.call(u.querySelectorAll('[data-mf-track]')) };
  });

  var rT = 0;
  var rafAt = 0;
  var onScroll = function () {
    var now = Date.now();
    if (raf && now - rafAt < 200) return;
    if (raf) w.cancelAnimationFrame(raf);
    rafAt = now; raf = w.requestAnimationFrame(function () { raf = 0; paint(); });
  };
  w.addEventListener('scroll', onScroll, { passive: true, capture: true });
  w.addEventListener('load', function () { measure(); _cq = -1; _edge = -1; _dotP = -1; paint(); });
  w.addEventListener('pageshow', function () { _cq = -1; _edge = -1; _dotP = -1; paint(); });
  d.addEventListener('visibilitychange', function () { if (!d.hidden) { _edge = -1; paint(); } });
  w.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { _dotP = -1; measure(); paint(); }, 120); });
  measure();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { measure(); paint(); });
  paint();
})();
