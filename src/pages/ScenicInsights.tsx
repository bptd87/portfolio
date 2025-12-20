import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, X } from 'lucide-react';
import { BlogCard } from '../components/shared/BlogCard';
import { blogPosts as staticBlogPosts } from '../data/blog-posts';
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
        console.log('📰 Articles API response:', result);
        if (result.success && Array.isArray(result.posts) && result.posts.length > 0) {
          console.log(`✅ Loaded ${result.posts.length} articles`);
          // Normalize fields so cover images and slugs are consistently available
          const normalized = result.posts.map((p: any) => {
            const inferFromImagesArray = Array.isArray(p.images) && p.images.length > 0
              ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url)
              : '';
            const inferFromContentBlocks = Array.isArray(p.content)
              ? (() => {
                  const imgBlock = p.content.find((blk: any) => blk?.type === 'image' && (blk?.content || blk?.url));
                  return imgBlock ? (imgBlock.content || imgBlock.url) : '';
                })()
              : '';
            const candidates = [
              p.coverImage,
              p.cover_image,
              p.ogImage,
              p.thumbnail,
              p.image,
              p.imageUrl,
              p.image_url,
              p.cover_image_url,
              p.featuredImage,
              p.featured_image,
              p.featured_image_url,
              p.heroImage,
              p.hero_image,
              p.photo,
              p.cover,
              p.media?.url,
              inferFromImagesArray,
              inferFromContentBlocks,
            ];
            const coverImage = candidates.find((v: any) => typeof v === 'string' && v.length > 0) || '';
            return {
              ...p,
              coverImage,
              slug: p.slug || p.id,
              date: p.date || p.createdAt || p.created_at || new Date().toISOString().split('T')[0],
            };
          });
          const publishedOnly = normalized.filter((p: any) => !p.status || p.status === 'published');
          setBlogPosts(publishedOnly);
        } else {
          console.warn('❌ No posts in API response, falling back to static blog-posts');
          const fallback = staticBlogPosts.map(p => ({
            id: p.id,
            slug: p.id,
            title: p.title,
            category: p.category,
            date: p.date,
            readTime: p.readTime,
            excerpt: p.excerpt,
            featured: p.featured,
            coverImage: p.coverImage,
            tags: p.tags,
          }));
          setBlogPosts(fallback);
        }
      } catch (err) {
        console.error('❌ Error fetching articles:', err);
        // Error fallback to static posts
        const fallback = staticBlogPosts.map(p => ({
          id: p.id,
          slug: p.id,
          title: p.title,
          category: p.category,
          date: p.date,
          readTime: p.readTime,
          excerpt: p.excerpt,
          featured: p.featured,
          coverImage: p.coverImage,
          tags: p.tags,
        }));
        setBlogPosts(fallback);
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
      matchesCategory = !!(category && post.category === category.name);
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

  console.log('📊 Posts stats:', {
    total: blogPosts.length,
    filtered: filteredPosts.length,
    sorted: sortedPosts.length,
    activeCategory,
    activeTag,
    searchQuery
  });

  const handlePostClick = (postSlug: string) => {
    onNavigate(`articles/${postSlug}`);
  };



  return (
    <div className="min-h-screen">
      {/* Hero Section - Reduced height for better fold content */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative pt-32 pb-12 px-6"
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
                    className={`px-5 py-2.5 font-pixel text-[10px] tracking-[0.3em] rounded-full transition-all ${isActive
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
                  aria-label="Clear search"
                  title="Clear search"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  style={{ aspectRatio: '2/3' }}
                  className="w-full"
                >
                  <BlogCard
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
                    onClick={() => handlePostClick(post.slug || post.id)}
                    index={index}
                    variant="nothing"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div >
  );
}