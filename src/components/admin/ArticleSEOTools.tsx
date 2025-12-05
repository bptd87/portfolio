import React, { useState } from 'react';
import { Sparkles, Loader2, Check, Search, FileText, Tags, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ArticleSEOToolsProps {
  title: string;
  excerpt: string;
  content: any[];
  currentTags: string[];
  currentDescription: string;
  currentReadTime: string;
  onTagsGenerated: (tags: string[]) => void;
  onDescriptionGenerated: (description: string) => void;
  onReadTimeGenerated: (readTime: string) => void;
}

export function ArticleSEOTools({
  title,
  excerpt,
  content,
  currentTags,
  currentDescription,
  currentReadTime,
  onTagsGenerated,
  onDescriptionGenerated,
  onReadTimeGenerated,
}: ArticleSEOToolsProps) {
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingReadTime, setLoadingReadTime] = useState(false);
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [error, setError] = useState('');

  const handleGenerateTags = async () => {
    if (!title && !excerpt) {
      setError('Please add a title and excerpt first');
      return;
    }

    setLoadingTags(true);
    setError('');
    setGeneratedTags([]);

    try {
      const token = sessionStorage.getItem('admin_token');
      
      // Extract text content from blocks
      const textContent = content
        .filter((block) => ['paragraph', 'heading', 'quote'].includes(block.type))
        .map((block) => block.content)
        .join(' ')
        .substring(0, 2000); // Limit context size

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/ai/seo-tags`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header,
          },
          body: JSON.stringify({
            title,
            excerpt,
            content: textContent,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.tags.length > 0) {
        setGeneratedTags(data.tags);
        // Merge with existing tags, avoiding duplicates
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
    if (!title && !excerpt) {
      setError('Please add a title and excerpt first');
      return;
    }

    setLoadingDescription(true);
    setError('');
    setGeneratedDescription('');

    try {
      const token = sessionStorage.getItem('admin_token');
      
      // Extract text content from blocks
      const textContent = content
        .filter((block) => ['paragraph', 'heading', 'quote'].includes(block.type))
        .map((block) => block.content)
        .join(' ')
        .substring(0, 2000); // Limit context size

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/ai/seo-description`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header,
          },
          body: JSON.stringify({
            title,
            excerpt,
            content: textContent,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.description) {
        setGeneratedDescription(data.description);
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

  const handleGenerateReadTime = async () => {
    if (!title && !excerpt) {
      setError('Please add a title and excerpt first');
      return;
    }

    setLoadingReadTime(true);
    setError('');
    setGeneratedDescription('');

    try {
      const token = sessionStorage.getItem('admin_token');
      
      // Extract text content from blocks
      const textContent = content
        .filter((block) => ['paragraph', 'heading', 'quote'].includes(block.type))
        .map((block) => block.content)
        .join(' ')
        .substring(0, 2000); // Limit context size

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/ai/seo-read-time`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header,
          },
          body: JSON.stringify({
            title,
            excerpt,
            content: textContent,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.readTime) {
        onReadTimeGenerated(data.readTime);
      } else {
        setError(data.error || 'Failed to generate read time');
      }
    } catch (err) {
      setError('Failed to connect to AI service');
    } finally {
      setLoadingReadTime(false);
    }
  };

  return (
    <div className="border border-border p-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/10 dark:to-blue-950/10">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-accent-brand" />
        <h4 className="tracking-tight">AI SEO Tools</h4>
      </div>

      <div className="bg-background/50 border border-border p-4 mb-4">
        <p className="text-xs opacity-80">
          <strong>AI-powered SEO optimization</strong> – Generate tags and meta descriptions based on your article content.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
          {error}
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
              Analyze article content to suggest relevant tags for better discoverability
            </p>
            {generatedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {generatedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-600/20 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleGenerateTags}
            disabled={loadingTags || !title}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {loadingTags ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs tracking-wider uppercase">Analyzing...</span>
              </>
            ) : generatedTags.length > 0 ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-xs tracking-wider uppercase">Added!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="text-xs tracking-wider uppercase">Generate Tags</span>
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
              Create an SEO-optimized meta description (150-160 characters)
            </p>
            {generatedDescription && (
              <div className="mt-2 px-3 py-2 bg-background border border-border text-sm">
                {generatedDescription}
                <div className="text-[10px] opacity-40 mt-1">
                  {generatedDescription.length} characters
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleGenerateDescription}
            disabled={loadingDescription || !title}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {loadingDescription ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs tracking-wider uppercase">Generating...</span>
              </>
            ) : generatedDescription ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-xs tracking-wider uppercase">Generated!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="text-xs tracking-wider uppercase">Generate</span>
              </>
            )}
          </button>
        </div>

        <div className="h-px bg-border" />

        {/* Read Time Generator */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">Read Time Generator</span>
            </div>
            <p className="text-xs text-gray-400">
              Estimate the read time for your article
            </p>
          </div>
          <button
            onClick={handleGenerateReadTime}
            disabled={loadingReadTime || !title}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {loadingReadTime ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs tracking-wider uppercase">Generating...</span>
              </>
            ) : currentReadTime ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-xs tracking-wider uppercase">Generated!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="text-xs tracking-wider uppercase">Generate</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-[10px] opacity-40 text-center">
          AI suggestions are automatically added to your article fields above
        </p>
      </div>
    </div>
  );
}
