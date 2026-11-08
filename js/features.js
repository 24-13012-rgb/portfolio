/* ==========================================================
   Extra features:
   1. Keyboard hint that fades away
   2. Looping "demo" previews on the project cards
   3. Resume preview pop-up
   4. Contact form (works now via Gmail; sends directly once an endpoint is set)
   ========================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function activeId() {
    var a = document.querySelector('.slide.is-active');
    return a ? a.id : '';
  }

  /* ---------- 0. Case study switcher ---------- */
  (function () {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-case-tab]'));
    if (!tabs.length) return;
    function select(key, focus) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-case-tab') === key;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
        var panel = document.getElementById('case-' + t.getAttribute('data-case-tab'));
        if (panel) panel.hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t.getAttribute('data-case-tab')); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(tabs[n].getAttribute('data-case-tab'), true); }
      });
    });
    // "Read the case study" links on the project cards pick the right tab first
    document.querySelectorAll('[data-case]').forEach(function (a) {
      a.addEventListener('click', function () { select(a.getAttribute('data-case')); });
    });
  })();

  /* ---------- 1. Keyboard hint ---------- */
  (function () {
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var seen = false;
    try { seen = sessionStorage.getItem('hintSeen') === '1'; } catch (e) { /* ignore */ }
    if (!fine || seen) return;

    var hint = document.createElement('div');
    hint.className = 'key-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = '<kbd>←</kbd><kbd>→</kbd><span>to move between slides</span>';
    var timer;

    function hide() {
      clearTimeout(timer);
      hint.classList.remove('is-on');
      document.removeEventListener('slidechange', hide);
      setTimeout(function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 500);
      try { sessionStorage.setItem('hintSeen', '1'); } catch (e) { /* ignore */ }
    }

    setTimeout(function () {
      document.body.appendChild(hint);
      requestAnimationFrame(function () { hint.classList.add('is-on'); });
      timer = setTimeout(hide, 6500);
      document.addEventListener('slidechange', hide);
    }, 2200);
  })();

  /* ---------- 2. Looping previews on project cards ---------- */
  (function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.show-project[data-open-group]'));
    if (!cards.length) return;
    var built = false;
    var players = [];

    function thumbOf(src) {
      return src.replace('assets/projects/', 'assets/projects/thumbs/').replace(/\.jpg$/, '.webp');
    }

    function build() {
      if (built) return;
      built = true;
      cards.forEach(function (card, n) {
        var group = card.getAttribute('data-open-group');
        var base = card.querySelector('img');
        var baseSrc = base ? base.getAttribute('src') : '';
        var all = Array.prototype.slice.call(document.querySelectorAll('.project__slides [data-group="' + group + '"]'))
          .map(function (el) { return thumbOf(el.getAttribute('data-src')); })
          .filter(function (src) { return src !== baseSrc; });
        if (all.length < 1) return;
        var step = Math.max(1, Math.floor(all.length / 5));
        var picks = all.filter(function (_, i) { return i % step === 0; }).slice(0, 5);

        var frames = picks.map(function (src) {
          var img = document.createElement('img');
          img.className = 'demo-frame';
          img.alt = '';
          img.decoding = 'async';
          img.src = src;
          card.insertBefore(img, card.querySelector('.show-project__label'));
          return img;
        });
        var dots = document.createElement('span');
        dots.className = 'demo-dots';
        dots.setAttribute('aria-hidden', 'true');
        for (var d = 0; d <= frames.length; d++) dots.appendChild(document.createElement('i'));
        card.appendChild(dots);

        var p = { frames: frames, dots: dots.children, i: -1, paused: false, offset: n * 700 };
        card.addEventListener('mouseenter', function () { p.paused = true; });
        card.addEventListener('mouseleave', function () { p.paused = false; });
        card.addEventListener('focus', function () { p.paused = true; });
        card.addEventListener('blur', function () { p.paused = false; });
        players.push(p);
        mark(p);
      });
      if (!reduceMotion) setInterval(tick, 700);
    }

    function mark(p) {
      p.frames.forEach(function (f, k) { f.classList.toggle('is-on', k === p.i); });
      for (var k = 0; k < p.dots.length; k++) p.dots[k].classList.toggle('is-on', k === p.i + 1);
    }

    var clock = 0;
    function tick() {
      clock += 700;
      if (document.hidden || activeId() !== 'projects') return;
      players.forEach(function (p) {
        if (p.paused) return;
        if ((clock + p.offset) % 2100 !== 0) return;     // each card advances every ~2.1 s, staggered
        p.i = p.i + 1 >= p.frames.length ? -1 : p.i + 1;
        mark(p);
      });
    }

    document.addEventListener('slidechange', function (e) { if (e.detail.id === 'projects') build(); });
    if (activeId() === 'projects') build();
  })();

  /* ---------- 3. Resume preview ---------- */
  (function () {
    var btn = document.getElementById('resumePreviewBtn');
    var dlg = document.getElementById('resumeDialog');
    var obj = document.getElementById('resumeObj');
    var close = document.getElementById('resumeClose');
    if (!btn || !dlg || !obj) return;
    var url = 'assets/Melecio-Laurente-Resume.pdf';

    btn.addEventListener('click', function () {
      if (!obj.hasAttribute('data')) obj.setAttribute('data', url + '#view=FitH&toolbar=0');
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
    });
    function shut() { if (dlg.open) dlg.close(); }
    close.addEventListener('click', shut);
    dlg.addEventListener('close', function () { document.body.style.overflow = ''; });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) shut(); });
  })();

  /* ---------- 4. Contact form ---------- */
  (function () {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var status = document.getElementById('cfStatus');
    var submit = document.getElementById('cfSubmit');
    var label = submit.querySelector('.btn__label');
    var TO = '24-13012@lcctanauan.edu.ph';
    var fields = [form.elements.name, form.elements.email, form.elements.message];

    function say(text, kind) {
      status.textContent = text;
      status.className = 'contact-form__status' + (kind ? ' is-' + kind : '');
    }
    fields.forEach(function (f) {
      f.addEventListener('input', function () { f.removeAttribute('aria-invalid'); if (status.className.indexOf('is-error') > -1) say(''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements._gotcha.value) { say('Thanks!', 'ok'); return; }   // bots fill the hidden field

      var bad = fields.filter(function (f) { return !f.value.trim() || (f.type === 'email' && !f.checkValidity()); });
      fields.forEach(function (f) { if (bad.indexOf(f) > -1) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid'); });
      if (bad.length) {
        say('Please add your name, a valid email and a message.', 'error');
        bad[0].focus();
        return;
      }

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var endpoint = (form.getAttribute('data-endpoint') || '').trim();

      if (!endpoint) {
        // No form service connected yet: open Gmail with everything filled in
        var body = message + '\n\n— ' + name + ' (' + email + ')';
        var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(TO) +
          '&su=' + encodeURIComponent('Portfolio message from ' + name) + '&body=' + encodeURIComponent(body);
        window.open(gmail, '_blank', 'noopener');
        say('Opening Gmail with your message — press Send there.', 'ok');
        return;
      }

      submit.disabled = true;
      label.textContent = 'Sending…';
      say('');
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('bad status');
          form.reset();
          say('Thanks! Your message was sent.', 'ok');
        })
        .catch(function () { say('Sorry, that did not send. Please use the email button instead.', 'error'); })
        .then(function () { submit.disabled = false; label.textContent = 'Send message'; });
    });
  })();
})();
