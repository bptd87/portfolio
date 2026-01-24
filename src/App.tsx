
import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { useState, lazy, Suspense, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";

import { DesktopNav } from './components/DesktopNav';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { PageLoader } from './components/PageLoader';
import { SEO } from './components/SEO';
import { PAGE_METADATA } from './utils/seo/metadata';

import { Toaster } from 'sonner';

import { AnalyticsTracker } from './components/AnalyticsTracker';
import { RedirectHandler } from './components/RedirectHandler';

// Dynamically loaded HelmetProvider - null until client-side
let HelmetProviderCompat: ComponentType<PropsWithChildren<{ context?: { helmet?: unknown } }>> | null = null;



// Core pages - loaded immediately
import { Home } from './pages/Home';


// Lazy load everything else for better performance
const Portfolio = lazy(() => import('./pages/Portfolio').then(m => ({ default: m.Portfolio })));
const ProjectDetail = lazy(() => import('./pages/ProjectDetailNew').then(m => ({ default: m.ProjectDetailNew })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const CreativeStatement = lazy(() => import('./pages/CreativeStatement').then(m => ({ default: m.CreativeStatement })));
const CV = lazy(() => import('./pages/CV').then(m => ({ default: m.CV })));
const Collaborators = lazy(() => import('./pages/Collaborators').then(m => ({ default: m.Collaborators })));
const TeachingPhilosophy = lazy(() => import('./pages/TeachingPhilosophy').then(m => ({ default: m.TeachingPhilosophy })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const News = lazy(() => import('./pages/News').then(m => ({ default: m.News })));
const NewsArticle = lazy(() => import('./pages/news/NewsArticle').then(m => ({ default: m.NewsArticle })));

// Footer pages
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Accessibility = lazy(() => import('./pages/Accessibility').then(m => ({ default: m.Accessibility })));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse').then(m => ({ default: m.TermsOfUse })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const Sitemap = lazy(() => import('./pages/Sitemap').then(m => ({ default: m.Sitemap })));
const Search = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const Admin = lazy(() => {

  return import('./pages/Admin')
    .then(m => {

      if (!m.Admin && !m.default) {
        console.error('🔴 App.tsx: Admin export not found!', m);
        throw new Error('Admin export not found in module');
      }
      return { default: m.Admin || m.default };
    })
    .catch(err => {
      console.error('🔴 App.tsx: Failed to load Admin module', err);
      throw err;
    });
});
const Links = lazy(() => import('./pages/Links').then(m => ({ default: m.Links })));

// Resource pages
const ScenicInsights = lazy(() => import('./pages/ScenicInsights').then(m => ({ default: m.ScenicInsights })));
const Studio = lazy(() => import('./pages/StudioNew').then(m => ({ default: m.StudioNew })));
const ScenicStudio = lazy(() => import('./pages/ScenicStudio').then(m => ({ default: m.ScenicStudio })));
const DynamicTutorial = lazy(() => import('./pages/scenic-studio/DynamicTutorial').then(m => ({ default: m.DynamicTutorial })));
const AppStudio = lazy(() => import('./pages/AppStudio').then(m => ({ default: m.AppStudio })));
const ArchitectureScaleConverter = lazy(() => import('./pages/ArchitectureScaleConverter').then(m => ({ default: m.ArchitectureScaleConverter })));
const DimensionReference = lazy(() => import('./pages/DimensionReferenceNewV2').then(m => ({ default: m.DimensionReferenceNewV2 })));
const ModelReferenceScaler = lazy(() => import('./pages/ModelReferenceScaler').then(m => ({ default: m.ModelReferenceScaler })));
const DesignHistoryTimeline = lazy(() => import('./pages/DesignHistoryTimeline').then(m => ({ default: m.DesignHistoryTimeline })));
const ClassicalArchitectureGuide = lazy(() => import('./pages/ClassicalArchitectureGuide').then(m => ({ default: m.ClassicalArchitectureGuide })));
const RoscoPaintCalculator = lazy(() => import('./pages/RoscoPaintCalculator').then(m => ({ default: m.RoscoPaintCalculator })));
const CommercialPaintFinder = lazy(() => import('./pages/CommercialPaintFinder').then(m => ({ default: m.CommercialPaintFinder })));
const Resources = lazy(() => import('./pages/Resources').then(m => ({ default: m.Resources })));
const ScenicVault = lazy(() => import('./pages/ScenicVault').then(m => ({ default: m.ScenicVault })));
const Directory = lazy(() => import('./pages/Directory').then(m => ({ default: m.Directory })));

// Dynamic article renderer (replaces all hardcoded article components)
const DynamicArticle = lazy(() => import('./pages/scenic-insights/DynamicArticle').then(m => ({ default: m.DynamicArticle })));

// Agency Pages
const AgencyCategoryPage = lazy(() => import('./pages/AgencyCategoryPage').then(m => ({ default: m.AgencyCategoryPage })));

type Page = 'home' | 'portfolio' | 'about' | 'creative-statement' | 'cv' | 'collaborators' | 'teaching-philosophy' | 'contact' | 'scenic-insights' | 'articles' | 'studio' | 'scenic-studio' | 'scenic-vault' | 'app-studio' | 'resources' | 'architecture-scale-converter' | 'dimension-reference' | 'model-reference-scaler' | 'design-history-timeline' | 'classical-architecture-guide' | 'rosco-paint-calculator' | 'commercial-paint-finder' | 'news' | 'news-article' | 'project' | 'project-new' | 'experiential-detail' | 'blog' | 'tutorial' | 'search' | 'admin' | 'links' | 'faq' | 'privacy-policy' | 'accessibility' | 'terms-of-use' | '404' | 'sitemap' | 'directory' | 'experiential-design' | 'rendering' | 'scenic-models';

export default function App() {
  const [helmetReady, setHelmetReady] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string | null>(null);
  const [currentBlogSlug, setCurrentBlogSlug] = useState<string | null>(null);
  const [currentTutorialSlug, setCurrentTutorialSlug] = useState<string | null>(null);
  const [currentNewsSlug, setCurrentNewsSlug] = useState<string | null>(null);
  const [portfolioFilter, setPortfolioFilter] = useState<string | undefined>(undefined);
  const [portfolioTag, setPortfolioTag] = useState<string | undefined>(undefined);
  const [scenicInsightsCategory, setScenicInsightsCategory] = useState<string | undefined>(undefined);
  const [scenicInsightsTag, setScenicInsightsTag] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Dynamically import react-helmet-async only on client
    import('react-helmet-async').then((mod) => {
      HelmetProviderCompat = mod.HelmetProvider as unknown as ComponentType<PropsWithChildren<{ context?: { helmet?: unknown } }>>;
      setHelmetReady(true);
    });
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Log initial route parsing
    const path = window.location.pathname;

    // Parse initial route
    if (path === '/admin' || path.startsWith('/admin')) {

      setCurrentPage('admin');
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPage, currentProjectSlug, currentBlogSlug, currentTutorialSlug, currentNewsSlug]);

  // Body scroll locking is now handled by the wrapper class in the render method
  // and the specific Home component logic for double-safety
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Define valid pages for 404 handling
  const VALID_PAGES = [
    'home', 'portfolio', 'about', 'creative-statement', 'cv', 'collaborators', 'teaching-philosophy',
    'contact', 'scenic-insights', 'articles', 'studio', 'scenic-studio',
    'scenic-vault', 'app-studio', 'resources', 'architecture-scale-converter',
    'dimension-reference', 'model-reference-scaler', 'design-history-timeline',
    'classical-architecture-guide', 'rosco-paint-calculator',
    'commercial-paint-finder', 'news', 'search', 'admin',
    'links', 'faq', 'privacy-policy', 'accessibility', 'terms-of-use', 'sitemap',
    'project', 'blog', 'tutorial', 'tutorials', 'test-database', 'directory',
    'experiential-design', 'rendering', 'scenic-models'
  ];

  // Internal navigation logic (updates state only)
  const navigateInternal = (page: string, slugOrBlogSlug?: string) => {
    let actualPage = page;
    const queryParams: Record<string, string> = {};

    if (page.includes('?')) {
      const [basePage, queryString] = page.split('?');
      actualPage = basePage || 'home'; // Handle root with query params
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        queryParams[key] = value;
      });
    }

    if (!actualPage) {
      setCurrentPage('home');
      return;
    }

    if (actualPage.includes('/')) {
      const parts = actualPage.split('/');
      const basePage = parts[0];
      const slug = parts[parts.length - 1]; // Get the last part as slug


      if (basePage === 'project') {
        setCurrentPage('project');
        setCurrentProjectSlug(slug);
      } else if (basePage === 'scenic-insights' || basePage === 'articles') {
        setCurrentPage('blog');
        setCurrentBlogSlug(slug);
      } else if (basePage === 'scenic-studio') {
        setCurrentPage('tutorial');
        setCurrentTutorialSlug(slug);
      } else if (basePage === 'tutorials' || basePage === 'tutorial') {
        // Handle plural /tutorials/slug from Links page
        setCurrentPage('tutorial');
        setCurrentTutorialSlug(slug);
      } else if (basePage === 'studio' && parts[1] === 'tutorial') {
        // New pattern: studio/tutorial/slug
        setCurrentPage('tutorial');
        setCurrentTutorialSlug(slug);
      } else if (basePage === 'news') {
        setCurrentPage('news-article');
        setCurrentNewsSlug(slug);
      } else if (['experiential-design', 'rendering', 'scenic-models'].includes(basePage)) {
        setCurrentPage(basePage as Page);
        setCurrentProjectSlug(slug); // Treat sub-path as project slug for deep linking
      } else {
        // Check for trailing slash on valid pages (e.g. "about/")
        if (parts.length === 2 && parts[1] === '' && VALID_PAGES.includes(basePage)) {
          setCurrentPage(basePage as Page);
        } else {
          setCurrentPage('404');
        }
      }
    } else {
      if (VALID_PAGES.includes(actualPage)) {
        // Handle news article specific case FIRST to avoid state thrashing
        if (actualPage === 'news' && slugOrBlogSlug) {
          setCurrentPage('news-article');
          setCurrentNewsSlug(slugOrBlogSlug);

          // Clear all other state
          setCurrentProjectSlug(null);
          setCurrentBlogSlug(null);
          setCurrentTutorialSlug(null);
          setPortfolioFilter(undefined);
          setPortfolioTag(undefined); // Clear portfolio tag
          setScenicInsightsCategory(undefined);
          setScenicInsightsTag(undefined);
          setSearchQuery(undefined);
        } else {
          // Standard page navigation
          setCurrentPage(actualPage as Page);

          // Clear project slug when navigating to category landing pages (no slug provided)
          // OR when navigating to other pages that don't use project slugs
          if (['experiential-design', 'rendering', 'scenic-models'].includes(actualPage)) {
            // For category pages: only keep slug if explicitly provided
            if (!slugOrBlogSlug) {
              setCurrentProjectSlug(null);
            }
          } else if (actualPage !== 'project') {
            // For all other pages except 'project', clear the slug
            setCurrentProjectSlug(null);
          }

          setCurrentBlogSlug(null);
          setCurrentTutorialSlug(null);

          // Handle specific page params
          if (actualPage === 'portfolio') {
            if (queryParams.filter) {
              setPortfolioFilter(queryParams.filter);
            } else if (slugOrBlogSlug) {
              setPortfolioFilter(slugOrBlogSlug);
            } else {
              setPortfolioFilter(undefined);
            }

            // Handle Tag
            if (queryParams.tag) {
              setPortfolioTag(queryParams.tag);
            } else {
              setPortfolioTag(undefined);
            }
          } else {
            setPortfolioFilter(undefined);
            setPortfolioTag(undefined);
          }

          if (actualPage === 'news') {
            setCurrentNewsSlug(null);
          } else {
            setCurrentNewsSlug(null);
          }

          if (actualPage === 'scenic-insights' || actualPage === 'articles') {
            if (slugOrBlogSlug) {
              // If a slug is provided via second argument (from redirects), treat it as a specific article
              setCurrentPage('blog');
              setCurrentBlogSlug(slugOrBlogSlug);
              // Reset list filters
              setScenicInsightsCategory(undefined);
              setScenicInsightsTag(undefined);
            } else {
              // List view
              setCurrentPage('scenic-insights');
              // Standard query params handling
              if (queryParams.category) {
                setScenicInsightsCategory(queryParams.category);
              } else {
                setScenicInsightsCategory(undefined);
              }
              if (queryParams.tag) {
                setScenicInsightsTag(queryParams.tag);
              } else {
                setScenicInsightsTag(undefined);
              }
            }
          } else if (actualPage === 'search') {
            // Handle search query
            if (queryParams.q) {
              setSearchQuery(queryParams.q);
            } else if (slugOrBlogSlug) {
              setSearchQuery(slugOrBlogSlug);
            } else {
              setSearchQuery(undefined);
            }
          } else {
            setScenicInsightsCategory(undefined);
            setScenicInsightsTag(undefined);
            setSearchQuery(undefined);
          }
        }
      } else {
        setCurrentPage('404');
      }
    }
  };

  // Public navigation handler (updates state + URL)
  const handleNavigation = (page: string, slugOrBlogSlug?: string) => {
    navigateInternal(page, slugOrBlogSlug);

    // Construct URL for History API
    let targetPath = page;

    // Handle special case: Home
    if (page === 'home') {
      targetPath = '/';
    }
    // Handle special case: Portfolio with filter arg
    else if (page === 'portfolio' && slugOrBlogSlug && !page.includes('?')) {
      targetPath = `/portfolio?filter=${slugOrBlogSlug}`;
    }
    // Handle special case: Articles with category arg
    else if ((page === 'articles' || page === 'scenic-insights') && slugOrBlogSlug && !page.includes('?')) {
      targetPath = `/articles?category=${slugOrBlogSlug}`;
    }
    // Handle special case: Search with query arg
    else if (page === 'search' && slugOrBlogSlug && !page.includes('?')) {
      targetPath = `/search?q=${encodeURIComponent(slugOrBlogSlug)}`;
    }
    // Handle special case: News with slug arg
    else if (page === 'news' && slugOrBlogSlug && !page.includes('?')) {
      targetPath = `/news/${slugOrBlogSlug}`;
    }
    // Handle special case: Agency Pages with Project Slug
    else if (['experiential-design', 'rendering', 'scenic-models'].includes(page) && slugOrBlogSlug) {
      targetPath = `/${page}/${slugOrBlogSlug}`;
    }
    // Handle standard pages (ensure leading slash)
    else {
      if (!targetPath.startsWith('/')) {
        targetPath = '/' + targetPath;
      }
    }

    // Push to history if different
    if (window.location.pathname + window.location.search !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  // Handle Browser Back/Forward Buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      const route = path.startsWith('/') ? path.substring(1) : path;

      // If root, go home
      if (!route && !search) {
        navigateInternal('home');
      } else {
        navigateInternal(route + search);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle initial URL on load (Deep Linking Support)
  useEffect(() => {
    let path = window.location.pathname;
    const search = window.location.search;

    // HARD REDIRECT: /scenic-insights -> /articles
    if (path.startsWith('/scenic-insights')) {
      const newPath = path.replace('/scenic-insights', '/articles');
      window.history.replaceState({}, '', newPath + search);
      path = newPath; // Update local variable
    }

    // HARD REDIRECT: /tag/:tagName -> /articles?tag=:tagName
    if (path.startsWith('/tag/')) {
      const tagName = path.split('/tag/')[1];
      if (tagName) {
        const newPath = '/articles';
        const newSearch = `?tag=${encodeURIComponent(tagName)}`;
        window.history.replaceState({}, '', newPath + newSearch);
        path = newPath;
        // Search needs to be updated manually for logic below as window.location.search doesn't update instantly in variable
        // But we can just construct the full route string for navigateInternal
        navigateInternal('articles', tagName); // Helper handles logic, but 'articles' needs special handling
        // Actually, our navigateInternal logic handles 'articles' with 2nd arg as slug/blogSlug.
        // Let's check navigateInternal logic:
        // else if (basePage === 'scenic-insights' || basePage === 'articles') {
        //   if (slugOrBlogSlug) { setCurrentPage('blog'); setCurrentBlogSlug(slugOrBlogSlug); ... }
        // }
        // Wait! navigateInternal treats 2nd arg as an ARTICLE SLUG, not a TAG if we pass it directly.
        // We need to trigger the "List View with Filter" state.
        // Let's rely on the URL param parsing in navigateInternal if we pass the route with query string.
        navigateInternal('articles?tag=' + encodeURIComponent(tagName));
        return; // Exit early to avoid double navigation
      }
    }

    // Only intervene if we are not at root or have query params
    if (path !== '/' || search) {
      // Remove leading slash for navigateInternal compatibility
      const route = path.startsWith('/') ? path.substring(1) : path;

      // Legacy redirects are now handled by RedirectHandler.tsx
      if (route || search) {
        navigateInternal(route + search);
      }
    }
  }, []);

  const getBreadcrumb = (): string => {
    // ... (switch statement remains the same)
    return 'HOME';
  };

  const getSEOData = (): { metadata: any; structuredData?: any } => {
    // Dynamic pages handle their own SEO via nested Helmet, but we provide fallbacks here
    // where possible, or default to Home if completely unknown.
    // However, for static pages, we MUST return the correct metadata key.

    switch (currentPage) {
      case 'home': return { metadata: PAGE_METADATA.home };
      case 'portfolio':
        if (portfolioFilter === 'scenic') return { metadata: PAGE_METADATA['portfolio-scenic'] };
        if (portfolioFilter === 'experiential') return { metadata: PAGE_METADATA['portfolio-experiential'] };
        if (portfolioFilter === 'rendering') return { metadata: PAGE_METADATA['portfolio-rendering'] };
        if (portfolioFilter === 'documentation') return { metadata: PAGE_METADATA['portfolio-documentation'] };
        return { metadata: PAGE_METADATA.portfolio };
      case 'about': return { metadata: PAGE_METADATA.about };
      case 'news': return { metadata: PAGE_METADATA.news };
      case 'cv': return { metadata: PAGE_METADATA.cv };
      case 'collaborators': return { metadata: PAGE_METADATA.collaborators };
      case 'teaching-philosophy': return { metadata: PAGE_METADATA['teaching-philosophy'] };
      case 'creative-statement': return { metadata: PAGE_METADATA['creative-statement'] };
      case 'contact': return { metadata: PAGE_METADATA.contact };
      case 'scenic-insights': return { metadata: PAGE_METADATA.articles };
      case 'articles': return { metadata: PAGE_METADATA.articles };
      case 'studio': return { metadata: PAGE_METADATA.studio };
      case 'scenic-studio': return { metadata: PAGE_METADATA['scenic-studio'] };
      case 'scenic-vault': return { metadata: PAGE_METADATA['scenic-vault'] };
      case 'app-studio': return { metadata: PAGE_METADATA['app-studio'] };
      case 'resources': return { metadata: PAGE_METADATA.resources };

      // Tools
      case 'architecture-scale-converter': return { metadata: PAGE_METADATA['architecture-scale-converter'] };
      case 'dimension-reference': return { metadata: PAGE_METADATA['dimension-reference'] };
      case 'model-reference-scaler': return { metadata: PAGE_METADATA['model-reference-scaler'] };
      case 'rosco-paint-calculator': return { metadata: PAGE_METADATA['rosco-paint-calculator'] };
      case 'commercial-paint-finder': return { metadata: PAGE_METADATA['commercial-paint-finder'] };
      case 'classical-architecture-guide': return { metadata: PAGE_METADATA['classical-architecture-guide'] };
      case 'design-history-timeline': return { metadata: PAGE_METADATA['design-history-timeline'] };

      // Legal / Meta
      case 'search': return { metadata: PAGE_METADATA.search };
      case 'admin': return { metadata: PAGE_METADATA.admin };
      case 'links': return { metadata: PAGE_METADATA.links };
      case 'faq': return { metadata: PAGE_METADATA.faq };
      case 'privacy-policy': return { metadata: PAGE_METADATA['privacy-policy'] };
      case 'accessibility': return { metadata: PAGE_METADATA.accessibility };
      case 'terms-of-use': return { metadata: PAGE_METADATA['terms-of-use'] };
      case 'sitemap': return { metadata: PAGE_METADATA.sitemap };
      case 'directory': return { metadata: PAGE_METADATA.directory };
      case '404': return { metadata: PAGE_METADATA['404'] };

      default: return { metadata: PAGE_METADATA.home };
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={handleNavigation} />;
      case 'portfolio': return <Portfolio onNavigate={handleNavigation} initialFilter={portfolioFilter} initialTag={portfolioTag} />;
      case 'about': return <About onNavigate={handleNavigation} />;
      case 'news': return <News onNavigate={handleNavigation} />;
      case 'news-article':
        if (currentNewsSlug) return <NewsArticle newsId={currentNewsSlug} onNavigate={handleNavigation} />;
        return <News onNavigate={handleNavigation} />;
      case 'cv': return <CV />;
      case 'collaborators': return <Collaborators onNavigate={handleNavigation} />;
      case 'teaching-philosophy': return <TeachingPhilosophy onNavigate={handleNavigation} />;
      case 'creative-statement': return <CreativeStatement onNavigate={handleNavigation} />;
      case 'contact': return <Contact />;
      case 'scenic-insights':
      case 'articles':
        return <ScenicInsights onNavigate={handleNavigation} initialCategory={scenicInsightsCategory} initialTag={scenicInsightsTag} />;
      case 'studio': return <Studio onNavigate={handleNavigation} />;
      case 'scenic-studio': return <ScenicStudio onNavigate={handleNavigation} />;
      case 'scenic-vault': return <ScenicVault onNavigate={handleNavigation} />;
      case 'app-studio': return <AppStudio onNavigate={handleNavigation} />;
      case 'resources': return <Resources onNavigate={handleNavigation} />;
      case 'architecture-scale-converter': return <ArchitectureScaleConverter onNavigate={handleNavigation} />;
      case 'dimension-reference': return <DimensionReference onNavigate={handleNavigation} />;
      case 'model-reference-scaler': return <ModelReferenceScaler />;
      case 'design-history-timeline': return <DesignHistoryTimeline />;
      case 'classical-architecture-guide': return <ClassicalArchitectureGuide />;
      case 'rosco-paint-calculator': return <RoscoPaintCalculator onNavigate={handleNavigation} />;
      case 'commercial-paint-finder': return <CommercialPaintFinder onNavigate={handleNavigation} />;
      case 'project':
        if (currentProjectSlug) return <ProjectDetail key={currentProjectSlug} slug={currentProjectSlug} onNavigate={handleNavigation} />;
        return <Portfolio onNavigate={handleNavigation} />;
      case 'blog':
        if (currentBlogSlug) return <DynamicArticle slug={currentBlogSlug} onNavigate={handleNavigation} />;
        return <ScenicInsights onNavigate={handleNavigation} />;
      case 'tutorial':
        if (currentTutorialSlug) return <DynamicTutorial slug={currentTutorialSlug} onNavigate={handleNavigation} />;
        return <Studio onNavigate={handleNavigation} />;
      case 'search': return <Search onNavigate={handleNavigation} initialQuery={searchQuery} />;
      case 'admin':

        return <Admin onNavigate={handleNavigation} />;
      case 'faq': return <FAQ onNavigate={handleNavigation} />;
      case 'privacy-policy': return <PrivacyPolicy />;
      case 'accessibility': return <Accessibility />;
      case 'terms-of-use': return <TermsOfUse />;
      case '404': return <NotFound onNavigate={handleNavigation} />;
      case 'sitemap': return <Sitemap onNavigate={handleNavigation} />;
      case 'links': return <Links onNavigate={handleNavigation} />;
      case 'directory': return <Directory />;
      case 'experiential-design':
        if (currentProjectSlug) return <ProjectDetail key={currentProjectSlug} slug={currentProjectSlug} onNavigate={handleNavigation} />;
        return <AgencyCategoryPage
          categorySlug="experiential-design"
          title="Experiential Design"
          subtitle="Immersive environments and brand activations that bridge the physical and digital worlds."
          description="Creating moments of connection through space and story."
          seoDescription="Experiential design portfolio by Brandon PT Davis. Featuring immersive brand activations, pop-up environments, and interactive installations that engage audiences through spatial storytelling."
          detailedContent={
            <>
              <p className="mb-6">
                I come to experiential design through a background in theatre, where space is active, temporal, and inseparable from narrative. I design environments as sequences of moments—shaped by movement, atmosphere, and audience behavior—using technology only where it strengthens clarity and emotional connection.
              </p>
              <p>
                The work balances theatrical intuition with contemporary tools to create spaces that are felt as much as they are seen. Whether for a brand activation, a museum installation, or a live event, my goal is to create a unified world that invites the audience to step inside and become part of the story.
              </p>
            </>
          }
          initialProjectSlug={currentProjectSlug}
          onNavigate={handleNavigation}
        />;
      case 'rendering':
        if (currentProjectSlug) return <ProjectDetail key={currentProjectSlug} slug={currentProjectSlug} onNavigate={handleNavigation} />;
        return <AgencyCategoryPage
          categorySlug="rendering"
          title="Rendering & Visualization"
          subtitle="Photo-realistic 3D visualization and conceptual illustration for theatre, events, and architecture."
          description="Rendering is how I think through space, communicate ideas, and collaborate in real time."
          seoDescription="High-fidelity 3D rendering and architectural visualization portfolio. Expert in Vectorworks, Cinema 4D, and Redshift for theatrical design, event planning, and spatial concepts."
          detailedContent={
            <>
              <p className="mb-6">
                I use rendering as an active design tool throughout the process—not just as a final deliverable. Working primarily in Vectorworks and Twinmotion, I build environments to test scale, lighting, composition, and audience perspective early and often.
              </p>
              <p>
                These images serve as the primary language for collaboration with directors, producers, and production teams, ensuring artistic intent is aligned long before construction begins. The emphasis is on clarity, atmosphere, and architectural precision over empty spectacle.
              </p>
            </>
          }
          initialProjectSlug={currentProjectSlug}
          onNavigate={handleNavigation}
        />;
      case 'scenic-models':
        if (currentProjectSlug) return <ProjectDetail key={currentProjectSlug} slug={currentProjectSlug} onNavigate={handleNavigation} />;
        return <AgencyCategoryPage
          categorySlug="scenic-models"
          title="Scenic Models"
          subtitle="Hand-crafted 1:48 and 1:25 scale models exploring space, texture, and form."
          description="Physical models remain essential to how I design, test, and refine ideas."
          seoDescription="Portfolio of hand-crafted scenic models for theatre and events. Detailed 1:48 and 1:25 scale white models and full-color presentation models exploring spatial relationships."
          detailedContent={
            <>
              <p className="mb-6">
                Alongside digital workflows, I regularly build physical scenic models to explore proportion, structure, and material logic in a tangible way. The model allows me to step away from the screen and evaluate spatial relationships with true depth and texture—something that remains central to theatrical design.
              </p>
              <p>
                Whether a quick "white model" for sketching out blocking or a fully realized presentation model for the final pitch, these physical artifacts bridge the gap between concept and construction, providing a shared focal point for the entire creative team.
              </p>
            </>
          }
          initialProjectSlug={currentProjectSlug}
          onNavigate={handleNavigation}
        />;
      default: return <Home onNavigate={handleNavigation} />;
    }
  };

  const seoData = getSEOData();
  const pageKey = `${currentPage}-${currentProjectSlug}-${currentBlogSlug}-${currentTutorialSlug}-${currentNewsSlug}`;

  const content = (
    <>
      <style>{`
          .app-mobile-nav { display: block; }
          .app-desktop-nav { display: none; }
          @media (min-width: 1024px) {
            .app-mobile-nav { display: none; }
            .app-desktop-nav { display: block; }
          }
          /* Fix for Mobile Nav Bleed-Through */
          body.mobile-nav-open main,
          body.mobile-nav-open .app-desktop-nav {
            visibility: hidden !important;
          }
        `}</style>
      <Toaster richColors />
      <AnalyticsTracker
        currentPage={currentPage}
        slug={currentProjectSlug || currentBlogSlug || currentTutorialSlug || currentNewsSlug}
      />

      <RedirectHandler onNavigate={handleNavigation} />
      <Analytics />

      {currentPage !== 'admin' && currentPage !== 'links' && (
        <>
          {/* MOBILE: Navbar */}
          <div className="app-mobile-nav">
            <MobileNav
              currentPage={currentPage}
              onNavigate={handleNavigation}
            />
          </div>

          {/* DESKTOP: Navbar */}
          <div className="app-desktop-nav">
            <DesktopNav
              currentPage={currentPage === 'project' ? 'portfolio' : currentPage === 'blog' ? 'articles' : currentPage === 'scenic-insights' ? 'articles' : currentPage === 'tutorial' ? 'scenic-studio' : currentPage}
              onNavigate={handleNavigation}
              forceBackground={['project', 'blog', 'articles', 'scenic-insights', 'news-article', 'portfolio', 'scenic-studio', 'scenic-vault', 'app-studio', 'directory', 'about', 'creative-statement', 'teaching-philosophy', 'collaborators', 'experiential-design', 'rendering', 'scenic-models'].includes(currentPage)}
            />
          </div>
        </>
      )}

      <div className={`transition-colors duration-300 w-full overflow-x-hidden ${currentPage === 'home' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
        <SEO metadata={seoData.metadata} structuredData={seoData.structuredData} />

        <main key={pageKey} className={currentPage === 'home' ? 'h-full' : ''}>
          <Suspense fallback={<PageLoader />}>
            {renderPage()}
          </Suspense>
        </main>
        {currentPage !== 'admin' && currentPage !== 'home' && currentPage !== 'links' && (
          <div className="relative z-50 bg-background">
            <Footer onNavigate={handleNavigation} />
          </div>
        )}
      </div>
    </>
  );

  return helmetReady && HelmetProviderCompat ? (
    <HelmetProviderCompat>
      {content}
    </HelmetProviderCompat>
  ) : (
    content
  );
}
