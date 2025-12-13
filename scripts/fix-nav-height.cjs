const fs = require('fs');
const path = require('path');

// Get all HTML files
const rootDir = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir)
  .filter(f => f.endsWith('.html'))
  .map(f => path.join(rootDir, f));

// Also check blog subfolder
const blogDir = path.join(rootDir, 'blog');
if (fs.existsSync(blogDir)) {
  const blogFiles = fs.readdirSync(blogDir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(blogDir, f));
  htmlFiles.push(...blogFiles);
}

let updatedCount = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Fix #lsfs-nav - add explicit height
  content = content.replace(
    /#lsfs-nav\s*\{\s*display:\s*flex\s*!important;\s*align-items:\s*center\s*!important;\s*justify-content:\s*space-between\s*!important;\s*padding:\s*0\.6rem\s*1\.25rem\s*!important;/g,
    `#lsfs-nav {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  height: 52px !important;
  min-height: 52px !important;
  padding: 0 1.25rem !important;`
  );

  // 2. Fix scrolled nav - explicit smaller height
  content = content.replace(
    /#lsfs-header\.scrolled\s+#lsfs-nav\s*\{\s*padding:\s*0\.5rem\s*0\.5rem\s*!important;\s*\}/g,
    `#lsfs-header.scrolled #lsfs-nav {
  height: 44px !important;
  min-height: 44px !important;
  padding: 0 0.5rem !important;
}`
  );

  // 3. Fix .lsfs-link - add line-height: 1
  content = content.replace(
    /(\.lsfs-link\s*\{[^}]*white-space:\s*nowrap\s*!important;)/g,
    '$1\n  line-height: 1 !important;'
  );

  // 4. Fix mobile nav height
  content = content.replace(
    /@media\s*\(max-width:\s*991px\)\s*\{([^}]*#lsfs-nav\s*\{)\s*padding:\s*0\.75rem\s*1rem\s*!important;\s*\}/g,
    `@media (max-width: 991px) {
  $1
    height: 56px !important;
    min-height: 56px !important;
    padding: 0 1rem !important;
  }`
  );

  // 5. Fix mobile scrolled nav
  content = content.replace(
    /#lsfs-header\.scrolled\s+#lsfs-nav\s*\{\s*padding:\s*0\.75rem\s*1\.25rem\s*!important;\s*\}/g,
    `#lsfs-header.scrolled #lsfs-nav {
    height: 52px !important;
    min-height: 52px !important;
    padding: 0 1.25rem !important;
  }`
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated: ${path.basename(file)}`);
    updatedCount++;
  }
});

console.log(`\nTotal files updated: ${updatedCount}`);
