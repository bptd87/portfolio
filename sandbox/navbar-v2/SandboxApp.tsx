import React, { useState } from 'react';
import { NavbarV2 } from '../../components/NavbarV2';
// If available, wrap with your ThemeProvider:
// import { ThemeProvider } from '../../components/ThemeProvider';

type Page =
  | 'home'
  | 'portfolio'
  | 'project/million-dollar-quartet'
  | 'scenic-insights'
  | 'scenic-insights/how-to-paint'
  | 'scenic-studio'
  | 'scenic-studio/getting-started-vectorworks'
  | 'about'
  | 'contact'
  | 'admin';

export function SandboxApp() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [portfolioFilter, setPortfolioFilter] = useState<'scenic' | 'experiential' | 'rendering' | undefined>(undefined);
  const [scenicInsightsCategory, setScenicInsightsCategory] = useState<string | undefined>(undefined);

  const onNavigate = (page: string, slugOrParam?: string) => {
    // Simulate the app's manual routing
    if (page === 'portfolio') {
      setCurrentPage('portfolio');
      setPortfolioFilter(
        slugOrParam === 'scenic' || slugOrParam === 'experiential' || slugOrParam === 'rendering'
          ? (slugOrParam as any)
          : undefined
      );
      return;
    }
    if (page === 'scenic-insights') {
      setCurrentPage('scenic-insights');
      setScenicInsightsCategory(slugOrParam || undefined);
      return;
    }
    setCurrentPage(page as Page);
  };

  const currentProjectSlug =
    currentPage.startsWith('project/') ? currentPage.split('/')[1] : undefined;
  const currentBlogSlug =
    currentPage.startsWith('scenic-insights/') ? currentPage.split('/')[1] : undefined;
  const currentTutorialSlug =
    currentPage.startsWith('scenic-studio/') ? currentPage.split('/')[1] : undefined;

  const transparent = currentPage === 'home';

  const contentClasses = 'pt-20 p-6 max-w-3xl mx-auto';

  const pageList: Page[] = [
    'home',
    'portfolio',
    'project/million-dollar-quartet',
    'scenic-insights',
    'scenic-insights/how-to-paint',
    'scenic-studio',
    'scenic-studio/getting-started-vectorworks',
    'about',
    'contact',
    'admin',
  ];

  const palette =
    currentPage === 'home'
      ? 'bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-700 text-white'
      : 'bg-gray-50 text-gray-900';

  const nav = (
    <NavbarV2
      onNavigate={onNavigate}
      currentPage={currentPage}
      currentProjectSlug={currentProjectSlug}
      currentBlogSlug={currentBlogSlug}
      currentTutorialSlug={currentTutorialSlug}
      portfolioFilter={portfolioFilter}
      scenicInsightsCategory={scenicInsightsCategory}
      transparent={transparent}
      hide={currentPage === 'admin'}
    />
  );

  return (
    // <ThemeProvider> {/* Uncomment if available */}
    <div className={palette} style={{ minHeight: '100vh' }}>
      {nav}

      <main className={contentClasses}>
        <h1 className="text-2xl font-bold mb-4">NavbarV2 Sandbox</h1>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="p-4 rounded-lg bg-white/10 md:bg-white shadow-sm ring-1 ring-black/5">
            <h2 className="text-sm font-semibold mb-2">Navigate</h2>
            <div className="flex flex-wrap gap-2">
              {pageList.map(p => (
                <button
                  key={p}
                  className="px-3 py-1 text-sm rounded bg-gray-800 text-white md:bg-gray-100 md:text-gray-800 hover:opacity-90"
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          <section className="p-4 rounded-lg bg-white/10 md:bg-white shadow-sm ring-1 ring-black/5">
            <h2 className="text-sm font-semibold mb-2">Portfolio Filter</h2>
            <div className="flex flex-wrap gap-2">
              {(['scenic', 'experiential', 'rendering'] as const).map(f => (
                <button
                  key={f}
                  className={`px-3 py-1 text-sm rounded ${portfolioFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-white md:bg-gray-100 md:text-gray-800'}`}
                  onClick={() => {
                    setPortfolioFilter(f);
                    setCurrentPage('portfolio');
                  }}
                >
                  {f}
                </button>
              ))}
              <button
                className="px-3 py-1 text-sm rounded bg-gray-300 text-gray-900"
                onClick={() => {
                  setPortfolioFilter(undefined);
                  setCurrentPage('portfolio');
                }}
              >
                Clear
              </button>
            </div>

            <h2 className="text-sm font-semibold mt-4 mb-2">Scenic Insights Category</h2>
            <div className="flex flex-wrap gap-2">
              {['design', 'process', 'tools'].map(cat => (
                <button
                  key={cat}
                  className={`px-3 py-1 text-sm rounded ${scenicInsightsCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-white md:bg-gray-100 md:text-gray-800'}`}
                  onClick={() => {
                    setScenicInsightsCategory(cat);
                    setCurrentPage('scenic-insights');
                  }}
                >
                  {cat}
                </button>
              ))}
              <button
                className="px-3 py-1 text-sm rounded bg-gray-300 text-gray-900"
                onClick={() => {
                  setScenicInsightsCategory(undefined);
                  setCurrentPage('scenic-insights');
                }}
              >
                Clear
              </button>
            </div>
          </section>
        </div>

        <p className="mt-6 text-sm opacity-70">
          Use the Navbar links or these controls to verify onNavigate behavior, transparency on home, and breadcrumb updates.
        </p>
      </main>
    </div>
    // </ThemeProvider>
  );
}