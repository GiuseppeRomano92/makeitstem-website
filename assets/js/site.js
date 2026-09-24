/*
 * Make IT STEM — behaviour shared by every page.
 */
(function () {
  'use strict';

  // ── Mobile menu ──
  var nav = document.getElementById('navLinks');
  var burger = document.getElementById('hamburger');
  if (nav && burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close the mobile menu after tapping a link
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

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
})();
