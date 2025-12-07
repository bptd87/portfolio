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
    // Try multiple scroll targets
    const scrollTargets = [
      window,
      document.documentElement,
      document.body
    ];

    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
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

    // Add listeners to all possible scroll targets
    scrollTargets.forEach(target => {
      target.addEventListener('scroll', handleScroll, { passive: true });
    });

    return () => {
      scrollTargets.forEach(target => {
        target.removeEventListener('scroll', handleScroll);
      });
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
      className={`fixed top-0 left-0 right-0 z-50 w-full flex justify-center py-6 px-4 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'
        }`}
    >

      {/* Navbar Container - Rounded on both mobile and desktop */}
      <div
        ref={navRef}
        className={`shadow-2xl rounded-3xl w-full md:w-[90%] md:max-w-md transition-colors duration-300 ${scrolled || menuOpen
          ? 'bg-neutral-700/80 backdrop-blur-xl'
          : 'bg-neutral-600/60 backdrop-blur-md'
          }`}
      >

        {/* Top Bar - Always Visible */}
        <div className="px-6 py-3.5">
          <div className="flex items-center justify-between">

            {/* Left - Hamburger/Close */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hover:opacity-70 transition-all duration-300 w-8 h-8 relative"
              aria-label="Toggle menu"
            >
              {/* Line 1 */}
              <span
                className="absolute left-1 bg-white transition-all duration-300"
                style={{
                  width: '20px',
                  height: '3px',
                  top: menuOpen ? '14px' : '10px',
                  transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                }}
              />
              {/* Line 2 */}
              <span
                className="absolute left-1 bg-white transition-all duration-300"
                style={{
                  width: '20px',
                  height: '3px',
                  top: menuOpen ? '14px' : '18px',
                  transform: menuOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Center - Logo (Clickable) */}
            <button
              onClick={() => handleNavClick('home')}
              className="hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="font-pixel text-2xl md:text-3xl tracking-[0.2em] text-white whitespace-nowrap">
                BRANDON PT DAVIS
              </div>
            </button>

            {/* Right - Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:opacity-70 transition-opacity"
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
            <div className="border-t border-white/10" />

            <div className="px-6 py-8">
              <nav className="space-y-5">

                {/* PORTFOLIO */}
                <button
                  onClick={() => handleNavClick('portfolio')}
                  className="block w-full font-pixel text-3xl tracking-[0.15em] text-white hover:opacity-70 transition-opacity text-center"
                >
                  PORTFOLIO
                </button>

                {/* NEWS */}
                <button
                  onClick={() => handleNavClick('news')}
                  className="block w-full font-pixel text-3xl tracking-[0.15em] text-white hover:opacity-70 transition-opacity text-center"
                >
                  NEWS
                </button>

                {/* ARTICLES */}
                <button
                  onClick={() => handleNavClick('scenic-insights')}
                  className="block w-full font-pixel text-3xl tracking-[0.15em] text-white hover:opacity-70 transition-opacity text-center"
                >
                  ARTICLES
                </button>

                {/* STUDIO */}
                <button
                  onClick={() => handleNavClick('studio')}
                  className="block w-full font-pixel text-3xl tracking-[0.15em] text-white hover:opacity-70 transition-opacity text-center"
                >
                  STUDIO
                </button>

                {/* ABOUT */}
                <div>
                  <button
                    onClick={() => toggleSection('about')}
                    className="flex items-center justify-center gap-2 w-full font-pixel text-3xl tracking-[0.15em] text-white hover:opacity-70 transition-opacity"
                  >
                    ABOUT
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'about' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSection === 'about' && (
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => handleNavClick('about')}
                        className="block w-full font-pixel text-xl tracking-[0.12em] text-white/60 hover:text-white transition-colors text-center"
                      >
                        BIO
                      </button>
                      <button
                        onClick={() => handleNavClick('cv')}
                        className="block w-full font-pixel text-xl tracking-[0.12em] text-white/60 hover:text-white transition-colors text-center"
                      >
                        CV
                      </button>
                      <button
                        onClick={() => handleNavClick('collaborators')}
                        className="block w-full font-pixel text-xl tracking-[0.12em] text-white/60 hover:text-white transition-colors text-center"
                      >
                        COLLABORATORS
                      </button>
                      <button
                        onClick={() => handleNavClick('teaching-philosophy')}
                        className="block w-full font-pixel text-xl tracking-[0.12em] text-white/60 hover:text-white transition-colors text-center"
                      >
                        TEACHING PHILOSOPHY
                      </button>
                    </div>
                  )}
                </div>

                {/* CONTACT */}
                <button
                  onClick={() => handleNavClick('contact')}
                  className="block w-full font-pixel text-3xl tracking-[0.15em] text-white hover:opacity-70 transition-opacity text-center"
                >
                  CONTACT
                </button>
              </nav>
            </div>

            {/* Footer Links */}
            <div className="border-t border-white/10 px-4 py-5">
              <div className="flex flex-wrap items-center justify-center gap-3 font-pixel text-[10px] tracking-[0.15em] text-white/40 uppercase">
                <button
                  onClick={() => handleNavClick('sitemap')}
                  className="hover:text-white/70 transition-colors"
                >
                  SITEMAP
                </button>
                <span>•</span>
                <button
                  onClick={() => handleNavClick('faq')}
                  className="hover:text-white/70 transition-colors"
                >
                  FAQ
                </button>
                <span>•</span>
                <button
                  onClick={() => handleNavClick('accessibility')}
                  className="hover:text-white/70 transition-colors"
                >
                  ACCESSIBILITY
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2 font-pixel text-[10px] tracking-[0.15em] text-white/40 uppercase">
                <button
                  onClick={() => handleNavClick('privacy-policy')}
                  className="hover:text-white/70 transition-colors"
                >
                  PRIVACY
                </button>
                <span>•</span>
                <button
                  onClick={() => handleNavClick('terms-of-use')}
                  className="hover:text-white/70 transition-colors"
                >
                  TERMS
                </button>
              </div>
              <div className="text-center mt-4 font-pixel text-[9px] text-white/30 tracking-[0.15em]">
                © {new Date().getFullYear()} BRANDON PT DAVIS
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
