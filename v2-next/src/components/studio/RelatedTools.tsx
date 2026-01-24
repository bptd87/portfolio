import { ChevronRight, Grid3x3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../hooks/useTheme';

const APPS = [
    {
        id: 'dimension-reference',
        title: 'Dimension Reference',
        description: 'Standard dimensions for furniture and scenic elements.',
        route: '/dimension-reference',
        category: 'REFERENCE',
        image: '/images/studio/dimension-abstract.webp'
    },
    {
        id: 'design-history-timeline',
        title: 'Design History Timeline',
        description: 'Archive of architectural movements from 3000 BCE to present.',
        route: '/design-history-timeline',
        category: 'REFERENCE',
        image: '/images/studio/history-abstract.webp'
    },
    {
        id: 'classical-architecture-guide',
        title: 'Classical Architecture',
        description: 'Guide to classical orders, moldings, and pediments.',
        route: '/classical-architecture-guide',
        category: 'REFERENCE',
        image: '/images/studio/classics-abstract.webp'
    },
    {
        id: 'architecture-scale-converter',
        title: '3D Print Scale Calculator',
        description: 'Convert theatrical dimensions to 3D printable scale.',
        route: '/architecture-scale-converter',
        category: 'CALCULATION',
        image: '/images/studio/scale-converter-abstract.webp'
    },
    {
        id: 'rosco-paint-calculator',
        title: 'Rosco Paint Calculator',
        description: 'Calculate Rosco paint mixing formulas.',
        route: '/rosco-paint-calculator',
        category: 'CALCULATION',
        image: '/images/studio/rosco-abstract.webp'
    },
    {
        id: 'commercial-paint-finder',
        title: 'Commercial Paint Finder',
        description: 'Find commercial paint matches for theatrical colors.',
        route: '/commercial-paint-finder',
        category: 'CALCULATION',
        image: '/images/studio/commercial-abstract.webp'
    },
    {
        id: 'model-reference-scaler',
        title: 'Model Reference Scaler',
        description: 'Scale reference photos for model making.',
        route: '/model-reference-scaler',
        category: 'DESIGN',
        image: '/images/studio/model-scaler-abstract.webp'
    }
];

interface RelatedToolsProps {
    currentToolId: string;
}

export function RelatedTools({ currentToolId }: RelatedToolsProps) {
    const context = useTheme();
    const theme = context?.theme || 'light';
    const isDark = theme === 'dark';

    // Fail-Safe Colors
    const colors = {
        sectionBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        textMain: isDark ? '#ffffff' : '#0f172a',
        textMuted: isDark ? '#a1a1aa' : '#64748b',
        cardBg: isDark ? '#18181b' : '#ffffff',
        cardBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)',
        cardHoverBorder: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0,0,0,0.3)',
        categoryText: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
         overlay: isDark 
            ? 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' 
            : 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)'
    };

    // Correctly filter out the current tool by ID
    const availableApps = APPS.filter(app => app.id !== currentToolId);
    
    // Shuffle algorithm to get random suggestions (Fisher-Yates shuffle)
    // We use a simple slice for stability in this demo, but could be random
    // To ensure variety, we pick the FIRST 4 available apps (since list is small)
    // or you can implement a seeded shuffle if needed.
    const relatedApps = availableApps.slice(0, 4);

    return (
        <div 
            className="w-full pt-24 pb-16 border-t font-sans"
            style={{ 
                borderTopColor: colors.sectionBorder,
                color: colors.textMain 
            }}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
                <div className="text-center mb-12">
                    <Grid3x3 className="w-8 h-8 mx-auto mb-4 opacity-50" />
                    <h2 className="font-display text-2xl md:text-3xl mb-3 italic">
                        More Studio Tools
                    </h2>
                    <p className="max-w-lg mx-auto text-sm opacity-60">
                        Explore other utilities for scenic design and technical direction.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {relatedApps.map((app, index) => (
                        <motion.a
                            key={app.id}
                            href={app.route}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group block rounded-xl overflow-hidden border transition-all duration-300 relative h-full flex flex-col"
                            style={{ 
                                backgroundColor: colors.cardBg, 
                                borderColor: colors.cardBorder 
                            }}
                        >
                            {/* Image Container */}
                            <div className="aspect-[3/2] overflow-hidden relative">
                                <img
                                    src={app.image}
                                    alt={app.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.1)' }} />
                            </div>

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-1 relative">
                                <div className="font-pixel text-[8px] tracking-[0.2em] mb-2 uppercase" style={{ color: colors.categoryText }}>
                                    {app.category}
                                </div>
                                <h3 className="font-display text-sm mb-1 italic leading-tight group-hover:text-pink-500 transition-colors">
                                    {app.title}
                                </h3>
                                <p className="text-xs mb-3 line-clamp-2 leading-relaxed opacity-60 flex-1">
                                    {app.description}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] font-medium opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                                    <span>Launch Tool</span>
                                    <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </div>
    );
}
