/*
 * Renders publications.json (kept up to date by .github/workflows/sync-orcid.yml)
 * into #publications. Headings and link text come from data-* attributes on the
 * container, so the same script serves every language.
 */
(function () {
  'use strict';

  var container = document.getElementById('publications');
  if (!container) return;
  var d = container.dataset;

  var EXTERNAL_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  // Bold the author's own name within the author list
  function highlightAuthor(authors) {
    return esc(authors).replace(/Romano, G\./g, '<strong>Romano, G.</strong>');
  }
  function renderItem(p) {
    var meta = '';
    if (p.metrics || p.url) {
      meta += '<div class="pub-meta">';
      if (p.metrics) meta += '<span class="pub-badge">' + esc(p.metrics) + '</span>';
      if (p.url) {
        meta += '<a class="pub-doi" href="' + esc(p.url) + '" target="_blank" rel="noopener">' +
          esc(d.viewPaper) + ' ' + EXTERNAL_ICON + '</a>';
      }
      meta += '</div>';
    }
    var venue = esc(p.venue);
    if (p.date) venue += ', ' + esc(p.date);
    return '<article class="pub-item">' +
      '<span class="pub-title">' + esc(p.title) + '</span>' +
      '<span class="pub-authors">' + highlightAuthor(p.authors) + '</span>' +
      '<span class="pub-venue">' + venue + '</span>' +
      meta +
      '</article>';
  }
  function renderGroup(title, items) {
    if (!items || !items.length) return '';
    return '<div class="pub-group">' +
      '<div class="pub-group-head"><h3>' + esc(title) + '</h3>' +
      '<span class="pub-count">' + items.length + '</span></div>' +
      '<div class="pub-list">' + items.map(renderItem).join('') + '</div>' +
      '</div>';
  }

  fetch(d.src)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      container.innerHTML =
        renderGroup(d.journalHeading, data.journal) +
        renderGroup(d.conferenceHeading, data.conference);
    })
    .catch(function () {
      container.innerHTML =
        '<p>' + esc(d.fallback) + ' ' +
        '<a href="' + esc(d.scholarUrl) + '" ' +
        'target="_blank" rel="noopener" style="color: var(--green-ink); font-weight: 600;">Google Scholar</a>.</p>';
    });
})();
