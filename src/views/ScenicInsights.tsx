'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { findCategoryColor, Category } from '../utils/categoryHelpers';
import { BlogCard } from '../components/shared/BlogCard';
import { BookOpen } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useTheme } from '../hooks/useTheme';
import { motion } from 'motion/react';
import { SkeletonArticleGrid } from '../components/skeletons/SkeletonArticleGrid';

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
  articles?: any[];
}

export function ScenicInsights({ onNavigate, initialCategory, initialTag, articles: wpArticles }: ScenicInsightsProps) {
  const { theme } = useTheme();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedTag, setSelectedTag] = useState<string>(initialTag || 'all');
  // Categories derived or fetched. For now lets derive or just keep simple.
  const [categories, setCategories] = useState<Category[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  // Fetch DB categories for colors
  useEffect(() => {
    const fetchDbCategories = async () => {
      try {
        const { data } = await supabase.from('categories').select('*').eq('type', 'articles');
        if (data) {
          setDbCategories(data);
        }
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };
    fetchDbCategories();
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
    if (initialTag) setSelectedTag(initialTag);
  }, [initialCategory, initialTag]);

  useEffect(() => {
    const processData = async () => {
      if (wpArticles) {
        const mappedArticles: ArticleItem[] = wpArticles.map((edge: any) => {
          const node = edge.node;
          // IMPORTANT: Check for articleCatagories (typo in schema)
          const category = node.articleCatagories?.edges?.[0]?.node?.name || 'Article';

          // Clean up excerpt - remove HTML tags
          const excerpt = node.excerpt ? node.excerpt.replace(/<[^>]*>?/gm, '') : '';

          // Extract tags
          const tags = node.articleTags?.edges?.map((edge: any) => edge.node.name) || [];

          // Clean up content for word count
          const contentText = node.content ? node.content.replace(/<[^>]*>?/gm, '') :
            (node.excerpt ? node.excerpt.replace(/<[^>]*>?/gm, '') : '');
          const wordCount = contentText.split(/\s+/).length || 500;
          const readTimeProp = Math.ceil(wordCount / 200) + ' min read';

          return {
            id: node.slug,
            title: node.title,
            date: node.date,
            category: category,
            coverImage: node.featuredImage?.node?.sourceUrl,
            excerpt: excerpt,
            slug: node.slug,
            tags: tags,
            readTime: readTimeProp,
          };
        });
        setArticles(mappedArticles);
        setLoading(false);

        // Derive categories and resolve colors
        const uniqueCategories = new Set(mappedArticles.map(a => a.category));
        const derivedCategories = Array.from(uniqueCategories).map(cat => ({
          id: cat,
          name: cat,
          slug: cat.toLowerCase().replace(/\s+/g, '-'),
          color: findCategoryColor(cat, dbCategories)
        }));
        setCategories(derivedCategories);

        // Update articles with resolved colors if missing (so cards can use them)
        if (dbCategories.length > 0) {
          const updatedArticles = mappedArticles.map(article => {
            const color = findCategoryColor(article.category, dbCategories);
            return { ...article, categoryColor: color }; // Add categoryColor to article item? BlogCard needs updating or usage check.
          });
          // BlogCard uses color prop passed from ScenicInsights.tsx line 175
        }

      } else {
        // Fallback to Supabase if no WP articles passed (optional, strictly following user request for WP)
        setLoading(false);
      }
    };

    processData();
  }, [wpArticles, dbCategories]);

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
    return <SkeletonArticleGrid />;
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
            {filteredArticles.map((article, index) => {
              const categoryColor = findCategoryColor(article.category, dbCategories) || categories.find(c => c.name === article.category)?.color;
              return (
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
                    color={categoryColor}
                  />
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScenicInsights;
