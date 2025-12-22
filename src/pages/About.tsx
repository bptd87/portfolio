import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Newspaper, FileText, Users, GraduationCap, MapPin, Award, Briefcase, Mail, ExternalLink } from 'lucide-react';
import portraitImage from 'figma:asset/d3b5f45814466ec04f12883840ad987a5e5d22dc.png';
import { PhotoGallery } from '../components/shared/PhotoGallery';
import { CounterAnimation } from '../components/shared/CounterAnimation';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useTheme } from '../components/ThemeProvider';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AboutProps {
  onNavigate: (page: string) => void;
}

const personalPhotos = [
  {
    src: 'https://images.unsplash.com/photo-1758671914231-4193ed752eb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwcmVoZWFyc2FsJTIwYmFja3N0YWdlfGVufDF8fHx8MTc2MTk0NDg5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Backstage during rehearsal',
    caption: 'Backstage during tech rehearsal'
  },
  {
    src: 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBzdHVkaW8lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYxODg0OTAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Design studio workspace',
    caption: 'Studio workspace in Irvine'
  },
  {
    src: 'https://images.unsplash.com/photo-1577537653888-383504d823ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwb3BlbmluZyUyMG5pZ2h0fGVufDF8fHx8MTc2MTk0NDg5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Opening night at the theatre',
    caption: 'Opening night celebration'
  },
  {
    src: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2xhc3Nyb29tJTIwdGVhY2hpbmd8ZW58MXx8fHwxNzYxODMzMDI1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Teaching at university',
    caption: 'Teaching scenic design at UC Irvine'
  },
  {
    src: 'https://images.unsplash.com/photo-1601931992301-5c9a46c92808?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwY29sbGFib3JhdGlvbiUyMG1lZXRpbmd8ZW58MXx8fHwxNzYxOTQ0ODk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Collaboration meeting with creative team',
    caption: 'Collaborating with the creative team'
  },
  {
    src: 'https://images.unsplash.com/photo-1751822656923-211bb90e3d97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2VuaWMlMjBkZXNpZ24lMjBtb2RlbHxlbnwxfHx8fDE3NjE5NDQ4OTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Scenic design model',
    caption: 'Working on a scenic model'
  }
];

