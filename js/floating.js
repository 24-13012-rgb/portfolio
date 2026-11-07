/* ==========================================================
   Floating "stack" layer  (original work for this portfolio)

   Idea: small tags from the things I actually build with
   (PHP, MySQL, ping, C++, tickets, sales...) drift slowly behind
   the page, like parts floating around a workbench.
   - They sit at different depths: scrolling and moving the
     mouse shifts the near ones more than the far ones (parallax).
   - They fade in and out softly and never block anything.
   - Colours follow light/dark mode. Pauses when the tab is
     hidden. With reduced motion they stay still.
   ========================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('bgFloat');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TAGS = [
    '<?php echo $sale; ?>', 'SELECT * FROM books;', 'ping 192.168.1.1', 'int main() {}',
    'INSERT INTO tickets', 'public static void', '{ stock: 24 }', 'git push origin main',
    '<div class="card">', 'JOIN patrons ON id', 'for (i = 0; i < n; i++)', 'POST /checkout',
    '404 → fixed', 'overdue: 0', 'VLAN 10', 'try { } catch', 'UPDATE stock SET', '#ticket-0142'
  ];

  var width = 0, height = 0, dpr = 1, items = [];
  var accent = '#2B6E5D';
  var pointerX = 0.5, pointerY = 0.5;   // 0..1 across the window
  var smoothX = 0.5, smoothY = 0.5;
  var scrollY = window.scrollY || 0;
  var running = false, last = 0, clock = 0;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function build() {
    var rand = rng(13012);
    var count = width < 720 ? 7 : 15;
    items = [];
    for (var i = 0; i < count; i++) {
      var depth = 0.25 + rand() * 0.75;                 // 1 = near, 0.25 = far
      items.push({
        text: TAGS[i % TAGS.length],
        x: rand(),
        y: rand(),
        depth: depth,
        size: 10 + depth * 4,
        drift: 5 + rand() * 9,                          // px per second, upward
        sway: 10 + rand() * 18,                         // side-to-side amount
        phase: rand() * Math.PI * 2,
        pill: rand() < 0.5
      });
    }
  }

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    accent = getComputedStyle(root).getPropertyValue('--accent').trim() || accent;
    build();
    draw();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.textBaseline = 'middle';
    var span = height + 160;

    items.forEach(function (it) {
      // vertical position: base + slow upward drift + scroll parallax, wrapped around
      var y = it.y * span - clock * it.drift - scrollY * it.depth * 0.35;
      y = ((y % span) + span) % span - 80;
      var x = it.x * width + Math.sin(clock * 0.25 + it.phase) * it.sway + (smoothX - 0.5) * 60 * it.depth;
      y += (smoothY - 0.5) * 40 * it.depth;

      // fade near the top/bottom edges so they never "pop"
      var edge = Math.min(y + 80, height + 80 - y) / 120;
      var twinkle = 0.75 + 0.25 * Math.sin(clock * 0.6 + it.phase);
      var alpha = Math.max(0, Math.min(1, edge)) * twinkle * (0.09 + it.depth * 0.1);
      if (alpha <= 0.005) return;

      ctx.font = '500 ' + it.size + 'px ui-monospace, Menlo, Consolas, monospace';
      var w = ctx.measureText(it.text).width;
      var px = Math.min(Math.max(x, 8), width - w - 24);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = accent;
      ctx.fillStyle = accent;
      if (it.pill) {
        ctx.lineWidth = 1;
        roundRect(px - 8, y - it.size * 0.85, w + 16, it.size * 1.7, it.size);
        ctx.stroke();
      }
      ctx.fillText(it.text, px, y);
    });
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    if (!running) return;
    if (now - last < 32) { requestAnimationFrame(frame); return; }   // ~30 fps is plenty for slow drift
    var dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    clock += dt;
    smoothX += (pointerX - smoothX) * Math.min(1, dt * 3);   // ease toward the pointer
    smoothY += (pointerY - smoothY) * Math.min(1, dt * 3);
    draw();
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion || document.hidden) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  window.addEventListener('mousemove', function (e) {
    pointerX = e.clientX / width; pointerY = e.clientY / height;
  }, { passive: true });
  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
    if (reduceMotion) draw();
  }, { passive: true });

  var timer;
  window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(setup, 200); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) running = false; else start(); });
  new MutationObserver(function () {
    accent = getComputedStyle(root).getPropertyValue('--accent').trim() || accent; draw();
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  setup();
  start();
})();
