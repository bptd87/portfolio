# Figma File Structure Guide
## Brandon PT Davis Portfolio - Design System

**Purpose:** Master design file for Vercel + Supabase React portfolio  
**Status:** Ready to create  
**Last Updated:** December 1, 2025

---

## 📁 FIGMA FILE ARCHITECTURE

```
Brandon PT Davis Portfolio (Master File)
├── 🎨 DESIGN TOKENS
│   ├── Colors
│   ├── Typography
│   ├── Spacing & Grid
│   ├── Border Radius
│   ├── Shadows & Effects
│   └── Transitions & Animations
│
├── 🧩 COMPONENT LIBRARY
│   ├── Layout
│   │   ├── Navbar (Light/Dark)
│   │   ├── Footer (Light/Dark)
│   │   └── Sidebar (if needed)
│   ├── Forms
│   │   ├── Text Input (states: default, focus, error, disabled)
│   │   ├── Select Dropdown
│   │   ├── Textarea
│   │   ├── Checkbox
│   │   ├── Radio Button
│   │   └── Toggle Switch
│   ├── Buttons
│   │   ├── Primary Button (hover, active, disabled)
│   │   ├── Secondary Button (hover, active, disabled)
│   │   ├── Destructive Button
│   │   ├── Icon Button
│   │   └── Link Button
│   ├── Cards & Containers
│   │   ├── Project Card (large, medium, compact)
│   │   ├── Blog Card (with image, without image)
│   │   ├── News Card
│   │   └── Content Container
│   ├── Navigation
│   │   ├── Breadcrumb Trail
│   │   ├── Category Filter Buttons
│   │   ├── Pagination
│   │   └── Tab Navigation
│   ├── Feedback
│   │   ├── Loading Spinner (gold theme)
│   │   ├── Success Notification
│   │   ├── Error Alert
│   │   ├── Info Banner
│   │   └── Warning Alert
│   ├── Modals
│   │   ├── Confirmation Dialog
│   │   ├── Form Modal
│   │   └── Image Lightbox
│   ├── Admin Specific
│   │   ├── Info Banner (info/warning/success variants)
│   │   ├── Primary Button (admin styling)
│   │   ├── Dev Tool Button
│   │   ├── Data Table
│   │   └── Form Container
│   └── Special
│       ├── Stardust Effect (particle system visualization)
│       ├── News Slider
│       └── Project Carousel
│
├── 📄 PAGE TEMPLATES
│   ├── Home Page
│   │   ├── Hero Section
│   │   ├── Featured Project Carousel
│   │   ├── News Slider Component
│   │   ├── Call to Action Section
│   │   └── Footer Section
│   ├── Portfolio Page
│   │   ├── Filter Bar (Scenic, Experiential, Rendering)
│   │   ├── Project Grid (3-column layout)
│   │   ├── Project Card Hover States
│   │   └── Pagination / Load More
│   ├── Project Detail Templates
│   │   ├── Standard Project (images, description, credits)
│   │   ├── Experiential Project (special layout)
│   │   ├── Rendering Project (full-width imagery, software tags)
│   │   └── Lightbox Component
│   ├── Blog / Scenic Insights
│   │   ├── Blog Listing Page
│   │   ├── Blog Card (featured, compact)
│   │   ├── Blog Detail Page
│   │   ├── Related Articles Section
│   │   └── Category Filter
│   ├── News/Updates Page
│   │   ├── Timeline View
│   │   ├── Category Filter
│   │   ├── News Card
│   │   └── News Article Detail
│   ├── About Pages
│   │   ├── Bio / About
│   │   ├── News & Updates
│   │   ├── CV
│   │   └── Collaborators
│   ├── Resources Pages
│   │   ├── Scenic Studio (tutorials)
│   │   ├── App Studio (software showcase)
│   │   └── Tools (calculators, converters)
│   ├── Software Pages
│   │   ├── Daedalus (production management)
│   │   └── Sophia (script analysis)
│   ├── Contact Page
│   │   ├── Contact Form
│   │   ├── Success Message
│   │   └── Error States
│   ├── Admin Pages
│   │   ├── Login Screen
│   │   ├── Dashboard Overview
│   │   ├── Portfolio Manager
│   │   ├── Article Manager
│   │   ├── News Manager
│   │   └── Links Manager
│   └── Utility Pages
│       ├── 404 Not Found
│       ├── Search Results
│       ├── FAQ
│       ├── Privacy Policy
│       ├── Accessibility
│       └── Terms of Use
│
├── 🔄 USER FLOWS
│   ├── User Browsing Flow
│   │   ├── Home → Portfolio → Project Detail
│   │   ├── Home → Articles → Article Detail
│   │   ├── Home → Tools
│   │   └── Navbar Navigation Scenarios
│   ├── Admin Workflow
│   │   ├── Login → Dashboard → Add Project
│   │   ├── Login → Dashboard → Edit Article
│   │   ├── Bulk Upload Project Images
│   │   └── Publish News Update
│   ├── Search & Filter
│   │   ├── Filter Portfolio by Category
│   │   ├── Search Articles
│   │   └── Sort Results
│   └── Theme Switching
│       ├── Dark Mode Toggle
│       ├── Page Appearance Changes
│       └── Storage Persistence
│
├── 🌈 THEME VARIANTS
│   ├── Light Mode
│   │   ├── Color tokens applied
│   │   ├── All components rendered
│   │   └── Examples on each page template
│   └── Dark Mode
│       ├── Color tokens applied
│       ├── All components rendered
│       └── Examples on each page template
│
└── 📚 DOCUMENTATION
    ├── Design System Guideline
    ├── Component Usage Notes
    ├── Color Palette Explanation
    ├── Typography Scale
    ├── Responsive Breakpoints
    └── Animation & Transitions
```

