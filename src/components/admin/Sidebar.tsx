import React from 'react';
import {
  FileText,
  Briefcase,
  Newspaper,
  Link,
  Play,
  Users,
  Tag,
  Settings,
  Mail,
  FileUser,
  BarChart3,
  Home,
  Server,
  ArrowUpRight,
  Globe,
  Box,
  Building,
  DollarSign
} from 'lucide-react';
import { AdminTokens, buildAdminClass } from '../../styles/admin-tokens';

type ManagerType = 'dashboard' | 'articles' | 'portfolio' | 'news' | 'links' | 'directory' | 'vault' | 'tutorials' | 'collaborators' | 'categories' | 'settings' | 'about' | 'resume' | 'contact' | 'analytics' | 'api-status' | 'redirects' | 'media' | 'crm' | 'finance';

interface NavItem {
  id: ManagerType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'content' | 'organization' | 'site' | 'analytics' | 'dashboard' | 'business';
  enabled: boolean;
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: Home,
    category: 'dashboard',
    enabled: true,
  },
  // BUSINESS
  {
    id: 'crm',
    title: 'Theatre CRM',
    icon: Building,
    category: 'business',
    enabled: true,
  },
  {
    id: 'finance',
    title: 'Finance & Hours',
    icon: DollarSign,
    category: 'business',
    enabled: true,
    comingSoon: true,
  },
  // CONTENT
  {
    id: 'portfolio',
    title: 'Portfolio',
    icon: Briefcase,
    category: 'content',
    enabled: true,
  },
  {
    id: 'articles',
    title: 'Articles',
    icon: FileText,
    category: 'content',
    enabled: true,
  },
  {
    id: 'news',
    title: 'News',
    icon: Newspaper,
    category: 'content',
    enabled: true,
  },
  {
    id: 'tutorials',
    title: 'Tutorials',
    icon: Play,
    category: 'content',
    enabled: true,
  },
  // ORGANIZATION
  {
    id: 'categories',
    title: 'Categories',
    icon: Tag,
    category: 'organization',
    enabled: true,
  },
  {
    id: 'collaborators',
    title: 'Collaborators',
    icon: Users,
    category: 'organization',
    enabled: true,
  },
  {
    id: 'links',
    title: 'Social Links',
    icon: Link,
    category: 'organization',
    enabled: true,
  },
  {
    id: 'directory',
    title: 'Scenic Directory',
    icon: Globe,
    category: 'organization',
    enabled: true,
  },
  {
    id: 'vault',
    title: 'Scenic Vault',
    icon: Box,
    category: 'organization',
    enabled: true,
  },
  // SITE MANAGEMENT
  {
    id: 'settings',
    title: 'Site Settings',
    icon: Settings,
    category: 'site',
    enabled: true,
  },
  {
    id: 'redirects',
    title: 'Redirects',
    icon: ArrowUpRight,
    category: 'site',
    enabled: true,
  },
  {
    id: 'about',
    title: 'About Page',
    icon: FileUser,
    category: 'site',
    enabled: true,
  },
  {
    id: 'resume',
    title: 'Resume/CV',
    icon: FileText,
    category: 'site',
    enabled: true,
  },
  {
    id: 'contact',
    title: 'Contact Forms',
    icon: Mail,
    category: 'site',
    enabled: false,
    comingSoon: true,
  },
  // ANALYTICS
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    category: 'analytics',
    enabled: true,
  },
  {
    id: 'api-status',
    title: 'API Status',
    icon: Server,
    category: 'analytics',
    enabled: true,
  },
];

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navCategories = [
  {
    id: 'analytics',
    label: 'Analytics & Activity',
    items: ['dashboard', 'analytics', 'api-status']
  },
  {
    id: 'business',
    label: 'Business Suite',
    items: ['crm', 'finance']
  },
  {
    id: 'content',
    label: 'Content Management',
    items: ['portfolio', 'articles', 'news', 'tutorials']
  },
  {
    id: 'assets',
    label: 'Galleries & Assets',
    items: ['directory', 'vault', 'models', 'archive', 'media']
  },
  {
    id: 'site',
    label: 'Site Structure',
    items: ['categories', 'collaborators', 'links', 'redirects']
  },
  {
    id: 'system',
    label: 'System & Settings',
    items: ['settings', 'about', 'resume']
  }
];

export function Sidebar({ activeView, onNavigate, mobileOpen = false, onClose }: SidebarProps) {
  // Base classes for the sidebar container
  // Changed lg: to xl: for breakpoint (tablets will now use hamburger drawer)
  // Added 'hidden' when closed on mobile to prevent ghost interactions
  const sidebarClasses = buildAdminClass(
    'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out xl:translate-x-0 xl:static xl:inset-0 xl:block',
    AdminTokens.bg.secondary,
    'border-r',
    AdminTokens.border.primary,
    mobileOpen ? 'translate-x-0 shadow-2xl block' : '-translate-x-full hidden xl:block'
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 xl:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`flex flex-col ${sidebarClasses}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h1 className={`text-xl font-bold tracking-tight ${AdminTokens.text.primary}`}>
            Brandon Davis <span className="text-[#71717a] font-normal">Admin</span>
          </h1>
          {/* Close button for mobile */}
          <button onClick={onClose} className="xl:hidden p-1 text-[#a1a1aa] hover:text-white">
            {/* Overlay handles close mostly, but good to have context if needed */}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {navCategories.map(cat => (
            <div key={cat.id} className="mb-8 last:mb-0">
              <h2 className={`text-[10px] font-bold uppercase tracking-wider ${AdminTokens.text.tertiary} mb-3 px-3`}>
                {cat.label}
              </h2>
              <ul className="space-y-0.5">
                {cat.items.map(itemId => {
                  const item = navItems.find(i => i.id === itemId);
                  if (!item) return null;

                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          if (item.enabled) {
                            onNavigate(item.id);
                            if (onClose) onClose();
                          }
                        }}
                        disabled={!item.enabled}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                          ${isActive
                            ? 'bg-white text-black shadow-md shadow-white/5'
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                          }
                          ${!item.enabled ? 'opacity-40 cursor-not-allowed' : ''}
                        `}
                      >
                        <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-black' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                        {item.title}
                        {item.comingSoon && (
                          <span className="ml-auto text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">Soon</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900/50 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-xs font-bold text-white">
              BD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Brandon Davis</p>
              <p className="text-xs text-zinc-500 truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
