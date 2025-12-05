import React, { useState } from 'react';
import { ArrowRight, Coffee, Code2 } from 'lucide-react';
import { motion } from 'motion/react';
import robotCoffeeImage from 'figma:asset/54f4c0c7adf82bdcbb2e29ba773ca1071df8a739.png';

// Tool accent colors - consistent with StudioNew.tsx
const TOOL_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  'dimension-reference': {
    bg: 'bg-cyan-500/10 dark:bg-cyan-400/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/30 dark:border-cyan-400/30',
    glow: 'shadow-cyan-500/20',
  },
  'design-history-timeline': {
    bg: 'bg-violet-500/10 dark:bg-violet-400/10',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/30 dark:border-violet-400/30',
    glow: 'shadow-violet-500/20',
  },
  'classical-architecture-guide': {
    bg: 'bg-amber-500/10 dark:bg-amber-400/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30 dark:border-amber-400/30',
    glow: 'shadow-amber-500/20',
  },
  'scale-converter': {
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30 dark:border-emerald-400/30',
    glow: 'shadow-emerald-500/20',
  },
  'rosco-paint-calculator': {
    bg: 'bg-rose-500/10 dark:bg-rose-400/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30 dark:border-rose-400/30',
    glow: 'shadow-rose-500/20',
  },
  'commercial-paint-finder': {
    bg: 'bg-orange-500/10 dark:bg-orange-400/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/30 dark:border-orange-400/30',
    glow: 'shadow-orange-500/20',
  },
  'model-reference-scaler': {
    bg: 'bg-blue-500/10 dark:bg-blue-400/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30 dark:border-blue-400/30',
    glow: 'shadow-blue-500/20',
  },
};

interface AppCard {
  id: string;
  title: string;
  description: string;
  route: string;
  status: 'active' | 'coming-soon';
  category: string;
  imageUrl: string;
}

