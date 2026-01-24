# 🚨 EMERGENCY DATA RECOVERY GUIDE

## Your Data Is Likely Still Safe!

Don't panic - your data is probably still in the database. The admin panel just isn't displaying it correctly.

## STEP 1: Check if Your Data Still Exists

**Open your browser console** (Press F12, then click "Console" tab)

**Run this command:**
```javascript
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');

// Check blog posts
const posts = await getByPrefixFromKV('blog_post:');
console.log('📚 Blog Posts:', posts?.length || 0);

// Check projects
const projects = await getByPrefixFromKV('project:');
console.log('📊 Projects:', projects?.length || 0);

// Check news
const news = await getByPrefixFromKV('news:');
console.log('📰 News:', news?.length || 0);

console.log('✅ TOTAL ITEMS:', (posts?.length || 0) + (projects?.length || 0) + (news?.length || 0));
```

**If you see numbers greater than 0, YOUR DATA IS STILL THERE! ✅**

## STEP 2: Use the Data Recovery Utility

Run this comprehensive check:

```javascript
const { checkDataStatus } = await import('./utils/check-data-status.ts');
await checkDataStatus.checkAll();
```

This will show you EVERYTHING in your database with nice tables.

## STEP 3: Check Browser Console for Errors

While looking at the empty admin panel:

1. **Press F12** to open Developer Tools
2. **Click the "Console" tab**
3. **Look for red error messages**
4. **Copy any error messages you see**

Common errors that would cause this:
- `Failed to fetch` - Server connection issue
- `Cannot read property` - JavaScript error
- `401 Unauthorized` - Not logged in properly
- `CSS not loaded` - Styling issue

## STEP 4: Check Network Tab

1. **Press F12** → **Network tab**
2. **Refresh the admin panel page**
3. **Look for requests to `/api/admin/posts`**
4. **Click on the request and check**:
   - Status code (should be 200)
   - Response (should show your data)
   - Any errors (will be red)

## STEP 5: Force Reload the Admin Panel

Try these in order:

1. **Normal refresh**: F5 or Ctrl+R
2. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Clear cache and reload**:
   - F12 → Right-click refresh button → "Empty Cache and Hard Reload"
4. **Log out and log back in**:
   ```javascript
   sessionStorage.removeItem('admin_token');
   ```
   Then refresh page and log in again

## STEP 6: Check the Server Endpoints

Test if the server is responding:

```javascript
// Test the posts endpoint
const { projectId, publicAnonKey } = await import('./utils/supabase/info.tsx');
const token = sessionStorage.getItem('admin_token');

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-980dd7a4/api/admin/posts`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': token
    }
  }
);

const data = await response.json();
console.log('📡 Server response:', data);
console.log('📚 Posts returned:', data.posts?.length || 0);
```

**Expected result**: Should show `success: true` and your posts

**If you get an error**: The server might be down or the endpoint isn't working

## STEP 7: Manual Data Inspection

If the server is working but the UI isn't showing data:

```javascript
// Get all your data manually
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');

const posts = await getByPrefixFromKV('blog_post:');
console.log('All blog posts:');
console.table(posts.map(p => ({
  id: p.id,
  title: p.title,
  date: p.date,
  category: p.category
})));
```

## COMMON ISSUES & FIXES

### Issue: "0 total articles" showing but you know you have data

**Problem**: The fetch is failing silently

**Fix**:
1. Check browser console for errors
2. Verify you're logged in: `sessionStorage.getItem('admin_token')`
3. Try logging out and back in
4. Check if server is responding (Step 6 above)

### Issue: Complete blank screen, nothing renders

**Problem**: JavaScript error or CSS not loaded

**Fix**:
1. Check console for red errors
2. Hard refresh (Ctrl+Shift+R)
3. Clear browser cache
4. Try in incognito/private mode

### Issue: "Unauthorized" or 401 errors

**Problem**: Admin token expired or invalid

**Fix**:
```javascript
// Clear token and re-login
sessionStorage.removeItem('admin_token');
// Then refresh page and log in again
```

### Issue: Data shows in console but not in UI

**Problem**: Component rendering issue

**Fix**:
1. The component code is fine, so it's likely a React state issue
2. Try hard refresh
3. Check if `loading` state is stuck:
   ```javascript
   // This won't work directly, but check console logs
   // Look for "Loading articles..." message that doesn't go away
   ```

## EMERGENCY: If Data Is Actually Lost

If you run the checks above and confirm NO data exists:

### Restore from Data Sync

1. **Go to Admin Panel** → **Data Sync tab**
2. **Click "Sync All Data to Database"**
3. This will restore data from your code files:
   - `/data/articles.ts`
   - `/data/projects.ts`
   - `/data/news.ts`
   - Any individual project/article files

### Restore from Code Files

If you have projects/articles defined in TypeScript files, they can be re-imported.

Check these locations:
- `/data/projects.ts`
- `/data/projects/`
- `/data/articles/`
- `/data/news.ts`

## What Happened?

Based on investigation, the most likely causes are:

1. **Server endpoint name mismatch** - FIXED (endpoints are correct)
2. **Admin token expired** - Try re-logging in
3. **Component rendering issue** - Try hard refresh
4. **Network/server issue** - Check console and network tab

## CRITICAL: Before You Do Anything Else

**RUN THIS COMMAND RIGHT NOW:**

```javascript
const { checkDataStatus } = await import('./utils/check-data-status.ts');
await checkDataStatus.checkAll();
```

This will tell you immediately if your data is safe or not.

---

## Next Steps Based on Results

### ✅ If data exists (shows numbers > 0):
1. Your data is safe!
2. The problem is just displaying it
3. Try logging out and back in
4. Try hard refresh
5. Check console for errors
6. Continue reading below for specific fixes

### ⚠️ If no data found:
1. Check `/data/` folder for backup files
2. Run Data Sync to restore from code
3. Check if you have git commits with the data
4. Don't panic - data can be recovered

---

## Testing Individual Components

### Test Articles Component:
```javascript
// Check if ArticleManager component is mounted
const articleManager = document.querySelector('[data-testid="article-manager"]');
console.log('ArticleManager mounted:', !!articleManager);
```

### Test if React is working:
```javascript
// Check if any React components are rendering
const reactRoot = document.querySelector('#root');
console.log('React root exists:', !!reactRoot);
console.log('React root has children:', reactRoot?.children.length);
```

## Contact Information

If all else fails and you need help:
1. Copy ALL console output
2. Copy Network tab responses
3. Run the data check and copy results
4. Note any error messages

## Most Likely Fix

Based on the screenshot showing a completely empty panel:

**Try this FIRST:**

1. **Log out**: Click the "LOGOUT" button
2. **Close the tab**
3. **Open a new tab**
4. **Go back to `/admin`**
5. **Log in again**
6. **Check if data appears**

If that doesn't work, run the data check command above!
