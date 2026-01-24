import React, { useState, useEffect, useCallback } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Download, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface GalleryImage {
  url: string;
  caption?: string;
}

interface GalleryBlockProps {
  images: GalleryImage[];
  galleryStyle?: 'grid' | 'carousel' | 'masonry' | 'fullwidth';
  enableDownload?: boolean;
}

export function GalleryBlock({ images, galleryStyle = 'grid', enableDownload = false }: GalleryBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 300);
  }, [images.length, isAnimating]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 300);
  }, [images.length, isAnimating]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToNext, goToPrev]);

  // Carousel auto-advance and smooth transition
  const goToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (images.length === 0) return null;

  // Lightbox Modal
  const renderLightbox = () => {
    if (!lightboxOpen) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
        onClick={closeLightbox}
      >
        {/* Close button */}
        <button
          onClick={closeLightbox}
          className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 transition-all z-20"
          aria-label="Close lightbox"
          title="Close lightbox"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 transition-all z-20"
              aria-label="Previous image"
              title="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 transition-all z-20"
              aria-label="Next image"
              title="Next image"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Image */}
        <div className="relative max-w-7xl max-h-full p-4 md:p-12" onClick={(e) => e.stopPropagation()}>
          <img
            src={images[lightboxIndex].url}
            alt={images[lightboxIndex].caption || ''}
            className={`max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}
          />
          {images[lightboxIndex].caption && (
            <p className="text-white text-center mt-6 text-lg italic opacity-80">
              {images[lightboxIndex].caption}
            </p>
          )}
          {/* Counter */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-8 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      </div>
    );
  };

  // Grid Layout (default)
  if (galleryStyle === 'grid') {
    return (
      <>
        <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {images.map((img, i) => (
            <figure key={i} className="cursor-pointer" onClick={() => openLightbox(i)}>
              <div className="aspect-[4/3] bg-secondary overflow-hidden relative group rounded-lg">
                <ImageWithFallback
                  src={img.url}
                  alt={img.caption || ''}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-white/10 rounded-full p-3">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>
                {enableDownload && (
                  <a
                    href={img.url}
                    download
                    className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 z-10"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Download image"
                    title="Download image"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                )}
              </div>
              {img.caption && (
                <figcaption className="text-[10px] tracking-widest uppercase mt-3 opacity-60">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
        {renderLightbox()}
      </>
    );
  }

  // Carousel Layout
  if (galleryStyle === 'carousel') {
    return (
      <>
        <div className="my-12 relative">
          <div
            className="aspect-[16/10] bg-secondary overflow-hidden relative rounded-xl cursor-pointer group"
            onClick={() => openLightbox(currentIndex)}
          >
            {/* Sliding container */}
            <div
              className="absolute inset-0 flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((img, i) => (
                <div key={i} className="w-full h-full flex-shrink-0">
                  <ImageWithFallback
                    src={img.url}
                    alt={img.caption || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Zoom overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-white/10 rounded-full p-4">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
            </div>

            {enableDownload && (
              <a
                href={images[currentIndex].url}
                download
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all z-10 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
                aria-label="Download current image"
                title="Download current image"
              >
                <Download className="w-5 h-5" />
              </a>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToSlide(currentIndex === 0 ? images.length - 1 : currentIndex - 1); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all z-10 opacity-0 group-hover:opacity-100"
                  aria-label="Previous slide"
                  title="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToSlide(currentIndex === images.length - 1 ? 0 : currentIndex + 1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all z-10 opacity-0 group-hover:opacity-100"
                  aria-label="Next slide"
                  title="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  title={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex
                    ? 'bg-accent-brand w-8'
                    : 'bg-foreground/25 hover:bg-foreground/40 w-2'
                    }`}
                />
              ))}
            </div>
          )}

          {images[currentIndex].caption && (
            <figcaption className="text-[10px] tracking-widest uppercase mt-4 opacity-60 text-center">
              {images[currentIndex].caption}
            </figcaption>
          )}
        </div>
        {renderLightbox()}
      </>
    );
  }

  // Masonry Layout
  if (galleryStyle === 'masonry') {
    return (
      <>
        <div className="my-12 columns-1 md:columns-2 gap-8 space-y-8">
          {images.map((img, i) => (
            <figure key={i} className="break-inside-avoid mb-8 cursor-pointer" onClick={() => openLightbox(i)}>
              <div className="bg-secondary overflow-hidden relative group rounded-lg">
                <ImageWithFallback
                  src={img.url}
                  alt={img.caption || ''}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-white/10 rounded-full p-3">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>
                {enableDownload && (
                  <a
                    href={img.url}
                    download
                    className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 z-10"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Download image"
                    title="Download image"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                )}
              </div>
              {img.caption && (
                <figcaption className="text-[10px] tracking-widest uppercase mt-3 opacity-60">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
        {renderLightbox()}
      </>
    );
  }

  // Full Width Layout
  if (galleryStyle === 'fullwidth') {
    return (
      <>
        <div className="my-12 -mx-8 md:-mx-12 lg:-mx-24 space-y-4">
          {images.map((img, i) => (
            <figure key={i} className="cursor-pointer" onClick={() => openLightbox(i)}>
              <div className="w-full bg-secondary overflow-hidden relative group">
                <ImageWithFallback
                  src={img.url}
                  alt={img.caption || ''}
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-white/10 rounded-full p-4">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
                {enableDownload && (
                  <a
                    href={img.url}
                    download
                    className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 z-10"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Download image"
                    title="Download image"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                )}
              </div>
              {img.caption && (
                <figcaption className="text-[10px] tracking-widest uppercase mt-3 opacity-60 px-8 md:px-12 lg:px-24">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
        {renderLightbox()}
      </>
    );
  }

  return null;
}