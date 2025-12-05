# Brandon PT Davis — Refined Design System
**Version 3.0** — Art × Technology × Stagecraft

---

## Design Philosophy

This design system expresses the dual nature of a scenic designer who blends **artistry** with **precision**. It's a fusion of:

- **Creative Studio Aesthetic** — Modern, airy, professional workspace (light mode)
- **Cinematic Stage Lighting** — Immersive, dramatic, theatrical depth (dark mode)
- **Technical Precision** — Clean typography, consistent spacing, purposeful motion
- **Theatrical Undertones** — Spotlight effects, stage depth, render-inspired lighting

---

## Brand Identity

### Typography

**Headers**: Inter (sans-serif) — Modern, clean, technical precision
**Body**: Noto Serif (serif) — Sophisticated, readable, editorial quality

```css
--font-sans: 'Inter', -apple-system, sans-serif;
--font-serif: 'Noto Serif', Georgia, serif;
```

### Brand Colors

```css
/* Primary Accent */
--studio-gold: #F78F1E    /* Vibrant orange-gold - creative energy */

/* Secondary Accent */
--forest-green: #1B4D3E   /* Deep evergreen - grounded sophistication */

/* Neutrals */
--foreground: #000000     /* Pure black (light mode) */
--background: #ffffff     /* Pure white (light mode) */
```

### Color Psychology

