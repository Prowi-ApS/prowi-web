/* Commission glossary (CMS "terms"): hub search + A-Z filter + letter grouping, and the term page's letter, "n af m" and previous/next.
   Hub root: [data-gloss="hub"]. The CMS renders one flat list (name asc) inside the first [data-gloss-group]; this module groups it by first letter.
   Term root: [data-term="page"]. A hidden list of all terms ([data-term-index]) gives the order for position and previous/next. */
(function () {
  var isEn = /^en/i.test(document.documentElement.lang || '');
  var LOC = isEn ? 'en' : 'da';
  function of(n, m) { return n + (isEn ? ' of ' : ' af ') + m; }
  function txt(el) { return (el && el.textContent || '').replace(/\s+/g, ' ').trim(); }
  function letterOf(s) {
    var c = (s || '').trim().charAt(0).toUpperCase();
    var b = c.normalize ? c.normalize('NFD').charAt(0) : c;
    return /[A-Z]/.test(b) ? b : (c || '#');
  }
  function lastSeg(h) { return (h || '').replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop(); }
  function cmp(a, b) { return a.localeCompare(b, LOC, { sensitivity: 'base' }); }

  function hub(root) {
    var group0 = root.querySelector('[data-gloss-group]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.pw-gloss__card'));
    if (!group0 || !cards.length) return;
    if (!document.getElementById('pw-gloss-css')) {
      var st = document.createElement('style'); st.id = 'pw-gloss-css';
      st.textContent = '.pw-gloss__letter--on{background:var(--_prowi---pw-dark-purple,#110663);color:#fff;transform:scale(1.08)}' +
        '@keyframes pwGlossIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
        '.pw-gloss__group--in{animation:pwGlossIn 420ms cubic-bezier(.2,.6,.2,1) both}' +
        '@media (prefers-reduced-motion:reduce){.pw-gloss__group--in{animation:none}.pw-gloss__letter--on{transform:none}}';
      document.head.appendChild(st);
    }
    // one entry per card: the element that sits directly in the CMS list (Webflow item div, or the card itself)
    var items = cards.map(function (a) {
      var unit = a.closest('.w-dyn-item') || a;
      var nm = txt(a.querySelector('.pw-gloss__card-name'));
      return { unit: unit, name: nm, L: letterOf(nm), hay: (nm + ' ' + txt(a.querySelector('.pw-gloss__card-text'))).toLowerCase() };
    });
    var box = items[0].unit.parentElement;
    box.setAttribute('data-gloss-items', '1');
    items.sort(function (a, b) { return cmp(a.name, b.name); });
    var letters = [];
    items.forEach(function (it) { if (letters.indexOf(it.L) < 0) letters.push(it.L); });
    letters.sort(function (a, b) { return cmp(a, b); });
    // build one group per letter (the first group is the CMS one, the rest are clones of it)
    var groups = {}, prev = null;
    letters.forEach(function (L, i) {
      var g = i ? group0.cloneNode(true) : group0;
      var b = g.querySelector('[data-gloss-items]');
      if (i) {
        while (b.firstChild) b.removeChild(b.firstChild);
        g.querySelectorAll('[id]').forEach(function (x) { x.removeAttribute('id'); });
        // clones are not known to the site's scroll reveal: show them as they are
        [g].concat(Array.prototype.slice.call(g.querySelectorAll('[data-pw-rv]'))).forEach(function (x) {
          if (x.hasAttribute('data-pw-rv')) { x.removeAttribute('data-pw-rv'); x.style.transitionDelay = ''; }
        });
        prev.parentNode.insertBefore(g, prev.nextSibling);
      }
      g.id = 'g-' + L;
      var lt = g.querySelector('[data-gloss-letter]') || g.querySelector('.pw-gloss__group-letter');
      if (lt) lt.textContent = L;
      groups[L] = { el: g, box: b, n: 0 };
      prev = g;
    });
    items.forEach(function (it) { groups[it.L].box.appendChild(it.unit); });

    var countEl = root.querySelector('[data-gloss-count]');
    var empty = root.querySelector('[data-gloss-empty]');
    var emptyQ = root.querySelector('[data-gloss-empty-q]');
    var btns = Array.prototype.slice.call(root.querySelectorAll('[data-letter]'));
    var state = { q: '', L: '' };

    // search field: the static span becomes a real input
    var ph = root.querySelector('[data-input="q"]'), input = null;
    if (ph) {
      input = document.createElement('input');
      input.type = 'search'; input.className = ph.className; input.value = '';
      input.placeholder = isEn ? 'Search terms, e.g. accelerator, ARR, clawback' : txt(ph);
      input.setAttribute('aria-label', isEn ? 'Search the glossary' : (ph.getAttribute('aria-label') || 'Søg i ordbogen'));
      input.setAttribute('autocomplete', 'off');
      ph.parentNode.replaceChild(input, ph);
      input.addEventListener('input', function () { state.q = input.value.trim().toLowerCase(); render(true); });
    }
    btns.forEach(function (b) {
      b.setAttribute('role', 'button');
      b.addEventListener('click', function (e) {
        e.preventDefault();
        if (b.getAttribute('aria-disabled') === 'true') return;
        var L = b.getAttribute('data-letter');
        state.L = state.L === L ? '' : L;
        render(true);
      });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); } });
    });

    function render(anim) {
      var avail = {}, n = 0;
      Object.keys(groups).forEach(function (L) { groups[L].n = 0; });
      items.forEach(function (it) {
        var hitQ = !state.q || it.hay.indexOf(state.q) >= 0;
        if (hitQ) avail[it.L] = true;
        var show = hitQ && (!state.L || it.L === state.L);
        it.unit.style.display = show ? '' : 'none';
        if (show) { groups[it.L].n++; n++; }
      });
      Object.keys(groups).forEach(function (L) {
        var g = groups[L].el, on = groups[L].n > 0;
        g.style.display = on ? '' : 'none';
        if (anim && on) { g.classList.remove('pw-gloss__group--in'); void g.offsetWidth; g.classList.add('pw-gloss__group--in'); }
      });
      btns.forEach(function (b) {
        var L = b.getAttribute('data-letter'), on = !!avail[L], sel = state.L === L;
        b.className = on ? 'pw-gloss__letter' + (sel ? ' pw-gloss__letter--on' : '') : 'pw-gloss__letter--off';
        b.setAttribute('aria-disabled', on ? 'false' : 'true');
        b.setAttribute('aria-pressed', sel ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      if (countEl) countEl.textContent = of(n, items.length);
      if (empty) {
        empty.style.display = n ? 'none' : 'flex';
        if (emptyQ) emptyQ.textContent = (isEn ? 'Nothing matches “' : 'Intet matcher “') + (input ? input.value.trim() : '') + '”';
      }
    }
    render(false);
  }

  function term(root) {
    var h1 = root.querySelector('h1');
    var name = txt(h1);
    root.querySelectorAll('[data-term-letter]').forEach(function (el) { el.textContent = letterOf(name); });
    var idx = root.querySelector('[data-term-index]');
    var pos = root.querySelector('[data-term-pos]');
    var list = idx ? Array.prototype.slice.call(idx.querySelectorAll('a[href]')).map(function (a) {
      return { name: txt(a), href: a.getAttribute('href'), seg: lastSeg(a.getAttribute('href')) };
    }) : [];
    list.sort(function (a, b) { return cmp(a.name, b.name); });
    var here = lastSeg(location.pathname), i = -1;
    for (var k = 0; k < list.length; k++) if (list[k].seg === here) { i = k; break; }
    if (i < 0) for (k = 0; k < list.length; k++) if (list[k].name === name) { i = k; break; }
    if (pos) { if (i >= 0) pos.textContent = of(i + 1, list.length); else pos.parentNode.style.visibility = 'hidden'; }
    function nav(which, t) {
      var a = root.querySelector('[data-term-nav="' + which + '"]');
      if (!a) return;
      if (!t) { a.style.display = 'none'; return; }
      a.setAttribute('href', t.href);
      var nm = a.querySelector('[data-term-nav-name]') || a.querySelector('.pw-term__nav-name');
      if (nm) nm.textContent = t.name;
      a.style.display = 'flex';
    }
    if (i >= 0) { nav('prev', list[i - 1]); nav('next', list[i + 1]); }
  }

  function init() {
    var h = document.querySelector('[data-gloss="hub"]'); if (h) hub(h);
    var t = document.querySelector('[data-term="page"]'); if (t) term(t);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
