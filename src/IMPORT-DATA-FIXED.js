// DEPRECATED: Legacy import script. Use the Admin panel data tools instead.
// This file is retained for reference only and should not be run.

(async () => {
  console.warn('Deprecated script. Use the Admin panel data tools instead.');
  return;
  console.log('🚀 ========================================');
  console.log('🚀 IMPORTING DATA TO DATABASE');
  console.log('🚀 ========================================\n');

  try {
    // Get the current window origin to construct proper URLs
    const origin = window.location.origin;
    
    console.log('📍 Loading from:', origin);
    console.log('');

    // Fetch Supabase info from the deployed app
    const infoModule = await import(`${origin}/utils/supabase/info.tsx`);
    const { projectId, publicAnonKey } = infoModule;

    console.log('✅ Connected to Supabase project:', projectId);
    console.log('');

    // Fetch data files
    const projectsModule = await import(`${origin}/data/projects.ts`);
    const newsModule = await import(`${origin}/data/news.ts`);
    const blogModule = await import(`${origin}/data/blog-posts.ts`);

    const projects = projectsModule.projects;
    const newsItems = newsModule.newsItems;
    const blogPosts = blogModule.blogPosts;

    console.log('📦 Found in code files:');
    console.log('   Projects:', projects?.length || 0);
    console.log('   News:', newsItems?.length || 0);
    console.log('   Blog Posts:', blogPosts?.length || 0);
    console.log('');

    // Get admin token
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      console.log('❌ ERROR: Not logged into admin panel');
      console.log('');
      console.log('Please:');
      console.log('1. Go to /admin in another tab');
      console.log('2. Log in (password: admin123 or your custom password)');
      console.log('3. Come back here and run this script again');
      console.log('');
      console.log('OR just use the Data Sync tab in the admin panel!');
      return;
    }

    console.log('✅ Admin token found');
    console.log('');

    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4`;

    // Import Projects
    if (projects && projects.length > 0) {
      console.log(`📊 Importing ${projects.length} projects...`);
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
            console.log(`   ❌ ${project.title}: ${error.substring(0, 100)}`);
          }
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (e) {
          errorCount++;
          console.log(`   ❌ ${project.title}: ${e.message}`);
        }
      }

      console.log(`   ✅ Done: ${successCount} success, ${errorCount} errors`);
      console.log('');
    }

    // Import News
    if (newsItems && newsItems.length > 0) {
      console.log(`📰 Importing ${newsItems.length} news items...`);
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
            console.log(`   ✅ ${newsItem.title.substring(0, 50)}...`);
          } else {
            errorCount++;
            const error = await response.text();
            console.log(`   ❌ ${newsItem.title.substring(0, 30)}: ${error.substring(0, 100)}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (e) {
          errorCount++;
          console.log(`   ❌ ${newsItem.title.substring(0, 30)}: ${e.message}`);
        }
      }

      console.log(`   ✅ Done: ${successCount} success, ${errorCount} errors`);
      console.log('');
    }

    // Import Blog Posts
    if (blogPosts && blogPosts.length > 0) {
      console.log(`📚 Importing ${blogPosts.length} blog posts...`);
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
            console.log(`   ❌ ${post.title}: ${error.substring(0, 100)}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (e) {
          errorCount++;
          console.log(`   ❌ ${post.title}: ${e.message}`);
        }
      }

      console.log(`   ✅ Done: ${successCount} success, ${errorCount} errors`);
      console.log('');
    }

    console.log('🎉 ========================================');
    console.log('🎉 IMPORT COMPLETE!');
    console.log('🎉 ========================================\n');
    console.log('✅ Your database is now populated!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to /admin');
    console.log('2. Refresh the page (F5 or Ctrl+Shift+R)');
    console.log('3. Your data should now appear!');
    console.log('');
    console.log('If you still see issues, there might be a separate UI bug to fix.');

  } catch (error) {
    console.log('❌ CRITICAL ERROR:', error.message);
    console.log('');
    console.log('Possible causes:');
    console.log('1. Not logged into admin panel');
    console.log('   → Go to /admin and log in first');
    console.log('');
    console.log('2. Running from wrong page');
    console.log('   → Make sure you\'re on your deployed site (not Figma.com)');
    console.log('');
    console.log('3. Data files not accessible');
    console.log('   → Try using the Data Sync tab in admin panel instead');
    console.log('');
    console.log('EASIEST FIX: Just use the "Data Sync" tab in the admin panel!');
    console.log('Click "Sync All Data to Database" button.');
  }

  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀 END IMPORT');
  console.log('🚀 ========================================');
})();
