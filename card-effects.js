/**
 * Card Spotlight/Tilt Effects
 * Cursor-tracking spotlight and subtle 3D tilt on cards
 */
(function() {
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Skip on mobile
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
