import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Twitter, Linkedin, Link2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ShareButton({ 
  title, 
  description = '', 
  url = typeof window !== 'undefined' ? window.location.href : '',
  size = 'md' 
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'hover:bg-[#1DA1F2] hover:text-white',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:bg-[#0A66C2] hover:text-white',
    },
  ];

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(!showMenu);
  };

  const handleSocialShare = (e: React.MouseEvent, shareUrl: string) => {
    e.stopPropagation();
    e.preventDefault();
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleShareClick}
        className={`${sizeClasses[size]} border border-black/10 dark:border-white/10 bg-background flex items-center justify-center hover:border-accent-brand/50 transition-colors`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Share project"
      >
        <Share2 className={iconSizes[size]} />
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            
            {/* Share menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 bg-background border border-black/10 dark:border-white/10 shadow-lg min-w-[200px]"
            >
              <div className="p-2 space-y-1">
                {shareLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={(e) => handleSocialShare(e, link.url)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${link.color}`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>Share on {link.name}</span>
                  </button>
                ))}
                
                <div className="border-t border-black/10 dark:border-white/10 my-1" />
                
                <button
                  onClick={copyLink}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">Link copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
