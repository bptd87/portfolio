import { AdminTokens } from '../../styles/admin-tokens';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Type, Image as ImageIcon, Quote, List, Code, Grid, Minus, Video, Film, ChevronDown, ChevronUp, Wand2, Loader2, Upload, Bold, Italic, Link as LinkIcon, FileDown, SeparatorHorizontal, AlertCircle, BookOpen, CheckCircle } from 'lucide-react';
import { ImageGalleryManager, ImageUploader } from './ImageUploader';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { RichTextEditor } from './RichTextEditor';

export type BlockType = 'paragraph' | 'heading' | 'image' | 'quote' | 'list' | 'code' | 'gallery' | 'spacer' | 'video' | 'accordion' | 'file' | 'divider' | 'callout';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    level?: number; // for headings (1-6)
    fileName?: string; // for file blocks
    fileSize?: string; // for file blocks
    fileType?: string; // for file blocks
    alt?: string; // for images
    caption?: string; // for images
    align?: 'left' | 'center' | 'right' | 'full'; // for images
    size?: 'small' | 'medium' | 'large' | 'full'; // for images
    listType?: 'bullet' | 'numbered'; // for lists
    language?: string; // for code blocks
    images?: Array<{ url: string; caption?: string }>; // for gallery
    galleryStyle?: 'grid' | 'carousel' | 'masonry' | 'fullwidth'; // gallery display style
    enableDownload?: boolean; // allow image downloads
    height?: string; // for spacer ('small' | 'medium' | 'large')
    videoType?: 'youtube' | 'vimeo' | 'custom'; // for video
    items?: Array<{ question: string; answer: string }>; // for accordion
    calloutType?: 'info' | 'warning' | 'success' | 'error' | 'important' | 'key-concept'; // for callout
  };
}

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

// Text Formatting Toolbar Component
function TextFormattingToolbar({
  onInsertBold,
  onInsertItalic,
  onInsertLink,
  textareaRef
}: {
  onInsertBold: () => void;
  onInsertItalic: () => void;
  onInsertLink: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const wrapText = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    if (selectedText) {
      // Wrap selected text
      const newValue = beforeText + before + selectedText + after + afterText;
      textarea.value = newValue;
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);

      // Trigger onChange event
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
    } else {
      // Insert placeholder
      const placeholder = before === '**' ? 'bold text' : before === '*' ? 'italic text' : 'link text';
      const newValue = beforeText + before + placeholder + after + afterText;
      textarea.value = newValue;
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length);

      // Trigger onChange event
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
    }
  };

  const handleBold = () => {
    wrapText('**', '**');
  };

  const handleItalic = () => {
    wrapText('*', '*');
  };

  const handleLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    if (selectedText) {
      // Wrap selected text with link
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        const newValue = beforeText + `[${selectedText}](${url})` + afterText;
        textarea.value = newValue;
        textarea.focus();

        // Trigger onChange event
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      }
    } else {
      // Insert link placeholder
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        const newValue = beforeText + `[link text](${url})` + afterText;
        textarea.value = newValue;
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 10);

        // Trigger onChange event
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="flex items-center gap-1 mb-2 border border-border p-1 bg-background">
      <button
        type="button"
        onClick={handleBold}
        className="p-2 hover:bg-secondary transition-colors rounded-none group"
        title="Bold (accent color) - Select text or click to insert"
      >
        <Bold className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:text-accent-brand" />
      </button>
      <button
        type="button"
        onClick={handleItalic}
        className="p-2 hover:bg-secondary transition-colors rounded-none group"
        title="Italic - Select text or click to insert"
      >
        <Italic className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:text-accent-brand" />
      </button>
      <button
        type="button"
        onClick={handleLink}
        className="p-2 hover:bg-secondary transition-colors rounded-none group"
        title="Insert Link - Select text or click to insert"
      >
        <LinkIcon className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:text-accent-brand" />
      </button>
      <div className="ml-2 text-[10px] opacity-40 px-2">
        Select text then click • <span className="text-accent-brand font-semibold">**bold**</span> • <em>*italic*</em> • [text](url)
      </div>
    </div>
  );
}

