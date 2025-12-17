# Portfolio Manager Analysis

## Current Structure

### ✅ Unified Manager
You have **ONE** `PortfolioManager` component that handles all project types.

### ⚠️ But Uses Different Editors
The manager conditionally shows different editors based on category:

1. **Scenic Design** → Default gallery editor
2. **Experiential Design** → `ExperientialDesignEditor` component
3. **Rendering & Visualization** → `RenderingEditor` component

## The Problem

### Different Data Structures
Each editor uses different data formats:

**Scenic Design:**
- Uses `galleries` object with hero/process sections
- Simple structure

**Experiential Design:**
- Uses `experientialContent` (ContentBlock[])
- Complex structured data (keyFeatures, process, team, metrics, etc.)
- Uses `ExperientialDesignEditor` component

**Rendering:**
- Uses `RenderingEditor` component
- Different structure (galleries, process, softwareUsed, etc.)

### Issues This Causes:

1. **Inconsistent UX** - Different interfaces for different types
2. **Data Migration Problems** - Switching categories might lose data
3. **Maintenance Burden** - Three different editors to maintain
4. **User Confusion** - Different workflows for different types

## Current Implementation

```tsx
// In PortfolioManager.tsx
{category?.includes('Experiential') ? (
  <ExperientialDesignEditor ... />
) : category?.includes('Rendering') ? (
  <RenderingEditor ... />
) : (
  // Default Scenic Design editor
  <GalleryEditor ... />
)}
```

## Recommendations

### Option 1: Unify Editors (Recommended)
- Create ONE unified editor that handles all types
- Use conditional fields based on category
- Same UX, different fields shown/hidden

### Option 2: Keep Separate but Standardize
- Keep separate editors but use same data structure
- Standardize the interface
- Make switching between types seamless

### Option 3: Category-Specific Managers
- Separate managers for each type
- More focused but more duplication

---

**Which approach would you prefer?** I can help unify this to make it more consistent! 🚀

