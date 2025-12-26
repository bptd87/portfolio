import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { Calendar, ArrowRight } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useTheme } from '../components/ThemeProvider';

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
        // Fetch categories directly from Supabase
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('type', 'news');

        if (!categoriesError && categoriesData) {
           // Map if necessary, or just use as is if schema matches
           // The API was returning { categories: [...] }, here we get array directly
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

  // Build filter options - use database categories or fallback to unique categories from items
  const categoryOptions = categories.length > 0
    ? ['all', ...categories.map(cat => cat.name)]
    : ['all', ...Array.from(new Set(newsItems.map(item => item.category)))];

  const years = ['all', ...Array.from(new Set(newsItems.map(item => new Date(item.date).getFullYear().toString()))).sort().reverse()];

  const filteredNews = newsItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesYear = selectedYear === 'all' || new Date(item.date).getFullYear().toString() === selectedYear;
    return matchesCategory && matchesYear;
  });



  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto mb-12">
          <Skeleton variant="text" width="200px" height="1rem" className="mb-4" />
          <Skeleton variant="text" width="400px" height="2.5rem" className="mb-6" />
        </div>

        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Year Section Skeletons */}
          {Array.from({ length: 3 }).map((_, yearIndex) => (
            <div key={yearIndex} className="space-y-6">
              <Skeleton variant="text" width="150px" height="2rem" className="mb-6" />

              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="backdrop-blur-xl bg-neutral-800/60 dark:bg-neutral-900/60 rounded-3xl p-6 border border-white/10"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <Skeleton variant="rectangular" width="200px" height="140px" className="rounded-2xl flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <Skeleton variant="text" width="60%" height="1.5rem" />
                        <Skeleton variant="text" width="40%" height="1rem" />
                        <Skeleton variant="text" width="100%" height="1rem" />
                        <Skeleton variant="text" width="90%" height="1rem" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12 overflow-x-hidden"
      data-nav={theme === 'dark' ? 'dark' : 'light'}
    >
      {/* Header */}
      <div className="max-w-[1400px] mx-auto mb-12 w-full">


        <div className="font-pixel text-xs tracking-[0.3em] text-foreground/60 mb-4">
          NEWS & UPDATES
        </div>
        <h1 className="font-serif italic text-5xl md:text-7xl mb-4">Timeline</h1>
        <p className="text-foreground/70 text-lg max-w-2xl">
          A chronological journey through project launches, awards, collaborations, and milestones.
        </p>
      </div>

      {/* Filters - Sticky */}
      <div className="sticky top-0 z-40 mb-12 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-12 lg:px-12 border-y border-neutral-500/20">
        <div className="max-w-[1400px] mx-auto">
          {/* Year Filter */}
          <div className="mb-4">
            <div className="font-pixel text-[10px] tracking-[0.3em] text-foreground/60 mb-2">
              YEAR
            </div>
            <div className="flex flex-wrap gap-2">
              {years.map((year) => {
                const isActive = selectedYear === year;
                const label = year === 'all' ? 'ALL YEARS' : year;

                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`font-pixel text-[10px] tracking-[0.2em] px-4 py-2 rounded-full transition-all ${isActive
                      ? 'bg-foreground text-background'
                      : 'bg-neutral-500/10 hover:bg-neutral-500/20 text-foreground/70 backdrop-blur-md border border-neutral-500/20'
                      }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <div className="font-pixel text-[10px] tracking-[0.3em] text-foreground/60 mb-2">
              CATEGORY
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => {
                const isActive = selectedCategory === cat;
                const label = cat === 'all' ? 'ALL' : cat.toUpperCase();

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`font-pixel text-[10px] tracking-[0.2em] px-4 py-2 rounded-full transition-all ${isActive
                      ? 'bg-foreground text-background'
                      : 'bg-neutral-500/10 hover:bg-neutral-500/20 text-foreground/70 backdrop-blur-md border border-neutral-500/20'
                      }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 font-pixel text-[10px] tracking-wider text-foreground/40">
            {filteredNews.length} {filteredNews.length === 1 ? 'ITEM' : 'ITEMS'}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-[1200px] mx-auto w-full px-4 md:px-0">
        {filteredNews.length === 0 ? (
          <div className="text-center py-24">
            <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-12 inline-block">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-pixel text-sm tracking-wider opacity-60">NO NEWS ARTICLES FOUND</p>
              <p className="text-sm text-foreground/60 mt-2">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-neutral-500/20 transform -translate-x-1/2" />

            {/* Timeline Items */}
            <div className="space-y-12 md:space-y-24">
              {filteredNews.map((article, index) => {
                const date = new Date(article.date);
                const year = date.getFullYear();
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                const day = date.getDate();
                const isLeft = index % 2 === 0;

                // Check if this is the first item of a new year
                const prevYear = index > 0 ? new Date(filteredNews[index - 1].date).getFullYear() : null;
                const showYearMarker = index === 0 || year !== prevYear;

                return (
                  <React.Fragment key={article.id}>
                    {/* Year Marker */}
                    {showYearMarker && (
                      <div className="relative" style={{ animation: `fade-in 0.6s ease-out ${index * 0.15}s both` }}>
                        {/* Year Badge on Timeline */}
                        <div className="flex items-center justify-center mb-12 md:mb-16">
                          <div className="relative z-10 bg-foreground text-background px-8 py-3 rounded-full">
                            <span className="font-pixel text-sm tracking-[0.3em]">{year}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      className="relative"
                      style={{
                        animation: `fade-in 0.6s ease-out ${index * 0.15}s both`
                      }}
                    >
                      {/* Timeline Dot - Hidden on mobile */}
                      <div className="hidden md:block absolute left-1/2 top-12 transform -translate-x-1/2 z-10">
                        <div className="w-4 h-4 rounded-full bg-foreground border-4 border-background shadow-lg" />
                      </div>

                      {/* Card Container - Alternating on desktop, stack on mobile */}
                      <div className={`md:grid md:grid-cols-2 md:gap-12 ${isLeft ? '' : 'md:grid-flow-dense'}`}>
                        {/* Spacer for alternating layout */}
                        <div className={`hidden md:block ${isLeft ? 'md:col-start-2' : 'md:col-start-1'}`} />

                        {/* Card */}
                        <button
                          onClick={() => onNavigate(`news/${article.slug || article.id}`)}
                          className={`group text-left w-full ${isLeft ? 'md:col-start-1 md:row-start-1' : 'md:col-start-2'}`}
                        >
                          {/* Glass Card */}
                          <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl overflow-hidden hover:border-neutral-500/40 transition-all duration-300 h-full">

                            {/* Image */}
                            {article.coverImage ? (
                              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-500/5">
                                <img
                                  src={article.coverImage}
                                  alt={article.title}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  style={{
                                    objectPosition: article.coverImageFocalPoint
                                      ? `${article.coverImageFocalPoint.x}% ${article.coverImageFocalPoint.y}%`
                                      : 'center center'
                                  }}
                                  onError={(e) => console.error('News Timeline Image Error:', article.coverImage, e)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-background/0" />

                                {/* Date Badge on Image */}
                                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md border border-neutral-500/20 rounded-full px-3 py-2 flex items-center gap-2">
                                  <Calendar className="w-3 h-3 text-foreground/60" />
                                  <span className="font-pixel text-[10px] tracking-wider text-foreground">
                                    {month.toUpperCase()} {day}, {year}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-500/5 flex items-center justify-center">
                                <Calendar className="w-12 h-12 opacity-20" />

                                {/* Date Badge on Placeholder */}
                                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md border border-neutral-500/20 rounded-full px-3 py-2 flex items-center gap-2">
                                  <Calendar className="w-3 h-3 text-foreground/60" />
                                  <span className="font-pixel text-[10px] tracking-wider text-foreground">
                                    {month.toUpperCase()} {day}, {year}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Content */}
                            <div className="p-6">
                              {/* Category Label */}
                              <div className="font-pixel text-[10px] tracking-[0.3em] text-foreground/60 mb-3">
                                {article.category?.toUpperCase() || 'NEWS'}
                              </div>

                              {/* Title */}
                              <h3 className="font-serif italic text-2xl md:text-3xl mb-3 group-hover:text-foreground/80 transition-colors duration-300">
                                {article.title}
                              </h3>

                              {/* Excerpt */}
                              {article.excerpt && (
                                <p className="text-sm text-foreground/60 line-clamp-3 mb-4 text-justify">
                                  {article.excerpt}
                                </p>
                              )}

                              {/* Read More Link */}
                              <div className="flex items-center gap-2 text-xs font-pixel tracking-[0.2em] text-foreground/70 group-hover:text-foreground group-hover:gap-3 transition-all">
                                <span>READ MORE</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}