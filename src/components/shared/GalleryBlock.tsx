'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { CloudinaryImage } from './CloudinaryImage';

interface GalleryBlockProps {
  images: { url: string; caption?: string }[];
  accentColor?: string;
  galleryStyle?: 'grid' | 'carousel' | 'masonry' | 'fullwidth';
  enableDownload?: boolean;
}

export function GalleryBlock({ images, accentColor, galleryStyle }: GalleryBlockProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = React.useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!images || images.length === 0) return null;

  if (galleryStyle === 'grid' || galleryStyle === 'masonry') {
    return (
      <div className="my-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div key={index} className="flex flex-col gap-2">
            <figure className="relative aspect-[3/2] overflow-hidden rounded-lg bg-foreground/5 group cursor-pointer">
              <CloudinaryImage
                src={img.url}
                alt={img.caption || `Gallery Image ${index + 1}`}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </figure>
            {img.caption && (
              <figcaption className="text-xs font-serif italic text-foreground/60 text-center px-2">
                {img.caption}
              </figcaption>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative my-12 group">
      <div className="overflow-hidden rounded-lg aspect-[3/2] bg-foreground/5 relative" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {images.map((img, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative">
              <div className="w-full h-full relative aspect-[3/2]">
                <CloudinaryImage
                  src={img.url}
                  alt={img.caption || `Gallery Image ${index + 1}`}
                  fill
                  className="object-contain w-full h-full absolute inset-0"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 disabled:opacity-0 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 disabled:opacity-0 z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2 h-2 rounded-full backdrop-blur-sm transition-all duration-300 ${index === selectedIndex ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/70'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Caption for active slide */}
      {images[selectedIndex]?.caption && (
        <div className="mt-4 text-center">
          <figcaption className="text-sm font-serif italic text-foreground/60 px-4">
            {images[selectedIndex].caption}
          </figcaption>
        </div>
      )}
    </div>
  );
}