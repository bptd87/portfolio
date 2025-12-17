# Public Site Component Analysis: Repetition & Outliers

## 🔄 Major Repetitive Patterns

### 1. **Project Detail Pages - 7 Different Versions!** (CRITICAL)

**Found:**
- `ProjectDetail.tsx` - Original scenic design template
- `ProjectDetailNew.tsx` - Updated version with design docs support
- `ExperientialProjectDetail.tsx` - Experiential design specific
- `RenderingProjectDetail.tsx` - Rendering specific
- `portfolio/DynamicProject.tsx` - Dynamic routing version
- `portfolio/ExperientialTemplate.tsx` - Template component
- `portfolio/RenderingTemplate.tsx` - Template component

**Issue:** 
- Massive code duplication (~5,000+ lines across all versions)
- Inconsistent layouts and features
- Hard to maintain - changes need to be made in multiple places
- Unclear which one is the "canonical" version

**Similar Patterns Across All:**
```typescript
- useState for project data
- useEffect to fetch project
- Navigation arrows (prev/next)
- Header with title, description, metadata
- Gallery/image displays
- Engagement buttons (Like, Share, Views)
- Project info boxes (venue, year, location, etc.)
- Related projects section
```

**Recommendation:** 
- Consolidate into ONE dynamic component that handles all project types
- Use template components for category-specific layouts
- Single source of truth for project detail logic

---

### 2. **Gallery Components - 5 Similar Components**

**Found:**
- `ImageGallery.tsx` - Grid/carousel/masonry layouts
- `PhotoGallery.tsx` - Photo grid with lightbox
- `ImageSlideshow.tsx` - Full-screen slideshow
- `ImageLightbox.tsx` - Modal lightbox viewer
- `GalleryBlock.tsx` - Content block renderer

**Issue:**
- Overlapping functionality
- Different APIs for similar features
- Unclear which to use when

**Recommendation:**
- Consolidate into one flexible `Gallery` component with layout variants
- Keep `ImageLightbox` as separate modal component

---

### 3. **Project Card Rendering - Duplicated Logic**

**Found in:**
- `ProjectCard.tsx` - Shared component (GOOD)
- `MasonryGrid.tsx` - Custom card rendering
- `Portfolio.tsx` - Inline card rendering
- `Home.tsx` - Custom project display

**Issue:**
- Some places use `ProjectCard` component ✅
- Other places duplicate the card HTML inline ❌
- Inconsistent styling and behavior

**Recommendation:**
- Use `ProjectCard` component everywhere
- Remove inline card rendering

---

### 4. **Article/Blog Templates - Multiple Versions**

**Found:**
- `scenic-insights/DynamicArticle.tsx` - Dynamic article renderer
- `news/NewsArticle.tsx` - News article template
- `scenic-studio/DynamicTutorial.tsx` - Tutorial template
- `scenic-studio/TutorialTemplate.tsx` - Another tutorial template
- `scenic-studio/WalkthroughTemplate.tsx` - Walkthrough template

**Issue:**
- Similar article rendering logic duplicated
- Inconsistent layouts

**Recommendation:**
- Use `DynamicArticle.tsx` as base
- Create template variants for different content types

---

### 5. **Page Header Pattern - Repeated Everywhere**

**Found in:**
- Every project detail page
- Every article page
- Every tutorial page

**Common Pattern:**
```tsx
<div className="border-b border-black/10 pb-12 mb-16">
  <div className="flex items-center gap-3 mb-8">
    <span className="badge">{category}</span>
    <span className="badge">{subcategory}</span>
  </div>
  <h1>{title}</h1>
  <p className="description">{description}</p>
</div>
```

**Recommendation:**
- Create `PageHeader` component (already exists in shared!)
- Use it consistently everywhere

---

## 🎯 Outliers & Issues

### 1. **Legacy Project Pages** (Hardcoded)
```
src/pages/projects/
  - AllMySons.tsx
  - Lysistrata.tsx
  - MuchAdoAboutNothing.tsx
  - NewSwanVenueFile.tsx
  - ParkAndShop.tsx
  - RedLineCafe.tsx
  - SouthsideBethelBaptistChurch.tsx
```

**Issue:** 
- Hardcoded project pages instead of using dynamic routing
- Maintenance nightmare - need to create new file for each project
- Inconsistent with rest of site

**Recommendation:**
- Migrate to dynamic routing using `DynamicProject.tsx`
- Archive these as legacy

---

### 2. **Duplicate Studio Pages**
- `Studio.tsx`
- `StudioNew.tsx`

**Issue:** Two versions, unclear which is active

**Recommendation:** Consolidate or remove old one

---

