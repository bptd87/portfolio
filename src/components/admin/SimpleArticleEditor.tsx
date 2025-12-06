import React, { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { ImageUploader } from './ImageUploader';
import { Plus, Image as ImageIcon, Trash2, GripVertical } from 'lucide-react';

interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'heading';
  content: string;
  metadata?: {
    alt?: string;
    caption?: string;
    level?: number;
  };
}

interface SimpleArticleEditorProps {
  sections: ContentSection[];
  onChange: (sections: ContentSection[]) => void;
}

export function SimpleArticleEditor({ sections, onChange }: SimpleArticleEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addSection = (type: 'text' | 'image' | 'heading') => {
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      type,
      content: '',
      metadata: type === 'heading' ? { level: 2 } : undefined,
    };
    onChange([...sections, newSection]);
  };

  const updateSection = (index: number, updates: Partial<ContentSection>) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const deleteSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveSection(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Add Section Buttons */}
      <div className="flex gap-2 p-4 bg-secondary/20 rounded-xl border border-border">
        <button
          type="button"
          onClick={() => addSection('heading')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border hover:border-accent-brand transition-colors rounded-lg"
        >
          <span className="text-xl font-bold">H</span>
          <span className="text-sm">Add Heading</span>
        </button>
        <button
          type="button"
          onClick={() => addSection('text')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border hover:border-accent-brand transition-colors rounded-lg"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Text</span>
        </button>
        <button
          type="button"
          onClick={() => addSection('image')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border hover:border-accent-brand transition-colors rounded-lg"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm">Add Image</span>
        </button>
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {sections.length === 0 && (
          <div className="text-center py-12 text-gray-400 border border-dashed border-border rounded-xl">
            <p className="text-sm">No content yet. Click the buttons above to start writing!</p>
          </div>
        )}

        {sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group relative border border-border rounded-xl overflow-hidden transition-all ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            {/* Section Header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border-b border-border">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <span className="text-xs text-gray-400 uppercase tracking-wider flex-1">
                {section.type === 'heading' && 'Heading'}
                {section.type === 'text' && 'Paragraph'}
                {section.type === 'image' && 'Image'}
              </span>
              <button
                type="button"
                onClick={() => deleteSection(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>

            {/* Section Content */}
            <div className="p-4">
              {section.type === 'heading' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          updateSection(index, {
                            metadata: { ...section.metadata, level },
                          })
                        }
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          section.metadata?.level === level
                            ? 'bg-accent-brand text-white'
                            : 'bg-secondary/20 hover:bg-secondary/40'
                        }`}
                      >
                        H{level}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={section.content}
                    onChange={(e) => updateSection(index, { content: e.target.value })}
                    placeholder="Enter heading text..."
                    className="w-full px-4 py-3 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors text-lg font-bold"
                  />
                </div>
              )}

              {section.type === 'text' && (
                <div className="prose prose-invert max-w-none">
                  <RichTextEditor
                    value={section.content}
                    onChange={(content) => updateSection(index, { content })}
                    placeholder="Start writing your content here..."
                  />
                </div>
              )}

              {section.type === 'image' && (
                <div className="space-y-3">
                  <ImageUploader
                    label="Upload Image"
                    value={section.content}
                    onChange={(url) => updateSection(index, { content: url })}
                    bucketName="blog"
                  />
                  {section.content && (
                    <>
                      <input
                        type="text"
                        value={section.metadata?.caption || ''}
                        onChange={(e) =>
                          updateSection(index, {
                            metadata: { ...section.metadata, caption: e.target.value },
                          })
                        }
                        placeholder="Image caption (optional)"
                        className="w-full px-4 py-2 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors text-sm"
                      />
                      <input
                        type="text"
                        value={section.metadata?.alt || ''}
                        onChange={(e) =>
                          updateSection(index, {
                            metadata: { ...section.metadata, alt: e.target.value },
                          })
                        }
                        placeholder="Alt text for accessibility"
                        className="w-full px-4 py-2 bg-secondary/20 border border-border rounded-lg focus:border-accent-brand outline-none transition-colors text-sm"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Helper Text */}
      {sections.length > 0 && (
        <div className="text-xs text-gray-400 text-center py-2">
          💡 Drag sections by the grip icon to reorder them
        </div>
      )}
    </div>
  );
}

// Converter function to transform simple sections to BlockEditor format (for backward compatibility)
export function sectionsToBlocks(sections: ContentSection[]) {
  return sections.map((section) => {
    if (section.type === 'heading') {
      return {
        id: section.id,
        type: 'heading' as const,
        content: section.content,
        metadata: { level: section.metadata?.level || 2 },
      };
    }
    if (section.type === 'image') {
      return {
        id: section.id,
        type: 'image' as const,
        content: section.content,
        metadata: {
          caption: section.metadata?.caption,
          alt: section.metadata?.alt,
        },
      };
    }
    // Text sections - convert HTML to paragraph blocks
    return {
      id: section.id,
      type: 'paragraph' as const,
      content: section.content,
    };
  });
}

// Converter function to transform BlockEditor format to simple sections
export function blocksToSections(blocks: any[]): ContentSection[] {
  if (!Array.isArray(blocks)) return [];
  
  return blocks.map((block, index) => {
    if (block.type === 'heading') {
      return {
        id: block.id || `section-${Date.now()}-${index}`,
        type: 'heading' as const,
        content: block.content || '',
        metadata: { level: block.metadata?.level || 2 },
      };
    }
    if (block.type === 'image') {
      return {
        id: block.id || `section-${Date.now()}-${index}`,
        type: 'image' as const,
        content: block.content || '',
        metadata: {
          caption: block.metadata?.caption,
          alt: block.metadata?.alt,
        },
      };
    }
    // Everything else becomes text
    return {
      id: block.id || `section-${Date.now()}-${index}`,
      type: 'text' as const,
      content: block.content || '',
    };
  });
}
