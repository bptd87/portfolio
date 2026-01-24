import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2, Heart, Eye, MapPin, Calendar, ChevronDown, Briefcase } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { optimizeImageUrl } from '../../utils/performance';
import { YouTubeEmbed } from '../shared/YouTubeEmbed';
import { ParallaxImage } from '../shared/ParallaxImage';

interface ProjectModalProps {
    project: any;
    isOpen: boolean;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export function ProjectModal({ project, isOpen, onClose, onNext, onPrev }: ProjectModalProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const [galleryExpanded, setGalleryExpanded] = useState(true); // Open by default

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Lightbox Keyboard Navigation
    useEffect(() => {
        if (expandedIndex === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setExpandedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : mediaItems.length - 1));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setExpandedIndex(prev => (prev !== null && prev < mediaItems.length - 1 ? prev + 1 : 0));
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setExpandedIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [expandedIndex, mediaItems.length]);

    // Aggregate media with Strict Ordering and Deep Scanning
    useEffect(() => {
        if (!project) return;

        // Helper to safely parse JSON if it's a string
        const safeParse = (data: any) => {
            if (typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    return parsed;
                } catch (e) { return null; }
            }
            return data;
        };

        const galleriesRaw = safeParse(project.galleries);
        const processRaw = safeParse(project.process);
        const expContentRaw = safeParse(project.experientialContent || project.experiential_content);
        const contentRaw = safeParse(project.content);


        // Helper to extract URLs from nested structures
        const extractUrls = (items: any[]): string[] => {
            if (!Array.isArray(items)) return [];
            return items.flatMap(item => {
                if (!item) return null;
                if (typeof item === 'string') return item;

                // Handle objects with an 'images' array (Common in process/content blocks)
                if (item.images && Array.isArray(item.images)) {
                    return extractUrls(item.images);
                }

                // Handle singular image props
                if (item.url) return item.url;
                if (item.src) return item.src;
                if (item.image) return item.image;
                return null;
            }).filter(url => {
                // STRICT URL VALIDATION to prevent "stale" or garbage data
                if (!url || typeof url !== 'string') return false;
                // Must start with http, https, or / (relative)
                if (!url.match(/^(http|https|\/)/)) return false;
                // Filter out obviously non-image strings if possible (optional but helpful)
                // But be careful not to block valid URLs without extensions (though Supabase usually has them)
                return true;
            });
        };

        // Keys to ignore during generic scan (Stale/Backup data)
        const IGNORED_GALLERY_KEYS = ['old', 'backup', 'archive', 'temp', 'unused', 'deleted'];

        // Arrays for strict ordering
        const coverImages: string[] = [];
        const galleryImages: string[] = [];
        const videos: string[] = [];

        // 1. Cover / Card Image (Priority 1)
        if (project.coverImage) coverImages.push(project.coverImage);
        if (project.cover_image) coverImages.push(project.cover_image);
        if (project.cardImage) coverImages.push(project.cardImage);
        if (project.card_image) coverImages.push(project.card_image);

        // 2. Galleries (Priority 2)
        // GENERIC SCAN: Iterate over all keys in galleries object
        if (galleriesRaw && typeof galleriesRaw === 'object') {
            Object.keys(galleriesRaw).forEach(key => {
                // Skip blacklisted keys
                if (IGNORED_GALLERY_KEYS.some(bad => key.toLowerCase().includes(bad))) return;

                const value = galleriesRaw[key];

                if (key === 'additional' && Array.isArray(value)) {
                    value.forEach((g: any) => {
                        if (Array.isArray(g.images)) galleryImages.push(...extractUrls(g.images));
                    });
                    return;
                }

                if (Array.isArray(value)) {
                    galleryImages.push(...extractUrls(value));
                }
            });
        }

        // Process Block (LEGACY - Disabled to prevent ghost images)
        // if (Array.isArray(processRaw)) {
        //     galleryImages.push(...extractUrls(processRaw));
        // }

        // Generic 'images' array check
        const parsedImages = safeParse(project.images);
        if (Array.isArray(parsedImages)) {
            galleryImages.push(...extractUrls(parsedImages));
        }

        // Scan generic content blocks for images AND videos
        const scanBlocks = (blocks: any[]) => {
            if (!Array.isArray(blocks)) return;
            blocks.forEach((block: any) => {
                // Images
                if ((block.type === 'gallery' || !block.type) && Array.isArray(block.images)) {
                    galleryImages.push(...extractUrls(block.images));
                } else if (block.type === 'image' && block.url) {
                    const valid = extractUrls([block.url]); // Use validator
                    if (valid.length) galleryImages.push(valid[0]);
                }
                // Videos
                else if (block.type === 'video' && (block.url || block.videoUrl || block.src)) {
                    videos.push(block.url || block.videoUrl || block.src);
                }
            });
        };

        // LEGACY CONTENT SCANNERS - Re-enabled to find videos hidden in content blocks
        scanBlocks(expContentRaw);
        scanBlocks(contentRaw);

        // Production photos
        const parsedProdPhotos = safeParse(project.productionPhotos || project.production_photos);
        if (Array.isArray(parsedProdPhotos)) galleryImages.push(...extractUrls(parsedProdPhotos));

        // 3. Videos (Priority 3)
        const v1 = safeParse(project.videoUrls);
        const v2 = safeParse(project.video_urls);
        const v3 = safeParse(project.youtubeVideos || project.youtube_videos);

        if (Array.isArray(v1)) videos.push(...v1);
        if (Array.isArray(v2)) videos.push(...v2);
        if (Array.isArray(v3)) videos.push(...v3);

        // Dedupe within categories
        const uniqueCover = Array.from(new Set(coverImages.filter(url => url && url.length > 5)));
        const uniqueGallery = Array.from(new Set(galleryImages.filter(url => url && url.length > 5 && typeof url === 'string')));
        const uniqueVideos = Array.from(new Set(videos.filter(url => url && url.length > 5)));

        // Remove cover from gallery if present to avoid duplicate first slide
        const filteredGallery = uniqueGallery.filter(url => !uniqueCover.includes(url));

        // Final ordered aggregation - IMAGES FIRST, VIDEOS LAST
        const items = [
            ...uniqueCover.map(url => ({ type: 'image' as const, url, alt: project.title })),
            ...filteredGallery.map(url => ({ type: 'image' as const, url, alt: project.title })),
            ...uniqueVideos.map(url => ({ type: 'video' as const, url }))
        ];

        setMediaItems(items);
    }, [project]);

