// 🚨 COPY THIS ENTIRE FILE INTO BROWSER CONSOLE (F12)
// This will import ALL your data from code files to the database

(async () => {
  console.log('🚀 ========================================');
  console.log('🚀 IMPORTING DATA TO DATABASE');
  console.log('🚀 ========================================\n');

  try {
    const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');
    const { projects } = await import('./data/projects.ts');
    const { newsItems } = await import('./data/news.ts');
    const { blogPosts } = await import('./data/blog-posts.ts');

    console.log('📦 Found in code files:');
    console.log('   Projects:', projects?.length || 0);
    console.log('   News:', newsItems?.length || 0);
    console.log('   Blog Posts:', blogPosts?.length || 0);
    console.log('');

    // Get admin token
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      console.log('❌ ERROR: Not logged into admin panel');
      console.log('   Please log in first at /admin');
      return;
    }

    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4`;

    // Import Projects
    if (projects && projects.length > 0) {
      console.log('📊 Importing projects...');
      let successCount = 0;
      let errorCount = 0;

      for (const project of projects) {
        try {
          const response = await fetch(`${baseUrl}/api/admin/projects`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Admin-Token': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: project.id,
              title: project.title,
              category: project.category,
              subcategory: project.subcategory,
              venue: project.venue,
              location: project.location,
              year: project.year,
              featured: project.featured || false,
              description: project.description,
              cardImage: project.cardImage,
              credits: project.credits,
              images: project.images,
              relatedProjects: project.relatedProjects
            })
          });

          if (response.ok) {
            successCount++;
            console.log(`   ✅ ${project.title}`);
          } else {
            errorCount++;
            const error = await response.text();
            console.log(`   ❌ ${project.title}: ${error}`);
          }
        } catch (e) {
          errorCount++;
          console.log(`   ❌ ${project.title}: ${e.message}`);
        }
      }

      console.log(`   Done: ${successCount} success, ${errorCount} errors`);
      console.log('');
    }

    // Import News
    if (newsItems && newsItems.length > 0) {
      console.log('📰 Importing news items...');
      let successCount = 0;
      let errorCount = 0;

      for (const newsItem of newsItems) {
        try {
          const response = await fetch(`${baseUrl}/api/admin/news`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Admin-Token': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: newsItem.id,
              title: newsItem.title,
              date: newsItem.date,
              lastModified: newsItem.lastModified || newsItem.date,
              category: newsItem.category,
              excerpt: newsItem.excerpt,
              content: newsItem.content,
              blocks: newsItem.blocks,
              link: newsItem.link,
              location: newsItem.location,
              coverImage: newsItem.coverImage,
              images: newsItem.images,
              tags: newsItem.tags
            })
          });

          if (response.ok) {
            successCount++;
            console.log(`   ✅ ${newsItem.title}`);
          } else {
            errorCount++;
            const error = await response.text();
            console.log(`   ❌ ${newsItem.title}: ${error}`);
          }
        } catch (e) {
          errorCount++;
          console.log(`   ❌ ${newsItem.title}: ${e.message}`);
        }
      }

      console.log(`   Done: ${successCount} success, ${errorCount} errors`);
      console.log('');
    }

    // Import Blog Posts
    if (blogPosts && blogPosts.length > 0) {
      console.log('📚 Importing blog posts...');
      let successCount = 0;
      let errorCount = 0;

      for (const post of blogPosts) {
        try {
          const response = await fetch(`${baseUrl}/api/admin/posts`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Admin-Token': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: post.id,
              title: post.title,
              date: post.date,
              lastModified: post.lastModified || post.date,
              category: post.category,
              excerpt: post.excerpt,
              content: post.content,
              author: post.author,
              coverImage: post.coverImage,
              tags: post.tags
            })
          });

          if (response.ok) {
            successCount++;
            console.log(`   ✅ ${post.title}`);
          } else {
            errorCount++;
            const error = await response.text();
            console.log(`   ❌ ${post.title}: ${error}`);
          }
        } catch (e) {
          errorCount++;
          console.log(`   ❌ ${post.title}: ${e.message}`);
        }
      }

      console.log(`   Done: ${successCount} success, ${errorCount} errors`);
      console.log('');
    }

    console.log('🎉 ========================================');
    console.log('🎉 IMPORT COMPLETE!');
    console.log('🎉 ========================================\n');
    console.log('Now refresh your admin panel to see the data.');

  } catch (error) {
    console.log('❌ CRITICAL ERROR:', error.message);
    console.log('');
    console.log('Possible causes:');
    console.log('1. Not logged into admin panel - go to /admin and log in first');
    console.log('2. Data files not found');
    console.log('3. Server not responding');
  }

  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀 END IMPORT');
  console.log('🚀 ========================================');
})();
