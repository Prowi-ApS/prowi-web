/* ---- Scene mounter: renders the Claude Design scenes into the .pw-embed placeholders ---- */
(function () {
  var SCENES = window.__PW_SCENES = window.__PW_SCENES || {}; // shared with the scene files, whichever runs first
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
  // Every scene lives in its own file next to the entry (dist/scenes/*.js), fetched by the chunk loader (src/loader.js)
  // with the integrity hash recorded at build time. Platform-page scenes (window.__PW_LAZY) mount when the placeholder
  // comes near the viewport; the others mount as soon as their file has run.
  var LAZY = window.__PW_LAZY || {};
  var loading = {};
  function want(el, name) {
    if (loading[name] || !window.__pwNeed) return;
    loading[name] = true;
    window.__pwNeed('scene:' + name, function () { mountAll(); });
  }
  var io = window.IntersectionObserver ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.__pwNear = true; io.unobserve(e.target); mountAll(); } });
  }, { rootMargin: '300px 0px' }) : null;
  function watch(el) {
    if (el.__pwWatched) return; el.__pwWatched = true;
    if (io) io.observe(el); else { el.__pwNear = true; }
    if (!io) mountAll();
  }
  // scenes off screen pause their CSS animations (blurred blobs, glows), so they cost nothing while you scroll elsewhere
  var vis = window.IntersectionObserver ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('pw-off', !e.isIntersecting); });
  }, { rootMargin: '120px 0px' }) : null;
  if (!document.getElementById('pw-off-css')) {
    var st = document.createElement('style'); st.id = 'pw-off-css';
    st.textContent = '.pw-off,.pw-off *{animation-play-state:paused!important}';
    document.head.appendChild(st);
  }
  function mountAll() {
    var els = document.querySelectorAll('.pw-embed[data-component]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.__pwMounted) continue;
      var name = el.getAttribute('data-component');
      if (!SCENES[name]) { want(el, name); continue; }
      if (LAZY[name] && !el.__pwNear) { watch(el); continue; }
      register(name);
      el.__pwMounted = true;
      el.classList.add('pw-embed--live');
      if (vis) vis.observe(el);
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
