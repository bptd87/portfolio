import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface StudioProps {
  onNavigate: (page: string) => void;
}

// Main category cards
const MAIN_SECTIONS = [
  {
    id: 'tutorials',
    title: 'Tutorials',
    description: 'Video walkthroughs on Vectorworks, 3D modeling, and project breakdowns.',
    image: '/images/studio/tutorials.webp',
    route: 'scenic-studio',
    comingSoon: false,
  },
  {
    id: 'app-studio',
    title: 'App Studio',
    description: 'Free web apps—scale calculators, dimension references, paint mixers.',
    image: '/images/studio/app-studio.webp',
    route: 'app-studio',
    comingSoon: false,
  },
  {
    id: 'vault',
    title: 'Vault',
    description: 'Vectorworks library—venue files, furniture, props, hardware, architectural elements, figures, and textures.',
    image: '/images/studio/vault.webp',
    route: 'scenic-vault',
    comingSoon: false,
  },
  {
    id: 'scenic-directory',
    title: 'Scenic Directory',
    description: 'Curated links to organizations, software, suppliers, and archives.',
    image: '/images/studio/directory.webp',
    route: 'directory',
    comingSoon: false,
  },
];

// Quick access tools with images
const QUICK_TOOLS = [
  { 
    name: 'Scale Calculator', 
    route: 'architecture-scale-converter',
    image: '/images/studio/scale-converter-abstract.webp',
  },
  { 
    name: 'Dimension Reference', 
    route: 'dimension-reference',
    image: '/images/studio/dimension-abstract.webp',
  },
  { 
    name: 'Paint Calculator', 
    route: 'rosco-paint-calculator',
    image: '/images/studio/rosco-abstract.webp',
  },
  { 
    name: 'Design History', 
    route: 'design-history-timeline',
    image: '/images/studio/history-abstract.webp',
  },
  { 
    name: 'Classical Orders', 
    route: 'classical-architecture-guide',
    image: '/images/studio/classics-abstract.webp',
  },
  { 
    name: 'Paint Finder', 
    route: 'commercial-paint-finder',
    image: '/images/studio/paint-finder-abstract.webp',
  },
];

export function StudioNew({ onNavigate }: StudioProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="font-pixel text-[11px] tracking-[0.3em] text-cyan-400 uppercase mb-6">
              The Designer's Toolkit
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl mb-6 leading-[0.95] italic">
              Everything you need to design better.
            </h1>
            <p className="font-sans text-lg text-muted-foreground leading-relaxed max-w-xl">
              Learn from tutorials, use purpose-built tools, download ready-made models, 
              and explore curated industry resources. All free, all built for scenic designers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Grid - 4 Cards */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MAIN_SECTIONS.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                onClick={() => section.route && onNavigate(section.route)}
                className={`group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted ${
                  section.route ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Background Image */}
                <img 
                  src={section.image}
                  alt={section.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
                    section.route ? 'group-hover:scale-105' : ''
                  } ${section.comingSoon ? 'opacity-70' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Coming Soon Badge */}
                {section.comingSoon && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1.5 bg-amber-500 text-black font-pixel text-[9px] tracking-[0.15em] rounded-full uppercase">
                      Coming Soon
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                  <h3 className="font-display text-2xl italic mb-2 flex items-center gap-2">
                    {section.title}
                    {section.route && (
                      <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    )}
                  </h3>
                  <p className="font-sans text-sm text-white/80 line-clamp-2">
                    {section.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Tools Section */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="font-display text-3xl md:text-4xl italic mb-3">
                Quick access to tools.
              </h2>
              <p className="font-sans text-muted-foreground max-w-xl">
                Jump straight into the calculators, references, and utilities you need most.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_TOOLS.map((tool, index) => (
                <motion.button
                  key={tool.route}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  onClick={() => onNavigate(tool.route)}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-muted"
                >
                  {/* Background Image */}
                  <img 
                    src={tool.image}
                    alt={tool.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />

                  {/* Label */}
                  <div className="absolute inset-x-0 bottom-0 p-3 z-10">
                    <span className="font-sans text-sm font-medium flex items-center gap-1">
                      {tool.name}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 lg:px-12 pb-20">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-muted rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div>
              <h2 className="font-display text-2xl md:text-3xl italic mb-3">
                Built by a working designer.
              </h2>
              <p className="font-sans text-muted-foreground max-w-lg">
                These tools come from real production needs. Have an idea for something that would help your workflow? Let's build it together.
              </p>
            </div>
            <button
              onClick={() => onNavigate('contact')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 group"
            >
              <span className="font-sans">Get in Touch</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

export default StudioNew;
