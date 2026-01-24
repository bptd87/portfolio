import React, { useEffect, useState, useMemo } from 'react';
// @ts-ignore
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, Tag, Loader2, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { ArticleAuthor } from '../../components/shared/ArticleAuthor';
import { BlockRenderer, ContentBlock } from '../../components/shared/BlockRenderer';
import { SkeletonArticle } from '../../components/skeletons/SkeletonArticle';
import { BlogCard } from '../../components/shared/BlogCard';
import { supabase } from '../../utils/supabase/client';
import { LikeButton } from '../../components/shared/LikeButton';
import { ShareButton } from '../../components/shared/ShareButton';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Eye } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { generateArticleMetadata, PAGE_METADATA } from '../../utils/seo/metadata';
import { generateVideoSchema, generateArticleSchema } from '../../utils/seo/structured-data';
// Lazy load comments to speed up initial article render
const CommentsSection = React.lazy(() => import('../../components/shared/CommentsSection').then(m => ({ default: m.CommentsSection })));
const authorImageSrc = '/images/author-brandon.png';

interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryColor?: string;
  date: string;
  readTime: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  cover_image_focal_point?: { x: number; y: number };
  content: ContentBlock[];
}

interface Category {
  id: string;
  name: string;
  color?: string;
}

// Helper to find category color from categories list
function findCategoryColor(categoryName: string, categories: Category[]): string | undefined {
  if (!categoryName || !categories.length) return undefined;

  const normalizedName = categoryName.toLowerCase().trim();

  // 1. Exact match
  let match = categories.find(c => c.name?.toLowerCase().trim() === normalizedName);
  if (match?.color) return match.color;

  // 2. Starts with match (e.g., "Design Philosophy" matches "Design Philosophy & Scenic Insights")
  match = categories.find(c => c.name && normalizedName.startsWith(c.name.toLowerCase().trim()));
  if (match?.color) return match.color;

  // 3. Contains match (e.g., looking for "Technology" in "Technology & Tutorials")
  match = categories.find(c => c.name && normalizedName.includes(c.name.toLowerCase().trim()));
  if (match?.color) return match.color;

  // 4. Reverse contains (category name contains our search term)
  match = categories.find(c => c.name && c.name.toLowerCase().trim().includes(normalizedName));
  if (match?.color) return match.color;

  return undefined;
}

// Helper to extract video URLs from article content for SEO
function extractVideosFromContent(content: ContentBlock[]): Array<{ url: string; title?: string }> {
  const videos: Array<{ url: string; title?: string }> = [];

  content.forEach(block => {
    if (block.type === 'video' && block.content) {
      videos.push({
        url: block.content,
        title: (block.metadata as any)?.title || 'Embedded Video'
      });
    }
  });

  return videos;
}

interface DynamicArticleProps {
  slug: string;
  onNavigate: (page: string) => void;
}

// Share button component
function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="font-pixel text-[10px] tracking-[0.2em] opacity-50 uppercase">Share</span>
      <div className="flex items-center gap-2">
        <button
          onClick={shareTwitter}
          className="p-2.5 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </button>
        <button
          onClick={shareLinkedIn}
          className="p-2.5 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </button>
        <button
          onClick={copyLink}
          className="p-2.5 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors"
          aria-label="Copy link"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// Minimalist end flourish
function ArticleEndFlourish() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3">
        <div className="w-12 h-px bg-foreground/10" />
        <div className="w-1.5 h-1.5 bg-foreground/20 rounded-full" />
        <div className="w-12 h-px bg-foreground/10" />
      </div>
    </div>
  );
}

