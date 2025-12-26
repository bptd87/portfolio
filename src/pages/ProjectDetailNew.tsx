import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, Calendar, MapPin, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { YouTubeEmbed } from '../components/shared/YouTubeEmbed';
import { LikeButton } from '../components/shared/LikeButton';
import { ShareButton } from '../components/shared/ShareButton';
// apiCall removed
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SEO } from '../components/SEO';
import { generateProjectMetadata } from '../utils/seo/metadata';
import { generateCreativeWorkSchema } from '../utils/seo/structured-data';
// PageLoader removed
import { supabase } from '../utils/supabase/client';

interface ProjectDetailNewProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function ProjectDetailNew({ slug, onNavigate }: ProjectDetailNewProps) {
  const [project, setProject] = useState<any>(null);
  const [nextProject, setNextProject] = useState<any>(null);
  const [prevProject, setPrevProject] = useState<any>(null);
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['photos', 'team'])); // Default to photos and team open
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Transition image from home page
  const [transitionImage, setTransitionImage] = useState<string | null>(null);
  const [transitionFocusPoint, setTransitionFocusPoint] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  // Removed parallax transforms for simpler design

  const cacheKey = (value: string) => `project-cache-${value}`;

  const cacheProjectData = (data: any) => {
    if (!data) return;
    const slugValue = data.slug || data.id;
    if (!slugValue) return;
    sessionStorage.setItem(cacheKey(slugValue), JSON.stringify({ ...data, slug: slugValue }));
  };

  // Read transition image from sessionStorage on mount
  useEffect(() => {
    const storedImage = sessionStorage.getItem('transitionImage');
    const storedFocusPoint = sessionStorage.getItem('transitionFocusPoint');

    if (storedImage) {
      setTransitionImage(storedImage);
      sessionStorage.removeItem('transitionImage');
    }
    if (storedFocusPoint) {
      try {
        setTransitionFocusPoint(JSON.parse(storedFocusPoint));
      } catch (e) { }
      sessionStorage.removeItem('transitionFocusPoint');
    }
  }, []);

  useEffect(() => {
    const cached = sessionStorage.getItem(cacheKey(slug));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProject(parsed);
        setLoading(false);
      } catch (e) { }
    }

    fetchProject(!cached);
    incrementViews();
  }, [slug]);

  const fetchProject = async (showLoader: boolean = true) => {
    try {
      if (showLoader) setLoading(true);

      // Fetch project directly from Supabase
      // supabase constant imported from client
      const { data: projectData, error: projectError } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (projectError || !projectData) {
        throw new Error('Failed to fetch project');
      }

      const projectAny = projectData as any;

      // Map database fields to frontend format
      const mappedProject: any = {
        ...projectAny,
        cardImage: projectAny.card_image || projectAny.cover_image,
        coverImage: projectAny.cover_image || projectAny.card_image,
        designNotes: projectAny.design_notes || projectAny.designNotes,
        projectOverview: projectAny.project_overview || projectAny.projectOverview,
        softwareUsed: projectAny.software_used || projectAny.softwareUsed,
        videoUrls: projectAny.video_urls || projectAny.videoUrls,
        productionPhotos: projectAny.production_photos || projectAny.productionPhotos,
      };

      // Check if category includes "Experiential"
      if (mappedProject.category && mappedProject.category.includes('Experiential')) {
        setProject({ ...mappedProject, useExperientialTemplate: true });
        cacheProjectData({ ...mappedProject, useExperientialTemplate: true });
      }
      // Check if category includes "Rendering" or "Visualization"
      else if (mappedProject.category && (mappedProject.category.includes('Rendering') || mappedProject.category.includes('Visualization'))) {
        setProject({ ...mappedProject, useRenderingTemplate: true });
        cacheProjectData({ ...mappedProject, useRenderingTemplate: true });
      } else {
        setProject(mappedProject);
        cacheProjectData(mappedProject);
      }

      // Fetch all projects for navigation (direct from Supabase)
      try {
        // supabase constant imported from client
        const { data: allProjects, error: projectsError } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('published', true)
          .order('year', { ascending: false })
          .order('month', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (!projectsError && allProjects) {
          // Map database fields to frontend format
          const mappedProjects = allProjects.map((p: any) => ({
            ...p,
            cardImage: p.card_image || p.cover_image,
            coverImage: p.cover_image || p.card_image,
            designNotes: p.design_notes || p.designNotes,
          }));

          const sameCategory = mappedProjects.filter((p: any) => p.category === mappedProject.category);

          const currentIndex = sameCategory.findIndex((p: any) => p.slug === slug);
          if (currentIndex > -1) {
            const nextIndex = (currentIndex + 1) % sameCategory.length;
            const prevIndex = (currentIndex - 1 + sameCategory.length) % sameCategory.length;

            setNextProject(sameCategory[nextIndex]);
            setPrevProject(sameCategory[prevIndex]);

            // Select 3 related projects (next 3 in line)
            const related: any[] = [];
            if (sameCategory.length > 1) {
              for (let i = 1; i <= 3; i++) {
                const idx = (currentIndex + i) % sameCategory.length;
                if (sameCategory[idx].slug !== slug) {
                  related.push(sameCategory[idx]);
                }
              }
              // Deduplicate and limit to 3
              const uniqueRelated = Array.from(new Set(related.map(p => p.id)))
                .map(id => related.find(p => p.id === id))
                .slice(0, 3);
              
              setRelatedProjects(uniqueRelated);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch related projects:', err);
      }
    } catch (error) {
      // Error fetching related projects
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      // Get ID from slug first
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        await supabase.rpc('increment_project_view', { project_id: data.id });
      }
    } catch (error) {
      // Silent fail
    }
  };

  const toggleSection = (section: string) => {
    const currentSections = new Set(expandedSections);
    if (currentSections.has(section)) {
      currentSections.delete(section);
    } else {
      currentSections.add(section);
    }
    setExpandedSections(currentSections);
  };

  const openLightbox = (images: string[], startIndex: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const renderSkeleton = () => (
    <div className="min-h-screen bg-black text-white relative">
      {transitionImage && (
        <motion.div
          className="fixed inset-0 z-0"
          initial={{ scale: 1.02, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <img
            src={transitionImage}
            alt="Loading background"
            className="w-full h-full object-cover"
            style={{ objectPosition: `${transitionFocusPoint.x}% ${transitionFocusPoint.y}%` }}
          />
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
        </motion.div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="text-sm uppercase tracking-[0.3em] text-white/60 mb-4">Loading project</div>
        <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-label="Loading" />
        <p className="mt-4 text-white/60 max-w-lg">Bringing up the stage while we load the details.</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen relative">
        {renderSkeleton()}
      </div>
    );
  }

  // If project is Experiential Design, use the specialized template
  if (project && project.useExperientialTemplate) {
    const ExperientialProjectDetail = React.lazy(() =>
      import('./ExperientialProjectDetail').then(m => ({ default: m.ExperientialProjectDetail }))
    );
    return (
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>}>
        <ExperientialProjectDetail slug={slug} onNavigate={onNavigate} />
      </React.Suspense>
    );
  }

  // If project is Rendering/Visualization, use the specialized template
  if (project && project.useRenderingTemplate) {
    const RenderingProjectDetail = React.lazy(() =>
      import('./RenderingProjectDetail').then(m => ({ default: m.RenderingProjectDetail }))
    );
    return (
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}>
        <RenderingProjectDetail slug={slug} onNavigate={onNavigate} />
      </React.Suspense>
    );
  }

  // If project is Design Documentation (Archive or Models), use the clean catalog template
  const isDesignDoc = project && (
    project.category === 'Design Documentation' ||
    slug === 'scenic-design-archive' ||
    slug === 'scenic-models'
  );



  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="font-pixel text-sm tracking-wider opacity-60">PROJECT NOT FOUND</p>
        <button
          onClick={() => onNavigate('portfolio')}
          className="px-8 py-3 backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 hover:bg-neutral-800/80 transition-all"
        >
          BACK TO PORTFOLIO
        </button>
      </div>
    );
  }

  // Generate SEO metadata
  const seoMetadata = generateProjectMetadata({
    title: project.title,
    subtitle: project.subtitle,
    description: project.description,
    heroImage: project.heroImage,
    cardImage: project.cardImage,
    year: project.year,
    venue: project.venue,
    slug: project.slug,
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
    seoKeywords: project.seoKeywords,
    ogImage: project.ogImage,
  });

  // Generate structured data for Google
  const structuredData = generateCreativeWorkSchema({
    name: project.title,
    description: project.description || `${project.title} - Scenic design by Brandon PT Davis`,
    image: project.heroImage || project.cardImage,
    dateCreated: project.year?.toString(),
    creator: 'Brandon PT Davis',
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}/project/${project.slug}`,
    genre: 'Scenic Design',
    keywords: project.tags || ['scenic design', 'theatre', 'set design'],
  });

  if (isDesignDoc) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <SEO
          metadata={seoMetadata}
          structuredData={structuredData}
        />

        {/* Simple Text Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 border-b border-white/10 pb-12"
        >
          <p className="font-pixel text-xs tracking-[0.3em] text-white/60 mb-6 uppercase">
            {project.category || 'Design Documentation'} / {project.subcategory || 'Archive'}
          </p>
          <h1 className="font-display text-4xl md:text-6xl mb-6">{project.title}</h1>
          <p className="text-white/60 max-w-2xl text-lg leading-relaxed">{project.description}</p>
        </motion.div>

        {/* Stacked Entry Layout */}
        <div className="max-w-4xl mx-auto space-y-24">
          {project.galleries?.process?.map((image: string, index: number) => {
            const caption = project.galleries.processCaptions?.[index] || '';
            const lines = caption.split('\n').filter((l: string) => l.trim());
            const title = lines[0] || `Entry ${index + 1}`;
            const metadata = lines.slice(1);

            return (
              <article key={index} className="space-y-8">
                <div className="space-y-4">
                  <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
                  {metadata.length > 0 && (
                    <div className="space-y-1 text-white/60 font-mono text-sm">
                      {metadata.map((line: string, idx: number) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className="rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-white/30 transition-all"
                  onClick={() => openLightbox(project.galleries.process, index)}
                >
                  <ImageWithFallback
                    src={image}
                    alt={project.galleries.processAlt?.[index] || title}
                    className="w-full h-auto"
                  />
                </div>
              </article>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="mt-24 text-center">
          <button
            onClick={() => onNavigate('portfolio')}
            className="px-8 py-3 backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 hover:bg-neutral-800/80 transition-all font-pixel text-xs tracking-[0.3em]"
          >
            BACK TO PORTFOLIO
          </button>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {lightboxImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
                    }}
                    className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
                    }}
                    className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={lightboxImages[lightboxIndex]}
                alt={`Image ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-pixel text-xs text-white/60 tracking-wider">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      {/* SEO and Structured Data */}
      <SEO
        metadata={seoMetadata}
        structuredData={structuredData}
      />

      {/* Fixed Background - Stationary with visible card image */}
      <motion.div
        layoutId={`project-image-${project.id}`}
        className="fixed inset-0 z-0"
      >
        <ImageWithFallback
          src={project.cardImage || project.coverImage || ''}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Navigation Arrows */}
      {prevProject && (
        <button
          onClick={() => onNavigate(`project/${prevProject.slug}`)}
          className="fixed left-6 top-1/2 -translate-y-1/2 z-50 p-4 backdrop-blur-xl bg-neutral-800/80 dark:bg-neutral-900/80 rounded-full border border-white/10 hover:bg-neutral-800/90 transition-all hidden md:block"
          aria-label={`Previous project: ${prevProject.title}`}
          title={`Previous project: ${prevProject.title}`}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {nextProject && (
        <button
          onClick={() => onNavigate(`project/${nextProject.slug}`)}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-50 p-4 backdrop-blur-xl bg-neutral-800/80 dark:bg-neutral-900/80 rounded-full border border-white/10 hover:bg-neutral-800/90 transition-all hidden md:block"
          aria-label={`Next project: ${nextProject.title}`}
          title={`Next project: ${nextProject.title}`}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Scrollable Content - Wider Column */}
      <div className="relative z-10 min-h-screen pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Hero Title Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 p-8 md:p-12"
          >
            <div className="font-pixel text-xs text-white/60 tracking-[0.3em] mb-4">
              {project.category?.toUpperCase()}
            </div>
            <h1 className="font-display text-white text-4xl md:text-5xl lg:text-6xl mb-6">
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm text-white/80">
              {(project.venue || project.location) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {project.venue}
                    {project.venue && project.location && <span className="mx-1 opacity-60">·</span>}
                    {project.location}
                  </span>
                </div>
              )}
              {project.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{project.year}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Metadata Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <LikeButton projectId={project.id} initialLikes={project.likes || 0} size="md" showCount={true} />
                <div className="flex items-center gap-2 text-white/60">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm">{(project.views || 0).toLocaleString()}</span>
                </div>
              </div>
              <ShareButton
                title={`${project.title} - Brandon PT Davis`}
                description={`${project.venue} · ${project.year}`}
                size="md"
              />
            </div>
          </motion.div>

          {/* Design Notes - Expandable */}
          {project.designNotes && project.designNotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button
                onClick={() => toggleSection('notes')}
                className="w-full backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 p-6 text-left hover:bg-neutral-800/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="font-pixel text-xs text-white/60 tracking-[0.3em]">
                    DESIGN NOTES
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${expandedSections.has('notes') ? 'rotate-180' : ''}`} />
                </div>
                {!expandedSections.has('notes') && (
                  <p className="text-white/80 mt-4 line-clamp-2">
                    {project.designNotes[0]}
                  </p>
                )}
              </button>
              <AnimatePresence>
                {expandedSections.has('notes') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 p-6 mt-2"
                  >
                    <div className="space-y-4 text-white/80 leading-relaxed text-justify">
                      {project.designNotes.map((note: string, index: number) => (
                        <p key={index} className="text-justify">{note}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Renderings Gallery - Expandable */}
          {project.galleries?.hero && project.galleries.hero.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button
                onClick={() => toggleSection('renderings')}
                className="w-full backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 p-6 text-left hover:bg-neutral-800/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="font-pixel text-xs text-white/60 tracking-[0.3em]">
                    RENDERINGS ({project.galleries.hero.length})
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${expandedSections.has('renderings') ? 'rotate-180' : ''}`} />
                </div>
                {!expandedSections.has('renderings') && (
                  <div className="mt-4 aspect-[16/9] overflow-hidden rounded-xl">
                    <ImageWithFallback
                      src={project.galleries.hero[0]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </button>
              <AnimatePresence>
                {expandedSections.has('renderings') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-2"
                  >
                    {project.galleries.hero.map((image: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => openLightbox(project.galleries.hero, index)}
                        className="group backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 overflow-hidden cursor-pointer hover:bg-neutral-800/80 transition-all"
                        style={{ lineHeight: 0 }}
                      >
                        {(() => {
                          const captionItem = project.galleries.heroCaptions?.[index];
                          const captionText = typeof captionItem === 'object' && captionItem !== null ? captionItem.caption : captionItem;
                          const altText = project.galleries.heroAlt?.[index] || (typeof captionItem === 'object' && captionItem !== null ? captionItem.altText : captionText) || `Rendering ${index + 1}`;

                          return (
                            <>
                              <ImageWithFallback
                                src={image}
                                alt={altText}
                                className="w-full h-auto block transition-transform duration-700 group-hover:scale-110"
                              />
                              {captionText && (
                                <p className="p-4 text-sm text-white/60">
                                  {captionText}
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Production Photos - Expandable */}
          {project.galleries?.process && project.galleries.process.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                onClick={() => toggleSection('photos')}
                className="w-full backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 p-6 text-left hover:bg-neutral-800/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="font-pixel text-xs text-white/60 tracking-[0.3em]">
                    PRODUCTION PHOTOS ({project.galleries.process.length})
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${expandedSections.has('photos') ? 'rotate-180' : ''}`} />
                </div>
                {!expandedSections.has('photos') && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {project.galleries.process.slice(0, 3).map((image: string, index: number) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg">
                        <ImageWithFallback
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </button>
              <AnimatePresence>
                {expandedSections.has('photos') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-2"
                  >
                    {project.galleries.process.map((image: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => openLightbox(project.galleries.process, index)}
                        className="group backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 overflow-hidden cursor-pointer hover:bg-neutral-800/80 transition-all"
                        style={{ lineHeight: 0 }}
                      >
                        {(() => {
                          const captionItem = project.galleries.processCaptions?.[index];
                          const captionText = typeof captionItem === 'object' && captionItem !== null ? captionItem.caption : captionItem;
                          const altText = project.galleries.processAlt?.[index] || (typeof captionItem === 'object' && captionItem !== null ? captionItem.altText : captionText) || `Photo ${index + 1}`;

                          return (
                            <>
                              <ImageWithFallback
                                src={image}
                                alt={altText}
                                className="w-full h-auto block transition-transform duration-700 group-hover:scale-110"
                              />
                              {captionText && (
                                <p className="p-4 text-sm text-white/60">
                                  {captionText}
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Videos - Expandable */}
          {project.youtubeVideos && project.youtubeVideos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <button
                onClick={() => toggleSection('videos')}
                className="w-full backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 p-6 text-left hover:bg-neutral-800/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="font-pixel text-xs text-white/60 tracking-[0.3em]">
                    VIDEOS ({project.youtubeVideos.length})
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${expandedSections.has('videos') ? 'rotate-180' : ''}`} />
                </div>
              </button>
              <AnimatePresence>
                {expandedSections.has('videos') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-2"
                  >
                    {project.youtubeVideos.map((video: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 overflow-hidden"
                      >
                        <YouTubeEmbed url={video} title={`${project.title} - Video ${index + 1}`} autoplay={index === 0} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Creative Team - Expandable */}
          {project.credits && project.credits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <button
                onClick={() => toggleSection('team')}
                className="w-full backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 p-6 text-left hover:bg-neutral-800/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="font-pixel text-xs text-white/60 tracking-[0.3em]">
                    CREATIVE TEAM
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${expandedSections.has('team') ? 'rotate-180' : ''}`} />
                </div>
              </button>
              <AnimatePresence>
                {expandedSections.has('team') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 p-6 mt-2"
                  >
                    <div className="space-y-4">
                      {project.credits.map((credit: any, index: number) => (
                        <div key={index} className="border-l-2 border-white/20 pl-4">
                          <p className="font-pixel text-xs text-white/40 tracking-wider mb-1">
                            {credit.role?.toUpperCase()}
                          </p>
                          <p className="text-white/80">{credit.name}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl border border-white/10 p-6"
            >
              <div className="font-pixel text-xs text-white/60 tracking-[0.3em] mb-4">
                TAGS
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 font-pixel text-xs text-white/60 border border-white/20 rounded-full hover:border-white/40 hover:text-white/80 transition-all"
                  >
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bottom Navigation Panel - Scenic Design Projects */}
          {relatedProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16 pt-8 border-t border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-pixel text-xs tracking-[0.3em] uppercase text-white/60">
                  More Scenic Designs
                </h3>
                <div className="flex gap-2">
                  {prevProject && (
                    <button
                      onClick={() => onNavigate(`project/${prevProject.slug}`)}
                      className="p-2 border border-white/10 hover:border-white/40 transition-all rounded-full"
                      aria-label="Previous project"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                  )}
                  {nextProject && (
                    <button
                      onClick={() => onNavigate(`project/${nextProject.slug}`)}
                      className="p-2 border border-white/10 hover:border-white/40 transition-all rounded-full"
                      aria-label="Next project"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Project cards grid */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[320px]">
                {relatedProjects.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    onClick={() => onNavigate(`project/${p.slug}`)}
                    className="group relative overflow-hidden rounded-2xl bg-neutral-900 cursor-pointer h-[240px] md:h-full"
                  >
                    <motion.div
                      layoutId={`project-image-related-${p.id}`}
                      className="w-full h-full"
                    >
                      <ImageWithFallback
                        src={p.cardImage || p.coverImage || ''}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </motion.div>
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    {/* Border */}
                    <div className="absolute inset-0 border border-white/10 group-hover:border-white/40 transition-all rounded-2xl pointer-events-none" />

                    {/* Content Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                      <p className="font-pixel text-[10px] tracking-[0.2em] text-white/60 mb-2 uppercase transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                         {p.category || 'PROJECT'}
                      </p>
                      <h4 className="font-display text-xl md:text-2xl text-white italic leading-tight">
                        {p.title}
                      </h4>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Back to Portfolio */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center pt-12"
          >
            <button
              onClick={() => onNavigate('portfolio')}
              className="px-8 py-4 backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-full border border-white/10 hover:bg-neutral-800/80 transition-all font-pixel text-xs tracking-[0.3em] text-white"
            >
              BACK TO PORTFOLIO
            </button>
          </motion.div>

        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              aria-label="Close lightbox"
              title="Close lightbox"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
                  }}
                  className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                  aria-label="Previous image"
                  title="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
                  }}
                  className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                  aria-label="Next image"
                  title="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={lightboxImages[lightboxIndex]}
              alt={`Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-pixel text-xs text-white/60 tracking-wider">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}