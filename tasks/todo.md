# Fix Total Blocking Time (TBT) - 16,020ms Issue

## Problem Analysis

**Key Finding**: This is a vanilla JavaScript static HTML site, NOT React/Next.js. The original analysis assumed React hydration patterns that don't apply.

### Real TBT Culprits Identified:

1. **Three.js WebGL (CRITICAL)** - `index.js` creates 2000 instanced planes with custom shaders, loads immediately because `#canvas-container` is in the hero section
2. **GSAP + ScrollTrigger (HIGH)** - Loads via `requestIdleCallback` but still fires within ~100ms
3. **Blur filter (MEDIUM)** - `filter: blur(8px)` on desktop reveal animations in `enhancements.css`

### NOT Problems (contrary to original analysis):
- FAQ uses native `<details>` elements (no JS overhead)
- Calculator is ~20 lines of vanilla JS
- Texas map is a static inline SVG

---

## Implementation Plan

### User-Approved Fixes:
- [x] Three.js: Load only on scroll (deferred until user scrolls near canvas)
- [x] GSAP: Delay loading by 3 seconds
- [x] Blur filter: Replace with simple opacity fade

---

## Todo Items

- [x] **1. Defer Three.js WebGL until scroll**
  - Replaced IntersectionObserver with scroll event listener
  - Three.js only loads after user's first scroll
  - Also added `isMobile()` check to skip entirely on mobile
  - File: `index.js` (lines 599-618)

- [x] **2. Delay GSAP loading to 3 seconds**
  - Wrapped `initAnimations()` and `initTexasMap()` in `setTimeout(..., 3000)`
  - File: `index.js` (lines 624-626)

- [x] **3. Replace blur filter with opacity fade**
  - Replaced `filter: blur(8px)` with `opacity: 0; transform: translateY(10px)`
  - Added smooth transitions for the reveal effect
  - File: `enhancements.css` (lines 232-245)

- [ ] **4. Test and verify TBT improvement**
  - Run Lighthouse audit
  - Document before/after scores

---

## Review Section

### Changes Made

| Fix | File | Lines Changed | Description |
|-----|------|---------------|-------------|
| 1 | `index.js` | 599-618 | Three.js loads on first scroll instead of immediately |
| 2 | `index.js` | 624-626 | GSAP delayed by 3 seconds |
| 3 | `enhancements.css` | 232-245 | Blur replaced with opacity+transform |

### Expected Impact

1. **Three.js Deferral**: Should eliminate ~8-10 seconds of main thread blocking during initial load (2000 instanced planes + shader compilation)

2. **GSAP Delay**: Moves ~500ms of GSAP initialization out of the critical rendering path

3. **Blur Removal**: Eliminates GPU-blocking `filter` operations that cause layout thrashing

### Notes

- Visual appearance preserved - opacity+transform fade looks similar to blur-to-sharp
- Mobile users unaffected (Three.js already skipped on mobile, GSAP already skipped)
- No breaking changes to functionality

### Next Steps

- Deploy to staging and run Lighthouse
- Compare TBT before/after
- If still high, consider further optimizations like:
  - Reducing Three.js instance count (2000 → 1000)
  - Using `will-change` hints strategically
  - Lazy loading GSAP library itself (not just delaying init)

---

# Image Optimization - AVIF with WebP Fallback

## Problem

Lighthouse flagged ~1,277 KiB potential savings from images:
- fence-1.jpg (405KB → 397KB savings)
- commercial-2-1200w.jpg (275KB → 269KB savings)
- hedge-banner-1200w.jpg (273KB → 267KB savings)
- hero-main-1200w.jpg (408KB → 256KB savings)
- living-wall-1-800w.jpg (94KB → 87KB savings)

## Solution

Implemented AVIF format with WebP fallback using `<picture>` elements.

### Changes Made

