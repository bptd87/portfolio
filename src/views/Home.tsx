'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

import { ArrowRight, ChevronDown, BookOpen } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useTheme } from '../hooks/useTheme';
import { Footer } from '../components/Footer';
import { RevealText, FadeInUp, ParallaxImage } from '../components/shared/Motion';
import { SEO } from '../components/SEO';
import { SkeletonHome } from '../components/skeletons/SkeletonHome';
import { optimizeSupabaseImage, generateResponsiveSrcset } from '../utils/supabase-image-optimizer';
import { getRecentNews, NewsItem as StaticNewsItem } from '../data/news';
import { APP_STUDIO_TOOLS } from '../data/app-studio-tools';
import { TUTORIALS } from '../data/tutorials';

// Constants
// heroStyle removed


const STUDIO_IMAGE_MAP: Record<string, string> = {
  'dimension-reference': 'dimension-abstract.webp',
  'design-history-timeline': 'history-abstract.webp',
  'classical-architecture-guide': 'classics-abstract.webp',
  'architecture-scale-converter': 'scale-converter-abstract.webp',
  'rosco-paint-calculator': 'rosco-abstract.webp',
  'commercial-paint-finder': 'paint-finder-abstract.webp',
  'model-reference-scaler': 'model-scaler-abstract.webp'
};

interface HomeProps {
  onNavigate?: (page: string) => void;
}

interface Project {
  id: string;
  title: string;
  slug?: string;
  category: string;
  cardImage?: string;
  coverImage?: string;
  focusPoint?: { x: number; y: number };
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
  const [loading, setLoading] = useState(true);
  const [navigatingProject, setNavigatingProject] = useState<Project | null>(null);
  const { settings } = useSiteSettings();
  const { theme } = useTheme();

  // Hero Slideshow State
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Mounted state for hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Auto-advance hero slideshow
  useEffect(() => {
    if (featuredProjects.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % Math.min(featuredProjects.length, 5));
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredProjects.length]);

  // Handle project navigation
  const handleProjectClick = (project: Project) => {
    setNavigatingProject(project);
    if (project.cardImage) {
      sessionStorage.setItem('transitionImage', project.cardImage);
      sessionStorage.setItem('transitionFocusPoint', JSON.stringify(project.focusPoint || { x: 50, y: 50 }));
    }
    setTimeout(() => {
      onNavigate?.(`project/${project.slug || encodeURIComponent(project.id)}`);
    }, 300);
  };

