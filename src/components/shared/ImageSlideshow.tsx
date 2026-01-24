// Updated: 2025-11-28 - Design system unification (rounded-3xl, font-pixel)
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageSlideshowProps {
  images: string[];
  captions?: string[];
  onImageClick?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function ImageSlideshow({ images, captions, onImageClick, autoPlay = true, autoPlayInterval = 4000, showControls = true, mode = 'contain' }: ImageSlideshowProps & { showControls?: boolean; mode?: 'contain' | 'cover' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  if (!images || images.length === 0) return null;

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || images.length === 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length, isPaused]);

  // Preload next image
  const nextIndex = (currentIndex + 1) % images.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Single image - no controls
  if (images.length === 1) {
    return (
      <div className={`relative w-full rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-hidden group ${mode === 'cover' ? 'h-full' : ''}`}>
        <img
          src={images[0]}
          alt={captions?.[0] || 'Image'}
          className={`${mode === 'cover' ? 'w-full h-full object-cover' : 'w-full h-auto'} cursor-pointer transition-transform duration-700 group-hover:scale-105`}
          onClick={() => onImageClick?.(0)}
        />
        {onImageClick && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <ZoomIn className="w-8 h-8 opacity-0 group-hover:opacity-60 transition-opacity" />
          </div>
        )}
        {captions?.[0] && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 text-white text-sm">
            {captions[0]}
          </div>
        )}
      </div>
    );
  }

  // Double-buffer rendering for "cover" mode (Cinematic Cross-fade)
  if (mode === 'cover') {
    return (
      <div className="relative w-full h-full">
        <img src={images[nextIndex]} alt="" className="hidden" />

        <div className="relative w-full h-full rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-hidden group">
          {/* Background Layer (Previous Image) - Always Opaque */}
          <img
            src={images[previousIndex]}
            alt=""
            className="w-full h-full object-cover absolute inset-0 z-0"
          />

          {/* Foreground Layer (Current Image) - Fades In */}
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={captions?.[currentIndex] || `Image ${currentIndex + 1}`}
            className="w-full h-full object-cover absolute inset-0 z-10"
            onClick={() => onImageClick?.(currentIndex)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            onAnimationComplete={() => {
              setPreviousIndex(currentIndex);
            }}
          />

          {/* Overlays */}
          {onImageClick && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none z-20">
              <ZoomIn className="w-8 h-8 opacity-0 group-hover:opacity-60 transition-opacity" />
            </div>
          )}

          {captions?.[currentIndex] && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 text-white text-sm z-20">
              {captions[currentIndex]}
            </div>
          )}

          {showControls && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all group/btn opacity-0 group-hover:opacity-100 z-30"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 group-hover/btn:text-accent-brand transition-colors" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all group/btn opacity-0 group-hover:opacity-100 z-30"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 group-hover/btn:text-accent-brand transition-colors" />
              </button>
            </>
          )}

          <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white font-pixel text-[10px] tracking-[0.3em] z-20">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {showControls && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 border border-black/20 dark:border-white/20 transition-all ${index === currentIndex
                  ? 'bg-accent-brand border-accent-brand w-6'
                  : 'bg-transparent hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Standard "contain" mode (Original Logic)
  return (
    <div className="relative w-full">
      {/* Main image area */}
      <div className="relative w-full rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={captions?.[currentIndex] || `Image ${currentIndex + 1}`}
            className="w-full h-auto cursor-pointer"
            onClick={() => onImageClick?.(currentIndex)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Zoom icon */}
        {onImageClick && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
            <ZoomIn className="w-8 h-8 opacity-0 group-hover:opacity-60 transition-opacity" />
          </div>
        )}

        {/* Caption */}
        {captions?.[currentIndex] && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 text-white text-sm">
            {captions[currentIndex]}
          </div>
        )}

        {/* Navigation arrows */}
        {showControls && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all group/btn opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 group-hover/btn:text-accent-brand transition-colors" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all group/btn opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 group-hover/btn:text-accent-brand transition-colors" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white font-pixel text-[10px] tracking-[0.3em]">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Dots navigation */}
      {showControls && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 border border-black/20 dark:border-white/20 transition-all ${index === currentIndex
                ? 'bg-accent-brand border-accent-brand w-6'
                : 'bg-transparent hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}