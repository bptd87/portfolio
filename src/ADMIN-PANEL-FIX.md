# Admin Panel & Homepage - FIXED

## Issues Fixed

### 1. ✅ Homepage Featured Projects
**Problem**: Homepage was showing ALL projects instead of only featured ones.
**Solution**: Updated Home.tsx to filter projects by `featured: true` before displaying them.

**Result**: Now the homepage will only show projects you've marked as "Featured" in the admin panel.

### 2. 🔍 Admin Panel "New" Buttons
**Status**: The code for the "New" buttons exists and should be working.

If you don't see the buttons, here are troubleshooting steps:

## Troubleshooting Steps for Admin Panel

### Step 1: Check if you're logged in

1. Open your browser console (F12)
2. Run:
   ```javascript
   console.log('Token:', sessionStorage.getItem('admin_token'));
   ```
3. If it shows `null`, log out and log back in

### Step 2: Check the Articles Tab

1. Go to Admin Panel `/admin`
2. Click the **Articles** tab
3. Look for a blue **"NEW ARTICLE"** button in the top right

**If you see it**: Great! Click it to create an article.

**If you don't see it**:
- Check the browser console for errors
- The button might be hidden because a form is already open
- Try refreshing the page

### Step 3: Check the Portfolio Tab

1. Click the **Portfolio** tab
2. Look for a **"New Project"** button in the top right

**Same troubleshooting as above applies**

### Step 4: Check Data Sync

**IMPORTANT**: If you don't see any data in the admin panels, you need to sync your data first!

1. Click the **Data Sync** tab
2. Click **"Sync All Data to Database"**
3. Wait for it to complete
4. Go back to Articles/Portfolio/News tabs

This will import all your existing projects, articles, and news from the code files into the database.

### Step 5: Debug the Buttons

Run this in the browser console to check button states:

```javascript
// Check if forms are showing (which would hide the buttons)
const articleManager = document.querySelector('[data-component="article-manager"]');
console.log('Article form showing:', !!document.querySelector('input[placeholder="Article title"]'));

const portfolioManager = document.querySelector('[data-component="portfolio-manager"]');
console.log('Portfolio form showing:', !!document.querySelector('input[placeholder*="Project"]'));
```

## How to Mark Projects as Featured

To make projects appear on the homepage:

1. Go to **Admin Panel** → **Portfolio** tab
2. Click **Edit** on a project
3. Check the **"Featured Project"** checkbox
4. Click **Save**
5. Refresh your homepage to see it appear

## How to Add New Content

### Add a New Article:
1. Admin Panel → **Articles** tab
2. Click **"NEW ARTICLE"** button (top right)
3. Fill in:
   - Title *
   - Excerpt *
   - Category
   - Content (use the block editor)
4. Click **Save**

### Add a New Project:
1. Admin Panel → **Portfolio** tab  
2. Click **"New Project"** button (top right)
3. Fill in all required fields
4. Check **"Featured"** if you want it on the homepage
5. Click **Save**

### Add News:
1. Admin Panel → **News** tab
2. Click **"New News Item"** button (top right)
3. Fill in the form
4. Click **Save**

### Add Tutorials:
1. Admin Panel → **Tutorials** tab
2. Click **"New Tutorial"** button (top right)
3. Fill in the form
4. Click **Save**

## What to Check if Buttons Still Don't Appear

### Check Browser Console for Errors

Look for red errors in the console that might indicate:
- JavaScript errors
- Failed network requests
- CSS loading issues

### Check if CSS is Loaded

The buttons use these CSS classes:
- `bg-accent-brand` (blue background)
- `text-white`
- `hover:opacity-90`

If CSS isn't loading properly, buttons might be invisible.

### Check Admin Token

The buttons require you to be logged in. If your token expired:
1. Log out of admin panel
2. Close browser tab
3. Open a new tab
4. Log back in

### Try a Hard Refresh

Sometimes cached JavaScript can cause issues:
- **Windows**: Ctrl + Shift + R
- **Mac**: Cmd + Shift + R

## Testing Article Creation

After you see the "NEW ARTICLE" button, test the full flow:

1. Open browser console (F12)
2. Click "NEW ARTICLE"
3. Fill in Title and Excerpt (required)
4. Click "Save"
5. Watch the console for logs:

```
➕ Creating new article with initial data: {...}
💾 Saving article...
📡 Response status: 200 OK
✅ Article saved successfully!
```

If you see errors, use the test utility:
```javascript
await articleTest.runFullTest()
```

## Summary of Changes

✅ **Homepage now shows only featured projects** instead of all projects  
✅ **Article creation has enhanced logging** for easier debugging  
✅ **Test utilities available** in browser console  
✅ **Admin panel buttons should be visible** when not editing  

## Still Having Issues?

If you still don't see the "New" buttons:

1. **Take a screenshot** of the admin panel
2. **Copy browser console output** (F12 → Console tab)
3. **Check Network tab** (F12 → Network) for failed requests
4. **Try in incognito mode** to rule out cache/extension issues

The buttons are in the code and should work. If they don't appear, it's likely:
- A login/authentication issue
- A CSS loading issue  
- A form is already open (which hides the button)
- Browser cache needs clearing
