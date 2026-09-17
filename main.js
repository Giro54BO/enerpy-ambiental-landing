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

  /* ---- scrollspy ----
     Marks the nav link whose section the reader is in. Nav links cover six of
     the page's thirteen sections, so the active link is the last target the
     reader has passed rather than "the section intersecting the viewport" —
     that keeps a link lit inside an untargeted section (beneficios, casos,
     testimonios...) instead of blanking out between targets. */
  var spy = [];

  Array.prototype.forEach.call(
    document.querySelectorAll('#navmenu a[href^="#"]:not(.btn)'),
    function (link) {
      var section = document.getElementById(link.getAttribute('href').slice(1));
      if (section) spy.push({ link: link, section: section });
    }
  );

  // The menu is ordered to match the body, but the probe below walks the list
  // in order and takes the last match, so a menu that drifts out of document
  // order would silently elect the wrong link. Sorting makes that impossible.
  spy.sort(function (a, b) {
    var order = a.section.compareDocumentPosition(b.section);
    return (order & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
  });

  if (spy.length) {
    var lastActive = -1;
    var queued = false;

    var paint = function () {
      queued = false;

      var top = window.scrollY || document.documentElement.scrollTop;
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;

      // the probe line sits just below the nav pill, where a section visually
      // "arrives"; measured rather than hard-coded so the condensed bar, a
      // wrapped logo or a zoomed page all stay in step
      var probe = (nav ? nav.getBoundingClientRect().height : 0) + 24;
      var index = -1;

      for (var i = 0; i < spy.length; i++) {
        if (spy[i].section.getBoundingClientRect().top <= probe) index = i;
      }

      // the last target is followed by two more sections, so it can never reach
      // the probe on its own — hitting the end of the document elects it
      if (scrollable > 0 && top >= scrollable - 2) index = spy.length - 1;

      if (index === lastActive) return;
      lastActive = index;

      spy.forEach(function (entry, n) {
        var on = n === index;
        entry.link.classList.toggle('is-active', on);
        if (on) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
      });
    };

    var request = function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
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

  /* ---- keep the -50% loops continuous on wide screens ---- */
  /* Two identical halves translated -50% only read as seamless while one half is
     at least as wide as the viewport; below that a gap crosses the screen at the
     end of each cycle. Clone cards until the half is wide enough. screen.width
     is used as well as innerWidth so maximising the window cannot reintroduce it. */
  var target = Math.max(window.innerWidth, screen.width || 0);
  document.querySelectorAll('.quoteloop__track').forEach(function (track) {
    var halves = track.children;
    if (halves.length < 2) return;
    var unique = Array.prototype.slice.call(halves[0].children);
    if (!unique.length) return;
    var guard = 0;
    while (halves[0].getBoundingClientRect().width < target && guard++ < 12) {
      unique.forEach(function (card) {
        Array.prototype.forEach.call(halves, function (half) {
          var copy = card.cloneNode(true);
          copy.setAttribute('aria-hidden', 'true');   // repeats are decorative
          half.appendChild(copy);
        });
      });
    }
    buildDots(track, unique.length, halves[0].children.length);
  });

  /* ---- carousel dots ----
     A continuous marquee gives the reader no idea how much there is or that it
     is advancing at all — it can look like a static row of cards, which is what
     people reported. The dots answer both: how many testimonials exist, which
     one is up, and (by moving on their own) that the thing is running.

     They are real buttons, not decoration. Under reduced motion the track is not
     animated and .quoteloop is overflow:hidden, so without them every quote past
     the third was simply unreachable; there they scroll the strip instead. */
  function buildDots(track, uniqueCount, perHalf) {
    if (uniqueCount < 2) return;

    var loop = track.parentElement;
    var nav = document.createElement('div');
    nav.className = 'quoteloop__dots';
    nav.setAttribute('role', 'group');
    nav.setAttribute('aria-label', 'Elegir testimonio');

    var dots = [];
    for (var i = 0; i < uniqueCount; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'quoteloop__dot';
      b.setAttribute('aria-label', 'Testimonio ' + (i + 1) + ' de ' + uniqueCount);
      b.dataset.i = String(i);
      nav.appendChild(b);
      dots.push(b);
    }
    loop.parentElement.insertBefore(nav, loop.nextSibling);

    // the CSS animation is the source of truth while it exists; seeking it by
    // currentTime is exact, where reading back the transform would not be
    function running() {
      var a = track.getAnimations ? track.getAnimations() : [];
      return a.length ? a[0] : null;
    }
    function ms(v) { return (v && typeof v === 'object') ? v.value : v; }

    var active = -1;
    function paint(i) {
      if (i === active) return;
      active = i;
      dots.forEach(function (d, n) {
        d.classList.toggle('is-on', n === i);
        if (n === i) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }

    function read() {
      var a = running();
      if (a && a.effect) {
        var dur = ms(a.effect.getTiming().duration);
        var now = ms(a.currentTime) || 0;
        if (!dur) return;
        // one cycle scrolls exactly one half, so progress maps to card index
        var p = (now % dur) / dur;
        paint(Math.floor(p * perHalf) % uniqueCount);
      } else if (loop.scrollWidth > loop.clientWidth) {
        var card = track.children[0].children[0];
        var step = card.getBoundingClientRect().width + 20;
        paint(Math.round(loop.scrollLeft / step) % uniqueCount);
      }
    }

    nav.addEventListener('click', function (e) {
      var b = e.target.closest('.quoteloop__dot');
      if (!b) return;
      var i = Number(b.dataset.i);
      var a = running();
      if (a && a.effect) {
        a.currentTime = (i / perHalf) * ms(a.effect.getTiming().duration);
      } else {
        var card = track.children[0].children[i];
        if (card) {
          // Geometry, not offsetLeft: .quoteloop is not positioned, so offsetLeft
          // resolves against <body> and would be wrong the moment anything above
          // it gains a left offset. And behaviour is 'auto' on purpose —
          // scroll-snap-type:x mandatory cancels a smooth programmatic scroll
          // partway and snaps straight back to where it started.
          var delta = card.getBoundingClientRect().left - loop.getBoundingClientRect().left;
          loop.scrollTo({ left: loop.scrollLeft + delta, behavior: 'auto' });
        }
      }
      read();
    });

    loop.addEventListener('scroll', read, { passive: true });

    // only tick while the section is actually on screen
    var timer = null;
    var start = function () { if (timer === null) timer = setInterval(read, 250); };
    var stop = function () { if (timer !== null) { clearInterval(timer); timer = null; } };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
      }, { threshold: 0 }).observe(loop);
    } else {
      start();
    }
    read();
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
