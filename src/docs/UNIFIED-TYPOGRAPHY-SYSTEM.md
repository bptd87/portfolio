# Unified Typography System

## Overview
The site now uses **Inter only** for all text. Clean, consistent, and modern.

---

## Font Stack
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
```

**Weights Available:**
- 300 (Light)
- 400 (Normal)
- 500 (Medium)
- 600 (Semibold)
- 700 (Bold)
- 800 (Extrabold)

---

## Typography Hierarchy

### HTML Elements (Semantic)
Use these for semantic HTML structure. They automatically apply the correct styling:

```tsx
<h1>Page Title</h1>      // 2.5-5rem, bold, -0.04em tracking
<h2>Section Title</h2>    // 2-3.5rem, semibold, -0.03em tracking
<h3>Subsection Title</h3> // 1.5-2rem, semibold, -0.02em tracking
<h4>Component Title</h4>  // 1.25rem, medium, -0.01em tracking
<h5>Small Section</h5>    // 1.125rem, medium
<h6>Micro Heading</h6>    // 1rem, semibold
<p>Body text</p>          // 1rem, normal, 1.6 line-height
```

### Utility Classes (Override)
Use these when you need specific typography without semantic HTML:

```tsx
// Display - Extra Large
<div className="text-display">Hero Text</div>  // 3-6rem, bold

// Headings
<div className="text-h1">Page Title</div>      // matches <h1>
<div className="text-h2">Section Title</div>   // matches <h2>
<div className="text-h3">Subsection</div>      // matches <h3>
<div className="text-h4">Component</div>       // matches <h4>
<div className="text-h5">Small Section</div>   // matches <h5>
<div className="text-h6">Micro</div>           // matches <h6>

// Body Text
<div className="text-body-lg">Large body</div> // 1.125rem
<div className="text-body">Normal body</div>   // 1rem
<div className="text-body-sm">Small body</div> // 0.9375rem

// UI Text
<div className="text-label">UI Label</div>     // 0.875rem, uppercase
<div className="text-caption">Caption</div>    // 0.75rem
```

---

## Typography Scale Reference

| Element | Size (desktop) | Weight | Line Height | Letter Spacing |
|---------|----------------|--------|-------------|----------------|
| Display | 3-6rem | Bold (700) | 1.0 | -0.05em |
| H1 | 2.5-5rem | Bold (700) | 1.05 | -0.04em |
| H2 | 2-3.5rem | Semibold (600) | 1.1 | -0.03em |
| H3 | 1.5-2rem | Semibold (600) | 1.2 | -0.02em |
| H4 | 1.25rem | Medium (500) | 1.3 | -0.01em |
| H5 | 1.125rem | Medium (500) | 1.4 | 0 |
| H6 | 1rem | Semibold (600) | 1.5 | 0 |
| Body | 1rem | Normal (400) | 1.6 | -0.01em |
| Body Large | 1.125rem | Normal (400) | 1.7 | -0.01em |
| Body Small | 0.9375rem | Normal (400) | 1.6 | 0 |
| Label | 0.875rem | Medium (500) | 1.5 | 0 |
| Caption | 0.75rem | Normal (400) | 1.5 | 0.01em |

---

## Usage Examples

### Page Header
```tsx
<h1>Brandon PT Davis</h1>
<h2>Scenic Designer & Educator</h2>
```

### Section with Cards
```tsx
<section>
  <h2>Recent Projects</h2>
  {projects.map(project => (
    <Card>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
    </Card>
  ))}
</section>
```

### Custom Component
```tsx
<div className="text-h3 mb-4">All My Sons</div>
<div className="text-body-lg text-muted-foreground">
  Directed by Arthur Miller
</div>
```

---

## Color System

### Black & White Only
```css
/* Light Mode */
--background: #ffffff
--foreground: #000000
--border: rgba(0, 0, 0, 0.1)  /* 1px borders */

/* Dark Mode */
--background: #000000
--foreground: #ffffff
--border: rgba(255, 255, 255, 0.1)  /* 1px borders */
```

### Accent Colors
```css
--studio-gold: #F78F1E    /* Light: #F78F1E, Dark: #FFA03E */
--forest-green: #1B4D3E   /* Light: #1B4D3E, Dark: #2D7A5F */
```

---

## Border Standards

**All borders are 1px maximum.**

```tsx
// Standard border
<div className="border border-border">

// No thicker borders allowed
<div className="border-2">  // ❌ Don't use
<div className="border">    // ✅ Use this (1px)
```

---

## Best Practices

1. **Use semantic HTML** (`<h1>`, `<h2>`, `<p>`) whenever possible
2. **Use utility classes** only when semantic HTML doesn't fit
3. **Never use custom font-size classes** like `text-3xl` - use the hierarchy
4. **All borders are 1px** - no exceptions
5. **Black & white** for text and backgrounds
6. **Studio Gold & Forest Green** for accents only

---

## Migration Guide

### Replace These:
```tsx
// Old
<div className="text-4xl font-bold">Title</div>
<p className="text-lg">Body text</p>

// New
<h2>Title</h2>
<p>Body text</p>
```

### Or Use Utilities:
```tsx
// Old
<div className="text-3xl font-semibold tracking-tight">Title</div>

// New
<div className="text-h2">Title</div>
```

---

## Quick Reference Card

```
DISPLAY:  text-display   (3-6rem, bold)
H1:       text-h1        (2.5-5rem, bold)
H2:       text-h2        (2-3.5rem, semibold)
H3:       text-h3        (1.5-2rem, semibold)
H4:       text-h4        (1.25rem, medium)
BODY:     text-body      (1rem, normal)
LABEL:    text-label     (0.875rem, medium, uppercase)
CAPTION:  text-caption   (0.75rem, normal)
```
