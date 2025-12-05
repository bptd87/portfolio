import React, { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChevronDown, X, ZoomIn } from 'lucide-react';
import { GalleryBlock } from './GalleryBlock';

export type BlockType = 'paragraph' | 'heading' | 'image' | 'quote' | 'list' | 'code' | 'gallery' | 'spacer' | 'video' | 'accordion';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    level?: number; // for headings (1-6)
    alt?: string; // for images
    caption?: string; // for images
    listType?: 'bullet' | 'numbered'; // for lists
    language?: string; // for code blocks
    images?: Array<{ url: string; caption?: string }>; // for gallery
    galleryStyle?: 'grid' | 'carousel' | 'masonry' | 'fullwidth'; // gallery display style
    enableDownload?: boolean; // allow image downloads
    height?: string; // for spacer ('small' | 'medium' | 'large')
    videoType?: 'youtube' | 'vimeo' | 'custom'; // for video
    items?: any[]; // for list (legacy) and accordion
    ordered?: boolean; // legacy list ordered
  };
}

interface BlockRendererProps {
  blocks: ContentBlock[];
  enableDropCap?: boolean;
  accentColor?: string; // Category accent color (hex)
}

// Hook for fade-in animation on scroll
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Scroll reveal wrapper component
function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
    >
      {children}
    </div>
  );
}

