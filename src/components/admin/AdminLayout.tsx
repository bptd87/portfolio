import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { LogOut, ExternalLink, Menu } from 'lucide-react';
import { AdminTokens } from '../../styles/admin-tokens';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  onSiteNavigation: (page: string) => void;
  onLogout: () => void;
  pageTitle: string;
}

export function AdminLayout({ children, activeView, onNavigate, onSiteNavigation, onLogout, pageTitle }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`flex min-h-screen ${AdminTokens.bg.primary} ${AdminTokens.text.primary}`}>
      <Sidebar
        activeView={activeView}
        onNavigate={onNavigate}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`${AdminTokens.bg.secondary}/80 backdrop-blur-md sticky top-0 z-10 border-b ${AdminTokens.border.primary} ${AdminTokens.flexBetween} h-16 lg:h-20 px-4 lg:px-8`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg lg:text-xl font-semibold text-white tracking-tight">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={() => onSiteNavigation('home')}
              className={`flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 border ${AdminTokens.border.primary} hover:bg-zinc-800 transition-colors rounded-lg group`}
            >
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              <span className="hidden lg:inline text-xs font-medium uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200">View Site</span>
            </button>
            <button
              onClick={onLogout}
              className={`flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 border ${AdminTokens.border.primary} hover:border-red-500/50 hover:bg-red-500/10 transition-colors rounded-lg group`}
            >
              <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
              <span className="hidden lg:inline text-xs font-medium uppercase tracking-wider text-zinc-400 group-hover:text-red-300">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
