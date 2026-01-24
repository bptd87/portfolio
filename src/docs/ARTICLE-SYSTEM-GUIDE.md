# Article System Guide

## Current Architecture

Your site uses a **database-driven article system** that loads content dynamically from the Supabase KV store.

### How It Works

1. **Metadata Source**: `/data/blog-posts.ts` contains article metadata (title, excerpt, date, tags, etc.)
2. **Database Storage**: Articles are stored in KV store with prefix `blog_post:`
3. **Content Editor**: Admin panel provides a visual Block Editor for writing articles
4. **Frontend Display**: `DynamicArticle` component loads articles directly from KV store

### Data Flow

```
blog-posts.ts (metadata)
    ↓
Admin Panel → DataSync → Supabase KV Store
                             ↓
                         DynamicArticle
                             ↓
                      Scenic Insights Page
```

## Checking Your Database

### Using the Admin Panel

1. Navigate to `/admin` (or click "SITEMAP" in navbar and access admin)
2. Log in with your admin password
3. Find the **"Database Debug"** section at the top
4. Click **"Check Database"** button
5. You'll see a count of articles, projects, and news items

The console will also log:
```
📊 Database contents: { posts: [...], projects: [...], news: [...] }
```

### Console Logging

When you visit Scenic Insights page or click on an article, check the browser console for:
- `📚 ScenicInsights: Found X articles` - Shows total articles in database
- `📖 DynamicArticle: Article found: [title]` - Confirms article loaded
- `   Available articles: [...]` - Lists all article slugs if article not found

## Adding Article Content

Since you mentioned "i should have one full article", here's how to add content:

### Option 1: Use the Admin Panel (Recommended)

1. Go to `/admin` and log in
2. Scroll to **"Manage Articles"** section
3. Find your article in the list
4. Click the **Edit** button (pencil icon)
5. Use the **Block Editor** to add content:
   - Click **"+ Add Block"** to add different content types
   - Choose from: Paragraph, Heading, Image, Quote, List, Code, Divider
   - Each block can be reordered, edited, or deleted
6. Click **Save** when done

### Option 2: Sync from Data Files

1. Go to `/admin` and log in  
2. Find the **"Sync Existing Data"** section at the top
3. Click **"Sync Data"** button (shows warning first)
4. Click again to confirm
5. This will import all metadata from blog-posts.ts

**Note**: Syncing only adds placeholder content. You'll still need to edit each article with real content using the Block Editor.

## Article Content Structure

Articles use a **Block-based content system**:

```typescript
{
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'quote' | 'list' | 'code' | 'divider';
  content: string;
  metadata?: {
    level?: number;        // For headings (1-6)
    url?: string;          // For images
    alt?: string;          // For images
    caption?: string;      // For images/quotes
    author?: string;       // For quotes
    listType?: 'bullet' | 'numbered';  // For lists
    language?: string;     // For code blocks
  };
}
```

## Available Articles

Based on your `/data/blog-posts.ts`, you have these articles defined:

1. **Artistic Vision in Scenic Design: Finding My Creative Voice**
   - Slug: `artistic-vision-finding-creative-voice`
   - Category: Design Philosophy & Scenic Insights
   - Static page: ArtisticVisionFindingCreativeVoice.tsx

2. **Becoming a Scenic Designer: A Comprehensive Guide**
   - Slug: `becoming-a-scenic-designer`
   - Category: Design Philosophy & Scenic Insights
   - Static page: BecomingAScenicDesigner.tsx ✅ **Full content available**

3. **What Makes a Good Scenic Design Rendering?**
   - Slug: `scenic-rendering-principles`
   - Category: Technology & Tutorials

4. **Framing the Martyr: Scenic Design as Memory Work in Romero**
   - Slug: `romero-set-design`
   - Category: Scenic Design Process & Highlights

