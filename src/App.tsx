import { useState, lazy, Suspense, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from './components/ThemeProvider';
import { DesktopNav } from './components/DesktopNav';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { PageLoader } from './components/PageLoader';
import { SEO } from './components/SEO';
import { PAGE_METADATA } from './utils/seo/metadata';

import { Toaster } from 'sonner';

import { AnalyticsTracker } from './components/AnalyticsTracker';
import { RedirectHandler } from './components/RedirectHandler';

// Load SEO debug tools in development
if (process.env.NODE_ENV === 'development') {
  import('./utils/seo/debug-seo');
  // Load database debug utilities
  import('./utils/debug-database');
  // Load database connection test
  import('./utils/test-database-connection');
  // Load article creation test utility
  import('./utils/test-article-creation');
}

// Core pages - loaded immediately
import { Home } from './pages/Home';
import { Portfolio } from './pages/Portfolio';
import { ProjectDetailNew as ProjectDetail } from './pages/ProjectDetailNew';


// Lazy load everything else for better performance
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
  console.log('🔵 App.tsx: Lazy loading Admin component...');
  return import('./pages/Admin')
    .then(m => {
      console.log('🔵 App.tsx: Admin module loaded', { hasAdmin: !!m.Admin, hasDefault: !!m.default, keys: Object.keys(m) });
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
const DimensionReference = lazy(() => import('./pages/DimensionReference').then(m => ({ default: m.DimensionReference })));
const ModelReferenceScaler = lazy(() => import('./pages/ModelReferenceScaler').then(m => ({ default: m.ModelReferenceScaler })));
const DesignHistoryTimeline = lazy(() => import('./pages/DesignHistoryTimeline').then(m => ({ default: m.DesignHistoryTimeline })));
const ClassicalArchitectureGuide = lazy(() => import('./pages/ClassicalArchitectureGuide').then(m => ({ default: m.ClassicalArchitectureGuide })));
const RoscoPaintCalculator = lazy(() => import('./pages/RoscoPaintCalculator').then(m => ({ default: m.RoscoPaintCalculator })));
const CommercialPaintFinder = lazy(() => import('./pages/CommercialPaintFinder').then(m => ({ default: m.CommercialPaintFinder })));
const Resources = lazy(() => import('./pages/Resources').then(m => ({ default: m.Resources })));
const BlogFormatter = lazy(() => import('./pages/BlogFormatter').then(m => ({ default: m.BlogFormatter })));
const ScenicVault = lazy(() => import('./pages/ScenicVault').then(m => ({ default: m.ScenicVault })));

// Dynamic article renderer (replaces all hardcoded article components)
const DynamicArticle = lazy(() => import('./pages/scenic-insights/DynamicArticle').then(m => ({ default: m.DynamicArticle })));

// Project pages


type Page = 'home' | 'portfolio' | 'about' | 'creative-statement' | 'cv' | 'collaborators' | 'teaching-philosophy' | 'contact' | 'scenic-insights' | 'articles' | 'studio' | 'scenic-studio' | 'scenic-vault' | 'app-studio' | 'resources' | 'architecture-scale-converter' | 'dimension-reference' | 'model-reference-scaler' | 'design-history-timeline' | 'classical-architecture-guide' | 'rosco-paint-calculator' | 'commercial-paint-finder' | 'blog-formatter' | 'news' | 'news-article' | 'project' | 'project-new' | 'experiential-detail' | 'blog' | 'tutorial' | 'search' | 'admin' | 'links' | 'faq' | 'privacy-policy' | 'accessibility' | 'terms-of-use' | '404' | 'sitemap';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string | null>(null);
  const [currentBlogSlug, setCurrentBlogSlug] = useState<string | null>(null);
  const [currentTutorialSlug, setCurrentTutorialSlug] = useState<string | null>(null);
  const [currentNewsSlug, setCurrentNewsSlug] = useState<string | null>(null);
  const [portfolioFilter, setPortfolioFilter] = useState<string | undefined>(undefined);
  const [scenicInsightsCategory, setScenicInsightsCategory] = useState<string | undefined>(undefined);
  const [scenicInsightsTag, setScenicInsightsTag] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Log initial route parsing
    const path = window.location.pathname;
    console.log('🔵 App.tsx: Initial route check', { path, currentPage });
    console.log('--- FORCED NAVBAR REFRESH - FIXES APPLIED ---');

    // Parse initial route
    if (path === '/admin' || path.startsWith('/admin')) {
      console.log('🔵 App.tsx: Admin route detected on mount, setting currentPage to admin');
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
    'commercial-paint-finder', 'blog-formatter', 'news', 'search', 'admin',
    'links', 'faq', 'privacy-policy', 'accessibility', 'terms-of-use', 'sitemap',
    'project', 'blog', 'tutorial', 'test-database'
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
      } else if (basePage === 'studio' && parts[1] === 'tutorial') {
        // New pattern: studio/tutorial/slug
        setCurrentPage('tutorial');
        setCurrentTutorialSlug(slug);
      } else if (basePage === 'news') {
        setCurrentPage('news-article');
        setCurrentNewsSlug(slug);
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
        setCurrentPage(actualPage as Page);
        setCurrentProjectSlug(null);
        setCurrentBlogSlug(null);
        setCurrentTutorialSlug(null);
        setCurrentNewsSlug(null);

        if (actualPage === 'portfolio') {
          if (queryParams.filter) {
            setPortfolioFilter(queryParams.filter);
          } else if (slugOrBlogSlug) {
            setPortfolioFilter(slugOrBlogSlug);
          } else {
            setPortfolioFilter(undefined);
          }
        } else {
          setPortfolioFilter(undefined);
        }

        if (actualPage === 'scenic-insights' || actualPage === 'articles') {
          // Normalize to scenic-insights internally
          setCurrentPage('scenic-insights');
          if (queryParams.category) {
            setScenicInsightsCategory(queryParams.category);
          } else if (slugOrBlogSlug) {
            setScenicInsightsCategory(slugOrBlogSlug);
          } else {
            setScenicInsightsCategory(undefined);
          }
          if (queryParams.tag) {
            setScenicInsightsTag(queryParams.tag);
          } else {
            setScenicInsightsTag(undefined);
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
    const path = window.location.pathname;
    const search = window.location.search;

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
    // ... (switch statement remains the same)
    return { metadata: PAGE_METADATA.home };
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={handleNavigation} />;
      case 'portfolio': return <Portfolio onNavigate={handleNavigation} initialFilter={portfolioFilter} />;
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
      case 'architecture-scale-converter': return <ArchitectureScaleConverter />;
      case 'dimension-reference': return <DimensionReference />;
      case 'model-reference-scaler': return <ModelReferenceScaler />;
      case 'design-history-timeline': return <DesignHistoryTimeline />;
      case 'classical-architecture-guide': return <ClassicalArchitectureGuide />;
      case 'rosco-paint-calculator': return <RoscoPaintCalculator />;
      case 'commercial-paint-finder': return <CommercialPaintFinder />;
      case 'blog-formatter': return <BlogFormatter />;
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
        console.log('🔵 App.tsx: renderPage() - admin case matched, rendering Admin component');
        return <Admin onNavigate={handleNavigation} />;
      case 'faq': return <FAQ onNavigate={handleNavigation} />;
      case 'privacy-policy': return <PrivacyPolicy />;
      case 'accessibility': return <Accessibility />;
      case 'terms-of-use': return <TermsOfUse />;
      case '404': return <NotFound onNavigate={handleNavigation} />;
      case 'sitemap': return <Sitemap onNavigate={handleNavigation} />;
      case 'links': return <Links onNavigate={handleNavigation} />;
      default: return <Home onNavigate={handleNavigation} />;
    }
  };

  const seoData = getSEOData();
  const pageKey = `${currentPage}-${currentProjectSlug}-${currentBlogSlug}-${currentTutorialSlug}-${currentNewsSlug}`;

  return (
    <HelmetProvider>
      <ThemeProvider>
        <style>{`
          .app-mobile-nav { display: block; }
          .app-desktop-nav { display: none; }
          @media (min-width: 1024px) {
            .app-mobile-nav { display: none; }
            .app-desktop-nav { display: block; }
          }
        `}</style>
        <Toaster richColors />
        <AnalyticsTracker
          currentPage={currentPage}
          slug={currentProjectSlug || currentBlogSlug || currentTutorialSlug || currentNewsSlug}
        />
        <RedirectHandler onNavigate={handleNavigation} />
        <Analytics />
        <div className={`transition-colors duration-300 w-full overflow-x-hidden ${currentPage === 'home' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
          <SEO metadata={seoData.metadata} structuredData={seoData.structuredData} />
          {currentPage !== 'admin' && currentPage !== 'links' && (
            <>
              {/* MOBILE: Old Navbar */}
              <div className="app-mobile-nav">
                <MobileNav
                  currentPage={currentPage}
                  onNavigate={handleNavigation}
                />
              </div>

              {/* DESKTOP: V2 Navbar */}
              <div className="app-desktop-nav">
                <DesktopNav
                  currentPage={currentPage === 'project' ? 'portfolio' : currentPage === 'blog' ? 'articles' : currentPage === 'scenic-insights' ? 'articles' : currentPage === 'tutorial' ? 'scenic-studio' : currentPage}
                  onNavigate={handleNavigation}
                />
              </div>
            </>
          )}
          <main key={pageKey} className={currentPage === 'home' ? 'h-full' : ''}>
            <Suspense fallback={<PageLoader />}>
              {renderPage()}
            </Suspense>
          </main>
          {currentPage !== 'admin' && currentPage !== 'home' && currentPage !== 'links' && (
            <Footer onNavigate={handleNavigation} />
          )}
        </div>
      </ThemeProvider>
    </HelmetProvider>
  );
}
