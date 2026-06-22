/**
 * Servano AS — GDPR consent
 * Entity: 937768567 — leaser bruksrett
 * Owner: 931603760 — Haut Forvalting AS
 */
(function () {
  'use strict';

  var KEY = 'servano_consent';

  function initGdpr() {
    var banner = document.getElementById('gdpr-consent');
    if (!banner) return;

    if (!localStorage.getItem(KEY)) {
      requestAnimationFrame(function () {
        banner.classList.add('visible');
      });
    }

    function grant(level) {
      localStorage.setItem(KEY, level);
      banner.classList.remove('visible');
      if (level === 'all') {
        window.dispatchEvent(new Event('consent_granted'));
      }
    }

    var accept = document.getElementById('gdpr-accept');
    var necessary = document.getElementById('gdpr-necessary');

    if (accept) accept.addEventListener('click', function () { grant('all'); });
    if (necessary) necessary.addEventListener('click', function () { grant('necessary'); });
  }

  window.ServanoConsent = { init: initGdpr };

  if (document.getElementById('gdpr-consent')) {
    initGdpr();
  }
})();
