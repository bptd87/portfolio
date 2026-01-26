'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Removed Chevron imports as they were unused/for modal
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
// skeleton imports retained
import { SEO } from '../components/SEO';
import { SkeletonPortfolio } from '../components/skeletons/SkeletonPortfolio';
import { PortfolioNavigation } from '../components/shared/PortfolioNavigation';

interface PortfolioProps {
  onNavigate: (page: string, projectSlug?: string) => void;
  initialFilter?: string;
  initialTag?: string;
}

export function Portfolio({ onNavigate, initialFilter, initialTag }: PortfolioProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to scenic-design
  // const [selectedFilter, setSelectedFilter] = useState('scenic-design'); // Removed filter state
  const [selectedTag, setSelectedTag] = useState<string | undefined>(initialTag);
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(initialFilter);

  // Sync props with state when navigation changes
  useEffect(() => {
    setSelectedTag(initialTag);
  }, [initialTag]);

  useEffect(() => {
    setSelectedFilter(initialFilter);
  }, [initialFilter]);

  const normalizeFilterValue = (value?: string) =>
    value
      ? decodeURIComponent(value).toLowerCase().replace(/-/g, ' ').trim()
      : '';

  const buildPortfolioRoute = (filter?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);
    if (tag) params.set('tag', tag);
    const query = params.toString();
    return query ? `portfolio?${query}` : 'portfolio';
  };

  const cacheKey = (slug: string) => `project-cache-${slug}`;

  const cacheProjectData = (projectData: any) => {
    if (!projectData) return;
    const slug = projectData.slug || projectData.id;
    if (!slug) return;
    sessionStorage.setItem(cacheKey(slug), JSON.stringify({ ...projectData, slug }));
  };

  const prefetchProject = (project: any) => {
    const slug = project?.slug || project?.id;
    if (!slug) return;
    if (sessionStorage.getItem(cacheKey(slug))) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${slug}`,
      {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error('prefetch failed');
        return res.json();
      })
      .then((data) => {
        if (data?.success && data.project) {
          cacheProjectData(data.project);
        }
      })
      .catch(() => { })
      .finally(() => clearTimeout(timeout));
  };

  const setTransitionData = (project: any) => {
    if (project?.cardImage) {
      sessionStorage.setItem('transitionImage', project.cardImage);
      sessionStorage.setItem('transitionFocusPoint', JSON.stringify(project.focusPoint || { x: 50, y: 50 }));
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch ONLY Scenic Design projects
        const { data, error } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('published', true)
          // STRICT SCENIC FILTER
          .in('category', ['Scenic Design', 'Opera', 'Theatre', 'Dance'])
          .neq('subcategory', 'Scenic Models') // Exclude models from main portfolio
          .order('year', { ascending: false });

        if (error) throw error;

        if (data) {
          // Process projects
          const mappedProjects = data.map(p => ({
            ...p,
            cardImage: p.card_image,
            coverImage: p.cover_image,
            subcategory: p.subcategory,
            tags: (() => {
              // Priority 1: tags column
              const rawTags = p.tags || [];
              const tagArray = Array.isArray(rawTags)
                ? rawTags
                : typeof rawTags === 'string'
                  ? rawTags.split(',').map((t: string) => t.trim()).filter(Boolean)
                  : [];

              // Priority 2: seo_keywords
              const rawKeywords = p.seo_keywords || [];
              const keywordArray = Array.isArray(rawKeywords)
                ? rawKeywords
                : typeof rawKeywords === 'string'
                  ? rawKeywords.split(',').map((t: string) => t.trim()).filter(Boolean)
                  : [];

              // Merge and deduplicate
              const combined = Array.from(new Set([...tagArray, ...keywordArray]));
              return combined;
            })(),
            focusPoint: p.focus_point || { x: 50, y: 50 }
          })).sort((a: any, b: any) => {
            const yearA = Number(a.year) || 0;
            const yearB = Number(b.year) || 0;
            if (yearA !== yearB) return yearB - yearA;

            const monthA = Number(a.month) || 0;
            const monthB = Number(b.month) || 0;
            return monthB - monthA;
          });

          setProjects(mappedProjects);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filtered projects for Tag Selection Only
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (selectedFilter) {
      const normalizedFilter = normalizeFilterValue(selectedFilter);
      filtered = filtered.filter(p => {
        const normalizedSubcategory = normalizeFilterValue(p.subcategory || '');
        const normalizedCategory = normalizeFilterValue(p.category || '');
        return normalizedSubcategory === normalizedFilter || normalizedCategory === normalizedFilter;
      });
    }

    if (selectedTag) {
      filtered = filtered.filter(p =>
        p.tags && p.tags.some((t: string) => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Always remove Archive just in case
    filtered = filtered.filter(p => p.category !== 'Archive' && p.category !== 'archive');

    return filtered;
  }, [projects, selectedFilter, selectedTag]);

  const subcategoryOptions = useMemo(() => {
    const options = new Set<string>();
    projects.forEach(p => {
      if (p.subcategory && p.subcategory !== 'Scenic Models') {
        options.add(p.subcategory);
      }
    });
    return Array.from(options).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const clearTag = () => {
    setSelectedTag(undefined);
    onNavigate(buildPortfolioRoute(selectedFilter, undefined));
  };

  const clearFilter = () => {
    setSelectedFilter(undefined);
    onNavigate(buildPortfolioRoute(undefined, selectedTag));
  };

  // STRICT NAV
  const handleProjectInteraction = (project: any) => {
    if (!project) return;
    setTransitionData(project);
    onNavigate(`project/${project.slug || project.id}`);
  };

  if (loading) {
    return <SkeletonPortfolio />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <SEO
        metadata={{
          title: "Scenic Design Portfolio",
          description: "Browse the scenic design portfolio of Brandon PT Davis. Spatial Storytelling & Environments.",
          keywords: ['Portfolio', 'Scenic Design', 'Theatre', 'Gallery', 'Opera', 'Dance'],
          canonicalPath: '/portfolio'
        }}
      />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative pt-32 pb-12 px-6"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl text-black dark:text-white mb-6 italic"
          >
            Scenic Design
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto"
          >
            Spatial Storytelling & Environments
          </motion.p>
        </div>
      </motion.section>

      {/* Filter Tag Indicator Only */}
      {selectedTag && (
        <section className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-black/5 dark:border-white/5 py-4 mt-[-1px]">
          <div className="max-w-[1800px] mx-auto px-6 lg:px-12 flex justify-center">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase">
                FILTERING BY TAG:
              </span>
              <button
                onClick={clearTag}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-full text-xs font-medium transition-colors group"
              >
                {selectedTag}
                <span className="group-hover:text-blue-600">×</span>
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="pt-8 pb-64 px-6 lg:px-12">
        <div className="relative">
          <div className="max-w-[1800px] mx-auto">
            {subcategoryOptions.length > 0 && (
              <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={clearFilter}
                  className={`px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase transition-colors ${!selectedFilter
                    ? 'bg-blue-500 text-white'
                    : 'bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/20'
                    }`}
                >
                  All
                </button>
                {subcategoryOptions.map((option) => {
                  const isActive = normalizeFilterValue(selectedFilter) === normalizeFilterValue(option);
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedFilter(option);
                        onNavigate(buildPortfolioRoute(option, selectedTag));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase transition-colors ${isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/20'
                        }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-white/40">No projects found</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                layout
              >
                {filteredProjects.map((project, index) => {
                  return (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                      onMouseEnter={() => prefetchProject(project)}
                      onClick={() => handleProjectInteraction(project)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleProjectInteraction(project);
                        }
                      }}
                      className="cursor-pointer group relative overflow-hidden rounded-2xl bg-neutral-900 aspect-[3/2] min-w-0"
                      role="button"
                      tabIndex={0}
                      aria-label={`View project details for ${project.title}`}
                    >
                      <motion.div
                        layoutId={`project-image-${project.id}`}
                        className="w-full h-full"
                      >
                        <ImageWithFallback
                          src={project.cardImage || project.coverImage || ''}
                          alt={`Scenic design for ${project.title} - ${project.venue || (project.subcategory || 'Production')}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          optimize="card"
                          lazy
                          focusPoint={
                            project.focusPoint
                              ? project.focusPoint
                              : project.coverImagePosition === 'top'
                                ? { x: 50, y: 0 }
                                : { x: 50, y: 50 }
                          }
                        />
                      </motion.div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="font-pixel text-[9px] text-white/40 mb-2 tracking-[0.4em]">
                          {project.subcategory?.toUpperCase() || project.category?.toUpperCase()}
                        </div>
                        <h3 className="font-display text-white mb-2 text-2xl">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-white/60">
                          {project.venue && <span>{project.venue}</span>}
                          {project.venue && (project.year || project.month) && <span>·</span>}
                          <span>
                            {project.year}
                          </span>
                        </div>

                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {project.tags.slice(0, 4).map((tag: string) => (
                              <button
                                key={tag}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(tag);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-2 py-0.5 bg-white/10 hover:bg-white/30 text-white/80 rounded text-[9px] backdrop-blur-md transition-colors"
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Spacer to separate grid from footer nav */}
      <div className="h-48 w-full block relative z-10" />

      <div>
        <PortfolioNavigation
          onNavigate={onNavigate}
          currentPortfolio="portfolio"
        />
      </div>
    </div>
  );
}