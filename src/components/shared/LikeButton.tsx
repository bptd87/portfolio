import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  projectId: string; // Used as the unique identifier for both projects and posts
  type?: 'project' | 'post';
  initialLikes?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  compact?: boolean; // Just icon, no background
}

export function LikeButton({
  projectId: id,
  type = 'project',
  initialLikes = 0,
  size = 'md',
  showCount = true,
  compact = false
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Determine storage key based on type
  const storageKey = type === 'post' ? 'likedPosts' : 'likedProjects';

  // Check if user has already liked this item
  useEffect(() => {
    const likedItems = JSON.parse(localStorage.getItem(storageKey) || '{}');
    setIsLiked(!!likedItems[id]);
  }, [id, storageKey]);

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
    const likedItems = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (newIsLiked) {
      likedItems[id] = true;
    } else {
      delete likedItems[id];
    }
    localStorage.setItem(storageKey, JSON.stringify(likedItems));

    // Call RPC directly using Supabase client
    try {
      const { supabase } = await import('../../utils/supabase/client');

      const rpcName = type === 'post'
        ? (newIsLiked ? 'increment_article_like' : 'decrement_article_like')
        : (newIsLiked ? 'increment_project_like' : 'decrement_project_like');

      const params = type === 'post' ? { article_id: id } : { project_id: id };

      const { error } = await supabase.rpc(rpcName, params);

      if (error) throw error;

    } catch (err) {
      console.error('Like failed:', err);
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
        className={`group relative flex items-center justify-center rounded-full transition-all ${compact
          ? 'bg-transparent hover:bg-white/10'
          : 'backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10'
          } ${sizeClasses[size]} ${isLiked ? 'text-rose-500' : 'text-white'}`}
        whileTap={{ scale: 0.9 }}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        <Heart
          className={`${iconSizes[size]} transition-all duration-300 ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`}
        />

        {isAnimating && isLiked && (
          <motion.div
            className="absolute inset-0 rounded-full border border-rose-500"
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.button>

      {showCount && (
        <span className={`${textSizes[size]} font-medium text-white/60 min-w-[1ch] tabular-nums`}>
          {likes.toLocaleString()}
        </span>
      )}
    </div>
  );
}