#!/usr/bin/env python3
"""Sync publications.json with new papers found on ORCID.

Never overwrites existing curated entries (titles, manual IF/quartile
badges, hand-tidied venue/date strings) -- it only detects papers on
the ORCID record that aren't yet in publications.json and appends
them, enriched via Crossref where a DOI is available.
"""
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ORCID_ID = "0000-0002-9385-3541"
ORCID_API = f"https://pub.orcid.org/v3.0/{ORCID_ID}"
CROSSREF_API = "https://api.crossref.org/works"
USER_AGENT = "makeitstem-website-sync/1.0 (mailto:contact@makeitstem.com)"

JSON_PATH = Path(__file__).resolve().parent.parent / "publications.json"

JOURNAL_TYPES = {"journal-article"}
CONFERENCE_TYPES = {
    "conference-paper", "conference-abstract",
    "conference-presentation", "conference-poster",
}

MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def fetch_json(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.load(resp)


def normalize_title(title):
    t = title.lower().strip()
    t = re.sub(r"[^a-z0-9]+", " ", t)  # punctuation/hyphens become spaces, not removed
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def titles_match(a, b):
    """Exact match, or one is a meaningful prefix of the other (ORCID
    sometimes has a second, truncated duplicate entry for the same paper)."""
    if a == b:
        return True
    shorter, longer = (a, b) if len(a) <= len(b) else (b, a)
    return len(shorter) >= 15 and longer.startswith(shorter)


def format_initials(given_name):
    parts = re.split(r"[\s-]+", given_name.strip())
    return "".join(p[0].upper() + "." for p in parts if p)


def join_authors(names):
    if not names:
        return ""
    if len(names) == 1:
        return names[0]
    return ", ".join(names[:-1]) + " & " + names[-1]


def authors_from_crossref(doi):
    try:
        data = fetch_json(f"{CROSSREF_API}/{doi}", headers={"User-Agent": USER_AGENT})
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
        return None, None, None
    msg = data.get("message", {})
    names = []
    for a in msg.get("author", []):
        family = a.get("family")
        given = a.get("given", "")
        if family:
            names.append(f"{family}, {format_initials(given)}" if given else family)
    venue = ""
    container = msg.get("container-title")
    if container:
        venue = container[0]
        if msg.get("volume"):
            venue += f", vol. {msg['volume']}"
        page = msg.get("page") or msg.get("article-number")
        if page:
            venue += f", p. {page}"
    date_parts = (msg.get("published-print") or msg.get("published-online")
                  or msg.get("published") or {}).get("date-parts", [[]])[0]
    date = ""
    if len(date_parts) >= 2:
        date = f"{MONTHS[date_parts[1]]} {date_parts[0]}"
    elif date_parts:
        date = str(date_parts[0])
    return join_authors(names) if names else None, venue or None, date or None


def authors_from_orcid_contributors(put_code):
    try:
        data = fetch_json(f"{ORCID_API}/work/{put_code}")
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
        return None
    contributors = (data.get("contributors") or {}).get("contributor") or []
    names = []
    for c in contributors:
        credit_name = (c.get("credit-name") or {}).get("value")
        if not credit_name:
            continue
        tokens = credit_name.strip().split()
        if len(tokens) < 2:
            names.append(credit_name)
            continue
        family = tokens[-1]
        initials = "".join(t[0].upper() + "." for t in tokens[:-1])
        names.append(f"{family}, {initials}")
    return join_authors(names) if names else None


def clean_orcid_venue(raw):
    if not raw:
        return ""
    return re.sub(r",\s*\d{1,2}/\d{1,2}/\d{2,4}\s*$", "", raw).strip()


def format_orcid_date(pub_date):
    if not pub_date:
        return ""
    year = (pub_date.get("year") or {}).get("value")
    month = (pub_date.get("month") or {}).get("value")
    if not year:
        return ""
    if month:
        return f"{MONTHS[int(month)]} {year}"
    return year


def extract_doi(work_summary):
    for eid in (work_summary.get("external-ids") or {}).get("external-id", []):
        if eid.get("external-id-type") == "doi":
            return eid.get("external-id-value")
    return None


def main():
    existing = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    existing_titles = set()
    existing_dois = set()
    for bucket in ("journal", "conference"):
        for entry in existing.get(bucket, []):
            existing_titles.add(normalize_title(entry["title"]))
            url = entry.get("url", "")
            m = re.search(r"doi\.org/(.+)$", url)
            if m:
                existing_dois.add(m.group(1).lower())

    try:
        works = fetch_json(f"{ORCID_API}/works")
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        print(f"ORCID fetch failed, aborting without changes: {e}", file=sys.stderr)
        return 1

    added = []
    for group in works.get("group", []):
        ws = group["work-summary"][0]
        title = (ws.get("title") or {}).get("title", {}).get("value")
        if not title:
            continue
        norm = normalize_title(title)
        doi = extract_doi(ws)
        already_curated = (
            (doi and doi.lower() in existing_dois)
            or any(titles_match(norm, t) for t in existing_titles)
        )
        if already_curated:
            continue  # already curated, never overwrite

        work_type = ws.get("type")
        if work_type in JOURNAL_TYPES:
            bucket = "journal"
        elif work_type in CONFERENCE_TYPES:
            bucket = "conference"
        else:
            print(f"Skipping unrecognized type '{work_type}': {title}")
            continue

        authors = venue = date = None
        if doi:
            authors, venue, date = authors_from_crossref(doi)
        if not authors:
            authors = authors_from_orcid_contributors(ws.get("put-code"))
        if not venue:
            venue = clean_orcid_venue((ws.get("journal-title") or {}).get("value"))
        if not date:
            date = format_orcid_date(ws.get("publication-date"))

        if not authors:
            print(f"Skipping (no author data available): {title}")
            continue

        entry = {
            "authors": authors,
            "title": title,
            "venue": venue or "",
            "date": date or "",
        }
        if doi:
            entry["url"] = f"https://doi.org/{doi}"
        if bucket == "journal":
            entry["metrics"] = ""  # fill in quartile/publisher/IF manually

        existing.setdefault(bucket, []).append(entry)
        existing_titles.add(norm)
        if doi:
            existing_dois.add(doi.lower())
        added.append((bucket, title))

    if not added:
        print("No new publications found on ORCID.")
        return 0

    JSON_PATH.write_text(json.dumps(existing, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Added {len(added)} new publication(s):")
    for bucket, title in added:
        print(f"  [{bucket}] {title}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
