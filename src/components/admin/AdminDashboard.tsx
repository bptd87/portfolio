/**
 * ADMIN DASHBOARD
 * 
 * Card-based navigation for the admin panel content managers.
 * Organized by function with live statistics.
 */

import React, { useState, useEffect } from 'react';
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
  ArrowUpRight,
  Sparkles,
  Image as ImageIcon,
  Globe
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { AdminTokens } from '../../styles/admin-tokens';

type ManagerType = 'articles' | 'portfolio' | 'news' | 'links' | 'tutorials' | 'collaborators' | 'categories' | 'settings' | 'about' | 'resume' | 'contact' | 'analytics' | 'redirects' | 'media' | 'directory';

interface DashboardCard {
  id: ManagerType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'content' | 'organization' | 'site' | 'analytics';
  enabled: boolean;
  comingSoon?: boolean;
}

interface AdminDashboardProps {
  onSelectManager: (manager: ManagerType) => void;
}

export function AdminDashboard({ onSelectManager }: AdminDashboardProps) {
  // Dashboard initialized
  const [stats, setStats] = useState({
    articles: 0,
    portfolio: 0,
    news: 0,
    links: 0,
    tutorials: 0,
    collaborators: 0,
    categories: 0,
    contactForms: 0,
    directory: 0,
  });

  const [loading, setLoading] = useState(true);

  // Fetch stats for each content type
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/stats`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        // Error loading stats
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards: DashboardCard[] = [
    // CONTENT
    {
      id: 'portfolio',
      title: 'Portfolio',
      icon: Briefcase,
      description: 'Manage scenic design projects',
      category: 'content',
      enabled: true,
    },
    {
      id: 'articles',
      title: 'Articles',
      icon: FileText,
      description: 'Manage blog articles',
      category: 'content',
      enabled: true,
    },
    {
      id: 'news',
      title: 'News',
      icon: Newspaper,
      description: 'Updates and announcements',
      category: 'content',
      enabled: true,
    },
    {
      id: 'tutorials',
      title: 'Tutorials',
      icon: Play,
      description: 'Scenic Studio walkthroughs',
      category: 'content',
      enabled: true,
    },

    // ORGANIZATION
    {
      id: 'categories',
      title: 'Categories',
      icon: Tag,
      description: 'Organize content by topic',
      category: 'organization',
      enabled: true,
    },
    {
      id: 'collaborators',
      title: 'Collaborators',
      icon: Users,
      description: 'Directors, designers, venues',
      category: 'organization',
      enabled: true,
    },
    {
      id: 'links',
      title: 'Social Links',
      icon: Link,
      description: 'External resources',
      category: 'organization',
      enabled: true,
    },
    {
      id: 'directory',
      title: 'Scenic Directory',
      icon: Globe,
      description: 'Industry resources & links',
      category: 'organization',
      enabled: true,
    },
    {
      id: 'media',
      title: 'Media Manager',
      icon: ImageIcon,
      description: 'Manage images and assets',
      category: 'organization',
      enabled: true,
    },

    // SITE MANAGEMENT
    {
      id: 'settings',
      title: 'Site Settings',
      icon: Settings,
      description: 'Homepage, bio, contact info',
      category: 'site',
      enabled: true,
      comingSoon: false,
    },
    {
      id: 'redirects',
      title: 'Redirects',
      icon: ArrowUpRight,
      description: 'Manage URL redirects',
      category: 'site',
      enabled: true,
    },
    {
      id: 'about',
      title: 'About Page',
      icon: FileUser,
      description: 'Manage bio and headshot',
      category: 'site',
      enabled: true,
      comingSoon: false,
    },
    {
      id: 'resume',
      title: 'Resume/CV',
      icon: FileText,
      description: 'Upload and manage CV',
      category: 'site',
      enabled: true,
      comingSoon: false,
    },
    {
      id: 'contact',
      title: 'Contact Forms',
      icon: Mail,
      description: 'View form submissions',
      category: 'site',
      enabled: false,
      comingSoon: true,
    },

    // ANALYTICS
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      description: 'Site traffic and insights',
      category: 'analytics',
      enabled: true,
    },
  ];

  const getCardStat = (cardId: ManagerType): number | null => {
    switch (cardId) {
      case 'articles':
        return stats.articles;
      case 'portfolio':
        return stats.portfolio;
      case 'news':
        return stats.news;
      case 'links':
        return stats.links;
      case 'tutorials':
        return stats.tutorials;
      case 'collaborators':
        return stats.collaborators;
      case 'categories':
        return stats.categories;
      case 'directory':
        return stats.directory;
      case 'contact':
        return stats.contactForms > 0 ? stats.contactForms : null;
      default:
        return null;
    }
  };

  const categoryLabels = {
    content: 'CONTENT',
    organization: 'ORGANIZATION',
    site: 'SITE MANAGEMENT',
    analytics: 'ANALYTICS & TOOLS',
  };

  const categories: Array<'content' | 'organization' | 'site' | 'analytics'> = [
    'content',
    'organization',
    'site',
    'analytics',
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 ${AdminTokens.bg.accent} ${AdminTokens.border.accent} rounded-2xl`}>
            <Sparkles className={`w-6 h-6 ${AdminTokens.text.accent}`} />
          </div>
          <div>
            <h1 className={`text-3xl tracking-tight ${AdminTokens.text.primary}`}>Dashboard</h1>
            <p className={`text-sm ${AdminTokens.text.secondary}`}>Manage your scenic design portfolio</p>
          </div>
        </div>
      </div>

      {/* Cards Grid by Category */}
      <div className="space-y-12">
        {categories.map((category) => {
          const categoryCards = cards.filter((card) => card.category === category);
          
          return (
            <div key={category}>
              <h2 className={`text-xs tracking-wider uppercase ${AdminTokens.text.tertiary} mb-6 font-mono`}>
                {categoryLabels[category]}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryCards.map((card) => {
                  const Icon = card.icon;
                  const stat = getCardStat(card.id);
                  const isDisabled = !card.enabled;

                  return (
                    <button
                      key={card.id}
                      onClick={() => !isDisabled && onSelectManager(card.id)}
                      disabled={isDisabled}
                      className={`
                        group relative p-6 rounded-3xl border text-left transition-all
                        ${
                          isDisabled
                            ? `${AdminTokens.bg.disabled} ${AdminTokens.border.disabled} cursor-not-allowed opacity-50`
                            : `${AdminTokens.bg.secondary} ${AdminTokens.border.primary} hover:${AdminTokens.border.accentHover} ${AdminTokens.bg.hover} backdrop-blur`
                        }
                      `}
                    >
                      {/* Coming Soon Badge */}
                      {card.comingSoon && (
                        <div className={`absolute top-4 right-4 px-2 py-1 ${AdminTokens.bg.accent} ${AdminTokens.border.accent} rounded-xl`}>
                          <span className={`text-[10px] tracking-wider uppercase ${AdminTokens.text.accent} font-mono`}>
                            Coming Soon
                          </span>
                        </div>
                      )}

                      {/* Icon */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`
                            p-3 rounded-2xl transition-colors
                            ${
                              isDisabled
                                ? 'bg-gray-800/50 border border-gray-700'
                                : 'bg-blue-500/10 border border-blue-500/30 group-hover:bg-blue-500/20'
                            }
                          `}
                        >
                          <Icon
                            className={`w-6 h-6 ${
                              isDisabled ? 'text-gray-600' : 'text-blue-400'
                            }`}
                          />
                        </div>

                        {/* Stat Badge or Arrow */}
                        {!isDisabled && (
                          <div className="flex items-center gap-2">
                            {stat !== null && !loading && (
                              <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                <span className="text-sm text-blue-400 font-mono">
                                  {stat}
                                </span>
                              </div>
                            )}
                            <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                          </div>
                        )}
                      </div>

                      {/* Text */}
                      <div>
                        <h3
                          className={`text-lg mb-1 ${
                            isDisabled ? 'text-gray-600' : 'text-white'
                          }`}
                        >
                          {card.title}
                        </h3>
                        <p
                          className={`text-sm ${
                            isDisabled ? 'text-gray-700' : 'text-gray-400'
                          }`}
                        >
                          {card.description}
                        </p>
                      </div>

                      {/* Hover effect */}
                      {!isDisabled && (
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}