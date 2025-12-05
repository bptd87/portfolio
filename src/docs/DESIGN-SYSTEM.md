# Theatrical Cinema Design System
**Version 2.0** — Unified, production-ready design system for the scenic design portfolio website

---

## Design Philosophy

This design system blends **A24's stark minimalism** with **Disney's theatrical magic**, achieved through:

- **Apple-level precision**: Consistent spacing rhythm (8px grid), minimal animations, high contrast
- **Dieter Rams minimalism**: Remove unnecessary elements, functional hierarchy
- **Theatrical elements**: Gold accents (#D4AF37), spotlight effects, stardust particles
- **Consistent components**: Unified Button, Card, Input, and specialized cards

---

## Color Palette

### Light Mode
- **Background**: `#FFFFFF` (Pure white)
- **Foreground**: `#000000` (True black)
- **Theatrical Gold**: `oklch(0.70 0.12 85)` — Warm, magical accent
- **Spotlight**: `oklch(0.98 0.02 85)` — Warm glow effect
- **Muted**: `#F5F5F5` / `#666666`

### Dark Mode
- **Background**: `#000000` (True black)
- **Foreground**: `#FFFFFF` (Pure white)
- **Theatrical Gold**: `oklch(0.75 0.14 85)` — Brighter in dark mode
- **Muted**: `#1A1A1A` / `#999999`

### Semantic Colors
- **Border**: `rgba(0, 0, 0, 0.08)` light / `rgba(255, 255, 255, 0.08)` dark
- **Destructive**: `#DC2626` light / `#EF4444` dark

---

## Typography

### Hierarchy
- **H1**: Display headlines (5xl-8xl) — Tight tracking (-0.03em)
- **H2**: Section headers (3xl-5xl) — Tight tracking (-0.02em)
- **H3**: Subsection headers (lg-2xl) — Tight tracking (-0.01em)
- **Body**: 16px base (1rem) — Relaxed line height (1.7)
- **Small**: 14px (0.875rem) — Medium line height (1.5)
- **Tiny**: 12px (0.75rem) — Used for labels, badges

### Font Weights
- **Display**: 600 (Dramatic headings)
- **Medium**: 500 (Subheadings, buttons)
- **Normal**: 400 (Body text)
- **Light**: 300 (Secondary text)

### Best Practices
- **Never** use inline font-size classes (text-xl, text-2xl) unless requested
- Use system-defined heading tags (h1, h2, h3, h4)
- Maintain consistent letter-spacing: tight for large, normal for small
- Always use antialiasing: `-webkit-font-smoothing: antialiased`

---

## Spacing System

### Scale (based on 8px grid)
```css
--stage-spacing-xs:  0.5rem;  /* 8px  */
--stage-spacing-sm:  1rem;    /* 16px */
--stage-spacing-md:  1.5rem;  /* 24px */
--stage-spacing-lg:  3rem;    /* 48px */
--stage-spacing-xl:  6rem;    /* 96px */
--stage-spacing-2xl: 9rem;    /* 144px */
```

### Usage
- **Component padding**: Use `p-4`, `p-6`, `p-8`, `p-12` (16, 24, 32, 48px)
- **Section margins**: Use `mb-12`, `mb-16`, `mb-24`, `mb-32` (48, 64, 96, 128px)
- **Element gaps**: Use `gap-2`, `gap-4`, `gap-6`, `gap-8` (8, 16, 24, 32px)

### Responsive Adjustments
```css
@media (max-width: 768px) {
  --stage-spacing-lg:  2rem;  /* Reduce from 48px to 32px */
  --stage-spacing-xl:  4rem;  /* Reduce from 96px to 64px */
  --stage-spacing-2xl: 6rem;  /* Reduce from 144px to 96px */
}
```

---

## Border Radius

### Scale
```css
--radius-sm: calc(var(--radius) - 2px); /* 4px  */
--radius-md: var(--radius);             /* 6px  */
--radius-lg: calc(var(--radius) + 2px); /* 8px  */
--radius-xl: calc(var(--radius) + 4px); /* 10px */
```

### Usage
- **Small elements** (badges, tags): `rounded-md` (6px)
- **Buttons, inputs**: `rounded-xl` (12px)
- **Cards**: `rounded-2xl` (16px)
- **Large features**: `rounded-3xl` (24px)

**Note**: Consistency is key — don't mix border radius sizes arbitrarily.

---

## Shadows (Stage Depth)

### Layering System
```css
/* Default cards */
.stage-depth {
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 2px 4px rgba(0, 0, 0, 0.02),
    0 4px 8px rgba(0, 0, 0, 0.015);
}

/* Elevated/important cards */
.stage-elevated {
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 8px 16px rgba(0, 0, 0, 0.06),
    0 16px 32px rgba(0, 0, 0, 0.04);
}
```

### Dark Mode
- Shadows are **stronger** in dark mode to maintain depth perception
- Use sparingly — too many shadows create visual noise

---

## Transitions & Animations

### Easing Functions
```css
--transition-quick:    150ms cubic-bezier(0.4, 0, 0.2, 1);  /* Instant feedback */
--transition-smooth:   300ms cubic-bezier(0.4, 0, 0.2, 1);  /* Standard interaction */
--transition-dramatic: 600ms cubic-bezier(0.22, 1, 0.36, 1); /* Theatrical entrance */
```

### Interaction Patterns
- **Hover lift**: `translateY(-2px)` — Apple-inspired subtle lift
- **Hover scale**: `scale(1.02)` — Minimal scale, never > 1.05
- **Icon hover**: `translateX(3px)` — Arrows and chevrons
- **Button press**: `scale(0.98)` — Tactile feedback

### Motion Components
- Always use `motion` from `motion/react` (formerly Framer Motion)
- Standard delays: `0.1s`, `0.2s`, `0.3s` for staggered animations
- Use `whileInView` with `once: true` for scroll animations

---

## Component Library

### Button
**Variants**: `primary`, `secondary`, `outline`, `ghost`, `gold`  
**Sizes**: `sm`, `md`, `lg`

```tsx
import { Button } from './components/shared/Button';

<Button variant="primary" size="md" icon={ArrowRight}>
  Explore Portfolio
</Button>
```

**Usage Rules**:
- Primary buttons for main CTAs (max 1-2 per page)
- Secondary for alternative actions
- Gold variant for special theatrical moments
- Always use uppercase text: `EXPLORE`, `LEARN MORE`, etc.

---

### Card
**Variants**: `default`, `elevated`, `glass`, `bordered`, `spotlight`  
**Padding**: `none`, `sm`, `md`, `lg`

```tsx
import { Card } from './components/shared/Card';

<Card variant="glass" padding="md" interactive>
  {/* Content */}
</Card>
```

**Usage Rules**:
- `glass`: For overlays, modals, forms
- `elevated`: For important feature cards
- `spotlight`: For interactive hover effects
- `bordered`: For minimal, list-style layouts

---

### PageHeader
**Variants**: `minimal`, `hero`, `theatrical`

```tsx
import { PageHeader } from './components/shared/PageHeader';

<PageHeader
  variant="minimal"
  title="Portfolio"
  subtitle="Scenic designs for theatre, opera, and experiential installations."
  badge={{ text: 'Featured Work' }}
/>
```

**Usage Rules**:
- `minimal`: Standard pages (Portfolio, Contact, About)
- `hero`: Resource pages with background images
- `theatrical`: Homepage or special landing pages

---

### ProjectCard
Specialized card for portfolio items.

```tsx
import { ProjectCard } from './components/shared/ProjectCard';

<ProjectCard
  title="Million Dollar Quartet"
  venue="South Coast Repertory"
  location="Costa Mesa, CA"
  year={2025}
  category="Scenic Design"
  subcategory="Musical"
  description="..."
  image={projectImage}
  onClick={() => navigate('project/mdq')}
/>
```

---

### BlogCard
Specialized card for blog/article listings.

```tsx
import { BlogCard } from './components/shared/BlogCard';

<BlogCard
  variant="featured"
  title="Computer Hardware Guide"
  excerpt="Essential guidance on choosing the right hardware..."
  date="Mar 17, 2025"
  category="Technology"
  readTime="12 min read"
  icon={Lightbulb}
  onClick={() => navigate('blog/hardware-guide')}
/>
```

**Variants**: `default`, `compact`, `featured`

---

### Input Components
Unified form elements with consistent styling.

```tsx
import { Input, Textarea, Select } from './components/shared/Input';

<Input 
  label="Name *" 
  type="text" 
  placeholder="Your name"
  required
/>

<Select 
  label="Project Type"
  options={[
    { value: 'theater', label: 'Theater' },
    { value: 'film', label: 'Film' },
  ]}
/>
```

---

## Utility Classes

### Theatrical Effects
```css
.spotlight-hover     /* Theatrical gold glow on hover */
.glass               /* Glassmorphism effect */
.stage-depth         /* Subtle shadow layering */
.stage-elevated      /* Strong shadow for emphasis */
.hover-lift          /* Apple-style lift on hover */
.hover-scale         /* Minimal scale transform */
.icon-hover          /* Arrow/icon slide animation */
```

### Usage Example
```tsx
<div className="bg-white/80 dark:bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/5 p-8 spotlight-hover stage-depth">
  {/* Content */}
</div>
```

---

## Accessibility

### Contrast Requirements
- **Text on white**: Minimum contrast ratio 4.5:1
- **Text on black**: Use `rgba(255, 255, 255, 0.9)` for optimal readability
- **Interactive elements**: Minimum 44x44px touch target
- **Focus states**: Always visible with `focus:outline-none focus:ring-2`

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use semantic HTML (`<button>`, `<a>`, `<label>`)
- Provide `aria-label` for icon-only buttons

### Screen Readers
- Use descriptive alt text for images
- Provide ARIA labels where necessary
- Maintain logical heading hierarchy (h1 → h2 → h3)

---

## Responsive Design

### Breakpoints
```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

### Mobile-First Approach
- Design for mobile first, enhance for desktop
- Use `md:` and `lg:` prefixes for larger screens
- Reduce spacing on mobile (see spacing system)
- Stack grids vertically: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Common Patterns
```tsx
{/* Mobile: stack | Desktop: 2 columns */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

{/* Mobile: small padding | Desktop: large padding */}
<div className="px-4 md:px-6 py-12 md:py-16">

{/* Mobile: smaller text | Desktop: larger text */}
<h1 className="text-4xl md:text-6xl lg:text-8xl">
```

---

## Dark Mode Best Practices

### Color Adjustments
- Use `dark:` prefix for dark mode variants
- Increase opacity for better visibility: `text-white/90` instead of `text-white/60`
- Reduce shadow intensity or remove entirely
- Use theatrical gold more prominently

### Example
```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
  <p className="text-black/60 dark:text-white/80">
    Body text with proper contrast in both modes
  </p>
</div>
```

---

## Don'ts ❌

1. **Don't** use arbitrary font sizes (`text-3xl`, `text-5xl`) — rely on heading tags
2. **Don't** mix border radius inconsistently
3. **Don't** over-animate — subtle is better
4. **Don't** use box shadows without dark mode adjustments
5. **Don't** create custom components when shared components exist
6. **Don't** use inline styles except for dynamic values (animations, positions)
7. **Don't** exceed `scale(1.05)` on hover — too aggressive
8. **Don't** forget to test in both light and dark modes

---

## Migration Checklist

When updating existing pages:

- [ ] Replace custom buttons with `<Button>` component
- [ ] Replace custom cards with `<Card>` component
- [ ] Replace header sections with `<PageHeader>` component
- [ ] Use `<ProjectCard>` for portfolio items
- [ ] Use `<BlogCard>` for blog/article listings
- [ ] Replace form inputs with `<Input>`, `<Textarea>`, `<Select>`
- [ ] Standardize spacing using Tailwind scale (4, 6, 8, 12, 16, 24, 32)
- [ ] Unify border radius (rounded-xl for buttons, rounded-2xl for cards)
- [ ] Add consistent hover effects (`hover:` states)
- [ ] Test dark mode appearance
- [ ] Verify mobile responsiveness

---

## Resources

- **Design tokens**: `/styles/globals.css`
- **Components**: `/components/shared/`
- **Icons**: `lucide-react` package
- **Animations**: `motion/react` (Framer Motion)
- **Image handling**: `ImageWithFallback` for all images

---

**Last Updated**: December 2025  
**Maintained by**: Brandon PT Davis
