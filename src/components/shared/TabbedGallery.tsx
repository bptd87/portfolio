import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Tab {
  id: string;
  label: string;
}

interface TabbedGalleryProps {
  tabs: Tab[];
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export function TabbedGallery({ tabs, children, className = '' }: TabbedGalleryProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  return (
    <div className={className}>
      {/* Tabs - Minimal Apple style */}
      <div className="flex justify-center gap-8 md:gap-12 mb-12 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm md:text-base transition-colors font-light ${
              activeTab === tab.id
                ? 'text-black dark:text-white'
                : 'text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children(activeTab)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

