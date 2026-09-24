# Notes for Claude

- The `.html` files at the repo root and in `it/` and `es/` (plus `sitemap.xml`) are **generated** by
  `scripts/build.py`. Never edit them directly: edit `src/` or `assets/`, then run
  `python scripts/build.py` and commit both the sources and the regenerated output.
- Every page exists in every language (`src/pages/en/`, `it/`, `es/`). A content change in one
  language almost always needs the matching change in the others; write natural Italian and
  Spanish (informal "tu"/"tú"), not word-for-word translations. Legal pages: English is binding.
- Shared interface text is in `src/i18n/<lang>.toml`; keys must match across languages
  (the build fails otherwise). Testimonials and blog posts are data in `src/data/`.
- Page CSS: shared rules in `assets/css/site.css`, page rules in `assets/css/pages/`. Scope
  element selectors (`p`, `h2`, `ul`…) under `main` so they don't leak into the nav/footer.
- Verify with `python scripts/build.py --check` (what CI runs) and preview with
  `python scripts/build.py --serve` (http://localhost:8080).
- `publications.json` is maintained by the ORCID sync workflow; leave its format alone.
