import React from 'react';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
  autoplay?: boolean;
  className?: string;
}

export function YouTubeEmbed({ url, title = 'Video', autoplay = false, className = '' }: YouTubeEmbedProps) {
  // Extract video ID from various YouTube URL formats
  const getVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // Already a video ID
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
      return url;
    }
    
    // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
    const standardMatch = url.match(/[?&]v=([^&]+)/);
    if (standardMatch) return standardMatch[1];
    
    // Short URL: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) return shortMatch[1];
    
    // Embed URL: https://www.youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/\/embed\/([^?]+)/);
    if (embedMatch) return embedMatch[1];
    
    return null;
  };

  const videoId = getVideoId(url);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
        <p className="text-sm opacity-60">Invalid YouTube URL</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1&mute=1' : ''}`;

  return (
    <div className={`relative w-full aspect-video bg-black ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border border-black/10 dark:border-white/10"
      />
    </div>
  );
}