export function BlockRenderer({ blocks, enableDropCap = true, accentColor }: BlockRendererProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string; alt?: string } | null>(null);

  // Default accent color if none provided
  const accent = accentColor || '#3B82F6';

  if (!blocks || blocks.length === 0) {
    return (
      <div className="opacity-60 text-center py-12">
        <p>No content available.</p>
      </div>
    );
  }

  const openLightbox = (url: string, caption?: string, alt?: string) => {
    setLightboxImage({ url, caption, alt });
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage(null);
    document.body.style.overflow = 'unset';
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVimeoId = (url: string) => {
    const regExp = /vimeo\.com\/([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Parse markdown-style formatting in text
  const parseFormattedText = (text: string) => {
    // Check if content contains HTML tags (from rich text editor)
    // Look for common HTML tags: <b>, <strong>, <i>, <em>, <a>, <p>, <div>, <span>, <br>, <u>
    const hasHTML = /<(b|strong|i|em|a|p|div|span|br|u|blockquote|pre|code|ul|ol|li)[\s>\/]/i.test(text);
    
    if (hasHTML) {
      return (
        <span 
          dangerouslySetInnerHTML={{ __html: text }}
          className="rich-content"
          style={{ '--accent-color': accent } as React.CSSProperties}
        />
      );
    }

    // Otherwise, parse markdown syntax
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    const combinedRegex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[(.+?)\]\((.+?)\))/g;
    let match;
    
    while ((match = combinedRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      if (match[1]) {
        parts.push(
          <span key={match.index} className="font-semibold" style={{ color: accent }}>
            {match[2]}
          </span>
        );
      } else if (match[3]) {
        parts.push(<em key={match.index}>{match[4]}</em>);
      } else if (match[5]) {
        parts.push(
          <a
            key={match.index}
            href={match[7]}
            className="hover:opacity-80 transition-opacity underline"
            style={{ color: accent }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {match[6]}
          </a>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      <div 
        className="prose-custom max-w-none"
        style={{ 
          '--accent-color': accent,
          '--drop-cap-color': accent,
          '--accent-default': '#3B82F6'
        } as React.CSSProperties}
      >
        {blocks.map((block, index) => {
          // Find first paragraph for drop cap
          const isFirstParagraph = enableDropCap && block.type === 'paragraph' &&
            blocks.findIndex(b => b.type === 'paragraph') === index;
          
          switch (block.type) {
            case 'paragraph':
              // Check for HTML tags anywhere in content
              const hasHTMLTags = /<(b|strong|i|em|a|p|div|span|br|u|blockquote|pre|code|ul|ol|li)[\s>\/]/i.test(block.content);
              const dropCapClass = isFirstParagraph ? 'drop-cap-paragraph' : '';
              
              if (hasHTMLTags) {
                return (
                  <div
                    key={block.id}
                    className={`leading-[1.8] mb-8 text-foreground/90 text-[19px] md:text-[21px] font-serif rich-content ${dropCapClass}`}
                    style={{ '--accent-color': accent } as React.CSSProperties}
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                );
              } else {
                return (
                  <p
                    key={block.id}
                    className={`leading-[1.8] mb-8 text-foreground/90 text-[19px] md:text-[21px] font-serif ${dropCapClass}`}
                    style={isFirstParagraph ? { '--drop-cap-color': accent } as React.CSSProperties : undefined}
                  >
                    {parseFormattedText(block.content)}
                  </p>
                );
              }

            case 'heading':
              const level = block.metadata?.level || 2;
              const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
              const headingStyles = 
                level === 1 ? 'text-5xl md:text-6xl font-display italic leading-[1.1] mt-20 mb-10' : 
                level === 2 ? 'text-4xl md:text-5xl font-display italic leading-[1.15] mt-16 mb-8' : 
                level === 3 ? 'text-2xl md:text-3xl font-sans tracking-tight leading-[1.2] mt-12 mb-6' : 
                'text-xl md:text-2xl font-sans tracking-tight leading-[1.25] mt-10 mb-5';
              
              return (
                <HeadingTag
                  key={block.id}
                  id={`heading-${block.id}`}
                  className={`${headingStyles} scroll-mt-24`}
                >
                  {block.content}
                </HeadingTag>
              );

            case 'image':
              return (
                <ScrollReveal key={block.id}>
                  <figure className="my-16 group">
                    <div className="relative overflow-hidden rounded-2xl cursor-pointer" onClick={() => openLightbox(block.content, block.metadata?.caption, block.metadata?.alt)}>
                      <ImageWithFallback
                        src={block.content}
                        alt={block.metadata?.alt || ''}
                        className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-white/10 rounded-full p-4">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    {block.metadata?.caption && (
                      <figcaption className="text-sm text-center mt-4 opacity-60 italic font-sans">
                        {block.metadata.caption}
                      </figcaption>
                    )}
                  </figure>
                </ScrollReveal>
              );

            case 'video':
              const videoType = block.metadata?.videoType || 'youtube';
              let videoSrc = '';
              
              if (videoType === 'youtube') {
                const id = getYouTubeId(block.content);
                if (id) videoSrc = `https://www.youtube.com/embed/${id}`;
              } else if (videoType === 'vimeo') {
                const id = getVimeoId(block.content);
                if (id) videoSrc = `https://player.vimeo.com/video/${id}`;
              }

              if (!videoSrc) return null;

              return (
                <div key={block.id} className="my-16 aspect-video bg-black rounded-2xl overflow-hidden">
                  <iframe 
                    src={videoSrc} 
                    className="w-full h-full" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                  />
                </div>
              );

            case 'quote':
              return (
                <blockquote
                  key={block.id}
                  className="my-12 mx-auto max-w-[90%] py-6 text-center"
                >
                  <p className="text-xl md:text-[1.35rem] leading-relaxed font-display italic text-foreground/65">{block.content}</p>
                </blockquote>
              );

            case 'list':
              const isOrdered = block.metadata?.listType === 'numbered' || block.metadata?.ordered;
              const ListTag = isOrdered ? 'ol' : 'ul';
              const listItems = block.metadata?.items 
                ? block.metadata.items 
                : block.content.split('\n').filter(item => item.trim());

              return (
                <ListTag
                  key={block.id}
                  className={`mb-10 pl-6 space-y-4 text-[19px] md:text-[21px] font-serif ${
                    isOrdered ? 'list-decimal' : 'list-disc'
                  } marker:text-accent-brand opacity-90`}
                >
                  {listItems.map((item, i) => (
                    <li key={i} className="leading-[1.8] pl-3">
                      {item}
                    </li>
                  ))}
                </ListTag>
              );

            case 'code':
              return (
                <div key={block.id} className="my-12 text-sm rounded-xl overflow-hidden shadow-lg">
                  <SyntaxHighlighter language={block.metadata?.language || 'text'} style={atomDark}>
                    {block.content}
                  </SyntaxHighlighter>
                </div>
              );
              
            case 'gallery':
              const images = block.metadata?.images || [];
              if (images.length === 0) return null;
              
              const galleryStyle = block.metadata?.galleryStyle || 'grid';
              const enableDownload = block.metadata?.enableDownload || false;

              return (
                <GalleryBlock
                  key={block.id}
                  images={images}
                  galleryStyle={galleryStyle}
                  enableDownload={enableDownload}
                />
              );

            case 'spacer':
              const height = block.metadata?.height || 'medium';
              const heightClass = 
                height === 'small' ? 'h-12' : 
                height === 'medium' ? 'h-24' : 
                'h-32';
              
              return <div key={block.id} className={heightClass} />;

            case 'accordion':
              return <AccordionBlock key={block.id} block={block} />;

            default:
              return null;
          }
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 transition-all z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt || ''}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
            />
            {lightboxImage.caption && (
              <p className="text-white text-center mt-6 text-lg italic opacity-80">
                {lightboxImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Accordion Item Component
function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 text-left flex items-center justify-between gap-4 hover:bg-foreground/5 transition-colors group"
      >
        <span className="text-xl font-sans pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-accent-brand transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-8 pb-6 text-lg font-serif leading-[1.8] opacity-90">
          {answer}
        </div>
      </div>
    </div>
  );
}

// Accordion Block Component
function AccordionBlock({ block }: { block: ContentBlock }) {
  const accordionItems = block.metadata?.items || [];
  
  if (accordionItems.length === 0) return null;

  return (
    <div className="my-16 border border-border rounded-2xl overflow-hidden bg-foreground/5">
      {accordionItems.map((item: any, index: number) => (
        <AccordionItem
          key={index}
          question={item.question || ''}
          answer={item.answer || ''}
          index={index}
        />
      ))}
    </div>
  );
}