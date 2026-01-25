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
const heroStyle: React.CSSProperties = {
  left: 0,
};

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
        className={`sticky top-0 h-screen w-full flex items-center justify-center bg-black p-8 md:p-12 lg:p-20 ${navigatingProject?.id === project.id ? 'z-[100]' : ''}`}
        style={{ zIndex }}
        onClick={() => handleProjectClick(project)}
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
              src={optimizeSupabaseImage(project.cardImage, { width: 1280 }) || ''}
              width={1280}
              alt={project.title}
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
                  alt=""
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

        // Add first projects
        if (pIdx < featuredProjects.length) sections.push(renderProject(featuredProjects[pIdx++], pIdx, currentZ++));
        if (pIdx < featuredProjects.length) sections.push(renderProject(featuredProjects[pIdx++], pIdx, currentZ++));

        // News Section
        if (latestNews.length > 0) {
          const featuredNews = latestNews[0];
          sections.splice(1, 0, (
            <section key="news" data-nav="dark" className="sticky top-0 min-h-screen w-full bg-black overflow-hidden flex flex-col shadow-2xl" style={{ zIndex: currentZ++ }}>
              <div className="flex-1 flex flex-col justify-center px-6 md:px-12 pt-24 pb-8 gap-8">
                <div onClick={() => onNavigate?.(`news/${featuredNews.slug || featuredNews.id}`)} className="w-full relative cursor-pointer rounded-2xl overflow-hidden bg-[#1c1c1e] flex-1 aspect-video">
                  <img src={optimizeSupabaseImage(featuredNews.coverImage, { width: 1000 }) ?? "/images/studio/history-abstract.webp"} className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105" alt={featuredNews.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8">
                    <span className="font-pixel text-[10px] text-orange-400 uppercase tracking-widest block mb-2">{featuredNews.category}</span>
                    <h2 className="font-display text-white text-3xl md:text-5xl italic leading-none">{featuredNews.title}</h2>
                  </div>
                </div>
                <div className="relative overflow-hidden min-h-[200px]">
                  <div className="flex animate-marquee-left gap-4 whitespace-nowrap">
                    {[...latestNews, ...latestNews].map((news, i) => (
                      <div key={`${news.id}-${i}`} onClick={() => onNavigate?.(`news/${news.slug || news.id}`)} className="flex-shrink-0 w-[300px] h-[180px] relative rounded-xl overflow-hidden bg-[#1c1c1e] cursor-pointer">
                        <img src={optimizeSupabaseImage(news.coverImage, { width: 600 }) ?? undefined} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                        <div className="absolute bottom-0 p-4">
                          <h3 className="font-display text-white italic text-lg leading-tight whitespace-normal">{news.title}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ));
        }

        // Knowledge Section
        sections.push(
          <section key="knowledge" className="sticky top-0 h-auto md:h-screen w-full bg-black overflow-hidden flex flex-col justify-center px-6 md:px-12 gap-8 py-12 md:py-0" style={{ zIndex: currentZ++ }}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-purple-900/20 to-black opacity-100" />
            <div className="relative z-10 flex flex-col gap-4">
              <h2 className="font-display text-white text-3xl md:text-5xl italic">Articles</h2>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {latestArticles.map(a => (
                  <div key={a.id} onClick={() => onNavigate?.(`articles/${a.slug || a.id}`)} className="flex-shrink-0 w-[280px] md:w-[350px] aspect-[4/5] relative rounded-xl overflow-hidden bg-[#1c1c1e] cursor-pointer">
                    <img src={a.coverImage ?? "/images/studio/classics-abstract.webp"} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute bottom-0 p-6"><h3 className="font-display text-2xl text-white italic">{a.title}</h3></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative z-10 flex flex-col gap-4">
              <h2 className="font-display text-white text-3xl md:text-5xl italic">Studio</h2>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
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
                  <div key={t.id} onClick={() => onNavigate?.(t.id)} className="flex-shrink-0 w-[240px] md:w-[320px] aspect-[4/3] relative rounded-xl overflow-hidden bg-[#1c1c1e] cursor-pointer border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02]">
                    <img src={t.img ?? undefined} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
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

        // Interleave remaining projects
        if (pIdx < featuredProjects.length) sections.push(renderProject(featuredProjects[pIdx++], pIdx, currentZ++));

        // About Section
        sections.push(
          <section key="about" className="sticky top-0 h-screen w-full bg-black overflow-hidden flex flex-col md:flex-row shadow-2xl" style={{ zIndex: currentZ++ }}>
            <div className="relative flex-1 h-2/5 md:h-full">
              {settings.profileImageUrl ? <img src={settings.profileImageUrl} className="w-full h-full object-cover object-top" alt="Profile" /> : <div className="w-full h-full bg-neutral-900" />}
            </div>
            <div className="relative flex-1 h-3/5 md:h-full flex flex-col justify-center p-8 md:p-12 bg-neutral-50 dark:bg-neutral-950">
              <h2 className="font-display text-black dark:text-white text-6xl md:text-8xl italic mb-6">About</h2>
              <p className="font-sans text-neutral-600 dark:text-white/60 text-lg mb-8 max-w-md">{settings.bioText || 'Scenic and experiential designer.'}</p>
              <button onClick={() => onNavigate?.('about')} className="font-pixel text-[10px] uppercase tracking-widest text-black dark:text-white border-b border-black/20 pb-1 w-fit">READ STORY</button>
            </div>
          </section>
        );

        while (pIdx < featuredProjects.length) {
          sections.push(renderProject(featuredProjects[pIdx++], pIdx, currentZ++));
        }

        // Archive CTA Section
        sections.push(
          <section key="cta" className="sticky top-0 h-screen w-full bg-black overflow-hidden flex items-center justify-center p-8 shadow-2xl" style={{ zIndex: currentZ++ }}>
            <style>{`
                @keyframes float-cards {
                  0% { transform: translateY(0px) rotate(var(--rot)); }
                  50% { transform: translateY(-20px) rotate(calc(var(--rot) + 2deg)); }
                  100% { transform: translateY(0px) rotate(var(--rot)); }
                }
            `}</style>

            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {(allProjectImages.length > 0 ? allProjectImages : featuredProjects.flatMap(p => p.cardImage ? [{ url: p.cardImage, focus: p.focusPoint || { x: 50, y: 50 } }] : []))
                .sort(() => 0.5 - Math.random())
                .slice(0, 24)
                .map((item, i) => {
                  const r1 = (i * 239 + 17) % 100;
                  const r2 = (i * 347 + 23) % 100;
                  const r3 = (i * 199 + 7) % 100;

                  let xPos = r1;
                  let yPos = r2;
                  if (xPos > 30 && xPos < 70 && yPos > 30 && yPos < 70) {
                    if (r3 % 2 === 0) xPos = xPos < 50 ? (xPos % 25) : (75 + xPos % 20);
                    else yPos = yPos < 50 ? (yPos % 25) : (75 + yPos % 20);
                  }

                  const rot = (r3 % 40) - 20;
                  const scale = 0.8 + (r2 % 30) / 100;

                  return (
                    <div
                      key={`scatter-${i}`}
                      className="absolute w-40 md:w-56 aspect-video bg-neutral-800 rounded shadow-2xl overflow-hidden opacity-90 transition-all duration-700 grayscale-0 pointer-events-auto hover:opacity-100 hover:scale-110 hover:z-40"
                      style={{
                        left: `${xPos}%`,
                        top: `${yPos}%`,
                        transform: `translate(-50%, -50%) scale(${scale})`,
                        zIndex: Math.floor(scale * 10),
                        '--rot': `${rot}deg`,
                        animation: `float-cards ${10 + (i % 8)}s ease-in-out infinite`,
                        animationDelay: `${i * -0.5}s`
                      } as any}
                    >
                      <img
                        src={optimizeSupabaseImage(item.url, { width: 400 }) ?? undefined}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `${item.focus.x}% ${item.focus.y}%` }}
                        alt=""
                      />
                    </div>
                  );
                })}
            </div>

            <div className="relative z-30 backdrop-blur-3xl bg-black/60 p-12 md:p-20 rounded-[3rem] border border-white/10 text-center shadow-2xl">
              <h2 className="font-display text-white text-6xl md:text-8xl italic mb-8">Portfolio</h2>
              <button
                onClick={() => onNavigate?.('portfolio')}
                className="px-12 py-4 bg-white text-black font-sans font-bold text-xs tracking-widest rounded-full hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105"
              >
                VIEW ALL
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