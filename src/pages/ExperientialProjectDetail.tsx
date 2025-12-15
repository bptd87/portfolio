import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Loader2, CheckCircle2, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SEO } from '../components/SEO';
import { LikeButton } from '../components/shared/LikeButton';
import { ShareButton } from '../components/shared/ShareButton';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';


interface ExperientialProjectDetailProps {
  slug: string;
  onNavigate: (page: string, filter?: string) => void;
}

export function ExperientialProjectDetail({ slug, onNavigate }: ExperientialProjectDetailProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [views, setViews] = useState(0);
  const [nextProject, setNextProject] = useState<any>(null);
  const [prevProject, setPrevProject] = useState<any>(null);

  // Get hero images from process steps and content blocks
  const allImages = useMemo(() => {
    if (!project) return [];
    const heroImages = project.process?.filter((step: any) => step.image).map((step: any) => step.image) || [];
    const stepGalleryImages: string[] = [];
    project.process?.forEach((step: any) => {
      if (step.images) {
        stepGalleryImages.push(...step.images);
      }
    });

    const images = [...heroImages, ...stepGalleryImages];

    // Add images from content blocks
    project.experientialContent?.forEach((block: any) => {
      if (block.type === 'image' && block.src) {
        images.push(block.src);
      }
      if (block.type === 'gallery' && block.images) {
        images.push(...block.images);
      }
    });

    // Add gallery images (supports 'hero' from editor, fallback to 'process')
    const galleryImages = project.galleries?.hero || project.galleries?.process || [];
    if (galleryImages.length > 0) {
      images.push(...galleryImages);
    }

    return images;
  }, [project]);

  const displayImages = useMemo(() => {
    if (!project) return [];
    return allImages.length > 0 ? allImages : (project.cardImage ? [project.cardImage] : []);
  }, [allImages, project]);

  // Carousel auto-advance
  useEffect(() => {
    if (displayImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayImages.length]);

  useEffect(() => {
    fetchProject();
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
      setProject(data.project);
      setViews(data.project.views || 0);

      // Increment view count
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${data.project.id}/view`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      // Fetch adjacent projects
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
        const sameCategory = allProjects.filter((p: any) => p.category === 'Experiential Design');
        const currentIndex = sameCategory.findIndex((p: any) => p.slug === slug);

        if (currentIndex > -1) {
          const nextIndex = (currentIndex + 1) % sameCategory.length;
          const prevIndex = (currentIndex - 1 + sameCategory.length) % sameCategory.length;
          setNextProject(sameCategory[nextIndex]);
          setPrevProject(sameCategory[prevIndex]);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-2 font-display italic">Project not found</h2>
          <button
            onClick={() => onNavigate('portfolio', 'experiential-design')}
            className="text-white/60 hover:text-white font-pixel tracking-wider"
          >
            RETURN TO PORTFOLIO
          </button>
        </div>
      </div>
    );
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <>
      <SEO
        metadata={{
          title: project.seoTitle || `${project.title} - Experiential Design | Brandon PT Davis`,
          description: project.seoDescription || project.description,
          keywords: project.seoKeywords || [project.title, 'experiential design', 'Brandon PT Davis'],
          ogType: 'article',
          ogImage: project.ogImage || project.cardImage,
          canonicalPath: `/portfolio/${project.slug}`
        }}
      />

      <div className="min-h-screen bg-black text-white">
        {/* Hero Carousel */}
        {displayImages.length > 0 && (
          <div className="relative h-[60vh] bg-neutral-900 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-black/20 z-10" />
                <ImageWithFallback
                  src={displayImages[currentIndex]}
                  alt={`${project.title} - Image ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 z-20 group"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-white/80 group-hover:text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 z-20 group"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-white/80 group-hover:text-white" />
                </button>
              </>
            )}

            {/* Carousel Dots */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex
                      ? 'bg-white w-8'
                      : 'bg-white/30 w-2 hover:bg-white/50'
                      }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => onNavigate('portfolio', 'experiential-design')}
              className="absolute top-24 left-8 flex items-center gap-3 px-6 py-3 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 text-white transition-all duration-300 z-[100] group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs tracking-[0.2em] font-pixel">BACK TO PORTFOLIO</span>
            </button>
          </div>
        )}

        {/* Content - Widened Container */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12 md:py-16">
          {/* Project Header */}
          <div className="border-b border-white/10 pb-16 mb-20">
            {/* Category Badge */}
            <div className="flex items-center gap-3 mb-8">
              <span className="px-4 py-1.5 rounded-full border border-white/20 bg-white/5 font-pixel text-xs tracking-[0.2em] text-white/80 uppercase">
                EXPERIENTIAL DESIGN
              </span>
              {project.subcategory && (
                <span className="px-4 py-1.5 rounded-full border border-white/20 bg-white/5 font-pixel text-xs tracking-[0.2em] text-white/80 uppercase">
                  {project.subcategory}
                </span>
              )}
            </div>

            <h1 className="mb-8 text-white text-5xl md:text-7xl lg:text-8xl font-display italic leading-tight">
              {project.title}
            </h1>

            <p className="text-xl md:text-2xl text-neutral-400 max-w-5xl leading-relaxed mb-12 font-light">
              {project.description}
            </p>

            {/* Project Info Boxes - Updated styling */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'CLIENT', value: project.clientName || project.client_name },
                { label: 'LOCATION', value: project.location },
                { label: 'ROLE', value: project.role },
                { label: 'YEAR', value: project.year }
              ].map((item, i) => item.value && (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <p className="font-pixel text-xs text-white/40 tracking-[0.2em] uppercase mb-2">{item.label}</p>
                  <p className="text-white text-sm md:text-base">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center gap-8 mt-12">
              <LikeButton projectId={project.id} />
              <ShareButton
                url={`${window.location.origin}/portfolio/${project.slug}`}
                title={project.title}
              />
              <div className="flex items-center gap-2 text-neutral-500">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-pixel tracking-wider">{views} VIEWS</span>
              </div>
            </div>
          </div>

          {/* Challenge & Solution Grid -> Flex Refactor */}
          {((project.challenge || project.challenge_text) || (project.solution || project.solution_text)) && (
            <div className="mb-16 flex flex-col md:flex-row gap-12 items-start" id="challenge-solution-container">
              {/* Challenge */}
              <div className="flex-1 w-full md:w-1/2">
                <h2 className="font-pixel text-xs tracking-[0.3em] text-white/40 mb-6 uppercase">THE CHALLENGE</h2>
                {(project.challenge || project.challenge_text) && (
                  <h3 className="text-3xl lg:text-4xl text-white font-display italic leading-tight">
                    {project.challenge || project.challenge_text}
                  </h3>
                )}
              </div>

              {/* Solution */}
              <div className="flex-1 w-full md:w-1/2 min-h-0 h-fit">
                <h2 className="font-pixel text-xs tracking-[0.3em] text-white/40 mb-6 uppercase">THE SOLUTION</h2>
                {(project.solution || project.solution_text) && (
                  <div className="space-y-6">
                    {(project.solution || project.solution_text).split('\n\n').map((paragraph: string, index: number) => (
                      <p key={index} className="text-neutral-400 leading-relaxed text-lg font-light">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROJECT GALLERY (Moved Down) */}
          {((project.galleries?.hero && project.galleries.hero.length > 0) || (project.galleries?.process && project.galleries.process.length > 0)) && (
            <section className="mb-20">
              <div className={`grid gap-4 ${
                // Dynamic Grid Logic: 1->1, 2->2, 3->3, 4->2, 5+->3
                (() => {
                  const count = (project.galleries?.hero || project.galleries?.process || []).length;
                  if (count === 1) return 'grid-cols-1';
                  if (count === 2) return 'grid-cols-1 md:grid-cols-2';
                  if (count === 3) return 'grid-cols-1 md:grid-cols-3';
                  if (count === 4) return 'grid-cols-1 md:grid-cols-2';
                  return 'grid-cols-1 md:grid-cols-3';
                })()
                }`}>
                {(project.galleries?.hero || project.galleries?.process || []).map((image: string, index: number) => {
                  const caption = project.galleries?.heroCaptions?.[index] || '';
                  const globalIndex = allImages.findIndex(img => img === image);

                  return (
                    <div
                      key={index}
                      className="group cursor-pointer relative overflow-hidden rounded-md"
                      onClick={() => setSelectedPhoto(globalIndex !== -1 ? globalIndex : null)}
                    >
                      <div className="aspect-video w-full">
                        <ImageWithFallback
                          src={image}
                          alt={caption || `Gallery Image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                        {caption && (
                          <p className="text-sm text-white font-medium">{caption}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}



          {/* Key Features - Updated Styling */}
          {(project.keyFeatures || project.key_features) && (project.keyFeatures || project.key_features).length > 0 && (
            <section className="mb-24 md:mb-32">
              <h2 className="font-pixel text-xs tracking-[0.3em] text-white/40 mb-12 uppercase">KEY FEATURES</h2>
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {(project.keyFeatures || project.key_features).map((feature: any, index: number) => (
                  <div key={index} className="border border-white/10 rounded-3xl p-8 md:p-10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <CheckCircle2 className="w-8 h-8 text-white/80 mb-6" />
                    <h3 className="text-2xl text-white mb-4 font-display italic">{feature.title}</h3>
                    <p className="text-neutral-400 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Additional Galleries (Renderings, etc) */}
          {project.galleries?.additional && project.galleries.additional.length > 0 && (
            <div className="space-y-24 mb-24 md:mb-32">
              {project.galleries.additional.map((gallery: any, gIndex: number) => (
                <section key={gallery.id || gIndex}>
                  <div className="mb-12 text-center max-w-4xl mx-auto px-6">
                    <h2 className="font-pixel text-xs tracking-[0.3em] text-white/40 mb-6 uppercase">{gallery.heading}</h2>
                    {gallery.description && (
                      <p className="text-neutral-400 leading-relaxed text-lg font-light">{gallery.description}</p>
                    )}
                  </div>

                  <div className={`grid gap-4 md:gap-6 ${gallery.layout === '1-col' ? 'grid-cols-1' :
                    gallery.layout === '2-col' ? 'grid-cols-1 md:grid-cols-2' :
                      gallery.layout === '3-col' ? 'grid-cols-1 md:grid-cols-3' :
                        'grid-cols-1 md:grid-cols-3' // Default/Masonry fallback
                    }`}>
                    {gallery.images.map((img: any, iIndex: number) => (
                      <div key={iIndex} className="group relative">
                        <div className="overflow-hidden rounded-lg border border-white/10">
                          <ImageWithFallback
                            src={img.url}
                            alt={img.caption || gallery.heading}
                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        {img.caption && (
                          <p className="mt-2 text-sm text-white/40 italic">{img.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Video Links */}
          {(project.videoUrls || project.video_urls) && (project.videoUrls || project.video_urls).length > 0 && (
            <section className="mb-24 md:mb-32">
              <h2 className="font-pixel text-xs tracking-[0.3em] text-white/40 mb-12 uppercase text-center">MEDIA</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(project.videoUrls || project.video_urls).map((url: string, index: number) => {
                  // Simple check to try and embed
                  let embedUrl = url;
                  if (url.includes('youtube.com/watch?v=')) {
                    embedUrl = url.replace('watch?v=', 'embed/');
                  } else if (url.includes('youtu.be/')) {
                    embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
                  } else if (url.includes('vimeo.com/')) {
                    embedUrl = url.replace('vimeo.com/', 'player.vimeo.com/video/');
                  }

                  const isEmbeddable = url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo');

                  return (
                    <div key={index} className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                      {isEmbeddable ? (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          title={`Video: ${project.title} - ${index + 1}`}
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
                            <span className="font-medium">Watch Video</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Process Timeline - Updated Styling */}
          {project.process && project.process.length > 0 && (
            <section className="mb-24 md:mb-32">
              <h2 className="font-pixel text-xs tracking-[0.3em] text-white/40 mb-12 uppercase">PROCESS</h2>
              <div className="space-y-20">
                {project.process.map((step: any, index: number) => {
                  const isOdd = index % 2 !== 0;
                  return (
                    <div key={index} className="space-y-8">
                      {/* Main Step Layout */}
                      <div className="md:grid md:grid-cols-2 lg:gap-24 md:gap-12 items-center group">
                        {step.image ? (
                          <>
                            <div className={`order-2 ${isOdd ? 'md:order-1' : 'md:order-2'} overflow-hidden rounded-3xl border border-white/10`}>
                              <ImageWithFallback
                                src={step.image}
                                alt={step.title}
                                className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                              />
                            </div>
                            <div className={`order-1 ${isOdd ? 'md:order-2' : 'md:order-1'} py-4`}>
                              <div className="flex items-center gap-6 mb-6">
                                <span className="text-4xl font-pixel text-white/20">{String(index + 1).padStart(2, '0')}</span>
                                <h3 className="text-3xl text-white font-display italic">{step.title}</h3>
                              </div>
                              <p className="text-neutral-400 leading-relaxed text-lg font-light">{step.description}</p>
                            </div>
                          </>
                        ) : (
                          // Text only layout - Alternating Zig-Zag (Left/Right)
                          <div className={`md:col-span-1 py-12 ${isOdd ? 'md:col-start-2' : ''}`}>
                            <div className="flex items-center gap-6 mb-6">
                              <span className="text-4xl font-pixel text-white/20">{String(index + 1).padStart(2, '0')}</span>
                              <h3 className="text-3xl text-white font-display italic">{step.title}</h3>
                            </div>
                            <p className="text-neutral-400 leading-relaxed text-lg font-light text-justify">{step.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Step Gallery Grid */}
                      {step.images && step.images.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 max-w-5xl mx-auto">
                          {step.images.map((img: string, i: number) => {
                            const globalIndex = allImages.findIndex(x => x === img);
                            return (
                              <div
                                key={i}
                                className="aspect-[3/2] overflow-hidden rounded-xl border border-white/10 cursor-pointer hover:border-white/30 transition-all"
                                onClick={() => setSelectedPhoto(globalIndex !== -1 ? globalIndex : null)}
                              >
                                <ImageWithFallback
                                  src={img}
                                  alt={`${step.title} gallery image ${i + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Gallery Moved Up - Removed from here */}

          {/* Metrics - Updated Styling */}
          {(project.metrics || project.metrics_data) && (project.metrics || project.metrics_data).length > 0 && (
            <section className="mb-24 md:mb-32">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 md:p-20 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
                  {(project.metrics || project.metrics_data).map((metric: any, index: number) => (
                    <div key={index} className="text-center">
                      <TrendingUp className="w-6 h-6 text-white/60 mx-auto mb-6" />
                      <div className="text-5xl md:text-6xl font-display italic text-white mb-4">{metric.value}</div>
                      <div className="font-pixel text-xs tracking-[0.3em] text-white/40 uppercase">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Testimonial */}
          {project.testimonial && (
            <section className="mb-24 md:mb-32">
              <div className="border-l-2 border-white/20 pl-8 md:pl-12 py-4">
                <p className="text-2xl md:text-4xl text-white font-display italic mb-8 leading-tight">
                  "{project.testimonial.quote}"
                </p>
                <div>
                  <p className="text-white font-pixel tracking-wider text-sm uppercase mb-1">{project.testimonial.author}</p>
                  <p className="text-sm text-neutral-500">{project.testimonial.role}</p>
                </div>
              </div>
            </section>
          )}

          {/* Team */}
          {(project.team || project.team_members) && (project.team || project.team_members).length > 0 && (
            <section className="mb-24 md:mb-32">
              <h2 className="font-pixel text-xs tracking-[0.3em] text-white/40 mb-12 uppercase">TEAM</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {(project.team || project.team_members).map((member: any, index: number) => (
                  <div key={index} className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-sm">
                    <p className="text-white font-medium mb-2">{member.name}</p>
                    <p className="font-pixel text-xs text-white/40 uppercase tracking-wider">{member.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}



          {/* Navigation to Next/Previous Projects */}
          <div className="grid md:grid-cols-2 gap-6 pt-16 border-t border-white/10">
            {prevProject && (
              <button
                onClick={() => onNavigate(`project/${prevProject.slug}`)}
                className="group text-left relative overflow-hidden rounded-3xl border border-white/10"
              >
                <div className="aspect-[16/10] bg-neutral-900">
                  <ImageWithFallback
                    src={prevProject.cardImage}
                    alt={prevProject.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-all duration-500"
                  />
                </div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <p className="font-pixel text-xs text-white/60 mb-2 tracking-[0.2em] uppercase">PREVIOUS PROJECT</p>
                  <h4 className="text-white text-2xl font-display italic group-hover:translate-x-2 transition-transform duration-300">{prevProject.title}</h4>
                </div>
              </button>
            )}
            {nextProject && (
              <button
                onClick={() => onNavigate(`project/${nextProject.slug}`)}
                className="group text-right relative overflow-hidden rounded-3xl border border-white/10"
              >
                <div className="aspect-[16/10] bg-neutral-900">
                  <ImageWithFallback
                    src={nextProject.cardImage}
                    alt={nextProject.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-all duration-500"
                  />
                </div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end items-end">
                  <p className="font-pixel text-xs text-white/60 mb-2 tracking-[0.2em] uppercase">NEXT PROJECT</p>
                  <h4 className="text-white text-2xl font-display italic group-hover:-translate-x-2 transition-transform duration-300">{nextProject.title}</h4>
                </div>
              </button>
            )}
          </div>
        </div >
      </div >

      {/* Image Lightbox */}
      <AnimatePresence>
        {
          selectedPhoto !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                aria-label="Close lightbox"
                title="Close lightbox"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto((prev) => (prev! - 1 + allImages.length) % allImages.length);
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
                      setSelectedPhoto((prev) => (prev! + 1) % allImages.length);
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
                key={selectedPhoto}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={allImages[selectedPhoto]}
                alt={`Image ${selectedPhoto + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-pixel text-xs text-white/60 tracking-wider">
                {selectedPhoto + 1} / {allImages.length}
              </div>
            </motion.div>
          )
        }
      </AnimatePresence >
    </>
  );
}