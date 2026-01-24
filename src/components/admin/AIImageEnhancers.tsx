import React, { useState } from 'react';
import { Sparkles, Loader2, Type, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AIAltTextGeneratorProps {
  imageUrl: string;
  context?: string;
  onAltTextGenerated: (altText: string) => void;
}

export function AIAltTextGenerator({ imageUrl, context, onAltTextGenerated }: AIAltTextGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [altText, setAltText] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      console.log('AI Alt Text: Checking auth token...', token ? 'Present' : 'Missing');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/generate-alt-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({ imageUrl, context }),
        }
      );

      if (response.status === 401) {
        console.error('AI Alt Text: 401 Unauthorized');
        toast.error('Session expired. Please refresh the page to log in again.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.altText) {
        setAltText(data.altText);
        onAltTextGenerated(data.altText);
      } else {
        throw new Error(data.error || 'Failed to generate alt text');
      }
    } catch (err) {
      console.error('AI Alt Text Error:', err);
      toast.error('Failed to generate alt text. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        title="Generate accessible alt text with AI"
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Type className="w-3 h-3" />
            <span>AI Alt Text</span>
          </>
        )}
      </button>
      {altText && (
        <span className="text-xs text-gray-400 truncate max-w-xs" title={altText}>
          {altText}
        </span>
      )}
    </div>
  );
}

interface AICaptionGeneratorProps {
  imageUrl: string;
  context?: string;
  onCaptionGenerated: (caption: string) => void;
}

export function AICaptionGenerator({ imageUrl, context, onCaptionGenerated }: AICaptionGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/generate-caption`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({ imageUrl, context }),
        }
      );

      const data = await response.json();
      if (data.success && data.caption) {
        setCaption(data.caption);
        onCaptionGenerated(data.caption);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        title="Generate gallery caption with AI"
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Writing...</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-3 h-3" />
            <span>AI Caption</span>
          </>
        )}
      </button>
      {caption && (
        <span className="text-xs text-gray-400 truncate max-w-xs" title={caption}>
          {caption}
        </span>
      )}
    </div>
  );
}
