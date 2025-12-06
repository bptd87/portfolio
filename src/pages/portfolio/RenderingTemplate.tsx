import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Monitor, Layers } from 'lucide-react';
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

interface RenderingTemplateProps {
  project: {
    title: string;
    client?: string;
    softwareUsed?: string[];
    description: string;
    projectOverview?: string;
    galleries?: Gallery[];
    videoUrls?: string[];
    credits?: Array<{ role: string; name: string }>;
  };
}

export function RenderingTemplate({ project }: RenderingTemplateProps) {
  const [selectedImage, setSelectedImage] = useState<{ galleryIndex: number; imageIndex: number } | null>(null);

  // Get all images flattened for lightbox navigation
  const allImages: Array<{ url: string; caption: string; galleryIndex: number; imageIndex: number }> = [];
  project.galleries?.forEach((gallery, gIndex) => {
    gallery.images?.forEach((image, iIndex) => {
      allImages.push({ ...image, galleryIndex: gIndex, imageIndex: iIndex });
    });
  });

  const openLightbox = (galleryIndex: number, imageIndex: number) => {
    setSelectedImage({ galleryIndex, imageIndex });
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const getCurrentImageIndex = (): number => {
    if (!selectedImage) return 0;
    return allImages.findIndex(
      (img) => img.galleryIndex === selectedImage.galleryIndex && img.imageIndex === selectedImage.imageIndex
    );
  };

  const goToNext = () => {
    const currentIndex = getCurrentImageIndex();
    const nextIndex = (currentIndex + 1) % allImages.length;
    const nextImg = allImages[nextIndex];
    setSelectedImage({ galleryIndex: nextImg.galleryIndex, imageIndex: nextImg.imageIndex });
  };

  const goToPrev = () => {
    const currentIndex = getCurrentImageIndex();
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    const prevImg = allImages[prevIndex];
    setSelectedImage({ galleryIndex: prevImg.galleryIndex, imageIndex: prevImg.imageIndex });
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

  const getCurrentImage = () => {
    if (!selectedImage) return null;
    return project.galleries?.[selectedImage.galleryIndex]?.images[selectedImage.imageIndex];
  };

  return (
    <div className="space-y-16">
      {/* Narrative First - But brief */}
      {project.projectOverview && (
        <div className="max-w-3xl">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              {project.projectOverview}
            </p>
          </div>
        </div>
      )}

      {/* Technical Details - Minimal */}
      {(project.client || (project.softwareUsed && project.softwareUsed.length > 0)) && (
        <div className="flex flex-wrap items-center gap-6 text-sm opacity-50 pb-6 border-b border-border">
          {project.client && (
            <span className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              {project.client}
            </span>
          )}
          {project.softwareUsed && project.softwareUsed.length > 0 && (
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              {project.softwareUsed.join(', ')}
            </span>
          )}
        </div>
      )}


      {/* GALLERIES - Image focused, clean */}
      {project.galleries && project.galleries.length > 0 && (
        <div className="space-y-20">
          {project.galleries.map((gallery, galleryIndex) => {
            if (!gallery.images || gallery.images.length === 0) return null;

            // Determine grid
            let gridClass = "grid gap-6";
            if (gallery.layout === '2-col') gridClass += " md:grid-cols-2";
            else if (gallery.layout === '3-col') gridClass += " md:grid-cols-2 lg:grid-cols-3";
            else if (gallery.layout === 'masonry') gridClass = "columns-1 md:columns-2 lg:columns-3 gap-6";
            else gridClass += " grid-cols-1"; // Full width

            return (
              <section key={galleryIndex}>
                {/* Gallery heading */}
                {(gallery.heading || gallery.description) && (
                  <div className="mb-8">
                    {gallery.heading && (
                      <h2 className="text-xl md:text-2xl font-medium mb-3 tracking-tight">
                        {gallery.heading}
                      </h2>
                    )}
                    {gallery.description && (
                      <p className="text-base leading-relaxed opacity-60">
                        {gallery.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Images */}
                <div className={gridClass}>
                  {gallery.images.map((image, imageIndex) => (
                    <div key={imageIndex} className={gallery.layout === 'masonry' ? 'break-inside-avoid mb-6' : ''}>
                      <button
                        onClick={() => openLightbox(galleryIndex, imageIndex)}
                        className={`group w-full overflow-hidden rounded-lg transition-all duration-300 cursor-zoom-in block relative bg-secondary ${
                          gallery.layout !== 'masonry' ? 'aspect-video' : ''
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.caption || `${gallery.heading} - Image ${imageIndex + 1}`}
                          className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            gallery.layout !== 'masonry' ? 'h-full absolute inset-0' : 'h-auto'
                          }`}
                        />
                        {image.caption && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                            <p className="text-white text-sm">{image.caption}</p>
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}


      {/* VIDEOS */}
      {project.videoUrls && project.videoUrls.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl md:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <Play className="w-5 h-5 opacity-60" />
            Flythroughs & Animation
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {project.videoUrls.map((url, index) => {
              const youtubeId = getYouTubeId(url);
              const vimeoId = getVimeoId(url);

              if (youtubeId) {
                return (
                  <div key={index} className="aspect-video overflow-hidden bg-black">
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
                  <div key={index} className="aspect-video overflow-hidden bg-black">
                    <iframe
                      src={`https://player.vimeo.com/video/${vimeoId}`}
                      title={`Video ${index + 1}`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                );
              } else {
                return (
                  <div key={index} className="aspect-video bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                    <p className="text-sm opacity-40">Unsupported video URL</p>
                  </div>
                );
              }
            })}
          </div>
        </section>
      )}

      {/* Lightbox Dialog */}
      {selectedImage !== null && (
        <Dialog open={true} onOpenChange={closeLightbox}>
          <DialogContent className="!max-w-none !w-screen !h-screen !p-0 !border-0 !rounded-none bg-black flex flex-col items-center justify-center">
            <DialogTitle className="sr-only">
              Image {getCurrentImageIndex() + 1} of {allImages.length}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Full-size view of {getCurrentImage()?.caption || 'project image'}
            </DialogDescription>

            <div className="flex-1 w-full flex items-center justify-center pt-20 px-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${selectedImage.galleryIndex}-${selectedImage.imageIndex}`}
                  src={getCurrentImage()?.url}
                  alt={getCurrentImage()?.caption || `Image ${getCurrentImageIndex() + 1}`}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                  className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-110"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-110"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-7 h-7 text-white" />
                </button>
              </div>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-white/15 backdrop-blur-md rounded-full border border-white/30 text-white text-sm font-medium tracking-wider">
              {getCurrentImageIndex() + 1} / {allImages.length}
            </div>

            {/* Caption */}
            {getCurrentImage()?.caption && (
              <div className="absolute top-24 left-0 right-0 px-6 text-center">
                <p className="text-white text-sm bg-black/60 backdrop-blur-md px-6 py-3 inline-block rounded-full border border-white/30 max-w-2xl font-medium">
                  {getCurrentImage()?.caption}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
