import React from 'react';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
  autoplay?: boolean;
  className?: string;
}

export function YouTubeEmbed({ url, title = 'Video', autoplay = false, className = '' }: YouTubeEmbedProps) {
  // Extract video ID from various YouTube OR Vimeo URL formats
  const getVideoInfo = (url: string): { type: 'youtube' | 'vimeo', id: string } | null => {
    if (!url) return null;

    // Vimeo
    // Standard: https://vimeo.com/76979871
    // Player: https://player.vimeo.com/video/76979871
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    if (vimeoMatch) {
      return { type: 'vimeo', id: vimeoMatch[1] };
    }

    // YouTube
    // Already a video ID (11 chars, no slash)
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
      return { type: 'youtube', id: url };
    }

    // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
    const standardMatch = url.match(/[?&]v=([^&]+)/);
    if (standardMatch) return { type: 'youtube', id: standardMatch[1] };

    // Short URL: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) return { type: 'youtube', id: shortMatch[1] };

    // Embed URL: https://www.youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/\/embed\/([^?]+)/);
    if (embedMatch) return { type: 'youtube', id: embedMatch[1] };

    return null;
  };

  const videoInfo = getVideoInfo(url);

  if (!videoInfo) {
    return (
      <div className="w-full aspect-video bg-neutral-900 flex items-center justify-center">
        <p className="text-sm text-white/30 font-pixel uppercase tracking-widest">Invalid Link</p>
      </div>
    );
  }

  let embedUrl = '';
  if (videoInfo.type === 'youtube') {
    // Base params: disable related videos (from other channels), hide info, hide annotations
    const params = new URLSearchParams({
      rel: '0',
      showinfo: '0',
      iv_load_policy: '3',
      ...(autoplay ? { autoplay: '1', mute: '1' } : {})
    });
    embedUrl = `https://www.youtube.com/embed/${videoInfo.id}?${params.toString()}`;
  } else {
    // Vimeo
    embedUrl = `https://player.vimeo.com/video/${videoInfo.id}?autoplay=${autoplay ? 1 : 0}&title=0&byline=0&portrait=0`;
  }

  return (
    <div className={`relative w-full aspect-video bg-black ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}