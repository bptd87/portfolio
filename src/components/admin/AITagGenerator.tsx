import React, { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AITagGeneratorProps {
  imageUrl: string;
  context?: string;
  onTagsGenerated: (tags: string[]) => void;
}

export function AITagGenerator({
  imageUrl,
  context,
  onTagsGenerated,
}: AITagGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setGeneratedTags([]);
    setShowSuccess(false);

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/generate-tags`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({
            imageUrl,
            context,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.tags.length > 0) {
        setGeneratedTags(data.tags);
        onTagsGenerated(data.tags);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to generate tags');
      }
    } catch (err) {
      setError('Failed to connect to AI service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-brand" />
          <h4 className="tracking-tight">AI Tag Generator</h4>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs tracking-wider uppercase">Analyzing...</span>
            </>
          ) : showSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase">Tags Added!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase">Generate Tags with AI</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-purple-600/5 border border-purple-600/20 p-4">
        <p className="text-xs opacity-80">
          <strong>OpenAI Vision will analyze your image</strong> and suggest relevant tags for scenic design, color palettes, architectural elements, mood, materials, and technical approaches.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {generatedTags.length > 0 && (
        <div>
          <p className="text-xs tracking-wider uppercase text-gray-400 mb-2">
            Generated Tags (Added to Keywords & Tags)
          </p>
          <div className="flex flex-wrap gap-2">
            {generatedTags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-600/20 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}