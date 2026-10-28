import re, json, html, os, hashlib, sys, subprocess, shutil
SRC='src/scenes/'
OUT='dist/prowi-2026.js'
# same URL as Webflow's own @font-face, so the browser fetches the file once (cdn.prod.website-files.com is a second download)
FONT_WOFF2='https://webflow-files-prod.global.ssl.fastly.net/6853f29490f75918cfe11ed3/fonts/6ad62e79ffa54333cee49f07-ReadexPro-Variable.woff2'
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
import base64 as _b64, glob as _glob
def sri(body):
    return 'sha384-'+_b64.b64encode(hashlib.sha384(body.encode('utf-8')).digest()).decode()
CHUNKS={}
def emit(name,path,body,sel=None):
    """Write one lazily loaded file next to the entry and record its URL (relative to the entry) and SRI hash."""
    open('dist/'+path,'w',encoding='utf-8').write(body)
    CHUNKS[name]={'f':path,'i':sri(body)}
    if sel: CHUNKS[name]['s']=sel
os.makedirs('dist/scenes',exist_ok=True)
shutil.rmtree('dist/chunks',ignore_errors=True); os.makedirs('dist/chunks')

# 1. Scenes: one file each (dist/scenes/<Name>.js), fetched only where a .pw-embed[data-component="<Name>"] exists.
#    Platform-page scenes (LAZY_NAMES) mount when the placeholder nears the viewport; the others at once (see scenes.js).
CORE_NAMES=['LiveMoment','ApprovalPhone','CompetitionScene']
LAZY_NAMES=['StudioScene','CockpitScene','FlowScene','TopPerformers']
scenes={}
for n in CORE_NAMES+LAZY_NAMES:
    if not os.path.exists(SRC+n+'.dc.html'): continue
    scenes[n]=parse(n)
    body='(function(){var S=window.__PW_SCENES=window.__PW_SCENES||{};S[%s]=%s;if(window.__pwScenes&&window.__pwScenes.loaded)window.__pwScenes.loaded(%s);})();\n'%(json.dumps(n),json.dumps(scenes[n]),json.dumps(n))
    emit('scene:'+n,'scenes/%s.js'%n,body)

# 2. Scene runtime (dist/chunks/runtime.js): Preact (preact/compat, ~10 KB gz) exposed as window.React/ReactDOM, the
#    Claude Design runtime and the scene mounter. Loaded only on pages with a .pw-embed[data-component].
#    Set PW_VENDOR=react to build with the original React 18 files instead (rollback).
rt=[]
if os.environ.get('PW_VENDOR')=='react':
    rt.append(open('vendor/react.production.min.js').read()+'\n')
    rt.append(open('vendor/react-dom.production.min.js').read()+'\n')
else:
    rt.append(open('vendor/preact-compat-shim.min.js').read()+'\n')
rt.append(minify(open('src/dc-runtime.js',encoding='utf-8').read())+'\n')
rt.append('window.__PW_LAZY = %s;\n'%json.dumps({n:1 for n in LAZY_NAMES}))
rt.append(minify(open('src/scenes.js',encoding='utf-8').read())+'\n')
emit('runtime','chunks/runtime.js',''.join(rt))

# 3. English string maps (dist/chunks/en.js): the M, MT and SCOPED literals of page.js's enStrings() move here and are
#    loaded on lang=en pages only; page.js waits for them before it runs the rest (hero intro, reveals, tools).
PAGE=open('src/page.js',encoding='utf-8').read()
EN={}
def _cut(m):
    EN[m.group(2)]=m.group(3)
    return m.group(1)+{'M':'var E = w.__PW_EN; if (!E) return; var M = E.M;','MT':'var MT = E.MT;','SCOPED':'var SCOPED = E.SCOPED;'}[m.group(2)]
PAGE=re.sub(r'^(\s*)var (M|MT|SCOPED) = (.*?);[ \t]*(?:/\*[^\n]*?\*/)?[ \t]*$',_cut,PAGE,flags=re.M)
assert sorted(EN)==['M','MT','SCOPED'], 'page.js: enStrings maps not found (%s)'%sorted(EN)
emit('en','chunks/en.js',minify('window.__PW_EN={M:%s,MT:%s,SCOPED:%s};'%(EN['M'],EN['MT'],EN['SCOPED']))+'\n')

# 3b. CMS slug pairs (dist/chunks/slugs.js): DA slug -> EN slug per collection (src/cms-slugs.json, built by
#     scripts/cms_slugs.py). Not tied to a selector: page.js asks for it on CMS item pages, for the language switch.
_SLUGS=json.load(open('src/cms-slugs.json',encoding='utf-8'))
emit('slugs','chunks/slugs.js',minify('window.__PW_SLUGS=%s;'%json.dumps(_SLUGS,ensure_ascii=False,separators=(',',':')))+'\n')

