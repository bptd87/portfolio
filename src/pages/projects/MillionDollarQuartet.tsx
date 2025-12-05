import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Theater, Sparkles, Eye, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { getAdjacentProjects } from '../../data/projects';

// Import rendering images
import rendering1 from 'figma:asset/a5cb25c8b2f4058dc306f7d75103a264af563599.png';
import rendering2 from 'figma:asset/381b6517a48b79fbfbf652bac15a489fe13e8b3b.png';
import rendering3 from 'figma:asset/5a7464b447a1d804d577473402b0892d3f07738a.png';

// Import production photos
import productionPhoto1 from 'figma:asset/2c1c79039cfd4381f506e8c95ec032cea353ba13.png';
import productionPhoto2 from 'figma:asset/1dd67e69fdd5a0741516d99d3a59a3554a271c32.png';
import productionPhoto3 from 'figma:asset/1921b31ce32721bc92d5131d0a24cf7cdef54171.png';
import productionPhoto4 from 'figma:asset/955fda01094944745b8a5ccc1dcad7c941103fda.png';

interface MillionDollarQuartetProps {
  onNavigate: (page: string) => void;
}

export function MillionDollarQuartet({ onNavigate }: MillionDollarQuartetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  
  // Get adjacent projects in the same category
  const { previous, next } = getAdjacentProjects('million-dollar-quartet');
  
  // Rendering images
  const renderings = [rendering1, rendering2, rendering3];
  
  // Production photos (up to 12)
  const productionPhotos = [productionPhoto1, productionPhoto2, productionPhoto3, productionPhoto4];
  
  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedPhoto === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedPhoto((prev) => 
          prev === null ? 0 : (prev - 1 + productionPhotos.length) % productionPhotos.length
        );
      } else if (e.key === 'ArrowRight') {
        setSelectedPhoto((prev) => 
          prev === null ? 0 : (prev + 1) % productionPhotos.length
        );
      } else if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);
  
  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % renderings.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [renderings.length]);
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % renderings.length);
  };
  
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + renderings.length) % renderings.length);
  };
  
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        {/* Back Button */}
        <button
          onClick={() => onNavigate('portfolio')}
          className="flex items-center gap-2 text-sm tracking-wide text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO PORTFOLIO
        </button>

        {/* Project Title */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight text-black dark:text-white mb-3">
            MILLION DOLLAR QUARTET
          </h1>
          <p className="text-sm tracking-wide text-black/60 dark:text-white/60">
            South Coast Rep — 2025
          </p>
        </div>

        {/* Main Content: Image Left (75%), Text Right (25%) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
          
          {/* Left: Renderings Carousel + Production Photos - Takes 3/4 of the space */}
          <div className="lg:col-span-3 space-y-8">
            <div className="aspect-[16/9] overflow-hidden bg-black dark:bg-black border border-black/10 dark:border-white/10 relative group">
              {/* Images */}
              <div className="relative w-full h-full">
                {renderings.map((rendering, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={rendering}
                      alt={`Million Dollar Quartet rendering ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 dark:bg-white/50 hover:bg-black/70 dark:hover:bg-white/70 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white dark:text-black" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 dark:bg-white/50 hover:bg-black/70 dark:hover:bg-white/70 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white dark:text-black" />
              </button>
              
              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {renderings.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-white w-6'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Production Photos - Stacked vertically at 75% width */}
            {productionPhotos.map((photo, index) => (
              <div 
                key={index} 
                className="overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 cursor-pointer group hover:border-accent-light dark:hover:border-accent-dark transition-all duration-300"
                onClick={() => setSelectedPhoto(index)}
              >
                <img
                  src={photo}
                  alt={`Million Dollar Quartet production photo ${index + 1}`}
                  className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            ))}
          </div>

          {/* Right: Text Content - Takes 1/4 of the space - Sticky on desktop */}
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24 lg:self-start">
            
            {/* Design Notes - Collapsible */}
            <div>
              <h3 className="tracking-tight text-black dark:text-white mb-4">
                DESIGN NOTES
              </h3>
              
              <div className="space-y-4 text-sm tracking-wide text-black/60 dark:text-white/60">
                <p className="text-justify">
                  The design invites audiences into Sun Records on the day Elvis Presley, Johnny Cash, Jerry Lee Lewis, 
                  and Carl Perkins came together for their legendary jam session. Collaborating with co–scenic designer 
                  Efren Delgadillo Jr., director James Moye, and associate director Kim Martin-Cotten, we balanced 
                  authenticity with theatricality—capturing both a Memphis studio's intimacy and the explosive energy 
                  of rock 'n' roll in the making.
                </p>
                
                {isExpanded && (
                  <>
                    <p className="text-justify">
                      The studio environment was detailed and grounded: wood floors, period recording equipment, and 
                      control-room windows lined with gold records. At the same time, theatrical elements heightened 
                      the impact of the music. Chief among these is an illuminated "SUN" sign—drawn from Elvis's concert 
                      signage—that turns the room into a stage for history, where the everyday suddenly feels iconic.
                    </p>
                    <p className="text-justify">
                      Our goal was to honor the spirit of collaboration at the heart of the play. The space is shaped to 
                      amplify relationships in the room—musicians facing one another, sharing energy, finding rhythm, and 
                      pushing boundaries. The set becomes not just a place to perform, but a portrait of how artists 
                      influence each other and, together, change the course of American music.
                    </p>
                  </>
                )}
              </div>
              
              {/* Read More Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-4 px-6 py-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white text-xs tracking-wider hover:bg-accent-light hover:text-white hover:border-accent-light dark:hover:bg-accent-dark dark:hover:text-black dark:hover:border-accent-dark transition-colors duration-300"
              >
                {isExpanded ? 'READ LESS' : 'READ MORE'}
              </button>
            </div>

            {/* Technical Specifications */}
            <div>
              <h3 className="tracking-tight text-black dark:text-white mb-4">
                TECHNICAL SPECS
              </h3>
              <div className="space-y-3 text-sm tracking-wide text-black/60 dark:text-white/60">
                <div>
                  <p className="text-black dark:text-white mb-1">VENUE</p>
                  <p>South Coast Repertory</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">STAGE TYPE</p>
                  <p>Proscenium</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">PRODUCTION YEAR</p>
                  <p>2025</p>
                </div>
              </div>
            </div>

            {/* Creative Team */}
            <div>
              <h3 className="tracking-tight text-black dark:text-white mb-4">
                CREATIVE TEAM
              </h3>
              <div className="space-y-3 text-sm tracking-wide text-black/60 dark:text-white/60">
                <div>
                  <p className="text-black dark:text-white mb-1">DIRECTOR</p>
                  <p>James Moye</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">ASSOCIATE DIRECTOR</p>
                  <p>Kim Martin-Cotten</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">MUSIC DIRECTOR</p>
                  <p>Wiley DeWeese</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">CO-SCENIC DESIGN</p>
                  <p>Brandon PT Davis & Efren Delgadillo Jr.</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">COSTUME DESIGN</p>
                  <p>Kish Finnegan</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">LIGHTING DESIGN</p>
                  <p>Lonnie Rafael Alcaraz</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">SOUND DESIGN</p>
                  <p>Jeff Polunas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Projects - Previous/Next Navigation */}
        <div className="border-t border-accent-light/20 dark:border-accent-dark/20 pt-16">
          <h3 className="tracking-tight text-black dark:text-white mb-8">
            RELATED PROJECTS
          </h3>
          
          {/* Top Row: 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Previous Project */}
            {previous ? (
              <button
                onClick={() => onNavigate('project', previous.id)}
                className="group text-left border border-black/10 dark:border-white/10 overflow-hidden hover:border-accent-brand transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="aspect-[16/9] bg-black/5 dark:bg-white/5 overflow-hidden">
                  {previous.cardImage && (
                    <img
                      src={previous.cardImage}
                      alt={previous.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4 bg-white dark:bg-black">
                  <p className="text-xs text-accent-brand mb-2 tracking-wider">PREVIOUS</p>
                  <h4 className="text-black dark:text-white mb-1">{previous.title}</h4>
                  <p className="text-sm text-black/60 dark:text-white/60">{previous.category}</p>
                </div>
              </button>
            ) : (
              <div className="border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5" />
            )}

            {/* Next Project */}
            {next ? (
              <button
                onClick={() => onNavigate('project', next.id)}
                className="group text-left border border-black/10 dark:border-white/10 overflow-hidden hover:border-accent-brand transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="aspect-[16/9] bg-black/5 dark:bg-white/5 overflow-hidden">
                  {next.cardImage && (
                    <img
                      src={next.cardImage}
                      alt={next.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4 bg-white dark:bg-black">
                  <p className="text-xs text-accent-brand mb-2 tracking-wider">NEXT</p>
                  <h4 className="text-black dark:text-white mb-1">{next.title}</h4>
                  <p className="text-sm text-black/60 dark:text-white/60">{next.category}</p>
                </div>
              </button>
            ) : (
              <div className="border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5" />
            )}

            {/* View All Projects */}
            <button
              onClick={() => onNavigate('portfolio')}
              className="group border border-black/10 dark:border-white/10 overflow-hidden hover:border-accent-brand transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              <div className="aspect-[16/9] flex items-center justify-center">
                <h4 className="tracking-wider text-center text-black/60 dark:text-white/60 group-hover:text-accent-brand transition-colors duration-300">VIEW ALL PROJECTS</h4>
              </div>
            </button>
          </div>

          {/* Bottom Row: 4 Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Scenic Design */}
            <button
              onClick={() => onNavigate('portfolio', 'scenic')}
              className="group border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-1"
            >
              <Theater className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-accent-brand flex-shrink-0 transition-colors duration-300" />
              <p className="text-sm text-black dark:text-white tracking-wide">Scenic Design</p>
            </button>

            {/* Experiential Design */}
            <button
              onClick={() => onNavigate('portfolio', 'experiential')}
              className="group border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-1"
            >
              <Sparkles className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-accent-brand flex-shrink-0 transition-colors duration-300" />
              <p className="text-sm text-black dark:text-white tracking-wide">Experiential Design</p>
            </button>

            {/* Rendering & Visualization */}
            <button
              onClick={() => onNavigate('portfolio', 'rendering')}
              className="group border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-1"
            >
              <Eye className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-accent-brand flex-shrink-0 transition-colors duration-300" />
              <p className="text-sm text-black dark:text-white tracking-wide">Rendering & Visualization</p>
            </button>

            {/* Design Documentation */}
            <button
              onClick={() => onNavigate('portfolio', 'documentation')}
              className="group border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-1"
            >
              <FileText className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-accent-brand flex-shrink-0 transition-colors duration-300" />
              <p className="text-sm text-black dark:text-white tracking-wide">Design Documentation</p>
            </button>
          </div>
        </div>

        {/* Lightbox Dialog for Production Photos */}
        <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="!max-w-none !w-screen !h-screen !p-0 !border-0 !rounded-none bg-black flex flex-col items-center justify-center">
            <DialogTitle className="sr-only">
              Production Photo {selectedPhoto !== null ? selectedPhoto + 1 : ''}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Full-size view of Million Dollar Quartet production photo
            </DialogDescription>
            
            {/* Image with Animated Transitions - Full Width */}
            <div className="flex-1 w-full flex items-center justify-center pt-20">
              <AnimatePresence mode="wait" initial={false}>
                {selectedPhoto !== null && (
                  <motion.img
                    key={selectedPhoto}
                    src={productionPhotos[selectedPhoto]}
                    alt={`Million Dollar Quartet production photo ${selectedPhoto + 1}`}
                    className="w-[95vw] h-auto max-h-[75vh] object-contain"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.45, 0, 0.55, 1], // Sine easing
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
            
            {/* Navigation Controls Below Image */}
            <div className="pb-12 flex flex-col items-center gap-6 z-50">
              {/* Navigation Arrows */}
              {selectedPhoto !== null && productionPhotos.length > 1 && (
                <div className="flex items-center gap-16">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto((prev) => 
                        prev === null ? 0 : (prev - 1 + productionPhotos.length) % productionPhotos.length
                      );
                    }}
                    className="transition-all duration-300 hover:scale-95"
                    aria-label="Previous image"
                  >
                    <ChevronLeft 
                      className="w-10 h-10 transition-colors duration-300" 
                      strokeWidth={1}
                      style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      onMouseEnter={(e) => {
                        const svg = e.currentTarget;
                        svg.style.color = 'oklch(0.75 0.14 85)';
                      }}
                      onMouseLeave={(e) => {
                        const svg = e.currentTarget;
                        svg.style.color = 'rgba(255, 255, 255, 0.6)';
                      }}
                    />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto((prev) => 
                        prev === null ? 0 : (prev + 1) % productionPhotos.length
                      );
                    }}
                    className="transition-all duration-300 hover:scale-95"
                    aria-label="Next image"
                  >
                    <ChevronRight 
                      className="w-10 h-10 transition-colors duration-300" 
                      strokeWidth={1}
                      style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      onMouseEnter={(e) => {
                        const svg = e.currentTarget;
                        svg.style.color = 'oklch(0.75 0.14 85)';
                      }}
                      onMouseLeave={(e) => {
                        const svg = e.currentTarget;
                        svg.style.color = 'rgba(255, 255, 255, 0.6)';
                      }}
                    />
                  </button>
                </div>
              )}
              
              {/* Image Counter */}
              {selectedPhoto !== null && (
                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <p className="text-sm text-white tracking-wider">
                    {selectedPhoto + 1} / {productionPhotos.length}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
