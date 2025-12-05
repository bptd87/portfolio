import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Briefcase, Users } from 'lucide-react';
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

interface ExperientialTemplateProps {
  project: {
    title: string;
    client?: string;
    projectType?: string;
    description: string;
    projectOverview?: string;
    galleries?: Gallery[];
    videoUrls?: string[];
    credits?: Array<{ role: string; name: string }>;
  };
}

export function ExperientialTemplate({ project }: ExperientialTemplateProps) {
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
  React.useEffect(() => {
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
    <div className="space-y-16 md:space-y-24">
      {/* Project Overview Section */}
      <div>
        <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-6 uppercase">
          Project Overview
        </h2>
        <div className="max-w-4xl">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {project.projectOverview || project.description}
          </p>
        </div>

        {/* Client & Project Type Tags */}
        {(project.client || project.projectType) && (
          <div className="flex items-center gap-3 mt-8">
            {project.client && (
              <span className="px-3 py-1.5 bg-secondary border border-border text-xs tracking-wider uppercase flex items-center gap-2">
                <Briefcase className="w-3 h-3" />
                {project.client}
              </span>
            )}
            {project.projectType && (
              <span className="px-3 py-1.5 bg-secondary border border-border text-xs tracking-wider text-muted-foreground uppercase">
                {project.projectType}
              </span>
            )}
          </div>
        )}

        {/* Collaboration Credits */}
        {project.credits && project.credits.length > 0 && (
          <div className="mt-8 bg-secondary border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 opacity-60" />
              <h4 className="text-sm tracking-wider uppercase opacity-60">Collaboration</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
              {project.credits.map((credit, index) => (
                <div key={index} className="flex gap-4">
                  <span className="text-black/40 dark:text-white/40 min-w-[120px] text-sm">
                    {credit.role}
                  </span>
                  <span className="text-black dark:text-white text-sm">
                    {credit.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Galleries - Editorial Style */}
      {project.galleries && project.galleries.length > 0 && (
        <div className="space-y-16 md:space-y-24">
          {project.galleries.map((gallery, galleryIndex) => (
            <section key={galleryIndex}>
              {/* Gallery Heading */}
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-6 uppercase">
                {gallery.heading}
              </h2>

              {/* Gallery Description */}
              {gallery.description && (
                <div className="max-w-4xl mb-8">
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
                    {gallery.description}
                  </p>
                </div>
              )}

              {/* Gallery Images - Inline Grid */}
              {gallery.images && gallery.images.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                  {gallery.images.map((image, imageIndex) => (
                    <button
                      key={imageIndex}
                      onClick={() => openLightbox(galleryIndex, imageIndex)}
                      className="group aspect-[4/3] overflow-hidden border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 cursor-zoom-in"
                    >
                      <img
                        src={image.url}
                        alt={image.caption || `${gallery.heading} - Image ${imageIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Video Section */}
      {project.videoUrls && project.videoUrls.length > 0 && (
        <section>
          <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-6 uppercase flex items-center gap-2">
            <Play className="w-4 h-4" />
            Video Documentation
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {project.videoUrls.map((url, index) => {
              const youtubeId = getYouTubeId(url);
              const vimeoId = getVimeoId(url);

              if (youtubeId) {
                return (
                  <div key={index} className="aspect-video border border-border">
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
                  <div key={index} className="aspect-video border border-border">
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
                  <div key={index} className="aspect-video border border-border bg-secondary flex items-center justify-center p-4">
                    <p className="text-sm opacity-60 text-center">
                      Unsupported video URL format
                    </p>
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
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 pointer-events-auto"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 pointer-events-auto"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
              {getCurrentImageIndex() + 1} / {allImages.length}
            </div>

            {/* Caption */}
            {getCurrentImage()?.caption && (
              <div className="absolute top-20 left-0 right-0 px-6 text-center">
                <p className="text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 inline-block border border-white/20 max-w-2xl">
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