### 3. **Inconsistent Image Handling**

**Found:**
- Some use `ImageWithFallback` ✅
- Some use plain `<img>` tags ❌
- Some use different image properties (`cardImage` vs `coverImage` vs `image`)

**Issue:** Inconsistent image loading, error handling, optimization

**Recommendation:**
- Standardize on `ImageWithFallback` everywhere
- Standardize image property names

---

### 4. **Navigation Pattern Inconsistency**

**Found:**
- Some pages use `onNavigate` prop
- Some use React Router directly
- Some use custom navigation

**Issue:** Inconsistent navigation patterns

**Recommendation:**
- Standardize on one navigation method

---

### 5. **Engagement Components - Good Pattern!**

**Found:**
- `LikeButton.tsx` - Used consistently ✅
- `ShareButton.tsx` - Used consistently ✅
- `RelatedProjects.tsx` - Used consistently ✅

**Status:** ✅ These are well-designed and used consistently!

---

## 📊 Statistics

- **Total Pages:** 69
- **Project Detail Versions:** 7 (should be 1-2)
- **Gallery Components:** 5 (should be 1-2)
- **Hardcoded Project Pages:** 7 (should be 0)
- **Article Templates:** 5+ (could be 1-2)
- **Lines of Duplicated Code:** ~8,000+ (estimated)

---

## 🎯 Priority Fixes

### High Priority
1. **Consolidate Project Detail Pages** - Biggest win, reduce ~5,000 lines
   - Keep: `DynamicProject.tsx` as main
   - Use: Template components for category-specific layouts
   - Archive: Old versions

2. **Standardize Image Usage** - Use `ImageWithFallback` everywhere
   - Find all `<img>` tags
   - Replace with `ImageWithFallback`
   - Standardize property names

3. **Migrate Hardcoded Projects** - Use dynamic routing
   - Move to database/content
   - Use `DynamicProject.tsx`
   - Remove hardcoded files

### Medium Priority
4. **Consolidate Gallery Components** - Reduce from 5 to 1-2
5. **Use PageHeader Component** - Already exists, use it everywhere
6. **Standardize Project Cards** - Use `ProjectCard` component everywhere

### Low Priority
7. **Consolidate Article Templates** - Use `DynamicArticle` as base
8. **Remove Duplicate Studio Pages** - Keep one version

---

## ✅ What's Working Well

1. **Shared Components** - `ProjectCard`, `BlogCard`, `LikeButton`, `ShareButton` are well-designed
2. **Content Rendering** - `ContentRenderer` and `BlockRenderer` handle content blocks well
3. **Responsive Design** - Good use of responsive classes throughout
4. **Type Safety** - Good TypeScript usage

---

## 📝 Recommendations Summary

### Immediate Actions:
1. **Create unified `ProjectDetail` component** - Single component, template-based layouts
2. **Standardize on `ImageWithFallback`** - Replace all `<img>` tags
3. **Migrate hardcoded projects** - Use dynamic routing
4. **Use `PageHeader` component** - Already exists in shared/

### Architecture Improvements:
5. **Template-based system** - Base component + category templates
6. **Consistent navigation** - Standardize on one method
7. **Image property standardization** - Pick one property name

---

## 🔍 Code Duplication Examples

### Example 1: Project Header (repeated 7+ times)
```tsx
// Found in: ProjectDetail, ProjectDetailNew, ExperientialProjectDetail, etc.
<div className="border-b border-black/10 pb-12 mb-16">
  <div className="flex items-center gap-3 mb-8">
    <span className="badge">{category}</span>
  </div>
  <h1>{title}</h1>
  <p>{description}</p>
</div>
```

### Example 2: Navigation Arrows (repeated 5+ times)
```tsx
// Found in multiple project detail pages
{prevProject && (
  <button onClick={() => navigateToProject(prevProject.slug)}>
    <ChevronLeft />
  </button>
)}
```

### Example 3: Engagement Bar (repeated 4+ times)
```tsx
// Found in multiple project detail pages
<div className="flex items-center gap-6">
  <LikeButton projectId={project.id} />
  <ShareButton title={project.title} />
</div>
```

---

## 💡 Proposed Solution Structure

```
src/
  components/
    shared/
      ProjectDetail/          # NEW: Unified project detail
        index.tsx             # Main component
        templates/
          ScenicTemplate.tsx
          ExperientialTemplate.tsx
          RenderingTemplate.tsx
        components/
          ProjectHeader.tsx
          ProjectNavigation.tsx
          EngagementBar.tsx
          ProjectInfo.tsx
          ProjectGallery.tsx
```

This would reduce ~5,000 lines of duplicated code to ~1,000 lines of reusable components.

