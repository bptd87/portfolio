import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Tab {
  id: string;
  label: string;
}

interface TabbedGalleryProps {
  tabs: Tab[];
  children: (activeTab: string) => React.ReactNode;
  className?: string;
  onTabChange?: (activeTab: string) => void;
}

export function TabbedGallery({ tabs, children, className = '', onTabChange }: TabbedGalleryProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  // Generate unique ID for each instance to avoid conflicts
  const instanceId = useRef(`tabbed-gallery-${Math.random().toString(36).substr(2, 9)}`);

  // Ensure first tab is visible on mount and hide scrollbar
  useEffect(() => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollLeft = 0;
      
      // If last tab is active, scroll to show it fully
      if (activeTab === tabs[tabs.length - 1]?.id) {
        setTimeout(() => {
          if (tabsContainerRef.current) {
            const container = tabsContainerRef.current;
            const maxScroll = container.scrollWidth - container.clientWidth;
            container.scrollTo({
              left: maxScroll,
              behavior: 'smooth',
            });
          }
        }, 100);
      }
      const element = tabsContainerRef.current;
      
      // Force hide scrollbar with inline styles - run immediately and on interval
      const hideScrollbar = () => {
        element.style.setProperty('scrollbar-width', 'none', 'important');
        element.style.setProperty('-ms-overflow-style', 'none', 'important');
        
        // For webkit browsers, try to hide via computed style manipulation
        const style = window.getComputedStyle(element);
        if (style.scrollbarWidth !== 'none') {
          element.style.setProperty('scrollbar-width', 'none', 'important');
        }
      };
      
      hideScrollbar();
      
      // Keep trying to hide it
      const interval = setInterval(hideScrollbar, 100);
      
      // Also inject global style immediately for this instance
      const scrollId = `${instanceId.current}-scroll`;
      let styleTag = document.getElementById(`force-hide-scrollbar-${instanceId.current}`);
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = `force-hide-scrollbar-${instanceId.current}`;
        styleTag.textContent = `
          #${scrollId} {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          #${scrollId}::-webkit-scrollbar {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
            background: transparent !important;
            appearance: none !important;
            -webkit-appearance: none !important;
          }
          #${scrollId}::-webkit-scrollbar-track {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
          }
          #${scrollId}::-webkit-scrollbar-thumb {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
          }
        `;
        document.head.appendChild(styleTag);
      }
      
      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
    
    // Scroll active tab into view if needed, ensuring full visibility
    setTimeout(() => {
      if (tabsContainerRef.current) {
        const activeButton = tabsContainerRef.current.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement;
        if (activeButton) {
          const container = tabsContainerRef.current;
          const containerRect = container.getBoundingClientRect();
          const buttonRect = activeButton.getBoundingClientRect();
          const tabButtons = Array.from(container.querySelectorAll('[data-tab-id]')) as HTMLElement[];
          const isLastTab = tabButtons.indexOf(activeButton) === tabButtons.length - 1;
          
          // Account for arrow button space (44px + gap) plus extra padding
          const arrowSpace = 44 + 24; // 44px button + 24px gap (gap-6)
          const extraPadding = 20; // Extra space to ensure full visibility
          const visibleLeft = containerRect.left + arrowSpace;
          const visibleRight = containerRect.right - arrowSpace;
          
          if (isLastTab) {
            // For the last tab, scroll to show it fully on the right (before right arrow)
            const tabOffsetLeft = activeButton.offsetLeft;
            const tabWidth = activeButton.offsetWidth;
            const containerWidth = container.clientWidth;
            const maxScroll = container.scrollWidth - containerWidth;
            const tabEndPosition = tabOffsetLeft + tabWidth;
            const rightArrowPosition = containerWidth - arrowSpace;
            const targetScroll = tabEndPosition - rightArrowPosition;
            container.scrollTo({
              left: Math.min(maxScroll, Math.max(0, targetScroll)),
              behavior: 'smooth',
            });
          } else {
            // Check if button is outside visible area
            if (buttonRect.left < visibleLeft) {
              const scrollAmount = buttonRect.left - visibleLeft - extraPadding;
              container.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
              });
            } else if (buttonRect.right > visibleRight) {
              const scrollAmount = buttonRect.right - visibleRight + extraPadding;
              container.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
              });
            }
          }
        }
      }
    }, 0);
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsContainerRef.current) {
      console.log('No container ref');
      return;
    }
    
    const container = tabsContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const arrowSpace = 44 + 24; // Button width + gap
    const visibleLeft = containerRect.left + arrowSpace;
    const visibleRight = containerRect.right - arrowSpace;
    
    // Get all tabs
    const tabButtons = Array.from(container.querySelectorAll('[data-tab-id]')) as HTMLElement[];
    if (tabButtons.length === 0) {
      console.log('No tabs found');
      return;
    }
    
    console.log('Direction:', direction, 'Total tabs:', tabButtons.length);
    
    const currentScroll = container.scrollLeft;
    const containerWidth = container.clientWidth;
    
    // Find visible tabs
    let firstVisibleIndex = -1;
    let lastVisibleIndex = -1;
    for (let i = 0; i < tabButtons.length; i++) {
      const tabRect = tabButtons[i].getBoundingClientRect();
      if (tabRect.left < visibleRight && tabRect.right > visibleLeft) {
        if (firstVisibleIndex === -1) firstVisibleIndex = i;
        lastVisibleIndex = i;
      }
    }
    
    console.log('First visible index:', firstVisibleIndex, 'Last visible index:', lastVisibleIndex);
    
    let targetIndex: number;
    if (direction === 'right') {
      // Find the next tab after the last visible one
      if (lastVisibleIndex >= 0 && lastVisibleIndex < tabButtons.length - 1) {
        targetIndex = lastVisibleIndex + 1;
      } else if (lastVisibleIndex === -1) {
        // No tabs visible, show the first one
        targetIndex = 0;
      } else {
        // Already showing the last tab, scroll to ensure it's fully visible
        targetIndex = tabButtons.length - 1;
      }
    } else {
      // Find the first tab that's not fully visible on the left
      if (firstVisibleIndex > 0) {
        targetIndex = firstVisibleIndex - 1;
      } else {
        // Already at the start, scroll to position 0
        targetIndex = 0;
      }
    }
    
    console.log('Target index:', targetIndex);
    
    const targetTab = tabButtons[targetIndex];
    if (!targetTab) {
      console.log('No target tab found');
      return;
    }
    
    // Use getBoundingClientRect for accurate positions (accounts for negative margins)
    const targetTabRect = targetTab.getBoundingClientRect();
    
    const tabWidth = targetTabRect.width;
    // Calculate relative position: getBoundingClientRect gives viewport position,
    // so we need to add current scroll to get the absolute position
    const tabLeftRelative = targetTabRect.left - containerRect.left + currentScroll;
    const tabRightRelative = tabLeftRelative + tabWidth;
    
    // Calculate actual max scroll from the last tab's position
    const lastTab = tabButtons[tabButtons.length - 1];
    const lastTabRect = lastTab.getBoundingClientRect();
    const lastTabRightRelative = lastTabRect.left - containerRect.left + currentScroll + lastTabRect.width;
    // Max scroll should allow the last tab to be fully visible
    const maxScroll = Math.max(0, lastTabRightRelative - (containerWidth - arrowSpace));
    
    console.log('Current scroll:', currentScroll, 'Max scroll:', maxScroll, 'Container width:', containerWidth);
    console.log('Tab left relative:', tabLeftRelative, 'Tab width:', tabWidth, 'Tab right relative:', tabRightRelative);
    
    if (direction === 'right' && targetIndex === tabButtons.length - 1) {
      // For the last tab, scroll to show it fully on the right (before right arrow)
      // Position so the tab's right edge ends just before the right arrow
      const rightArrowPosition = containerWidth - arrowSpace;
      const targetScroll = tabRightRelative - rightArrowPosition;
      
      console.log('Last tab scroll - tabRight:', tabRightRelative, 'arrowPos:', rightArrowPosition, 'targetScroll:', targetScroll);
      
      // Use the calculated maxScroll which accounts for showing the full last tab
      const finalScroll = Math.min(maxScroll, Math.max(0, targetScroll));
      console.log('Final scroll:', finalScroll, 'Will scroll from', currentScroll, 'to', finalScroll);
      
      container.scrollTo({
        left: finalScroll,
        behavior: 'smooth',
      });
    } else if (direction === 'left') {
      // For left scroll, position the target tab at the left edge (after left arrow)
      const targetScroll = tabLeftRelative - arrowSpace;
      console.log('Left scroll - targetScroll:', targetScroll, 'Will scroll from', currentScroll, 'to', targetScroll);
      
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    } else {
      // For right scroll (not last tab), scroll so the target tab starts at the visible left edge
      const targetScroll = tabLeftRelative - arrowSpace;
      console.log('Right scroll - targetScroll:', targetScroll, 'Will scroll from', currentScroll, 'to', targetScroll);
      
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={className}>
      {/* Hero Content/Image Panel - Above tabs, beveled edges */}
      <div className="mb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {children(activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tabs Below Content - Single row with arrow controls */}
      <div className="relative max-w-6xl mx-auto">
        <div className="flex items-center gap-6 relative">
          {/* Left Arrow */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollTabs('left');
            }}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors z-30 relative"
            aria-label="Scroll tabs left"
            type="button"
            style={{ pointerEvents: 'auto' }}
          >
            <ChevronLeft className="w-5 h-5 text-black dark:text-white pointer-events-none" />
          </button>

          {/* Scrollable Tabs Container - Hide scrollbar by clipping with negative margin */}
          <div className="flex-1 overflow-hidden relative z-0" style={{ pointerEvents: 'none' }}>
            <div
              id={`${instanceId.current}-scroll`}
              ref={tabsContainerRef}
              className="overflow-x-auto"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                // Push scrollbar outside visible area but allow tabs to show fully
                paddingRight: '150px',
                marginRight: '-150px',
                width: 'calc(100% + 150px)',
                pointerEvents: 'auto',
              }}
            >
              <div className="flex gap-8 md:gap-12 flex-nowrap pb-2 justify-start" style={{ paddingRight: '150px' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`text-xl md:text-2xl font-light tracking-tight pb-2 relative transition-colors duration-300 whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'text-black dark:text-white'
                      : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Right arrow clicked');
              scrollTabs('right');
            }}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors z-30 relative"
            aria-label="Scroll tabs right"
            type="button"
            style={{ pointerEvents: 'auto', cursor: 'pointer', position: 'relative' }}
          >
            <ChevronRight className="w-5 h-5 text-black dark:text-white pointer-events-none" />
          </button>
        </div>
      </div>
    </div>
  );
}
