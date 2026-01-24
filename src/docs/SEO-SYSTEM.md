# SEO System Documentation

## Overview

This site now has a comprehensive SEO system with:
- ✅ Dynamic meta tags (title, description, keywords)
- ✅ Open Graph tags for social sharing (Facebook, LinkedIn)
- ✅ Twitter Card tags
- ✅ Structured data (JSON-LD) for rich snippets
- ✅ Canonical URLs
- ✅ Proper article/project metadata

## File Structure

```
/utils/seo/
├── metadata.ts          # All page metadata configuration
└── structured-data.ts   # JSON-LD schema generators

/components/
└── SEO.tsx             # Dynamic meta tag manager component
```

## How It Works

### 1. Page Metadata (`/utils/seo/metadata.ts`)

This file contains all SEO metadata for every page. Each page has:
- **title**: Full page title (includes site name)
- **description**: 150-160 character description
- **keywords**: Array of relevant keywords
- **ogImage**: Social sharing image
- **ogType**: 'website', 'article', or 'profile'
- **canonicalPath**: URL path for canonical link

### 2. Structured Data (`/utils/seo/structured-data.ts`)

Creates Schema.org JSON-LD for rich snippets:
- **Article** schema for blog posts
- **CreativeWork** schema for portfolio projects
- **Person** schema for About page
- **WebSite** schema with search action
- **SoftwareApplication** schema for software pages

### 3. SEO Component (`/components/SEO.tsx`)

Dynamically updates all meta tags when pages change. Automatically handles:
- Document title
- Meta descriptions
- Open Graph tags
- Twitter Cards
- Canonical URLs
- Structured data injection

### 4. Integration (`/App.tsx`)

The `getSEOData()` function determines which metadata to use based on:
- Current page
- Portfolio filter
- Blog post ID
- Project slug

## Maintenance Guide

### Adding a New Static Page

1. **Add metadata to `/utils/seo/metadata.ts`:**

```typescript
export const PAGE_METADATA: Record<string, PageMetadata> = {
  // ... existing pages
  
  'your-new-page': {
    title: 'Your Page Title | Scenic Design & Software',
    description: 'Clear, compelling description under 160 characters.',
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonicalPath: '/your-new-page',
  },
};
```

2. **Add case to `getSEOData()` in `/App.tsx`:**

```typescript
case 'your-new-page':
  return { metadata: PAGE_METADATA['your-new-page'] };
```

### Adding a New Blog Post

Blog posts automatically get SEO metadata from the blog data. Ensure your blog post in `/data/blog-posts.ts` has:

```typescript
{
  id: 'post-slug',
  title: 'Article Title',
  excerpt: 'Compelling 150-160 character description',
  coverImage: '/path/to/image.jpg',
  date: '2024-01-01',
  category: 'Category Name',
  // ... other fields
}
```

The system will automatically generate:
- Dynamic title with "| Scenic Insights"
- Description from excerpt
- Article structured data
- Social sharing cards

### Adding a New Portfolio Project

When you add a project to `/data/projects.ts`, ensure it has:

```typescript
{
  slug: 'project-slug',
  title: 'Project Title',
  subtitle: 'Project Subtitle',
  description: 'Detailed description',
  heroImage: '/path/to/hero-image.jpg',
  year: '2024',
  venue: 'Theatre Name',
  // ... other fields
}
```

Then update `getSEOData()` in App.tsx to fetch the project data and generate metadata.

### Updating Site-Wide Defaults

Edit `/utils/seo/metadata.ts`:

```typescript
export const DEFAULT_METADATA = {
  siteName: 'Your Site Name',
  siteUrl: window.location.origin,
  author: 'Your Name',
  twitterHandle: '@yourhandle',
  defaultOgImage: '/path/to/default-og-image.jpg',
  defaultDescription: 'Your default site description',
};
```

## Best Practices

### Title Tags
- **Length**: 50-60 characters
- **Format**: `Page Title | Site Name` or `Page Title | Section`
- **Unique**: Every page must have a unique title
- **Front-load**: Put important keywords first

### Meta Descriptions
- **Length**: 150-160 characters
- **Compelling**: Encourage clicks, don't just describe
- **Unique**: Every page needs its own description
- **Call-to-action**: Include action words when appropriate

