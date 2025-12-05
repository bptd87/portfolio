import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Theater, Sparkles, Eye, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { getAdjacentProjects } from '../../data/projects';
import { SEO } from '../../components/SEO';

interface LysistrataProps {
  onNavigate: (page: string, filter?: string) => void;
}

export default function Lysistrata({ onNavigate }: LysistrataProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [galleryType, setGalleryType] = useState<'rendering' | 'documentation'>('rendering');
  
  const { previous, next } = getAdjacentProjects('lysistrata');
  
  const renderings = [
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Lysistrata/Lyistrata%20Rendering%20-%20Vectorworks%20-%20Brandon%20PT%20Davis%20-%203.jpg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Lysistrata/Lyistrata%20Rendering%20-%20Vectorworks%20-%20Brandon%20PT%20Davis%20-%202.jpg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Lysistrata/Lyistrata%20Rendering%20-%20Vectorworks%20-%20Brandon%20PT%20Davis%20-%201.jpeg'
  ];

  const documentation = [
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Lysistrata/Lyistrata%20Drafting%20-%20Vectorworks%20-%20Brandon%20PT%20Davis%20-%201.jpg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Lysistrata/Lyistrata%20Drafting%20-%20Vectorworks%20-%20Brandon%20PT%20Davis%20-%202.jpg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Lysistrata/Lyistrata%20Drafting%20-%20Vectorworks%20-%20Brandon%20PT%20Davis%20-%203.jpg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Lysistrata/Lyistrata%20Drafting%20-%20Vectorworks%20-%20Brandon%20PT%20Davis%20-%204.jpg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Lysistrata/Lyistrata%20Drafting%20-%20Vectorworks%20-%20Brandon%20PT%20Davis%20-%205.jpg',
    'https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Lysistrata/Lyistrata%20Drafting%20-%20Vectorworks%20-%20Brandon%20PT%20Davis%20-%206.jpg'
  ];

  const currentGallery = galleryType === 'rendering' ? renderings : documentation;
  
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
          title: "Lysistrata - Experiential Design | Brandon PT Davis",
          description: "Interactive scenic design for Aristophanes' anti-war comedy, transforming the audience into the Athenian polis for Ohio Light Opera's 2019 production.",
          keywords: [
            'Lysistrata',
            'experiential design',
            'scenic design',
            'Ohio Light Opera',
            'immersive theatre',
            'greek comedy',
            'Brandon PT Davis'
          ],
          ogType: 'article',
          ogImage: renderings[0],
          canonicalPath: '/portfolio/lysistrata'
        }}
      />

      <div className="min-h-screen bg-white dark:bg-black">
        {/* Hero Carousel */}
        <div className="relative h-[60vh] bg-black overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={renderings[currentIndex]}
              alt={`Lysistrata - Rendering ${currentIndex + 1}`}
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
                Immersive Theatre
              </span>
            </div>
            
            <h1 className="mb-6 text-black dark:text-white text-[60px]">
              Lysistrata
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl leading-relaxed mb-12">
              Transforming the audience into citizens of the Athenian polis for Aristophanes' anti-war comedy
            </p>
            
            {/* Project Info Boxes - Spanning Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Production</p>
                <p className="text-black dark:text-white">Ohio Light Opera</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Location</p>
                <p className="text-black dark:text-white">Wooster, OH</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Role</p>
                <p className="text-black dark:text-white">Scenic Designer</p>
              </div>
              <div className="bg-secondary border border-border p-4">
                <p className="text-xs text-accent-brand tracking-wider uppercase mb-2">Year</p>
                <p className="text-black dark:text-white">2019</p>
              </div>
            </div>
          </div>

          {/* Project Overview */}
          <section className="mb-20 md:mb-24">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Project Overview</h2>
              <h3 className="text-black dark:text-white mb-8">
                Breaking the Fourth Wall
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6">
                <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                  For Ohio Light Opera's 2019 production of <span className="text-accent-brand">Lysistrata</span>, I designed an experiential environment that erased traditional theatrical boundaries, transforming the audience into active participants in the ancient Athenian polis.
                </p>
                <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                  Rather than placing spectators outside the action, the design positioned them as citizens witnessing—and implicated in—the political and social upheaval of Aristophanes' anti-war satire.
                </p>
                <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                  The scenic approach embraced <span className="text-accent-brand">architectural abstraction</span>, using oversized columns, platforms, and layered sightlines to create an environment that felt simultaneously ancient and contemporary.
                </p>
              </div>
              
              <div className="bg-secondary border border-border p-6 md:p-8">
                <h4 className="text-sm tracking-wider text-accent-brand mb-6 uppercase">Collaborators</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Director</span>
                    <span className="text-black dark:text-white">Steven Byess</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Composer</span>
                    <span className="text-black dark:text-white">Mark Adamo</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-black/40 dark:text-white/40 min-w-[100px]">Venue</span>
                    <span className="text-black dark:text-white">Freedlander Theatre</span>
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
                Immersion Through Architecture
              </h3>
            </div>
            
            <div className="space-y-6 mb-10 max-w-3xl">
              <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                The design strategy centered on <span className="text-accent-brand">environmental immersion</span>—extending the playing space into the audience and creating a shared architectural language between performers and spectators.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                Oversized classical columns framed multiple performance zones, while raised platforms and staircases allowed for fluid movement and dynamic spatial relationships that shifted throughout the production.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                The material palette—weathered stone textures, aged metals, and sculptural forms—evoked ancient Athens without literal replication, maintaining theatrical abstraction while grounding the comedy in architectural reality.
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
                    alt={`Lysistrata Rendering ${index + 1}`}
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
                Technical Precision & Spatial Planning
              </h3>
            </div>
            
            <div className="space-y-6 mb-10 max-w-3xl">
              <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                The technical documentation for <span className="text-accent-brand">Lysistrata</span> balanced architectural precision with experiential flexibility—ensuring the scenic elements could support multiple staging configurations while maintaining visual cohesion.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                Detailed construction drawings, sightline studies, and material specifications enabled the scenic shop to execute the design with theatrical efficiency, adapting classical forms to contemporary stage construction methods.
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
                    alt={`Lysistrata Documentation ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Impact & Legacy */}
          <section className="mb-20 md:mb-24">
            <div className="mb-10">
              <h2 className="text-sm tracking-wider text-black/40 dark:text-white/40 mb-4 uppercase">Impact & Legacy</h2>
              <h3 className="text-black dark:text-white mb-6">
                Theatre as Civic Space
              </h3>
            </div>
            
            <div className="space-y-6 max-w-3xl">
              <p className="text-black/80 dark:text-white/80 leading-relaxed text-justify">
                By dissolving the separation between stage and house, the design for <span className="text-accent-brand">Lysistrata</span> created a theatrical experience that mirrored the play's central theme—the power of collective action and communal responsibility.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                The audience became complicit in the story, unable to maintain critical distance, forced to reckon with their role in the unfolding political drama—precisely the effect Aristophanes intended over two millennia ago.
              </p>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-justify">
                This project demonstrated how <span className="text-accent-brand">experiential design can reactivate classical texts</span>, proving that ancient theatre's civic function remains urgent and relevant when given appropriate spatial expression.
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
                {galleryType === 'rendering' ? 'Rendering' : 'Design Documentation'} {selectedPhoto !== null ? selectedPhoto + 1 : ''}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Full-size view of Lysistrata {galleryType === 'rendering' ? 'rendering' : 'design documentation'}
              </DialogDescription>
              
              <div className="flex-1 w-full flex items-center justify-center pt-20">
                <AnimatePresence mode="wait">
                  {selectedPhoto !== null && (
                    <motion.img
                      key={selectedPhoto}
                      src={currentGallery[selectedPhoto]}
                      alt={`Lysistrata ${galleryType === 'rendering' ? 'rendering' : 'documentation'} ${selectedPhoto + 1}`}
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

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
                {selectedPhoto !== null && `${selectedPhoto + 1} / ${currentGallery.length}`}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
