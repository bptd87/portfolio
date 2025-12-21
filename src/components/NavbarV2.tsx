import { useState, useRef } from 'react';
import { Menu, X, Moon, Sun, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { NAVIGATION, hasSubmenu } from '../data/navigation';
import { SearchModal } from './SearchModal';

interface NavbarV2Props {
  onNavigate: (page: string, filter?: string) => void;
  currentPage?: string;
}

const DARK_LOGO = 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/Site%20Files/Brandon%20PT%20Davis%20-%20Dark.png';
const LIGHT_LOGO = 'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/Site%20Files/Brandon%20PT%20Davis%20-%20Light.png';

export function NavbarV2({ onNavigate, currentPage }: NavbarV2Props) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  const handleNavClick = (page: string, filter?: string) => {
    onNavigate(page, filter);
    setMobileMenuOpen(false);
    setHoveredTab(null);
  };

  const logo = isDark ? DARK_LOGO : LIGHT_LOGO;

  return (
    <>
      {/* Minimal Navbar - No glass, clean design */}
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          isDark
            ? 'bg-neutral-950 border-neutral-800/30'
            : 'bg-white border-neutral-200/30'
        }`}
      >
        <div className="mx-auto px-4 md:px-8 max-w-7xl">
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

            {/* Desktop: Tabs Centered (NO glass, turns blue on hover) */}
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
              {NAVIGATION.tabs.map((tab) => (
                <div
                  key={tab.label}
                  className="relative"
                  onMouseEnter={() => hasSubmenu(tab) && setHoveredTab(tab.label)}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  {/* Tab Button - turns blue on hover if has submenu */}
                  <button
                    onClick={() => !hasSubmenu(tab) && handleNavClick(tab.page)}
                    className={`font-pixel text-xs tracking-[0.15em] transition-all duration-200 ${
                      hoveredTab === tab.label && hasSubmenu(tab)
                        ? 'text-blue-500'
                        : currentPage === tab.page || currentPage?.startsWith(tab.page)
                        ? isDark
                          ? 'text-white'
                          : 'text-neutral-900'
                        : isDark
                        ? 'text-white/60 hover:text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {tab.label}
                  </button>

                  {/* Submenu - Glass effect ONLY on hover */}
                  {hasSubmenu(tab) && hoveredTab === tab.label && (
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[200px] rounded-lg backdrop-blur-xl border shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
                        isDark
                          ? 'bg-neutral-900/80 border-neutral-800/50'
                          : 'bg-white/80 border-neutral-200/50'
                      }`}
                    >
                      {tab.submenu.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleNavClick(item.page, item.slug)}
                          className={`w-full px-4 py-2.5 text-left text-xs font-pixel tracking-[0.12em] transition-all duration-150 ${
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

            {/* Right: Controls (Search + Theme + Mobile Menu) */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:opacity-60 transition-opacity"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>

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

              {/* Mobile: Hamburger Menu (md:hidden, far right) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:opacity-60 transition-opacity"
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
            <div className={`md:hidden pb-6 border-t ${
              isDark ? 'border-neutral-800/30' : 'border-neutral-200/30'
            }`}>
              <div className="space-y-1 pt-6 px-4">
                {NAVIGATION.tabs.map((tab) => (
                  <div key={tab.label}>
                    {hasSubmenu(tab) ? (
                      <>
                        <button
                          onClick={() =>
                            setHoveredTab(
                              hoveredTab === tab.label ? null : tab.label
                            )
                          }
                          className={`w-full px-0 py-4 text-left font-pixel text-base tracking-[0.12em] rounded transition-all duration-200 flex items-center justify-between border-b ${
                            isDark
                              ? 'text-white border-neutral-800/20 hover:text-blue-500'
                              : 'text-neutral-900 border-neutral-200/30 hover:text-blue-500'
                          }`}
                        >
                          {tab.label}
                          <span
                            className={`transition-transform duration-300 text-sm ${
                              hoveredTab === tab.label ? 'rotate-180' : ''
                            }`}
                          >
                            ▾
                          </span>
                        </button>

                        {hoveredTab === tab.label && (
                          <div className="space-y-0 bg-neutral-50/5 dark:bg-white/5 rounded my-2">
                            {tab.submenu.map((item) => (
                              <button
                                key={item.label}
                                onClick={() =>
                                  handleNavClick(item.page, item.slug)
                                }
                                className={`w-full px-6 py-3.5 text-left text-sm font-pixel tracking-[0.08em] rounded transition-all duration-200 block ${
                                  isDark
                                    ? 'text-white/70 hover:text-white/90'
                                    : 'text-neutral-700 hover:text-neutral-900'
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
                        className={`w-full px-0 py-4 text-left font-pixel text-base tracking-[0.12em] rounded transition-all duration-200 border-b ${
                          isDark
                            ? 'text-white border-neutral-800/20 hover:text-blue-500'
                            : 'text-neutral-900 border-neutral-200/30 hover:text-blue-500'
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
