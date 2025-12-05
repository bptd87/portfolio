import React, { useState } from 'react';
import { FileText, Sparkles, X } from 'lucide-react';
import { ContentBlock } from './BlockEditor';

interface ContentFormatterProps {
  onContentFormatted: (blocks: ContentBlock[]) => void;
}

export function ContentFormatter({ onContentFormatted }: ContentFormatterProps) {
  const [showModal, setShowModal] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Smart text parser that creates structured content blocks
  const formatBlogContent = (text: string): ContentBlock[] => {
    if (!text.trim()) return [];

    const blocks: ContentBlock[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let paragraphCount = 0;
    let lastBlockType: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Detect headings (lines that are short, don't end with punctuation, or are in ALL CAPS)
      const isAllCaps = line === line.toUpperCase() && line.length > 3;
      const isShortLine = line.length < 60 && !line.match(/[.!?]$/);
      const startsWithNumber = /^\d+\.?\s/.test(line);
      
      if ((isAllCaps || (isShortLine && i === 0)) && !startsWithNumber) {
        blocks.push({
          id: `block-${Date.now()}-${blocks.length}`,
          type: 'heading',
          content: line,
          metadata: { level: 2 }
        });
        lastBlockType = 'heading';
      }
      // Detect subheadings (short lines after paragraphs)
      else if (isShortLine && lastBlockType === 'paragraph' && !startsWithNumber) {
        blocks.push({
          id: `block-${Date.now()}-${blocks.length}`,
          type: 'heading',
          content: line,
          metadata: { level: 3 }
        });
        lastBlockType = 'subheading';
      }
      // Detect quotes (lines in quotes or starting with quote characters)
      else if (line.match(/^["'""]|["'""]$/) || line.startsWith('>')) {
        const cleanedQuote = line.replace(/^["'"">]\s*|\s*["'""]$/g, '');
        blocks.push({
          id: `block-${Date.now()}-${blocks.length}`,
          type: 'quote',
          content: cleanedQuote
        });
        lastBlockType = 'quote';
      }
      // Regular paragraph
      else {
        blocks.push({
          id: `block-${Date.now()}-${blocks.length}`,
          type: 'paragraph',
          content: line
        });
        paragraphCount++;
        lastBlockType = 'paragraph';

        // Suggest image placement after every 3-4 paragraphs
        if (paragraphCount % 3 === 0 && i < lines.length - 1) {
          blocks.push({
            id: `block-${Date.now()}-${blocks.length}`,
            type: 'image',
            content: '',
            metadata: {
              alt: 'Add image description',
              caption: `Suggested after paragraph ${paragraphCount}`
            }
          });
        }
      }
    }

    // Ensure there's at least one image placeholder if none exist
    if (!blocks.some(b => b.type === 'image') && blocks.length > 3) {
      const midPoint = Math.floor(blocks.length / 2);
      blocks.splice(midPoint, 0, {
        id: `block-${Date.now()}-${blocks.length}`,
        type: 'image',
        content: '',
        metadata: {
          alt: 'Add image description',
          caption: 'Featured image suggestion'
        }
      });
    }

    return blocks;
  };

  const handleFormat = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const blocks = formatBlogContent(rawText);
      onContentFormatted(blocks);
      setIsProcessing(false);
      setShowModal(false);
      setRawText('');
    }, 500);
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 border border-accent-brand text-accent-brand hover:bg-accent-brand/5 transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-xs tracking-wider uppercase">Format Raw Text</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h3 className="tracking-tight text-lg mb-1">Format Raw Blog Text</h3>
                <p className="text-xs text-gray-400">
                  Paste your blog content and AI will structure it into blocks with smart formatting
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 opacity-60 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Paste Your Blog Content
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste your blog text here...

The formatter will automatically:
• Detect headings and subheadings
• Format paragraphs
• Extract quotes
• Suggest image placements
• Structure your content professionally"
                  className="w-full h-[400px] bg-background border border-border focus:border-accent-brand focus:outline-none p-4 resize-none font-mono text-sm"
                />
              </div>

              {/* Instructions */}
              <div className="bg-accent-brand/5 border border-accent-brand/20 p-4">
                <h4 className="text-xs tracking-wider uppercase text-gray-300 mb-2">How It Works</h4>
                <ul className="text-xs space-y-1 opacity-80">
                  <li>• <strong>Headings:</strong> ALL CAPS or short lines will become headings</li>
                  <li>• <strong>Quotes:</strong> Text in "quotes" or starting with &gt; becomes quote blocks</li>
                  <li>• <strong>Paragraphs:</strong> Regular text becomes paragraph blocks</li>
                  <li>• <strong>Images:</strong> Automatic placeholders every 3-4 paragraphs</li>
                  <li>• <strong>Smart:</strong> Blocks are added to the end of your current content</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleFormat}
                  disabled={!rawText.trim() || isProcessing}
                  className={`flex items-center gap-2 px-6 py-2 transition-all ${
                    rawText.trim() && !isProcessing
                      ? 'bg-accent-brand text-white hover:opacity-90'
                      : 'bg-secondary text-foreground/30 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-xs tracking-wider uppercase">Formatting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs tracking-wider uppercase">Format & Add to Article</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-border hover:border-foreground transition-colors"
                >
                  <span className="text-xs tracking-wider uppercase">Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}