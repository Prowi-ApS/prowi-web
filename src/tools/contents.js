/* In-page contents for CMS item templates with a sidebar (v1.25.57). One shared module for every template whose
   sidebar sits next to the article: the sidebar keeps its desktop look while it really is a column beside the article,
   and below that the page gets what fits a narrow layout instead of a sticky column drawn over the text.

   Why: the Webflow layouts are fluid grids (repeat(auto-fit, minmax(280px, 1fr)) with an article that spans 2 tracks)
   that drop to 2 tracks below ~1077 px, so the sidebar moves above the article; but the sidebar's position:sticky is
   only switched off at Webflow's tablet breakpoint (991 px). Between the two the sticky sidebar scrolls along over the
   article (customer stories: "The story in five beats" over the intro and the first headings). The width where the
   grid collapses depends on the container, not on a breakpoint, so the decision here is made from the grid itself:
   the sidebar "is a column" when the grid has room for the sidebar's track plus the article's span (computed
   grid-template-columns of the layout), re-checked on every resize of the layout (ResizeObserver).

   Per template (TEMPLATES below):
   - contents: the sidebar holds an in-page contents list. Column: unchanged. No column: the sidebar is hidden and a
     "Contents" button at the top of the article (plus a small floating copy while the reader is inside the article)
     opens a dialog listing the sections as anchor links, numbered 01, 02 ... and styled like the Insider post contents.
     Headings get an id if they have none. Dialog: role="dialog" + aria-modal, labelled, focus moves in and is kept
     inside (Tab / Shift+Tab), Esc, the close button and the backdrop close it, focus returns to the button; choosing a
     section closes it, scrolls the heading in under the nav bar and moves focus to the heading. DA/EN labels.
   - sticky only: the sidebar holds other things (pros / cons, roles). No column: the sidebar is only un-stuck
     (position:static) so it can never cover the article. Nothing else changes.
   Insider posts are deliberately not listed: their contents (cms-insider.js + the post template's own tab strip under
   1024 px) already work at every width and stay exactly as they are.
   State on the layout element: data-pw-cnt="side" | "stacked". Off for a page: data-no-contents on <html>/<body>.
   In Node the module exports its pure helpers (test/contents.test.js). */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  if (typeof document === 'undefined') return;
  var go = function () { try { api.run(document, window); } catch (e) { if (window.console) console.error('[prowi] contents', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})(this, function () {
  'use strict';

  // Layout root, sidebar, article; `sections` returns the section headings (contents templates only).
  var TEMPLATES = [
    { key: 'case', root: '.pw-case__story', aside: '.pw-case__aside', article: '.pw-case__article', contents: true,
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

  var L = {
    da: { contents: 'Indhold', close: 'Luk', unit: function (n) { return n + ' afsnit'; } },
    en: { contents: 'Contents', close: 'Close', unit: function (n) { return n + (n === 1 ? ' section' : ' sections'); } }
  };

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
  // Tracks the article occupies ("span 2" -> 2; "auto" / "2 / 4" handled; default 1).
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

  var CSS = '' +
    '.pw-cnt-bar{display:none}' +
    '[data-pw-cnt="stacked"] .pw-cnt-bar{display:flex}' +
    '[data-pw-cnt="stacked"] .pw-cnt-hide{display:none!important}' +
    '[data-pw-cnt="stacked"] .pw-cnt-unstick{position:static!important;top:auto!important}' +
    '.pw-cnt-btn{display:inline-flex;align-items:center;gap:10px;height:44px;margin:0;padding:0 18px 0 14px;border:1px solid var(--_prowi---pw-border-hairline,rgba(17,6,99,.12));border-radius:999px;background:var(--_prowi---pw-white,#fff);color:var(--_prowi---pw-dark-purple,#110663);font:inherit;font-size:15px;font-weight:500;line-height:1;letter-spacing:normal;text-align:left;cursor:pointer;-webkit-appearance:none;appearance:none;transition:border-color 160ms ease-out,background-color 160ms ease-out,opacity 200ms,transform 200ms,visibility 0s}' +
    '.pw-cnt-btn:hover{border-color:var(--_prowi---pw-purple,#4C39CA);background:#F4F1FE}' +
    '.pw-cnt-btn:focus-visible{outline:2px solid var(--_prowi---pw-purple,#4C39CA);outline-offset:3px}' +
    '.pw-cnt-btn svg{flex:none;color:var(--_prowi---pw-purple,#4C39CA)}' +
    '.pw-cnt-btn__n{color:var(--_prowi---pw-text-muted,#6664A0);font-weight:400}' +
    '.pw-cnt-fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:45;box-shadow:0 10px 30px rgba(17,6,99,.18);opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity 200ms,transform 200ms,visibility 0s linear 200ms}' +
    '.pw-cnt-fab.is-on{opacity:1;visibility:visible;transform:none;transition:opacity 200ms,transform 200ms,border-color 160ms,background-color 160ms}' +
    '.pw-cnt{position:fixed;top:0;right:0;bottom:0;left:0;z-index:9990;display:none;align-items:center;justify-content:center;padding:24px}' +
    '.pw-cnt.is-open{display:flex}' +
    '.pw-cnt__backdrop{position:absolute;top:0;right:0;bottom:0;left:0;background:rgba(12,5,80,.45)}' +
    '.pw-cnt__panel{position:relative;display:flex;flex-direction:column;width:100%;max-width:520px;max-height:min(80vh,640px);background:var(--_prowi---pw-white,#fff);border-radius:20px;box-shadow:0 24px 64px rgba(12,5,80,.28);overflow:hidden}' +
    '.pw-cnt__head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 12px 10px 24px;border-bottom:1px solid var(--_prowi---pw-border-hairline,rgba(17,6,99,.08))}' +
    '.pw-cnt__title{margin:0;font-size:11px;font-weight:600;line-height:1.3;letter-spacing:.06em;text-transform:uppercase;color:var(--_prowi---pw-text-muted,#6664A0)}' +
    '.pw-cnt__close{display:grid;place-items:center;width:44px;height:44px;margin:0;padding:0;border:0;border-radius:999px;background:transparent;color:var(--_prowi---pw-dark-purple,#110663);cursor:pointer}' +
    '.pw-cnt__close:hover{background:#F4F1FE}' +
    '.pw-cnt__close:focus-visible{outline:2px solid var(--_prowi---pw-purple,#4C39CA);outline-offset:2px}' +
    '.pw-cnt__nav{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px 20px 20px 24px}' +
    '.pw-cnt__list{list-style:none;margin:0;padding:0}' +
    '.pw-cnt__list li{margin:0;padding:0}' +
    '.pw-cnt__item{display:flex;align-items:baseline;gap:12px;min-height:44px;box-sizing:border-box;padding:11px 0 11px 16px;border-left:2px solid var(--_prowi---pw-border-hairline,rgba(17,6,99,.1));color:var(--_prowi---pw-text-muted,#6664A0);font-size:16px;font-weight:400;line-height:1.4;text-decoration:none;transition:color 160ms ease-out,border-color 160ms ease-out}' +
    '.pw-cnt__item:hover{color:var(--_prowi---pw-dark-purple,#110663)}' +
    '.pw-cnt__item:focus-visible{outline:2px solid var(--_prowi---pw-purple,#4C39CA);outline-offset:2px;border-radius:4px}' +
    '.pw-cnt__num{flex:none;font-size:12px;font-weight:600;letter-spacing:.04em;font-variant-numeric:tabular-nums;color:var(--_prowi---pw-text-placeholder,#A1A0BD)}' +
    '.pw-cnt__item[aria-current="true"]{border-left-color:var(--_prowi---pw-purple,#4C39CA);color:var(--_prowi---pw-dark-purple,#110663);font-weight:500}' +
    '.pw-cnt__item[aria-current="true"] .pw-cnt__num{color:var(--_prowi---pw-purple,#4C39CA)}' +
    '@keyframes pwCntIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}' +
    '@keyframes pwCntFade{from{opacity:0}to{opacity:1}}' +
    '.pw-cnt.is-open .pw-cnt__panel{animation:pwCntIn 300ms cubic-bezier(.2,.8,.2,1) both}' +
    '.pw-cnt.is-open .pw-cnt__backdrop{animation:pwCntFade 200ms ease-out both}' +
    '@media (max-width:639px){.pw-cnt{align-items:flex-end;padding:12px 0 0}.pw-cnt__panel{max-width:none;max-height:85vh;border-radius:20px 20px 0 0;padding-bottom:env(safe-area-inset-bottom,0px)}}' +
    '@media (prefers-reduced-motion:reduce){.pw-cnt.is-open .pw-cnt__panel,.pw-cnt.is-open .pw-cnt__backdrop{animation:none}.pw-cnt-fab,.pw-cnt-fab.is-on{transition:none}}';

  var ICON = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7 5.5h9M7 10h9M7 14.5h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="3.6" cy="5.5" r="1.1" fill="currentColor"/><circle cx="3.6" cy="10" r="1.1" fill="currentColor"/><circle cx="3.6" cy="14.5" r="1.1" fill="currentColor"/></svg>';
  var XICON = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  function run(doc, win) {
    if (doc.documentElement.hasAttribute('data-no-contents') || (doc.body && doc.body.hasAttribute('data-no-contents'))) return;
    var lang = /^en/i.test(doc.documentElement.getAttribute('lang') || '') ? 'en' : 'da';
    var T = L[lang];
    var reduce = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var n = 0;
    TEMPLATES.forEach(function (tp) {
      each(doc.querySelectorAll(tp.root), function (layout) {
        if (layout.__pwCnt) return;
        var aside = layout.querySelector(tp.aside), art = layout.querySelector(tp.article);
        if (!aside || !art) return;
        if (!doc.getElementById('pw-contents-css')) {
          var st = doc.createElement('style'); st.id = 'pw-contents-css'; st.textContent = CSS; doc.head.appendChild(st);
        }
        layout.__pwCnt = setup(doc, win, tp, layout, aside, art, T, reduce, ++n);
      });
    });
  }

  function navBottom(doc, win) {
    var nv = doc.querySelector('.pw-nav'); if (!nv) return 0;
    var cs = win.getComputedStyle(nv), r = nv.getBoundingClientRect();
    return (cs.position === 'fixed' || cs.position === 'sticky') ? Math.max(0, Math.round(r.bottom)) : 0;
  }

  function setup(doc, win, tp, layout, aside, art, T, reduce, uid) {
    aside.classList.add('pw-cnt-unstick');
    var heads = [], ids = [], ui = null;
    if (tp.contents) {
      heads = tp.sections(art);
      if (heads.length >= 2) {
        ids = assignIds(heads, doc, tp.key + '-sec');
        aside.classList.add('pw-cnt-hide');
        ui = buildUi(doc, win, tp, layout, art, heads, ids, T, reduce, uid);
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
      if (s !== state) {
        state = s; layout.setAttribute('data-pw-cnt', s);
        if (ui) ui.mode(s);
      }
    }
    measure();
    if (win.ResizeObserver) new win.ResizeObserver(measure).observe(layout);
    win.addEventListener('resize', measure);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(measure);
    return { measure: measure, ui: ui, heads: heads, ids: ids };
  }

  function buildUi(doc, win, tp, layout, art, heads, ids, T, reduce, uid) {
    var mk = function (tag, cls) { var e = doc.createElement(tag); if (cls) e.className = cls; return e; };
    var dlgId = 'pw-cnt-' + uid, titleId = 'pw-cnt-title-' + uid;
    var label = function (b) {
      b.innerHTML = ICON + '<span class="pw-cnt-btn__t"></span><span class="pw-cnt-btn__n"></span>';
      b.querySelector('.pw-cnt-btn__t').textContent = T.contents;
      b.querySelector('.pw-cnt-btn__n').textContent = T.unit(heads.length);
    };
    // in-flow button at the top of the article
    var bar = mk('div', 'pw-cnt-bar');
    var btn = mk('button', 'pw-cnt-btn'); btn.type = 'button'; label(btn);
    btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', dlgId);
    bar.appendChild(btn); art.insertBefore(bar, art.firstChild);
    // floating copy for pointer users while the reader is inside the article (keyboard and screen readers use the one above)
    var fab = mk('button', 'pw-cnt-btn pw-cnt-fab'); fab.type = 'button'; label(fab);
    fab.setAttribute('tabindex', '-1'); fab.setAttribute('aria-hidden', 'true');
    // dialog
    var box = mk('div', 'pw-cnt'); box.id = dlgId;
    var back = mk('div', 'pw-cnt__backdrop');
    var panel = mk('div', 'pw-cnt__panel');
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', titleId);
    var head = mk('div', 'pw-cnt__head');
    var title = mk('p', 'pw-cnt__title'); title.id = titleId; title.textContent = T.contents;
    var x = mk('button', 'pw-cnt__close'); x.type = 'button'; x.setAttribute('aria-label', T.close); x.innerHTML = XICON;
    head.appendChild(title); head.appendChild(x);
    var nav = mk('nav', 'pw-cnt__nav'); nav.setAttribute('aria-label', T.contents);
    var ol = mk('ol', 'pw-cnt__list');
    var links = heads.map(function (h, i) {
      var li = mk('li'), a = mk('a', 'pw-cnt__item');
      a.href = '#' + ids[i]; a.setAttribute('data-pw-cnt-i', String(i));
      var nm = mk('span', 'pw-cnt__num'); nm.textContent = num(i); nm.setAttribute('aria-hidden', 'true');
      var tx = mk('span', 'pw-cnt__text'); tx.textContent = txt(h);
      a.appendChild(nm); a.appendChild(tx); li.appendChild(a); ol.appendChild(li);
      return a;
    });
    nav.appendChild(ol); panel.appendChild(head); panel.appendChild(nav);
    box.appendChild(back); box.appendChild(panel);
    doc.body.appendChild(box); doc.body.appendChild(fab);

    var offset = function () { return navBottom(doc, win) + 24; };
    heads.forEach(function (h) { h.style.scrollMarginTop = offset() + 'px'; });
    var current = function () {
      var line = offset() + win.innerHeight * 0.3, cur = 0;
      for (var k = 0; k < heads.length; k++) if (heads[k].getBoundingClientRect().top <= line) cur = k;
      return cur;
    };
    var opener = null, isOpen = false, mode = 'side';
    function open(from) {
      if (isOpen || mode !== 'stacked') return;
      isOpen = true; opener = from || btn;
      var c = current();
      links.forEach(function (a, k) { if (k === c) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      box.classList.add('is-open'); doc.body.style.overflow = 'hidden';
      btn.setAttribute('aria-expanded', 'true');
      try { links[c].focus({ preventScroll: true }); } catch (e) { links[c].focus(); }
      if (links[c].scrollIntoView) try { links[c].scrollIntoView({ block: 'nearest' }); } catch (e) {}
    }
    function close(restore) {
      if (!isOpen) return;
      isOpen = false; box.classList.remove('is-open'); doc.body.style.overflow = '';
      btn.setAttribute('aria-expanded', 'false');
      if (restore !== false && opener && opener.focus) try { opener.focus({ preventScroll: true }); } catch (e) { opener.focus(); }
    }
    function goTo(i) {
      var h = heads[i];
      close(false);
      var y = h.getBoundingClientRect().top + (win.pageYOffset || 0) - offset();
      try { win.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { win.scrollTo(0, y); }
      if (win.history && history.replaceState) history.replaceState(null, '', '#' + ids[i]);
      if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
      try { h.focus({ preventScroll: true }); } catch (e) {}
    }
    btn.addEventListener('click', function () { open(btn); });
    fab.addEventListener('click', function () { open(fab); });
    x.addEventListener('click', function () { close(); });
    back.addEventListener('click', function () { close(); });
    // capture on window: ahead of page.js's document-level anchor handler and Webflow's own anchor scrolling
    win.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[data-pw-cnt-i]') : null;
      if (!a || !box.contains(a) || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); e.stopPropagation();
      goTo(+a.getAttribute('data-pw-cnt-i'));
    }, true);
    doc.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') { // keep focus inside the dialog
        var f = [x].concat(links), first = f[0], last = f[f.length - 1], act = doc.activeElement;
        if (!panel.contains(act)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && act === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && act === last) { e.preventDefault(); first.focus(); }
      }
    });
    // floating button: only while the in-flow one is scrolled away and the article is still being read
    var ticking = false;
    function fabUpdate() {
      ticking = false;
      var on = false;
      if (mode === 'stacked') {
        var rb = bar.getBoundingClientRect(), ra = art.getBoundingClientRect();
        on = rb.bottom < navBottom(doc, win) + 8 && ra.bottom > win.innerHeight * 0.6;
      }
      fab.classList.toggle('is-on', on && !isOpen);
    }
    win.addEventListener('scroll', function () { if (!ticking) { ticking = true; (win.requestAnimationFrame || setTimeout)(fabUpdate); } }, { passive: true });
    // arriving with #<section id> (ids are set here, after page.js looked for the target): land under the nav bar
    var hash = '';
    try { hash = decodeURIComponent((win.location.hash || '').slice(1)); } catch (e) {}
    var hi = hash ? ids.indexOf(hash) : -1;
    if (hi > -1) {
      var land = function () { var y = heads[hi].getBoundingClientRect().top + (win.pageYOffset || 0) - offset(); win.scrollTo(0, Math.max(0, y)); };
      if (doc.readyState === 'complete') setTimeout(land, 60); else win.addEventListener('load', function () { setTimeout(land, 60); });
    }
    return {
      mode: function (m) { mode = m; if (m !== 'stacked') close(false); fabUpdate(); },
      open: open, close: close, btn: btn, fab: fab, box: box, links: links
    };
  }

  return { TEMPLATES: TEMPLATES, L: L, trackCount: trackCount, spanOf: spanOf, isColumn: isColumn, besideRects: besideRects,
    slug: slug, assignIds: assignIds, num: num, run: run, CSS: CSS };
});
