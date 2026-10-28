/* Business types (CMS "Virksomhedstyper"): hub search + category chips, and the "Other business types" list on the item page.
   Hub root: [data-types="hub"] (/virksomhedstyper-oversigt, /en/business-types). Item root: [data-types="item"] (/virksomhedstype/<slug>).
   Ported from the INDUSTRIES / INDUSTRY DETAIL blocks of "Prowi Pages.dc.html":
   - search matches category + name + summary (case-insensitive substring), chips filter by category, "n of N" count,
     chips with no hits under the current search turn pale, cards re-enter with the listIn stagger, empty state below the grid;
   - the kategori option holds Danish names (Tech, Salg, Finans, ...); on English pages they are shown in English;
   - item page: the collection list loads all items (sorted like the hub); 3 are shown: same category first, then the
     items after the current one in hub order. The rest stay in the HTML (crawlable links) but are hidden. */
(function () {
  var hub = document.querySelector('[data-types="hub"]');
  var item = document.querySelector('[data-types="item"]');
  if (!hub && !item) return;
  var root = hub || item;
  if (root.__pwTypes) return;
  root.__pwTypes = 1;
  var EN = /^en/i.test(document.documentElement.lang || '');
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var CAT_EN = { 'Tech': 'Tech', 'Salg': 'Sales', 'Retail': 'Retail', 'Services': 'Services', 'Finans': 'Finance', 'Ejendom': 'Real estate', 'Sundhed': 'Healthcare', 'Logistik': 'Logistics' };
  var T = EN ? {
    ph: 'Search industries, e.g. SaaS, insurance, recruitment', aria: 'Search business types', of: ' of ',
    none: function (q) { return 'Nothing matches “' + q + '”'; }, hint: 'Try the category instead, or book a demo and tell us your setup.'
  } : {
    ph: 'Søg i brancher, fx SaaS, forsikring, rekruttering', aria: 'Søg i brancher', of: ' af ',
    none: function (q) { return 'Intet matcher “' + q + '”'; }, hint: 'Prøv kategorien i stedet, eller book en demo og fortæl os om jeres opsætning.'
  };

  if (!document.getElementById('pw-types-css')) {
    var st = document.createElement('style');
    st.id = 'pw-types-css';
    st.textContent = '@keyframes pwTypesIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +
      'input.pw-types__search-input{font-family:inherit;line-height:normal;padding:0;margin:0;-webkit-appearance:none;appearance:none;box-shadow:none;height:auto}' +
      'input.pw-types__search-input::placeholder{color:#A1A0BD;opacity:1}' +
      'input.pw-types__search-input::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}' +
      '.pw-types__chip--empty{color:#C4C2D8}' +
      '.pw-types__empty{padding:48px 24px;text-align:center;border:1px solid rgba(17,6,99,.10);display:flex;flex-direction:column;gap:8px;align-items:center}' +
      '.pw-types__empty-title{font-size:18px;font-weight:400;color:#110663}' +
      '.pw-types__empty-text{font-size:14px;color:#5E5B98}';
    document.head.appendChild(st);
  }

  // a card is the <a>; in a Webflow collection list it sits in a .w-dyn-item cell, which is what we hide
  function cellOf(a) { var p = a.parentElement; return p && p.classList.contains('w-dyn-item') ? p : a; }
  function catEl(a) { return a.querySelector('.pw-label'); }
  function catOf(a) { var c = catEl(a); return c ? (c.getAttribute('data-cat-da') || c.textContent).trim() : ''; }
  function localiseCats(cards) {
    cards.forEach(function (a) {
      var c = catEl(a); if (!c) return;
      var da = c.textContent.trim();
      c.setAttribute('data-cat-da', da);
      if (EN && CAT_EN[da]) { var leaf = c.querySelector('span') || c; leaf.textContent = CAT_EN[da]; }
    });
  }

  if (item) {
    // The list loads every business type (sorted like the hub). Show 3 related ones: same category first,
    // then the ones that follow the current page in hub order (wrapping), so each page points somewhere different.
    var more = [].slice.call(item.querySelectorAll('.pw-type__more-card'));
    localiseCats(more);
    var here = location.pathname.replace(/\/+$/, '').split('/').pop();
    function slugOf(a) { return (a.getAttribute('href') || '').split(/[?#]/)[0].replace(/\/+$/, '').split('/').pop(); }
    var pos = -1;
    more.forEach(function (a, i) { if (slugOf(a) === here) pos = i; });
    var myCat = pos >= 0 ? catOf(more[pos]) : '';
    var order = [];
    for (var k = 1; k < more.length; k++) order.push(more[((pos < 0 ? -1 : pos) + k + more.length) % more.length]);
    if (pos < 0) order = more.slice();
    var pick = order.filter(function (a) { return myCat && catOf(a) === myCat; });
    order.forEach(function (a) { if (pick.indexOf(a) === -1) pick.push(a); });
    pick = pick.slice(0, 3);
    more.forEach(function (a) { cellOf(a).style.display = pick.indexOf(a) === -1 ? 'none' : ''; });
    // keep the chosen three in the chosen order
    pick.forEach(function (a) { var c = cellOf(a); if (c.parentNode) c.parentNode.appendChild(c); });
  }

  if (!hub) return;
  var cards = [].slice.call(hub.querySelectorAll('.pw-types__card'));
  localiseCats(cards);
  var data = cards.map(function (a) {
    var txt = [].slice.call(a.children).filter(function (el) { return el.tagName !== 'svg' && el.tagName !== 'SVG'; }).map(function (el) { return el.textContent; }).join(' ');
    return { a: a, cell: cellOf(a), cat: catOf(a), text: (catOf(a) + ' ' + txt).toLowerCase() };
  });
  var total = data.length;
  var grid = hub.querySelector('.pw-types__grid');
  var gridBox = grid && grid.closest('.w-dyn-list') || grid;
  var countEl = hub.querySelector('.pw-types__count');
  var chips = [].slice.call(hub.querySelectorAll('[data-cat]'));
  var state = { q: '', cat: '' };

  // the search field: the markup holds a placeholder div (Webflow has no free <input>); swap in a real input
  var ph = hub.querySelector('[data-input="iq"]');
  var input = null;
  if (ph) {
    input = document.createElement('input');
    input.type = 'search';
    input.className = ph.className;
    input.placeholder = T.ph;
    input.setAttribute('aria-label', T.aria);
    input.autocomplete = 'off';
    ph.parentNode.replaceChild(input, ph);
    input.addEventListener('input', function () { state.q = input.value; render(true); });
  }
  var empty = document.createElement('div');
  empty.className = 'pw-types__empty';
  empty.style.display = 'none';
  var emptyTitle = document.createElement('span'); emptyTitle.className = 'pw-types__empty-title';
  var emptyText = document.createElement('span'); emptyText.className = 'pw-types__empty-text'; emptyText.textContent = T.hint;
  empty.appendChild(emptyTitle); empty.appendChild(emptyText);
  if (gridBox && gridBox.parentNode) gridBox.parentNode.insertBefore(empty, gridBox.nextSibling);

  chips.forEach(function (ch) {
    ch.setAttribute('role', 'button');
    ch.setAttribute('tabindex', '0');
    function go(e) { if (e) e.preventDefault(); var c = ch.getAttribute('data-cat'); state.cat = state.cat === c ? '' : c; render(true); }
    ch.addEventListener('click', go);
    ch.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') go(e); });
  });

  function render(animate) {
    var q = state.q.trim().toLowerCase();
    var hits = data.filter(function (d) { return !q || d.text.indexOf(q) !== -1; });
    var shown = hits.filter(function (d) { return !state.cat || d.cat === state.cat; });
    var n = 0;
    data.forEach(function (d) {
      var on = shown.indexOf(d) !== -1;
      d.cell.style.display = on ? '' : 'none';
      if (on && animate && !REDUCED) {
        d.a.style.animation = 'none';
        void d.a.offsetWidth;
        d.a.style.animation = 'pwTypesIn 420ms cubic-bezier(0.2,0.6,0.2,1) ' + Math.min(n, 11) * 35 + 'ms both';
      }
      if (on) n++;
    });
    chips.forEach(function (ch) {
      var c = ch.getAttribute('data-cat');
      var sel = state.cat === c;
      var cnt = c ? hits.filter(function (d) { return d.cat === c; }).length : hits.length;
      ch.classList.toggle('pw-types__chip--on', sel);
      ch.classList.toggle('pw-types__chip', !sel);
      ch.classList.toggle('pw-types__chip--empty', !sel && !cnt);
      ch.setAttribute('aria-pressed', sel ? 'true' : 'false');
    });
    if (countEl) { var leaf = countEl.querySelector('span') || countEl; leaf.textContent = shown.length + T.of + total; }
    var none = !shown.length;
    empty.style.display = none ? '' : 'none';
    if (gridBox) gridBox.style.display = none ? 'none' : '';
    emptyTitle.textContent = T.none(state.q.trim());
  }
  render(false);
})();
