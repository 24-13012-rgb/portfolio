// ---------- Helpers ----------
const root = document.documentElement;

function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* private mode: ignore */ }
}

// ---------- Theme toggle (light / dark) ----------
const themeToggle = document.getElementById('themeToggle');

function syncThemeButton() {
  const isDark = root.getAttribute('data-theme') === 'dark';
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

if (themeToggle) {
  syncThemeButton();
  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    safeSet('theme', next);
    syncThemeButton();
  });

  // Follow the device setting live, but only until the visitor picks a theme themselves
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', (e) => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) {
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      syncThemeButton();
    }
  });
}

// ---------- Mobile nav ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function setMenu(open) {
  navLinks.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

// Close the menu with Esc or by tapping outside it
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('is-open') && !e.target.closest('.nav')) setMenu(false);
});

// ---------- Nav shadow once the page scrolls ----------
const nav = document.querySelector('.nav');
function onScroll() {
  nav.classList.toggle('is-scrolled', window.scrollY > 8);
  // Near the top (hero) no section link should look active
  if (window.scrollY < 200) {
    document.querySelectorAll('.nav__links a[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Highlight the nav link for the section on screen ----------
const sectionLinks = Array.from(document.querySelectorAll('.nav__links a[href^="#"]'));
const sections = sectionLinks
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((a) => {
        a.removeAttribute('aria-current');
        if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));
}

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Copy portfolio link ----------
const copyLinkBtn = document.getElementById('copyLinkBtn');

if (copyLinkBtn) {
  const originalText = copyLinkBtn.textContent;
  let resetTimer;

  function flash(text) {
    copyLinkBtn.textContent = text;
    copyLinkBtn.disabled = true;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copyLinkBtn.textContent = originalText;
      copyLinkBtn.disabled = false;
    }, 1800);
  }

  copyLinkBtn.addEventListener('click', async () => {
    // Copy the clean page address (no #section on the end)
    const url = window.location.origin + window.location.pathname;
    try {
      await navigator.clipboard.writeText(url);
      flash('Copied!');
    } catch (err) {
      flash('Copy failed');
    }
  });
}

// ---------- Achievement viewer: click a badge to enlarge it and download it ----------
const badgeDialog = document.getElementById('badgeDialog');
const allViewable = Array.from(document.querySelectorAll('[data-src][data-group]'));
let badgeCards = allViewable; // the group currently open (badges or one project's screenshots)
let badgeIndex = 0;

function showBadge(i) {
  badgeIndex = (i + badgeCards.length) % badgeCards.length;
  const card = badgeCards[badgeIndex];
  const src = card.dataset.src;
  const title = card.dataset.title;
  const img = document.getElementById('badgeImg');
  img.src = src;
  img.alt = card.dataset.alt || ('Cisco Networking Academy: ' + title);
  document.getElementById('badgeTitle').textContent = title;
  const desc = document.getElementById('badgeDesc');
  desc.textContent = card.dataset.desc || '';
  desc.hidden = !card.dataset.desc;
  const count = document.getElementById('badgeCount');
  count.textContent = badgeCards.length > 1 ? (badgeIndex + 1) + ' / ' + badgeCards.length : '';
  // Warm the next slide so arrows feel instant
  const nextSrc = badgeCards[(badgeIndex + 1) % badgeCards.length].dataset.src;
  if (nextSrc !== src) new Image().src = nextSrc;
  const dl = document.getElementById('badgeDownload');
  dl.href = src;
  dl.setAttribute('download', src.split('/').pop());
}

function openViewer() {
  if (badgeDialog.open) return;
  if (typeof badgeDialog.showModal === 'function') badgeDialog.showModal();
  else badgeDialog.setAttribute('open', '');   // very old browsers
  document.body.style.overflow = 'hidden';
}

if (badgeDialog && allViewable.length) {
  badgeDialog.addEventListener('close', () => { document.body.style.overflow = ''; });
  allViewable.forEach((card) => {
    card.addEventListener('click', () => {
      // Only step through items from the same group (badges, or one project's screenshots)
      badgeCards = allViewable.filter((el) => el.dataset.group === card.dataset.group);
      badgeDialog.classList.toggle('badge-dialog--wide', card.dataset.group !== 'badges');
      showBadge(badgeCards.indexOf(card));
      openViewer();
    });
  });

  // "Show the project" buttons open that project's slides from the first one
  document.querySelectorAll('[data-open-group]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.openGroup;
      badgeCards = allViewable.filter((el) => el.dataset.group === group);
      badgeDialog.classList.add('badge-dialog--wide');
      showBadge(0);
      openViewer();
    });
  });

  // Swipe left/right on touch screens
  let touchX = null;
  badgeDialog.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  badgeDialog.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) showBadge(badgeIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });

  document.getElementById('badgeClose').addEventListener('click', () => badgeDialog.close());
  document.getElementById('badgePrev').addEventListener('click', () => showBadge(badgeIndex - 1));
  document.getElementById('badgeNext').addEventListener('click', () => showBadge(badgeIndex + 1));

  // Clicking the dark backdrop closes the viewer
  badgeDialog.addEventListener('click', (e) => {
    if (e.target === badgeDialog) badgeDialog.close();
  });

  // Arrow keys move between badges (Esc closes by default)
  document.addEventListener('keydown', (e) => {
    if (!badgeDialog.open) return;
    if (e.key === 'ArrowLeft') showBadge(badgeIndex - 1);
    if (e.key === 'ArrowRight') showBadge(badgeIndex + 1);
  });
}

