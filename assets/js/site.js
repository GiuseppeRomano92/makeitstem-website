/*
 * Make IT STEM — behaviour shared by every page.
 */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasObserver = 'IntersectionObserver' in window;

  // ── Scroll reveal ──
  // Elements with data-reveal fade up the first time they scroll into view.
  // The CSS hides them only while <html> has the "js" class (set in the <head>);
  // misReveal tells the safety net there that this script is running.
  window.misReveal = true;
  var revealItems = document.querySelectorAll('[data-reveal]');
  function reveal(el) { el.classList.add('is-revealed'); }
  if (reduceMotion || !hasObserver) {
    revealItems.forEach(reveal);
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach(function (el) { revealer.observe(el); });
    window.addEventListener('beforeprint', function () { revealItems.forEach(reveal); });
  }

  // ── Count-up numbers (data-count) ──
  // The final number is in the HTML, so it is right without JavaScript too.
  if (!reduceMotion && hasObserver) {
    var counter = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counter.unobserve(entry.target);
        var el = entry.target;
        var end = parseInt(el.textContent, 10);
        if (!end) return;
        var start = null;
        el.textContent = '0';
        (function step(now) {
          if (start === null) start = now;
          var t = Math.min((now - start) / 1200, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { counter.observe(el); });
  }

  // ── Nav background + back-to-top button follow the scroll position ──
  var siteNav = document.getElementById('site-nav');
  var toTop = document.querySelector('[data-back-to-top]');
  function onScroll() {
    var y = window.scrollY;
    if (siteNav) siteNav.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var brand = document.querySelector('.nav-brand');
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  // ── Mobile menu (the drawer behind the menu button) ──
  var links = document.getElementById('navLinks');
  var burger = document.getElementById('hamburger');
  function isOpen() { return links.classList.contains('open'); }
  function setMenu(open) {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    siteNav.classList.toggle('is-open', open);
    html.classList.toggle('nav-open', open);
  }
  if (siteNav && links && burger) {
    burger.addEventListener('click', function () {
      setMenu(!isOpen());
      if (isOpen()) {
        var first = links.querySelector('a, button');
        if (first) first.focus({ preventScroll: true });
      }
    });

    // Close the menu after picking a link.
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        setMenu(false);
        burger.focus();
      }
    });

    // Keep keyboard focus inside the nav while the drawer covers the page.
    siteNav.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || !isOpen()) return;
      var items = Array.prototype.filter.call(siteNav.querySelectorAll('a[href], button'), function (el) {
        return el.offsetWidth > 0 || el.offsetHeight > 0;
      });
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // The inline script in nav.html fires this when the nav switches layout.
    siteNav.addEventListener('navmodechange', function (event) {
      if (!event.detail.compact) setMenu(false);
    });
  }

  // ── "Explore" menu: a disclosure button (hover also opens it with a mouse) ──
  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    var trigger = dropdown.querySelector('.nav-trigger');
    function compact() { return siteNav.classList.contains('is-compact'); }
    function set(open) {
      dropdown.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    trigger.addEventListener('click', function () {
      set(trigger.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('click', function (event) {
      if (!compact() && !dropdown.contains(event.target)) set(false);
    });
    dropdown.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true' && !compact()) {
        event.stopPropagation();
        set(false);
        trigger.focus();
      }
    });
    dropdown.addEventListener('focusout', function (event) {
      if (!compact() && event.relatedTarget && !dropdown.contains(event.relatedTarget)) set(false);
    });
    dropdown.querySelectorAll('.dropdown-menu a').forEach(function (link) {
      link.addEventListener('click', function () { if (!compact()) set(false); });
    });
    // In the mobile drawer the Explore links start expanded.
    siteNav.addEventListener('navmodechange', function () { set(compact()); });
    set(compact());
  });

  // ── Testimonials masonry (data-masonry) ──
  // Each card spans as many 8px rows as its height (plus a 24px gap), so the
  // grid packs cards of different heights like a masonry wall.
  document.querySelectorAll('[data-masonry]').forEach(function (grid) {
    var cards = grid.children;
    function layout() {
      grid.classList.add('is-masonry');
      for (var i = 0; i < cards.length; i++) {
        var height = cards[i].getBoundingClientRect().height;
        cards[i].style.gridRowEnd = 'span ' + Math.ceil((height + 24) / 8);
      }
    }
    layout();
    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(layout, 120);
    });
    window.addEventListener('load', layout);
    if (document.fonts) document.fonts.ready.then(layout);
  });

  // ── Language switcher ──
  // Keep the visitor on the same section (#contact, #services, …) when they
  // switch language. Section ids are identical in every language.
  document.querySelectorAll('[data-lang-switch]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.location.hash && link.href.indexOf('#') === -1) {
        link.href += window.location.hash;
      }
    });
  });

  // ── Contact form: pre-select the enquiry type ──
  // From a ?enquiry= URL param, or from CTAs carrying data-enquiry="…".
  var sel = document.getElementById('enquiry');
  if (sel) {
    var pick = function (value) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === value) { sel.selectedIndex = i; return; }
      }
    };

    var enquiry = new URLSearchParams(window.location.search).get('enquiry');
    if (enquiry) pick(enquiry);

    document.querySelectorAll('[data-enquiry]').forEach(function (link) {
      link.addEventListener('click', function () {
        pick(link.getAttribute('data-enquiry'));
      });
    });
  }

  // ── Blog: category filters ──
  var filters = document.querySelector('.category-filters');
  if (filters) {
    var cards = document.querySelectorAll('.blog-card[data-category]');
    filters.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter]');
      if (!button) return;
      var category = button.getAttribute('data-filter');
      filters.querySelectorAll('[data-filter]').forEach(function (b) {
        b.classList.toggle('active', b === button);
        b.setAttribute('aria-pressed', b === button ? 'true' : 'false');
      });
      cards.forEach(function (card) {
        card.hidden = category !== 'all' && card.getAttribute('data-category') !== category;
      });
    });
  }

  // ── Legal pages: "On this page" contents, built from the section headings ──
  var toc = document.querySelector('[data-toc]');
  var legalBody = document.querySelector('.legal-body');
  if (toc && legalBody) {
    var heads = legalBody.querySelectorAll('h3[id]:not(.legal-subhead)');
    var list = toc.querySelector('ol');
    var details = toc.querySelector('details');
    var tocLinks = {};
    heads.forEach(function (head) {
      var item = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + head.id;
      a.textContent = head.textContent;
      item.appendChild(a);
      list.appendChild(item);
      tocLinks[head.id] = a;
    });
    if (heads.length) {
      toc.hidden = false;
      toc.parentElement.classList.add('has-toc');
    }

    // A sidebar that is always open on wide screens, a collapsed panel on narrow ones.
    var wide = window.matchMedia('(min-width: 1024px)');
    var syncToc = function () { details.open = wide.matches; };
    syncToc();
    wide.addEventListener('change', syncToc);
    list.addEventListener('click', function (event) {
      if (event.target.closest('a') && !wide.matches) details.open = false;
    });

    // Highlight the section being read: the last heading that has scrolled up
    // to just below the nav (or the last one, once the page bottom is reached).
    var current = null;
    var spy = function () {
      var line = siteNav.offsetHeight + 32;
      var active = null;
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].getBoundingClientRect().top <= line) active = heads[i];
        else break;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        active = heads[heads.length - 1];
      }
      if (active === current) return;
      current = active;
      Object.keys(tocLinks).forEach(function (id) {
        var link = tocLinks[id];
        var on = active !== null && id === active.id;
        link.classList.toggle('is-current', on);
        if (on) {
          link.setAttribute('aria-current', 'location');
          // Keep the highlighted entry visible when the contents list scrolls.
          if (wide.matches && toc.scrollHeight > toc.clientHeight) {
            if (link.offsetTop < toc.scrollTop) toc.scrollTop = link.offsetTop - 12;
            else if (link.offsetTop + link.offsetHeight > toc.scrollTop + toc.clientHeight) {
              toc.scrollTop = link.offsetTop + link.offsetHeight - toc.clientHeight + 12;
            }
          }
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };
    if (heads.length) {
      var spyQueued = false;
      window.addEventListener('scroll', function () {
        if (spyQueued) return;
        spyQueued = true;
        requestAnimationFrame(function () { spyQueued = false; spy(); });
      }, { passive: true });
      spy();
    }
  }
})();
