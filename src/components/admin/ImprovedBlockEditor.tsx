import React, { useState, useRef, useCallback } from 'react';
import { 
  Type, Image as ImageIcon, Quote, List, Code, Grid, Video, 
  ChevronDown, GripVertical, Trash2, Plus, Minus, SeparatorHorizontal,
  FileDown, ChevronRight
} from 'lucide-react';
import { ImageUploader, ImageGalleryManager } from './ImageUploader';
import { RichTextEditor } from './RichTextEditor';
import { UnifiedTextEditor } from './UnifiedTextEditor';
import { TipTapEditor } from './TipTapEditor';
import { ContentBlock, BlockType } from './BlockEditor';

interface ImprovedBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function ImprovedBlockEditor({ blocks = [], onChange }: ImprovedBlockEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const blockTypes: { type: BlockType; icon: any; label: string }[] = [
    { type: 'paragraph', icon: Type, label: 'Text' },
    { type: 'image', icon: ImageIcon, label: 'Image' },
    { type: 'callout', icon: ChevronRight, label: 'Callout' },
    { type: 'quote', icon: Quote, label: 'Quote' },
    { type: 'list', icon: List, label: 'List' },
    { type: 'code', icon: Code, label: 'Code' },
    { type: 'gallery', icon: Grid, label: 'Gallery' },
    { type: 'video', icon: Video, label: 'Video' },
    { type: 'divider', icon: SeparatorHorizontal, label: 'Divider' },
    { type: 'spacer', icon: Minus, label: 'Spacer' },
    { type: 'file', icon: FileDown, label: 'File' },
    { type: 'accordion', icon: ChevronDown, label: 'Accordion' },
  ];

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
            ? { galleryStyle: 'grid', images: [] }
            : type === 'spacer'
              ? { height: 'medium' }
              : type === 'accordion'
                ? { items: [] }
                : type === 'callout'
                  ? { calloutType: 'info' }
                  : {},
    };
    
    const newBlocks = [...safeBlocks, newBlock];
    onChange(newBlocks);
    
    // Auto-expand new block
    setExpandedBlocks(prev => new Set(prev).add(newBlock.id));
    
    // Scroll to bottom
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(safeBlocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (id: string) => {
    onChange(safeBlocks.filter(block => block.id !== id));
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...safeBlocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    onChange(newBlocks);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveBlock(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderBlockContent = (block: ContentBlock, isExpanded: boolean) => {
    if (!isExpanded) {
      // Collapsed preview
      return (
        <div className="px-4 py-3 text-sm text-gray-400 truncate">
          {block.content || <span className="italic opacity-50">Empty {block.type}</span>}
        </div>
      );
    }

    // Expanded editor
    switch (block.type) {
      case 'heading':
      case 'paragraph':
        return (
          <div className="p-4">
            <TipTapEditor
              content={block.content}
              onChange={(content) => updateBlock(block.id, { content })}
              placeholder="Start writing... Use the toolbar for formatting, headings, lists, and more"
            />
          </div>
        );

      case 'image':
        return (
          <div className="p-4 space-y-3">
            <ImageUploader
              label="Upload Image"
              value={block.content}
              onChange={(url) => updateBlock(block.id, { content: url })}
              bucketName="blog"
            />
            {block.content && (
              <>
                {/* Image Alignment */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Alignment</label>
                  <div className="flex gap-2">
                    {(['left', 'center', 'right', 'full'] as const).map(align => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => updateBlock(block.id, { 
                          metadata: { ...block.metadata, align }
                        })}
                        className={`px-3 py-1 text-sm rounded transition-colors capitalize ${
                          (block.metadata?.align || 'full') === align
                            ? 'bg-accent-brand text-white'
                            : 'bg-secondary/30 hover:bg-secondary/50'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Size */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Size</label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large', 'full'] as const).map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => updateBlock(block.id, { 
                          metadata: { ...block.metadata, size }
                        })}
                        className={`px-3 py-1 text-sm rounded transition-colors capitalize ${
                          (block.metadata?.size || 'full') === size
                            ? 'bg-accent-brand text-white'
                            : 'bg-secondary/30 hover:bg-secondary/50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={block.metadata?.caption || ''}
                  onChange={(e) => updateBlock(block.id, { 
                    metadata: { ...block.metadata, caption: e.target.value }
                  })}
                  placeholder="Caption (optional)"
                  className="w-full px-4 py-2 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors text-sm"
                />
                <input
                  type="text"
                  value={block.metadata?.alt || ''}
                  onChange={(e) => updateBlock(block.id, { 
                    metadata: { ...block.metadata, alt: e.target.value }
                  })}
                  placeholder="Alt text for accessibility"
                  className="w-full px-4 py-2 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors text-sm"
                />
              </>
            )}
          </div>
        );

      case 'quote':
        return (
          <div className="p-4">
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter quote text..."
              rows={3}
              className="w-full px-4 py-3 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors resize-none italic"
            />
          </div>
        );

      case 'list':
        return (
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateBlock(block.id, { 
                  metadata: { ...block.metadata, listType: 'bullet' }
                })}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  block.metadata?.listType === 'bullet'
                    ? 'bg-accent-brand text-white'
                    : 'bg-secondary/30 hover:bg-secondary/50'
                }`}
              >
                • Bullet
              </button>
              <button
                type="button"
                onClick={() => updateBlock(block.id, { 
                  metadata: { ...block.metadata, listType: 'numbered' }
                })}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  block.metadata?.listType === 'numbered'
                    ? 'bg-accent-brand text-white'
                    : 'bg-secondary/30 hover:bg-secondary/50'
                }`}
              >
                1. Numbered
              </button>
            </div>
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter list items (one per line)..."
              rows={5}
              className="w-full px-4 py-3 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors resize-none font-mono text-sm"
            />
          </div>
        );

      case 'code':
        return (
          <div className="p-4 space-y-3">
            <input
              type="text"
              value={block.metadata?.language || ''}
              onChange={(e) => updateBlock(block.id, { 
                metadata: { ...block.metadata, language: e.target.value }
              })}
              placeholder="Language (e.g., javascript, python, css)"
              className="w-full px-4 py-2 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors text-sm"
            />
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Paste your code here..."
              rows={8}
              className="w-full px-4 py-3 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors resize-none font-mono text-sm"
            />
          </div>
        );

      case 'gallery':
        return (
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              {['grid', 'carousel', 'masonry'].map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateBlock(block.id, { 
                    metadata: { ...block.metadata, galleryStyle: style as any }
                  })}
                  className={`px-3 py-1 text-sm rounded transition-colors capitalize ${
                    block.metadata?.galleryStyle === style
                      ? 'bg-accent-brand text-white'
                      : 'bg-secondary/30 hover:bg-secondary/50'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            <ImageGalleryManager
              label="Gallery Images"
              images={block.metadata?.images || []}
              onChange={(images) => updateBlock(block.id, {
                metadata: { ...block.metadata, images }
              })}
            />
          </div>
        );

      case 'video':
        return (
          <div className="p-4 space-y-3">
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="YouTube or Vimeo URL"
              className="w-full px-4 py-3 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors"
            />
          </div>
        );

      case 'divider':
        return (
          <div className="p-4">
            <div className="h-px bg-border" />
          </div>
        );

      case 'spacer':
        return (
          <div className="p-4">
            <div className="flex gap-2">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateBlock(block.id, { 
                    metadata: { ...block.metadata, height: size }
                  })}
                  className={`px-3 py-1 text-sm rounded transition-colors capitalize ${
                    block.metadata?.height === size
                      ? 'bg-accent-brand text-white'
                      : 'bg-secondary/30 hover:bg-secondary/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="p-4 space-y-3">
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="File URL"
              className="w-full px-4 py-3 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors"
            />
            <input
              type="text"
              value={block.metadata?.fileName || ''}
              onChange={(e) => updateBlock(block.id, { 
                metadata: { ...block.metadata, fileName: e.target.value }
              })}
              placeholder="Display name"
              className="w-full px-4 py-2 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors text-sm"
            />
          </div>
        );

      case 'accordion':
        const items = block.metadata?.items || [];
        return (
          <div className="p-4 space-y-3">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="space-y-2 p-3 bg-secondary/20 rounded-lg">
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx] = { ...item, question: e.target.value };
                    updateBlock(block.id, { 
                      metadata: { ...block.metadata, items: newItems }
                    });
                  }}
                  placeholder="Question"
                  className="w-full px-3 py-2 bg-card border border-border rounded focus:border-accent-brand outline-none text-sm"
                />
                <textarea
                  value={item.answer}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx] = { ...item, answer: e.target.value };
                    updateBlock(block.id, { 
                      metadata: { ...block.metadata, items: newItems }
                    });
                  }}
                  placeholder="Answer"
                  rows={2}
                  className="w-full px-3 py-2 bg-card border border-border rounded focus:border-accent-brand outline-none text-sm resize-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newItems = items.filter((_: any, i: number) => i !== idx);
                    updateBlock(block.id, { 
                      metadata: { ...block.metadata, items: newItems }
                    });
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                updateBlock(block.id, { 
                  metadata: { 
                    ...block.metadata, 
                    items: [...items, { question: '', answer: '' }]
                  }
                });
              }}
              className="w-full px-4 py-2 bg-secondary/30 hover:bg-secondary/50 rounded transition-colors text-sm"
            >
              + Add Item
            </button>
          </div>
        );

      case 'callout':
        return (
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Callout Type</label>
              <div className="flex gap-2">
                {(['info', 'warning', 'success', 'error'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateBlock(block.id, { 
                      metadata: { ...block.metadata, calloutType: type }
                    })}
                    className={`px-3 py-1 text-sm rounded transition-colors capitalize ${
                      (block.metadata?.calloutType || 'info') === type
                        ? 'bg-accent-brand text-white'
                        : 'bg-secondary/30 hover:bg-secondary/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter your callout message..."
              rows={4}
              className="w-full px-4 py-3 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors resize-none"
            />
          </div>
        );

      default:
        return (
          <div className="p-4">
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter content..."
              rows={4}
              className="w-full px-4 py-3 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors resize-none"
            />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Toolbar */}
      <div className="sticky top-0 z-20 bg-card border-b border-border p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 uppercase tracking-wider mr-2">Add Block:</span>
          {blockTypes.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className="flex items-center gap-2 px-3 py-2 bg-secondary/30 hover:bg-accent-brand/20 hover:border-accent-brand border border-border rounded-lg transition-colors text-sm"
              title={label}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ maxHeight: 'calc(100vh - 400px)' }}
      >
        {safeBlocks.length === 0 && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-border rounded-xl">
            <p className="text-sm mb-2">No content blocks yet</p>
            <p className="text-xs opacity-60">Use the toolbar above to add your first block</p>
          </div>
        )}

        {safeBlocks.map((block, index) => {
          const isExpanded = expandedBlocks.has(block.id);
          const isDragging = draggedIndex === index;

          return (
            <div
              key={block.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`border-2 rounded-xl transition-all ${
                isDragging 
                  ? 'opacity-50 border-accent-brand' 
                  : isExpanded
                    ? 'border-accent-brand bg-card shadow-lg'
                    : 'border-border bg-card/50 hover:border-accent-brand/50'
              }`}
            >
              {/* Block Header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 border-b border-border">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move flex-shrink-0" />
                <button
                  type="button"
                  onClick={() => toggleExpand(block.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  <span className="text-sm font-medium capitalize">{block.type}</span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlock(block.id)}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete block"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              {/* Block Content */}
              {renderBlockContent(block, isExpanded)}
            </div>
          );
        })}
      </div>

      {/* Helper Footer */}
      {safeBlocks.length > 0 && (
        <div className="sticky bottom-0 bg-card/80 backdrop-blur border-t border-border px-4 py-2">
          <p className="text-xs text-gray-400 text-center">
            💡 Drag blocks by the <GripVertical className="w-3 h-3 inline" /> icon to reorder • {safeBlocks.length} block{safeBlocks.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
