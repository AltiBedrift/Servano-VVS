/**
 * Servano AS — Main application
 * Entity: 937768567 — leaser bruksrett
 * Owner: 931603760 — Haut Forvalting AS
 */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getRootPrefix() {
    var path = window.location.pathname;
    if (path.indexOf('/tjenester/') !== -1) return '../../';
    if (path.split('/').filter(Boolean).length > 1) return '../';
    return '/';
  }

  function resolveUrl(path) {
    if (path.charAt(0) === '/') return path;
    return getRootPrefix() + path;
  }

  function loadPartial(targetId, url) {
    var el = document.getElementById(targetId);
    if (!el) return Promise.resolve();

    return fetch(resolveUrl(url))
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load ' + url);
        return r.text();
      })
      .then(function (html) {
        el.innerHTML = html;
      })
      .catch(function () {
        /* Fallback: partials may fail on file:// — page still usable */
      });
  }

  function loadIncludes() {
    return Promise.all([
      loadPartial('include-nav', 'includes/nav.html'),
      loadPartial('include-footer', 'includes/footer.html'),
      loadPartial('include-gdpr', 'includes/gdpr.html')
    ]);
  }

  function getPakkeParam() {
    return new URLSearchParams(window.location.search).get('pakke') || '';
  }

  function applyPakkeToForm() {
    var pakke = getPakkeParam();
    if (!pakke) return;
    var sel = document.getElementById('cf-pakke');
    if (!sel) return;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === pakke) {
        sel.value = pakke;
        return;
      }
    }
    var opt = document.createElement('option');
    opt.value = pakke;
    opt.textContent = pakke.replace(/-/g, ' ');
    opt.selected = true;
    sel.appendChild(opt);
  }

  function initVakttelefonGate() {
    document.querySelectorAll('[data-vakttelefon][data-segment="non-subscriber"]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var pakke = getPakkeParam() || 'serviceabonnement-vakt';
        window.location.href = resolveUrl('kontakt/?pakke=' + encodeURIComponent(pakke));
      });
    });
  }

  function initNav() {
    var nav = document.getElementById('nav-primary');
    var menu = document.getElementById('mobile-menu');
    var openBtn = document.getElementById('hamburger-btn');
    var closeBtn = document.getElementById('menu-close-btn');

    function setMenuOpen(open) {
      if (!menu || !openBtn) return;
      menu.classList.toggle('open', open);
      openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }

    if (openBtn) openBtn.addEventListener('click', function () { setMenuOpen(true); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenuOpen(false); });
    if (menu) {
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setMenuOpen(false); });
      });
    }

    window.addEventListener('scroll', function () {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });

    var path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-links a, .mobile-links a').forEach(function (a) {
      var href = a.getAttribute('href').replace(/\/$/, '') || '/';
      if (path === href || (href !== '/' && path.indexOf(href) === 0)) {
        a.classList.add('active');
      }
    });
  }

  var STAGGER_MS = 80;
  var STAGGER_PARENTS = '.svc-grid, .grid-3, .prob-grid, .qual-grid, .case-grid, .story-chain-steps, .faq-list, .naering-grid, .team-grid, .cert-placeholder-grid';

  function initScrollAnimations() {
    var els = document.querySelectorAll('.anim-ready, .reveal-ready');
    if (!els.length) return;

    if (prefersReduced) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var parent = el.parentElement;

        if (parent && parent.matches(STAGGER_PARENTS)) {
          var siblings = parent.querySelectorAll('.anim-ready, .reveal-ready');
          var idx = Array.prototype.indexOf.call(siblings, el);
          if (idx >= 0) {
            el.style.transitionDelay = (idx * STAGGER_MS) + 'ms';
          }
        }

        el.classList.add('visible');
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  function initStoryChain() {
    var chain = document.getElementById('story-chain');
    if (!chain) return;

    if (prefersReduced) {
      chain.classList.add('is-visible');
      return;
    }

    if (!('IntersectionObserver' in window)) {
      chain.classList.add('is-visible');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      chain.classList.add('is-visible');
      io.disconnect();
    }, { threshold: 0.1 });

    io.observe(chain);
  }

  function initCountUp() {
    document.querySelectorAll('[data-countup]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-countup'), 10);
      if (isNaN(target)) return;

      if (prefersReduced) {
        el.textContent = target;
        return;
      }

      var observed = false;
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting || observed) return;
        observed = true;
        var start = 0;
        var dur = 900;
        var t0 = performance.now();
        var glowAdded = false;

        function tick(now) {
          var p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round(start + (target - start) * p);
          if (p >= 1 && !glowAdded) {
            glowAdded = true;
            el.classList.add('qual-glow');
          }
          if (p < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        io.disconnect();
      }, { threshold: 0.5 });

      io.observe(el);
    });
  }

  function initContactForm() {
    var form = document.getElementById('contact-form-el');
    var success = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.style.display = 'none';
      if (success) success.style.display = 'block';
      window.dispatchEvent(new CustomEvent('form_submitted', {
        detail: { pakke: (document.getElementById('cf-pakke') || {}).value }
      }));
    });
  }

  function initDataLayer() {
    window.dataLayer = window.dataLayer || [];
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-gtm-event]');
      if (!t) return;
      window.dataLayer.push({
        event: t.getAttribute('data-gtm-event'),
        label: t.getAttribute('data-gtm-label') || ''
      });
    });
  }

  function boot() {
    applyPakkeToForm();
    initVakttelefonGate();
    initNav();
    initScrollAnimations();
    initStoryChain();
    initCountUp();
    initContactForm();
    initDataLayer();
  }

  function start() {
    loadIncludes().then(function () {
      boot();
      if (window.ServanoConsent) window.ServanoConsent.init();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
