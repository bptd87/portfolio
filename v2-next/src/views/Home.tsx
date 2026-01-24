
import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, BookOpen } from 'lucide-react';
// ImageWithFallback removed (unused)
import { supabase } from '../utils/supabase/client';
// Hero pattern removed - was causing build errors
// Placeholder for missing Figma asset
const portraitImage = "/images/portrait-placeholder.png";

import { useSiteSettings } from '../hooks/useSiteSettings';
import { useTheme } from '../hooks/useTheme';
import { Footer } from '../components/Footer';
import { RevealText, FadeInUp, ParallaxImage } from '../components/shared/Motion';

import { SEO } from '../components/SEO';
import { SkeletonHome } from '../components/skeletons/SkeletonHome';
import { optimizeSupabaseImage, generateResponsiveSrcset } from '../utils/supabase-image-optimizer';


// Hero pattern style removed - was causing build errors
const heroStyle: React.CSSProperties = {
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
  subcategory?: string;
  venue?: string;
  location?: string;
}

interface ImageWithFocus {
  url: string;
  focus: { x: number; y: number };
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

interface ArticleItem {
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
  const [latestArticles, setLatestArticles] = useState<ArticleItem[]>([]);
  const [allProjectImages, setAllProjectImages] = useState<ImageWithFocus[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [navigatingProject, setNavigatingProject] = useState<Project | null>(null);
  const { settings } = useSiteSettings();
  const { theme } = useTheme();

  // Hero Slideshow State
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Mounted state for LCP optimization (defer secondary slides)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Auto-advance hero slideshow
  useEffect(() => {
    if (featuredProjects.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % Math.min(featuredProjects.length, 5));
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [featuredProjects.length]);

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
      onNavigate?.(`project/${project.slug || encodeURIComponent(project.id)}`);
    }, 300);
  };

  // Scrollbar is now styled globally with transparent overlay

