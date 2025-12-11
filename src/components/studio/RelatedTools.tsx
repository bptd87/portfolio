import { ChevronRight, Grid3x3 } from 'lucide-react';
import { motion } from 'motion/react';

const APPS = [
    {
        id: 'dimension-reference',
        title: 'Dimension Reference',
        description: 'Standard dimensions for furniture and scenic elements.',
        route: '/dimension-reference',
        category: 'REFERENCE',
        image: 'https://images.unsplash.com/photo-1670222061552-c273834aee0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXJuaXR1cmUlMjBkaW1lbnNpb24lMjByZWZlcmVuY2V8ZW58MXx8fHwxNzYzOTcwNzc4fDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: 'design-history-timeline',
        title: 'Design History Timeline',
        description: 'Archive of architectural movements from 3000 BCE to present.',
        route: '/design-history-timeline',
        category: 'REFERENCE',
        image: 'https://images.unsplash.com/photo-1721244653652-268631ec049a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwaGlzdG9yeSUyMHRpbWVsaW5lfGVufDF8fHx8MTc2Mzk3MDc3OHww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: 'classical-architecture-guide',
        title: 'Classical Architecture',
        description: 'Guide to classical orders, moldings, and pediments.',
        route: '/classical-architecture-guide',
        category: 'REFERENCE',
        image: 'https://images.unsplash.com/photo-1632731187075-11c50d94bd5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBhcmNoaXRlY3R1cmUlMjBjb2x1bW5zfGVufDF8fHx8MTc2Mzk3MDc3OHww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: 'architecture-scale-converter',
        title: '3D Print Scale Calculator',
        description: 'Convert theatrical dimensions to 3D printable scale.',
        route: '/architecture-scale-converter',
        category: 'CALCULATION',
        image: 'https://images.unsplash.com/photo-1544704784-59bcc978c9c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzZCUyMHByaW50ZXIlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2Mzk3MDQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: 'rosco-paint-calculator',
        title: 'Rosco Paint Calculator',
        description: 'Calculate Rosco paint mixing formulas.',
        route: '/rosco-paint-calculator',
        category: 'CALCULATION',
        image: 'https://images.unsplash.com/photo-1660861472949-a26dfbf0b0f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGFpbnQlMjBicnVzaHxlbnwxfHx8fDE3NjM5NzA3Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: 'commercial-paint-finder',
        title: 'Commercial Paint Finder',
        description: 'Find commercial paint matches for theatrical colors.',
        route: '/commercial-paint-finder',
        category: 'CALCULATION',
        image: 'https://images.unsplash.com/photo-1560121361-3968dbf2b749?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludCUyMGNvbG9yJTIwc3dhdGNoZXN8ZW58MXx8fHwxNzYzOTY3MTQzfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: 'model-reference-scaler',
        title: 'Model Reference Scaler',
        description: 'Scale reference photos for model making.',
        route: '/model-reference-scaler',
        category: 'DESIGN',
        image: 'https://images.unsplash.com/photo-1680079526971-92914190f440?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwc2NhbGUlMjBtb2RlbHxlbnwxfHx8fDE3NjM5MDU1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080'
    }
];

interface RelatedToolsProps {
    currentToolId: string;
}

export function RelatedTools({ currentToolId }: RelatedToolsProps) {
    // Filter out current tool and shuffle/slice to get 3 random others
    // For stability in SSR/hydration, we'll just take the next 3 in the array circle
    const currentIdx = APPS.findIndex(app => app.id === currentToolId);
    const relatedApps = [];

    if (currentIdx !== -1) {
        for (let i = 1; i <= 3; i++) {
            relatedApps.push(APPS[(currentIdx + i) % APPS.length]);
        }
    } else {
        relatedApps.push(...APPS.slice(0, 3));
    }

    return (
        <div className="w-full pt-16 pb-8 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
                <div className="text-center mb-12">
                    <Grid3x3 className="w-8 h-8 text-neutral-400 mx-auto mb-4" />
                    <h2 className="font-display text-2xl md:text-3xl mb-3 italic">
                        More Studio Tools
                    </h2>
                    <p className="text-neutral-500 max-w-lg mx-auto text-sm">
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
                            className="group block bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                        >
                            <div className="aspect-[3/2] overflow-hidden">
                                <img
                                    src={app.image}
                                    alt={app.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-4">
                                <div className="font-pixel text-[8px] tracking-[0.2em] text-neutral-400 mb-1.5 uppercase">
                                    {app.category}
                                </div>
                                <h3 className="font-display text-sm mb-1.5 italic group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                                    {app.title}
                                </h3>
                                <p className="text-xs text-neutral-500 mb-3 line-clamp-2 leading-relaxed">
                                    {app.description}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                                    <span>LAUNCH</span>
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
