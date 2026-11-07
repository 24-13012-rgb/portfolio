/* Background shapes follow the mouse a little (far ones move less than near ones). */
(function () {
  'use strict';
  var far = document.querySelector('.bg-shapes__layer--far');
  var near = document.querySelector('.bg-shapes__layer--near');
  if (!far || !near) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var tx = 0, ty = 0, cx = 0, cy = 0, running = false;

  window.addEventListener('mousemove', function (e) {
    tx = e.clientX / window.innerWidth - 0.5;
    ty = e.clientY / window.innerHeight - 0.5;
    if (!running) { running = true; requestAnimationFrame(step); }
  }, { passive: true });

  function step() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    far.style.transform = 'translate(' + (-cx * 18).toFixed(1) + 'px, ' + (-cy * 18).toFixed(1) + 'px)';
    near.style.transform = 'translate(' + (-cx * 48).toFixed(1) + 'px, ' + (-cy * 48).toFixed(1) + 'px)';
    if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(step);
    else running = false;
  }
})();
