/* Article visuals (v1.25.52): small animated visuals that explain existing CMS content, built from what is already in
   the rich text. Nothing is removed: tables, lists and sentences stay in the DOM (and readable) as the source; the visual
   is added above them and is aria-hidden. Bodies: Insider posts (.pw-post__body), glossary (.pw-term__body), commission
   models (.pw-model__guide), business types (.pw-type__longform), integrations (.pw-int__longform).

   1. Tier staircase   a table with contiguous ranges (0-80 %, 80-100 %, 100 %+ / 0 - 300.000 kr. ...) and one rate per
                       range (8 %, 1,5x) that never goes down -> stepped bars; marker for the example amount when the text
                       right next to the table states exactly one.
   2. Payout waterfall a table whose last row is a total (I alt, Total, Til udbetaling, Payout ...) and whose amounts in
                       one column add up to it (checked to the last shown digit) -> bars for +, -, total.
   3. Flow line        an ordered list whose items run through the commission cycle in order (period/data -> calculation
                       -> statement -> approval -> payroll; at least approval before payroll and 3 stages) -> step line.
                       Explicit: data-pw-visual="flow" on a list, or on an element with data-steps="A|B|C".
   4. Calculator       the matching free calculator (data-tool ids of v1.25.51) after the relevant section, on the pages
                       listed in CALC (exact paths, no guessing). The footer's Plausible "Calculator used" goal counts it.
   5. Key numbers      a "Nøglefund / Nøgletal / Key findings / Key numbers" list where every item has a number in bold ->
                       the list itself is laid out as cards with the number big (the item text is not changed).
   6. Calculation strip the glossary example (.pw-term__example-text): when it holds an explicit sum (a × b = c,
                       a + b = c, a ÷ b ..., "... giver/gives c") that is right to the last shown digit -> the numbers as
                       a small equation above the sentence.
   Numbers are read strictly by page language: Danish 1.000,5 / 12,5 %, English 1,000.5 / 12.5 %. Anything that does not
   parse or add up is left alone. Off for a page: data-no-visuals on <html>/<body> or a .pw-no-visuals element on the
   page; off for one element: data-no-visuals / .pw-no-visuals on it or an ancestor. Plausible "Visual viewed" (props:
   type) is sent once per visual type per page when one is first seen. Nothing is inserted or restyled while it is in
   the viewport (no layout shift above the fold): that waits until the spot is off screen. Reduced motion: static.
   In Node the module exports its parsers and detectors (test/visuals.test.js). */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  if (typeof document === 'undefined') return;
  var go = function () { try { api.run(document, window); } catch (e) { if (window.console) console.error('[prowi] visuals', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})(this, function () {
  'use strict';
  var BODIES = '.pw-post__body,.pw-term__body,.pw-model__guide,.pw-type__longform,.pw-int__longform';
  var EXPLICIT = '[data-pw-visual]';
  var OFF = '[data-no-visuals],.pw-no-visuals';

  /* ---------------- numbers ---------------- */
  function core(lang) { return lang === 'en' ? '\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?' : '\\d{1,3}(?:\\.\\d{3})+(?:,\\d+)?|\\d+(?:,\\d+)?'; }
  function toNum(s, lang) { return parseFloat(lang === 'en' ? s.replace(/,/g, '') : s.replace(/\./g, '').replace(',', '.')); }
  function decOf(s, lang) { var i = s.indexOf(lang === 'en' ? '.' : ','); return i < 0 ? 0 : s.length - i - 1; }
  function clean(s) { return String(s == null ? '' : s).replace(/[   ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  var CUR = { '$': '$', usd: '$', '€': '€', eur: '€', kr: 'kr', 'kr.': 'kr', dkk: 'kr', sek: 'sek', nok: 'nok', '£': '£' };
  var PRE = '(\\$|€|£|DKK|EUR|USD|SEK|NOK)';
  var SUF = '(%|×|x|kr\\.?|DKK|EUR|USD|SEK|NOK|€|K|mio\\.?(?: ?kr\\.?)?|gange|times)';
  var QUAL = /^(ca\.|cirka|omkring|about|around|approx\.?|approximately|~|kun|only|op til|up to)\s+/i;
  /* One value that fills the whole string: sign, currency, number, unit. -> {v, u: 'kr'|'$'|'€'|'%'|'x'|'', d, t} or null */
  function parseVal(str, lang) {
    var s = clean(str), m = s.match(new RegExp('^([+\\-−–]?) ?' + PRE + '? ?([+\\-−]?)(' + core(lang) + ')(?: ?' + SUF + ')?$', 'i'));
    if (!m) return null;
    var num = m[4], v = toNum(num, lang), pre = (m[2] || '').toLowerCase(), suf = (m[5] || '').toLowerCase(), u = '';
    if (!isFinite(v)) return null;
    if (pre) u = CUR[pre];
    if (suf) {
      if (suf === '%') u = u ? null : '%';
      else if (suf === '×' || suf === 'x' || suf === 'gange' || suf === 'times') u = u ? null : 'x';
      else if (suf === 'k') { if (!u) return null; v *= 1000; }
      else if (/^mio/.test(suf)) { v *= 1e6; if (/kr/.test(suf)) u = u && u !== 'kr' ? null : 'kr'; }
      else { var c = CUR[suf.replace(/\.$/, '') === 'kr' ? 'kr' : suf]; u = u && u !== c ? null : c; }
    }
    if (u == null) return null;
    // "12.000" on an English page with a currency is a Danish thousands figure written by mistake: not trusted
    if (lang === 'en' && (u === '$' || u === '€' || u === 'kr') && /^\d{1,3}\.\d{3}$/.test(num)) return null;
    if ((m[1] && m[3]) || (u === '%' && v > 1000)) return null;
    if (m[1] === '-' || m[1] === '−' || m[1] === '–' || m[3]) v = -v;
    return { v: v, u: u, d: decOf(num, lang), t: s };
  }
  // a value cell may carry a short note in brackets: "12% (1.5x multiplier)", "0.8x (or threshold)"
  function parseRate(str, lang) { return parseVal(clean(str).replace(/\s*\([^)]*\)$/, '').replace(/\s+(rate|sats)$/i, ''), lang); }

  var RQ = /\s*(\((kvote|quota|of quota|af kvoten)\)|af kvoten|af kvote|af quota|af målet|of quota|of target|of plan|kvote|quota)$/i;
  /* A range cell: "0 - 300.000 kr.", "$45,001 - $90,000", "81-100%", "600.001+ DKK", "150%+", "Over 120 %", "Under 50%".
     -> {lo, hi (Infinity = open), u, t} or null */
  function parseRange(str, lang) {
    var s = clean(str).replace(RQ, ''), m, a, b, unitTail;
    if ((m = s.match(/^(over|above|more than|mere end|from|fra)\s+(.+)$/i))) { a = parseVal(m[2], lang); return a && a.v >= 0 ? { lo: a.v, hi: Infinity, u: a.u, t: clean(str) } : null; }
    if ((m = s.match(/^(under|below|less than|op til|up to)\s+(.+)$/i))) { b = parseVal(m[2], lang); return b && b.v > 0 ? { lo: 0, hi: b.v, u: b.u, t: clean(str) } : null; }
    if ((m = s.match(/^(.+?) ?\+ ?(.*)$/)) && !/\+/.test(m[1])) {
      unitTail = m[2]; a = parseVal(m[1] + (unitTail ? ' ' + unitTail : ''), lang);
      return a && a.v >= 0 ? { lo: a.v, hi: Infinity, u: a.u, t: clean(str) } : null;
    }
    m = s.match(/^(.+?)\s*(?:-|–|—|\btil\b|\bto\b)\s*(.+)$/i);
    if (!m) return null;
    a = parseVal(m[1], lang); b = parseVal(m[2], lang);
    if (!a || !b || a.v < 0 || b.v < 0) return null;
    if (a.u && b.u && a.u !== b.u) return null;
    if (!(b.v > a.v)) return null;
    return { lo: a.v, hi: b.v, u: b.u || a.u, t: clean(str) };
  }

  /* ---------------- tables ---------------- */
  var TOTAL = /^(?:[a-z]\.\s*)?(i alt|total|samlet|sum\b|til udbetaling|udbetaling|udbetales|payout|amount payable|payable|net payout|net commission|netto|nettoprovision|provision i alt|commission payable)/i;
  function isTotal(cell) { return TOTAL.test(clean(cell)); }
  // tbl: {head: [..] or null, rows: [[..], ..]} (cell texts)
  function detectTiers(tbl, lang) {
    var rows = tbl.rows.slice();
    if (rows.length && isTotal(rows[rows.length - 1][0])) rows.pop();
    if (rows.length < 3 || rows.length > 8) return null;
    var w = rows[0].length;
    if (w < 2 || rows.some(function (r) { return r.length !== w; })) return null;
    for (var c = 0; c < w; c++) {
      var rg = rows.map(function (r) { return parseRange(r[c], lang); });
      if (rg.some(function (x) { return !x; })) continue;
      var u = rg[rg.length - 1].u, ok = rg[0].lo === 0;
      for (var i = 0; ok && i < rg.length; i++) {
        var x = rg[i];
        if (x.u && u && x.u !== u) ok = false;
        if (i < rg.length - 1 && !isFinite(x.hi)) ok = false;
        if (i > 0) { var gap = x.lo - rg[i - 1].hi; if (!(gap >= 0 && gap <= 1.0001)) ok = false; }
      }
      if (!ok || (u !== '%' && u !== 'kr' && u !== '$' && u !== '€')) continue;
      for (var k = 0; k < w; k++) {
        if (k === c) continue;
        var rt = rows.map(function (r) { return parseRate(r[k], lang); });
        if (rt.some(function (x) { return !x || (x.u !== '%' && x.u !== 'x') || x.v < 0 || x.u !== rt[0].u; })) continue;
        if (rt[0].u === '%' && rt.some(function (x) { return x.v > 100; })) continue;
        var up = false, down = false;
        for (var j = 1; j < rt.length; j++) { if (rt[j].v > rt[j - 1].v) up = true; if (rt[j].v < rt[j - 1].v) down = true; }
        if (!up || down) continue;
        return {
          type: 'tiers', unit: u, rateUnit: rt[0].u, rangeHead: tbl.head ? clean(tbl.head[c]) : '', rateHead: tbl.head ? clean(tbl.head[k]) : '',
          tiers: rg.map(function (x, n) { return { lo: x.lo, hi: x.hi, range: x.t, rate: rt[n].v, label: clean(rows[n][k]).replace(/\s*\([^)]*\)$/, '') }; })
        };
      }
    }
    return null;
  }
  // the example amount stated next to a tier table: exactly one amount in the tiers' unit, inside the tiers' span,
  // in a sentence that says it is an example
  var EXW = /(eksempel|example|scenario|scenarie|for instance|e\.g\.|fx\b|f\.eks|a rep who|en sælger,? der|sælger(en)? (når|lukker|sælger|rammer)|rep (closes|hits|reaches|sells)|closes|lukker|sells?\b|sold\b|solgt|reaches|performance)/i;
  function findMarker(spec, texts, lang) {
    var maxHi = 0;
    spec.tiers.forEach(function (t) { maxHi = Math.max(maxHi, isFinite(t.hi) ? t.hi : t.lo); });
    for (var i = 0; i < texts.length; i++) {
      var sentences = clean(texts[i]).replace(/([.!?]) (?=[A-ZÆØÅ])/g, '$1\n').split('\n');
      for (var s = 0; s < sentences.length; s++) {
        if (!EXW.test(sentences[s])) continue;
        var vals = numbersIn(sentences[s], lang).filter(function (x) { return x.u === spec.unit; });
        if (vals.length !== 1) continue;
        var v = vals[0].v;
        if (v <= 0 || v > maxHi * 1.6) continue;
        return { v: v, t: vals[0].t };
      }
    }
    return null;
  }
  function numbersIn(text, lang) {
    var re = new RegExp('(?:' + PRE + ' ?)?(?:' + core(lang) + ')(?: ?(?:%|kr\\.?|DKK|EUR|€|mio\\.? kr\\.?))?', 'gi'), out = [], m;
    while ((m = re.exec(text))) {
      var prev = text.charAt(m.index - 1), next = text.charAt(m.index + m[0].length);
      if (/[\w.,/-]/.test(prev) && !/[ ($]/.test(prev)) continue;
      if (/[\d/]/.test(next)) continue;
      var p = parseVal(m[0].replace(/\.$/, function () { return /kr\.$/i.test(m[0]) ? '.' : ''; }), lang);
      if (p) out.push(p);
    }
    return out;
  }

  function detectWaterfall(tbl, lang) {
    var rows = tbl.rows;
    if (rows.length < 3 || rows.length > 12) return null;
    var w = rows[0].length, last = rows[rows.length - 1], items = rows.slice(0, -1);
    if (w < 2 || rows.some(function (r) { return r.length !== w; })) return null;
    if (!isTotal(last[0]) || items.some(function (r) { return isTotal(r[0]); })) return null;
    for (var c = w - 1; c >= 1; c--) {
      var tot = parseVal(last[c], lang);
      if (!tot || !CUR[tot.u]) continue;
      var vals = items.map(function (r) { return parseVal(r[c], lang); });
      if (vals.some(function (x) { return !x || x.u !== tot.u; })) continue;
      var sum = 0, dmax = tot.d;
      vals.forEach(function (x) { sum += x.v; dmax = Math.max(dmax, x.d); });
      if (Math.abs(sum - tot.v) > Math.pow(10, -tot.d) * 0.51 + 1e-9) continue;
      if (vals.every(function (x) { return x.v === 0; })) continue;
      return {
        type: 'waterfall', unit: tot.u, head: tbl.head ? clean(tbl.head[c]) : '',
        // a bare number as the label (month 1, 2, 3) gets the column name: "Måned 1"
        items: items.map(function (r, i) { var l = clean(r[0]); if (/^\d{1,3}$/.test(l) && tbl.head && clean(tbl.head[0])) l = clean(tbl.head[0]) + ' ' + l; return { label: l, v: vals[i].v, t: vals[i].t }; }),
        total: { label: clean(last[0]), v: tot.v, t: tot.t }
      };
    }
    return null;
  }

  /* ---------------- flow ---------------- */
  var STAGES = [
    ['period', /\b(perioden?|period|måned(en)?|month)\b/i, 'Periode', 'Period'],
    ['data', /\b(data|crm|deals?|handler|salg|sales)\b/i, 'Data', 'Data'],
    ['calc', /(beregn|udregn|calculat)/i, 'Beregning', 'Calculation'],
    ['statement', /(opgørelse|statement)/i, 'Opgørelse', 'Statement'],
    ['approval', /(godkend|approv)/i, 'Godkendelse', 'Approval'],
    ['payout', /(udbetal|pay ?out|payroll|lønfil|lønsystem|lønkørsel|\bløn(nen)?\b|salary)/i, 'Udbetaling', 'Payroll']
  ];
  function stageOf(text) { var best = -1; STAGES.forEach(function (s, i) { if (s[1].test(text)) best = i; }); return best; }
  // items: list item texts -> {type:'flow', steps:[{label, stage}]} or null; force: explicit list (no keyword rules)
  function detectFlow(items, lang, force) {
    items = items.map(clean).filter(Boolean);
    if (items.length < (force ? 2 : 3) || items.length > 8) return null;
    var steps = [], seq = [];
    for (var i = 0; i < items.length; i++) {
      var t = items[i], lead = '', m = t.match(/^([^:.]{2,40}):\s/);
      if (m && m[1].split(' ').length <= 5) lead = m[1];
      if (force) { steps.push({ label: lead || (t.length <= 40 ? t.replace(/[.:]$/, '') : t.split(/[.:,]/)[0].slice(0, 40)), stage: -1 }); continue; }
      var st = stageOf(lead || t.split(/\. /)[0]);
      if (!lead) return null; // lists without "Lead: text" items say too little to name the steps (explicit lists only)
      if (st >= 0) seq.push(st);
      var prev = steps[steps.length - 1];
      if (!lead && prev && prev.stage === st && !prev.lead) continue;
      steps.push({ label: lead || STAGES[st][lang === 'en' ? 3 : 2], stage: st, lead: !!lead });
    }
    if (force) return { type: 'flow', steps: steps };
    if (seq.length < Math.max(3, Math.ceil(items.length / 2))) return null;
    for (var k = 1; k < seq.length; k++) if (seq[k] < seq[k - 1]) return null;
    var distinct = seq.filter(function (s, n) { return seq.indexOf(s) === n; });
    if (distinct.length < 3 || seq.indexOf(4) < 0 || seq.indexOf(5) < seq.indexOf(4)) return null;
    return { type: 'flow', steps: steps.map(function (s) { return { label: s.label, stage: s.stage }; }) };
  }

  /* ---------------- key numbers ---------------- */
  var KEYH = /^(nøglefund|nøgletal|de vigtigste tal|vigtigste tal|key findings|key numbers|key figures|key stats|key statistics)$/i;
  function statToken(s, lang) {
    var t = clean(s).replace(/:$/, ''), q = t.match(QUAL), body = q ? t.slice(q[0].length) : t;
    var p = parseVal(body, lang);
    return p && p.u !== '' ? { t: t, v: p.v, u: p.u } : null;
  }
  // heading text + items [{text, bold: [texts of <strong> in order], lead: true when the item starts with its first <strong>}]
  function detectNumbers(heading, items, lang) {
    if (!KEYH.test(clean(heading).replace(/:$/, '')) || items.length < 3 || items.length > 8) return null;
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i], pick = null, lead = false;
      for (var b = 0; b < (it.bold || []).length && !pick; b++) { pick = statToken(it.bold[b], lang); lead = pick && b === 0 && it.lead; }
      if (!pick) return null;
      out.push({ big: pick.t, bold: b - 1, lead: !!lead });
    }
    return { type: 'numbers', cards: out };
  }

  /* ---------------- calculation strip ---------------- */
  // "a × b = c", "a + b = c", "a ÷ b × 100 = c %", "a × p/q = c", "a × b ... giver/gives ... c": checked to the last digit
  function parseExpr(text, lang) {
    var s = clean(text), N = '(?:' + PRE.replace('(', '(?:') + ' ?)?(?:' + core(lang) + ')(?:/\\d+)?(?: ?(?:%|kr\\.?|DKK|EUR|€))?';
    var OP = ' ?(×|÷|\\+| [x*/] | [-−] ) ?', LAB = '(?: (?:[a-zæøåA-ZÆØÅ][\\w\\-æøåÆØÅ\']*)){0,4}';
    var CON = '(?: ?= ?| (?:giver|gives|giving|give|is|er|equals|pays|earns|bliver|=)(?: [\\wæøåÆØÅ\\-\']+){0,5} )';
    var re = new RegExp('(' + N + ')(' + LAB + ')((?:' + OP.replace('(', '(?:') + N + LAB + ')+)' + CON + '(' + N + ')', 'g'), m;
    while ((m = re.exec(s))) {
      var parts = [], ok = true;
      var first = operand(m[1], m[2], lang); if (!first) { ok = false; }
      parts.push(first);
      var rest = m[3], rr = new RegExp(OP + '(' + N + ')(' + LAB + ')', 'g'), x;
      while (ok && (x = rr.exec(rest))) { var o = operand(x[2], x[3], lang); if (!o) { ok = false; break; } o.op = x[1].trim(); parts.push(o); }
      var res = parseVal(m[4].replace(/\/\d+$/, ''), lang);
      if (!ok || !res || /\/\d+$/.test(m[4])) continue;
      var val = evaluate(parts, res);
      if (val == null) continue;
      if (Math.abs(val - res.v) > 0.5 * Math.pow(10, -res.d) + 1e-9 * Math.abs(res.v)) continue;
      var curs = parts.concat([res]).map(function (p) { return CUR[p.u] ? p.u : ''; }).filter(Boolean);
      if (curs.some(function (c) { return c !== curs[0]; })) continue;
      return { type: 'calc-strip', parts: parts.map(function (p) { return { t: p.t, label: p.label, op: p.op || '' }; }), result: { t: res.t, v: res.v, d: res.d } };
    }
    return null;
  }
  function operand(tok, label, lang) {
    var t = clean(tok), f = t.match(/^(\d+)\/(\d+)$/);
    if (f) return +f[2] ? { v: +f[1] / +f[2], u: '', t: t, frac: 1, label: clean(label) } : null;
    if (/\//.test(t)) return null;
    var p = parseVal(t, lang);
    if (!p) return null;
    p.label = clean(label);
    return p;
  }
  // × and ÷ before + and −; a percentage next to × or ÷ is a fraction (300.000 × 3 % = 9.000)
  function evaluate(parts, res) {
    var terms = [], cur = null, sign = 1, hasMul = false;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], op = p.op || '', v = p.v;
      var mulCtx = op === '×' || op === 'x' || op === '*' || op === '÷' || op === '/' || (parts[i + 1] && /^(×|x|\*|÷|\/)$/.test(parts[i + 1].op));
      if (p.u === '%') { if (!mulCtx) return null; v = v / 100; }
      if (!op) cur = v;
      else if (op === '×' || op === 'x' || op === '*') { cur *= v; hasMul = true; }
      else if (op === '÷' || op === '/') { if (!v) return null; cur /= v; hasMul = true; }
      else { terms.push(sign * cur); sign = op === '+' ? 1 : -1; cur = v; }
    }
    terms.push(sign * cur);
    var out = terms.reduce(function (a, b) { return a + b; }, 0);
    // "a ÷ b × 100 = 80 %": the result is already in percent when it carries % and no operand did
    if (res.u === '%' && !parts.some(function (p) { return p.u === '%'; })) return out;
    if (res.u === '%' && hasMul) return out * 100;
    return out;
  }

  /* ---------------- calculators (exact paths) ---------------- */
  var CALC = {
    tiers: ['/post/trappemodel-provision', '/en/post/tiered-commission', '/ordbog/trappemodel', '/en/glossary/tiered-commission', '/post/provision-beregning-formler-og-eksempler', '/en/post/commission-calculations-formulas-and-examples'],
    accelerator: ['/post/provision-acceleratorer-guide', '/en/post/commission-accelerators-guide', '/ordbog/accelerator', '/en/glossary/accelerator', '/ordbog/multiplier', '/en/glossary/multiplier'],
    split: ['/ordbog/split-commission', '/en/glossary/split-commission', '/ordbog/salgskreditering', '/en/glossary/sales-crediting'],
    'holiday-pay': ['/post/feriepenge-af-provision', '/ordbog/feriepenge-af-provision', '/en/glossary/holiday-pay-on-commission'],
    'sick-pay': ['/post/provision-under-sygdom-og-barsel', '/ordbog/provision-under-sygdom', '/en/glossary/commission-during-sick-leave'],
    quota: ['/post/kvoteplan-skabelon', '/en/post/sales-quota-planning-template', '/ordbog/salgskvota', '/en/glossary/sales-quota', '/ordbog/quota', '/en/glossary/quota']
  };
  var CHUNK = { tiers: 'calc-tiers', accelerator: 'calc-accelerator', split: 'calc-split', 'holiday-pay': 'calc-holiday', 'sick-pay': 'calc-absence', quota: 'calc-quota' };
  function calcFor(path) {
    var p = String(path || '').replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase();
    for (var id in CALC) if (CALC[id].indexOf(p) > -1) return id;
    return null;
  }

  /* ---------------- formatting (count-up) ---------------- */
  function group(i, lang) { return i.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.'); }
  // a number token "Ca. 54.800 kr." -> {pre, v, d, suf}; format(x) gives the same token for any x
  function tokenParts(t, lang) {
    var m = t.match(new RegExp('^(.*?)(' + core(lang) + ')(.*)$'));
    if (!m) return null;
    return { pre: m[1], v: toNum(m[2], lang), d: decOf(m[2], lang), suf: m[3], grp: m[2].indexOf(lang === 'en' ? ',' : '.') > -1 };
  }
  function fmtTok(tp, x, lang) {
    var s = Math.abs(x).toFixed(tp.d), q = s.split('.');
    return tp.pre + (tp.grp ? group(q[0], lang) : q[0]) + (q[1] ? (lang === 'en' ? '.' : ',') + q[1] : '') + tp.suf;
  }

  /* ---------------- styles ---------------- */
  var CSS = '.pw-vis{margin:28px 0 4px;padding:20px 20px 16px;background:#fff;border:1px solid rgba(17,6,99,.1);border-radius:16px;color:#110663;font-size:14px;line-height:1.4;font-weight:400;font-variant-numeric:tabular-nums;overflow:hidden;box-sizing:border-box;max-width:100%}' +
    '.pw-vis *{box-sizing:border-box}.pw-vis__cap{display:block;margin:0 0 14px;font-size:12px;font-weight:600;letter-spacing:.02em;text-transform:uppercase;color:#5E5B98}' +
    /* staircase */
    '.pw-vis-st{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);column-gap:6px;position:relative}' +
    '.pw-vis-st__col{display:flex;flex-direction:column;justify-content:flex-end;height:170px}' +
    '.pw-vis-st__rate{text-align:center;font-size:15px;font-weight:600;margin-bottom:6px;opacity:0}' +
    '.pw-vis-st__bar{border-radius:8px 8px 2px 2px;background:linear-gradient(180deg,#8a7af2,#4C39CA);transform:scaleY(0);transform-origin:50% 100%}' +
    '.pw-vis-st__col--on .pw-vis-st__bar{background:linear-gradient(180deg,#46D3F7,#4C39CA)}' +
    '.pw-vis-st__rng{padding-top:8px;border-top:2px solid #110663;text-align:center;font-size:12px;line-height:1.3;color:#34326C;overflow-wrap:anywhere}' +
    '.pw-vis-st--mk{padding-top:30px}.pw-vis-st__mk{position:absolute;top:0;height:200px;width:0;border-left:2px dashed #110663;opacity:0}' +
    '.pw-vis-st__mk span{position:absolute;top:0;left:6px;white-space:nowrap;padding:2px 8px;border-radius:999px;background:#110663;color:#fff;font-size:12px;font-weight:500;line-height:1.4}' +
    '.pw-vis-st__mk--r span{left:auto;right:6px}' +
    /* waterfall */
    '.pw-vis-wf__row{display:grid;grid-template-columns:minmax(0,34%) minmax(0,1fr) auto;column-gap:12px;align-items:center;padding:5px 0}' +
    '.pw-vis-wf__lab{font-size:13px;color:#34326C;overflow-wrap:anywhere}.pw-vis-wf__row--tot .pw-vis-wf__lab{font-weight:600;color:#110663}' +
    '.pw-vis-wf__trk{position:relative;height:16px}' +
    '.pw-vis-wf__bar{position:absolute;top:0;bottom:0;min-width:2px;border-radius:4px;background:#4C39CA;transform:scaleX(0);transform-origin:0 50%}' +
    '.pw-vis-wf__bar--neg{background:#E35D6A;transform-origin:100% 50%}.pw-vis-wf__bar--tot{background:#110663}' +
    '.pw-vis-wf__amt{font-size:13px;font-weight:600;white-space:nowrap;text-align:right;opacity:0}' +
    '.pw-vis-wf__row--tot{margin-top:4px;padding-top:9px;border-top:1px solid rgba(17,6,99,.12)}' +
    /* flow */
    '.pw-vis-fl{display:flex;margin:0;padding:0;list-style:none}' +
    '.pw-vis-fl__s{position:relative;flex:1 1 0;min-width:0;margin:0;padding:36px 4px 0;text-align:center;font-size:13px;line-height:1.35;color:#110663;list-style:none}' +
    '.pw-vis-fl__d{position:absolute;z-index:1;top:0;left:50%;width:26px;height:26px;margin-left:-13px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:2px solid #4C39CA;background:#fff;color:#4C39CA;font-size:12px;font-weight:600;transform:scale(0)}' +
    '.pw-vis-fl__s--pay .pw-vis-fl__d{background:#110663;border-color:#110663;color:#fff}' +
    '.pw-vis-fl__l{position:absolute;top:12px;left:50%;width:100%;height:2px;background:#4C39CA;transform:scaleX(0);transform-origin:0 50%}' +
    '.pw-vis-fl__t{display:block;opacity:0;overflow-wrap:anywhere}' +
    '@media (max-width:600px){.pw-vis-fl__s{padding:30px 1px 0;font-size:11px;line-height:1.3}.pw-vis-fl__d{width:22px;height:22px;margin-left:-11px;font-size:11px}.pw-vis-fl__l{top:10px}' +
    /* five or more steps on a phone: labels alternate below and above the line, so each gets two columns of room */
    '.pw-vis-fl--alt{height:112px}.pw-vis-fl--alt .pw-vis-fl__s{height:100%;padding:0}.pw-vis-fl--alt .pw-vis-fl__d{top:42px}.pw-vis-fl--alt .pw-vis-fl__l{top:52px}' +
    '.pw-vis-fl--alt .pw-vis-fl__t{position:absolute;top:70px;left:-50%;width:200%}.pw-vis-fl--alt .pw-vis-fl__s:nth-child(even) .pw-vis-fl__t{top:auto;bottom:74px}' +
    '.pw-vis-fl--alt .pw-vis-fl__s:first-child .pw-vis-fl__t{left:0;width:150%;text-align:left}.pw-vis-fl--alt .pw-vis-fl__s:last-child .pw-vis-fl__t{left:auto;right:0;width:150%;text-align:right}}' +
    /* calculator */
    '.pw-vis-calc{margin:36px 0 8px}.pw-vis-calc .pw-calc{grid-template-columns:minmax(0,1fr);max-width:100%;border-radius:16px;overflow:hidden}' +
    '.pw-vis-calc__h{margin:0 0 14px!important;font-size:clamp(20px,1.8vw,24px)!important;line-height:1.25!important;font-weight:500!important;color:#110663!important}' +
    '.pw-vis-calc p.pw-calc__formula{margin:0;font-size:14px;font-weight:500;line-height:1.5;color:#110663}.pw-vis-calc p.pw-calc__explain{margin:0;font-size:14px;font-weight:400;line-height:1.6;color:#34326C}.pw-vis-calc p.pw-calc__fine{margin:0;font-size:12.5px;font-weight:400;line-height:1.5;color:#5E5B98}' +
    /* key numbers */
    'ul.pw-vis-kn,ol.pw-vis-kn{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));gap:12px;margin:24px 0!important;padding:0!important;list-style:none!important}' +
    '.pw-vis-kn>li{position:relative;margin:0!important;padding:18px 18px 16px!important;background:#fff;border:1px solid rgba(17,6,99,.1);border-radius:14px;font-size:14px!important;line-height:1.5!important;list-style:none!important}' +
    '.pw-vis-kn>li::before,.pw-vis-kn>li::marker{content:none;display:none}' +
    '.pw-vis-kn__big{display:block;margin-bottom:8px;font-size:clamp(26px,2.6vw,32px);font-weight:400;line-height:1.1;letter-spacing:-.02em;color:#4C39CA;white-space:nowrap}' +
    '.pw-vis-sr{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;white-space:nowrap;clip-path:inset(50%)}' +
    /* calculation strip */
    '.pw-vis-eq{display:flex;flex-wrap:wrap;align-items:flex-start;gap:6px 8px;margin:4px 0 6px;font-variant-numeric:tabular-nums}' +
    '.pw-vis-eq__p{display:flex;flex-direction:column;align-items:center;gap:3px;opacity:0;transform:translateY(4px)}' +
    '.pw-vis-eq__n{padding:5px 10px;border-radius:8px;background:#F4F1FE;color:#110663;font-size:15px;font-weight:500;line-height:1.3;white-space:nowrap;text-align:center}' +
    '.pw-vis-eq__p--r .pw-vis-eq__n{background:#110663;color:#fff}' +
    '.pw-vis-eq--c{position:absolute;top:50%;right:0;width:max-content;margin:-12px 0 0;flex-wrap:nowrap;gap:6px}.pw-vis-eq--c .pw-vis-eq__g{gap:6px}.pw-vis-eq--c .pw-vis-eq__n{padding:2px 8px;font-size:13px;line-height:20px}.pw-vis-eq--c .pw-vis-eq__o{padding-top:0;font-size:14px;line-height:24px}' +
    '.pw-vis-eq__l{max-width:14ch;font-size:11px;line-height:1.25;text-align:center;color:#5E5B98}' +
    '.pw-vis-eq__g{display:flex;align-items:flex-start;gap:8px}.pw-vis-eq__o{padding-top:5px;font-size:16px;font-weight:600;line-height:1.3;color:#4C39CA}' +
    /* in view */
    '.is-in .pw-vis-st__bar,.is-in .pw-vis-wf__bar,.is-in .pw-vis-fl__d,.is-in .pw-vis-fl__l{transform:none}' +
    '.is-in .pw-vis-st__rate,.is-in .pw-vis-wf__amt,.is-in .pw-vis-fl__t,.is-in .pw-vis-st__mk{opacity:1}.is-in .pw-vis-eq__p{opacity:1;transform:none}' +
    '@media (prefers-reduced-motion:reduce){.pw-vis *,.pw-vis-eq *{transition:none!important;animation:none!important}}' +
    '@media (max-width:560px){.pw-vis{padding:16px 14px 12px}.pw-vis-wf__row{grid-template-columns:minmax(0,1fr) auto;row-gap:4px}.pw-vis-wf__trk{grid-column:1/-1;grid-row:2}' +
    '.pw-vis-st__col{height:140px}.pw-vis-st__mk{height:170px}.pw-vis-st__rate{font-size:13px}.pw-vis-st__rng{font-size:11px}}';

  var TXT = {
    da: { tiers: 'Trin og satser', wf: 'Sådan bliver tallet til', flow: 'Trin for trin', ex: 'Eksempel', calc: 'Prøv med dine egne tal' },
    en: { tiers: 'Tiers and rates', wf: 'How the total adds up', flow: 'Step by step', ex: 'Example', calc: 'Try it with your own numbers' }
  };

  /* ---------------- page ---------------- */
  function run(doc, win) {
    var html = doc.documentElement, body = doc.body;
    if (!body || [html, body].some(function (n) { return n.hasAttribute('data-no-visuals') || n.classList.contains('pw-no-visuals'); }) || doc.querySelector('.pw-root.pw-no-visuals,[data-no-visuals="page"]')) return;
    if (win.__pwVisuals) return;
    win.__pwVisuals = 1;
    var lang = /^en/i.test(html.getAttribute('lang') || '') ? 'en' : 'da', T = TXT[lang];
    var reduce = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var IO = win.IntersectionObserver, sent = {}, count = 0;
    function off(el) { return !!(el.closest && el.closest(OFF)); }
    function el(tag, cls, text) { var n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
    function css() { if (doc.getElementById('pw-vis-css')) return; var st = el('style'); st.id = 'pw-vis-css'; st.textContent = CSS; (doc.head || html).appendChild(st); }
    function track(type) {
      if (sent[type]) return; sent[type] = 1;
      try { if (win.plausible) win.plausible('Visual viewed', { props: { type: type } }); } catch (e) { /* analytics off */ }
    }
    function inView(n) { var r = n.getBoundingClientRect(); return r.bottom > 0 && r.top < (win.innerHeight || html.clientHeight) && (r.width || r.height); }
    // run fn while `n` is off screen; when it is on screen now, wait until it has left. Keeps the reading position when
    // the change happens above the viewport and the browser has no scroll anchoring (Safari).
    function offscreen(n, fn) {
      var done = false;
      var apply = function () {
        if (done) return; done = true;
        var a = n.nextElementSibling || n, r0 = a.getBoundingClientRect().top, above = n.getBoundingClientRect().bottom <= 0;
        fn();
        if (above) { var d = a.getBoundingClientRect().top - r0; if (d) win.scrollBy(0, d); }
      };
      if (!IO || !inView(n)) { apply(); return; }
      var io = new IO(function (es) { es.forEach(function (e) { if (!e.isIntersecting) { io.disconnect(); apply(); } }); });
      io.observe(n);
    }
    // play the entrance once when the visual is a quarter in view; count the view for Plausible
    function reveal(node, type, onIn) {
      var go = function () { node.classList.add('is-in'); track(type); if (onIn && !reduce) onIn(); };
      if (reduce) node.classList.add('is-in');
      if (!IO) { go(); return; }
      var io = new IO(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); go(); } }); }, { threshold: 0.25 });
      io.observe(node);
    }
    function countUp(span, t, ms) {
      var tp = tokenParts(t, lang); if (!tp) return;
      var w = span.getBoundingClientRect().width; if (w) span.style.minWidth = Math.ceil(w) + 'px';
      var t0 = null;
      var step = function (ts) {
        if (t0 == null) t0 = ts;
        var k = Math.min(1, (ts - t0) / ms), e = 1 - Math.pow(1 - k, 3);
        span.textContent = k < 1 ? fmtTok(tp, tp.v * e, lang) : t;
        if (k < 1) win.requestAnimationFrame(step);
      };
      span.textContent = fmtTok(tp, 0, lang);
      win.requestAnimationFrame(step);
    }
    function box(cls, cap) { var b = el('div', 'pw-vis ' + cls); b.setAttribute('aria-hidden', 'true'); b.setAttribute('data-pw-vis', cls.replace('pw-vis--', '')); if (cap) b.appendChild(el('span', 'pw-vis__cap', cap)); return b; }
    function delay(n, ms) { n.style.transition = 'opacity .45s ease ' + ms + 'ms,transform .6s cubic-bezier(.2,.7,.2,1) ' + ms + 'ms'; }

    function tiersVis(spec, marker) {
      var b = box('pw-vis--tiers', spec.rangeHead && spec.rateHead ? spec.rateHead + ' · ' + spec.rangeHead : T.tiers);
      var g = el('div', 'pw-vis-st'), n = spec.tiers.length, max = 0, on = -1, pos = 0;
      spec.tiers.forEach(function (t) { max = Math.max(max, t.rate); });
      if (marker) spec.tiers.forEach(function (t, i) {
        if (marker.v >= t.lo && (marker.v <= t.hi || !isFinite(t.hi))) {
          if (on < 0) { on = i; pos = (i + (isFinite(t.hi) ? (marker.v - t.lo) / (t.hi - t.lo) : 0.78)) / n; } // open top tier: right of its rate label
        }
      });
      spec.tiers.forEach(function (t, i) {
        var c = el('div', 'pw-vis-st__col' + (i === on ? ' pw-vis-st__col--on' : '')), r = el('div', 'pw-vis-st__rate', t.label), bar = el('div', 'pw-vis-st__bar');
        bar.style.height = Math.max(6, Math.round(t.rate / (max || 1) * 100) * 0.78) + '%';
        delay(bar, i * 140); delay(r, 300 + i * 140);
        c.appendChild(r); c.appendChild(bar); g.appendChild(c);
        var lab = el('div', 'pw-vis-st__rng', t.range); lab.style.gridRow = '2'; g.appendChild(lab);
      });
      if (on > -1) {
        var mk = el('div', 'pw-vis-st__mk' + (pos > 0.6 ? ' pw-vis-st__mk--r' : ''));
        mk.style.left = (pos * 100).toFixed(2) + '%'; g.className += ' pw-vis-st--mk';
        mk.appendChild(el('span', '', T.ex + ': ' + marker.t)); delay(mk, 300 + n * 140); g.appendChild(mk);
      }
      b.appendChild(g);
      return b;
    }
    function wfVis(spec) {
      var b = box('pw-vis--waterfall', spec.head ? spec.head : T.wf), run0 = 0, lo = 0, hi = 0, segs = [];
      spec.items.forEach(function (it) { var a = run0; run0 += it.v; segs.push([a, run0]); lo = Math.min(lo, a, run0); hi = Math.max(hi, a, run0); });
      lo = Math.min(lo, spec.total.v); hi = Math.max(hi, spec.total.v);
      var span = hi - lo || 1;
      var row = function (label, amt, a, z, kind, i) {
        var r = el('div', 'pw-vis-wf__row' + (kind === 'tot' ? ' pw-vis-wf__row--tot' : '')), trk = el('div', 'pw-vis-wf__trk');
        var bar = el('div', 'pw-vis-wf__bar' + (kind ? ' pw-vis-wf__bar--' + kind : ''));
        bar.style.left = ((Math.min(a, z) - lo) / span * 100).toFixed(2) + '%';
        bar.style.width = (Math.abs(z - a) / span * 100).toFixed(2) + '%';
        var am = el('div', 'pw-vis-wf__amt', amt);
        delay(bar, i * 160); delay(am, 250 + i * 160);
        trk.appendChild(bar); r.appendChild(el('div', 'pw-vis-wf__lab', label)); r.appendChild(trk); r.appendChild(am);
        return r;
      };
      spec.items.forEach(function (it, i) { b.appendChild(row(it.label, it.t, segs[i][0], segs[i][1], it.v < 0 ? 'neg' : '', i)); });
      b.appendChild(row(spec.total.label, spec.total.t, 0, spec.total.v, 'tot', spec.items.length));
      return b;
    }
    function flowVis(spec) {
      var b = box('pw-vis--flow', T.flow), n = spec.steps.length, ol = el('div', 'pw-vis-fl' + (n > 4 ? ' pw-vis-fl--alt' : '')), payAt = -1;
      spec.steps.forEach(function (s, i) { if (s.stage === 5) payAt = i; });
      spec.steps.forEach(function (s, i) {
        var li = el('div', 'pw-vis-fl__s' + (i === payAt ? ' pw-vis-fl__s--pay' : '')), d = el('span', 'pw-vis-fl__d', String(i + 1)), t = el('span', 'pw-vis-fl__t', s.label);
        delay(d, i * 260); delay(t, 120 + i * 260);
        if (i < n - 1) { var l = el('span', 'pw-vis-fl__l'); delay(l, 120 + i * 260); li.appendChild(l); }
        li.appendChild(d); li.appendChild(t); ol.appendChild(li);
      });
      b.appendChild(ol);
      return b;
    }
    function stripVis(spec, compact) {
      var w = el('div', 'pw-vis-eq'), i = 0, g = null, add = function (n) { delay(n, i++ * 170); (g || w).appendChild(n); }, grp = function () { g = el('span', 'pw-vis-eq__g'); w.appendChild(g); };
      w.setAttribute('aria-hidden', 'true'); w.setAttribute('data-pw-vis', 'calc-strip');
      spec.parts.forEach(function (p) {
        grp();
        if (p.op) add(el('span', 'pw-vis-eq__o', p.op === '*' || p.op === 'x' ? '×' : p.op === '/' ? '÷' : p.op === '-' ? '−' : p.op));
        var c = el('span', 'pw-vis-eq__p'); c.appendChild(el('span', 'pw-vis-eq__n', p.t));
        if (p.label && !compact) c.appendChild(el('span', 'pw-vis-eq__l', p.label));
        add(c);
      });
      grp(); add(el('span', 'pw-vis-eq__o', '='));
      var r = el('span', 'pw-vis-eq__p pw-vis-eq__p--r'), rn = el('span', 'pw-vis-eq__n', spec.result.t); r.appendChild(rn); add(r);
      w.__count = rn; w.__res = spec.result.t; w.__ms = i * 170;
      if (compact) w.className += ' pw-vis-eq--c';
      return w;
    }
    function rowsOf(t) {
      var trs = Array.prototype.slice.call(t.rows || t.querySelectorAll('tr')), head = null;
      var cells = function (tr) { return Array.prototype.map.call(tr.cells || tr.querySelectorAll('th,td'), function (c) { return clean(c.textContent); }); };
      if (trs.length && (trs[0].querySelector('th') || trs[0].parentNode.tagName === 'THEAD')) head = cells(trs.shift());
      return { head: head, rows: trs.map(cells) };
    }
    function textNear(n, dir) {
      var out = [], s = n;
      for (var k = 0; k < 2; k++) { s = dir > 0 ? s.nextElementSibling : s.previousElementSibling; if (!s || /^H[1-4]$/.test(s.tagName)) break; if (s.tagName === 'P' || s.tagName === 'UL') out.push(s.textContent); }
      return out;
    }

    var bodies = Array.prototype.filter.call(doc.querySelectorAll(BODIES), function (b) { return !off(b); });
    var jobs = [];
    bodies.forEach(function (bd) {
      Array.prototype.forEach.call(bd.querySelectorAll('table'), function (t) {
        if (off(t) || count >= 6) return;
        var tb = rowsOf(t), spec = detectTiers(tb, lang), anchor = t.closest('.pw-post__table-scroll') || t, v = null;
        if (anchor.parentNode !== bd && anchor.parentNode && anchor.parentNode.parentNode === bd && anchor.parentNode.children.length === 1) anchor = anchor.parentNode;
        if (spec) v = tiersVis(spec, findMarker(spec, textNear(anchor, 1).concat(textNear(anchor, -1)), lang));
        else if ((spec = detectWaterfall(tb, lang))) v = wfVis(spec);
        if (v) { count++; jobs.push({ at: anchor, node: v, type: spec.type }); }
      });
      Array.prototype.forEach.call(bd.querySelectorAll('ol'), function (l) {
        if (off(l) || l.closest('[data-pw-visual]') || count >= 6) return;
        var spec = detectFlow(Array.prototype.map.call(l.children, function (li) { return li.textContent; }), lang);
        if (spec) { count++; jobs.push({ at: l, node: flowVis(spec), type: 'flow' }); }
      });
      Array.prototype.forEach.call(bd.querySelectorAll('h2,h3'), function (h) {
        var l = h.nextElementSibling;
        if (!l || !/^(UL|OL)$/.test(l.tagName) || off(l)) return;
        var items = Array.prototype.map.call(l.children, function (li) {
          var bs = li.querySelectorAll('strong,b'), f = li.firstChild;
          while (f && f.nodeType === 3 && !f.textContent.trim()) f = f.nextSibling;
          return { text: li.textContent, bold: Array.prototype.map.call(bs, function (x) { return x.textContent; }), lead: !!(bs[0] && f && (f === bs[0] || f.contains && f.contains(bs[0]))), li: li, els: bs };
        });
        var spec = detectNumbers(h.textContent, items, lang);
        if (spec) jobs.push({ list: l, items: items, spec: spec, type: 'numbers' });
      });
    });
    // explicit flow lines (an embed with data-pw-visual="flow")
    Array.prototype.forEach.call(doc.querySelectorAll(EXPLICIT), function (x) {
      if (x.getAttribute('data-pw-visual') !== 'flow' || off(x)) return;
      var steps = x.getAttribute('data-steps') ? x.getAttribute('data-steps').split('|') : Array.prototype.map.call(x.querySelectorAll('li'), function (li) { return li.textContent; });
      var spec = detectFlow(steps, lang, true);
      if (spec) jobs.push({ at: x, node: flowVis(spec), type: 'flow', inside: !x.children.length && !/^(UL|OL)$/.test(x.tagName) });
    });
    // calculation strip in the glossary example
    Array.prototype.forEach.call(doc.querySelectorAll('.pw-term__example-text'), function (ex) {
      var holder = ex.closest('.pw-term__example') || ex.parentNode;
      if (off(ex) || holder.closest('.w-condition-invisible')) return;
      var spec = parseExpr(ex.textContent, lang);
      var head = Array.prototype.filter.call(holder.children, function (c) { return !c.contains(ex); })[0];
      if (spec) jobs.push({ at: ex, node: stripVis(spec), type: 'calc-strip', spec: spec, head: ex.closest('.pw-term__example') ? head : null });
    });
    // calculator after the relevant section
    var cid = calcFor(win.location && win.location.pathname), host = bodies[0];
    if (cid && host && !doc.querySelector('[data-tool]')) {
      var hs = Array.prototype.filter.call(host.children, function (c) { return c.tagName === 'H2'; }), at = null;
      for (var i = 0; i < hs.length && !at; i++) if (/(beregn|regneeksempel|eksempel|udregn|calculat|example|formula|formel)/i.test(hs[i].textContent)) at = hs[i + 1] || 'end';
      if (!at) for (i = 0; i < hs.length && !at; i++) if (/(ofte stillede|faq|frequently asked|spørgsmål og svar)/i.test(hs[i].textContent)) at = hs[i];
      var wrap = el('div', 'pw-vis-calc'), h3 = el('h3', 'pw-vis-calc__h', T.calc), root = el('div');
      root.setAttribute('data-tool', cid); wrap.appendChild(h3); wrap.appendChild(root);
      jobs.push({ at: at && at !== 'end' ? at : null, end: host, node: wrap, type: 'calculator', calc: cid });
    }
    if (!jobs.length) return;
    css();
    jobs.forEach(function (j) {
      if (j.type === 'numbers') {
        offscreen(j.list, function () {
          j.list.classList.add('pw-vis-kn');
          j.items.forEach(function (it, k) {
            var c = j.spec.cards[k], big = el('span', 'pw-vis-kn__big', c.big.replace(/:$/, ''));
            big.setAttribute('aria-hidden', 'true');
            if (c.lead) it.els[c.bold].classList.add('pw-vis-sr');
            it.li.insertBefore(big, it.li.firstChild);
            j.list['__b' + k] = big;
          });
          reveal(j.list, 'numbers', function () { j.items.forEach(function (it, k) { var big = j.list['__b' + k]; setTimeout(function () { countUp(big, big.textContent, 900); }, k * 90); }); });
        });
        return;
      }
      // glossary example: where the label row has room (desktop), the sums sit on that row, right-aligned and absolutely
      // positioned, so nothing moves; otherwise the full strip goes above the sentence once the box is off screen
      if (j.type === 'calc-strip' && j.head) {
        var c = stripVis(j.spec, true), lab = j.head.firstElementChild;
        c.style.visibility = 'hidden'; j.head.style.position = 'relative'; j.head.appendChild(c);
        if (c.getBoundingClientRect().width <= j.head.clientWidth - (lab && lab !== c ? lab.getBoundingClientRect().width : 0) - 20) {
          c.style.visibility = '';
          reveal(c, 'calc-strip', function () { setTimeout(function () { countUp(c.__count, c.__res, 800); }, c.__ms); });
          return;
        }
        j.head.removeChild(c); j.head.style.position = '';
      }
      var ref = j.at || j.end.lastElementChild || j.end;
      offscreen(ref, function () {
        if (j.inside) j.at.appendChild(j.node);
        else if (j.at) j.at.parentNode.insertBefore(j.node, j.at);
        else j.end.appendChild(j.node);
        if (j.type === 'calculator') {
          var need = win.__pwNeed;
          if (need) { need('tool:calc-kit', null, true); need('tool:' + CHUNK[j.calc], null, true); }
        }
        reveal(j.node, j.type, j.type === 'calc-strip' ? function () { setTimeout(function () { countUp(j.node.__count, j.node.__res, 800); }, j.node.__ms); } : null);
      });
    });
  }

  return {
    parseVal: parseVal, parseRate: parseRate, parseRange: parseRange, detectTiers: detectTiers, detectWaterfall: detectWaterfall,
    detectFlow: detectFlow, detectNumbers: detectNumbers, parseExpr: parseExpr, findMarker: findMarker, numbersIn: numbersIn,
    calcFor: calcFor, CALC: CALC, tokenParts: tokenParts, fmtTok: fmtTok, run: run
  };
});
