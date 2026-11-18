/* ============================================================
   Neng Tika Adianti — Portfolio interactions
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var THEME_KEY = 'nta-theme';

  /* ---------- Theme ---------- */
  var themeToggle = document.querySelector('[data-theme-toggle]');
  var themeColorMeta = document.getElementById('theme-color');

  function syncThemeUI() {
    var theme = root.getAttribute('data-theme') || 'light';
    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'
      );
      themeToggle.setAttribute('title', theme === 'light' ? 'Mode gelap' : 'Mode terang');
    }
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'light' ? '#F7F2F8' : '#15101D');
    }
  }

  function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (error) {
        /* storage unavailable — theme still applies for this session */
      }
    }
    syncThemeUI();
  }

  syncThemeUI();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      setTheme(next, true);
    });
  }

  /* ---------- Mobile navigation ---------- */
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var navPanel = document.querySelector('[data-nav-panel]');

  function setMenu(open) {
    if (!menuToggle || !navPanel) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    navPanel.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (navPanel) {
    navPanel.addEventListener('click', function (event) {
      if (event.target === navPanel) setMenu(false);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navPanel && navPanel.classList.contains('is-open')) {
      setMenu(false);
      if (menuToggle) menuToggle.focus();
    }
  });

  var desktopQuery = window.matchMedia('(min-width: 901px)');
  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', function (event) {
      if (event.matches) setMenu(false);
    });
  }

  /* ---------- Smooth in-page navigation ---------- */
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    var link = event.target.closest('a[href^="#"]');
    if (!link) return;

    var hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    var target = document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();

    var menuWasOpen = navPanel && navPanel.classList.contains('is-open');
    if (menuWasOpen) setMenu(false);

    window.setTimeout(
      function () {
        target.scrollIntoView({
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
          block: 'start'
        });
      },
      menuWasOpen ? 70 : 0
    );
  });

  /* ---------- Header state, scroll spy, back to top ---------- */
  var header = document.querySelector('[data-header]');
  var toTop = document.querySelector('[data-to-top]');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));

  var sections = [];
  navLinks.forEach(function (link) {
    var section = document.querySelector(link.getAttribute('href'));
    if (section && sections.indexOf(section) === -1) sections.push(section);
  });
  sections.sort(function (a, b) {
    return a.offsetTop - b.offsetTop;
  });

  var scrollQueued = false;

  function handleScroll() {
    if (scrollQueued) return;
    scrollQueued = true;

    window.requestAnimationFrame(function () {
      var y = window.scrollY;

      if (header) header.classList.toggle('is-scrolled', y > 8);
      if (toTop) toTop.classList.toggle('is-visible', y > 560);

      var probe = y + (header ? header.offsetHeight : 0) + 110;
      var current = '';

      sections.forEach(function (section) {
        if (section.offsetTop <= probe) current = section.id;
      });

      var docHeight = document.documentElement.scrollHeight;
      if (window.innerHeight + y >= docHeight - 4 && sections.length) {
        current = sections[sections.length - 1].id;
      }

      navLinks.forEach(function (link) {
        if (link.getAttribute('href') === '#' + current) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });

      scrollQueued = false;
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll);
  handleScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, index) {
      child.style.setProperty('--delay', (Math.min(index * 0.07, 0.42)).toFixed(2) + 's');
    });
  });

  if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-inview');
    });
  }

  /* ---------- Footer year ---------- */
  var year = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach(function (element) {
    element.textContent = String(year);
  });
})();
