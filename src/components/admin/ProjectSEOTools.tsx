import React, { useState } from 'react';
import { Sparkles, Loader2, Check, Search, FileText, Tags } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ProjectSEOToolsProps {
  title: string;
  description: string;
  currentTags: string[];
  currentSeoDescription?: string;
  onTagsGenerated: (tags: string[]) => void;
  onDescriptionGenerated: (description: string) => void;
}

export function ProjectSEOTools({
  title,
  description,
  currentTags,
  currentSeoDescription,
  onTagsGenerated,
  onDescriptionGenerated,
}: ProjectSEOToolsProps) {
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleGenerateTags = async () => {
    if (!title && !description) {
      setError('Please add a title and description first');
      return;
    }

    setLoadingTags(true);
    setError('');
    setNote('');
    setGeneratedTags([]);

    try {
      const token = sessionStorage.getItem('admin_token');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/ai/seo-tags`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({
            title,
            excerpt: description.substring(0, 200), // Use description as excerpt
            content: description,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.tags.length > 0) {
        setGeneratedTags(data.tags);
        if (data.note) setNote(data.note);
        const newTags = [...new Set([...currentTags, ...data.tags])];
        onTagsGenerated(newTags);
      } else {
        setError(data.error || 'Failed to generate tags');
      }
    } catch (err) {
      setError('Failed to connect to AI service');
    } finally {
      setLoadingTags(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!title && !description) {
      setError('Please add a title and description first');
      return;
    }

    setLoadingDescription(true);
    setError('');
    setNote('');
    setGeneratedDescription('');

    try {
      const token = sessionStorage.getItem('admin_token');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/ai/seo-description`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({
            title,
            excerpt: description.substring(0, 200),
            content: description,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.description) {
        setGeneratedDescription(data.description);
        if (data.note) setNote(data.note);
        onDescriptionGenerated(data.description);
      } else {
        setError(data.error || 'Failed to generate description');
      }
    } catch (err) {
      setError('Failed to connect to AI service');
    } finally {
      setLoadingDescription(false);
    }
  };

  return (
    <div className="border border-border p-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/10 dark:to-blue-950/10 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-accent-brand" />
        <h4 className="tracking-tight">AI SEO Tools</h4>
      </div>

      {error && (
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4 rounded-lg">
          {error}
        </div>
      )}

      {note && (
        <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs mb-4 rounded-lg flex items-center gap-2">
          <span className="font-medium">Note:</span> {note}
        </div>
      )}

      <div className="space-y-3">
        {/* Tag Generator */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Tags className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">Tag Generator</span>
            </div>
            <p className="text-xs text-gray-400">
              Analyze project content to suggest relevant tags
            </p>
            {generatedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {generatedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-600/20 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleGenerateTags}
            disabled={loadingTags || !title}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap rounded-lg text-xs font-medium"
          >
            {loadingTags ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ANALYZING...</span>
              </>
            ) : generatedTags.length > 0 ? (
              <>
                <Check className="w-4 h-4" />
                <span>ADDED!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>GENERATE TAGS</span>
              </>
            )}
          </button>
        </div>

        <div className="h-px bg-border" />

        {/* Description Generator */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">Meta Description Generator</span>
            </div>
            <p className="text-xs text-gray-400">
              Create an SEO-optimized meta description
            </p>
            {generatedDescription && (
              <div className="mt-2 px-3 py-2 bg-background border border-border text-sm rounded-lg">
                {generatedDescription}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={loadingDescription || !title}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap rounded-lg text-xs font-medium"
          >
            {loadingDescription ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>GENERATING...</span>
              </>
            ) : generatedDescription ? (
              <>
                <Check className="w-4 h-4" />
                <span>GENERATED!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>GENERATE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
