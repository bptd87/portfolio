import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Newspaper, FileText, Users, GraduationCap, MapPin, Award, Briefcase } from 'lucide-react';
import portraitImage from '../assets/d3b5f45814466ec04f12883840ad987a5e5d22dc.png';
import { PhotoGallery } from '../components/shared/PhotoGallery';
import { CounterAnimation } from '../components/shared/CounterAnimation';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useSocialLinks } from '../hooks/useSocialLinks';
import { useTheme } from '../hooks/useTheme';
import { supabase } from '../utils/supabase/client';
import { SEO } from '../components/SEO';

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
  const siteSettings = useSiteSettings();
  const { socialLinks } = useSocialLinks();
  const [galleryPhotos, setGalleryPhotos] = React.useState<typeof personalPhotos>([]);

  React.useEffect(() => {
    const fetchGalleryPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('about_gallery')
          .select('*')
          .order('display_order');
        if (data) {
          setGalleryPhotos(data.map((photo: any) => ({
            src: photo.image_url,
            alt: photo.alt_text,
            caption: photo.caption
          })));
        }
      } catch (error) {
        console.error('❌ Error fetching gallery photos:', error);
        setGalleryPhotos(personalPhotos);
      }
    };
    fetchGalleryPhotos();
  }, []);

  const displayPhotos = galleryPhotos;

  return (
    <div className="min-h-screen bg-background text-foreground relative transition-colors duration-300" data-nav={theme === 'dark' ? 'dark' : 'light'}>
      <SEO
        title={siteSettings.settings?.aboutInfoTitle}
        description={siteSettings.settings?.aboutInfoDescription}
        keywords={siteSettings.settings?.aboutInfoKeywords?.split(',').map(k => k.trim())}
        image={siteSettings.settings?.aboutInfoOgImage}
      />

      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay">
        <div className="w-full h-full bg-repeat [background-image:url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* --- Section 1: Hero --- */}
      <section className="pt-32 md:pt-32 pb-20 px-6 lg:px-12 border-b border-neutral-200 dark:border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <div className="font-mono text-[9px] text-neutral-500 dark:text-white/40 mb-6 tracking-[0.2em] uppercase">
              // Scenic Designer
            </div>
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8 tracking-tighter text-black dark:text-white">
              Brandon<br />PT Davis
            </h1>
            <div className="h-px w-16 bg-black/10 dark:bg-white/20 mb-8" />
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-white/60 max-w-lg leading-relaxed font-light antialiased">
              {siteSettings.settings?.bioText || 'Scenic designer, educator, and creative technologist crafting immersive environments where story and space converge.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 p-2 bg-neutral-100 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 shadow-2xl rounded-sm">
              <img
                src={siteSettings.settings?.profileImageUrl || portraitImage}
                alt="Brandon PT Davis"
                className="w-full aspect-[4/5] object-cover contrast-[1.1] brightness-90 filter dark:brightness-90 brightness-100"
              />
              <div className="mt-4 flex justify-between items-center px-1 pb-1">
                <span className="font-mono text-[9px] text-neutral-400 dark:text-white/30 uppercase tracking-[0.15em]">Fig. 01 — Portrait</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Section 2: Credentials (Specs Row Style) --- */}
      <section className="py-24 px-6 lg:px-12 bg-neutral-50 dark:bg-transparent">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-neutral-200 dark:divide-white/[0.08] lg:divide-neutral-200 dark:lg:divide-white/[0.08] border-y border-neutral-200 dark:border-white/[0.08]">
            {[
              { val: "15+", label: "Years Experience", sub: "Regional Theatre" },
              { val: "130+", label: "Projects Designed", sub: "Nationwide" },
              { val: "MFA", label: "Scenic Design", sub: "UC Irvine" },
              { val: "USA 829", label: "Union Member", sub: "United Scenic Artists" },
            ].map((item, i) => (
              <div key={i} className="py-12 px-8 flex flex-col justify-center items-start group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="font-serif text-5xl md:text-6xl text-black dark:text-white mb-2 tracking-tight group-hover:scale-105 transition-transform origin-left duration-500">
                  {item.val}
                </div>
                <div className="font-display font-medium text-sm text-neutral-700 dark:text-white/80 uppercase tracking-wide mb-1">
                  {item.label}
                </div>
                <div className="font-mono text-[9px] text-neutral-400 dark:text-white/40 uppercase tracking-widest">
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 3: The Story --- */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">

            {/* Sticky Title */}
            <div className="lg:col-span-4 sticky top-24">
              <h2 className="font-serif text-5xl mb-6 tracking-tight text-black/90 dark:text-white/90">The Story</h2>
              <div className="w-12 h-0.5 bg-cyan-900/50" />
            </div>

            {/* Content */}
            <div className="lg:col-span-8 space-y-12">
              <div className="text-2xl md:text-3xl text-neutral-700 dark:text-white/80 leading-relaxed font-light font-display">
                {siteSettings.settings?.introText ||
                  "I believe scenic design is a form of storytelling—one that starts before the actors speak and lingers after the final bow."
                }
              </div>

              <div className="prose prose-lg text-neutral-500 dark:text-white/50 font-light leading-loose space-y-6">
                {siteSettings.settings?.aboutText ? (
                  siteSettings.settings.aboutText.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-6">{paragraph}</p>
                  ))
                ) : (
                  <p>Brandon PT Davis is a scenic designer based in Southern California...</p>
                )}
              </div>

              {/* Sub-sections */}
              <div className="grid md:grid-cols-2 gap-12 border-t border-neutral-200 dark:border-white/[0.06] pt-12">
                <div>
                  <h4 className="font-mono text-[9px] text-neutral-400 dark:text-white/30 uppercase tracking-[0.2em] mb-6">Perspectives</h4>

                  <div className="space-y-4">
                    <button
                      onClick={() => onNavigate('teaching-philosophy')}
                      className="w-full text-left group"
                    >
                      <h5 className="font-serif text-xl text-black/90 dark:text-white/90 mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                        Teaching Philosophy
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      </h5>
                      <p className="font-display text-sm text-neutral-500 dark:text-white/40">Pedagogical approach & methodology</p>
                    </button>

                    <div className="h-px w-full bg-neutral-100 dark:bg-white/[0.04]" />

                    <button
                      onClick={() => onNavigate('creative-statement')}
                      className="w-full text-left group"
                    >
                      <h5 className="font-serif text-xl text-black/90 dark:text-white/90 mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                        Creative Statement
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      </h5>
                      <p className="font-display text-sm text-neutral-500 dark:text-white/40">Artistic vision & practice</p>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-[9px] text-neutral-400 dark:text-white/30 uppercase tracking-[0.2em] mb-6">Connect & Documents</h4>
                  <div className="space-y-4">
                    <button onClick={() => onNavigate('cv')} className="w-full text-left group">
                      <h5 className="font-serif text-xl text-black/90 dark:text-white/90 mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                        Curriculum Vitae
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      </h5>
                      <p className="font-display text-sm text-neutral-500 dark:text-white/40">Full professional history (Web)</p>
                    </button>

                    {siteSettings.settings?.resumeUrl && (
                      <>
                        <div className="h-px w-full bg-neutral-100 dark:bg-white/[0.04]" />
                        <a
                          href="/resume"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-left group block"
                        >
                          <h5 className="font-serif text-xl text-black/90 dark:text-white/90 mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                            {siteSettings.settings.resumeFilename || "Download Resume"}
                            <FileText size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                          </h5>
                          <p className="font-display text-sm text-neutral-500 dark:text-white/40">PDF Document</p>
                        </a>
                      </>
                    )}

                    <div className="h-px w-full bg-neutral-100 dark:bg-white/[0.04]" />

                    <button onClick={() => onNavigate('contact')} className="w-full text-left group">
                      <h5 className="font-serif text-xl text-black/90 dark:text-white/90 mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                        Get in Touch
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      </h5>
                      <p className="font-display text-sm text-neutral-500 dark:text-white/40">Inquiries & collaboration</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 4: Studio Archive --- */}
      <section className="py-24 px-6 lg:px-12 bg-neutral-50 dark:bg-transparent border-t border-neutral-200 dark:border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-end mb-16">
            <h2 className="font-serif text-4xl text-black/90 dark:text-white/90">Snapshot Gallery</h2>
            <span className="font-mono text-[9px] text-neutral-400 dark:text-white/30 uppercase tracking-widest hidden md:inline-block">From the Studio</span>
          </div>
          <PhotoGallery photos={displayPhotos} columns={3} />
        </div>
      </section>

      {/* --- Section 5: Hub --- */}
      <section className="py-24 px-6 lg:px-12 border-t border-neutral-200 dark:border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-px bg-neutral-100 dark:bg-white/[0.06] border border-neutral-100 dark:border-white/[0.06]">
            {[
              { title: 'Journal', sub: 'News & Updates', link: 'news', icon: Newspaper },
              { title: 'Partners', sub: 'Collaborators', link: 'collaborators', icon: Users },
              { title: 'Method', sub: 'Teaching', link: 'teaching-philosophy', icon: GraduationCap },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => onNavigate(item.link)}
                className="p-12 text-center hover:bg-neutral-50 dark:hover:bg-zinc-900 transition-colors group relative overflow-hidden"
              >
                <item.icon className="mx-auto mb-6 text-neutral-400 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors duration-500" size={24} />
                <h3 className="font-serif text-xl mb-2 text-neutral-700 dark:text-white/80 group-hover:text-black dark:group-hover:text-white transition-colors">{item.title}</h3>
                <p className="font-mono text-[9px] text-neutral-400 dark:text-white/30 uppercase tracking-widest">{item.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}