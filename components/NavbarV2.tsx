import React, { useMemo, useState } from 'react';

type PortfolioFilter = 'scenic' | 'experiential' | 'rendering' | undefined;

type Props = {
  onNavigate?: (page: string, slugOrParam?: string) => void;
  currentPage?: string;
  currentProjectSlug?: string;
  currentBlogSlug?: string;
  currentTutorialSlug?: string;
  portfolioFilter?: PortfolioFilter;
  scenicInsightsCategory?: string;
  transparent?: boolean; // overrides auto-transparent on home
  hide?: boolean; // force hide (e.g., admin)
};

const NAV_ITEMS = [
  { label: 'Home', page: 'home' },
  { label: 'Portfolio', page: 'portfolio' },
  { label: 'Scenic Insights', page: 'scenic-insights' },
  { label: 'Scenic Studio', page: 'scenic-studio' },
  { label: 'About', page: 'about' },
  { label: 'Contact', page: 'contact' },
];

function toTitle(s?: string) {
  return (s || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getBreadcrumb(p: {
  currentPage?: string;
  currentProjectSlug?: string;
  currentBlogSlug?: string;
  currentTutorialSlug?: string;
  portfolioFilter?: PortfolioFilter;
  scenicInsightsCategory?: string;
}): string[] {
  const {
    currentPage,
    currentProjectSlug,
    currentBlogSlug,
    currentTutorialSlug,
    portfolioFilter,
    scenicInsightsCategory,
  } = p;

  if (!currentPage) return [];
  if (currentPage === 'home') return [];
  if (currentPage === 'admin') return [];

  switch (true) {
    case currentPage === 'portfolio':
      return ['PORTFOLIO', portfolioFilter ? toTitle(portfolioFilter).toUpperCase() : ''].filter(Boolean);
    case currentPage?.startsWith('project/'):
      return ['PORTFOLIO', 'PROJECT', toTitle(currentProjectSlug).toUpperCase()].filter(Boolean);
    case currentPage === 'scenic-insights':
      return ['SCENIC INSIGHTS', scenicInsightsCategory ? toTitle(scenicInsightsCategory).toUpperCase() : ''].filter(Boolean);
    case currentPage?.startsWith('scenic-insights/'):
      return ['SCENIC INSIGHTS', toTitle(currentBlogSlug).toUpperCase()].filter(Boolean);
    case currentPage === 'scenic-studio':
      return ['SCENIC STUDIO'];
    case currentPage?.startsWith('scenic-studio/'):
      return ['SCENIC STUDIO', toTitle(currentTutorialSlug).toUpperCase()].filter(Boolean);
    case currentPage === 'about':
      return ['ABOUT'];
    case currentPage === 'contact':
      return ['CONTACT'];
    default:
      return [toTitle(currentPage).toUpperCase()];
  }
}

export function NavbarV2({
  onNavigate,
  currentPage = 'home',
  currentProjectSlug,
  currentBlogSlug,
  currentTutorialSlug,
  portfolioFilter,
  scenicInsightsCategory,
  transparent,
  hide,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cp = currentPage || '';

  // Hide on admin or if forced
  if (hide || currentPage === 'admin') return null;

  const isTransparent = transparent ?? currentPage === 'home';

  const wrapperClasses = isTransparent
    ? 'fixed inset-x-0 top-0 z-40 text-white'
    : 'fixed inset-x-0 top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 text-gray-900 shadow-sm border-b border-gray-200';

  const linkBase =
    'px-3 py-2 text-sm font-semibold transition-colors';
  const linkActive = isTransparent ? 'text-white' : 'text-indigo-600';
  const linkInactive = isTransparent ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900';

  const breadcrumb = useMemo(
    () =>
      getBreadcrumb({
        currentPage,
        currentProjectSlug,
        currentBlogSlug,
        currentTutorialSlug,
        portfolioFilter,
        scenicInsightsCategory,
      }),
    [
      currentPage,
      currentProjectSlug,
      currentBlogSlug,
      currentTutorialSlug,
      portfolioFilter,
      scenicInsightsCategory,
    ]
  );

  const handleNavigate = (page: string, param?: string) => {
    if (onNavigate) onNavigate(page, param);
    setMobileOpen(false);
  };

  return (
    <nav className={wrapperClasses} aria-label="Primary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <button
            className="flex items-center gap-2"
            onClick={() => handleNavigate('home')}
            aria-label="Go to home"
          >
            <div className={`h-8 w-8 rounded-full ${isTransparent ? 'bg-white/20' : 'bg-indigo-600/80'} ring-1 ring-black/10`} />
            <span className={`text-sm font-bold tracking-wide ${isTransparent ? 'text-white' : 'text-gray-900'}`}>
              Brandon PT Davis
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const active =
                cp === item.page ||
                (item.page === 'portfolio' && cp.startsWith('project/')) ||
                (item.page === 'scenic-insights' && cp.startsWith('scenic-insights')) ||
                (item.page === 'scenic-studio' && cp.startsWith('scenic-studio'));
              const cls = `${linkBase} ${active ? linkActive : linkInactive}`;
              return (
                <button
                  key={item.page}
                  className={cls}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    if (item.page === 'portfolio') return handleNavigate('portfolio');
                    if (item.page === 'scenic-insights') return handleNavigate('scenic-insights');
                    handleNavigate(item.page);
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-black/10 ${isTransparent ? 'text-white/90 bg-white/10' : 'text-gray-700 bg-white'}`}
            aria-controls="navbarv2-mobile"
            aria-haspopup="menu"
            onClick={() => setMobileOpen(o => !o)}
          >
            Menu
          </button>
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className={`hidden md:block py-2 ${isTransparent ? 'text-white/70' : 'text-gray-600'}`} aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-xs">
              {breadcrumb.map((seg, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span>{seg}</span>
                  {idx < breadcrumb.length - 1 && <span className={isTransparent ? 'text-white/30' : 'text-gray-300'}>/</span>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div
          id="navbarv2-mobile"
          className={`md:hidden border-t ${isTransparent ? 'border-white/20' : 'border-gray-200'} pb-3`}
        >
          <div className="px-4 pt-3 flex flex-col gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.page}
                className={`w-full text-left ${linkBase} ${linkInactive}`}
                onClick={() => {
                  if (item.page === 'portfolio') return handleNavigate('portfolio');
                  if (item.page === 'scenic-insights') return handleNavigate('scenic-insights');
                  handleNavigate(item.page);
                }}
              >
                {item.label}
              </button>
            ))}

            {/* Contextual quick actions */}
            {currentPage === 'portfolio' && (
              <div className="mt-2 flex gap-2">
                {(['scenic', 'experiential', 'rendering'] as const).map(f => (
                  <button
                    key={f}
                    className={`px-2 py-1 text-xs rounded ${isTransparent ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => handleNavigate('portfolio', f)}
                  >
                    {toTitle(f)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
