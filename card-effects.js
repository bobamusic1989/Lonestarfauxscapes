/**
 * Card Spotlight/Tilt Effects
 * Cursor-tracking spotlight and subtle 3D tilt on cards
 * DESKTOP ONLY - transforms cause scroll jank on mobile
 *
 * PERFORMANCE FIX: Disabled - duplicates index.js live-card handling
 * and causes double event listeners on cards
 */
(function() {
  return; // Disabled for performance

  // Skip on mobile - transforms cause scroll jank
  const isMobile = window.innerWidth < 992 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return;

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

  const cards = document.querySelectorAll('.card, .live-card');

  cards.forEach(card => {
    // Throttled mousemove handler
    const handleMouseMove = throttleRAF((e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Subtle 3D tilt effect
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-8px)
      `;
    });

    card.addEventListener('mousemove', handleMouseMove, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();
