import { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';

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
      color: 'hover:text-[#1DA1F2]',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:text-[#0A66C2]',
    },
  ];

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSocialShare = (e: React.MouseEvent, shareUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          className={`${sizeClasses[size]} rounded-full bg-white/80 dark:bg-white/5 border border-neutral-200 dark:border-white/10 backdrop-blur-md flex items-center justify-center text-neutral-600 dark:text-white hover:bg-white dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all shadow-sm outline-none`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Share project"
        >
          <Share2 className={iconSizes[size]} />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-[200px] bg-background border-white/10 shadow-xl z-[100]">
        {shareLinks.map((link) => (
          <DropdownMenuItem
            key={link.name}
            onClick={(e: React.MouseEvent) => handleSocialShare(e, link.url)}
            className={`cursor-pointer gap-2 ${link.color}`}
          >
            <link.icon className="w-4 h-4" />
            <span>Share on {link.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={copyLink} className="cursor-pointer gap-2">
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
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
