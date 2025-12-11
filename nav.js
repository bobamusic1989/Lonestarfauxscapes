(function () {
  const style = document.createElement('style');
  style.innerHTML = `
    header { transition: background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
    header.scrolled { background: rgba(5,10,7,0.92); box-shadow: 0 12px 30px rgba(0,0,0,0.35); border-bottom: 1px solid rgba(255,255,255,0.08); }
    .nav-item { transition: color 0.2s ease; }
    .nav-item::after { height: 2px; opacity: 0.6; transition: transform 0.2s ease, opacity 0.2s ease; }
    .nav-item:hover::after { opacity: 1; }
    .nav-item.active { color: #fff !important; }
    .nav-item.active::after { transform: scaleX(1); }
    .nav-item:focus-visible,
    .nav-dropdown-item:focus-visible,
    .nav-cta:focus-visible {
      outline: 2px solid rgba(76,175,80,0.8);
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(76,175,80,0.15);
      color: #fff;
    }
  `;
  document.head.appendChild(style);

  const header = document.querySelector('header');
  let lastScrolled = null;

  // Throttled scroll handler - only update when state actually changes
  const handleScroll = () => {
    if (!header) return;
    const isScrolled = window.scrollY > 80;

    // Only modify DOM if state changed
    if (lastScrolled !== isScrolled) {
      lastScrolled = isScrolled;
      if (isScrolled) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const setActive = () => {
    const path = (window.location.pathname.split('/').pop() || 'index.html') || 'index.html';
    navItems.forEach((item) => {
      const href = item.getAttribute('href') || '';
      const target = (href.split('#')[0] || href || '').replace(/^\.\//, '');
      const isIndex = path === '' || path === '/' || path === 'index.html';
      const match = target === '' || target === '#'
        ? isIndex
        : target === path;
      item.classList.toggle('active', match);
    });
  };
  setActive();
})();
