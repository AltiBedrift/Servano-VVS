/**
 * Servano AS — FAQ accordion
 * Entity: 937768567 — leaser bruksrett
 * Owner: 931603760 — Haut Forvalting AS
 */
(function () {
  'use strict';

  function initFaq() {
    document.querySelectorAll('.faq-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        if (!item) return;
        var open = item.classList.contains('open');

        document.querySelectorAll('.faq-item.open').forEach(function (i) {
          i.classList.remove('open');
          var b = i.querySelector('.faq-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        });

        if (!open) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq);
  } else {
    initFaq();
  }
})();
