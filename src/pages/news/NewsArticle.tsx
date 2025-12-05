import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Calendar, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface NewsBlock {
  type: 'text' | 'gallery' | 'team' | 'details' | 'quote' | 'link';
  content?: string;
  images?: { url: string; caption?: string }[];
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
  images?: { url: string; caption?: string }[];
}

interface NewsArticleProps {
  newsId: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function NewsArticle({ newsId, onNavigate }: NewsArticleProps) {
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/news/${newsId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Extract the newsItem from the response
          const newsItem = data.newsItem || data;
          
          setArticle(newsItem);
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
            <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {block.content}
            </div>
          </div>
        );

      case 'gallery':
        if (!block.images || block.images.length === 0) return null;
        return (
          <div key={index} className="mb-12 not-prose">
            <div className={`grid gap-4 ${
              block.images.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
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
                      alt={img.caption || `Image ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-xs opacity-20">Image {i + 1}</span>
                  )}
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md text-foreground text-xs p-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <h3 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 mb-4 uppercase">
                {block.title || 'Team'}
              </h3>
              <div className="space-y-3 text-sm">
                {block.members.map((member, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-foreground/60 min-w-[120px]">{member.role}:</span>
                    <span className="text-foreground">{member.name}</span>
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
              <h3 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 mb-4 uppercase">
                {block.title || 'Details'}
              </h3>
              <div className="space-y-3 text-sm">
                {block.items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-foreground/60 min-w-[120px]">{item.label}:</span>
                    <span className="text-foreground">{item.value}</span>
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
              <p className="font-serif italic text-xl text-foreground/80 mb-3">
                "{block.text}"
              </p>
              {(block.author || block.source) && (
                <p className="text-sm text-foreground/60">
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
              className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors font-pixel text-xs tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO NEWS
            </button>
          </div>
        </div>
      </div>
    );
  }

  const date = new Date(article.date);
  const year = date.getFullYear();
  const month = date.toLocaleDateString('en-US', { month: 'short' });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12">
      
      {/* Back Navigation - Sticky */}
      <div className="sticky top-20 z-30 mb-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('news')}
            className="inline-flex items-center gap-2 bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-full px-6 py-3 hover:border-neutral-500/40 hover:bg-neutral-500/20 transition-all font-pixel text-xs tracking-wider"
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
            <div className="text-foreground/60 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(article.date)}
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif italic text-5xl md:text-6xl mb-6">{article.title}</h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-foreground/70 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-foreground/60">
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
            <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap mb-12">
              {article.content}
            </div>
          ) : (
            /* Show placeholder if no content */
            <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-8 md:p-12 mb-12">
              <h2 className="font-serif italic text-3xl text-foreground mb-4">Content Coming Soon</h2>
              <p className="text-foreground/60 leading-relaxed">
                Detailed content for this news item will be added soon.
              </p>
            </div>
          )}
          
        </div>

        {/* Legacy Photo Gallery - Only show if old images field exists and no blocks */}
        {article.images && article.images.length > 0 && (!article.blocks || article.blocks.length === 0) && (
          <div className="mt-12">
            <h2 className="font-serif italic text-3xl mb-6">Photo Gallery</h2>
            
            <div className={`grid gap-4 ${
              article.images.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
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
                      alt={img.caption || `Gallery image ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-xs opacity-20">Image {i + 1}</span>
                  )}
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md text-foreground text-xs p-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <h3 className="font-pixel text-xs tracking-[0.3em] text-foreground/60 mb-4 uppercase">
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

        {/* Navigation Footer */}
        <div className="mt-16 pt-8 border-t border-neutral-500/20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('news')}
              className="inline-flex items-center gap-2 hover:text-foreground/70 transition-colors font-pixel text-xs tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO NEWS
            </button>

            <button
              onClick={() => onNavigate('news')}
              className="inline-flex items-center gap-2 hover:text-foreground/70 transition-colors font-pixel text-xs tracking-wider"
            >
              VIEW ALL NEWS
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}