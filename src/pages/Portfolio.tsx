import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { projects as hardcodedProjects } from '../data/projects';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SkeletonProjectCard } from '../components/ui/skeleton';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const categoriesResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/categories/portfolio`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          if (categoriesData.success && categoriesData.categories) {
            setCategories(categoriesData.categories);
          } else {
            }
        } else {
          }
        
        // Fetch projects
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
        if (data.success && data.projects && data.projects.length > 0) {
          // Filter out unpublished projects (drafts)
          const publishedProjects = data.projects.filter((p: any) => p.published !== false);
          if (publishedProjects.length > 0) {
            }
          setProjects(publishedProjects);
        } else {
          // Fallback to hardcoded projects
          const convertedProjects = hardcodedProjects.map(p => ({
            ...p,
            slug: p.id,
          }));
          setProjects(convertedProjects);
        }
      } catch (err) {
        // Fallback to hardcoded projects
        const convertedProjects = hardcodedProjects.map(p => ({
          ...p,
          slug: p.id,
        }));
        setProjects(convertedProjects);
      } finally {
        setLoading(false);
      }
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
        filtered = filtered.filter(p => p.category === category.name);
      }
    }

    if (selectedSubcategory) {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
    }

    return filtered;
  }, [projects, selectedFilter, selectedSubcategory]);

  // Bento Grid sizing pattern - creates visual hierarchy
  const getBentoSize = (index: number): string => {
    const pattern = [
      'col-span-2 row-span-2', // 0: Large featured (2x2)
      'col-span-1 row-span-1', // 1: Small
      'col-span-1 row-span-2', // 2: Tall
      'col-span-1 row-span-1', // 3: Small
      'col-span-1 row-span-1', // 4: Small
      'col-span-2 row-span-1', // 5: Wide
      'col-span-1 row-span-1', // 6: Small
      'col-span-1 row-span-2', // 7: Tall
    ];
    
    return pattern[index % pattern.length];
  };

  const handleFilterClick = (filterId: string) => {
    setSelectedFilter(filterId);
    setCurrentProjectIndex(0); // Reset index when filter changes
  };

  const handleNextProject = () => {
    setCurrentProjectIndex((prev) => (prev + 1) % filteredProjects.length);
  };

  const handlePrevProject = () => {
    setCurrentProjectIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length);
  };

  const handleProjectClick = (index: number) => {
    setCurrentProjectIndex(index);
  };

  const getAccentClass = (category: string) => {
    const lowerCategory = category?.toLowerCase() || '';
    
    // Match full category names or short names
    if (lowerCategory.includes('scenic')) return 'accent-scenic';
    if (lowerCategory.includes('rendering') || lowerCategory.includes('visualization')) return 'accent-rendering';
    if (lowerCategory.includes('experiential')) return 'accent-experiential';
    
    return 'accent-default';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
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

  return (
    <div className="min-h-screen bg-white dark:bg-black">
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
                label: cat.name.toUpperCase(),
              }))
            ].map((cat) => {
              const isActive = selectedFilter === cat.id;
              
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => handleFilterClick(cat.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2 font-pixel text-[10px] tracking-[0.3em] rounded-full transition-all ${
                    isActive
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
                    className={`px-4 py-1.5 text-xs tracking-wider rounded-full transition-all ${
                      selectedSubcategory === null
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
                      className={`px-4 py-1.5 text-xs tracking-wider rounded-full transition-all ${
                        selectedSubcategory === subcat
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
      <section className="pt-8 px-6 lg:px-12">
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
                      onClick={() => onNavigate(`project/${project.slug || project.id}`)}
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
                        />
                      </motion.div>
                      
                      {/* Gradient Overlay - always visible */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      
                      {/* Content - Always visible */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="font-pixel text-[9px] text-white/40 mb-2 tracking-[0.4em]">
                          {project.subcategory?.toUpperCase() || project.category?.toUpperCase()}
                        </div>
                        <h3 className={`font-display text-white mb-2 text-2xl lg:text-3xl ${
                          bentoSize.includes('col-span-2') ? 'lg:text-4xl xl:text-5xl' : ''
                        }`}>
                          {project.title}
                        </h3>
                        {(bentoSize.includes('row-span-2') || window.innerWidth < 1024) && (
                          <div className="flex items-center gap-3 text-sm text-white/60">
                            {project.venue && <span>{project.venue}</span>}
                            {project.venue && project.year && <span>·</span>}
                            {project.year && <span>{project.year}</span>}
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

        {/* Bottom Project Navigation Panel */}
        {filteredProjects.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/40 tracking-widest uppercase">
                PROJECT {currentProjectIndex + 1} of {filteredProjects.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevProject}
                  className="p-2 backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-full border border-white/20 hover:border-white/40 transition-all"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={handleNextProject}
                  className="p-2 backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-full border border-white/20 hover:border-white/40 transition-all"
                  aria-label="Next project"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
              {filteredProjects.map((project, index) => (
                <motion.button
                  key={project.id}
                  onClick={() => handleProjectClick(index)}
                  className={`flex-shrink-0 w-28 h-20 rounded overflow-hidden border-2 transition-all ${
                    index === currentProjectIndex
                      ? 'border-white/80'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                  />
                </motion.button>
              ))}
            </div>

            {/* Current project info */}
            {filteredProjects[currentProjectIndex] && (
              <motion.div 
                key={filteredProjects[currentProjectIndex].id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pb-4"
              >
                <h4 className="font-display text-white text-lg mb-1">
                  {filteredProjects[currentProjectIndex].title}
                </h4>
                <p className="text-sm text-white/60 mb-3">
                  {filteredProjects[currentProjectIndex].subcategory?.toUpperCase() || filteredProjects[currentProjectIndex].category?.toUpperCase()}
                </p>
                <button
                  onClick={() => onNavigate(`project/${filteredProjects[currentProjectIndex].slug || filteredProjects[currentProjectIndex].id}`)}
                  className="inline-block px-4 py-2 backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-full border border-white/20 hover:border-white/40 transition-all text-sm text-white"
                >
                  View Project →
                </button>
              </motion.div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}