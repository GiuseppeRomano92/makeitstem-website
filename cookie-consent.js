/*
 * Make IT STEM — cookie consent banner (Google Consent Mode v2)
 *
 * Two layers of protection, so nothing reaches Google before the visitor agrees:
 *
 *   1. The consent DEFAULT (analytics denied) is set inline in the <head> of
 *      every page, before gtag('config', ...) is queued.
 *   2. gtag.js itself is NOT in the page markup. This file injects the loader
 *      only once consent is 'accepted', so a visitor who rejects (or who never
 *      answers) causes no request to googletagmanager.com at all. Consent Mode
 *      alone would still send cookieless pings, which we deliberately avoid.
 *
 * The gtag('js') / gtag('config') calls queued in the head sit harmlessly in
 * window.dataLayer until the loader appears, then replay in order.
 *
 * Storage key: mis-cookie-consent  →  'accepted' | 'rejected'
 * Re-open the banner from anywhere with:  <a href="#" data-cookie-settings>…</a>
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mis-cookie-consent';
  var PRIVACY_URL = 'privacy.html#cookies';
  var GA_ID = 'G-NL49D78HZD';

  // localStorage throws in private-browsing edge cases — never let that break the page.
  function read() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function write(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* session-only consent */ }
  }

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  var loaderAdded = false;

  // Only ever called once consent is granted — this is the first and only
  // network request to Google Analytics.
  function loadAnalytics() {
    if (loaderAdded || !GA_ID) return;
    loaderAdded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function applyConsent(granted) {
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: granted ? 'granted' : 'denied'
    });
    if (granted) loadAnalytics();
  }

  function injectStyles() {
    if (document.getElementById('mis-cookie-styles')) return;
    var style = document.createElement('style');
    style.id = 'mis-cookie-styles';
    style.textContent = [
      '.mis-cookie-banner{',
      '  position:fixed;left:0;right:0;bottom:0;z-index:9999;',
      '  background:rgba(22,34,66,0.98);backdrop-filter:blur(10px);',
      '  color:rgba(255,255,255,0.82);',
      '  font-family:"Inter",system-ui,-apple-system,sans-serif;font-size:0.875rem;line-height:1.6;',
      '  border-top:1px solid rgba(255,255,255,0.12);',
      '  box-shadow:0 -8px 30px rgba(0,0,0,0.28);',
      '  padding:1.25rem 2rem;',
      '  transform:translateY(100%);transition:transform 0.35s ease;',
      '}',
      '.mis-cookie-banner.mis-visible{transform:translateY(0);}',
      '.mis-cookie-inner{',
      '  max-width:1100px;margin:0 auto;',
      '  display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;',
      '}',
      '.mis-cookie-text{flex:1 1 340px;min-width:0;}',
      '.mis-cookie-text strong{',
      '  display:block;color:#fff;font-family:"Space Grotesk","Inter",sans-serif;',
      '  font-size:0.95rem;font-weight:600;margin-bottom:0.3rem;',
      '}',
      '.mis-cookie-text a{color:#1CAA5A;font-weight:500;text-decoration:underline;}',
      '.mis-cookie-text a:hover{color:#FFD700;}',
      '.mis-cookie-actions{display:flex;gap:0.7rem;flex-shrink:0;flex-wrap:wrap;}',
      '.mis-cookie-btn{',
      '  font:inherit;font-weight:600;cursor:pointer;',
      '  padding:0.6rem 1.4rem;border-radius:6px;border:1px solid transparent;',
      '  transition:background 0.2s,color 0.2s,border-color 0.2s;white-space:nowrap;',
      '}',
      '.mis-cookie-btn:focus-visible{outline:2px solid #FFD700;outline-offset:2px;}',
      '.mis-cookie-accept{background:#1CAA5A;color:#fff;}',
      '.mis-cookie-accept:hover{background:#17914c;}',
      '.mis-cookie-reject{background:transparent;color:rgba(255,255,255,0.85);border-color:rgba(255,255,255,0.35);}',
      '.mis-cookie-reject:hover{background:rgba(255,255,255,0.1);color:#fff;}',
      '@media (max-width:640px){',
      '  .mis-cookie-banner{padding:1.1rem 1.25rem;font-size:0.825rem;}',
      '  .mis-cookie-inner{gap:1rem;}',
      '  .mis-cookie-actions{width:100%;}',
      '  .mis-cookie-btn{flex:1 1 auto;text-align:center;}',
      '}',
      '@media (prefers-reduced-motion:reduce){',
      '  .mis-cookie-banner{transition:none;}',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  var banner = null;

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('mis-visible');
    var node = banner;
    banner = null;
    window.setTimeout(function () {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    }, 400);
  }

  function choose(granted) {
    write(granted ? 'accepted' : 'rejected');
    applyConsent(granted);
    hideBanner();
  }

  function showBanner() {
    if (banner) return;
    injectStyles();

    banner = document.createElement('div');
    banner.className = 'mis-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');

    var inner = document.createElement('div');
    inner.className = 'mis-cookie-inner';

    var text = document.createElement('div');
    text.className = 'mis-cookie-text';
    var heading = document.createElement('strong');
    heading.textContent = 'We use cookies';
    text.appendChild(heading);
    var body = document.createElement('span');
    body.innerHTML = 'Essential cookies keep this site working. We’d also like to use Google Analytics ' +
      'to see which pages are useful — only if you agree. You can change your mind at any time. ' +
      'Read our <a href="' + PRIVACY_URL + '">Cookie &amp; Privacy Policy</a>.';
    text.appendChild(body);

    var actions = document.createElement('div');
    actions.className = 'mis-cookie-actions';

    var reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'mis-cookie-btn mis-cookie-reject';
    reject.textContent = 'Reject non-essential';
    reject.addEventListener('click', function () { choose(false); });

    var accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'mis-cookie-btn mis-cookie-accept';
    accept.textContent = 'Accept analytics';
    accept.addEventListener('click', function () { choose(true); });

    // Reject listed first in the DOM so it is never the harder option to reach.
    actions.appendChild(reject);
    actions.appendChild(accept);
    inner.appendChild(text);
    inner.appendChild(actions);
    banner.appendChild(inner);
    document.body.appendChild(banner);

    // Next frame, so the slide-up transition actually runs.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (banner) banner.classList.add('mis-visible');
      });
    });
  }

  function init() {
    // Let visitors reopen the choice from the footer.
    var triggers = document.querySelectorAll('[data-cookie-settings]');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', function (event) {
        event.preventDefault();
        showBanner();
      });
    }

    var stored = read();
    if (stored === 'accepted') {
      applyConsent(true);   // re-affirm on every page load
    } else if (stored === 'rejected') {
      applyConsent(false);
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
