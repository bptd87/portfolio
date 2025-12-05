import React from 'react';
import authorImage from 'figma:asset/dcada7a625a80d207e3ddd130f4b111915fb5011.png';

interface ArticleAuthorProps {
  onNavigate?: (page: string) => void;
}

export function ArticleAuthor({ onNavigate }: ArticleAuthorProps) {
  return (
    <div className="flex items-center gap-4 pt-8 border-t border-black/10 dark:border-white/10">
      <img
        src={authorImage}
        alt="Brandon PT Davis"
        className="w-16 h-16 grayscale hover:grayscale-0 transition-all duration-300"
      />
      <div>
        <div className="text-sm opacity-40 uppercase tracking-wider mb-1">Written by</div>
        <button
          onClick={() => onNavigate?.('about')}
          className="hover:text-accent-brand transition-colors"
        >
          Brandon PT Davis
        </button>
        <p className="text-xs opacity-60 mt-1">
          Scenic Designer & Experiential Artist
        </p>
      </div>
    </div>
  );
}
