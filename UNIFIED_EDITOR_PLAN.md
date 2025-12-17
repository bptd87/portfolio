# Unified Editor Plan - Option 1

## ✅ What Will Be Preserved

### 1. **ALL Features from Each Editor**

**Experiential Design Features:**
- ✅ Key Features (title + description)
- ✅ Process Steps (with images)
- ✅ Team Members
- ✅ Metrics/Stats
- ✅ Testimonials
- ✅ Additional Galleries (with layouts)
- ✅ Video URLs
- ✅ Content Blocks

**Rendering Features:**
- ✅ Project Narrative/Overview
- ✅ Software Used
- ✅ Render Resolution
- ✅ Multiple Galleries (with layouts)
- ✅ Process Steps
- ✅ Video URLs

**Scenic Design Features:**
- ✅ Hero Gallery
- ✅ Process Gallery
- ✅ YouTube Videos
- ✅ Design Notes
- ✅ Credits

### 2. **Different Page Layouts (Frontend)**

**This is IMPORTANT and will be preserved!**

The frontend uses **different page templates** based on category:

- **Experiential Design** → `ExperientialProjectDetail.tsx` (different layout)
- **Rendering** → `RenderingProjectDetail.tsx` (different layout)
- **Scenic Design** → `ProjectDetailNew.tsx` (default layout)

**These frontend templates will NOT change!** They'll still render differently based on the category.

---

## 🎯 How Option 1 Works

### Unified Editor Structure

```
PortfolioManager
  └─ UnifiedEditor (one component)
      ├─ Basic Info Tab (same for all)
      ├─ Media Tab (conditional fields)
      │   ├─ If Experiential: Show Experiential fields
      │   ├─ If Rendering: Show Rendering fields
      │   └─ If Scenic: Show Scenic fields
      ├─ Details Tab (conditional fields)
      └─ SEO Tab (same for all)
```

### Conditional Field Display

The editor will show/hide fields based on selected category:

```tsx
{category === 'Experiential Design' && (
  // Show: Key Features, Process, Team, Metrics, Testimonials
)}

{category === 'Rendering & Visualization' && (
  // Show: Project Overview, Software Used, Render Resolution
)}

{category === 'Scenic Design' && (
  // Show: Hero Gallery, Process Gallery, Design Notes
)}
```

### Data Structure

All data is stored in the same database structure, but:
- Different fields are populated based on category
- Frontend templates read the data they need
- No data loss when switching categories

---

## 📊 Feature Comparison

| Feature | Experiential | Rendering | Scenic | Unified Editor |
|---------|------------|-----------|--------|----------------|
| Key Features | ✅ | ❌ | ❌ | ✅ (conditional) |
| Process Steps | ✅ | ✅ | ❌ | ✅ (all types) |
| Team Members | ✅ | ❌ | ❌ | ✅ (conditional) |
| Metrics | ✅ | ❌ | ❌ | ✅ (conditional) |
| Testimonials | ✅ | ❌ | ❌ | ✅ (conditional) |
| Project Overview | ❌ | ✅ | ❌ | ✅ (conditional) |
| Software Used | ❌ | ✅ | ❌ | ✅ (conditional) |
| Galleries | ✅ | ✅ | ✅ | ✅ (all types) |
| Video URLs | ✅ | ✅ | ✅ | ✅ (all types) |
| Design Notes | ❌ | ❌ | ✅ | ✅ (conditional) |

**Result:** You get ALL features, just shown conditionally!

---

## 🎨 Frontend Layouts (Unchanged)

### Experiential Layout
- Hero carousel
- Challenge/Solution sections
- Key Features grid
- Process timeline
- Team section
- Metrics display
- Testimonials
- Additional galleries

### Rendering Layout
- Hero image
- Project narrative (prominent)
- Technical details sidebar
- Gallery sections
- Process steps
- Related projects

### Scenic Design Layout
- Hero gallery
- Project info
- Process gallery
- Design notes
- Credits
- YouTube videos

**All these layouts stay exactly the same!** The unified editor just makes it easier to manage the data.

---

## 💡 Benefits of Unified Editor

1. **Same Features** - Nothing is lost
2. **Different Layouts** - Frontend templates unchanged
3. **Consistent UX** - Same interface for all types
4. **Easier Maintenance** - One editor instead of three
5. **Better Data Management** - Unified data structure
6. **No Data Loss** - Switching categories preserves data

---

## 🔧 Implementation Plan

### Phase 1: Create Unified Editor
- Combine all three editors into one
- Add conditional field rendering
- Preserve all features

### Phase 2: Update PortfolioManager
- Replace conditional editors with unified one
- Test all category types
- Verify data saving/loading

### Phase 3: Test Frontend
- Verify Experiential layout works
- Verify Rendering layout works
- Verify Scenic layout works

---

## ✅ Guarantees

1. **All features preserved** - Every field from every editor
2. **Different layouts maintained** - Frontend templates unchanged
3. **Better UX** - Consistent interface
4. **No breaking changes** - Existing projects work
5. **Easier to use** - One editor, not three

---

**Yes, Option 1 gives you the same features AND different page layouts!** 

The unified editor just makes it easier to manage, but the frontend will still render each type differently. Should I proceed with this? 🚀

