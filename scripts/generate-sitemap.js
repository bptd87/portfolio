const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://brandonptdavis.com';
const PROJECT_ID = 'zuycsuajiuqsvopiioer';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM';

// Initialize Supabase
const supabase = createClient(`https://${PROJECT_ID}.supabase.co`, ANON_KEY);

// Paths
const BLOG_DATA_PATH = path.join(__dirname, '../src/data/blog-posts.ts');
const TUTORIAL_DATA_PATH = path.join(__dirname, '../src/data/tutorials.ts');
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// Static Routes
const STATIC_ROUTES = [
  '',
  '/portfolio',
  '/about',
  '/cv',
  '/collaborators',
  '/teaching-philosophy',
  '/contact',
  '/scenic-insights',
  '/studio',
  '/scenic-studio',
  '/app-studio',
  '/news',
  '/architecture-scale-converter',
  '/dimension-reference',
  '/model-reference-scaler',
  '/design-history-timeline',
  '/classical-architecture-guide',
  '/rosco-paint-calculator',
  '/commercial-paint-finder'
];

async function generateSitemap() {
  console.log('🗺️  Generating Sitemap...');
  const urls = [];

  // 1. Add Static Routes
  console.log(`   Adding ${STATIC_ROUTES.length} static routes...`);
  STATIC_ROUTES.forEach(route => {
    urls.push({
      loc: `${SITE_URL}${route}`,
      changefreq: 'weekly',
      priority: route === '' ? 1.0 : 0.8
    });
  });

  // 2. Add Projects (from Supabase Edge Function)
  console.log('   Fetching projects from Supabase API...');
  try {
    const response = await fetch(
      `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-74296234/api/projects`,
      {
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.projects) {
      console.log(`   Found ${data.projects.length} projects.`);
      data.projects.forEach(project => {
        urls.push({
          loc: `${SITE_URL}/project/${project.slug}`,
          lastmod: project.updated_at ? new Date(project.updated_at).toISOString() : new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.7
        });
      });
    } else {
      console.error('   ❌ API returned success=false or no projects');
    }
  } catch (err) {
    console.error('   ❌ Error fetching projects:', err.message);
  }

  // 3. Add Blog Posts (from local file)
  console.log('   Parsing blog posts from local file...');
  try {
    const blogContent = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
    const blogMatches = [...blogContent.matchAll(/id:\s*'([^']+)'/g)];
    console.log(`   Found ${blogMatches.length} blog posts.`);
    
    blogMatches.forEach(match => {
      const slug = match[1];
      urls.push({
        loc: `${SITE_URL}/scenic-insights/${slug}`,
        changefreq: 'monthly',
        priority: 0.6
      });
    });
  } catch (err) {
    console.error('   ❌ Error reading blog posts:', err.message);
  }

  // 4. Add Tutorials (from local file)
  console.log('   Parsing tutorials from local file...');
  try {
    const tutorialContent = fs.readFileSync(TUTORIAL_DATA_PATH, 'utf8');
    const tutorialMatches = [...tutorialContent.matchAll(/slug:\s*'([^']+)'/g)];
    console.log(`   Found ${tutorialMatches.length} tutorials.`);

    tutorialMatches.forEach(match => {
      const slug = match[1];
      urls.push({
        loc: `${SITE_URL}/scenic-studio/${slug}`,
        changefreq: 'monthly',
        priority: 0.6
      });
    });
  } catch (err) {
    console.error('   ❌ Error reading tutorials:', err.message);
  }

  // 5. Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // 6. Write File
  fs.writeFileSync(OUTPUT_PATH, xml);
  console.log(`✅ Sitemap generated at ${OUTPUT_PATH} with ${urls.length} URLs.`);
}

generateSitemap().catch(console.error);
