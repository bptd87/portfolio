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
  DollarSign,
  X
} from 'lucide-react';

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
    items: ['directory', 'vault']
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
  return (
    <div 
      id="admin-sidebar"
      className="h-full flex flex-col"
      style={{
        backgroundColor: '#18181b', // zinc-900 - completely solid
        borderRight: '1px solid #27272a', // zinc-800
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-zinc-800 flex items-center justify-between" style={{ backgroundColor: '#18181b' }}>
        <div>
          <h1 className="text-base font-bold text-white" style={{ fontSize: '1rem' }}>Brandon Davis</h1>
          <p className="text-xs text-zinc-400" style={{ fontSize: '0.75rem' }}>Admin Panel</p>
        </div>
        {mobileOpen && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6" style={{ backgroundColor: '#18181b' }}>
        {navCategories.map(cat => (
          <div key={cat.id}>
            <h2 className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 mb-3 px-2">
              {cat.label}
            </h2>
            <ul className="space-y-1">
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
                        }
                      }}
                      disabled={!item.enabled}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200
                        ${isActive
                          ? 'bg-white text-black font-semibold shadow-lg'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-800 active:bg-zinc-700'
                        }
                        ${!item.enabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                      <span className="flex-1 text-left text-sm">{item.title}</span>
                      {item.comingSoon && (
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
                          Soon
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-zinc-800" style={{ backgroundColor: '#18181b' }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            BD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Brandon Davis</p>
            <p className="text-xs text-zinc-400 truncate">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
