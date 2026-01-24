/**
 * DATA RECOVERY UTILITY
 * 
 * Run this in the browser console to check if your data still exists in the database.
 * 
 * Usage:
 * import { checkDataStatus } from './utils/check-data-status.ts';
 * await checkDataStatus.checkAll();
 */

import { getByPrefixFromKV } from './supabase/client';

export const checkDataStatus = {
  async checkAll() {
    console.log('🔍 ============================================');
    console.log('🔍 DATA RECOVERY CHECK');
    console.log('🔍 ============================================\n');

    try {
      // Check blog posts (articles)
      console.log('📚 Checking blog posts/articles...');
      const posts = await getByPrefixFromKV('blog_post:');
      console.log(`   Found ${posts?.length || 0} blog posts`);
      if (posts && posts.length > 0) {
        console.log('   ✅ Blog posts exist!');
        console.table(posts.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          date: p.date,
        })));
      } else {
        console.log('   ⚠️  No blog posts found in KV store');
      }

      // Check projects
      console.log('\n📊 Checking projects...');
      const projects = await getByPrefixFromKV('project:');
      console.log(`   Found ${projects?.length || 0} projects`);
      if (projects && projects.length > 0) {
        console.log('   ✅ Projects exist!');
        console.table(projects.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          featured: p.featured || false,
          year: p.year,
        })));
      } else {
        console.log('   ⚠️  No projects found in KV store');
      }

      // Check news
      console.log('\n📰 Checking news...');
      const news = await getByPrefixFromKV('news:');
      console.log(`   Found ${news?.length || 0} news items`);
      if (news && news.length > 0) {
        console.log('   ✅ News items exist!');
        console.table(news.map((n: any) => ({
          id: n.id,
          title: n.title,
          category: n.category,
          date: n.date,
        })));
      } else {
        console.log('   ⚠️  No news found in KV store');
      }

      // Check tutorials
      console.log('\n🎬 Checking tutorials...');
      const tutorials = await getByPrefixFromKV('tutorial:');
      console.log(`   Found ${tutorials?.length || 0} tutorials`);
      if (tutorials && tutorials.length > 0) {
        console.log('   ✅ Tutorials exist!');
        console.table(tutorials.map((t: any) => ({
          id: t.id,
          title: t.title,
          category: t.category,
        })));
      } else {
        console.log('   ⚠️  No tutorials found in KV store');
      }

      // Summary
      console.log('\n📊 ============================================');
      console.log('📊 SUMMARY');
      console.log('📊 ============================================');
      console.log(`📚 Blog Posts: ${posts?.length || 0}`);
      console.log(`📊 Projects: ${projects?.length || 0}`);
      console.log(`📰 News: ${news?.length || 0}`);
      console.log(`🎬 Tutorials: ${tutorials?.length || 0}`);
      console.log(`📊 TOTAL: ${(posts?.length || 0) + (projects?.length || 0) + (news?.length || 0) + (tutorials?.length || 0)}`);
      
      if ((posts?.length || 0) + (projects?.length || 0) + (news?.length || 0) > 0) {
        console.log('\n✅ YOUR DATA IS STILL IN THE DATABASE!');
        console.log('   The admin panel just needs to be fixed to display it.');
      } else {
        console.log('\n⚠️  NO DATA FOUND IN DATABASE');
        console.log('   You may need to run Data Sync to restore from code files.');
      }

    } catch (error) {
      console.error('❌ Error checking data:', error);
    }
  },

  async checkBlogPosts() {
    const posts = await getByPrefixFromKV('blog_post:');
    console.log('Blog posts:', posts);
    return posts;
  },

  async checkProjects() {
    const projects = await getByPrefixFromKV('project:');
    console.log('Projects:', projects);
    return projects;
  },

  async checkNews() {
    const news = await getByPrefixFromKV('news:');
    console.log('News:', news);
    return news;
  },

  async checkTutorials() {
    const tutorials = await getByPrefixFromKV('tutorial:');
    console.log('Tutorials:', tutorials);
    return tutorials;
  },
};

// Make it available in browser console
if (typeof window !== 'undefined') {
  (window as any).checkDataStatus = checkDataStatus;
}

export default checkDataStatus;
