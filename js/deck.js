/* ==========================================================
   Slide mode: each section is its own slide.
   Move with the bottom bar, the "Next" buttons, the top menu,
   the left/right arrow keys, or by swiping on a phone.
   Without JavaScript the page simply stays one long scroll.
   ========================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  if (!slides.length) return;

  root.classList.add('deck');
  root.classList.remove('deck-pending');

  var LABELS = { home: 'Home', about: 'About', skills: 'Skills', projects: 'Projects', casestudy: 'Case study', achievements: 'Achievements', education: 'Education', contact: 'Contact' };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = -1;
  var dialog = document.getElementById('badgeDialog');
  var progress = document.getElementById('scrollProgress');

  function idOf(i) { return slides[i].id; }
  function indexOfId(id) {
    for (var i = 0; i < slides.length; i++) if (slides[i].id === id) return i;
    return -1;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- Bottom bar ---------- */
  var bar = document.createElement('nav');
  bar.className = 'deck-bar';
  bar.setAttribute('aria-label', 'Slides');

  var prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'deck-bar__arrow';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.textContent = '←';

  var nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'deck-bar__arrow';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.textContent = '→';

  var tabs = document.createElement('div');
  tabs.className = 'deck-bar__tabs';
  var tabBtns = slides.map(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'deck-tab';
    b.setAttribute('aria-label', 'Go to ' + (LABELS[s.id] || s.id));
    b.innerHTML = '<span class="deck-tab__num">' + pad(i) + '</span><span class="deck-tab__label">' + (LABELS[s.id] || s.id) + '</span>';
    b.addEventListener('click', function () { go(i); });
    tabs.appendChild(b);
    return b;
  });

  bar.appendChild(prevBtn);
  bar.appendChild(tabs);
  bar.appendChild(nextBtn);
  document.body.appendChild(bar);

  prevBtn.addEventListener('click', function () { go(current - 1); });
  nextBtn.addEventListener('click', function () { go(current + 1); });

  /* ---------- A big "Next" button at the end of each slide ---------- */
  slides.forEach(function (s, i) {
    if (i === 0) return;
    var holder = s.classList.contains('section') ? s : null;
    if (!holder) return;
    var last = i === slides.length - 1;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--primary slide-next';
    btn.textContent = last ? 'Back to start ↑' : 'Next: ' + LABELS[slides[i + 1].id] + ' →';
    btn.addEventListener('click', function () { go(last ? 0 : i + 1); });
    holder.appendChild(btn);
  });

  /* ---------- Red wipe that sweeps across when the slide changes ---------- */
  var wipe = document.createElement('div');
  wipe.className = 'wipe';
  wipe.setAttribute('aria-hidden', 'true');
  wipe.innerHTML = '<span>ML.</span>';
  document.body.appendChild(wipe);
  var wiping = false, swapped = false, pending = null;
  var WIPE_MS = 640;

  /* ---------- Going to a slide ---------- */
  function go(i, opts) {
    opts = opts || {};
    if (i < 0 || i >= slides.length) return;
    if (i === current && !opts.force) { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); return; }
    if (wiping) {                                  // a wipe is already running
      if (swapped) show(i, opts, false); else pending = { i: i, opts: opts };
      return;
    }
    // First load, reduced motion: switch straight away
    if (current === -1 || reduceMotion || opts.noWipe) { show(i, opts, true); return; }
    wiping = true; swapped = false; pending = { i: i, opts: opts };
    wipe.classList.remove('is-on');
    void wipe.offsetWidth;                         // restart the animation
    wipe.classList.add('is-on');
    setTimeout(function () { swapped = true; show(pending.i, pending.opts, false); }, WIPE_MS * 0.5);
    setTimeout(function () { wipe.classList.remove('is-on'); wiping = false; }, WIPE_MS);
  }

  function show(i, opts, slideIn) {
    var forward = i >= current;

    slides.forEach(function (s, n) {
      var on = n === i;
      s.classList.toggle('is-active', on);
      s.classList.remove('from-right', 'from-left');
      if (on && slideIn && !reduceMotion && current !== -1) s.classList.add(forward ? 'from-right' : 'from-left');
    });
    current = i;

    // Reveal everything on the new slide straight away
    slides[i].querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });

    tabBtns.forEach(function (b, n) {
      b.classList.toggle('is-active', n === i);
      if (n === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === slides.length - 1;

    // Top menu highlight
    document.querySelectorAll('.nav__links a[href^="#"]').forEach(function (a) {
      if (a.getAttribute('href') === '#' + idOf(i)) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });

    if (progress) progress.style.transform = 'scaleX(' + ((i + 1) / slides.length) + ')';
    document.title = (i === 0 ? '' : (LABELS[idOf(i)] + ' \u00b7 ')) + 'Melecio Laurente \u2014 IT Student & Systems Builder';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });   // jump, don't glide

    if (!opts.noHistory) {
      try { history.pushState({ slide: i }, '', '#' + idOf(i)); } catch (e) { /* ignore */ }
    }
    document.dispatchEvent(new CustomEvent('slidechange', { detail: { index: i, id: idOf(i) } }));
  }

  /* ---------- Links that point to a slide (menu, buttons, footer) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var idx = id === 'top' ? 0 : indexOfId(id);
    if (idx === -1) return;            // e.g. the "skip to content" link: leave it alone
    e.preventDefault();
    go(idx);
  });

  /* ---------- Keyboard + swipe ---------- */
  function typing(t) { return t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName); }
  document.addEventListener('keydown', function (e) {
    if (document.querySelector('dialog[open]')) return;     // pop-ups use the arrows themselves
    if (typing(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight') go(current + 1);
    if (e.key === 'ArrowLeft') go(current - 1);
  });

  var sx = null, sy = null;
  document.addEventListener('touchstart', function (e) {
    if (document.querySelector('dialog[open]')) { sx = null; return; }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 90 && Math.abs(dx) > Math.abs(dy) * 2) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- Browser back/forward + opening on a #link ---------- */
  window.addEventListener('popstate', function () {
    var idx = indexOfId(location.hash.slice(1));
    go(idx === -1 ? 0 : idx, { noHistory: true });
  });

  // Once the page is idle, fetch the pictures on the other slides so they are ready when opened
  function warmImages() {
    slides.forEach(function (sl) {
      sl.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; });
    });
  }
  if ('requestIdleCallback' in window) requestIdleCallback(warmImages, { timeout: 2500 });
  else setTimeout(warmImages, 1500);

  var start = indexOfId(location.hash.slice(1));
  go(start === -1 ? 0 : start, { noHistory: true, force: true, noWipe: true });
  if (start === -1) { try { history.replaceState({ slide: 0 }, '', location.pathname + location.search); } catch (e) { /* ignore */ } }
})();
