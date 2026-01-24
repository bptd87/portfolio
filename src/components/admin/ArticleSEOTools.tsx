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
  const [generatedReadTime, setGeneratedReadTime] = useState('');
  const [tagError, setTagError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [readTimeError, setReadTimeError] = useState('');

  const handleGenerateTags = async () => {
    if (!title && !excerpt) {
      setTagError('Please add a title and excerpt first');
      return;
    }

    setLoadingTags(true);
    setTagError('');
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
            'X-Admin-Token': token || '',
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
        setTagError(data.error || 'Failed to generate tags');
      }
    } catch (err) {
      setTagError('Failed to connect to AI service');
    } finally {
      setLoadingTags(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!title && !excerpt) {
      setDescriptionError('Please add a title and excerpt first');
      return;
    }

    setLoadingDescription(true);
    setDescriptionError('');
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
            'X-Admin-Token': token || '',
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
        setDescriptionError(data.error || 'Failed to generate description');
      }
    } catch (err) {
      setDescriptionError('Failed to connect to AI service');
    } finally {
      setLoadingDescription(false);
    }
  };

  const handleGenerateReadTime = async () => {
    if (!title && !excerpt) {
      setReadTimeError('Please add a title and excerpt first');
      return;
    }

    setLoadingReadTime(true);
    setReadTimeError('');
    setGeneratedReadTime('');

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
            'X-Admin-Token': token || '',
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
        setGeneratedReadTime(data.readTime);
        onReadTimeGenerated(data.readTime);
      } else {
        setReadTimeError(data.error || 'Failed to generate read time');
      }
    } catch (err) {
      setReadTimeError('Failed to connect to AI service');
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
            {tagError && (
              <div className="mt-2 text-xs text-red-400">
                {tagError}
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
            {descriptionError && (
              <div className="mt-2 text-xs text-red-400">
                {descriptionError}
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
            {(generatedReadTime || currentReadTime) && (
              <div className="mt-2 text-xs text-gray-300">
                Suggested read time: {generatedReadTime || currentReadTime}
              </div>
            )}
            {readTimeError && (
              <div className="mt-2 text-xs text-red-400">
                {readTimeError}
              </div>
            )}
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
