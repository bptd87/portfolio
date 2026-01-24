import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getRecentNews } from '../data/news';

interface NewsSliderProps {
  onNavigate?: (page: string, slug?: string) => void;
}

export function NewsSlider({ onNavigate }: NewsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Get recent news items from centralized data
  const newsItems = getRecentNews(6).map(item => ({
    id: item.id,
    category: item.category.toUpperCase(),
    title: item.title,
    date: new Date(item.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).toUpperCase(),
    link: item.id
  }));

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? newsItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === newsItems.length - 1 ? 0 : prev + 1));
  };

  const handleNewsClick = (newsId: string) => {
    if (onNavigate) {
      onNavigate('news', newsId);
    }
  };

  return (
    <section className="border-t border-black/10 dark:border-white/10 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl tracking-tight text-black dark:text-white mb-1 md:mb-2">
              LATEST UPDATES
            </h2>
            <p className="text-xs tracking-wide text-black/60 dark:text-white/60 hidden sm:block">
              News and upcoming projects
            </p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {newsItems.map((item) => (
              <div key={item.id} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3">
                <button
                  onClick={() => handleNewsClick(item.link)}
                  className="block group w-full text-left"
                >
                  <div className="aspect-[16/10] overflow-hidden mb-4 bg-gradient-to-br from-theatrical-gold/20 via-spotlight/20 to-black/20 dark:from-theatrical-gold/10 dark:via-spotlight/10 dark:to-black/10">
                    <div className="w-full h-full bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10 group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="mb-2">
                    <span className="text-[10px] tracking-widest text-theatrical-gold dark:text-theatrical-gold">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-sm tracking-wide text-black dark:text-white mb-2 group-hover:opacity-70 transition-opacity line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs tracking-wide text-black/60 dark:text-white/60">
                    {item.date}
                  </p>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6 md:mt-8">
          {newsItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-theatrical-gold dark:bg-theatrical-gold'
                  : 'bg-black/20 dark:bg-white/20'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* View All News */}
        <div className="text-center mt-8">
          <button
            onClick={() => onNavigate?.('news')}
            className="inline-flex items-center gap-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
          >
            View All News
            <span className="text-theatrical-gold">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