// Paragraph Block Component - NOW WITH RICH TEXT EDITOR!
function ParagraphBlock({
  block,
  updateBlock,
  handleAIFix,
  handleAIExpand,
  isAiProcessing
}: {
  block: ContentBlock;
  updateBlock: (id: string, updates: Partial<ContentBlock>) => void;
  handleAIFix: (id: string, content: string) => Promise<void>;
  handleAIExpand: (id: string, content: string) => Promise<void>;
  isAiProcessing: boolean;
}) {
  // Strip HTML for AI operations
  const stripHTML = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-3">
        <label className="text-xs tracking-wider uppercase text-gray-300">Content</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleAIFix(block.id, stripHTML(block.content))}
            disabled={isAiProcessing || !block.content}
            className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-wider border border-border hover:border-accent-brand hover:text-accent-brand transition-colors disabled:opacity-50"
            title="AI will fix grammar and improve the text"
          >
            {isAiProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            Fix Grammar
          </button>
          <button
            type="button"
            onClick={() => handleAIExpand(block.id, stripHTML(block.content))}
            disabled={isAiProcessing || !block.content}
            className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-wider border border-border hover:border-accent-brand hover:text-accent-brand transition-colors disabled:opacity-50"
            title="AI will expand and elaborate on the text"
          >
            {isAiProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            Expand
          </button>
        </div>
      </div>

      <RichTextEditor
        value={block.content}
        onChange={(value) => updateBlock(block.id, { content: value })}
        placeholder="Start writing your article content here..."
      />

      <p className="text-[10px] opacity-40 mt-2">
        ✨ Use the toolbar above to format text • <strong>Bold text</strong> appears in accent color • Add links, lists, and more
      </p>
    </div>
  );
}

// Helper functions for file handling
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
}

