import React from 'react';
import { motion } from 'motion/react';
import { Eye } from 'lucide-react';
import { LikeButton } from './LikeButton';
import { ShareButton } from './ShareButton';

interface ProjectCardProps {
  id?: string;
  title: string;
  venue: string;
  location: string;
  year: number;
  category: string;
  subcategory: string;
  description: string;
  image?: string;
  likes?: number;
  views?: number;
  slug?: string;
  onClick?: () => void;
  viewType?: 'grid-large' | 'grid' | 'list';
  index?: number;
}

export function ProjectCard({
  id = '',
  title,
  venue,
  location,
  year,
  category,
  subcategory,
  description,
  image,
  likes = 0,
  views = 0,
  slug = '',
  onClick,
  viewType = 'grid',
  index = 0,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Project Image */}
      <motion.div 
        className="relative aspect-[4/3] overflow-hidden bg-secondary border border-border mb-4"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <p className="text-xs tracking-wider uppercase font-medium">Image Coming Soon</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Engagement overlay - shows on hover */}
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div onClick={(e) => e.stopPropagation()}>
            <ShareButton 
              title={title}
              description={description}
              url={slug ? `${window.location.origin}/portfolio/${slug}` : undefined}
              size="md"
            />
          </div>
        </div>
      </motion.div>

      {/* Project Info */}
      <div className={viewType === 'list' ? 'md:flex md:items-start md:justify-between md:gap-8' : ''}>
        <div className={viewType === 'list' ? 'md:flex-1' : ''}>
          <h3 className="mb-2 group-hover:text-accent-brand transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {venue} • {location} • {year}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 opacity-90">
            {description}
          </p>
          
          {/* Engagement metrics */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div onClick={(e) => e.stopPropagation()}>
                <LikeButton projectId={id} initialLikes={likes} size="sm" />
              </div>
              
              <div className="flex items-center gap-2 text-xs tracking-wide opacity-60">
                <Eye className="w-4 h-4" />
                <span>{views.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* Category Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-3 py-1.5 border border-border text-muted-foreground uppercase tracking-wider font-medium">
              {category}
            </span>
            <span className="text-xs px-3 py-1.5 bg-secondary border border-border text-foreground uppercase tracking-wider font-medium">
              {subcategory}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}