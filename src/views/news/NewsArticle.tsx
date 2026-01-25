import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { ArrowLeft, ExternalLink, Calendar, MapPin, Share2 } from 'lucide-react';
import { useImageColors } from '../../hooks/useImageColors';
import { BlogCard } from '../../components/shared/BlogCard';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { SEO } from '../../components/SEO';
import { generateNewsMetadata } from '../../utils/seo/metadata';
import { projectId } from '../../utils/supabase/info';


interface NewsBlock {
  type: 'text' | 'paragraph' | 'heading' | 'image' | 'video' | 'gallery' | 'list' | 'quote' | 'link' | 'spacer' | 'divider' | 'team' | 'details';
  content?: string;
  images?: { url: string; caption?: string; alt?: string }[];
  metadata?: {
    level?: number;
    listType?: 'number' | 'bullet';
    align?: 'left' | 'center' | 'right';
    size?: 'small' | 'medium' | 'large' | 'full';
    alt?: string;
    caption?: string;
    galleryStyle?: 'grid' | 'masonry' | 'carousel';
    galleryTitle?: string;
    galleryDescription?: string;
    images?: Array<{ url: string; alt?: string; caption?: string }>;
  };
  members?: { role: string; name: string }[];
  items?: { label: string; value: string }[];
  text?: string;
  author?: string;
  source?: string;
  url?: string;
  label?: string;
  title?: string;
}

interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  coverImageFocalPoint?: { x: number; y: number };
  location?: string;
  link?: string;
  slug?: string;
  tags: string[];
  blocks?: NewsBlock[];
  images?: { url: string; caption?: string; alt?: string }[];
  link_text?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
}

interface NewsArticleProps {
  newsId: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function NewsArticle({ newsId, onNavigate }: NewsArticleProps) {
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);

  // Extract colors from cover image for gradient background
  const colors = useImageColors(article?.coverImage);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        // Fetch current article
        let query = supabase.from('news').select('*');

        // Check if newsId is a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newsId);
        if (isUUID) {
          query = query.eq('id', newsId);
        } else {
          query = query.eq('slug', newsId);
        }

        const { data: rawItem, error: articleError } = await query.single();

        // Fetch all news for "More News" section
        const { data: allNewsData, error: allNewsError } = await supabase
          .from('news')
          .select('*')
          .eq('published', true)
          .order('date', { ascending: false });

        if (!articleError && rawItem) {
          // Map snake_case to camelCase and handle content/blocks
          let blocks = rawItem.blocks || [];
          let content = rawItem.content;

          // If content is an array, it's likely the blocks structure
          if (Array.isArray(content)) {
            blocks = content;
            content = null;
          }
          // If blocks are empty but content looks like a JSON array string, try to parse it
          else if ((!blocks || blocks.length === 0) && typeof content === 'string' && content.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(content);
              if (Array.isArray(parsed)) {
                blocks = parsed;
                content = null; // Clear content since we moved it to blocks
              }
            } catch (e) {
              console.warn('Failed to parse content as JSON blocks', e);
            }
          }

