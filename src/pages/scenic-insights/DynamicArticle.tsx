import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Tag, Loader2, Share2, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { ArticleAuthor } from '../../components/shared/ArticleAuthor';
import { BlockRenderer, ContentBlock } from '../../components/shared/BlockRenderer';
import { API_BASE_URL, apiCall } from '../../utils/api';
import { publicAnonKey } from '../../utils/supabase/info';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

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
  let match = categories.find(c => c.name.toLowerCase().trim() === normalizedName);
  if (match?.color) return match.color;
  
  // 2. Starts with match (e.g., "Design Philosophy" matches "Design Philosophy & Scenic Insights")
  match = categories.find(c => normalizedName.startsWith(c.name.toLowerCase().trim()));
  if (match?.color) return match.color;
  
  // 3. Contains match (e.g., looking for "Technology" in "Technology & Tutorials")
  match = categories.find(c => normalizedName.includes(c.name.toLowerCase().trim()));
  if (match?.color) return match.color;
  
  // 4. Reverse contains (category name contains our search term)
  match = categories.find(c => c.name.toLowerCase().trim().includes(normalizedName));
  if (match?.color) return match.color;
  
  return undefined;
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

// Tech-inspired end flourish
function ArticleEndFlourish() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <div className="flex items-center gap-2">
        <div className="w-8 h-px bg-foreground/20" />
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-foreground/30 rotate-45" />
          <div className="w-1.5 h-1.5 bg-foreground/50 rotate-45" />
          <div className="w-1.5 h-1.5 bg-foreground/30 rotate-45" />
        </div>
        <div className="w-8 h-px bg-foreground/20" />
      </div>
      <span className="font-pixel text-[9px] tracking-[0.3em] opacity-30 uppercase">End of Article</span>
    </div>
  );
}

