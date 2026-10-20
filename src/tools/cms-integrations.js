/* Integrations hub (/integrationer) and integration template (/integrationer/<slug>).
   Ported from the INTEGRATIONS / INTEGRATION DETAIL blocks of "Prowi Pages.dc.html".
   Hub: search box (span[data-input] -> input), category chips, live/planned counts per group, "n af N" total, empty state.
   Both: logo fallback marks get the design's initial + hue; the template's "more" list drops the current item and keeps 4. */
(function () {
  var hub = document.querySelector('[data-cms-hub="integrations"]');
  var item = document.querySelector('[data-cms-item="integrations"]');
  if (!hub && !item) return;
  var EN = /^en/i.test(document.documentElement.lang || '');
  if (!document.getElementById('pw-integr-css')) {
    var st = document.createElement('style'); st.id = 'pw-integr-css';
    st.textContent = 'input.pw-integr__search-input{font-family:inherit;line-height:normal;padding:0;-webkit-appearance:none;appearance:none}' +
      'input.pw-integr__search-input::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}' +
      'input.pw-integr__search-input::placeholder{color:var(--_prowi---pw-text-placeholder,#A1A0BD);opacity:1}' +
      '.pw-integr__chip,.pw-integr__chip-on{user-select:none}' +
      '.pw-integr__empty{padding:48px 24px;text-align:center;border:1px solid var(--_prowi---pw-border-hairline,rgba(17,6,99,.1));display:flex;flex-direction:column;gap:8px;align-items:center}' +
      '.pw-integr__empty-title{font-size:18px;font-weight:400;color:var(--_prowi---pw-dark-purple,#110663)}' +
      '.pw-integr__empty-text{font-size:14px;color:var(--_prowi---pw-text-muted,#6664A0)}' +
      '@keyframes pwIntegrIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +
      '.pw-integr__in{animation:pwIntegrIn 420ms cubic-bezier(.2,.6,.2,1) both}' +
      '@media (prefers-reduced-motion:reduce){.pw-integr__in{animation:none}}';
    document.head.appendChild(st);
  }
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };
  var visible = function (el) { return el && !/\bw-condition-invisible\b/.test(el.className) && el.style.display !== 'none'; };

  // Webflow cannot do negated / option-value conditions via our build, so they are resolved here:
  // status pills (a hidden span[data-status-text] carries the Status option) and "!logo" fallback marks.
  var scopeOf = function (el) { return el.closest('.w-dyn-item') || item || hub || document; };
  each(document.querySelectorAll('[data-status-text]'), function (st) {
    var sc = scopeOf(st), planned = /future/i.test(st.textContent || '');
    each(sc.querySelectorAll('.pw-integr__pill-live'), function (p) { if (scopeOf(p) === sc) p.style.display = planned ? 'none' : ''; });
    each(sc.querySelectorAll('.pw-integr__pill-planned'), function (p) { if (scopeOf(p) === sc) p.style.display = planned ? '' : 'none'; });
  });
  each(document.querySelectorAll('[data-if="!logo"]'), function (m) {
    var sc = scopeOf(m), img = null;
    each(sc.querySelectorAll('img'), function (i) { if (!img && scopeOf(i) === sc && /logo/.test(i.className)) img = i; });
    var has = img && !/\bw-dyn-bind-empty\b/.test(img.className) && (img.getAttribute('src') || '').length > 0;
    m.style.display = has ? 'none' : '';
  });

  // logo fallback: first letter + hue from the name (design intMark)
  each(document.querySelectorAll('.pw-integr__mark, .pw-int__mark-lg, .pw-int__more-mark'), function (m) {
    var n = (m.textContent || '').trim(); if (!n) return;
    var hue = 0; for (var i = 0; i < n.length; i++) hue += n.charCodeAt(i);
    m.textContent = n.charAt(0).toUpperCase();
    m.style.background = 'oklch(0.55 0.12 ' + (hue % 360) + ')';
  });

  if (item) {
    var here = location.pathname.replace(/\/+$/, '');
    var curName = ((item.querySelector('.pw-int__crumb-current') || {}).textContent || '').trim();
    each(item.querySelectorAll('.pw-int__more'), function (list) {
      var cards = list.querySelectorAll('.pw-int__more-card'), kept = 0, curType = null;
      var isOwn = function (a) {
        var path = (a.getAttribute('href') || '').replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, '');
        var nm = ((a.querySelector('.pw-int__more-name') || {}).textContent || '').trim();
        return (path && (path === here || (here.slice(-path.length) === path && /\//.test(path)))) || (curName && nm === curName);
      };
      var typeOf = function (a) { var t = (a.closest('.w-dyn-item') || a).querySelector('[data-type-text]'); return t ? t.textContent.trim() : null; };
      each(cards, function (a) { if (curType === null && isOwn(a)) curType = typeOf(a); });
      each(cards, function (a) {
        var box = a.closest('.w-dyn-item') || a;
        var other = curType !== null && typeOf(a) !== curType;
        if (isOwn(a) || other || kept >= 4) box.style.display = 'none'; else kept++;
      });
      if (!kept) { var band = list.closest('.pw-faq-block'); if (band && band.parentNode) band.parentNode.style.display = 'none'; }
    });
  }

  if (!hub) return;
  var T = EN ? { of: ' of ', planned: ' planned', none: 'Nothing matches', hint: 'Use the API below, or ask us to build it.' }
             : { of: ' af ', planned: ' planlagt', none: 'Intet matcher', hint: 'Brug API’et herunder, eller bed os bygge det.' };
  var groups = [], total = 0;
  each(hub.querySelectorAll('.pw-integr__groups > [data-cat]'), function (g) {
    var label = (g.querySelector('.pw-label') || g).textContent.trim();
    var cards = [];
    each(g.querySelectorAll('.pw-integr__card'), function (a) {
      var live = visible(a.querySelector('.pw-integr__pill-live'));
      var text = [label, g.getAttribute('data-cat')];
      each(a.querySelectorAll('.pw-integr__name, .pw-integr__tagline'), function (s) { text.push(s.textContent); });
      cards.push({ el: a, box: a.closest('.w-dyn-item') || a, live: live, text: text.join(' ').toLowerCase() });
    });
    total += cards.length;
    groups.push({ el: g, key: g.getAttribute('data-cat'), cards: cards, count: g.querySelector('[data-count]') });
  });
  var chips = hub.querySelectorAll('.pw-integr__chips [data-cat]');
  var totalEl = hub.querySelector('[data-total]');
  var q = '', cat = '';

  // empty state, placed after the last group
  var empty = document.createElement('div'); empty.className = 'pw-integr__empty'; empty.style.display = 'none';
  var et = document.createElement('span'); et.className = 'pw-integr__empty-title';
  var eh = document.createElement('span'); eh.className = 'pw-integr__empty-text'; eh.textContent = T.hint;
  empty.appendChild(et); empty.appendChild(eh);
  if (groups.length) { var last = groups[groups.length - 1].el; last.parentNode.insertBefore(empty, last.nextSibling); }

  function render(animate) {
    var shown = 0, gi = 0;
    groups.forEach(function (g) {
      var live = 0, planned = 0;
      g.cards.forEach(function (c) {
        var on = (!cat || cat === g.key) && (!q || c.text.indexOf(q) !== -1);
        c.box.style.display = on ? '' : 'none';
        if (on) { shown++; if (c.live) live++; else planned++; }
      });
      var any = live + planned > 0;
      g.el.style.display = any ? '' : 'none';
      if (g.count) g.count.textContent = live + ' live' + (planned ? ' · ' + planned + T.planned : '');
      if (any && animate) {
        g.el.classList.remove('pw-integr__in'); void g.el.offsetWidth;
        g.el.style.animationDelay = (gi * 60) + 'ms'; g.el.classList.add('pw-integr__in');
      }
      if (any) gi++;
    });
    if (totalEl) totalEl.textContent = shown + T.of + total;
    empty.style.display = shown ? 'none' : '';
    et.textContent = T.none + ' “' + q + '”';
    each(chips, function (c) {
      var sel = (c.getAttribute('data-cat') || '') === cat;
      c.className = c.className.replace(/\bpw-integr__chip(-on)?\b/, sel ? 'pw-integr__chip-on' : 'pw-integr__chip');
      c.setAttribute('aria-pressed', sel ? 'true' : 'false');
    });
  }

  // sort live first inside each group (stable; CMS order is sort-order asc)
  groups.forEach(function (g) {
    var lst = g.cards.slice().sort(function (a, b) { return (a.live === b.live) ? g.cards.indexOf(a) - g.cards.indexOf(b) : (a.live ? -1 : 1); });
    lst.forEach(function (c) { c.box.parentNode.appendChild(c.box); });
  });

  each(chips, function (c) {
    c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0');
    var go = function (e) { e.preventDefault(); var k = c.getAttribute('data-cat') || ''; cat = (cat === k) ? '' : k; render(true); };
    c.addEventListener('click', go);
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') go(e); });
  });

  each(hub.querySelectorAll('[data-input="q"]'), function (span) {
    var inp = document.createElement('input');
    inp.type = 'search'; inp.className = span.className; inp.setAttribute('data-input', 'q');
    inp.placeholder = span.textContent.trim();
    inp.setAttribute('aria-label', span.getAttribute('aria-label') || inp.placeholder);
    span.parentNode.replaceChild(inp, span);
    inp.addEventListener('input', function () { q = inp.value.trim().toLowerCase(); render(true); });
  });
  render(false);
})();