- **Studio Gold (#F78F1E)**: Creative spark, theatrical spotlight, innovation
- **Forest Green (#1B4D3E)**: Craft, nature, theatrical tradition, depth
- **Black & White**: Maximum contrast, editorial clarity, architectural precision

---

## Light Mode — Airy Studio Aesthetic

**Mood**: Professional, clean, open workspace. Light floods through large windows. Organized creative energy.

```css
--background: #ffffff
--foreground: #000000
--secondary: #f8f8f7      /* Warm light gray */
--muted-foreground: #6b6b6b
--border: rgba(0, 0, 0, 0.08)
--studio-gold: #F78F1E
--forest-green: #1B4D3E
```

**Design Characteristics**:
- High contrast for clarity
- Subtle borders and shadows
- Warm undertones (not cold blue-grays)
- Feels like a designer's well-lit studio

---

## Dark Mode — Cinematic Stage Lighting

**Mood**: Immersive, dramatic, theatrical. Stage lights illuminate from darkness. Render preview aesthetic.

```css
--background: #0a0a0a     /* Deep black (not pure #000) */
--foreground: #f5f5f5     /* Soft white (easier on eyes) */
--secondary: #1a1a18      /* Warm charcoal */
--muted-foreground: #a3a3a3
--border: rgba(255, 255, 255, 0.08)
--studio-gold: #FFA03E    /* Brighter - theatrical spotlight */
--forest-green: #2D7A5F   /* Lighter - maintains depth */
```

**Design Characteristics**:
- Rich contrast without harshness
- Stronger shadows for depth
- Warm undertones (stage warmth, not blue screens)
- Enhanced gold for spotlight effect
- Feels like a render or stage preview

---

## Typography Hierarchy

### Headers (Inter)
```css
h1: clamp(2rem, 5vw, 4rem)      /* 32-64px, weight 600 */
h2: clamp(1.5rem, 3vw, 2.5rem)  /* 24-40px, weight 600 */
h3: clamp(1.25rem, 2vw, 1.875rem) /* 20-30px, weight 500 */
h4: 1.25rem                      /* 20px, weight 500 */
```

### Body (Noto Serif)
```css
Body text: 1rem (16px), line-height 1.75, weight 400
Large text: 1.125rem (18px), line-height 1.8
Small text: 0.875rem (14px), line-height 1.5
```

### UI Elements (Inter)
```css
Buttons: 0.875rem, weight 500, uppercase, letter-spacing 0.05em
Labels: 0.875rem, weight 500, uppercase, letter-spacing 0.02em
Inputs: 0.9375rem, weight 400
```

---

## Spacing System (8px Grid)

```css
--space-xs:  0.5rem   /* 8px  */
--space-sm:  1rem     /* 16px */
--space-md:  1.5rem   /* 24px */
--space-lg:  3rem     /* 48px */
--space-xl:  6rem     /* 96px */
--space-2xl: 9rem     /* 144px */
```

### Usage Rules
- **Component padding**: `p-4`, `p-6`, `p-8`, `p-10` (16, 24, 32, 40px)
- **Section margins**: `mb-16`, `mb-24`, `mb-32` (64, 96, 128px)
- **Element gaps**: `gap-4`, `gap-6`, `gap-8` (16, 24, 32px)

---

## Border Radius

```css
--radius: 0.5rem  /* 8px base - balanced architectural */

/* Scale */
--radius-sm: 6px   /* Small elements, badges */
--radius-md: 8px   /* Standard (buttons, inputs) */
--radius-lg: 12px  /* Cards */
--radius-xl: 16px  /* Large features */
```

### Usage
- Buttons: `rounded-xl` (12px)
- Cards: `rounded-2xl` (16px)
- Inputs: `rounded-xl` (12px)
- Badges: `rounded-lg` (8px)

---

## Depth & Elevation System

Inspired by theatrical staging layers.

### Subtle Depth (`.depth-sm`)
```css
box-shadow: 
  0 1px 2px rgba(0, 0, 0, 0.04),
  0 2px 4px rgba(0, 0, 0, 0.02);
```
**Use for**: Standard cards, containers

### Medium Depth (`.depth-md`)
```css
box-shadow: 
  0 2px 4px rgba(0, 0, 0, 0.05),
  0 4px 12px rgba(0, 0, 0, 0.04),
  0 8px 24px rgba(0, 0, 0, 0.02);
```
**Use for**: Featured cards, interactive elements

### Strong Depth (`.depth-lg`)
```css
box-shadow: 
  0 4px 8px rgba(0, 0, 0, 0.06),
  0 12px 32px rgba(0, 0, 0, 0.08),
  0 24px 64px rgba(0, 0, 0, 0.04);
```
**Use for**: Modals, dropdowns, popovers

**Dark Mode**: All shadows are stronger (0.3-0.5 alpha) to maintain depth perception.

---

## Stage Lighting Effects

### Spotlight Hover
Radial gradient from top, simulating theatrical spotlight.
```css
.spotlight-hover:hover::before {
  opacity: 0.08; /* light mode */
  opacity: 0.12; /* dark mode */
}
```

### Rim Light
Subtle edge glow, inspired by render lighting.
```css
.rim-light:hover::after {
  opacity: 0.15; /* light mode */
  opacity: 0.25; /* dark mode */
}
```

### Glass Morphism
Studio workspace aesthetic.
```css
.glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px) saturate(180%);
}
```

---

## Motion & Transitions

### Timing Functions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)  /* Instant feedback */
--transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1)  /* Standard */
--transition-slow: 600ms cubic-bezier(0.22, 1, 0.36, 1) /* Dramatic */
```

### Interaction Patterns
- **Lift on hover**: `translateY(-2px)` — Subtle elevation
- **Gentle scale**: `scale(1.015)` — Never exceeds 1.02
- **Icon shift**: `translateX(3px)` — Arrows and navigation

### Animation Principles
1. **Purposeful, not decorative** — Every motion has meaning
2. **Subtle, not flashy** — Enhances, doesn't distract
3. **Consistent timing** — Same duration for similar actions
4. **Respects user motion preferences** — Reduce motion when requested

---

## Component Library

### Button

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `gold`, `green`
**Sizes**: `sm`, `md`, `lg`

```tsx
<Button variant="primary" size="md" icon={ArrowRight}>
  Explore Portfolio
</Button>
```

**Design Rules**:
- Primary: Black bg (light) / White bg (dark)
- Gold: Studio gold, used sparingly for CTAs
- Green: Forest green, secondary emphasis
- Always uppercase with wide letter-spacing

---

### Card

**Variants**: `default`, `elevated`, `glass`, `bordered`, `spotlight`
**Padding**: `none`, `sm`, `md`, `lg`, `xl`

```tsx
<Card variant="glass" padding="md" interactive>
  {/* Content */}
</Card>
```

**Design Rules**:
- `glass`: Forms, overlays, navbar
- `elevated`: Featured content
- `spotlight`: Interactive hover effects
- `bordered`: Minimal, list-style layouts

---

### PageHeader

**Variants**: `minimal`, `hero`, `immersive`

```tsx
<PageHeader
  variant="hero"
  title="Resources"
  subtitle="Tools, tutorials, and insights..."
  badge={{ icon: Library, text: 'Knowledge Archive' }}
  backgroundImage="url"
  withStardust
/>
```

**Design Rules**:
- `minimal`: Standard pages (Portfolio, Contact, About)
- `hero`: Pages with dramatic entry (Resources)
- `immersive`: Homepage, special landing pages

---

## UX Flow & Navigation

### Site Structure
```
HOME
├── PORTFOLIO (filtered views)
├── ABOUT
│   ├── Bio
│   ├── News
│   ├── CV
│   └── Collaborators
├── RESOURCES
│   ├── Scenic Insights (blog)
│   ├── Scenic Toolkit
│   └── Scenic Studio
├── SOFTWARE
│   ├── Daedalus
│   └── Sophia
└── CONTACT
```

### Navigation Patterns
1. **Primary navigation**: Fixed navbar with dropdown menus
2. **Back buttons**: Return to parent category
3. **Breadcrumbs**: Show location in hierarchy (text in navbar)
4. **Related content**: At bottom of detail pages
5. **Search**: Global search accessible from navbar

### Hover States
- **Links**: Text changes to studio gold
- **Cards**: Lift 2px, depth increases
- **Buttons**: Slight scale (1.015)
- **Icons**: Shift 3px right (arrows)

---

## Accessibility

### Contrast Requirements
- **Text on white**: Minimum 4.5:1 (WCAG AA)
- **Text on black**: Use #f5f5f5 (softer than pure white)
- **Interactive elements**: 44x44px minimum touch target
- **Focus states**: Visible ring (2px, studio gold)

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Semantic elements (`<nav>`, `<main>`, `<article>`)
- ARIA labels for icon-only buttons
- Alt text for all images

---

## Responsive Design

### Breakpoints
```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
```

### Mobile-First Approach
```tsx
{/* Mobile: stack | Desktop: 2 columns */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

{/* Responsive padding */}
<div className="px-4 md:px-6 py-12 md:py-16">

{/* Responsive text */}
<h1 className="text-4xl md:text-6xl lg:text-8xl">
```

---

## Do's ✅

1. **Use semantic HTML** — Proper tags for proper meaning
2. **Maintain spacing rhythm** — Stick to the 8px grid
3. **Test dark mode** — Both modes should feel intentional
4. **Use brand colors purposefully** — Gold for highlights, green for secondary
5. **Keep motion subtle** — Enhance, don't distract
6. **Preserve typography** — Inter for headers, Noto Serif for body

---

## Don'ts ❌

1. **Don't mix typefaces arbitrarily** — Headers = Inter, Body = Noto Serif
2. **Don't overuse gold** — It's an accent, not a primary color
3. **Don't over-animate** — Subtle is better
4. **Don't create inconsistent borders** — Use radius scale
5. **Don't forget mobile** — Design mobile-first
6. **Don't use pure black (#000) in dark mode** — Use #0a0a0a
7. **Don't use pure white (#fff) for text in dark mode** — Use #f5f5f5

---

## Implementation Checklist

When creating/updating pages:

- [ ] Import correct fonts (Inter + Noto Serif)
- [ ] Use PageHeader component (minimal, hero, or immersive)
- [ ] Apply Card variants consistently
- [ ] Use Button component (not custom buttons)
- [ ] Test light and dark modes
- [ ] Verify spacing follows 8px grid
- [ ] Check typography hierarchy (headings = Inter, body = Noto Serif)
- [ ] Test hover states (studio gold accent)
- [ ] Verify responsive behavior
- [ ] Check accessibility (contrast, focus states, semantic HTML)

---

**Last Updated**: December 2025  
**Maintained by**: Brandon PT Davis  
**Design Philosophy**: Art × Technology × Stagecraft
