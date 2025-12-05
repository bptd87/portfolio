import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Eye, Calendar, Layers, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { SEO } from '../components/SEO';
import { LikeButton } from '../components/shared/LikeButton';
import { ShareButton } from '../components/shared/ShareButton';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface RenderingProjectDetailProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function RenderingProjectDetail({ slug, onNavigate }: RenderingProjectDetailProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [nextProject, setNextProject] = useState<any>(null);
  const [prevProject, setPrevProject] = useState<any>(null);
  const [activeProcessImage, setActiveProcessImage] = useState(0);

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
        const sameCategory = allProjects.filter((p: any) => 
          p.category === 'Rendering' || 
          p.category === 'Visualization' || 
          p.category === 'Rendering & Visualization'
        );
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

  // Collect all images for lightbox
  const allImages = useMemo(() => {
    if (!project) return [];
    const images = [project.cardImage];
    if (project.galleries?.hero) images.push(...project.galleries.hero);
    if (project.process?.map((p: any) => p.image)) images.push(...project.process.map((p: any) => p.image));
    return images.filter(Boolean);
  }, [project]);

  const openLightbox = (imageSrc: string) => {
    const index = allImages.indexOf(imageSrc);
    if (index !== -1) setSelectedPhoto(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <p className="font-pixel text-sm tracking-wider opacity-60 text-white">PROJECT NOT FOUND</p>
        <button
          onClick={() => onNavigate('portfolio')}
          className="px-8 py-3 rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-white font-pixel tracking-wider"
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

      <div className="min-h-screen bg-black text-white selection:bg-white/20">
        {/* Navigation Header */}
        <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
          <button
            onClick={() => onNavigate('portfolio', 'rendering')}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all text-white group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-pixel text-xs tracking-[0.2em]">BACK</span>
          </button>
        </div>

        {/* Main Content */}
        <main className="relative z-10">
          {/* Hero Section - Responsive Layout */}
          <section className="relative min-h-screen flex flex-col pt-32 lg:pt-0 lg:justify-center">
            
            <div className="px-6 md:px-12 lg:px-20 pb-12 lg:pb-0 max-w-[1600px] mx-auto w-full h-full">
              <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center lg:min-h-[80vh]">
                
                {/* TEXT CONTENT - Top on Mobile, Left on Desktop */}
                <div className="lg:col-span-5 space-y-10 lg:py-20">
                  
                  {/* Header */}
                  <div>
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-5xl md:text-6xl xl:text-7xl font-display italic leading-[0.9] mb-6"
                    >
                      {project.title}
                    </motion.h1>
                    <div className="flex items-center gap-4 text-white/40 font-pixel text-xs tracking-[0.2em] uppercase">
                       <span>{project.year || '2024'}</span>
                       <span>—</span>
                       <span>{project.category || 'VISUALIZATION'}</span>
                    </div>
                  </div>

                  {/* Narrative */}
                  <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-neutral-400 font-light leading-relaxed text-lg text-justify">
                      {project.description}
                    </p>
                    {project.designNotes && project.designNotes.map((note: string, i: number) => (
                      <p key={i} className="text-neutral-400 font-light leading-relaxed text-lg text-justify">
                        {note}
                      </p>
                    ))}
                  </div>

                  {/* Details Grid (Software & Client) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-white/10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white/60">
                        <Monitor className="w-4 h-4" />
                        <h3 className="font-pixel text-[10px] tracking-[0.2em] uppercase">SOFTWARE</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.tags && project.tags.length > 0 ? (
                          project.tags.map((tag: string, i: number) => (
                            <span key={i} className="text-sm text-white/80 font-mono">
                              {tag}{i < project.tags.length - 1 ? ',' : ''}
                            </span>
                          ))
                        ) : <span className="text-white/40 italic text-sm">N/A</span>}
                      </div>
                    </div>

                    {(project.clientName || project.role) && (
                      <div className="space-y-4">
                        <h3 className="font-pixel text-[10px] tracking-[0.2em] uppercase text-white/60">METADATA</h3>
                        <div className="space-y-1">
                          {project.clientName && <p className="text-sm text-white/80"><span className="opacity-40 mr-2">CLIENT:</span>{project.clientName}</p>}
                          {project.role && <p className="text-sm text-white/80"><span className="opacity-40 mr-2">ROLE:</span>{project.role}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center gap-6 pt-4">
                    <LikeButton projectId={project.id} initialLikes={project.likes || 0} showCount />
                    <ShareButton title={project.title} description={project.description} />
                  </div>
                </div>

                {/* IMAGE CONTENT - Bottom on Mobile, Right on Desktop */}
                <div className="lg:col-span-7 mt-12 lg:mt-0">
                  <motion.div 
                    layoutId={`project-image-${project.id}`}
                    className="relative w-full aspect-square md:aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 cursor-pointer shadow-2xl shadow-black/50"
                    onClick={() => openLightbox(project.cardImage)}
                  >
                    <ImageWithFallback
                      src={project.cardImage}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                      <div className="flex items-center gap-2 text-white/80">
                        <Eye className="w-5 h-5" />
                        <span className="font-pixel text-xs tracking-wider">EXPAND</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

              </div>
            </div>
          </section>

          {/* Optional Process Panel */}
          {project.process && project.process.length > 0 && (
            <section className="py-20 border-t border-white/10 bg-neutral-900/30">
              <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-12 text-white/60">
                  <Layers className="w-5 h-5" />
                  <h2 className="font-pixel text-xs tracking-[0.2em] uppercase">PROCESS & WIREFRAMES</h2>
                </div>

                <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
                  {/* Main Process View */}
                  <div 
                    className="aspect-video bg-black/50 rounded-3xl border border-white/10 overflow-hidden cursor-pointer"
                    onClick={() => openLightbox(project.process[activeProcessImage].image)}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeProcessImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full"
                      >
                        <ImageWithFallback
                          src={project.process[activeProcessImage].image}
                          alt={project.process[activeProcessImage].title || 'Process Image'}
                          className="w-full h-full object-contain"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Process List */}
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {project.process.map((step: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setActiveProcessImage(index)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                          activeProcessImage === index 
                            ? 'bg-white/10 border-white/20' 
                            : 'bg-transparent border-transparent hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-pixel text-xs text-white/40 tracking-wider">V.{index + 1}</span>
                        </div>
                        <h4 className={`font-display italic text-lg mb-1 ${activeProcessImage === index ? 'text-white' : 'text-white/60'}`}>
                          {step.title || `Process Step ${index + 1}`}
                        </h4>
                        <p className="text-xs text-white/40 line-clamp-2">
                          {step.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Navigation Footer */}
          <div className="grid md:grid-cols-2 border-t border-white/10">
            {prevProject ? (
              <button
                onClick={() => onNavigate('project', prevProject.slug)}
                className="group relative h-64 overflow-hidden border-r border-white/10"
              >
                <div className="absolute inset-0 bg-neutral-900">
                  <ImageWithFallback
                    src={prevProject.cardImage}
                    alt={prevProject.title}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity duration-500"
                  />
                </div>
                <div className="absolute inset-0 p-12 flex flex-col justify-center items-start">
                  <span className="font-pixel text-xs text-white/40 tracking-[0.2em] uppercase mb-4 group-hover:-translate-x-2 transition-transform">PREVIOUS</span>
                  <span className="font-display italic text-3xl text-white group-hover:translate-x-2 transition-transform">{prevProject.title}</span>
                </div>
              </button>
            ) : <div className="h-64 bg-neutral-950 border-r border-white/10" />}

            {nextProject ? (
              <button
                onClick={() => onNavigate('project', nextProject.slug)}
                className="group relative h-64 overflow-hidden"
              >
                <div className="absolute inset-0 bg-neutral-900">
                  <ImageWithFallback
                    src={nextProject.cardImage}
                    alt={nextProject.title}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity duration-500"
                  />
                </div>
                <div className="absolute inset-0 p-12 flex flex-col justify-center items-end text-right">
                  <span className="font-pixel text-xs text-white/40 tracking-[0.2em] uppercase mb-4 group-hover:translate-x-2 transition-transform">NEXT</span>
                  <span className="font-display italic text-3xl text-white group-hover:-translate-x-2 transition-transform">{nextProject.title}</span>
                </div>
              </button>
            ) : <div className="h-64 bg-neutral-950" />}
          </div>
        </main>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedPhoto !== null && (
            <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
              <DialogContent className="w-screen h-screen max-w-none m-0 p-0 rounded-none border-none bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-hidden">
                <DialogTitle className="sr-only">Image Viewer</DialogTitle>
                <DialogDescription className="sr-only">Full size view</DialogDescription>
                <div className="relative w-full h-full flex items-center justify-center">
                  <ImageWithFallback
                    src={allImages[selectedPhoto]}
                    alt="Full size"
                    className="w-full h-full object-contain"
                  />
                  
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 hover:bg-white/10 backdrop-blur-md flex items-center justify-center text-white transition-all z-50 border border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhoto((selectedPhoto - 1 + allImages.length) % allImages.length);
                        }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-white/10 backdrop-blur-md flex items-center justify-center text-white transition-all z-50 border border-white/10"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhoto((selectedPhoto + 1) % allImages.length);
                        }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-white/10 backdrop-blur-md flex items-center justify-center text-white transition-all z-50 border border-white/10"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-pixel text-xs text-white/40 tracking-wider bg-black/50 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                    {selectedPhoto + 1} / {allImages.length}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
