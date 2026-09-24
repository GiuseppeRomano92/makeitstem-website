# Notes for Claude

- The `.html` files at the repo root and in `it/` (plus `sitemap.xml`) are **generated** by
  `scripts/build.py`. Never edit them directly: edit `src/` or `assets/`, then run
  `python scripts/build.py` and commit both the sources and the regenerated output.
- Every page exists in every built language (`src/pages/en/`, `it/`). A content change in one
  language almost always needs the matching change in the other; write natural Italian
  (informal "tu"), not word-for-word translations. Legal pages: English is binding.
- Spanish is paused: `src/pages/es/` and `src/i18n/es.toml` are kept but not built and are
  not kept up to date. Don't edit them unless asked to bring Spanish back.
- Shared interface text is in `src/i18n/<lang>.toml`; keys must match across languages
  (the build fails otherwise). Testimonials and blog posts are data in `src/data/`.
- Page CSS: shared rules in `assets/css/site.css`, page rules in `assets/css/pages/`. Scope
  element selectors (`p`, `h2`, `ul`…) under `main` so they don't leak into the nav/footer.
- Verify with `python scripts/build.py --check` (what CI runs) and preview with
  `python scripts/build.py --serve` (http://localhost:8080).
- `publications.json` is maintained by the ORCID sync workflow; leave its format alone.
