import { useState, useRef, useEffect } from 'react';
import { Menu, X, Moon, Sun, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { NAVIGATION } from '../data/navigation';

interface NavbarV2Props {
  onNavigate: (page: string, filter?: string) => void;
  currentPage?: string;
}

const DARK_LOGO = 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/Site%20Files/Brandon%20PT%20Davis%20-%20Dark.png';
const LIGHT_LOGO = 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/Site%20Files/Brandon%20PT%20Davis%20-%20Light.png';

export function NavbarV2({ onNavigate, currentPage }: NavbarV2Props) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navTone, setNavTone] = useState<'dark' | 'light'>(theme === 'dark' ? 'dark' : 'light');
  const navRef = useRef<HTMLDivElement>(null);
  const isDark = navTone === 'dark';

  const handleNavClick = (page: string, filter?: string) => {
    onNavigate(page, filter);
    setMobileMenuOpen(false);
  };

  // Automatic nav tone switching via IntersectionObserver (data-nav="dark|light")
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-nav]'));
    if (!sections.length) {
      // Fallback to body class per page
      const body = document.body;
      if (body.classList.contains('theme-dark-nav')) setNavTone('dark');
      else if (body.classList.contains('theme-light-nav')) setNavTone('light');
      else setNavTone(theme === 'dark' ? 'dark' : 'light');
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        // Prefer the entry nearest the top
        const topEntry = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top))[0];
        if (topEntry) {
          const el = topEntry.target as HTMLElement;
          const tone = (el.dataset.nav as 'dark' | 'light') || 'light';
          setNavTone(tone);
        }
      },
      {
        rootMargin: '-64px 0px -80% 0px',
        threshold: 0.1,
      }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [theme, currentPage]);

  const logo = isDark ? DARK_LOGO : LIGHT_LOGO;

  return (
    <>
      {/* Frosted Glass Navbar with subtle border */}
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
          isDark
            ? 'bg-neutral-900/70 border-neutral-800/40'
            : 'bg-white/60 border-neutral-200/40'
        }`}
      >
        <div className="mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Single Logo (always left) */}
            <div className="flex-shrink-0">
              <button
                onClick={() => handleNavClick('home')}
                className="group transition-all duration-300"
                title="Go to home"
              >
                <img
                  src={logo}
                  alt="Brandon PT Davis"
                  className="h-12 md:h-16 w-auto object-contain group-hover:opacity-80 transition-opacity duration-300"
                />
              </button>
            </div>

            {/* Desktop: Inline Tabs (no dropdowns) */}
            <div className="hidden lg:flex items-center gap-10 flex-1 justify-center">
              {NAVIGATION.tabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => handleNavClick(tab.page)}
                  className={`font-pixel text-[13px] tracking-[0.2em] px-3 py-2 transition-colors duration-150 border-b-2 border-transparent ${
                    currentPage === tab.page || currentPage?.startsWith(tab.page)
                      ? isDark
                        ? 'text-white border-white/60'
                        : 'text-neutral-900 border-neutral-900/60'
                      : isDark
                      ? 'text-white/70 hover:text-white'
                      : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right: Controls (Search + Theme + Mobile Menu) */}
            <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="p-2 hover:opacity-60 transition-opacity"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Inline expanding search input (no dropdown) */}
              {searchOpen && (
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  className={`ml-1 w-40 lg:w-64 px-3 py-2 rounded-md outline-none transition-colors duration-200 ${
                    isDark
                      ? 'bg-white/10 text-white placeholder:text-white/50 border border-white/10'
                      : 'bg-neutral-100/60 text-neutral-900 placeholder:text-neutral-500 border border-neutral-300/40'
                  }`}
                />
              )}

              <button
                onClick={toggleTheme}
                className="p-2 hover:opacity-60 transition-opacity"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Mobile: Hamburger Menu (<1024px only) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:opacity-60 transition-opacity"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu - Only on mobile */}
          {mobileMenuOpen && (
            <div className={`lg:hidden pb-6 ${
              isDark ? 'border-neutral-800/30' : 'border-neutral-200/30'
            }`}>
              <div className="space-y-1 pt-6 px-4">
                {NAVIGATION.tabs.map((tab) => (
                  <div key={tab.label}>
                    <button
                      onClick={() => handleNavClick(tab.page)}
                      className={`w-full px-0 py-4 text-left font-pixel text-base tracking-[0.14em] rounded transition-all duration-200 ${
                        isDark
                          ? 'text-white hover:text-blue-400'
                          : 'text-neutral-900 hover:text-blue-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

    </>
  );
}