const APPS: AppCard[] = [
  // REFERENCE TOOLS
  {
    id: 'dimension-reference',
    title: 'Dimension Reference',
    description: 'Comprehensive database of standard dimensions for furniture, scenic flats, platforms, and architectural elements.',
    route: 'dimension-reference',
    status: 'active',
    category: 'Reference',
    imageUrl: 'https://images.unsplash.com/photo-1670222061552-c273834aee0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXJuaXR1cmUlMjBkaW1lbnNpb24lMjByZWZlcmVuY2V8ZW58MXx8fHwxNzYzOTcwNzc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'design-history-timeline',
    title: 'Design History Timeline',
    description: 'Interactive archive of architectural and artistic movements from 3000 BCE to present.',
    route: 'design-history-timeline',
    status: 'active',
    category: 'Reference',
    imageUrl: 'https://images.unsplash.com/photo-1721244653652-268631ec049a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwaGlzdG9yeSUyMHRpbWVsaW5lfGVufDF8fHx8MTc2Mzk3MDc3OHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'classical-architecture-guide',
    title: 'Classical Architecture',
    description: 'Comprehensive guide to classical orders, molding profiles, and pediment types.',
    route: 'classical-architecture-guide',
    status: 'active',
    category: 'Reference',
    imageUrl: 'https://images.unsplash.com/photo-1632731187075-11c50d94bd5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBhcmNoaXRlY3R1cmUlMjBjb2x1bW5zfGVufDF8fHx8MTc2Mzk3MDc3OHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  
  // CALCULATION TOOLS
  {
    id: 'scale-converter',
    title: '3D Print Scale Calculator',
    description: 'Convert theatrical dimensions to 3D printable scale. Input imperial, get mm output.',
    route: 'architecture-scale-converter',
    status: 'active',
    category: 'Calculation',
    imageUrl: 'https://images.unsplash.com/photo-1544704784-59bcc978c9c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzZCUyMHByaW50ZXIlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2Mzk3MDQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'rosco-paint-calculator',
    title: 'Rosco Paint Calculator',
    description: 'Calculate Rosco paint mixing formulas with precision measurements.',
    route: 'rosco-paint-calculator',
    status: 'active',
    category: 'Calculation',
    imageUrl: 'https://images.unsplash.com/photo-1660861472949-a26dfbf0b0f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGFpbnQlMjBicnVzaHxlbnwxfHx8fDE3NjM5NzA3Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'commercial-paint-finder',
    title: 'Commercial Paint Finder',
    description: 'Find commercial paint matches for theatrical colors and formulas.',
    route: 'commercial-paint-finder',
    status: 'active',
    category: 'Calculation',
    imageUrl: 'https://images.unsplash.com/photo-1560121361-3968dbf2b749?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludCUyMGNvbG9yJTIwc3dhdGNoZXN8ZW58MXx8fHwxNzYzOTY3MTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  
  // DESIGN TOOLS
  {
    id: 'model-reference-scaler',
    title: 'Model Reference Scaler',
    description: 'Scale reference photos for model making. Upload images, set scale, export to PDF.',
    route: 'model-reference-scaler',
    status: 'active',
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1680079526971-92914190f440?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwc2NhbGUlMjBtb2RlbHxlbnwxfHx8fDE3NjM5MDU1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

interface AppStudioProps {
  onNavigate?: (page: string) => void;
}

export function AppStudio({ onNavigate }: AppStudioProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Reference', 'Calculation', 'Design'];

  const filteredApps = selectedCategory === 'all' 
    ? APPS 
    : APPS.filter(app => app.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 pt-32 pb-24">
      
      {/* Hero Section with Robot Coffee Image */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
                <Code2 className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                <span className="font-pixel text-[10px] tracking-[0.2em] text-neutral-600 dark:text-neutral-400">EXPERIMENTAL PLAYGROUND</span>
              </div>
              
              <div>
                <h1 className="font-display text-black dark:text-white text-5xl md:text-6xl lg:text-7xl mb-6 leading-[0.95] italic">
                  App Studio
                </h1>
                <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  A collection of interactive tools and calculators designed for scenic designers, 
                  technical directors, and theatre professionals. Built for speed, precision, and practicality.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Coffee className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                <p className="text-sm text-neutral-500 dark:text-neutral-500 italic">
                  Where craft meets code (and occasionally, coffee with robots)
                </p>
              </div>
            </motion.div>

            {/* Right: Robot Coffee Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden"
            >
              <img 
                src={robotCoffeeImage} 
                alt="Coffee with a robot - App Studio" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 lg:px-12 pb-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              const label = cat === 'all' ? 'ALL TOOLS' : cat.toUpperCase();
              
              return (
                <motion.button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`px-6 py-3 font-pixel text-[10px] tracking-[0.2em] transition-all rounded-full ${
                    isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app, index) => {
              const colors = TOOL_COLORS[app.id] || TOOL_COLORS['dimension-reference'];
              
              return (
                <motion.button
                  key={app.id}
                  onClick={() => app.status === 'active' && onNavigate?.(app.route)}
                  disabled={app.status === 'coming-soon'}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`group text-left p-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl transition-all hover:scale-[1.02] hover:shadow-lg ${colors.glow} ${
                    app.status === 'coming-soon' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {/* Icon with accent color border */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${colors.border}`}>
                      <img 
                        src={app.imageUrl} 
                        alt={app.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {app.status === 'coming-soon' && (
                      <span className="px-3 py-1 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-full font-pixel text-[8px] tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                        SOON
                      </span>
                    )}
                  </div>
                  
                  {/* Title with accent color */}
                  <h3 className={`font-display text-xl md:text-2xl mb-3 transition-colors italic ${colors.text}`}>
                    {app.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                    {app.description}
                  </p>
                  
                  {/* CTA with accent color */}
                  {app.status === 'active' && (
                    <div className={`flex items-center gap-2 font-pixel text-[10px] tracking-[0.2em] ${colors.text} opacity-70 group-hover:opacity-100 transition-opacity`}>
                      <span>LAUNCH</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA - Glass Card */}
      <section className="px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-12 md:p-16 text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight italic">
              Have a Tool Idea?
            </h2>
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              These tools are built based on real needs in the scenic design community. 
              Have an idea for a new calculator or reference tool? Let's collaborate.
            </p>
            <button
              onClick={() => onNavigate?.('contact')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity rounded-full"
            >
              <span className="font-pixel text-[10px] tracking-[0.3em]">GET IN TOUCH</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}