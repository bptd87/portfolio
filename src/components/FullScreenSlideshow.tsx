import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideshowProject {
  id: string;
  title: string;
  venue: string;
  location: string;
  year: number;
  category: string;
  subcategory: string;
  cardImage?: string;
  image?: string;
  slug: string;
}

interface FullScreenSlideshowProps {
  projects: SlideshowProject[];
  onProjectClick: (slug: string) => void;
}

export function FullScreenSlideshow({ projects, onProjectClick }: FullScreenSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, projects.length]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Enter' && projects[currentIndex]) {
        onProjectClick(projects[currentIndex].slug);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, projects]);

  if (projects.length === 0) {
    return null;
  }

  const currentProject = projects[currentIndex];
  const projectImage = currentProject.cardImage || currentProject.image;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* Slideshow Container */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="absolute inset-0 cursor-pointer"
          onClick={() => onProjectClick(currentProject.slug)}
        >
          {/* Background Image */}
          {projectImage ? (
            <div className="absolute inset-0">
              <img
                src={projectImage}
                alt={currentProject.title}
                className="w-full h-full object-cover"
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-theatrical-gold/20 to-black" />
          )}

          {/* Project Information - Bottom Left */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="absolute bottom-0 left-0 right-0 p-8 md:p-12"
          >
            {/* Category Badge */}
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 text-[10px] tracking-[0.2em] uppercase">
                {currentProject.subcategory}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl text-white/90 mb-2 tracking-tight">
              {currentProject.title}
            </h1>

            {/* Venue & Year */}
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-white/50 text-xs tracking-wide">
              <span>{currentProject.venue}</span>
              <span className="hidden md:inline">·</span>
              <span>{currentProject.location}</span>
              <span className="hidden md:inline">·</span>
              <span>{currentProject.year}</span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
        aria-label="Previous project"
      >
        <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
        aria-label="Next project"
      >
        <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
      </button>

      {/* Counter - Moved down to avoid navbar */}
      <div className="absolute top-28 md:top-32 right-8 md:right-12 z-10 text-white/60 text-sm tracking-widest">
        {String(currentIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
      </div>
    </div>
  );
}