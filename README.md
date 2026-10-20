# prowi-web

JavaScript for the 2026 prowi.io site (Webflow). One bundle, served via jsDelivr:

```
https://cdn.jsdelivr.net/gh/Prowi-ApS/prowi-web@<tag>/dist/prowi-2026.js
```

## What is in the bundle

- `vendor/preact-compat-shim.min.js` — Preact 10.24.3 + preact/compat (MIT), exposed as `window.React` / `window.ReactDOM` for the scene runtime (~10 KB gz instead of React's ~45 KB). Source: `vendor/preact-compat-shim.src.js` (`npx esbuild vendor/preact-compat-shim.src.js --bundle --minify --format=iife --target=es2017`). The original React 18.3.1 UMD files stay in `vendor/` as a rollback: `PW_VENDOR=react python3 build.py`.
- `src/dc-runtime.js` — the Claude Design component runtime (renders the scenes).
- `src/scenes/*.dc.html` — the animated scenes as exported from the design project (LiveMoment, ApprovalPhone, CompetitionScene). Mounted into every `.pw-embed[data-component]` placeholder on the page; per-placeholder props come from `data-scene-props`.
- `src/page.js` — page behaviour ported from `Prowi Homepage.dc.html`: nav dropdowns + burger menu + language switch, logo turn, hero intro and parallax, section reveals, platform rail, Q4 chart, results chips, top-performers board, getting-started cards, footer year.
- `src/scenes.js` — the scene mounter.

## Build

```
npm install             # esbuild + preact (build tools only)
python3 build.py        # writes dist/prowi-2026.js, minified
```

Commit `dist/` — jsDelivr serves it straight from the tag. Tag releases `v1`, `v2`, … and bump the tag in the Webflow script URL (site settings → custom code / registered script).
