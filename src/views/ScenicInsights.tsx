'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { BlogCard } from '../components/shared/BlogCard';
import { BookOpen } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useTheme } from '../hooks/useTheme';
import { motion } from 'motion/react';

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
    if (initialCategory) {
      // If we have categories loaded, try to find the name from the slug
      if (categories.length > 0) {
        const matchedCategory = categories.find(c => c.slug === initialCategory);
        if (matchedCategory) {
          setSelectedCategory(matchedCategory.name);
        } else {
          // Fallback if no match (or if it's already a name)
          setSelectedCategory(initialCategory);
        }
      } else {
        // Categories not loaded yet, set temporarily (will be updated when categories load)
        setSelectedCategory(initialCategory);
      }
    }
    if (initialTag) setSelectedTag(initialTag);
  }, [initialCategory, initialTag, categories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('type', 'articles')
          .order('display_order');

        if (!catError && categoriesData) {
          setCategories(categoriesData);
        }

        // Fetch articles
        const { data: articlesData, error: _artError } = await supabase
          .from('articles')
          .select('*')
          .eq('published', true)
          .order('published_at', { ascending: false });

        if (articlesData) {
          // Map database fields to frontend interface
          const mappedArticles: ArticleItem[] = articlesData.map((item: any) => ({
            id: item.id,
            title: item.title,
            date: item.published_at || item.created_at, // Prioritize published_at
            category: item.category || 'Article',
            coverImage: item.cover_image || item.coverImage,
            coverImageFocalPoint: item.cover_image_focal_point,
            excerpt: item.excerpt,
            slug: item.slug,
            tags: item.tags || [],
            readTime: '5 min read', // TODO: Calculate or store read time
          }));

          setArticles(mappedArticles);
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Build filter options - DEDUPLICATED
  // Combine categories from DB and unique categories found in articles
  const availableCategories = new Set<string>();

  // Add categories from DB
  categories.forEach(cat => availableCategories.add(cat.name));

  // Add categories used in articles (in case some aren't in the categories table)
  articles.forEach(item => {
    if (item.category) availableCategories.add(item.category);
  });

  const categoryOptions = ['all', ...Array.from(availableCategories).sort()];

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
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton variant="rectangular" width="100%" height="200px" className="rounded-2xl" />
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
        <h1 className="font-serif italic text-5xl md:text-7xl mb-6">Articles</h1>
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
      <div className="max-w-[1400px] mx-auto">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-24">
            <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-12 inline-block">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-pixel text-sm tracking-wider opacity-60">NO ARTICLES FOUND</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="aspect-[3/4] w-full"
              >
                <BlogCard
                  title={article.title}
                  excerpt={article.excerpt}
                  date={new Date(article.date).toLocaleDateString()}
                  category={article.category}
                  readTime={article.readTime}
                  image={article.coverImage}
                  focusPoint={article.coverImageFocalPoint}
                  onClick={() => onNavigate(`articles/${article.slug || article.id}`)}
                  index={index}
                  variant="nothing"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScenicInsights;
