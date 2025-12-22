import React, { useState, useEffect } from 'react';
import { Play, Search, Clock, Layers, Box, Workflow, FileText, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getAllTutorials } from '../data/tutorials';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useTheme } from '../components/ThemeProvider';

interface ScenicStudioProps {
  onNavigate: (page: string) => void;
}

export function ScenicStudio({ onNavigate }: ScenicStudioProps) {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tutorials, setTutorials] = useState(getAllTutorials());

  const categories = [
    { id: 'all', name: 'All Tutorials', icon: Play },
    { id: 'quick-tips', name: 'Quick Tips', icon: Zap },
    { id: 'walkthroughs', name: 'Project Walkthroughs', icon: Layers },
    { id: '3d-modeling', name: '3D Modeling & Visualization', icon: Box },
    { id: 'workflow', name: 'Resources & Workflow', icon: Workflow },
    { id: '2d-drafting', name: '2D Drafting & Docs', icon: FileText }
  ];

  // Try to fetch from server, fallback to static data
  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/tutorials`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.tutorials && data.tutorials.length > 0) {
            setTutorials(data.tutorials);
          }
        }
      } catch (err) {
      }
    };

    fetchTutorials();
  }, []);

  // Filter tutorials
  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return tutorials.length;
    return tutorials.filter(t => t.category === categoryId).length;
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 relative overflow-hidden pt-32 pb-24"
      data-nav={theme === 'dark' ? 'dark' : 'light'}
    >

      {/* Hero Section - Modern Nothing.tech style */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Title */}
            <div>
              <div className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em] mb-4">SCENIC STUDIO</div>
              <h1 className="font-display text-black dark:text-white text-6xl md:text-7xl lg:text-8xl mb-6 leading-[0.95] italic">
                Video Tutorials
              </h1>
              <p className="text-xl md:text-2xl text-black/70 dark:text-white/70 max-w-3xl leading-relaxed">
                Master Vectorworks, learn 3D modeling techniques, and streamline your scenic design workflow with practical, real-world examples.
              </p>
            </div>

            {/* Stats Cards - Glass style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-20">
              <div className="flex items-center gap-3 p-4 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl">
                <Play className="w-5 h-5 text-black/40 dark:text-white/40" />
                <span className="text-sm">{tutorials.length} Tutorials</span>
              </div>

              <div className="flex items-center gap-3 p-4 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl">
                <Layers className="w-5 h-5 text-black/40 dark:text-white/40" />
                <span className="text-sm">{categories.length - 1} Categories</span>
              </div>

              <a
                href="/scenic-vault"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('scenic-vault');
                }}
                className="flex items-center gap-3 p-4 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl hover:border-black/30 dark:hover:border-white/30 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60 transition-all cursor-pointer"
              >
                <Box className="w-5 h-5 text-black/40 dark:text-white/40" />
                <span className="text-sm">Scenic Vault →</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Bar - Glass Card */}
      <section className="px-6 lg:px-12 pb-8">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl p-2"
          >
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-transparent text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter - Glass Cards */}
      <section className="px-6 lg:px-12 pb-12">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            {categories.map((category, index) => {
              const Icon = category.icon;
              const count = getCategoryCount(category.id);
              const isActive = selectedCategory === category.id;

              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-5 py-3 backdrop-blur-xl border rounded-3xl transition-all whitespace-nowrap ${isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-neutral-200/60 dark:bg-neutral-900/60 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
                    }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.name}</span>
                  <span className={`text-xs ${isActive ? 'opacity-60' : 'opacity-40'}`}>({count})</span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Tutorials Grid */}
      <section className="px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          {filteredTutorials.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl p-12">
                <Search className="w-16 h-16 mx-auto mb-6 text-black/20 dark:text-white/20" />
                <p className="text-xl text-black/40 dark:text-white/40">
                  {searchQuery ? `No tutorials found for "${searchQuery}"` : 'No tutorials in this category yet'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-6 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white underline transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutorials.map((tutorial, index) => (
                <motion.button
                  key={tutorial.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  onClick={() => onNavigate(`scenic-studio/${tutorial.slug}`)}
                  className="group text-left cursor-pointer"
                  whileHover={{ y: -4 }}
                >
                  {/* Glass Card Container */}
                  <div className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden hover:border-black/30 dark:hover:border-white/30 transition-all">

                    {/* Video Thumbnail */}
                    <div className="relative aspect-[16/9] bg-black overflow-hidden">
                      <ImageWithFallback
                        src={tutorial.thumbnail}
                        alt={tutorial.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                        </div>
                      </div>
                      {/* Duration Badge */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur-sm">
                        <Clock className="w-3 h-3" />
                        <span>{tutorial.duration}</span>
                      </div>
                    </div>

                    {/* Tutorial Info */}
                    <div className="p-6">
                      <h3 className="text-lg mb-2 group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-300">
                        {tutorial.title}
                      </h3>
                      <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed mb-3">
                        {tutorial.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-black/40 dark:text-white/40">
                        <span>{new Date(tutorial.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {filteredTutorials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-24 text-center"
            >
              <div className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl p-12">
                <p className="text-xl md:text-2xl mb-8 text-black/70 dark:text-white/70">
                  Interested in reading about my design philosophy?
                </p>
                <motion.button
                  onClick={() => onNavigate('scenic-insights')}
                  className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-sm tracking-wider">READ ARTICLES</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}