import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, X, Cpu, Tag, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';

interface ImageWithCaption {
  url: string;
  caption: string;
}

interface Gallery {
  heading: string;
  description: string;
  images: ImageWithCaption[];
  layout?: '1-col' | '2-col' | '3-col' | 'masonry';
}

interface ProcessStep {
  title: string;
  description: string;
  image?: string;
}

interface RenderingTemplateProps {
  project: {
    title: string;
    client?: string;
    venue?: string;
    location?: string;
    year?: number;
    tags?: string[];
    softwareUsed?: string[];
    description: string;
    projectOverview?: string;
    galleries?: Gallery[];
    videoUrls?: string[];
    credits?: Array<{ role: string; name: string }>;
    process?: ProcessStep[];
  };
}

export function RenderingTemplate({ project }: RenderingTemplateProps) {
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption: string } | null>(null);


  // Get hero images (first gallery)
  const heroGallery = project.galleries && project.galleries.length > 0 ? project.galleries[0] : null;
  const heroImages = heroGallery?.images || [];

  // Get all images for lightbox
  const allImages: Array<{ url: string; caption: string }> = [];
  project.galleries?.forEach((gallery) => {
    gallery.images?.forEach((image) => {
      allImages.push(image);
    });
  });
  // Add process images
  project.process?.forEach((step) => {
    if (step.image) {
      allImages.push({ url: step.image, caption: step.title });
    }
  });

  const openLightbox = (image: { url: string; caption: string }) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const getCurrentIndex = () => {
    if (!selectedImage) return 0;
    return allImages.findIndex(img => img.url === selectedImage.url);
  };

  const goToNext = () => {
    const currentIndex = getCurrentIndex();
    const nextIndex = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
  };

  const goToPrev = () => {
    const currentIndex = getCurrentIndex();
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setSelectedImage(allImages[prevIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    if (selectedImage === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getVimeoId = (url: string): string | null => {
    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Split narrative
  const narrativeParagraphs = project.projectOverview?.split('\n\n') || [];


  return (
    <div className="space-y-6">

      {/* 1. HERO IMAGES FIRST - Full Width, Stacked */}
      {heroImages.length > 0 && (
        <section className="space-y-6">
          {heroImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group cursor-zoom-in"
              onClick={() => openLightbox(image)}
            >
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <img
                  src={image.url}
                  alt={image.caption || project.title}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              {image.caption && (
                <p className="mt-3 text-sm text-white/50 text-center font-light italic">
                  {image.caption}
                </p>
              )}
            </motion.div>
          ))}
        </section>
      )}

      {/* 2. RENDERING NARRATIVE - Magazine Style with Drop Cap */}
      {project.projectOverview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 p-8 md:p-12"
        >
          <div className="text-white/90 leading-relaxed text-lg text-justify">
            {narrativeParagraphs.map((paragraph, i) => {
              // First paragraph gets drop cap
              if (i === 0 && paragraph.length > 0) {
                const firstLetter = paragraph.charAt(0);
                const restOfText = paragraph.slice(1);
                return (
                  <p key={i} className="mb-8">
                    <span
                      style={{
                        float: 'left',
                        fontSize: '2.5rem',
                        fontFamily: 'var(--font-display)',
                        fontStyle: 'italic',
                        color: '#a78bfa',
                        lineHeight: '1',
                        marginRight: '0.1rem'
                      }}
                    >
                      {firstLetter}
                    </span>
                    {restOfText}
                  </p>
                );
              }
              return <p key={i} className="mb-6">{paragraph}</p>;
            })}
          </div>
        </motion.div>
      )}

      {/* 4. PROCESS GALLERY WITH CAPTIONS */}
      {project.process && project.process.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 p-6"
        >
          <div className="font-pixel text-xs text-white/60 tracking-[0.3em] mb-6">
            PROCESS & EVOLUTION
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.process.map((step, index) => (
              step.image && (
                <div
                  key={index}
                  className="group cursor-zoom-in"
                  onClick={() => openLightbox({ url: step.image!, caption: step.title })}
                >
                  <div className="overflow-hidden rounded-xl border border-white/10 mb-3">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-white mb-1">{step.title}</h4>
                  {step.description && (
                    <p className="text-xs text-white/50 line-clamp-2">{step.description}</p>
                  )}
                </div>
              )
            ))}
          </div>
        </motion.div>
      )}

      {/* 5. SOFTWARE & TOOLS (Separate from Tags) */}
      {project.softwareUsed && project.softwareUsed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 p-6"
        >
          <div className="font-pixel text-xs text-white/60 tracking-[0.3em] mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            SOFTWARE & TOOLS
          </div>
          <div className="flex flex-wrap gap-2">
            {project.softwareUsed.map((tool, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/80 hover:bg-white/10 transition-colors"
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* 6. TAGS (SEO) */}
      {project.tags && project.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 p-6"
        >
          <div className="font-pixel text-xs text-white/60 tracking-[0.3em] mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            TAGS
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-accent-brand/20 border border-accent-brand/30 rounded-full text-xs text-accent-brand"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* 7. CREDITS */}
      {project.credits && project.credits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 p-6"
        >
          <div className="font-pixel text-xs text-white/60 tracking-[0.3em] mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            CREDITS
          </div>
          <div className="space-y-2">
            {project.credits.map((credit, i) => (
              <div key={i} className="flex items-baseline gap-3 text-sm">
                <span className="text-white/40 min-w-[120px]">{credit.role}</span>
                <span className="text-white/80">{credit.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 8. VIDEOS */}
      {project.videoUrls && project.videoUrls.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="backdrop-blur-xl bg-neutral-800/60 rounded-3xl border border-white/10 p-6"
        >
          <div className="font-pixel text-xs text-white/60 tracking-[0.3em] mb-6 flex items-center gap-2">
            <Play className="w-4 h-4" />
            FLYTHROUGHS & VIDEO
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {project.videoUrls.map((url, index) => {
              const youtubeId = getYouTubeId(url);
              const vimeoId = getVimeoId(url);

              if (youtubeId) {
                return (
                  <div key={index} className="aspect-video rounded-xl overflow-hidden border border-white/10">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={`Video ${index + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                );
              } else if (vimeoId) {
                return (
                  <div key={index} className="aspect-video rounded-xl overflow-hidden border border-white/10">
                    <iframe
                      src={`https://player.vimeo.com/video/${vimeoId}`}
                      title={`Video ${index + 1}`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </motion.div>
      )}

      {/* LIGHTBOX */}
      {selectedImage && (
        <Dialog open={true} onOpenChange={closeLightbox}>
          <DialogContent className="!max-w-none !w-screen !h-screen !p-0 !border-0 !rounded-none bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center">
            <DialogTitle className="sr-only">
              Image {getCurrentIndex() + 1} of {allImages.length}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {selectedImage.caption || 'Project image'}
            </DialogDescription>

            <div className="flex-1 w-full flex items-center justify-center p-4 md:p-20 h-full relative" onClick={closeLightbox}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage.url}
                  src={selectedImage.url}
                  alt={selectedImage.caption || ''}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </AnimatePresence>
            </div>

            {/* Navigation */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}

            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Caption & Counter */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-center">
              {selectedImage.caption && (
                <p className="text-white/90 text-lg mb-2">{selectedImage.caption}</p>
              )}
              <p className="font-pixel text-xs text-white/40 tracking-wider">
                {getCurrentIndex() + 1} / {allImages.length}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
