# SEO System Test Guide

## Quick Verification (2 minutes)

### 1. Start Your Development Server
```bash
npm run dev
# or
yarn dev
```

### 2. Open Browser Console
Open DevTools (F12) and go to Console tab

You should see:
```
🔍 SEO Debug Tools Loaded
Run: checkSEO() - Full SEO report
Run: checkMeta("og:title") - Check specific tag
Run: listAllMeta() - List all meta tags
```

### 3. Run SEO Check
In the console, type:
```javascript
checkSEO()
```

You should see a detailed report like:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SEO DEBUG REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 TITLE:
   Scenic Design & Software | Theatre Design & macOS Productivity Tools
   Length: 68 characters ⚠️  (too long, should be < 60)

📄 DESCRIPTION:
   Award-winning scenic designer and software developer...
   Length: 156 characters ✅

🏷️  KEYWORDS:
   scenic design, theatre design, set design...
   Count: 7 keywords ✅

🔗 CANONICAL URL:
   http://localhost:5173/ ✅

📱 OPEN GRAPH TAGS:
   og:title: Scenic Design & Software... ✅
   og:description: Award-winning scenic designer... ✅
   og:image: /og-default.jpg ✅
   ...
```

### 4. Test Navigation
Navigate to different pages:
- Portfolio
- Resources
- About
- A blog post

Run `checkSEO()` on each page. You should see:
- ✅ Different title on each page
- ✅ Different description on each page
- ✅ Canonical URL updates
- ✅ No console errors

### 5. View Page Source
Right-click page → "View Page Source"

Search for (Ctrl+F):
- `<title>` - Should be unique and descriptive
- `<meta name="description"` - Should exist
- `<meta property="og:` - Multiple Open Graph tags
- `<script type="application/ld+json"` - Structured data

## Detailed Testing

### Test Each Page Type

#### Homepage
```javascript
// Navigate to homepage
checkSEO()
```
**Expected**:
- Title includes site name
- WebSite schema in structured data
- Search action in structured data

#### Blog Post
```javascript
// Navigate to any blog post
checkSEO()
```
**Expected**:
- Title includes "| Scenic Insights"
- Article schema in structured data
- Published date in structured data
- og:type = "article"

#### Portfolio Page
```javascript
// Navigate to portfolio
checkSEO()
```
**Expected**:
- Title includes "Portfolio"
- Different metadata for each filter
- og:type = "website"

### Test Social Sharing

1. **Visit**: https://metatags.io/
2. **Enter**: Your localhost URL (e.g., http://localhost:5173)
3. **Check**:
   - Facebook preview shows correct image, title, description
   - Twitter preview shows correct card
   - LinkedIn preview shows correct info

### Test Structured Data

1. **Start server** and navigate to homepage
2. **View source** (Ctrl+U)
3. **Copy** the JSON-LD script content (between `<script type="application/ld+json">` tags)
4. **Visit**: https://search.google.com/test/rich-results
5. **Select**: "Code snippet" tab
6. **Paste** JSON-LD
7. **Click**: "Test Code"
8. **Verify**: Shows "Valid" with green checkmark

## Common Issues & Solutions

### Issue: Title not updating when navigating
**Cause**: React navigation not triggering SEO update  
**Solution**: Check that `getSEOData()` is called in render, not in useEffect

### Issue: All pages have same title
**Cause**: Metadata not configured for page  
**Solution**: Add page to `PAGE_METADATA` in `metadata.ts`

### Issue: No structured data showing
**Cause**: structuredData not passed to SEO component  
**Solution**: Check `getSEOData()` returns both metadata AND structuredData

### Issue: Social preview shows wrong image
**Cause**: Image path incorrect or image doesn't exist  
**Solution**: Check `ogImage` path in metadata, ensure image exists

### Issue: checkSEO() not defined
**Cause**: Debug tools not loaded  
**Solution**: Ensure you're in development mode, check console for errors

## Automated Tests (Optional)

Create this test file if you want automated testing:

```typescript
// __tests__/seo.test.ts
import { PAGE_METADATA } from '../utils/seo/metadata';

describe('SEO Metadata', () => {
  test('all pages have unique titles', () => {
    const titles = Object.values(PAGE_METADATA).map(m => m.title);
    const uniqueTitles = new Set(titles);
    expect(titles.length).toBe(uniqueTitles.size);
  });

  test('all descriptions are within length limits', () => {
    Object.entries(PAGE_METADATA).forEach(([page, meta]) => {
      expect(meta.description.length).toBeGreaterThanOrEqual(150);
      expect(meta.description.length).toBeLessThanOrEqual(160);
    });
  });

  test('all pages have canonical paths', () => {
    Object.entries(PAGE_METADATA).forEach(([page, meta]) => {
      expect(meta.canonicalPath).toBeDefined();
      expect(meta.canonicalPath).toMatch(/^\//);
    });
  });
});
```

## Production Verification

After deploying to production:

### 1. Test Live URLs
Visit these tools with your production URL:

- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/
- **Google**: https://search.google.com/test/rich-results

### 2. Check Search Console
1. Add site to Google Search Console
2. Submit sitemap
3. Request indexing for key pages
4. Monitor for errors

### 3. Monitor Performance
- Check Core Web Vitals
- Verify pages are indexed
- Monitor click-through rates
- Review search rankings

## Success Criteria

Your SEO system is working correctly if:

- ✅ Every page has a unique title
- ✅ Every page has a meta description
- ✅ Open Graph tags appear on all pages
- ✅ Twitter Card tags appear on all pages
- ✅ Canonical URLs are correct
- ✅ Structured data validates without errors
- ✅ Social previews show correct information
- ✅ No console errors related to SEO
- ✅ `checkSEO()` shows mostly green checkmarks

## Next Steps

Once testing is complete:

1. ✅ Update author info in metadata.ts
2. ✅ Create default OG image
3. ✅ Generate sitemap.xml
4. ✅ Create robots.txt
5. ✅ Deploy to production
6. ✅ Submit to Search Console
7. ✅ Monitor for one week
8. ✅ Review and optimize based on data

---

**Test Frequency**:
- Before each deployment
- After adding new pages
- Monthly spot checks
- When making SEO changes
