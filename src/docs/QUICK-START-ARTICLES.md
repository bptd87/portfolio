# Quick Start: Articles

## Step 1: Check if You Have Articles in the Database

Open your browser console (press F12) and type:

```javascript
dbDebug.stats()
```

This will show you:
- Total Articles
- Articles with Content vs. Articles without Content
- Total Projects
- Total News Items

## Step 2: If You Have 0 Articles

1. Navigate to `/admin` (or click "SITEMAP" in navbar and access admin)
2. Log in with your admin password
3. Find the **"Sync Existing Data"** section at the top
4. Click **"Sync Data"** button
5. Click again to confirm
6. Wait for the sync to complete
7. You should see: "Successfully synced X articles..."

## Step 3: Verify Articles Are Synced

In the browser console, type:

```javascript
dbDebug.checkArticles()
```

You should see a table listing all your articles. Check the `hasContent` column:
- `true` = Article has content blocks ✅
- `false` = Article only has placeholder content ⚠️

## Step 4: Add Content to an Article

### Using the Admin Panel Block Editor

1. In the admin panel, scroll to **"Manage Articles"**
2. Find the article you want to edit (e.g., "Becoming a Scenic Designer")
3. Click the **Edit** button (pencil icon)
4. You'll see the Block Editor interface
5. Click **"+ Add Block"** to add content blocks:
   - **Paragraph**: Regular text content
   - **Heading**: Section headings (choose level 2-6)
   - **Image**: Add images with optional captions
   - **Quote**: Blockquotes with optional attribution
   - **List**: Bullet or numbered lists
   - **Code**: Code snippets with syntax highlighting
   - **Divider**: Horizontal line to separate sections
6. For each block:
   - Type or paste your content
   - Use the ↑/↓ buttons to reorder blocks
   - Use the trash icon to delete blocks
7. Click **Save** when done

### Example: Converting Static Content to Blocks

If you want to convert content from your static article files (like `/pages/scenic-insights/BecomingAScenicDesigner.tsx`), follow this pattern:

**Static HTML:**
```jsx
<h2>Your First Scenic Design Job</h2>
<p>That first opportunity is sacred...</p>
```

**Convert to Blocks:**
1. Click "+ Add Block" → Choose "Heading"
2. Enter: "Your First Scenic Design Job"
3. Set level to 2
4. Click "+ Add Block" → Choose "Paragraph"
5. Enter: "That first opportunity is sacred..."
6. Repeat for all content

## Step 5: View Your Article

1. Navigate to "SCENIC INSIGHTS" in the navbar
2. You should see your article in the grid
3. Click on it to view the full article with your content

## Step 6: Verify Content Loaded

Open the browser console and you should see:

```
📚 ScenicInsights: Found X articles
   First article: [Your Article Title]

📖 DynamicArticle: Fetching article with slug: your-article-slug
📖 DynamicArticle: Found X articles in database
✅ DynamicArticle: Article found: [Your Article Title]
```

## Troubleshooting

### No articles found

**Console shows:** `⚠️ ScenicInsights: No articles found in database`

**Solution:** Run DataSync in the admin panel (Step 2)

### Article shows but is blank

**Console shows:** `✅ Article found` but page is empty

**Solution:** The article has no content blocks. Edit it in the admin panel to add content (Step 4)

### "Article not found" error

**Console shows:** `❌ DynamicArticle: Article not found with slug: your-slug`

**Solution:** 
1. Check available articles: `dbDebug.checkArticles()`
2. Verify the slug matches the `slug` or `id` field
3. The console will show: `Available articles: [...]`

### Want to see article details

In browser console:

```javascript
dbDebug.getArticle('your-article-slug')
```

This will show the full article object including all content blocks.

## Database Debug Commands

All available in browser console after opening the site:

```javascript
// Quick stats
dbDebug.stats()

// Check articles
dbDebug.checkArticles()

// Check projects
dbDebug.checkProjects()

// Check news
dbDebug.checkNews()

// Check everything
dbDebug.checkAll()

// Get specific article
dbDebug.getArticle('article-slug-here')
```

## Content Block Types Reference

### Paragraph
```json
{
  "type": "paragraph",
  "content": "Your paragraph text here..."
}
```

### Heading
```json
{
  "type": "heading",
  "content": "Your Heading Text",
  "metadata": {
    "level": 2  // 1-6
  }
}
```

### Image
```json
{
  "type": "image",
  "content": "https://your-image-url.com/image.jpg",
  "metadata": {
    "alt": "Image description",
    "caption": "Optional caption text"
  }
}
```

### Quote
```json
{
  "type": "quote",
  "content": "The quote text goes here",
  "metadata": {
    "author": "Optional attribution",
    "caption": "Optional context"
  }
}
```

### List
```json
{
  "type": "list",
  "content": "Item 1\nItem 2\nItem 3",
  "metadata": {
    "listType": "bullet"  // or "numbered"
  }
}
```

### Code
```json
{
  "type": "code",
  "content": "const example = 'code here';",
  "metadata": {
    "language": "javascript"
  }
}
```

### Divider
```json
{
  "type": "divider",
  "content": ""
}
```

## Your Available Articles

Based on `/data/blog-posts.ts`, you have these articles ready to be filled with content:

1. **Artistic Vision in Scenic Design: Finding My Creative Voice**
2. **Becoming a Scenic Designer: A Comprehensive Guide** ⭐ *Recommended first article*
3. **What Makes a Good Scenic Design Rendering?**
4. **Framing the Martyr: Scenic Design as Memory Work in Romero**
5. **"You're Wasting My Time" — A Scenic Design Lesson**
6. **The Lights Were Already On: Maude Adams' Legacy**
7. **Sora in the Studio: Testing AI's Potential**
8. **Computer Literacy for Scenic Designers**
9. **Computer Hardware Guide for Scenic Designers**
10. **Presenting Like Apple**
11. **Video Game Environments**
12. **Golden Age Broadway**
13. **Themed Entertainment Evolution**
14. **Opera Foundations**

All have metadata (title, excerpt, date, tags) but need content blocks added via the admin panel.

## Next Steps

1. ✅ Sync data to populate database
2. ✅ Use `dbDebug.stats()` to verify sync
3. ✅ Pick an article to edit (recommend "Becoming a Scenic Designer")
4. ✅ Add content using the Block Editor
5. ✅ View your article on the Scenic Insights page
6. 🔁 Repeat for other articles

---

**Need Help?**
- Check the full guide: `/docs/ARTICLE-SYSTEM-GUIDE.md`
- View console logs when navigating the site
- Use `dbDebug` commands to inspect database state
