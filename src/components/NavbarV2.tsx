import { useState, useEffect, useRef } from 'react';
import { Menu, X, Moon, Sun, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { NAVIGATION, hasSubmenu } from '../data/navigation';
import { SearchModal } from './SearchModal';

interface NavbarV2Props {
  onNavigate: (page: string, filter?: string) => void;
  currentPage?: string;
}

export function NavbarV2({ onNavigate, currentPage }: NavbarV2Props) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedTab, setExpandedTab] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when navigating
  const handleNavClick = (page: string, filter?: string) => {
    onNavigate(page, filter);
    setMobileMenuOpen(false);
    setExpandedTab(null);
  };

  return (
    <>
      {/* Navbar */}
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-4'
        }`}
      >
        <div
          className={`mx-auto px-4 md:px-6 transition-all duration-300 ${
            scrolled || mobileMenuOpen
              ? isDark
                ? 'backdrop-blur-xl bg-neutral-950/80 border-neutral-800/50'
                : 'backdrop-blur-xl bg-white/80 border-neutral-200/50'
              : isDark
              ? 'backdrop-blur-md bg-neutral-950/60 border-neutral-800/30'
              : 'backdrop-blur-md bg-white/60 border-neutral-200/30'
          } border rounded-3xl shadow-lg`}
          style={{ maxWidth: '1200px', margin: '0 auto' }}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:opacity-70 transition-opacity"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Center: Logo with Glow Effect */}
            <button
              onClick={() => handleNavClick('home')}
              className={`flex-1 md:flex-none text-center group transition-all duration-300 ${
                isDark ? 'text-white' : 'text-neutral-900'
              }`}
            >
              <div className="font-pixel text-sm md:text-lg tracking-[0.15em] whitespace-nowrap group-hover:drop-shadow-lg transition-all duration-300"
                style={{
                  textShadow: mobileMenuOpen || expandedTab ? (
                    isDark
                      ? '0 0 20px rgba(255, 255, 255, 0.5)'
                      : '0 0 20px rgba(0, 0, 0, 0.3)'
                  ) : 'none',
                }}
              >
                BRANDON PT DAVIS
              </div>
            </button>

            {/* Right: Theme Toggle + Search */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:opacity-70 transition-opacity"
                aria-label="Open search"
              >
                <Search className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:opacity-70 transition-opacity"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <Moon className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 px-2 pb-2 overflow-x-auto">
            {NAVIGATION.tabs.map((tab) => (
              <div key={tab.label} className="relative group">
                <button
                  onClick={() => !hasSubmenu(tab) && handleNavClick(tab.page)}
                  onMouseEnter={() =>
                    hasSubmenu(tab) && setExpandedTab(tab.label)
                  }
                  onMouseLeave={() => setExpandedTab(null)}
                  className={`px-3 py-2 rounded-lg text-sm font-pixel tracking-[0.1em] transition-all duration-300 whitespace-nowrap ${
                    currentPage === tab.page || currentPage?.startsWith(tab.page)
                      ? isDark
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-800/20 text-neutral-900'
                      : isDark
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-800/10'
                  }`}
                >
                  {tab.label}
                </button>

                {/* Submenu on Hover */}
                {hasSubmenu(tab) && expandedTab === tab.label && (
                  <div
                    onMouseEnter={() => setExpandedTab(tab.label)}
                    onMouseLeave={() => setExpandedTab(null)}
                    className={`absolute top-full left-0 mt-1 min-w-[200px] rounded-lg backdrop-blur-xl border shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
                      isDark
                        ? 'bg-neutral-900/95 border-neutral-800/50'
                        : 'bg-white/95 border-neutral-200/50'
                    }`}
                  >
                    {tab.submenu.map((item) => (
                      <button
                        key={item.label}
                        onClick={() =>
                          handleNavClick(item.page, item.slug)
                        }
                        className={`w-full px-4 py-2 text-left text-sm font-pixel tracking-[0.08em] transition-all duration-200 ${
                          isDark
                            ? 'text-white/70 hover:text-white hover:bg-white/10'
                            : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-800/10'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`md:hidden pb-4 border-t ${
              isDark ? 'border-neutral-800/30' : 'border-neutral-200/30'
            }`}>
              <div className="space-y-2 pt-4">
                {NAVIGATION.tabs.map((tab) => (
                  <div key={tab.label}>
                    {hasSubmenu(tab) ? (
                      <>
                        <button
                          onClick={() =>
                            setExpandedTab(
                              expandedTab === tab.label ? null : tab.label
                            )
                          }
                          className={`w-full px-4 py-2 text-left font-pixel text-sm tracking-[0.1em] rounded-lg transition-all duration-200 flex items-center justify-between ${
                            isDark
                              ? 'text-white/70 hover:text-white hover:bg-white/10'
                              : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-800/10'
                          }`}
                        >
                          {tab.label}
                          <span
                            className={`transition-transform duration-300 ${
                              expandedTab === tab.label ? 'rotate-180' : ''
                            }`}
                          >
                            ▼
                          </span>
                        </button>

                        {expandedTab === tab.label && (
                          <div className="ml-4 space-y-1 mt-1">
                            {tab.submenu.map((item) => (
                              <button
                                key={item.label}
                                onClick={() =>
                                  handleNavClick(item.page, item.slug)
                                }
                                className={`w-full px-4 py-2 text-left text-xs font-pixel tracking-[0.08em] rounded transition-all duration-200 ${
                                  isDark
                                    ? 'text-white/50 hover:text-white/90 hover:bg-white/5'
                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-800/5'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => handleNavClick(tab.page)}
                        className={`w-full px-4 py-2 text-left font-pixel text-sm tracking-[0.1em] rounded-lg transition-all duration-200 ${
                          isDark
                            ? 'text-white/70 hover:text-white hover:bg-white/10'
                            : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-800/10'
                        }`}
                      >
                        {tab.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavClick}
      />
    </>
  );
}
