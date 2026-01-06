import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://lonestarfauxscapes.com';
const POSTS_JSON = './content/posts.json';

function generateSitemap() {
  console.log('Generating sitemap...');

  // Get all HTML files in root (static pages)
  const staticHtmlFiles = fs
    .readdirSync('.')
    .filter(f => f.endsWith('.html') && !f.includes('backup'))
    // Not public pages (or should never be indexed)
    .filter(f => !['roadmap.html', 'navbar-component.html', 'navbar-universal.html', '404.html'].includes(f));

  // Get blog posts if they exist
  let blogPosts = [];
  if (fs.existsSync(POSTS_JSON)) {
    try {
      blogPosts = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf-8'));
    } catch (e) {
      console.log('No blog posts found');
    }
  }

  const isoDateOnly = date => date.toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
`;

  // Add static pages
  for (const file of staticHtmlFiles) {
    const url = file === 'index.html' ? `${SITE_URL}/` : `${SITE_URL}/${file}`;
    const pageKey = file.replace('.html', '');
    const priority = pageKey === 'index' ? '1.0' : pageKey === 'products' ? '0.9' : '0.8';
    const lastmod = isoDateOnly(fs.statSync(path.resolve(file)).mtime);
    sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  }

  // Add blog posts
  if (blogPosts.length > 0) {
    sitemap += `
  <!-- Blog Posts -->
`;
    for (const post of blogPosts) {
      const postDate = new Date(post.date).toISOString().split('T')[0];
      sitemap += `  <url>
    <loc>${SITE_URL}/blog/${post.slug}.html</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }
  }

  sitemap += `</urlset>`;

  // Write sitemap
  fs.writeFileSync('./sitemap.xml', sitemap);
  console.log('  Generated: sitemap.xml');

  // Generate robots.txt
  const robots = `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/
Disallow: /hedge-quote

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync('./robots.txt', robots);
  console.log('  Generated: robots.txt');

  console.log('Sitemap generation complete!');
}

generateSitemap();
