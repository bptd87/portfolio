
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue, useAnimationFrame } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SkeletonPortfolio } from '../components/skeletons/SkeletonPortfolio';
import { SEO } from '../components/SEO';
import { ProjectModal } from '../components/portfolio/ProjectModal';
import { PortfolioNavigation } from '../components/shared/PortfolioNavigation';

interface AgencyCategoryPageProps {
    categorySlug: string;
    title: string;
    subtitle: string;
    description: string; // The "Headline" quote
    seoDescription?: string; // Meta description for SEO
    detailedContent?: React.ReactNode | string; // Long-form body copy
    heroImage?: string; // Optional static hero, or fallback
    initialProjectSlug?: string | null;
    onNavigate: (page: string, slug?: string) => void;
}

export function AgencyCategoryPage({
    categorySlug,
    title,
    subtitle,
    description,
    seoDescription,
    detailedContent,
    heroImage,
    initialProjectSlug,
    onNavigate
}: AgencyCategoryPageProps) {
    const [hasScrollTarget, setHasScrollTarget] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const railRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            setHasScrollTarget(true);
        }
    }, []);

    const { scrollYProgress } = useScroll({
        target: hasScrollTarget ? containerRef : undefined,
        offset: ["start start", "end start"]
    });
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);

    // Cache helper
    const cacheKey = (slug: string) => `project-cache-${slug}`;
    const cacheProjectData = (projectData: any) => {
        if (!projectData) return;
        const slug = projectData.slug || projectData.id;
        if (!slug) return;
        sessionStorage.setItem(cacheKey(slug), JSON.stringify({ ...projectData, slug }));
    };

    const prefetchProject = (project: any) => {
        const slug = project?.slug || project?.id;
        if (!slug) return;
        if (sessionStorage.getItem(cacheKey(slug))) return;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${slug}`,
            {
                headers: {
                    Authorization: `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
            }
        )
            .then((res) => {
                if (!res.ok) throw new Error('prefetch failed');
                return res.json();
            })
            .then((data) => {
                if (data?.success && data.project) {
                    cacheProjectData(data.project);
                }
            })
            .catch(() => { })
            .finally(() => clearTimeout(timeout));
    };

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const supabase = createClient();

                const { data, error } = await supabase
                    .from('portfolio_projects')
                    .select('*')
                    .eq('published', true)
                    .order('year', { ascending: false });

                if (error) throw error;

                if (data) {
                    // Process projects
                    const mappedProjects = data.map(p => ({
                        ...p,
                        cardImage: p.card_image,
                        coverImage: p.cover_image,
                        subcategory: p.subcategory,
                        // Simple tag mapping for display
                        tags: Array.isArray(p.tags) ? p.tags : [],
                        focusPoint: p.focus_point || { x: 50, y: 50 }
                    })).sort((a: any, b: any) => {
                        const yearA = Number(a.year) || 0;
                        const yearB = Number(b.year) || 0;
                        if (yearA !== yearB) return yearB - yearA;
                        const monthA = Number(a.month) || 0;
                        const monthB = Number(b.month) || 0;
                        return monthB - monthA;
                    });

                    setProjects(mappedProjects);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [categorySlug]);

    const filteredProjects = useMemo(() => {
        // Filter specifically for the requested category slug
        // We map slugs to probable DB Category Names
        // Experiential Design -> experiential-design
        // Rendering -> rendering, rendering-visualization
        // Scenic Models -> scenic-models (Subcategory or Category)

        return projects.filter(p => {
            // Normalize string helpers
            const cat = (p.category || '').toLowerCase();
            const sub = (p.subcategory || '').toLowerCase();
            const slug = categorySlug.toLowerCase();

            if (slug === 'experiential-design') {
                return cat.includes('experiential');
            }
            if (slug === 'rendering') {
                return cat.includes('rendering') || cat.includes('visualization');
            }
            if (slug === 'scenic-models') {
                return sub.includes('model') || cat.includes('model'); // Capture Scenic Models
            }
            return false;
        });
    }, [projects, categorySlug]);

    // Handle Deep Linking / Initial Slug
    useEffect(() => {
        if (initialProjectSlug && filteredProjects.length > 0 && !selectedProject) {
            const match = filteredProjects.find(p => p.slug === initialProjectSlug || p.id === initialProjectSlug);
            if (match) {
                handleProjectInteraction(match);
                // Clear slug from URL state if needed, or keep it. 
                // Keeping it is better for refreshing, but closing modal should clear it.
            }
        }
    }, [initialProjectSlug, filteredProjects]);

    // Scroll-driven perspective effect
    useEffect(() => {
        const section = containerRef.current;
        const rail = railRef.current;
        if (!section || !rail) return;

        const cards = Array.from(rail.querySelectorAll("[data-card]")) as HTMLElement[];

        const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

        const getTravel = () => {
            const railWidth = rail.scrollWidth;
            const stageWidth = rail.parentElement?.getBoundingClientRect().width || 0;
            return Math.max(0, railWidth - stageWidth);
        };

        const update = () => {
            const rect = section.getBoundingClientRect();
            const vh = window.innerHeight;

            const start = rect.top;
            const end = rect.bottom - vh;
            const t = clamp((0 - start) / (end - start), 0, 1);

            const travel = getTravel();
            const x = -travel * t;
            rail.style.transform = `translate3d(${x}px,0,0)`;

            const stageRect = rail.parentElement?.getBoundingClientRect();
            if (!stageRect) return;

            const centerX = stageRect.left + stageRect.width / 2;

            const maxRot = 18;
            const maxZ = 120;

            cards.forEach((card) => {
                const r = card.getBoundingClientRect();
                const cardCenter = r.left + r.width / 2;
                const dx = (cardCenter - centerX) / (stageRect.width / 2);
                const n = clamp(dx, -1, 1);

                const rotY = -n * maxRot;
                const z = (1 - Math.abs(n)) * maxZ;

                card.style.transform = `translateZ(${z}px) rotateY(${rotY}deg)`;
            });
        };

        let raf: number | null = null;
        const requestUpdate = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = null;
                update();
            });
        };

        // Listen to both page scroll and rail scroll
        rail.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate);
        requestUpdate();

        return () => {
            rail.removeEventListener("scroll", requestUpdate);
            window.removeEventListener("scroll", requestUpdate);
            window.removeEventListener("resize", requestUpdate);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [filteredProjects]);



    const handleProjectInteraction = (project: any) => {
        const slug = project.slug || project.id;
        if (slug) {
            onNavigate(`project/${slug}`);
        }
    };

    if (loading) return <SkeletonPortfolio />;

    return (
        <div className="min-h-screen bg-black text-white">
            <SEO
                metadata={{
                    title: title,
                    description: seoDescription || description,
                    keywords: [title, 'Portfolio', 'Design', 'Agency', categorySlug],
                    canonicalPath: `/${categorySlug}`
                }}
            />

            {/* Hero Section - Scroll-Driven Perspective Gallery */}
            <section ref={containerRef} className="relative bg-black overflow-hidden">
                {/* Title + Subtitle */}
                <div className="pt-20 pb-12 text-center relative z-30 max-w-4xl mx-auto px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="font-display text-4xl md:text-6xl lg:text-[5rem] leading-none tracking-tight text-white uppercase mb-2"
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="font-pixel text-[10px] md:text-xs text-white/40 tracking-[0.3em] uppercase"
                    >
                        {subtitle}
                    </motion.p>
                </div>

                {/* Scroll-space for gallery travel */}
                <div style={{ height: "60vh" }} className="mt-8">
                    <div className="sticky top-[15vh] h-[60vh] grid place-items-center">
                        {/* Stage with perspective */}
                        <div className="w-full max-w-[900px] px-6" style={{ height: 460, display: "grid", alignItems: "center" }}>
                            <ul
                                ref={railRef}
                                className="flex gap-[18px] p-5 m-0 list-none overflow-x-auto"
                                style={{
                                    perspective: "1200px",
                                    transformStyle: "preserve-3d",
                                    willChange: "transform",
                                }}
                                aria-label="Project gallery"
                            >
                                {filteredProjects.slice(0, 8).map((project) => (
                                    <li
                                        key={project.id}
                                        data-card
                                        className="flex-shrink-0 cursor-pointer relative group"
                                        style={{
                                            width: 320,
                                            height: 420,
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            boxShadow: "0 20px 60px rgba(0,0,0,.55)",
                                            background: "rgba(255,255,255,.05)",
                                        }}
                                        onMouseEnter={() => prefetchProject(project)}
                                        onClick={() => handleProjectInteraction(project)}
                                    >
                                            <ImageWithFallback
                                            src={project.cardImage || project.coverImage || ''}
                                            alt={project.title || ''}
                                            className="w-full h-full object-cover"
                                            optimize="card"
                                        />
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none z-20" />
                <div className="absolute left-0 top-0 h-full w-[25vw] bg-gradient-to-r from-black via-black/50 to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 h-full w-[25vw] bg-gradient-to-l from-black via-black/50 to-transparent z-20 pointer-events-none" />
            </section>
            {/* Canonical Editorial Section */}
            <section className="px-6 lg:px-12 py-8 max-w-[1400px] mx-auto bg-black">
                {/* Label */}
                <div className="mb-8">
                    <span className="text-[10px] font-pixel uppercase tracking-[0.3em] text-white/40">
                        {title}
                    </span>
                </div>

                {/* Two-Column Layout: Headline (left) + Body (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Left Column: Headline */}
                    <div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display italic leading-none text-white">
                            {description}
                        </h2>
                    </div>

                    {/* Right Column: Body Copy (Rich Text) */}
                    <div>
                        <div className="prose prose-invert prose-lg text-white/70 font-light leading-relaxed max-w-none">
                            {/* Render detailed content (string or React node) */}
                            {typeof detailedContent === 'string' ? (
                                <p>{detailedContent}</p>
                            ) : (
                                detailedContent
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Project Grid */}
            <section className="px-6 lg:px-16 xl:px-24 pt-0 pb-32 max-w-[1400px] mx-auto">
                {filteredProjects.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-white/30">No projects found in this category.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* First Project - Full Width */}
                        {filteredProjects[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                onMouseEnter={() => prefetchProject(filteredProjects[0])}
                                onClick={() => handleProjectInteraction(filteredProjects[0])}
                                className="cursor-pointer group relative w-full aspect-[21/9] overflow-hidden bg-neutral-900 rounded-2xl"
                            >
                                {filteredProjects[0].cardImage || filteredProjects[0].coverImage ? (
                                    <ImageWithFallback
                                        src={filteredProjects[0].cardImage || filteredProjects[0].coverImage || ''}
                                        alt={filteredProjects[0].title}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        optimize="hero"
                                        priority={true}
                                        responsive={true}
                                        sizes="(max-width: 768px) 100vw, 80vw"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <div className="font-pixel text-[9px] text-white/50 mb-2 tracking-[0.4em]">
                                        {filteredProjects[0].subcategory?.toUpperCase() || filteredProjects[0].category?.toUpperCase()}
                                    </div>
                                    <h3 className="font-display text-white text-2xl md:text-3xl">
                                        {filteredProjects[0].title}
                                    </h3>
                                    <div className="text-sm text-white/60 mt-2">
                                        {filteredProjects[0].venue && <span>{filteredProjects[0].venue}</span>}
                                        {filteredProjects[0].venue && filteredProjects[0].year && <span> · </span>}
                                        {filteredProjects[0].year && <span>{filteredProjects[0].year}</span>}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Remaining Projects - 4 Column Grid */}
                        {filteredProjects.length > 1 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                                {filteredProjects.slice(1).map((project, index) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        onMouseEnter={() => prefetchProject(project)}
                                        onClick={() => handleProjectInteraction(project)}
                                        className="cursor-pointer group relative w-full aspect-[3/2] overflow-hidden bg-neutral-900 rounded-2xl"
                                    >
                                        {project.cardImage || project.coverImage ? (
                                            <ImageWithFallback
                                                src={project.cardImage || project.coverImage || ''}
                                                alt={project.title}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                optimize="card"
                                                lazy={index > 6}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-90" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <div className="font-pixel text-[8px] text-white/50 mb-2 tracking-[0.35em]">
                                                {project.subcategory?.toUpperCase() || project.category?.toUpperCase()}
                                            </div>
                                            <h3 className="font-display text-white text-lg leading-tight">
                                                {project.title}
                                            </h3>
                                            <div className="text-xs text-white/60 mt-1">
                                                {project.venue && <span>{project.venue}</span>}
                                                {project.venue && project.year && <span> · </span>}
                                                {project.year && <span>{project.year}</span>}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            <PortfolioNavigation
                onNavigate={onNavigate}
                currentPortfolio={categorySlug}
            />
        </div >
    );
}

// Simple Auto-Scrolling Carousel - Tencue Style with Dynamic Perspective
function CurvedTrack({ projects, scrollProgress, onPrefetch, onInteract }: { projects: any[], scrollProgress: any, onPrefetch: (p: any) => void, onInteract: (p: any) => void }) {
    const baseX = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Continuous auto-scroll
    useAnimationFrame(() => {
        baseX.set(baseX.get() - 0.8); // Move left smoothly

        // Reset when scrolled one full set (25vw width + 10px gap)
        const cardWidth = typeof window !== 'undefined' ? (window.innerWidth * 0.25) + 10 : 400;
        if (Math.abs(baseX.get()) >= cardWidth * projects.length) {
            baseX.set(0);
        }
    });

    return (
        <motion.div
            ref={containerRef}
            className="flex flex-row h-full items-center gap-[10px]"
            style={{
                x: baseX,
                transformStyle: "preserve-3d"
            }}
        >
            {/* Render twice for seamless loop */}
            {[...projects, ...projects].map((project, i) => (
                <ConcaveCard
                    key={`${project.id}-${i}`}
                    project={project}
                    index={i}
                    baseX={baseX}
                    onPrefetch={onPrefetch}
                    onInteract={onInteract}
                />
            ))}
        </motion.div>
    );
}

// Individual card with dynamic perspective based on screen position
function ConcaveCard({ project, index, baseX, onPrefetch, onInteract }: {
    project: any,
    index: number,
    baseX: any,
    onPrefetch: (p: any) => void,
    onInteract: (p: any) => void
}) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Calculate card's screen position dynamically
    const cardWidth = typeof window !== 'undefined' ? (window.innerWidth * 0.25) + 10 : 400;
    const cardLeft = index * cardWidth; // Static position in track

    // Dynamic position relative to viewport center
    const screenX = useTransform(baseX, (x: number) => {
        const viewportCenter = typeof window !== 'undefined' ? window.innerWidth / 2 : 320;
        const cardCenter = cardLeft + x + (cardWidth / 2);
        const distFromCenter = (cardCenter - viewportCenter) / viewportCenter;
        return distFromCenter; // -1 (left edge) to 1 (right edge)
    });

    // Map screen position to 3D transforms
    const rotateY = useTransform(screenX, [-1.5, -0.5, 0, 0.5, 1.5], [45, 20, 0, -20, -45]);
    const opacity = useTransform(screenX, [-1.5, -0.8, 0, 0.8, 1.5], [0.2, 0.5, 1, 0.5, 0.2]);
    const scale = useTransform(screenX, [-1.5, -0.8, 0, 0.8, 1.5], [0.85, 0.92, 1, 0.92, 0.85]);

    return (
        <motion.div
            ref={cardRef}
            className="relative flex-shrink-0 bg-neutral-900 cursor-pointer group overflow-hidden rounded-sm"
            style={{
                width: "calc(25vw - 7.5px)",
                aspectRatio: "4/5",
                transformStyle: "preserve-3d",
                rotateY,
                opacity,
                scale
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ scale: { duration: 0.2 } }}
            onMouseEnter={() => onPrefetch(project)}
            onClick={() => onInteract(project)}
        >
                <ImageWithFallback
                src={project.cardImage || project.coverImage || ''}
                alt={project.title || ''}
                className="w-full h-full object-cover"
                optimize="card"
            />
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
    );
}



