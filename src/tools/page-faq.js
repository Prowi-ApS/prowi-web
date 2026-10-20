/* FAQ page (/faq, /en/faq; root [data-faq="page"]). Port of the FAQ block in Prowi Pages.dc.html:
   search over question + answer (matching answers open), category chips, accordion, empty state.
   Static markup = the design's default state (all categories, everything closed). */
(function () {
  var root = document.querySelector('[data-faq="page"]');
  if (!root) return;

  var isEn = String(document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = isEn
    ? { placeholder: 'Search questions', empty: 'No questions match “{q}”.' }
    : { placeholder: 'Søg i spørgsmål', empty: 'Ingen spørgsmål matcher “{q}”.' };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function txt(el) { return el ? String(el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }

  if (!document.getElementById('pw-faq-css')) {
    var st = document.createElement('style');
    st.id = 'pw-faq-css';
    st.textContent =
      '[data-faq="page"] .pw-faq__item[data-open] .pw-faq__answer{grid-template-rows:1fr;opacity:1}' +
      '[data-faq="page"] .pw-faq__item[data-open] .pw-faq__chev{transform:rotate(180deg)}' +
      '[data-faq="page"] .pw-faq__q:focus-visible,[data-faq="page"] [data-cat]:focus-visible{outline:2px solid #4C39CA;outline-offset:2px}' +
      '@media (prefers-reduced-motion: reduce){[data-faq="page"] .pw-faq__answer,[data-faq="page"] .pw-faq__chev,[data-faq="page"] [data-cat]{transition:none}}';
    document.head.appendChild(st);
  }

  // search: swap the placeholder span for a real input with the same class
  var input = null;
  var span = root.querySelector('[data-input="q"]');
  if (span) {
    input = document.createElement('input');
    input.type = 'search';
    input.className = span.className;
    input.placeholder = T.placeholder;
    input.setAttribute('aria-label', T.placeholder);
    input.setAttribute('autocomplete', 'off');
    span.parentNode.replaceChild(input, span);
  }

  // chips carry data-cat = category index, "all" for the All chip
  var chips = Array.prototype.slice.call(root.querySelectorAll('a[data-cat]'));
  function chipCat(c) { var k = c.getAttribute('data-cat') || ''; return k === 'all' ? '' : k; }
  var groups = [];
  each(root.querySelectorAll('.pw-faq__group'), function (g) {
    var items = [];
    each(g.querySelectorAll('.pw-faq__item'), function (el) {
      var q = el.querySelector('[data-faq-q]') || el.querySelector('.pw-faq__q');
      var a = el.querySelector('.pw-faq__a');
      items.push({ el: el, q: q, hay: (txt(q) + ' ' + txt(a)).toLowerCase(), open: false });
    });
    groups.push({ el: g, cat: g.getAttribute('data-cat') || '', items: items });
  });
  var empty = root.querySelector('[data-faq-empty]');
  var emptyQ = root.querySelector('[data-faq-empty-q]');
  var state = { q: '', cat: '' };

  function render() {
    var fq = state.q.trim().toLowerCase();
    var shownGroups = 0;
    groups.forEach(function (g) {
      var inCat = !state.cat || g.cat === state.cat;
      var shown = 0;
      g.items.forEach(function (it) {
        var hit = inCat && (!fq || it.hay.indexOf(fq) !== -1);
        it.el.style.display = hit ? '' : 'none';
        var open = it.open || !!fq;
        if (open) it.el.setAttribute('data-open', ''); else it.el.removeAttribute('data-open');
        if (it.q) it.q.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (hit) shown++;
      });
      g.el.style.display = shown ? '' : 'none';
      if (shown) shownGroups++;
    });
    chips.forEach(function (c) {
      var sel = chipCat(c) === state.cat;
      c.className = c.className.replace(/\bpw-faq__chip(--on)?\b/, sel ? 'pw-faq__chip--on' : 'pw-faq__chip');
      c.setAttribute('aria-pressed', sel ? 'true' : 'false');
    });
    if (empty) {
      empty.style.display = shownGroups ? 'none' : 'block';
      if (emptyQ) emptyQ.textContent = T.empty.replace('{q}', state.q);
    }
  }

  function onActivate(el, fn) {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.addEventListener('click', function (e) { e.preventDefault(); fn(); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
    });
  }
  chips.forEach(function (c) {
    onActivate(c, function () { state.cat = chipCat(c); render(); });
  });
  groups.forEach(function (g) {
    g.items.forEach(function (it) {
      if (it.q) onActivate(it.q, function () { it.open = !it.open; render(); });
    });
  });
  if (input) input.addEventListener('input', function () { state.q = input.value; render(); });
  if (reduce) root.setAttribute('data-reduced-motion', '');
  render();
})();
