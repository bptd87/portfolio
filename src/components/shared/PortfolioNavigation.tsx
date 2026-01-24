import { motion } from 'motion/react';
import { ArrowRight, Theater, Monitor, Box, Cuboid } from 'lucide-react';

interface PortfolioNavigationProps {
    onNavigate: (page: string) => void;
    currentPortfolio?: string;
}

export function PortfolioNavigation({ onNavigate, currentPortfolio }: PortfolioNavigationProps) {
    const portfolios = [
        {
            id: 'portfolio',
            name: 'Scenic Design',
            description: 'Spatial Storytelling & Environments',
            icon: Theater,
            path: 'portfolio',
            image: '/images/nav-scenic.jpg' // We don't have real images handy, using gradient/icon
        },
        {
            id: 'experiential-design',
            name: 'Experiential Design',
            description: 'Immersive Brand Activations',
            icon: Cuboid,
            path: 'experiential-design'
        },
        {
            id: 'rendering',
            name: 'Rendering',
            description: 'Visualization & Concept',
            icon: Monitor,
            path: 'rendering'
        },
        {
            id: 'scenic-models',
            name: 'Scenic Models',
            description: 'Scale Model Archive',
            icon: Box,
            path: 'scenic-models'
        }
    ];

    return (
        <section className="py-24 px-6 bg-neutral-950 border-t border-white/5">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-12 flex items-end justify-between">
                    <div>
                        <span className="font-pixel text-[10px] tracking-[0.3em] text-white/40 uppercase block mb-4">
                            Explore More
                        </span>
                        <h2 className="font-display text-3xl md:text-4xl text-white">
                            Other Portfolios
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {portfolios.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = currentPortfolio === item.id;

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => onNavigate(item.path)}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className={`group relative overflow-hidden rounded-2xl text-left bg-neutral-900 border transition-all ${isActive
                                    ? 'border-white/20 opacity-50 cursor-default'
                                    : 'border-white/5 hover:border-white/20 hover:bg-neutral-800'
                                    }`}
                                disabled={isActive}
                            >
                                <div className="aspect-[4/5] md:aspect-[16/9] lg:aspect-[2/1] p-8 flex flex-col justify-between relative z-10">
                                    <div className={`p-4 rounded-xl inline-flex w-fit transition-colors ${isActive ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white'
                                        }`}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <div>
                                        <h3 className="font-display text-2xl text-white mb-2 group-hover:underline decoration-white/30 underline-offset-4 decoration-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                                            {item.description}
                                        </p>
                                    </div>

                                    {!isActive && (
                                        <div className="absolute top-8 right-8 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            <ArrowRight className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Hover Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
