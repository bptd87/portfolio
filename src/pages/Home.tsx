
import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, BookOpen, Wrench } from 'lucide-react';
// ImageWithFallback removed (unused)
import { API_BASE_URL } from '../utils/api';
import { publicAnonKey } from '../utils/supabase/info';
import heroPattern from '../assets/b3f1f9dfbb66813f626ca74d8c8b4acc67e7bdd8.png';

import { useSiteSettings } from '../hooks/useSiteSettings';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { RevealText, FadeInUp, ParallaxImage } from '../components/shared/Motion';
import { SEO } from '../components/SEO';

const heroStyle: React.CSSProperties = {
  backgroundImage: `url(${heroPattern})`,
  backgroundRepeat: 'repeat-x',
  backgroundSize: 'auto 100%',
  left: 0,
};

interface HomeProps {
  onNavigate?: (page: string) => void;
}

interface Project {
  id: string;
  title: string;
  slug?: string;
  category: string;
  cardImage?: string;  // Changed from coverImage to match database
  coverImage?: string; // Keep for backwards compatibility
  focusPoint?: { x: number; y: number }; // Focal point for image positioning
  description?: string;
  year?: string;
  client?: string;
}

interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  coverImage?: string;
  coverImageFocalPoint?: { x: number; y: number };
  excerpt?: string;
  slug?: string;
}

