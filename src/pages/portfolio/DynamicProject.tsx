import { useState, useEffect } from 'react';
import { ArrowLeft, Theater, Sparkles, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { LikeButton } from '../../components/shared/LikeButton';
import { ShareButton } from '../../components/shared/ShareButton';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ExperientialTemplate } from './ExperientialTemplate';
import { RenderingTemplate } from './RenderingTemplate';
import { PageLoader } from '../../components/PageLoader';
import { SEO } from '../../components/shared/SEO';

interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  venue: string;
  location: string;
  year: number;
  month?: number;
  description: string;
  cardImage?: string;
  renderings?: Array<{ url: string; caption?: string }>;
  productionPhotos?: Array<{ url: string; caption?: string }>;
  credits: Array<{ role: string; name: string }>;
  designNotes?: string[];
  views?: number;
  likes?: number;
}

interface DynamicProjectProps {
  slug: string;
  onNavigate: (page: string, filter?: string) => void;
}

export function DynamicProject({ slug, onNavigate }: DynamicProjectProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);

  // Fetch project from database
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${slug}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        const data = await response.json();

        if (data.success && data.project) {
          setProject(data.project);
          setViews(data.project.views || 0);
          setLikes(data.project.likes || 0);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    fetchProject();
  }, [slug]);

  // Force-fetch live counts to ensure no stale data
  useEffect(() => {
    if (!project?.id) return;

    const fetchLiveCounts = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const { projectId: sbProjectId, publicAnonKey: sbAnonKey } = await import('../../utils/supabase/info');
        const supabase = createClient(`https://${sbProjectId}.supabase.co`, sbAnonKey);

        const { data } = await supabase
          .from('portfolio_projects')
          .select('views, likes')
          .eq('id', project.id)
          .single();

        if (data) {
          setViews(data.views || 0);
          setLikes(data.likes || 0);
        }
      } catch (e) {
        // ignore
      }
    };

    fetchLiveCounts();
  }, [project?.id]);

  // Track view on page load
  useEffect(() => {
    if (!project) return;

    const incrementView = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${project.id}/view`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        const data = await response.json();
        if (data.success) {
          setViews(data.views);
          setLikes(data.likes);
        }
      } catch (err) {
      }
    };

    incrementView();
  }, [project]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedPhoto === null || !allImages.length) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedPhoto((prev) =>
          prev === null ? 0 : (prev - 1 + allImages.length) % allImages.length
        );
      } else if (e.key === 'ArrowRight') {
        setSelectedPhoto((prev) =>
          prev === null ? 0 : (prev + 1) % allImages.length
        );
      } else if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  // Auto-advance carousel
  useEffect(() => {
    if (!project?.renderings || project.renderings.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (project.renderings?.length || 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [project?.renderings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <PageLoader />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
          <button
            onClick={() => onNavigate('portfolio')}
            className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border hover:border-accent-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs tracking-wider">BACK TO PORTFOLIO</span>
          </button>
          <div className="text-center py-20">
            <p className="opacity-60">{error || 'Project not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const allImages = [
    ...(project.renderings || []),
    ...(project.productionPhotos || []),
  ];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % (project.renderings?.length || 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + (project.renderings?.length || 1)) % (project.renderings?.length || 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };



  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {project && (
        <SEO
          title={project.title}
          description={project.description}
          image={project.cardImage || project.renderings?.[0]?.url}
          keywords={[project.category, project.subcategory, 'Scenic Design', 'Theatre']}
        />
      )}
      {/* Hero Carousel */}
      {project.renderings && project.renderings.length > 0 && (
        <div className="relative h-[60vh] bg-black overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={project.renderings[currentIndex]?.url}
              alt={project.renderings[currentIndex]?.caption || `${project.title} - Image ${currentIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>

          {project.renderings.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {project.renderings.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {project.renderings.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 transition-all duration-300 ${index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                    }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => onNavigate('portfolio')}
            className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 transition-all duration-300 z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO PORTFOLIO
          </button>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">

        {/* Project Header */}
        <div className="border-b border-black/10 dark:border-white/10 pb-12 mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="px-3 py-1.5 bg-secondary border border-border text-xs tracking-wider text-muted-foreground uppercase">
              {project.category}
            </span>
            <span className="px-3 py-1.5 bg-secondary border border-border text-xs tracking-wider text-muted-foreground uppercase">
              {project.subcategory}
            </span>
          </div>

          <h1 className="mb-6 text-black dark:text-white">
            {project.title}
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl leading-relaxed mb-12">
            {project.description}
          </p>

          {/* Engagement Bar */}
          <div className="flex items-center justify-between mb-12 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-6">
              <LikeButton projectId={project.id} initialLikes={likes} size="lg" />

              <div className="flex items-center gap-2 text-sm tracking-wide opacity-60">
                <Eye className="w-5 h-5" />
                <span>{views.toLocaleString()} views</span>
              </div>
            </div>

            <ShareButton
              title={`${project.title} - Brandon PT Davis`}
              description={project.description}
              size="lg"
            />
          </div>

          {/* Project Info Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary border border-border p-4">
              <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Venue</p>
              <p className="text-black dark:text-white">{project.venue}</p>
            </div>
            <div className="bg-secondary border border-border p-4">
              <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Location</p>
              <p className="text-black dark:text-white">{project.location}</p>
            </div>
            <div className="bg-secondary border border-border p-4">
              <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Category</p>
              <p className="text-black dark:text-white">{project.subcategory}</p>
            </div>
            <div className="bg-secondary border border-border p-4">
              <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Date</p>
              <p className="text-black dark:text-white">
                {project.month && new Date(0, project.month - 1).toLocaleString('default', { month: 'long' })} {project.year}
              </p>
            </div>
          </div>
        </div>

        {/* EXPERIENTIAL DESIGN TEMPLATE */}
        {project.category === 'Experiential Design' && (
          <ExperientialTemplate project={project as any} />
        )}

        {/* RENDERING TEMPLATE */}
        {(project.category === 'Rendering & Visualization' || project.category === 'Rendering') && (
          <RenderingTemplate project={{
            title: project.title,
            client: project.venue,
            softwareUsed: ['Vectorworks', 'Adobe Creative Suite'], // Default, should come from DB
            description: project.description,
            projectOverview: project.description,
            galleries: [
              ...(project.renderings && project.renderings.length > 0 ? [{
                heading: 'Concept Renderings',
                description: '',
                images: project.renderings.map(r => ({ url: r.url, caption: r.caption || '' })),
                layout: project.renderings.length === 1 ? '1-col' as const : '2-col' as const
              }] : []),
              ...(project.productionPhotos && project.productionPhotos.length > 0 ? [{
                heading: 'Production Photos',
                description: '',
                images: project.productionPhotos.map(p => ({ url: p.url, caption: p.caption || '' })),
                layout: '2-col' as const
              }] : [])
            ]
          }} />
        )}

        {/* SCENIC DESIGN / OTHER TEMPLATES */}
        {project.category !== 'Experiential Design' && project.category !== 'Rendering & Visualization' && project.category !== 'Rendering' && (
          <>
            {/* Design Notes Section */}
            {project.designNotes && project.designNotes.length > 0 && (
              <section className="mb-20 md:mb-24">
                <div className="mb-10">
                  <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Project Notes</h2>
                  <div className="space-y-6 max-w-3xl">
                    {project.designNotes.map((note, index) => (
                      <p key={index} className="text-lg text-black/80 dark:text-white/80 leading-relaxed">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            )} 
            
            {/* Credits Section */}
            {project.credits && project.credits.length > 0 && (
              <section className="mb-20 md:mb-24">
                <div className="mb-10">
                  <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Production Credits</h2>
                  <h3 className="text-black dark:text-white mb-6">
                    Creative Team
                  </h3>
                </div>

                <div className="bg-secondary border border-border p-6 md:p-8">
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.credits.map((credit, index) => (
                      <div key={index} className="flex gap-4">
                        <span className="text-black/40 dark:text-white/40 min-w-[140px]">{credit.role}</span>
                        <span className="text-black dark:text-white">{credit.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Image Gallery */}
            {allImages.length > 0 && (
              <section className="mb-20 md:mb-24">
                <div className="mb-10">
                  <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Visual Documentation</h2>
                  <h3 className="text-black dark:text-white mb-6">
                    Project Images
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhoto(index)}
                      className="group aspect-[3/2] overflow-hidden border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300"
                    >
                      <img
                        src={image.url}
                        alt={image.caption || `${project.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Related Projects Navigation */}
        <div className="border-t border-black/10 dark:border-white/10 pt-16">
          <div className="mb-10">
            <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-2 uppercase">Explore More</h2>
            <p className="text-xl md:text-2xl text-black/80 dark:text-white/80">Continue browsing the portfolio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigate('portfolio', 'scenic')}
              className="group border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-1"
            >
              <Theater className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-accent-brand flex-shrink-0 transition-colors duration-300" />
              <p className="text-sm text-black dark:text-white tracking-wide">Scenic Design</p>
            </button>

            <button
              onClick={() => onNavigate('portfolio', 'experiential')}
              className="group border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-1"
            >
              <Sparkles className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-accent-brand flex-shrink-0 transition-colors duration-300" />
              <p className="text-sm text-black dark:text-white tracking-wide">Experiential Design</p>
            </button>

            <button
              onClick={() => onNavigate('portfolio', 'rendering')}
              className="group border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-1"
            >
              <Eye className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-accent-brand flex-shrink-0 transition-colors duration-300" />
              <p className="text-sm text-black dark:text-white tracking-wide">Rendering & Visualization</p>
            </button>

            <button
              onClick={() => onNavigate('portfolio', 'documentation')}
              className="group border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-1"
            >
              <FileText className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-accent-brand flex-shrink-0 transition-colors duration-300" />
              <p className="text-sm text-black dark:text-white tracking-wide">Design Documentation</p>
            </button>
          </div>
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="!max-w-none !w-screen !h-screen !p-0 !border-0 !rounded-none bg-black flex flex-col items-center justify-center">
            <DialogTitle className="sr-only">
              Image {selectedPhoto !== null ? selectedPhoto + 1 : ''}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Full-size view of {project.title}
            </DialogDescription>

            <div className="flex-1 w-full flex items-center justify-center pt-20">
              <AnimatePresence mode="wait">
                {selectedPhoto !== null && (
                  <motion.img
                    key={selectedPhoto}
                    src={allImages[selectedPhoto]?.url}
                    alt={allImages[selectedPhoto]?.caption || `${project.title} - Image ${selectedPhoto + 1}`}
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto((prev) =>
                    prev === null ? 0 : (prev - 1 + allImages.length) % allImages.length
                  );
                }}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 pointer-events-auto"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto((prev) =>
                    prev === null ? 0 : (prev + 1) % allImages.length
                  );
                }}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 pointer-events-auto"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
              {selectedPhoto !== null && `${selectedPhoto + 1} / ${allImages.length}`}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}