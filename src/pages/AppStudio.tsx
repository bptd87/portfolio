import React, { useState } from 'react';
import { ArrowRight, Coffee, Code, Sparkle, GridFour, Ruler, PaintBrush } from 'phosphor-react';
import { motion } from 'motion/react';
import { useTheme } from '../hooks/useTheme';

const robotCoffeeImage = '/images/robot-coffee-hero.webp';

interface AppCard {
  id: string;
  title: string;
  description: string;
  route: string;
  status: 'active' | 'coming-soon';
  category: string;
  image: string;
  icon: React.ElementType;
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
    image: '/images/studio/dimension-abstract.webp',
    icon: GridFour
  },
  {
    id: 'design-history-timeline',
    title: 'Design History Timeline',
    description: 'Interactive archive of architectural and artistic movements from 3000 BCE to present.',
    route: 'design-history-timeline',
    status: 'active',
    category: 'Reference',
    image: '/images/studio/history-abstract.webp',
    icon: Sparkle
  },
  {
    id: 'classical-architecture-guide',
    title: 'Classical Architecture',
    description: 'Comprehensive guide to classical orders, molding profiles, and pediment types.',
    route: 'classical-architecture-guide',
    status: 'active',
    category: 'Reference',
    image: '/images/studio/classics-abstract.webp',
    icon: Ruler
  },

  // CALCULATION TOOLS
  {
    id: 'scale-converter',
    title: 'Scale Calculator',
    description: 'Convert theatrical dimensions to 3D printable scale. Input imperial, get mm output.',
    route: 'architecture-scale-converter',
    status: 'active',
    category: 'Calculation',
    image: '/images/studio/scale-converter-abstract.webp',
    icon: Ruler
  },
  {
    id: 'rosco-paint-calculator',
    title: 'Rosco Paint Calculator',
    description: 'Calculate Rosco paint mixing formulas with precision measurements.',
    route: 'rosco-paint-calculator',
    status: 'active',
    category: 'Calculation',
    image: '/images/studio/rosco-abstract.webp',
    icon: PaintBrush
  },
  {
    id: 'commercial-paint-finder',
    title: 'Commercial Paint Finder',
    description: 'Find commercial paint matches for theatrical colors and formulas.',
    route: 'commercial-paint-finder',
    status: 'active',
    category: 'Calculation',
    image: '/images/studio/paint-finder-abstract.webp',
    icon: PaintBrush
  },

  // DESIGN TOOLS
  {
    id: 'model-reference-scaler',
    title: 'Model Reference Scaler',
    description: 'Scale reference photos for model making. Upload images, set scale, export to PDF.',
    route: 'model-reference-scaler',
    status: 'active',
    category: 'Design',
    image: '/images/studio/model-scaler-abstract.webp',
    icon: Ruler
  },
];

interface AppStudioProps {
  onNavigate?: (page: string) => void;
}

import { SkeletonAppStudio } from '../components/skeletons/SkeletonAppStudio';

