# Featured Projects Guide

## What Changed

Your homepage now **ONLY shows projects marked as "Featured"** instead of showing all projects.

This gives you full control over which projects appear on your homepage!

## How to Mark Projects as Featured

### Method 1: Using the Admin Panel (Recommended)

1. **Go to Admin Panel**: Navigate to `/admin`
2. **Log in** with your admin password
3. **Click "Portfolio" tab**
4. **Find the project** you want to feature
5. **Click "Edit"** button
6. **Check the "Featured Project" checkbox**
7. **Click "Save"**
8. **Refresh your homepage** to see it

### Method 2: Using Data Sync

If you have projects defined in code files:

1. **Go to Admin Panel** → **Data Sync** tab
2. **Edit your project files** (in `/data/projects.ts` or individual project files)
3. **Add `featured: true`** to the project object
4. **Click "Sync All Data to Database"**
5. **Refresh your homepage**

## How Many Featured Projects Should You Have?

The homepage shows **up to 5 featured projects** in this order:

1. First featured project (Frame 1)
2. Second featured project (Frame 2)
3. Third featured project (Frame 3)
4. Latest news (Frame 4)
5. Fourth featured project (Frame 5)
6. Fifth featured project (Frame 6)

**Recommendation**: Mark 4-5 of your best projects as featured.

## Which Projects Should Be Featured?

Feature your:
- ✅ Most impressive work
- ✅ Recent projects
- ✅ Award-winning designs
- ✅ Projects with great photos
- ✅ Work that represents your range

## Checking Which Projects Are Featured

### In the Admin Panel:
1. Go to **Portfolio** tab
2. Featured projects will have a **"Featured"** badge next to their title

### In the Browser Console:
```javascript
// Check all projects and their featured status
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');
const projects = await getByPrefixFromKV('project:');
const featured = projects.filter(p => p.featured === true);

console.log(`Total projects: ${projects.length}`);
console.log(`Featured projects: ${featured.length}`);
console.table(featured.map(p => ({
  title: p.title,
  category: p.category,
  year: p.year
})));
```

## Why Aren't My Featured Projects Showing?

### Issue 1: No Projects Marked as Featured
**Solution**: Go to admin panel and mark some projects as featured

### Issue 2: Projects Not in Database
**Solution**: Use Data Sync to import your projects from code to database

### Issue 3: Cache Issue
**Solution**: Hard refresh the homepage (Ctrl+Shift+R or Cmd+Shift+R)

### Issue 4: Database Connection Issue
**Solution**: Run the database test:
```javascript
await testDB.testConnection()
```

## Changing Featured Projects

To change which projects appear on the homepage:

1. **Unfeature current projects**:
   - Edit project
   - Uncheck "Featured Project"
   - Save

2. **Feature new projects**:
   - Edit project
   - Check "Featured Project"
   - Save

3. **Refresh homepage** to see changes

## Featured Project Display Order

Featured projects are sorted by:
1. **Year** (newest first)
2. **Month** (if year is the same)
3. **Title** (alphabetically, if year/month are the same)

So your most recent featured projects will appear first on the homepage.

## Quick Commands

```javascript
// See all featured projects
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');
const projects = await getByPrefixFromKV('project:');
const featured = projects.filter(p => p.featured);
console.table(featured.map(p => ({ title: p.title, year: p.year, category: p.category })));

// Count featured projects
console.log('Featured projects:', projects.filter(p => p.featured).length);

// See homepage data
await dbDebug.checkProjects()
```

## Example: Marking a Project as Featured

### Before (in code):
```typescript
{
  id: 'all-my-sons',
  title: 'All My Sons',
  category: 'Scenic Design',
  year: 2024,
  featured: false, // ❌ Not featured
  // ... other fields
}
```

### After:
```typescript
{
  id: 'all-my-sons',
  title: 'All My Sons',
  category: 'Scenic Design',
  year: 2024,
  featured: true, // ✅ Featured!
  // ... other fields
}
```

Then sync to database or edit in admin panel.

## Testing Featured Projects

1. **Mark a project as featured** in admin panel
2. **Open browser console** (F12)
3. **Run this command**:
```javascript
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');
const projects = await getByPrefixFromKV('project:');
const featured = projects.filter(p => p.featured === true);
console.log('Featured projects on homepage:', featured.slice(0, 5).map(p => p.title));
```
4. **Refresh homepage** and verify

## Summary

✅ Homepage now shows ONLY featured projects  
✅ You control which projects appear via "Featured" checkbox  
✅ Up to 5 featured projects will display  
✅ Projects sorted by year (newest first)  
✅ Easy to change featured projects anytime  

**Action Item**: Go to your admin panel and mark 4-5 of your best projects as featured!
