import React from 'react';
import { Sidebar } from './Sidebar';
import { LogOut, ExternalLink } from 'lucide-react';
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
  return (
    <div className={`flex min-h-screen ${AdminTokens.bg.primary} ${AdminTokens.text.primary}`}>
      <Sidebar activeView={activeView} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col">
        <header className={`${AdminTokens.bg.secondary}/50 backdrop-blur sticky top-0 z-10 border-b ${AdminTokens.border.disabled} ${AdminTokens.flexBetween} h-20 px-6 lg:px-10`}>
          <h1 className={`text-xl font-semibold ${AdminTokens.text.primary}`}>{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSiteNavigation('home')}
              className={`flex items-center gap-2 px-4 py-2 border ${AdminTokens.border.primary} ${AdminTokens.border.accentHover} transition-colors ${AdminTokens.radius.md}`}
            >
              <ExternalLink className={`w-4 h-4 ${AdminTokens.text.secondary}`} />
              <span className={`text-xs tracking-wider uppercase ${AdminTokens.text.secondary}`}>View Site</span>
            </button>
            <button
              onClick={onLogout}
              className={`flex items-center gap-2 px-4 py-2 border ${AdminTokens.border.primary} hover:border-red-500 transition-colors ${AdminTokens.radius.md}`}
            >
              <LogOut className={`w-4 h-4 ${AdminTokens.text.secondary}`} />
              <span className={`text-xs tracking-wider uppercase ${AdminTokens.text.secondary}`}>Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
