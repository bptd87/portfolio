import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { ImageWithFallback } from '../figma/ImageWithFallback';

// Re-using the Block types from the admin editor to ensure compatibility
export interface ContentBlock {
    id?: string;
    type: 'text' | 'paragraph' | 'heading' | 'image' | 'gallery' | 'video' | 'list' | 'quote' | 'callout' | 'code' | 'divider' | 'spacer' | 'accordion' | 'file';
    content?: string;
    src?: string; // Legacy image
    caption?: string; // Legacy caption
    images?: string[]; // Legacy gallery
    captions?: string[]; // Legacy gallery
    layout?: 'grid' | 'masonry' | 'carousel';
    metadata?: any;
}

interface ContentRendererProps {
    blocks: ContentBlock[];
    className?: string;
}

export function ContentRenderer({ blocks, className = '' }: ContentRendererProps) {
    // State for image lightbox
    const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption?: string; index: number; context: string[] } | null>(null);

    if (!blocks || !Array.isArray(blocks)) return null;

    return (
        <>
            <div className={`space-y-12 ${className}`}>
                {blocks.map((block, index) => (
                    <BlockItem
                        key={block.id || index}
                        block={block}
                        index={index}
                        onImageClick={(url, caption, idx, context) => setSelectedPhoto({ url, caption, index: idx, context })}
                    />
                ))}
            </div>

            {/* Lightbox Dialog */}
            {selectedPhoto && (
                <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
                    <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-white/10 backdrop-blur-xl">
                        <DialogTitle className="sr-only">Image Viewer</DialogTitle>
                        <DialogDescription className="sr-only">Full size image view</DialogDescription>
                        <div className="relative w-full h-[95vh] flex items-center justify-center">
                            <ImageWithFallback
                                src={selectedPhoto.url}
                                alt={selectedPhoto.caption || "Full size view"}
                                className="max-w-full max-h-full object-contain"
                            />
                            {selectedPhoto.caption && (
                                <div className="absolute bottom-6 left-0 right-0 text-center">
                                    <p className="inline-block bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm font-display italic">
                                        {selectedPhoto.caption}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all z-50"
                                aria-label="Close lightbox"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Navigation if context has multiple images */}
                            {selectedPhoto.context.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const currentIndex = selectedPhoto.context.indexOf(selectedPhoto.url);
                                            const prevIndex = (currentIndex - 1 + selectedPhoto.context.length) % selectedPhoto.context.length;
                                            setSelectedPhoto({ ...selectedPhoto, url: selectedPhoto.context[prevIndex], index: prevIndex });
                                        }}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all z-50"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const currentIndex = selectedPhoto.context.indexOf(selectedPhoto.url);
                                            const nextIndex = (currentIndex + 1) % selectedPhoto.context.length;
                                            setSelectedPhoto({ ...selectedPhoto, url: selectedPhoto.context[nextIndex], index: nextIndex });
                                        }}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all z-50"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

// Individual Block Components

function BlockItem({ block, index: _, onImageClick }: { block: ContentBlock; index: number; onImageClick: (url: string, caption: string | undefined, idx: number, context: string[]) => void }) {

    // HTML Content Renderer (for paragraph, heading, etc. from TipTap)
    const renderHTML = (html: string, className: string = "") => {
        return <div
            className={`text-left leading-relaxed ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />;
    };

    switch (block.type) {
        // --- Legacy Blocks ---
        case 'text':
            return (
                <div className="mb-12">
                    {(block.content || '').split('\n\n').map((paragraph, i) => (
                        <p
                            key={i}
                            className="text-neutral-400 leading-relaxed mb-6 font-sans text-left"
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>
            );

        // --- New Rich Text Blocks ---
        case 'heading':
            // Handle HTML content or plain text content
            const level = block.metadata?.level || 2;
            const Tag = `h${level}` as React.ElementType;
            const headingContent = block.content || '';
            // If it looks like HTML, render as HTML, else render as text
            const isHTML = /<[a-z][\s\S]*>/i.test(headingContent);

            return (
                <div className="mt-16 mb-8 text-center">
                    {isHTML ? (
                        <div className="font-pixel text-xs tracking-[0.3em] text-white/40 uppercase [&_*]:m-0" dangerouslySetInnerHTML={{ __html: headingContent }} />
                    ) : (
                        <Tag className="font-pixel text-xs tracking-[0.3em] text-white/40 uppercase">
                            {headingContent}
                        </Tag>
                    )}
                </div>
            );

        case 'paragraph':
            return renderHTML(block.content || '', "mb-8 text-neutral-400 font-light leading-relaxed");

        case 'image':
            const imageUrl = block.src || block.content; // 'src' is legacy, 'content' is new BlockEditor standard
            const caption = block.caption || block.metadata?.caption;
            const align = block.metadata?.align || 'center';
            const size = block.metadata?.size || 'full';

            // Tailwind classes for alignment and size
            let containerClass = "mb-16 rounded-3xl overflow-hidden border border-white/10";
            if (align === 'left') containerClass += " float-left mr-8 max-w-[50%]";
            else if (align === 'right') containerClass += " float-right ml-8 max-w-[50%]";
            else containerClass += " w-full"; // 'center' or 'full'

            if (size === 'small') containerClass += " max-w-sm mx-auto";
            else if (size === 'medium') containerClass += " max-w-2xl mx-auto";

            if (!imageUrl) return null;

            return (
                <div className={containerClass}>
                    <ImageWithFallback
                        src={imageUrl}
                        alt={block.metadata?.alt || caption || ''}
                        className="w-full h-auto cursor-pointer transition-transform duration-700 hover:scale-[1.02]"
                        onClick={() => onImageClick(imageUrl, caption, 0, [imageUrl])}
                    />
                    {caption && (
                        <p className="text-sm text-neutral-500 mt-4 text-center font-display italic px-4 pb-4">{caption}</p>
                    )}
                </div>
            );

        case 'gallery':
            const images = block.images || block.metadata?.images || [];
            // Legacy captions or new metadata structure? Assuming simplified array for now based on BlockEditor
            const captions = block.captions || []; // Legacy might have separate captions array
            const layout = block.layout || block.metadata?.galleryStyle || 'grid';

            if (!images.length) return null;

            if (layout === 'carousel') {
                // Simple horizontal scroll for carousel
                return (
                    <div className="mb-16 overflow-x-auto pb-6 flex gap-4 snap-x">
                        {images.map((img: string, i: number) => (
                            <div key={i} className="flex-none w-[80vw] md:w-[40vw] snap-center rounded-2xl overflow-hidden border border-white/10 relative group">
                                <ImageWithFallback
                                    src={img}
                                    alt=""
                                    className="w-full h-[300px] md:h-[400px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => onImageClick(img, captions[i], i, images)}
                                />
                                {captions[i] && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-center">
                                        <span className="text-xs text-white/80 font-display italic">{captions[i]}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            }

            return (
                <div className={`grid ${layout === 'masonry' ? 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'} mb-16`}>
                    {images.map((image: string, imgIndex: number) => (
                        <div
                            key={imgIndex}
                            className={`cursor-pointer rounded-3xl overflow-hidden border border-white/10 group break-inside-avoid ${layout === 'masonry' ? 'mb-6' : ''}`}
                            onClick={() => onImageClick(image, captions[imgIndex], imgIndex, images)}
                        >
                            <div className="overflow-hidden">
                                <ImageWithFallback
                                    src={image}
                                    alt={captions[imgIndex] || ''}
                                    className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            {captions[imgIndex] && (
                                <p className="p-4 text-sm text-neutral-500 font-display italic bg-neutral-900/50">{captions[imgIndex]}</p>
                            )}
                        </div>
                    ))}
                </div>
            );

        case 'quote':
            return (
                <div className="my-16 border-l-2 border-accent-brand/50 pl-8 md:pl-12 py-4">
                    <blockquote className="text-2xl md:text-3xl text-white font-display italic leading-tight">
                        {block.content}
                    </blockquote>
                    {block.metadata?.author && (
                        <div className="mt-4 text-neutral-500 font-pixel text-xs tracking-wider uppercase">
                            — {block.metadata.author}
                        </div>
                    )}
                </div>
            );

        case 'list':
            return renderHTML(block.content || '', "mb-8 text-neutral-400 font-light [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:pl-5 [&>ol]:pl-5");

        case 'callout':
            const calloutType = block.metadata?.calloutType || 'info';
            const colors = {
                info: 'bg-blue-500/10 border-blue-500/20 text-blue-200',
                warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200',
                success: 'bg-green-500/10 border-green-500/20 text-green-200',
                error: 'bg-red-500/10 border-red-500/20 text-red-200',
            };
            return (
                <div className={`p-6 rounded-2xl border mb-8 ${colors[calloutType as keyof typeof colors]}`}>
                    {renderHTML(block.content || '')}
                </div>
            );

        case 'video':
            // Basic responsive video embed
            // content expects YouTube/Vimeo URL
            const getEmbedUrl = (url: string) => {
                if (!url) return '';
                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    const id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
                    return `https://www.youtube.com/embed/${id}`;
                }
                // Add vimeo or others if needed
                return url;
            };

            const embedUrl = getEmbedUrl(block.content || '');

            if (!embedUrl) return null;

            return (
                <div className="aspect-video w-full rounded-3xl overflow-hidden border border-white/10 mb-16">
                    <iframe
                        src={embedUrl}
                        title="Embedded content"
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                </div>
            );

        case 'divider':
            return <div className="h-px bg-white/10 my-16 w-full" />;

        case 'spacer': {
            const height = block.metadata?.height === 'large' ? 'h-32' : block.metadata?.height === 'small' ? 'h-8' : 'h-16';
            return <div className={height} />;
        }

        case 'accordion':
            return <AccordionBlock items={block.metadata?.items || []} />;

        case 'code':
            return (
                <div className="mb-12 rounded-lg overflow-hidden border border-white/10 bg-[#0d1117]">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                        <span className="text-xs text-neutral-400 font-mono">{block.metadata?.language || 'Code'}</span>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                        </div>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <pre className="text-sm font-mono text-neutral-300">
                            <code>{block.content}</code>
                        </pre>
                    </div>
                </div>
            );

        default:
            // Fallback for unknown blocks or unhandled types
            return null;
    }
}

// Helper Sub-component for Accordion
function AccordionBlock({ items }: { items: { question: string; answer: string }[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-4 mb-16">
            {items.map((item, i) => (
                <div key={i} className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm">
                    <button
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                    >
                        <span className="text-lg text-white font-medium">{item.question}</span>
                        {openIndex === i ? <ChevronUp className="w-5 h-5 text-white/60" /> : <ChevronDown className="w-5 h-5 text-white/60" />}
                    </button>
                    <AnimatePresence>
                        {openIndex === i && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 pt-0 text-neutral-400 font-light leading-relaxed">
                                    {item.answer}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    )
}
