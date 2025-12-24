import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface BlogCardProps {
  title: string;
  excerpt?: string;
  date: string;
  category: string;
  readTime?: string;
  icon?: LucideIcon;
  image?: string;
  focusPoint?: { x: number; y: number }; // Focus point as percentages
  onClick?: () => void;
  index?: number;
  variant?: 'default' | 'compact' | 'featured' | 'nothing';
  className?: string;
}

export function BlogCard({
  title,
  excerpt,
  date,
  category,
  readTime,
  icon: Icon,
  image,
  focusPoint,
  onClick,
  index = 0,
  variant = 'default',
  className = '',
}: BlogCardProps) {

  // Determine colors based on category
  const getCategoryStyles = (cat: string) => {
    const lowerCat = cat.toLowerCase();
    if (lowerCat.includes('philosophy') || lowerCat.includes('insights')) {
      return {
        textClass: 'text-blue-500',
        hex: '#3B82F6', // Blue 500
        border: 'hover:border-blue-500/50',
        shadow: 'hover:shadow-blue-500/5',
        hoverText: 'group-hover:text-blue-500'
      };
    }
    if (lowerCat.includes('process') || lowerCat.includes('highlights')) {
      return {
        textClass: 'text-emerald-500',
        hex: '#10B981', // Emerald 500
        border: 'hover:border-emerald-500/50',
        shadow: 'hover:shadow-emerald-500/5',
        hoverText: 'group-hover:text-emerald-500'
      };
    }
    if (lowerCat.includes('technology') || lowerCat.includes('tutorials')) {
      return {
        textClass: 'text-violet-500',
        hex: '#8B5CF6', // Violet 500
        border: 'hover:border-violet-500/50',
        shadow: 'hover:shadow-violet-500/5',
        hoverText: 'group-hover:text-violet-500'
      };
    }
    if (lowerCat.includes('experiential')) {
      return {
        textClass: 'text-amber-500',
        hex: '#F59E0B', // Amber 500
        border: 'hover:border-amber-500/50',
        shadow: 'hover:shadow-amber-500/5',
        hoverText: 'group-hover:text-amber-500'
      };
    }
    // Default fallback
    return {
      textClass: 'text-studio-gold',
      hex: '#D4AF37', // Studio Gold
      border: 'hover:border-studio-gold/50',
      shadow: 'hover:shadow-studio-gold/5',
      hoverText: 'group-hover:text-studio-gold'
    };
  };

  const styles = getCategoryStyles(category);

  // Calculate object-position from focus point
  const objectPosition = focusPoint
    ? `${focusPoint.x}% ${focusPoint.y}%`
    : 'center center';

  // Portrait variant (was nothing) - Glass transparency, modern aesthetic, uniform
  if (variant === 'nothing') {
    return (
      <article
        className={`group cursor-pointer block h-full w-full ${className}`}
        onClick={onClick}
      >
        <div className={`relative h-full w-full overflow-hidden rounded-2xl border border-white/10 ${styles.border} hover:shadow-2xl ${styles.shadow} transition-all duration-500`}>
          {/* Full Background Image */}
          <div className="absolute inset-0">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ objectPosition, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => console.error('BlogCard Image Error:', image, e)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/40 text-white/10">
                <div className="w-16 h-16 border-2 border-current rounded-lg" />
              </div>
            )}
          </div>

          {/* Gradient Overlay - uniform for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />

          {/* Content Overlay */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            {/* Header: Category + Arrow (Flexbox for alignment) */}
            <div className="flex justify-between items-start gap-4 w-full">
              <span
                className={`font-pixel text-[9px] ${styles.textClass} tracking-[0.2em] uppercase font-bold mt-1`}
                style={{ color: styles.hex }}
              >
                {category}
              </span>

              <ArrowRight
                className={`w-5 h-5 flex-shrink-0 ${styles.hoverText} group-hover:translate-x-1 transition-all`}
                style={{ color: styles.hex }}
              />
            </div>

            {/* Main Content at bottom */}
            <div>
              {/* Title */}
              <h3 className="font-display text-2xl text-white mb-3 leading-tight group-hover:text-white/90 transition-colors">
                {title}
              </h3>

              {/* Date & Read Time */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-pixel tracking-wider uppercase ${styles.textClass}`}
                  style={{ color: styles.hex }}
                >
                  {date}
                </span>

                {readTime && (
                  <>
                    <span
                      className="w-px h-2.5 opacity-40"
                      style={{ backgroundColor: styles.hex }}
                    />
                    <span
                      className={`font-pixel text-[9px] tracking-[0.2em] uppercase ${styles.textClass}`}
                      style={{ color: styles.hex }}
                    >
                      {readTime}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Featured variant (now just a slightly larger, clean version)
  if (variant === 'featured') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group cursor-pointer block"
        onClick={onClick}
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative aspect-[16/9] md:aspect-[3/2] overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => console.error('BlogCard Featured Image Error:', image, e)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black/20 dark:text-white/20">
                <div className="w-12 h-12 border border-current" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="py-2">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`text-xs tracking-widest uppercase ${styles.textClass} font-medium`}
                style={{ color: styles.hex }}
              >
                {category}
              </span>
              <span className="w-px h-3 bg-black/10 dark:bg-white/10" />
              <span className="text-xs tracking-widest uppercase text-black/40 dark:text-white/40">
                {date}
              </span>
            </div>

            <h3 className={`text-2xl md:text-3xl lg:text-4xl tracking-tight mb-4 ${styles.hoverText} transition-colors duration-300`}>
              {title}
            </h3>

            {excerpt && (
              <p className="text-base text-black/60 dark:text-white/60 leading-relaxed mb-6 max-w-xl">
                {excerpt}
              </p>
            )}

            <div className={`flex items-center gap-2 text-xs tracking-widest uppercase font-medium text-black/40 dark:text-white/40 ${styles.hoverText} transition-colors`}>
              <span>Read Article</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  // Default variant (Vertical Card)
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer block h-full flex flex-col"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 mb-6">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => console.error('BlogCard Default Image Error:', image, e)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/20 dark:text-white/20">
            <div className="w-12 h-12 border border-current" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`text-[10px] tracking-widest uppercase ${styles.textClass} font-medium`}
            style={{ color: styles.hex }}
          >
            {category}
          </span>
          <span className="w-px h-2.5 bg-black/10 dark:bg-white/10" />
          <span className="text-[10px] tracking-widest uppercase text-black/40 dark:text-white/40">
            {date}
          </span>
        </div>

        <h3 className={`text-xl tracking-tight mb-3 ${styles.hoverText} transition-colors duration-300`}>
          {title}
        </h3>

        {excerpt && (
          <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed mb-6 line-clamp-3 flex-1">
            {excerpt}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
          <span className={`text-[10px] tracking-widest uppercase text-black/40 dark:text-white/40 ${styles.hoverText} transition-colors`}>
            Read Article
          </span>
          <ArrowRight className={`w-3.5 h-3.5 text-black/20 dark:text-white/20 ${styles.hoverText} group-hover:translate-x-1 transition-all`} />
        </div>
      </div>
    </motion.article>
  );
}