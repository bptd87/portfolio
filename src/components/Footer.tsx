import React, { useState, useEffect } from 'react';
import { useSocialLinks } from '../hooks/useSocialLinks';
import { Linkedin, Instagram, Youtube, Mail, ArrowUpRight, Link, Twitter, Facebook, Github } from 'lucide-react';
import InteractiveGrid from './InteractiveGrid';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [time, setTime] = useState('');
  const { socialLinks, loading: socialLoading } = useSocialLinks();

  // Live clock for that "System Status" feel
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Los_Angeles',
        timeZoneName: 'short'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-background dark:bg-foreground text-foreground dark:text-background relative overflow-hidden pt-20 pb-8">

      {/* <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.02] pointer-events-none" /> */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <InteractiveGrid />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* LEFT: Identity & Status */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-8">
            <div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-black dark:text-white uppercase italic leading-none">Brandon PT Davis</h2>
            </div>

            <div className="space-y-4">
              {/* Live Status Badge */}
              {/* Live Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-sm shadow-sm bg-white/50 dark:bg-black/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <div className="flex flex-col leading-none gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">California, USA</span>
                  <span className="text-[10px] font-mono opacity-50">{time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Navigation & Socials */}
          <div className="lg:col-span-8 flex flex-col lg:flex-row justify-between gap-12 lg:gap-24">

            {/* Links Grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Group 1 */}
              <div className="space-y-6">
                <h3 className="font-mono text-xs text-blue-600 dark:text-blue-400 uppercase tracking-widest">Selected Work</h3>
                <ul className="space-y-3 font-sans text-sm">
                  <li><button onClick={() => onNavigate('portfolio')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100 flex items-center gap-1 group">All Projects <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></button></li>
                  <li><button onClick={() => onNavigate('experiential-design')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100">Experiential</button></li>
                  <li><button onClick={() => onNavigate('rendering')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100">Rendering</button></li>
                  <li><button onClick={() => onNavigate('scenic-models')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100">Scenic Models</button></li>
                </ul>
              </div>

              {/* Group 2 */}
              <div className="space-y-6">
                <h3 className="font-mono text-xs text-white uppercase tracking-widest">Studio</h3>
                <ul className="space-y-3 font-sans text-sm">
                  <li><button onClick={() => onNavigate('scenic-insights')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100">Articles</button></li>
                  <li><button onClick={() => onNavigate('scenic-vault')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100">The Vault</button></li>
                  <li><button onClick={() => onNavigate('directory')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100">Directory</button></li>
                  <li><button onClick={() => onNavigate('app-studio')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100">App Studio</button></li>
                </ul>
              </div>

              {/* Group 3 */}
              <div className="space-y-6">
                <h3 className="font-mono text-xs text-orange-600 dark:text-orange-400 uppercase tracking-widest">Connect</h3>
                <ul className="space-y-3 font-sans text-sm">
                  <li><button onClick={() => onNavigate('contact')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100 font-bold">Start a Project</button></li>
                  <li><button onClick={() => onNavigate('about')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100">About</button></li>
                  <li><button onClick={() => onNavigate('cv')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100">CV / Resume</button></li>
                  <li><button onClick={() => onNavigate('creative-statement')} className="hover:translate-x-1 transition-transform opacity-70 hover:opacity-100">Philosophy</button></li>
                </ul>
              </div>
            </div>

            {/* Social Icons - Vertical on Desktop */}
            <div className="flex lg:flex-col gap-4 items-start lg:pl-12">
              {socialLinks.map((link) => {
                const iconMap: Record<string, any> = { Linkedin, Instagram, Youtube, Twitter, Facebook, Github, Link };
                // Default to Link icon if specific one not found
                const Icon = iconMap[link.icon] || Link;
                let colorClass = '';
                if (link.platform === 'LinkedIn') colorClass = 'text-[#0077b5]';
                if (link.platform === 'Instagram') colorClass = 'text-[#E4405F]';
                if (link.platform === 'YouTube') colorClass = 'text-[#FF0000]';

                return (
                  <a
                    key={link.platform || link.label} // Use label as fallback key
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-2 bg-black/5 dark:bg-white/5 rounded-xl transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/10 hover:scale-110 shadow-sm bg-white/50 dark:bg-black/50"
                    aria-label={link.label}
                  >
                    {/* Force color class to ensure it is applied */}
                    {Icon && <Icon className={`w-5 h-5 transition-all duration-300 ${colorClass} opacity-100`} style={{ color: link.platform === 'LinkedIn' ? '#0077b5' : link.platform === 'Instagram' ? '#E4405F' : link.platform === 'YouTube' ? '#FF0000' : undefined }} />}
                  </a>
                );
              })}
              <a
                href="mailto:info@brandonptdavis.com"
                className="group p-2 bg-black/5 dark:bg-white/5 rounded-xl transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/10 hover:scale-110 shadow-sm bg-white/50 dark:bg-black/50"
                aria-label="Email Me"
              >
                <Mail className="w-5 h-5 transition-all duration-300 text-amber-500" />
              </a>
            </div>

          </div>
        </div>

        {/* BOTTOM METADATA */}
        <div className="mt-16 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-[10px] uppercase opacity-40">
            © {currentYear} Brandon PT Davis. All Rights Reserved.
          </div>
          <div className="flex gap-8 font-mono text-[10px] uppercase opacity-40">
            <button onClick={() => onNavigate('privacy-policy')} className="hover:opacity-100 hover:text-red-500 transition-colors">Privacy</button>
            <button onClick={() => onNavigate('terms-of-use')} className="hover:opacity-100 hover:text-red-500 transition-colors">Terms</button>
            <button onClick={() => onNavigate('accessibility')} className="hover:opacity-100 hover:text-red-500 transition-colors">Accessibility</button>
            <button onClick={() => onNavigate('sitemap')} className="hover:opacity-100 hover:text-red-500 transition-colors">Sitemap</button>
            <button onClick={() => onNavigate('admin')} className="hover:opacity-100 hover:text-red-500 transition-colors">Admin</button>
          </div>
        </div>
      </div>
    </footer>
  );
}