import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Theater, Sparkles, Eye, FileText, Briefcase, MapPin, Calendar, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { getAdjacentProjects } from '../../data/projects';

interface ParkAndShopProps {
  onNavigate: (page: string, filter?: string) => void;
}

export function ParkAndShop({ onNavigate }: ParkAndShopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [galleryType, setGalleryType] = useState<'rendering' | 'documentation'>('rendering');
  
  // Get adjacent projects in the same category
  const { previous, next } = getAdjacentProjects('park-and-shop');
  
  // Rendering Images
  const renderings = [
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Park%20&%20Shop/Pak%20&%20Shop%20Rendering%20by%20Brandon%20PT%20Davis%20-%202.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Park%20&%20Shop/Pak%20&%20Shop%20Rendering%20by%20Brandon%20PT%20Davis%20-%203.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Park%20&%20Shop/Pak%20&%20Shop%20Rendering%20by%20Brandon%20PT%20Davis%20-%201.jpeg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Park%20&%20Shop/Pak%20&%20Shop%20Rendering%20by%20Brandon%20PT%20Davis%20-%204.jpeg'
  ];

  // Design Documentation Images
  const documentation = [
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Park%20&%20Shop/Pak%20&%20Shop%20Scenic%20Drafting%20by%20Brandon%20PT%20Davis%20-%201.jpg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Park%20&%20Shop/Pak%20&%20Shop%20Scenic%20Drafting%20by%20Brandon%20PT%20Davis%20-%202.jpg'
  ];

  const currentGallery = galleryType === 'rendering' ? renderings : documentation;
  
  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedPhoto === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedPhoto((prev) => 
          prev === null ? 0 : (prev - 1 + currentGallery.length) % currentGallery.length
        );
      } else if (e.key === 'ArrowRight') {
        setSelectedPhoto((prev) => 
          prev === null ? 0 : (prev + 1) % currentGallery.length
        );
      } else if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, currentGallery.length]);
  
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
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-black overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={renderings[currentIndex]}
            alt={`Park & Shop - Rendering ${currentIndex + 1}`}
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
        <div className="border-b border-black/10 dark:border-white/10 pb-16 mb-16 md:mb-20">
          {/* Category Badges */}
          <div className="flex items-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border">
              <Briefcase className="w-3.5 h-3.5 text-accent-brand" />
              <span className="text-xs tracking-wider text-muted-foreground uppercase">
                Experiential Design
              </span>
            </div>
            <span className="px-3 py-1.5 bg-secondary border border-border text-xs tracking-wider text-muted-foreground uppercase">
              Commercial
            </span>
          </div>
          
          <h1 className="mb-6 text-black dark:text-white text-[60px]">
            Park & Shop
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl leading-relaxed mb-12">
            A mid-century beautification initiative that celebrates heritage while reimagining the future of commercial retail space
          </p>
          
          {/* Project Info Boxes - Spanning Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary border border-border p-4">
              <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Client</p>
              <p className="text-black dark:text-white">Contra Costa Properties</p>
            </div>
            <div className="bg-secondary border border-border p-4">
              <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Location</p>
              <p className="text-black dark:text-white">Concord, CA</p>
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
              Revitalizing a Mid-Century Landmark
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-6">
              <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                In 2021, Contra Costa Properties commissioned a comprehensive visualization study for <span className="text-accent-brand">Park n' Shop</span>, a landmark mid-century retail center in Concord, California.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                The proposal—presented to the City of Concord as part of a broader beautification initiative—sought to honor the site's architectural heritage while positioning it for contemporary commercial success.
              </p>
            </div>
            
            <div className="bg-secondary border border-border p-6 md:p-8">
              <h4 className="text-sm tracking-wider text-accent-brand mb-6 uppercase">Project Scope</h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <span className="text-black/40 dark:text-white/40 min-w-[100px]">Scope</span>
                  <span className="text-black dark:text-white">Rendering & Visualization, Concept Design</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-black/40 dark:text-white/40 min-w-[100px]">Designer</span>
                  <span className="text-black dark:text-white">Brandon PT Davis</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-black/40 dark:text-white/40 min-w-[100px]">Collaborator</span>
                  <span className="text-black dark:text-white">Gretchen Ugalde ❤️</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Documentation */}
        <section className="mb-20 md:mb-24">
          <div className="mb-10">
            <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Video Documentation</h2>
            <h3 className="text-black dark:text-white mb-6">
              Design Walkthrough
            </h3>
          </div>
          
          <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify mb-8 max-w-3xl">
            This walkthrough documents the design proposal in motion—revealing how mid-century architectural gestures can coexist with contemporary commercial infrastructure, creating a space that feels both timeless and forward-thinking.
          </p>
          
          <div className="aspect-video bg-black border border-black/10 dark:border-white/10 overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/8crPwdAxKxc"
              title="Park & Shop - Concept Design Visualization"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        {/* Rendering */}
        <section className="mb-20 md:mb-24">
          <div className="mb-10">
            <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Rendering & Visualization</h2>
            <h3 className="text-black dark:text-white mb-6">
              Bringing the Vision to Life
            </h3>
          </div>
          
          <div className="space-y-6 mb-10 max-w-3xl">
            <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
              Working in close collaboration with Gretchen Ugalde, I developed precise <span className="text-accent-brand">architectural models in Vectorworks</span>, then transitioned them into Twinmotion for photorealistic rendering.
            </p>
            <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
              This workflow enabled us to produce visualizations that communicate more than physical improvements—they convey atmosphere, experience, and the emotional resonance of place.
            </p>
            <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
              Each rendering was carefully composed to feel inviting, functional, and deeply rooted in community—balancing commercial viability with authentic mid-century character.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderings.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setGalleryType('rendering');
                  setSelectedPhoto(index);
                }}
                className="group aspect-[3/2] overflow-hidden border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300"
              >
                <img
                  src={image}
                  alt={`Park & Shop Rendering ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>

        {/* Design Documentation */}
        <section className="mb-20 md:mb-24">
          <div className="mb-10">
            <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Design Documentation</h2>
            <h3 className="text-black dark:text-white mb-6">
              Visual Strategy & Details
            </h3>
          </div>
          
          <div className="space-y-6 mb-10 max-w-3xl">
            <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
              The design strategy emphasized <span className="text-accent-brand">clarity over complexity</span>—incorporating bold signage, geometric simplicity, and unapologetically mid-century commercial aesthetics that honor the center's DNA while meeting today's retail standards.
            </p>
            <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
              Carefully considered color palettes and lighting choreography work in concert to energize the environment, creating an identity that feels simultaneously nostalgic and refreshingly current.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentation.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setGalleryType('documentation');
                  setSelectedPhoto(index);
                }}
                className="group aspect-[3/2] overflow-hidden border border-black/10 dark:border-white/10 hover:border-accent-brand transition-all duration-300"
              >
                <img
                  src={image}
                  alt={`Park & Shop Design Documentation ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>

        {/* Concepts & Impact */}
        <section className="mb-20 md:mb-24">
          <div className="mb-10">
            <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Impact & Legacy</h2>
            <h3 className="text-black dark:text-white mb-6">
              Bridging Heritage and Innovation
            </h3>
          </div>
          
          <div className="space-y-6 max-w-3xl">
            <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
              By grounding these renderings in authentic environmental context—populated with vehicles, landscaping, and human activity—we enabled stakeholders to <span className="text-accent-brand">see the improvements as lived experience</span> rather than abstract architectural gesture.
            </p>
            <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
              The visualizations functioned simultaneously as visioning tools and advocacy instruments, facilitating productive dialogue around community investment, economic development, and historic preservation.
            </p>
            <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
              Ultimately, this project demonstrates how architectural visualization can bridge design intent and public understanding—proving that Concord's mid-century retail landmark can <span className="text-accent-brand">evolve without erasure</span>, honoring its past while embracing its future.
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

        {/* Lightbox Dialog */}
        <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="!max-w-none !w-screen !h-screen !p-0 !border-0 !rounded-none bg-black flex flex-col items-center justify-center">
            <DialogTitle className="sr-only">
              {galleryType === 'rendering' ? 'Rendering' : 'Design Documentation'} {selectedPhoto !== null ? selectedPhoto + 1 : ''}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Full-size view of Park & Shop {galleryType === 'rendering' ? 'rendering' : 'design documentation'}
            </DialogDescription>
            
            {/* Image with Animated Transitions */}
            <div className="flex-1 w-full flex items-center justify-center pt-20">
              <AnimatePresence mode="wait">
                {selectedPhoto !== null && (
                  <motion.img
                    key={selectedPhoto}
                    src={currentGallery[selectedPhoto]}
                    alt={`Park & Shop ${galleryType === 'rendering' ? 'rendering' : 'design documentation'} ${selectedPhoto + 1}`}
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
                    prev === null ? 0 : (prev - 1 + currentGallery.length) % currentGallery.length
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
                    prev === null ? 0 : (prev + 1) % currentGallery.length
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
              {selectedPhoto !== null && `${selectedPhoto + 1} / ${currentGallery.length}`}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
