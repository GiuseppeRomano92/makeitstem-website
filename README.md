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
| `src/templates/partials/` | Nav, footer, icons, inner-page header (with breadcrumb), closing call-to-action band, testimonial cards, blog list, forms |
| `src/i18n/<lang>.toml` | Shared interface text: nav, footer, call to action, cookie banner, dates |
| `src/data/testimonials.toml` | Testimonials (shown on the homepage and testimonials page) |
| `src/data/blog.toml` | Blog posts (title/summary per language) |
| `src/site.toml` | Site settings: languages, social links, course-platform login URL, sitemap, redirects, GA id |
| `assets/css/site.css` | Styles shared by every page: colours, buttons, forms, nav, footer, cards |
| `assets/css/pages/*.css` | Page-specific styles (listed at the top of each page template) |
| `assets/js/` | Nav/menu, scroll animations, legal-page contents, cookie consent, publications list |
| `assets/img/` | Images; `og/` holds the link-preview images (one per language) |
| `publications.json` | Updated weekly from ORCID by `.github/workflows/sync-orcid.yml` |
| `*.html`, `it/*.html`, `sitemap.xml` | **Generated** — don't edit; they are overwritten on build |

## Common edits

- **Change text on a page** — edit `src/pages/<lang>/<page>.html` in every language folder.
- **Change the nav or footer** — `src/templates/partials/nav.html` / `footer.html`;
  labels are in `src/i18n/*.toml`.
- **Add a testimonial** — add a `[[testimonials]]` entry to `src/data/testimonials.toml`.
  Quotes are shown in their original language on every version of the site. An optional
  `highlight` (a phrase copied exactly from the quote) is marked up so the outcome stands out.
- **Change the social links** — `[social]` in `src/site.toml` (used by the footer and the
  homepage contact section).
- **Add a blog post** — add a `[[posts]]` entry to `src/data/blog.toml` with an `en`, `it`
  and `es` block, and put the image in `assets/img/blog/`.
- **Add a page** — create it in every `src/pages/<lang>/` folder (the build refuses to run
  if a page is missing in one language), then add it to `[sitemap]` in `src/site.toml`.
  For the navy banner with a breadcrumb, use the `page_header` macro from
  `partials/page-header.html` (see `blog.html`), and end with
  `{% include "partials/cta-band.html" %}` for the "Book a free call" band.
- **Connect the course platform** — set `login_url` in `src/site.toml` (e.g. your
  course platform's login page) and rebuild: a "Log In" link then appears in the nav in every
  language, and the old `login.html` pages redirect to it. While it's empty the link is hidden.
- **Add a language** — add it to `src/site.toml`, copy `src/i18n/en.toml` to
  `src/i18n/<code>.toml`, and add `src/pages/<code>/`. The nav adapts to longer labels
  automatically (it collapses into the menu button when the links don't fit).

## Design notes

- Colours, fonts, spacing and shadows are CSS variables at the top of `assets/css/site.css`
  (green, navy and yellow come from the logo). Use `--green-ink` for green *text* on light
  backgrounds: the brand green itself is too light to read there.
- Buttons: `btn-primary` (green), `btn-secondary` (yellow outline, on navy), `btn-outline`
  (green outline, on light backgrounds), `btn-ghost` (quiet, on navy); add `btn-sm`, `btn-lg`
  or `btn-block` for size.
- Section headings: a `.section-head` (add `is-center` to centre it) holding
  `.section-label`, `.section-title` and `.section-subtitle`.
- Scroll animations: add `data-reveal` to an element to fade it in as it scrolls into view
  (`style="--reveal-delay: 0.1s"` staggers neighbours). Nothing is hidden without JavaScript,
  and visitors who ask for reduced motion get no animation. Numbers marked `data-count`
  count up the same way.
- Icons: `{{ icon("name", size) }}`, from the list in `src/templates/partials/icons.html`.
- The privacy and terms pages build their "On this page" list from the `<h3 id="…">` section
  headings: give a new section an id (the same in every language) and it is listed.
- Link previews use `assets/img/og/og-en.jpg` and `og-it.jpg` (1200 × 630). They are plain
  images: replace them if the headline or photo changes.

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
