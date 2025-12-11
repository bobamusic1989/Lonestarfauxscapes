(function() {
  'use strict';

  // Wait for utils to be available
  const utils = window.LonestarUtils || {
    throttleRAF: (fn) => fn,
    isMobile: () => window.innerWidth < 768,
    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // Respect reduced motion preference
  if (utils.prefersReducedMotion()) return;

  // Skip heavy effects on mobile
  const isMobile = utils.isMobile();

  // ===== 1. CURSOR-REACTIVE SPOTLIGHT & TILT =====
  const initCardEffects = () => {
    // Skip on mobile - these effects don't work well with touch
    if (isMobile) return;

    const cards = document.querySelectorAll('.card, .system-card-enhanced, .project-card, .spec-card, .process-card, .flip-card-grid');

    cards.forEach(card => {
      // Add spotlight overlay
      if (!card.querySelector('.card-spotlight')) {
        const spotlight = document.createElement('div');
        spotlight.className = 'card-spotlight';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(spotlight);
      }

      // Throttled mousemove handler
      const handleMouseMove = utils.throttleRAF((e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Spotlight position
        card.style.setProperty('--spot-x', `${x}px`);
        card.style.setProperty('--spot-y', `${y}px`);

        // 3D tilt effect
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener('mousemove', handleMouseMove, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  };

  // ===== 2. MAGNETIC BUTTONS =====
  const initMagneticButtons = () => {
    // Skip on mobile
    if (isMobile) return;

    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta');

    buttons.forEach(btn => {
      const handleMouseMove = utils.throttleRAF((e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Subtle magnetic pull (max 4px)
        const moveX = x * 0.15;
        const moveY = y * 0.15;

        btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
      });

      btn.addEventListener('mousemove', handleMouseMove, { passive: true });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0) scale(1)';
      });
    });
  };

  // ===== 3. SCROLL PARALLAX LAYERS =====
  const initParallax = () => {
    // Skip on mobile for performance
    if (isMobile) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const eyebrow = hero.querySelector('.eyebrow');
    const h1 = hero.querySelector('h1');
    const lede = hero.querySelector('.lede');
    const specCard = hero.querySelector('.spec-card');

    // Throttled scroll handler
    const handleScroll = utils.throttleRAF(() => {
      const scrollY = window.scrollY;
      const rate = 0.3;

      if (eyebrow) eyebrow.style.transform = `translateY(${scrollY * rate * 0.3}px)`;
      if (h1) h1.style.transform = `translateY(${scrollY * rate * 0.5}px)`;
      if (lede) lede.style.transform = `translateY(${scrollY * rate * 0.4}px)`;
      if (specCard) specCard.style.transform = `translateY(${scrollY * rate * 0.2}px)`;
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
  };

  // ===== 4. SCROLL PROGRESS INDICATOR =====
  const initScrollProgress = () => {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    document.body.appendChild(progress);

    // Throttled scroll handler
    const handleScroll = utils.throttleRAF(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      progress.style.width = `${scrollPercent}%`;
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
  };

  // ===== 5. BACKGROUND GRADIENT SHIFT ON SCROLL =====
  const initGradientShift = () => {
    // Skip on mobile
    if (isMobile) return;

    const body = document.body;

    // Throttled scroll handler
    const handleScroll = utils.throttleRAF(() => {
      const scrollY = window.scrollY;
      const maxScroll = 1000;
      const progress = Math.min(scrollY / maxScroll, 1);

      // Shift the accent glow position
      const glowX = 20 + (progress * 30);
      const glowY = 20 - (progress * 10);

      body.style.setProperty('--glow-x', `${glowX}%`);
      body.style.setProperty('--glow-y', `${glowY}%`);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
  };

  // ===== 6. SECTION REVEAL ON SCROLL =====
  const initSectionReveal = () => {
    const sections = document.querySelectorAll('.section');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(section => observer.observe(section));
  };

  // ===== 7. ELEMENT GLOW ON CURSOR PROXIMITY =====
  const initProximityGlow = () => {
    // Skip on mobile - not applicable
    if (isMobile) return;

    const glowElements = document.querySelectorAll('h1, h2, .hero-metric-value');

    // Throttled mousemove handler
    const handleMouseMove = utils.throttleRAF((e) => {
      glowElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;

        const distance = Math.sqrt(
          Math.pow(e.clientX - elCenterX, 2) +
          Math.pow(e.clientY - elCenterY, 2)
        );

        const maxDistance = 300;
        const glowIntensity = Math.max(0, 1 - (distance / maxDistance));

        el.style.setProperty('--glow-intensity', glowIntensity);
      });
    });

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
  };

  // ===== INJECT STYLES =====
  const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      /* Spotlight overlay */
      .card-spotlight {
        position: absolute;
        inset: 0;
        background: radial-gradient(
          400px circle at var(--spot-x, 50%) var(--spot-y, 50%),
          rgba(0, 255, 136, 0.08),
          transparent 40%
        );
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 10;
      }
      .card:hover .card-spotlight,
      .system-card-enhanced:hover .card-spotlight,
      .project-card:hover .card-spotlight,
      .spec-card:hover .card-spotlight,
      .process-card:hover .card-spotlight {
        opacity: 1;
      }

      /* Card tilt transition */
      .card, .system-card-enhanced, .project-card, .spec-card, .process-card {
        transition: transform 0.15s ease-out, box-shadow 0.3s ease;
        will-change: transform;
      }

      /* Button magnetic effect */
      .btn-primary, .btn-secondary, .nav-cta {
        transition: transform 0.2s ease-out, box-shadow 0.3s ease, background 0.3s ease;
        will-change: transform;
      }

      /* Scroll progress bar */
      .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #00ff88, #7affb8);
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        z-index: 9999;
        width: 0;
        transition: width 0.1s ease-out;
      }

      /* Section reveal animation */
      .section {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
      }
      .section-visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* Proximity glow on headings */
      h1, h2, .hero-metric-value {
        --glow-intensity: 0;
        text-shadow: 0 0 calc(20px * var(--glow-intensity)) rgba(0, 255, 136, calc(0.6 * var(--glow-intensity)));
        transition: text-shadow 0.15s ease-out;
      }

      /* Parallax elements need smooth transitions */
      .eyebrow, .hero h1, .hero .lede, .spec-card {
        will-change: transform;
        transition: transform 0.1s ease-out;
      }
    `;
    document.head.appendChild(style);
  };

  // Initialize all effects
  const init = () => {
    injectStyles();
    initCardEffects();
    initMagneticButtons();
    initParallax();
    initScrollProgress();
    initGradientShift();
    initSectionReveal();
    initProximityGlow();
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
