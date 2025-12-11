/**
 * Shared utilities for performance optimization
 */
window.LonestarUtils = (function() {
  'use strict';

  // RAF-based throttle - fires at most once per animation frame
  const throttleRAF = (fn) => {
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
  };

  // Time-based throttle - fires at most once per `ms` milliseconds
  const throttle = (fn, ms) => {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= ms) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  };

  // Debounce - fires only after `ms` milliseconds of inactivity
  const debounce = (fn, ms) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  // Check if device is mobile (for disabling heavy effects)
  const isMobile = () => {
    return window.innerWidth < 768 ||
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Check if user prefers reduced motion
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  return {
    throttleRAF,
    throttle,
    debounce,
    isMobile,
    prefersReducedMotion
  };
})();