export function Home({ onNavigate }: HomeProps) {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [navigatingProject, setNavigatingProject] = useState<Project | null>(null);
  const { settings } = useSiteSettings();

  // Handle project navigation with transition
  const handleProjectClick = (project: Project) => {
    setNavigatingProject(project);
    // Store the transition image in sessionStorage for the detail page to pick up
    if (project.cardImage) {
      sessionStorage.setItem('transitionImage', project.cardImage);
      sessionStorage.setItem('transitionFocusPoint', JSON.stringify(project.focusPoint || { x: 50, y: 50 }));
    }
    // Small delay for animation to start before navigating
    setTimeout(() => {
      onNavigate?.(`project/${project.slug || project.id}`);
    }, 300);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch projects from API instead of KV store
        const projectsResponse = await fetch(`${API_BASE_URL}/api/projects`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });

        if (!projectsResponse.ok) {
          const errorText = await projectsResponse.text();
          throw new Error(`Projects API returned ${projectsResponse.status}: ${errorText}`);
        }

        const projectsResult = await projectsResponse.json();
        if (projectsResult.success && projectsResult.projects && projectsResult.projects.length > 0) {
          // Filter for featured projects only AND published projects
          const featuredProjectsData = projectsResult.projects.filter((project: any) => project.featured === true && project.published !== false);
          const projectsArray = featuredProjectsData.sort((a: any, b: any) => {
            // Sort by date if available, otherwise by title
            if (a.year && b.year) {
              return parseInt(b.year) - parseInt(a.year);
            }
            return (a.title || '').localeCompare(b.title || '');
          });

          setFeaturedProjects(projectsArray.slice(0, 8));
        }

        // Fetch latest news from API instead of KV store
        const newsResponse = await fetch(`${API_BASE_URL}/api/news`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        const newsResult = await newsResponse.json();
        if (newsResult.success && newsResult.news && newsResult.news.length > 0) {
          const newsArray = newsResult.news.sort((a: any, b: any) => {
            // Sort by date, most recent first
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });

          // Take most recent 5 news items for the carousel
          setLatestNews(newsArray.slice(0, 5));
        }

        // Fetch collaborators for marquee
        try {
          const collabResponse = await fetch(`${API_BASE_URL}/api/collaborators`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          });
          const collabResult = await collabResponse.json();
          if (collabResult.collaborators && collabResult.collaborators.length > 0) {
            const names = collabResult.collaborators.map((c: any) => c.name);
            setCollaborators(names);
          }
        } catch (collabError) {
          setCollaborators([
            'South Coast Repertory',
            'Stephens College',
            'Arrow Rock Lyceum Theatre',
            'Missouri State University',
            'Merry-Go-Round Playhouse',
            'The Muny',
            'USITT'
          ]);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, []);

  // Scroll locking is now handled by App.tsx wrapper class

  const [showScrollbar, setShowScrollbar] = useState(false);

  useEffect(() => {
    // Hide scrollbar during initial hero animation (cinematic entrance)
    const timer = setTimeout(() => {
      setShowScrollbar(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-slide news carousel
  useEffect(() => {
    if (latestNews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % latestNews.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [latestNews.length]);

  const getCategoryColor = (category: string) => {
    const lowerCategory = category?.toLowerCase() || '';

    // Match full category names or short names
    if (lowerCategory.includes('scenic')) return 'accent-scenic';
    if (lowerCategory.includes('rendering') || lowerCategory.includes('visualization')) return 'accent-rendering';
    if (lowerCategory.includes('experiential')) return 'accent-experiential';

    return 'accent-default';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm tracking-wider opacity-60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="home-scroll-container"
      className={`relative h-screen overflow-x-hidden bg-black text-white selection:bg-white selection:text-black snap-y snap-mandatory ${!showScrollbar ? "overflow-hidden hero-animating" : "overflow-y-auto"
        }`}
    >
      <SEO
        title="Brandon PT Davis"
        description="Scenic Designer and Creative Technologist based in New York City, specializing in theatre, experiential production, and digital environments."
        keywords={[
          'Scenic Designer NYC',
          'Theatre Design',
          'Digital Scenography',
          'Experiential Design',
          'Scenic Design Portfolio',
          'Brandon PT Davis',
          'Brandon Davis Scenic'
        ]}
      />
      <Navbar onNavigate={(page) => onNavigate?.(page)} currentPage="home" />{/* Frame 0: Hero with Seamless Pattern */}
      <section className="relative h-screen w-full snap-start snap-always overflow-hidden bg-black flex-shrink-0">
        {/* Animated Seamless Background */}
        <div
          className="absolute inset-0 w-[200%] h-full animate-scroll-seamless"

          style={heroStyle}
        />
        {/* LCP Optimization: Explicitly preload hero pattern */}
        <img
          src={heroPattern}
          alt=""
          className="absolute top-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
          // @ts-ignore
          fetchPriority="high"
          loading="eager"
        />

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-4xl p-4"> {/* Added padding to container for italics */}
            <FadeInUp delay={0.2} enableInView={false}>
              <h1
                className="font-display text-white text-5xl md:text-7xl lg:text-8xl mb-8 italic leading-tight"
              >
                {settings.heroTitle || 'Brandon PT Davis'}
              </h1>
            </FadeInUp>
            <div className="font-pixel text-white text-xl md:text-2xl lg:text-3xl tracking-[0.4em] mb-12">
              <RevealText text={settings.heroSubtitle || 'ART × TECHNOLOGY × DESIGN'} delay={0.5} stagger={0.08} />
            </div>

            {/* Scroll Down Arrow */}
            <FadeInUp delay={1.2}>
              <button
                onClick={() => {
                  const homeContainer = document.getElementById('home-scroll-container');
                  if (homeContainer) {
                    homeContainer.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                  }
                }}
                className="text-white/60 hover:text-white transition-colors animate-bounce"
                aria-label="Scroll down"
              >
                <ChevronDown className="w-8 h-8" />
              </button>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Interleaved: Projects, News, Project, Collabs, Project, Quick Links, Project, CTA */}
      {(() => {
        const sections: React.ReactNode[] = [];
        let projectIdx = 0;

        // Helper to render a featured project
        const renderProject = (idx: number) => {
          if (idx >= featuredProjects.length) return null;
          const project = featuredProjects[idx];
          return (
            <section
              key={`project-${project.id}`}
              className={`relative h-screen w-full snap-start flex-shrink-0 cursor-pointer group overflow-hidden ${getCategoryColor(project.category)} ${navigatingProject?.id === project.id ? 'z-50' : ''
                }`}
              onClick={() => handleProjectClick(project)}
            >
              <div className={`absolute inset-0 transition-transform duration-500 ease-out ${navigatingProject?.id === project.id ? 'scale-105' : 'group-hover:scale-[1.02]'
                }`}>
                <ParallaxImage
                  src={project.cardImage || ''}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: project.focusPoint
                      ? `${project.focusPoint.x}% ${project.focusPoint.y}%`
                      : 'center center',
                  }}
                  offset={60}
                />
              </div>
              <div className={`absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 transition-opacity duration-300 ${navigatingProject?.id === project.id ? 'opacity-0' : ''
                }`} />
              <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full md:w-[90%] md:max-w-md px-4 md:px-0 transition-all duration-300 ${navigatingProject?.id === project.id ? 'opacity-0 translate-y-4' : ''
                }`}>
                <div className="group/card w-full backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl overflow-hidden px-6 py-5 text-left hover:bg-neutral-800/80 dark:hover:bg-neutral-900/80 transition-all duration-300 border border-white/10">
                  <h2 className="font-display text-white text-2xl lg:text-3xl mb-2">
                    {project.title}
                  </h2>
                  <div className="font-pixel text-xs text-white/60 tracking-[0.3em]">
                    {project.category?.toUpperCase() || 'DESIGN'}
                    {project.year && ` · ${project.year}`}
                  </div>
                </div>
              </div>
            </section>
          );
        };

        // Initial featured projects (0-2)
        if (projectIdx < featuredProjects.length) sections.push(renderProject(projectIdx++));
        if (projectIdx < featuredProjects.length) sections.push(renderProject(projectIdx++));

        // News Section
        if (latestNews.length > 0) {
          sections.push(
            <section key="news" className="relative h-screen w-full snap-start flex-shrink-0 accent-news overflow-hidden">
              {latestNews.map((news, newsIndex) => (
                news.coverImage ? (
                  <button
                    key={news.id}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${newsIndex === currentNewsIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    style={{

                      objectPosition: news.coverImageFocalPoint
                        ? `${news.coverImageFocalPoint.x}% ${news.coverImageFocalPoint.y}%`
                        : 'center center',
                    }}
                    onClick={() => onNavigate?.(`news/${news.slug || news.id}`)}
                    aria-label={news.title}
                  >
                    <img
                      src={news.coverImage}
                      alt={news.title}
                      className="w-full h-full object-cover pointer-events-none"
                      style={{

                        objectPosition: news.coverImageFocalPoint
                          ? `${news.coverImageFocalPoint.x}% ${news.coverImageFocalPoint.y}%`
                          : 'center center',
                      }}
                    />
                  </button>
                ) : (
                  <div
                    key={news.id}
                    className={`absolute inset-0 w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 transition-opacity duration-1000 ${newsIndex === currentNewsIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    onClick={() => onNavigate?.(`news/${news.slug || news.id}`)}
                    aria-label={news.title}
                  />
                )
              ))}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />

              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full md:w-[90%] md:max-w-md px-4 md:px-0">
                <button
                  onClick={() => onNavigate?.(`news/${latestNews[currentNewsIndex].slug || latestNews[currentNewsIndex].id}`)}
                  className="group w-full backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl overflow-hidden px-6 py-5 text-left hover:bg-neutral-800/80 dark:hover:bg-neutral-900/80 transition-all duration-300 border border-white/10"
                >
                  <div className="font-pixel text-xs text-section-accent tracking-[0.3em] mb-2">
                    LATEST NEWS
                  </div>
                  <h2 className="font-display text-white text-2xl lg:text-3xl mb-2 transition-all duration-500">
                    {latestNews[currentNewsIndex].title}
                  </h2>
                  <div className="font-pixel text-xs text-white/60 tracking-[0.3em]">
                    {latestNews[currentNewsIndex].category?.toUpperCase() || 'NEWS'} · {new Date(latestNews[currentNewsIndex].date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }).toUpperCase()}
                  </div>
                </button>

                {/* Slide Indicators */}
                {latestNews.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {latestNews.map((_, indicatorIndex) => (
                      <button
                        key={indicatorIndex}
                        onClick={() => setCurrentNewsIndex(indicatorIndex)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${indicatorIndex === currentNewsIndex
                          ? 'w-8 bg-white'
                          : 'w-1.5 bg-white/40 hover:bg-white/60'
                          }`}
                        aria-label={`Go to news ${indicatorIndex + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        }

        // Featured Project between News and Collabs
        if (projectIdx < featuredProjects.length) sections.push(renderProject(projectIdx++));

        // Collaborators
        if (collaborators.length > 0) {
          sections.push(
            <section key="collaboration" className="relative h-screen w-full snap-start flex-shrink-0 bg-black flex flex-col items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 opacity-20 bg-dots-white-sm"
              />

              <div className="relative z-10 text-center mb-12 md:mb-16">
                <h2 className="font-display text-white text-5xl md:text-6xl lg:text-8xl italic mb-4">
                  Collaboration
                </h2>
                <p className="font-sans text-white/60 text-lg md:text-xl max-w-2xl mx-auto px-6">
                  Great design is never made alone. These are the theatres, companies, and creative minds that have shaped my work.
                </p>
              </div>

              <div className="relative z-10 w-full overflow-hidden">
                <div className="flex animate-marquee-left whitespace-nowrap mb-6">
                  {[...collaborators, ...collaborators, ...collaborators].map((name, index) => (
                    <React.Fragment key={`row1-${index}`}>
                      <span className="font-pixel text-white/80 text-lg md:text-xl lg:text-2xl tracking-[0.15em]">
                        {name.toUpperCase()}
                      </span>
                      <span className="font-pixel text-white/30 text-lg md:text-xl lg:text-2xl mx-6 md:mx-8">
                        ◆
                      </span>
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex animate-marquee-right whitespace-nowrap">
                  {[...collaborators, ...collaborators, ...collaborators].reverse().map((name, index) => (
                    <React.Fragment key={`row2-${index}`}>
                      <span className="font-pixel text-white/40 text-base md:text-lg tracking-[0.15em]">
                        {name.toUpperCase()}
                      </span>
                      <span className="font-pixel text-white/20 text-base md:text-lg mx-6 md:mx-8">
                        ◆
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onNavigate?.('collaborators')}
                className="relative z-10 mt-12 md:mt-16 font-pixel text-sm text-white/60 tracking-[0.3em] hover:text-white transition-colors"
              >
                VIEW ALL COLLABORATORS →
              </button>
            </section>
          );
        }

        // Featured Project between Collabs and Quick Links
        if (projectIdx < featuredProjects.length) sections.push(renderProject(projectIdx++));

        // Quick Links Section
        sections.push(
          <section key="quicklinks" className="relative h-screen w-full snap-start flex-shrink-0 flex flex-col md:flex-row">
            <button
              onClick={() => onNavigate?.('scenic-insights')}
              className="group relative flex-1 bg-muted dark:bg-neutral-900 flex flex-col items-center justify-center p-8 hover:bg-muted/80 dark:hover:bg-neutral-800 transition-all duration-500 overflow-hidden border-b md:border-b-0 md:border-r border-border dark:border-white/10"
            >
              <div
                className="absolute inset-0 opacity-5 dark:opacity-25 group-hover:opacity-10 dark:group-hover:opacity-40 transition-opacity bg-grid-current"
              />

              <div className="relative z-10 text-center">
                <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground dark:text-white/60 mx-auto mb-6 group-hover:text-foreground dark:group-hover:text-white/80 transition-colors" />
                <div className="font-pixel text-xs text-muted-foreground dark:text-white/40 tracking-[0.3em] mb-4">
                  ARTICLES & GUIDES
                </div>
                <h3 className="font-display text-foreground dark:text-white text-3xl md:text-4xl lg:text-5xl italic mb-4">
                  Scenic Insights
                </h3>
                <p className="font-sans text-muted-foreground dark:text-white/60 text-sm md:text-base max-w-sm mx-auto mb-6">
                  Deep dives into scenic design, theatre history, and creative process
                </p>
                <span className="font-pixel text-xs text-muted-foreground dark:text-white/40 tracking-[0.2em] group-hover:text-foreground dark:group-hover:text-white/60 transition-colors">
                  EXPLORE ARTICLES →
                </span>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.('app-studio')}
              className="group relative flex-1 bg-background dark:bg-neutral-950 flex flex-col items-center justify-center p-8 hover:bg-muted dark:hover:bg-neutral-900 transition-all duration-500 overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-10 dark:opacity-40 group-hover:opacity-15 dark:group-hover:opacity-50 transition-opacity bg-dots-current"
              />

              <div className="relative z-10 text-center">
                <Wrench className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground dark:text-white/60 mx-auto mb-6 group-hover:text-foreground dark:group-hover:text-white/80 transition-colors" />
                <div className="font-pixel text-xs text-muted-foreground dark:text-white/40 tracking-[0.3em] mb-4">
                  TOOLS & RESOURCES
                </div>
                <h3 className="font-display text-foreground dark:text-white text-3xl md:text-4xl lg:text-5xl italic mb-4">
                  Scenic Studio
                </h3>
                <p className="font-sans text-muted-foreground dark:text-white/60 text-sm md:text-base max-w-sm mx-auto mb-6">
                  Calculators, converters, and design tools for theatre professionals
                </p>
                <span className="font-pixel text-xs text-muted-foreground dark:text-white/40 tracking-[0.2em] group-hover:text-foreground dark:group-hover:text-white/60 transition-colors">
                  EXPLORE TOOLS →
                </span>
              </div>
            </button>
          </section>
        );

        // Featured Project between Quick Links and CTA
        if (projectIdx < featuredProjects.length) sections.push(renderProject(projectIdx++));

        // CTA Section
        sections.push(
          <section key="cta" className="relative h-screen w-full snap-start flex-shrink-0 bg-background dark:bg-black flex flex-col md:flex-row overflow-hidden">
            <button
              onClick={() => onNavigate?.('portfolio')}
              className="group relative flex-1 flex flex-col items-center justify-center p-8 bg-muted dark:bg-neutral-900 hover:bg-muted/80 dark:hover:bg-neutral-800 transition-all duration-500 border-b md:border-b-0 md:border-r border-border dark:border-white/10"
            >
              <div
                className="absolute inset-0 opacity-5 dark:opacity-25 bg-grid-sm-diagonal"
              />
              <div className="relative z-10 text-center">
                <div className="font-pixel text-xs text-muted-foreground dark:text-white/40 tracking-[0.3em] mb-4">
                  ALL WORK
                </div>
                <h3 className="font-display text-foreground dark:text-white text-3xl md:text-4xl lg:text-5xl italic mb-4">
                  Portfolio
                </h3>
                <span className="inline-flex items-center gap-2 font-pixel text-xs text-muted-foreground dark:text-white/40 tracking-[0.2em] group-hover:text-foreground dark:group-hover:text-white/60 transition-colors">
                  VIEW ALL <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.('about')}
              className="group relative flex-1 flex flex-col items-center justify-center p-8 bg-foreground dark:bg-white text-background dark:text-black hover:opacity-90 transition-all duration-500"
            >
              <div
                className="absolute inset-0 opacity-15 bg-dots-current"
              />
              <div className="relative z-10 text-center">
                <div className="font-pixel text-xs opacity-60 tracking-[0.3em] mb-4">
                  THE DESIGNER
                </div>
                <h3 className="font-display text-3xl md:text-4xl lg:text-5xl italic mb-4">
                  About Me
                </h3>
                <p className="font-sans text-sm md:text-base opacity-70 max-w-xs mx-auto mb-6">
                  Scenic designer & educator crafting immersive theatrical experiences
                </p>
                <span className="inline-flex items-center gap-2 font-pixel text-xs opacity-60 tracking-[0.2em] group-hover:opacity-80 transition-opacity">
                  LEARN MORE <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.('contact')}
              className="group relative flex-1 flex flex-col items-center justify-center p-8 bg-muted dark:bg-neutral-900 hover:bg-muted/80 dark:hover:bg-neutral-800 transition-all duration-500 border-t md:border-t-0 md:border-l border-border dark:border-white/10"
            >
              <div
                className="absolute inset-0 opacity-5 dark:opacity-25 bg-grid-sm-diagonal-reverse"
              />
              <div className="relative z-10 text-center">
                <div className="font-pixel text-xs text-muted-foreground dark:text-white/40 tracking-[0.3em] mb-4">
                  GET IN TOUCH
                </div>
                <h3 className="font-display text-foreground dark:text-white text-3xl md:text-4xl lg:text-5xl italic mb-4">
                  Contact
                </h3>
                <span className="inline-flex items-center gap-2 font-pixel text-xs text-muted-foreground dark:text-white/40 tracking-[0.2em] group-hover:text-foreground dark:group-hover:text-white/60 transition-colors">
                  REACH OUT <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </button>
          </section>
        );

        // Render any remaining featured projects at the end
        while (projectIdx < featuredProjects.length) {
          sections.push(renderProject(projectIdx++));
        }

        return sections;
      })()}

      {/* Footer Section */}
      <section className="relative w-full snap-start flex-shrink-0">
        <Footer onNavigate={onNavigate || (() => { })} />
      </section>
    </div>
  );
}