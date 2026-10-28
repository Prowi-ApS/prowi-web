# prowi-web

JavaScript for the 2026 prowi.io site (Webflow). One registered entry script, served via jsDelivr:

```
https://cdn.jsdelivr.net/gh/Prowi-ApS/prowi-web@<tag>/dist/prowi-2026.js
```

## What is in the bundle

One registered entry, `dist/prowi-2026.js` (core), plus files next to it that the entry loads only where a page needs them.
Their URLs are resolved against the entry's own URL (`document.currentScript.src`), and each carries the SRI hash recorded
in the entry (`window.__PW_CHUNKS`), so the same build works from any pinned commit or tag.

- Entry (every page): chunk manifest + loader (`src/loader.js`), page CSS, `src/page.js` (nav, i18n routing, reveals, hero, demo modal, ...), `src/tools/_shared.js`.
- `dist/chunks/en.js` — the English string maps of `page.js` (`M`, `MT`, `SCOPED`; build.py cuts them out of `page.js`), lang=en pages only. `page.js` translates first, then runs the rest.
- `dist/chunks/<module>.js` — one per `src/tools/*.js`, loaded when its root selector (build.py `TOOL_ROOTS`) is on the page; executed in order after `en.js`.
- `dist/chunks/runtime.js` — `vendor/preact-compat-shim.min.js` (Preact 10.24.3 + preact/compat, MIT, as `window.React`/`ReactDOM`; source `vendor/preact-compat-shim.src.js`; `PW_VENDOR=react python3 build.py` builds with React 18 instead), `src/dc-runtime.js` (Claude Design runtime) and `src/scenes.js` (mounter). Only on pages with a `.pw-embed[data-component]`.
- `dist/scenes/<Name>.js` — one per scene in `src/scenes/*.dc.html`, loaded where a `.pw-embed[data-component="<Name>"]` exists. Platform scenes (StudioScene, CockpitScene, FlowScene, TopPerformers) mount near the viewport.
- `dist/chunks/calc-*.js` — the free calculators (v1.25.51): `calc-kit.js` builds the calculator markup, inputs, toggles and live result inside an empty `<div data-tool="<id>">`; each `calc-<name>.js` only holds that calculator's maths and DA/EN texts. Ids: `tiers` (Trappemodel), `accelerator`, `split` (Delt provision), `holiday-pay` (Feriepenge af provision), `sick-pay` (Provision under sygdom og barsel), `quota` (Kvote). No external requests.
- `dist/chunks/slugs.js` — DA → EN CMS item slugs per collection (`src/cms-slugs.json`), loaded on CMS item pages for the language switch (`/ordbog/<slug>` ↔ `/en/glossary/<en slug>` and the other collections). Regenerate after adding CMS items: `python3 -I scripts/cms_slugs.py <Webflow list_collection_items dumps> > src/cms-slugs.json` (see the script's header), then build.
- `assets/img/` — optimised WebP images served from jsDelivr (customer logos, avatars).

New page module: add `src/tools/<name>.js` (guarded on its root element) and its root selector(s) to `TOOL_ROOTS` in build.py.

## Build

```
npm install             # esbuild + preact (build tools only)
python3 build.py        # writes dist/prowi-2026.js + dist/chunks/ + dist/scenes/, minified
```

`npm test` checks that every source and built file parses (built files as ES2017) and the calculators' maths and texts (`test/`).

Commit `dist/` — jsDelivr serves it straight from the tag. Tag releases `v1`, `v2`, … and bump the tag in the Webflow script URL (site settings → custom code / registered script).

**Release (current practice):** `BUNDLE_TAG=release-vX.Y.Z python3 build.py`, commit, push `main` and push the same commit to the branch `release-vX.Y.Z` (tag pushes are blocked from the build sandbox). Register the entry in Webflow by commit hash with its SRI hash. The branch name is baked into the entry as `window.__PW_CDN`: the loader falls back to it when the entry's own URL is unknown (Webflow's preview serves the registered script from elsewhere), so the add-on chunks still load there.
