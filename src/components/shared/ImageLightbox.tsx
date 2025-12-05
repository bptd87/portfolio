import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  captions?: string[];
}

export function ImageLightbox({ 
  images, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrevious,
  captions 
}: ImageLightboxProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrevious();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 md:top-8 md:right-8 z-50 p-2 text-white hover:text-accent-brand transition-colors"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Image counter */}
      <div className="fixed top-4 left-4 md:top-8 md:left-8 z-50 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="fixed left-4 md:left-8 z-50 p-3 text-white hover:text-accent-brand transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="fixed right-4 md:right-8 z-50 p-3 text-white hover:text-accent-brand transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={captions?.[currentIndex] || `Image ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Caption */}
      {captions?.[currentIndex] && (
        <div className="fixed bottom-8 left-0 right-0 text-center px-4">
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
            {captions[currentIndex]}
          </p>
        </div>
      )}
    </motion.div>
  );
}