/* Enerpy Ambiental — landing interactions */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- current year ---- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- nav: condensed state on scroll ---- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- nav: mobile drawer ---- */
  var toggle = document.getElementById('navtoggle');
  var menu = document.getElementById('navmenu');

  if (toggle && menu) {
    var closeMenu = function () {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    };

    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    // close after picking a destination
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('is-open')) return;
      if (e.target.closest('#navmenu') || e.target.closest('#navtoggle')) return;
      closeMenu();
    });
  }

  /* ---- process stepper ---- */
  var stepList = document.getElementById('steplist');

  if (stepList) {
    var steps = Array.prototype.slice.call(stepList.querySelectorAll('.step'));
    var images = Array.prototype.slice.call(document.querySelectorAll('.steps__img'));
    var counter = document.getElementById('stepnow');
    var timer = null;
    var active = 0;

    var show = function (i) {
      active = i;
      steps.forEach(function (s, n) {
        if (n === i) s.setAttribute('aria-current', 'true');
        else s.removeAttribute('aria-current');
      });
      images.forEach(function (img, n) {
        img.classList.toggle('is-on', n === i);
      });
      if (counter) counter.textContent = String(i + 1);
    };

    var advance = function () {
      show((active + 1) % steps.length);
    };

    var restart = function () {
      if (reduced || timer === null) return;
      clearInterval(timer);
      timer = setInterval(advance, 5200);
    };

    steps.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        show(i);
        restart();
      });
      btn.addEventListener('focus', function () {
        show(i);
        restart();
      });
    });

    // auto-advance only while the section is on screen, and never under reduced motion
    if (!reduced && 'IntersectionObserver' in window) {
      var section = document.getElementById('proceso');
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && timer === null) {
            timer = setInterval(advance, 5200);
          } else if (!entry.isIntersecting && timer !== null) {
            clearInterval(timer);
            timer = null;
          }
        });
      }, { threshold: 0.35 }).observe(section);
    }

    show(0);
  }

  /* ---- scroll reveal ---- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el, i) {
      // small stagger inside a shared parent
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  }
})();
