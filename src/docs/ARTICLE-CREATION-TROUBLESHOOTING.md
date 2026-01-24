# Article Creation Troubleshooting Guide

## Issue: Can't Add Articles from Admin Panel

If you're unable to add articles from the admin panel, follow these troubleshooting steps to identify and fix the issue.

## Step 1: Check Browser Console

Open your browser's developer tools (F12 or right-click → Inspect) and check the Console tab for error messages when you try to save an article.

### What to Look For:

1. **Network errors** - "Failed to fetch" or "Network request failed"
2. **Authentication errors** - "No admin token" or "Unauthorized"
3. **Validation errors** - Missing required fields
4. **Server errors** - 500 status codes with error details

## Step 2: Verify Admin Authentication

Make sure you're properly logged in:

```javascript
// Check if you have an admin token
console.log('Admin token:', sessionStorage.getItem('admin_token'));
```

If this returns `null`, you need to log out and log back in.

## Step 3: Test Database Connection

Run these commands in the browser console to test your database:

```javascript
// Test basic connection
await testDB.testConnection();

// Check if articles table exists
await testDB.checkData('blog_post:');

// Check article stats
await dbDebug.stats();
```

### Expected Results:

- `testConnection()` should show "✅ All tests passed!"
- `checkData('blog_post:')` should show existing articles (if any)
- `stats()` should show database counts

## Step 4: Check Server Logs

The server logs will show detailed information about what's happening when you try to save an article.

### To View Server Logs:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Edge Functions** → **Logs**
4. Look for logs from `make-server-980dd7a4`

### What to Look For:

```
📝 Creating/updating post...
📄 Post data received: { ... }
🔑 Using post ID: post-xxxxx
🔍 Checking if post exists...
➕ Creating new post: post-xxxxx
✅ Successfully saved post: post-xxxxx
```

If you see errors like:
- `❌ KV.set error during creation`
- `❌ Database connection error`
- `❌ Error creating post`

Then there's a database connectivity issue.

## Step 5: Check Environment Variables

Make sure all required environment variables are set in Supabase:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Edge Functions**
4. Verify these secrets are set:
   - `ADMIN_PASSWORD`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`

## Step 6: Verify KV Store Table Exists

The database needs a table called `kv_store_980dd7a4` to store articles.

### To Check:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Database** → **Tables**
4. Look for `kv_store_980dd7a4`

### If the Table Doesn't Exist:

You need to create it manually:

1. Go to **SQL Editor**
2. Run this SQL:

```sql
CREATE TABLE kv_store_980dd7a4 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

## Step 7: Try a Simple Test

Try creating a simple article with minimal data:

1. Click "New Article"
2. Fill in only required fields:
   - **Title**: "Test Article"
   - **Excerpt**: "This is a test article"
3. Click "Save"
4. Check the console for detailed error messages

## Common Issues and Solutions

### Issue: "Failed to fetch"

**Cause**: Can't reach the server endpoint

**Solutions**:
1. Check your internet connection
2. Verify the Edge Function is deployed and running
3. Check if there are CORS errors in the console
4. Try refreshing the page and logging in again

### Issue: "Unauthorized" or 401 Error

**Cause**: Admin authentication failed

**Solutions**:
1. Log out and log back in
2. Clear your browser cache and cookies
3. Verify `ADMIN_PASSWORD` is set correctly in Supabase

### Issue: "Table does not exist"

**Cause**: The KV store table hasn't been created

**Solution**: Follow Step 6 above to create the table

### Issue: "Network request timed out"

**Cause**: Server is taking too long to respond

**Solutions**:
1. Wait 30-60 seconds and try again
2. Check Supabase status page for outages
3. Check server logs for performance issues

## Debug Commands Quick Reference

Open browser console and run:

```javascript
// Check authentication
console.log('Admin token:', sessionStorage.getItem('admin_token'));

// Test database connection
await testDB.testConnection();

// Check articles
await dbDebug.checkArticles();

// Check all database stats
await dbDebug.stats();

// Check specific article
await dbDebug.getArticle('your-article-slug');

// View raw KV store data
await testDB.checkData('blog_post:');
```

## Still Having Issues?

If you've tried all the above steps and still can't create articles:

1. **Capture the full error**:
   - Open browser console
   - Click "New Article" and fill in the form
   - Click "Save"
   - Copy all console output (red errors especially)

2. **Check server logs**:
   - Go to Supabase Dashboard
   - Check Edge Function logs
   - Copy any error messages

3. **Verify your setup**:
   - All environment variables are set
   - The KV table exists
   - You can log in successfully
   - Other admin features work (like viewing articles)

## Enhanced Error Logging

The ArticleManager now includes comprehensive error logging. When you try to save an article, you'll see:

**Before saving**:
```
💾 Saving article... { isNew: true, title: "...", hasContent: true, contentBlocks: 3 }
🌐 Making request to: https://...
📦 Request data: { method: "POST", hasToken: true, ... }
```

**On success**:
```
📡 Response status: 200 OK
✅ Article saved successfully!
```

**On failure**:
```
📡 Response status: 500 Internal Server Error
❌ Save failed: { status: 500, error: "..." }
```

This detailed logging will help you identify exactly where the problem is occurring.
