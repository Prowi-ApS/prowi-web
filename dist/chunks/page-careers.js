/* Careers page: unsolicited application form (native Webflow form).
   Work email only (same rule as the demo form: free-mail domains shake and show the message), English labels,
   placeholders and button text on /en, and the page URL in the hidden "Page" field. */
(function () {
  var form = document.querySelector('form.pw-careers__form');
  if (!form) return;
  var d = document, w = window;
  var EN = /^en/i.test(d.documentElement.lang || '');
  var REDUCED = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var block = form.parentNode;
  var cell = block && block.parentNode;
  var T = EN ? {
    title: 'Or send your application here', name: 'Name', email: 'Work email', link: "Link to something you've made",
    msg: 'What would you build or fix first at Prowi, and why you?', submit: 'Send application', wait: 'Sending …', ph: 'Your name',
    done: "Thanks, we've got your application. You'll hear from us either way.",
    fail: 'Something went wrong. Try again, or email careers@prowi.io directly.',
    err: 'Please use your work email. Personal addresses (Gmail, Outlook, iCloud …) aren’t accepted.'
  } : { submit: 'Send ansøgning', wait: 'Sender …', ph: 'Dit navn' };

  if (!d.getElementById('pw-careers-css')) {
    var st = d.createElement('style'); st.id = 'pw-careers-css';
    st.textContent = '@keyframes pwCareersShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-7px)}30%{transform:translateX(6px)}45%{transform:translateX(-4px)}60%{transform:translateX(3px)}75%{transform:translateX(-2px)}}' +
      '.pw-careers__submit{font-family:inherit}.pw-careers__input,.pw-careers__textarea{font-family:inherit;-webkit-appearance:none;appearance:none;width:100%;box-sizing:border-box}' +
      '.pw-careers__input::placeholder,.pw-careers__textarea::placeholder{color:#9A98C2}';
    d.head.appendChild(st);
  }

  var setFirstText = function (el, s) {
    if (!el || !s) return;
    for (var i = 0; i < el.childNodes.length; i++) { var n = el.childNodes[i]; if (n.nodeType === 3 && n.nodeValue.trim()) { n.nodeValue = s; return; } }
  };
  var leaf = function (el) { var n = el; while (n && n.firstElementChild) n = n.firstElementChild; return n || el; };
  var email = form.querySelector('input[type="email"]'), name = form.querySelector('input[name="Name"]');
  var err = form.querySelector('.pw-careers__error');

  if (EN) {
    var labels = form.querySelectorAll('.pw-careers__label');
    [T.name, T.email, T.link, T.msg].forEach(function (s, i) { setFirstText(labels[i], s); });
    var title = cell && cell.querySelector('.pw-careers__form-title'); if (title) leaf(title).textContent = T.title;
    if (err) leaf(err).textContent = T.err;
    var done = block.querySelector('.pw-careers__done-text'); if (done) leaf(done).textContent = T.done;
    var fail = block.querySelector('.pw-careers__fail-text'); if (fail) leaf(fail).textContent = T.fail;
  }
  var sub = form.querySelector('input[type="submit"]');
  if (sub) { sub.value = T.submit; sub.setAttribute('data-wait', T.wait); }
  // placeholders live here: Webflow's form inputs cannot carry them via the API
  if (name) name.setAttribute('placeholder', T.ph);
  if (email) email.setAttribute('placeholder', 'you@company.com');
  var link = form.querySelector('input[name="Link"]'); if (link) link.setAttribute('placeholder', 'https://');
  var msg = form.querySelector('textarea'); if (msg) msg.setAttribute('placeholder', ''); // Webflow's default "Example text"

  // same free-mail list as the demo form
  var FREE = ['gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.dk', 'yahoo.co.uk', 'hotmail.com', 'hotmail.dk', 'hotmail.co.uk', 'outlook.com', 'outlook.dk', 'live.com', 'live.dk', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'protonmail.com', 'proton.me', 'pm.me', 'gmx.com', 'gmx.de', 'mail.com', 'yandex.com', 'zoho.com', 'fastmail.com', 'tutanota.com', 'hey.com', 'mail.dk', 'jubii.dk', 'post.dk', 'ofir.dk', 'sol.dk', 'stofanet.dk', 'youmail.dk', 'tdcadsl.dk', 'webspeed.dk', 'it.dk', 'privat.dk'];
  var isWork = function (v) {
    var m = String(v || '').trim().toLowerCase().match(/^[^\s@]+@([^\s@]+\.[a-z]{2,})$/); if (!m) return false;
    return !FREE.some(function (f) { return m[1] === f || m[1].slice(-(f.length + 1)) === '.' + f; });
  };
  if (!email) return;
  var bad = false;
  var showErr = function (on) {
    bad = on; if (err) err.style.display = on ? 'block' : '';
    email.style.borderColor = on ? '#B42318' : ''; email.setAttribute('aria-invalid', on ? 'true' : 'false');
    if (on && !REDUCED) { var lab = email.parentNode; lab.style.animation = 'none'; void lab.offsetWidth; lab.style.animation = 'pwCareersShake 480ms cubic-bezier(0.36,0.07,0.19,0.97) both'; }
  };
  email.addEventListener('blur', function () { if (email.value.trim()) showErr(!isWork(email.value)); });
  email.addEventListener('input', function () { if (bad && isWork(email.value)) showErr(false); });
  form.addEventListener('submit', function (e) {
    if (!isWork(email.value)) { e.preventDefault(); e.stopImmediatePropagation(); showErr(true); email.focus(); return; }
    var page = form.querySelector('input[name="Page"]'); if (page) page.value = w.location.href.split('#')[0];
  }, true);
})();