5. **"You're Wasting My Time" — A Scenic Design Lesson in Growth and Revision**
   - Slug: `scenic-design-lesson-youre-wasting-my-time`
   - Category: Design Philosophy & Scenic Insights

6. **The Lights Were Already On: Maude Adams' Legacy at Stephens College**
   - Slug: `the-lights-were-already-on-maude-adams-legacy-at-stephens-college`
   - Category: Design Philosophy & Scenic Insights

7. **Sora in the Studio: Testing AI's Potential for Theatrical Design**
   - Slug: `sora-in-the-studio-testing-ais-potential-for-theatrical-design`
   - Category: Technology & Tutorials

...and more!

## Static Article Pages

You have these static article pages with full content:

- `/pages/scenic-insights/ArtisticVisionFindingCreativeVoice.tsx`
- `/pages/scenic-insights/BecomingAScenicDesigner.tsx` ✅
- `/pages/scenic-insights/ComputerHardwareGuide.tsx`
- `/pages/scenic-insights/ComputerLiteracy.tsx`
- `/pages/scenic-insights/GoldenAgeBroadway.tsx`
- `/pages/scenic-insights/OperaFoundations.tsx`
- `/pages/scenic-insights/PresentingLikeApple.tsx`
- `/pages/scenic-insights/ThemedEntertainmentEvolution.tsx`
- `/pages/scenic-insights/VideoGameEnvironments.tsx`

**Important**: These static pages are no longer being used! The site now uses `DynamicArticle` which loads from the database. To use this content, you need to manually copy it into the database using the Admin Panel's Block Editor.

## Troubleshooting

### "Article not found" error

Check the console for:
```
📖 DynamicArticle: Found 0 articles in database
```

**Solution**: Run DataSync in admin panel to populate the database.

### Article shows but has no content

This means the article exists in database but only has placeholder content.

**Solution**: Edit the article in admin panel and add real content using the Block Editor.

### Want to verify what's in the database

1. Open browser console (F12)
2. Run this in the console:
```javascript
const { getByPrefixFromKV } = await import('./utils/supabase/client.ts');
const articles = await getByPrefixFromKV('blog_post:');
console.table(articles.map(a => ({ 
  slug: a.slug, 
  title: a.title, 
  hasContent: a.content?.length > 0,
  blockCount: a.content?.length || 0 
})));
```

## Next Steps

To get "one full article" working:

1. ✅ Go to admin panel at `/admin`
2. ✅ Click "Sync Data" to import article metadata
3. ✅ Check "Database Debug" to confirm articles are synced
4. ✅ Click "Edit" on "Becoming a Scenic Designer" article
5. ✅ Copy content from `/pages/scenic-insights/BecomingAScenicDesigner.tsx`
6. ✅ Convert it to blocks in the Block Editor:
   - Each `<p>` → Paragraph block
   - Each `<h2>` → Heading block (level 2)
   - Each `<h3>` → Heading block (level 3)
   - Images → Image block
   - Quotes → Quote block
7. ✅ Save the article
8. ✅ Navigate to Scenic Insights and click the article to view it

## Technical Details

### Direct KV Store Access

The site now uses **direct Supabase client access** instead of API endpoints for better performance:

```typescript
// Before (API endpoint - had issues)
const response = await fetch(`${API_BASE_URL}/api/posts`);

// After (Direct KV store access - current)
import { getByPrefixFromKV } from './utils/supabase/client';
const articles = await getByPrefixFromKV('blog_post:');
```

### Key Functions

- `getFromKV(key)` - Get single value by exact key
- `getByPrefixFromKV(prefix)` - Get all values with key prefix
- Prefix for articles: `blog_post:`
- Prefix for projects: `project:`
- Prefix for news: `news:`

### Storage Structure

Articles are stored with this key pattern:
```
blog_post:becoming-a-scenic-designer
blog_post:artistic-vision-finding-creative-voice
```

Each value contains the full article object with content blocks.
