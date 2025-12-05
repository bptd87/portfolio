# SEO Quick Start Guide

## 🚀 What Was Implemented

Your site now has **professional-grade SEO** with:

✅ **Dynamic Page Titles** - Every page has unique, optimized title  
✅ **Meta Descriptions** - Compelling descriptions for search results  
✅ **Social Sharing** - Beautiful cards for Facebook, LinkedIn, Twitter  
✅ **Rich Snippets** - Structured data helps Google understand your content  
✅ **Canonical URLs** - Prevents duplicate content issues  
✅ **Article Metadata** - Blog posts get automatic SEO optimization  

## ⚡ Quick Actions Required

### 1. Update Site Information (5 minutes)

Edit `/utils/seo/metadata.ts`:

```typescript
export const DEFAULT_METADATA = {
  siteName: 'Scenic Design & Software',
  siteUrl: window.location.origin,
  author: 'YOUR ACTUAL NAME HERE', // ← Change this!
  twitterHandle: '@YOURHANDLE', // ← Change this!
  defaultOgImage: '/og-default.jpg',
  defaultDescription: '...',
};
```

### 2. Create Default Social Image (10 minutes)

Create `/public/og-default.jpg`:
- **Size**: 1200 x 630 pixels
- **Content**: Your name/logo + tagline
- **Format**: JPG or PNG under 1MB

**Quick tip**: Use [Canva](https://canva.com) with "Facebook Post" template

### 3. Test Your SEO (5 minutes)

1. Run your site locally
2. Visit the homepage
3. Right-click → "View Page Source"
4. Search for `<meta property="og:title">` - you should see your page title
5. Search for `<script type="application/ld+json">` - you should see structured data

## 📝 How to Add New Content

### Adding a New Page

1. **Add metadata** in `/utils/seo/metadata.ts`:
   ```typescript
   'my-new-page': {
     title: 'My Page Title | Scenic Design & Software',
     description: 'A compelling 150-character description of this page.',
     keywords: ['keyword1', 'keyword2'],
     ogType: 'website',
     canonicalPath: '/my-new-page',
   }
   ```

2. **Connect it** in `/App.tsx` → `getSEOData()`:
   ```typescript
   case 'my-new-page':
     return { metadata: PAGE_METADATA['my-new-page'] };
   ```

### Blog Posts (Already Automated!)

When you add a blog post to `/data/blog-posts.ts`, SEO is **automatic**. Just ensure:
- `title` is compelling
- `excerpt` is 150-160 characters
- `coverImage` is provided
- `date` is filled in

### Portfolio Projects

TODO: Not yet automated. For now, projects use the default portfolio SEO. We can enhance this later.

## 🔍 Testing Tools

### Before Publishing
- [Meta Tags Preview](https://metatags.io/) - See how it looks
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) - Test Twitter cards
- [Facebook Debugger](https://developers.facebook.com/tools/debug/) - Test Facebook sharing

### After Publishing
- [Google Rich Results Test](https://search.google.com/test/rich-results) - Check structured data
- [Google Search Console](https://search.google.com/search-console) - Monitor search performance

## 💡 SEO Best Practices Reminder

### Titles
- ✅ **50-60 characters** max
- ✅ **Unique** for every page
- ✅ **Front-load** important keywords
- ✅ **Include site name** with pipe separator

### Descriptions
- ✅ **150-160 characters** max
- ✅ **Compelling** - make people want to click
- ✅ **Include call-to-action** when appropriate
- ✅ **Unique** for every page

### Images
- ✅ **1200 x 630px** for social sharing
- ✅ **Readable text** even when scaled down
- ✅ **Under 1MB** file size
- ✅ **JPG or PNG** format

## 🛠️ Maintenance Schedule

- **Weekly**: Check for any SEO errors in console
- **Monthly**: Review top pages in analytics
- **When adding content**: Ensure proper metadata is set
- **When publishing**: Test social sharing cards

## 📚 File Reference

| File | Purpose |
|------|---------|
| `/utils/seo/metadata.ts` | All page titles, descriptions, keywords |
| `/utils/seo/structured-data.ts` | Schema.org generators for rich snippets |
| `/components/SEO.tsx` | Component that updates meta tags |
| `/App.tsx` → `getSEOData()` | Routes pages to their metadata |
| `/docs/SEO-SYSTEM.md` | Complete documentation |

## 🎯 What's Next?

Priority tasks to complete the SEO setup:

1. **Create default OG image** (1200x630px)
2. **Update author name and Twitter handle** in metadata.ts
3. **Test all major pages** with social preview tools
4. **Connect project data** to SEO system (optional enhancement)
5. **Set up Google Search Console** after deployment

## ❓ Need Help?

- **Full docs**: See `/docs/SEO-SYSTEM.md`
- **Testing issues**: Check browser console for errors
- **Meta tags not updating**: Verify `getSEOData()` in App.tsx
- **Social preview broken**: Check image paths and sizes

---

**Status**: ✅ Core SEO system is live and working  
**Maintained**: Yes, system auto-updates with content  
**Next Review**: After you add author info and default OG image