### Keywords
- **Relevant**: 3-7 keywords per page
- **Specific**: Mix broad and specific terms
- **Natural**: Use terms people actually search for
- **No stuffing**: Don't repeat keywords

### Open Graph Images
- **Size**: 1200 x 630px (Facebook/LinkedIn)
- **Format**: JPG or PNG
- **File size**: Under 1MB
- **Content**: Include text/branding that's readable when scaled

### Structured Data
- **Validate**: Use Google's Rich Results Test
- **Complete**: Fill all required properties
- **Accurate**: Data must match page content
- **Test**: Check in search console after deployment

## Testing Your SEO

### Local Testing

1. **View Source**: Right-click page → "View Page Source"
2. **Check Tags**: Search for `<title>`, `<meta name="description">`, `<meta property="og:`
3. **Verify JSON-LD**: Look for `<script type="application/ld+json">`

### Online Tools

1. **Open Graph Debugger**
   - Facebook: https://developers.facebook.com/tools/debug/
   - LinkedIn: https://www.linkedin.com/post-inspector/

2. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator

3. **Google Rich Results Test**
   - https://search.google.com/test/rich-results

4. **Schema.org Validator**
   - https://validator.schema.org/

### Browser Console

Check SEO in browser console:
```javascript
// View current title
document.title

// View all meta tags
document.querySelectorAll('meta')

// View structured data
document.querySelectorAll('script[type="application/ld+json"]')
```

## TODO: Future Enhancements

### High Priority
- [ ] **Create default OG image** (`/og-default.jpg`) - 1200x630px
- [ ] **Update author name** in `metadata.ts` DEFAULT_METADATA
- [ ] **Add Twitter handle** in `metadata.ts` DEFAULT_METADATA
- [ ] **Add project metadata** - Connect projects.ts data to SEO system
- [ ] **Add tutorial metadata** - Connect tutorial data to SEO system
- [ ] **Add vault item metadata** - Connect vault items to SEO system

### Medium Priority
- [ ] **Generate sitemap.xml** - List all pages for search engines
- [ ] **Create robots.txt** - Guide search engine crawlers
- [ ] **Add image alt text** - Update ImageWithFallback component
- [ ] **Add page-specific OG images** - Create custom images for major pages
- [ ] **Implement breadcrumb schema** - Add structured data for breadcrumbs

### Low Priority
- [ ] **Add FAQ schema** - If you add an FAQ section
- [ ] **Add HowTo schema** - For tutorial pages
- [ ] **Add Event schema** - For news/productions
- [ ] **Track Core Web Vitals** - Performance monitoring
- [ ] **Set up Google Search Console** - Monitor search performance

## Common Issues & Solutions

### Meta Tags Not Updating
- **Issue**: Tags don't change when navigating
- **Solution**: Check that `getSEOData()` returns correct metadata for the page

### Duplicate Titles
- **Issue**: All pages have the same title
- **Solution**: Verify each page has unique entry in `PAGE_METADATA`

### Missing Social Images
- **Issue**: Social sharing shows no image
- **Solution**: Add `ogImage` property to page metadata

### Structured Data Errors
- **Issue**: Google Rich Results Test shows errors
- **Solution**: Validate required properties are filled in structured data generators

### Wrong Canonical URL
- **Issue**: Canonical points to wrong page
- **Solution**: Update `canonicalPath` in page metadata

## Monitoring SEO Performance

### Google Search Console
Set up to monitor:
- Search rankings
- Click-through rates
- Index coverage
- Mobile usability
- Core Web Vitals

### Google Analytics
Track:
- Organic traffic
- Top landing pages
- User behavior
- Conversion rates

### Regular Checks
- **Weekly**: Check Search Console for errors
- **Monthly**: Review top performing pages
- **Quarterly**: Audit all metadata for accuracy
- **Yearly**: Update descriptions/keywords based on performance

## Resources

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Moz SEO Learning Center](https://moz.com/learn/seo)

---

**Last Updated**: 2024
**Maintained By**: AI Assistant
**Status**: ✅ Active & Maintained
