/* Shared runtime CSS for the tool pages (inputs are created by JS, so their font and focus ring live here). */
(function () {
  if (!document.querySelector('[data-tool]') || document.getElementById('pw-tool-css')) return;
  var st = document.createElement('style');
  st.id = 'pw-tool-css';
  st.textContent = '.pw-tool__input{font-family:inherit;line-height:normal;padding:0;-webkit-appearance:none;appearance:none}' +
    '.pw-tool__input-box:focus-within{border-color:#4C39CA;box-shadow:0 0 0 4px rgba(76,57,202,.18)}';
  document.head.appendChild(st);
})();
