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

  /* ---- video de portada ---- */
  /* autoplay is requested in the markup; this only handles the cases the markup
     cannot: a browser that refuses to start it, and a reader who asked for less
     motion. Both end with the poster showing and the button offering play, so
     the section never sits on a blank rectangle. */
  var video = document.getElementById('herovideo');
  var vtoggle = document.getElementById('videotoggle');

  if (video && vtoggle) {
    var paintToggle = function () {
      var paused = video.paused;
      vtoggle.setAttribute('aria-label', paused ? 'Reproducir video' : 'Pausar video');
      vtoggle.querySelector('use').setAttribute('href', paused ? '#ico-play' : '#ico-pause');
    };

    if (reduced) {
      // autoplay already started before this ran, so stop it and rewind to the
      // poster frame rather than freezing on an arbitrary one
      video.autoplay = false;
      video.pause();
      try { video.currentTime = 0; } catch (e) {}
    } else {
      // Safari and most mobile browsers reject autoplay until they are satisfied
      // the video is muted; the promise rejecting is the only way to find out
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(function () {});
    }

    vtoggle.addEventListener('click', function () {
      if (video.paused) video.play(); else video.pause();
    });
    video.addEventListener('play', paintToggle);
    video.addEventListener('pause', paintToggle);
    paintToggle();
  }

  /* ---- franja de captación ---- */
  var leadform = document.getElementById('leadform');

  if (leadform) {
    var fName  = document.getElementById('lf-name');
    var fPhone = document.getElementById('lf-phone');
    var fCc    = document.getElementById('lf-cc');

    // each country writes its own numbers differently, so the example follows
    // the selection instead of showing a Paraguayan number to a Brazilian
    var syncPlaceholder = function () {
      var opt = fCc.options[fCc.selectedIndex];
      if (opt) fPhone.placeholder = opt.dataset.ph || '';
    };
    fCc.addEventListener('change', syncPlaceholder);
    syncPlaceholder();

    var setError = function (input, msg) {
      var box = document.getElementById(input.id + '-err');
      if (msg) {
        input.setAttribute('aria-invalid', 'true');
        box.textContent = msg;
        box.hidden = false;
      } else {
        input.removeAttribute('aria-invalid');
        box.textContent = '';
        box.hidden = true;
      }
      return !msg;
    };

    // people write 0981…, (0981)…, 0981-123456; keep the digits, and drop the
    // trunk zero, which never belongs after a country code
    var digitsOf = function (v) { return (v || '').replace(/\D+/g, '').replace(/^0+/, ''); };

    // The example number for each country already carries that country's own
    // grouping, so it doubles as a display mask: walk it, spending a digit per
    // digit and copying the separators. Anything longer than the mask is
    // appended, so an unusual number is shown in full rather than truncated.
    var group = function (digits) {
      var opt = fCc.options[fCc.selectedIndex];
      var mask = (opt && opt.dataset.ph) || '';
      var out = '', i = 0;
      for (var m = 0; m < mask.length && i < digits.length; m++) {
        if (/\d/.test(mask[m])) out += digits[i++];
        else out += mask[m];
      }
      return (out + digits.slice(i)).trim();
    };

    [fName, fPhone].forEach(function (el) {
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid')) setError(el, null);
      });
    });

    leadform.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = fName.value.trim();
      var num  = digitsOf(fPhone.value);
      var okName  = setError(fName, name.length >= 2 ? null : 'Escriba su nombre.');
      // 6 is shorter than any mobile number in the list; 14 leaves room for the
      // country code inside E.164's 15-digit ceiling
      var okPhone = setError(fPhone,
        !num.length ? 'Escriba su número de WhatsApp.'
          : (num.length < 6 || num.length > 14) ? 'Ese número no parece completo.'
          : null);

      if (!okName || !okPhone) {
        (!okName ? fName : fPhone).focus();
        return;
      }

      var cc = fCc.value;
      var opt = fCc.options[fCc.selectedIndex];
      var display = '+' + cc + ' ' + group(num);
      var e164 = cc + num;
      var lead = {
        name: name,
        display: display,
        e164: e164,
        country: opt ? opt.dataset.iso : ''
      };

      // the confirmation page reads this instead of taking it from the URL, so a
      // name and a phone number never land in history or a referrer header
      try { sessionStorage.setItem('enerpy.lead', JSON.stringify(lead)); } catch (err) {}

      record(lead);
      window.location.href = 'gracias.html';
    });
  }

  /* ---- registro en Google Sheets ---- */
  /* Paste the Apps Script web-app URL into LEAD_ENDPOINT to start recording.
     Empty is a working state, not a broken one: the form still validates and
     still hands off to WhatsApp, it just writes nothing down. See
     docs/google-sheets.md for the script and the deploy steps. */
  var LEAD_ENDPOINT = '';

  function record(lead) {
    if (!LEAD_ENDPOINT) return;

    var body = new FormData();
    body.append('nombre', lead.name);
    body.append('whatsapp', lead.e164);
    body.append('mostrado', lead.display);
    body.append('pais', lead.country);
    body.append('origen', window.location.href);
    body.append('enviado', new Date().toISOString());

    /* This fires as the page is navigating away. A plain fetch() would be
       cancelled on unload and the row would be lost, so sendBeacon is first: the
       browser owns the request and finishes it after the document is gone.
       keepalive on fetch is the same promise for browsers without sendBeacon.
       Neither can read the response, which is fine — Apps Script does not send
       CORS headers for a cross-origin POST anyway, so the answer was never
       readable. A dropped row must not cost anyone their confirmation page. */
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(LEAD_ENDPOINT, body)) return;
      fetch(LEAD_ENDPOINT, { method: 'POST', body: body, mode: 'no-cors', keepalive: true })
        .catch(function () {});
    } catch (err) {}
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
