import fs from 'fs';
import path from 'path';

const DIST_DIR = './dist';

// Files to copy to dist after vite build
const filesToCopy = [
  { src: './sitemap.xml', dest: 'sitemap.xml' },
  { src: './robots.txt', dest: 'robots.txt' },
  { src: './admin/config.yml', dest: 'admin/config.yml' },
  // JavaScript files (not bundled due to missing type="module")
  { src: './index.js', dest: 'index.js' },
  { src: './nav.js', dest: 'nav.js' },
  { src: './reveal.js', dest: 'reveal.js' },
  { src: './magnetic.js', dest: 'magnetic.js' },
  { src: './split-text.js', dest: 'split-text.js' },
  { src: './card-effects.js', dest: 'card-effects.js' },
  { src: './reactive-effects.js', dest: 'reactive-effects.js' },
];

console.log('Running post-build tasks...');

for (const file of filesToCopy) {
  if (fs.existsSync(file.src)) {
    const destPath = path.join(DIST_DIR, file.dest);
    const destDir = path.dirname(destPath);

    // Ensure destination directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(file.src, destPath);
    console.log(`  Copied: ${file.src} -> ${destPath}`);
  } else {
    console.log(`  Skipped (not found): ${file.src}`);
  }
}

console.log('Post-build complete!');
