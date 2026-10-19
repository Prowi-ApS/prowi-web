import re, json, html, os, hashlib, sys
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
    defaults={k:v.get('default') for k,v in props.items() if not k.startswith('$') and isinstance(v,dict)}
    return {'html':tpl,'js':js,'props':json.dumps({k:v for k,v in props.items() if not k.startswith('$')}),'defaults':defaults}
scenes={n:parse(n) for n in ['LiveMoment','ApprovalPhone','CompetitionScene']}
parts=[]
parts.append('/* Prowi 2026 site bundle — built from the Claude Design export. Do not edit by hand. */\n')
parts.append('(function(){ if (window.__prowiBundle) return; window.__prowiBundle = true;\n')
parts.append('window.__resources = Object.assign(window.__resources||{}, %s);\n'%json.dumps(RES))
parts.append('})();\n')
parts.append(open('vendor/react.production.min.js').read()+'\n')
parts.append(open('vendor/react-dom.production.min.js').read()+'\n')
parts.append(open('src/dc-runtime.js').read()+'\n')
parts.append('window.__PW_SCENES = %s;\n'%json.dumps(scenes))
parts.append(open('src/scenes.js').read()+'\n')
parts.append(open('src/page.js').read()+'\n')
os.makedirs('dist',exist_ok=True)
out=''.join(parts)
open(OUT,'w').write(out)
print(OUT, len(out), 'bytes; scenes:', {k:(len(v['html']),len(v['js'])) for k,v in scenes.items()})
