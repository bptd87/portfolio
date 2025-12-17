import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { TabbedGallery } from '../components/shared/TabbedGallery';
import { SEO } from '../components/SEO';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CreativeStatementProps {
    onNavigate?: (page: string) => void;
}

export function CreativeStatement({ onNavigate }: CreativeStatementProps) {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProductionIndex, setSelectedProductionIndex] = useState(0);
    const [selectedRenderingIndex, setSelectedRenderingIndex] = useState(0);

    // Fetch portfolio projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects`,
                    {
                        headers: {
                            'Authorization': `Bearer ${publicAnonKey}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.projects) {
                        setProjects(data.projects);
                        console.log('Projects loaded:', data.projects.length);
                    }
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchProjects();
    }, []);

    // Get production photos - projects with card_image
    const productionProjects = projects
        .filter((p: any) => p.published && p.card_image)
        .slice(0, 8);

    // Get rendering projects - projects with galleries.hero
    const renderingProjects = projects
        .filter((p: any) => p.published && p.galleries && p.galleries.hero && p.galleries.hero.length > 0)
        .map((p: any) => ({
            ...p,
            renderingImage: Array.isArray(p.galleries.hero) ? p.galleries.hero[0] : null
        }))
        .filter((p: any) => p.renderingImage)
        .slice(0, 8);

    console.log('Production projects:', productionProjects.length);
    console.log('Rendering projects:', renderingProjects.length);

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <SEO
                title="Creative Statement | Brandon PT Davis"
                description="Design is storytelling. Space is the narrative. A scenic designer's approach to creating environments where story and space converge."
                keywords={['creative statement', 'scenic design philosophy', 'theatre design', 'Brandon PT Davis']}
            />
            <Navbar onNavigate={onNavigate || (() => { })} currentPage="creative-statement" />

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-6 py-40">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center max-w-5xl"
                >
                    <h1 className="font-display text-6xl md:text-7xl lg:text-8xl tracking-[-0.02em] leading-[1.05] mb-8 text-black dark:text-white">
                        Design is storytelling.
                        <br />
                        Space is the narrative.
                    </h1>
                </motion.div>
            </section>

            {/* Foundation Section */}
            <section className="min-h-[80vh] flex items-center justify-center px-6 py-40">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-4xl mx-auto"
                >
                    <p className="font-pixel text-[10px] tracking-[0.4em] text-black/40 dark:text-white/40 mb-8 uppercase">
                        Foundation
                    </p>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-[-0.01em] leading-[1.2] mb-12 text-black dark:text-white">
                        Architecture meets narrative.
                        <br />
                        History shapes meaning.
                    </h2>
                    <p className="text-xl md:text-2xl leading-[1.5] text-black/80 dark:text-white/80">
                        My work lives at the intersection of craft and concept, where physical space becomes a tool for shaping emotion, tension, and rhythm.
                    </p>
                </motion.div>
            </section>

            {/* Production Photos Gallery */}
            {productionProjects.length > 0 && (
                <section className="min-h-screen py-40 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <p className="font-pixel text-[10px] tracking-[0.4em] text-black/40 dark:text-white/40 mb-6 uppercase">
                                Production Gallery
                            </p>
                            <h3 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-[-0.01em] mb-8 text-black dark:text-white">
                                From stage to reality
                            </h3>
                        </div>

                        <TabbedGallery
                            tabs={productionProjects.map((p: any) => ({ id: p.id, label: p.title }))}
                        >
                            {(activeTab) => {
                                const activeProject = productionProjects.find((p: any) => p.id === activeTab);
                                if (!activeProject) return null;

                                return (
                                    <div>
                                        {/* Project Image */}
                                        <div className="relative aspect-video overflow-hidden rounded-3xl mb-12 max-w-6xl mx-auto">
                                            <ImageWithFallback
                                                src={activeProject.card_image}
                                                alt={activeProject.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Project Info */}
                                        <div className="text-center max-w-3xl mx-auto">
                                            <p className="text-lg md:text-xl text-black/80 dark:text-white/80 mb-4">
                                                {activeProject.venue && `${activeProject.venue}${activeProject.location ? `, ${activeProject.location}` : ''}`}
                                                {activeProject.year && ` • ${activeProject.year}`}
                                            </p>
                                            {activeProject.description && (
                                                <p className="text-base md:text-lg text-black/70 dark:text-white/70 leading-relaxed">
                                                    {activeProject.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            }}
                        </TabbedGallery>
                    </div>
                </section>
            )}

            {/* Collaboration Section */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl"
                >
                    <p className="text-[10px] font-pixel tracking-[0.4em] text-gray-400 dark:text-white/30 mb-6">
                        COLLABORATION
                    </p>
                    <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                        <span className="text-red-600 dark:text-red-400 font-bold">Every voice</span>
                        {' '}
                        <span className="text-gray-900 dark:text-white font-bold">matters.</span>
                        <br />
                        <span className="text-gray-900 dark:text-white">From</span> <span className="text-blue-600 dark:text-blue-400 font-bold">playwright</span> <span className="text-gray-900 dark:text-white">to</span> <span className="text-purple-600 dark:text-purple-500 font-bold">carpenter</span><span className="text-gray-900 dark:text-white">.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-white/60 leading-relaxed">
                        Great design emerges from <span className="text-red-600 dark:text-red-400 font-semibold">collaboration</span>. I value every member of the <span className="text-gray-900 dark:text-white font-semibold">creative and production teams</span> who bring the vision to life.
                    </p>
                </motion.div>
            </section>

            {/* Process Section */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl"
                >
                    <p className="text-[10px] font-pixel tracking-[0.4em] text-gray-400 dark:text-white/30 mb-6">
                        PROCESS
                    </p>
                    <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Explore.</span> <span className="text-red-600 dark:text-red-400 font-bold">Sculpt.</span> <span className="text-purple-600 dark:text-purple-500 font-bold">Refine.</span>
                        <br />
                        <span className="text-gray-900 dark:text-white">Never afraid to </span>
                        <span className="text-pink-500 font-bold">start over</span>
                        <span className="text-gray-900 dark:text-white">.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-white/60 leading-relaxed">
                        Through <span className="text-blue-600 dark:text-blue-400 font-semibold">conversation</span> and <span className="text-purple-600 dark:text-purple-500 font-semibold">digital modeling</span>, I explore and sculpt the world—always willing to <span className="text-red-600 dark:text-red-400 font-semibold">restart</span>, no matter where we are in the journey.
                    </p>
                </motion.div>
            </section>

            {/* Craft Section */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl"
                >
                    <p className="text-[10px] font-pixel tracking-[0.4em] text-gray-400 dark:text-white/30 mb-6">
                        CRAFT
                    </p>
                    <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                        <span className="text-gray-900 dark:text-white">From </span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">rendering</span>
                        <span className="text-gray-900 dark:text-white"> to </span><span className="text-red-600 dark:text-red-400 font-bold">reality</span><span className="text-gray-900 dark:text-white">.</span>
                        <br />
                        <span className="text-purple-600 dark:text-purple-500 font-bold">Structure</span> <span className="text-gray-900 dark:text-white">meets</span> <span className="text-blue-600 dark:text-blue-400 font-bold">detail</span><span className="text-gray-900 dark:text-white">.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-white/60 leading-relaxed">
                        I thrive in the transition from <span className="text-blue-600 dark:text-blue-400 font-semibold">concept to construction</span>—translating ideas into <span className="text-red-600 dark:text-red-400 font-semibold">fully buildable spaces</span> where every choice supports the narrative.
                    </p>
                </motion.div>
            </section>

            {/* Rendering Gallery */}
            <section className="min-h-screen flex items-center justify-center px-6 py-20">
                <div className="w-full max-w-6xl">
                    <div className="text-center mb-12">
                        <p className="text-[10px] font-pixel tracking-[0.4em] text-gray-400 dark:text-white/30 mb-4">
                            RENDERING GALLERY
                        </p>
                        <h3 className="text-2xl md:text-3xl font-display text-gray-900 dark:text-white mb-8">
                            From <span className="text-blue-500">concept</span> to construction
                        </h3>
                    </div>

                    {renderingProjects.length > 0 ? (
                        <motion.div
                            key={selectedRenderingIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full"
                        >
                            {/* Rendering Image */}
                            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-900 mb-8 max-w-4xl mx-auto">
                                <img
                                    src={renderingProjects[selectedRenderingIndex].renderingImage}
                                    alt={renderingProjects[selectedRenderingIndex].title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Project Titles with Text Navigation */}
                            <div className="w-full max-w-5xl mx-auto mb-8">
                                <div className="flex items-center justify-between gap-8">
                                    {/* Scrollable Tabs Container */}
                                    <div
                                        id="rendering-tabs"
                                        className="flex gap-8 items-center overflow-x-auto scroll-smooth flex-1"
                                        style={{
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                        }}
                                    >
                                        {renderingProjects.map((project: any, index: number) => (
                                            <button
                                                key={project.id}
                                                onClick={() => setSelectedRenderingIndex(index)}
                                                className={`relative whitespace-nowrap transition-all duration-300 pb-2 text-lg font-display flex-shrink-0 ${index === selectedRenderingIndex
                                                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300'
                                                    : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:text-white/90'
                                                    }`}
                                            >
                                                {project.title}
                                                {index === selectedRenderingIndex && (
                                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400"></span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Navigation Controls - Right Side */}
                                    <div className="flex gap-3 items-center flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                const container = document.getElementById('rendering-tabs');
                                                if (container) container.scrollLeft -= 300;
                                            }}
                                            className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 text-blue-600 dark:text-blue-400 hover:bg-cyan-500/20 transition-all rounded-full"
                                            aria-label="Scroll left"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const container = document.getElementById('rendering-tabs');
                                                if (container) container.scrollLeft += 300;
                                            }}
                                            className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 text-blue-600 dark:text-blue-400 hover:bg-cyan-500/20 transition-all rounded-full"
                                            aria-label="Scroll right"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Separator Line */}
                            <div className="w-full max-w-4xl mx-auto mb-6">
                                <div className="h-px bg-black/10 dark:bg-white/20"></div>
                            </div>

                            {/* Project Description */}
                            <p className="text-base md:text-lg text-gray-700 dark:text-white/70 leading-relaxed text-center max-w-2xl mx-auto">
                                {renderingProjects[selectedRenderingIndex].description ||
                                    `${renderingProjects[selectedRenderingIndex].venue || ''} • ${renderingProjects[selectedRenderingIndex].year || ''}`}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-white/50 py-20">
                            <p>Loading renderings...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Goal Section */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl"
                >
                    <p className="text-[10px] font-pixel tracking-[0.4em] text-gray-400 dark:text-white/30 mb-6">
                        THE GOAL
                    </p>
                    <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                        <span className="text-gray-900 dark:text-white">Designs that feel </span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">inevitable</span>
                        <span className="text-gray-900 dark:text-white">.</span>
                        <br />
                        <span className="text-red-600 dark:text-red-400 font-bold">Spaces</span> <span className="text-gray-900 dark:text-white">that</span> <span className="text-purple-600 dark:text-purple-500 font-bold">resonate</span><span className="text-gray-900 dark:text-white">.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-white/60 leading-relaxed mb-16">
                        My goal is to create environments that feel like they <span className="text-blue-600 dark:text-blue-400 font-semibold">couldn't have been any other way</span>—even if it took many revisions to get there.
                    </p>

                    <div className="pt-12 border-t border-black/10 dark:border-white/10 max-w-sm mx-auto">
                        <p className="text-2xl md:text-3xl font-display text-gray-900 dark:text-white mb-2">
                            Brandon PT Davis
                        </p>
                        <p className="text-sm text-gray-400 dark:text-white/40">
                            Scenic Designer
                        </p>
                    </div>
                </motion.div>
            </section>

        </div>
    );
}
