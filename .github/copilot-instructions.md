# Copilot Instructions for Brandon PT Davis Portfolio

## Overview
- React + TypeScript SPA (Vite) with manual state routing in [src/App.tsx](src/App.tsx).
- Pages are stateless; navigation via `onNavigate(page, slug?)` updates URL + state.
- Lazy-loaded pages in `App.tsx` with `<Suspense>` and [src/components/PageLoader.tsx](src/components/PageLoader.tsx).
- SEO driven by [src/components/SEO.tsx](src/components/SEO.tsx) and [src/utils/seo/metadata.ts](src/utils/seo/metadata.ts); JSON‑LD in [src/utils/seo/structured-data.ts](src/utils/seo/structured-data.ts).
- Supabase is used for storage/auth; Vercel builds via `vite-plugin-vercel`.

## Run & Build
- Dev: `npm run dev` (Vite dev server, port 3000, opens browser).
- Build: `npm run build` (runs sitemap generator then Vite build).
- Lint: `npm run lint` (eslint per [eslint.config.js](eslint.config.js)).
- Sitemaps: `npm run generate-sitemap` (see [scripts/generate-sitemap.ts](scripts/generate-sitemap.ts)).

## Routing Model (No Router)
- Single source of truth: `currentPage` + optional slugs (`currentProjectSlug`, `currentBlogSlug`, `currentTutorialSlug`, `currentNewsSlug`).
- Use `onNavigate('portfolio')`, `onNavigate('portfolio?filter=scenic')`, `onNavigate('project/million-dollar-quartet')`, `onNavigate('articles?category=design')`, `onNavigate('news/some-slug')`.
- Deep links parsed on load; Back/Forward handled via `popstate`. Scroll restored manually to top on page changes.

## Dynamic Content
- Projects: [src/pages/ProjectDetailNew.tsx](src/pages/ProjectDetailNew.tsx) via `slug`.
- Blog: [src/pages/scenic-insights/DynamicArticle.tsx](src/pages/scenic-insights/DynamicArticle.tsx) via `slug`.
- Tutorials: [src/pages/scenic-studio/DynamicTutorial.tsx](src/pages/scenic-studio/DynamicTutorial.tsx) via `slug`.
- News: [src/pages/news/NewsArticle.tsx](src/pages/news/NewsArticle.tsx) via `newsId`.

## SEO Workflow
- Map static routes in `PAGE_METADATA` (see [src/utils/seo/metadata.ts](src/utils/seo/metadata.ts)); return in `getSEOData()` in [src/App.tsx](src/App.tsx#L190-L261).
- Use generators in [src/utils/seo/structured-data.ts](src/utils/seo/structured-data.ts) for Article/CreativeWork/Person.
- Dev helpers auto-loaded (debug SEO) per [src/utils/seo/README.md](src/utils/seo/README.md).

## UI Conventions
- Tailwind classnames; theme via `<ThemeProvider>` (see [src/components/DesktopNav.tsx](src/components/DesktopNav.tsx) and related).
- Navbar/Footer hidden on `admin`/`links`; `forceBackground` used for content pages.
- Home locks scroll (`overflow-hidden`); others use `min-h-screen` wrappers.

## Add Content
- New Page: create `pages/PageName.tsx` with `({ onNavigate })` prop → lazy import in `App.tsx` → add to `Page` union → add `renderPage()` and `getSEOData()` cases → update `PAGE_METADATA`.
- New Blog: add entry in `data/blog-posts` → render via `DynamicArticle` by slug → metadata via generators.
- New Project: add to `data/projects` → rendered by `ProjectDetailNew` → metadata via CreativeWork.

## Supabase & Env
- Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in env (Vercel project settings).
- Storage buckets: `projects`, `blog`, `news`, `about`, `software` for public assets.
- Typed queries recommended; RLS enabled. Auth-gated Admin page.

## Deployment & Performance
- Vercel deploys Vite build; manual chunks configured in [vite.config.ts](vite.config.ts) for vendor splitting.
- Build drops `console`/`debugger`. Proxy maps `/resume.pdf` to Supabase storage.
- Keep pages lazy; use `PageLoader` and memoized data operations.

## Examples
- Navigate to filtered portfolio: `onNavigate('portfolio?filter=rendering')`.
- Open an article: `onNavigate('articles/operas-foundations')` → renders `DynamicArticle`.
- Open a tutorial: `onNavigate('scenic-studio/getting-started-vectorworks')`.

