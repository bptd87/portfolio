import React from 'react';
import { Heart, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { LikeButton } from './LikeButton';

interface MasonryProject {
  id: string;
  title: string;
  venue: string;
  location: string;
  year: number;
  category: string;
  subcategory: string;
  image?: string;
  cardImage?: string;
  likes: number;
  views: number;
  slug: string;
}

interface MasonryGridProps {
  projects: MasonryProject[];
  onProjectClick: (slug: string) => void;
}

export function MasonryGrid({ projects, onProjectClick }: MasonryGridProps) {
  // Get the correct image property
  const getProjectImage = (project: MasonryProject) => {
    return project.cardImage || project.image;
  };

  return (
    <div className="w-full">
      <ResponsiveMasonry
        columnsCountBreakPoints={{350: 1, 750: 2, 1024: 3}}
      >
        <Masonry gutter="24px">
          {projects.map((project, index) => {
            const image = getProjectImage(project);

            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative block w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-accent-brand transition-colors duration-300 cursor-pointer"
                onClick={() => onProjectClick(project.slug)}
              >
                {/* Image or Placeholder */}
                <div className="w-full relative">
                  {image ? (
                    <img
                      src={image}
                      alt={project.title}
                      className="w-full h-auto block transition-opacity duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] flex flex-col items-center justify-center text-black/15 dark:text-white/15 bg-secondary">
                      <div className="w-16 h-16 border border-current mb-3" />
                      <p className="text-[10px] uppercase tracking-widest font-medium">Image Coming Soon</p>
                    </div>
                  )}

                  {/* Overlay on hover - Only if image exists */}
                  {image && (
                    <>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Project Info Overlay */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-accent-brand text-xs uppercase tracking-widest mb-2 font-medium">{project.subcategory}</p>
                        <h3 className="text-white font-medium text-lg leading-tight mb-1">{project.title}</h3>
                        <p className="text-white/60 text-sm">{project.venue} · {project.year}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile/Fallback Info (visible when no image or on touch devices if hover doesn't work well, 
                    but for this strict design, we rely on the hover for desktop or always show below if we prefer. 
                    Let's stick to the "Theatrical Cinema" aesthetic: Clean image, info on hover for desktop. 
                    For mobile (1 column), we might want info below. Masonry handles responsive, so we can check width or just always show info below on small screens? 
                    
                    Actually, standard Portfolio masonry often shows info below image to keep it clean. 
                    Let's put info BELOW the image for a "caption" feel which works great for variable heights.
                    This avoids covering the "not same size" images with text.
                */}
                
                {/* Always visible info bar below image (Clean Gallery Style) */}
                <div className="p-4 bg-background border-t border-black/5 dark:border-white/5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-medium text-base leading-tight mb-1 group-hover:text-accent-brand transition-colors">{project.title}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{project.subcategory}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                    <p className="text-xs text-muted-foreground">{project.year}</p>
                    
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1.5 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                          <LikeButton projectId={project.id} initialLikes={project.likes} size="sm" compact showCount={true} />
                       </div>
                       <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{project.views || 0}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
}