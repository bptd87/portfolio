import React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
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
  href?: string;
  index?: number;
  variant?: 'default' | 'compact' | 'featured' | 'nothing';
  className?: string;
  forceDark?: boolean;
  color?: string; // Add color prop
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
  href,
  index = 0,
  variant = 'default',
  className = '',
  forceDark = false,
  color,
}: BlogCardProps) {

  // Helper to wrap content in Link if href is provided
  const Wrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    if (href) {
      return (
        <Link href={href} className={className} onClick={onClick}>
          {children}
        </Link>
      );
    }
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  };

  // Determine colors based on category
  const getCategoryStyles = (cat: string) => {
    // If a custom color is provided, use it to generate styles
    if (color) {
      return {
        textClass: '', // We'll use inline styles for text color
        hex: color,
        border: 'hover:border-opacity-50', // We might need inline override for border color if we want exact match
        shadow: 'hover:shadow-lg', // Shadow color will need inline style
        hoverText: '' // We handle hover via inline or class logic if possible, but basic colored text is main goal
      };
    }

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

  // Dynamic style for border/shadow if color is provided
  const dynamicStyle = color ? {
    borderColor: color,
    boxShadowColor: color, // This won't work directly in style, need custom handling or accept generic fallback
    '--accent-color': color,
  } as React.CSSProperties : {};

  // Portrait variant (was nothing) - Glass transparency, modern aesthetic, uniform
  if (variant === 'nothing') {
    return (
      <article className={`group block h-full w-full ${className}`}>
        <Wrapper className="block h-full w-full cursor-pointer">
          <div
            className={`relative h-full w-full overflow-hidden rounded-2xl border border-white/10 hover:shadow-2xl transition-all duration-500`}
            style={{
              // Apply dynamic border color on hover via CSS variable or manual class? 
              // Tailwind arbitrary values for hover are hard with dynamic vars.
              // We will use the borderColor style mainly.
              ...(color ? { borderColor: `${color}30` } : {}) // 30 is hex transparency ~20%
            }}
          >
            {/* Add a specific hover border effect element to handle dynamic color */}
            <div
              className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
              style={{ borderColor: styles.hex }}
            />
            {/* Full Background Image */}
            <div className="absolute inset-0">
              <ImageWithFallback
                src={image || ''}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ objectPosition, width: '100%', height: '100%' }}
                optimize="card"
                lazy={index > 1} // Lazy load unless it's the first couple
              />
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
        </Wrapper>
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
        className="group block"
      >
        <Wrapper className="block cursor-pointer">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <div className={`relative aspect-[16/9] md:aspect-[3/2] overflow-hidden border ${forceDark ? 'bg-white/5 border-white/10' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'}`}>
              <ImageWithFallback
                src={image || ''}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                optimize="hero"
                priority={index === 0}
              />
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
                <span className={`w-px h-3 ${forceDark ? 'bg-white/10' : 'bg-black/10 dark:bg-white/10'}`} />
                <span className={`text-xs tracking-widest uppercase ${forceDark ? 'text-white/40' : 'text-black/40 dark:text-white/40'}`}>
                  {date}
                </span>
              </div>

              <h3 className={`text-2xl md:text-3xl lg:text-4xl tracking-tight mb-4 ${styles.hoverText} transition-colors duration-300`}>
                {title}
              </h3>

              {excerpt && (
                <p className={`text-base leading-relaxed mb-6 max-w-xl ${forceDark ? 'text-white/60' : 'text-black/60 dark:text-white/60'}`}>
                  {excerpt}
                </p>
              )}

              <div className={`flex items-center gap-2 text-xs tracking-widest uppercase font-medium ${forceDark ? 'text-white/40' : 'text-black/40 dark:text-white/40'} ${styles.hoverText} transition-colors`}>
                <span>Read Article</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Wrapper>
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
      className="group block h-full flex flex-col"
    >
      <Wrapper className="block h-full flex flex-col cursor-pointer">
        {/* Image */}
        <div className={`relative aspect-[3/2] overflow-hidden border mb-6 ${forceDark ? 'bg-white/5 border-white/10' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'}`}>
          <ImageWithFallback
            src={image || ''}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            optimize="card"
            lazy={index > 1}
          />
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
            <span className={`w-px h-2.5 ${forceDark ? 'bg-white/10' : 'bg-black/10 dark:bg-white/10'}`} />
            <span className={`text-[10px] tracking-widest uppercase ${forceDark ? 'text-white/40' : 'text-black/40 dark:text-white/40'}`}>
              {date}
            </span>
          </div>

          <h3 className={`text-xl tracking-tight mb-3 ${styles.hoverText} transition-colors duration-300 ${forceDark ? 'text-white' : 'text-black dark:text-white'}`}>
            {title}
          </h3>

          {excerpt && (
            <p className={`text-sm leading-relaxed mb-6 line-clamp-3 flex-1 ${forceDark ? 'text-white/60' : 'text-black/60 dark:text-white/60'}`}>
              {excerpt}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
            <span className={`text-[10px] tracking-widest uppercase ${forceDark ? 'text-white/40' : 'text-black/40 dark:text-white/40'} ${styles.hoverText} transition-colors`}>
              Read Article
            </span>
            <ArrowRight className={`w-3.5 h-3.5 ${forceDark ? 'text-white/20' : 'text-black/20 dark:text-white/20'} ${styles.hoverText} group-hover:translate-x-1 transition-all`} />
          </div>
        </div>
      </Wrapper>
    </motion.article>
  );
}