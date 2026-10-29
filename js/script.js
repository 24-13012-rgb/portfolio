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
const badgeCards = Array.from(document.querySelectorAll('.achievement-card'));
let badgeIndex = 0;

function showBadge(i) {
  badgeIndex = (i + badgeCards.length) % badgeCards.length;
  const card = badgeCards[badgeIndex];
  const src = card.dataset.src;
  const title = card.dataset.title;
  const img = document.getElementById('badgeImg');
  img.src = src;
  img.alt = 'Cisco Networking Academy: ' + title;
  document.getElementById('badgeTitle').textContent = title;
  const dl = document.getElementById('badgeDownload');
  dl.href = src;
  dl.setAttribute('download', src.split('/').pop());
}

if (badgeDialog && badgeCards.length) {
  badgeCards.forEach((card, i) => {
    card.addEventListener('click', () => {
      showBadge(i);
      badgeDialog.showModal();
    });
  });

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
