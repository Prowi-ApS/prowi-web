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
  function mountAll() {
    var els = document.querySelectorAll('.pw-embed[data-component]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.__pwMounted) continue;
      var name = el.getAttribute('data-component');
      if (!SCENES[name]) continue;
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
    mounted: mounted
  };
  var tries = 0;
  (function wait() {
    if (ready()) { mountAll(); return; }
    if (++tries > 400) { console.error('[prowi] scene runtime did not initialise'); return; }
    setTimeout(wait, 25);
  })();
})();
