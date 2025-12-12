import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Calendar, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { motion } from 'motion/react';
import { useImageColors } from '../../hooks/useImageColors';

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
        // Fetch current article and all news in parallel
        const [response, allNewsResponse] = await Promise.all([
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/news/${newsId}`,
            { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
          ),
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/news`,
            { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
          )
        ]);

        if (response.ok) {
          const data = await response.json();
          const newsItem = data.newsItem || data;
          setArticle(newsItem);
        }

        // Process all news for navigation
        if (allNewsResponse.ok) {
          const allData = await allNewsResponse.json();
          const newsArray: NewsItem[] = allData.news || allData || [];

          // Sort by date descending
          const sortedNews = newsArray.sort((a: NewsItem, b: NewsItem) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          // Store all news for carousel
          setAllNews(sortedNews);
        }
      } catch (err) {
        // Error loading news article
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
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
                    <ImageWithFallback
                      src={img.url}
                      alt={img.alt || img.caption || `Image ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
      {/* FIXED GRADIENT BACKGROUND LAYER */}
      <div
        className="fixed inset-0 z-0"
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
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12 relative z-10 text-white">

        {/* Back Navigation */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => onNavigate('news')}
              className="inline-flex items-center gap-2 bg-neutral-800/60 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 hover:border-white/20 hover:bg-neutral-800/80 transition-all font-pixel text-xs tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO NEWS
            </button>
          </div>
        </div>

        {/* Article Container */}
        <div className="max-w-4xl mx-auto">

          {/* Header Section */}
          <div className="mb-12">
            {/* Category Badge & Date */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-foreground text-background text-[10px] px-3 py-1.5 rounded-full font-pixel tracking-wider">
                {article.category?.toUpperCase() || 'NEWS'}
              </div>
              <div className="text-white/60 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(article.date)}
              </div>
            </div>

            {/* Title */}
            <h1 className="font-serif italic text-5xl md:text-6xl mb-6">{article.title}</h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-white/70 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-white/60">
              {article.location && (
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[10px] tracking-wider">LOCATION:</span>
                  <span>{article.location}</span>
                </div>
              )}
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>{article.tags.length} topics</span>
                </div>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="mb-12">
              <div className="relative aspect-video bg-neutral-500/5 border border-neutral-500/20 rounded-3xl overflow-hidden">
                <ImageWithFallback
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* External Link */}
          {article.link && (
            <div className="mb-12">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-full px-6 py-3 hover:border-neutral-500/40 transition-colors font-pixel text-xs tracking-wider"
              >
                <span>VIEW EXTERNAL LINK</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">

            {/* Render dynamic content blocks */}
            {article.blocks && article.blocks.length > 0 ? (
              <div>
                {article.blocks.map((block, index) => renderBlock(block, index))}
              </div>
            ) : article.content ? (
              /* Fallback to plain content field if no blocks */
              <div className="text-white/80 leading-relaxed whitespace-pre-wrap mb-12">
                {article.content}
              </div>
            ) : (
              /* Show placeholder if no content */
              <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-8 md:p-12 mb-12">
                <h2 className="font-serif italic text-3xl text-white mb-4">Content Coming Soon</h2>
                <p className="text-white/60 leading-relaxed">
                  Detailed content for this news item will be added soon.
                </p>
              </div>
            )}

          </div>

          {/* Legacy Photo Gallery - Only show if old images field exists and no blocks */}
          {article.images && article.images.length > 0 && (!article.blocks || article.blocks.length === 0) && (
            <div className="mt-12">
              <h2 className="font-serif italic text-3xl mb-6">Photo Gallery</h2>

              <div className={`grid gap-4 ${article.images.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
                article.images.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                  article.images.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                    'grid-cols-2 md:grid-cols-3'
                }`}>
                {article.images.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-neutral-500/5 border border-neutral-500/20 rounded-2xl flex items-center justify-center hover:border-neutral-500/40 transition-colors cursor-pointer group relative overflow-hidden"
                  >
                    {img.url ? (
                      <ImageWithFallback
                        src={img.url}
                        alt={img.alt || img.caption || `Gallery image ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          )}

          {/* Tags & Topics */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-neutral-500/20">
              <h3 className="font-pixel text-xs tracking-[0.3em] text-white/60 mb-4 uppercase">
                Related Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-full hover:border-neutral-500/40 transition-colors cursor-pointer text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Horizontal Scrolling News Carousel */}
          {allNews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16 pt-8 relative"
            >
              {/* Divider Line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
              <div className="flex items-center justify-between mb-6">
                <div className="font-pixel text-xs text-white/60 tracking-[0.3em]">
                  EXPLORE NEWS
                </div>
                <button
                  onClick={() => onNavigate('news')}
                  className="text-white/50 hover:text-white/80 transition-colors font-pixel text-[10px] tracking-[0.2em]"
                >
                  VIEW ALL →
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                <div className="flex gap-4" style={{ width: 'max-content' }}>
                  {allNews.map((newsItem) => (
                    <button
                      key={newsItem.id}
                      onClick={() => onNavigate(`news/${newsItem.id}`)}
                      className={`group relative w-48 md:w-56 flex-shrink-0 aspect-[4/3] rounded-2xl overflow-hidden transition-all ${newsItem.id === article.id
                        ? 'border-2 border-purple-400'
                        : 'border border-white/10 hover:border-white/30'
                        }`}
                    >
                      {/* Image */}
                      {newsItem.coverImage ? (
                        <img
                          src={newsItem.coverImage}
                          alt={newsItem.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" />
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* Current indicator */}
                      {newsItem.id === article.id && (
                        <div className="absolute top-2 left-2 bg-purple-500 text-white text-[10px] font-pixel px-2 py-1 rounded-full">
                          CURRENT
                        </div>
                      )}

                      {/* Content */}
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <p className="font-display italic text-white text-sm line-clamp-2 text-left">
                          {newsItem.title}
                        </p>
                        <p className="text-white/50 text-xs text-left mt-1">
                          {new Date(newsItem.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div >
      </div >
    </>
  );
}