  useEffect(() => {
    const fetchCriticalData = async () => {
      try {
        setLoading(true);

        // Fetch CRITICAL data for LCP (Hero, Featured Cards, Recent News)
        // Optimized selects to reduce payload size
        const [projectsRes, newsRes, articlesRes] = await Promise.all([
          supabase
            .from('portfolio_projects')
            .select('id,title,slug,year,category,subcategory,venue,location,card_image,focus_point,featured,published,month')
            .eq('published', true)
            .eq('featured', true)
            .order('year', { ascending: false }),
          supabase
            .from('news')
            .select('id,title,date,category,cover_image,excerpt,slug')
            .eq('published', true)
            .order('date', { ascending: false }),
          supabase
            .from('articles')
            .select('id,title,created_at,published_at,category,cover_image,excerpt,slug')
            .order('published_at', { ascending: false })
            .limit(10)
        ]);

        if (projectsRes.error) console.error('Error fetching projects:', projectsRes.error);
        if (newsRes.error) console.error('Error fetching news:', newsRes.error);

        // Process Projects
        if (projectsRes.data && projectsRes.data.length > 0) {
          const projectsArray = projectsRes.data.map((p: any) => ({
            ...p,
            cardImage: p.card_image,
            coverImage: p.card_image, // Fallback
            focusPoint: p.focus_point || { x: 50, y: 50 },
            venue: p.venue || p.Venue,
            location: p.location || p.Location,
            subcategory: p.subcategory || p.sub_category
          })).sort((a: any, b: any) => {
            if (a.year && b.year) {
              if (Number(a.year) !== Number(b.year)) {
                return Number(b.year) - Number(a.year);
              }
              // If years are equal, sort by month desc
              return (b.month || 0) - (a.month || 0);
            }
            return 0;
          });
          setFeaturedProjects(projectsArray.slice(0, 8));
        }

        // Process News
        if (newsRes.data && newsRes.data.length > 0) {
          const newsArray = newsRes.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            date: item.date, // DB is timestamp string
            category: item.category || 'News',
            coverImage: item.cover_image,
            excerpt: item.excerpt,
            slug: item.slug
            // Note: coverImageFocalPoint missing in DB schema currently
          }));
          setLatestNews(newsArray);
        }

        // Process Articles
        if (articlesRes.data && articlesRes.data.length > 0) {
          const articlesArray = articlesRes.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            date: item.published_at || item.created_at,
            category: item.category || 'Article',
            coverImage: item.cover_image,
            excerpt: item.excerpt,
            slug: item.slug
          }));
          setLatestArticles(articlesArray);
        }

      } catch (error) {
        console.error('Home critical fetch error:', error);
      } finally {
        // Unblock rendering immediately after critical data
        setLoading(false);
      }
    };

    fetchCriticalData();

  }, []);

  // Deferred Fetch for Footer/Collaborators (Non-Blocking)
  useEffect(() => {
    const fetchDeferredData = async () => {
      // Small delay to let LCP paint first
      await new Promise(r => setTimeout(r, 100));

      try {
        const [collabRes, allImagesRes] = await Promise.all([
          supabase.from('collaborators').select('name'),
          supabase
            .from('portfolio_projects')
            .select('card_image,focus_point') // Only fetch distinct image fields
            .eq('published', true)
            .limit(100)
        ]);

        // Process Collaborators
        if (collabRes.data && collabRes.data.length > 0) {
          const names = collabRes.data.map((c: any) => c.name);
          setCollaborators(names);
        } else if (!collabRes.data || collabRes.data.length === 0) {
          setCollaborators(['South Coast Repertory', 'Stephens College', 'Okoboji Summer Theatre', 'Theatre SilCo']);
        }

        // Process All Images for CTA
        if (allImagesRes.data) {
          const allImgs: ImageWithFocus[] = allImagesRes.data.flatMap((p: any) => {
            const focus = p.focus_point || { x: 50, y: 50 };
            const projectImgs = [];
            if (p.card_image && typeof p.card_image === 'string' && p.card_image.length > 5) {
              projectImgs.push({ url: p.card_image, focus });
            }
            if (p.cover_image && typeof p.cover_image === 'string' && p.cover_image.length > 5 && p.cover_image !== p.card_image) {
              projectImgs.push({ url: p.cover_image, focus });
            }
            return projectImgs;
          });
          setAllProjectImages(allImgs.sort(() => Math.random() - 0.5));
        }
      } catch (err) {
        console.error("Home deferred fetch error:", err);
      }
    };

    fetchDeferredData();
  }, []); // Run on mount, but async deferred

  // Scroll locking is now handled by App.tsx wrapper class

  const [showScrollbar, setShowScrollbar] = useState(false);

  useEffect(() => {
    // Hide scrollbar during initial hero animation (cinematic entrance)
    const timer = setTimeout(() => {
      setShowScrollbar(true);
    }, 1200);
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
    return <SkeletonHome />;
  }

  return (
    <div
      id="home-scroll-container"
      className="relative min-h-screen w-full overflow-x-hidden bg-black text-white selection:bg-white selection:text-black"
    >
      <SEO
        title="Brandon PT Davis – Scenic & Experiential Designer"
        description="Scenic and experiential designer working across theatre and live environments, creating story-driven spaces for performance and audiences."
        keywords={[
          'Scenic Designer',
          'Experiential Design',
          'Theatre Design',
          'Scenic Design Portfolio',
          'Brandon PT Davis',
          'Brandon Davis Scenic'
        ]}
      />
      {/* Frame 0: Hero with Dynamic Slideshow */}
      <section data-nav="dark" className="sticky top-0 h-screen w-full overflow-hidden bg-black block z-0">
        {/* Dynamic Background Slideshow */}
        <div className="absolute inset-0 w-full h-full">
          {featuredProjects.length > 0 ? (
            featuredProjects.slice(0, 5).map((project, index) => {
              // OPTIMIZATION: Only render the first slide initially to improve LCP
              // The others will mount after hydration


              if (index > 0 && !mounted) return null;

              return (
                <div
                  key={`hero-${project.id}`}
                  className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <div
                    className={`absolute inset-0 w-full h-full transform transition-transform duration-[10000ms] ease-linear ${index === currentHeroIndex ? 'scale-110' : 'scale-100'
                      }`}
                  >

                    {project.coverImage && (() => {
                      const { srcset, sizes } = generateResponsiveSrcset(
                        project.coverImage,
                        [640, 1024, 1600, 2000],
                        { quality: 80, format: 'webp' }
                      );

                      return (
                        <img
                          src={optimizeSupabaseImage(project.coverImage, { width: 1200 }) || ''}
                          srcSet={srcset}
                          sizes="100vw"
                          alt=""
                          className="w-full h-full object-cover opacity-60"
                          style={{
                            objectPosition: project.focusPoint
                              ? `${project.focusPoint.x}% ${project.focusPoint.y}%`
                              : 'center center',
                          }}
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "low"}
                        />
                      );
                    })()}
                  </div>
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              );
            })
          ) : (
            <>
              {/* Fallback to pattern if no projects loaded yet */}
              <div
                className="absolute inset-0 w-[200%] h-full animate-scroll-seamless opacity-30"
                style={heroStyle}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
            </>
          )}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-5xl p-4">
            <h1
              className="font-display text-white text-6xl md:text-8xl lg:text-9xl mb-8 italic leading-none tracking-tight drop-shadow-2xl mix-blend-overlay opacity-90"
            >
              {settings.heroTitle || 'Brandon PT Davis'}
            </h1>
            <div className="font-pixel text-white/90 text-xl md:text-2xl lg:text-3xl tracking-[0.4em] mb-12 drop-shadow-lg uppercase">
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
                className="text-white/60 hover:text-white transition-colors animate-bounce mt-8"
                aria-label="Scroll down"
              >
                <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
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
              data-nav="dark"
              className={`sticky top-0 h-screen w-full flex items-center justify-center bg-black p-8 md:p-12 lg:p-20 ${navigatingProject?.id === project.id ? 'z-50' : 'z-10'}`}
              onClick={() => handleProjectClick(project)}
            >
              <div
                className={`relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl transition-transform duration-700 ease-out cursor-pointer group isolation-isolate transform-gpu border border-white/5 ${getCategoryColor(project.category)} ${navigatingProject?.id === project.id ? 'scale-105' : 'hover:scale-[1.01]'}`}
                style={{
                  clipPath: 'inset(0 round 3rem)',
                  WebkitClipPath: 'inset(0 round 3rem)'
                }}
              >

                {/* Image */}
                <div className="absolute inset-0 rounded-[3rem] overflow-hidden">
                  <ParallaxImage
                    src={project.cardImage || ''}
                    width={800}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    style={{
                      objectPosition: project.focusPoint
                        ? `${project.focusPoint.x}% ${project.focusPoint.y}%`
                        : 'center center',
                    }}
                    offset={20}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : 'low'}
                  />
                  {/* Cinematic Overlay - Gradient for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 opacity-60 group-hover:opacity-50 transition-opacity duration-500" />
                </div>

                {/* Content Layout - Modern & Clean */}
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
                  {/* Top Meta: Year, Category, Subcategory, Location */}
                  <div className="flex items-start justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 w-full">
                    <div className="flex flex-wrap gap-2 md:gap-3 items-center">
                      <span className="backdrop-blur-md bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-full font-pixel text-[10px] tracking-[0.2em] uppercase">
                        {project.category || 'Design'}
                      </span>
                      {project.subcategory && (
                        <span className="backdrop-blur-md bg-white/5 border border-white/10 text-white/70 px-4 py-1.5 rounded-full font-pixel text-[10px] tracking-[0.2em] uppercase">
                          {project.subcategory}
                        </span>
                      )}
                      {(project.venue || project.location) && (
                        <span className="backdrop-blur-md bg-white/5 border border-white/10 text-white/70 px-4 py-1.5 rounded-full font-pixel text-[10px] tracking-[0.2em] uppercase">
                          {project.venue || project.location}
                        </span>
                      )}
                      {project.year && (
                        <span className="backdrop-blur-md bg-black/20 border border-white/10 text-white/60 px-4 py-1.5 rounded-full font-pixel text-[10px] tracking-[0.2em]">
                          {project.year}
                        </span>
                      )}
                    </div>

                    {/* View Project Action */}
                    <div className="hidden md:flex items-center gap-2 backdrop-blur-md bg-white text-black px-6 py-2 rounded-full font-medium text-xs tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      VIEW CASE STUDY
                    </div>
                  </div>

                  {/* Bottom: Title & Details */}
                  <div className="max-w-5xl opacity-90 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:-translate-y-2 transition-transform duration-500">
                    <h2 className="font-display text-white text-5xl md:text-7xl lg:text-8xl italic leading-[0.9] mb-6 drop-shadow-lg">
                      {project.title}
                    </h2>
                    {project.client && (
                      <div className="font-pixel text-white/60 text-xs tracking-[0.3em] uppercase border-l border-white/30 pl-4 ml-1">
                        {project.client}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </section>
          );
        };

        // Initial featured projects (0-2)
        if (projectIdx < featuredProjects.length) sections.push(renderProject(projectIdx++));
        if (projectIdx < featuredProjects.length) sections.push(renderProject(projectIdx++));

        // News Section - Cinematic Full-Screen Hero
        if (latestNews.length > 0) {
          const featuredNews = latestNews[0];
          const otherNews = latestNews.slice(1);

          sections.unshift(
            <section key="news" data-nav="dark" className="sticky top-0 min-h-screen w-full bg-black overflow-hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">


              {/* Main Content with padding for navbar */}
              <div className="flex-1 flex flex-col justify-center px-6 md:px-12 pt-24 pb-8 gap-8">

                {/* Featured News - 16:9 Cinematic Card */}
                <div
                  onClick={() => onNavigate?.(`news/${featuredNews.slug || encodeURIComponent(featuredNews.id)}`)}
                  className="w-full relative cursor-pointer rounded-2xl overflow-hidden bg-[#1c1c1e] flex-1"
                  style={{
                    aspectRatio: '16/9',
                    minHeight: '280px',
                    maxHeight: '55vh'
                  }}
                >
                  <img
                    src={optimizeSupabaseImage(featuredNews.coverImage, { width: 1000 }) || "/images/studio/history-abstract.webp"}
                    srcSet={
                      featuredNews.coverImage
                        ? generateResponsiveSrcset(featuredNews.coverImage, [640, 1024, 1600], { quality: 80 }).srcset
                        : undefined
                    }
                    sizes="(max-width: 768px) 100vw, 80vw"
                    alt={featuredNews.title}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: featuredNews.coverImageFocalPoint
                        ? `${featuredNews.coverImageFocalPoint.x}% ${featuredNews.coverImageFocalPoint.y}%`
                        : 'center center'
                    }}
                  />
                  {/* Cinematic Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
                  <div className="cinematic-vignette absolute inset-0 opacity-60 pointer-events-none" />

                  {/* Title on Card */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px' }}>
                    <span className="font-pixel" style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      color: 'rgba(255,150,100,0.9)',
                      display: 'block',
                      marginBottom: '12px'
                    }}>
                      {featuredNews.category?.toUpperCase() || 'LATEST'} · {new Date(featuredNews.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                    </span>
                    <h2 className="font-display text-white text-3xl md:text-5xl lg:text-6xl italic leading-none drop-shadow-2xl max-w-4xl">
                      {featuredNews.title}
                    </h2>
                  </div>
                </div>

                {/* Smaller News Cards - Taller Scroll Section */}
                {latestNews.length >= 1 && (
                  <div style={{ position: 'relative', overflow: 'hidden', minHeight: '220px' }}>
                    <div
                      className="flex animate-marquee-left"
                      style={{ gap: '16px', paddingBottom: '16px' }}
                    >
                      {[...latestNews, ...latestNews].map((news, idx) => (
                        <div
                          key={`${news.id}-${idx}`}
                          onClick={() => onNavigate?.(`news/${news.slug || encodeURIComponent(news.id)}`)}
                          style={{
                            flexShrink: 0,
                            width: '320px',
                            height: '200px',
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            backgroundColor: '#1c1c1e'
                          }}
                        >
                          <img
                            src={optimizeSupabaseImage(news.coverImage, { width: 600 }) || "/images/studio/history-abstract.webp"}
                            alt={news.title}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              opacity: 0.6
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(28,28,30,0.95) 30%, transparent 100%)'
                          }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
                            <span className="font-pixel" style={{ fontSize: '9px', color: 'rgba(255,150,100,0.8)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
                              {news.category || 'News'}
                            </span>
                            <h3 className="font-display" style={{ fontWeight: 500, fontStyle: 'italic', color: 'white', fontSize: '18px', lineHeight: 1.2 }}>
                              {news.title}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        }

        // Featured Project between News and Collabs
        if (projectIdx < featuredProjects.length) sections.push(renderProject(projectIdx++));

        // SECTION: KNOWLEDGE & TOOLS (Unified Apple-style Layout)
        sections.push(
          <section key="knowledge-tools" data-nav="dark" className="sticky top-0 h-auto md:h-screen w-full bg-gradient-to-br from-indigo-950/40 via-purple-900/20 to-black p-0 overflow-hidden flex flex-col touch-pan-y shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-30">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,100,255,0.05),transparent_60%)] pointer-events-none" />

            <div className="flex-1 flex flex-col justify-center px-6 md:px-12 gap-8 md:gap-12 relative z-10 py-12 md:py-0">

              {/* TOP ROW: ARTICLES (Large Cards) */}
              <div className="flex flex-col gap-4">
                <div className="flex items-end justify-between px-2">
                  <div>
                    <div className="font-pixel text-[10px] text-purple-300 tracking-[0.3em] mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                      ARTICLES
                    </div>
                    <h2 className="font-display text-white text-3xl md:text-5xl italic leading-none relative">
                      Articles
                    </h2>
                  </div>
                  <button
                    onClick={() => onNavigate?.('articles')}
                    className="hidden md:flex items-center gap-2 font-pixel text-[9px] text-white/40 hover:text-white transition-colors tracking-widest"
                  >
                    VIEW ARCHIVE <ArrowRight size={10} />
                  </button>
                </div>

                {/* Horizontal Slider: Articles with Arrow */}
                <div style={{ position: 'relative' }}>
                  <div
                    id="articles-slider"
                    style={{ display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '32px', minHeight: '520px', scrollBehavior: 'smooth', overscrollBehaviorX: 'contain', touchAction: 'pan-x pan-y' }}
                  >
                    {(latestArticles || []).map((article) => (
                      <div
                        key={article.id}
                        onClick={() => onNavigate?.(`articles/${article.slug || encodeURIComponent(article.id)}`)}
                        style={{
                          flexShrink: 0,
                          width: 'clamp(280px, 80vw, 480px)',
                          aspectRatio: '24/25',
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          backgroundColor: '#1c1c1e'
                        }}
                      >
                        {/* Cover Image */}
                        <img
                          src={article.coverImage || "/images/studio/history-abstract.webp"}
                          alt={article.title}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.8
                          }}
                        />
                        {/* Gradient overlay */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 35%, rgba(28,28,30,0.95) 100%)'
                        }} />
                        {/* Content */}
                        <div style={{ position: 'absolute', inset: 0, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                          <span className="font-pixel" style={{
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            color: 'rgba(255,255,255,0.6)',
                            display: 'block',
                            marginBottom: '12px'
                          }}>
                            {article.category || 'Article'} <span className="opacity-50 mx-1">/</span> {new Date(article.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <h3 className="font-display text-2xl md:text-4xl leading-tight text-white italic font-medium max-w-[95%] drop-shadow-md">
                            {article.title}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Scroll Right Arrow Button - Glass Effect */}
                  <button
                    onClick={() => {
                      const slider = document.getElementById('articles-slider');
                      if (slider) slider.scrollBy({ left: 500, behavior: 'smooth' });
                    }}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      zIndex: 10
                    }}
                    aria-label="Scroll right"
                  >
                    <ArrowRight style={{ width: '20px', height: '20px', color: 'white' }} />
                  </button>
                </div>
              </div>

              {/* BOTTOM ROW: STUDIO (Small Cards) */}
              <div className="flex flex-col gap-4">
                <div className="flex items-end justify-between px-2">
                  <div>
                    <div className="font-pixel text-[10px] text-blue-400 tracking-[0.3em] mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      STUDIO RESOURCES
                    </div>
                    <h2 className="font-display text-white text-3xl md:text-4xl italic leading-none">
                      Studio
                    </h2>
                  </div>
                </div>

                {/* Horizontal Slider: Studio with Arrow */}
                <div style={{ position: 'relative' }}>
                  <div
                    id="studio-slider"
                    style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '32px', minHeight: '260px', scrollBehavior: 'smooth', overscrollBehaviorX: 'contain', touchAction: 'pan-x pan-y' }}
                  >
                    {[
                      { id: 'tutorials', title: 'Tutorials', desc: 'Design & Workflow Guides', img: '/images/studio/tutorials.webp' },
                      { id: 'scenic-vault', title: 'Scenic Vault', desc: 'Scenic Reference Library', img: '/images/studio/vault.webp' },
                      { id: 'architecture-scale-converter', title: 'Scale Converter', desc: 'Model & Drafting Scales', img: '/images/studio/scale-converter-abstract.webp' },
                      { id: 'dimension-reference', title: 'Dimension Reference', desc: 'Standard Scenic Dimensions', img: '/images/studio/dimension-abstract.webp' },
                      { id: 'rosco-paint-calculator', title: 'Paint Calculator', desc: 'Scenic Paint Mixing', img: '/images/studio/paint-finder-abstract.webp' },
                      { id: 'model-scaler', title: 'Model Scaler', desc: 'Physical Model Scaling', img: '/images/studio/model-scaler-abstract.webp' },
                      { id: 'studio', title: 'All Studio Apps', desc: 'Browse Resources', img: '/images/studio/app-studio.webp' }
                    ].map((tool) => (
                      <div
                        key={tool.id}
                        onClick={() => onNavigate?.(tool.id)}
                        style={{
                          flexShrink: 0,
                          width: 'clamp(200px, 45vw, 313px)',
                          aspectRatio: '313/240',
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          backgroundColor: '#1c1c1e'
                        }}
                      >
                        <img
                          src={tool.img}
                          alt=""
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,28,30,0.95) 20%, rgba(28,28,30,0.5) 60%, transparent 100%)' }} />
                        <div style={{ position: 'absolute', inset: 0, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                          <h3 className="font-display" style={{ fontWeight: 600, color: 'white', fontSize: '18px', marginBottom: '4px', fontStyle: 'italic' }}>{tool.title}</h3>
                          <p className="font-pixel" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>{tool.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Studio Scroll Arrow - Glass Effect */}
                  <button
                    onClick={() => {
                      const slider = document.getElementById('studio-slider');
                      if (slider) slider.scrollBy({ left: 350, behavior: 'smooth' });
                    }}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      zIndex: 10
                    }}
                    aria-label="Scroll right"
                  >
                    <ArrowRight style={{ width: '20px', height: '20px', color: 'white' }} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

        // Featured Project before About
        if (projectIdx < featuredProjects.length) sections.push(renderProject(projectIdx++));

        // About Me: Editorial Focus
        sections.push(
          <section key="about-editorial" data-nav="dark" className="sticky top-0 h-screen w-full bg-white dark:bg-black overflow-hidden flex flex-col md:flex-row pt-14 md:pt-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40">


            {/* Split Layout: Distinct Imagery & Narrative */}
            <div className="relative flex-1 h-2/5 md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-neutral-200 dark:border-white/5">
              <img
                src={settings.profileImageUrl || portraitImage}
                alt={settings.heroTitle || "Brandon PT Davis"}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent md:block hidden opacity-50 dark:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent opacity-50 dark:opacity-100" />
              <div className="absolute inset-0 cinematic-vignette opacity-20 dark:opacity-50" />

              <div className="absolute bottom-16 left-16 hidden md:block">
                <div className="font-pixel text-[9px] text-white/80 dark:text-orange-500/40 tracking-[0.4em] mb-2 uppercase drop-shadow-md">Scenic Designer</div>
                <div className="font-display text-white text-2xl italic drop-shadow-md">{settings.heroTitle || 'Brandon PT Davis'}</div>
              </div>
            </div>

            <div className="relative flex-1 h-3/5 md:h-full flex flex-col items-center justify-center p-8 md:py-12 md:px-16 lg:pl-20 lg:pr-16 text-center md:text-left md:items-start bg-neutral-50 dark:bg-neutral-950">
              <div className="absolute inset-0 bg-grid-black/[0.05] dark:bg-grid-white/[0.02] pointer-events-none" />
              <FadeInUp>
                <div className="font-pixel text-[10px] text-orange-600 dark:text-orange-500 tracking-[0.6em] mb-8 uppercase pulser-orange">
                  {settings.heroSubtitle || 'Scenic & Experiential Designer'}
                </div>
              </FadeInUp>
              <FadeInUp delay={0.2}>
                <h2
                  className="font-display text-black dark:text-white text-6xl md:text-8xl lg:text-9xl italic mb-10"
                >
                  About Me
                </h2>
              </FadeInUp>
              <FadeInUp delay={0.4}>
                <div className="max-w-md">
                  <p className="font-sans text-neutral-600 dark:text-white/60 text-lg leading-relaxed mb-12 italic border-l-2 border-orange-500/20 pl-8">
                    {settings.bioText || 'Scenic and experiential designer working in theatre and live environments. My work centers on storytelling through space—designing worlds that support performance, audience experience, and narrative clarity.'}
                  </p>
                  <button
                    onClick={() => onNavigate?.('about')}
                    className="group flex items-center gap-6 font-pixel text-xs text-black/60 dark:text-white/40 tracking-[0.4em] hover:text-black dark:hover:text-white transition-all"
                  >
                    READ THE FULL STORY <div className="w-12 h-px bg-black/20 dark:bg-white/20 group-hover:w-24 group-hover:bg-orange-500 transition-all duration-700" />
                  </button>
                </div>
              </FadeInUp>
            </div>
          </section>
        );

        // Render any remaining featured projects at the end
        while (projectIdx < featuredProjects.length) {
          sections.push(renderProject(projectIdx++));
        }

        // CTA: The Floating Moodboard (Color Edition)
        const availableImages: ImageWithFocus[] = allProjectImages.length > 0 ? allProjectImages : featuredProjects.flatMap(p => {
          if (!p.cardImage) return [];
          return [{ url: p.cardImage, focus: p.focusPoint || { x: 50, y: 50 } }];
        });
        // Shuffle and take more images for density (smaller images need more count)
        const scatterImages = [...availableImages].sort(() => Math.random() - 0.5).slice(0, 30);

        sections.push(
          <section key="cta-archive" data-nav="dark" className="sticky top-0 h-screen w-full bg-neutral-950 overflow-hidden flex items-center justify-center z-50 perspective-1000">
            <style>{`
                @keyframes float-cards {
                  0% { transform: translateY(0px) rotate(var(--rot)); }
                  50% { transform: translateY(-20px) rotate(calc(var(--rot) + 2deg)); }
                  100% { transform: translateY(0px) rotate(var(--rot)); }
                }
             `}</style>

            {/* Floating Moodboard Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {scatterImages.map((item, i) => {
                // Deterministic random
                const r1 = (i * 239 + 17) % 100;
                const r2 = (i * 347 + 23) % 100;
                const r3 = (i * 199 + 7) % 100;

                // Safe Zone Logic: Avoid center 40% (30-70)
                let xPos = r1;
                let yPos = r2;

                // Push away from center
                if (xPos > 30 && xPos < 70 && yPos > 30 && yPos < 70) {
                  if (r3 % 2 === 0) {
                    xPos = xPos < 50 ? (xPos % 25) : (75 + xPos % 20);
                  } else {
                    yPos = yPos < 50 ? (yPos % 25) : (75 + yPos % 20);
                  }
                }

                const rot = (r3 % 60) - 30; // More rotation variance looks reduced size better
                const scale = 0.7 + (r2 % 40) / 100; // 0.7 - 1.1 scale
                const width = i % 3 === 0 ? 'w-48' : i % 2 === 0 ? 'w-40' : 'w-32';

                return (
                  <div
                    key={`scatter-${i}`}
                    className={`absolute ${width} aspect-video bg-neutral-800 rounded shadow-xl overflow-hidden opacity-85 transition-all duration-700 pointer-events-auto hover:opacity-100 hover:scale-125 hover:z-40 hover:shadow-2xl grayscale-0`}
                    style={{
                      left: `${xPos}%`,
                      top: `${yPos}%`,
                      transform: `translate(-50%, -50%) scale(${scale})`,
                      zIndex: Math.floor(scale * 5),
                      '--rot': `${rot}deg`,
                      animation: `float-cards ${15 + (i % 10)}s ease-in-out infinite`,
                      animationDelay: `${i * -0.7}s`
                    } as React.CSSProperties}
                  >
                    <img
                      src={item.url}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: `${item.focus.x}% ${item.focus.y}%` }}
                      alt=""
                    />
                  </div>
                );
              })}
            </div>

            {/* Center Focus: Rounded Square Box */}
            <div className="relative z-30 flex flex-col items-center justify-center">
              <div className="backdrop-blur-3xl bg-black/50 p-12 md:p-20 rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-center group hover:bg-black/60 hover:border-white/20 transition-all duration-700">
                <div className="font-pixel text-orange-500 text-[9px] tracking-[0.3em] uppercase mb-6 opacity-80">
                  Full Collection
                </div>
                <h2 className="font-display text-white text-6xl md:text-8xl italic mb-4 drop-shadow-2xl">
                  Portfolio
                </h2>
                <p className="font-sans text-neutral-400 text-[10px] md:text-xs tracking-[0.2em] uppercase mb-10 max-w-xs mx-auto leading-loose border-t border-white/10 pt-6 mt-6">
                  Art x Technology x Design
                </p>
                <button
                  onClick={() => onNavigate?.('portfolio')}
                  className="px-12 py-4 bg-white text-black font-sans font-bold text-xs tracking-[0.25em] rounded-full hover:scale-105 hover:bg-orange-500 hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                >
                  VIEW ALL
                </button>
              </div>
            </div>
          </section>
        );

        return sections;
      })()}

      {/* Footer Section */}
      <section data-nav={theme} className="relative w-full snap-start flex-shrink-0">
        <Footer onNavigate={onNavigate || (() => { })} />
      </section>
    </div>
  );
}