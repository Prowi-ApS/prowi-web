/* ---- Scene mounter: renders the Claude Design scenes into the .pw-embed placeholders ---- */
(function () {
  var SCENES = window.__PW_SCENES || {};
  var mounted = []; // {el, name, props, root}
  var registered = {};

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'da').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'da';
  }
  function ready() { return !!(window.__dcUpdate && window.getDC && window.React && window.ReactDOM); }
  function register(name) {
    if (registered[name]) return;
    var s = SCENES[name]; if (!s) return;
    window.__dcUpdate(name, 'props', s.props, false);
    window.__dcUpdate(name, 'html', s.html, true);
    window.__dcUpdate(name, 'html', s.html, false);
    window.__dcUpdate(name, 'js', s.js, false);
    registered[name] = true;
  }
  function propsFor(el, name) {
    var s = SCENES[name] || { defaults: {} };
    var p = Object.assign({}, s.defaults);
    p.lang = lang();
    if ('currency' in p) p.currency = p.lang === 'da' ? 'DKK' : 'EUR';
    // token form set in Webflow: data-scene="phone still noboard fit:Podium"
    var tok = el.getAttribute('data-scene');
    if (tok) tok.split(/\s+/).forEach(function (t) {
      if (!t) return;
      var kv = t.split(':');
      if (kv.length === 2) { p[kv[0]] = kv[1]; return; }
      if (t.indexOf('no') === 0 && (t.slice(2) in p)) { p[t.slice(2)] = false; return; }
      p[t] = true;
    });
    // JSON form set at runtime by page.js
    try {
      var raw = el.getAttribute('data-scene-props');
      if (raw) Object.assign(p, JSON.parse(raw));
    } catch (e) { /* ignore bad JSON */ }
    return p;
  }
  function render(m) {
    var C = window.getDC(m.name);
    m.root.render(window.React.createElement(C, m.props));
  }
  // Scenes used only on the platform pages live in their own files next to the bundle (dist/scenes/*.js),
  // fetched with the integrity hash recorded at build time, and mounted when the placeholder comes near the viewport.
  var LAZY = window.__PW_LAZY || {};
  var loading = {};
  function base() {
    var s = document.querySelector('script[src*="prowi-2026.js"]');
    return s ? s.src.replace(/prowi-2026\.js.*$/, '') : '';
  }
  function want(el, name) {
    if (loading[name] || !LAZY[name]) return;
    var b = base(); if (!b) return;
    loading[name] = true;
    var sc = document.createElement('script');
    sc.src = b + LAZY[name].f; sc.async = true;
    if (LAZY[name].i) { sc.integrity = LAZY[name].i; sc.crossOrigin = 'anonymous'; }
    sc.onload = function () { mountAll(); };
    sc.onerror = function () { console.error('[prowi] could not load scene ' + name); };
    document.head.appendChild(sc);
  }
  var io = window.IntersectionObserver ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.__pwNear = true; io.unobserve(e.target); mountAll(); } });
  }, { rootMargin: '300px 0px' }) : null;
  function watch(el) {
    if (el.__pwWatched) return; el.__pwWatched = true;
    if (io) io.observe(el); else { el.__pwNear = true; }
    if (!io) mountAll();
  }
  function mountAll() {
    var els = document.querySelectorAll('.pw-embed[data-component]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.__pwMounted) continue;
      var name = el.getAttribute('data-component');
      if (!SCENES[name]) { if (LAZY[name]) want(el, name); continue; }
      if (LAZY[name] && !el.__pwNear) { watch(el); continue; }
      register(name);
      el.__pwMounted = true;
      el.classList.add('pw-embed--live');
      var root = window.ReactDOM.createRoot(el);
      var m = { el: el, name: name, props: propsFor(el, name), root: root };
      mounted.push(m);
      render(m);
    }
  }
  // Public hook used by page.js (e.g. hero hold → release after the intro)
  window.__pwScenes = {
    setProps: function (el, patch) {
      for (var i = 0; i < mounted.length; i++) {
        if (mounted[i].el === el) { Object.assign(mounted[i].props, patch); render(mounted[i]); }
      }
    },
    mounted: mounted,
    loaded: function () { mountAll(); }
  };
  var tries = 0;
  (function wait() {
    if (ready()) { mountAll(); return; }
    if (++tries > 400) { console.error('[prowi] scene runtime did not initialise'); return; }
    setTimeout(wait, 25);
  })();
})();