| Fix | File | Description |
|-----|------|-------------|
| 1 | `scripts/optimize-images.cjs` | New script to generate AVIF from source images using Sharp |
| 2 | `index.html` | Added AVIF `<source>` to all `<picture>` elements |
| 3 | `index.html` | Wrapped fence-1.jpg in `<picture>` with AVIF/WebP/JPG |

### AVIF Files Generated

70 AVIF files created across all image directories:
- `images/hero/` - hero-main variants
- `images/hedges/` - hedge-banner, hedge-privacy variants
- `images/fence/` - fence-1, fence-2, fence-3 variants
- `images/commercial/` - commercial-1, commercial-2, commercial-3 variants
- `images/living_walls/` - living-wall-1, living-wall-2, living-wall-3 variants
- `images/blog/` - all blog images

### Expected Savings

AVIF compression results (vs original JPG):
- hero-main: 68-92% smaller
- hedge-banner: 73-89% smaller
- commercial-2: 75-98% smaller
- living-wall-1: 55-70% smaller
- fence-1: 32-55% smaller

### Browser Support

AVIF: Chrome 85+, Firefox 93+, Safari 16.4+
WebP fallback: All modern browsers
JPG fallback: Universal

---

# Lighthouse Accessibility & SEO Fixes (2026-01-06)

## Goal

Fix Lighthouse scores to achieve:
- **Performance**: 90+ ✅ (achieved 99)
- **Accessibility**: 100 (from 94)
- **SEO**: 100 (from 92)

## Completed Fixes

### Phase 1: Accessibility Fixes (Batch Applied)

| Fix | File(s) | Description |
|-----|---------|-------------|
| 1 | `shared.css` | Added `.skip-link` and `.footer-link` CSS classes |
| 2 | `scripts/fix-accessibility.cjs` | Created batch script for 35+ HTML files |
| 3 | All HTML files | Added skip navigation link after `<body>` |
| 4 | All HTML files | Added `id="main-content"` to first section |
| 5 | All HTML files | Added `focus-visible` CSS for keyboard navigation |
| 6 | All HTML files | Added `focus-within` CSS for dropdown menus |

### Phase 2: Index.html Specific Fixes

| Fix | Lines | Description |
|-----|-------|-------------|
| 1 | 2391-2398, 2545-2552 | Added `aria-hidden="true"` to decorative "/" separators |
| 2 | 2868-2877 | Replaced inline `onmouseover/onmouseout` with `.footer-link` class |
| 3 | 2863 | Added `aria-hidden="true"` to decorative `.footer-big-text` watermark |
| 4 | 2514-2523 | Changed stat `<h4>` elements to `<div class="stat-value">` (heading order fix) |
| 5 | 2443, 2461, 2479, 2497 | Made "Learn more" links descriptive (e.g., "Learn more about Living Walls") |

### Phase 3: SEO Fixes

| Fix | File | Description |
|-----|------|-------------|
| 1 | `residential.html` | Added `og:image` and `twitter:card` meta tags |
| 2 | `gallery.html` | Added `twitter:card` meta tags |
| 3 | `scripts/generate-sitemap.js` | Excluded `navbar-universal.html` from sitemap |

## Expected Final Scores (After Deployment)

| Metric | Before | After |
|--------|--------|-------|
| Performance | 99 | 99 |
| Accessibility | 94 | 100 |
| SEO | 92 | 100 |
| Best Practices | 100 | 100 |

## Issues Resolved

1. **Color contrast**: Decorative watermark now `aria-hidden`
2. **Heading order**: Stat `<h4>`s changed to non-heading `<div>`s
3. **Link text**: "Learn more" buttons now include product name
4. **Focus outlines**: Keyboard navigation now visible
5. **Skip navigation**: Users can skip to main content
6. **Missing meta tags**: Social sharing images now specified

## Notes

- All changes are additive and non-destructive
- No existing functionality removed
- Mobile experience preserved
- Deploy to Cloudflare Pages to see updated scores

