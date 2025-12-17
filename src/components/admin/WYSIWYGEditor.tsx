import { useState, useCallback, useRef, useEffect } from 'react';
import { processPaste } from './PasteUtils';
import {
    Plus, Trash2, GripVertical, ChevronUp, ChevronDown, X,
    Image as ImageIcon, Film, LayoutGrid, Type, Quote, List, AlertCircle,
    ChevronLeft, ChevronRight, Settings, Bold, Italic, Underline,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Link2,
    Minus, MoveVertical, FoldVertical, Code
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';

// ContentBlock type - matches existing structure
export interface ContentBlock {
    id: string;
    type: 'paragraph' | 'heading' | 'image' | 'gallery' | 'quote' | 'callout' | 'video' | 'list' | 'divider' | 'spacer' | 'accordion';
    content: string;
    metadata?: {
        level?: number;
        listType?: 'bullet' | 'number';
        align?: 'left' | 'center' | 'right' | 'full';
        size?: 'small' | 'medium' | 'large' | 'full';
        caption?: string;
        alt?: string;
        galleryStyle?: 'grid' | 'carousel' | 'masonry';
        images?: { url: string; caption?: string; alt?: string }[];
        calloutType?: 'info' | 'warning' | 'success' | 'error';
        height?: 'small' | 'medium' | 'large'; // For spacer
        accordionItems?: { id: string; title: string; content: string }[]; // For FAQ/Accordion
    };
}

interface WYSIWYGEditorProps {
    blocks: ContentBlock[];
    onChange: (blocks: ContentBlock[]) => void;
}

const BLOCK_TYPES = [
    { type: 'paragraph', icon: Type, label: 'Text' },
    { type: 'heading', icon: Type, label: 'Heading' },
    { type: 'image', icon: ImageIcon, label: 'Image' },
    { type: 'gallery', icon: LayoutGrid, label: 'Gallery' },
    { type: 'video', icon: Film, label: 'Video' },
    { type: 'quote', icon: Quote, label: 'Quote' },
    { type: 'list', icon: List, label: 'List' },
    { type: 'code', icon: Code, label: 'Code' },
    { type: 'callout', icon: AlertCircle, label: 'Callout' },
    { type: 'accordion', icon: FoldVertical, label: 'Accordion' },
    { type: 'spacer', icon: MoveVertical, label: 'Space' },
    { type: 'divider', icon: Minus, label: 'Line' },
];

export function WYSIWYGEditor({ blocks = [], onChange }: WYSIWYGEditorProps) {
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [showInsertMenu, setShowInsertMenu] = useState<number | null>(null);
    const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Ensure at least one empty paragraph
    useEffect(() => {
        if (blocks.length === 0) {
            onChange([{ id: `block-${Date.now()}`, type: 'paragraph', content: '' }]);
        }
    }, [blocks.length, onChange]);

    // Rich text formatting functions
    const applyFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
    };

    const addBlock = useCallback((type: string, atIndex: number) => {
        const newBlock: ContentBlock = {
            id: `block-${Date.now()}`,
            type: type as ContentBlock['type'],
            content: '',
            metadata: type === 'heading' ? { level: 2 } :
                type === 'list' ? { listType: 'bullet' } :
                    type === 'gallery' ? { galleryStyle: 'carousel', images: [] } :
                        type === 'callout' ? { calloutType: 'info' } :
                            type === 'spacer' ? { height: 'medium' } :
                                type === 'code' ? { language: 'javascript' } :
                                    type === 'accordion' ? { accordionItems: [{ id: '1', title: 'Question', content: '' }] } : {},
        };
        const newBlocks = [...blocks];
        newBlocks.splice(atIndex, 0, newBlock);
        onChange(newBlocks);
        setShowInsertMenu(null);
        if (['image', 'gallery', 'video', 'code', 'accordion'].includes(type) && type !== 'accordion') {
            setEditingBlock(newBlock);
        }
    }, [blocks, onChange]);

    const updateBlock = useCallback((id: string, updates: Partial<ContentBlock>) => {
        onChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    }, [blocks, onChange]);

    const deleteBlock = useCallback((id: string) => {
        const newBlocks = blocks.filter(b => b.id !== id);
        onChange(newBlocks);
        setSelectedBlockId(null);
    }, [blocks, onChange]);

    const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id);
        if (direction === 'up' && index > 0) {
            const newBlocks = [...blocks];
            [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
            onChange(newBlocks);
        } else if (direction === 'down' && index < blocks.length - 1) {
            const newBlocks = [...blocks];
            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
            onChange(newBlocks);
        }
    }, [blocks, onChange]);

    const changeBlockType = (id: string, newType: string, level?: number) => {
        updateBlock(id, {
            type: newType as ContentBlock['type'],
            metadata: newType === 'heading' ? { level: level || 2 } :
                newType === 'list' ? { listType: 'bullet' } : {}
        });
    };

    // Drag and Drop Handlers - Only from grip handle
    const handleDragStart = (index: number, e: React.DragEvent) => {
        // Only allow drag if starting from grip handle
        if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
            setDraggedBlockIndex(index);
            e.dataTransfer.effectAllowed = 'move';
        } else {
            e.preventDefault();
        }
    };

    const handleDragOver = (targetIndex: number, e: React.DragEvent) => {
        // Only allow drop if we're actually dragging
        if (draggedBlockIndex !== null && draggedBlockIndex !== targetIndex) {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            setDragOverIndex(targetIndex);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (targetIndex: number, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedBlockIndex === null) return;

        const newBlocks = [...blocks];
        const [movedBlock] = newBlocks.splice(draggedBlockIndex, 1);
        newBlocks.splice(targetIndex, 0, movedBlock);

        onChange(newBlocks);
        setDraggedBlockIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedBlockIndex(null);
        setDragOverIndex(null);
    };

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLElement>, index: number, block: ContentBlock) => {
        // If pasting into a text block, allow default paste behavior but clean it
        if (['paragraph', 'heading', 'quote'].includes(block.type)) {
            // Don't prevent default - let browser paste, then clean up
            setTimeout(() => {
                const blockElement = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement;
                if (blockElement) {
                    const contentElement = blockElement.querySelector('p, h1, h2, h3, blockquote') as HTMLElement;
                    if (contentElement) {
                        // Clean up pasted content
                        const cleaned = contentElement.innerHTML
                            .replace(/style="[^"]*"/gi, '')
                            .replace(/class="[^"]*"/gi, '')
                            .replace(/<span[^>]*>/gi, '')
                            .replace(/<\/span>/gi, '')
                            .replace(/<font[^>]*>/gi, '')
                            .replace(/<\/font>/gi, '');
                        contentElement.innerHTML = cleaned;
                        updateBlock(block.id, { content: cleaned });
                    }
                }
            }, 10);
            return; // Allow default paste
        }
        
        // For other blocks or multi-line paste, create new blocks
        e.preventDefault();
        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');

        const newBlocks = processPaste(html, text);
        if (newBlocks.length > 0) {
            const updatedBlocks = [...blocks];
            updatedBlocks.splice(index + 1, 0, ...newBlocks);
            onChange(updatedBlocks);
        }
    }, [blocks, onChange, updateBlock]);

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    return (
        <div ref={containerRef} className="relative">
            {/* Fixed Toolbar - Always Visible at Top */}
            <div className="sticky top-0 z-50 flex items-center gap-1 p-3 bg-neutral-900 border border-neutral-800 border-b-2 border-b-neutral-700 rounded-t-xl overflow-x-auto shadow-lg">

                    {/* Block Type Switcher */}
                    <div className="flex items-center px-2 border-r border-neutral-800 mr-2">
                        <select
                            title="Block Type"
                            className="bg-neutral-800 text-neutral-300 text-sm border-none rounded-lg p-1.5 focus:ring-1 focus:ring-neutral-600 outline-none w-32 cursor-pointer"
                            value={selectedBlock?.type === 'heading' ? `heading-${selectedBlock.metadata?.level || 2}` : selectedBlock?.type || 'paragraph'}
                            onChange={(e) => {
                                if (!selectedBlockId) return;
                                const val = e.target.value;
                                if (val.startsWith('heading-')) {
                                    changeBlockType(selectedBlockId, 'heading', parseInt(val.split('-')[1]));
                                } else {
                                    changeBlockType(selectedBlockId, val);
                                }
                            }}
                            disabled={!selectedBlockId}
                        >
                            <option value="paragraph">Paragraph</option>
                            <option value="heading-1">Heading 1</option>
                            <option value="heading-2">Heading 2</option>
                            <option value="heading-3">Heading 3</option>
                            <option value="quote">Quote</option>
                            <option value="list">List</option>
                            <option value="callout">Callout</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1 px-2 border-r border-neutral-800">
                        <button type="button" title="Bold" onClick={() => applyFormat('bold')} onMouseDown={(e) => e.preventDefault()}
                            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors">
                            <Bold className="w-4 h-4" />
                        </button>
                        <button type="button" title="Italic" onClick={() => applyFormat('italic')} onMouseDown={(e) => e.preventDefault()}
                            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors">
                            <Italic className="w-4 h-4" />
                        </button>
                        <button type="button" title="Underline" onClick={() => applyFormat('underline')} onMouseDown={(e) => e.preventDefault()}
                            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors">
                            <Underline className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 px-2 border-r border-neutral-800">
                        <button type="button" title="Align Left" onClick={() => applyFormat('justifyLeft')} onMouseDown={(e) => e.preventDefault()}
                            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors">
                            <AlignLeft className="w-4 h-4" />
                        </button>
                        <button type="button" title="Center" onClick={() => applyFormat('justifyCenter')} onMouseDown={(e) => e.preventDefault()}
                            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors">
                            <AlignCenter className="w-4 h-4" />
                        </button>
                        <button type="button" title="Align Right" onClick={() => applyFormat('justifyRight')} onMouseDown={(e) => e.preventDefault()}
                            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors">
                            <AlignRight className="w-4 h-4" />
                        </button>
                        <button type="button" title="Justify" onClick={() => applyFormat('justifyFull')} onMouseDown={(e) => e.preventDefault()}
                            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors">
                            <AlignJustify className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 px-2">
                        <button type="button" title="Link" onClick={() => {
                            const url = window.prompt('Enter URL:');
                            if (url) applyFormat('createLink', url);
                        }} onMouseDown={(e) => e.preventDefault()} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors">
                            <Link2 className="w-4 h-4" />
                        </button>
                    </div>
            </div>

            {/* Editor Container - Scrollable */}
            <div className="bg-neutral-950 border border-neutral-800 border-t-0 rounded-b-xl shadow-inner" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                {/* Main Editor Area - Flex Gutter Layout */}
                <article className="prose prose-invert prose-lg max-w-none px-8 pl-16 py-8 min-h-[500px] focus:outline-none">
                    {blocks.map((block, index) => (
                        <div key={block.id} className="relative">

                            {/* Insert Button (Center - Restored per user request) */}
                            <InsertButton
                                index={index}
                                showMenu={showInsertMenu === index}
                                onToggle={() => setShowInsertMenu(showInsertMenu === index ? null : index)}
                                onSelect={(type) => addBlock(type, index)}
                            />

                            {/* Drop Indicator Above */}
                            {dragOverIndex === index && draggedBlockIndex !== null && draggedBlockIndex !== index && (
                                <div className="h-1 bg-accent-brand rounded-full mb-2 mx-4 animate-pulse" />
                            )}

                            {/* Block Wrapper with DnD */}
                            <BlockWrapper
                                block={block}
                                isSelected={selectedBlockId === block.id}
                                onSelect={() => setSelectedBlockId(block.id)}
                                onEdit={() => setEditingBlock(block)}
                                onDelete={() => deleteBlock(block.id)}
                                onMoveUp={() => moveBlock(block.id, 'up')}
                                onMoveDown={() => moveBlock(block.id, 'down')}
                                onInsertBelow={() => addBlock('paragraph', index + 1)}
                                canMoveUp={index > 0}
                                canMoveDown={index < blocks.length - 1}

                                // DnD Props - only from grip handle
                                draggable={false}
                                onDragStart={(e) => handleDragStart(index, e)}
                                onDragOver={(e) => handleDragOver(index, e)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(index, e)}
                                onDragEnd={handleDragEnd}
                                isDragging={draggedBlockIndex === index}
                                isDragOver={dragOverIndex === index && draggedBlockIndex !== null && draggedBlockIndex !== index}
                            >
                                <BlockContent
                                    block={block}
                                    onChange={(updates) => updateBlock(block.id, updates)}
                                    onEditRequest={() => setEditingBlock(block)}
                                    onOpenMenu={() => setShowInsertMenu(index)}
                                    onPaste={(e) => handlePaste(e, index, block)}
                                />
                            </BlockWrapper>
                        </div>
                    ))}

                    {/* Final Insert Button - Explicitly type="button" to prevent form submission */}
                    <div className="h-24 flex items-center justify-center border-t border-dashed border-neutral-800 mt-8">
                        <button type="button" onClick={() => addBlock('paragraph', blocks.length)} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300">
                            <Plus className="w-5 h-5" />
                            <span>Add content at end</span>
                        </button>
                    </div>

                    {/* Floating Toolbar for Text Selection */}
                    <FloatingToolbar onFormat={applyFormat} />
                </article>

                {/* Block Edit Modal */}
                {editingBlock && (
                    <BlockEditModal
                        block={editingBlock}
                        onSave={(updates) => {
                            updateBlock(editingBlock.id, updates);
                            setEditingBlock(null);
                        }}
                        onClose={() => setEditingBlock(null)}
                        onDelete={() => {
                            deleteBlock(editingBlock.id);
                            setEditingBlock(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// Insert Button with larger hit target
// Insert Button with larger hit target
function InsertButton({ showMenu, onToggle, onSelect }: {
    index?: number;
    showMenu: boolean;
    onToggle: () => void;
    onSelect: (type: string) => void;
}) {
    return (
        <div className="relative h-6 -my-3 group z-10 flex items-center justify-center">
            {/* Invisible Hit Area */}
            <div className="absolute inset-0 cursor-pointer" onClick={onToggle}></div>

            {/* Visible Line (on hover or menu open) */}
            <div className={`absolute left-0 right-0 h-0.5 bg-accent-brand transition-opacity duration-200 ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

            {/* Plus Button */}
            <div className={`relative z-20 transition-all duration-200 ${showMenu ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90'}`}>
                <button
                    type="button"
                    onClick={onToggle}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm border transition-colors ${showMenu
                        ? 'bg-neutral-900 border-neutral-700 text-neutral-300 rotate-45'
                        : 'bg-accent-brand border-accent-brand text-white hover:bg-accent-brand-light'
                        }`}
                    title="Insert block"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
                <div className="absolute top-8 z-50 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-100 cursor-default">
                    <div className="grid grid-cols-1 gap-0.5">
                        {BLOCK_TYPES.map((item) => (
                            <button
                                key={item.type}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onSelect(item.type); }}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors text-left w-full"
                            >
                                <span className="p-1.5 bg-neutral-800 rounded-md group-hover:bg-neutral-700">
                                    <item.icon className="w-4 h-4" />
                                </span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Block Wrapper with hover controls
function BlockWrapper({ block, isSelected, onSelect, onEdit, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown, draggable, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, isDragging, isDragOver, children }: {
    block: ContentBlock;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onInsertBelow?: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDragLeave?: () => void;
    onDrop?: (e: React.DragEvent) => void;
    onDragEnd?: () => void;
    isDragging?: boolean;
    isDragOver?: boolean;
    children: React.ReactNode;
}) {
    const needsModal = ['image', 'gallery', 'video'].includes(block.type);

    return (
        <div
            data-block-id={block.id}
            className={`group relative flex items-start -ml-12 pl-2 rounded-lg transition-all ${isSelected ? 'ring-2 ring-accent-brand ring-offset-2 ring-offset-neutral-950' : ''
                } ${isDragging ? 'opacity-50 border-2 border-dashed border-accent-brand' : ''}
                ${isDragOver ? 'border-l-4 border-l-accent-brand bg-accent-brand/5' : ''}`}
            onClick={onSelect}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {/* Left Gutter (Controls) - Flex column, prevents overlap */}
            <div className={`w-8 mr-4 flex flex-col gap-1 flex-shrink-0 pt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
                <button type="button" onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={!canMoveUp} title="Move up"
                    className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 disabled:opacity-30 transition-colors">
                    <ChevronUp className="w-4 h-4" />
                </button>
                <div
                    data-drag-handle
                    draggable
                    onDragStart={onDragStart}
                    className="p-1.5 rounded-full bg-neutral-800 text-neutral-500 cursor-grab active:cursor-grabbing hover:bg-neutral-700 hover:text-neutral-300 transition-colors flex items-center justify-center select-none"
                    title="Drag to move"
                    onMouseDown={(e) => {
                        e.stopPropagation(); // Prevent block selection when clicking grip
                    }}
                >
                    <GripVertical className="w-4 h-4" />
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={!canMoveDown} title="Move down"
                    className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 disabled:opacity-30 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* Block Content */}
            <div className="flex-1 min-w-0">
                {/* Top-right controls (Delete/Settings) - Absolute relative to content */}
                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-30 translate-x-full pl-2">
                    {needsModal && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded" title="Block Settings">
                            <Settings className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded" title="Delete Block">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}

// Block Content - renders based on type
function BlockContent({ block, onChange, onEditRequest, onOpenMenu, onPaste }: {
    block: ContentBlock;
    onChange: (updates: Partial<ContentBlock>) => void;
    onEditRequest: () => void;
    onOpenMenu?: () => void;
    onPaste?: (e: React.ClipboardEvent<HTMLElement>) => void;
}) {
    const handleTextChange = (e: React.FormEvent<HTMLElement>) => {
        onChange({ content: e.currentTarget.innerHTML });
    };

    switch (block.type) {
        case 'paragraph':
            return (
                <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={handleTextChange}
                    onInput={(e) => {
                        // Simple Slash Command Trigger
                        if (e.currentTarget.innerText === '/' && onOpenMenu) {
                            // Get selection coordinates to position menu if needed,
                            // but for now we'll just trigger the main Insert Menu for this block
                            // We might want to remove the '/' character if they select something,
                            // but keeping it simple: just show the menu if they type only '/'
                            onOpenMenu();
                        }
                    }}
                    onPaste={onPaste}
                    dangerouslySetInnerHTML={{ __html: block.content || '<br>' }}
                    className="focus:outline-none min-h-[1.5em] text-neutral-200"
                    data-placeholder="Type '/' for commands..."
                />
            );

        case 'heading':
            const level = block.metadata?.level || 2;
            const Tag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
            // Match prose heading sizes
            const headingClasses = {
                1: 'text-4xl font-bold mt-8 mb-4',
                2: 'text-3xl font-bold mt-6 mb-3',
                3: 'text-2xl font-semibold mt-4 mb-2',
            };
            return (
                <Tag
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={handleTextChange}
                    onPaste={onPaste}
                    dangerouslySetInnerHTML={{ __html: block.content || '<br>' }}
                    className={`focus:outline-none min-h-[1em] ${headingClasses[level as keyof typeof headingClasses] || headingClasses[2]}`}
                    data-placeholder="Heading..."
                />
            );

        case 'image':
            if (!block.content) {
                return (
                    <div
                        onClick={onEditRequest}
                        className="my-8 p-12 border-2 border-dashed border-neutral-600 rounded-lg text-center cursor-pointer hover:border-accent-brand transition-colors"
                    >
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-neutral-500" />
                        <p className="text-neutral-400">Click to add an image</p>
                    </div>
                );
            }
            const sizeClass = block.metadata?.size === 'small' ? 'max-w-sm' :
                block.metadata?.size === 'medium' ? 'max-w-md' :
                    block.metadata?.size === 'large' ? 'max-w-2xl' : 'max-w-full';
            return (
                <figure className="my-8" onClick={onEditRequest}>
                    <img
                        src={block.content}
                        alt={block.metadata?.alt || ''}
                        className={`rounded-lg ${sizeClass} w-full h-auto mx-auto`}
                    />
                    {block.metadata?.caption && (
                        <figcaption className="mt-2 text-sm text-neutral-400 text-center italic">
                            {block.metadata.caption}
                        </figcaption>
                    )}
                </figure>
            );

        case 'gallery':
            return <GalleryPreview block={block} onEditRequest={onEditRequest} />;

        case 'video':
            if (!block.content) {
                return (
                    <div
                        onClick={onEditRequest}
                        className="my-8 p-12 border-2 border-dashed border-neutral-600 rounded-lg text-center cursor-pointer hover:border-accent-brand transition-colors"
                    >
                        <Film className="w-12 h-12 mx-auto mb-4 text-neutral-500" />
                        <p className="text-neutral-400">Click to add a video</p>
                    </div>
                );
            }
            const embedUrl = getEmbedUrl(block.content);
            return (
                <div className="my-8 aspect-video" onClick={onEditRequest}>
                    <iframe
                        src={embedUrl}
                        title="Video embed"
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                    />
                </div>
            );

        case 'quote':
            return (
                <blockquote className="my-6 pl-6 border-l-4 border-accent-brand">
                    <p
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={handleTextChange}
                        dangerouslySetInnerHTML={{ __html: block.content || '<br>' }}
                        className="focus:outline-none italic text-neutral-300"
                        data-placeholder="Enter your quote..."
                    />
                </blockquote>
            );

        case 'list':
            const items = block.content ? block.content.split('\n') : [''];
            const ListTag = block.metadata?.listType === 'number' ? 'ol' : 'ul';

            return (
                <ListTag className={`my-4 pl-0 space-y-1 ${block.metadata?.listType === 'number' ? 'list-decimal' : 'list-disc'} list-outside ml-5`}>
                    {items.map((item, idx) => (
                        <li key={`${block.id}-item-${idx}`} className="pl-1">
                            <input
                                className="w-full bg-transparent border-none p-0 text-neutral-200 focus:ring-0 placeholder-neutral-600 focus:outline-none"
                                defaultValue={item}
                                placeholder="List item..."
                                onBlur={(e) => {
                                    const newItems = [...items];
                                    newItems[idx] = e.target.value;
                                    // Only update if changed to avoid unnecessary renders
                                    if (newItems.join('\n') !== block.content) {
                                        onChange({ content: newItems.join('\n') });
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Save current line content before splitting
                                        const currentVal = e.currentTarget.value;
                                        const newItems = [...items];
                                        newItems[idx] = currentVal;
                                        newItems.splice(idx + 1, 0, '');
                                        onChange({ content: newItems.join('\n') });

                                        // Focus next input on next render
                                        setTimeout(() => {
                                            const inputs = (e.currentTarget.closest('ul, ol') as HTMLElement)?.querySelectorAll('input');
                                            if (inputs && inputs[idx + 1]) (inputs[idx + 1] as HTMLInputElement).focus();
                                        }, 10);
                                    } else if (e.key === 'Backspace' && e.currentTarget.value === '' && items.length > 1) {
                                        e.preventDefault();
                                        const newItems = [...items];
                                        newItems.splice(idx, 1);
                                        onChange({ content: newItems.join('\n') });
                                        setTimeout(() => {
                                            const inputs = (e.currentTarget.closest('ul, ol') as HTMLElement)?.querySelectorAll('input');
                                            if (inputs && inputs[idx - 1]) (inputs[idx - 1] as HTMLInputElement).focus();
                                        }, 10);
                                    }
                                }}
                            />
                        </li>
                    ))}
                </ListTag>
            );

        case 'callout':
            const calloutStyles = {
                info: 'bg-blue-500/10 border-blue-500/50 text-blue-400',
                warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
                success: 'bg-green-500/10 border-green-500/50 text-green-400',
                error: 'bg-red-500/10 border-red-500/50 text-red-400',
            };
            const calloutType = block.metadata?.calloutType || 'info';
            return (
                <div className={`my-6 p-4 border-l-4 rounded-r-lg ${calloutStyles[calloutType]}`}>
                    <p
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={handleTextChange}
                        dangerouslySetInnerHTML={{ __html: block.content || '<br>' }}
                        className="focus:outline-none"
                        data-placeholder="Callout text..."
                    />
                </div>
            );

        case 'accordion':
            return <AccordionBlock block={block} onChange={onChange} />;

        case 'spacer':
            const heights = { small: 'h-8', medium: 'h-16', large: 'h-32' };
            const height = block.metadata?.height || 'medium';
            return (
                <div className={`w-full ${heights[height]} border-l-2 border-dashed border-neutral-800 hover:border-neutral-700 relative group transition-colors flex items-center justify-center`}>
                    <div className="absolute opacity-0 group-hover:opacity-100 bg-neutral-900 border border-neutral-700 rounded-md p-1 flex gap-1 z-10">
                        {(['small', 'medium', 'large'] as const).map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onChange({ metadata: { ...block.metadata, height: s } }); }}
                                className={`px-2 py-1 text-xs rounded ${height === s ? 'bg-accent-brand text-white' : 'hover:bg-neutral-800 text-neutral-400'}`}
                            >
                                {s.charAt(0).toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-neutral-600 font-mono opacity-0 group-hover:opacity-100">Spacer ({height})</span>
                </div>
            );

        case 'code':
            return (
                <div className="my-6" onClick={onEditRequest}>
                    {block.metadata?.language && (
                        <div className="bg-neutral-800 px-4 py-2 text-xs text-neutral-400 rounded-t-lg border-b border-neutral-700 uppercase tracking-wider">
                            {block.metadata.language}
                        </div>
                    )}
                    <pre className={`bg-neutral-900 p-4 rounded-lg ${!block.metadata?.language ? 'rounded-t-lg' : 'rounded-t-none'} overflow-x-auto border border-neutral-800`}>
                        <code className="text-sm font-mono text-neutral-200 whitespace-pre">
                            {block.content || '// Enter your code here...'}
                        </code>
                    </pre>
                </div>
            );

        case 'divider':
            return <hr className="my-12 border-t-2 border-neutral-800" />;

        default:
            return null;
    }
}

// Gallery Preview with carousel
function GalleryPreview({ block, onEditRequest }: { block: ContentBlock; onEditRequest: () => void }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const images = block.metadata?.images || [];
    const style = block.metadata?.galleryStyle || 'carousel';

    if (images.length === 0) {
        return (
            <div
                onClick={onEditRequest}
                className="my-8 p-12 border-2 border-dashed border-neutral-600 rounded-lg text-center cursor-pointer hover:border-accent-brand transition-colors"
            >
                <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-neutral-500" />
                <p className="text-neutral-400">Click to create a gallery</p>
            </div>
        );
    }

    if (style === 'carousel') {
        return (
            <div className="my-8 relative" onClick={onEditRequest}>
                <div className="overflow-hidden rounded-lg">
                    <div className="relative aspect-[16/9] bg-neutral-900">
                        <img
                            src={images[currentSlide]?.url}
                            alt={images[currentSlide]?.alt || ''}
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            title="Previous slide"
                            onClick={(e) => { e.stopPropagation(); setCurrentSlide(Math.max(0, currentSlide - 1)); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            type="button"
                            title="Next slide"
                            onClick={(e) => { e.stopPropagation(); setCurrentSlide(Math.min(images.length - 1, currentSlide + 1)); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    title={`Go to slide ${idx + 1}`}
                                    onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlide ? 'bg-white' : 'bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
                {images[currentSlide]?.caption && (
                    <p className="mt-2 text-sm text-neutral-400 text-center">{images[currentSlide].caption}</p>
                )}
            </div>
        );
    }

    if (style === 'grid') {
        return (
            <div className="my-8 grid grid-cols-2 md:grid-cols-3 gap-4" onClick={onEditRequest}>
                {images.map((img, idx) => (
                    <div key={idx} className="relative">
                        <img src={img.url} alt={img.alt || ''} className="w-full h-48 object-cover rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    // Masonry
    return (
        <div className="my-8 columns-2 md:columns-3 gap-4" onClick={onEditRequest}>
            {images.map((img, idx) => (
                <div key={idx} className="mb-4 break-inside-avoid">
                    <img src={img.url} alt={img.alt || ''} className="w-full rounded-lg" />
                </div>
            ))}
        </div>
    );
}

// Block Edit Modal
function BlockEditModal({ block, onSave, onClose, onDelete }: {
    block: ContentBlock;
    onSave: (updates: Partial<ContentBlock>) => void;
    onClose: () => void;
    onDelete: () => void;
}) {
    const [content, setContent] = useState(block.content);
    const [metadata, setMetadata] = useState(block.metadata || {});

    const handleSave = () => {
        onSave({ content, metadata });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                    <h3 className="text-lg font-medium capitalize">Edit {block.type}</h3>
                    <button type="button" title="Close" onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {block.type === 'image' && (
                        <ImageEditor
                            content={content}
                            metadata={metadata}
                            onContentChange={setContent}
                            onMetadataChange={(m) => m && setMetadata(m)}
                        />
                    )}

                    {block.type === 'gallery' && (
                        <GalleryEditor
                            metadata={metadata}
                            onMetadataChange={(m) => m && setMetadata(m)}
                        />
                    )}

                    {block.type === 'video' && (
                        <VideoEditor
                            content={content}
                            onContentChange={setContent}
                        />
                    )}

                    {block.type === 'code' && (
                        <CodeEditor
                            content={content}
                            metadata={metadata}
                            onContentChange={setContent}
                            onMetadataChange={(m) => m && setMetadata(m)}
                        />
                    )}
                </div>

                <div className="flex items-center justify-between p-4 border-t border-neutral-700">
                    <button type="button" onClick={onDelete}
                        className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg">
                            Cancel
                        </button>
                        <button type="button" onClick={handleSave}
                            className="px-6 py-2 bg-accent-brand hover:bg-accent-brand/80 rounded-lg">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Image Editor
function ImageEditor({ content, metadata, onContentChange, onMetadataChange }: {
    content: string;
    metadata: ContentBlock['metadata'];
    onContentChange: (url: string) => void;
    onMetadataChange: (meta: ContentBlock['metadata']) => void;
}) {
    return (
        <div className="space-y-6">
            {content ? (
                <div className="relative">
                    <img src={content} alt="" className="w-full max-h-64 object-contain rounded-lg bg-neutral-800" />
                    <button type="button" title="Remove image" onClick={() => onContentChange('')}
                        className="absolute top-2 right-2 p-2 bg-red-500 rounded-full">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <ImageUploader label="Upload Image" value="" onChange={onContentChange} bucketName="blog" />
            )}

            <div>
                <label className="block text-sm text-neutral-400 mb-2">Alt Text (SEO)</label>
                <input
                    type="text"
                    value={metadata?.alt || ''}
                    onChange={(e) => onMetadataChange({ ...metadata, alt: e.target.value })}
                    placeholder="Describe the image..."
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:border-accent-brand focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm text-neutral-400 mb-2">Caption</label>
                <input
                    type="text"
                    value={metadata?.caption || ''}
                    onChange={(e) => onMetadataChange({ ...metadata, caption: e.target.value })}
                    placeholder="Optional caption..."
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:border-accent-brand focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm text-neutral-400 mb-2">Size</label>
                <div className="flex gap-2">
                    {(['small', 'medium', 'large', 'full'] as const).map((size) => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => onMetadataChange({ ...metadata, size })}
                            className={`flex-1 py-2 rounded-lg capitalize ${metadata?.size === size ? 'bg-accent-brand text-white' : 'bg-neutral-800 text-neutral-300'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Floating Toolbar for text selection
function FloatingToolbar({ onFormat }: { onFormat: (command: string, value?: string) => void }) {
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed) {
                setPosition(null);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            if (rect.width === 0 && rect.height === 0) return; // Hidden selection

            // Calculate position relative to viewport
            setPosition({
                top: Math.max(10, rect.top - 50), // Position above selection, prevent going off top
                left: Math.max(10, rect.left + (rect.width / 2) - 100) // Center horizontally
            });
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    if (!position) return null;

    return (
        <div
            className="fixed z-50 flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-150"
            style={{ top: position.top, left: position.left }}
            onMouseDown={(e) => e.preventDefault()} // Prevent losing focus when clicking buttons
        >
            <button type="button" onClick={() => onFormat('bold')} className="p-1.5 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white" title="Bold">
                <Bold className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => onFormat('italic')} className="p-1.5 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white" title="Italic">
                <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-neutral-700 mx-1" />
            <button type="button" onClick={() => onFormat('justifyLeft')} className="p-1.5 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white" title="Align Left">
                <AlignLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => onFormat('justifyFull')} className="p-1.5 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white" title="Justify">
                <AlignJustify className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-neutral-700 mx-1" />
            <button type="button" onClick={() => {
                const url = window.prompt('Enter URL:');
                if (url) onFormat('createLink', url);
            }} className="p-1.5 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white" title="Link">
                <Link2 className="w-4 h-4" />
            </button>
        </div>
    );
}

// Gallery Editor
function GalleryEditor({ metadata, onMetadataChange }: {
    metadata: ContentBlock['metadata'];
    onMetadataChange: (meta: ContentBlock['metadata']) => void;
}) {
    const images = metadata?.images || [];
    const style = metadata?.galleryStyle || 'carousel';

    const addImage = (url: string) => {
        onMetadataChange({ ...metadata, images: [...images, { url, caption: '', alt: '' }] });
    };

    const removeImage = (index: number) => {
        onMetadataChange({ ...metadata, images: images.filter((_, i) => i !== index) });
    };

    const updateImage = (index: number, updates: Partial<{ url: string; caption?: string; alt?: string }>) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], ...updates };
        onMetadataChange({ ...metadata, images: newImages });
    };

    return (
        <div className="space-y-6">
            {/* Gallery Style Selector */}
            <div>
                <label className="block text-sm text-neutral-400 mb-2">Gallery Layout</label>
                <div className="flex gap-2">
                    {(['carousel', 'grid', 'masonry'] as const).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => onMetadataChange({ ...metadata, galleryStyle: s })}
                            className={`flex-1 py-3 rounded-lg capitalize ${style === s ? 'bg-accent-brand text-white' : 'bg-neutral-800 text-neutral-300'
                                }`}
                        >
                            {s === 'carousel' && '◁ '}
                            {s}
                            {s === 'carousel' && ' ▷'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Images List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                        <img src={img.url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <input
                                type="text"
                                value={img.alt || ''}
                                onChange={(e) => updateImage(idx, { alt: e.target.value })}
                                placeholder="Alt text..."
                                className="w-full px-3 py-1 bg-neutral-700 rounded text-sm"
                            />
                            <input
                                type="text"
                                value={img.caption || ''}
                                onChange={(e) => updateImage(idx, { caption: e.target.value })}
                                placeholder="Caption..."
                                className="w-full px-3 py-1 bg-gray-700 rounded text-sm"
                            />
                        </div>
                        <button type="button" title="Remove image" onClick={() => removeImage(idx)} className="p-2 text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Image */}
            <ImageUploader label="Add Image" value="" onChange={addImage} bucketName="blog" />

            {/* Preview */}
            {images.length > 0 && (
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Preview ({images.length} images)</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((img, idx) => (
                            <img key={idx} src={img.url} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Code Editor
function CodeEditor({ content, metadata, onContentChange, onMetadataChange }: {
    content: string;
    metadata: ContentBlock['metadata'];
    onContentChange: (code: string) => void;
    onMetadataChange: (meta: ContentBlock['metadata']) => void;
}) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm text-neutral-400 mb-2">Language (optional)</label>
                <input
                    type="text"
                    value={metadata?.language || ''}
                    onChange={(e) => onMetadataChange({ ...metadata, language: e.target.value })}
                    placeholder="e.g., javascript, python, css, html"
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:border-accent-brand focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-sm text-neutral-400 mb-2">Code</label>
                <textarea
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    placeholder="Paste your code here..."
                    rows={15}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:border-accent-brand focus:outline-none resize-none font-mono text-sm text-neutral-200"
                />
            </div>
        </div>
    );
}

// Video Editor
function VideoEditor({ content, onContentChange }: {
    content: string;
    onContentChange: (url: string) => void;
}) {
    const embedUrl = content ? getEmbedUrl(content) : '';

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm text-gray-400 mb-2">Video URL</label>
                <input
                    type="text"
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    placeholder="Paste YouTube or Vimeo URL..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-accent-brand focus:outline-none"
                />
            </div>

            {embedUrl && (
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Preview</label>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-800">
                        <iframe src={embedUrl} title="Video preview" className="w-full h-full" allowFullScreen />
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function
// Accordion Block Component
function AccordionBlock({ block, onChange }: { block: ContentBlock; onChange: (updates: Partial<ContentBlock>) => void }) {
    const accordionItems = block.metadata?.accordionItems || [{ id: '1', title: 'Question', content: '' }];
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    
    return (
        <div className="my-6 space-y-3">
            {accordionItems.map((item, idx) => {
                const itemId = item.id || `item-${idx}`;
                const isExpanded = expandedItems.has(itemId);
                return (
                    <div key={itemId} className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/50">
                        <div 
                            className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-neutral-800/50 transition-colors"
                            onClick={() => {
                                const newExpanded = new Set(expandedItems);
                                if (isExpanded) {
                                    newExpanded.delete(itemId);
                                } else {
                                    newExpanded.add(itemId);
                                }
                                setExpandedItems(newExpanded);
                            }}
                        >
                            <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                            <input
                                type="text"
                                value={item.title}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                    const newItems = [...accordionItems];
                                    newItems[idx] = { ...item, title: e.target.value };
                                    onChange({ metadata: { ...block.metadata, accordionItems: newItems } });
                                }}
                                placeholder="Question / Title"
                                className="bg-transparent border-none p-0 text-neutral-200 font-medium focus:ring-0 placeholder-neutral-600 focus:outline-none flex-1"
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const newItems = accordionItems.filter((_, i) => i !== idx);
                                    onChange({ metadata: { ...block.metadata, accordionItems: newItems } });
                                }}
                                className="p-1.5 hover:bg-neutral-700 rounded text-neutral-500 hover:text-red-400 transition-colors"
                                title="Remove item"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {isExpanded && (
                            <div className="px-4 pb-4 pt-2 bg-neutral-950 border-t border-neutral-800">
                                <div
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                        const newItems = [...accordionItems];
                                        newItems[idx] = { ...item, content: e.currentTarget.innerHTML };
                                        onChange({ metadata: { ...block.metadata, accordionItems: newItems } });
                                    }}
                                    dangerouslySetInnerHTML={{ __html: item.content || '<br>' }}
                                    className="focus:outline-none min-h-[2em] text-neutral-300 prose prose-invert max-w-none"
                                    data-placeholder="Answer..."
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newItems = [...accordionItems, { id: `item-${Date.now()}`, title: '', content: '' }];
                    onChange({ metadata: { ...block.metadata, accordionItems: newItems } });
                }}
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-accent-brand transition-colors px-3 py-2 border border-dashed border-neutral-700 rounded-lg hover:border-accent-brand"
            >
                <Plus className="w-4 h-4" /> Add Question
            </button>
        </div>
    );
}

function getEmbedUrl(url: string): string {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
        const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
        if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
}
