/**
 * AVIF Generation Script
 * Generates AVIF versions of source images (WebP/JPG already exist)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const SIZES = [400, 800, 1200];
const AVIF_QUALITY = 50;

const IMAGE_DIRS = ['hero', 'hedges', 'fence', 'commercial', 'living_walls', 'blog'];

async function generateAvif(inputPath, outputDir, baseName) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  for (const width of SIZES) {
    if (metadata.width && metadata.width < width) continue;

    const avifName = `${baseName}-${width}w.avif`;
    const avifPath = path.join(outputDir, avifName);

    // Skip if already exists
    if (fs.existsSync(avifPath)) {
      continue;
    }

    await sharp(inputPath)
      .resize(width, null, { withoutEnlargement: true, fit: 'inside' })
      .avif({ quality: AVIF_QUALITY })
      .toFile(avifPath);

    const stats = fs.statSync(avifPath);
    console.log(`    Created: ${avifName} (${(stats.size / 1024).toFixed(0)}KB)`);
  }
}

async function processDirectory(subdir) {
  const dir = path.join(IMAGES_DIR, subdir);
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(f => {
    // Only process original files (not already sized versions)
    return /\.(jpg|jpeg|png)$/i.test(f) && !/-\d+w\.(jpg|jpeg|png|webp|avif)$/i.test(f);
  });

  for (const file of files) {
    const inputPath = path.join(dir, file);
    const baseName = path.basename(file, path.extname(file));
    console.log(`  ${subdir}/${file}`);

    try {
      await generateAvif(inputPath, dir, baseName);
    } catch (err) {
      console.error(`    Error: ${err.message}`);
    }
  }
}

async function main() {
  console.log('Generating AVIF images...\n');

  for (const dir of IMAGE_DIRS) {
    console.log(`Processing: ${dir}/`);
    await processDirectory(dir);
  }

  console.log('\nDone!');
}

main().catch(console.error);
