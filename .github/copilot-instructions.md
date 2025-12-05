# Copilot Instructions for Brandon PT Davis Portfolio

## Project Overview

This is a React/TypeScript portfolio website for Brandon PT Davis, a scenic designer and educator. The site showcases theatrical design work, experiential projects, teaching philosophy, and educational tools. It's a single-page application (SPA) with sophisticated SEO/structured data support and dynamic content rendering.

## Architecture & Key Patterns

### Page Routing (No Client Router)
The app uses **manual state-based routing** (no React Router) via the `App.tsx` component:
- State: `currentPage` (Page type) + optional `currentProjectSlug`, `currentBlogSlug`, `currentTutorialSlug`
- All pages receive `onNavigate={handleNavigation}` callback to change routes
- Call patterns: `onNavigate('portfolio')`, `onNavigate('project/slug-name')`, `onNavigate('scenic-insights/article-slug')`
- Query params supported: `'portfolio?filter=scenic'` or `'scenic-insights?category=design'`

### Page Loading Strategy
- **Core pages** (Home, Portfolio, ProjectDetail, ExperientialProjectDetail): Eager load in App.tsx
- **Everything else**: Lazy loaded via `lazy(() => import(...).then(m => ({ default: m.exportName })))`
- Lazy pages wrapped in `<Suspense>` with `<PageLoader>` fallback

### Dynamic Content Rendering
- **Blog posts**: Fetched via `getPostById()` from `data/blog-posts`, rendered by `DynamicArticle` component
- **Projects**: Rendered by `ProjectDetailNew` or `ExperientialProjectDetail` based on slug
- **Tutorials**: Rendered by `DynamicTutorial` from `pages/scenic-studio/DynamicTutorial`
- Each uses metadata/structured data generators for SEO

### SEO & Structured Data
Located in `utils/seo/`:
- `metadata.ts`: PAGE_METADATA object with entry for each route; `generateArticleMetadata()`, `generateProjectMetadata()` factories
- `structured-data.ts`: `generateWebSiteSchema()`, `generateArticleSchema()`, `generatePersonSchema()`, `generateCreativeWorkSchema()`
- `SEO.tsx`: Component that injects meta tags and JSON-LD structured data
- Debug tools in development: Auto-imported `debug-seo.ts`, `test-database-connection.ts`, `test-article-creation.ts`

## Critical Conventions

### State Management
- **No Redux/Context API**: Only React hooks. All page state passed via props.
- Pages are **stateless components** taking `onNavigate` callback
- `currentPage` in App.tsx is the single source of truth

### Styling
- Tailwind CSS (inferred from `className` patterns like `min-h-screen`, `transition-colors`)
- Theme provider: `<ThemeProvider>` wraps all content; check `components/ThemeProvider`

### Navigation Patterns
When navigating:
```tsx
// Simple page
onNavigate('about')
// With resource filter
onNavigate('portfolio', 'scenic')  // → portfolioFilter = 'scenic'
// Direct slug paths
onNavigate('project/million-dollar-quartet')
onNavigate('scenic-insights/article-slug')
onNavigate('scenic-studio/tutorial-slug')
// Via path-like string
onNavigate('scenic-studio/getting-started-vectorworks')
```

## File Organization

### Key Directories (Inferred Structure)
- `pages/`: Each exported route has own component file
- `components/`: Reusable UI (Navbar, Footer, ThemeProvider, SEO, PageLoader)
- `data/`: Content (blog-posts.ts, projects data)
- `utils/seo/`: Metadata and structured data generation
- `utils/debug-*.ts`: Development-only utilities

### Important Entry Points
- `App.tsx`: Master component handling all routing, SEO, navigation
- `pages/Home`, `pages/Portfolio`: Core pages, eagerly loaded
- `pages/scenic-studio/DynamicArticle`, `pages/portfolio/DynamicProject`: Dynamic content renderers

## Developer Workflows

### Adding a New Page
1. Create component in `pages/PageName.tsx` with signature: `export function PageName({ onNavigate }: { onNavigate: (page: string, slug?: string) => void })`
2. Import in App.tsx (lazy or eager depending on usage)
3. Add to `Page` type union: `type Page = '...' | 'new-page'`
4. Add case to `renderPage()` switch
5. Add SEO metadata entry to `PAGE_METADATA`
6. Add breadcrumb case in `getBreadcrumb()`

