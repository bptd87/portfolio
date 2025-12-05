import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2, ImagePlus, FileText, Hash } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AIProjectAssistantProps {
  projectData: {
    title?: string;
    category?: string;
    venue?: string;
    year?: number;
    images?: string[];
  };
  onDescriptionGenerated?: (description: string) => void;
  onTagsGenerated?: (tags: string[]) => void;
  onThumbnailSelected?: (imageUrl: string) => void;
}

export function AIProjectAssistant({
  projectData,
  onDescriptionGenerated,
  onTagsGenerated,
  onThumbnailSelected,
}: AIProjectAssistantProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [helpText, setHelpText] = useState('');

  const callAI = async (endpoint: string, body: any) => {
    const token = sessionStorage.getItem('admin_token');
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          // Token in Authorization header,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'AI request failed');
    }
    return data;
  };

  const handleGenerateDescription = async () => {
    setLoading('description');
    setError('');
    setHelpText('');

    try {
      const data = await callAI('generate-description', {
        title: projectData.title,
        category: projectData.category,
        venue: projectData.venue,
        year: projectData.year,
        imageUrls: projectData.images?.slice(0, 3),
      });

      if (data.success && data.description) {
        onDescriptionGenerated?.(data.description);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate description';
      setError(errorMessage);
      
      if (errorMessage.includes('Figma asset')) {
        setHelpText('💡 TIP: Upload images using the "Upload Image" feature in the admin panel instead of using Figma asset URLs. AI needs publicly accessible image URLs.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateBulkTags = async () => {
    if (!projectData.images || projectData.images.length === 0) {
      setError('Add images first to generate tags');
      return;
    }

    setLoading('bulk-tags');
    setError('');
    setHelpText('');

    try {
      const data = await callAI('generate-bulk-tags', {
        imageUrls: projectData.images,
        context: `${projectData.title} - ${projectData.category}`,
      });

      if (data.success && data.tags) {
        onTagsGenerated?.(data.tags);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate tags';
      setError(errorMessage);
      
      if (errorMessage.includes('Figma asset')) {
        setHelpText('💡 TIP: Upload images using the "Upload Image" feature in the admin panel instead of using Figma asset URLs. AI needs publicly accessible image URLs.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSelectThumbnail = async () => {
    if (!projectData.images || projectData.images.length < 2) {
      setError('Need at least 2 images to auto-select thumbnail');
      return;
    }

    setLoading('thumbnail');
    setError('');
    setHelpText('');

    try {
      const data = await callAI('select-thumbnail', {
        imageUrls: projectData.images,
        context: `${projectData.title} - ${projectData.category}`,
      });

      if (data.success && data.selectedImageUrl) {
        onThumbnailSelected?.(data.selectedImageUrl);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select thumbnail';
      setError(errorMessage);
      
      if (errorMessage.includes('Figma asset')) {
        setHelpText('💡 TIP: Upload images using the "Upload Image" feature in the admin panel instead of using Figma asset URLs. AI needs publicly accessible image URLs.');
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4 bg-gradient-to-br from-purple-600/5 to-blue-600/5 border border-purple-600/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="tracking-tight">AI Project Assistant</h3>
      </div>

      <p className="text-sm opacity-80 mb-6">
        Use AI to supercharge your workflow. Generate compelling descriptions, analyze images for tags, and auto-select the best thumbnail.
      </p>

      {error && (
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
          {error}
        </div>
      )}

      {helpText && (
        <div className="px-4 py-3 bg-yellow-100 border border-yellow-200 text-yellow-800 text-sm mb-4">
          {helpText}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Generate Description */}
        <button
          onClick={handleGenerateDescription}
          disabled={loading !== null || !projectData.title}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'description' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs tracking-wider uppercase">Writing...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase">Write Description</span>
            </>
          )}
        </button>

        {/* Generate Bulk Tags */}
        <button
          onClick={handleGenerateBulkTags}
          disabled={loading !== null || !projectData.images || projectData.images.length === 0}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'bulk-tags' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs tracking-wider uppercase">Analyzing...</span>
            </>
          ) : (
            <>
              <Hash className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase">Generate Tags</span>
            </>
          )}
        </button>

        {/* Select Thumbnail */}
        <button
          onClick={handleSelectThumbnail}
          disabled={loading !== null || !projectData.images || projectData.images.length < 2}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'thumbnail' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs tracking-wider uppercase">Choosing...</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase">Pick Thumbnail</span>
            </>
          )}
        </button>
      </div>

      <div className="text-xs text-gray-400 mt-4">
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-gray-300">Write Description:</strong> AI analyzes your project and writes portfolio-ready text</li>
          <li><strong className="text-gray-300">Generate Tags:</strong> Analyzes all images together for comprehensive tagging</li>
          <li><strong className="text-gray-300">Pick Thumbnail:</strong> AI selects the most compelling cover image</li>
        </ul>
      </div>
    </div>
  );
}
