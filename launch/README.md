# Launch-day snippets

`jsonld-post-template.html` and `jsonld-ordbog-template.html`: the 2026 structured data for the blog post and glossary
CMS templates. They were taken out of the live templates' head code on 21 Oct 2026 so the old live design does not ship two
schemas. At launch: paste each back at the end of its template's head code and clear the template's old page-level schema
(Page settings > Schema markup) in the same publish.

## Home page head: preload hints (added 21 Oct 2026)
The home page's own head code preloads the bundle entry, `chunks/runtime.js` and `scenes/LiveMoment.js` from the same
jsDelivr commit as the registered `prowi2026bundle` version, with their SRI hashes (from `window.__PW_CHUNKS` in the entry).
When the home page moves to a new bundle version, update those three URLs and hashes too; a stale preload only wastes a
download, it never breaks the page.
