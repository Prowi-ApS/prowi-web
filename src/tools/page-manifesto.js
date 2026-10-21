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
      '[data-mf-root] [data-mf-dots-sticky]{top:calc(50svh - 24px)}' +
      '[data-mf-root] [data-mf-dots-sticky] > *{will-change:transform}' +
      '[data-mf-root] [data-mf-dot]{position:absolute;left:0;top:0;width:12px;height:12px;border-radius:3.5px;box-sizing:border-box;border:1px solid rgba(17,6,99,0.22);background:#FFFFFF;transition:background 260ms ease,border-color 260ms ease;will-change:transform,opacity,filter}' +
      '[data-mf-root] [data-mf-curtain]{height:100lvh;opacity:1;display:none}' +
      '[data-mf-root] [data-mf-tiles]{position:absolute;left:0;top:0;width:100%;height:calc(100lvh + 160px);pointer-events:none;display:none}' +
      // the footer after the manifesto continues the dark close (it sits above the curtain)
      '.pw-mf[data-mf-ready] ~ .pw-footer{z-index:3;background:#15087B;box-shadow:0 0 0 100vmax #15087B;clip-path:inset(0 -100vmax);color:rgba(255,255,255,0.72)}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__col-title,.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__ticker-word{color:#FFFFFF}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__link,.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__brand{color:rgba(255,255,255,0.72)}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__link:hover{color:#FFFFFF}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__bottom,.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__social-link{color:rgba(255,255,255,0.6);border-color:rgba(255,255,255,0.14)}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__ticker-word::before{filter:invert(1) brightness(2)}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__wordmark-svg g[fill="#FFFFFF"],.pw-mf[data-mf-ready] ~ .pw-footer .pw-footer__wordmark-svg [fill="#FFFFFF"]{fill:rgba(255,255,255,0.07)}' +
      '.pw-mf[data-mf-ready] ~ .pw-footer svg [fill="#110663"]{fill:#FFFFFF}' +
      // iOS Safari tints its toolbar with the body colour: use the curtain's rendered colour (#110663 under the grain)
      'body.pw-mf-dark{background-color:#15087B}' +
      '[data-mf-root][data-mf-full]{background-color:#15087B}' +
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

  /* ---------- tiles: the transition into the close ---------- */
  var tiles = null, tctx = null, tW = 0, tH = 0, tDpr = 1;
  if (curtain && curtain.parentNode) {
    tiles = d.createElement('canvas'); tiles.setAttribute('data-mf-tiles', '1'); tiles.setAttribute('aria-hidden', 'true');
    curtain.parentNode.insertBefore(tiles, curtain.nextSibling);
    tctx = tiles.getContext('2d');
  }
  var hash = function (i, j) { var x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
  var lerp = function (a, b, t) { return Math.round(a + (b - a) * t); };
  // rounded squares (all the same shape) sweep up from the bottom, violet and small first, growing and darkening. In each
  // column the squares that have finished melt into a solid dark base from their middle down, so the dark rises as a
  // ragged skyline of squares (no straight edge). Grain is baked into the dark fill (one pattern, no extra pass).
  var darkPat = null;
  function darkFill(c) {
    if (darkPat) return darkPat;
    var n = d.createElement('canvas'); n.width = n.height = 256; var nx = n.getContext('2d');
    nx.fillStyle = 'rgb(17,6,99)'; nx.fillRect(0, 0, 256, 256);
    var im = nx.getImageData(0, 0, 256, 256), a = im.data;
    for (var k = 0; k < a.length; k += 4) { var rnd = Math.random(), g = rnd * rnd * rnd * 0.47; a[k] = Math.round(a[k] + (40 - a[k]) * g); a[k + 1] = Math.round(a[k + 1] + (20 - a[k + 1]) * g); a[k + 2] = Math.round(a[k + 2] + (255 - a[k + 2]) * g); }
    nx.putImageData(im, 0, 0); darkPat = c.createPattern(n, 'repeat') || 'rgb(17,6,99)';
    return darkPat;
  }
  var _full = null;
  function drawTiles(P) {
    // fully dark: the page behind turns dark too, so a pixel gap while Safari's bar slides never shows white
    var full = P >= 1; if (full !== _full) { _full = full; if (full) root.setAttribute('data-mf-full', '1'); else root.removeAttribute('data-mf-full'); }
    if (!tctx) return;
    if (P <= 0) { tiles.style.display = 'none'; return; }
    tiles.style.display = 'block';
    var cw = tiles.clientWidth, ch = tiles.clientHeight;
    if (cw !== tW || ch !== tH) { tW = cw; tH = ch; tDpr = Math.min(noBlur ? 1.5 : 2, w.devicePixelRatio || 1); tiles.width = Math.round(cw * tDpr); tiles.height = Math.round(ch * tDpr); }
    var c = tctx; c.setTransform(tDpr, 0, 0, tDpr, 0, 0); c.clearRect(0, 0, tW, tH);
    var dark = darkFill(c);
    if (P >= 1) { c.fillStyle = dark; c.fillRect(0, 0, tW, tH); return; }
    var T = Math.max(26, Math.min(44, Math.round(tW / 34))), GAP = Math.max(3, Math.round(T * 0.1)), cols = Math.ceil(tW / T) + 1, rows = Math.ceil(tH / T) + 1, WIN = 0.42;
    var ox = (tW - (cols - 1) * T) / 2 - T / 2, oy = tH - rows * T, rr = !!c.roundRect, i, j;
    // the front is a slow wave across the columns plus a little per-square jitter (no stray late squares inside the dark)
    var wave = function (i2) { return 0.5 + 0.3 * Math.sin(i2 * 0.47 + 1.3) + 0.2 * Math.sin(i2 * 1.13 + 4.1); };
    var lpAt = function (i2, j2) { var yn = 1 - (j2 + 0.5) / rows; var v = (P * (1 + WIN) - Math.min(1, yn * 0.8 + wave(i2) * 0.14 + hash(i2, j2) * 0.06)) / WIN; v = v <= 0 ? 0 : v >= 1 ? 1 : v; return v >= 0.86 ? 1 : v; };
    // finished squares join their finished neighbours (right, below, and the corner between four), so the dark grows as
    // one shape whose outer edge keeps the rounded corners; unfinished squares are still growing, violet and separate
    var F = [], allF = [];
    for (j = 0; j < rows; j++) { F[j] = []; allF[j] = true; for (i = 0; i < cols; i++) { var lv = lpAt(i, j); F[j][i] = lv; if (lv < 1) allF[j] = false; } }
    var S = T - GAP, R = S * 0.26, g0 = GAP / 2;
    c.fillStyle = dark;
    for (j = 0; j < rows; j++) {
      var y0 = oy + j * T + g0;
      if (allF[j] && (j === rows - 1 || allF[j + 1])) { c.fillRect(0, y0, tW, (j === rows - 1 ? tH - y0 + 1 : T + 0.5)); continue; }
      for (i = 0; i < cols; i++) {
        if (F[j][i] < 1) continue;
        var x0 = ox + i * T + g0;
        if (rr) { c.beginPath(); c.roundRect(x0, y0, S, S, R); c.fill(); } else c.fillRect(x0, y0, S, S);
        var rgt = i + 1 < cols && F[j][i + 1] >= 1, dn = j + 1 < rows && F[j + 1][i] >= 1;
        if (rgt) c.fillRect(x0 + S - R, y0, GAP + 2 * R, S);
        if (dn) c.fillRect(x0, y0 + S - R, S, GAP + 2 * R);
        if (rgt && dn && F[j + 1][i + 1] >= 1) c.fillRect(x0 + S - R, y0 + S - R, GAP + 2 * R, GAP + 2 * R);
      }
    }
    for (j = 0; j < rows; j++) {
      if (allF[j]) continue;
      for (i = 0; i < cols; i++) {
        var lp = F[j][i]; if (lp <= 0 || lp >= 1) continue;
        var e = 1 - Math.pow(1 - lp, 3), sz = S * (0.22 + 0.78 * e), r = sz * 0.26;
        var x = ox + i * T + (T - sz) / 2, y = oy + j * T + (T - sz) / 2;
        c.fillStyle = 'rgb(' + lerp(117, 17, e) + ',' + lerp(88, 6, e) + ',' + lerp(224, 99, e) + ')';
        if (rr) { c.beginPath(); c.roundRect(x, y, sz, sz, r); c.fill(); } else c.fillRect(x, y, sz, sz);
      }
    }
  }

  var paras = Array.prototype.map.call(root.querySelectorAll('[data-mf-lit]'), function (el) {
    return { el: el, words: Array.prototype.map.call(el.querySelectorAll('[data-mf-w]'), function (x) { return { el: x, em: x.hasAttribute('data-mf-em'), rel: 0, a: -1 }; }) };
  });
  var hero = root.querySelector('[data-mf-hero]');
  var secs = Array.prototype.slice.call(root.querySelectorAll('[data-mf-sec]'));
  var dots = Array.prototype.map.call(root.querySelectorAll('[data-mf-dot]'), function (el) {
    return { el: el, r: +el.getAttribute('data-mf-r'), c: +el.getAttribute('data-mf-c'), f: el.hasAttribute('data-mf-f'), k: '' };
  });
  var dotMargin = 0, _mo = -1, footEl = (root.parentNode && root.parentNode.querySelector('.pw-footer')) || d.querySelector('footer.pw-footer'), raf = 0, _edge = -1, _bodyDark = null, _orbRun = null, orbs = Array.prototype.slice.call(root.querySelectorAll('.pw-mf__orb-a,.pw-mf__orb-b,.pw-mf__orb-c')), _cq = -1, _dotP = -1, _dotCur = -1, _dotDark = false, _dotTop = '', revs = [], wide = (w.innerWidth || 1024) >= 720;

  // each word remembers its vertical centre relative to its paragraph, so a frame needs one rect per paragraph
  function measure() {
    dotMargin = dotsBox ? dotsBox.getBoundingClientRect().left : 0;
    paras.forEach(function (p) {
      var pr = p.el.getBoundingClientRect();
      p.words.forEach(function (x) { var r = x.el.getBoundingClientRect(); x.rel = r.top - pr.top + r.height / 2; x.a = -1; });
    });
  }
  // one reading line at 72% of the viewport: above = ink, below = dim (22% + 4px blur on desktop), smoothstep ramp.
  // Every frame reads all positions first, then writes, so the browser lays out once per frame.
  var STEPS = noBlur ? 12 : 24;
  function paint() {
    var vh = w.innerHeight || 800, DIM = 0.22, focal = vh * 0.72, ramp = Math.max(80, vh * 0.14);
    // ---- reads ----
    var inView = function (r) { return !(r.bottom < -vh || r.top > vh * 2); };
    var pTops = paras.map(function (p) { var r = p.el.getBoundingClientRect(); return inView(r) ? r.top : null; });
    var rTops = revs.map(function (o) { var r = o.el.getBoundingClientRect(); return inView(r) ? r.top + Math.min(r.height / 2, 28) : null; });
    var close = secs[secs.length - 1], ct = close ? close.getBoundingClientRect().top : 0;
    var fr = footEl ? footEl.getBoundingClientRect() : null;
    var hrTop = hero ? hero.getBoundingClientRect().top : 0;
    var secTops = secs.map(function (s2) { return s2.getBoundingClientRect().top; });
    // ---- writes ----
    paras.forEach(function (p, pi) {
      var top = pTops[pi]; if (top === null) return;
      p.words.forEach(function (x) {
        var t = reduced ? 1 : (focal - (top + x.rel)) / ramp + 0.5;
        t = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
        var q = Math.round(t * STEPS) / STEPS;
        if (q === x.a) return;
        x.a = q;
        var al = (DIM + (1 - DIM) * q).toFixed(3);
        x.el.style.color = x.em ? 'rgba(76,57,202,' + al + ')' : 'rgba(17,6,99,' + al + ')';
        if (!noBlur) x.el.style.filter = q >= 1 ? 'none' : 'blur(' + ((1 - q) * 4).toFixed(2) + 'px)';
      });
    });
    var cq = 0;
    if (close && curtain) {
      var P = (vh * 1.05 - ct) / (vh * 0.9); P = P <= 0 ? 0 : P >= 1 ? 1 : P;
      if (fr && fr.height > 0 && fr.top < vh) P = 1;
      P = Math.round(P * 400) / 400; cq = P;
      if (P !== _edge) {
        _edge = P;
        drawTiles(reduced ? (P >= 0.5 ? 1 : 0) : P);
        var mean = secs[secs.length - 2]; if (mean) { var mo = 1 - Math.max(0, Math.min(1, (P - 0.45) / 0.45)); mo = Math.round(mo * 50) / 50; if (mo !== _mo) { _mo = mo; mean.style.opacity = String(mo); } }
        var dark = P > 0.6; if (dark !== _bodyDark) { _bodyDark = dark; d.body.classList.toggle('pw-mf-dark', dark); }
        var run = P > 0; if (run !== _orbRun) { _orbRun = run; orbs.forEach(function (o) { o.style.animationPlayState = run ? 'running' : 'paused'; }); }
      }
    }
    _cq = cq;
    // reveals follow the same line as the words, both ways: a unit is ink only once the words above it are
    revs.forEach(function (o, oi) {
      var y = rTops[oi]; if (y === null) return;
      var t = reduced ? 1 : (focal - y) / ramp + 0.5;
      t = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
      var q = Math.round(t * 30) / 30;
      if (q === o.a) return;
      o.a = q;
      o.el.style.opacity = q.toFixed(3);
      o.el.style.transform = q >= 1 ? 'none' : 'translateY(' + ((1 - q) * 12).toFixed(1) + 'px)';
      o.tracks.forEach(function (h) { h.style.letterSpacing = wide ? (0.09 - 0.1 * q).toFixed(3) + 'em' : '-0.01em'; });
    });
    paintDots(vh, hrTop, secTops);
  }
  // dots: hero grid -> 3-dot section indicator in the left margin, driven by how far the hero has scrolled off
  // (moved by transform only; the sticky box itself never changes)
  function paintDots(vh, hrTop, secTops) {
    if (!hero || !dots.length) return;
    var p = reduced ? (hrTop < -40 ? 1 : 0) : Math.max(0, Math.min(1, -hrTop / (vh * 0.45)));
    p = p * p * (3 - 2 * p); p = Math.round(p * 60) / 60;
    var cur = 0; secTops.forEach(function (t, i) { if (t <= vh * 0.5) cur = i; });
    var dark = _cq > 0.5;
    if (p === _dotP && cur === _dotCur && dark === _dotDark) return;
    _dotP = p; _dotCur = cur; _dotDark = dark;
    var margin = dotMargin;
    var room = margin >= 18, colX = margin >= 72 ? -Math.min(190, margin - 36) : -(margin - 4), past = p > 0.5;
    if (dotsSticky && dotsSticky.firstElementChild) { var tv = 'translate3d(0,' + Math.round(288 * (1 - p)) + 'px,0)'; if (tv !== _dotTop) { _dotTop = tv; dotsSticky.firstElementChild.style.transform = tv; } }
    dots.forEach(function (o) {
      var x = o.c * 18 * (1 - p) + colX * p, y = o.r * 18, keep = o.c === 0 && room, op = keep ? 1 : 1 - p, bl = keep || noBlur ? 0 : p * 4, on = past && keep && o.r === cur;
      var bg = dark ? (on ? '#FFFFFF' : 'transparent') : past ? (on ? '#110663' : '#FFFFFF') : (o.f ? 'rgba(17,6,99,0.14)' : '#FFFFFF');
      var bc = dark ? (on ? '#FFFFFF' : 'rgba(255,255,255,0.38)') : on ? '#110663' : 'rgba(17,6,99,0.22)';
      var s3 = o.el.style, tr = 'translate3d(' + x.toFixed(1) + 'px,' + y + 'px,0)', ops = op.toFixed(2), fl = bl > 0.05 ? 'blur(' + bl.toFixed(1) + 'px)' : 'none';
      if (tr !== o.tr) { o.tr = tr; s3.transform = tr; }
      if (ops !== o.op) { o.op = ops; s3.opacity = ops; }
      if (fl !== o.fl) { o.fl = fl; s3.filter = fl; }
      if (bg !== o.bg) { o.bg = bg; s3.background = bg; }
      if (bc !== o.bc) { o.bc = bc; s3.borderColor = bc; }
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

  /* ---------- scroll-driven mode: where the browser supports scroll timelines, the words, reveals, the dot rail and
     the fade of the last story section are CSS animations bound to the page scroll. The browser runs them without this
     script on every frame; the script only measures (on load / resize / layout change) where each one starts and ends,
     and per frame just draws the tile canvas and flips a few classes. ---------- */
  var SDA = !reduced && !!(w.CSS && CSS.supports && CSS.supports('animation-timeline: scroll(root block)') && CSS.supports('animation-range: 0px 100px'));
  if (SDA) {
    root.setAttribute('data-mf-sda', '1');
    var css2 = d.createElement('style'); css2.id = 'pw-mf-sda';
    var TL = 'animation-timeline:scroll(root block);animation-fill-mode:both;animation-duration:1ms;animation-timing-function:';
    css2.textContent =
      '@keyframes mfW{from{color:rgba(17,6,99,0.22);filter:blur(4px)}to{color:rgb(17,6,99);filter:blur(0)}}' +
      '@keyframes mfWn{from{color:rgba(17,6,99,0.22)}to{color:rgb(17,6,99)}}' +
      '@keyframes mfWe{from{color:rgba(76,57,202,0.22);filter:blur(4px)}to{color:rgb(76,57,202);filter:blur(0)}}' +
      '@keyframes mfWen{from{color:rgba(76,57,202,0.22)}to{color:rgb(76,57,202)}}' +
      '@keyframes mfRv{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
      '@keyframes mfLs{from{letter-spacing:0.09em}to{letter-spacing:-0.01em}}' +
      '@keyframes mfOut{from{opacity:1}to{opacity:0}}' +
      '@keyframes mfRail{from{transform:translate3d(0,288px,0)}to{transform:translate3d(0,0,0)}}' +
      '@keyframes mfDot{from{transform:translate3d(var(--x0),var(--y),0);opacity:var(--o0);filter:blur(0)}to{transform:translate3d(var(--x1),var(--y),0);opacity:var(--o1);filter:blur(var(--b1))}}' +
      '[data-mf-sda] [data-mf-w]{transition:none;' + TL + 'ease-in-out;animation-name:' + (noBlur ? 'mfWn' : 'mfW') + '}' +
      '[data-mf-sda] [data-mf-w][data-mf-em]{animation-name:' + (noBlur ? 'mfWen' : 'mfWe') + '}' +
      '[data-mf-sda] [data-mf-rv]{transition:none;' + TL + 'ease-in-out;animation-name:mfRv}' +
      '[data-mf-sda] [data-mf-track]{transition:none}' +
      (wide ? '[data-mf-sda] [data-mf-track][data-mf-ls]{' + TL + 'ease-in-out;animation-name:mfLs}' : '') +
      '[data-mf-sda] [data-mf-out]{' + TL + 'linear;animation-name:mfOut}' +
      '[data-mf-sda] [data-mf-dots-sticky] > *{' + TL + 'ease-in-out;animation-name:mfRail}' +
      '[data-mf-sda] [data-mf-dot]{' + TL + 'ease-in-out;animation-name:mfDot}';
    d.head.appendChild(css2);
  }
  var docTop = function (el) { var t = 0; while (el) { t += el.offsetTop; el = el.offsetParent; } return t; };
  var stH = 0, stW = 0; var stableVH = function () { if (!stH || w.innerWidth !== stW) { stW = w.innerWidth; stH = w.innerHeight || 800; } return stH; };
  var rng = function (el, a, b) { a = Math.round(a); b = Math.max(a + 1, Math.round(b)); if (b <= 0) { el.style.animationRange = '0px 1px'; el.style.animationDelay = ''; return; } el.style.animationRange = Math.max(0, a) + 'px ' + b + 'px'; };
  function measureSDA() {
    var vh = stableVH(), focal = vh * 0.72, ramp = Math.max(80, vh * 0.14), sy = w.pageYOffset;
    // words: lit while their centre crosses the reading line
    paras.forEach(function (p) {
      p.words.forEach(function (x) { var r = x.el.getBoundingClientRect(), y = r.top + sy + r.height / 2; rng(x.el, y - focal - ramp / 2, y - focal + ramp / 2); });
    });
    // reveal units (layout position, ignoring their own slide) and their tracking
    revs.forEach(function (o) {
      var y = docTop(o.el) + Math.min(o.el.offsetHeight / 2, 28);
      rng(o.el, y - focal - ramp / 2, y - focal + ramp / 2);
      o.tracks.forEach(function (h) { h.setAttribute('data-mf-ls', '1'); rng(h, y - focal - ramp / 2, y - focal + ramp / 2); });
    });
    // the story section before the close fades as the tiles take over (P 0.45 → 0.9)
    var close = secs[secs.length - 1], mean = secs[secs.length - 2];
    if (close && mean) { var cd = docTop(close); mean.setAttribute('data-mf-out', '1'); rng(mean, cd - vh * 1.05 + 0.45 * vh * 0.9, cd - vh * 1.05 + 0.9 * vh * 0.9); }
    // dot rail: hero grid → 3-dot column while the hero scrolls its first 45% of a screen away
    if (hero && dots.length) {
      var h0 = docTop(hero), h1 = h0 + vh * 0.45, margin = dotsBox ? dotsBox.getBoundingClientRect().left : 0;
      var room = margin >= 18, colX = margin >= 72 ? -Math.min(190, margin - 36) : -(margin - 4);
      if (dotsSticky && dotsSticky.firstElementChild) rng(dotsSticky.firstElementChild, h0, h1);
      dots.forEach(function (o) {
        var keep = o.c === 0 && room, st = o.el.style;
        st.setProperty('--x0', (o.c * 18) + 'px'); st.setProperty('--x1', (keep ? colX : o.c * 18) + 'px'); st.setProperty('--y', (o.r * 18) + 'px');
        st.setProperty('--o0', '1'); st.setProperty('--o1', keep ? '1' : '0'); st.setProperty('--b1', keep || noBlur ? '0px' : '4px');
        st.transform = ''; st.opacity = ''; st.filter = '';
        rng(o.el, h0, h1);
      });
    }
  }
  // per frame in scroll-driven mode: the tile canvas, the dark page flag and the rail's active dot
  var _cur = -1, _dk = null;
  function paintSDA() {
    var vh = w.innerHeight || 800, close = secs[secs.length - 1];
    if (close && curtain) {
      var ct = close.getBoundingClientRect().top, fr = footEl ? footEl.getBoundingClientRect() : null;
      var P = (vh * 1.05 - ct) / (vh * 0.9); P = P <= 0 ? 0 : P >= 1 ? 1 : P;
      if (fr && fr.height > 0 && fr.top < vh) P = 1;
      P = Math.round(P * 400) / 400; _cq = P;
      if (P !== _edge) {
        _edge = P; drawTiles(P);
        var dk = P > 0.6; if (dk !== _bodyDark) { _bodyDark = dk; d.body.classList.toggle('pw-mf-dark', dk); }
        var run = P > 0; if (run !== _orbRun) { _orbRun = run; orbs.forEach(function (o) { o.style.animationPlayState = run ? 'running' : 'paused'; }); }
      }
    }
    if (hero && dots.length) {
      var past = hero.getBoundingClientRect().top < -vh * 0.225, cur = 0;
      secs.forEach(function (s2, i) { if (s2.getBoundingClientRect().top <= vh * 0.5) cur = i; });
      var dark = _cq > 0.5, key = cur + '|' + past + '|' + dark;
      if (key !== _dk) {
        _dk = key; var room = dotMargin >= 18;
        dots.forEach(function (o) {
          var keep = o.c === 0 && room, on = past && keep && o.r === cur;
          o.el.style.background = dark ? (on ? '#FFFFFF' : 'transparent') : past ? (on ? '#110663' : '#FFFFFF') : (o.f ? 'rgba(17,6,99,0.14)' : '#FFFFFF');
          o.el.style.borderColor = dark ? (on ? '#FFFFFF' : 'rgba(255,255,255,0.38)') : on ? '#110663' : 'rgba(17,6,99,0.22)';
        });
      }
    }
  }
  if (SDA) {
    // clear the inline states the JS mode would have set, then hand over to the browser
    revs.forEach(function (o) { o.el.style.opacity = ''; o.el.style.transform = ''; o.tracks.forEach(function (h) { h.style.letterSpacing = ''; }); });
    paras.forEach(function (p) { p.words.forEach(function (x) { x.el.style.color = ''; x.el.style.filter = ''; }); });
    paint = function () { paintSDA(); };
    var _m = measure; measure = function () { _m(); measureSDA(); };
    if (w.ResizeObserver) { var roT = 0, lastH = 0; new ResizeObserver(function () { var hh = root.offsetHeight; if (Math.abs(hh - lastH) < 2) return; lastH = hh; clearTimeout(roT); roT = setTimeout(function () { measure(); _edge = -1; paint(); }, 150); }).observe(root); }
  }

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
  w.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { _dotP = -1; _edge = -1; measure(); paint(); }, 120); });
  measure();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { measure(); paint(); });
  paint();
})();
