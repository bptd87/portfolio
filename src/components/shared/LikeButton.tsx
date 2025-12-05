import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface LikeButtonProps {
  projectId: string;
  initialLikes?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  compact?: boolean; // New: just icon, no background
}

export function LikeButton({ 
  projectId: id, 
  initialLikes = 0, 
  size = 'md',
  showCount = true,
  compact = false 
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if user has already liked this project
  useEffect(() => {
    const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '{}');
    setIsLiked(!!likedProjects[id]);
  }, [id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    
    // Optimistic update
    setLikes(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
    
    // Update localStorage
    const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '{}');
    if (newIsLiked) {
      likedProjects[id] = true;
    } else {
      delete likedProjects[id];
    }
    localStorage.setItem('likedProjects', JSON.stringify(likedProjects));
    
    // Send to server
    try {
      const endpoint = newIsLiked ? 'like' : 'unlike';
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/projects/${id}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const data = await response.json();
      if (data.success) {
        // Update with server's count (in case of race conditions)
        setLikes(data.likes);
      }
    } catch (err) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikes(prev => newIsLiked ? Math.max(0, prev - 1) : prev + 1);
    }
    
    setTimeout(() => setIsAnimating(false), 600);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleLike}
        className={`${compact ? 'w-8 h-8 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full' : sizeClasses[size]} border ${compact ? 'border-transparent' : 'border-black/10 dark:border-white/10'} flex items-center justify-center transition-colors ${
          isLiked 
            ? compact ? 'text-accent-brand' : 'bg-accent-brand border-accent-brand text-white' 
            : compact ? 'hover:bg-white dark:hover:bg-black' : 'bg-background hover:border-accent-brand/50'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isLiked ? 'Unlike project' : 'Like project'}
      >
        <motion.div
          animate={isAnimating ? {
            scale: [1, 1.3, 1],
            rotate: [0, isLiked ? 10 : -10, 0],
          } : {}}
          transition={{ duration: 0.4 }}
        >
          <Heart 
            className={`${iconSizes[size]} transition-all ${
              isLiked ? 'fill-current' : ''
            }`}
          />
        </motion.div>
      </motion.button>
      
      {showCount && !compact && (
        <motion.span 
          className={`${textSizes[size]} tracking-wide opacity-60`}
          key={likes}
          initial={{ scale: 1 }}
          animate={{ scale: isAnimating ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {likes.toLocaleString()}
        </motion.span>
      )}
    </div>
  );
}