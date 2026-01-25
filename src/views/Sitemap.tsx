import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';
import { blogPosts } from '../data/blog-posts';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ArrowRight, Box, Layout, PenTool, BookOpen, Shield, Search as SearchIcon } from 'lucide-react';

interface SitemapProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function Sitemap({ onNavigate }: SitemapProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from database
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.projects) {
          setProjects(data.projects);
        }
      } catch (err) {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const sections = [
    {
      title: 'Main',
      icon: <Box className="w-4 h-4" />,
      items: [
        { title: 'Home', page: 'home' },
        { title: 'About Brandon', page: 'about' },
        { title: 'Creative Statement', page: 'creative-statement' },
        { title: 'Curriculum Vitae', page: 'cv' },
        { title: 'Contact', page: 'contact' },
      ]
    },
    {
      title: 'Portfolio',
      icon: <Layout className="w-4 h-4" />,
      items: [
        { title: 'All Projects', page: 'portfolio' },
        { title: 'Experiential Design', page: 'experiential-design' },
        { title: 'Rendering & Visualization', page: 'rendering' },
        { title: 'Scenic Models', page: 'scenic-models' },
      ]
    },
    {
      title: 'Studio & Tools',
      icon: <PenTool className="w-4 h-4" />,
      items: [
        { title: 'Scenic Studio', page: 'studio' },
        { title: 'Scenic Vault (Assets)', page: 'scenic-vault' },
        { title: 'App Studio', page: 'app-studio' },
        { title: 'Directory', page: 'directory' },
        { title: '3D Print Scale Calculator', page: 'architecture-scale-converter' },
        { title: 'Model Reference Scaler', page: 'model-reference-scaler' },
        { title: 'Dimension Reference', page: 'dimension-reference' },
        { title: 'Commercial Paint Finder', page: 'commercial-paint-finder' },
        { title: 'Rosco Paint Calculator', page: 'rosco-paint-calculator' },
        { title: 'Design History Timeline', page: 'design-history-timeline' },
        { title: 'Classical Architecture Guide', page: 'classical-architecture-guide' },
      ]
    },
    {
      title: 'Knowledge & News',
      icon: <BookOpen className="w-4 h-4" />,
      items: [
        { title: 'Latest News', page: 'news' },
        { title: 'Articles (Scenic Insights)', page: 'articles' },
        { title: 'Video Tutorials', page: 'scenic-studio' },
        { title: 'Teaching Philosophy', page: 'teaching-philosophy' },
        { title: 'Collaborators', page: 'collaborators' },
        { title: 'Resources', page: 'resources' },
      ]
    },
    {
      title: 'Utility & Legal',
      icon: <Shield className="w-4 h-4" />,
      items: [
        { title: 'Search', page: 'search' },
        { title: 'Links', page: 'links' },
        { title: 'Admin Login', page: 'admin' },
        { title: 'FAQ', page: 'faq' },
        { title: 'Privacy Policy', page: 'privacy-policy' },
        { title: 'Accessibility Statement', page: 'accessibility' },
        { title: 'Terms of Use', page: 'terms-of-use' },
      ]
    }
  ];

  return (
    <>
      <SEO metadata={PAGE_METADATA['sitemap']} />

      <div className="min-h-screen bg-neutral-50 dark:bg-black">
        <PageHeader
          title="Sitemap"
          subtitle="Complete navigation of all pages, tools, and resources."
          onNavigate={onNavigate}
        />

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">

            {sections.map((section, idx) => (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-black/10 dark:border-white/10">
                  <span className="text-accent-brand">{section.icon}</span>
                  <h3 className="font-display text-xl italic text-black dark:text-white">{section.title}</h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.page}>
                      <button
                        onClick={() => onNavigate(item.page)}
                        className="group flex items-center gap-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20 group-hover:bg-accent-brand transition-colors" />
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Dynamic Projects Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-black/10 dark:border-white/10">
                <span className="text-accent-brand"><Layout className="w-4 h-4" /></span>
                <h3 className="font-display text-xl italic text-black dark:text-white">Recent Projects</h3>
              </div>
              <ul className="space-y-3">
                {projects.length > 0 ? (
                  projects.slice(0, 8).map((project) => (
                    <li key={project.id}>
                      <button
                        onClick={() => onNavigate('project', project.slug)}
                        className="group flex items-center gap-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors text-left"
                      >
                        <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20 group-hover:bg-accent-brand transition-colors" />
                        <span className="line-clamp-1">{project.title}</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-black/40 dark:text-white/40 italic">Loading projects...</li>
                )}
                {projects.length > 8 && (
                  <li>
                    <button
                      onClick={() => onNavigate('portfolio')}
                      className="text-xs text-accent-brand hover:underline mt-2 flex items-center gap-1"
                    >
                      View all {projects.length} projects <ArrowRight className="w-3 h-3" />
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Dynamic Articles Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-black/10 dark:border-white/10">
                <span className="text-accent-brand"><BookOpen className="w-4 h-4" /></span>
                <h3 className="font-display text-xl italic text-black dark:text-white">Recent Articles</h3>
              </div>
              <ul className="space-y-3">
                {blogPosts.slice(0, 8).map((post) => (
                  <li key={post.id}>
                    <button
                      onClick={() => onNavigate('blog', post.slug)}
                      className="group flex items-center gap-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors text-left"
                    >
                      <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20 group-hover:bg-accent-brand transition-colors" />
                      <span className="line-clamp-1">{post.title}</span>
                    </button>
                  </li>
                ))}
                {blogPosts.length > 8 && (
                  <li>
                    <button
                      onClick={() => onNavigate('articles')}
                      className="text-xs text-accent-brand hover:underline mt-2 flex items-center gap-1"
                    >
                      View all articles <ArrowRight className="w-3 h-3" />
                    </button>
                  </li>
                )}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}