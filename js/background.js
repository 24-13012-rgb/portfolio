/* ==========================================================
   Binary-field background  (original work for this portfolio)

   Idea: the page sits on a quiet field of tiny 0s and 1s.
   Move the mouse and the digits under it light up, flip and
   fade out behind you, leaving a glowing trail of "data".
   Click (or tap) to send a ripple across the field.

   - One <canvas> behind the page; only digits that are
     "hot" are redrawn each frame, so it stays light.
   - Colours follow light/dark mode through the --accent / --bg
     CSS variables.
   - Pauses when the tab is hidden. With reduced motion the
     field stays still and does not react.
   ========================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('bgFx');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var RADIUS = 120;          // how far the mouse lights up digits (px)
  var COOL = 1.6;            // how fast heat fades (per second)
  var BASE_ALPHA = 0.09;     // resting digits (very faint)

  var cell = 28, cols = 0, rows = 0, width = 0, height = 0, dpr = 1;
  var digits, heat;          // one entry per cell
  var colors = { accent: '#2B6E5D', bg: '#F7F7F5' };
  var ripples = [];
  var running = false, lastTime = 0, lastX = null, lastY = null;
  var baseLayer = null;

  function readColors() {
    var css = getComputedStyle(root);
    colors.accent = css.getPropertyValue('--accent').trim() || colors.accent;
    colors.bg = css.getPropertyValue('--bg').trim() || colors.bg;
  }

  function font() { return '500 ' + Math.round(cell * 0.5) + 'px ui-monospace, Menlo, Consolas, monospace'; }

  function drawDigit(c, i, alpha, color) {
    var x = (i % cols) * cell + cell / 2;
    var y = Math.floor(i / cols) * cell + cell / 2;
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.fillText(digits[i], x, y);
  }

  /* Pre-draw the resting field once */
  function drawBase() {
    baseLayer = document.createElement('canvas');
    baseLayer.width = canvas.width;
    baseLayer.height = canvas.height;
    var c = baseLayer.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.font = font();
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (var i = 0; i < digits.length; i++) drawDigit(c, i, BASE_ALPHA, colors.accent);
  }

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    cell = width < 720 ? 30 : 28;
    cols = Math.ceil(width / cell);
    rows = Math.ceil(height / cell);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    digits = new Array(cols * rows);
    heat = new Float32Array(cols * rows);
    for (var i = 0; i < digits.length; i++) digits[i] = Math.random() < 0.5 ? '0' : '1';
    readColors();
    drawBase();
    ripples = [];
    render();
  }

  /* Add heat to every cell within RADIUS of a point */
  function warm(x, y, strength) {
    var c0 = Math.max(0, Math.floor((x - RADIUS) / cell)), c1 = Math.min(cols - 1, Math.floor((x + RADIUS) / cell));
    var r0 = Math.max(0, Math.floor((y - RADIUS) / cell)), r1 = Math.min(rows - 1, Math.floor((y + RADIUS) / cell));
    for (var r = r0; r <= r1; r++) {
      for (var c = c0; c <= c1; c++) {
        var dx = c * cell + cell / 2 - x, dy = r * cell + cell / 2 - y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > RADIUS) continue;
        var i = r * cols + c;
        var add = (1 - d / RADIUS) * strength;
        if (add > heat[i]) {
          if (heat[i] < 0.15 && Math.random() < 0.6) digits[i] = digits[i] === '0' ? '1' : '0'; // flip as it lights
          heat[i] = Math.min(1, add);
        }
      }
    }
  }

  function moveTo(x, y) {
    if (reduceMotion) return;
    // Fill in the gap if the mouse moved fast, so the trail is continuous
    if (lastX !== null) {
      var dist = Math.hypot(x - lastX, y - lastY), steps = Math.ceil(dist / 24);
      for (var s = 1; s < steps; s++) warm(lastX + (x - lastX) * s / steps, lastY + (y - lastY) * s / steps, 0.9);
    }
    warm(x, y, 1);
    lastX = x; lastY = y;
    start();
  }

  function ripple(x, y) {
    if (reduceMotion) return;
    ripples.push({ x: x, y: y, r: 0 });
    start();
  }

  function update(dt) {
    var active = false, i;
    for (i = 0; i < heat.length; i++) {
      if (heat[i] > 0) {
        heat[i] = Math.max(0, heat[i] - COOL * dt);
        if (heat[i] > 0) active = true;
      }
    }
    for (var k = ripples.length - 1; k >= 0; k--) {
      var p = ripples[k];
      p.r += 520 * dt;
      // warm a thin ring of cells
      var cx0 = Math.max(0, Math.floor((p.x - p.r - cell) / cell)), cx1 = Math.min(cols - 1, Math.floor((p.x + p.r + cell) / cell));
      var ry0 = Math.max(0, Math.floor((p.y - p.r - cell) / cell)), ry1 = Math.min(rows - 1, Math.floor((p.y + p.r + cell) / cell));
      for (var r = ry0; r <= ry1; r++) for (var c = cx0; c <= cx1; c++) {
        var d = Math.hypot(c * cell + cell / 2 - p.x, r * cell + cell / 2 - p.y);
        if (Math.abs(d - p.r) < cell * 0.9) {
          var j = r * cols + c;
          if (heat[j] < 0.8) { digits[j] = Math.random() < 0.5 ? '0' : '1'; heat[j] = 0.85; }
        }
      }
      if (p.r > Math.hypot(width, height)) ripples.splice(k, 1); else active = true;
    }
    return active;
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseLayer, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = font();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < heat.length; i++) {
      var h = heat[i];
      if (h <= 0.01) continue;
      var x = (i % cols) * cell, y = Math.floor(i / cols) * cell;
      // erase the resting digit, then draw the lit one (may have flipped)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.fillRect(x, y, cell, cell);
      ctx.globalCompositeOperation = 'source-over';
      drawDigit(ctx, i, Math.min(1, BASE_ALPHA + h * 0.75), colors.accent);
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    var active = update(dt);
    render();
    if (active) requestAnimationFrame(frame); else running = false;   // sleeps when nothing is lit
  }

  function start() {
    if (running || reduceMotion || document.hidden) return;
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(frame);
  }

  /* ---------- Events ---------- */
  window.addEventListener('mousemove', function (e) { moveTo(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    var t = e.touches[0]; if (t) moveTo(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchend', function () { lastX = lastY = null; }, { passive: true });
  document.addEventListener('mouseleave', function () { lastX = lastY = null; });
  window.addEventListener('click', function (e) { ripple(e.clientX, e.clientY); });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 200);
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) running = false; });

  // Re-colour when the visitor switches light/dark mode
  new MutationObserver(function () { readColors(); drawBase(); render(); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  setup();
})();