---

## 🎨 DESIGN TOKENS (DETAILED)

### COLOR PALETTE

#### Light Mode
```
Primary (Black)
├── #000000 - Primary text/elements
└── #ffffff - Primary background

Secondary (Gray Scale)
├── #f5f5f5 - Light background
├── #e5e5e5 - Subtle background
├── #999999 - Muted text
└── #1a1a1a - Dark text

Section Accents
├── Scenic: #2563eb (Deep Blue)
├── Rendering: #9333ea (Purple)
├── Experiential: #f59e0b (Amber)
├── News: #10b981 (Green)
├── App: #06b6d4 (Cyan)
└── Default: #ef4444 (Red)
```

#### Dark Mode
```
Primary (White)
├── #ffffff - Primary text/elements
└── #0a0a0a - Primary background

Secondary (Dark Gray)
├── #171717 - Dark background
├── #262626 - Subtle background
├── #737373 - Muted text
└── #e5e5e5 - Light text

Section Accents (Brightened)
├── Scenic: #3b82f6 (Bright Blue)
├── Rendering: #a855f7 (Bright Purple)
├── Experiential: #fbbf24 (Bright Amber)
├── News: #34d399 (Bright Green)
├── App: #22d3ee (Bright Cyan)
└── Default: #ff6b6b (Bright Red)
```

#### Status Colors
```
Success: #10b981 (Green)
Error: #dc2626 (Red)
Warning: #f59e0b (Amber)
Info: #2563eb (Blue)
```

### TYPOGRAPHY

**Font Families:**
- Display: Playfair Display (serif) - Headers, dramatic text
- Body: DM Sans (sans-serif) - Main text, UI
- Monospace: VT323 (monospace) - Code, special elements

**Type Scale:**
```
h1 - 48px, weight 900, Playfair Display
h2 - 36px, weight 700, Playfair Display
h3 - 28px, weight 700, Playfair Display
h4 - 24px, weight 600, Playfair Display
h5 - 20px, weight 600, DM Sans
h6 - 16px, weight 600, DM Sans

Body Large - 18px, weight 400, DM Sans
Body Regular - 16px, weight 400, DM Sans
Body Small - 14px, weight 400, DM Sans

Caption - 12px, weight 400, DM Sans (muted foreground)
```

**Line Heights:**
- Headings: 1.1 (tight)
- Body: 1.6 (readable)
- Captions: 1.4 (readable)

### SPACING GRID

```
4px grid system
├── xs: 8px (0.5rem)
├── sm: 16px (1rem)
├── md: 24px (1.5rem)
├── lg: 48px (3rem)
├── xl: 96px (6rem)
└── 2xl: 144px (9rem)

Component Padding Examples:
├── Button: 12px vertical × 16px horizontal
├── Card: 24px padding
├── Section: 48px vertical × 32px horizontal
└── Container: 1200px max-width with padding
```

### BORDER RADIUS

```
Sharp (0px) - Default for minimalist elements
│ ├── Cards (optional - keep mostly sharp)
│ ├── Buttons
│ └── Modals

Subtle Rounding
├── sm: 2px - Form inputs, small elements
├── md: 4px - Badges, tags
└── lg: 8px - Larger interactive elements

Special Cases
├── Full Circle (50%) - Avatars, badges
└── Specific Values - Admin components (rounded-3xl = 24px)
```

