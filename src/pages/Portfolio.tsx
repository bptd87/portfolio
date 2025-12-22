import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import { projects as hardcodedProjects } from '../data/projects';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SkeletonProjectCard } from '../components/ui/skeleton';
import { SEO } from '../components/SEO';

interface PortfolioProps {
  onNavigate: (page: string, projectSlug?: string) => void;
  initialFilter?: string;
}

export function Portfolio({ onNavigate, initialFilter }: PortfolioProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

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
    const fetchData = async () => {
      setLoading(true);

      // Abort slow requests so we can fall back quickly
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const categoryPromise = fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/categories/portfolio`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        }
      )
        .then(async (res) => {
          if (!res.ok) return;
          const json = await res.json();
          if (json?.success && Array.isArray(json.categories)) {
            setCategories(json.categories);
          }
        })
        .catch(() => {
          // ignore category errors for speed
        });

      // New project fetching logic using direct Supabase query
      const supabase = createClient();

      const projectPromise = (async () => {
        try {
          const { data: projectsData, error } = await supabase
            .from('portfolio_projects')
            .select('*')
            .eq('published', true)
            .order('year', { ascending: false })
            .order('month', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching projects:', error);
            const convertedProjects = hardcodedProjects.map((p) => ({ ...p, slug: p.id }));
            setProjects(convertedProjects);
            return;
          }

          if (projectsData && projectsData.length > 0) {
            const publishedProjects = projectsData.map((p: any) => ({
              ...p,
              focusPoint: p.focus_point || { x: 50, y: 50 },
              cardImage: p.card_image || p.cover_image,
              coverImage: p.cover_image || p.card_image,
            }));
            setProjects(publishedProjects);
          } else {
            const convertedProjects = hardcodedProjects.map((p) => ({ ...p, slug: p.id }));
            setProjects(convertedProjects);
          }
        } catch (err) {
          console.error('Portfolio fetch error:', err);
          const convertedProjects = hardcodedProjects.map((p) => ({ ...p, slug: p.id }));
          setProjects(convertedProjects);
        }
      })();

      await Promise.allSettled([categoryPromise, projectPromise]);
      clearTimeout(timeout); // Clear the controller abort timeout
      setLoading(false);
    };

    fetchData();
  }, []);

  // Update subcategories when filter changes
  useEffect(() => {
    if (selectedFilter === 'all') {
      setAvailableSubcategories([]);
      setSelectedSubcategory(null);
      return;
    }

    // Find the category name from the slug
    const category = categories.find(cat => cat.slug === selectedFilter);
    if (!category) {
      setAvailableSubcategories([]);
      return;
    }

    const subcats = projects
      .filter(p => p.category === category.name && p.subcategory)
      .map(p => p.subcategory)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();

    setAvailableSubcategories(subcats);
    setSelectedSubcategory(null);
  }, [selectedFilter, projects, categories]);

  // Filtered projects for Bento Grid
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (selectedFilter !== 'all') {
      // Find the category name from the slug
      const category = categories.find(cat => cat.slug === selectedFilter);
      if (category) {
        // Special case for Rendering category to handle legacy/variant data
        if (category.slug === 'rendering-visualization' || category.slug === 'rendering') {
          filtered = filtered.filter(p =>
            p.category === 'Rendering & Visualization' ||
            p.category === 'Rendering' ||
            p.category === 'Visualization'
          );
        } else {
          filtered = filtered.filter(p => p.category === category.name);
        }
      }
    }

    if (selectedSubcategory) {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
    }

    return filtered;
  }, [projects, selectedFilter, selectedSubcategory]);

  // Bento Grid sizing pattern - creates visual hierarchy
  // Modified to avoid "skinny" tall boxes (col-span-1 row-span-2) which don't work well for scenic design
  const getBentoSize = (index: number): string => {
    const pattern = [
      'col-span-2 row-span-2', // 0: Large featured (2x2)
      'col-span-1 row-span-1', // 1: Small
      'col-span-1 row-span-1', // 2: Small (Was Tall)
      'col-span-1 row-span-1', // 3: Small
      'col-span-1 row-span-1', // 4: Small
      'col-span-2 row-span-1', // 5: Wide
      'col-span-1 row-span-1', // 6: Small
      'col-span-1 row-span-1', // 7: Small (Was Tall)
    ];

    return pattern[index % pattern.length];
  };

  const handleFilterClick = (filterId: string) => {
    setSelectedFilter(filterId);
    setCurrentProjectIndex(0); // Reset index when filter changes
  };


  const scrollToProject = (index: number) => {
    const container = document.getElementById('thumbnails-scroll-container');
    if (!container) return;

    // Calculate position to center the selected thumbnail
    // Assuming thumbnail width + gap is roughly 140px (w-32=128px + gap-3=12px)
    // Selected thumbnail is wider (w-48=192px), so we adjust slightly
    const thumbnailWidth = 140;
    const containerWidth = container.clientWidth;
    const targetScroll = (index * thumbnailWidth) - (containerWidth / 2) + (thumbnailWidth / 2);

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const handleNextProject = () => {
    setCurrentProjectIndex((prev) => {
      const next = (prev + 1) % filteredProjects.length;
      scrollToProject(next);
      return next;
    });
  };

  const handlePrevProject = () => {
    setCurrentProjectIndex((prev) => {
      const next = (prev - 1 + filteredProjects.length) % filteredProjects.length;
      scrollToProject(next);
      return next;
    });
  };

  const handleProjectClick = (index: number) => {
    setCurrentProjectIndex(index);
    scrollToProject(index);
  };

  const handleNavigateToProject = (project: any) => {
    if (!project) return;
    setTransitionData(project);
    onNavigate(`project/${project.slug || project.id}`);
  };




  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        {/* ... skeleton ... */}
        {/* Helper SEO for loading state */}
        <SEO title="Portfolio | Loading..." />
        {/* Hero Section Skeleton */}
        <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-center px-6 animate-pulse">
            <div className="h-12 w-64 bg-white/10 rounded mx-auto mb-4" />
            <div className="h-6 w-96 bg-white/5 rounded mx-auto" />
          </div>
        </section>

        {/* Grid Skeleton */}
        <section className="pt-8 px-6 lg:px-12">
          <div className="max-w-[1800px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonProjectCard key={index} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Determine title based on filter
  const pageTitle = selectedFilter === 'all'
    ? 'Portfolio'
    : `${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1).replace('-', ' ')} Portfolio`;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <SEO
        title={pageTitle}
        description="Browse the scenic design portfolio of Brandon PT Davis."
        keywords={['Portfolio', 'Scenic Design', 'Theatre', 'Gallery']}
      />
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative pt-32 pb-20 px-6"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl text-black dark:text-white mb-6 italic"
          >
            Portfolio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto"
          >
            A curated collection of scenic designs spanning theatre, experiential installations, and digital visualization.
          </motion.p>
        </div>
      </motion.section>

      {/* Filter Tabs */}
      <section className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-black/5 dark:border-white/5 py-4 mt-[-1px]">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          {/* Main Categories */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'ALL' },
              ...categories.map(cat => ({
                id: cat.slug,
                label: cat.name?.toUpperCase() || cat.slug?.toUpperCase() || 'UNKNOWN',
              }))
            ].map((cat) => {
              const isActive = selectedFilter === cat.id;

              return (
                <motion.button
                  key={cat.id}
                  onClick={() => handleFilterClick(cat.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2 font-pixel text-[10px] tracking-[0.3em] rounded-full transition-all ${isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black/80 dark:hover:text-white/80 border border-black/10 dark:border-white/10'
                    }`}
                >
                  {cat.label}
                </motion.button>
              );
            })}
          </div>

          {/* Subcategories - Accordion style */}
          <AnimatePresence>
            {availableSubcategories.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                  <motion.button
                    onClick={() => setSelectedSubcategory(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-1.5 text-xs tracking-wider rounded-full transition-all ${selectedSubcategory === null
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                      }`}
                  >
                    All
                  </motion.button>
                  {availableSubcategories.map((subcat) => (
                    <motion.button
                      key={subcat}
                      onClick={() => setSelectedSubcategory(subcat)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`px-4 py-1.5 text-xs tracking-wider rounded-full transition-all ${selectedSubcategory === subcat
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                        }`}
                    >
                      {subcat}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Bento Grid - Apple-style asymmetric layout */}
      <section className="pt-8 pb-40 px-6 lg:px-12">
        <div className="relative">
          {/* Left Navigation Arrow */}
          {filteredProjects.length > 1 && (
            <button
              onClick={handlePrevProject}
              className="hidden lg:flex fixed left-12 top-1/2 -translate-y-1/2 z-40 p-3 backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-full border border-white/20 hover:border-white/40 transition-all items-center justify-center"
              aria-label="Previous projects"
              title="Previous project batch"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {filteredProjects.length > 1 && (
            <button
              onClick={handleNextProject}
              className="hidden lg:flex fixed right-12 top-1/2 -translate-y-1/2 z-40 p-3 backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-full border border-white/20 hover:border-white/40 transition-all items-center justify-center"
              aria-label="Next projects"
              title="Next project batch"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          <div className="max-w-[1800px] mx-auto">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-white/40">No projects found</p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:auto-rows-[280px]"
              >
                {filteredProjects.map((project, index) => {
                  const bentoSize = getBentoSize(index);

                  return (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.03 }}
                      onMouseEnter={() => prefetchProject(project)}
                      onClick={() => handleNavigateToProject(project)}
                      className={`lg:${bentoSize} cursor-pointer group relative overflow-hidden rounded-2xl bg-neutral-900`}
                    >
                      {/* Image - fills entire card */}
                      <motion.div
                        layoutId={`project-image-${project.id}`}
                        className="w-full h-full"
                      >
                        <ImageWithFallback
                          src={project.cardImage || project.coverImage || ''}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          style={{
                            objectPosition: project.focusPoint
                              ? `${project.focusPoint.x}% ${project.focusPoint.y}%`
                              : project.coverImagePosition === 'top'
                                ? 'center top'
                                : 'center center'
                          }}
                          lazy={true}
                        />
                      </motion.div>

                      {/* Gradient Overlay - always visible */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* Content - Always visible */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="font-pixel text-[9px] text-white/40 mb-2 tracking-[0.4em]">
                          {project.subcategory?.toUpperCase() || project.category?.toUpperCase()}
                        </div>
                        <h3 className={`font-display text-white mb-2 text-2xl lg:text-3xl ${bentoSize.includes('col-span-2') ? 'lg:text-4xl xl:text-5xl' : ''
                          }`}>
                          {project.title}
                        </h3>
                        {(bentoSize.includes('row-span-2') || window.innerWidth < 1024) && (
                          <div className="flex items-center gap-3 text-sm text-white/60">
                            {project.venue && <span>{project.venue}</span>}
                            {project.venue && (project.year || project.month) && <span>·</span>}
                            <span>
                              {project.month && new Date(0, project.month - 1).toLocaleString('default', { month: 'long' })}
                              {project.month && ' '}
                              {project.year}
                            </span>
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

        {/* Bottom Project Navigation Panel - Redesigned */}
        {filteredProjects.length > 0 && (
          <div className="mt-32 pt-8 border-t border-white/10 relative z-30 pb-24">
            {/* Header: Count and Arrows */}
            <div className="flex items-center justify-between mb-8">
              <p className="font-pixel text-[10px] text-white/40 tracking-[0.2em] uppercase">
                Viewing {filteredProjects.length} Projects
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const container = document.getElementById('thumbnails-scroll-container');
                    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="p-3 backdrop-blur-xl bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-white/30 transition-all group"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4 text-white/60 group-hover:text-white" />
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById('thumbnails-scroll-container');
                    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="p-3 backdrop-blur-xl bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-white/30 transition-all group"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white" />
                </button>
              </div>
            </div>

            {/* Thumbnail Strip - Scrollable */}
            <div
              id="thumbnails-scroll-container"
              className="flex gap-3 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory"
              style={{
                maskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)'
              }}
            >
              {filteredProjects.map((project, index) => (
                <motion.button
                  key={project.id}
                  onClick={() => handleProjectClick(index)}
                  onMouseEnter={() => prefetchProject(project)}
                  className={`flex-shrink-0 relative overflow-hidden rounded-md transition-all duration-500 ease-out snap-start ${index === currentProjectIndex
                    ? 'w-48 h-32 shadow-2xl shadow-black/50 z-10'
                    : 'w-32 h-20 opacity-40 hover:opacity-100 hover:w-36 hover:h-24 grayscale hover:grayscale-0'
                    }`}
                  layout
                >
                  <ImageWithFallback
                    src={project.cardImage || project.coverImage || ''}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: project.focusPoint
                        ? `${project.focusPoint.x}% ${project.focusPoint.y}%`
                        : 'center center'
                    }}
                    lazy={true}
                  />
                  {index !== currentProjectIndex && (
                    <div className="absolute inset-0 bg-black/20" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Selected Project Preview Area */}
            <AnimatePresence mode="wait">
              {filteredProjects[currentProjectIndex] && (
                <motion.div
                  key={filteredProjects[currentProjectIndex].id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-white/5 pt-12"
                >
                  {/* Left: Info */}
                  <div className="lg:col-span-4 space-y-6">
                    <div>
                      <h4 className="font-display text-4xl text-white mb-3">
                        {filteredProjects[currentProjectIndex].title}
                      </h4>
                      <p className="font-pixel text-xs text-blue-400 tracking-[0.2em] uppercase mb-4 opacity-80">
                        {filteredProjects[currentProjectIndex].subcategory || filteredProjects[currentProjectIndex].category}
                      </p>
                    </div>

                    <div className="text-sm text-white/50 space-y-2 font-light tracking-wide">
                      <p>{filteredProjects[currentProjectIndex].venue}</p>
                      <p>{filteredProjects[currentProjectIndex].year}</p>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => onNavigate(`project/${filteredProjects[currentProjectIndex].slug || filteredProjects[currentProjectIndex].id}`)}
                        className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white text-white hover:text-black rounded-full text-sm tracking-widest uppercase transition-all duration-300 border border-white/10 hover:border-transparent group"
                      >
                        View Project
                        <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Quick Gallery Preview (3 images) - Prioritize Production Photos */}
                  <div className="lg:col-span-8 grid grid-cols-3 gap-4">
                    {/* Combine process (photos) and hero (renderings) galleries, prioritize photos */}
                    {(() => {
                      const allImages = [
                        ...(filteredProjects[currentProjectIndex].galleries?.process || []),
                        ...(filteredProjects[currentProjectIndex].galleries?.hero || []),
                        ...(filteredProjects[currentProjectIndex].galleries?.additional?.flatMap((g: any) => g.images.map((img: any) => img.url)) || [])
                      ];

                      const displayImages = allImages.slice(0, 3);

                      if (displayImages.length === 0) {
                        // Fallback to card image if no gallery images
                        return (
                          <div className="col-span-3 aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-white/10 relative group">
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <p className="font-pixel text-xs text-white">CLICK TO VIEW PROJECT</p>
                            </div>
                            <ImageWithFallback
                              src={filteredProjects[currentProjectIndex].cardImage || filteredProjects[currentProjectIndex].coverImage || ''}
                              alt=""
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all"
                            />
                          </div>
                        );
                      }

                      return displayImages.map((img: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-white/10"
                        >
                          <ImageWithFallback
                            src={img}
                            alt=""
                            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                            lazy={true}
                          />
                        </motion.div>
                      ));
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}