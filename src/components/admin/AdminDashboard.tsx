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
  Image as ImageIcon,
  Globe,
  Building,
  DollarSign
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { AdminTokens } from '../../styles/admin-tokens';

type ManagerType = 'articles' | 'portfolio' | 'news' | 'links' | 'tutorials' | 'collaborators' | 'categories' | 'settings' | 'about' | 'resume' | 'contact' | 'analytics' | 'redirects' | 'media' | 'directory' | 'crm' | 'finance';

interface DashboardCard {
  id: ManagerType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'content' | 'organization' | 'site' | 'analytics' | 'business';
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
    // BUSINESS
    {
      id: 'crm',
      title: 'Theatre CRM',
      icon: Building,
      description: 'Manage companies & contacts',
      category: 'business',
      enabled: true,
    },
    {
      id: 'finance',
      title: 'Finance & Hours',
      icon: DollarSign,
      description: 'Track hours and invoices',
      category: 'business',
      enabled: true,
      comingSoon: true,
    },
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
    business: 'BUSINESS SUITE',
  };

  const categories: Array<'content' | 'organization' | 'site' | 'analytics' | 'business'> = [
    'business',
    'content',
    'organization',
    'site',
    'analytics',
  ];

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Cards Grid by Category */}
      <div className="space-y-12">
        {categories.map((category) => {
          const categoryCards = cards.filter((card) => card.category === category);

          return (
            <div key={category}>
              <h2 className={`text-xs tracking-wider uppercase ${AdminTokens.text.tertiary} mb-6 font-mono pl-1`}>
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
                        group relative p-6 rounded-xl border text-left transition-all duration-300
                        ${isDisabled
                          ? `${AdminTokens.bg.disabled} ${AdminTokens.border.disabled} cursor-not-allowed opacity-50`
                          : `${AdminTokens.bg.secondary} ${AdminTokens.border.primary} hover:border-zinc-600 hover:bg-zinc-800/80`
                        }
                      `}
                    >
                      {/* Coming Soon Badge */}
                      {card.comingSoon && (
                        <div className="absolute top-4 right-4 px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-md">
                          <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-medium">
                            Soon
                          </span>
                        </div>
                      )}

                      {/* Icon */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`
                            p-2.5 rounded-lg transition-colors
                            ${isDisabled
                              ? 'bg-zinc-800/50 border border-zinc-800 text-zinc-600'
                              : 'bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 text-zinc-300 group-hover:text-white'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Stat Badge or Arrow */}
                        {!isDisabled && (
                          <div className="flex items-center gap-2">
                            {stat !== null && !loading && (
                              <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md">
                                <span className="text-xs text-zinc-300 font-mono">
                                  {stat}
                                </span>
                              </div>
                            )}
                            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                          </div>
                        )}
                      </div>

                      {/* Text */}
                      <div>
                        <h3
                          className={`text-base font-medium mb-1 ${isDisabled ? 'text-zinc-600' : 'text-zinc-200 group-hover:text-white'
                            }`}
                        >
                          {card.title}
                        </h3>
                        <p
                          className={`text-sm ${isDisabled ? 'text-zinc-700' : 'text-zinc-500 group-hover:text-zinc-400'
                            }`}
                        >
                          {card.description}
                        </p>
                      </div>
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