'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { Calendar, ArrowRight } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useTheme } from '../hooks/useTheme';
import { SkeletonNews } from '../components/skeletons/SkeletonNews';

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

interface NewsProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function News({ onNavigate }: NewsProps) {
  const { theme } = useTheme();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; color?: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories directly from Supabase
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('type', 'news');

        if (!categoriesError && categoriesData) {
          setCategories(categoriesData.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            color: c.color
          })));
        }

        // Fetch news items directly from Supabase
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('*')
          .eq('published', true)
          .order('date', { ascending: false });

        if (!newsError && newsData) {
          // Map snake_case fields to camelCase for frontend
          const mapped = newsData.map((item: any) => ({
            ...item,
            coverImage: item.cover_image, // Direct access, no need for fallbacks from API
            slug: item.slug || item.id,
            tags: item.tags || [],
          }));
          setNewsItems(mapped);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Build filter options
  const categoryOptions = categories.length > 0
    ? ['all', ...categories.map(cat => cat.name)]
    : ['all', ...Array.from(new Set(newsItems.map(item => item.category)))];

  const years: string[] = ['all', ...(Array.from(new Set(newsItems.map(item => new Date(item.date).getFullYear().toString()))) as string[]).sort().reverse()];

  const filteredNews = newsItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesYear = selectedYear === 'all' || new Date(item.date).getFullYear().toString() === selectedYear;
    return matchesCategory && matchesYear;
  });

  // Group news by year for the timeline view
  const groupedNews = React.useMemo(() => {
    const groups: Record<string, NewsItem[]> = {};
    filteredNews.forEach(item => {
      const year = new Date(item.date).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });
    // Sort years descending
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filteredNews]);

  // Determine Hero Item
  // Only show Hero if we are viewing ALL years, otherwise standard grid for specific year
  const heroItem = selectedYear === 'all' && selectedCategory === 'all'
    ? filteredNews[0]
    : null;

  // If we have a hero, the rest are standard items
  const standardItems = heroItem ? filteredNews.slice(1) : filteredNews;

  // Re-group standard items by year for the main display
  const displayGroups = React.useMemo(() => {
    const groups: Record<string, NewsItem[]> = {};
    standardItems.forEach(item => {
      const year = new Date(item.date).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [standardItems]);


  if (loading) {
    return <SkeletonNews />;
  }

  return (
    <div
      className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12 overflow-x-hidden relative"
      data-nav={theme === 'dark' ? 'dark' : 'light'}
    >

      {/* Header */}
      <div className="relative z-10 max-w-[1400px] mx-auto mb-12 w-full">
        <div className="font-pixel text-xs tracking-[0.3em] text-foreground/60 mb-4">
          NEWS & UPDATES
        </div>
        <h1 className="font-serif italic text-5xl md:text-7xl mb-4">The Latest</h1>
        <p className="text-foreground/70 text-lg max-w-2xl">
          Visual stories, milestones, and announcements from the studio.
        </p>
      </div>

      {/* Filters - Sticky */}
      <div className="sticky top-0 z-40 mb-12 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-12 lg:px-12 border-y border-neutral-500/20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`font-pixel text-[10px] tracking-[0.2em] px-4 py-2 rounded-full transition-all ${selectedCategory === 'all'
                ? 'bg-foreground text-background'
                : 'bg-neutral-500/10 hover:bg-neutral-500/20 text-foreground/70 backdrop-blur-md border border-neutral-500/20'
                }`}
            >
              ALL NEWS
            </button>
            {categoryOptions.filter(c => c !== 'all').map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`font-pixel text-[10px] tracking-[0.2em] px-4 py-2 rounded-full transition-all ${selectedCategory === cat
                  ? 'bg-foreground text-background'
                  : 'bg-neutral-500/10 hover:bg-neutral-500/20 text-foreground/70 backdrop-blur-md border border-neutral-500/20'
                  }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <span className="font-pixel text-[10px] tracking-[0.3em] text-foreground/40 whitespace-nowrap">ARCHIVE:</span>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`font-pixel text-[10px] tracking-[0.2em] px-3 py-1 rounded-full transition-all whitespace-nowrap ${selectedYear === year
                  ? 'text-foreground underline decoration-1 underline-offset-4'
                  : 'text-foreground/60 hover:text-foreground'
                  }`}
              >
                {year === 'all' ? 'VIEW ALL' : year}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto">

        {/* HERO SECTION */}
        {heroItem && (
          <div className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <button
              onClick={() => onNavigate(`news/${heroItem.slug || heroItem.id}`)}
              className="group relative w-full aspect-[4/3] md:aspect-[21/9] rounded-3xl overflow-hidden bg-neutral-500/5 block text-left"
            >
              {heroItem.coverImage && (
                <img
                  src={heroItem.coverImage}
                  alt={heroItem.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  style={{
                    objectPosition: heroItem.coverImageFocalPoint
                      ? `${heroItem.coverImageFocalPoint.x}% ${heroItem.coverImageFocalPoint.y}%`
                      : 'center center'
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-white text-black text-[10px] font-pixel tracking-widest px-2 py-1 rounded-full">
                    LATEST
                  </span>
                  <span className="text-white/80 font-pixel text-[10px] tracking-widest">
                    {new Date(heroItem.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="font-serif italic text-4xl md:text-6xl text-white mb-4 leading-tight group-hover:underline decoration-1 underline-offset-8 decoration-white/30">
                  {heroItem.title}
                </h2>
                {heroItem.excerpt && (
                  <p className="text-white/70 text-lg md:text-xl line-clamp-2 md:line-clamp-3 max-w-xl">
                    {heroItem.excerpt}
                  </p>
                )}
                <div className="mt-6 flex items-center gap-2 text-white/60 font-pixel text-xs tracking-widest group-hover:text-white transition-colors">
                  READ ARTICLE <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* GROUPS BY YEAR */}
        {displayGroups.length === 0 && !heroItem ? (
          <div className="text-center py-24">
            <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-12 inline-block">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-pixel text-sm tracking-wider opacity-60">NO NEWS FOUND</p>
            </div>
          </div>
        ) : (
          <div className="space-y-24">
            {displayGroups.map(([year, items]) => (
              <section key={year} className="relative">
                {/* Year Marker - Sticky or clearly sectioned */}
                <div className="flex items-center gap-6 mb-12">
                  <h3 className="font-pixel text-4xl md:text-6xl text-foreground/5 opacity-20 font-bold tracking-tighter">
                    {year}
                  </h3>
                  <div className="h-px bg-foreground/10 flex-grow" />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(`news/${item.slug || item.id}`)}
                      className="group text-left flex flex-col h-full"
                    >
                      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-neutral-500/5 border border-neutral-500/10 mb-6 group-hover:border-foreground/20 transition-all">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            style={{
                              objectPosition: item.coverImageFocalPoint
                                ? `${item.coverImageFocalPoint.x}% ${item.coverImageFocalPoint.y}%`
                                : 'center center'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-pixel text-[10px] tracking-widest opacity-20">NO IMAGE</span>
                          </div>
                        )}

                        {/* Category Badge on Image */}
                        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur text-foreground text-[9px] font-pixel tracking-widest px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.category.toUpperCase()}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-3 text-foreground/40 font-pixel text-[9px] tracking-widest">
                          <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <h4 className="font-serif italic text-2xl mb-3 leading-tight group-hover:text-foreground/80 transition-colors">
                          {item.title}
                        </h4>
                        {item.excerpt && (
                          <p className="text-foreground/60 text-sm leading-relaxed line-clamp-3 mb-4">
                            {item.excerpt}
                          </p>
                        )}
                        <div className="mt-auto flex items-center gap-2 text-[10px] font-pixel tracking-widest text-foreground/40 group-hover:text-foreground transition-colors">
                          READ MORE <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}