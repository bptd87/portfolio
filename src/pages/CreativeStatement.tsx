import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { TabbedGallery } from '../components/shared/TabbedGallery';
import { SEO } from '../components/SEO';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CreativeStatementProps {
    onNavigate?: (page: string) => void;
}

export function CreativeStatement({ onNavigate }: CreativeStatementProps) {
    const [projects, setProjects] = useState<any[]>([]);
    const [activeProductionTab, setActiveProductionTab] = useState<string>('');
    const [activeRenderingTab, setActiveRenderingTab] = useState<string>('');

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

    // Get production photos - projects with card_image (limit to 6)
    const productionProjects = projects
        .filter((p: any) => p.published && p.card_image)
        .slice(0, 6);

    // Get rendering projects - projects with galleries.hero (limit to 6)
    const renderingProjects = projects
        .filter((p: any) => p.published && p.galleries && p.galleries.hero && p.galleries.hero.length > 0)
        .map((p: any) => ({
            ...p,
            renderingImage: Array.isArray(p.galleries.hero) ? p.galleries.hero[0] : null
        }))
        .filter((p: any) => p.renderingImage)
        .slice(0, 6);

    // Initialize active tabs when projects load
    useEffect(() => {
        if (productionProjects.length > 0 && !activeProductionTab) {
            setActiveProductionTab(productionProjects[0].id);
        }
        if (renderingProjects.length > 0 && !activeRenderingTab) {
            setActiveRenderingTab(renderingProjects[0].id);
        }
    }, [projects]);

    console.log('Production projects:', productionProjects.length);
    console.log('Rendering projects:', renderingProjects.length);

    return (
        <div className="min-h-screen bg-white dark:bg-black overflow-x-hidden">
            <SEO
                title="Creative Statement | Brandon PT Davis"
                description="Design is storytelling. Space is the narrative. A scenic designer's approach to creating environments where story and space converge."
                keywords={['creative statement', 'scenic design philosophy', 'theatre design', 'Brandon PT Davis']}
            />


            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-6" style={{ overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center max-w-5xl w-full"
                    style={{
                        overflowX: 'hidden',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        maxWidth: '100%',
                        width: '100%',
                    }}
                >
                    <h1 className="font-display text-6xl md:text-7xl lg:text-8xl tracking-[-0.02em] leading-[1.05] text-black dark:text-white break-words" style={{ overflowX: 'hidden', wordBreak: 'break-word' }}>
                        <span className="text-blue-600 dark:text-blue-400">Design</span> <span className="text-black dark:text-white">is</span> <span className="text-red-600 dark:text-red-400">storytelling</span><span className="text-black dark:text-white">.</span>
                        <br />
                        <span className="text-purple-600 dark:text-purple-500">Space</span> <span className="text-black dark:text-white">is the</span> <span className="text-blue-600 dark:text-blue-400">narrative</span><span className="text-black dark:text-white">.</span>
                    </h1>
                </motion.div>
            </section>

            {/* Foundation Section */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center max-w-4xl"
                >
                    <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-[-0.01em] leading-[1.1] mb-12 text-black dark:text-white">
                        <span className="text-blue-600 dark:text-blue-400">Architecture</span>
                        {' '}
                        <span className="text-black dark:text-white">meets</span> <span className="text-red-600 dark:text-red-400">narrative</span><span className="text-black dark:text-white">.</span>
                        <br />
                        <span className="text-purple-600 dark:text-purple-500">History</span>
                        {' '}
                        <span className="text-black dark:text-white">shapes</span> <span className="text-blue-600 dark:text-blue-400">meaning</span><span className="text-black dark:text-white">.</span>
                    </h2>
                    <p className="text-xl md:text-2xl leading-[1.6] text-black/70 dark:text-white/70">
                        My work lives at the intersection of <span className="text-black dark:text-white font-medium">craft</span> and <span className="text-black dark:text-white font-medium">concept</span>, where physical space becomes a tool for shaping <span className="text-blue-600 dark:text-blue-400">emotion</span>, <span className="text-red-600 dark:text-red-400">tension</span>, and <span className="text-purple-600 dark:text-purple-500">rhythm</span>.
                    </p>
                </motion.div>
            </section>

            {/* Production Photos Gallery */}
            {productionProjects.length > 0 && (
                <section className="min-h-screen flex items-center justify-center px-6 py-32">
                    <div className="w-full max-w-7xl">
                        <div className="text-center mb-20">
                            <h3 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-[-0.01em] mb-16 text-black dark:text-white font-light">
                                From stage to reality
                            </h3>
                        </div>

                        <TabbedGallery
                            tabs={productionProjects.map((p: any) => ({ id: p.id, label: p.title }))}
                            onTabChange={(tabId) => setActiveProductionTab(tabId)}
                        >
                            {(activeTab) => {
                                const activeProject = productionProjects.find((p: any) => p.id === activeTab);
                                if (!activeProject) return null;

                                return (
                                    <div className="relative aspect-video max-w-6xl mx-auto rounded-[30px] overflow-hidden">
                                        <ImageWithFallback
                                            src={activeProject.card_image}
                                            alt={activeProject.title}
                                            className="w-full h-full object-cover"
                                            style={{ borderRadius: '30px' }}
                                        />
                                    </div>
                                );
                            }}
                        </TabbedGallery>

                        {/* Project Info Below Tabs */}
                        {productionProjects.length > 0 && (() => {
                            const activeProject = productionProjects.find((p: any) => p.id === (activeProductionTab || productionProjects[0]?.id));
                            if (!activeProject) return null;

                            return (
                                <div className="text-center max-w-3xl mx-auto mt-8">
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
                            );
                        })()}
                    </div>
                </section>
            )}

            {/* Collaboration Section */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center max-w-4xl"
                >
                    <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-[-0.01em] leading-[1.1] mb-12 text-black dark:text-white">
                        <span className="text-red-600 dark:text-red-400">Every voice</span>
                        {' '}
                        <span className="text-black dark:text-white">matters.</span>
                        <br />
                        <span className="text-black dark:text-white">From</span> <span className="text-blue-600 dark:text-blue-400">playwright</span> <span className="text-black dark:text-white">to</span> <span className="text-purple-600 dark:text-purple-500">carpenter</span><span className="text-black dark:text-white">.</span>
                    </h2>
                    <p className="text-xl md:text-2xl leading-[1.6] text-black/70 dark:text-white/70">
                        Great design emerges from <span className="text-red-600 dark:text-red-400 font-medium">collaboration</span>. I value every member of the <span className="text-black dark:text-white font-medium">creative and production teams</span> who bring the vision to life.
                    </p>
                </motion.div>
            </section>

            {/* Process Section */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center max-w-4xl"
                >
                    <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-[-0.01em] leading-[1.1] mb-12 text-black dark:text-white">
                        <span className="text-blue-600 dark:text-blue-400">Explore.</span> <span className="text-red-600 dark:text-red-400">Sculpt.</span> <span className="text-purple-600 dark:text-purple-500">Refine.</span>
                        <br />
                        <span className="text-black dark:text-white">Never afraid to </span>
                        <span className="text-pink-500 dark:text-pink-400">start over</span>
                        <span className="text-black dark:text-white">.</span>
                    </h2>
                    <p className="text-xl md:text-2xl leading-[1.6] text-black/70 dark:text-white/70">
                        Through <span className="text-blue-600 dark:text-blue-400 font-medium">conversation</span> and <span className="text-purple-600 dark:text-purple-500 font-medium">digital modeling</span>, I explore and sculpt the world—always willing to <span className="text-red-600 dark:text-red-400 font-medium">restart</span>, no matter where we are in the journey.
                    </p>
                </motion.div>
            </section>

            {/* Craft Section */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center max-w-4xl"
                >
                    <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-[-0.01em] leading-[1.1] mb-12 text-black dark:text-white">
                        <span className="text-black dark:text-white">From </span>
                        <span className="text-blue-600 dark:text-blue-400">rendering</span>
                        <span className="text-black dark:text-white"> to </span><span className="text-red-600 dark:text-red-400">reality</span><span className="text-black dark:text-white">.</span>
                        <br />
                        <span className="text-purple-600 dark:text-purple-500">Structure</span> <span className="text-black dark:text-white">meets</span> <span className="text-blue-600 dark:text-blue-400">detail</span><span className="text-black dark:text-white">.</span>
                    </h2>
                    <p className="text-xl md:text-2xl leading-[1.6] text-black/70 dark:text-white/70">
                        I thrive in the transition from <span className="text-blue-600 dark:text-blue-400 font-medium">concept to construction</span>—translating ideas into <span className="text-red-600 dark:text-red-400 font-medium">fully buildable spaces</span> where every choice supports the narrative.
                    </p>
                </motion.div>
            </section>

            {/* Rendering Gallery */}
            {renderingProjects.length > 0 && (
                <section className="min-h-screen flex items-center justify-center px-6 py-32">
                    <div className="w-full max-w-7xl">
                        <div className="text-center mb-20">
                            <h3 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-[-0.01em] mb-16 text-black dark:text-white font-light">
                                From concept to construction
                            </h3>
                        </div>

                        <TabbedGallery
                            tabs={renderingProjects.map((p: any) => ({ id: p.id, label: p.title }))}
                            onTabChange={(tabId) => setActiveRenderingTab(tabId)}
                        >
                            {(activeTab) => {
                                const activeProject = renderingProjects.find((p: any) => p.id === activeTab);
                                if (!activeProject) return null;

                                return (
                                    <div className="relative aspect-video max-w-6xl mx-auto rounded-[30px] overflow-hidden">
                                        <ImageWithFallback
                                            src={activeProject.renderingImage}
                                            alt={activeProject.title}
                                            className="w-full h-full object-cover"
                                            style={{ borderRadius: '30px' }}
                                        />
                                    </div>
                                );
                            }}
                        </TabbedGallery>

                        {/* Project Info Below Tabs */}
                        {renderingProjects.length > 0 && (() => {
                            const activeProject = renderingProjects.find((p: any) => p.id === (activeRenderingTab || renderingProjects[0]?.id));
                            if (!activeProject) return null;

                            return (
                                <div className="text-center max-w-3xl mx-auto mt-8">
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
                            );
                        })()}
                    </div>
                </section>
            )}

            {/* Goal Section */}
            <section className="min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center max-w-4xl"
                >
                    <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-[-0.01em] leading-[1.1] mb-12 text-black dark:text-white">
                        <span className="text-black dark:text-white">Designs that feel </span>
                        <span className="text-blue-600 dark:text-blue-400">inevitable</span>
                        <span className="text-black dark:text-white">.</span>
                        <br />
                        <span className="text-red-600 dark:text-red-400">Spaces</span> <span className="text-black dark:text-white">that</span> <span className="text-purple-600 dark:text-purple-500">resonate</span><span className="text-black dark:text-white">.</span>
                    </h2>
                    <p className="text-xl md:text-2xl leading-[1.6] text-black/70 dark:text-white/70 mb-20">
                        My goal is to create environments that feel like they <span className="text-blue-600 dark:text-blue-400 font-medium">couldn't have been any other way</span>—even if it took many revisions to get there.
                    </p>

                    <div className="pt-16 border-t border-black/10 dark:border-white/10 max-w-sm mx-auto">
                        <p className="font-display text-2xl md:text-3xl text-black dark:text-white mb-2">
                            Brandon PT Davis
                        </p>
                        <p className="text-sm text-black/50 dark:text-white/50">
                            Scenic Designer
                        </p>
                    </div>
                </motion.div>
            </section>

        </div>
    );
}
