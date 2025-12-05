import React, { useState } from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Image, Users, FileText, Link as LinkIcon, Quote, Info } from 'lucide-react';
import { NewsBlock } from '../../data/news';
import { ImageGalleryManager } from './ImageUploader';

interface NewsBlockEditorProps {
  blocks: NewsBlock[];
  onChange: (blocks: NewsBlock[]) => void;
}

export function NewsBlockEditor({ blocks, onChange }: NewsBlockEditorProps) {
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);

  const addBlock = (type: NewsBlock['type']) => {
    let newBlock: NewsBlock;
    
    switch (type) {
      case 'text':
        newBlock = { type: 'text', content: '' };
        break;
      case 'gallery':
        newBlock = { type: 'gallery', images: [] };
        break;
      case 'team':
        newBlock = { type: 'team', title: '', members: [] };
        break;
      case 'details':
        newBlock = { type: 'details', title: '', items: [] };
        break;
      case 'link':
        newBlock = { type: 'link', url: '', label: '' };
        break;
      case 'quote':
        newBlock = { type: 'quote', text: '', author: '', source: '' };
        break;
    }
    
    onChange([...blocks, newBlock]);
    setExpandedBlock(blocks.length);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
    if (expandedBlock === index) setExpandedBlock(null);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const updateBlock = (index: number, updatedBlock: NewsBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    onChange(newBlocks);
  };

  const getBlockIcon = (type: NewsBlock['type']) => {
    switch (type) {
      case 'text': return FileText;
      case 'gallery': return Image;
      case 'team': return Users;
      case 'details': return Info;
      case 'link': return LinkIcon;
      case 'quote': return Quote;
    }
  };

  const getBlockLabel = (type: NewsBlock['type']) => {
    switch (type) {
      case 'text': return 'Text Content';
      case 'gallery': return 'Photo Gallery';
      case 'team': return 'Team Credits';
      case 'details': return 'Details/Info';
      case 'link': return 'External Link';
      case 'quote': return 'Quote/Review';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs tracking-wider uppercase opacity-60">
          Content Blocks
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addBlock('text')}
            className="p-1.5 opacity-60 hover:opacity-100 hover:text-accent-brand transition-all"
            title="Add Text"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => addBlock('gallery')}
            className="p-1.5 opacity-60 hover:opacity-100 hover:text-accent-brand transition-all"
            title="Add Gallery"
          >
            <Image className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => addBlock('team')}
            className="p-1.5 opacity-60 hover:opacity-100 hover:text-accent-brand transition-all"
            title="Add Team"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => addBlock('details')}
            className="p-1.5 opacity-60 hover:opacity-100 hover:text-accent-brand transition-all"
            title="Add Details"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => addBlock('quote')}
            className="p-1.5 opacity-60 hover:opacity-100 hover:text-accent-brand transition-all"
            title="Add Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => addBlock('link')}
            className="p-1.5 opacity-60 hover:opacity-100 hover:text-accent-brand transition-all"
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {blocks.length === 0 && (
        <div className="border border-border border-dashed p-8 text-center opacity-40 text-sm">
          No blocks yet. Click an icon above to add content sections.
        </div>
      )}

      <div className="space-y-3">
        {blocks.map((block, index) => {
          const Icon = getBlockIcon(block.type);
          const isExpanded = expandedBlock === index;

          return (
            <div key={index} className="border border-border bg-card">
              {/* Block Header */}
              <div className="flex items-center justify-between p-3 border-b border-border">
                <button
                  type="button"
                  onClick={() => setExpandedBlock(isExpanded ? null : index)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <Icon className="w-4 h-4 opacity-60" />
                  <span className="text-sm">{getBlockLabel(block.type)}</span>
                </button>

                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'up')}
                      className="p-1 opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                  )}
                  {index < blocks.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'down')}
                      className="p-1 opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    className="p-1 opacity-40 hover:opacity-100 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Block Content */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {block.type === 'text' && (
                    <textarea
                      value={block.content}
                      onChange={(e) => updateBlock(index, { ...block, content: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none font-mono text-sm"
                      placeholder="Enter text content..."
                    />
                  )}

                  {block.type === 'gallery' && (
                    <div className="space-y-3">
                      <ImageGalleryManager
                        label="Gallery Images"
                        images={block.images}
                        onChange={(newImages) => updateBlock(index, { ...block, images: newImages })}
                      />
                    </div>
                  )}

                  {block.type === 'team' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={block.title}
                        onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                        placeholder="Section Title (e.g., 'Design Team')"
                      />
                      {block.members.map((member, memberIndex) => (
                        <div key={memberIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => {
                              const newMembers = [...block.members];
                              newMembers[memberIndex].role = e.target.value;
                              updateBlock(index, { ...block, members: newMembers });
                            }}
                            className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                            placeholder="Role"
                          />
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => {
                              const newMembers = [...block.members];
                              newMembers[memberIndex].name = e.target.value;
                              updateBlock(index, { ...block, members: newMembers });
                            }}
                            className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                            placeholder="Name"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newMembers = block.members.filter((_, i) => i !== memberIndex);
                              updateBlock(index, { ...block, members: newMembers });
                            }}
                            className="p-2 opacity-60 hover:opacity-100 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          updateBlock(index, { ...block, members: [...block.members, { role: '', name: '' }] });
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-border hover:border-accent-brand transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Member
                      </button>
                    </div>
                  )}

                  {block.type === 'details' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={block.title}
                        onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                        placeholder="Section Title (e.g., 'Production Details')"
                      />
                      {block.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const newItems = [...block.items];
                              newItems[itemIndex].label = e.target.value;
                              updateBlock(index, { ...block, items: newItems });
                            }}
                            className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                            placeholder="Label"
                          />
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => {
                              const newItems = [...block.items];
                              newItems[itemIndex].value = e.target.value;
                              updateBlock(index, { ...block, items: newItems });
                            }}
                            className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                            placeholder="Value"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = block.items.filter((_, i) => i !== itemIndex);
                              updateBlock(index, { ...block, items: newItems });
                            }}
                            className="p-2 opacity-60 hover:opacity-100 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          updateBlock(index, { ...block, items: [...block.items, { label: '', value: '' }] });
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-border hover:border-accent-brand transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Item
                      </button>
                    </div>
                  )}

                  {block.type === 'quote' && (
                    <div className="space-y-3">
                      <textarea
                        value={block.text}
                        onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
                        placeholder="Quote text"
                      />
                      <input
                        type="text"
                        value={block.author || ''}
                        onChange={(e) => updateBlock(index, { ...block, author: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                        placeholder="Author (optional)"
                      />
                      <input
                        type="text"
                        value={block.source || ''}
                        onChange={(e) => updateBlock(index, { ...block, source: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                        placeholder="Source (optional)"
                      />
                    </div>
                  )}

                  {block.type === 'link' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={block.url}
                        onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                        placeholder="URL"
                      />
                      <input
                        type="text"
                        value={block.label}
                        onChange={(e) => updateBlock(index, { ...block, label: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                        placeholder="Link label"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}