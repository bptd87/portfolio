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

  FileUser,
  BarChart3,
  ArrowUpRight,
  Globe,
  Box,
  Building,
  DollarSign,
  MessageCircle,
  FileCode,
  Zap,
  Monitor,
  Clapperboard,
  Cuboid
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

type ManagerType = 'articles' | 'scenic' | 'experiential' | 'rendering' | 'models' | 'vault' | 'news' | 'links' | 'tutorials' | 'collaborators' | 'categories' | 'settings' | 'about' | 'resume' | 'analytics' | 'redirects' | 'media' | 'directory' | 'comments';

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
    scenic: 0,
    experiential: 0,
    rendering: 0,
    models: 0,
    vectorworks: 0,
    articles: 0,
    news: 0,
    links: 0,
    tutorials: 0,
    collaborators: 0,
    categories: 0,

    directory: 0,
    vault: 0,
    comments: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminToken = sessionStorage.getItem('admin_token');
        if (!adminToken) {
          // Basic check
        }

        // Fetch counts directly from Supabase
        const [
          scenic,
          experiential,
          rendering,
          models,
          vectorworks,
          articles,
          news,
          tutorials,
          collaborators,
          directoryCats,
          directoryLinks,
          vaultAssets,
          vaultCats,
          categories,
          bioLinks,
          comments,
        ] = await Promise.all([
          supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }).in('category', ['Scenic Design', 'Opera', 'Theatre', 'Dance']).neq('subcategory', 'Scenic Models'),
          supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }).eq('category', 'Experiential Design'),
          supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }).in('category', ['Rendering', 'Rendering & Visualization', 'Visualization']),
          supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }).eq('subcategory', 'Scenic Models'),
          supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }).eq('subcategory', 'Vectorworks'),

          supabase.from('articles').select('*', { count: 'exact', head: true }),
          supabase.from('news').select('*', { count: 'exact', head: true }),
          supabase.from('tutorials').select('*', { count: 'exact', head: true }),
          supabase.from('collaborators').select('*', { count: 'exact', head: true }),
          supabase.from('directory_categories').select('*', { count: 'exact', head: true }),
          supabase.from('directory_links').select('*', { count: 'exact', head: true }),
          supabase.from('vault_assets').select('*', { count: 'exact', head: true }),
          supabase.from('vault_categories').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('bio_links').select('*', { count: 'exact', head: true }),
          supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        setStats({
          scenic: scenic.count || 0,
          experiential: experiential.count || 0,
          rendering: rendering.count || 0,
          models: models.count || 0,
          vectorworks: vectorworks.count || 0,
          articles: articles.count || 0,
          news: news.count || 0,
          tutorials: tutorials.count || 0,
          collaborators: collaborators.count || 0,
          directory: (directoryCats.count || 0) + (directoryLinks.count || 0),
          vault: (vaultAssets.count || 0) + (vaultCats.count || 0),
          links: bioLinks.count || 0,
          categories: categories.count || 0,

          comments: comments ? comments.count || 0 : 0,
        });

      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);



  const cards: DashboardCard[] = [

    {
      id: 'scenic',
      title: 'Scenic Design',
      icon: Clapperboard,
      description: 'Manage scenic productions',
      category: 'content',
      enabled: true,
    },
    {
      id: 'experiential',
      title: 'Experiential',
      icon: Zap,
      description: 'Manage experiential projects',
      category: 'content',
      enabled: true,
    },
    {
      id: 'rendering',
      title: 'Rendering',
      icon: Monitor,
      description: 'Manage 3D visualizations',
      category: 'content',
      enabled: true,
    },
    {
      id: 'models',
      title: 'Scenic Models',
      icon: Cuboid,
      description: 'Manage physical scale models',
      category: 'content',
      enabled: true,
    },
    {
      id: 'vault',
      title: 'Scenic Vault',
      icon: Box,
      description: 'Manage 3D assets & symbols',
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
      id: 'comments',
      title: 'Comments',
      icon: MessageCircle,
      description: 'Moderate discussions',
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
      case 'scenic':
        return stats.scenic;
      case 'experiential':
        return stats.experiential;
      case 'rendering':
        return stats.rendering;
      case 'models':
        return stats.models;
      case 'vault':
        return stats.vault;
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

      case 'comments':
        return stats.comments > 0 ? stats.comments : null;
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
