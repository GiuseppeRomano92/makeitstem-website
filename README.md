# makeitstem-website

Make IT STEM — STEM Career Mentoring for Students and Engineers.
Live at <https://makeitstem.com> (English) and <https://makeitstem.com/it/> (Italian).
Spanish is paused: its sources are kept in `src/pages/es/` and `src/i18n/es.toml` but not
built (see the comment in `src/site.toml` to bring it back).

The site is plain static HTML served by GitHub Pages. The HTML is **generated** from
templates in `src/` by a small Python script, so the nav, footer, `<head>` and styles
live in one place and every page exists in every language.

## Quick start

```sh
pip install -r requirements.txt       # once (just Jinja2)
python scripts/build.py --serve       # http://localhost:8080 — rebuilds as you edit
```

In VS Code, **F5** does the same and opens Chrome. Before committing:

```sh
python scripts/build.py               # regenerate the HTML
git add -A && git commit
```

Commit the generated HTML together with your `src/` changes — GitHub Pages serves the
repo as-is. A GitHub Action (`check-build.yml`) fails if the two are out of sync.

## Where things live

| Path | What it is |
|---|---|
| `src/pages/<lang>/*.html` (`en`, `it`; `es` paused) | Page content, one file per page per language. **Edit these.** |
| `src/templates/base.html` | Shared layout: `<head>`, analytics consent, nav, footer, scripts |
| `src/templates/partials/` | Nav, footer, icons, testimonial cards, blog list, forms |
| `src/i18n/<lang>.toml` | Shared interface text: nav, footer, cookie banner, dates |
| `src/data/testimonials.toml` | Testimonials (shown on the homepage and testimonials page) |
| `src/data/blog.toml` | Blog posts (title/summary per language) |
| `src/site.toml` | Site settings: languages, course-platform login URL, sitemap, redirects, GA id |
| `assets/css/site.css` | Styles shared by every page |
| `assets/css/pages/*.css` | Page-specific styles (listed at the top of each page template) |
| `assets/js/` | Nav/menu, cookie consent, publications list |
| `assets/img/` | Images |
| `publications.json` | Updated weekly from ORCID by `.github/workflows/sync-orcid.yml` |
| `*.html`, `it/*.html`, `sitemap.xml` | **Generated** — don't edit; they are overwritten on build |

## Common edits

- **Change text on a page** — edit `src/pages/<lang>/<page>.html` in every language folder.
- **Change the nav or footer** — `src/templates/partials/nav.html` / `footer.html`;
  labels are in `src/i18n/*.toml`.
- **Add a testimonial** — add a `[[testimonials]]` entry to `src/data/testimonials.toml`.
  Quotes are shown in their original language on every version of the site.
- **Add a blog post** — add a `[[posts]]` entry to `src/data/blog.toml` with an `en`, `it`
  and `es` block, and put the image in `assets/img/blog/`.
- **Add a page** — create it in every `src/pages/<lang>/` folder (the build refuses to run
  if a page is missing in one language), then add it to `[sitemap]` in `src/site.toml`.
- **Connect the course platform** — set `login_url` in `src/site.toml` (e.g. your
  course platform's login page) and rebuild: a "Log In" link then appears in the nav in every
  language, and the old `login.html` pages redirect to it. While it's empty the link is hidden.
- **Add a language** — add it to `src/site.toml`, copy `src/i18n/en.toml` to
  `src/i18n/<code>.toml`, and add `src/pages/<code>/`. The nav adapts to longer labels
  automatically (it collapses into the menu button when the links don't fit).

## How the languages work

- English is the default and keeps the original URLs (`/blog.html`); Italian lives
  under `/it/` (`/it/blog.html`). Section anchors (`#contact`, `#services`, …) are the same in
  every language, and the EN | IT switcher keeps you on the same section.
- Every page declares its translations with `hreflang` links, and `sitemap.xml` lists them,
  so search engines show each visitor the right language.
- Visitors are never redirected automatically; they choose with the switcher.
- Form submissions include a hidden `language` field, and form option values stay in
  English, so enquiries from every version arrive in the same format.
- The Italian privacy policy and terms are courtesy translations; they say that
  the English version prevails.
