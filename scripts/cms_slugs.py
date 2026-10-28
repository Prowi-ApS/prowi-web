"""Build src/cms-slugs.json: DA slug -> EN slug for every CMS item that is live in both locales, per collection.
The site script's language switch uses it on CMS item pages (/ordbog/<slug> <-> /en/glossary/<en slug>, ...), because
the item slugs differ per locale and Webflow's hreflang links cannot be relied on there.

Input: one or more JSON files saved from the Webflow MCP data_cms_tool list_collection_items calls
(request.allCmsLocales: true), each action labelled with the collection key it reads, e.g.
  {"label": "glossary", ...}, {"label": "posts", ...}, {"label": "integrations", ...}, {"label": "types", ...},
  {"label": "models", ...}, {"label": "customers", ...}   (a trailing digit is allowed for paged calls: posts0, posts1)
Usage: python3 -I scripts/cms_slugs.py dump1.json [dump2.json ...] > src/cms-slugs.json

Items that are linked locale variants of one item pair up by item id. Collections where DA and EN are separate items
(business types; older Insider posts) pair up with the rules in PAIR_BY / EXTRA below. Re-run after adding items."""
import json, re, sys
DA = '6890a6bc3ca4b93428e3cfb4'; EN = '6890a6bc3ca4b93428e3cfb5'
# business types: one DA item and one EN item per type, matched on (sortering, kategori)
PAIR_BY = {'types': ('sortering', 'kategori')}
# Insider posts written as separate DA and EN items (DA slug -> EN slug), checked by hand 2026-10-28
EXTRA = {'posts': {
    'undgaa-provisionstvister': 'avoiding-commission-disputes',
    'territorial-vs-individuel-provision': 'territory-vs-individual-commission',
    'provision-acceleratorer-guide': 'commission-accelerators-guide',
    'eu-loengennemsigtighedsdirektivet-provision': 'eu-pay-transparency-directive-commission',
    'ote-kvoter-guide': 'ote-quotas-guide',
    'spiff-programmer-guide': 'spiff-programs-guide',
    'clawbacks-provision-guide': 'clawbacks-commission-recovery-guide',
    'sdr-bdr-kompensation-guide': 'sdr-bdr-compensation-guide',
    'realtid-provision-motivation': 'real-time-commission-visibility',
    'provision-compliance-guide': 'commission-compliance-guide',
    'provisionsdata-forecasting': 'commission-data-sales-forecasting'}}

def live(it): return not it.get('isDraft') and not it.get('isArchived') and bool(it.get('lastPublished'))

items = {}
for path in sys.argv[1:]:
    for blk in json.load(open(path)):
        o = json.loads(blk['text'])
        key = re.sub(r'\d+$', '', o['label'])
        items.setdefault(key, []).extend(o['result']['items'])

out = {}
for key, its in sorted(items.items()):
    pairs = {}
    by = {}
    for it in its:
        loc = 'da' if it['cmsLocaleId'] == DA else 'en' if it['cmsLocaleId'] == EN else None
        if loc and live(it): by.setdefault(it['id'], {})[loc] = it
    for v in by.values():
        if 'da' in v and 'en' in v: pairs[v['da']['fieldData']['slug']] = v['en']['fieldData']['slug']
    if key in PAIR_BY:
        f = PAIR_BY[key]; da = {}; en = {}
        for v in by.values():
            for loc, it in v.items():
                k = tuple(str(it['fieldData'].get(x)) for x in f)
                (da if loc == 'da' else en).setdefault(k, []).append(it['fieldData']['slug'])
        for k, s in da.items():
            if len(s) == 1 and len(en.get(k, [])) == 1: pairs.setdefault(s[0], en[k][0])
    live_da = {v['da']['fieldData']['slug'] for v in by.values() if 'da' in v}
    live_en = {v['en']['fieldData']['slug'] for v in by.values() if 'en' in v}
    for d, e in EXTRA.get(key, {}).items():
        if d in live_da and e in live_en: pairs[d] = e
        else: print('skip extra pair (not live in both):', key, d, e, file=sys.stderr)
    out[key] = dict(sorted(pairs.items()))
    print(key, len(pairs), 'pairs', file=sys.stderr)
json.dump(out, sys.stdout, ensure_ascii=False, indent=0, sort_keys=True)
sys.stdout.write('\n')
