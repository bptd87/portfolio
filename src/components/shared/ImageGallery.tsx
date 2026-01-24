// Updated: 2025-11-28 - Design system unification (rounded-3xl, font-pixel)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageLightbox } from './ImageLightbox';

interface ImageGalleryProps {
  images: string[];
  captions?: string[];
  layout?: 'grid' | 'masonry' | 'showcase';
  title?: string;
}

export function ImageGallery({ images, captions, layout = 'grid', title }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <div>
      {title && (
        <h3 className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-4">{title}</h3>
      )}

      {/* Showcase layout - hero image + thumbnails */}
      {layout === 'showcase' && (
        <div className="space-y-4">
          {/* Main image */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => openLightbox(0)}
            className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-accent-brand transition-colors group"
          >
            <img
              src={images[0]}
              alt={captions?.[0] || 'Main image'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </motion.button>

          {/* Thumbnail grid */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {images.slice(1).map((image, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 1) * 0.05 }}
                  onClick={() => openLightbox(index + 1)}
                  className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-accent-brand transition-colors group"
                >
                  <img
                    src={image}
                    alt={captions?.[index + 1] || `Image ${index + 2}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Standard grid layout */}
      {layout === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {images.map((image, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => openLightbox(index)}
              className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-accent-brand transition-colors group"
            >
              <img
                src={image}
                alt={captions?.[index] || `Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Masonry layout */}
      {layout === 'masonry' && (
        <div className="columns-2 md:columns-3 gap-3 md:gap-4 space-y-3 md:space-y-4">
          {images.map((image, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => openLightbox(index)}
              className="relative w-full break-inside-avoid rounded-3xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-accent-brand transition-colors group mb-3 md:mb-4"
            >
              <img
                src={image}
                alt={captions?.[index] || `Image ${index + 1}`}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={nextImage}
          onPrevious={previousImage}
          captions={captions}
        />
      )}
    </div>
  );
}