# Debug Commands Cheatsheet

Quick reference for debugging article creation issues. Run these commands in your browser console (F12).

## Article Creation Test Suite (NEW!)

```javascript
// Quick diagnostic check
await articleTest.quickCheck();

// Run complete test suite (RECOMMENDED)
await articleTest.runFullTest();

// Individual tests
articleTest.checkAdminToken();              // Check if logged in
await articleTest.testServerConnectivity(); // Test server connection
await articleTest.testAuthentication();     // Test auth token
await articleTest.testCreateArticle();      // Test article creation
await articleTest.verifyArticleSaved();     // Verify articles saved
```

## Authentication

```javascript
// Check if you're logged in
console.log('Token:', sessionStorage.getItem('admin_token') ? '✅ Present' : '❌ Missing');

// Log out manually
sessionStorage.removeItem('admin_token');
console.log('Logged out - refresh page to login again');
```

## Database Connection

```javascript
// Full connection test
await testDB.testConnection();

// Quick check for articles
await testDB.checkData('blog_post:');

// Quick check for projects
await testDB.checkData('project:');

// Quick check for news
await testDB.checkData('news:');
```

## Database Stats

```javascript
// View summary stats
await dbDebug.stats();

// Check all articles
await dbDebug.checkArticles();

// Check all projects
await dbDebug.checkProjects();

// Check all news
await dbDebug.checkNews();

// Check everything
await dbDebug.checkAll();
```

## Article Management

```javascript
// Get specific article by slug
await dbDebug.getArticle('your-article-slug');

// List all article slugs
const articles = await import('./utils/supabase/client.ts');
const posts = await articles.getByPrefixFromKV('blog_post:');
posts.forEach(p => console.log('📄', p.slug || p.id, '-', p.title));
```

## Manual API Testing

```javascript
// Get Supabase info
const info = await import('./utils/supabase/info.tsx');
console.log('Project ID:', info.projectId);
console.log('Anon Key:', info.publicAnonKey);

// Test GET articles endpoint
const token = sessionStorage.getItem('admin_token');
const response = await fetch(
  `https://${info.projectId}.supabase.co/functions/v1/make-server-980dd7a4/api/admin/posts`,
  {
    headers: { 
      'Authorization': `Bearer ${info.publicAnonKey}`,
      'X-Admin-Token': token 
    }
  }
);
const data = await response.json();
console.log('Articles:', data);

// Test health endpoint
const health = await fetch(
  `https://${info.projectId}.supabase.co/functions/v1/make-server-980dd7a4/health`
);
console.log('Server health:', await health.json());
```

## Direct Database Access

```javascript
// Import KV client functions
const { getFromKV, getByPrefixFromKV } = await import('./utils/supabase/client.ts');

// Get all articles
const articles = await getByPrefixFromKV('blog_post:');
console.log('Articles:', articles);

// Get specific article
const article = await getFromKV('blog_post:your-article-id');
console.log('Article:', article);

// Get all projects
const projects = await getByPrefixFromKV('project:');
console.log('Projects:', projects);

// Get all news
const news = await getByPrefixFromKV('news:');
console.log('News:', news);
```

## Error Simulation

```javascript
// Test with invalid token
sessionStorage.setItem('admin_token', 'invalid-token-for-testing');
console.log('Set invalid token - try creating an article now');

// Restore real token (log out and log back in instead)
sessionStorage.removeItem('admin_token');
console.log('Removed token - log back in');
```

## Console Output Analysis

### ✅ Successful Save Looks Like:
```
💾 Saving article... { isNew: true, title: "..." }
🌐 Making request to: https://...
📦 Request data: { method: "POST", hasToken: true, ... }
📡 Response status: 200 OK
✅ Article saved successfully!
```

### ❌ Failed Save Looks Like:
```
📡 Response status: 500 Internal Server Error
❌ Save failed: { status: 500, error: "..." }
```
or
```
❌ Error saving article: TypeError: Failed to fetch
```

## Quick Diagnostics

```javascript
// Run all diagnostics
console.log('=== DIAGNOSTICS ===');
console.log('1. Auth:', sessionStorage.getItem('admin_token') ? '✅' : '❌');
await testDB.testConnection();
await dbDebug.stats();
console.log('=== END DIAGNOSTICS ===');
```

## Clear All Data (Use with Caution!)

```javascript
// WARNING: This will delete all articles, projects, and news!
// Only use if you want to start fresh

const { createClient } = await import('./utils/supabase/client.ts');
const supabase = createClient();

// Delete all articles
await supabase.from('kv_store_980dd7a4').delete().like('key', 'blog_post:%');

// Delete all projects
await supabase.from('kv_store_980dd7a4').delete().like('key', 'project:%');

// Delete all news
await supabase.from('kv_store_980dd7a4').delete().like('key', 'news:%');

console.log('All data cleared - run Data Sync to restore from code');
```

## Useful Keyboard Shortcuts

- **F12** - Open developer tools
- **Ctrl+Shift+J** (Windows) / **Cmd+Option+J** (Mac) - Open console directly
- **Ctrl+L** - Clear console
- **↑** / **↓** - Navigate command history in console
- **Tab** - Autocomplete in console

## Common Debugging Flow

1. Open console (F12)
2. Check authentication: `console.log('Token:', sessionStorage.getItem('admin_token'))`
3. Test database: `await testDB.testConnection()`
4. Try creating article and watch console output
5. If it fails, check server logs in Supabase Dashboard
6. Use specific commands above to investigate further

## Server Logs Location

[Supabase Dashboard → Edge Functions → Logs](https://supabase.com/dashboard/project/zuycsuajiuqsvopiioer/logs/edge-functions)

Look for `make-server-980dd7a4` function logs.

## Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/zuycsuajiuqsvopiioer)
- [Database Tables](https://supabase.com/dashboard/project/zuycsuajiuqsvopiioer/database/tables)
- [Edge Functions](https://supabase.com/dashboard/project/zuycsuajiuqsvopiioer/functions)
- [Storage Buckets](https://supabase.com/dashboard/project/zuycsuajiuqsvopiioer/storage/buckets)

## Pro Tips

💡 Keep the console open while testing  
💡 Take screenshots of errors for reference  
💡 Compare server logs with client logs to find disconnects  
💡 Check network tab if "Failed to fetch" appears  
💡 Use `await dbDebug.stats()` after every change to verify  
💡 Clear browser cache if seeing stale data  
💡 Log out and back in if auth seems broken

## Save This Page

Bookmark this page or keep it open in a tab while debugging!