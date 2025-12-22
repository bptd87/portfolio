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
  Globe,
  Box,
  Building,
  DollarSign
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminToken = sessionStorage.getItem('admin_token');
        if (!adminToken) {
          console.warn('No admin token found');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/stats`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Admin-Token': adminToken,
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
      icon: Box,
      description: 'Manage images and assets',
      category: 'organization',
      enabled: true,
    },
    {
      id: 'settings',
      title: 'Site Settings',
      icon: Settings,
      description: 'Homepage, bio, contact info',
      category: 'site',
      enabled: true,
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
    },
    {
      id: 'resume',
      title: 'Resume/CV',
      icon: FileText,
      description: 'Upload and manage CV',
      category: 'site',
      enabled: true,
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
    content: 'Content Management',
    organization: 'Organization',
    site: 'Site Management',
    analytics: 'Analytics & Tools',
    business: 'Business Suite',
  };

  const categories: Array<'content' | 'organization' | 'site' | 'analytics' | 'business'> = [
    'business',
    'content',
    'organization',
    'site',
    'analytics',
  ];

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryCards = cards.filter((card) => card.category === category);
        if (categoryCards.length === 0) return null;

        return (
          <section key={category} className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 px-1">
              {categoryLabels[category]}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      group relative p-6 rounded-xl border text-left transition-all duration-200
                      ${isDisabled
                        ? 'bg-zinc-900/50 border-zinc-800 cursor-not-allowed opacity-50'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 active:scale-[0.98]'
                      }
                    `}
                  >
                    {/* Coming Soon Badge */}
                    {card.comingSoon && (
                      <div className="absolute top-4 right-4 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-md">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                          Soon
                        </span>
                      </div>
                    )}

                    {/* Icon and Stat */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`
                        p-3 rounded-lg transition-colors
                        ${isDisabled
                          ? 'bg-zinc-800/50 border border-zinc-800'
                          : 'bg-zinc-800 border border-zinc-700 group-hover:bg-zinc-700 group-hover:border-zinc-600'
                        }
                      `}>
                        <Icon className={`w-6 h-6 ${isDisabled ? 'text-zinc-600' : 'text-zinc-300 group-hover:text-white'}`} />
                      </div>

                      {!isDisabled && (
                        <div className="flex items-center gap-2">
                          {stat !== null && !loading && (
                            <div className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-md">
                              <span className="text-sm font-semibold text-white">
                                {stat}
                              </span>
                            </div>
                          )}
                          <div className="p-1.5 rounded-md bg-zinc-800 group-hover:bg-zinc-700 border border-zinc-700 group-hover:border-zinc-600 transition-colors">
                            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className={`
                        text-lg font-semibold mb-2
                        ${isDisabled ? 'text-zinc-600' : 'text-white group-hover:text-white'}
                      `}>
                        {card.title}
                      </h3>
                      <p className={`
                        text-sm leading-relaxed
                        ${isDisabled ? 'text-zinc-700' : 'text-zinc-400 group-hover:text-zinc-300'}
                      `}>
                        {card.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
