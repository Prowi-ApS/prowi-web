/* Shared runtime for the tool pages (inputs are created by JS, so their font and focus ring live here),
   plus arrow-key stepping for the number fields. */
(function () {
  if (!document.querySelector('[data-tool]') || document.getElementById('pw-tool-css')) return;
  var st = document.createElement('style');
  st.id = 'pw-tool-css';
  st.textContent = '.pw-tool__input{font-family:inherit;font-variant-numeric:tabular-nums;letter-spacing:inherit;line-height:normal;padding:0;-webkit-appearance:none;appearance:none}' +
    '.pw-tool__input-box:focus-within{border-color:#4C39CA;box-shadow:0 0 0 4px rgba(76,57,202,.18)}';
  document.head.appendChild(st);

  // ↑ / ↓ step the value (Shift = 10× the step). The field stays a text field in the page font; the module's own
  // input handler regroups the digits and recalculates.
  var en = /^en/i.test(document.documentElement.getAttribute('lang') || '');
  function grp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, en ? ',' : '.'); }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    var t = e.target;
    if (!t || !t.matches || !t.matches('input.pw-tool__input')) return;
    e.preventDefault();
    var raw = String(t.value || '');
    var s = en ? raw.replace(/,/g, '') : raw.replace(/\./g, '').replace(',', '.');
    var v = parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
    var a = Math.abs(v);
    var step = a >= 10000 ? Math.pow(10, Math.floor(Math.log(a) / Math.LN10) - 1) : a >= 1000 ? 100 : 1;
    if (e.shiftKey) step *= 10;
    var dir = e.key === 'ArrowUp' ? 1 : -1;
    var nv = Math.max(0, Math.round((v + dir * step) / step) * step);
    var out = nv >= 1000 ? grp(Math.round(nv)) : String(Math.round(nv * 100) / 100).replace('.', en ? '.' : ',');
    t.value = out;
    try { t.setSelectionRange(out.length, out.length); } catch (err) {}
    t.dispatchEvent(new Event('input', { bubbles: true }));
  });
})();