export function BlockEditor({ blocks = [], onChange }: BlockEditorProps) {
  // Ensure blocks is always an array
  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadingDrop, setUploadingDrop] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null); // blockId or 'global'
  const [showInsertMenu, setShowInsertMenu] = useState<number | null>(null); // index to insert after

  const editorRef = useRef<HTMLDivElement>(null);

  // Close insert menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showInsertMenu !== null) {
        setShowInsertMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showInsertMenu]);

  // Validate onChange prop on mount and log for debugging
  React.useEffect(() => {
    if (typeof onChange !== 'function') {
    }
  }, [onChange]);

  // Stable updateBlock function using useCallback
  const updateBlock = useCallback((id: string, updates: Partial<ContentBlock> | ((b: ContentBlock) => Partial<ContentBlock>)) => {
    if (typeof onChange !== 'function') {
      return;
    }
    onChange(safeBlocks.map(block => {
      if (block.id !== id) return block;
      const newUpdates = typeof updates === 'function' ? updates(block) : updates;
      return { ...block, ...newUpdates };
    }));
  }, [safeBlocks, onChange]);

  const deleteBlock = useCallback((id: string) => {
    if (typeof onChange !== 'function') {
      return;
    }
    onChange(safeBlocks.filter(block => block.id !== id));
  }, [safeBlocks, onChange]);

  const moveBlock = useCallback((index: number, direction: 'up' | 'down') => {
    if (typeof onChange !== 'function') {
      return;
    }
    const newBlocks = [...safeBlocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < safeBlocks.length) {
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      onChange(newBlocks);
    }
  }, [safeBlocks, onChange]);

  // --- Drag & Drop Logic ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the main container
    if (editorRef.current && !editorRef.current.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files) as File[];
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    setUploadingDrop(true);

    try {
      const token = sessionStorage.getItem('admin_token');
      const newBlocks: ContentBlock[] = [];

      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/upload`,
          {
            method: 'POST',
            headers: {
              'X-Admin-Token': token || '',
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (data.success && data.url) {
          newBlocks.push({
            id: `block-${Date.now()}-${Math.random()}`,
            type: 'image',
            content: data.url,
            metadata: { alt: file.name.split('.')[0] }
          });
        }
      }

      if (newBlocks.length > 0) {
        onChange([...safeBlocks, ...newBlocks]);
        // Expand the last new block
        setExpandedBlockId(newBlocks[newBlocks.length - 1].id);
      }
    } catch (err) {
      alert('Failed to upload dropped images.');
    } finally {
      setUploadingDrop(false);
    }
  };

  // --- AI Logic ---
  const handleAIFix = async (blockId: string, text: string) => {
    if (!text.trim()) return;

    setAiLoading(blockId);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/ai/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({
            type: 'fix-grammar',
            context: text,
            prompt: ''
          }),
        }
      );

      const data = await response.json();
      if (data.success && data.result) {
        updateBlock(blockId, { content: data.result });
      } else {
        alert('AI request failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to connect to AI service');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAIExpand = async (blockId: string, text: string) => {
    if (!text.trim()) return;

    setAiLoading(blockId);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/ai/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({
            type: 'expand',
            context: text,
            prompt: ''
          }),
        }
      );

      const data = await response.json();
      if (data.success && data.result) {
        updateBlock(blockId, { content: data.result });
      } else {
        alert('AI request failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to connect to AI service');
    } finally {
      setAiLoading(null);
    }
  };

  // --- Standard Block Logic ---
  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random()}`,
      type,
      content: '',
      metadata: type === 'heading'
        ? { level: 2 }
        : type === 'list'
          ? { listType: 'bullet' }
          : type === 'gallery'
            ? { galleryStyle: 'grid', images: [], enableDownload: false }
            : {},
    };
    const newBlocks = [...safeBlocks, newBlock];
    onChange(newBlocks);
    setExpandedBlockId(newBlock.id);

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const insertBlock = (type: BlockType, afterIndex: number) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random()}`,
      type,
      content: '',
      metadata: type === 'heading' ? { level: 2 } : type === 'list' ? { listType: 'bullet' } : {},
    };
    const newBlocks = [...safeBlocks.slice(0, afterIndex + 1), newBlock, ...safeBlocks.slice(afterIndex + 1)];
    onChange(newBlocks);
    setExpandedBlockId(newBlock.id);
  };

  const getYouTubeId = (url: string) => {
    // Supports: standard v=, short youtu.be, embed, shorts, live
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVimeoId = (url: string) => {
    const regExp = /vimeo\.com\/([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const renderBlockPreview = (block: ContentBlock) => {
    if (!block.content && block.type !== 'spacer' && block.type !== 'gallery') return <span className="opacity-30 italic">Empty block</span>;

    switch (block.type) {
      case 'heading':
        const Tag = (`h${block.metadata?.level || 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
        return <Tag className="font-bold opacity-80">{block.content}</Tag>;
      case 'paragraph':
        // Strip HTML tags for preview
        const strippedContent = block.content.replace(/<[^>]*>?/gm, '');
        return <p className="text-gray-400 line-clamp-2">{strippedContent || 'Empty paragraph'}</p>;
      case 'image':
        return (
          <div className="flex items-center gap-4">
            {block.content && <img src={block.content} alt="Thumbnail" className="w-12 h-12 object-cover rounded bg-secondary" />}
            <span className="text-gray-400 truncate">{block.content}</span>
          </div>
        );
      case 'video':
        return (
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 opacity-40" />
            <span className="text-gray-400 truncate">{block.content || 'No video URL'}</span>
          </div>
        );
      case 'quote':
        return <div className="pl-2 border-l-2 border-accent-brand text-gray-400 italic truncate">{block.content}</div>;
      case 'list':
        return <div className="text-gray-400 text-xs">{block.content.split('\n').length} items</div>;
      case 'code':
        return <code className="text-xs bg-secondary px-1 py-0.5 rounded text-gray-400">{block.metadata?.language || 'text'}</code>;
      case 'gallery':
        return (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <span className="px-1.5 py-0.5 bg-secondary rounded">{block.metadata?.galleryStyle || 'grid'}</span>
            <span>{block.metadata?.images?.length || 0} images</span>
          </div>
        );
      case 'spacer':
        return <div className="h-4 bg-secondary/50 w-full rounded border border-dashed border-border" />;
      case 'divider':
        return <div className="h-px bg-foreground/30 w-full" />;
      case 'file':
        return (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <FileDown className="w-4 h-4 opacity-40" />
            <span className="truncate">{block.metadata?.fileName || block.content || 'No file'}</span>
          </div>
        );
      case 'accordion':
        return <div className="text-gray-400 text-xs">{block.metadata?.items?.length || 0} items</div>;
      case 'callout':
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-1.5 py-0.5 rounded capitalize bg-secondary text-gray-400 border border-border`}>
              {block.metadata?.calloutType || 'info'}
            </span>
            <span className="text-gray-400 truncate">{block.content}</span>
          </div>
        );
      default:
        return <span className="opacity-40">{block.type}</span>;
    }
  };

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    const isExpanded = expandedBlockId === block.id;
    const isAiProcessing = aiLoading === block.id;

    return (
      <div key={block.id} className={`group border bg-card transition-all duration-200 ${isExpanded ? 'border-accent-brand shadow-lg ring-1 ring-accent-brand/10' : 'border-border hover:border-accent-brand/50'}`}>
        {/* Block Header / Handle */}
        <div
          className={`flex items-center justify-between p-3 cursor-pointer select-none ${isExpanded ? 'bg-accent-brand/5' : 'bg-background hover:bg-secondary/50'}`}
          onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-secondary text-muted-foreground">
              {block.type === 'paragraph' && <Type className="w-3 h-3" />}
              {block.type === 'heading' && <Type className="w-3 h-3 font-bold" />}
              {block.type === 'image' && <ImageIcon className="w-3 h-3" />}
              {block.type === 'video' && <Video className="w-3 h-3" />}
              {block.type === 'quote' && <Quote className="w-3 h-3" />}
              {block.type === 'list' && <List className="w-3 h-3" />}
              {block.type === 'code' && <Code className="w-3 h-3" />}
              {block.type === 'gallery' && <Grid className="w-3 h-3" />}
              {block.type === 'spacer' && <Minus className="w-3 h-3" />}
              {block.type === 'accordion' && <ChevronDown className="w-3 h-3" />}
              {block.type === 'file' && <FileDown className="w-3 h-3" />}
              {block.type === 'divider' && <SeparatorHorizontal className="w-3 h-3" />}
              {block.type === 'callout' && <AlertCircle className="w-3 h-3" />}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] tracking-widest uppercase opacity-40 font-medium leading-none mb-1">{block.type}</span>
              <div className="text-sm">
                {!isExpanded ? renderBlockPreview(block) : <span className="font-medium">Editing...</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => moveBlock(index, 'up')}
              disabled={index === 0}
              className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
              title="Move Up"
            >
              <MoveUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => moveBlock(index, 'down')}
              disabled={index === safeBlocks.length - 1}
              className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
              title="Move Down"
            >
              <MoveDown className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              type="button"
              onClick={() => deleteBlock(block.id)}
              className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
              title="Delete Block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
              className="p-1.5 hover:bg-secondary rounded text-muted-foreground"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Block Content Editor */}
        {isExpanded && (
          <div className="p-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Heading Block */}
            {block.type === 'heading' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Level (Current: H{block.metadata?.level || 2})</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map(level => {
                      const currentLevel = block.metadata?.level || 2;
                      const isActive = currentLevel === level;
                      return (
                        <button
                          type="button"
                          key={level}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateBlock(block.id, { metadata: { ...block.metadata, level } });
                          }}
                          className={`px-3 py-1.5 text-sm border transition-colors ${isActive ? 'bg-accent-brand text-white border-accent-brand' : 'border-border hover:border-accent-brand'}`}
                        >
                          H{level}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Text</label>
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none font-medium text-lg"
                    placeholder="Heading Text"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Paragraph Block */}
            {block.type === 'paragraph' && <ParagraphBlock
              block={block}
              updateBlock={updateBlock}
              handleAIFix={handleAIFix}
              handleAIExpand={handleAIExpand}
              isAiProcessing={isAiProcessing}
            />}

            {/* Image Block */}
            {block.type === 'image' && (
              <div className="space-y-4">
                <ImageUploader
                  label="Image"
                  value={block.content}
                  onChange={(url) => updateBlock(block.id, { content: url })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Alt Text</label>
                    <input
                      type="text"
                      value={block.metadata?.alt || ''}
                      onChange={(e) => updateBlock(block.id, { metadata: { ...block.metadata, alt: e.target.value } })}
                      className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
                      placeholder="Description for accessibility"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Caption</label>
                    <input
                      type="text"
                      value={block.metadata?.caption || ''}
                      onChange={(e) => updateBlock(block.id, { metadata: { ...block.metadata, caption: e.target.value } })}
                      className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
                      placeholder="Optional caption"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Video Block */}
            {block.type === 'video' && (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`video-type-${block.id}`}
                      checked={!block.metadata?.videoType || block.metadata?.videoType === 'youtube'}
                      onChange={() => updateBlock(block.id, { metadata: { ...block.metadata, videoType: 'youtube' } })}
                      className="accent-accent-brand"
                    />
                    <span className="text-sm">YouTube</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`video-type-${block.id}`}
                      checked={block.metadata?.videoType === 'vimeo'}
                      onChange={() => updateBlock(block.id, { metadata: { ...block.metadata, videoType: 'vimeo' } })}
                      className="accent-accent-brand"
                    />
                    <span className="text-sm">Vimeo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`video-type-${block.id}`}
                      checked={block.metadata?.videoType === 'custom'}
                      onChange={() => updateBlock(block.id, { metadata: { ...block.metadata, videoType: 'custom' } })}
                      className="accent-accent-brand"
                    />
                    <span className="text-sm">Direct URL (.mp4)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Video URL</label>
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none font-mono text-sm"
                    placeholder={block.metadata?.videoType === 'vimeo' ? "https://vimeo.com/..." : "https://youtube.com/watch?v=..."}
                  />
                </div>

                {/* Preview Video */}
                {block.content && (
                  <div className="mt-4 aspect-video bg-black rounded overflow-hidden">
                    {(() => {
                      if (block.metadata?.videoType === 'vimeo') {
                        const id = getVimeoId(block.content);
                        return id ? (
                          <iframe
                            src={`https://player.vimeo.com/video/${id}`}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title="Vimeo Video Player"
                          />
                        ) : <div className="w-full h-full flex items-center justify-center text-white/40">Invalid Vimeo URL</div>;
                      } else if (block.metadata?.videoType === 'custom') {
                        return (
                          <video
                            src={block.content}
                            controls
                            className="w-full h-full object-contain"
                          >
                            Your browser does not support the video tag.
                          </video>
                        );
                      } else {
                        const id = getYouTubeId(block.content);
                        return id ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${id}`}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube Video Player"
                          />
                        ) : <div className="w-full h-full flex items-center justify-center text-white/40">Invalid YouTube URL</div>;
                      }
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Quote Block */}
            {block.type === 'quote' && (
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Quote</label>
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-lg italic font-serif"
                  placeholder="Enter quote text"
                />
              </div>
            )}

            {/* List Block */}
            {block.type === 'list' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">List Style</label>
                  <select
                    value={block.metadata?.listType || 'bullet'}
                    onChange={(e) => updateBlock(block.id, { metadata: { ...block.metadata, listType: e.target.value as any } })}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
                    aria-label="List Style"
                  >
                    <option value="bullet">Bullet Points</option>
                    <option value="numbered">Numbered List</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Items (One per line)</label>
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none font-mono text-sm"
                    placeholder="Item 1&#10;Item 2&#10;Item 3"
                  />
                </div>
              </div>
            )}

            {/* Code Block */}
            {block.type === 'code' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Language</label>
                  <input
                    type="text"
                    value={block.metadata?.language || ''}
                    onChange={(e) => updateBlock(block.id, { metadata: { ...block.metadata, language: e.target.value } })}
                    className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
                    placeholder="javascript"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Code</label>
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none font-mono text-sm bg-black/5 dark:bg-white/5"
                    placeholder="// Paste code here"
                  />
                </div>
              </div>
            )}

            {/* Gallery Block */}
            {block.type === 'gallery' && (
              <div className="space-y-4">
                {/* Gallery Style Selector */}
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Gallery Display Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'grid', label: 'Grid', desc: '2-column grid layout' },
                      { value: 'carousel', label: 'Carousel', desc: 'Sliding slideshow' },
                      { value: 'masonry', label: 'Masonry', desc: 'Pinterest-style grid' },
                      { value: 'fullwidth', label: 'Full Width', desc: 'Edge-to-edge images' },
                    ].map(style => {
                      const isActive = block.metadata?.galleryStyle === style.value || (!block.metadata?.galleryStyle && style.value === 'grid');
                      return (
                        <button
                          type="button"
                          key={style.value}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateBlock(block.id, { metadata: { ...block.metadata, galleryStyle: style.value as NonNullable<ContentBlock['metadata']>['galleryStyle'] } });
                          }}
                          className={`relative px-4 py-3 border-2 transition-all text-left rounded-lg ${isActive
                            ? 'border-accent-brand bg-accent-brand/20 ring-2 ring-accent-brand/30'
                            : 'border-border hover:border-accent-brand/50 bg-secondary/30'
                            }`}
                        >
                          {isActive && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-accent-brand rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <div className={`font-medium text-sm mb-1 ${isActive ? 'text-accent-brand' : ''}`}>{style.label}</div>
                          <div className="text-xs text-gray-400">{style.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Current style: <span className="font-medium text-accent-brand">{block.metadata?.galleryStyle || 'grid'}</span>
                  </div>
                </div>

                {/* Enable Download Option */}
                <div className="flex items-center gap-3 p-3 border border-border bg-secondary/30">
                  <input
                    type="checkbox"
                    id={`download-${block.id}`}
                    checked={block.metadata?.enableDownload || false}
                    onChange={(e) => updateBlock(block.id, (b) => ({ metadata: { ...b.metadata, enableDownload: e.target.checked } }))}
                    className="w-4 h-4 accent-accent-brand"
                  />
                  <label htmlFor={`download-${block.id}`} className="text-sm cursor-pointer flex-1">
                    <div className="font-medium">Enable Image Downloads</div>
                    <div className="text-xs text-gray-400">Allow visitors to download images from this gallery</div>
                  </label>
                </div>

                {/* Image Gallery Manager */}
                <ImageGalleryManager
                  label="Gallery Images"
                  images={block.metadata?.images || []}
                  onChange={(images) => {
                    updateBlock(block.id, (currentBlock) => ({
                      metadata: {
                        ...(currentBlock.metadata || {}),
                        images
                      }
                    }));
                  }}
                />
              </div>
            )}

            {/* Spacer Block */}
            {block.type === 'spacer' && (
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Height</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => updateBlock(block.id, { metadata: { ...block.metadata, height: size } })}
                      className={`flex-1 px-3 py-2 text-sm border capitalize transition-colors ${block.metadata?.height === size ? 'bg-accent-brand text-white border-accent-brand' : 'border-border hover:border-accent-brand'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Accordion Block */}
            {block.type === 'accordion' && (
              <div className="space-y-4">
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">FAQ / Accordion Items</label>

                {/* Display existing items */}
                {(block.metadata?.items || []).map((item, idx) => (
                  <div key={idx} className="border border-border p-4 space-y-2 bg-secondary/30">
                    <div>
                      <label className="block text-[10px] tracking-wider uppercase opacity-40 mb-1">Question {idx + 1}</label>
                      <input
                        type="text"
                        value={item.question || ''}
                        onChange={(e) => {
                          const newItems = [...(block.metadata?.items || [])];
                          newItems[idx] = { ...item, question: e.target.value };
                          updateBlock(block.id, { metadata: { ...block.metadata, items: newItems } });
                        }}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                        placeholder="What is your question?"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-wider uppercase opacity-40 mb-1">Answer {idx + 1}</label>
                      <textarea
                        value={item.answer || ''}
                        onChange={(e) => {
                          const newItems = [...(block.metadata?.items || [])];
                          newItems[idx] = { ...item, answer: e.target.value };
                          updateBlock(block.id, { metadata: { ...block.metadata, items: newItems } });
                        }}
                        rows={3}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm resize-y"
                        placeholder="The answer to the question..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = (block.metadata?.items || []).filter((_, i) => i !== idx);
                        updateBlock(block.id, { metadata: { ...block.metadata, items: newItems } });
                      }}
                      className="text-xs text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove Item
                    </button>
                  </div>
                ))}

                {/* Add new item button */}
                <button
                  type="button"
                  onClick={() => {
                    const newItems = [...(block.metadata?.items || []), { question: '', answer: '' }];
                    updateBlock(block.id, { metadata: { ...block.metadata, items: newItems } });
                  }}
                  className="w-full px-4 py-3 border-2 border-dashed border-border hover:border-accent-brand hover:bg-accent-brand/5 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Q&A Item
                </button>

                <p className="text-[10px] opacity-40 mt-2">
                  Tip: FAQ items will be collapsible/expandable on the published article
                </p>
              </div>
            )}

            {/* File Block */}
            {block.type === 'file' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">File Upload</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id={`file-upload-${block.id}`}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Upload to Supabase storage
                        try {
                          const token = sessionStorage.getItem('admin_token');
                          if (!token) {
                            alert('You are not logged in. Please log in to the admin panel first.');
                            return;
                          }

                          const formData = new FormData();
                          formData.append('image', file); // API expects 'image' field

                          const response = await fetch(
                            `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/upload`,
                            {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${publicAnonKey}`,
                                // Token in Authorization header
                              },
                              body: formData,
                            }
                          );

                          if (!response.ok) {
                            throw new Error(`Upload failed with status ${response.status}`);
                          }

                          const data = await response.json();
                          if (data.url) {
                            updateBlock(block.id, {
                              content: data.url,
                              metadata: {
                                ...block.metadata,
                                fileName: file.name,
                                fileSize: formatFileSize(file.size),
                                fileType: file.type || getFileExtension(file.name)
                              }
                            });
                          } else {
                            alert('Upload failed: ' + (data.error || 'No URL returned'));
                          }
                        } catch (err) {
                          alert('Failed to upload file: ' + (err instanceof Error ? err.message : 'Unknown error'));
                        }
                      }}
                    />
                    {block.content ? (
                      <div className="flex items-center justify-center gap-4">
                        <FileDown className="w-8 h-8 text-accent-brand" />
                        <div className="text-left">
                          <div className="font-medium">{block.metadata?.fileName || 'Uploaded file'}</div>
                          <div className="text-xs text-muted-foreground">{block.metadata?.fileSize}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateBlock(block.id, { content: '', metadata: { ...block.metadata, fileName: '', fileSize: '', fileType: '' } })}
                          className="ml-4 text-destructive hover:underline text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label htmlFor={`file-upload-${block.id}`} className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <div className="text-sm font-medium">Click to upload a file</div>
                        <div className="text-xs text-muted-foreground mt-1">PDF, DOC, ZIP, or any file type</div>
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Button Text (optional)</label>
                  <input
                    type="text"
                    value={block.metadata?.fileName || ''}
                    onChange={(e) => updateBlock(block.id, { metadata: { ...block.metadata, fileName: e.target.value } })}
                    className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                    placeholder="Download PDF"
                  />
                </div>

                <p className="text-[10px] opacity-40">
                  Visitors will see a download button with the file name
                </p>
              </div>
            )}

            {/* Divider Block */}
            {block.type === 'divider' && (
              <div className="space-y-4">
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Divider Style</label>
                <div className="flex gap-2">
                  {['line', 'dots', 'ornament'].map(style => (
                    <button
                      type="button"
                      key={style}
                      onClick={() => updateBlock(block.id, { content: style })}
                      className={`flex-1 px-3 py-3 text-sm border capitalize transition-colors ${block.content === style ? 'bg-accent-brand text-white border-accent-brand' : 'border-border hover:border-accent-brand'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div className="py-6 flex items-center justify-center">
                  {block.content === 'dots' && (
                    <div className="flex gap-2">
                      <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full" />
                      <div className="w-1.5 h-1.5 bg-foreground/50 rounded-full" />
                      <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full" />
                    </div>
                  )}
                  {block.content === 'ornament' && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-px bg-foreground/20" />
                      <div className="w-2 h-2 bg-foreground/40 rotate-45" />
                      <div className="w-12 h-px bg-foreground/20" />
                    </div>
                  )}
                  {(!block.content || block.content === 'line') && (
                    <div className="w-24 h-px bg-foreground/30" />
                  )}
                </div>
              </div>
            )}
            {/* Callout Block */}
            {block.type === 'callout' && (
              <div className="space-y-4">
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Callout Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'info', label: 'Info', icon: AlertCircle, color: 'text-blue-400', border: 'border-blue-400' },
                    { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'text-yellow-400', border: 'border-yellow-400' },
                    { value: 'important', label: 'Important', icon: AlertCircle, color: 'text-orange-400', border: 'border-orange-400' },
                    { value: 'key-concept', label: 'Key Concept', icon: BookOpen, color: 'text-purple-400', border: 'border-purple-400' },
                    { value: 'success', label: 'Success', icon: CheckCircle, color: 'text-green-400', border: 'border-green-400' },
                    { value: 'error', label: 'Error', icon: AlertCircle, color: 'text-red-400', border: 'border-red-400' },
                  ].map(type => (
                    <button
                      type="button"
                      key={type.value}
                      onClick={() => updateBlock(block.id, { metadata: { ...block.metadata, calloutType: type.value as any } })}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm ${block.metadata?.calloutType === type.value
                        ? `bg-secondary/50 ${type.border} ${type.color}`
                        : 'border-border hover:bg-secondary/30'
                        }`}
                    >
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Text</label>
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none rounded`}
                    placeholder="Enter callout text..."
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={editorRef}
      className={`space-y-6 relative transition-colors ${isDraggingOver ? 'bg-accent-brand/5 ring-2 ring-accent-brand ring-inset rounded-lg' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-accent-brand/10 backdrop-blur-[1px] rounded-lg pointer-events-none">
          <div className="bg-background border border-accent-brand p-6 shadow-xl text-center">
            <Upload className="w-12 h-12 text-accent-brand mx-auto mb-2" />
            <p className="text-lg font-medium text-accent-brand">Drop images here</p>
            <p className="text-sm text-gray-400">They will be added as image blocks</p>
          </div>
        </div>
      )}

      {/* Loading Overlay for Drops */}
      {uploadingDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 shadow-xl text-center">
            <Loader2 className="w-8 h-8 text-accent-brand mx-auto mb-2 animate-spin" />
            <p className="text-lg">Uploading images...</p>
          </div>
        </div>
      )}

      {/* Blocks List */}
      <div className="space-y-3">
        {safeBlocks.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-secondary/10">
            <Type className="w-8 h-8 opacity-20 mx-auto mb-2" />
            <p className="opacity-40 text-sm">Start writing your article by adding blocks below.</p>
            <p className="opacity-30 text-xs mt-2">Tip: Drag and drop images anywhere to add them</p>
          </div>
        )}
        {safeBlocks.map((block, index) => (
          <React.Fragment key={block.id}>
            {renderBlockEditor(block, index)}

            {/* Insert Block Button - appears between blocks */}
            {index < safeBlocks.length - 1 && (
              <div className="relative h-2 flex items-center justify-center">
                <div className="absolute inset-x-0 flex items-center justify-center z-10">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInsertMenu(showInsertMenu === index ? null : index);
                      }}
                      className={`bg-accent-brand hover:bg-accent-brand/90 text-white rounded-full p-1 shadow-lg transition-all ${showInsertMenu === index ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                      title="Insert block here"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Insert Menu Popup */}
                    {showInsertMenu === index && (
                      <div
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700 shadow-2xl rounded-lg p-4 z-50"
                        style={{ width: '320px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-xs uppercase tracking-wider text-neutral-400 mb-3 px-1 font-medium">Insert Block</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                          <button type="button" onClick={() => { insertBlock('paragraph', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <Type className="w-5 h-5 text-blue-400" />
                            <span className="text-xs">Text</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('heading', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <Type className="w-5 h-5 text-purple-400" />
                            <span className="text-xs">Heading</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('image', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <ImageIcon className="w-5 h-5 text-green-400" />
                            <span className="text-xs">Image</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('gallery', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <Grid className="w-5 h-5 text-pink-400" />
                            <span className="text-xs">Gallery</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('video', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <Video className="w-5 h-5 text-red-400" />
                            <span className="text-xs">Video</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('quote', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <Quote className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs">Quote</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('list', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <List className="w-5 h-5 text-cyan-400" />
                            <span className="text-xs">List</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('code', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <Code className="w-5 h-5 text-orange-400" />
                            <span className="text-xs">Code</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('file', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <FileDown className="w-5 h-5 text-emerald-400" />
                            <span className="text-xs">File</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('divider', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <SeparatorHorizontal className="w-5 h-5 text-neutral-400" />
                            <span className="text-xs">Divider</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('spacer', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <Minus className="w-5 h-5 text-neutral-500" />
                            <span className="text-xs">Spacer</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('accordion', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <ChevronDown className="w-5 h-5 text-indigo-400" />
                            <span className="text-xs">FAQ</span>
                          </button>
                          <button type="button" onClick={() => { insertBlock('callout', index); setShowInsertMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs">Callout</span>
                          </button>
                          <button type="button" onClick={() => {
                            const newBlock: ContentBlock = {
                              id: `block-${Date.now()}-${Math.random()}`,
                              type: 'callout',
                              content: '',
                              metadata: { calloutType: 'key-concept' }
                            };
                            const newBlocks = [...safeBlocks.slice(0, index + 1), newBlock, ...safeBlocks.slice(index + 1)];
                            onChange(newBlocks);
                            setExpandedBlockId(newBlock.id);
                            setShowInsertMenu(null);
                          }} className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-neutral-800 rounded-lg text-sm text-white border border-transparent hover:border-neutral-600">
                            <BookOpen className="w-5 h-5 text-purple-400" />
                            <span className="text-xs">Key Concept</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowInsertMenu(null)}
                          className="mt-3 w-full text-sm text-neutral-400 hover:text-white py-2 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full h-px bg-border/30" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Add Block Toolbar */}
      <div className="sticky bottom-6 bg-card/80 backdrop-blur shadow-lg border border-border rounded-full p-2 flex items-center gap-2 overflow-x-auto max-w-full mx-auto justify-center z-10">
        <AddButton icon={Type} label="Text" onClick={() => addBlock('paragraph')} />
        <div className="w-px h-4 bg-border" />
        <AddButton icon={Type} label="Heading" onClick={() => addBlock('heading')} />
        <AddButton icon={Quote} label="Quote" onClick={() => addBlock('quote')} />
        <AddButton icon={List} label="List" onClick={() => addBlock('list')} />
        <div className="w-px h-4 bg-border" />
        <AddButton icon={ImageIcon} label="Image" onClick={() => addBlock('image')} />
        <AddButton icon={Grid} label="Gallery" onClick={() => addBlock('gallery')} />
        <AddButton icon={Video} label="Video" onClick={() => addBlock('video')} />
        <AddButton icon={FileDown} label="File" onClick={() => addBlock('file')} />
        <div className="w-px h-4 bg-border" />
        <AddButton icon={Code} label="Code" onClick={() => addBlock('code')} />
        <AddButton icon={SeparatorHorizontal} label="Divider" onClick={() => addBlock('divider')} />
        <AddButton icon={Minus} label="Spacer" onClick={() => addBlock('spacer')} />
        <AddButton icon={ChevronDown} label="FAQ" onClick={() => addBlock('accordion')} />
        <AddButton icon={AlertCircle} label="Callout" onClick={() => addBlock('callout')} />
        <AddButton icon={BookOpen} label="Key Concept" onClick={() => {
          const newBlock: ContentBlock = {
            id: `block-${Date.now()}-${Math.random()}`,
            type: 'callout',
            content: '',
            metadata: { calloutType: 'key-concept' }
          };
          const newBlocks = [...safeBlocks, newBlock];
          onChange(newBlocks);
          setExpandedBlockId(newBlock.id);
          setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }, 100);
        }} />
      </div>
    </div>
  );
}

function AddButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 px-3 py-2 rounded hover:bg-secondary transition-colors group min-w-[60px]"
    >
      <Icon className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:text-accent-brand transition-colors" />
      <span className="text-[10px] tracking-wider uppercase opacity-60 group-hover:opacity-100">{label}</span>
    </button>
  );
}
