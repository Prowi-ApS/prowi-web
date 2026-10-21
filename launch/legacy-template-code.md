# Legacy CMS template code removed at the 2026 switch (21 Oct 2026)

Kept for rollback. The old design on the 4 live CMS templates (Term, Prowi Insiders post, Integrationer,
Virksomhedstyper) was moved into a hidden div `[data-pw-legacy]` at the end of each template body (not deleted).

Removed from Term + Post template code:
- head: the `#toc` style block (old table-of-contents styling)
- footer: the old TOC script (builds #toc from #single-article headings)

Cleared page-level "Schema markup" on all 4 templates (old BlogPosting / Article / WebPage JSON-LD with relative URLs);
the 2026 JSON-LD lives in each template's head code instead (post + ordbog pasted from jsonld-*-template.html).

## Site head (Site settings > Custom code > Head), removed 21 Oct 2026
- Section "2) Google Fonts": preconnects to fonts.googleapis.com / fonts.gstatic.com and the Sora stylesheet
  `https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap`
- Section "4) Inline Critical CSS": old-design classes (.hero-wrap, .logo-strip, #logo-carousel-track, .hero-section,
  .hero-heading, .hero-subheading, .button-primary, .navbar, .nav-logo, .tella-wrap, .tella-thumb, .play-button)
- The trailing "IMPORTANT NOTES" comment block
Kept unchanged: CDN preconnects, Consent Mode v2 defaults, HubSpot queue, opt-in GTM/HubSpot loaders, 3P mode marker, OctoReports.
