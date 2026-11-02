// A tiny DOM for the calculator mount tests (no dependencies): elements, attributes, events and simple selectors
// (tag, .class, [attr], [attr="v"], a compound of those, and comma lists). Enough for calc-kit.js and the standalone
// commission calculator; not a browser. Usage: const { makeDoc } = require('./_dom'); makeDoc('en', storage).
function El(tag, doc) {
  this.tagName = String(tag).toUpperCase(); this.ownerDocument = doc; this.childNodes = []; this.parentNode = null;
  this.attrs = {}; this.style = {}; this._l = {}; this.hidden = false; this.value = ''; this._text = '';
  const self = this;
  this.classList = { add: c => { const s = self.className.split(/\s+/).filter(Boolean); if (s.indexOf(c) < 0) s.push(c); self.className = s.join(' '); },
    contains: c => self.className.split(/\s+/).indexOf(c) > -1 };
}
El.prototype = {
  get className() { return this.attrs['class'] || ''; }, set className(v) { this.attrs['class'] = String(v); },
  get id() { return this.attrs.id || ''; }, set id(v) { this.attrs.id = String(v); },
  get htmlFor() { return this.attrs['for'] || ''; }, set htmlFor(v) { this.attrs['for'] = String(v); },
  get firstChild() { return this.childNodes[0] || null; }, get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; },
  get children() { return this.childNodes.filter(n => n instanceof El); },
  get firstElementChild() { return this.children[0] || null; }, get lastElementChild() { const c = this.children; return c[c.length - 1] || null; },
  get textContent() { return this.childNodes.length ? this.childNodes.map(n => n.textContent).join('') : this._text; },
  set textContent(v) { this.childNodes.forEach(n => { n.parentNode = null; }); this.childNodes = []; this._text = String(v); },
  set innerHTML(v) { this.textContent = String(v).replace(/<[^>]*>/g, ' '); this._html = String(v); },
  get innerHTML() { return this._html || ''; },
  setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
  hasAttribute(k) { return k in this.attrs; }, removeAttribute(k) { delete this.attrs[k]; },
  appendChild(n) { if (n.parentNode) n.parentNode.removeChild(n); n.parentNode = this; this.childNodes.push(n); return n; },
  insertBefore(n, ref) {
    if (!ref) return this.appendChild(n);
    if (n.parentNode) n.parentNode.removeChild(n);
    n.parentNode = this; this.childNodes.splice(this.childNodes.indexOf(ref), 0, n); return n;
  },
  removeChild(n) { const i = this.childNodes.indexOf(n); if (i > -1) this.childNodes.splice(i, 1); n.parentNode = null; return n; },
  replaceChild(n, old) { this.insertBefore(n, old); this.removeChild(old); return old; },
  contains(n) { for (; n; n = n.parentNode) if (n === this) return true; return false; },
  closest(sel) { for (let n = this; n instanceof El; n = n.parentNode) if (matches(n, sel)) return n; return null; },
  addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); },
  dispatchEvent(e) {
    let stop = false; const ev = Object.assign({ type: e.type, bubbles: e.bubbles, target: this }, { preventDefault() {}, stopPropagation() { stop = true; } });
    for (let n = this; n && !stop; n = ev.bubbles ? n.parentNode : null) (n._l && n._l[ev.type] || []).forEach(f => f.call(n, ev));
    if (this.ownerDocument) this.ownerDocument.events.push(ev.type);
    return true;
  },
  focus() {}, setSelectionRange() {},
  querySelectorAll(sel) { const out = []; walk(this, n => { if (matches(n, sel)) out.push(n); }); return out; },
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
};
function walk(root, fn) { root.children.forEach(c => { fn(c); walk(c, fn); }); }
function matchOne(n, s) {
  const re = /([a-z0-9]+)|\.([\w-]+)|\[([\w-]+)(?:="([^"]*)")?\]/giy; let m, ok = true;
  while (re.lastIndex < s.length) {
    if (!(m = re.exec(s))) throw new Error('_dom: unsupported selector ' + s);
    if (m[1]) ok = ok && n.tagName === m[1].toUpperCase();
    else if (m[2]) ok = ok && n.classList.contains(m[2]);
    else ok = ok && n.getAttribute(m[3]) != null && (m[4] == null || n.getAttribute(m[3]) === m[4]);
  }
  return ok;
}
function matches(n, sel) { return sel.split(',').some(s => matchOne(n, s.trim())); }

// storage: a plain object (works), or 'throw' to simulate blocked storage (private mode)
function makeDoc(lang, storage) {
  const doc = { events: [] };
  const mk = t => new El(t, doc);
  doc.createElement = mk;
  doc.documentElement = mk('html'); doc.documentElement.setAttribute('lang', lang);
  doc.head = mk('head'); doc.body = mk('body');
  doc.documentElement.appendChild(doc.head); doc.documentElement.appendChild(doc.body);
  doc.readyState = 'complete';
  doc.querySelector = s => doc.documentElement.querySelector(s);
  doc.querySelectorAll = s => doc.documentElement.querySelectorAll(s);
  doc.getElementById = id => doc.documentElement.querySelectorAll('[id="' + id + '"]')[0] || null;
  const ls = storage === 'throw'
    ? { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } }
    : { getItem: k => (k in storage ? storage[k] : null), setItem: (k, v) => { storage[k] = String(v); } };
  doc.defaultView = { localStorage: ls, matchMedia: () => ({ matches: true }) };
  if (storage === 'throw') Object.defineProperty(doc.defaultView, 'localStorage', { get() { throw new Error('blocked'); } });
  return doc;
}
module.exports = { makeDoc, El };
