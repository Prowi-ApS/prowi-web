// Syntax check: every source file parses, and every built file parses as ES2017 (esbuild's target in build.py).
const fs = require('fs'), path = require('path'), acorn = require('acorn');
const walk = d => fs.readdirSync(d).flatMap(f => { const p = path.join(d, f); return fs.statSync(p).isDirectory() ? walk(p) : [p]; });
const root = path.join(__dirname, '..');
let n = 0, bad = 0;
for (const [dir, ecma] of [['src', 'latest'], ['dist', 2017], ['test', 'latest']]) {
  for (const f of walk(path.join(root, dir)).filter(f => f.endsWith('.js'))) {
    try { acorn.parse(fs.readFileSync(f, 'utf8'), { ecmaVersion: ecma, sourceType: 'script', allowReturnOutsideFunction: true }); n++; }
    catch (e) { bad++; console.error('syntax:', path.relative(root, f), e.message); }
  }
}
if (bad) process.exit(1);
console.log('syntax: ' + n + ' files parse');
