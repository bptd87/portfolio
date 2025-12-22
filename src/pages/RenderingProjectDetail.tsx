import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, MapPin, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { SEO } from '../components/SEO';
import { LikeButton } from '../components/shared/LikeButton';
import { ShareButton } from '../components/shared/ShareButton';
import { apiCall } from '../utils/api';
import { RenderingTemplate } from './portfolio/RenderingTemplate';
import { useImageColors } from '../hooks/useImageColors';
import { createClient } from '../utils/supabase/client';

interface RenderingProjectDetailProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function RenderingProjectDetail({ slug, onNavigate }: RenderingProjectDetailProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nextProject, setNextProject] = useState<any>(null);
  const [prevProject, setPrevProject] = useState<any>(null);
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);

  // Extract dominant colors from card image for adaptive gradient
  const colors = useImageColors(project?.cardImage);

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`/api/projects/${slug}`);

      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();

      if (!data.success || !data.project) throw new Error('Invalid project data');
      setProject(data.project);

      // Increment view count
      try {
        const viewResponse = await apiCall(`/api/projects/${data.project.id}/view`, { method: 'POST' });
        if (viewResponse.ok) {
          const viewData = await viewResponse.json();
          if (viewData.success && viewData.views !== undefined) {
            // Update the project object with new view count
            setProject((prev: any) => ({ ...prev, views: viewData.views }));
          }
        }
      } catch (err) { }

      // Fetch adjacent projects (direct from Supabase)
      try {
        const supabase = createClient();
        const { data: allProjects, error: projectsError } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('published', true)
          .order('year', { ascending: false });

        if (!projectsError && allProjects) {
          // Map database fields to frontend format
          const mappedProjects = allProjects.map((p: any) => ({
            ...p,
            cardImage: p.card_image || p.cover_image,
            coverImage: p.cover_image || p.card_image,
          }));

          console.log('🔍 All projects fetched:', mappedProjects.length);

          // Filter for rendering projects (case-insensitive, partial match)
          const sameCategory = mappedProjects.filter((p: any) => {
            const cat = (p.category || '').toLowerCase();
            return cat.includes('rendering') || cat.includes('visualization');
          });
          console.log('🔍 Same category (Rendering/Visualization) projects:', sameCategory.length, sameCategory.map((p: any) => ({ title: p.title, category: p.category })));

          const currentIndex = sameCategory.findIndex((p: any) => p.slug === slug);
          console.log('🔍 Current index:', currentIndex);

          if (currentIndex > -1 && sameCategory.length > 1) {
            const nextIndex = (currentIndex + 1) % sameCategory.length;
            const prevIndex = (currentIndex - 1 + sameCategory.length) % sameCategory.length;
            console.log('🔍 Setting prev:', sameCategory[prevIndex]?.title, 'next:', sameCategory[nextIndex]?.title);
            setNextProject(sameCategory[nextIndex]);
            setPrevProject(sameCategory[prevIndex]);

            // Get up to 3 related projects (excluding current)
            const otherProjects = sameCategory.filter((p: any) => p.slug !== slug);
            setRelatedProjects(otherProjects.slice(0, 3));
          } else {
            console.log('⚠️ Only one Rendering project found, no prev/next navigation available');
          }
        }
      } catch (err) {
        console.error('Failed to fetch related projects:', err);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform project data to match RenderingTemplate format
  const renderingData = useMemo(() => {
    if (!project) return null;

    const hasGalleryImages = (project.galleries?.hero && project.galleries.hero.length > 0) ||
      (project.galleries?.additional && project.galleries.additional.length > 0);

    return {
      title: project.title,
      // Meta fields
      client: project.clientName || project.client,
      venue: project.venue,
      location: project.location,
      year: project.year,
      // Tags are for SEO, softwareUsed is for software
      tags: project.tags || [],
      softwareUsed: project.softwareUsed || project.software_used || [],
      // Content
      description: project.description,
      projectOverview: project.projectOverview || project.project_overview || [project.description, ...(project.designNotes || [])].join('\n\n'),
      galleries: [
        // Hero gallery (first)
        ...(!hasGalleryImages && project.cardImage ? [{
          heading: '',
          description: '',
          images: [{ url: project.cardImage, caption: '' }],
          layout: '1-col' as const
        }] : []),
        ...(project.galleries?.hero && project.galleries.hero.length > 0 ? [{
          heading: 'Final Renders',
          description: '',
          images: project.galleries.hero.map((url: string) => ({ url, caption: '' })),
          layout: '1-col' as const
        }] : []),
        // Additional galleries
        ...(project.galleries?.additional || []).map((gallery: any) => ({
          heading: gallery.title || 'Gallery',
          description: gallery.description || '',
          images: gallery.images?.map((img: any) => ({
            url: typeof img === 'string' ? img : img.url,
            caption: typeof img === 'string' ? '' : (img.caption || '')
          })) || [],
          layout: (gallery.layout || '2-col') as '1-col' | '2-col' | '3-col' | 'masonry'
        })),
      ],
      // Process as separate array (not a gallery)
      process: project.process || [],
      videoUrls: project.videoUrls || [],
      credits: project.credits || [],
    };
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project || !renderingData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <p className="font-pixel text-sm tracking-wider text-white/60">PROJECT NOT FOUND</p>
        <button
          onClick={() => onNavigate('portfolio')}
          className="px-8 py-3 backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 hover:bg-neutral-800/80 transition-all font-pixel text-xs tracking-[0.3em] text-white"
        >
          BACK TO PORTFOLIO
        </button>
      </div>
    );
  }

  return (
    <>
      <SEO
        metadata={{
          title: project.seoTitle || `${project.title} - Rendering | Brandon PT Davis`,
          description: project.seoDescription || project.description,
          keywords: project.seoKeywords || [project.title, 'rendering', 'visualization', '3D', 'Brandon PT Davis'],
          ogType: 'article',
          ogImage: project.ogImage || project.cardImage,
          canonicalPath: `/portfolio/${project.slug}`
        }}
      />

      {/* FIXED GRADIENT BACKGROUND LAYER - Covers body's black background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: colors
            ? `
              radial-gradient(ellipse 80% 50% at 20% 20%, ${colors.primary}, transparent),
              radial-gradient(ellipse 50% 80% at 80% 50%, ${colors.secondary}, transparent),
              radial-gradient(ellipse 60% 40% at 40% 80%, ${colors.accent || colors.primary}, transparent),
              linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 70%, #0a0a0a 100%)
            `
            : `
              radial-gradient(ellipse 80% 50% at 20% 30%, rgba(147, 51, 234, 0.6), transparent),
              radial-gradient(ellipse 60% 60% at 80% 40%, rgba(6, 182, 212, 0.5), transparent),
              radial-gradient(ellipse 50% 50% at 50% 80%, rgba(59, 130, 246, 0.4), transparent),
              linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 70%, #0a0a0a 100%)
            `
        }}
      />

      {/* Main Container */}
      <div className="min-h-screen text-white relative z-10">

        {/* Fixed Side Navigation Arrows - NOW ALWAYS VISIBLE */}
        {prevProject && (
          <button
            onClick={() => onNavigate(`project/${prevProject.slug}`)}
            className="fixed left-6 top-1/2 -translate-y-1/2 z-[100] p-4 backdrop-blur-xl bg-neutral-800/80 rounded-full border border-white/10 hover:bg-neutral-800/90 transition-all flex items-center justify-center shadow-xl"
            aria-label={`Previous project: ${prevProject.title}`}
            title={prevProject.title}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {nextProject && (
          <button
            onClick={() => onNavigate(`project/${nextProject.slug}`)}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] p-4 backdrop-blur-xl bg-neutral-800/80 rounded-full border border-white/10 hover:bg-neutral-800/90 transition-all flex items-center justify-center shadow-xl"
            aria-label={`Next project: ${nextProject.title}`}
            title={nextProject.title}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Scrollable Content - NO BACKGROUND so gradient shows through */}
        <div className="relative pt-32 pb-24 px-6 md:px-12">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Hero Title Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 p-8 md:p-12"
            >
              <h1 className="font-display text-white text-4xl md:text-5xl lg:text-6xl mb-6">
                {project.title}
              </h1>

              {/* Meta with Icons */}
              <div className="flex flex-wrap gap-6 text-sm text-white/80">
                {(project.venue || project.location) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/40" />
                    <span>
                      {project.venue}
                      {project.venue && project.location && <span className="mx-1 opacity-60">·</span>}
                      {project.location}
                    </span>
                  </div>
                )}
                {project.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white/40" />
                    <span>{project.year}</span>
                  </div>
                )}
                {project.clientName && (
                  <span className="opacity-60">Client: {project.clientName}</span>
                )}
              </div>
            </motion.div>

            {/* Metadata Card - Like, Views, Share */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 p-6"
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
                  description={project.description}
                  size="md"
                />
              </div>
            </motion.div>

            {/* Rendering Template Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <RenderingTemplate project={renderingData} />
            </motion.div>

            {/* More Renderings - 3 Landscape Cards */}
            {relatedProjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="pt-16"
              >
                <div className="font-pixel text-xs text-white/60 tracking-[0.3em] mb-6">
                  MORE RENDERINGS
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedProjects.map((relatedProject: any) => (
                    <button
                      key={relatedProject.slug}
                      onClick={() => onNavigate(`project/${relatedProject.slug}`)}
                      className="group relative overflow-hidden bg-neutral-900 rounded-2xl border border-white/10 hover:border-white/20 transition-all aspect-video"
                    >
                      {relatedProject.cardImage && (
                        <div className="absolute inset-0">
                          <img
                            src={relatedProject.cardImage}
                            alt={relatedProject.title}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <p className="font-display text-lg text-white text-left line-clamp-2">{relatedProject.title}</p>
                        {relatedProject.client && (
                          <p className="text-sm text-white/60 text-left mt-1">{relatedProject.client}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Back to Portfolio Button */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center pt-12"
            >
              <button
                onClick={() => onNavigate('portfolio?filter=rendering')}
                className="inline-flex items-center gap-2 px-8 py-3 bg-neutral-900 rounded-full border border-white/10 hover:border-white/20 transition-all font-pixel text-xs tracking-[0.3em] text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-center">BACK TO PORTFOLIO</span>
              </button>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}
