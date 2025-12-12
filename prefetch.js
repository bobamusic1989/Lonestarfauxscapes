/**
 * Speculative Link Prefetching
 * Prefetches pages on hover/focus for faster navigation
 * Kill switch: window.LSFS_DISABLE_PREFETCH = true
 */
(function() {
  'use strict';

  // Kill switch
  if (window.LSFS_DISABLE_PREFETCH) return;

  // Respect data saver mode
  if (navigator.connection?.saveData) return;

  // Respect slow connections
  if (navigator.connection?.effectiveType === '2g' ||
      navigator.connection?.effectiveType === 'slow-2g') return;

  const prefetched = new Set();
  const HOVER_DELAY = 65; // ms before prefetch triggers

  const prefetch = (href) => {
    if (prefetched.has(href)) return;
    if (href === location.href) return; // Don't prefetch current page

    prefetched.add(href);

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = 'document';
    document.head.appendChild(link);
  };

  // Hover-triggered prefetch
  let hoverTimeout = null;

  document.addEventListener('mouseenter', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    // Only same-origin links
    try {
      const url = new URL(anchor.href, location.origin);
      if (url.origin !== location.origin) return;

      // Skip anchors, javascript:, mailto:, tel:
      if (anchor.href.startsWith('#') ||
          anchor.href.startsWith('javascript:') ||
          anchor.href.startsWith('mailto:') ||
          anchor.href.startsWith('tel:')) return;

      hoverTimeout = setTimeout(() => prefetch(anchor.href), HOVER_DELAY);
    } catch (e) {
      // Invalid URL, skip
    }
  }, { capture: true, passive: true });

  document.addEventListener('mouseleave', (e) => {
    if (e.target.closest('a') && hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
  }, { capture: true, passive: true });

  // Focus-triggered prefetch (keyboard navigation)
  document.addEventListener('focusin', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    try {
      const url = new URL(anchor.href, location.origin);
      if (url.origin !== location.origin) return;
      prefetch(anchor.href);
    } catch (e) {
      // Invalid URL, skip
    }
  }, { passive: true });
})();
