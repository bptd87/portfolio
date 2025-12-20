import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
  breadcrumb?: string;
  transparent?: boolean;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const lastScrollYRef = useRef(0);
  const navRef = useRef<HTMLDivElement>(null);

  // Close menu when mouse leaves navbar area
  useEffect(() => {
    if (!menuOpen) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.relatedTarget as Node)) {
        // Add a small delay to prevent accidental closes
        setTimeout(() => {
          const rect = navRef.current?.getBoundingClientRect();
          if (rect) {
            const mouseY = e.clientY;
            const mouseX = e.clientX;
            // Check if mouse is far from navbar
            if (mouseY > rect.bottom + 50 || mouseX < rect.left - 50 || mouseX > rect.right + 50) {
              setMenuOpen(false);
              setExpandedSection(null);
            }
          }
        }, 300);
      }
    };

    const navElement = navRef.current;
    if (navElement) {
      navElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (navElement) {
        navElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [menuOpen]);

  // Handle scroll for auto-hide
  useEffect(() => {
    const handleScroll = (e: Event) => {
      // Check if we're on home page with custom scroll container
      const target = e.target as HTMLElement;
      const currentScrollY = target.id === 'home-scroll-container'
        ? target.scrollTop
        : (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop);
      
      // Show background after scrolling 50px
      setScrolled(currentScrollY > 50);

      // Hide navbar when scrolling DOWN past 100px, show when scrolling UP
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
        setHidden(true);
      } else if (currentScrollY < lastScrollYRef.current) {
        setHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    // Attach listeners
    const attachListeners = () => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.documentElement.addEventListener('scroll', handleScroll, { passive: true });
      document.body.addEventListener('scroll', handleScroll, { passive: true });
      
      const homeContainer = document.getElementById('home-scroll-container');
      if (homeContainer) {
        homeContainer.addEventListener('scroll', handleScroll, { passive: true });
      }
    };

    // Initial attach
    attachListeners();

    // Watch for home container to be added to DOM
    const observer = new MutationObserver(() => {
      const homeContainer = document.getElementById('home-scroll-container');
      if (homeContainer && !homeContainer.hasAttribute('data-scroll-listener')) {
        homeContainer.setAttribute('data-scroll-listener', 'true');
        homeContainer.addEventListener('scroll', handleScroll, { passive: true });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      document.documentElement.removeEventListener('scroll', handleScroll);
      document.body.removeEventListener('scroll', handleScroll);
      
      const homeContainer = document.getElementById('home-scroll-container');
      if (homeContainer) {
        homeContainer.removeEventListener('scroll', handleScroll);
        homeContainer.removeAttribute('data-scroll-listener');
      }
    };
  }, []); // Empty dependency array - only set up once!

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMenuOpen(false);
    setExpandedSection(null);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 w-full flex justify-center px-4 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-6'
      } ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
    >

      {/* Navbar Container - Rounded on both mobile and desktop */}
      <div
        ref={navRef}
        className={`rounded-3xl w-full md:w-[90%] transition-all duration-300 border border-white/10 ${
          scrolled || menuOpen
            ? 'backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 shadow-2xl'
            : 'backdrop-blur-xl bg-neutral-800/50 dark:bg-neutral-900/50 shadow-md'
        }`}
        style={{ maxWidth: '900px' }}
      >

        {/* Top Bar - Always Visible */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-3">

            {/* Left - Hamburger/Close */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative hover:opacity-60 flex-shrink-0"
              aria-label="Toggle menu"
              style={{
                appearance: 'none',
                border: 'none',
                background: 'none',
                padding: 0,
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Line 1 */}
              <span
                style={{
                  position: 'absolute',
                  width: '20px',
                  height: '2px',
                  backgroundColor: 'white',
                  left: '2px',
                  top: '6px',
                  transformOrigin: '10px 1px',
                  transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
              {/* Line 2 */}
              <span
                style={{
                  position: 'absolute',
                  width: '20px',
                  height: '2px',
                  backgroundColor: 'white',
                  left: '2px',
                  top: '16px',
                  transformOrigin: '10px 1px',
                  transform: menuOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
                  transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </button>

            {/* Center - Logo (Clickable) */}
            <button
              onClick={() => handleNavClick('home')}
              className="hover:opacity-70 transition-opacity duration-200 cursor-pointer flex-1 text-center group"
            >
              <div className="font-pixel text-lg md:text-2xl tracking-[0.2em] text-white whitespace-nowrap group-hover:drop-shadow-lg transition-all duration-200">
                BRANDON PT DAVIS
              </div>
            </button>

            {/* Right - Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:opacity-60 focus:outline-none transition-all duration-300 flex-shrink-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-white" />
              ) : (
                <Moon className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <>
            <div className="px-8 py-10 space-y-8 animate-in fade-in duration-200">
              <nav className="space-y-6">

                {/* PORTFOLIO */}
                <button
                  onClick={() => handleNavClick('portfolio')}
                  className="block w-full font-pixel text-2xl tracking-[0.15em] text-white hover:text-white/80 focus:outline-none transition-all duration-200 relative group"
                  style={{ imageRendering: 'pixelated', textRendering: 'geometricPrecision' }}
                >
                  <span className="relative">
                    PORTFOLIO
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/60 group-hover:w-full transition-all duration-300" />
                  </span>
                </button>

                {/* NEWS */}
                <button
                  onClick={() => handleNavClick('news')}
                  className="block w-full font-pixel text-2xl tracking-[0.15em] text-white hover:text-white/80 focus:outline-none transition-all duration-200 relative group"
                  style={{ imageRendering: 'pixelated', textRendering: 'geometricPrecision' }}
                >
                  <span className="relative">
                    NEWS
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/60 group-hover:w-full transition-all duration-300" />
                  </span>
                </button>

                {/* ARTICLES */}
                <button
                  onClick={() => handleNavClick('scenic-insights')}
                  className="block w-full font-pixel text-2xl tracking-[0.15em] text-white hover:text-white/80 focus:outline-none transition-all duration-200 relative group"
                  style={{ imageRendering: 'pixelated', textRendering: 'geometricPrecision' }}
                >
                  <span className="relative">
                    ARTICLES
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/60 group-hover:w-full transition-all duration-300" />
                  </span>
                </button>

                {/* STUDIO */}
                <button
                  onClick={() => handleNavClick('studio')}
                  className="block w-full font-pixel text-2xl tracking-[0.15em] text-white hover:text-white/80 focus:outline-none transition-all duration-200 relative group"
                  style={{ imageRendering: 'pixelated', textRendering: 'geometricPrecision' }}
                >
                  <span className="relative">
                    STUDIO
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/60 group-hover:w-full transition-all duration-300" />
                  </span>
                </button>

                {/* ABOUT */}
                <div>
                  <button
                    onClick={() => toggleSection('about')}
                    className="flex items-center justify-center gap-2 w-full font-pixel text-2xl tracking-[0.15em] text-white hover:text-white/80 focus:outline-none transition-all duration-200 group"
                  >
                    ABOUT
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 group-hover:opacity-80 ${expandedSection === 'about' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSection === 'about' && (
                    <div className="mt-3 ml-4 space-y-2 border-l border-white/20 pl-4">
                      <button
                        onClick={() => handleNavClick('about')}
                        className="block w-full font-pixel text-sm tracking-[0.12em] text-white/60 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-2 py-1 transition-colors duration-200"
                      >
                        BIO
                      </button>
                      <button
                        onClick={() => handleNavClick('cv')}
                        className="block w-full font-pixel text-sm tracking-[0.12em] text-white/60 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-2 py-1 transition-colors duration-200"
                      >
                        CV
                      </button>
                      <button
                        onClick={() => handleNavClick('collaborators')}
                        className="block w-full font-pixel text-sm tracking-[0.12em] text-white/60 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-2 py-1 transition-colors duration-200"
                      >
                        COLLABORATORS
                      </button>
                      <button
                        onClick={() => handleNavClick('teaching-philosophy')}
                        className="block w-full font-pixel text-sm tracking-[0.12em] text-white/60 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-2 py-1 transition-colors duration-200"
                      >
                        TEACHING PHILOSOPHY
                      </button>
                      <button
                        onClick={() => handleNavClick('creative-statement')}
                        className="block w-full font-pixel text-sm tracking-[0.12em] text-white/60 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-2 py-1 transition-colors duration-200"
                      >
                        CREATIVE STATEMENT
                      </button>
                    </div>
                  )}
                </div>

                {/* CONTACT - CTA Style */}
                <button
                  onClick={() => handleNavClick('contact')}
                  className="block w-full font-pixel text-2xl tracking-[0.15em] text-white bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 border border-white/40 hover:border-white/60 rounded-lg px-3 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 mt-2"
                >
                  CONTACT
                </button>
              </nav>
            </div>

            {/* Footer Links */}
            <div className="border-t border-white/15 px-4 py-5">
              <div className="flex flex-wrap items-center justify-center gap-3 font-pixel text-[9px] tracking-[0.15em] text-white/40 uppercase">
                <button
                  onClick={() => handleNavClick('sitemap')}
                  className="hover:text-white/70 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-white/20 rounded px-1"
                >
                  SITEMAP
                </button>
                <span>•</span>
                <button
                  onClick={() => handleNavClick('faq')}
                  className="hover:text-white/70 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-white/20 rounded px-1"
                >
                  FAQ
                </button>
                <span>•</span>
                <button
                  onClick={() => handleNavClick('accessibility')}
                  className="hover:text-white/70 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-white/20 rounded px-1"
                >
                  ACCESSIBILITY
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2 font-pixel text-[9px] tracking-[0.15em] text-white/40 uppercase">
                <button
                  onClick={() => handleNavClick('privacy-policy')}
                  className="hover:text-white/70 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-white/20 rounded px-1"
                >
                  PRIVACY
                </button>
                <span>•</span>
                <button
                  onClick={() => handleNavClick('terms-of-use')}
                  className="hover:text-white/70 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-white/20 rounded px-1"
                >
                  TERMS
                </button>
              </div>
              <div className="text-center mt-4 font-pixel text-[8px] text-white/25 tracking-[0.15em]">
                © {new Date().getFullYear()} BRANDON PT DAVIS
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
