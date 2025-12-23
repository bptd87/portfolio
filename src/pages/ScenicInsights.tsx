import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Calendar, ArrowRight } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useTheme } from '../components/ThemeProvider';

interface ArticleItem {
  id: string;
  title: string;
  date: string;
  category: string;
  coverImage?: string;
  coverImageFocalPoint?: { x: number; y: number };
  excerpt?: string;
  slug?: string;
  tags?: string[];
  readTime?: string;
}

interface ScenicInsightsProps {
  onNavigate: (page: string, slug?: string) => void;
  initialCategory?: string;
  initialTag?: string;
}

export function ScenicInsights({ onNavigate, initialCategory, initialTag }: ScenicInsightsProps) {
  const { theme } = useTheme();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedTag, setSelectedTag] = useState<string>(initialTag || 'all');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; color?: string }>>([]);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialTag) setSelectedTag(initialTag);
  }, [initialCategory, initialTag]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/categories/articles`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (categoriesResponse.ok) {
          try {
            const categoriesData = await categoriesResponse.json();
            if (categoriesData.success && categoriesData.categories) {
              setCategories(categoriesData.categories);
            }
          } catch (jsonError) {
            console.warn('❌ Failed to parse categories response as JSON');
          }
        }

        // Fetch articles
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/posts`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // API returns { success: true, posts: [...] }
          const articlesData = data.posts || data || [];
          
          setArticles(articlesData);
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Build filter options
  const categoryOptions = categories.length > 0
    ? ['all', ...categories.map(cat => cat.name)]
    : ['all', ...Array.from(new Set(articles.map(item => item.category)))];

  const filteredArticles = articles.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesTag = selectedTag === 'all' || (item.tags && item.tags.includes(selectedTag));
    return matchesCategory && matchesTag;
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto mb-12">
          <Skeleton variant="text" width="200px" height="1rem" className="mb-4" />
          <Skeleton variant="text" width="400px" height="2.5rem" className="mb-6" />
        </div>
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="space-y-4">
               <Skeleton variant="rectangular" width="100%" height="240px" className="rounded-2xl" />
               <Skeleton variant="text" width="60%" height="1.5rem" />
               <Skeleton variant="text" width="100%" height="1rem" />
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
          SCENIC INSIGHTS
        </div>
        <h1 className="font-serif italic text-5xl md:text-7xl mb-6">Journal</h1>
        <p className="text-foreground/70 text-lg max-w-2xl">
          Thoughts on design, technology, and the creative process in scenic design.
        </p>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-40 mb-12 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-12 lg:px-12 border-y border-neutral-500/20">
        <div className="max-w-[1400px] mx-auto">
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
          <div className="mt-4 font-pixel text-[10px] tracking-wider text-foreground/40">
            {filteredArticles.length} {filteredArticles.length === 1 ? 'ARTICLE' : 'ARTICLES'}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full text-center py-24">
             <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-12 inline-block">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-pixel text-sm tracking-wider opacity-60">NO ARTICLES FOUND</p>
            </div>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => onNavigate(`scenic-insights/${article.slug || article.id}`)}
              className="group text-left"
            >
              <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl overflow-hidden hover:border-neutral-500/40 transition-all duration-300 h-full flex flex-col">
                {/* Image */}
                <div className="relative aspect-[3/2] overflow-hidden bg-neutral-500/5">
                  {article.coverImage ? (
                    <ImageWithFallback
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{
                        objectPosition: article.coverImageFocalPoint
                          ? `${article.coverImageFocalPoint.x}% ${article.coverImageFocalPoint.y}%`
                          : 'center center'
                      }}
                    />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                        <Calendar className="w-12 h-12 opacity-20" />
                     </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md border border-neutral-500/20 rounded-full px-3 py-1">
                    <span className="font-pixel text-[10px] tracking-wider text-foreground">
                      {article.category?.toUpperCase() || 'ARTICLE'}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3 text-xs text-foreground/60">
                     <Calendar className="w-3 h-3" />
                     <span>{new Date(article.date).toLocaleDateString()}</span>
                     {article.readTime && (
                       <>
                         <span>•</span>
                         <span>{article.readTime}</span>
                       </>
                     )}
                  </div>
                  
                  <h3 className="font-serif text-2xl mb-3 group-hover:text-foreground/80 transition-colors">
                    {article.title}
                  </h3>
                  
                  {article.excerpt && (
                    <p className="text-sm text-foreground/60 line-clamp-3 mb-4 flex-1">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs font-pixel tracking-[0.2em] text-foreground/70 group-hover:text-foreground group-hover:gap-3 transition-all pt-4 border-t border-white/5">
                    <span>READ ARTICLE</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
// ...
}

export default ScenicInsights;
