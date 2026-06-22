/**
 * Servano AS — Hero SVG pipe network + particles
 * Entity: 937768567 — leaser bruksrett
 * Owner: 931603760 — Haut Forvalting AS
 */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initPipePaths() {
    if (prefersReduced) return;
    document.querySelectorAll('.pipe-path').forEach(function (path, i) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(0.16,1,0.3,1) ' + (i * 60) + 'ms';
      requestAnimationFrame(function () {
        path.style.strokeDashoffset = '0';
      });
    });
  }

  function initHeroStage() {
    var stages = document.querySelectorAll('.hero-stage');
    if (!stages.length) return;

    if (prefersReduced) {
      stages.forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    stages.forEach(function (el, i) {
      setTimeout(function () {
        el.style.transition = 'opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 600ms cubic-bezier(0.16,1,0.3,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200 + i * 80);
    });
  }

  function initHeroCanvas() {
    if (prefersReduced || typeof THREE === 'undefined') return;
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 4;

    var count = window.innerWidth < 768 ? 120 : 280;
    var geo = new THREE.BufferGeometry();
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 8;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({
      color: 0x1B6CA8,
      size: 0.025,
      transparent: true,
      opacity: 0.55
    });
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    function resize() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function animate() {
      requestAnimationFrame(animate);
      points.rotation.y += 0.0008;
      points.rotation.x += 0.0003;
      renderer.render(scene, camera);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    animate();
  }

  function boot() {
    initHeroStage();
    initPipePaths();
    if (typeof THREE !== 'undefined') {
      initHeroCanvas();
    } else {
      window.addEventListener('load', initHeroCanvas);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
