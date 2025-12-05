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
  
  // Calculate object-position from focus point
  const objectPosition = focusPoint 
    ? `${focusPoint.x}% ${focusPoint.y}%` 
    : 'center center';
  
  // Nothing.tech variant - Glass transparency, modern aesthetic
  if (variant === 'nothing') {
    const isFeatured = className.includes('lg:col-span-2') && className.includes('lg:row-span-2');
    const isTall = className.includes('lg:row-span-2');
    const isWide = className.includes('lg:col-span-2');
    
    return (
      <motion.article
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className={`group cursor-pointer block h-full ${className}`}
        onClick={onClick}
      >
        <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 hover:border-white/30 hover:shadow-2xl hover:shadow-white/5 transition-all duration-300">
          {/* Full Background Image */}
          <div className="absolute inset-0">
            {image ? (
              <ImageWithFallback
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ objectPosition }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/40 text-white/10">
                <div className="w-16 h-16 border-2 border-current rounded-lg" />
              </div>
            )}
          </div>

          {/* Gradient Overlay - stronger on larger cards */}
          <div className={`absolute inset-0 ${
            isFeatured 
              ? 'bg-gradient-to-t from-black via-black/60 to-transparent' 
              : isTall
              ? 'bg-gradient-to-t from-black/95 via-black/50 to-transparent'
              : 'bg-gradient-to-t from-black/90 via-black/40 to-transparent'
          }`} />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
            {/* Meta at top for featured */}
            {isFeatured && (
              <div className="absolute top-6 lg:top-8 left-6 lg:left-8 right-6 lg:right-8 flex items-center gap-3">
                <span className="font-pixel text-[9px] text-white/40 tracking-[0.3em] uppercase">
                  {category}
                </span>
                {readTime && (
                  <>
                    <span className="w-px h-3 bg-white/20" />
                    <span className="font-pixel text-[9px] text-white/40 tracking-[0.3em] uppercase">
                      {readTime}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Arrow Icon - top right */}
            <div className="absolute top-6 right-6 lg:top-8 lg:right-8">
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>

            {/* Main Content at bottom */}
            <div>
              {/* Meta for non-featured */}
              {!isFeatured && (
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-pixel text-[9px] text-white/40 tracking-[0.3em] uppercase">
                    {category}
                  </span>
                  {readTime && (
                    <>
                      <span className="w-px h-3 bg-white/20" />
                      <span className="font-pixel text-[9px] text-white/40 tracking-[0.3em] uppercase">
                        {readTime}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Title - size based on card size */}
              <h3 className={`font-display text-white mb-3 group-hover:text-white/80 transition-colors ${
                isFeatured ? 'text-4xl xl:text-5xl' :
                isWide || isTall ? 'text-3xl xl:text-4xl' :
                'text-2xl xl:text-3xl'
              } ${isFeatured ? 'italic' : ''}`}>
                {title}
              </h3>

              {/* Excerpt - only on larger cards */}
              {excerpt && (isFeatured || isTall) && (
                <p className={`text-white/70 leading-relaxed mb-4 ${
                  isFeatured ? 'line-clamp-2 text-base' : 
                  isTall ? 'line-clamp-4 text-sm' : 
                  'line-clamp-2 text-sm'
                }`}>
                  {excerpt}
                </p>
              )}

              {/* Date */}
              <div className="text-xs text-white/40">{date}</div>
            </div>
          </div>
        </div>
      </motion.article>
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
              <ImageWithFallback
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
              <span className="text-xs tracking-widest uppercase text-accent-brand font-medium">
                {category}
              </span>
              <span className="w-px h-3 bg-black/10 dark:bg-white/10" />
              <span className="text-xs tracking-widest uppercase text-black/40 dark:text-white/40">
                {date}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl lg:text-4xl tracking-tight mb-4 group-hover:text-accent-brand transition-colors duration-300">
              {title}
            </h3>

            {excerpt && (
              <p className="text-base text-black/60 dark:text-white/60 leading-relaxed mb-6 max-w-xl">
                {excerpt}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs tracking-widest uppercase font-medium text-black/40 dark:text-white/40 group-hover:text-accent-brand transition-colors">
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
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
          <span className="text-[10px] tracking-widest uppercase text-accent-brand font-medium">
            {category}
          </span>
          <span className="w-px h-2.5 bg-black/10 dark:bg-white/10" />
          <span className="text-[10px] tracking-widest uppercase text-black/40 dark:text-white/40">
            {date}
          </span>
        </div>

        <h3 className="text-xl tracking-tight mb-3 group-hover:text-accent-brand transition-colors duration-300">
          {title}
        </h3>

        {excerpt && (
          <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed mb-6 line-clamp-3 flex-1">
            {excerpt}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
           <span className="text-[10px] tracking-widest uppercase text-black/40 dark:text-white/40 group-hover:text-accent-brand transition-colors">
             Read Article
           </span>
           <ArrowRight className="w-3.5 h-3.5 text-black/20 dark:text-white/20 group-hover:text-accent-brand group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.article>
  );
}