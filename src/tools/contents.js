/* In-page contents on CMS item templates with a sidebar (v1.25.57): the same contents pattern as the Insider posts,
   for every template whose sidebar sits next to the article, plus a fix for sidebars drawn over the article.

   Why: the story and model layouts are fluid grids (repeat(auto-fit, minmax(280px, 1fr)), the article spans 2 tracks)
   that drop to 2 tracks below ~1077 px, so the sidebar moves above the article; but the sidebar's position:sticky is only
   switched off at Webflow's tablet breakpoint (991 px). Between the two the sticky sidebar scrolled along over the
   article (customer stories: "The story in five beats" over the intro and the first headings). Where the grid collapses
   depends on the container, not on a breakpoint, so the decision is made from the grid itself: the sidebar "is a
   column" when the layout's computed grid-template-columns has a track for it next to the article's span; re-checked
   on every resize of the layout (ResizeObserver). The layout gets data-pw-cnt="side" | "stacked".

   Customer stories (contents):
   - side: the beats list in the sidebar becomes the Insider post contents list: the same markup and Webflow classes as
     cms-insider.js builds on posts (a.pw-post__toc-item / --on, .pw-post__toc-num 01 02 ..., .pw-post__toc-text), one
     entry per beat heading, the current section marked while scrolling (same scroll-spy line as posts), click scrolls
     the heading in under the nav bar. The story's own sidebar label stays.
   - stacked: the sidebar is hidden and the page gets the tab strip that Insider posts show under 1024 px (.pw-ptoc,
     same markup, CSS and behaviour as the post template's page code: fixed under the nav while the story is on screen,
     current tab filled as the reader moves through its section, edge fades). On posts the strip still comes from the
     post template's own page code; this module does not load there, so posts do not change.
   Commission models (sidebar with pros / cons, no contents): stacked = the sidebar is only un-stuck (position:static),
   so it can never cover the article. Nothing else changes.
   Headings get an id (slug of the heading) when they have none. Labels: "Indhold" / "Contents" (as on posts).
   Off for a page: data-no-contents on <html>/<body>. In Node the module exports its pure helpers (test/contents.test.js). */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  if (typeof document === 'undefined') return;
  var go = function () { try { api.run(document, window); } catch (e) { if (window.console) console.error('[prowi] contents', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})(this, function () {
  'use strict';

  var TEMPLATES = [
    { key: 'case', root: '.pw-case__story', aside: '.pw-case__aside', article: '.pw-case__article', contents: true,
      list: '.pw-case__aside-list', label: '.pw-case__aside-label',
      // each story beat is a rich-text block that starts with its heading (h3 today; h2 accepted)
      sections: function (art) {
        var out = [];
        each(art.querySelectorAll('.pw-case__beat'), function (b) {
          if (!visible(b)) return;
          var h = b.querySelector('h2, h3');
          if (h && txt(h)) out.push(h);
        });
        return out;
      } },
    { key: 'model', root: '.pw-model__body', aside: '.pw-model__aside', article: '.pw-model__article', contents: false }
  ];

  var L = { da: { contents: 'Indhold' }, en: { contents: 'Contents' } };

  function each(list, fn) { Array.prototype.forEach.call(list || [], fn); }
  function txt(el) { return el ? String(el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  // a beat Webflow left empty (.w-dyn-bind-empty, :empty) or that is hidden does not count as a section
  function visible(el) {
    if (!el || el.hidden || el.style.display === 'none') return false;
    if (el.classList && el.classList.contains('w-dyn-bind-empty')) return false;
    if (el.matches && el.matches(':empty')) return false;
    var v = el.ownerDocument && el.ownerDocument.defaultView;
    return !(v && v.getComputedStyle && v.getComputedStyle(el).display === 'none');
  }

  // Number of grid tracks in a computed grid-template-columns value ("315px 315px 315px", "[a] 200px 640px", "none").
  function trackCount(v) {
    var m = String(v || '').replace(/\[[^\]]*\]/g, ' ').match(/(^|\s)-?[\d.]+px(?=\s|$)/g);
    return m ? m.length : 0;
  }
  // Tracks the article occupies ("span 2" -> 2; "2 / 4" -> 2; default 1).
  function spanOf(start, end) {
    var s = /span\s+(\d+)/.exec(String(start || '')) || /span\s+(\d+)/.exec(String(end || ''));
    if (s) return Math.max(1, +s[1]);
    var a = parseInt(start, 10), b = parseInt(end, 10);
    if (a > 0 && b > a) return b - a;
    return 1;
  }
  // The sidebar is a real column when the grid has a track for it next to the article's span.
  function isColumn(cols, span) { return cols >= 1 + span; }
  // Fallback when the layout is not a grid: compare the boxes (sidebar entirely left of the article, both shown).
  function besideRects(a, b) { return !!(a && b && a.width > 0 && b.width > 0 && a.right <= b.left + 1); }

  function slug(s) {
    return String(s || '').toLowerCase()
      .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64).replace(/-+$/, '');
  }
  // ids for the section headings: keep an existing id, otherwise a slug of the heading (unique on the page)
  function assignIds(heads, doc, prefix) {
    var used = {};
    return heads.map(function (h, i) {
      if (h.id) { used[h.id] = 1; return h.id; }
      var base = slug(txt(h)) || (prefix + '-' + (i + 1)), id = base, k = 2;
      while (used[id] || (doc && doc.getElementById(id))) id = base + '-' + (k++);
      used[id] = 1; h.id = id; return id;
    });
  }
  function num(i) { return (i < 9 ? '0' : '') + (i + 1); }

  // Sidebar list: the post contents classes are Webflow site styles (one stylesheet for the whole site); the same values
  // are repeated here, scoped to the story sidebar, so the list looks the same even if the site CSS ever drops them.
  // Tab strip: the CSS of the post template's page code (head, "Contents (2026-10-27)"), unchanged, minus its media
  // query: here the strip exists only while the layout is stacked (.pw-ptoc--off otherwise).
  var CSS = '' +
    '[data-pw-cnt="stacked"] .pw-cnt-hide{display:none!important}' +
    '[data-pw-cnt="stacked"] .pw-cnt-unstick{position:static!important;top:auto!important}' +
    '.pw-cnt-toc{display:flex;flex-direction:column}' +
    '.pw-cnt-has-toc .pw-case__aside-label{padding-left:18px}' +
    '.pw-case__aside,.pw-case__aside *{overflow-anchor:none}' +
    '.pw-case__aside .pw-post__toc-item,.pw-case__aside .pw-post__toc-item--on{display:flex;width:100%;margin:0;padding:7px 0 7px 16px;align-items:baseline;gap:12px;border:0;border-left:2px solid var(--_prowi---pw-border-hairline);background-color:transparent;font-size:14px;line-height:1.35;font-weight:400;text-align:left;letter-spacing:normal;text-decoration:none;cursor:pointer;color:var(--_prowi---pw-text-muted);transition:color 160ms ease-out,border-color 160ms ease-out}' +
    '.pw-case__aside .pw-post__toc-item--on{font-weight:500;border-left-color:var(--_prowi---pw-purple);color:var(--_prowi---pw-dark-purple)}' +
    '.pw-case__aside .pw-post__toc-num,.pw-case__aside .pw-post__toc-num--on{flex:0 0 auto;font-size:11px;font-weight:600;letter-spacing:.04em;font-variant-numeric:tabular-nums;color:var(--_prowi---pw-text-placeholder);transition:color 160ms ease-out}' +
    '.pw-case__aside .pw-post__toc-num--on{color:var(--_prowi---pw-purple)}' +
    '.pw-case__aside .pw-post__toc-text{min-width:0}' +
    '.pw-ptoc{display:block;position:fixed;left:0;right:0;top:var(--pw-ptoc-top,64px);z-index:50;background:var(--_prowi---pw-white,#fff);border-top:1px solid var(--_prowi---pw-border-hairline,rgba(17,6,99,.08));border-bottom:1px solid var(--_prowi---pw-border-hairline,rgba(17,6,99,.08));opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity 200ms,transform 200ms,visibility 0s linear 200ms}' +
    '.pw-ptoc--on{opacity:1;visibility:visible;transform:none;transition:opacity 200ms,transform 200ms}' +
    '.pw-ptoc.pw-ptoc--off{display:none}' +
    '.pw-ptoc__track{display:flex;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-webkit-overflow-scrolling:touch}' +
    '.pw-ptoc__track::-webkit-scrollbar{display:none}' +
    '.pw-ptoc__tab{flex:none;display:flex;align-items:baseline;gap:8px;max-width:80vw;padding:14px 18px;border-right:1px solid var(--_prowi---pw-border-hairline,rgba(17,6,99,.08));font-size:15px;line-height:1.2;font-weight:400;color:var(--_prowi---pw-text-muted,#6664A0);text-decoration:none;white-space:nowrap;transition:background-color 220ms,color 220ms}' +
    '.pw-ptoc__tab:first-child{padding-left:max(18px,env(safe-area-inset-left))}' +
    '.pw-ptoc__num{flex:none;font-size:13px;font-weight:600;letter-spacing:.04em;font-variant-numeric:tabular-nums}' +
    '.pw-ptoc__txt{overflow:hidden;text-overflow:ellipsis}' +
    '.pw-ptoc__tab--on{background:linear-gradient(90deg,rgba(76,57,202,.18) var(--p,0%),rgba(76,57,202,.06) var(--p,0%));color:var(--_prowi---pw-dark-purple,#110663);font-weight:500}' +
    '.pw-ptoc__tab--on .pw-ptoc__num{color:var(--_prowi---pw-purple)}' +
    '.pw-ptoc::before,.pw-ptoc::after{content:"";position:absolute;top:0;bottom:0;width:56px;z-index:2;pointer-events:none;opacity:0;transition:opacity 200ms;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}' +
    '.pw-ptoc::before{left:0;background:linear-gradient(90deg,#fff 10%,rgba(255,255,255,0));-webkit-mask-image:linear-gradient(90deg,#000 40%,transparent);mask-image:linear-gradient(90deg,#000 40%,transparent)}' +
    '.pw-ptoc::after{right:0;background:linear-gradient(270deg,#fff 10%,rgba(255,255,255,0));-webkit-mask-image:linear-gradient(270deg,#000 40%,transparent);mask-image:linear-gradient(270deg,#000 40%,transparent)}' +
    '.pw-ptoc--l::before,.pw-ptoc--r::after{opacity:1}';

  function run(doc, win) {
    if (doc.documentElement.hasAttribute('data-no-contents') || (doc.body && doc.body.hasAttribute('data-no-contents'))) return;
    var T = L[/^en/i.test(doc.documentElement.getAttribute('lang') || '') ? 'en' : 'da'];
    var reduce = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
    TEMPLATES.forEach(function (tp) {
      each(doc.querySelectorAll(tp.root), function (layout) {
        if (layout.__pwCnt) return;
        var aside = layout.querySelector(tp.aside), art = layout.querySelector(tp.article);
        if (!aside || !art) return;
        if (!doc.getElementById('pw-contents-css')) {
          var st = doc.createElement('style'); st.id = 'pw-contents-css'; st.textContent = CSS; doc.head.appendChild(st);
        }
        layout.__pwCnt = setup(doc, win, tp, layout, aside, art, T, reduce);
      });
    });
  }

  function navBottom(doc, win) {
    var nv = doc.querySelector('.pw-nav'); if (!nv) return 0;
    var cs = win.getComputedStyle(nv), r = nv.getBoundingClientRect();
    return (cs.position === 'fixed' || cs.position === 'sticky') ? Math.max(0, Math.round(r.bottom)) : 0;
  }

  function setup(doc, win, tp, layout, aside, art, T, reduce) {
    aside.classList.add('pw-cnt-unstick');
    var ui = null;
    if (tp.contents) {
      var heads = tp.sections(art);
      if (heads.length >= 2) {
        var ids = assignIds(heads, doc, tp.key + '-sec');
        aside.classList.add('pw-cnt-hide');
        ui = contents(doc, win, tp, layout, aside, heads, ids, T, reduce);
      }
    }
    var state = '';
    function measure() {
      var cs = win.getComputedStyle(layout), side;
      if (/grid/.test(cs.display)) {
        var ac = win.getComputedStyle(art);
        side = isColumn(trackCount(cs.gridTemplateColumns), spanOf(ac.gridColumnStart, ac.gridColumnEnd));
      } else side = besideRects(aside.getBoundingClientRect(), art.getBoundingClientRect());
      var s = side ? 'side' : 'stacked';
      if (s !== state) { state = s; layout.setAttribute('data-pw-cnt', s); if (ui) ui.mode(s); }
    }
    measure();
    if (win.ResizeObserver) new win.ResizeObserver(measure).observe(layout);
    win.addEventListener('resize', measure);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(measure);
    return { measure: measure, ui: ui };
  }

  function contents(doc, win, tp, layout, aside, heads, ids, T, reduce) {
    var mk = function (tag, cls) { var e = doc.createElement(tag); if (cls) e.className = cls; return e; };
    var lock = 0, mode = '';
    var raf = win.requestAnimationFrame ? function (f) { win.requestAnimationFrame(f); } : function (f) { setTimeout(f, 16); };
    // offsets as on posts: the sidebar list lands headings max(nav, 64) + 28 below the top (cms-insider.js topOffset),
    // the strip lands them under the nav bar and the strip itself (post template page code)
    var listOffset = function () { var nv = doc.querySelector('.pw-nav'); return Math.max(nv ? nv.getBoundingClientRect().height : 0, 64) + 28; };
    var stripOffset = function () { return navBottom(doc, win) + (bar.offsetHeight || 0) + 28; };
    var jump = function (i, off) {
      var h = heads[i], y = h.getBoundingClientRect().top + (win.pageYOffset || 0) - off;
      lock = Date.now() + 900; setList(i); setTab(i);
      try { win.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { win.scrollTo(0, y); }
      if (win.history && history.replaceState) history.replaceState(null, '', '#' + ids[i]);
    };

    // 1. sidebar list, built like the Insider post contents (cms-insider.js buildToc)
    var src = aside.querySelector(tp.list);
    var nav = mk('nav', 'pw-cnt-toc'); nav.setAttribute('aria-label', T.contents); nav.setAttribute('data-pw-cnt-toc', '');
    var items = heads.map(function (h, i) {
      h.style.scrollMarginTop = listOffset() + 'px';
      var a = mk('a', 'pw-post__toc-item'); a.href = '#' + ids[i]; a.setAttribute('data-pw-cnt-i', String(i));
      var n = mk('span', 'pw-post__toc-num'), ns = mk('span'); ns.textContent = num(i); n.appendChild(ns);
      var t = mk('span', 'pw-post__toc-text'), ts = mk('span'); ts.textContent = txt(h); t.appendChild(ts);
      a.appendChild(n); a.appendChild(t); nav.appendChild(a);
      return a;
    });
    if (src) { src.style.display = 'none'; src.setAttribute('aria-hidden', 'true'); src.parentNode.insertBefore(nav, src.nextSibling); }
    else aside.appendChild(nav);
    aside.classList.add('pw-cnt-has-toc');
    var curList = -1;
    function setList(i) {
      if (i === curList) return; curList = i;
      items.forEach(function (a, k) {
        var on = k === i;
        a.className = a.className.replace(/\bpw-post__toc-item(--on)?\b/, on ? 'pw-post__toc-item--on' : 'pw-post__toc-item');
        var nm = a.querySelector('.pw-post__toc-num, .pw-post__toc-num--on');
        if (nm) nm.className = nm.className.replace(/\bpw-post__toc-num(--on)?\b/, on ? 'pw-post__toc-num--on' : 'pw-post__toc-num');
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }

    // 2. tab strip under the nav, as on posts below 1024 px (post template page code, "Contents strip")
    var bar = mk('nav', 'pw-ptoc pw-ptoc--off'); bar.setAttribute('aria-label', T.contents);
    var track = mk('div', 'pw-ptoc__track'); bar.appendChild(track);
    var tabs = heads.map(function (h, i) {
      var a = mk('a', 'pw-ptoc__tab'); a.href = '#' + ids[i]; a.setAttribute('data-pw-cnt-tab', String(i));
      var n = mk('span', 'pw-ptoc__num'); n.textContent = num(i);
      var t = mk('span', 'pw-ptoc__txt'); t.textContent = txt(h);
      a.appendChild(n); a.appendChild(t); track.appendChild(a);
      return a;
    });
    doc.body.appendChild(bar);
    function edges() { var max = track.scrollWidth - track.clientWidth; bar.classList.toggle('pw-ptoc--l', track.scrollLeft > 4); bar.classList.toggle('pw-ptoc--r', track.scrollLeft < max - 4); }
    track.addEventListener('scroll', edges, { passive: true });
    var curTab = -1;
    function setTab(i) {
      if (i === curTab) return; curTab = i;
      tabs.forEach(function (a, k) { var on = k === i; a.classList.toggle('pw-ptoc__tab--on', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      var a = tabs[i]; if (!a || !bar.offsetWidth) return;
      var x = a.offsetLeft - (track.clientWidth - a.offsetWidth) / 2;
      try { track.scrollTo({ left: Math.max(0, x), behavior: 'smooth' }); } catch (e) { track.scrollLeft = x; }
    }

    // one listener for both: capture on window, ahead of page.js's document-level anchor handler (which would land
    // the heading with its own offset) and Webflow's own anchor scrolling
    win.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[data-pw-cnt-i], a[data-pw-cnt-tab]') : null;
      if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (!nav.contains(a) && !bar.contains(a)) return;
      e.preventDefault(); e.stopPropagation();
      var strip = a.hasAttribute('data-pw-cnt-tab');
      jump(+a.getAttribute(strip ? 'data-pw-cnt-tab' : 'data-pw-cnt-i'), strip ? stripOffset() : listOffset());
    }, true);

    // scroll spy: sidebar (same line as posts' sidebar) or strip (same line, visibility and fill as posts' strip)
    var ticking = false;
    function update() {
      ticking = false;
      var k, best = 0, line;
      if (mode === 'side') {
        if (Date.now() < lock) return;
        line = Math.max(listOffset() + 40, win.innerHeight * 0.45);
        for (k = 0; k < heads.length; k++) if (heads[k].getBoundingClientRect().top <= line) best = k;
        setList(best);
        return;
      }
      if (!bar.offsetWidth) return;
      var top = navBottom(doc, win); bar.style.setProperty('--pw-ptoc-top', top + 'px');
      var r = layout.getBoundingClientRect(), bh = bar.offsetHeight;
      bar.classList.toggle('pw-ptoc--on', r.top < top + 8 && r.bottom > top + bh + 80);
      if (Date.now() < lock) return;
      line = top + bh + win.innerHeight * 0.25;
      for (k = 0; k < heads.length; k++) if (heads[k].getBoundingClientRect().top <= line) best = k;
      setTab(best);
      // the active tab fills from the left as the reader moves through its section
      var s0 = heads[best].getBoundingClientRect().top, s1 = best + 1 < heads.length ? heads[best + 1].getBoundingClientRect().top : r.bottom;
      var p = s1 > s0 ? Math.max(0, Math.min(1, (line - s0) / (s1 - s0))) : 0;
      tabs[best].style.setProperty('--p', (p * 100).toFixed(1) + '%');
    }
    win.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(update); } }, { passive: true });
    win.addEventListener('resize', function () { update(); edges(); });

    // arriving with #<section id> (ids are set here, after page.js looked for the target): land under the nav bar
    var hash = '';
    try { hash = decodeURIComponent((win.location.hash || '').slice(1)); } catch (e) {}
    var hi = hash ? ids.indexOf(hash) : -1;
    if (hi > -1) {
      var land = function () { var y = heads[hi].getBoundingClientRect().top + (win.pageYOffset || 0) - (mode === 'side' ? listOffset() : stripOffset()); win.scrollTo(0, Math.max(0, y)); };
      if (doc.readyState === 'complete') setTimeout(land, 60); else win.addEventListener('load', function () { setTimeout(land, 60); });
    }
    return {
      mode: function (m) {
        mode = m;
        bar.classList.toggle('pw-ptoc--off', m !== 'stacked');
        if (m !== 'stacked') bar.classList.remove('pw-ptoc--on');
        curList = curTab = -1; update(); edges();
      },
      nav: nav, bar: bar, items: items, tabs: tabs
    };
  }

  return { TEMPLATES: TEMPLATES, L: L, trackCount: trackCount, spanOf: spanOf, isColumn: isColumn, besideRects: besideRects,
    slug: slug, assignIds: assignIds, num: num, run: run, CSS: CSS };
});