// ---------- Scroll progress bar ----------
const progressBar = document.getElementById('scrollProgress');
if (progressBar) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

// ---------- Typing role in the hero ----------
const typedEl = document.getElementById('typed');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (typedEl && !reduceMotion) {
  const words = typedEl.dataset.words.split('|');
  let w = 0, c = typedEl.textContent.length, deleting = true;
  const tick = () => {
    const word = words[w];
    if (deleting) {
      c--;
      if (c <= 0) { deleting = false; w = (w + 1) % words.length; }
    } else {
      c++;
      if (c >= words[w].length) { deleting = true; typedEl.textContent = words[w]; return setTimeout(tick, 1800); }
    }
    typedEl.textContent = (deleting ? word : words[w]).slice(0, Math.max(c, 0));
    setTimeout(tick, deleting ? 40 : 80);
  };
  setTimeout(tick, 1800);
} else if (typedEl) {
  document.querySelector('.typed-caret').style.display = 'none';
}

// ---------- Project filter ----------
const chips = document.querySelectorAll('.filters .chip');
const projectCards = document.querySelectorAll('.project[data-type]');
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => {
      const on = c === chip;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    projectCards.forEach((card) => {
      card.hidden = !(f === 'all' || card.dataset.type === f);
      if (!card.hidden) card.classList.add('is-visible');
    });
  });
});

// ---------- Back to top button ----------
const toTop = document.getElementById('toTop');
if (toTop) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let toTopHideTimer;
  function updateToTop() {
    const show = window.scrollY > 600;
    clearTimeout(toTopHideTimer);
    if (show) {
      toTop.hidden = false;
      requestAnimationFrame(() => toTop.classList.add('is-shown'));
    } else {
      toTop.classList.remove('is-shown');
      toTopHideTimer = setTimeout(() => { toTop.hidden = true; }, 220);
    }
  }
  window.addEventListener('scroll', updateToTop, { passive: true });
  updateToTop();
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

// ---------- Resume download effect ----------
// The download itself is the normal link. This only adds the animation:
// a little resume page drops in and "fills up", then 0s and 1s burst out of the button.
const resumeBtn = document.getElementById('resumeBtn');
if (resumeBtn) {
  const label = resumeBtn.querySelector('.btn__label');
  const originalLabel = label.textContent;
  let resumeTimer;

  resumeBtn.addEventListener('click', () => {
    clearTimeout(resumeTimer);
    resumeBtn.classList.remove('is-saved');
    resumeBtn.classList.add('is-saving');
    label.textContent = 'Preparing…';
    resumeTimer = setTimeout(() => {
      resumeBtn.classList.remove('is-saving');
      resumeBtn.classList.add('is-saved');
      label.textContent = 'Saved ✓ Resume.pdf';
      resumeTimer = setTimeout(() => {
        resumeBtn.classList.remove('is-saved');
        label.textContent = originalLabel;
      }, 2600);
    }, reduceMotion ? 300 : 1200);

    if (reduceMotion) return;

    const rect = resumeBtn.getBoundingClientRect();
    const fx = document.createElement('div');
    fx.className = 'dl-fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.style.cssText = 'left:' + rect.left + 'px;top:' + rect.top + 'px;width:' + rect.width + 'px;height:' + rect.height + 'px';
    fx.innerHTML = '<div class="dl-sheet"><i></i><i></i><i></i><i></i></div>';
    document.body.appendChild(fx);

    // Bits burst out once the page has "landed"
    setTimeout(() => {
      for (let n = 0; n < 18; n++) {
        const bit = document.createElement('span');
        bit.className = 'dl-bit';
        bit.textContent = Math.random() < 0.5 ? '0' : '1';
        const angle = (Math.PI * 2 * n) / 18 + Math.random() * 0.4;
        const dist = 50 + Math.random() * 70;
        const dx = Math.cos(angle) * dist * 1.4, dy = Math.sin(angle) * dist;
        fx.appendChild(bit);
        if (bit.animate) {
          bit.animate([
            { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
            { transform: 'translate(' + dx * 0.3 + 'px, ' + dy * 0.3 + 'px) scale(1)', opacity: 1, offset: 0.15 },
            { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(1)', opacity: 0 }
          ], { duration: 900, delay: Math.random() * 120, easing: 'ease-out', fill: 'forwards' });
        }
      }
    }, 700);
    setTimeout(() => fx.remove(), 2000);
  });
}