### Adding a New Blog Article
1. Add entry to `data/blog-posts` with required fields: `id`, `title`, `excerpt`, `date`, `coverImage`
2. Create markdown or component content
3. Import in `DynamicArticle` or render based on ID
4. SEO auto-generated via `generateArticleMetadata()` with post data

### Adding a New Project
1. Add project data entry with `id` and metadata
2. Project detail rendered by `ProjectDetailNew` (slug-based lookup)
3. Breadcrumb auto-generated if slug matches hardcoded list in `getBreadcrumb()`

### Debug & Testing
In development (`NODE_ENV === 'development'`), these auto-import:
- `utils/seo/debug-seo`: SEO validation tools
- `utils/debug-database`: Database utilities
- `utils/test-database-connection`: Connection tests
- `utils/test-article-creation`: Article creation workflows

## Important Implementation Details

### Scroll Behavior
- Browser scroll restoration disabled: `history.scrollRestoration = 'manual'`
- Force scroll to top (0,0) on every page change via `useEffect` with multiple targets
- Home page uses `overflow: hidden` on html/body to control snap scrolling; restored for other pages

### Navbar & Footer
- Navbar hidden on `/admin` page
- Footer hidden on `/admin` page
- Navbar receives `transparent={currentPage === 'home'}` to style accordingly
- Breadcrumb dynamically updated based on current page/slug

### Portfolio Filtering
- `portfolioFilter` state: `'scenic' | 'experiential' | 'rendering' | undefined`
- `ScenicInsights` also supports category filtering via `scenicInsightsCategory`
- Breadcrumb reflects active filter (e.g., "PORTFOLIO / SCENIC DESIGN")

## When Debugging Issues

1. **Navigation not working?** Check `handleNavigation()` logic—slugs may need URL-safe format (lowercase, dashes)
2. **SEO not rendering?** Verify `PAGE_METADATA` entry and `getSEOData()` case for that page
3. **Page not loading?** Check if it's lazy-loaded and `PageLoader` is showing—verify `<Suspense>` boundaries
4. **Styling issues?** Check Tailwind class names; verify theme variables in `ThemeProvider`
5. **Content not showing?** For blog/projects, ensure data file has entry and `DynamicArticle`/`ProjectDetail` is rendering the correct content

## Supabase Integration Patterns

### Storage Buckets
- `projects`: Project images (renderings, production photos)
- `blog`: Article cover images and inline images
- `news`: News update thumbnails
- `about`: Bio photos, headshots
- `software`: Software product screenshots

### Database Access
- Use Supabase client: `supabase.from('table').select()`
- All queries should be typed (generate types via CLI: `npx supabase gen types typescript`)
- RLS policies enabled on all tables
- Use `.eq()`, `.filter()` for safe queries

### Authentication
- Admin login via Supabase Auth (email/password)
- Session stored in browser (`supabase.auth.getSession()`)
- Protected routes check auth state before rendering admin

## Vercel Deployment

### Environment Variables (Required)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_KEY=your-service-key (server-only)
```

### Build & Deploy
- Build command: `npm run build` (Vite)
- Output directory: `dist/`
- No special config needed (Vercel auto-detects Vite)
- Preview: `npm run preview`

### Performance Optimization
- Code splitting via lazy `React.lazy()`
- Image optimization via ImageWithFallback component
- Supabase storage CDN for images (automatic)

## Quick Reference: Common Tasks

- Change page: `onNavigate('page-name')` or `onNavigate('parent/slug')`
- Add metadata: Update `PAGE_METADATA` in `utils/seo/metadata.ts`
- Add breadcrumb: Add case in `getBreadcrumb()` switch
- Fix scroll: Adjust logic in `useEffect` with currentPage dependency
- Debug routing: Add logging in `handleNavigation()` to trace state changes
- Add blog post: Create entry in `data/blog-posts.ts`, create component, import in App
- Upload image: Add to Supabase storage bucket, reference via `https://your-project.supabase.co/storage/v1/object/public/bucket/file.jpg`