### SHADOWS

```
None - Default
sm: 0 1px 2px rgba(0, 0, 0, 0.05)
md: 0 4px 6px rgba(0, 0, 0, 0.07)
lg: 0 10px 15px rgba(0, 0, 0, 0.1)
xl: 0 20px 25px rgba(0, 0, 0, 0.15)

Dark Mode (increased opacity):
sm: 0 1px 2px rgba(0, 0, 0, 0.3)
md: 0 4px 6px rgba(0, 0, 0, 0.4)
lg: 0 10px 15px rgba(0, 0, 0, 0.5)
```

### TRANSITIONS

```
Fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
├── Used for: Hover states, quick feedback
└── Examples: Button hover, color shifts

Base: 300ms cubic-bezier(0.4, 0, 0.2, 1)
├── Used for: Standard interactions
└── Examples: Page transitions, modal appear

Slow: 600ms cubic-bezier(0.22, 1, 0.36, 1)
├── Used for: Dramatic effects
└── Examples: Stardust effect, hero animations

Custom: CSS animations
├── Carousel slide transitions
├── Fade in/out for lazy-loaded content
└── Parallax scrolling
```

---

## 🧩 COMPONENT SPECIFICATIONS

### Button Component

**Variants:**
1. **Primary Button**
   - Background: Black (light) / White (dark)
   - Text: White (light) / Black (dark)
   - Padding: 12px 16px
   - Border: None
   - Hover: 90% opacity
   - Active: 80% opacity
   - Disabled: 50% opacity, cursor disabled

2. **Secondary Button**
   - Background: Transparent with 1px border
   - Border: 1px solid border color
   - Text: Foreground color
   - Padding: 12px 16px
   - Hover: Light background (5% opacity)
   - Active: 10% background opacity

3. **Section Accent Button** (Scenic, Rendering, etc.)
   - Background: Section color
   - Text: White
   - Padding: 12px 16px
   - Hover: Darken 10%
   - Used for: Category filters, featured actions

4. **Admin Button (Primary)**
   - Background: Black
   - Border: Rounded-3xl (24px radius)
   - Shadow: Applied on hover
   - Text: White with tracking

### Input Component

**States:**
- Default: 1px border, light background
- Focus: Blue border highlight, shadow
- Error: Red border, error text below
- Disabled: Gray background, no cursor
- Placeholder: Muted foreground color

**Padding:** 12px 16px (consistent with buttons)  
**Border Radius:** 4px (md)  
**Font:** DM Sans, 14px  

### Project Card

**Layout:**
```
┌─────────────────────┐
│                     │
│  Image (16:10)      │  300px height
│                     │
├─────────────────────┤
│ Title (h6)          │
│ Category Badge      │ 16px padding
│ Year                │
│                     │
└─────────────────────┘
```

**Hover Effects:**
- Image: Slight zoom (1.03x) or opacity shift
- Text: Accent color highlight
- Transition: 300ms ease

**Sizes:**
- Large: Full card (for portfolio)
- Medium: Grid card (80% of container)
- Compact: List item (minimal image, text-heavy)

---

## 📱 RESPONSIVE BREAKPOINTS

```
Mobile: 320px - 640px
├── Single column layouts
├── Full-width cards
└── Stacked navigation

Tablet: 641px - 1024px
├── Two-column layouts
├── Side navigation
└── Medium cards

Desktop: 1025px - 1440px
├── Three-column layouts
├── Full navigation bar
└── Large cards

Large: 1441px+
├── Four+ column layouts
├── Maximum width containers (1200px)
└── Optimized spacing
```

---

## 🎯 COMPONENT INTERACTIONS

### Navbar
**Desktop:**
```
[Logo] [Nav Links] [Theme Toggle] [Search]
├── Sticky or floating
├── Logo links to home
├── Links show breadcrumb on subpages
└── Search opens overlay
```

**Mobile:**
```
[Logo] [Hamburger Menu]
├── Full-screen overlay menu
├── Touch-friendly spacing (48px minimum)
└── Close button prominent
```

### Portfolio Filter
```
[All] [Scenic] [Experiential] [Rendering]
├── Active filter shows underline
├── Clicking updates page
└── URL reflects filter state
```

### Lightbox
```
Gallery → Click Image → Fullscreen Modal
├── Arrow keys navigate
├── Close button (X) on hover
├── Image counter (e.g., "1 of 5")
└── Backdrop click closes
```

