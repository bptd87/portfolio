import React from 'react';
import { Search } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground dark:bg-black text-background dark:text-white relative overflow-hidden">
      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-5 dark:opacity-10"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Main Content */}
      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        {/* Top Section - Logo/Name + Nav Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Left - Branding */}
          <div className="md:col-span-4">
            <h2 className="font-display text-3xl md:text-4xl italic mb-4">
              Brandon PT Davis
            </h2>
            <p className="font-sans text-sm opacity-60 max-w-xs mb-6">
              Scenic designer & educator crafting immersive theatrical experiences through art, technology, and design.
            </p>
            
            {/* Search Bar */}
            <button
              onClick={() => onNavigate('search')}
              className="group flex items-center gap-3 w-full max-w-xs mb-6 px-4 py-3 rounded-full border border-current/20 hover:border-current/40 bg-current/5 hover:bg-current/10 transition-all"
            >
              <Search className="w-4 h-4 opacity-40 group-hover:opacity-60 transition-opacity" />
              <span className="font-sans text-sm opacity-40 group-hover:opacity-60 transition-opacity">Search the site...</span>
            </button>
            
            {/* Social Links */}
            <div className="flex items-center gap-6">
              <a
                href="https://www.linkedin.com/in/brandonptdavis"
                target="_blank"
                rel="noopener noreferrer"
                className="font-pixel text-xs tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
              >
                LINKEDIN
              </a>
              <a
                href="https://www.instagram.com/brandonptdavis"
                target="_blank"
                rel="noopener noreferrer"
                className="font-pixel text-xs tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
              >
                INSTAGRAM
              </a>
              <a
                href="mailto:info@brandonptdavis.com"
                className="font-pixel text-xs tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
              >
                EMAIL
              </a>
            </div>
          </div>

          {/* Right - Navigation Grid */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Work Column */}
            <div>
              <div className="font-pixel text-xs tracking-[0.3em] opacity-40 mb-4">WORK</div>
              <div className="space-y-3">
                <button onClick={() => onNavigate('portfolio')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Portfolio</button>
                <button onClick={() => onNavigate('portfolio?filter=scenic')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Scenic Design</button>
                <button onClick={() => onNavigate('portfolio?filter=experiential')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Experiential</button>
                <button onClick={() => onNavigate('portfolio?filter=rendering')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Rendering</button>
              </div>
            </div>

            {/* Resources Column */}
            <div>
              <div className="font-pixel text-xs tracking-[0.3em] opacity-40 mb-4">RESOURCES</div>
              <div className="space-y-3">
                <button onClick={() => onNavigate('app-studio')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Studio Tools</button>
                <button onClick={() => onNavigate('scenic-insights')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Articles</button>
                <button onClick={() => onNavigate('scenic-vault')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Asset Vault</button>
                <button onClick={() => onNavigate('news')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">News</button>
              </div>
            </div>

            {/* About Column */}
            <div>
              <div className="font-pixel text-xs tracking-[0.3em] opacity-40 mb-4">ABOUT</div>
              <div className="space-y-3">
                <button onClick={() => onNavigate('about')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">About Me</button>
                <button onClick={() => onNavigate('collaborators')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Collaborators</button>
                <button onClick={() => onNavigate('cv')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">CV / Resume</button>
                <button onClick={() => onNavigate('contact')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Contact</button>
              </div>
            </div>

            {/* Legal Column */}
            <div>
              <div className="font-pixel text-xs tracking-[0.3em] opacity-40 mb-4">LEGAL</div>
              <div className="space-y-3">
                <button onClick={() => onNavigate('faq')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">FAQ</button>
                <button onClick={() => onNavigate('privacy-policy')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Privacy Policy</button>
                <button onClick={() => onNavigate('terms-of-use')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Terms of Use</button>
                <button onClick={() => onNavigate('accessibility')} className="block font-sans text-sm opacity-80 hover:opacity-100 transition-opacity">Accessibility</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-current/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-pixel text-xs tracking-[0.2em] opacity-40">
            © {currentYear} BRANDON PT DAVIS. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('sitemap')} className="font-pixel text-xs tracking-[0.2em] opacity-40 hover:opacity-60 transition-opacity">SITEMAP</button>
            <button onClick={() => onNavigate('admin')} className="font-pixel text-xs tracking-[0.2em] opacity-40 hover:opacity-60 transition-opacity">ADMIN</button>
          </div>
        </div>
      </div>
    </footer>
  );
}