import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
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
            <Navbar onNavigate={onNavigate || (() => { })} currentPage="creative-statement" />

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                    className="text-center max-w-4xl"
                >
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
                        <span className="text-blue-600 dark:text-blue-400">Design</span> <span className="text-gray-900 dark:text-white">is</span> <span className="text-red-600 dark:text-red-400 font-bold">storytelling</span><span className="text-gray-900 dark:text-white">.</span>
                        <br />
                        <span className="text-purple-600 dark:text-purple-500 font-bold">Space</span> <span className="text-gray-900 dark:text-white">is the</span> <span className="text-blue-600 dark:text-blue-400 font-bold">narrative</span><span className="text-gray-900 dark:text-white">.</span>
                    </h1>
                </motion.div>
            </section>

            {/* Foundation Section */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl"
                >
                    <p className="text-[10px] font-pixel tracking-[0.4em] text-gray-400 dark:text-white/30 mb-6">
                        FOUNDATION
                    </p>
                    <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Architecture</span>
                        {' '}
                        <span className="text-gray-900 dark:text-white">meets</span> <span className="text-red-600 dark:text-red-400 font-bold">narrative</span><span className="text-gray-900 dark:text-white">.</span>
                        <br />
                        <span className="text-purple-600 dark:text-purple-500 font-bold">History</span>
                        {' '}
                        <span className="text-gray-900 dark:text-white">shapes</span> <span className="text-blue-600 dark:text-blue-400 font-bold">meaning</span><span className="text-gray-900 dark:text-white">.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-white/60 leading-relaxed">
                        My work lives at the intersection of <span className="text-gray-900 dark:text-white font-semibold">craft</span> and <span className="text-gray-900 dark:text-white font-semibold">concept</span>, where physical space becomes a tool for shaping <span className="text-blue-600 dark:text-blue-400">emotion</span>, <span className="text-red-600 dark:text-red-400">tension</span>, and <span className="text-purple-600 dark:text-purple-500">rhythm</span>.
                    </p>
                </motion.div>
            </section>

            {/* Production Photos Gallery */}
            <section className="min-h-screen flex items-center justify-center px-6 py-20">
                <div className="w-full max-w-6xl">
                    <div className="text-center mb-12">
                        <p className="text-[10px] font-pixel tracking-[0.4em] text-gray-400 dark:text-white/30 mb-4">
                            PRODUCTION GALLERY
                        </p>
                        <h3 className="text-2xl md:text-3xl font-display text-gray-900 dark:text-white mb-8">
                            From stage to <span className="text-pink-500">reality</span>
                        </h3>
                    </div>

                    {productionProjects.length > 0 ? (
                        <motion.div
                            key={selectedProductionIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full"
                        >
                            {/* Project Image */}
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 mb-8 max-w-4xl mx-auto">
                                <img
                                    src={productionProjects[selectedProductionIndex].card_image}
                                    alt={productionProjects[selectedProductionIndex].title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Project Titles with Text Navigation */}
                            <div className="w-full max-w-5xl mx-auto mb-8">
                                <div className="flex items-center justify-between gap-8">
                                    {/* Scrollable Tabs Container */}
                                    <div
                                        id="production-tabs"
                                        className="flex gap-8 items-center overflow-x-auto scroll-smooth flex-1"
                                        style={{
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                        }}
                                    >
                                        {productionProjects.map((project: any, index: number) => (
                                            <button
                                                key={project.id}
                                                onClick={() => setSelectedProductionIndex(index)}
                                                className={`relative whitespace-nowrap transition-all duration-300 pb-2 text-lg font-display flex-shrink-0 ${index === selectedProductionIndex
                                                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-200'
                                                    : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:text-white/90'
                                                    }`}
                                            >
                                                {project.title}
                                                {index === selectedProductionIndex && (
                                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-pink-300"></span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Navigation Controls - Right Side */}
                                    <div className="flex gap-3 items-center flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                const container = document.getElementById('production-tabs');
                                                if (container) container.scrollLeft -= 300;
                                            }}
                                            className="w-10 h-10 flex items-center justify-center bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 text-red-600 dark:text-red-400 hover:bg-pink-500/20 transition-all rounded-full"
                                            aria-label="Scroll left"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const container = document.getElementById('production-tabs');
                                                if (container) container.scrollLeft += 300;
                                            }}
                                            className="w-10 h-10 flex items-center justify-center bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 text-red-600 dark:text-red-400 hover:bg-pink-500/20 transition-all rounded-full"
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
                                {productionProjects[selectedProductionIndex].description ||
                                    `${productionProjects[selectedProductionIndex].venue || ''} • ${productionProjects[selectedProductionIndex].year || ''}`}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-white/50 py-20">
                            <p>Loading production photos...</p>
                        </div>
                    )}
                </div>
            </section>

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
