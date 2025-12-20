import React from 'react';
import { ContentBlock } from './WYSIWYGEditor';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ArticlePreviewProps {
  blocks: ContentBlock[];
}

export function ArticlePreview({ blocks }: ArticlePreviewProps) {
  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
        return (
          <div
            key={block.id}
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );

      case 'image':
        const imageAlign = block.metadata?.align || 'full';
        const imageSize = block.metadata?.size || 'full';
        const alignClass = imageAlign === 'center' ? 'mx-auto' : imageAlign === 'right' ? 'ml-auto' : imageAlign === 'left' ? 'mr-auto' : '';
        const sizeClass = 
          imageSize === 'small' ? 'max-w-sm' :
          imageSize === 'medium' ? 'max-w-md' :
          imageSize === 'large' ? 'max-w-2xl' :
          'max-w-full';
        
        return (
          <figure key={block.id} className={`my-8 ${alignClass}`}>
            <img
              src={block.content}
              alt={block.metadata?.alt || ''}
              className={`rounded-lg ${sizeClass} w-full h-auto`}
            />
            {block.metadata?.caption && (
              <figcaption className="mt-2 text-sm text-gray-400 text-center italic">
                {block.metadata.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'quote':
        return (
          <blockquote key={block.id} className="my-6 pl-6 border-l-4 border-accent-brand italic text-gray-300">
            {block.content}
          </blockquote>
        );

      case 'list':
        const items = block.content.split('\n').filter(item => item.trim());
        const ListTag = block.metadata?.listType === 'number' ? 'ol' : 'ul';
        return (
          <ListTag key={block.id} className={`my-6 space-y-2 ${block.metadata?.listType === 'number' ? 'list-decimal' : 'list-disc'} list-inside`}>
            {items.map((item, idx) => (
              <li key={idx} className="text-gray-200">{item}</li>
            ))}
          </ListTag>
        );

      case 'code':
        return (
          <div key={block.id} className="my-6">
            {block.metadata?.language && (
              <div className="bg-secondary/30 px-4 py-2 text-xs text-gray-400 rounded-t-lg border-b border-border">
                {block.metadata.language}
              </div>
            )}
            <pre className={`bg-secondary/20 p-4 ${!block.metadata?.language ? 'rounded-lg' : 'rounded-b-lg'} overflow-x-auto`}>
              <code className="text-sm font-mono text-gray-200">{block.content}</code>
            </pre>
          </div>
        );

      case 'gallery':
        const galleryStyle = block.metadata?.galleryStyle || 'grid';
        const images = block.metadata?.images || [];
        
        return (
          <div key={block.id} className="my-8">
            {galleryStyle === 'grid' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img.url} alt={img.caption || ''} className="w-full h-48 object-cover rounded-lg" />
                    {img.caption && (
                      <p className="mt-2 text-xs text-gray-400">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {galleryStyle === 'carousel' && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {images.map((img, idx) => (
                  <div key={idx} className="flex-shrink-0 w-80">
                    <img src={img.url} alt={img.caption || ''} className="w-full h-64 object-cover rounded-lg" />
                    {img.caption && (
                      <p className="mt-2 text-sm text-gray-400">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {galleryStyle === 'masonry' && (
              <div className="columns-2 md:columns-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="mb-4 break-inside-avoid">
                    <img src={img.url} alt={img.caption || ''} className="w-full rounded-lg" />
                    {img.caption && (
                      <p className="mt-2 text-xs text-gray-400">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'video':
        const videoUrl = block.content;
        let embedUrl = '';
        
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
          if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes('vimeo.com')) {
          const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
          if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }

        return (
          <div key={block.id} className="my-8 aspect-video">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full rounded-lg"
                allowFullScreen
                title={block.metadata?.title || 'Embedded video'}
              />
            ) : (
              <video src={videoUrl} controls className="w-full h-full rounded-lg" />
            )}
          </div>
        );

      case 'divider':
        return <hr key={block.id} className="my-8 border-border" />;

      case 'spacer':
        const height = block.metadata?.height || 'medium';
        const heightClass = height === 'small' ? 'h-8' : height === 'large' ? 'h-24' : 'h-16';
        return <div key={block.id} className={heightClass} />;

      case 'file':
        return (
          <a
            key={block.id}
            href={block.content}
            download
            className="my-6 flex items-center gap-3 p-4 bg-secondary/20 border border-border rounded-lg hover:border-accent-brand transition-colors"
          >
            <div className="w-10 h-10 bg-accent-brand/20 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-accent-brand">FILE</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">{block.metadata?.fileName || 'Download File'}</p>
              {block.metadata?.fileSize && (
                <p className="text-xs text-gray-400">{block.metadata.fileSize}</p>
              )}
            </div>
          </a>
        );

      case 'accordion':
        const accordionItems = block.metadata?.accordionItems || [];
        return (
          <div key={block.id} className="my-6 space-y-2">
            {accordionItems.map((item: any, idx: number) => (
              <details key={idx} className="group bg-secondary/20 border border-border rounded-lg overflow-hidden">
                <summary className="cursor-pointer p-4 font-medium text-white hover:bg-secondary/30 transition-colors">
                  {item.title || item.question}
                </summary>
                <div className="p-4 pt-0 text-gray-300">
                  {item.content || item.answer}
                </div>
              </details>
            ))}
          </div>
        );

      case 'callout':
        const calloutType = block.metadata?.calloutType || 'info';
        const calloutStyles = {
          info: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400', icon: Info },
          warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: AlertTriangle },
          success: { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400', icon: CheckCircle },
          error: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400', icon: XCircle },
        };
        const style = calloutStyles[calloutType];
        const Icon = style.icon;

        return (
          <div key={block.id} className={`my-6 p-4 ${style.bg} border-l-4 ${style.border} rounded-r-lg`}>
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${style.text} flex-shrink-0 mt-0.5`} />
              <div className={`flex-1 ${style.text}`}>
                {block.content}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-card border border-border rounded-xl">
      <div className="mb-6 pb-6 border-b border-border">
        <h1 className="text-3xl font-bold text-accent-brand mb-2">Article Preview</h1>
        <p className="text-sm text-gray-400">This is how your article will appear to readers</p>
      </div>
      
      {blocks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No content yet. Switch to Edit mode to start creating your article.</p>
        </div>
      ) : (
        <article className="prose prose-invert prose-lg max-w-none">
          {blocks.map(renderBlock)}
        </article>
      )}
    </div>
  );
}
