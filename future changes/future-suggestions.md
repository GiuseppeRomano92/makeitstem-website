# Make IT STEM — Future Suggestions

_Prepared 1 July 2026. A prioritised list of improvements to consider._

---

## Highest impact

### 1. Finish the Gift → Mailchimp loop (in progress)
Until this is live, the free-gift funnel is broken from the visitor's side:
they submit their email but nothing arrives. This is the #1 thing to close
out. Once done, every signup also joins your email list — the asset that
feeds everything else.

### 2. Watch the Formspree ceiling
The contact form, reviews, workshop waitlist, course waitlist AND the gift
all share ONE free Formspree form (~50 submissions/month total). If the gift
takes off, real client enquiries could silently bounce. Moving the gift to
Mailchimp offloads the biggest volume driver. Keep an eye on it, and consider
a second Formspree form (or Mailchimp) for the waitlists too.

### 3. Write real blog posts
The blog is the single best long-term growth lever — the only part of the
site that can pull in new strangers from Google. Placeholder cards don't
rank. Even one genuine post a month (repurpose MentorMeet articles and
LinkedIn posts) compounds over a year. Everything else on the site converts
people who already found you; the blog is what finds them.

---

## Quick wins (low effort, real value)

### 4. SEO plumbing
Add a `sitemap.xml` and `robots.txt`. Ten minutes, helps Google index all
the new pages properly.

### 5. Cookie consent banner
Google Analytics is installed and you're UK-based / GDPR-conscious, but there
is no consent banner. UK PECR technically requires opt-in for analytics
cookies. A small banner covers this.

### 6. Analytics events
GA currently only tracks page views. Adding events for form submits and
"Book a Free Call" clicks tells you what's actually converting. Otherwise
you're flying blind on what works.

---

## Longer-term / worth considering

### 7. The maintainability problem
Every nav or footer tweak currently means editing 8-10 files by hand — slow
and fragile. Options, cheapest first:
- A tiny build script that stamps a shared header/footer into each page, or
- Move to a lightweight static generator (Astro / Eleventy).

Not urgent, but it will keep biting as the site grows.

### 8. Loose ends from earlier
- The testimonial role labels you wanted to verify before publishing.
- `Profile.pdf` (your CV) is still committed publicly in the repo — remove
  it if that was not intentional.

---

## Notes / ideas parked for later
_(Add your own thoughts here over time.)_

-
-
-
