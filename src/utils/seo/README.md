# SEO Utilities

This folder contains all SEO-related utilities and configuration for the site.

## Files

### `metadata.ts`
**Purpose**: Centralized metadata configuration for all pages

**Contains**:
- Static page metadata (title, description, keywords, OG tags)
- Dynamic metadata generators for blog posts, projects, tutorials, vault items
- Site-wide defaults (site name, author, default images)

**Update when**:
- Adding a new static page
- Changing site-wide information (author, site name)
- Updating existing page descriptions

### `structured-data.ts`
**Purpose**: Schema.org JSON-LD generators for rich snippets

**Contains**:
- Person/Organization schema (for About page)
- Article schema (for blog posts)
- CreativeWork schema (for portfolio projects)
- VideoObject schema (for tutorials)
- SoftwareApplication schema (for software pages)
- WebSite schema with search action
- BreadcrumbList schema

**Update when**:
- Adding new structured data types
- Updating schema properties
- Fixing structured data validation errors

### `generate-sitemap.ts`
**Purpose**: Automatic sitemap.xml generator

**Contains**:
- Function to generate complete sitemap from site data
- Priority and change frequency settings
- Automatic inclusion of blog posts, projects, vault items

**Usage**:
1. Update `SITE_URL` constant with your domain
2. Run the generator
3. Copy output to `/public/sitemap.xml`
4. Submit to Google Search Console

**Update when**:
- Adding new page types
- Changing URL structure
- Before major content updates

### `debug-seo.ts`
**Purpose**: Browser console debugging tools

**Contains**:
- `checkSEO()` - Complete SEO report for current page
- `checkMeta()` - Check specific meta tag
- `listAllMeta()` - List all meta tags

**Usage** (in browser console):
```javascript
checkSEO()           // Full SEO report
checkMeta('og:title') // Check specific tag
listAllMeta()        // List all tags
```

**Automatically loaded in development mode**

## Quick Reference

### Adding a New Static Page

1. Add to `metadata.ts`:
```typescript
'my-page': {
  title: 'My Page | Site Name',
  description: 'Compelling 150-160 char description',
  keywords: ['keyword1', 'keyword2'],
  ogType: 'website',
  canonicalPath: '/my-page',
}
```

2. Add to App.tsx `getSEOData()`:
```typescript
case 'my-page':
  return { metadata: PAGE_METADATA['my-page'] };
```

### Adding Structured Data to a Page

1. Generate schema in `structured-data.ts` or use existing generator

2. Add to App.tsx `getSEOData()`:
```typescript
case 'my-page':
  return {
    metadata: PAGE_METADATA['my-page'],
    structuredData: generatePersonSchema({
      name: 'Your Name',
      // ... other properties
    }),
  };
```

### Updating Site-Wide Info

Edit `metadata.ts`:
```typescript
export const DEFAULT_METADATA = {
  siteName: 'Your Site',
  author: 'Your Name',
  twitterHandle: '@handle',
  // ...
};
```

## Testing

### Local Testing
```javascript
// Browser console
checkSEO()  // See full report
```

### Online Testing
- **Social Preview**: https://metatags.io/
- **Structured Data**: https://search.google.com/test/rich-results
- **Open Graph**: https://developers.facebook.com/tools/debug/

## Documentation

Full documentation in `/docs/`:
- `SEO-SYSTEM.md` - Complete technical reference
- `SEO-QUICK-START.md` - Getting started guide
- `SEO-CHECKLIST.md` - Testing and validation
- `SEO-IMPLEMENTATION-SUMMARY.md` - Overview

## Maintenance

- **Weekly**: Check for console errors
- **Monthly**: Review metadata accuracy
- **When adding content**: Ensure proper metadata
- **After deployment**: Validate with online tools

## Support

For issues or questions:
1. Check `/docs/SEO-SYSTEM.md` for detailed docs
2. Run `checkSEO()` in browser console
3. Verify `getSEOData()` returns correct metadata
4. Check browser console for errors
