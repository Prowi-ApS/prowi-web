/* About page, Key facts layout (/om-os, /en/about-us; root [data-about="kf"]). Port of the About · Key facts block in
   About Key Facts.dc.html: linked team hover (avatar <-> card). The section reveal comes from the site-wide reveal in src/page.js.
   Static markup = the design's resting state, so the page is complete without this script. */
(function () {
  var root = document.querySelector('[data-about="kf"]');
  if (!root || root.getAttribute('data-about-ready')) return;
  root.setAttribute('data-about-ready', '1');

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  if (!document.getElementById('pw-about-css')) {
    var st = document.createElement('style');
    st.id = 'pw-about-css';
    st.textContent =
      // exact timings from About Key Facts.dc.html (spring for movement, ease-out for fades)
      '[data-about="kf"] [data-member]:not(:has(h3)){cursor:default;position:relative;transition:opacity 280ms cubic-bezier(0.2,0.8,0.2,1),filter 280ms,box-shadow 320ms cubic-bezier(0.2,0.8,0.2,1),transform 520ms cubic-bezier(0.34,1.56,0.64,1)}' +
      '[data-about="kf"] [data-member]:has(h3){transition:opacity 300ms cubic-bezier(0.2,0.8,0.2,1)}' +
      '[data-about="kf"] [data-member] h3{transition:color 220ms,transform 460ms cubic-bezier(0.34,1.56,0.64,1)}' +
      '[data-about="kf"] [data-member] .pw-about__kf-member-role{display:inline-block;transition:color 220ms,transform 460ms cubic-bezier(0.34,1.56,0.64,1) 40ms}' +
      '@media (prefers-reduced-motion: reduce){[data-about="kf"] [data-member],[data-about="kf"] [data-member] *{transition:none!important}}';
    document.head.appendChild(st);
  }

  /* ---------- linked team hover ---------- */
  var avatars = [], cards = [];
  each(root.querySelectorAll('[data-member]'), function (el) {
    var who = el.getAttribute('data-member');
    if (el.querySelector('h3')) {
      cards.push({ el: el, who: who, name: el.querySelector('h3'), role: el.querySelector('.pw-about__kf-member-role') });
    } else {
      var t = window.getComputedStyle(el).transform;
      avatars.push({ el: el, who: who, base: t && t !== 'none' ? t : '' });
    }
  });

  function set(active) {
    avatars.forEach(function (a) {
      var on = active === a.who, dim = !!active && !on, s = a.el.style;
      s.zIndex = on ? '2' : '';
      s.opacity = dim ? '0.4' : '';
      s.filter = dim ? 'grayscale(1)' : '';
      s.boxShadow = on ? '0 0 0 3px #FFFFFF, 0 0 0 4.5px #4C39CA, 0 18px 36px rgba(17,6,99,0.22)' : '';
      s.transform = on ? (a.base + ' translateY(-8px) scale(1.08)').trim() : dim ? (a.base + ' scale(0.96)').trim() : '';
    });
    cards.forEach(function (c) {
      var on = active === c.who, dim = !!active && !on;
      c.el.style.opacity = dim ? '0.45' : '';
      if (c.name) { c.name.style.color = on ? '#4C39CA' : ''; c.name.style.transform = on ? 'translateX(4px)' : ''; }
      if (c.role) { c.role.style.color = on ? '#110663' : ''; c.role.style.transform = on ? 'translateX(4px)' : ''; }
    });
  }
  avatars.concat(cards).forEach(function (x) {
    x.el.addEventListener('mouseenter', function () { set(x.who); });
    x.el.addEventListener('mouseleave', function () { set(null); });
  });

})();

