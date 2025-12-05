# Database Troubleshooting Guide

## Error: "Failed to fetch" or "Error fetching posts"

This error typically indicates a database connection issue. Follow these steps to diagnose and fix the problem:

### Step 1: Test Database Connection

Open your browser console (F12 or Cmd+Option+I) and run:

```javascript
await testDB.testConnection()
```

This will run a comprehensive test of your database connection and show you:
- Whether the database table exists
- How many records are in the database
- What types of data are stored
- Whether blog posts can be fetched

### Step 2: Check Database Stats

Run this command to see a quick overview:

```javascript
await dbDebug.stats()
```

This shows:
- Total articles
- Articles with content
- Projects
- News items

### Step 3: Check Specific Data

To check if articles exist:

```javascript
await dbDebug.checkArticles()
```

To check projects:

```javascript
await dbDebug.checkProjects()
```

To check news:

```javascript
await dbDebug.checkNews()
```

## Common Issues and Solutions

### Issue 1: Table doesn't exist

**Symptoms:**
- Error message mentions "does not exist"
- testConnection() fails with table error

**Solution:**
The `kv_store_980dd7a4` table needs to be created in Supabase. This should be done automatically, but if not:

1. Go to your Supabase dashboard
2. Navigate to Database > Tables
3. Check if `kv_store_980dd7a4` exists
4. If not, you may need to run the DataSync tool from the admin panel

### Issue 2: Database is empty

**Symptoms:**
- testConnection() passes but shows 0 records
- Articles page shows "No articles found"

**Solution:**
Run DataSync to import your content:

1. Navigate to the Admin panel (click Sitemap in the nav menu, then Admin)
2. Enter your admin password
3. Click "Database Sync" tab
4. Click "Sync All Data to Database"

This will import all blog posts, projects, and news from your static data files.

### Issue 3: CORS or network errors

**Symptoms:**
- "Failed to fetch" error
- Network tab shows CORS errors
- Red errors in browser console

**Solution:**
1. Check your internet connection
2. Verify Supabase is not experiencing an outage
3. Check that your Supabase project URL and anon key are correct in `/utils/supabase/info.tsx`
4. Clear browser cache and reload

### Issue 4: Articles exist but have no content

**Symptoms:**
- dbDebug.stats() shows articles
- But "Articles without Content" count is high
- Article pages are empty or show only titles

**Solution:**
Articles need content to be added through the Block Editor:

1. Go to Admin panel
2. Click "Articles" tab
3. Edit each article
4. Use the Block Editor to add content
5. Save each article

## Detailed Console Debugging

### Check Supabase Client

```javascript
// Test if Supabase client initializes
const { createClient } = await import('./utils/supabase/client.ts');
const supabase = createClient();
console.log('Supabase client:', supabase);
```

### Manual KV Fetch Test

```javascript
// Test fetching data directly
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');
const articles = await getByPrefixFromKV('blog_post:');
console.log('Articles:', articles);
```

### Check Specific Article

```javascript
// Get a specific article by slug
await dbDebug.getArticle('your-article-slug')
```

## Browser Console Error Messages

### "Failed to fetch"
- This is a generic browser error
- Usually means network issue or CORS
- Check browser console Network tab for details

### "Table does not exist"
- The database table hasn't been created
- Check Supabase dashboard
- May need to create table manually

### "No rows returned"
- Database exists but is empty
- Run DataSync to populate

### "Permission denied"
- Check Row Level Security (RLS) policies in Supabase
- The anon key should have read access to kv_store_980dd7a4

## Still Having Issues?

If you've tried all the above steps and still have problems:

1. Check the browser console for specific error messages
2. Look in the Network tab for failed requests
3. Check Supabase dashboard logs
4. Verify all environment variables are correct
5. Try clearing browser cache and doing a hard reload (Cmd+Shift+R or Ctrl+Shift+F5)

## Advanced Debugging

### Enable Verbose Logging

The KV client now includes detailed logging. Check your browser console for messages starting with `[KV]`:

- `[KV] Fetching data with prefix: blog_post:` - Query started
- `[KV] Found X records for prefix: blog_post:` - Query succeeded
- `[KV] Query error:` - Supabase query failed
- `[KV] Failed to fetch from database:` - Network or other error

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for requests to `zuycsuajiuqsvopiioer.supabase.co`
5. Check if they're succeeding or failing
6. Click on failed requests to see error details

### Verify Supabase Setup

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to Database > Tables
4. Verify `kv_store_980dd7a4` table exists
5. Check Table Editor to see if data is there
6. Go to Database > Policies (RLS)
7. Ensure anon role can read from kv_store_980dd7a4

## Quick Fixes Checklist

- [ ] Ran `testDB.testConnection()` in console
- [ ] Checked that kv_store_980dd7a4 table exists
- [ ] Ran DataSync to populate database
- [ ] Verified internet connection is working
- [ ] Checked Supabase dashboard for errors
- [ ] Cleared browser cache
- [ ] Tried different browser
- [ ] Checked browser console for detailed errors
- [ ] Verified Supabase credentials in info.tsx
