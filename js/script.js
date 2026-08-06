// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => observer.observe(el));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Copy portfolio link
const copyLinkBtn = document.getElementById('copyLinkBtn');

if (copyLinkBtn) {
  copyLinkBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const originalText = copyLinkBtn.textContent;
      copyLinkBtn.textContent = 'Copied!';
      copyLinkBtn.disabled = true;
      setTimeout(() => {
        copyLinkBtn.textContent = originalText;
        copyLinkBtn.disabled = false;
      }, 1800);
    } catch (err) {
      console.error('Copy failed:', err);
      copyLinkBtn.textContent = 'Copy failed';
    }
  });
}