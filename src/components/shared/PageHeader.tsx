import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export type PageHeaderVariant = 'minimal' | 'hero' | 'immersive';

interface PageHeaderProps {
  variant?: PageHeaderVariant;
  title: string;
  subtitle?: string;
  badge?: {
    icon?: LucideIcon;
    text: string;
  };
  backgroundImage?: string;
  withStardust?: boolean;
}

export function PageHeader({
  variant = 'minimal',
  title,
  subtitle,
  badge,
  backgroundImage,
  withStardust = false,
}: PageHeaderProps) {
  
  // Minimal variant - clean header with subtle border
  if (variant === 'minimal') {
    return (
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {badge && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border mb-4">
                {badge.icon && <badge.icon className="w-3.5 h-3.5 text-accent-brand" />}
                <span className="text-xs tracking-wider text-muted-foreground uppercase font-medium">
                  {badge.text}
                </span>
              </div>
            )}
            
            <h1 className="mb-4 text-[60px]">{title}</h1>
            
            {subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Hero variant - medium height with optional background
  if (variant === 'hero') {
    return (
      <div className="relative min-h-[55vh] flex items-center justify-center overflow-hidden mb-16 md:mb-24">
        {backgroundImage && (
          <div className="absolute inset-0">
            <ImageWithFallback
              src={backgroundImage}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}



        <div className="relative z-10 px-4 md:px-6 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 glass border mb-6">
                {badge.icon && <badge.icon className="w-4 h-4 text-accent-brand" />}
                <span className="text-xs tracking-wider text-white uppercase font-medium">
                  {badge.text}
                </span>
              </div>
            )}

            <h1 
              className="text-4xl md:text-5xl lg:text-6xl tracking-tight text-white mb-5"
              style={{ 
                textShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                letterSpacing: '-0.02em'
              }}
            >
              {title}
            </h1>

            {subtitle && (
              <p 
                className="text-base md:text-lg tracking-wide text-white/95 max-w-2xl mx-auto leading-relaxed"
                style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)' }}
              >
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Immersive variant - large, cinematic
  if (variant === 'immersive') {
    return (
      <div className="relative min-h-[75vh] flex items-center justify-center overflow-hidden mb-24 md:mb-32">
        {backgroundImage && (
          <div className="absolute inset-0">
            <ImageWithFallback
              src={backgroundImage}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}

        <div className="relative z-10 px-4 md:px-6 max-w-7xl mx-auto text-center">
          {badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 glass border mb-8"
            >
              {badge.icon && <badge.icon className="w-4 h-4 text-accent-brand" />}
              <span className="text-xs tracking-wider text-white uppercase font-medium">
                {badge.text}
              </span>
            </motion.div>
          )}

          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl tracking-tight text-white mb-6"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ 
              textShadow: '0 6px 24px rgba(0, 0, 0, 0.7)',
              letterSpacing: '-0.03em'
            }}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p 
              className="text-lg md:text-xl tracking-wide text-white/95 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)' }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
