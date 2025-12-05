import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Theater, Sparkles, Eye, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { getAdjacentProjects } from '../../data/projects';
import { SEO } from '../../components/SEO';

interface NewSwanVenueFileProps {
  onNavigate: (page: string, projectSlug?: string) => void;
}

export function NewSwanVenueFile({ onNavigate }: NewSwanVenueFileProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const { previous: previousProject, next: nextProject } = getAdjacentProjects('new-swan-venue-file');

  const renderings = [
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/New%20Swan%20Venue%20File/Rendering_New+Swan+Venue_1%20Large%20Large.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/New%20Swan%20Venue%20File/Rendering_New+Swan+Venue_2%20Large%20Large.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/New%20Swan%20Venue%20File/Rendering_New+Swan+Venue_3%20Large%20Large.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/New%20Swan%20Venue%20File/Rendering_New+Swan+Venue_4%20Large%20Large.jpeg'
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
          title: "New Swan Theatre Venue File - Technical Documentation | Brandon PT Davis",
          description: "Comprehensive technical documentation and 3D modeling for the New Swan Theatre venue, supporting festival operations and design planning.",
          keywords: [
            'New Swan Theatre',
            'venue file',
            'technical documentation',
            'theatre design',
            'Vectorworks',
            '3D modeling',
            'Brandon PT Davis'
          ],
          ogType: 'article',
          ogImage: renderings[0],
          canonicalPath: '/portfolio/new-swan-venue-file'
        }}
      />

      <div className="min-h-screen bg-white dark:bg-black">
        {/* Hero Carousel */}
        <div className="relative h-[60vh] bg-black overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={renderings[currentIndex]}
              alt={`New Swan Theatre - Rendering ${currentIndex + 1}`}
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
            <div className="flex items-center gap-3 mb-8">
              <span className="px-3 py-1.5 bg-secondary border border-border text-xs tracking-wider text-muted-foreground uppercase">
                Design Documentation
              </span>
              <span className="px-3 py-1.5 bg-secondary border border-border text-xs tracking-wider text-muted-foreground uppercase">
                Technical Theatre
              </span>
            </div>

            <h1 className="mb-6 text-black dark:text-white">
              New Swan Theatre Festival Venue File
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl leading-relaxed mb-12">
              Comprehensive technical documentation creating a digital twin of the festival's primary venue for design planning and operational support
            </p>

            {/* Project Info Boxes - Spanning Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Festival</p>
                <p className="text-black dark:text-white">New Swan Theatre Festival</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Location</p>
                <p className="text-black dark:text-white">Irvine, CA</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Role</p>
                <p className="text-black dark:text-white">Technical Documentation</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Year</p>
                <p className="text-black dark:text-white">2022</p>
              </div>
            </div>
          </div>

          {/* Project Overview */}
          <section className="mb-20 md:mb-24">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Project Overview</h2>
              <h3 className="text-black dark:text-white mb-8">
                Creating a Digital Foundation
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6">
                <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                  The <span className="text-accent-brand">New Swan Theatre Festival Venue File</span> represents a comprehensive technical documentation project—creating an accurate, production-ready 3D model of the festival's primary performance venue.
                </p>
                <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                  This digital infrastructure enables visiting designers to preplan their work remotely, supports accurate load-in scheduling, and provides the festival with a permanent archival record of their theatrical space.
                </p>
                <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                  The venue file serves as both <span className="text-accent-brand">design tool and institutional asset</span>—streamlining creative workflows while documenting the architectural realities of a constantly evolving festival venue.
                </p>
              </div>
              
              <div className="bg-secondary border border-border p-6 md:p-8">
                <h4 className="text-sm tracking-wider text-accent-brand mb-6 uppercase">Technical Scope</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Deliverables</span>
                    <span className="text-black dark:text-white">3D Model, 2D Plans, Sections</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Software</span>
                    <span className="text-black dark:text-white">Vectorworks</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Purpose</span>
                    <span className="text-black dark:text-white">Festival Operations & Design Planning</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Documentation */}
          <section className="mb-20 md:mb-24">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Technical Documentation</h2>
              <h3 className="text-black dark:text-white mb-6">
                Precision Modeling & Spatial Analysis
              </h3>
            </div>
            
            <div className="space-y-6 mb-10 max-w-3xl">
              <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                The venue file workflow involved <span className="text-accent-brand">field measurement verification</span>, photographic documentation, and systematic modeling of architectural elements, technical infrastructure, and spatial constraints.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                Every architectural detail—from overhead rigging positions to floor pocket locations—was documented with production-level accuracy, ensuring that designers working remotely have reliable spatial data.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                The 3D model includes full sightline studies, clearance documentation, and technical specifications that transform abstract space into actionable design intelligence.
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
                    alt={`New Swan Theatre Documentation ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Impact & Legacy */}
          <section className="mb-20 md:mb-24">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Impact & Application</h2>
              <h3 className="text-black dark:text-white mb-6">
                Infrastructure for Collaborative Design
              </h3>
            </div>
            
            <div className="space-y-6 max-w-3xl">
              <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                This venue file has become essential festival infrastructure—used by multiple visiting designers each season to <span className="text-accent-brand">preplan productions remotely</span>, reducing time spent on-site and enabling more ambitious design work within compressed festival schedules.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                The documentation also serves technical directors and production managers, providing clear spatial data for load-in planning, strike coordination, and equipment placement—reducing costly miscommunication and spatial conflicts.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                Beyond immediate utility, the project demonstrates how <span className="text-accent-brand">thoughtful technical documentation</span> can elevate an entire organization's design capacity—proving that infrastructure work, though unglamorous, has profound creative impact.
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
                Technical Documentation {selectedPhoto !== null ? selectedPhoto + 1 : ''}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Full-size view of New Swan Theatre venue documentation
              </DialogDescription>
              
              <div className="flex-1 w-full flex items-center justify-center pt-20">
                <AnimatePresence mode="wait">
                  {selectedPhoto !== null && (
                    <motion.img
                      key={selectedPhoto}
                      src={renderings[selectedPhoto]}
                      alt={`New Swan Theatre - Documentation ${selectedPhoto + 1}`}
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
