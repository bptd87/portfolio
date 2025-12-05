import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Theater, Sparkles, Eye, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { getAdjacentProjects } from '../../data/projects';

interface AllMySonsProps {
  onNavigate: (page: string) => void;
}

export function AllMySons({ onNavigate }: AllMySonsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  
  // Get adjacent projects in the same category
  const { previous, next } = getAdjacentProjects('all-my-sons');
  
  // Rendering image
  const renderings = [
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/All%20My%20Sons/All%20My%20Sons_Sketch-5.jpeg'
  ];
  
  // Production photos
  const productionPhotos = [
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/All%20My%20Sons/All%20My%20Sons_4.jpg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/All%20My%20Sons/All%20My%20Sons-2.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/All%20My%20Sons/All%20My%20Sons-3.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/All%20My%20Sons/All%20My%20Sons-4.jpg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/All%20My%20Sons/All%20My%20Sons-6.jpg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/All%20My%20Sons/All%20My%20Sons-7.jpeg'
  ];
  
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
  
  // Auto-advance carousel (only if more than 1 rendering)
  useEffect(() => {
    if (renderings.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % renderings.length);
      }, 4000);
      
      return () => clearInterval(interval);
    }
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
            ALL MY SONS
          </h1>
          <p className="text-sm tracking-wide text-black/60 dark:text-white/60">
            Stephens College — October 2010
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
                      alt={`All My Sons rendering ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
              
              {/* Navigation Arrows - Only show if more than 1 rendering */}
              {renderings.length > 1 && (
                <>
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
                </>
              )}
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
                  alt={`All My Sons production photo ${index + 1}`}
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
                <p>
                  For All My Sons, I built a scenic world that embodies the idealized postwar "American Dream": 
                  a charming home with a wide porch and a neat, expansive backyard—a warm, welcoming environment 
                  that feels safe, comfortable, and complete.
                </p>
                
                <p>
                  Arthur Miller's play thrives on contrast, and this pristine domestic space becomes the stage 
                  for unraveling that illusion. The house signals prosperity while containing suppressed truths; 
                  as the story advances, the space feels increasingly haunted by what's been hidden—its very 
                  openness and order heighten the tension.
                </p>
                
                {isExpanded && (
                  <>
                    <p>
                      Subtle visual cues in layout and dressing suggest a world composed a bit too carefully, 
                      echoing emotional control and denial within the Keller family. The backyard, inviting at 
                      first, slowly shifts in tone, transforming into a site of confrontation and collapse.
                    </p>
                    <p>
                      The design supports these turns without tipping into overt symbolism. It gives actors the 
                      room to move between public performance and private revelation, reinforcing the stakes of 
                      each scene. The familiar setting grounds the audience in realism while its contrasts allow 
                      deeper truths to surface.
                    </p>
                    <p>
                      By embracing the aesthetics of postwar suburbia—and letting them fracture under pressure—the 
                      design highlights the moral dissonance at the center of Keller's world and the cost of 
                      building a future on denial.
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
                  <p>Stephens College Theatre</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">STAGE TYPE</p>
                  <p>Proscenium</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">PRODUCTION YEAR</p>
                  <p>2010</p>
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
                  <p className="text-black dark:text-white mb-1">WRITTEN BY</p>
                  <p>Arthur Miller</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">DIRECTED BY</p>
                  <p>Lamby Hedge</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">SCENIC DESIGN</p>
                  <p>Brandon PT Davis</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">COSTUME DESIGN</p>
                  <p>Kate Wood</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">LIGHTING DESIGN</p>
                  <p>Emily Swenson</p>
                </div>
                <div>
                  <p className="text-black dark:text-white mb-1">SOUND DESIGN</p>
                  <p>Michael Burke</p>
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
              Full-size view of All My Sons production photo
            </DialogDescription>
            
            {/* Image with Animated Transitions - Full Width */}
            <div className="flex-1 w-full flex items-center justify-center pt-20">
              <AnimatePresence mode="wait" initial={false}>
                {selectedPhoto !== null && (
                  <motion.img
                    key={selectedPhoto}
                    src={productionPhotos[selectedPhoto]}
                    alt={`All My Sons production photo ${selectedPhoto + 1}`}
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
