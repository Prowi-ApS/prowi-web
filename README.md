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
- `assets/img/` — optimised WebP images served from jsDelivr (customer logos, avatars).

New page module: add `src/tools/<name>.js` (guarded on its root element) and its root selector(s) to `TOOL_ROOTS` in build.py.

## Build

```
npm install             # esbuild + preact (build tools only)
python3 build.py        # writes dist/prowi-2026.js + dist/chunks/ + dist/scenes/, minified
```

Commit `dist/` — jsDelivr serves it straight from the tag. Tag releases `v1`, `v2`, … and bump the tag in the Webflow script URL (site settings → custom code / registered script).
