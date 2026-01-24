import React, { useState } from 'react';
import { Sparkles, Loader2, Check, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AIExcerptGeneratorProps {
  title: string;
  content: any[];
  onExcerptGenerated: (excerpt: string) => void;
  disabled?: boolean;
}

export function AIExcerptGenerator({ 
  title, 
  content, 
  onExcerptGenerated,
  disabled 
}: AIExcerptGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastExcerpt, setLastExcerpt] = useState('');

  const handleGenerate = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    
    if (!title) {
      const message = 'Please add a title first';
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('admin_token');
      
      // Extract text content from blocks for context
      const textContent = content
        .filter((block) => ['paragraph', 'heading', 'quote'].includes(block.type))
        .map((block) => block.content)
        .join(' ')
        .substring(0, 3000); // Send robust context

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/ai/generate-excerpt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({
            title,
            content: textContent,
          }),
        }
      );

      if (response.status === 401) {
        const message = 'Session expired. Please refresh the page.';
        setError(message);
        toast.error(message);
        return;
      }

      const data = await response.json();

      if (data.success && data.excerpt) {
        onExcerptGenerated(data.excerpt);
        setLastExcerpt(data.excerpt);
        toast.success('Excerpt generated!');
      } else {
        throw new Error(data.error || 'Failed to generate excerpt');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate excerpt';
      console.error('AI Excerpt Error:', err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleGenerate}
        disabled={loading || disabled || !title}
        className={
          `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            loading
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-200 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30'
          }`
        }
        title="Generate concise summary with AI"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Generate</span>
          </>
        )}
      </button>

      {error ? (
        <span className="text-[10px] text-red-400 text-right">{error}</span>
      ) : lastExcerpt ? (
        <span className="text-[10px] text-zinc-400 text-right">
          Last suggestion: {lastExcerpt.slice(0, 120)}
          {lastExcerpt.length > 120 ? '…' : ''}
        </span>
      ) : null}
    </div>
  );
}
