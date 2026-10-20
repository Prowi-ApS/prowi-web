import * as compat from 'preact/compat';
const R = Object.assign({}, compat.default || compat);
const createRoot = (el) => {
  let first = true;
  return {
    render(v) { if (first) { el.textContent = ''; first = false; } compat.render(v, el); },
    unmount() { compat.render(null, el); }
  };
};
const RD = Object.assign({}, R, { createRoot });
window.React = R;
window.ReactDOM = RD;