// Table of Contents component
function TableOfContents({ blocks, activeHeading }: { blocks: ContentBlock[]; activeHeading: string }) {
  const headings = useMemo(() => {
    const items: { id: string; text: string; level: number }[] = [];

    blocks.forEach(block => {
      if (block.type === 'heading') {
        items.push({
          id: block.id,
          text: block.content,
          level: block.metadata?.level || 2
        });
      } else if (block.type === 'paragraph') {
        // Find headers in HTML content and generate IDs on the fly
        // Matches <h[1-6] ... >Text</h[1-6]>
        const regex = /<h([1-6])(.*?)>(.*?)<\/h\1>/gi;
        let match;
        // Reset lastIndex just in case
        regex.lastIndex = 0;

        while ((match = regex.exec(block.content)) !== null) {
          const level = parseInt(match[1]);
          const content = match[3];

          // Generate ID from content (same logic as BlockRenderer)
          const cleanContent = content.replace(/<[^>]*>/g, '');
          const id = cleanContent
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          if (id && level >= 1 && level <= 6) {
            items.push({ id, text: cleanContent, level });
          }
        }
      }
    });

    // Filter to only show H2 headings
    return items.filter(item => item.level === 2);
  }, [blocks]);

  if (headings.length < 1) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(`heading-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="hidden xl:block fixed left-8 top-1/2 -translate-y-1/2 w-48 z-40">
      <div className="border-l border-foreground/10 pl-4">
        <span className="font-pixel text-[9px] tracking-[0.3em] opacity-40 uppercase block mb-4">Contents</span>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`text-left text-xs leading-tight transition-all hover:opacity-100 ${activeHeading === heading.id ? 'opacity-100 text-accent' : 'opacity-40'
                  }`}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function DynamicArticle({ slug, onNavigate }: DynamicArticleProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<Article[]>([]);
  const [allPosts, setAllPosts] = useState<Article[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);

  // Framer Motion hooks must be at top level
  // @ts-ignore
  const { scrollY, scrollYProgress } = useScroll();
  // @ts-ignore
  const heroParallaxY = useTransform(scrollY, [0, 1000], [0, 300]);

  // Fetch categories for color lookup
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('type', 'articles');

        if (!error && data) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Apply category color when categories load (if article already loaded without color)
  useEffect(() => {
    if (article && !article.categoryColor && article.category && categories.length > 0) {
      const clientColor = findCategoryColor(article.category, categories);
      if (clientColor) {
        setArticle(prev => prev ? { ...prev, categoryColor: clientColor } : null);
      }
    }
  }, [categories, article?.category]);

  // Track active heading for TOC
  useEffect(() => {
    if (!article?.content) return;

    // Wait a tick for rendering to complete
    const timeout = setTimeout(() => {
      const elements = document.querySelectorAll('[id^="heading-"]');
      const headings = Array.from(elements);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id.replace('heading-', '');
              setActiveHeading(id);
            }
          });
        },
        { rootMargin: '-20% 0px -60% 0px' }
      );

      headings.forEach((el) => el && observer.observe(el));

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timeout);
  }, [article?.content]);

  // Fetch all posts for prev/next navigation
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('published', true)
          .order('published_at', { ascending: false });

        if (!error && data) {
          // Map DB fields to Article interface
          const mappedPosts: Article[] = (data as any[]).map(p => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            category: p.category || 'Article',
            date: (() => {
              try {
                const d = p.publish_date || p.created_at;
                const dateObj = d ? new Date(d) : new Date();
                if (isNaN(dateObj.getTime())) return new Date().toISOString();
                return dateObj.toISOString();
              } catch (e) {
                return new Date().toISOString();
              }
            })(),
            readTime: '5 min read', // TODO: Calculate read time from content
            excerpt: p.excerpt,
            coverImage: p.cover_image,
            tags: p.tags || [],
            content: p.content || []
          }));
          setAllPosts(mappedPosts);
        }
      } catch (err) {
        console.error('Error fetching all posts:', err);
      }
    };
    fetchAllPosts();
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        // Try to fetch by slug first, then ID
        let query = supabase.from('articles').select('*').eq('published', true);

        // Simple check if slug looks like a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

        if (isUUID) {
          query = query.eq('id', slug);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error } = await query.single<any>();

        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const post: Article = {
          id: data.id,
          slug: data.slug,
          title: data.title,
          category: data.category || 'Article',

          date: (() => {
            try {
              const d = data.publish_date || data.created_at;
              const dateObj = d ? new Date(d) : new Date();
              if (isNaN(dateObj.getTime())) return new Date().toISOString();
              return dateObj.toISOString();
            } catch (e) {
              return new Date().toISOString();
            }
          })(),
          readTime: '5 min read',
          excerpt: data.excerpt,
          coverImage: data.cover_image,
          tags: data.tags || [],
          content: data.content || []
        };

        // If server didn't provide categoryColor, look it up client-side
        let postWithColor = post;

        if (!postWithColor.categoryColor && postWithColor.category && categories.length > 0) {
          const clientColor = findCategoryColor(postWithColor.category, categories);
          if (clientColor) {
            postWithColor = { ...postWithColor, categoryColor: clientColor };
          }
        }

        setArticle(postWithColor);

        // Fetch related posts based on same category or tags
        fetchRelatedPosts(postWithColor);

      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, categories]); // Categories needed for color mapping on load

  // Force-fetch live counts for articles
  useEffect(() => {
    if (!article?.id) return;

    const fetchLiveCounts = async () => {
      try {
        const { data } = await supabase
          .from('articles')
          .select('views, likes')
          .eq('id', article.id)
          .single();

        if (data) {
          setViews(data.views || 0);
          setLikes(data.likes || 0);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchLiveCounts();
  }, [article?.id]);

  // Track view on page load
  useEffect(() => {
    if (!article) return;

    const incrementView = async () => {
      try {
        await supabase.rpc('increment_article_view', { article_id: article.id });
      } catch (err) {
        // Silent fail
      }
    };

    const timer = setTimeout(incrementView, 2000);
    return () => clearTimeout(timer);
  }, [article?.id]);

  const handleTagClick = (tag: string) => {
    // Navigate to articles with tag filter
    onNavigate(`articles?tag=${encodeURIComponent(tag)}`);
  };

  const fetchRelatedPosts = async (post: Article) => {
    try {
      // Find related posts from the already fetched allPosts or new query
      // Let's query specifically for related
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .neq('id', post.id)
        .eq('published', true)
        .limit(3);

      // Ideally we should filter by category/tags in query, but for now simple fallback
      // or complex query: .or(`category.eq.${post.category},tags.cs.{${post.tags.join(',')}}`)

      if (!error && data) {
        const mappedRelated: Article[] = (data as any[]).map(p => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          category: p.category || 'Article',
          date: (() => {
            try {
              const d = p.publish_date || p.created_at;
              const dateObj = d ? new Date(d) : new Date();
              if (isNaN(dateObj.getTime())) return new Date().toISOString();
              return dateObj.toISOString();
            } catch (e) {
              return new Date().toISOString();
            }
          })(),
          readTime: '5 min read',
          excerpt: p.excerpt,
          coverImage: p.cover_image,
          focusPoint: p.cover_image_focal_point,
          tags: p.tags || [],
          content: p.content || []
        }));
        setRelatedPosts(mappedRelated);
      }
    } catch (err) {
    }
  };

  if (loading) {
    return <SkeletonArticle />;
  }

  if (notFound || !article) {
    return (
      <>
        <SEO metadata={{ ...PAGE_METADATA['404'], noindex: true }} />
        <div className="min-h-screen bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-8 pt-12">
            <button
              onClick={() => onNavigate('articles')}
              className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs tracking-wider">BACK TO ARTICLES</span>
            </button>
            <div className="text-center py-20">
              <p className="opacity-60">Article not found</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {article && (
        <SEO
          metadata={generateArticleMetadata({
            title: article.title,
            excerpt: article.excerpt,
            coverImage: article.coverImage,
            category: article.category,
            date: article.date,
            id: article.id,
            slug: article.slug,
            tags: article.tags
          })}
        />
      )}
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-accent-brand z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {article.coverImage && article.coverImage.trim() !== '' ? (
        <>
          {/* Strict Vox-Style Hero Layout - Fixed Alignment & Image */}
          <section className="relative w-full pt-16 md:pt-24 pb-12 px-6 md:px-12 bg-background">
            <div className="max-w-screen-xl mx-auto flex flex-col items-center">

              {/* 1. Image (Top, Centered, Constrained) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.2, 0, 0.2, 1] }}
                className="w-full max-w-5xl relative aspect-[16/9] md:aspect-[2/1] rounded-lg overflow-hidden shadow-sm mb-12"
              >
                <ImageWithFallback
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  priority={true}
                  focusPoint={article.cover_image_focal_point}
                  optimize="hero"
                />
              </motion.div>

              {/* Text Container - Centered on Page, Left Aligned Text */}
              <div className="w-full max-w-3xl flex flex-col items-start text-left">

                {/* 2. Meta Info (Category | Date - Vox Style) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <span className="font-bold text-xs tracking-widest uppercase text-accent-brand">
                    {article.category}
                  </span>
                  <span className="text-foreground/20">|</span>
                  <span className="font-sans text-xs tracking-wide text-foreground/60 uppercase">
                    {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </motion.div>

                {/* 3. Title (Left Aligned) */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-foreground mb-6 tracking-tight font-semibold"
                >
                  {article.title}
                </motion.h1>

                {/* 4. Excerpt (New) */}
                {/* Using article.description as fallback for excerpt if explicit excerpt doesn't exist */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl md:text-2xl leading-relaxed text-foreground/70 mb-8 font-serif antialiased"
                >
                  {article.excerpt || "A deep dive into the creative process and technical challenges behind this production."}
                </motion.p>

                {/* 5. Author & Meta (Left Aligned) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 mb-4 text-sm text-foreground/60 font-medium w-full border-t border-foreground/10 pt-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-foreground/10 overflow-hidden flex items-center justify-center border border-foreground/5">
                      <img
                        src={authorImageSrc}
                        alt="Brandon PT Davis"
                        className="w-full h-full object-cover grayscale"
                      />
                    </div>
                    <div className="flex flex-col items-start leading-tight gap-0.5">
                      <span className="text-foreground text-xs uppercase tracking-wider font-bold">By Brandon PT Davis</span>
                      <span className="text-foreground/60 text-[10px] uppercase tracking-widest font-medium">Scenic + Experiential Designer</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 ml-auto">
                    <div className="flex items-center gap-3">
                      <LikeButton projectId={article.id} type="post" initialLikes={likes} size="sm" />
                      <ShareButton title={article.title} url={typeof window !== 'undefined' ? window.location.href : ''} size="sm" />
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>
          </section>
        </>
      ) : (
        <>
          {/* No Image Hero - Centered and Big */}
          <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-6 pt-32 pb-16 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.03] to-transparent" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center gap-6"
              >
                <span className="font-pixel text-xs tracking-[0.3em] uppercase text-accent-brand bg-foreground/[0.03] px-4 py-2 rounded-full border border-foreground/[0.05]">
                  {article.category}
                </span>

                <h1 className="font-display text-5xl sm:text-7xl md:text-8xl italic leading-[0.9] text-foreground drop-shadow-sm">
                  {article.title}
                </h1>

                <div className="flex items-center gap-6 text-sm font-sans tracking-wide opacity-60 mt-4">
                  <span>{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="w-1.5 h-1.5 bg-current rounded-full opacity-50" />
                  <span>{article.readTime}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}

      {/* Article Content */}
      <article className={`max-w-4xl mx-auto px-6 md:px-12 ${article.coverImage && article.coverImage.trim() !== '' ? 'pt-12 pb-16' : 'py-16 md:py-24'}`}>
        {/* Article Content - Clean magazine layout */}
        <div className="prose-custom-wrapper text-justify">
          <BlockRenderer blocks={article.content || []} accentColor={article.categoryColor} />
        </div>

        {/* Tech-inspired end flourish */}
        <ArticleEndFlourish />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-12 pb-16 border-t border-foreground/5">
            <div className="flex flex-col gap-6">
              <span className="font-pixel text-[9px] tracking-[0.3em] text-foreground/40 uppercase">Tagged</span>
              <div className="flex flex-wrap gap-3">
                {article.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-4 py-2 bg-foreground/[0.03] hover:bg-foreground/[0.06] border border-foreground/[0.06] hover:border-foreground/10 rounded-full transition-all text-xs tracking-wide"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="pt-12 pb-16 border-t border-foreground/5">
          {article.id && (
            <React.Suspense fallback={<div className="h-24 flex(items-center justify-center opacity-40">Loading comments...</div>}>
              <CommentsSection articleId={article.id} />
            </React.Suspense>
          )}
        </div>

        {/* Author Section */}

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-12 border-t border-black/10 dark:border-white/10">
            <div className="mb-10">
              <h2 className="font-display text-3xl md:text-4xl italic mb-2">Related Articles</h2>
              <p className="font-pixel text-[10px] tracking-[0.2em] opacity-60 uppercase">Continue Reading</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedPosts.slice(0, 3).map((post, index) => (
                <div key={post.id} className="relative aspect-[3/4]">
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
                    onClick={() => {
                      window.scrollTo(0, 0);
                      onNavigate(`articles/${post.slug}`);
                    }}
                    variant="nothing"
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Table of Contents - Fixed sidebar */}
      {article.content && <TableOfContents blocks={article.content} activeHeading={activeHeading} />}
    </div>
  );
}
