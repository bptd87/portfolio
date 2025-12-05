import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, Loader2, X } from 'lucide-react';
import { BlogCard } from '../components/shared/BlogCard';
import { apiCall } from '../utils/api';
import { SkeletonBlogCard } from '../components/ui/skeleton';

interface ScenicInsightsProps {
  onNavigate: (page: string, slug?: string) => void;
  initialCategory?: string;
  initialTag?: string;
}

export function ScenicInsights({ onNavigate, initialCategory, initialTag }: ScenicInsightsProps) {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTag, setActiveTag] = useState<string | null>(initialTag || null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]); 

  // Set initial tag from prop
  useEffect(() => {
    if (initialTag) {
      setActiveTag(initialTag);
      setSearchQuery(initialTag); // Also search for the tag
    }
  }, [initialTag]);  // Fetch posts and categories from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories using apiCall helper with fallback
        const categoriesResponse = await apiCall('/api/categories/articles');
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          if (categoriesData.success && categoriesData.categories) {
            setCategories(categoriesData.categories);
          }
        }
        
        // Fetch articles from API using apiCall helper with fallback
        const response = await apiCall('/api/posts');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        if (result.success && result.posts) {
          if (result.posts.length > 0) {
            }
          setBlogPosts(result.posts);
        } else {
          }
      } catch (err) {
        } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  const filteredPosts = blogPosts.filter(post => {
    // Category filter
    let matchesCategory = activeCategory === 'all';
    if (!matchesCategory) {
      const category = categories.find(cat => cat.slug === activeCategory);
      matchesCategory = category && post.category === category.name;
    }
    
    // Tag filter
    let matchesTag = !activeTag;
    if (activeTag && post.tags) {
      matchesTag = post.tags.some((t: string) => t.toLowerCase() === activeTag.toLowerCase());
    }
    
    // Search filter
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (post.tags && post.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch && matchesTag;
  });

  // Sort by date (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handlePostClick = (postSlug: string) => {
    onNavigate(`articles/${postSlug}`);
  };

  // Bento grid sizing pattern - similar to Portfolio
  const getBentoSize = (index: number) => {
    const pattern = index % 6;
    switch (pattern) {
      case 0: return 'col-span-1 row-span-2'; // Tall
      case 1: return 'col-span-2 row-span-1'; // Wide
      case 2: return 'col-span-1 row-span-1'; // Standard
      case 3: return 'col-span-1 row-span-1'; // Standard
      case 4: return 'col-span-2 row-span-2'; // Featured
      case 5: return 'col-span-1 row-span-1'; // Standard
      default: return 'col-span-1 row-span-1';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative pt-32 pb-16 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl mb-6 italic"
          >
            Articles
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-foreground/60 max-w-2xl"
          >
            Explorations in design philosophy, creative process, and the intersection of technology and theatrical storytelling.
          </motion.p>
        </div>
      </motion.section>

      {/* Filter Bar - Glass transparency, sticky */}
      <section className="sticky top-20 z-30 backdrop-blur-xl bg-background/80 border-y border-border/50 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'ALL' },
                ...categories.map(cat => ({
                  id: cat.slug,
                  label: cat.name.toUpperCase(),
                }))
              ].map((cat) => {
                const isActive = activeCategory === cat.id;
                
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-5 py-2.5 font-pixel text-[10px] tracking-[0.3em] rounded-full transition-all ${
                      isActive
                        ? 'bg-foreground text-background'
                        : 'bg-foreground/5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground/80 border border-foreground/10'
                    }`}
                  >
                    {cat.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative lg:ml-auto w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input 
                type="text" 
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 pl-10 pr-10 py-2.5 text-sm placeholder:text-foreground/40 focus:outline-none focus:border-foreground/30 focus:bg-foreground/10 transition-all rounded-full"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pt-12 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlogCard key={index} />
              ))}
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="text-center py-24">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-foreground/20" />
              <p className="text-foreground/60 text-lg mb-4">No articles found matching your criteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); setActiveTag(null); }}
                className="px-6 py-3 backdrop-blur-xl bg-foreground/10 hover:bg-foreground/20 border border-foreground/20 transition-all rounded-full font-pixel text-xs tracking-wider"
              >
                CLEAR FILTERS
              </button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:auto-rows-[280px]"
            >
              {sortedPosts.map((post, index) => (
                <BlogCard
                  key={post.id}
                  title={post.title}
                  excerpt={post.excerpt}
                  date={new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  category={post.category}
                  readTime={post.readTime}
                  image={post.coverImage}
                  focusPoint={post.focusPoint}
                  onClick={() => handlePostClick(post.id)}
                  index={index}
                  variant="nothing"
                  className={getBentoSize(index)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}