    if (!project) return null;

    const specs = [
        { label: 'Client', value: project.clientName || project.client || project.client_name },
        { label: 'Venue', value: project.venue },
        { label: 'Location', value: project.location },
        { label: 'Year', value: project.year },
        { label: 'Role', value: project.role },
    ].filter(s => s.value);

    const backgroundUrl = project.coverImage || project.cover_image || mediaItems[0]?.url;

    return createPortal(
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={project.id || 'project-modal'}
                    className="fixed inset-0 z-[99999] bg-black text-white font-sans overflow-hidden"
                    style={{ backgroundColor: '#000000' }}
                >
                    {/* Solid Black Background */}
                    <div className="fixed inset-0 z-0 bg-black" />



                    {/* 3. CENTERED SCROLLABLE CONTENT (The Stack) */}
                    <div className="absolute inset-0 z-20 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <div className="min-h-full w-full flex flex-col items-center py-24 px-6">
                            <div className="w-full max-w-4xl mx-auto space-y-6">

                                {/* Hero Title Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-8 md:p-12 shadow-none"
                                >
                                    <div className="font-pixel text-xs text-white/60 tracking-[0.3em] mb-4">
                                        {project.category?.toUpperCase()}
                                    </div>
                                    <h1 className="font-display text-white text-4xl md:text-5xl lg:text-6xl mb-6">
                                        {project.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-6 text-sm text-white/80">
                                        {(project.clientName || project.client || project.client_name) && (
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4" />
                                                <span>{project.clientName || project.client || project.client_name}</span>
                                            </div>
                                        )}
                                        {(project.venue || project.location) && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>
                                                    {project.venue}
                                                    {project.venue && project.location && <span className="mx-1 opacity-60">·</span>}
                                                    {project.location}
                                                </span>
                                            </div>
                                        )}
                                        {project.year && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{project.year}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Stats Card */}
                                {((project.likes || 0) > 0 || (project.views || 0) > 0) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                        className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 shadow-none"
                                    >
                                        <div className="flex items-center gap-6">
                                            {project.likes !== undefined && (
                                                <div className="flex items-center gap-2 text-white/60">
                                                    <Heart className="w-5 h-5" />
                                                    <span className="text-sm">{project.likes.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {project.views !== undefined && (
                                                <div className="flex items-center gap-2 text-white/60">
                                                    <Eye className="w-5 h-5" />
                                                    <span className="text-sm">{project.views.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Description - Collapsible */}
                                {(project.description || project.projectOverview) && (() => {
                                    const fullText = project.projectOverview || project.description || '';
                                    const paragraphs = fullText.split('\n').filter((p: string) => p.trim());
                                    const firstParagraph = paragraphs[0] || '';
                                    const hasMore = paragraphs.length > 1;

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 40 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.15 }}
                                        >
                                            <button
                                                onClick={() => hasMore && setDescriptionExpanded(!descriptionExpanded)}
                                                className="w-full backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 text-left hover:bg-neutral-800/80 transition-all shadow-none"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="font-pixel text-xs text-white/60 tracking-[0.3em]">
                                                        PROJECT OVERVIEW
                                                    </div>
                                                    {hasMore && (
                                                        <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`} />
                                                    )}
                                                </div>
                                                {!descriptionExpanded && (
                                                    <div className="text-white/80 leading-relaxed">
                                                        <p className="line-clamp-2">{firstParagraph}</p>
                                                    </div>
                                                )}
                                            </button>
                                            <AnimatePresence>
                                                {descriptionExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 mt-2 shadow-none"
                                                    >
                                                        <div className="space-y-4 text-white/80 leading-relaxed">
                                                            {paragraphs.map((paragraph: string, i: number) => (
                                                                <p key={i}>{paragraph}</p>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })()}



                                {/* Design Notes Section - Collapsible */}
                                {project.designNotes && project.designNotes.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.25 }}
                                        className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 shadow-none"
                                    >
                                        <h2 className="font-pixel text-[10px] text-white/50 mb-4 uppercase tracking-[0.25em]">Design Notes</h2>
                                        <div className="space-y-4 text-white/80 leading-relaxed">
                                            {project.designNotes.map((note: string, index: number) => (
                                                <p key={index}>{note}</p>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Gallery Section - Collapsible, Single Column, Images First then Videos */}
                                {(mediaItems.filter(i => i.type === 'image').length > 0 || mediaItems.filter(i => i.type === 'video').length > 0) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.3 }}
                                    >
                                        <button
                                            onClick={() => setGalleryExpanded(!galleryExpanded)}
                                            className="w-full backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 text-left hover:bg-neutral-800/80 transition-all shadow-none"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h2 className="font-pixel text-[10px] text-white/50 uppercase tracking-[0.25em]">
                                                    GALLERY ({mediaItems.length})
                                                </h2>
                                                <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${galleryExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                            {!galleryExpanded && mediaItems.length > 0 && (
                                                <div className="mt-4 grid grid-cols-3 gap-2">
                                                    {mediaItems.slice(0, 3).map((item, index) => (
                                                        item.type === 'image' ? (
                                                            <div key={index} className="aspect-square overflow-hidden rounded-lg">
                                                                <ImageWithFallback
                                                                    src={optimizeImageUrl(item.url!, 400)}
                                                                    alt="Preview"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div key={index} className="aspect-square overflow-hidden rounded-lg bg-black/50 flex items-center justify-center">
                                                                <div className="text-white/40 text-xs">VIDEO</div>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                        <AnimatePresence>
                                            {galleryExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-2 space-y-2"
                                                >
                                                    {mediaItems.map((item, idx) => (
                                                        item.type === 'image' ? (
                                                            <motion.button
                                                                key={`img-${idx}`}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                type="button"
                                                                aria-label={`View full screen image ${idx + 1}`}
                                                                className="group relative bg-white/5 rounded-xl overflow-hidden cursor-zoom-in w-full block backdrop-blur-xl bg-neutral-900/60 border border-white/10"
                                                                onClick={() => setExpandedIndex(idx)}
                                                            >
                                                                <div className="w-full h-auto">
                                                                    <ImageWithFallback
                                                                        src={item.url!}
                                                                        alt={item.alt || ''}
                                                                        className="w-full h-auto object-cover"
                                                                        priority={idx < 2}
                                                                    />
                                                                </div>
                                                            </motion.button>
                                                        ) : (
                                                            <motion.div
                                                                key={`vid-${idx}`}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 overflow-hidden p-2"
                                                            >
                                                                <div className="aspect-video rounded-xl overflow-hidden">
                                                                    <YouTubeEmbed url={item.url!} title={project.title} autoplay={false} />
                                                                </div>
                                                            </motion.div>
                                                        )
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}

                                {/* Bottom Spacer */}
                                <div className="h-20" />

                            </div>
                        </div>
                    </div>

                    {/* 2. CLOSE & NAV BUTTONS (Floating Fixed - REORDERED TO BE ON TOP) */}
                    <div className="absolute inset-0 pointer-events-none z-[100]">
                        {/* Close - Top Right */}
                        <div className="absolute top-6 right-6 pointer-events-auto">
                            <button
                                onClick={onClose}
                                aria-label="Close modal"
                                className="w-12 h-12 bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 group shadow-lg"
                            >
                                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Navigation Arrows */}
                        {onPrev && (
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-auto hidden md:block">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                                    className="w-12 h-12 bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 group shadow-lg"
                                    title="Previous Project"
                                >
                                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        )}
                        {onNext && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-auto hidden md:block">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                                    className="w-12 h-12 bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 group shadow-lg"
                                    title="Next Project"
                                >
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* LIGHTBOX OVERLAY - Uses ExpandedIndex for Fullscreen */}
                    {expandedIndex !== null && mediaItems[expandedIndex] && typeof document !== 'undefined' && createPortal(
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="lightbox-portal"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[9999] bg-black flex items-center justify-center cursor-zoom-out"
                                onClick={() => setExpandedIndex(null)}
                            >
                                {/* LEFT ARROW */}
                                <button
                                    className="absolute left-0 top-0 bottom-0 w-24 md:w-32 flex items-center justify-center text-white/20 hover:text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent outline-none group"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : mediaItems.length - 1));
                                    }}
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-12 h-12 md:w-16 md:h-16 stroke-[0.5] group-hover:scale-110 transition-transform" />
                                </button>

                                {/* RIGHT ARROW */}
                                <button
                                    className="absolute right-0 top-0 bottom-0 w-24 md:w-32 flex items-center justify-center text-white/20 hover:text-white transition-all duration-300 hover:bg-gradient-to-l hover:from-white/5 hover:to-transparent outline-none group"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedIndex(prev => (prev !== null && prev < mediaItems.length - 1 ? prev + 1 : 0));
                                    }}
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-12 h-12 md:w-16 md:h-16 stroke-[0.5] group-hover:scale-110 transition-transform" />
                                </button>

                                {/* CLOSE BUTTON */}
                                <button
                                    className="absolute top-6 right-6 md:top-10 md:right-10 p-4 text-white/40 hover:text-white transition-colors hover:rotate-90 duration-300 z-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedIndex(null);
                                    }}
                                    aria-label="Close gallery"
                                >
                                    <X className="w-8 h-8 md:w-10 md:h-10 stroke-[1]" />
                                </button>

                                {/* IMAGE */}
                                <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 pointer-events-none">
                                    <motion.img
                                        key={mediaItems[expandedIndex].url}
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.95, opacity: 0 }}
                                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                        src={optimizeImageUrl(mediaItems[expandedIndex].url, 1600)}
                                        alt="Expanded view"
                                        className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] select-none"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                {/* BOTTOM COUNTER */}
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 font-pixel text-[10px] tracking-[0.3em]">
                                    {String(expandedIndex + 1).padStart(2, '0')} / {String(mediaItems.length).padStart(2, '0')}
                                </div>
                            </motion.div>
                        </AnimatePresence>,
                        document.body
                    )}

                </motion.div>
            )
            }
        </AnimatePresence >,
        document.body
    );
}
