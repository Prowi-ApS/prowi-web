import re, json, html, os, hashlib, sys, subprocess, shutil
SRC='src/scenes/'
OUT='dist/prowi-2026.js'
FONT_WOFF2='https://cdn.prod.website-files.com/6853f29490f75918cfe11ed3/fonts/6ad62e79ffa54333cee49f07-ReadexPro-Variable.woff2'
RES={
 'rep-app-celebration':'https://cdn.prod.website-files.com/6853f29490f75918cfe11ed3/6ad6513f7245cc107aecfea5_rep-app-celebration.webp',
}
def parse(name):
    s=open(SRC+name+'.dc.html').read()
    tpl=re.search(r'<x-dc(?:\s[^>]*)?>(.*?)</x-dc>',s,flags=re.S).group(1)
    m=re.search(r'<script type="text/x-dc" data-dc-script([^>]*)>(.*?)</script>',s,flags=re.S)
    js=m.group(2); attrs=m.group(1)
    pm=re.search(r'data-props="([^"]*)"',attrs)
    props=json.loads(html.unescape(pm.group(1))) if pm else {}
    # font-face rewrite
    tpl=tpl.replace("url('fonts/ReadexPro-VariableFont_wght.ttf') format('truetype')","url('%s') format('woff2')"%FONT_WOFF2)
    # strip design-doc body resets inside helmet styles (body{margin...}) — keep keyframes
    tpl=re.sub(r'body\{[^}]*\}','',tpl)
    # strip global link resets (a{...} a:hover{...}) — they would restyle every link on the host page
    tpl=re.sub(r'(?<![\w.#-])a(?::hover)?\{[^}]*\}','',tpl)
    defaults={k:v.get('default') for k,v in props.items() if not k.startswith('$') and isinstance(v,dict)}
    return {'html':tpl,'js':js,'props':json.dumps({k:v for k,v in props.items() if not k.startswith('$')}),'defaults':defaults}

ESBUILD=os.path.join('node_modules','.bin','esbuild')
def minify(code):
    """Minify one self-contained script with esbuild (npm i installs it). Falls back to the source if esbuild is missing."""
    if os.environ.get('PW_NOMINIFY') or not os.path.exists(ESBUILD): return code
    r=subprocess.run([ESBUILD,'--minify','--target=es2017','--loader=js','--charset=utf8','--legal-comments=none'],input=code.encode('utf-8'),capture_output=True,check=True)
    return r.stdout.decode('utf-8')
scenes={n:parse(n) for n in ['LiveMoment','ApprovalPhone','CompetitionScene']}
parts=[]
parts.append('/* Prowi 2026 site bundle — built from the Claude Design export. Do not edit by hand. */\n')
parts.append('(function(){ if (window.__prowiBundle) return; window.__prowiBundle = true;\n')
parts.append('window.__resources = Object.assign(window.__resources||{}, %s);\n'%json.dumps(RES))
parts.append('})();\n')
# UI runtime for the scenes: Preact (preact/compat, ~10 KB gz) exposed as window.React/ReactDOM.
# Set PW_VENDOR=react to build with the original React 18 files instead (rollback).
if os.environ.get('PW_VENDOR')=='react':
    parts.append(open('vendor/react.production.min.js').read()+'\n')
    parts.append(open('vendor/react-dom.production.min.js').read()+'\n')
else:
    parts.append(open('vendor/preact-compat-shim.min.js').read()+'\n')
parts.append(minify(open('src/dc-runtime.js',encoding='utf-8').read())+'\n')
parts.append('window.__PW_SCENES = %s;\n'%json.dumps(scenes))
parts.append(minify(open('src/scenes.js',encoding='utf-8').read())+'\n')
# page CSS: also pasted into the Webflow page head as <style id="pw-css"> (see head-css.html); keep both in sync
CSS=open('src/page.css',encoding='utf-8').read()
CSS_MIN=subprocess.run([ESBUILD,'--minify','--loader=css'],input=CSS.encode(),capture_output=True,check=True).stdout.decode().strip() if os.path.exists(ESBUILD) else CSS
# Above-the-fold subset (hero HubSpot badge) for the Webflow page head, so the badge is laid out at first paint.
_TOP=re.sub(r'@media[^{]*\{(?:[^{}]*\{[^}]*\})*\}','',CSS_MIN)
CRIT=''.join(re.findall(r'\.pw-hero__badge-stars(?:>\*)?\{[^}]*\}',_TOP))+''.join(re.findall(r'@media \(max-width:767px\)\{\.pw-hero__badge.*?\}\}',CSS_MIN))
open('dist/head-critical.html','w',encoding='utf-8').write('<style id="pw-css-critical">'+CRIT+'</style>\n')
parts.append('window.__PW_CSS = %s;\n'%json.dumps(CSS_MIN))
parts.append(minify(open('src/page.js',encoding='utf-8').read())+'\n')
os.makedirs('dist',exist_ok=True)
out=''.join(parts)
open(OUT,'w').write(out)
print(OUT, len(out), 'bytes; scenes:', {k:(len(v['html']),len(v['js'])) for k,v in scenes.items()})
