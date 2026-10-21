/* Prowi Insider: hub (/prowi-insider, root [data-insider="hub"]) and post template (/post/<slug>, root [data-insider="post"]).
   Port of the insider/article blocks in Prowi Pages.dc.html.
   Hub: search + topic chips over the Webflow collection list, live count, empty state, featured card hidden from the grid.
   Post: duplicate title heading hidden, tables wrapped for scrolling, numbered table of contents built from the body's h2s,
   current item removed from "Keep reading". Category labels come from an Option field (same Danish names in every locale),
   so they are translated here on English pages. */
(function () {
  var hubRoot = document.querySelector('[data-insider="hub"]');
  var postRoot = document.querySelector('[data-insider="post"]');
  if (!hubRoot && !postRoot) return;

  var isEn = String(document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var CAT_EN = {
    'Incitamenter': 'Incentives', 'Automatisering': 'Automation', 'Transparens': 'Transparency', 'Compliance': 'Compliance',
    'Forecasting': 'Forecasting', 'Motivation': 'Motivation', 'Produktopdateringer': 'Product updates', 'Kultur': 'Culture',
    'Data & Indsigt': 'Data & insights', 'Case': 'Case', 'Vækst': 'Growth'
  };
  var T = isEn ? {
    count: '{n} of {t}', all: 'All', empty: 'Nothing matches “{q}”',
    placeholder: 'Search articles, e.g. accelerators, OTE, clawback', aria: 'Search articles'
  } : {
    count: '{n} af {t}', all: 'Alle', empty: 'Ingen artikler matcher “{q}”',
    placeholder: 'Søg i artikler, fx accelerator, OTE, clawback', aria: 'Søg i artikler'
  };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function txt(el) { return el ? String(el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function catLabel(daName) { return isEn ? (CAT_EN[daName] || daName) : daName; }

  // Category labels: remember the Danish option name, show the English label on /en pages.
  each(document.querySelectorAll('[data-insider-cat]'), function (el) {
    var da = txt(el);
    el.setAttribute('data-cat-da', da);
    if (isEn && CAT_EN[da] && CAT_EN[da] !== da) el.textContent = CAT_EN[da];
  });

  if (!document.getElementById('pw-insider-css')) {
    var st = document.createElement('style');
    st.id = 'pw-insider-css';
    st.textContent = '@keyframes pwInsiderIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +
      '.pw-post__table-scroll{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}' +
      '.pw-post__table-scroll > table{min-width:480px}';
    document.head.appendChild(st);
  }

  function slugOf(a) {
    var h = (a && a.getAttribute('href')) || '';
    return h.replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop();
  }

  // ---------------- HUB ----------------
  if (hubRoot) (function () {
    var grid = hubRoot.querySelector('[data-insider-grid]');
    var cards = grid ? grid.querySelectorAll('a[href]') : [];
    if (!cards.length && grid) cards = grid.querySelectorAll('.pw-insider__card');
    var featureWrap = hubRoot.querySelector('[data-insider-feature]');
    var feature = featureWrap && featureWrap.querySelector('a');
    var featureSlug = slugOf(feature);
    var countEl = hubRoot.querySelector('[data-insider-count]');
    var empty = hubRoot.querySelector('[data-insider-empty]');
    var emptyQ = hubRoot.querySelector('[data-insider-empty-q]');
    var chipsBox = hubRoot.querySelector('.pw-insider__chips');

    var items = [];
    each(cards, function (a) {
      var catEl = a.querySelector('[data-insider-cat]');
      var cat = catEl ? catEl.getAttribute('data-cat-da') || txt(catEl) : '';
      var hay = (cat + ' ' + catLabel(cat) + ' ' + txt(a)).toLowerCase();
      items.push({ el: a, cat: cat, hay: hay, slug: slugOf(a), wrap: a.closest('[role="listitem"], .w-dyn-item') || a });
    });

    // chips: the static ones carry data-cat (Danish option name); add a chip for any other topic found in the list
    var chips = chipsBox ? Array.prototype.slice.call(chipsBox.querySelectorAll('[data-cat]')) : [];
    var known = {}; chips.forEach(function (c) { known[c.getAttribute('data-cat')] = 1; });
    var tplChip = chips.filter(function (c) { return c.getAttribute('data-cat'); })[0];
    items.forEach(function (it) {
      if (!it.cat || known[it.cat] || !tplChip) return;
      known[it.cat] = 1;
      var c = tplChip.cloneNode(true);
      c.setAttribute('data-cat', it.cat);
      (c.querySelector('span') || c).textContent = catLabel(it.cat);
      chipsBox.appendChild(c); chips.push(c);
    });
    chips.forEach(function (c) {
      var k = c.getAttribute('data-cat');
      var label = k ? catLabel(k) : T.all;
      (c.querySelector('span') || c).textContent = label;
      c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0');
    });

    // search: swap the placeholder span for a real input
    var input = null;
    var span = hubRoot.querySelector('[data-input="q"]');
    if (span) {
      input = document.createElement('input');
      input.type = 'search';
      input.className = span.className;
      input.placeholder = T.placeholder;
      input.setAttribute('aria-label', T.aria);
      input.setAttribute('autocomplete', 'off');
      span.parentNode.replaceChild(input, span);
    }

    var state = { q: '', cat: '' };
    function render(animate) {
      var q = state.q.trim().toLowerCase(), c = state.cat;
      var searchHits = items.filter(function (it) { return !q || it.hay.indexOf(q) !== -1; });
      var hits = searchHits.filter(function (it) { return !c || it.cat === c; });
      var showFeature = !q && !c && !!feature;
      if (featureWrap) featureWrap.style.display = showFeature ? '' : 'none';
      var shown = 0;
      items.forEach(function (it) {
        var on = hits.indexOf(it) !== -1 && !(showFeature && it.slug === featureSlug);
        it.wrap.style.display = on ? '' : 'none';
        if (on && animate && !reduce) {
          it.el.style.animation = 'none'; void it.el.offsetWidth;
          it.el.style.animation = 'pwInsiderIn 420ms cubic-bezier(0.2,0.6,0.2,1) ' + Math.min(shown, 11) * 35 + 'ms both';
        }
        if (on) shown++;
      });
      if (grid) grid.style.display = shown ? '' : 'none';
      if (countEl) countEl.textContent = T.count.replace('{n}', hits.length).replace('{t}', items.length);
      chips.forEach(function (ch) {
        var k = ch.getAttribute('data-cat') || '';
        var sel = k === c;
        var n = k ? searchHits.filter(function (it) { return it.cat === k; }).length : searchHits.length;
        ch.className = ch.className.replace(/\bpw-insider__chip(--on)?\b/, sel ? 'pw-insider__chip--on' : 'pw-insider__chip');
        ch.style.color = sel ? '' : (n ? '' : '#C4C2D8');
        ch.setAttribute('aria-pressed', sel ? 'true' : 'false');
      });
      if (empty) {
        empty.style.display = hits.length ? 'none' : 'flex';
        if (emptyQ) emptyQ.textContent = T.empty.replace('{q}', state.q.trim());
      }
    }
    chips.forEach(function (ch) {
      function go(e) {
        if (e) e.preventDefault();
        var k = ch.getAttribute('data-cat') || '';
        state.cat = state.cat === k ? '' : k;
        render(true);
      }
      ch.addEventListener('click', go);
      ch.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') go(e); });
    });
    if (input) input.addEventListener('input', function () { state.q = input.value; render(true); });
    render(false);
  })();

  // ---------------- POST ----------------
  if (postRoot) (function () {
    var body = postRoot.querySelector('[data-rt="post-body"], .pw-post__body');
    var titleEl = postRoot.querySelector('.pw-post__title');
    function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9æøå]+/g, ' ').trim(); }

    if (body) {
      // 1. hide a leading heading that repeats the item name (many live posts start with <h2>Title</h2>)
      var first = body.firstElementChild;
      while (first && first.classList && first.classList.contains('w-embed') && !txt(first)) first = first.nextElementSibling;
      if (first && /^H[12]$/.test(first.tagName) && titleEl) {
        var a = norm(txt(first)), b = norm(txt(titleEl)), n = Math.min(24, a.length, b.length);
        if (n >= 8 && a.slice(0, n) === b.slice(0, n)) first.style.display = 'none';
      }
      // 2. wide tables scroll inside the column instead of the page
      each(body.querySelectorAll('table'), function (t) {
        if (t.parentNode.classList && t.parentNode.classList.contains('pw-post__table-scroll')) return;
        var w = document.createElement('div');
        w.className = 'pw-post__table-scroll';
        t.parentNode.insertBefore(w, t); w.appendChild(t);
      });
    }

    // 3. table of contents from the visible h2s (design: 01, 02 ... with the active section marked)
    var nav = postRoot.querySelector('[data-insider-toc]');
    var label = postRoot.querySelector('[data-insider-toc-label]');
    var heads = body ? Array.prototype.filter.call(body.querySelectorAll('h2'), function (h) { return h.style.display !== 'none' && txt(h); }) : [];
    if (nav) {
      var onTpl = nav.querySelector('.pw-post__toc-item--on');
      var offTpl = nav.querySelector('.pw-post__toc-item');
      var links = [];
      if (heads.length < 2 || !onTpl || !offTpl) {
        nav.style.display = 'none'; if (label) label.style.display = 'none';
      } else {
        nav.innerHTML = '';
        heads.forEach(function (h, i) {
          if (!h.id) h.id = 'art-sec-' + (i + 1);
          var a = offTpl.cloneNode(true);
          var num = a.querySelector('.pw-post__toc-num, .pw-post__toc-num--on');
          var txtEl = a.querySelector('.pw-post__toc-text');
          if (num) (num.querySelector('span') || num).textContent = (i < 9 ? '0' : '') + (i + 1);
          if (txtEl) (txtEl.querySelector('span') || txtEl).textContent = txt(h);
          a.setAttribute('href', '#' + h.id);
          a.addEventListener('click', function (e) {
            e.preventDefault();
            var y = h.getBoundingClientRect().top + window.pageYOffset - 96;
            window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
            if (history.replaceState) history.replaceState(null, '', '#' + h.id);
          });
          nav.appendChild(a); links.push(a);
        });
        var cur = -1;
        var setCur = function (i) {
          if (i === cur) return; cur = i;
          links.forEach(function (a, k) {
            var on = k === i;
            a.className = a.className.replace(/\bpw-post__toc-item(--on)?\b/, on ? 'pw-post__toc-item--on' : 'pw-post__toc-item');
            var num = a.querySelector('.pw-post__toc-num, .pw-post__toc-num--on');
            if (num) num.className = num.className.replace(/\bpw-post__toc-num(--on)?\b/, on ? 'pw-post__toc-num--on' : 'pw-post__toc-num');
            if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
          });
        };
        var ticking = false;
        var spy = function () {
          ticking = false;
          var i = 0;
          for (var k = 0; k < heads.length; k++) if (heads[k].getBoundingClientRect().top - 120 <= 0) i = k;
          setCur(i);
        };
        window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
        spy();
      }
      nav.setAttribute('data-ready', '1');
    }

    // 4. keep reading: drop the current post, show three
    var rel = postRoot.querySelector('[data-insider-related]');
    if (rel) {
      var here = location.pathname.replace(/\/+$/, '').split('/').pop();
      var shown = 0;
      each(rel.querySelectorAll('a[href]'), function (a) {
        var wrap = a.closest('[role="listitem"], .w-dyn-item') || a;
        var hide = slugOf(a) === here || shown >= 3;
        wrap.style.display = hide ? 'none' : '';
        if (!hide) shown++;
      });
    }
  })();
})();

