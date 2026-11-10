/* Rich-text tables (v1.25.62): wide tables are never silently cut off, and every real table can be opened large.
   Runs on the tables inside the CMS rich-text bodies (.pw-post__body table, .pw-term__body table, .pw-model__guide table,
   .pw-type__longform table, .pw-int__longform table); the chunk is only fetched on pages that have one, so pages
   without tables are untouched.

   1. Inline. Each table gets a card wrapper (.pw-tx) that takes over the table's own card look (border, radius,
      background, margins are read from the table, so every template keeps its style) and a scroll box inside it
      (.pw-tx__scroll; on posts the wrapper cms-insider.js already adds is reused). The templates set the header cells
      to white-space:nowrap, which made a 5-column table ~1.5x wider than the article column: the columns to the right
      were only reachable by a sideways scroll nobody could see. Now:
        a) a table that does not fit first lets its header cells wrap (.pw-tx--wrap; short values such as "12 %" or
           "15.000 kr." are then kept on one line);
        b) if it still does not fit (.pw-tx--over) it scrolls inside the card with the first column kept in place
           (.pw-tx--stick, when that column is at most half the card), a fade on the side(s) with more content, a
           visible thin scrollbar, a "Scroll" hint on touch screens until the first scroll, and the scroll box
           is keyboard focusable.
   2. Expand. Tables with 3+ columns (or any table that overflows) get a small button in the card's top right corner
      (four arrows, "Expand table" / "Udvid tabel"). It opens a copy of the table in a dialog: up to 1200 px wide, white
      card, sticky header row, sticky first column on narrow screens, full screen with both-axis scroll on phones.
      Close button, Esc and backdrop close it; focus is kept inside and returns to the button; the page behind does
      not scroll. The table is cloned, not moved, so the article does not jump; links in it keep working.
   Plausible: "Table expanded" (props: path, table = 1-based position of the table on the page).
   Off: data-no-table-expand (or class pw-no-table-expand) on <html>/<body> or on the table / an ancestor.
   In Node the module exports its pure helpers (test/tables.test.js). */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  if (typeof document === 'undefined') return;
  var go = function () { try { api.run(document, window); } catch (e) { if (window.console) console.error('[prowi] tables', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})(this, function () {
  'use strict';
  var SEL = '.pw-post__body table,.pw-term__body table,.pw-model__guide table,.pw-type__longform table,.pw-int__longform table';
  var OFF = '[data-no-table-expand],.pw-no-table-expand';
  var SKIP = '[data-tool],.pw-vis,.pw-embed,.pw-txd';
  var TXT = {
    da: { expand: 'Udvid tabel', close: 'Luk tabel', table: 'Tabel', hint: 'Rul', region: 'Tabel, kan rulles sidelæns' },
    en: { expand: 'Expand table', close: 'Close table', table: 'Table', hint: 'Scroll', region: 'Table, scrolls sideways' }
  };
  var ICON = function (paths) {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      paths.map(function (p) { return '<path d="' + p + '"/>'; }).join('') + '</svg>';
  };
  // four arrows pointing out to the corners / in to the centre
  var I_EXPAND = ICON(['m15 15 6 6', 'm15 9 6-6', 'M21 16v5h-5', 'M21 8V3h-5', 'M3 16v5h5', 'm3 21 6-6', 'M3 8V3h5', 'M9 9 3 3']);
  var I_SHRINK = ICON(['m15 15 6 6m-6-6v4.8m0-4.8h4.8', 'M9 19.8V15m0 0H4.2M9 15l-6 6', 'M15 4.2V9m0 0h4.8M15 9l6-6', 'M9 4.2V9m0 0H4.2M9 9 3 3']);

  /* ---------------- pure helpers ---------------- */
  function langOf(v) { return /^en/i.test(v || '') ? 'en' : 'da'; }
  // columns of a table given its rows as arrays of colspans: the widest row
  function colCount(rows) {
    var n = 0;
    for (var i = 0; i < rows.length; i++) {
      var s = 0;
      for (var k = 0; k < rows[i].length; k++) s += Math.max(1, parseInt(rows[i][k], 10) || 1);
      if (s > n) n = s;
    }
    return n;
  }
  // the expand button: every table with 3+ columns, and any table that does not fit its card
  function showButton(cols, over) { return cols >= 3 || !!over; }
  // narrowest width (px) a table is laid out at before it scrolls: 2 columns always fit the card
  function minWidth(cols) { return cols <= 2 ? 0 : Math.max(480, cols * 132); }
  // the first column stays in place while scrolling when it leaves at least half the card for the rest
  function canStick(firstW, cardW, spans) { return !spans && firstW > 0 && cardW > 0 && firstW <= cardW * 0.5; }
  // a value short enough to keep on one line (a number, an amount, a rate, a word or two)
  function isShort(s) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > 0 && s.length <= 14; }
  function isClear(c) { return !c || c === 'transparent' || /rgba?\([^)]*,\s*0\s*\)$/.test(c) || /\/\s*0%?\s*\)$/.test(c); }

  var HAIR = 'var(--_prowi---pw-border-hairline,rgba(17,6,99,.12))', DARK = 'var(--_prowi---pw-dark-purple,#110663)',
    MUTED = 'var(--_prowi---pw-text-muted,#6664A0)', PURPLE = 'var(--_prowi---pw-purple,#4C39CA)';
  var T = '.pw-tx table.pw-tx__table';
  var CSS =
    // --- inline card
    '.pw-tx{position:relative;max-width:100%;margin:var(--pw-tx-mt,24px) 0 var(--pw-tx-mb,0)}' +
    '.pw-tx--card{background:var(--pw-tx-bg,#fff);border:var(--pw-tx-bd,0);border-radius:var(--pw-tx-r,12px);overflow:hidden;overflow:clip}' +
    '.pw-tx .pw-tx__scroll{max-width:100%;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:rgba(17,6,99,.28) transparent}' +
    '.pw-tx .pw-tx__scroll::-webkit-scrollbar{height:8px}.pw-tx .pw-tx__scroll::-webkit-scrollbar-thumb{background:rgba(17,6,99,.24);border-radius:8px;border:2px solid transparent;background-clip:padding-box}' +
    '.pw-tx .pw-tx__scroll:focus-visible{outline:2px solid ' + PURPLE + ';outline-offset:-2px}' +
    T + '{display:table!important;width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;overflow:visible!important}' +
    // phones: a table with 3+ columns keeps a readable width and scrolls
    '.pw-tx--sm table.pw-tx__table{min-width:var(--pw-tx-min,0)!important}' +
    '.pw-tx--card table.pw-tx__table{border:0!important;border-radius:0!important;background:transparent!important}' +
    '.pw-tx--wrap table.pw-tx__table th{white-space:normal!important}' +
    // ...while short values (12 %, 15.000 kr.) stay on one line when the columns get tight
    '.pw-tx--wrap table.pw-tx__table td.pw-tx__nw{white-space:nowrap}' +
    // room for the button in the header row's last cell, only when its text would run under the button
    '.pw-tx--pad table.pw-tx__table tr:first-child>:last-child{padding-right:48px!important}' +
    // phones: a first column that leaves room for the columns that scroll
    '.pw-tx--narrow table.pw-tx__table tr>:first-child{box-sizing:border-box;width:var(--pw-tx-first,42%);min-width:0;overflow-wrap:anywhere}' +
    '.pw-tx--stick table.pw-tx__table tr>:first-child{position:sticky;left:0;z-index:1;background:var(--pw-tx-cell,#fff)!important}' +
    '.pw-tx--stick.pw-tx--l table.pw-tx__table tr>:first-child{box-shadow:1px 0 0 rgba(17,6,99,.12),10px 0 14px -10px rgba(17,6,99,.28)}' +
    '.pw-tx__fade{position:absolute;top:0;bottom:0;width:44px;z-index:2;pointer-events:none;opacity:0;transition:opacity .2s}' +
    '.pw-tx__fade--r{right:0;background:linear-gradient(270deg,var(--pw-tx-cell,#fff) 0,rgba(255,255,255,0) 100%);box-shadow:inset -10px 0 12px -12px rgba(17,6,99,.45)}' +
    '.pw-tx__fade--l{left:0;background:linear-gradient(90deg,var(--pw-tx-cell,#fff) 0,rgba(255,255,255,0) 100%);box-shadow:inset 10px 0 12px -12px rgba(17,6,99,.45)}' +
    '.pw-tx--over.pw-tx--r .pw-tx__fade--r,.pw-tx--over.pw-tx--l:not(.pw-tx--stick) .pw-tx__fade--l{opacity:1}' +
    '.pw-tx__btn{position:absolute;top:6px;right:6px;z-index:3;display:none;width:30px;height:30px;margin:0;padding:0;align-items:center;justify-content:center;border:1px solid ' + HAIR + ';border-radius:8px;background:var(--pw-tx-cell,#fff);color:' + MUTED + ';cursor:pointer;-webkit-appearance:none;appearance:none;transition:color .15s,border-color .15s,background-color .15s}' +
    '.pw-tx--btn>.pw-tx__btn{display:inline-flex}' +
    '.pw-tx__btn:hover{color:' + PURPLE + ';border-color:' + PURPLE + ';background:#F4F2FF}' +
    '.pw-tx__btn:focus-visible,.pw-txd__close:focus-visible{outline:2px solid ' + PURPLE + ';outline-offset:2px}' +
    '.pw-tx__btn svg,.pw-txd__close svg{display:block;flex:none}' +
    // "Scroll ->" on touch screens: rides the bottom edge of the screen while the card is taller than it (sticky; the
    // card clips with overflow:clip so it is not a scroll box itself), gone after the first sideways scroll
    '.pw-tx__hint{position:-webkit-sticky;position:sticky;bottom:14px;z-index:3;display:none;height:0;text-align:right;pointer-events:none}' +
    '.pw-tx__hint>span{display:inline-block;margin-right:10px;padding:4px 10px;border-radius:999px;background:#110663;color:#fff;font-size:12px;font-weight:500;line-height:1.4;letter-spacing:.01em;white-space:nowrap;transform:translateY(calc(-100% - 10px));box-shadow:0 4px 14px rgba(17,6,99,.25)}' +
    '@media (hover:none),(pointer:coarse){.pw-tx--over.pw-tx--r:not(.pw-tx--seen)>.pw-tx__hint{display:block}}' +
    '@media print{.pw-tx__btn,.pw-tx__hint,.pw-tx__fade,.pw-txd{display:none!important}.pw-tx .pw-tx__scroll{overflow:visible}}' +
    // --- dialog
    '.pw-txd{position:fixed;top:0;right:0;bottom:0;left:0;z-index:9500;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;opacity:0;transition:opacity .18s ease}' +
    '.pw-txd[hidden]{display:none}.pw-txd.is-open{opacity:1}' +
    '.pw-txd *{box-sizing:border-box}' +
    '.pw-txd__backdrop{position:absolute;top:0;right:0;bottom:0;left:0;background:rgba(17,6,99,.5)}' +
    '.pw-txd__panel{position:relative;display:flex;flex-direction:column;width:100%;max-width:1200px;max-height:100%;background:#fff;border:1px solid ' + HAIR + ';border-radius:16px;box-shadow:0 24px 80px rgba(17,6,99,.3);overflow:hidden;color:' + DARK + ';transform:translateY(8px) scale(.985);transition:transform .2s cubic-bezier(.2,.8,.2,1)}' +
    '.pw-txd.is-open .pw-txd__panel{transform:none}' +
    '.pw-txd__bar{flex:none;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 12px 12px 24px;border-bottom:1px solid ' + HAIR + '}' +
    '.pw-txd__title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:16px;font-weight:500;line-height:1.4;letter-spacing:-.005em;color:' + DARK + '}' +
    '.pw-txd__close{flex:none;display:inline-flex;width:36px;height:36px;margin:0;padding:0;align-items:center;justify-content:center;border:1px solid ' + HAIR + ';border-radius:10px;background:#fff;color:' + MUTED + ';cursor:pointer;-webkit-appearance:none;appearance:none;transition:color .15s,border-color .15s,background-color .15s}' +
    '.pw-txd__close:hover{color:' + PURPLE + ';border-color:' + PURPLE + ';background:#F4F2FF}' +
    '.pw-txd__body{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:rgba(17,6,99,.28) transparent}' +
    '.pw-txd__body:focus{outline:none}.pw-txd__body:focus-visible{outline:2px solid ' + PURPLE + ';outline-offset:-2px}' +
    '.pw-txd__table{width:100%;min-width:var(--pw-txd-min,0);margin:0;border:0;border-collapse:separate;border-spacing:0;background:#fff;font-size:16px;line-height:1.5;font-variant-numeric:tabular-nums;color:' + DARK + '}' +
    '.pw-txd__table th,.pw-txd__table td{padding:14px 24px;border:0;border-bottom:1px solid ' + HAIR + ';background:#fff;text-align:left;vertical-align:top;font-size:16px;font-weight:400;line-height:1.5;color:' + DARK + '}' +
    '.pw-txd__table th{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.02em;line-height:1.45;color:' + MUTED + ';vertical-align:bottom}' +
    '.pw-txd__table .pw-txd__hrow>*{position:sticky;top:0;z-index:2;background:#FAF9FF;box-shadow:0 1px 0 rgba(17,6,99,.12)}' +
    '.pw-txd__table tr>:first-child{font-weight:500}' +
    '.pw-txd__table tr:last-child>td{border-bottom:0}' +
    '.pw-txd__table strong,.pw-txd__table b{font-weight:600}' +
    '.pw-txd__table a{color:' + PURPLE + ';text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}' +
    '.pw-txd__table p{margin:0;font:inherit;color:inherit}' +
    '@media (hover:hover){.pw-txd__table tbody tr:hover>td{background:#F7F6FD}}' +
    '@media (max-width:767px){' +
    '.pw-txd{padding:0}' +
    '.pw-txd__panel{height:100%;max-width:none;border:0;border-radius:0;box-shadow:none}' +
    '.pw-txd__bar{padding:10px 10px 10px 16px;padding-top:calc(10px + env(safe-area-inset-top,0px))}' +
    '.pw-txd__table{min-width:var(--pw-txd-minm,0)}' +
    '.pw-txd__table th,.pw-txd__table td{padding:12px 16px;font-size:15px}.pw-txd__table th{font-size:12px}' +
    '.pw-txd__table--stick tr>:first-child{position:sticky;left:0;z-index:1;width:40vw;max-width:40vw;min-width:0;overflow-wrap:anywhere;box-shadow:1px 0 0 rgba(17,6,99,.12)}' +
    '.pw-txd__table--stick .pw-txd__hrow>:first-child{z-index:3;box-shadow:1px 0 0 rgba(17,6,99,.12),0 1px 0 rgba(17,6,99,.12)}' +
    '}' +
    '@media (prefers-reduced-motion:reduce){.pw-txd,.pw-txd__panel,.pw-tx__fade{transition:none}.pw-txd__panel{transform:none}}';

  /* ---------------- page ---------------- */
  function run(doc, win) {
    var html = doc.documentElement, body = doc.body;
    if (!body || win.__pwTables) return;
    if ([html, body].some(function (n) { return n.hasAttribute('data-no-table-expand') || n.classList.contains('pw-no-table-expand'); })) return;
    var tables = Array.prototype.filter.call(doc.querySelectorAll(SEL), function (t) {
      if (t.closest(OFF) || t.closest(SKIP) || t.closest('.pw-tx')) return false;
      return !(t.parentNode && t.parentNode.closest && t.parentNode.closest('table')); // not a table inside a table
    });
    if (!tables.length) return;
    win.__pwTables = 1;
    var L = TXT[langOf(html.getAttribute('lang'))];
    function el(tag, cls, text) { var n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
    if (!doc.getElementById('pw-tx-css')) { var st = el('style'); st.id = 'pw-tx-css'; st.textContent = CSS; (doc.head || html).appendChild(st); }
    function cs(n) { return win.getComputedStyle(n); }
    // the colour behind an element: the first ancestor that paints a background
    function backdropOf(n) {
      for (; n && n.nodeType === 1; n = n.parentNode) { var c = cs(n).backgroundColor; if (!isClear(c)) return c; }
      return '#fff';
    }
    function spansOf(t) { return Array.prototype.map.call(t.rows, function (r) { return Array.prototype.map.call(r.cells, function (c) { return c.colSpan; }); }); }

    var items = tables.map(function (t, i) {
      var s = cs(t), bg = s.backgroundColor, bw = parseFloat(s.borderTopWidth) || 0, sides = bw > 0 && (parseFloat(s.borderLeftWidth) || 0) > 0;
      var isCard = !isClear(bg) || (sides && (parseFloat(s.borderTopLeftRadius) || 0) > 0);
      var card = el('div', 'pw-tx' + (isCard ? ' pw-tx--card' : '')), scroll = t.parentNode;
      card.style.setProperty('--pw-tx-mt', s.marginTop); card.style.setProperty('--pw-tx-mb', s.marginBottom);
      if (isCard) {
        if (!isClear(bg)) card.style.setProperty('--pw-tx-bg', bg);
        card.style.setProperty('--pw-tx-bd', sides ? bw + 'px ' + s.borderTopStyle + ' ' + s.borderTopColor : '0');
        card.style.setProperty('--pw-tx-r', s.borderTopLeftRadius);
      }
      card.style.setProperty('--pw-tx-cell', !isClear(bg) ? bg : backdropOf(t.parentNode));
      var cols = colCount(spansOf(t)), mw = minWidth(cols);
      if (mw) card.style.setProperty('--pw-tx-min', mw + 'px');
      // the scroll box: the wrapper cms-insider.js adds on posts, or a new one
      if (!(scroll.classList && scroll.classList.contains('pw-post__table-scroll') && scroll.children.length === 1)) {
        scroll = el('div'); t.parentNode.insertBefore(scroll, t); scroll.appendChild(t);
      }
      scroll.classList.add('pw-tx__scroll');
      scroll.parentNode.insertBefore(card, scroll); card.appendChild(scroll);
      t.classList.add('pw-tx__table');
      Array.prototype.forEach.call(t.querySelectorAll('td'), function (c) { if (isShort(c.textContent)) c.classList.add('pw-tx__nw'); });
      var fl = el('span', 'pw-tx__fade pw-tx__fade--l'), fr = el('span', 'pw-tx__fade pw-tx__fade--r'), hint = el('span', 'pw-tx__hint');
      hint.appendChild(el('span', '', L.hint + ' \u2192'));
      [fl, fr, hint].forEach(function (n) { n.setAttribute('aria-hidden', 'true'); card.appendChild(n); });
      var btn = el('button', 'pw-tx__btn'); btn.type = 'button'; btn.innerHTML = I_EXPAND;
      btn.setAttribute('aria-label', L.expand); btn.setAttribute('title', L.expand); btn.setAttribute('aria-haspopup', 'dialog');
      card.appendChild(btn);
      var it = { t: t, card: card, scroll: scroll, btn: btn, cols: cols, i: i, w: -1 };
      btn.addEventListener('click', function (e) { e.preventDefault(); openDialog(it); });
      scroll.addEventListener('scroll', function () { if (scroll.scrollLeft > 4) card.classList.add('pw-tx--seen'); edges(it); }, { passive: true });
      return it;
    });

    function edges(it) {
      var sc = it.scroll, max = sc.scrollWidth - sc.clientWidth;
      it.card.classList.toggle('pw-tx--l', sc.scrollLeft > 2);
      it.card.classList.toggle('pw-tx--r', sc.scrollLeft < max - 2);
    }
    // fit the table to its card: as authored -> headers may wrap -> scroll inside the card (first column kept)
    function layout(it, force) {
      var c = it.card, sc = it.scroll, w = c.clientWidth;
      if (!w || (!force && w === it.w)) return;
      it.w = w;
      var fits = function () { return sc.scrollWidth <= sc.clientWidth + 1; };
      c.classList.remove('pw-tx--wrap', 'pw-tx--over', 'pw-tx--narrow', 'pw-tx--stick', 'pw-tx--pad');
      c.classList.toggle('pw-tx--sm', w < 520);
      var over = !fits();
      if (over) { c.classList.add('pw-tx--wrap'); over = !fits(); }
      var show = showButton(it.cols, over), row = it.t.rows[0], last = row && row.cells[row.cells.length - 1];
      c.classList.toggle('pw-tx--btn', show);
      if (show && last && doc.createRange) {
        // the button sits over the top right corner: keep the last header cell's text clear of it
        var rg = doc.createRange(); rg.selectNodeContents(last);
        var tr = rg.getBoundingClientRect(), cr = last.getBoundingClientRect();
        if (tr.width && tr.right > cr.right - 44 && tr.top < cr.top + 40) {
          c.classList.add('pw-tx--pad');
          if (!over) { over = !fits(); if (over && !c.classList.contains('pw-tx--wrap')) { c.classList.add('pw-tx--wrap'); over = !fits(); } }
        }
      }
      if (over) {
        c.classList.add('pw-tx--over');
        if (w < 520) { c.style.setProperty('--pw-tx-first', Math.round(sc.clientWidth * 0.42) + 'px'); c.classList.add('pw-tx--narrow'); }
        var first = it.t.rows[0] && it.t.rows[0].cells[0];
        var spans = Array.prototype.some.call(it.t.rows, function (r) { return r.cells[0] && r.cells[0].colSpan > 1; });
        if (first && canStick(first.offsetWidth, sc.clientWidth, spans)) c.classList.add('pw-tx--stick');
        sc.setAttribute('tabindex', '0'); sc.setAttribute('role', 'region'); sc.setAttribute('aria-label', L.region);
      } else {
        c.classList.remove('pw-tx--seen');
        sc.removeAttribute('tabindex'); sc.removeAttribute('role'); sc.removeAttribute('aria-label');
      }
      edges(it);
    }
    items.forEach(function (it) { layout(it, true); });
    var relayout = function (force) { items.forEach(function (it) { layout(it, force === true); }); };
    if (win.ResizeObserver) { var ro = new win.ResizeObserver(function () { relayout(); }); items.forEach(function (it) { ro.observe(it.card); }); }
    else win.addEventListener('resize', relayout);
    if (doc.fonts && doc.fonts.ready && doc.fonts.ready.then) doc.fonts.ready.then(function () { relayout(true); });

    /* ---- dialog (built on first use, one per page) ---- */
    var dlg = null, panel, title, closeBtn, box, opener = null, cur = null, lock = null, hideT = 0;
    var reduce = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
    function build() {
      dlg = el('div', 'pw-txd'); dlg.hidden = true;
      var bd = el('div', 'pw-txd__backdrop'); bd.setAttribute('aria-hidden', 'true');
      panel = el('div', 'pw-txd__panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
      var bar = el('div', 'pw-txd__bar'); title = el('span', 'pw-txd__title');
      closeBtn = el('button', 'pw-txd__close'); closeBtn.type = 'button'; closeBtn.innerHTML = I_SHRINK;
      closeBtn.setAttribute('aria-label', L.close); closeBtn.setAttribute('title', L.close);
      box = el('div', 'pw-txd__body'); box.setAttribute('tabindex', '0');
      bar.appendChild(title); bar.appendChild(closeBtn); panel.appendChild(bar); panel.appendChild(box);
      dlg.appendChild(bd); dlg.appendChild(panel); body.appendChild(dlg);
      bd.addEventListener('click', closeDialog);
      // a click on the padding around the panel is a click on the backdrop too
      dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDialog(); });
      closeBtn.addEventListener('click', function (e) { e.preventDefault(); closeDialog(); });
      // a link to a place on this page: close first, so the reader sees where it goes
      box.addEventListener('click', function (e) {
        var a = e.target && e.target.closest && e.target.closest('a[href]');
        if (a && /^#/.test(a.getAttribute('href') || '')) closeDialog(true);
      });
      doc.addEventListener('keydown', function (e) {
        if (!cur) return;
        if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); e.stopPropagation(); closeDialog(); return; }
        if (e.key !== 'Tab') return;
        var f = Array.prototype.filter.call(panel.querySelectorAll('a[href],button,[tabindex]:not([tabindex="-1"])'), function (n) { return n.offsetParent !== null || n === box; });
        if (!f.length) { e.preventDefault(); return; }
        var a = doc.activeElement, first = f[0], last = f[f.length - 1];
        if (!panel.contains(a)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
      }, true);
      // focus that leaves the dialog some other way (a click in the browser chrome and back) is brought back
      doc.addEventListener('focusin', function (e) { if (cur && !panel.contains(e.target)) try { closeBtn.focus({ preventScroll: true }); } catch (er) { /* old browser */ } });
    }
    // the heading the table sits under names the dialog
    function titleFor(it) {
      var cap = it.t.querySelector('caption');
      if (cap && cap.textContent.trim()) return cap.textContent.replace(/\s+/g, ' ').trim();
      var n = it.card;
      for (var k = 0; n && k < 40; k++) {
        var p = n.previousElementSibling;
        if (!p) { n = n.parentNode; if (!n || !n.matches || n.matches('.pw-post__body,.pw-term__body,.pw-model__guide,.pw-type__longform,.pw-int__longform')) break; continue; }
        n = p;
        if (/^H[1-6]$/.test(n.tagName) && n.textContent.trim() && n.style.display !== 'none') return n.textContent.replace(/\s+/g, ' ').trim();
      }
      return L.table;
    }
    function openDialog(it) {
      if (cur) return;
      if (!dlg) build();
      clearTimeout(hideT);
      var c = it.t.cloneNode(true);
      c.removeAttribute('id'); c.removeAttribute('style'); c.removeAttribute('width'); c.className = 'pw-txd__table';
      Array.prototype.forEach.call(c.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
      Array.prototype.forEach.call(c.querySelectorAll('col,colgroup'), function (n) { n.parentNode.removeChild(n); });
      Array.prototype.forEach.call(c.querySelectorAll('th,td,tr'), function (n) { n.removeAttribute('width'); if (n.style) { n.style.width = ''; n.style.minWidth = ''; n.style.position = ''; } });
      // header: the thead rows, or a first row made of th cells
      var hr = c.tHead ? Array.prototype.slice.call(c.tHead.rows) : (c.rows[0] && c.rows[0].querySelector('th') && !c.rows[0].querySelector('td') ? [c.rows[0]] : []);
      if (hr.length === 1) hr[0].classList.add('pw-txd__hrow');
      var spans = Array.prototype.some.call(c.rows, function (r) { return r.cells[0] && r.cells[0].colSpan > 1; });
      if (!spans && it.cols >= 3) c.classList.add('pw-txd__table--stick');
      c.style.setProperty('--pw-txd-min', it.cols * 110 + 'px');
      c.style.setProperty('--pw-txd-minm', (it.cols <= 2 ? 0 : it.cols * 150) + 'px');
      var name = titleFor(it);
      title.textContent = name; panel.setAttribute('aria-label', name);
      while (box.firstChild) box.removeChild(box.firstChild);
      box.appendChild(c); box.scrollTop = 0; box.scrollLeft = 0;
      opener = it.btn; cur = it;
      // the page behind stays put (and does not shift when its scrollbar goes)
      var sbw = win.innerWidth - html.clientWidth;
      lock = { o: body.style.overflow, p: body.style.paddingRight };
      body.style.overflow = 'hidden';
      if (sbw > 0) body.style.paddingRight = (parseFloat(cs(body).paddingRight) || 0) + sbw + 'px';
      dlg.hidden = false;
      void dlg.offsetWidth; // start the fade from 0
      dlg.classList.add('is-open');
      it.btn.setAttribute('aria-expanded', 'true');
      try { closeBtn.focus({ preventScroll: true }); } catch (e) { closeBtn.focus(); }
      try { if (win.plausible) win.plausible('Table expanded', { props: { path: (win.location && win.location.pathname) || '', table: it.i + 1 } }); } catch (e) { /* analytics off */ }
    }
    function closeDialog(keepFocus) {
      if (!cur) return;
      var it = cur; cur = null;
      dlg.classList.remove('is-open');
      it.btn.removeAttribute('aria-expanded');
      if (lock) { body.style.overflow = lock.o; body.style.paddingRight = lock.p; lock = null; }
      var done = function () { if (!cur) { dlg.hidden = true; while (box.firstChild) box.removeChild(box.firstChild); } };
      if (reduce) done(); else hideT = setTimeout(done, 200);
      if (keepFocus !== true && opener && opener.focus) try { opener.focus({ preventScroll: true }); } catch (e) { opener.focus(); }
      opener = null;
    }
  }

  return { run: run, colCount: colCount, showButton: showButton, minWidth: minWidth, canStick: canStick, isClear: isClear, isShort: isShort, langOf: langOf, TXT: TXT, SEL: SEL };
});
