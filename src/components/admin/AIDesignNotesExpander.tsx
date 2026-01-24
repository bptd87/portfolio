import React, { useState } from 'react';
import { Wand2, Loader2, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AIDesignNotesExpanderProps {
  notes: string[];
  context?: string;
  onNotesExpanded: (expandedNotes: string[]) => void;
}

export function AIDesignNotesExpander({
  notes,
  context,
  onNotesExpanded,
}: AIDesignNotesExpanderProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleExpand = async () => {
    if (notes.length === 0) {
      setError('Add some design notes first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/expand-notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({ notes, context }),
        }
      );

      const data = await response.json();
      if (data.success && data.expandedNotes) {
        onNotesExpanded(data.expandedNotes);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to expand notes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to expand notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          <h4 className="tracking-tight">AI Notes Expander</h4>
        </div>

        <button
          onClick={handleExpand}
          disabled={loading || notes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs tracking-wider uppercase">Expanding...</span>
            </>
          ) : success ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase">Expanded!</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase">Expand Notes with AI</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-purple-600/5 border border-purple-600/20 p-4">
        <p className="text-xs opacity-80">
          <strong>Transform bullet points into full paragraphs (~300 words each).</strong> AI will expand your brief notes into detailed, portfolio-ready descriptions with technical details, artistic intent, and design process while maintaining accuracy.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Example: "Forced perspective columns" → "The design employs forced perspective architectural elements, with Corinthian columns that diminish in scale as they recede upstage, creating an illusion of depth and grandeur within the limited physical space of the proscenium..."
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
