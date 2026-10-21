/* ---- Chunk loader: the registered entry (dist/prowi-2026.js) carries the page core; everything page-specific lives in
   files next to it (dist/chunks/*.js, dist/scenes/*.js) and is fetched only where the page needs it.
   build.py writes window.__PW_CHUNKS = { name: { f: path relative to the entry, i: SRI hash, s: root selector (tools) } }.
   Chunk URLs are resolved against the entry's own URL, so the same build works from any jsDelivr commit or tag. ---- */
(function () {
  var d = document, w = window;
  if (w.__pwNeed) return;
  var C = w.__PW_CHUNKS || {};
  var cs = d.currentScript, src = (cs && cs.src) || '';
  if (!src) { var tag = d.querySelector('script[src*="prowi-2026"]'); if (tag) src = tag.src; }
  // no src: the entry was pasted inline (local file:// previews) - read the chunks from the build folder
  // the entry's own folder, but only when it really is a copy of dist/ (Webflow's preview can serve the registered script from
  // another address, or inline); otherwise the release folder on jsDelivr (window.__PW_CDN, written by build.py)
  if (src && !/\/prowi-2026\.js(?:[?#]|$)/.test(src)) src = '';
  var base = src ? src.split(/[?#]/)[0].replace(/[^\/]*$/, '') : (w.__PW_BASE || (location.protocol === 'file:' ? 'file:///home/claude/prowi-web/dist/' : (w.__PW_CDN || '')));
  if (!base) console.warn('[prowi] no address for the page modules; calculators, search and animations are off');
  w.__PW_BASE = base;
  var st = {};
  // need(name, cb, ordered): load chunk `name` once; cb runs after it executed (or failed). Ordered chunks execute in request order.
  function need(name, cb, ordered) {
    var e = st[name];
    if (!e) {
      e = st[name] = { done: false, cbs: [] };
      var c = C[name];
      if (!c || !base) e.done = true;
      else {
        var add = function (retry) {
          var sc = d.createElement('script');
          sc.src = base + c.f + (retry ? '?r=1' : '');
          sc.async = !ordered;
          if (c.i && base.indexOf('file:') !== 0) { sc.integrity = c.i; sc.crossOrigin = 'anonymous'; }
          sc.onload = function () { fin(true); };
          // a just-published commit can fail on the CDN's first request: try once more before giving up
          sc.onerror = function () { if (!retry) setTimeout(function () { add(true); }, 800); else fin(false); };
          (d.head || d.documentElement).appendChild(sc);
        };
        var fin = function (ok) {
          if (e.done) return; e.done = true;
          if (!ok) console.error('[prowi] could not load ' + c.f);
          var l = e.cbs; e.cbs = [];
          l.forEach(function (f) { try { f(); } catch (err) { setTimeout(function () { throw err; }); } });
        };
        add(false);
      }
    }
    if (cb) { if (e.done) cb(); else e.cbs.push(cb); }
  }
  w.__pwNeed = need;
  var has = function (sel) { try { return !!d.querySelector(sel); } catch (e) { return false; } };
  // 1. English string maps (page.js waits for them on lang=en pages), then the tool modules, in that order
  if (/^en/i.test(d.documentElement.getAttribute('lang') || '') && has('.pw-root')) need('en', null, true);
  for (var k in C) if (k.indexOf('tool:') === 0 && C[k].s && has(C[k].s)) need(k, null, true);
  // 2. scene runtime (Preact + Claude Design runtime + mounter) and the scenes on this page, in parallel
  var emb = d.querySelectorAll('.pw-embed[data-component]');
  if (emb.length) {
    need('runtime');
    for (var i = 0; i < emb.length; i++) need('scene:' + emb[i].getAttribute('data-component'));
  }
})();