  useEffect(() => {
    const fetchCriticalData = async () => {
      try {
        setLoading(true);

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

        if (projectsRes.data) {
          const projectsArray = projectsRes.data.map((p: any) => ({
            ...p,
            cardImage: p.card_image,
            focusPoint: p.focus_point || { x: 50, y: 50 }
          })).sort((a: any, b: any) => {
            if (a.year !== b.year) return Number(b.year) - Number(a.year);
            return (b.month || 0) - (a.month || 0);
          });
          setFeaturedProjects(projectsArray.slice(0, 8));
        }

        if (newsRes.data) {
          setLatestNews(newsRes.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            date: item.date,
            category: item.category || 'News',
            coverImage: item.cover_image,
            excerpt: item.excerpt,
            slug: item.slug
          })));
        }

        if (articlesRes.data) {
          setLatestArticles(articlesRes.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            date: item.published_at || item.created_at,
            category: item.category || 'Article',
            coverImage: item.cover_image,
            excerpt: item.excerpt,
            slug: item.slug
          })));
        }
      } catch (error) {
        console.error('Home fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCriticalData();
  }, []);

  useEffect(() => {
    const fetchDeferredData = async () => {
      try {
        const { data: allImagesRes } = await supabase
          .from('portfolio_projects')
          .select('card_image,focus_point')
          .eq('published', true)
          .limit(100);

        if (allImagesRes) {
          const allImgs: ImageWithFocus[] = allImagesRes.flatMap((p: any) => {
            if (p.card_image) return [{ url: p.card_image, focus: p.focus_point || { x: 50, y: 50 } }];
            return [];
          });
          setAllProjectImages(allImgs.sort(() => Math.random() - 0.5));
        }
      } catch (err) {
        console.error("Home deferred fetch error:", err);
      }
    };
    fetchDeferredData();
  }, []);

  const renderProject = (project: Project, idx: number, zIndex: number) => {
    return (
      <section
        key={`project-${project.id}`}
        data-nav="dark"
        className={`sticky top-0 h-screen w-full flex items-center justify-center bg-black p-8 md:p-12 lg:p-20 focus:outline-none focus-within:ring-2 focus-within:ring-white/20 ${navigatingProject?.id === project.id ? 'z-[100]' : ''}`}
        style={{ zIndex }}
        onClick={() => handleProjectClick(project)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleProjectClick(project);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`View case study: ${project.title}`}
      >
        <div
          className={`relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl transition-transform duration-700 ease-out cursor-pointer group isolation-isolate transform-gpu border border-white/5 ${navigatingProject?.id === project.id ? 'scale-105' : 'hover:scale-[1.01]'}`}
          style={{
            clipPath: 'inset(0 round 3rem)',
            WebkitClipPath: 'inset(0 round 3rem)'
          }}
        >
          {/* Image */}
          <div className="absolute inset-0 rounded-[3rem] overflow-hidden">
            <ParallaxImage
              src={project.cardImage || ''}
              width={1280}
              alt={`Scenic design for ${project.title} - ${project.venue || 'Theatrical Production'}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              style={{
                objectPosition: project.focusPoint
                  ? `${project.focusPoint.x}% ${project.focusPoint.y}%`
                  : 'center center',
              }}
              offset={20}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 opacity-60 group-hover:opacity-50 transition-opacity duration-500" />
          </div>

          {/* Content Layout */}
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
            <div className="flex items-start justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 w-full">
              <div className="flex flex-wrap gap-2 md:gap-3 items-center">
                <span className="backdrop-blur-md bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-full font-pixel text-[10px] tracking-[0.2em] uppercase">
                  {project.category || 'Design'}
                </span>
                {project.year && (
                  <span className="backdrop-blur-md bg-black/20 border border-white/10 text-white/60 px-4 py-1.5 rounded-full font-pixel text-[10px] tracking-[0.2em]">
                    {project.year}
                  </span>
                )}
              </div>
              <div className="hidden md:flex items-center gap-2 backdrop-blur-md bg-white text-black px-6 py-2 rounded-full font-medium text-xs tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                VIEW CASE STUDY
              </div>
            </div>

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

  if (loading) return <SkeletonHome />;

  return (
    <div id="home-scroll-container" className="relative h-screen w-full overflow-y-auto overflow-x-hidden bg-black text-white selection:bg-white selection:text-black scroll-smooth">
      <SEO title="Brandon PT Davis – Scenic & Experiential Designer" description="Scenic and experiential designer working across theatre and live environments." />

      {/* 0. HERO */}
      <section data-nav="dark" className="sticky top-0 h-screen w-full overflow-hidden bg-black block z-0">
        <div className="absolute inset-0 w-full h-full">
          {featuredProjects.slice(0, 5).map((project, index) => (
            <div key={`hero-${project.id}`} className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentHeroIndex ? 'opacity-100' : 'opacity-0'}`}>
              <div className={`absolute inset-0 w-full h-full transform transition-transform duration-[10000ms] ease-linear ${index === currentHeroIndex ? 'scale-110' : 'scale-100'}`}>
                <img
                  src={optimizeSupabaseImage(project.cardImage, { width: 1200 }) ?? undefined}
                  className="w-full h-full object-cover opacity-90"
                  style={{ objectPosition: `${project.focusPoint?.x}% ${project.focusPoint?.y}%` }}
                  alt={`Hero background showing ${project.title}`}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
            </div>
          ))}
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-5xl p-4">
            <h1 className="font-display text-white text-6xl md:text-8xl lg:text-9xl mb-8 italic leading-none tracking-tight drop-shadow-2xl mix-blend-overlay opacity-90">
              {settings.heroTitle || 'Brandon PT Davis'}
            </h1>
            <div className="font-pixel text-white/90 text-xl md:text-2xl lg:text-3xl tracking-[0.4em] mb-12 drop-shadow-lg uppercase">
              <RevealText text={settings.heroSubtitle || 'ART × TECHNOLOGY × DESIGN'} delay={0.5} stagger={0.08} />
            </div>
            <FadeInUp delay={1.2}>
              <button
                onClick={() => document.getElementById('home-scroll-container')?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="text-white/60 hover:text-white transition-colors animate-bounce mt-8"
                aria-label="Scroll to content"
              >
                <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
              </button>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* SECTIONS LOOP */}
      {(() => {
        const sections: React.ReactNode[] = [];
        let pIdx = 0;
        let currentZ = 10;

        // 1. News Section (First)
        if (latestNews.length > 0) {
          const featuredNews = latestNews[0];
          sections.push(
            <section key="news" data-nav="dark" className="sticky top-0 min-h-screen w-full bg-black overflow-hidden flex flex-col shadow-2xl" style={{ zIndex: currentZ++ }}>
              <div className="flex-1 flex flex-col justify-center px-6 md:px-12 pt-24 pb-8 gap-8">
                {/* Featured News - Reduced Height */}
                <div onClick={() => onNavigate?.(`news/${featuredNews.slug || featuredNews.id}`)} className="w-full relative cursor-pointer rounded-2xl overflow-hidden bg-[#1c1c1e] h-[40vh] md:h-[50vh]">
                  <img src={optimizeSupabaseImage(featuredNews.coverImage, { width: 1000 }) ?? "/images/studio/history-abstract.webp"} className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105" alt={`Featured news item: ${featuredNews.title}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
                    <span className="font-pixel text-[10px] text-orange-400 uppercase tracking-widest block mb-2">{featuredNews.category}</span>
                    <h2 className="font-display text-white text-3xl md:text-5xl italic leading-none mb-4">{featuredNews.title}</h2>
                    {featuredNews.excerpt && (
                      <p className="text-white/80 line-clamp-2 md:line-clamp-3 font-sans text-sm md:text-base">{featuredNews.excerpt}</p>
                    )}
                  </div>
                </div>

                {/* Horizontal Scroll List - "Smaller Cards" with Marquee */}
                <div className="relative w-full overflow-hidden group/marquee">
                  <div className="flex gap-6 animate-marquee-left group-hover/marquee:paused whitespace-nowrap px-8 md:px-12">
                    {[...latestNews, ...latestNews].map((news, i) => (
                      <div
                        key={`${news.id}-${i}`}
                        onClick={() => news.slug ? onNavigate?.(`news/${news.slug}`) : null}
                        className="flex-shrink-0 w-[240px] aspect-[4/3] relative rounded-xl overflow-hidden bg-[#1c1c1e] cursor-pointer border border-white/5 hover:border-white/20 transition-colors whitespace-normal"
                        role="button"
                        aria-label={`Read news: ${news.title}`}
                      >
                        <img
                          src={optimizeSupabaseImage(news.coverImage, { width: 400 }) ?? undefined}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                          alt={`News coverage for ${news.title}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        <div className="absolute bottom-0 p-4">
                          <span className="font-pixel text-[8px] text-white/60 uppercase tracking-widest block mb-1">{news.category}</span>
                          <h3 className="font-display text-white italic text-lg leading-tight mb-2 line-clamp-2">{news.title}</h3>
                          {news.excerpt && (
                            <p className="text-white/60 text-xs line-clamp-2 font-sans">{news.excerpt}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 2. First Two Projects
        if (pIdx < featuredProjects.length) sections.push(renderProject(featuredProjects[pIdx++], pIdx, currentZ++));
        if (pIdx < featuredProjects.length) sections.push(renderProject(featuredProjects[pIdx++], pIdx, currentZ++));

        // 3. Knowledge Section (Articles + Studio)
        // Changed to relative so it scrolls fully without sticky overlap issues
        sections.push(
          <section key="knowledge" className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col justify-center px-6 md:px-12 gap-16 py-24" style={{ zIndex: currentZ++ }}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-purple-900/20 to-black opacity-100 pointer-events-none" />

            {/* Articles */}
            <div className="relative z-10 flex flex-col gap-8">
              <h2 className="font-display text-white text-4xl md:text-6xl italic">Articles</h2>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar px-8 md:px-12 -mx-8 md:-mx-12">
                {latestArticles.map(a => (
                  <div
                    key={a.id}
                    onClick={() => a.slug ? onNavigate?.(`articles/${a.slug}`) : null}
                    className="flex-shrink-0 w-[280px] md:w-[350px] aspect-[4/5] relative rounded-xl overflow-hidden bg-[#1c1c1e] cursor-pointer border border-white/10 hover:border-white/30 transition-all hover:scale-[1.01]"
                    role="button"
                    aria-label={`Read article: ${a.title}`}
                  >
                    <img src={a.coverImage ?? "/images/studio/classics-abstract.webp"} className="absolute inset-0 w-full h-full object-cover opacity-80" alt={`Article: ${a.title}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute bottom-0 p-8"><h3 className="font-display text-2xl text-white italic leading-tight">{a.title}</h3></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Studio */}
            <div className="relative z-10 flex flex-col gap-8">
              <h2 className="font-display text-white text-4xl md:text-6xl italic">Studio</h2>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar px-8 md:px-12 -mx-8 md:-mx-12">
                {[
                  ...APP_STUDIO_TOOLS.slice(0, 4).map(t => ({
                    id: `app-studio/${t.route}`,
                    title: t.title,
                    desc: t.category,
                    img: `/images/studio/${STUDIO_IMAGE_MAP[t.id] || 'app-studio.webp'}`
                  })),
                  ...TUTORIALS.slice(0, 2).map(t => ({
                    id: `tutorial/${t.slug}`,
                    title: t.title,
                    desc: 'Tutorial',
                    img: t.thumbnail
                  })),
                  { id: 'app-studio', title: 'All Tools', desc: 'Browse Apps', img: '/images/studio/app-studio.webp' }
                ].map(t => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate?.(t.id)}
                    className="flex-shrink-0 w-[240px] md:w-[320px] aspect-[4/3] relative rounded-xl overflow-hidden bg-[#1c1c1e] cursor-pointer border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02]"
                    role="button"
                    aria-label={`Open studio tool: ${t.title}`}
                  >
                    <img src={t.img ?? undefined} className="absolute inset-0 w-full h-full object-cover opacity-50" alt={`Studio tool: ${t.title}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-0 p-6">
                      <h3 className="font-display text-xl text-white italic line-clamp-2">{t.title}</h3>
                      <p className="font-pixel text-[8px] text-white/40 uppercase tracking-widest">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

        // 4. Third Project
        if (pIdx < featuredProjects.length) sections.push(renderProject(featuredProjects[pIdx++], pIdx, currentZ++));

        // 5. About Section
        sections.push(
          <section key="about" className="sticky top-0 min-h-screen w-full bg-black overflow-hidden flex flex-col md:flex-row shadow-2xl" style={{ zIndex: currentZ++ }}>
            <div className="relative flex-1 h-[40vh] md:h-full">
              {settings.profileImageUrl ? <img src={settings.profileImageUrl} className="w-full h-full object-cover object-top" alt="Brandon PT Davis - Portrait" /> : <div className="w-full h-full bg-neutral-900" />}
              <div className="absolute inset-0 bg-black/10" />
            </div>
            <div className="relative flex-1 h-[60vh] md:h-full flex flex-col justify-center p-8 md:p-12 lg:p-20 bg-neutral-50 dark:bg-neutral-950">
              <span className="font-pixel text-xs text-neutral-500 uppercase tracking-widest mb-4">The Designer</span>
              <h2 className="font-display text-black dark:text-white text-5xl md:text-7xl lg:text-8xl italic mb-8 leading-[0.9]">About</h2>
              <p className="font-sans text-neutral-600 dark:text-neutral-400 text-lg md:text-xl leading-relaxed mb-12 max-w-lg">{settings.bioText || 'Scenic and experiential designer working across theatre and live environments.'}</p>
              <button onClick={() => onNavigate?.('about')} className="font-pixel text-xs uppercase tracking-[0.2em] text-black dark:text-white border-b-2 border-black/10 dark:border-white/20 pb-2 w-fit hover:border-black dark:hover:border-white transition-colors">READ FULL STORY</button>
            </div>
          </section>
        );

        // 6. Remaining Projects
        while (pIdx < featuredProjects.length) {
          sections.push(renderProject(featuredProjects[pIdx++], pIdx, currentZ++));
        }

        // 7. Archive CTA Section
        sections.push(
          <section key="cta" className="sticky top-0 min-h-screen w-full bg-black overflow-hidden flex items-center justify-center p-8 shadow-2xl" style={{ zIndex: currentZ++ }}>
            {/* Wall of Work - Vertical Marquees */}
            <div className="absolute inset-x-0 -top-20 -bottom-20 overflow-hidden bg-black grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 opacity-40">

              {/* Column 1 - Up */}
              <div className="relative h-full overflow-hidden">
                <div className="animate-marquee-up flex flex-col gap-8">
                  {[...allProjectImages, ...allProjectImages].slice(0, 10).map((img, i) => (
                    <div key={`col1-${i}`} className="w-full aspect-[3/2] rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                      <img
                        src={img.url}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `${img.focus?.x || 50}% ${img.focus?.y || 50}%` }}
                        alt="Scenic design production sample"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2 - Down */}
              <div className="relative h-full overflow-hidden hidden md:block mt-[-50px]">
                <div className="animate-marquee-down flex flex-col gap-8">
                  {[...allProjectImages, ...allProjectImages].slice(10, 20).map((img, i) => (
                    <div key={`col2-${i}`} className="w-full aspect-[3/2] rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                      <img
                        src={img.url}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `${img.focus?.x || 50}% ${img.focus?.y || 50}%` }}
                        alt="Scenic design production sample"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3 - Up */}
              <div className="relative h-full overflow-hidden">
                <div className="flex flex-col gap-8 animate-[marquee-up_70s_linear_infinite]">
                  {[...allProjectImages, ...allProjectImages].slice(20, 30).map((img, i) => (
                    <div key={`col3-${i}`} className="w-full aspect-[3/2] rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                      <img
                        src={img.url}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `${img.focus?.x || 50}% ${img.focus?.y || 50}%` }}
                        alt="Scenic design production sample"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="relative z-30 backdrop-blur-md bg-black/40 p-12 md:p-20 rounded-[3rem] border border-white/10 text-center shadow-2xl max-w-2xl mx-6">
              <h2 className="font-display text-white text-6xl md:text-8xl italic mb-8 drop-shadow-lg">Portfolio</h2>
              <button
                onClick={() => onNavigate?.('portfolio')}
                className="px-12 py-4 bg-white text-black font-sans font-bold text-xs tracking-widest rounded-full hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                VIEW FULL ARCHIVE
              </button>
            </div>
          </section>
        );

        return sections;
      })()}

      <section className="relative w-full z-10 bg-black">
        <Footer onNavigate={onNavigate || (() => { })} />
      </section>
    </div>
  );
}