// Table of Contents component
function TableOfContents({ blocks, activeHeading }: { blocks: ContentBlock[]; activeHeading: string }) {
  const headings = useMemo(() => 
    blocks
      .filter(b => b.type === 'heading' && (b.metadata?.level === 2 || b.metadata?.level === 3))
      .map(b => ({
        id: b.id,
        text: b.content,
        level: b.metadata?.level || 2
      })),
    [blocks]
  );

  if (headings.length < 3) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(`heading-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="hidden xl:block fixed left-8 top-1/2 -translate-y-1/2 w-48 z-10">
      <div className="border-l border-foreground/10 pl-4">
        <span className="font-pixel text-[9px] tracking-[0.3em] opacity-40 uppercase block mb-4">Contents</span>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`text-left text-xs leading-tight transition-all hover:opacity-100 ${
                  heading.level === 3 ? 'ml-3 text-[11px]' : ''
                } ${activeHeading === heading.id ? 'opacity-100 text-accent' : 'opacity-40'}`}
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

  // Fetch categories for color lookup
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiCall('/api/categories/articles');
        if (response.ok) {
          const result = await response.json();
          setCategories(result.categories || []);
          }
      } catch (err) {
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
    
    const headings = article.content
      .filter(b => b.type === 'heading')
      .map(b => document.getElementById(`heading-${b.id}`))
      .filter(Boolean);

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
  }, [article?.content]);

  // Fetch all posts for prev/next navigation
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const response = await apiCall('/api/posts');
        if (response.ok) {
          const result = await response.json();
          setAllPosts(result.posts || []);
        }
      } catch (err) {
        }
    };
    fetchAllPosts();
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        // Fetch article using the apiCall helper (has fallback support)
        const response = await apiCall(`/api/posts/${slug}`);
        
        if (!response.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        const result = await response.json();
        if (result.post) {
          // If server didn't provide categoryColor, look it up client-side
          let postWithColor = result.post;
          if (!postWithColor.categoryColor && postWithColor.category && categories.length > 0) {
            const clientColor = findCategoryColor(postWithColor.category, categories);
            if (clientColor) {
              postWithColor = { ...postWithColor, categoryColor: clientColor };
            }
          }
          
          setArticle(postWithColor);
          
          // Fetch related posts based on same category or tags
          fetchRelatedPosts(result.post);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const handleTagClick = (tag: string) => {
    // Navigate to articles with tag filter
    onNavigate(`articles?tag=${encodeURIComponent(tag)}`);
  };

  const fetchRelatedPosts = async (post: Article) => {
    try {
      // Use apiCall helper with fallback support
      const response = await apiCall('/api/posts/related', {
        method: 'POST',
        body: JSON.stringify({
          category: post.category,
          tags: post.tags,
          excludeId: post.id
        })
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();
      setRelatedPosts(result.posts);
    } catch (err) {
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin opacity-60" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section with Cover Image - Image separate from text */}
      {article.coverImage && article.coverImage.trim() !== '' ? (
        <>
          {/* Full-width image */}
          <section className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden bg-neutral-900 z-50" style={{ minHeight: '50vh' }}>
            <img
              src={article.coverImage}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover z-0"
              loading="eager"
              crossOrigin="anonymous"
              style={{ 
                display: 'block !important' as any,
                visibility: 'visible !important' as any,
                opacity: '1 !important' as any,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
            
            {/* Back Button - Top Left */}
            <div className="absolute top-6 left-6 z-50">
              <button
                type="button"
                onClick={() => onNavigate('scenic-insights')}
                className="group flex items-center gap-3 px-6 py-3 backdrop-blur-xl bg-black/40 hover:bg-black/60 border border-white/10 rounded-full transition-all text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-pixel text-[10px] tracking-[0.2em]">BACK</span>
              </button>
            </div>
          </section>

          {/* Article Header - Below Image */}
          <div className="max-w-4xl mx-auto px-6 md:px-12 pt-12 pb-8">
            {/* Meta row with share buttons */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <span 
                  className="font-pixel text-[11px] tracking-[0.3em] uppercase font-medium"
                  style={{ color: article.categoryColor || 'inherit', opacity: article.categoryColor ? 1 : 0.6 }}
                >
                  {article.category.split(' & ')[0]}
                </span>
                <span 
                  className="w-px h-3" 
                  style={{ backgroundColor: article.categoryColor ? `${article.categoryColor}40` : 'currentColor', opacity: article.categoryColor ? 1 : 0.2 }}
                />
                <span 
                  className="font-pixel text-[11px] tracking-[0.3em]"
                  style={{ color: article.categoryColor || 'inherit', opacity: article.categoryColor ? 0.8 : 0.6 }}
                >
                  {new Date(article.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }).toUpperCase()}
                </span>
                <span 
                  className="w-px h-3" 
                  style={{ backgroundColor: article.categoryColor ? `${article.categoryColor}40` : 'currentColor', opacity: article.categoryColor ? 1 : 0.2 }}
                />
                <span 
                  className="font-pixel text-[11px] tracking-[0.3em]"
                  style={{ color: article.categoryColor || 'inherit', opacity: article.categoryColor ? 0.8 : 0.6 }}
                >
                  {article.readTime}
                </span>
              </div>
              
              {/* Share buttons inline */}
              <ShareButtons 
                title={article.title} 
                url={typeof window !== 'undefined' ? window.location.href : ''} 
              />
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-6 italic leading-[1.05]">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-foreground/60 text-lg md:text-xl leading-relaxed max-w-3xl">
              {article.excerpt}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Article Header - No Image Version */}
          <div className="max-w-4xl mx-auto px-6 md:px-12 pt-24 pb-8">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => onNavigate('articles')}
              className="group flex items-center gap-3 px-6 py-3 mb-8 bg-black dark:bg-white text-white dark:text-black rounded-full transition-all cursor-pointer hover:gap-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-pixel text-[10px] tracking-[0.2em]">BACK</span>
            </button>

            {/* Meta row with share buttons */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <span 
                  className="font-pixel text-[11px] tracking-[0.3em] uppercase font-medium"
                  style={{ color: article.categoryColor || 'inherit', opacity: article.categoryColor ? 1 : 0.6 }}
                >
                  {article.category.split(' & ')[0]}
                </span>
                <span 
                  className="w-px h-3" 
                  style={{ backgroundColor: article.categoryColor ? `${article.categoryColor}40` : 'currentColor', opacity: article.categoryColor ? 1 : 0.2 }}
                />
                <span 
                  className="font-pixel text-[11px] tracking-[0.3em]"
                  style={{ color: article.categoryColor || 'inherit', opacity: article.categoryColor ? 0.8 : 0.6 }}
                >
                  {article.readTime}
                </span>
              </div>
              
              <ShareButtons 
                title={article.title} 
                url={typeof window !== 'undefined' ? window.location.href : ''} 
              />
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-6 italic leading-[1.05]">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-foreground/60 text-lg md:text-xl leading-relaxed max-w-3xl">
              {article.excerpt}
            </p>
          </div>
        </>
      )}

      {/* Article Content */}
      <article className={`max-w-4xl mx-auto px-6 md:px-12 ${article.coverImage && article.coverImage.trim() !== '' ? 'pt-8 pb-16' : 'py-16 md:py-24'}`}>
        {/* If no cover image, show header here */}
        {(!article.coverImage || article.coverImage.trim() === '') && (
          <div className="mb-16">
            <button
              onClick={(e) => {
                e.preventDefault();
                onNavigate('articles');
              }}
              className="group flex items-center gap-3 mb-12 px-6 py-3 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-full transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-pixel text-[10px] tracking-[0.2em]">BACK TO ARTICLES</span>
            </button>

            {/* Meta row with share buttons */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <span 
                  className="font-pixel text-[11px] tracking-[0.3em] uppercase font-medium"
                  style={{ color: article.categoryColor || 'inherit', opacity: article.categoryColor ? 1 : 0.6 }}
                >
                  {article.category.split(' & ')[0]}
                </span>
                <span 
                  className="w-px h-3" 
                  style={{ backgroundColor: article.categoryColor ? `${article.categoryColor}40` : 'currentColor', opacity: article.categoryColor ? 1 : 0.2 }}
                />
                <span 
                  className="font-pixel text-[11px] tracking-[0.3em]"
                  style={{ color: article.categoryColor || 'inherit', opacity: article.categoryColor ? 0.8 : 0.6 }}
                >
                  {new Date(article.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }).toUpperCase()}
                </span>
                <span 
                  className="w-px h-3" 
                  style={{ backgroundColor: article.categoryColor ? `${article.categoryColor}40` : 'currentColor', opacity: article.categoryColor ? 1 : 0.2 }}
                />
                <span 
                  className="font-pixel text-[11px] tracking-[0.3em]"
                  style={{ color: article.categoryColor || 'inherit', opacity: article.categoryColor ? 0.8 : 0.6 }}
                >
                  {article.readTime}
                </span>
              </div>
              
              <ShareButtons 
                title={article.title} 
                url={typeof window !== 'undefined' ? window.location.href : ''} 
              />
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-6 italic leading-[1.05]">
              {article.title}
            </h1>

            <p className="text-foreground/60 text-lg md:text-xl leading-relaxed max-w-3xl">
              {article.excerpt}
            </p>
          </div>
        )}

        {/* Article Content - Clean magazine layout */}
        <div className="max-w-none">
          <BlockRenderer blocks={article.content || []} accentColor={article.categoryColor} />
        </div>

        {/* Tech-inspired end flourish */}
        <ArticleEndFlourish />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="py-8 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 opacity-60">
                <Tag className="w-4 h-4" />
                <span className="font-pixel text-[10px] tracking-[0.2em] uppercase">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {article.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-5 py-2.5 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 hover:border-foreground/20 rounded-full transition-all font-pixel text-[10px] tracking-[0.2em]"
                  >
                    {tag.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Author Section */}
        <div className="py-12 border-t border-black/10 dark:border-white/10">
          <ArticleAuthor />
        </div>

        {/* Previous / Next Article Navigation */}
        {allPosts.length > 1 && (() => {
          const currentIndex = allPosts.findIndex(p => p.slug === slug);
          const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
          const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
          
          if (!prevPost && !nextPost) return null;
          
          return (
            <div className="py-8 border-t border-black/10 dark:border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Previous Article */}
                {prevPost ? (
                  <button
                    onClick={() => {
                      window.scrollTo(0, 0);
                      onNavigate(`articles/${prevPost.slug}`);
                    }}
                    className="group text-left p-6 rounded-2xl bg-foreground/[0.02] hover:bg-foreground/[0.05] border border-foreground/5 hover:border-foreground/10 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3 opacity-50">
                      <ArrowLeft className="w-4 h-4" />
                      <span className="font-pixel text-[9px] tracking-[0.2em] uppercase">Previous</span>
                    </div>
                    <h4 className="font-display text-lg md:text-xl italic leading-tight group-hover:opacity-80 transition-opacity line-clamp-2">
                      {prevPost.title}
                    </h4>
                  </button>
                ) : <div />}
                
                {/* Next Article */}
                {nextPost ? (
                  <button
                    onClick={() => {
                      window.scrollTo(0, 0);
                      onNavigate(`articles/${nextPost.slug}`);
                    }}
                    className="group text-right p-6 rounded-2xl bg-foreground/[0.02] hover:bg-foreground/[0.05] border border-foreground/5 hover:border-foreground/10 transition-all"
                  >
                    <div className="flex items-center justify-end gap-2 mb-3 opacity-50">
                      <span className="font-pixel text-[9px] tracking-[0.2em] uppercase">Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <h4 className="font-display text-lg md:text-xl italic leading-tight group-hover:opacity-80 transition-opacity line-clamp-2">
                      {nextPost.title}
                    </h4>
                  </button>
                ) : <div />}
              </div>
            </div>
          );
        })()}

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-12 border-t border-black/10 dark:border-white/10">
            <div className="mb-10">
              <h2 className="font-display text-3xl md:text-4xl italic mb-2">Related Articles</h2>
              <p className="font-pixel text-[10px] tracking-[0.2em] opacity-60 uppercase">Continue Reading</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedPosts.slice(0, 3).map((post) => (
                <button
                  key={post.id}
                  onClick={() => {
                    window.scrollTo(0, 0);
                    onNavigate(`articles/${post.slug}`);
                  }}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden text-left shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Full Image Background */}
                  {post.coverImage && post.coverImage.trim() !== '' && !post.coverImage.startsWith('blob:') ? (
                    <ImageWithFallback
                      src={post.coverImage}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 to-foreground/5" />
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  
                  {/* Text Content */}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-pixel text-[8px] text-white/70 tracking-[0.25em] uppercase">
                        {post.category.split(' & ')[0]}
                      </span>
                      <span className="w-px h-2 bg-white/30" />
                      <span className="font-pixel text-[8px] text-white/70 tracking-[0.25em]">
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="font-display text-white text-lg md:text-xl italic leading-[1.2] mb-2 group-hover:opacity-90 transition-opacity">
                      {post.title}
                    </h3>
                    <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </button>
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
