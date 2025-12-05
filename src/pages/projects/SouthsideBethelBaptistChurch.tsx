import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Theater, Sparkles, Eye, FileText, Church, MapPin, Calendar, User } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { getAdjacentProjects } from '../../data/projects';
import { SEO } from '../../components/SEO';

interface SouthsideBethelBaptistChurchProps {
  onNavigate: (page: string, projectSlug?: string) => void;
}

export function SouthsideBethelBaptistChurch({ onNavigate }: SouthsideBethelBaptistChurchProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  // Rendering images
  const renderings = [
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%204.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%201.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%202.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%203.jpeg'
  ];

  // Get adjacent projects for navigation
  const { previous: previousProject, next: nextProject } = getAdjacentProjects('southside-bethel-baptist-church');

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedPhoto === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedPhoto((prev) => 
          prev === null ? 0 : (prev - 1 + renderings.length) % renderings.length
        );
      } else if (e.key === 'ArrowRight') {
        setSelectedPhoto((prev) => 
          prev === null ? 0 : (prev + 1) % renderings.length
        );
      } else if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, renderings.length]);

  // Auto-advance carousel
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
    <>
      <SEO 
        metadata={{
          title: "Southside Bethel Baptist Church - Sacred Architecture | Brandon PT Davis",
          description: "Rendering project reimagining a historic church sanctuary, balancing reverence and functionality while modernizing the space for contemporary worship in a converted vaudeville theatre.",
          keywords: [
            'church design',
            'sacred architecture',
            'sanctuary rendering',
            'Vectorworks',
            'worship space',
            'interior design',
            'religious architecture',
            'Los Angeles',
            'Brandon PT Davis'
          ],
          ogType: 'article',
          ogImage: renderings[0],
          canonicalPath: '/portfolio/southside-bethel-baptist-church'
        }}
      />

      <div className="min-h-screen bg-white dark:bg-black">
        {/* Hero Carousel */}
        <div className="relative h-[60vh] bg-black overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={renderings[currentIndex]}
              alt={`Southside Bethel Baptist Church - Rendering ${currentIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          
          {/* Navigation Arrows */}
          {renderings.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 z-10"
                aria-label="Previous rendering"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 z-10"
                aria-label="Next rendering"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
          
          {/* Dots Indicator */}
          {renderings.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {renderings.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white w-8' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to rendering ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Back Button Overlay */}
          <button
            onClick={() => onNavigate('portfolio', 'experiential')}
            className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 transition-all duration-300 z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO PORTFOLIO
          </button>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          
          {/* Project Header */}
          <div className="border-b border-black/10 dark:border-white/10 pb-12 mb-16 md:mb-20">
            {/* Category Badges */}
            <div className="flex items-center gap-3 mb-8">
              <span className="px-3 py-1.5 bg-secondary border border-border text-xs tracking-wider text-muted-foreground uppercase">
                Experiential Design
              </span>
              <span className="px-3 py-1.5 bg-secondary border border-border text-xs tracking-wider text-muted-foreground uppercase">
                Sacred Architecture
              </span>
            </div>

            <h1 className="mb-6 text-black dark:text-white text-[60px]">
              Southside Bethel Baptist Church
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl leading-relaxed mb-12">
              Reimagining a historic sanctuary—where vaudeville theatre architecture meets sacred space—for contemporary worship and community gathering
            </p>

            {/* Project Info Boxes - Spanning Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Client</p>
                <p className="text-black dark:text-white">Southside Bethel Baptist Church</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Location</p>
                <p className="text-black dark:text-white">Los Angeles, CA</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Role</p>
                <p className="text-black dark:text-white">Interior Designer</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Year</p>
                <p className="text-black dark:text-white">2020</p>
              </div>
            </div>
          </div>

          {/* Project Overview */}
          <section className="mb-20 md:mb-24">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Project Overview</h2>
              <h3 className="text-black dark:text-white mb-8">
                Sacred Space in a Historic Theatre
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6">
                <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                  In 2020, Southside Bethel Baptist Church commissioned a comprehensive visualization study for their sanctuary—a <span className="text-accent-brand">sacred space housed within a historic vaudeville theatre</span> in Los Angeles.
                </p>
                <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                  The challenge was to honor both the building's theatrical heritage and its spiritual purpose—balancing reverence with functionality, tradition with technological integration, and permanence with adaptability.
                </p>
                <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                  This project represented a unique convergence of my theatrical design expertise and sacred architecture—requiring a design language rooted in <span className="text-accent-brand">symbolism, ceremonial movement</span>, and the shifting needs of contemporary worship.
                </p>
              </div>
              
              <div className="bg-secondary border border-border p-6 md:p-8">
                <h4 className="text-sm tracking-wider text-accent-brand mb-6 uppercase">Project Details</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Designer</span>
                    <span className="text-black dark:text-white">Brandon PT Davis</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Scope</span>
                    <span className="text-black dark:text-white">Rendering & Visualization, Interior Design</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Software</span>
                    <span className="text-black dark:text-white">Vectorworks</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Rendering & Visualization */}
          <section className="mb-20 md:mb-24">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Rendering & Visualization</h2>
              <h3 className="text-black dark:text-white mb-6">
                Design Strategy & Symbolism
              </h3>
            </div>
            
            <div className="space-y-6 mb-10 max-w-3xl">
              <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                The design centers on a commanding <span className="text-accent-brand">architectural focal point</span> behind the pulpit—a recessed, illuminated cross framed by clean vertical columns that draw the eye upward while grounding the liturgical space.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                A deliberate material and color palette—deep indigo walls, burgundy carpeting, polished brass detailing—creates warmth and gravitas, while integrated AV infrastructure and strategic lighting quietly support contemporary hybrid worship without visual distraction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderings.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhoto(index)}
                  className="group aspect-[4/3] overflow-hidden border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300"
                >
                  <img
                    src={image}
                    alt={`Southside Bethel Baptist Church - Rendering ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Impact & Reflection */}
          <section className="mb-20 md:mb-24">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Impact & Legacy</h2>
              <h3 className="text-black dark:text-white mb-6">
                Bridging Heritage and Renewal
              </h3>
            </div>
            
            <div className="space-y-6 max-w-3xl">
              <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                This project demonstrates how visualization can navigate the <span className="text-accent-brand">delicate balance between preservation and transformation</span>—honoring a building's past while enabling its evolution.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                By acknowledging the theatre's layered history while foregrounding sacred symbolism and contemporary functionality, the renderings articulate a future that respects both architectural heritage and congregational needs.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                Ultimately, this work reinforces the power of architectural visualization to clarify complex spatial challenges—proving that sacred spaces can serve both <span className="text-accent-brand">timeless ritual and evolving community</span> without compromise.
              </p>
            </div>
          </section>

          {/* Related Projects */}
          <div className="border-t border-black/10 dark:border-white/10 pt-16">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-2 uppercase">Related Projects</h2>
              <p className="text-xl md:text-2xl text-black/80 dark:text-white/80">Explore more from the portfolio</p>
            </div>
            
            {/* Top Row: 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Previous Project */}
              {previousProject ? (
                <button
                  onClick={() => onNavigate('project', previousProject.id)}
                  className="group text-left border border-black/10 dark:border-white/10 overflow-hidden hover:border-accent-brand transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  <div className="aspect-[16/9] bg-black/5 dark:bg-white/5 overflow-hidden">
                    {previousProject.cardImage && (
                      <img
                        src={previousProject.cardImage}
                        alt={previousProject.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4 bg-white dark:bg-black">
                    <p className="text-xs text-accent-brand mb-2 tracking-wider">PREVIOUS</p>
                    <h4 className="text-black dark:text-white mb-1">{previousProject.title}</h4>
                    <p className="text-sm text-black/60 dark:text-white/60">{previousProject.category}</p>
                  </div>
                </button>
              ) : (
                <div className="border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5" />
              )}

              {/* Next Project */}
              {nextProject ? (
                <button
                  onClick={() => onNavigate('project', nextProject.id)}
                  className="group text-left border border-black/10 dark:border-white/10 overflow-hidden hover:border-accent-brand transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  <div className="aspect-[16/9] bg-black/5 dark:bg-white/5 overflow-hidden">
                    {nextProject.cardImage && (
                      <img
                        src={nextProject.cardImage}
                        alt={nextProject.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4 bg-white dark:bg-black">
                    <p className="text-xs text-accent-brand mb-2 tracking-wider">NEXT</p>
                    <h4 className="text-black dark:text-white mb-1">{nextProject.title}</h4>
                    <p className="text-sm text-black/60 dark:text-white/60">{nextProject.category}</p>
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

          {/* Lightbox Dialog */}
          <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
            <DialogContent className="!max-w-none !w-screen !h-screen !p-0 !border-0 !rounded-none bg-black flex flex-col items-center justify-center">
              <DialogTitle className="sr-only">
                Rendering {selectedPhoto !== null ? selectedPhoto + 1 : ''}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Full-size view of Southside Bethel Baptist Church rendering
              </DialogDescription>
              
              {/* Image with Animated Transitions */}
              <div className="flex-1 w-full flex items-center justify-center pt-20">
                <AnimatePresence mode="wait">
                  {selectedPhoto !== null && (
                    <motion.img
                      key={selectedPhoto}
                      src={renderings[selectedPhoto]}
                      alt={`Southside Bethel Baptist Church - Rendering ${selectedPhoto + 1}`}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Controls */}
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto((prev) => 
                      prev === null ? 0 : (prev - 1 + renderings.length) % renderings.length
                    );
                  }}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 pointer-events-auto"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto((prev) => 
                      prev === null ? 0 : (prev + 1) % renderings.length
                    );
                  }}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 pointer-events-auto"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
                {selectedPhoto !== null && `${selectedPhoto + 1} / ${renderings.length}`}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
