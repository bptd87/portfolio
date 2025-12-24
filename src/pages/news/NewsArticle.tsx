import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useImageColors } from '../../hooks/useImageColors';
import { BlogCard } from '../../components/shared/BlogCard';

interface NewsBlock {
  type: 'text' | 'gallery' | 'team' | 'details' | 'quote' | 'link';
  content?: string;
  images?: { url: string; caption?: string; alt?: string }[];
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
            images: rawItem.images || []
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
          
          console.log('📚 All News Loaded (Sample):', newsArray[0]);

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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render block content
  const renderBlock = (block: NewsBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={index} className="prose prose-lg max-w-none mb-8">
            <div className="text-white/80 leading-relaxed whitespace-pre-wrap">
              {block.content}
            </div>
          </div>
        );

      case 'gallery':
        if (!block.images || block.images.length === 0) return null;
        return (
          <div key={index} className="mb-12 not-prose">
            <div className={`grid gap-4 ${block.images.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
              block.images.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                block.images.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                  'grid-cols-2 md:grid-cols-3'
              }`}>
              {block.images.map((img, i) => (
                <div
                  key={i}
                  className="aspect-square bg-neutral-500/5 border border-neutral-500/20 rounded-2xl flex items-center justify-center hover:border-neutral-500/40 transition-colors cursor-pointer group relative overflow-hidden"
                >
                  {img.url ? (
                    <img
                      src={img.url}
                      alt={img.alt || img.caption || `Image ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => console.error('Gallery Image Error:', img.url, e)}
                    />
                  ) : (
                    <span className="text-xs opacity-20">Image {i + 1}</span>
                  )}
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md text-white text-xs p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'team':
        if (!block.members || block.members.length === 0) return null;
        return (
          <div key={index} className="mb-12 not-prose">
            <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6">
              <h3 className="font-pixel text-xs tracking-[0.3em] text-white/60 mb-4 uppercase">
                {block.title || 'Team'}
              </h3>
              <div className="space-y-3 text-sm">
                {block.members.map((member, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-white/60 min-w-[120px]">{member.role}:</span>
                    <span className="text-white">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'details':
        if (!block.items || block.items.length === 0) return null;
        return (
          <div key={index} className="mb-12 not-prose">
            <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6">
              <h3 className="font-pixel text-xs tracking-[0.3em] text-white/60 mb-4 uppercase">
                {block.title || 'Details'}
              </h3>
              <div className="space-y-3 text-sm">
                {block.items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-white/60 min-w-[120px]">{item.label}:</span>
                    <span className="text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'quote':
        return (
          <div key={index} className="mb-12 not-prose">
            <div className="border-l-4 border-foreground pl-6 pr-6 py-4 bg-neutral-500/5 rounded-r-3xl">
              <p className="font-serif italic text-xl text-white/80 mb-3">
                "{block.text}"
              </p>
              {(block.author || block.source) && (
                <p className="text-sm text-white/60">
                  {block.author && <span>— {block.author}</span>}
                  {block.author && block.source && <span>, </span>}
                  {block.source && <span className="italic">{block.source}</span>}
                </p>
              )}
            </div>
          </div>
        );

      case 'link':
        return (
          <div key={index} className="mb-12 not-prose">
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity rounded-full font-pixel text-xs tracking-wider"
            >
              <span>{block.label || 'View Link'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm tracking-wider opacity-60 font-pixel">LOADING ARTICLE...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4">
        <div className="text-center">
          <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-12 inline-block">
            <h1 className="font-serif italic text-4xl mb-4">Article Not Found</h1>
            <button
              onClick={() => onNavigate('news')}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors font-pixel text-xs tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO NEWS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fixed Gradient Background - visible mostly in content area or if no cover image */}
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
              radial-gradient(ellipse 80% 50% at 20% 30%, rgba(147, 51, 234, 0.4), transparent),
              radial-gradient(ellipse 60% 60% at 80% 40%, rgba(6, 182, 212, 0.3), transparent),
              radial-gradient(ellipse 50% 50% at 50% 80%, rgba(59, 130, 246, 0.25), transparent),
              linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 70%, #0a0a0a 100%)
            `
        }}
      />

      <div className="min-h-screen bg-transparent relative z-10 text-white">
        
        {/* Full Width Hero Section - Always Render to preserve layout - INLINE STYLES FOR RELIABILITY */}
        <section style={{ 
          position: 'relative', 
          width: '100%', 
          height: '60vh', 
          minHeight: '400px', 
          backgroundColor: '#111', 
          overflow: 'hidden',
          borderBottom: '1px solid #333'
        }}>
           {article.coverImage ? (
             <img
                src={article.coverImage}
                alt={article.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: article.coverImageFocalPoint 
                    ? `${article.coverImageFocalPoint.x}% ${article.coverImageFocalPoint.y}%` 
                    : 'center',
                  zIndex: 0
                }}
                loading="eager"
                onError={(e) => console.error('Article Hero Image Error:', article.coverImage, e)}
              />
           ) : (
             <div style={{
               position: 'absolute',
               inset: 0,
               backgroundColor: '#333',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               color: 'white',
               fontSize: '12px',
               letterSpacing: '0.2em'
             }}>
                NO COVER IMAGE
             </div>
           )}
           
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 pointer-events-none" style={{ zIndex: 1 }} />
            
            {/* Back Button within Hero */}
            <div className="absolute top-24 left-6 md:left-12 z-50">
              <button
                onClick={() => onNavigate('news')}
                className="group flex items-center gap-3 px-6 py-3 backdrop-blur-xl bg-black/40 hover:bg-black/60 border border-white/10 rounded-full transition-all text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-pixel text-[10px] tracking-[0.2em]">BACK TO NEWS</span>
              </button>
            </div>
        </section>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-6 md:px-12 pt-12">
            

          {/* Header Section */}
          <div className="mb-12">
            {/* Category & Date */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white text-black text-[10px] px-3 py-1.5 rounded-full font-pixel tracking-wider font-bold">
                {article.category?.toUpperCase() || 'NEWS'}
              </div>
              <div className="text-white/60 text-sm flex items-center gap-2 font-pixel tracking-widest text-[10px]">
                {formatDate(article.date)}
              </div>
            </div>

            {/* Title */}
            <h1 className="font-serif italic text-5xl md:text-6xl lg:text-7xl mb-8 leading-[1.1]">{article.title}</h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-light">
                {article.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
              {article.location && (
                <div className="flex flex-col gap-1">
                   <span className="font-pixel text-[9px] tracking-[0.2em] uppercase text-white/40">Location</span>
                   <span className="text-sm font-medium">{article.location}</span>
                </div>
              )}
               {article.link && (
                 <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors font-pixel text-[10px] tracking-wider font-bold"
                >
                  <span>VISIT LINK</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
               )}
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg prose-invert max-w-none">
            {/* Blocks or Content */}
             {article.blocks && article.blocks.length > 0 ? (
              <div>
                {article.blocks.map((block, index) => renderBlock(block, index))}
              </div>
            ) : (typeof article.content === 'string') ? (
              <div className="text-white/80 leading-relaxed whitespace-pre-wrap mb-12 text-lg">
                {article.content}
              </div>
            ) : (article.content) ? (
               <div className="text-white/80 leading-relaxed whitespace-pre-wrap mb-12 text-lg">
                 {/* Fallback for Rich Text / JSON content if proper renderer is missing */}
                 {/* Try to extract text if it has a simple structure, otherwise stringify (or handle better later) */}
                  {(article.content as any).text || (article.content as any).content?.[0]?.text || typeof article.content === 'object' ? JSON.stringify(article.content) : ''}
               </div>
            ) : (
               <div className="p-12 border border-white/10 rounded-2xl bg-white/5 text-center">
                <p className="text-white/60 italic font-serif text-xl">Content coming soon...</p>
               </div>
            )}
          </div>
          
           {/* Legacy Gallery Fallback */}
           {article.images && article.images.length > 0 && (!article.blocks || article.blocks.length === 0) && (
             <div className="mt-16">
               <h3 className="font-pixel text-xs tracking-[0.3em] uppercase text-white/60 mb-8">Image Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.images.map((img, i) => (
                    <div key={i} className="aspect-square relative rounded-xl overflow-hidden bg-white/5">
                        <img 
                          src={img.url} 
                          alt={img.caption || ''} 
                          className="object-cover w-full h-full"
                          onError={(e) => console.error('Legacy Gallery Image Error:', img.url, e)} 
                        />
                    </div>
                  ))}
                </div>
             </div>
           )}

           {/* Tags */}
           {article.tags && article.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-white/10">
               <div className="flex flex-wrap gap-2">
                 {article.tags.map(tag => (
                   <span key={tag} className="px-3 py-1.5 border border-white/20 rounded-full text-xs text-white/60 font-pixel tracking-wider uppercase">
                     {tag}
                   </span>
                 ))}
               </div>
            </div>
           )}

        </div>

        {/* Related News - Bottom Grid */}
        <div className="border-t border-white/10 mt-24 bg-black/40 backdrop-blur-sm">
             <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
                <div className="flex items-center justify-between mb-12">
                   <div>
                     <h2 className="font-display italic text-3xl md:text-4xl mb-2">More News</h2>
                     <p className="font-pixel text-[10px] tracking-[0.3em] text-white/60 uppercase">Latest Updates</p>
                   </div>
                   <button
                    onClick={() => onNavigate('news')}
                    className="px-6 py-2 border border-white/20 rounded-full text-xs font-pixel tracking-widest hover:bg-white hover:text-black transition-colors"
                   >
                     VIEW ALL ARCHIVE
                   </button>
                </div>

                {/* Always render grid, but show message if empty */}
                {allNews.filter(n => n.id !== article.id).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allNews.filter(n => n.id !== article.id).slice(0, 3).map((item, idx) => (
                       <div key={item.id} className="h-full">
                         <BlogCard
                            title={item.title}
                            date={new Date(item.date).toLocaleDateString()}
                            category={item.category}
                            image={item.coverImage}
                            excerpt={item.excerpt}
                            onClick={() => {
                               window.scrollTo(0,0);
                               onNavigate('news/' + (item.slug || item.id));
                             }}
                            // Removed variant="nothing" to use default
                         />
                       </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/40 font-pixel text-sm text-center py-12 border border-white/5 rounded-2xl">
                    No other recent news available.
                  </div>
                )}
             </div>
        </div>

      </div>

    </>
  );
}
