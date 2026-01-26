import { useState, useRef, useEffect, useMemo } from 'react';
import { Menu, X, Moon, Sun, Search } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { NAVIGATION } from '../data/navigation';

interface DesktopNavProps {
  onNavigate: (page: string, filter?: string) => void;
  onSearch?: () => void;
  currentPage?: string;
  forceBackground?: boolean;
}

export function DesktopNav({ onNavigate, onSearch, currentPage, forceBackground = false }: DesktopNavProps) {
  // 1. Get THEME from Global Context
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 2. Define isDark based on global theme
  const isDark = theme === 'dark';

  const handleNavClick = (page: string, filter?: string) => {
    onNavigate(page, filter);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setActiveDropdown(null);
  };

  // Center links: PORTFOLIO / NEWS / ABOUT / ARTICLES / STUDIO
  const CENTER_PAGES = useMemo(
    () => new Set(['portfolio', 'news', 'about', 'articles', 'studio']),
    []
  );

  // 1. ADAPTIVE TONE LOGIC (Restored)
  // Controls the appearance (text color, glass tint) of the navbar based on content behind it.
  const [navTone, setNavTone] = useState<'dark' | 'light'>(theme);

  // Sync with theme initially if no override is found
  useEffect(() => {
    const sections = document.querySelectorAll('[data-nav]');
    if (sections.length === 0) {
      setNavTone(theme);
    }
  }, [theme]);

  // Observer to detect dark/light sections
  useEffect(() => {
    let intersectionObs: IntersectionObserver | null = null;
    let mutationObs: MutationObserver | null = null;

    const setupObserver = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-nav]'));
      if (!sections.length) return false;

      // Disconnect existing if any (just in case)
      if (intersectionObs) intersectionObs.disconnect();

      intersectionObs = new IntersectionObserver(
        (entries) => {
          const topEntry = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

          if (!topEntry) return;
          const tone = (topEntry.target as HTMLElement).dataset.nav as 'dark' | 'light';
          if (tone) setNavTone(tone);
        },
        { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
      );

      sections.forEach((s) => intersectionObs!.observe(s));
      return true;
    };

    // Attempt setup immediately
    if (!setupObserver()) {
      // If failed, wait for DOM changes (lazy loading)
      mutationObs = new MutationObserver(() => {
        if (setupObserver()) {
          mutationObs?.disconnect();
          mutationObs = null;
        }
      });
      mutationObs.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      intersectionObs?.disconnect();
      mutationObs?.disconnect();
    };
  }, [currentPage]);

  // Determine Navbar "Dark Mode" status based on TONE, not just global theme
  const isNavDark = navTone === 'dark';

  // Focus search input when opened (desktop only input is visible)
  useEffect(() => {
    if (!searchOpen) return;
    // allow width transition to start then focus
    const t = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  // Close search on Esc and on outside click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };

    const onClick = (e: MouseEvent) => {
      if (!searchOpen) return;
      const target = e.target as Node;

      if (searchInputRef.current?.contains(target)) return;
      if (searchBtnRef.current?.contains(target)) return;

      setSearchOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [searchOpen]);

  const [isHovered, setIsHovered] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  let closeTimeout: NodeJS.Timeout;

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    // Do not clear activeDropdown here; let the item's onMouseLeave handle it via timeout
  };

  const handleDropdownEnter = (page: string) => {
    if (closeTimeout) clearTimeout(closeTimeout);
    setActiveDropdown(page);
  };

  const handleDropdownLeave = () => {
    closeTimeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Scroll Direction Logic
  // 2. SCROLL HIDE LOGIC (Refined)
  const [hideNavbar, setHideNavbar] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Check both potential scroll roots
    const el = document.getElementById('home-scroll-container');
    const target = el || window;

    const handleScroll = () => {
      const currentY = el ? el.scrollTop : window.scrollY;
      const diff = currentY - lastScrollY.current;

      // Hide if scrolling DOWN (>10px diff) and not at very top
      if (currentY > 100 && diff > 10) {
        setHideNavbar(true);
      }
      // Show if scrolling UP (< -10px diff)
      else if (diff < -10) {
        setHideNavbar(false);
      }

      lastScrollY.current = currentY;
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const navTextClass = isNavDark ? 'text-white' : 'text-neutral-900';

  // Glass effect
  // Adapts to navTone: Dark tone = Dark Glass, Light tone = Light Glass
  const backgroundClass = (isHovered || mobileMenuOpen || searchOpen || activeDropdown || forceBackground)
    ? (isNavDark
      ? 'bg-neutral-900/60 nav--dark backdrop-blur-xl backdrop-saturate-150'
      : 'bg-white/60 nav--light backdrop-blur-xl backdrop-saturate-150 border-b border-white/20')
    : 'bg-transparent';

  /* MEGA MENU LOGIC */
  // Close menu on route change logic is handled in handleNavClick:
  // setMobileMenuOpen(false); setSearchOpen(false); setActiveDropdown(null);

  const headerHeight = 'h-20';

  // Hard-fix CSS for broken Tailwind build
  const styles = `
    @media (min-width: 1024px) {
      .nav-desktop-only { display: flex !important; }
      .nav-mobile-only { display: none !important; }
    }
    @media (max-width: 1023px) {
      .nav-desktop-only { display: none !important; }
      .nav-mobile-only { display: flex !important; }
    }
    .small-caps {
      font-size: 0.65rem !important;
      letter-spacing: 0.2em !important;
      text-transform: uppercase !important;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <nav
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={[
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-500 ease-in-out',
          hideNavbar ? '-translate-y-full' : 'translate-y-0',
          navTextClass,
          backgroundClass,
        ].join(' ')}
      >
        <div className="mx-auto px-4 lg:px-8 max-w-7xl relative">

          {/* Main Top Bar */}
          <div className={`flex items-center justify-between ${headerHeight} relative z-20`}>

            {/* 1. LOGO SECTION */}
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => handleNavClick('home')}
                className="group flex items-end gap-3 pb-2"
                title="Go to home"
              >
                <div
                  className={`font-pixel ${isNavDark ? 'text-white' : 'text-neutral-900'}`}
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: '3rem',
                    lineHeight: 1,
                    transform: 'translateY(4px)',
                  }}
                >
                  B
                </div>

                {/* Text Brand */}
                <div className="flex flex-col items-start justify-end h-full">
                  <div className={[
                    'text-lg font-bold tracking-[0.2em] leading-none mb-1',
                    isNavDark ? 'text-white' : 'text-neutral-900'
                  ].join(' ')}>
                    BRANDON PT DAVIS
                  </div>
                  <div className={[
                    'text-[0.65rem] font-medium tracking-[0.3em] uppercase opacity-90 leading-none',
                    isNavDark ? 'text-white/90' : 'text-neutral-800'
                  ].join(' ')}>
                    Scenic Designer
                  </div>
                </div>
              </button>
            </div>

            {/* 2. CENTER LINKS */}
            <div className="hidden lg:flex nav-desktop-only items-center gap-8 xl:gap-14 flex-1 justify-center h-full pt-1">
              {NAVIGATION.tabs
                .filter((t) => CENTER_PAGES.has(t.page))
                .map((tab) => {
                  const active = currentPage === tab.page || currentPage?.startsWith(tab.page);
                  const hasSub = 'submenu' in tab;

                  return (
                    <div
                      key={tab.label}
                      className="h-full flex items-center relative"
                      onMouseEnter={() => hasSub && handleDropdownEnter(tab.page)}
                      onMouseLeave={() => hasSub && handleDropdownLeave()}
                    >
                      <button
                        onClick={() => handleNavClick(tab.page, tab.slug)}
                        className={[
                          'font-bold tracking-[0.15em] relative z-10',
                          'px-2 py-2 transition-colors duration-200',
                          'hover:opacity-70',
                          active
                            ? isNavDark ? 'text-white' : 'text-neutral-900'
                            : isNavDark ? 'text-white/90' : 'text-neutral-800',
                        ].join(' ')}
                        style={{ fontSize: '11px' }}
                      >
                        {String(tab.label).toUpperCase()}
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* 3. RIGHT ACTIONS */}
            <div className="flex items-center gap-6 flex-shrink-0 pt-1">
              {/* Search */}
              <div className="flex items-center relative">
                <div className={`
                    flex items-center transition-all duration-300 ease-in-out overflow-hidden
                    ${searchOpen ? 'w-48 opacity-100 pr-2' : 'w-0 opacity-0'}
                 `}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    className={[
                      'w-full bg-transparent outline-none pb-1',
                      'text-xs font-medium tracking-wide',
                      isNavDark
                        ? 'text-white placeholder:text-white/40 border-b border-white/50 focus:border-white'
                        : 'text-neutral-900 placeholder:text-neutral-400 border-b border-neutral-400 focus:border-neutral-900'
                    ].join(' ')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const query = (e.target as HTMLInputElement).value;
                        if (query.trim()) {
                          onNavigate('search', query);
                          setSearchOpen(false);
                        }
                      }
                    }}
                  />
                </div>
                <button
                  ref={searchBtnRef}
                  onClick={() => onSearch ? onSearch() : setSearchOpen((s) => !s)}
                  className="p-1 hover:opacity-70 transition-opacity"
                  aria-label="Toggle search"
                >
                  <Search className="w-4 h-4 stroke-[2]" />
                </button>
              </div>

              {/* Theme Toggle - Animated */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label="Toggle theme"
              >
                <div
                  className="transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center justify-center"
                  style={{ transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(360deg)' }}
                >
                  {theme === 'dark'
                    ? <Sun className="w-4 h-4 stroke-[2]" />
                    : <Moon className="w-4 h-4 stroke-[2]" />
                  }
                </div>
              </button>

              {/* Contact Button */}
              <button
                onClick={() => handleNavClick('contact')}
                className={[
                  'hidden lg:inline-flex nav-desktop-only',
                  'font-pixel text-[10px] tracking-[0.1em]', // Pixel + Small
                  'px-6 py-2 rounded-full border transition-all duration-300', // Rounded Full
                  isNavDark // Adaptive
                    ? 'border-white/30 hover:bg-white hover:text-black text-white'
                    : 'border-neutral-900/30 hover:bg-neutral-900 hover:text-white text-neutral-900',
                ].join(' ')}
                aria-label="Go to contact"
              >
                CONTACT
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen((o) => !o)}
                className={[
                  'lg:hidden nav-mobile-only',
                  'p-2 ml-2',
                  'hover:opacity-60 transition-opacity',
                  'flex items-center justify-center',
                  isDark ? 'text-white' : 'text-neutral-900'
                ].join(' ')}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4. MEGA MENU CONTENT PANE - UNIFIED GLASS */}
        <div
          onMouseEnter={() => activeDropdown && handleDropdownEnter(activeDropdown)}
          onMouseLeave={handleDropdownLeave}
          className={[
            'overflow-hidden transition-all duration-300 ease-out border-none',
            activeDropdown ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0',
            // NO BACKGROUND HERE - Shares parent nav background for perfect match
            'bg-transparent'
          ].join(' ')}
        >
          <div className="mx-auto px-4 lg:px-8 max-w-7xl py-8">
            {NAVIGATION.tabs.map(tab => {
              const hasSub = 'submenu' in tab && activeDropdown === tab.page;
              if (!hasSub) return null;

              return (
                <div key={tab.label} className="flex flex-col md:flex-row items-start gap-12 animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* Label Column */}
                  <div className="w-32 flex-shrink-0 pt-1 opacity-40">
                    <h3
                      className={isDark ? 'text-white' : 'text-neutral-900'}
                      style={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase'
                      }}
                    >
                      {tab.label}
                    </h3>
                  </div>

                  {/* Submenu Layout */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8">
                    {(tab as any).submenu.map((sub: any) => (
                      <button
                        key={sub.label}
                        onClick={() => handleNavClick(sub.page, sub.slug)}
                        className="group flex flex-col items-start"
                      >
                        <span
                          className={[
                            'font-medium tracking-widest transition-colors text-left flex items-center gap-2',
                            isDark ? 'text-white group-hover:text-white/60' : 'text-neutral-900 group-hover:text-neutral-600'
                          ].join(' ')}
                          style={{ fontSize: '11px' }}
                        >
                          {/* Label First */}
                          {sub.label}

                          {/* Hover Indicator Arrow [RIGHT] */}
                          <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-[9px] block">
                            →
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className={`fixed inset-0 z-40 px-6 pt-24 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
          <div className="flex flex-col space-y-6 animate-in slide-in-from-right-4 duration-300">
            {NAVIGATION.tabs.filter(t => CENTER_PAGES.has(t.page)).map((tab: any) => (
              <div key={tab.label}>
                <button
                  onClick={() => handleNavClick(tab.page)}
                  className="text-2xl font-bold tracking-tight mb-3 block text-left"
                >
                  {tab.label}
                </button>
                <div className="pl-1 flex flex-col gap-2 border-l-2 border-current ml-1">
                  {tab.submenu?.map((sub: any) => (
                    <button
                      key={sub.label}
                      onClick={() => handleNavClick(sub.page, sub.slug)}
                      className="text-left pl-4 text-sm font-medium opacity-70 hover:opacity-100"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-current/10">
              <button onClick={() => handleNavClick('contact')} className="text-2xl font-bold tracking-tight">CONTACT</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
