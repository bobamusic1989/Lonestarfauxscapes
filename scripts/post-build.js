import fs from 'fs';
import path from 'path';

const DIST_DIR = './dist';

// Files to copy to dist after vite build
const filesToCopy = [
  { src: './sitemap.xml', dest: 'sitemap.xml' },
  { src: './robots.txt', dest: 'robots.txt' },
  { src: './_headers', dest: '_headers' },
  { src: './admin/config.yml', dest: 'admin/config.yml' },
  // JavaScript files (not bundled due to missing type="module")
  { src: './utils.js', dest: 'utils.js' },
  { src: './index.js', dest: 'index.js' },
  { src: './nav.js', dest: 'nav.js' },
  { src: './reveal.js', dest: 'reveal.js' },
  { src: './magnetic.js', dest: 'magnetic.js' },
  { src: './split-text.js', dest: 'split-text.js' },
  { src: './card-effects.js', dest: 'card-effects.js' },
  { src: './reactive-effects.js', dest: 'reactive-effects.js' },
];

// Directories to copy recursively
const dirsToCopy = [
  { src: './images', dest: 'images' },
];

// Helper function to copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Running post-build tasks...');

// Copy individual files
for (const file of filesToCopy) {
  if (fs.existsSync(file.src)) {
    const destPath = path.join(DIST_DIR, file.dest);
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(file.src, destPath);
    console.log(`  Copied: ${file.src} -> ${destPath}`);
  } else {
    console.log(`  Skipped (not found): ${file.src}`);
  }
}

// Copy directories
for (const dir of dirsToCopy) {
  const destPath = path.join(DIST_DIR, dir.dest);
  if (fs.existsSync(dir.src)) {
    copyDirRecursive(dir.src, destPath);
    console.log(`  Copied directory: ${dir.src} -> ${destPath}`);
  } else {
    console.log(`  Skipped directory (not found): ${dir.src}`);
  }
}

console.log('Post-build complete!');
