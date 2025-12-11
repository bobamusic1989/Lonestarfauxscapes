/**
 * Magnetic Button Effect
 * Buttons subtly follow cursor on hover for a delightful interaction
 */
(function() {
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Skip on mobile - magnetic effect requires cursor
  if (window.innerWidth < 768) return;

  // Use shared throttle utility or fallback
  const throttleRAF = (window.LonestarUtils && window.LonestarUtils.throttleRAF) || ((fn) => {
    let ticking = false;
    return function(...args) {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
      }
    };
  });

  const magneticElements = document.querySelectorAll('.btn, .nav-cta, .arrow-cta span');

  magneticElements.forEach(el => {
    el.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    // Throttled mousemove handler
    const handleMouseMove = throttleRAF((e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Magnetic pull strength
      const strength = 0.3;

      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });

    el.addEventListener('mousemove', handleMouseMove, { passive: true });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
})();
