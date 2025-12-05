import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Theater, Sparkles, Eye, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { getAdjacentProjects } from '../../data/projects';
import { SEO } from '../../components/SEO';
import { LikeButton } from '../../components/shared/LikeButton';
import { ShareButton } from '../../components/shared/ShareButton';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface RedLineCafeProps {
  onNavigate: (page: string, filter?: string) => void;
}

export function RedLineCafe({ onNavigate }: RedLineCafeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  
  const { previous, next } = getAdjacentProjects('red-line-cafe');

  // Track view on page load
  useEffect(() => {
    const incrementView = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/red-line-cafe/view`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        const data = await response.json();
        if (data.success) {
          setViews(data.views);
          setLikes(data.likes);
        }
      } catch (err) {
        }
    };
    
    incrementView();
  }, []);
  
  const renderings = [
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Rendering%20in%20Vectorworks%20by%20Brandon%20PT%20Davis%20-%201.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Rendering%20in%20Vectorworks%20by%20Brandon%20PT%20Davis%20-%202.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Rendering%20in%20Vectorworks%20by%20Brandon%20PT%20Davis%20-%203.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Rendering%20in%20Vectorworks%20by%20Brandon%20PT%20Davis%20-%204.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Rendering%20in%20Vectorworks%20by%20Brandon%20PT%20Davis%20-%205.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Rendering%20in%20Vectorworks%20by%20Brandon%20PT%20Davis%20-%206.jpeg'
  ];
  
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
          title: "Red Line Cafe - Experiential Dining Space | Brandon PT Davis",
          description: "Speculative design for an urban café environment that integrates industrial aesthetics with intimate gathering space.",
          keywords: [
            'Red Line Cafe',
            'experiential design',
            'cafe design',
            'interior design',
            'Vectorworks',
            'rendering',
            'Brandon PT Davis'
          ],
          ogType: 'article',
          ogImage: renderings[0],
          canonicalPath: '/portfolio/red-line-cafe'
        }}
      />

      <div className="min-h-screen bg-white dark:bg-black">
        {/* Hero Carousel */}
        <div className="relative h-[60vh] bg-black overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={renderings[currentIndex]}
              alt={`Red Line Cafe - Rendering ${currentIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          
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

          <button
            onClick={() => onNavigate('portfolio')}
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
            <div className="flex items-center gap-3 mb-8">
              <span className="px-3 py-1.5 bg-secondary border border-border text-xs tracking-wider text-muted-foreground uppercase">
                Experiential Design
              </span>
              <span className="px-3 py-1.5 bg-secondary border border-border text-xs tracking-wider text-muted-foreground uppercase">
                Interior Design
              </span>
            </div>
            
            <h1 className="mb-6 text-black dark:text-white text-[60px]">
              Red Line Cafe
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl leading-relaxed mb-12">
              A speculative urban café where industrial materiality meets intimate gathering space—designed for connection and community
            </p>
            
            {/* Engagement Bar */}
            <div className="flex items-center justify-between mb-12 pb-8 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-6">
                <LikeButton projectId="red-line-cafe" initialLikes={likes} size="lg" />
                
                <div className="flex items-center gap-2 text-sm tracking-wide opacity-60">
                  <Eye className="w-5 h-5" />
                  <span>{views.toLocaleString()} views</span>
                </div>
              </div>
              
              <ShareButton 
                title="Red Line Cafe - Brandon PT Davis"
                description="A speculative urban café where industrial materiality meets intimate gathering space—designed for connection and community"
                size="lg"
              />
            </div>
            
            {/* Project Info Boxes - Spanning Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Type</p>
                <p className="text-black dark:text-white">Speculative Design</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Context</p>
                <p className="text-black dark:text-white">Urban Café</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Role</p>
                <p className="text-black dark:text-white">Designer & Visualizer</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Year</p>
                <p className="text-black dark:text-white">2021</p>
              </div>
            </div>
          </div>

          {/* Project Overview */}
          <section className="mb-20 md:mb-24">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Project Overview</h2>
              <h3 className="text-black dark:text-white mb-8">
                Industrial Warmth in Urban Context
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6">
                <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                  <span className="text-accent-brand">Red Line Cafe</span> emerged as a speculative design exercise exploring how urban dining environments can balance industrial materiality with human-scaled intimacy.
                </p>
                <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                  The concept centers on creating a gathering space that feels authentic and unpretentious—eschewing overly polished aesthetics in favor of honest materials, visible structure, and flexible social configurations.
                </p>
                <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                  Through careful <span className="text-accent-brand">spatial zoning</span> and material choices, the design proposes an environment where patrons can work independently, gather communally, or transition fluidly between both modes.
                </p>
              </div>
              
              <div className="bg-secondary border border-border p-6 md:p-8">
                <h4 className="text-sm tracking-wider text-accent-brand mb-6 uppercase">Design Principles</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Materials</span>
                    <span className="text-black dark:text-white">Exposed Brick, Steel, Reclaimed Wood</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Lighting</span>
                    <span className="text-black dark:text-white">Industrial Pendants, Ambient Layers</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Software</span>
                    <span className="text-black dark:text-white">Vectorworks</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Design Strategy */}
          <section className="mb-20 md:mb-24">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Design Strategy</h2>
              <h3 className="text-black dark:text-white mb-6">
                Layering Flexibility and Permanence
              </h3>
            </div>
            
            <div className="space-y-6 mb-10 max-w-3xl">
              <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                The design strategy embraces <span className="text-accent-brand">material honesty</span>—exposed mechanical systems, unfinished concrete, industrial lighting fixtures—creating visual texture through function rather than decoration.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                Seating configurations range from communal high-top tables to intimate two-person nooks, offering spatial variety that accommodates different social dynamics throughout the day.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                Warm wood accents and strategic lighting soften the industrial palette, ensuring the environment feels welcoming rather than cold—a space where people want to linger, not just pass through.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderings.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhoto(index)}
                  className="group aspect-[3/2] overflow-hidden border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300"
                >
                  <img
                    src={image}
                    alt={`Red Line Cafe Rendering ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Impact & Reflection */}
          <section className="mb-20 md:mb-24">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Design Reflection</h2>
              <h3 className="text-black dark:text-white mb-6">
                Experiential Dining as Urban Infrastructure
              </h3>
            </div>
            
            <div className="space-y-6 max-w-3xl">
              <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                Though speculative, <span className="text-accent-brand">Red Line Cafe</span> explores broader questions about how urban dining environments function as social infrastructure—places where strangers become regulars, and routine transactions evolve into community rituals.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                The visualizations demonstrate how architectural design can shape social behavior through spatial organization, material choice, and lighting strategy—proving that experiential design extends beyond spectacle into the everyday.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                This project reinforced my belief that successful experiential environments aren't always grand gestures—sometimes they're <span className="text-accent-brand">quiet, considered spaces that simply feel right</span>, supporting human needs without demanding attention.
              </p>
            </div>
          </section>

          {/* Related Projects */}
          <div className="border-t border-black/10 dark:border-white/10 pt-16">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-2 uppercase">Related Projects</h2>
              <p className="text-xl md:text-2xl text-black/80 dark:text-white/80">Explore more from the portfolio</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

              <button
                onClick={() => onNavigate('portfolio')}
                className="group border border-black/10 dark:border-white/10 overflow-hidden hover:border-accent-brand transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="aspect-[16/9] flex items-center justify-center">
                  <h4 className="tracking-wider text-center text-black/60 dark:text-white/60 group-hover:text-accent-brand transition-colors duration-300">VIEW ALL PROJECTS</h4>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => onNavigate('portfolio', 'scenic')}
                className="group border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-1"
              >
                <Theater className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-accent-brand flex-shrink-0 transition-colors duration-300" />
                <p className="text-sm text-black dark:text-white tracking-wide">Scenic Design</p>
              </button>

              <button
                onClick={() => onNavigate('portfolio', 'experiential')}
                className="group border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-1"
              >
                <Sparkles className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-accent-brand flex-shrink-0 transition-colors duration-300" />
                <p className="text-sm text-black dark:text-white tracking-wide">Experiential Design</p>
              </button>

              <button
                onClick={() => onNavigate('portfolio', 'rendering')}
                className="group border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300 p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-1"
              >
                <Eye className="w-5 h-5 text-black/60 dark:text-white/60 group-hover:text-accent-brand flex-shrink-0 transition-colors duration-300" />
                <p className="text-sm text-black dark:text-white tracking-wide">Rendering & Visualization</p>
              </button>

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
                Full-size view of Red Line Cafe rendering
              </DialogDescription>
              
              <div className="flex-1 w-full flex items-center justify-center pt-20">
                <AnimatePresence mode="wait">
                  {selectedPhoto !== null && (
                    <motion.img
                      key={selectedPhoto}
                      src={renderings[selectedPhoto]}
                      alt={`Red Line Cafe - Rendering ${selectedPhoto + 1}`}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </div>

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