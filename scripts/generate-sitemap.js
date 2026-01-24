import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baseUrl = 'https://www.brandonptdavis.com';
const supabaseUrl = 'https://jqhqcwjfxnwqjdqvvbhf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaHFjd2pmeG53cWpkcXZ2YmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MzM5MTYsImV4cCI6MjA0NzEwOTkxNn0.ioOBJMVOCVqkbVSLNlWRuDPBiWUVJdnUjCXEbJSJCxE';

// Static routes
const staticRoutes = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/portfolio', priority: '0.9', changefreq: 'weekly' },
  { path: '/articles', priority: '0.9', changefreq: 'daily' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/cv', priority: '0.7', changefreq: 'monthly' },
  { path: '/creative-statement', priority: '0.7', changefreq: 'monthly' },
  { path: '/teaching-philosophy', priority: '0.7', changefreq: 'monthly' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' },
  { path: '/resources', priority: '0.8', changefreq: 'weekly' },
  { path: '/scenic-studio', priority: '0.7', changefreq: 'weekly' },
  { path: '/scenic-vault', priority: '0.7', changefreq: 'weekly' },
];

// Fetch data using native fetch
async function fetchFromSupabase(table, selectFields) {
  try {
    const url = `${supabaseUrl}/rest/v1/${table}?select=${selectFields}&published=eq.true&order=created_at.desc`;
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${table}:`, error.message);
    return [];
  }
}

// Generate sitemap XML
async function generateSitemap() {
  const currentDate = new Date().toISOString();
  
  console.log('🔍 Fetching dynamic content from Supabase...');
  
  // Fetch published projects and articles
  const [projects, articles] = await Promise.all([
    fetchFromSupabase('portfolio_projects', 'slug,updated_at,created_at'),
    fetchFromSupabase('articles', 'slug,updated_at,published_at')
  ]);
  
  console.log(`✅ Found ${projects.length} projects`);
  console.log(`✅ Found ${articles.length} articles`);
  
  // Generate static route URLs
  const staticUrls = staticRoutes.map(route => `
  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('');
  
  // Generate project URLs
  const projectUrls = projects.map(project => `
  <url>
    <loc>${baseUrl}/project/${project.slug}</loc>
    <lastmod>${project.updated_at || project.created_at || currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
  
  // Generate article URLs
  const articleUrls = articles.map(article => `
  <url>
    <loc>${baseUrl}/articles/${article.slug}</loc>
    <lastmod>${article.updated_at || article.published_at || currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}${projectUrls}${articleUrls}
</urlset>`;

  // Write to public directory
  const publicDir = join(__dirname, '..', 'public');
  writeFileSync(join(publicDir, 'sitemap.xml'), sitemap);
  
  const totalUrls = staticRoutes.length + projects.length + articles.length;
  console.log(`✅ Sitemap generated successfully with ${totalUrls} URLs`);
  console.log(`   - ${staticRoutes.length} static pages`);
  console.log(`   - ${projects.length} projects`);
  console.log(`   - ${articles.length} articles`);
}

generateSitemap().catch(error => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});


