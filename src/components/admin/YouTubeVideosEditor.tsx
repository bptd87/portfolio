import React, { useState } from 'react';
import { Plus, X, Youtube } from 'lucide-react';
import { YouTubeEmbed } from '../shared/YouTubeEmbed';

interface YouTubeVideosEditorProps {
  videos: string[];
  onChange: (videos: string[]) => void;
}

export function YouTubeVideosEditor({ videos = [], onChange }: YouTubeVideosEditorProps) {
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const handleAdd = () => {
    if (!newVideoUrl.trim()) return;
    onChange([...videos, newVideoUrl.trim()]);
    setNewVideoUrl('');
  };

  const handleRemove = (index: number) => {
    onChange(videos.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Youtube className="w-5 h-5 text-red-600" />
        <label className="text-xs tracking-wider uppercase opacity-60">
          YouTube Videos
        </label>
      </div>

      <div className="bg-purple-600/5 border border-purple-600/20 p-4 mb-4">
        <p className="text-xs opacity-80 mb-2">
          <strong>Add YouTube videos to your project.</strong> Paste any YouTube URL format:
        </p>
        <ul className="text-xs opacity-60 space-y-1 list-disc list-inside">
          <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
          <li>https://youtu.be/VIDEO_ID</li>
          <li>https://www.youtube.com/embed/VIDEO_ID</li>
          <li>Or just the video ID: VIDEO_ID</li>
        </ul>
      </div>

      {/* Input Field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newVideoUrl}
          onChange={(e) => setNewVideoUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Paste YouTube URL or video ID"
          className="flex-1 px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-accent-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          disabled={!newVideoUrl.trim()}
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs tracking-wider uppercase">Add</span>
        </button>
      </div>

      {/* Videos List */}
      {videos.length > 0 && (
        <div className="space-y-4 mt-6">
          <p className="text-xs tracking-wider uppercase opacity-60">
            {videos.length} Video{videos.length !== 1 ? 's' : ''}
          </p>
          {videos.map((video, index) => (
            <div key={index} className="border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-mono opacity-60">Video {index + 1}</span>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="p-1 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
                  aria-label="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview */}
              <YouTubeEmbed url={video} title={`Video ${index + 1}`} />

              {/* URL Display */}
              <input
                type="text"
                value={video}
                onChange={(e) => {
                  const updated = [...videos];
                  updated[index] = e.target.value;
                  onChange(updated);
                }}
                className="w-full px-3 py-1.5 bg-background border border-border focus:border-accent-brand focus:outline-none text-xs font-mono"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
