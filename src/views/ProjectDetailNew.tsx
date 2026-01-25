'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, Calendar, MapPin, ChevronDown, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { YouTubeEmbed } from '../components/shared/YouTubeEmbed';
import { LikeButton } from '../components/shared/LikeButton';
import { ShareButton } from '../components/shared/ShareButton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SEO } from '../components/SEO';
import { generateProjectMetadata, PAGE_METADATA } from '../utils/seo/metadata';
import { generateCreativeWorkSchema } from '../utils/seo/structured-data';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { RelatedProjectsAdvanced } from '../components/shared/RelatedProjectsAdvanced';
import { ImageSlideshow } from '../components/shared/ImageSlideshow';
import { SkeletonProjectDetail } from '../components/skeletons/SkeletonProjectDetail';
import { ParallaxImage } from '../components/shared/ParallaxImage';

interface ProjectDetailNewProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function ProjectDetailNew({ slug, onNavigate }: ProjectDetailNewProps) {
  const [project, setProject] = useState<any>(null);
  const [nextProject, setNextProject] = useState<any>(null);
  const [prevProject, setPrevProject] = useState<any>(null);
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['photos', 'team']));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [transitionImage, setTransitionImage] = useState<string | null>(null);
  const [transitionFocusPoint, setTransitionFocusPoint] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const cacheKey = (value: string) => `project-cache-${value}`;

  const cacheProjectData = (data: any) => {
    if (!data) return;
    const slugValue = data.slug || data.id;
    if (!slugValue) return;
    sessionStorage.setItem(cacheKey(slugValue), JSON.stringify({ ...data, slug: slugValue }));
  };

  useEffect(() => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('project-cache-')) {
        sessionStorage.removeItem(key);
      }
    });

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

      const { data: projectRows, error: projectError } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .limit(1);

      let projectAny = projectRows?.[0] as any;

      if (!projectAny && !projectError) {
        const { data: idRows } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('id', slug)
          .eq('published', true)
          .limit(1);
        projectAny = idRows?.[0] as any;
      }

      if (!projectAny) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${slug}`,
            {
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
            },
          );
          if (response.ok) {
            const data = await response.json();
            if (data?.success && data.project) {
              projectAny = data.project;
            }
          }
        } catch (err) {
          console.error('Project API fallback failed:', err);
        }
      }

      if (projectError || !projectAny) {
        throw new Error('Failed to fetch project');
      }
      const designNotesRaw = projectAny.design_notes || projectAny.designNotes;
      const normalizedDesignNotes = Array.isArray(designNotesRaw)
        ? designNotesRaw
        : designNotesRaw
          ? [designNotesRaw]
          : [];
      const descriptionValue = typeof projectAny.description === 'string'
        ? projectAny.description
        : (projectAny.description?.text || projectAny.description?.content || '');

      const safeParse = (value: any) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        }
        return value;
      };

      const extractUrls = (items: any): string[] => {
        if (!items) return [];
        if (typeof items === 'string') return [items];
        if (!Array.isArray(items)) return [];

        return items
          .map((item) => {
            if (!item) return null;
            if (typeof item === 'string') return item;
            if (item.url) return item.url;
            if (item.src) return item.src;
            if (item.path) return item.path;
            return null;
          })
          .filter((url): url is string => typeof url === 'string' && url.length > 5);
      };

      const parsedGalleries = safeParse(projectAny.galleries) || {};
      const parsedProductionPhotos = safeParse(projectAny.production_photos || projectAny.productionPhotos);
      const parsedImages = safeParse(projectAny.images);

      const heroRenderings = extractUrls(parsedGalleries.hero);
      const processImages = extractUrls(parsedGalleries.process);
      const productionImages = extractUrls(parsedProductionPhotos);

      const categoryValue = projectAny.category || projectAny.type || '';
      const isScenicCategory =
        categoryValue.includes('Scenic') ||
        ['Opera', 'Theatre', 'Dance', 'Design Documentation'].includes(categoryValue);

      const legacyImages = isScenicCategory ? [] : extractUrls(parsedImages);

      const renderings = Array.from(
        new Set([
          ...heroRenderings,
          ...legacyImages,
        ]),
      );

      const renderingsCaptions: string[] = Array.isArray(parsedGalleries.heroCaptions)
        ? parsedGalleries.heroCaptions
        : [];
      const renderingsAlt: string[] = Array.isArray(parsedGalleries.heroAlt)
        ? parsedGalleries.heroAlt
        : [];

      const productionPhotos = Array.from(
        new Set([
          ...processImages,
          ...productionImages,
        ]),
      );

      console.log('🎨 Found', renderings.length, 'renderings and', productionPhotos.length, 'production photos');

      const mappedProject: any = {
        ...projectAny,
        description: descriptionValue,
        cardImage: projectAny.card_image || projectAny.cover_image,
        coverImage: projectAny.cover_image || projectAny.card_image,
        designNotes: normalizedDesignNotes,
        projectOverview: projectAny.project_overview || projectAny.projectOverview,
        softwareUsed: projectAny.software_used || projectAny.softwareUsed,
        videoUrls: projectAny.video_urls || projectAny.videoUrls || [],
        youtubeVideos: projectAny.youtube_videos || projectAny.youtubeVideos || [],
        renderings,
        renderingsCaptions,
        renderingsAlt,
        productionPhotos,
        galleries: parsedGalleries || projectAny.galleries,
        tags: (projectAny.tags && projectAny.tags.length > 0) ? projectAny.tags : (projectAny.seo_keywords || projectAny.seoKeywords || []),
      };

      setProject(mappedProject);
      cacheProjectData(mappedProject);

      try {
        const { data: allProjects, error: projectsError } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('published', true)
          .order('year', { ascending: false })
          .order('month', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (!projectsError && allProjects) {
          const mappedProjects = allProjects.map((p: any) => ({
            ...p,
            cardImage: p.card_image || p.cover_image,
            coverImage: p.cover_image || p.card_image,
            designNotes: p.design_notes || p.designNotes,
          }));

          setAllProjects(mappedProjects);

          const sameCategory = mappedProjects.filter((p: any) => p.category === mappedProject.category);

          const currentIndex = sameCategory.findIndex((p: any) => p.slug === slug);
          if (currentIndex > -1) {
            const nextIndex = (currentIndex + 1) % sameCategory.length;
            const prevIndex = (currentIndex - 1 + sameCategory.length) % sameCategory.length;

            setNextProject(sameCategory[nextIndex]);
            setPrevProject(sameCategory[prevIndex]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch related projects:', err);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        await supabase.rpc('increment_project_view', { project_id: data.id });
      }
    } catch (error) {
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

  const handleBack = () => {
    if (!project) {
      onNavigate('portfolio');
      return;
    }

    // Map categories to their correct portfolio pages
    const categoryRouteMap: Record<string, string> = {
      'Experiential Design': 'experiential-design',
      'Rendering': 'rendering',
      'Scenic Models': 'scenic-models',
      'Scenic Design': 'portfolio',
      'Design Documentation': 'portfolio'
    };

    const route = categoryRouteMap[project.category] || 'portfolio';
    onNavigate(route);
  };

  if (loading) {
    return <SkeletonProjectDetail />;
  }

  const isDesignDoc = project && (
    project.category === 'Design Documentation' ||
    slug === 'scenic-design-archive' ||
    slug === 'scenic-models'
  );

  if (!project) {
    return (
      <>
        <SEO metadata={{ ...PAGE_METADATA['404'], noindex: true }} />
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black text-white">
          <p className="font-pixel text-sm tracking-wider opacity-60">PROJECT NOT FOUND</p>
          <button
            onClick={handleBack}
            className="px-8 py-3 backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 hover:bg-neutral-800/80 transition-all"
          >
            BACK TO PORTFOLIO
          </button>
        </div>
      </>
    );
  }

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
        <SEO metadata={seoMetadata} structuredData={structuredData} />
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
        <div className="max-w-4xl mx-auto space-y-24">
          {(() => {
            const allDocs = [
              ...(project.galleries?.hero || []).map((img: string, i: number) => ({
                url: img,
                caption: project.galleries.heroCaptions?.[i] || '',
                alt: project.galleries.heroAlt?.[i] || ''
              })),
              ...(project.galleries?.process || []).map((img: string, i: number) => ({
                url: img,
                caption: project.galleries.processCaptions?.[i] || '',
                alt: project.galleries.processAlt?.[i] || ''
              }))
            ];

            return allDocs.map((item: any, index: number) => {
              const caption = item.caption || '';
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
                    onClick={() => openLightbox(allDocs.map(d => d.url), index)}
                  >
                    <ParallaxImage
                      src={item.url}
                      alt={item.alt || title}
                      className="w-full"
                      aspectRatio="aspect-video"
                    />
                  </div>
                </article>
              );
            });
          })()}
        </div>

        {/* Related Projects Section */}
        <div className="pt-24 max-w-4xl mx-auto">
          <RelatedProjectsAdvanced
            currentProject={project}
            allProjects={allProjects}
            onNavigate={onNavigate}
          />
        </div>

        <div className="mt-24 text-center">
          <button
            onClick={handleBack}
            className="px-8 py-3 backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 hover:bg-neutral-800/80 transition-all font-pixel text-xs tracking-[0.3em]"
          >
            BACK TO PORTFOLIO
          </button>
        </div>
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4"
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

  const isScenic = project.category?.includes('Scenic');

  return (
    <div className={`min-h-screen ${isScenic ? 'bg-transparent' : 'bg-black'}`}>
      <SEO metadata={seoMetadata} structuredData={structuredData} />

      {isScenic && createPortal(
        <div className="fixed inset-0 z-[-1] bg-black">
          <ImageWithFallback
            src={project.coverImage || project.cardImage || ''}
            alt={project.title}
            className="w-full h-full object-cover"
            optimize="hero"
            priority
            responsive={true}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>,
        document.body
      )}

      {prevProject && (
        <button
          onClick={() => onNavigate(`project/${prevProject.slug}`)}
          className="fixed left-6 top-1/2 -translate-y-1/2 z-30 p-4 backdrop-blur-xl bg-neutral-900/40 rounded-full border border-white/10 hover:bg-neutral-900/80 transition-all hidden md:block group"
          aria-label={`Previous project: ${prevProject.title}`}
        >
          <ChevronLeft className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
        </button>
      )}

      {nextProject && (
        <button
          onClick={() => onNavigate(`project/${nextProject.slug}`)}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-30 p-4 backdrop-blur-xl bg-neutral-900/40 rounded-full border border-white/10 hover:bg-neutral-900/80 transition-all hidden md:block group"
          aria-label={`Next project: ${nextProject.title}`}
        >
          <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
        </button>
      )}

      <div
        className={`relative z-20 min-h-screen pb-24 px-6 md:px-12 transition-all duration-500
            ${isScenic
            ? 'bg-black/30 backdrop-blur-md'
            : 'bg-black'
          }`}
        style={{
          marginTop: '0',
          paddingTop: '22vh'
        }}
        data-nav="dark"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-8 md:p-12 shadow-none"
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

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 shadow-none"
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

          {project.designNotes && project.designNotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button
                onClick={() => toggleSection('notes')}
                className="w-full backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 text-left hover:bg-neutral-800/80 transition-all shadow-none"
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
                    className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 mt-2 shadow-none"
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

          {((project.productionPhotos && project.productionPhotos.length > 0) || (project.youtubeVideos && project.youtubeVideos.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button
                onClick={() => toggleSection('photos')}
                className="w-full backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 text-left hover:bg-neutral-800/80 transition-all shadow-none"
              >
                <div className="flex items-center justify-between">
                  <div className="font-pixel text-xs text-white/60 tracking-[0.3em]">
                    GALLERY ({project.productionPhotos?.length || 0})
                    {project.youtubeVideos?.length > 0 && ` + VIDEOS (${project.youtubeVideos.length})`}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${expandedSections.has('photos') ? 'rotate-180' : ''}`} />
                </div>
                {!expandedSections.has('photos') && (project.productionPhotos?.length > 0) && (
                  <div className="mt-4 rounded-lg overflow-hidden opacity-60">
                    <ImageWithFallback
                      src={project.productionPhotos[0]}
                      alt="Gallery preview"
                      className="w-full h-32 object-cover"
                      optimize="gallery"
                    />
                  </div>
                )}
              </button>
              <AnimatePresence>
                {expandedSections.has('photos') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 mt-2 shadow-none"
                  >
                    <div className="grid gap-8">
                      {(project.productionPhotos || []).map((image: string, index: number) => (
                        <div
                          key={`img-${index}`}
                          className="w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightbox(project.productionPhotos, index);
                          }}
                        >
                          <ImageWithFallback
                            src={image}
                            alt={`Production photo ${index + 1}`}
                            className="w-full h-auto"
                            optimize="gallery"
                          />
                        </div>
                      ))}
                      {project.youtubeVideos?.map((video: string, index: number) => (
                        <div key={`video-${index}`} className="w-full">
                          <YouTubeEmbed url={video} title={`${project.title} Video ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {project.renderings && project.renderings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 shadow-none"
            >
              <div className="font-pixel text-xs text-white/60 tracking-[0.3em] mb-4">
                RENDERINGS ({project.renderings.length})
              </div>
              <div className="w-full aspect-video min-h-[260px]">
                <ImageSlideshow
                  images={project.renderings}
                  captions={project.renderingsCaptions || project.galleries?.heroCaptions || []}
                  onImageClick={(index) => openLightbox(project.renderings, index)}
                  autoPlay
                  autoPlayInterval={4500}
                  showControls={project.renderings.length > 1}
                  mode="cover"
                />
              </div>
            </motion.div>
          )}

          {/* Related Projects Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-24"
          >
            <RelatedProjectsAdvanced
              currentProject={project}
              allProjects={allProjects}
              onNavigate={onNavigate}
            />
          </motion.div>

          <div className="mt-24 text-center">
            <button
              onClick={handleBack}
              className="px-8 py-3 backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 hover:bg-neutral-800/80 transition-all font-pixel text-xs tracking-[0.3em]"
            >
              BACK TO PORTFOLIO
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4"
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