# 4. Page modules (src/tools/*.js): one file each, fetched only when its root element is on the page.
#    Every module also guards on the same root itself. _shared.js (a few hundred bytes) stays in the entry.
TOOL_ROOTS={
 'cms-glossary':['[data-gloss="hub"]','[data-term="page"]'],
 'cms-industries':['[data-types="hub"]','[data-types="item"]'],
 'cms-insider':['[data-insider="hub"]','[data-insider="post"]'],
 'cms-integrations':['[data-cms-hub="integrations"]','[data-cms-item="integrations"]'],
 'cms-models':['[data-models="hub"]','[data-models="item"]'],
 # free calculators (v1.25.51): calc-kit builds the markup for all six; each calculator module only describes itself
 'calc-kit':['[data-tool="tiers"]','[data-tool="accelerator"]','[data-tool="split"]','[data-tool="holiday-pay"]','[data-tool="sick-pay"]','[data-tool="quota"]'],
 'calc-tiers':['[data-tool="tiers"]'],
 'calc-accelerator':['[data-tool="accelerator"]'],
 'calc-split':['[data-tool="split"]'],
 'calc-holiday':['[data-tool="holiday-pay"]'],
 'calc-absence':['[data-tool="sick-pay"]'],
 'calc-quota':['[data-tool="quota"]'],
 'corrections':['[data-tool="corrections"]'],
 'fit':['[data-tool="fit"]'],
 'ote':['[data-tool="ote"]'],
 'roi':['[data-tool="roi"]'],
 'page-about':['[data-about="kf"]'],
 'page-build':['[data-build="page"]'],
 'page-careers':['form.pw-careers__form'],
 'page-faq':['[data-faq="page"]'],
 'page-manifesto':['[data-mf-root]'],
 # article visuals (v1.25.52): rich-text bodies of the CMS item templates, plus explicit [data-pw-visual] embeds
 'visuals':['.pw-post__body','.pw-term__body','.pw-model__guide','.pw-type__longform','.pw-int__longform','[data-pw-visual]'],
}
for _f in sorted(_glob.glob('src/tools/*.js')):
    k=os.path.basename(_f)[:-3]
    if k=='_shared': continue
    src=open(_f,encoding='utf-8').read()
    assert k in TOOL_ROOTS, 'build.py: add the root selector(s) of src/tools/%s.js to TOOL_ROOTS'%k
    for sel in TOOL_ROOTS[k]: assert sel in src, 'build.py: %s does not guard on %s'%(_f,sel)
    emit('tool:'+k,'chunks/%s.js'%k,minify(src)+'\n',','.join(TOOL_ROOTS[k]))

# 5. The entry (the one registered script): resources, chunk manifest + loader, page CSS, page.js, shared tool CSS.
parts=[]
parts.append('/* Prowi 2026 site bundle — built from the Claude Design export. Do not edit by hand. */\n')
parts.append('(function(){ if (window.__prowiBundle) return; window.__prowiBundle = true;\n')
parts.append('window.__resources = Object.assign(window.__resources||{}, %s);\n'%json.dumps(RES))
parts.append('})();\n')
parts.append('window.__PW_CHUNKS = %s;\n'%json.dumps(CHUNKS,separators=(',',':')))
# fallback chunk base when the entry's own URL can't be read (e.g. Webflow preview): the release tag on jsDelivr (BUNDLE_TAG=release-v1.15.0 python3 build.py; push that commit to the branch of that name (tag pushes are blocked here))
TAG=os.environ.get('BUNDLE_TAG','')
if TAG: parts.append('window.__PW_CDN = %s;\n'%json.dumps('https://cdn.jsdelivr.net/gh/Prowi-ApS/prowi-web@'+TAG+'/dist/'))
parts.append(minify(open('src/loader.js',encoding='utf-8').read())+'\n')
# page CSS: also pasted into the Webflow page head as <style id="pw-css"> (see head-css.html); keep both in sync
CSS=open('src/page.css',encoding='utf-8').read()
CSS_MIN=subprocess.run([ESBUILD,'--minify','--loader=css'],input=CSS.encode(),capture_output=True,check=True).stdout.decode().strip() if os.path.exists(ESBUILD) else CSS
# Above-the-fold subset (hero HubSpot badge) for the Webflow page head, so the badge is laid out at first paint.
_TOP=re.sub(r'@media[^{]*\{(?:[^{}]*\{[^}]*\})*\}','',CSS_MIN)
CRIT=''.join(re.findall(r'\.pw-hero__badge-stars(?:>\*)?\{[^}]*\}',_TOP))+''.join(re.findall(r'@media \(max-width:767px\)\{\.pw-hero__badge.*?\}\}',CSS_MIN))
open('dist/head-critical.html','w',encoding='utf-8').write('<style id="pw-css-critical">'+CRIT+'</style>\n')
parts.append('window.__PW_CSS = %s;\n'%json.dumps(CSS_MIN))
parts.append(minify(PAGE)+'\n')
parts.append(minify(open('src/tools/_shared.js',encoding='utf-8').read())+'\n')
# cookie consent banner + footer "Cookie settings" link (replaces Conzent; the site head applies a stored choice early)
parts.append(minify(open('src/consent.js',encoding='utf-8').read())+'\n')
out=''.join(parts)
open(OUT,'w',encoding='utf-8').write(out)
print(OUT, len(out), 'bytes; chunks:', {k:os.path.getsize('dist/'+v['f']) for k,v in CHUNKS.items()})
