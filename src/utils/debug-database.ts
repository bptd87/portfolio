/**
 * Database Debug Utilities
 * 
 * Import these in the browser console to check your database:
 * 
 * const db = await import('./utils/debug-database.ts');
 * await db.checkArticles();
 * await db.checkProjects();
 * await db.checkNews();
 * await db.checkAll();
 */

import { getByPrefixFromKV, getFromKV } from './supabase/client';

/**
 * Check all articles in the database
 */
export async function checkArticles() {
  console.log('📚 Checking articles...');
  const articles = await getByPrefixFromKV('blog_post:');
  
  console.log(`\n📊 Found ${articles.length} articles:\n`);
  
  if (articles.length === 0) {
    console.log('⚠️ No articles found. Run DataSync in admin panel to import articles.');
    return [];
  }
  
  const summary = articles.map((article: any) => ({
    slug: article.slug || article.id,
    title: article.title,
    category: article.category,
    hasContent: article.content && article.content.length > 0,
    blockCount: article.content?.length || 0,
    hasCoverImage: !!article.coverImage,
    tags: article.tags?.length || 0,
    date: article.date,
  }));
  
  console.table(summary);
  
  // Show detailed info for articles with content
  const withContent = articles.filter((a: any) => a.content && a.content.length > 0);
  if (withContent.length > 0) {
    console.log(`\n✅ ${withContent.length} articles have content:`);
    withContent.forEach((a: any) => {
      console.log(`   • ${a.title} (${a.content.length} blocks)`);
    });
  } else {
    console.log('\n⚠️ No articles have content yet. Edit them in the admin panel to add content.');
  }
  
  return articles;
}

/**
 * Check all projects in the database
 */
export async function checkProjects() {
  console.log('🎨 Checking projects...');
  const projects = await getByPrefixFromKV('project:');
  
  console.log(`\n📊 Found ${projects.length} projects:\n`);
  
  if (projects.length === 0) {
    console.log('⚠️ No projects found. Run DataSync in admin panel to import projects.');
    return [];
  }
  
  const summary = projects.map((project: any) => ({
    slug: project.slug || project.id,
    title: project.title,
    category: project.category,
    year: project.year,
    client: project.client || project.company,
    likes: project.likes || 0,
    views: project.views || 0,
    hasImages: (project.galleries?.hero?.length || 0) > 0,
  }));
  
  console.table(summary);
  
  return projects;
}

/**
 * Check all news items in the database
 */
export async function checkNews() {
  console.log('📰 Checking news items...');
  const news = await getByPrefixFromKV('news:');
  
  console.log(`\n📊 Found ${news.length} news items:\n`);
  
  if (news.length === 0) {
    console.log('⚠️ No news items found. Run DataSync in admin panel to import news.');
    return [];
  }
  
  const summary = news.map((item: any) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    date: item.date,
    hasCoverImage: !!item.coverImage,
  }));
  
  console.table(summary);
  
  return news;
}

/**
 * Check all data in the database
 */
export async function checkAll() {
  console.log('🔍 Checking all database content...\n');
  
  const [articles, projects, news] = await Promise.all([
    checkArticles(),
    checkProjects(),
    checkNews(),
  ]);
  
  console.log('\n📊 Summary:');
  console.log(`   Articles: ${articles.length}`);
  console.log(`   Projects: ${projects.length}`);
  console.log(`   News: ${news.length}`);
  console.log(`   Total: ${articles.length + projects.length + news.length} items`);
  
  return { articles, projects, news };
}

/**
 * Get a specific article by slug
 */
export async function getArticle(slug: string) {
  console.log(`📖 Fetching article: ${slug}`);
  const articles = await getByPrefixFromKV('blog_post:');
  const article = articles.find((a: any) => a.slug === slug || a.id === slug);
  
  if (!article) {
    console.log(`❌ Article not found: ${slug}`);
    console.log(`\nAvailable articles:`);
    articles.forEach((a: any) => {
      console.log(`   • ${a.slug || a.id} - ${a.title}`);
    });
    return null;
  }
  
  console.log(`✅ Article found: ${article.title}`);
  console.log(`   Category: ${article.category}`);
  console.log(`   Date: ${article.date}`);
  console.log(`   Content blocks: ${article.content?.length || 0}`);
  console.log(`   Tags: ${article.tags?.join(', ') || 'none'}`);
  console.log(`\nFull article data:`);
  console.log(article);
  
  return article;
}

/**
 * Quick stats
 */
export async function stats() {
  const [articles, projects, news] = await Promise.all([
    getByPrefixFromKV('blog_post:'),
    getByPrefixFromKV('project:'),
    getByPrefixFromKV('news:'),
  ]);
  
  const articlesWithContent = articles.filter((a: any) => a.content && a.content.length > 0);
  const projectsWithGalleries = projects.filter((p: any) => 
    (p.galleries?.hero?.length || 0) > 0
  );
  
  const stats = {
    'Total Articles': articles.length,
    'Articles with Content': articlesWithContent.length,
    'Articles without Content': articles.length - articlesWithContent.length,
    'Total Projects': projects.length,
    'Projects with Images': projectsWithGalleries.length,
    'Total News Items': news.length,
    'Total Database Items': articles.length + projects.length + news.length,
  };
  
  console.table([stats]);
  
  return stats;
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).dbDebug = {
    checkArticles,
    checkProjects,
    checkNews,
    checkAll,
    getArticle,
    stats,
  };
  
  console.log('%c📊 Database Debug Utilities Loaded', 'background: #10b981; color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold;');
  console.log('%cAvailable commands:', 'color: #10b981; font-weight: bold; margin-top: 8px;');
  console.log('  %cdbDebug.stats()%c - Quick database stats', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
  console.log('  %cdbDebug.checkArticles()%c - List all articles', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
  console.log('  %cdbDebug.checkProjects()%c - List all projects', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
  console.log('  %cdbDebug.checkNews()%c - List all news items', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
  console.log('  %cdbDebug.checkAll()%c - Check all data', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
  console.log('  %cdbDebug.getArticle("slug-here")%c - Get specific article', 'background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;', '');
}