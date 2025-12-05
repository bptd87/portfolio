import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { SEO } from '../components/SEO';
import { PAGE_METADATA } from '../utils/seo/metadata';
import { blogPosts } from '../data/blog-posts';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ArrowRight } from '../components/shared/Icons';

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

  const mainPages = [
    { title: 'Home', page: 'home' },
    { title: 'Portfolio', page: 'portfolio' },
    { title: 'About', page: 'about' },
    { title: 'CV', page: 'cv' },
    { title: 'News', page: 'news' },
    { title: 'Contact', page: 'contact' },
  ];

  const resourcePages = [
    { title: 'Resources', page: 'resources' },
    { title: 'Articles', page: 'scenic-insights' },
  ];

  const studioPages = [
    { title: 'Scenic Studio', page: 'studio' },
    { title: 'Video Tutorials', page: 'scenic-studio' },
    { title: 'Scenic Vault', page: 'scenic-vault' },
    { title: 'App Studio', page: 'app-studio' },
  ];

  const toolsPages = [
    { title: '3D Print Scale Calculator', page: 'architecture-scale-converter' },
  ];

  const academiaPages = [
    { title: 'Teaching Philosophy', page: 'teaching-philosophy' },
    { title: 'Collaborators', page: 'collaborators' },
  ];

  const utilityPages = [
    { title: 'Search', page: 'search' },
    { title: 'Links', page: 'links' },
    { title: 'Admin', page: 'admin' },
  ];

  const legalPages = [
    { title: 'FAQ', page: 'faq' },
    { title: 'Privacy Policy', page: 'privacy-policy' },
    { title: 'Accessibility', page: 'accessibility' },
    { title: 'Terms of Use', page: 'terms-of-use' },
    { title: 'Sitemap', page: 'sitemap' },
    { title: '404 Page', page: '404' },
  ];

  return (
    <>
      <SEO metadata={PAGE_METADATA['sitemap']} />
      
      <div className="min-h-screen bg-white dark:bg-black">
        <PageHeader 
          title="Sitemap"
          subtitle="Complete navigation of all pages and content"
          onNavigate={onNavigate}
        />
        
        <div className="max-w-7xl mx-auto px-8 md:px-16 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            
            {/* Main Pages */}
            <div>
              <h3 className="mb-6 pb-3 border-b border-black/10 dark:border-white/10">Main Pages</h3>
              <ul className="space-y-3">
                {mainPages.map((item) => (
                  <li key={item.page}>
                    <button
                      onClick={() => onNavigate(item.page)}
                      className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="mb-6 pb-3 border-b border-black/10 dark:border-white/10">Resources</h3>
              <ul className="space-y-3">
                {resourcePages.map((item) => (
                  <li key={item.page}>
                    <button
                      onClick={() => onNavigate(item.page)}
                      className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Studio */}
            <div>
              <h3 className="mb-6 pb-3 border-b border-black/10 dark:border-white/10">Studio</h3>
              <ul className="space-y-3">
                {studioPages.map((item) => (
                  <li key={item.page}>
                    <button
                      onClick={() => onNavigate(item.page)}
                      className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h3 className="mb-6 pb-3 border-b border-black/10 dark:border-white/10">Tools & References</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => onNavigate('architecture-scale-converter')}
                    className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                  >
                    3D Print Scale Calculator
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('model-reference-scaler')}
                    className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                  >
                    Model Reference Scaler
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('dimension-reference')}
                    className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                  >
                    Dimension Reference
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('commercial-paint-finder')}
                    className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                  >
                    Commercial Paint Finder
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('design-history-timeline')}
                    className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                  >
                    Design History Timeline
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('classical-architecture-guide')}
                    className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                  >
                    Classical Architecture Guide
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('blog-formatter')}
                    className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                  >
                    Blog Content Formatter
                  </button>
                </li>
              </ul>
            </div>

            {/* Academia */}
            <div>
              <h3 className="mb-6 pb-3 border-b border-black/10 dark:border-white/10">Academia</h3>
              <ul className="space-y-3">
                {academiaPages.map((item) => (
                  <li key={item.page}>
                    <button
                      onClick={() => onNavigate(item.page)}
                      className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Projects */}
            <div>
              <h3 className="mb-6 pb-3 border-b border-black/10 dark:border-white/10">Projects ({projects.length})</h3>
              <ul className="space-y-3">
                {projects.slice(0, 10).map((project) => (
                  <li key={project.id}>
                    <button
                      onClick={() => onNavigate('project', project.slug)}
                      className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                    >
                      {project.title}
                    </button>
                  </li>
                ))}
                {projects.length > 10 && (
                  <li className="text-xs text-black/40 dark:text-white/40">
                    + {projects.length - 10} more projects
                  </li>
                )}
              </ul>
            </div>

            {/* Articles */}
            <div>
              <h3 className="mb-6 pb-3 border-b border-black/10 dark:border-white/10">Articles ({blogPosts.length})</h3>
              <ul className="space-y-3">
                {blogPosts.slice(0, 10).map((post) => (
                  <li key={post.id}>
                    <button
                      onClick={() => onNavigate('blog', post.slug)}
                      className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                    >
                      {post.title}
                    </button>
                  </li>
                ))}
                {blogPosts.length > 10 && (
                  <li className="text-xs text-black/40 dark:text-white/40">
                    + {blogPosts.length - 10} more articles
                  </li>
                )}
              </ul>
            </div>

            {/* Utility */}
            <div>
              <h3 className="mb-6 pb-3 border-b border-black/10 dark:border-white/10">Utility</h3>
              <ul className="space-y-3">
                {utilityPages.map((item) => (
                  <li key={item.page}>
                    <button
                      onClick={() => onNavigate(item.page)}
                      className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="mb-6 pb-3 border-b border-black/10 dark:border-white/10">Legal</h3>
              <ul className="space-y-3">
                {legalPages.map((item) => (
                  <li key={item.page}>
                    <button
                      onClick={() => onNavigate(item.page)}
                      className="text-sm text-black/60 dark:text-white/60 hover:text-accent-brand transition-colors"
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}