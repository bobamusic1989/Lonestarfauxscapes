/**
 * Batch Accessibility Fixes Script
 * Applies accessibility fixes to all HTML files:
 * 1. Adds skip link after <body> tag
 * 2. Adds id="main-content" to first section after navbar
 * 3. Adds focus-visible CSS to navbar styles
 * 4. Adds focus-within CSS for dropdowns
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

// Get all HTML files in root directory (not subdirectories like admin/, blog/)
const htmlFiles = fs.readdirSync(ROOT_DIR)
  .filter(f => f.endsWith('.html') && !f.startsWith('navbar-') && f !== '404.html');

console.log(`Found ${htmlFiles.length} HTML files to process\n`);

let modified = 0;
let skipped = 0;

for (const file of htmlFiles) {
  const filePath = path.join(ROOT_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let changes = [];

  // 1. Add skip link after <body> if not present
  if (!html.includes('skip-link')) {
    // Find <body> tag (with or without attributes)
    const bodyMatch = html.match(/<body[^>]*>/);
    if (bodyMatch) {
      const skipLink = `\n<a href="#main-content" class="skip-link">Skip to main content</a>`;
      html = html.replace(bodyMatch[0], bodyMatch[0] + skipLink);
      changes.push('skip-link');
    }
  }

  // 2. Add id="main-content" to first section/main after navbar if not present
  if (!html.includes('id="main-content"')) {
    // Look for first <section after the navbar (usually has id like "hero", "products", etc.)
    // Find the closing </header> or end of navbar, then the next <section
    const sectionPatterns = [
      /<section\s+id="hero"/,
      /<section\s+id="products"/,
      /<section\s+class="hero"/,
      /<main[^>]*>/,
      /<section[^>]*>/
    ];

    for (const pattern of sectionPatterns) {
      const match = html.match(pattern);
      if (match) {
        // Check if this section already has an id
        if (match[0].includes('id=')) {
          // Add main-content as additional identifier
          const newTag = match[0].replace(/id="([^"]+)"/, 'id="$1" ');
          // Actually, let's just add tabindex and keep the existing id
          // Better: wrap with a div or add role
          // Simpler: just add tabindex="-1" to make it focusable
          if (!html.includes('id="main-content"')) {
            // Insert a hidden anchor target before the section
            html = html.replace(match[0], `<div id="main-content" tabindex="-1" style="outline:none;"></div>\n    ${match[0]}`);
            changes.push('main-content');
          }
        } else {
          // No id, add main-content
          const newTag = match[0].replace(/(<(?:section|main))/, '$1 id="main-content"');
          html = html.replace(match[0], newTag);
          changes.push('main-content');
        }
        break;
      }
    }
  }

  // 3. Add focus-visible CSS if navbar style block exists and doesn't have it
  if (html.includes('#lsfs-header') && !html.includes('#lsfs-header a:focus-visible')) {
    // Find the navbar hover rule and add focus-visible after it
    // Look for .lsfs-link:hover { color: ... }
    const hoverPattern = /\.lsfs-link:hover\s*\{[^}]*color:\s*#[0-9a-fA-F]+[^}]*\}/;
    const hoverMatch = html.match(hoverPattern);
    if (hoverMatch) {
      const focusCSS = `

/* Focus visible styles for keyboard accessibility */
#lsfs-header a:focus-visible,
#lsfs-header button:focus-visible,
#lsfs-mobile-menu a:focus-visible,
#lsfs-mobile-menu button:focus-visible {
  outline: 2px solid #4caf50 !important;
  outline-offset: 2px !important;
}`;
      html = html.replace(hoverMatch[0], hoverMatch[0] + focusCSS);
      changes.push('focus-visible');
    }
  }

  // 4. Add focus-within CSS for dropdowns if not present
  if (html.includes('.lsfs-dropdown:hover .lsfs-dropdown-menu') &&
      !html.includes('.lsfs-dropdown:focus-within .lsfs-dropdown-menu')) {
    // Match the dropdown hover rule
    const dropdownPattern = /\.lsfs-dropdown:hover\s+\.lsfs-dropdown-menu\s*\{[^}]+\}/;
    const dropdownMatch = html.match(dropdownPattern);
    if (dropdownMatch) {
      const focusWithinCSS = `
.lsfs-dropdown:focus-within .lsfs-dropdown-menu { opacity: 1 !important; visibility: visible !important; transform: translateX(-50%) translateY(0) !important; }`;
      html = html.replace(dropdownMatch[0], dropdownMatch[0] + focusWithinCSS);
      changes.push('focus-within');
    }
  }

  // Save if changes were made
  if (changes.length > 0) {
    fs.writeFileSync(filePath, html);
    console.log(`  ${file}: ${changes.join(', ')}`);
    modified++;
  } else {
    skipped++;
  }
}

console.log(`\nDone! Modified: ${modified}, Skipped: ${skipped}`);
