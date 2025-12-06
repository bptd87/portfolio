// Updated: 2025-11-28 - Design system unification
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, Eye, Calendar, MapPin, Users, Share2, ChevronDown, X, Play } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ImageGallery } from '../components/shared/ImageGallery';
import { ImageSlideshow } from '../components/shared/ImageSlideshow';
import { ImageLightbox } from '../components/shared/ImageLightbox';
import { YouTubeEmbed } from '../components/shared/YouTubeEmbed';
import { LikeButton } from '../components/shared/LikeButton';
import { ShareButton } from '../components/shared/ShareButton';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface ProjectDetailProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function ProjectDetail({ slug, onNavigate }: ProjectDetailProps) {
  const [project, setProject] = useState<any>(null);
  const [nextProject, setNextProject] = useState<any>(null);
  const [prevProject, setPrevProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [designNotesExpanded, setDesignNotesExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxCaptions, setLightboxCaptions] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);
  const [relatedFilter, setRelatedFilter] = useState<'featured' | 'category' | 'tags'>('category');

  useEffect(() => {
    fetchProject();
    incrementViews();
  }, [slug]);

  const fetchProject = async () => {
    try {
      setLoading(true);

      // Fetch current project
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

      // Check if the response has the expected structure
      if (!data.success || !data.project) {
        throw new Error('Invalid project data');
      }

      setProject(data.project);

      // Fetch all projects to find next/previous
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
        // Filter by same category
        const sameCategory = allProjects.filter((p: any) => p.category === data.project.category);


        const currentIndex = sameCategory.findIndex((p: any) => p.slug === slug);
        if (currentIndex > -1) {
          const nextIndex = (currentIndex + 1) % sameCategory.length;
          const prevIndex = (currentIndex - 1 + sameCategory.length) % sameCategory.length;

          setNextProject(sameCategory[nextIndex]);
          setPrevProject(sameCategory[prevIndex]);
        } else {
        }

        // Use all projects as related projects (we'll filter in the UI)
        setRelatedProjects(allProjects);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      // First get the project to find its ID
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

  const navigateToProject = (projectSlug: string) => {
    onNavigate('project', projectSlug);
  };

  const openLightbox = (images: string[], captions: string[] = [], startIndex: number = 0) => {
    setLightboxImages(images);
    setLightboxCaptions(captions);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const previousLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm uppercase tracking-widest opacity-40">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-sm uppercase tracking-widest opacity-60">Project not found</p>
        <button
          onClick={() => onNavigate('portfolio')}
          className="px-6 py-3 border border-black/10 dark:border-white/10 hover:border-accent-brand transition-colors text-sm uppercase tracking-widest"
        >
          Back to Portfolio
        </button>
      </div>
    );
  }

  return (
    <div className="pt-8 md:pt-12 pb-16 md:pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Navigation arrows - Fixed on sides */}
      {prevProject && (
        <button
          onClick={() => navigateToProject(prevProject.slug)}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3 border border-black/10 dark:border-white/10 bg-white dark:bg-black hover:border-accent-brand transition-all group hidden md:block"
          aria-label="Previous project"
        >
          <ChevronLeft className="w-6 h-6 group-hover:text-accent-brand transition-colors" />
        </button>
      )}

      {nextProject && (
        <button
          onClick={() => navigateToProject(nextProject.slug)}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 p-3 border border-black/10 dark:border-white/10 bg-white dark:bg-black hover:border-accent-brand transition-all group hidden md:block"
          aria-label="Next project"
        >
          <ChevronRight className="w-6 h-6 group-hover:text-accent-brand transition-colors" />
        </button>
      )}

      {/* Header */}
      <div className="border-b border-black/10 dark:border-white/10 pb-12 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <p className="text-xs uppercase tracking-widest opacity-60 mb-6">
            {project.category} / {project.subcategory}
          </p>
          <h1 className="text-5xl md:text-6xl mb-8">{project.title}</h1>

          {/* Project metadata */}
          <div className="flex flex-wrap gap-6 text-sm opacity-60 mb-8">
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
            {project.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{project.location}</span>
              </div>
            )}
          </div>

          {/* Engagement */}
          <div className="flex items-center gap-6 pt-6 border-t border-black/10 dark:border-white/10">
            <LikeButton projectId={project.id} initialLikes={project.likes || 0} size="md" showCount={true} />
            <div className="flex items-center gap-2 opacity-60">
              <Eye className="w-5 h-5" />
              <span>{(project.views || 0).toLocaleString()} views</span>
            </div>
            <ShareButton
              title={`${project.title} - Brandon PT Davis`}
              description={`${project.venue} · ${project.year}`}
              size="md"
            />
          </div>
        </motion.div>
      </div>

      {/* SCENIC DESIGN LAYOUT - Editorial Split-Screen */}
      {project.category === 'Scenic Design' && (
        <div className="space-y-16">
          {/* Editorial Layout: Images (75%) + Sidebar (25%) */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-12">
            {/* LEFT: Renderings + Production Photos - Stacked vertically (75%) */}
            <div className="space-y-12">
              {/* Renderings - Slideshow Gallery */}
              {project.galleries?.hero && project.galleries.hero.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-6">RENDERINGS</h3>
                  <ImageSlideshow
                    images={project.galleries.hero}
                    captions={project.galleries.heroCaptions}
                  />
                </motion.div>
              )}

              {/* Production Photos */}
              {project.galleries?.process && project.galleries.process.length > 0 && (
                <div className="space-y-8">
                  <h3 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40">PRODUCTION PHOTOGRAPHY</h3>
                  <div className="space-y-6">
                    {project.galleries.process.map((image: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden cursor-pointer group"
                        onClick={() => openLightbox(project.galleries.process, project.galleries.processCaptions, index)}
                      >
                        <img
                          src={image}
                          alt={project.galleries.processCaptions?.[index] || `Production photo ${index + 1}`}
                          className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                        />
                        {project.galleries.processCaptions?.[index] && (
                          <p className="p-4 text-sm opacity-60 border-t border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                            {project.galleries.processCaptions[index]}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Videos */}
              {project.youtubeVideos && project.youtubeVideos.length > 0 && (
                <div className="space-y-8">
                  <h3 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40">VIDEOS</h3>
                  <div className="space-y-6">
                    {project.youtubeVideos.map((video: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <YouTubeEmbed url={video} title={`${project.title} - Video ${index + 1}`} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags below production photos */}
              {project.tags && project.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-8 border-t border-black/10 dark:border-white/10"
                >
                  <h3 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-4">TAGS</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full font-pixel text-[10px] tracking-[0.3em] border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:border-accent-brand hover:text-accent-brand transition-all"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* RIGHT: Sticky Sidebar - Design Notes & Creative Team (25%) */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-8 h-fit">
              {/* Design Notes - Expandable */}
              {project.designNotes && project.designNotes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-4">DESIGN NOTES</h3>
                  <div className="space-y-4 opacity-80 leading-relaxed">
                    {designNotesExpanded ? (
                      // Show all notes when expanded
                      project.designNotes.map((note: string, index: number) => (
                        <p key={index}>{note}</p>
                      ))
                    ) : (
                      // Show only first note when collapsed
                      <p>{project.designNotes[0]}</p>
                    )}
                    {project.designNotes.length > 1 && (
                      <button
                        onClick={() => setDesignNotesExpanded(!designNotesExpanded)}
                        className="flex items-center gap-2 font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 hover:text-accent-brand transition-all"
                      >
                        {designNotesExpanded ? 'SHOW LESS' : 'READ MORE'}
                        <ChevronDown className={`w-4 h-4 transition-transform ${designNotesExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Creative Team */}
              {project.credits && project.credits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <h3 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-4">CREATIVE TEAM</h3>
                  <div className="space-y-4">
                    {project.credits.map((credit: any, index: number) => (
                      <div key={index} className="border-l-2 border-black/10 dark:border-white/10 pl-4">
                        <p className="text-xs uppercase tracking-widest opacity-40 mb-1">{credit.role}</p>
                        <p className="opacity-80">{credit.name}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXPERIENTIAL DESIGN LAYOUT - Blog-style mixed content */}
      {project.category === 'Experiential Design' && (
        <div className="space-y-20">
          {/* Agency-style Hero Stats */}
          {(project.metrics || project.challenge || project.clientName) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {project.clientName && (
                  <div className="backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl overflow-hidden p-6 border border-white/10">
                    <div className="font-pixel text-[10px] tracking-[0.3em] text-white/40 mb-2">CLIENT</div>
                    <div className="text-2xl text-white">{project.clientName}</div>
                  </div>
                )}
                {project.role && (
                  <div className="backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl overflow-hidden p-6 border border-white/10">
                    <div className="font-pixel text-[10px] tracking-[0.3em] text-white/40 mb-2">ROLE</div>
                    <div className="text-2xl text-white">{project.role}</div>
                  </div>
                )}
                {project.duration && (
                  <div className="backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl overflow-hidden p-6 border border-white/10">
                    <div className="font-pixel text-[10px] tracking-[0.3em] text-white/40 mb-2">TIMELINE</div>
                    <div className="text-2xl text-white">{project.duration}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Challenge Section */}
          {project.challenge && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-6">
                <h2 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-4">THE CHALLENGE</h2>
                <h3 className="font-display italic text-3xl md:text-4xl text-black dark:text-white leading-tight">
                  {project.challenge}
                </h3>
              </div>
            </motion.div>
          )}

          {/* Solution/Overview Section */}
          {project.solution && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-6">OUR APPROACH</h2>
              <div className="text-lg text-black/80 dark:text-white/80 leading-relaxed space-y-4">
                {project.solution.split('\n\n').map((paragraph: string, idx: number) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Key Features/Highlights with Glass Cards */}
          {project.keyFeatures && project.keyFeatures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <h2 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-8">KEY FEATURES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.keyFeatures.map((feature: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="backdrop-blur-xl bg-neutral-100/60 dark:bg-neutral-900/60 rounded-3xl overflow-hidden p-8 border border-black/10 dark:border-white/10"
                  >
                    <h3 className="font-display italic text-xl mb-3 text-black dark:text-white">{feature.title}</h3>
                    <p className="text-black/70 dark:text-white/70 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Process Section - Timeline style */}
          {project.process && project.process.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-12">PROCESS</h2>
              <div className="space-y-12">
                {project.process.map((step: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex gap-8 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full backdrop-blur-xl bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center font-pixel text-sm group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 pb-8 border-l border-black/10 dark:border-white/10 pl-8 -ml-6">
                      <h3 className="font-display italic text-xl mb-3 text-black dark:text-white">{step.title}</h3>
                      <p className="text-black/70 dark:text-white/70 leading-relaxed mb-4">{step.description}</p>
                      {step.image && (
                        <div className="rounded-3xl overflow-hidden border border-black/10 dark:border-white/10">
                          <ImageWithFallback
                            src={step.image}
                            alt={step.title}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Main Content Blocks (existing blog-style content) */}
          {project.content && project.content.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-12">
              {project.content.map((block: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {/* Text block */}
                  {block.type === 'text' && (
                    <div className="space-y-4 text-black/80 dark:text-white/80 leading-relaxed">
                      {block.content.split('\n\n').map((paragraph: string, pIndex: number) => (
                        <p key={pIndex}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {/* Image block */}
                  {block.type === 'image' && (
                    <div className="rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden">
                      <ImageWithFallback
                        src={block.src}
                        alt={block.caption || ''}
                        className="w-full h-auto"
                      />
                      {block.caption && (
                        <p className="p-4 text-sm text-black/60 dark:text-white/60 border-t border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                          {block.caption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Image gallery block */}
                  {block.type === 'gallery' && (
                    <ImageGallery
                      images={block.images}
                      captions={block.captions}
                      layout={block.layout || 'grid'}
                    />
                  )}

                  {/* Heading block */}
                  {block.type === 'heading' && (
                    <h2 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 pt-8">
                      {block.content}
                    </h2>
                  )}

                  {/* YouTube video block */}
                  {block.type === 'youtube' && (
                    <YouTubeEmbed
                      url={block.videoId}
                      title={block.title}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Team/Collaborators Section */}
          {project.team && project.team.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-5xl mx-auto"
            >
              <h2 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-8">TEAM & COLLABORATORS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {project.team.map((member: any, idx: number) => (
                  <div
                    key={idx}
                    className="backdrop-blur-xl bg-neutral-100/60 dark:bg-neutral-900/60 rounded-3xl overflow-hidden p-6 border border-black/10 dark:border-white/10"
                  >
                    <div className="text-black dark:text-white font-medium mb-1">{member.name}</div>
                    <div className="text-sm text-black/60 dark:text-white/60">{member.role}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results/Impact with Metrics */}
          {project.metrics && project.metrics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="max-w-5xl mx-auto"
            >
              <h2 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-8">IMPACT & RESULTS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {project.metrics.map((metric: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    className="backdrop-blur-xl bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 dark:from-neutral-800/80 dark:to-neutral-900/80 rounded-3xl overflow-hidden p-8 border border-white/10 text-center"
                  >
                    <div className="text-4xl md:text-5xl text-white mb-2 font-display">{metric.value}</div>
                    <div className="font-pixel text-[10px] tracking-[0.3em] text-white/60">{metric.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Testimonial/Quote */}
          {project.testimonial && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="backdrop-blur-xl bg-neutral-100/60 dark:bg-neutral-900/60 rounded-3xl overflow-hidden p-12 border border-black/10 dark:border-white/10">
                <div className="font-display text-2xl md:text-3xl text-black dark:text-white italic mb-6 leading-relaxed">
                  "{project.testimonial.quote}"
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium text-black dark:text-white">{project.testimonial.author}</div>
                    <div className="text-sm text-black/60 dark:text-white/60">{project.testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Next/Previous navigation - Mobile bottom nav */}
      <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/10 flex gap-4 md:hidden">
        {prevProject && (
          <button
            onClick={() => navigateToProject(prevProject.slug)}
            className="flex-1 p-4 rounded-3xl border border-black/10 dark:border-white/10 hover:border-accent-brand transition-colors text-left"
          >
            <p className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">PREVIOUS</p>
            <p className="font-display italic">{prevProject.title}</p>
          </button>
        )}
        {nextProject && (
          <button
            onClick={() => navigateToProject(nextProject.slug)}
            className="flex-1 p-4 rounded-3xl border border-black/10 dark:border-white/10 hover:border-accent-brand transition-colors text-right"
          >
            <p className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">NEXT</p>
            <p className="font-display italic">{nextProject.title}</p>
          </button>
        )}
      </div>

      {/* Featured Work / More Portfolio */}
      {relatedProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24 pt-16 border-t border-black/10 dark:border-white/10"
        >
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display italic text-2xl mb-2">Featured Work</h2>
              <p className="text-sm opacity-60">Theatrical design and digital innovation</p>
            </div>
            <button
              onClick={() => onNavigate('portfolio')}
              className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 hover:text-accent-brand transition-all flex items-center gap-2"
            >
              VIEW ALL
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8 border-b border-black/10 dark:border-white/10">
            <button
              onClick={() => setRelatedFilter('category')}
              className={`pb-3 font-pixel text-[10px] tracking-[0.3em] transition-all ${relatedFilter === 'category'
                ? 'text-accent-brand border-b-2 border-accent-brand'
                : 'text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70'
                }`}
            >
              SAME CATEGORY
            </button>
            <button
              onClick={() => setRelatedFilter('tags')}
              className={`pb-3 font-pixel text-[10px] tracking-[0.3em] transition-all ${relatedFilter === 'tags'
                ? 'text-accent-brand border-b-2 border-accent-brand'
                : 'text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70'
                }`}
            >
              SIMILAR TAGS
            </button>
            <button
              onClick={() => setRelatedFilter('featured')}
              className={`pb-3 font-pixel text-[10px] tracking-[0.3em] transition-all ${relatedFilter === 'featured'
                ? 'text-accent-brand border-b-2 border-accent-brand'
                : 'text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70'
                }`}
            >
              FEATURED PROJECTS
            </button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProjects
              .filter((p: any) => {
                if (p.slug === slug) return false; // Don't show current project
                if (relatedFilter === 'featured') return p.featured;
                if (relatedFilter === 'category') return p.category === project.category;
                if (relatedFilter === 'tags') {
                  return project.tags && p.tags && p.tags.some((tag: string) => project.tags.includes(tag));
                }
                return true;
              })
              .slice(0, 3)
              .map((relatedProject: any, index: number) => (
                <motion.div
                  key={relatedProject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigateToProject(relatedProject.slug)}
                  className="group cursor-pointer rounded-3xl border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-black/5 dark:bg-white/5 overflow-hidden">
                    {relatedProject.cardImage && (
                      <img
                        src={relatedProject.cardImage}
                        alt={relatedProject.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">
                      {relatedProject.subcategory}
                    </p>
                    <h3 className="font-display italic mb-2 group-hover:text-accent-brand transition-colors">
                      {relatedProject.title}
                    </h3>
                    <p className="text-sm opacity-60">{relatedProject.venue} · {relatedProject.year}</p>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Show message if no projects match filter */}
          {relatedProjects.filter((p: any) => {
            if (p.slug === slug) return false;
            if (relatedFilter === 'featured') return p.featured;
            if (relatedFilter === 'category') return p.category === project.category;
            if (relatedFilter === 'tags') {
              return project.tags && p.tags && p.tags.some((tag: string) => project.tags.includes(tag));
            }
            return true;
          }).length === 0 && (
              <div className="text-center py-12 opacity-40">
                <p className="text-sm">No related projects found</p>
              </div>
            )}
        </motion.div>
      )}

      {/* Bottom Navigation Panel - Scenic Design Projects */}
      {(prevProject || nextProject) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 pt-8 border-t border-black/10 dark:border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-pixel text-xs tracking-[0.3em] uppercase text-black/60 dark:text-white/60">
              More Scenic Designs
            </h3>
            <div className="flex gap-2">
              {prevProject && (
                <button
                  onClick={() => navigateToProject(prevProject.slug)}
                  className="p-2 border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all rounded-full"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {nextProject && (
                <button
                  onClick={() => navigateToProject(nextProject.slug)}
                  className="p-2 border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all rounded-full"
                  aria-label="Next project"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Project cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {prevProject && (
              <motion.button
                onClick={() => navigateToProject(prevProject.slug)}
                className="group relative aspect-square rounded-lg overflow-hidden border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <ImageWithFallback
                  src={prevProject.cardImage || prevProject.coverImage || ''}
                  alt={prevProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all" />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs">
                  {prevProject.title}
                </div>
              </motion.button>
            )}

            {nextProject && (
              <motion.button
                onClick={() => navigateToProject(nextProject.slug)}
                className="group relative aspect-square rounded-lg overflow-hidden border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <ImageWithFallback
                  src={nextProject.cardImage || nextProject.coverImage || ''}
                  alt={nextProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all" />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs">
                  {nextProject.title}
                </div>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Back to portfolio */}
      <div className="mt-12 text-center">
        <button
          onClick={() => onNavigate('portfolio', project.category === 'Scenic Design' ? 'scenic' : 'experiential')}
          className="px-8 py-3 rounded-3xl border border-black/10 dark:border-white/10 hover:border-accent-brand transition-colors font-pixel text-[10px] tracking-[0.3em]"
        >
          BACK TO PORTFOLIO
        </button>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <ImageLightbox
            images={lightboxImages}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onNext={nextLightboxImage}
            onPrevious={previousLightboxImage}
            captions={lightboxCaptions}
          />
        )}
      </AnimatePresence>
    </div>
  );
}