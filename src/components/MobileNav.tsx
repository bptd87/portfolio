import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutGrid, BookOpen, Search, Menu, X, Sun, Moon, ChevronDown, User, Mail, Box, Newspaper } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { NAVIGATION } from '../data/navigation';

interface MobileNavProps {
  onNavigate: (page: string, slug?: string) => void;
  currentPage?: string;
}

// Custom Icon Component for the Pixel "B" to match DesktopNav
function PixelBIcon({ className }: { className?: string }) {
  return (
    <span
      className={`${className} flex items-center justify-center font-pixel leading-none`}
      style={{ fontFamily: "'VT323', monospace", fontSize: '2.0rem', transform: 'translateY(-2px)' }}
    >
      B
    </span>
  );
}

export function MobileNav({ onNavigate, currentPage }: MobileNavProps) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and toggle visibility class when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('overflow-hidden', 'mobile-nav-open');
    } else {
      document.body.classList.remove('overflow-hidden', 'mobile-nav-open');
    }
    return () => {
      document.body.classList.remove('overflow-hidden', 'mobile-nav-open');
    };
  }, [menuOpen]);
  useEffect(() => {
    setMenuOpen(false);
  }, [currentPage]);

  const handleNavClick = (page: string, slug?: string) => {
    onNavigate(page, slug);
    setMenuOpen(false);
    setExpandedSection(null);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const isWorkActive = currentPage === 'portfolio' || currentPage === 'project';
  const isNewsActive = currentPage === 'news' || currentPage === 'news-article';
  const isStudioActive = currentPage === 'studio' || currentPage === 'scenic-studio' || currentPage === 'app-studio' || currentPage === 'scenic-vault' || currentPage === 'directory' || currentPage === 'tutorial';
  const isAboutActive = currentPage === 'about' || currentPage === 'bio' || currentPage === 'cv' || currentPage === 'collaborators' || currentPage === 'teaching-philosophy' || currentPage === 'creative-statement';
  const isHomeActive = currentPage === 'home';

  return (
    <>
      {/* 1. Top Bar: Hamburger, Branding, Theme (Fixed Top) */}
      <header className="fixed top-0 inset-x-0 z-[9999] h-14 bg-white/90 dark:bg-black/90 backdrop-blur-3xl border-b border-neutral-200 dark:border-white/10 flex items-center justify-between px-4 transition-all duration-300 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">

        {/* Left: Hamburger Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-10 h-10 flex items-center justify-center text-black dark:text-white hover:text-black/70 dark:hover:text-white/80 transition-colors -ml-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Center: Branding */}
        <button
          onClick={() => handleNavClick('home')}
          className="font-pixel text-lg tracking-[0.2em] text-black dark:text-white hover:text-black/70 dark:hover:text-white/80 transition-colors"
        >
          BRANDON PT DAVIS
        </button>

        {/* Right: Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* 2. Full Screen Menu Overlay (Entire Site Navigation) - PORTALED TO BODY */}
      {mounted && createPortal(
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[2147483647] bg-white dark:bg-black overflow-y-auto"
            >
              {/* Close Button & Header Loop (Duplicate Header for continuity in overlay) */}
              <div className="fixed top-0 inset-x-0 h-14 flex items-center justify-between px-4 z-[2147483647] bg-white dark:bg-black border-b border-neutral-200 dark:border-white/10">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-black dark:text-white hover:text-black/70 dark:hover:text-white/80 transition-colors -ml-2"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
                <span className="font-pixel text-lg tracking-[0.2em] text-black dark:text-white">
                  MENU
                </span>
                <div className="w-10" /> {/* Spacer */}
              </div>

              <div className="pt-20 pb-24 px-6 space-y-8 max-w-md mx-auto min-h-screen bg-white dark:bg-black">

                {/* Menu Sections - Complete Site Map from Navigation Data */}
                <nav className="space-y-6">
                  {/* SEARCH (Always First) */}
                  <button
                    onClick={() => handleNavClick('search')}
                    className="flex items-center gap-4 w-full font-display text-3xl text-black dark:text-white hover:text-black/70 dark:hover:text-white/80 transition-all opacity-80 hover:opacity-100 mb-8"
                  >
                    <Search className="w-6 h-6" />
                    <span>Search</span>
                  </button>

                  {/* Dynamic Navigation Items */}
                  {NAVIGATION.tabs.map((tab) => {
                    // Skip explicit "Home" if it exists (though it doesn't in the data, we safeguard)
                    // The user said "I dont need a home section", so we filter if exact match or if label suggests it.
                    if (tab.page === 'home') return null;

                    // Check if it has submenu
                    const hasSub = 'submenu' in tab && Array.isArray((tab as any).submenu);
                    const key = tab.label;

                    if (hasSub) {
                      const subItems = (tab as any).submenu;
                      return (
                        <div key={key}>
                          <button
                            onClick={() => toggleSection(key)}
                            className="flex items-center justify-between w-full font-display text-3xl text-black dark:text-white hover:text-black/70 dark:hover:text-white/80 transition-all group"
                          >
                            <span className="capitalize">{tab.label.toLowerCase()}</span>
                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedSection === key ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {expandedSection === key && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 ml-4 space-y-4 border-l border-neutral-200 dark:border-white/10 pl-4 py-2">
                                  {subItems.map((sub: any) => (
                                    <button
                                      key={sub.label}
                                      onClick={() => handleNavClick(sub.page, sub.slug)}
                                      className="block w-full text-left font-pixel text-sm tracking-wider text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white py-1 transition-colors uppercase"
                                    >
                                      {sub.label}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    } else {
                      // Simple Link
                      return (
                        <button
                          key={key}
                          onClick={() => handleNavClick(tab.page, tab.slug)}
                          className="block w-full text-left font-display text-3xl text-black dark:text-white hover:text-black/70 dark:hover:text-white/80 capitalize"
                        >
                          {tab.label.toLowerCase()}
                        </button>
                      );
                    }
                  })}
                </nav>

                {/* Footer Links in Menu */}
                <div className="pt-8 border-t border-neutral-200 dark:border-white/10 space-y-4">
                  <div className="flex flex-wrap gap-4 text-xs text-black/40 dark:text-white/40 font-pixel tracking-wider uppercase">
                    <button onClick={() => handleNavClick('sitemap')} className="hover:text-black dark:hover:text-white">Sitemap</button>
                    <button onClick={() => handleNavClick('faq')} className="hover:text-black dark:hover:text-white">FAQ</button>
                    <button onClick={() => handleNavClick('accessibility')} className="hover:text-black dark:hover:text-white">Accessibility</button>
                    <button onClick={() => handleNavClick('privacy-policy')} className="hover:text-black dark:hover:text-white">Privacy</button>
                    <button onClick={() => handleNavClick('terms-of-use')} className="hover:text-black dark:hover:text-white">Terms</button>
                  </div>
                  <div className="text-[10px] text-black/20 dark:text-white/20 font-pixel tracking-widest">
                    © {new Date().getFullYear()} BRANDON PT DAVIS
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 3. Bottom Tab Bar (Fixed Bottom) */}
      <nav className="fixed bottom-0 inset-x-0 z-[9999] bg-white/90 dark:bg-black/90 backdrop-blur-3xl border-t border-neutral-200 dark:border-white/10 pb-safe supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
        <div className="flex items-center justify-between px-6 h-16 max-w-md mx-auto">

          <TabButton
            icon={PixelBIcon}
            isActive={isHomeActive}
            onClick={() => handleNavClick('home')}
            label="Home"
          />

          <TabButton
            icon={User}
            isActive={isAboutActive}
            onClick={() => handleNavClick('about')}
            label="About"
          />

          <TabButton
            icon={LayoutGrid}
            isActive={isWorkActive}
            onClick={() => handleNavClick('portfolio', 'scenic-design')}
            label="Work"
          />

          <TabButton
            icon={Newspaper}
            isActive={isNewsActive}
            onClick={() => handleNavClick('news')}
            label="News"
          />

          <TabButton
            icon={Box}
            isActive={isStudioActive}
            onClick={() => handleNavClick('studio')}
            label="Studio"
          />

        </div>
      </nav>
    </>
  );
}

// Sub-component for clean Tab buttons
function TabButton({ icon: Icon, isActive, onClick, label }: { icon: any, isActive: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all duration-200 active:scale-95`}
      aria-label={label}
    >
      <Icon
        className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-black dark:text-white scale-110 drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70'}`}
        strokeWidth={isActive ? 2.5 : 1.5}
      />
    </button>
  );
}