export function AppStudio({ onNavigate }: AppStudioProps) {
  const context = useTheme();
  const theme = context?.theme || 'light';
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);

  // Simulate loading for smooth transition
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);



  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = ['all', 'Reference', 'Calculation', 'Design'];

  const filteredApps = selectedCategory === 'all'
    ? APPS
    : APPS.filter(app => app.category === selectedCategory);

  // Programmatic Colors (Fail-Safe)
  const colors = {
    bgMain: isDark ? '#000000' : '#ffffff',
    textMain: isDark ? '#ffffff' : '#000000',
    textMuted: isDark ? '#a1a1aa' : '#52525b',

    // Cards
    cardBg: isDark ? '#18181b' : '#f4f4f5', // Zinc-900 / Zinc-100
    cardBorder: isDark ? '#27272a' : '#e4e4e7',
    cardGlow: isDark ? '0 0 40px -10px rgba(255,255,255,0.05)' : '0 10px 40px -10px rgba(0,0,0,0.05)',

    // Accents
    accent: isDark ? '#22d3ee' : '#0891b2', // Cyan-400 / Cyan-600
    accentBg: isDark ? 'rgba(34, 211, 238, 0.1)' : 'rgba(8, 145, 178, 0.05)',

    // Filter Pills
    pillActiveBg: isDark ? '#ffffff' : '#000000',
    pillActiveText: isDark ? '#000000' : '#ffffff',
    pillInactiveBg: isDark ? '#18181b' : '#f4f4f5',
    pillInactiveText: isDark ? '#a1a1aa' : '#52525b',
  };

  if (loading) {
    return <SkeletonAppStudio />;
  }

  return (
    <div
      className="min-h-screen pt-32 pb-24 overflow-x-hidden transition-colors duration-300"
      style={{ backgroundColor: colors.bgMain, color: colors.textMain }}
    >

      {/* Hero Section */}
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
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.cardBorder
                }}
              >
                <Code className="w-3.5 h-3.5" style={{ color: colors.textMuted }} />
                <span className="font-pixel text-[10px] tracking-[0.2em]" style={{ color: colors.textMuted }}>EXPERIMENTAL PLAYGROUND</span>
              </div>

              <div>
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl mb-6 leading-[0.95] italic">
                  App Studio
                </h1>
                <p className="text-xl md:text-2xl leading-relaxed" style={{ color: colors.textMuted }}>
                  A collection of interactive tools and calculators designed for scenic designers,
                  technical directors, and theatre professionals. Built for speed, precision, and practicality.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Coffee className="w-5 h-5" style={{ color: colors.textMuted }} />
                <p className="text-sm italic" style={{ color: colors.textMuted }}>
                  Where craft meets code (and occasionally, coffee with robots)
                </p>
              </div>
            </motion.div>

            {/* Right: Robot Coffee Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-3xl overflow-hidden border aspect-video lg:aspect-auto h-full max-h-[500px]"
              style={{ borderColor: colors.cardBorder, backgroundColor: colors.cardBg }}
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
                  className="px-6 py-3 font-pixel text-[10px] tracking-[0.2em] transition-all rounded-full border"
                  style={{
                    backgroundColor: isActive ? colors.pillActiveBg : colors.pillInactiveBg,
                    color: isActive ? colors.pillActiveText : colors.pillInactiveText,
                    borderColor: isActive ? colors.pillActiveBg : colors.cardBorder,
                  }}
                >
                  {label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Apps Grid - Premium Design V2 */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredApps.map((app, index) => {
              const Icon = app.icon;

              return (
                <motion.button
                  key={app.id}
                  onClick={() => app.status === 'active' && onNavigate?.(app.route)}
                  disabled={app.status === 'coming-soon'}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative text-left rounded-3xl overflow-hidden border transition-all duration-500 h-[480px] flex flex-col"
                  style={{
                    borderColor: colors.cardBorder,
                    backgroundColor: colors.cardBg,
                    boxShadow: colors.cardGlow
                  }}
                >
                  {/* Image Area - Half Height */}
                  <div className="h-1/2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                    <img
                      src={app.image}
                      alt={app.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Status Tag */}
                    {app.status === 'coming-soon' && (
                      <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                        <span className="font-pixel text-[8px] tracking-[0.2em] text-white">COMING SOON</span>
                      </div>
                    )}
                  </div>

                  {/* Content Area - Half Height */}
                  <div className="h-1/2 p-8 flex flex-col justify-between relative z-20">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: colors.accentBg, color: colors.accent }}
                        >
                          <Icon size={16} weight="fill" />
                        </div>
                        <span className="font-pixel text-[10px] tracking-[0.2em] uppercase opacity-50">
                          {app.category}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl mb-3 leading-tight group-hover:text-cyan-500 transition-colors duration-300">
                        {app.title}
                      </h3>

                      <p className="text-sm leading-relaxed opacity-70 line-clamp-3">
                        {app.description}
                      </p>
                    </div>

                    {/* CTA */}
                    {app.status === 'active' && (
                      <div
                        className="flex items-center gap-2 font-pixel text-[10px] tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-all transform group-hover:translate-x-1"
                        style={{ color: colors.accent }}
                      >
                        <span>OPEN TOOL</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Idea CTA */}
      <section className="px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="border rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder
            }}
          >
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight italic">
                Have a Tool Idea?
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-70">
                These tools are built based on real needs in the scenic design community.
                Have an idea for a new calculator or reference tool? Let's collaborate.
              </p>
              <button
                onClick={() => onNavigate?.('contact')}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full transition-all hover:scale-105"
                style={{
                  backgroundColor: colors.textMain,
                  color: colors.bgMain
                }}
              >
                <span className="font-pixel text-[10px] tracking-[0.3em]">GET IN TOUCH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

export default AppStudio;