          const newsItem = {
            ...rawItem,
            content,
            coverImage: rawItem.cover_image,
            coverImageFocalPoint: rawItem.cover_image_focal_point,
            tags: rawItem.tags || [],
            blocks: blocks,
            images: rawItem.images || [],
            link_text: rawItem.link_text,
            seo_title: rawItem.seo_title,
            seo_description: rawItem.seo_description,
            seo_keywords: rawItem.seo_keywords
          };
          console.log('📰 NewsArticle Loaded:', newsItem);
          setArticle(newsItem);
        }

        // Process all news for navigation
        if (!allNewsError && allNewsData) {
          // Map snake_case to camelCase
          const newsArray: NewsItem[] = allNewsData.map((item: any) => ({
            ...item,
            coverImage: item.cover_image,
            coverImageFocalPoint: item.cover_image_focal_point,
            slug: item.slug || item.id,
            tags: item.tags || [],
          }));

          // Sort by date descending
          const sortedNews = newsArray.sort((a: NewsItem, b: NewsItem) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          // Store all news for carousel
          setAllNews(sortedNews);
        }
      } catch (err) {
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (newsId) {
      fetchArticle();
    }
  }, [newsId]);

  // Helper to sanitize content by replacing non-breaking spaces with regular spaces
  // This is CRITICAL for line-wrapping to work correctly.
  const sanitizeContent = (html: string | undefined): string => {
    if (!html) return '';
    // Replace &nbsp;, Unicode non-breaking space (160), and soft hyphen (shy)
    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/&shy;/g, '') // Remove soft hyphens to avoid strange breaks
      .replace(/\u00AD/g, '');
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderBlock = (block: NewsBlock, index: number) => {
    switch (block.type) {
      case 'text':
      case 'paragraph':
        return (
          <div key={index} className="mb-8 w-full max-w-full overflow-hidden">
            <div
              className="text-white/90 leading-relaxed font-sans text-left break-words"
              style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: sanitizeContent(block.content || block.text || '') }}
            />
          </div>
        );

      case 'heading':
        const Level = `h${block.metadata?.level || 2}` as React.ElementType;
        return (
          <Level key={index} className="font-serif italic text-white mb-6 mt-12 text-3xl md:text-4xl">
            {block.content}
          </Level>
        );

      case 'image':
        if (!block.content) return null;
        return (
          <div key={index} className="mb-12 not-prose">
            <figure className="relative w-full overflow-hidden rounded-2xl bg-neutral-900">
              <img
                src={block.content}
                alt={block.metadata?.alt || ''}
                className="w-full h-auto object-cover"
              />
              {block.metadata?.caption && (
                <figcaption className="mt-4 text-center text-xs font-pixel tracking-widest text-white/40">
                  {block.metadata.caption}
                </figcaption>
              )}
            </figure>
          </div>
        );

      case 'video':
        // Handle YouTube/Vimeo embeds
        let videoSrc = block.content || '';
        if ((block as any).metadata?.loading) videoSrc = ''; // Skip if loading

        // Simple transform for YouTube watch URLs if needed, though editor usually handles this
        if (videoSrc.includes('youtube.com/watch?v=')) {
          const videoId = videoSrc.split('v=')[1]?.split('&')[0];
          videoSrc = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoSrc.includes('youtu.be/')) {
          const videoId = videoSrc.split('youtu.be/')[1];
          videoSrc = `https://www.youtube.com/embed/${videoId}`;
        }

        return (
          <div key={index} className="mb-12 not-prose">
            <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-900 aspect-video">
              <iframe
                src={videoSrc}
                title="Video player"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        );

      case 'list':
        const listItems = block.content ? block.content.split('\n') : [];
        const isOrdered = block.metadata?.listType === 'number';

        return (
          <div key={index} className="prose prose-lg prose-invert max-w-full w-full mb-6 break-words">
            {isOrdered ? (
              <ol className="list-decimal w-full pl-5">
                {listItems.map((item, i) => (
                  <li key={i} className="text-white/80 font-sans font-light w-full pl-1">{item}</li>
                ))}
              </ol>
            ) : (
              <ul className="list-disc w-full pl-5">
                {listItems.map((item, i) => (
                  <li key={i} className="text-white/80 font-sans font-light w-full pl-1">{item}</li>
                ))}
              </ul>
            )}
          </div>
        );

      case 'spacer':
        return <div key={index} style={{ height: (block.metadata as any)?.height || '2rem' }} />;

      case 'divider':
        return <hr key={index} className="border-white/10 my-12" />;

      case 'gallery':
        const galleryImages = block.images || block.metadata?.images || [];
        if (!galleryImages || galleryImages.length === 0) return null;

        const galleryTitle = block.metadata?.galleryTitle;
        const galleryDesc = block.metadata?.galleryDescription;

        return (
          <div key={index} className="mb-16 not-prose">
            {galleryTitle && (
              <h3 className="mb-4 font-pixel text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                {galleryTitle}
              </h3>
            )}
            {galleryDesc && (
              <p className="mb-8 font-sans text-sm text-white/60 max-w-2xl">{galleryDesc}</p>
            )}

            <div className={`grid gap-6 ${galleryImages.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' :
              galleryImages.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                galleryImages.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                  'grid-cols-2 md:grid-cols-3'
              }`}>
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl transition-all hover:shadow-cyan-500/10"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    {img.url ? (
                      <img
                        src={img.url}
                        alt={img.alt || img.caption || `Gallery ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => console.error('Gallery Image Error:', img.url, e)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-white/5">
                        <span className="text-xs text-white/20">NO IMAGE</span>
                      </div>
                    )}
                  </div>
                  {img.caption && (
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="font-sans text-sm font-medium text-white">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'team':  // Backward compatibility
        if (!block.members || block.members.length === 0) return null;
        return (
          <div key={index} className="mb-12 not-prose">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <h3 className="mb-6 font-pixel text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                {block.title || 'Creative Team'}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {block.members.map((member, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wider text-white/50">{member.role}</span>
                    <span className="font-serif text-lg text-white">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'details': // Backward compatibility
        if (!block.items || block.items.length === 0) return null;
        return (
          <div key={index} className="mb-12 not-prose">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <h3 className="mb-6 font-pixel text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                {block.title || 'Production Details'}
              </h3>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {block.items.map((item, i) => (
                  <div key={i} className="flex flex-col border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-white/50">{item.label}</dt>
                    <dd className="font-sans text-base text-white">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        );

      case 'quote':
        return (
          <div key={index} className="mb-16 not-prose">
            <figure className="relative mx-auto max-w-4xl text-center">
              <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 font-serif text-9xl text-white/5">“</span>
              <blockquote className="relative">
                <p className="font-serif text-3xl font-light italic leading-relaxed text-white md:text-4xl">
                  {block.content || block.text}
                </p>
              </blockquote>
              {(block.author || block.source) && (
                <figcaption className="mt-6 flex items-center justify-center gap-2 font-sans text-sm uppercase tracking-widest text-white/60">
                  <div className="h-px w-8 bg-white/20"></div>
                  {block.author && <cite className="not-italic font-bold text-white">{block.author}</cite>}
                  {block.author && block.source && <span>•</span>}
                  {block.source && <cite className="not-italic">{block.source}</cite>}
                  <div className="h-px w-8 bg-white/20"></div>
                </figcaption>
              )}
            </figure>
          </div>
        );

      case 'link':
        return (
          <div key={index} className="mb-12 flex justify-center not-prose">
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-black transition-transform hover:scale-105"
            >
              <span className="relative z-10 font-pixel text-xs font-bold uppercase tracking-wider">
                {block.label || 'Visit Link'}
              </span>
              <ExternalLink className="relative z-10 h-3 w-3 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        );

      default:
        console.log('Unrecognized block type:', block.type, block);
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-1 w-24 bg-white/20 overflow-hidden rounded-full">
            <div className="h-full w-full bg-white animate-progress-indeterminateOrigin"></div>
          </div>
          <p className="font-pixel text-[10px] tracking-[0.3em] text-white/40 animate-pulse">LOADING STORY</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 text-white">
        <div className="text-center">
          <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-12 inline-block">
            <h1 className="font-serif italic text-4xl mb-4 text-white">Article Not Found</h1>
            <p className="text-white/40 mb-8 font-light">The story you are looking for does not exist or has been removed.</p>
            <button
              onClick={() => onNavigate('news')}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors font-pixel text-xs tracking-wider border border-white/20 px-6 py-3 rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO NEWS
            </button>
          </div>
        </div>
      </div>
    );
  }



  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.seo_title || article.title,
    "image": article.coverImage ? [article.coverImage] : [],
    "datePublished": new Date(article.date).toISOString(),
    "dateModified": new Date().toISOString(), // In a real app, track updated_at
    "author": [{
      "@type": "Person",
      "name": "Brandon PT Davis",
      "url": "https://brandonptdavis.com"
    }],
    "description": article.seo_description || article.excerpt || article.title
  };

  return (
    <>
      <SEO
        metadata={generateNewsMetadata({
          title: article.seo_title || article.title,
          excerpt: article.seo_description || article.excerpt || `News from Brandon PT Davis: ${article.title}`,
          coverImage: article.coverImage,
          category: article.category,
          date: article.date,
          lastModified: new Date().toISOString(),
          id: article.id,
          slug: article.slug,
          tags: article.seo_keywords || article.tags
        })}
        structuredData={articleSchema}
      />

      {/* Fixed Gradient Background - Restored to original dynamic style */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        data-nav="dark"
        style={{
          background: colors
            ? `
              radial-gradient(ellipse 80% 50% at 20% 20%, ${colors.primary}, transparent),
              radial-gradient(ellipse 50% 80% at 80% 50%, ${colors.secondary}, transparent),
              radial-gradient(ellipse 60% 40% at 40% 80%, ${colors.accent || colors.primary}, transparent),
              linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 70%, #0a0a0a 100%)
            `
            : `
              radial-gradient(circle at 20% 20%, rgba(255, 100, 150, 0.45), transparent 80%), /* Vibrant Pink - Expanded */
              radial-gradient(circle at 80% 30%, rgba(120, 50, 220, 0.5), transparent 80%), /* Deep Purple - Expanded */
              radial-gradient(circle at 50% 80%, rgba(50, 220, 230, 0.45), transparent 80%), /* Bright Cyan - Expanded */
              linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%) /* Dark Base */
            `
        }}
      />

      {/* Noise Overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.05] bg-noise mix-blend-overlay"></div>

      <div className="relative z-10 min-h-screen dark text-white">

        {/* Share Button - Positioned below nav bar */}
        <div className="fixed top-24 right-6 z-[60] pointer-events-none mix-blend-difference">
          <div className="pointer-events-auto">
            <button
              onClick={() => {
                navigator.share({
                  title: article.title,
                  text: article.excerpt,
                  url: window.location.href
                }).catch(() => { });
              }}
              className="rounded-full border border-white/20 bg-black/50 p-3 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black hover:scale-110"
              title="Share this article"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <section
          className="relative w-full overflow-hidden"
          style={{ height: '85vh', minHeight: '600px' }}
        >
          {/* Hero Image */}
          <div className="absolute inset-0">
            {article.coverImage ? (
              <ImageWithFallback
                src={article.coverImage}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-[20s] ease-linear hover:scale-105"
                style={{
                  objectPosition: article.coverImageFocalPoint
                    ? `${article.coverImageFocalPoint.x}% ${article.coverImageFocalPoint.y}%`
                    : 'center',
                }}
                optimize="hero"
                priority={true}
                focusPoint={article.coverImageFocalPoint}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-neutral-900">
                <span className="font-pixel tracking-widest text-white/20">NO IMAGE</span>
              </div>
            )}
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent opacity-60"></div>
          </div>

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24">
            <div className="mx-auto max-w-5xl">
              {/* Meta Pills */}
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <span className="rounded-full bg-white px-4 py-1.5 font-pixel text-[10px] font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  {article.category}
                </span>
                <span className="flex items-center gap-2 font-pixel text-[10px] font-bold uppercase tracking-wider text-white/80">
                  <Calendar className="h-3 w-3" />
                  {formatDate(article.date)}
                </span>
                {article.location && (
                  <span className="flex items-center gap-2 font-pixel text-[10px] font-bold uppercase tracking-wider text-white/80">
                    <MapPin className="h-3 w-3" />
                    {article.location}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="mb-6 font-serif text-5xl leading-[0.9] text-white md:text-7xl lg:text-8xl">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="max-w-2xl font-sans text-lg font-light leading-relaxed text-white/80 md:text-xl">
                  {article.excerpt}
                </p>
              )}

              {/* CTA Button */}
              {article.link && (
                <div className="mt-10">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 bg-white px-8 py-4 text-black transition-all hover:bg-neutral-200"
                  >
                    <span className="font-pixel text-xs font-bold uppercase tracking-wider">
                      {article.link_text || 'VISIT LINK'}
                    </span>
                    <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
        {/* Content Section */}
        <section className="relative mx-auto w-full max-w-3xl px-6 py-24 overflow-visible">
          <div className="article-content-root w-full max-w-full overflow-visible">
            {/* Article Content */}
            <div className="space-y-10">
              {/* Blocks or Content */}
              {article.blocks && article.blocks.length > 0 ? (
                <div className="text-left w-full max-w-full">
                  {article.blocks.map((block, index) => renderBlock(block, index))}
                </div>
              ) : (typeof article.content === 'string') ? (
                <div
                  className="text-white/90 leading-relaxed font-sans text-left break-words"
                  style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: sanitizeContent(article.content) }}
                />
              ) : (article.content) ? (
                <div
                  className="text-white/90 leading-relaxed font-sans text-left break-words"
                  style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
                >
                  {/* Fallback for complex content */}
                  {sanitizeContent((article.content as any).text || (article.content as any).content?.[0]?.text || JSON.stringify(article.content))}
                </div>
              ) : null}
            </div>

            {/* Legacy Gallery Fallback */}
            {article.images && article.images.length > 0 && (!article.blocks || article.blocks.length === 0) && (
              <div className="mt-24">
                <h3 className="mb-12 border-b border-white/10 pb-4 font-pixel text-xs font-bold uppercase tracking-[0.3em] text-white/40">Gallery</h3>
                <div className="not-prose grid grid-cols-1 gap-4 md:grid-cols-2">
                  {article.images.map((img, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-white/5 transition-transform hover:scale-[1.02]">
                      <img
                        src={img.url}
                        alt={img.caption || ''}
                        className="h-full w-full object-cover"
                        onError={(e) => console.error('Legacy Gallery Image Error:', img.url, e)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-24 border-t border-white/10 pt-8">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-pixel text-[10px] font-bold uppercase tracking-widest text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Read Next Section */}
        <section className="border-t border-white/10 bg-black/40 py-24 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 md:px-12">

            {/* Title */}
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="mb-4 font-serif text-4xl italic text-white md:text-5xl">Read Next</h2>
                <p className="font-pixel text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Latest Updates</p>
              </div>
              <button
                onClick={() => onNavigate('news')}
                className="hidden rounded-full border border-white/20 px-8 py-3 font-pixel text-xs font-bold tracking-widest text-white transition-all hover:bg-white hover:text-black md:block"
              >
                VIEW ARCHIVE
              </button>
            </div>

            {allNews.filter(n => n.id !== article.id).length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {allNews.filter(n => n.id !== article.id).slice(0, 3).map((item, _) => (
                  <div key={item.id} className="h-full">
                    <BlogCard
                      title={item.title}
                      date={new Date(item.date).toLocaleDateString()}
                      category={item.category}
                      image={item.coverImage}
                      excerpt={item.excerpt}
                      forceDark={true}
                      onClick={() => {
                        window.scrollTo(0, 0);
                        onNavigate('news', item.slug || item.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/10">
                <p className="font-pixel text-xs tracking-wider text-white/40">NO OTHER NEWS AVAILABLE</p>
              </div>
            )}

            <div className="mt-12 text-center md:hidden">
              <button
                onClick={() => onNavigate('news')}
                className="rounded-full border border-white/20 px-8 py-3 font-pixel text-xs font-bold tracking-widest text-white transition-all hover:bg-white hover:text-black"
              >
                VIEW ARCHIVE
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