export function About({ onNavigate }: AboutProps) {
  const { theme } = useTheme();
  const [selectedPhoto, setSelectedPhoto] = React.useState<number | null>(null);

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    if (selectedPhoto === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowRight') {
        setSelectedPhoto((prev) => (prev! + 1) % personalPhotos.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedPhoto((prev) => (prev! - 1 + personalPhotos.length) % personalPhotos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  const siteSettings = useSiteSettings();
  const [galleryPhotos, setGalleryPhotos] = React.useState<typeof personalPhotos>([]);
  const [loadingGallery, setLoadingGallery] = React.useState(true);
  const [showFullBio, setShowFullBio] = React.useState(false);

  // Fetch gallery photos from database
  React.useEffect(() => {
    const fetchGalleryPhotos = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/about-gallery`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.photos && data.photos.length > 0) {
            setGalleryPhotos(data.photos.map((photo: any) => ({
              src: photo.image_url,
              alt: photo.alt_text,
              caption: photo.caption
            })));
          } else {
            // Fallback to hardcoded photos if no data
            setGalleryPhotos(personalPhotos);
          }
        } else {
          setGalleryPhotos(personalPhotos);
        }
      } catch (error) {
        console.error('Error fetching gallery photos:', error);
        setGalleryPhotos(personalPhotos);
      } finally {
        setLoadingGallery(false);
      }
    };

    fetchGalleryPhotos();
  }, []);

  const displayPhotos = galleryPhotos.length > 0 ? galleryPhotos : personalPhotos;

  return (
    <div
      className="min-h-screen pt-16 pb-24 bg-white dark:bg-black"
      data-nav={theme === 'dark' ? 'dark' : 'light'}
    >

      {/* Hero Section - Cinematic */}
      <section className="py-20 px-6 lg:px-12 relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 dark:from-white/5 via-transparent to-transparent" />

        <div className="max-w-[1800px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-black dark:text-white text-7xl md:text-8xl lg:text-9xl mb-6 leading-[0.9]">
              Brandon PT<br />Davis
            </h1>
            <p className="text-black/60 dark:text-white/60 text-xl md:text-2xl max-w-3xl leading-relaxed">
              {siteSettings.settings?.bioText || 'Scenic designer, educator, and creative technologist crafting immersive environments where story and space converge.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Portrait + Bio Section */}
      <section className="px-6 lg:px-12 pb-24">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid lg:grid-cols-[450px_1fr] gap-16 lg:gap-24">

            {/* Left Column - Portrait */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col"
            >
              {/* Portrait */}
              <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 group">
                <img
                  src={portraitImage}
                  alt="Brandon PT Davis"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>

              {/* Spacer to push stats to bottom */}
              <div className="flex-1" />

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6 text-center">
                  <div className="font-pixel text-[9px] text-black/40 dark:text-white/40 tracking-[0.3em] mb-2">EXPERIENCE</div>
                  <CounterAnimation value={15} suffix="+" className="text-cyan-600 dark:text-cyan-400 text-4xl font-display block mb-1" />
                  <div className="text-black/60 dark:text-white/60 text-sm">Years</div>
                </div>
                <div className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6 text-center">
                  <div className="font-pixel text-[9px] text-black/40 dark:text-white/40 tracking-[0.3em] mb-2">PRODUCTIONS</div>
                  <CounterAnimation value={130} suffix="+" className="text-blue-600 dark:text-blue-400 text-4xl font-display block mb-1" />
                  <div className="text-black/60 dark:text-white/60 text-sm">Credits</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Bio */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-12 flex flex-col"
            >
              {/* Introduction */}
              <div>
                <h2 className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em] mb-6">INTRODUCTION</h2>
                <div className="space-y-6 text-black/80 dark:text-white/80 text-xl md:text-2xl leading-relaxed">
                  {siteSettings.settings?.introText ? (
                    siteSettings.settings.introText.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))
                  ) : (
                    <>
                      <p>
                        I believe scenic design is a form of storytelling—one that starts before the actors speak and lingers after the final bow. My work lives at the intersection of craft and concept, using physical space to shape emotion, tension, and rhythm.
                      </p>
                      <p>
                        With over 15 years of experience in theatre and immersive environments, I've designed productions across the country, collaborated with inspiring creatives, and mentored the next generation of designers.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* About Section */}
              <div className="border-t border-black/10 dark:border-white/10 pt-12">
                <h2 className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em] mb-6">ABOUT BRANDON</h2>
                <div className="space-y-6 text-black/70 dark:text-white/70 text-lg md:text-xl leading-relaxed">
                  {siteSettings.settings?.aboutText ? (
                    <>
                      {siteSettings.settings.aboutText.split('\n\n').slice(0, showFullBio ? undefined : 2).map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                      {siteSettings.settings.aboutText.split('\n\n').length > 2 && (
                        <button
                          onClick={() => setShowFullBio(!showFullBio)}
                          className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium transition-colors inline-flex items-center gap-2 group"
                        >
                          {showFullBio ? 'Show Less' : 'Read More'}
                          <span className={`transform transition-transform ${showFullBio ? 'rotate-180' : ''}`}>↓</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <p>
                        Brandon PT Davis (he/him) is a scenic designer who transforms theatrical spaces into immersive visual landscapes where story and space move together in harmony. Based in Southern California, Brandon's work is rooted in a lifelong curiosity about how design shapes experience.
                      </p>
                      <p>
                        Brandon holds a BFA in Theatre Arts from Stephens College and is completing his MFA in Scenic Design from the University of California, Irvine. His designs are recognized for their thoughtful balance—merging minimalism with layered materiality, and grounded realism with playful invention.
                      </p>
                      <p>
                        As a member of United Scenic Artists Local 829 and with over 130 productions to his credit, Brandon brings expertise across theatrical design, experiential environments, and themed entertainment. He has designed for regional theatres nationwide including South Coast Repertory, New Swan Theatre Festival, Okoboji Summer Theatre, and The Great American Melodrama.
                      </p>
                      <p>
                        In addition to design work, Brandon is passionate about education, having taught at UC Irvine, Stephens College, and University of Texas-El Paso. He also develops macOS productivity software specifically for theatre designers and freelance creatives.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Credentials Bar */}
      <section className="px-6 lg:px-12 pb-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-neutral-200/40 dark:bg-neutral-900/30 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <GraduationCap className="w-6 h-6 mx-auto mb-3" style={{ stroke: '#06b6d4' }} />
                <div className="text-black dark:text-white font-display text-lg mb-1">MFA Scenic Design</div>
                <div className="font-pixel text-[8px] text-black/30 dark:text-white/30 tracking-[0.2em]">UC IRVINE</div>
              </div>
              <div className="text-center">
                <MapPin className="w-6 h-6 mx-auto mb-3" style={{ stroke: '#ec4899' }} />
                <div className="text-black dark:text-white font-display text-lg mb-1">Southern California</div>
                <div className="font-pixel text-[8px] text-black/30 dark:text-white/30 tracking-[0.2em]">NATIONWIDE WORK</div>
              </div>
              <div className="text-center">
                <Award className="w-6 h-6 mx-auto mb-3" style={{ stroke: '#3b82f6' }} />
                <div className="text-black dark:text-white font-display text-lg mb-1">USA Local 829</div>
                <div className="font-pixel text-[8px] text-black/30 dark:text-white/30 tracking-[0.2em]">UNION MEMBER</div>
              </div>
              <div className="text-center">
                <Briefcase className="w-6 h-6 text-black/40 dark:text-white/40 mx-auto mb-3" />
                <div className="text-black dark:text-white font-display text-lg mb-1">Regional Theatre</div>
                <div className="font-pixel text-[8px] text-black/30 dark:text-white/30 tracking-[0.2em]">NATIONWIDE</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Creative Statement Section */}
      {siteSettings.settings?.philosophyText && (
        <section className="px-6 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 border border-black/10 dark:border-white/10"
            >
              {/* Background Image */}
              {displayPhotos[0] && (
                <div className="absolute inset-0 opacity-10 dark:opacity-5">
                  <img
                    src={displayPhotos[0].src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 p-8 md:p-12 lg:p-16">
                <div className="max-w-4xl">
                  <h2 className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em] mb-8">
                    CREATIVE STATEMENT
                  </h2>

                  <div className="space-y-6 text-black/80 dark:text-white/80 text-lg md:text-xl leading-relaxed">
                    {siteSettings.settings.philosophyText.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Signature */}
                  <div className="mt-12 pt-8 border-t border-black/10 dark:border-white/10">
                    <p className="text-black dark:text-white font-display text-xl">Brandon PT Davis</p>
                    <p className="text-black/60 dark:text-white/60 text-sm mt-1">Scenic Designer</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Photo Gallery Section */}
      <section className="px-6 lg:px-12 pb-24">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-12">
            <h2 className="text-sm tracking-wider opacity-40 mb-2">BEHIND THE SCENES</h2>
            <p className="text-xl md:text-2xl opacity-80">Moments from the studio, stage, and classroom</p>
          </div>

          <PhotoGallery photos={displayPhotos} columns={3} />
        </div>
      </section>

      {/* Explore More - Hub Cards */}
      <section className="px-6 lg:px-12 pb-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-pixel text-[10px] text-white/40 tracking-[0.3em] mb-4">EXPLORE MORE</h2>
            <p className="font-display text-white text-4xl md:text-5xl">Dive deeper into my work</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* News Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              onClick={() => onNavigate('news')}
              className="group bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/30 hover:shadow-2xl hover:shadow-white/5 transition-all text-left"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <Newspaper className="w-6 h-6 text-white/80" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-display text-2xl mb-1 group-hover:text-white/80 transition-colors">Latest News</h3>
                  <p className="font-pixel text-[9px] text-white/40 tracking-[0.3em]">UPDATES & ANNOUNCEMENTS</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
              <p className="text-white/60 leading-relaxed">
                Recent productions, awards, and upcoming projects. Highlights include South Coast Repertory, New Swan Theatre Festival, and collaborations nationwide.
              </p>
            </motion.button>

            {/* CV Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              onClick={() => onNavigate('cv')}
              className="group bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/30 hover:shadow-2xl hover:shadow-white/5 transition-all text-left"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <FileText className="w-6 h-6 text-white/80" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-display text-2xl mb-1 group-hover:text-white/80 transition-colors">Curriculum Vitae</h3>
                  <p className="font-pixel text-[9px] text-white/40 tracking-[0.3em]">PROFESSIONAL HISTORY</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
              <p className="text-white/60 leading-relaxed">
                Complete professional history including education, 130+ production credits, teaching appointments, publications, awards, and professional memberships.
              </p>
            </motion.button>

            {/* Collaborators Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onClick={() => onNavigate('collaborators')}
              className="group bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/30 hover:shadow-2xl hover:shadow-white/5 transition-all text-left"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <Users className="w-6 h-6 text-white/80" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-display text-2xl mb-1 group-hover:text-white/80 transition-colors">Collaborators</h3>
                  <p className="font-pixel text-[9px] text-white/40 tracking-[0.3em]">CREATIVE PARTNERS</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
              <p className="text-white/60 leading-relaxed">
                Talented directors, choreographers, lighting designers, and creative partners I've had the privilege of working with throughout my career.
              </p>
            </motion.button>

            {/* Teaching Philosophy Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              onClick={() => onNavigate('teaching-philosophy')}
              className="group bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/30 hover:shadow-2xl hover:shadow-white/5 transition-all text-left"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <GraduationCap className="w-6 h-6 text-white/80" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-display text-2xl mb-1 group-hover:text-white/80 transition-colors">Teaching Philosophy</h3>
                  <p className="font-pixel text-[9px] text-white/40 tracking-[0.3em]">EDUCATION & MENTORSHIP</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
              <p className="text-white/60 leading-relaxed">
                My approach to design education: balancing traditional craft with emerging technologies, fostering collaboration, and preparing students for diverse careers.
              </p>
            </motion.button>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 md:p-16 text-center"
          >
            <h2 className="font-pixel text-[10px] text-white/40 tracking-[0.3em] mb-6">GET IN TOUCH</h2>
            <p className="font-display text-white text-4xl md:text-5xl mb-12">
              Let's collaborate on<br />your next production
            </p>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="font-pixel text-[9px] text-white/40 mb-3 tracking-[0.3em]">EMAIL</div>
                <a
                  href="mailto:brandon@brandonptdavis.com"
                  className="text-lg text-white hover:text-white/70 transition-colors"
                >
                  brandon@brandonptdavis.com
                </a>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="font-pixel text-[9px] text-white/40 mb-3 tracking-[0.3em]">SOCIAL</div>
                <div className="flex justify-center gap-6 text-sm">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    YouTube
                  </a>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={() => onNavigate('contact')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-white text-black hover:bg-white/90 transition-all font-pixel text-xs tracking-[0.3em] inline-flex items-center gap-3 rounded-full"
            >
              SEND A MESSAGE
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

    </div>
  );
}