### Admin Dashboard
```
Login → Tabs (Portfolio/Articles/News/etc)
├── Each tab has own manager
├── Left sidebar shows tabs
├── Main content area shows current tab
└── Destructive actions have confirmation
```

---

## 🎬 ANIMATION GUIDELINES

**Page Transitions:**
- Fade in: 300ms
- Scroll to top: Immediate
- Content appears: Staggered (100ms between elements)

**Interactive Elements:**
- Button hover: Color shift 150ms
- Dropdown open: Slide + fade 300ms
- Modal appear: Fade + scale 300ms

**Scroll Effects:**
- Parallax: Subtle (20% offset)
- Fade on scroll: Progressive opacity
- Stardust: Continuous, random particle animation

**Hover States:**
- All interactive: 150ms transition
- Shadows: Increase on hover
- Scale: Slight zoom (1.02-1.05x)

---

## 📐 GRID SYSTEM

**12-Column Grid**
```
Desktop (1200px)
├── 12 equal columns
├── 24px gutter
├── 32px margin
└── Content area: 1136px

Tablet (768px)
├── 8 equal columns
├── 16px gutter
├── 24px margin
└── Content area: 720px

Mobile (375px)
├── 4 equal columns
├── 12px gutter
├── 16px margin
└── Content area: 343px
```

**Common Layouts:**
```
3-Column Grid (Projects):
├── Desktop: 3 items per row
├── Tablet: 2 items per row
└── Mobile: 1 item per row

Hero Section:
├── Full width, centered content
├── Max-width: 1200px
└── Vertical padding: 96px

Content Container:
├── Max-width: 900px (for text)
├── Horizontal padding: 32px
└── Centered on page
```

---

## ✅ VALIDATION CHECKLIST

Before marking Figma file complete:

- [ ] All colors defined and applied consistently
- [ ] Typography scale complete (h1-h6 + body sizes)
- [ ] All components have light/dark variants
- [ ] Button states: default, hover, active, disabled
- [ ] Form inputs: all states
- [ ] Cards: multiple size variants
- [ ] Responsive breakpoints shown
- [ ] Admin components styled per system
- [ ] Page templates use components
- [ ] Accessibility annotations (contrast ratios, ARIA)
- [ ] Spacing consistent (4px grid)
- [ ] Border radius applied per rules
- [ ] Shadows applied per scale
- [ ] Animation timings documented
- [ ] Admin panel variants documented
- [ ] Project detail templates (3 types)
- [ ] Blog detail template
- [ ] Contact form states
- [ ] Error/success states
- [ ] Loading states (spinners)

---

## 📚 DESIGN DOCUMENTATION IN FIGMA

**Each frame should include:**
1. Component name
2. States (if applicable)
3. Usage notes
4. Spacing measurements
5. Color values
6. Font specifications
7. Interaction notes (if interactive)

**Example Documentation:**
```
Component: Primary Button
├── Light Mode: Black bg, white text, 12px × 16px padding
├── Dark Mode: White bg, black text, 12px × 16px padding
├── Hover: 90% opacity, 300ms transition
├── Active: 80% opacity
├── Disabled: 50% opacity, no pointer
├── Border Radius: 4px (md)
├── Usage: Main actions, form submissions
└── Notes: Use secondary button for less important actions
```

---

## 🔗 FILE HANDOFF

**For Developers:**
1. Export design tokens as JSON/YAML
2. Generate Tailwind config from colors
3. Export component specs as PDF
4. Create component storybook from Figma

**For Project Manager:**
1. Timeline milestones mapped to page templates
2. Component dependencies documented
3. Implementation difficulty flagged
4. Accessibility requirements noted

---

## 📞 FIGMA FILE ORGANIZATION TIPS

**Naming Convention:**
```
[Frame Type] — [Component/Page Name] — [Variant]

Examples:
✅ Component — Button — Primary Light
✅ Component — Input — Focus State
✅ Page — Portfolio — Desktop
✅ Template — Project Detail — Standard
❌ Button
❌ New Component 1
```

**Layer Organization:**
```
Use logical groups:
├── 🎨 Design Tokens
├── 🧩 Components
├── 📄 Pages
├── 🔄 Flows
└── 📚 Documentation
```

**Shared Styles:**
- Create all color swatches
- Create all text styles
- Create component styles
- Enable shared library for future projects

---

**Next Step:** Once this structure is created in Figma, export design tokens and generate Tailwind config updates!
