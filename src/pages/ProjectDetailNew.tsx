import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, Eye, Calendar, MapPin, ChevronDown, X, Share2 } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { YouTubeEmbed } from '../components/shared/YouTubeEmbed';
import { LikeButton } from '../components/shared/LikeButton';
import { ShareButton } from '../components/shared/ShareButton';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SEO } from '../components/SEO';
import { generateProjectMetadata } from '../utils/seo/metadata';
import { generateCreativeWorkSchema } from '../utils/seo/structured-data';

interface ProjectDetailNewProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function ProjectDetailNew({ slug, onNavigate }: ProjectDetailNewProps) {
  const [project, setProject] = useState<any>(null);
  const [nextProject, setNextProject] = useState<any>(null);
  const [prevProject, setPrevProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['photos', 'team'])); // Default to photos and team open
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Transition image from home page
  const [transitionImage, setTransitionImage] = useState<string | null>(null);
  const [transitionFocusPoint, setTransitionFocusPoint] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const hasTransitioned = useRef(false);

  const { scrollY } = useScroll();
  // Removed parallax transforms for simpler design

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
      } catch (e) {}
      sessionStorage.removeItem('transitionFocusPoint');
    }
  }, []);

  useEffect(() => {
    fetchProject();
    incrementViews();
  }, [slug]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${slug}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      
      if (!data.success || !data.project) throw new Error('Invalid project data');
      
      // Check if category includes "Experiential"
      if (data.project.category && data.project.category.includes('Experiential')) {
        setProject({ ...data.project, useExperientialTemplate: true });
      } 
      // Check if category includes "Rendering" or "Visualization"
      else if (data.project.category && (data.project.category.includes('Rendering') || data.project.category.includes('Visualization'))) {
        setProject({ ...data.project, useRenderingTemplate: true });
      } else {
        setProject(data.project);
      }

      // Fetch all projects for navigation
      const allProjectsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (allProjectsResponse.ok) {
        const allProjectsData = await allProjectsResponse.json();
        const allProjects = allProjectsData.success ? allProjectsData.projects : [];
        const sameCategory = allProjects.filter((p: any) => p.category === data.project.category);
        
        const currentIndex = sameCategory.findIndex((p: any) => p.slug === slug);
        if (currentIndex > -1) {
          const nextIndex = (currentIndex + 1) % sameCategory.length;
          const prevIndex = (currentIndex - 1 + sameCategory.length) % sameCategory.length;
          
          setNextProject(sameCategory[nextIndex]);
          setPrevProject(sameCategory[prevIndex]);
        }
      }
    } catch (error) {
      // Error fetching related projects
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${slug}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.project && data.project.id) {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${data.project.id}/view`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
        }
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

  if (loading) {
    return (
      <div className="min-h-screen relative">
        {/* Show transition image while loading for seamless experience */}
        {transitionImage && (
          <motion.div 
            className="fixed inset-0 z-0"
            initial={{ scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <img
              src={transitionImage}
              alt="Loading..."
              className="w-full h-full object-cover"
              style={{
                objectPosition: `${transitionFocusPoint.x}% ${transitionFocusPoint.y}%`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          </motion.div>
        )}
        <div className="fixed inset-0 flex items-center justify-center z-10">
          <motion.div 
            className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
        </div>
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
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {nextProject && (
        <button
          onClick={() => onNavigate(`project/${nextProject.slug}`)}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-50 p-4 backdrop-blur-xl bg-neutral-800/80 dark:bg-neutral-900/80 rounded-full border border-white/10 hover:bg-neutral-800/90 transition-all hidden md:block"
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
              {project.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{project.venue}</span>
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
                    <div className="space-y-4 text-white/80 leading-relaxed">
                      {project.designNotes.map((note: string, index: number) => (
                        <p key={index}>{note}</p>
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
                        <ImageWithFallback 
                          src={image} 
                          alt={project.galleries.heroCaptions?.[index] || `Rendering ${index + 1}`}
                          className="w-full h-auto block transition-transform duration-700 group-hover:scale-110"
                        />
                        {project.galleries.heroCaptions?.[index] && (
                          <p className="p-4 text-sm text-white/60">
                            {project.galleries.heroCaptions[index]}
                          </p>
                        )}
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
                        <ImageWithFallback 
                          src={image} 
                          alt={project.galleries.processCaptions?.[index] || `Photo ${index + 1}`}
                          className="w-full h-auto block transition-transform duration-700 group-hover:scale-110"
                        />
                        {project.galleries.processCaptions?.[index] && (
                          <p className="p-4 text-sm text-white/60">
                            {project.galleries.processCaptions[index]}
                          </p>
                        )}
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
          {(prevProject || nextProject) && (
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
              <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-4 md:auto-rows-[320px]">
                {prevProject && (
                  <motion.div
                    layout
                    onClick={() => onNavigate(`project/${prevProject.slug}`)}
                    className="group relative overflow-hidden rounded-2xl bg-neutral-900 cursor-pointer"
                  >
                    <motion.div
                      layoutId={`project-image-prev-${prevProject.id}`}
                      className="w-full h-full"
                    >
                      <ImageWithFallback
                        src={prevProject.cardImage || prevProject.coverImage || ''}
                        alt={prevProject.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute inset-0 border border-white/10 group-hover:border-white/40 transition-all rounded-2xl pointer-events-none" />
                  </motion.div>
                )}

                {nextProject && (
                  <motion.div
                    layout
                    onClick={() => onNavigate(`project/${nextProject.slug}`)}
                    className="group relative overflow-hidden rounded-2xl bg-neutral-900 cursor-pointer"
                  >
                    <motion.div
                      layoutId={`project-image-next-${nextProject.id}`}
                      className="w-full h-full"
                    >
                      <ImageWithFallback
                        src={nextProject.cardImage || nextProject.coverImage || ''}
                        alt={nextProject.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute inset-0 border border-white/10 group-hover:border-white/40 transition-all rounded-2xl pointer-events-none" />
                  </motion.div>
                )}
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
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
                  }}
                  className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
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