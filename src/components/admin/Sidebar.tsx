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
  Box
} from 'lucide-react';
import { AdminTokens } from '../../styles/admin-tokens';

type ManagerType = 'dashboard' | 'articles' | 'portfolio' | 'news' | 'links' | 'directory' | 'vault' | 'tutorials' | 'collaborators' | 'categories' | 'settings' | 'about' | 'resume' | 'contact' | 'analytics' | 'api-status' | 'redirects' | 'media';

interface NavItem {
  id: ManagerType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'content' | 'organization' | 'site' | 'analytics' | 'dashboard';
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

const categoryLabels = {
  dashboard: 'MAIN',
  content: 'CONTENT',
  organization: 'ORGANIZATION',
  site: 'SITE MANAGEMENT',
  analytics: 'ANALYTICS & TOOLS',
};

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className={`w-64 ${AdminTokens.bg.secondary} border-r ${AdminTokens.border.disabled} p-6 flex flex-col`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${AdminTokens.text.primary}`}>Admin Panel</h1>
      </div>
      <nav className="flex-1">
        {Object.keys(categoryLabels).map(category => (
          <div key={category} className="mb-6">
            <h2 className={`text-xs font-bold uppercase ${AdminTokens.text.tertiary} mb-2`}>{categoryLabels[category as keyof typeof categoryLabels]}</h2>
            <ul>
              {navItems
                .filter(item => item.category === category)
                .map(item => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  const isDisabled = !item.enabled;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => !isDisabled && onNavigate(item.id)}
                        disabled={isDisabled}
                        className={`w-full flex items-center px-4 py-2 ${AdminTokens.radius.sm} transition-colors
                          ${isActive ? `${AdminTokens.bg.accent} ${AdminTokens.text.accent}` : `${AdminTokens.text.secondary} ${AdminTokens.bg.hover} hover:text-white`}
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="text-sm">{item.title}</span>
                        {item.comingSoon && (
                          <span className={`text-xs ${AdminTokens.text.tertiary} ml-auto`}>Soon</span>
                        )}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
