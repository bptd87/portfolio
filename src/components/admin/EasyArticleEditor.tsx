import { useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import {
    Bold, Italic, Underline as UnderlineIcon, Link2,
    Heading1, Heading2, Heading3, Quote, List, ListOrdered,
    Image as ImageIcon, Film, X, LayoutGrid, Plus,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, Settings,
    AlertCircle, FoldVertical, MoveVertical, Minus, Code
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { ContentBlock } from './WYSIWYGEditor';

interface EasyArticleEditorProps {
    blocks: ContentBlock[];
    onChange: (blocks: ContentBlock[]) => void;
}

export function EasyArticleEditor({ blocks = [], onChange }: EasyArticleEditorProps) {
    console.log('EasyArticleEditor loaded with', blocks.length, 'blocks');
    const [showImageUploader, setShowImageUploader] = useState(false);
    const [showVideoInput, setShowVideoInput] = useState(false);
    const [showGalleryEditor, setShowGalleryEditor] = useState(false);
    const [showCalloutEditor, setShowCalloutEditor] = useState(false);
    const [showAccordionEditor, setShowAccordionEditor] = useState(false);
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [showInsertMenu, setShowInsertMenu] = useState(false);
    const [codeLanguage, setCodeLanguage] = useState('');
    const [codeContent, setCodeContent] = useState('');
    const [selectedImage, setSelectedImage] = useState<{ src: string; pos: number } | null>(null);
    const [imageAlt, setImageAlt] = useState('');
    const [imageSize, setImageSize] = useState<'small' | 'medium' | 'full'>('full');
    const [videoUrl, setVideoUrl] = useState('');
    const [galleryImages, setGalleryImages] = useState<{ url: string; caption?: string; alt?: string }[]>([]);
    const [galleryType, setGalleryType] = useState<'grid' | 'carousel' | 'masonry'>('grid');
    const [calloutType, setCalloutType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
    const [calloutText, setCalloutText] = useState('');
    const [accordionItems, setAccordionItems] = useState<{ id: string; title: string; content: string }[]>([
        { id: '1', title: 'Question', content: '' }
    ]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Convert blocks to HTML for TipTap - only convert regular content blocks
    const blocksToHtml = useCallback((blocks: ContentBlock[]): string => {
        if (!blocks || blocks.length === 0) return '<p></p>';
        
        // Filter out special blocks (they're handled separately)
        const regularBlocks = blocks.filter(b => 
            !['callout', 'accordion', 'spacer', 'divider', 'gallery', 'video', 'code'].includes(b.type)
        );
        
        if (regularBlocks.length === 0) return '<p></p>';
        
        return regularBlocks.map(block => {
            if (block.type === 'heading') {
                const level = block.metadata?.level || 2;
                return `<h${level}>${block.content}</h${level}>`;
            }
            if (block.type === 'list') {
                const items = block.content.split('\n').filter(i => i.trim()).map(item => `<li>${item}</li>`).join('');
                const tag = block.metadata?.listType === 'number' ? 'ol' : 'ul';
                return `<${tag}>${items}</${tag}>`;
            }
            if (block.type === 'image') {
                return `<img src="${block.content}" alt="${block.metadata?.alt || ''}" />`;
            }
            if (block.type === 'quote') {
                return `<blockquote>${block.content}</blockquote>`;
            }
            return `<p>${block.content || ''}</p>`;
        }).join('') || '<p></p>';
    }, []);

    // Convert HTML back to blocks - preserve special blocks from existing blocks
    const htmlToBlocks = useCallback((html: string, existingBlocks: ContentBlock[]): ContentBlock[] => {
        // Extract special blocks (callout, accordion, spacer, divider, gallery, video, code) from existing
        const specialBlocks = existingBlocks.filter(b => 
            ['callout', 'accordion', 'spacer', 'divider', 'gallery', 'video', 'code'].includes(b.type)
        );
        
        // Convert TipTap HTML to regular content blocks
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const elements = Array.from(doc.body.childNodes);
        const newBlocks: ContentBlock[] = [];
        let blockIndex = 0;

        for (let i = 0; i < elements.length; i++) {
            const node = elements[i];
            
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const id = `block-${Date.now()}-${blockIndex++}`;

                if (el.tagName.match(/^H[1-6]$/)) {
                    const level = parseInt(el.tagName[1]);
                    newBlocks.push({ id, type: 'heading', content: el.textContent || '', metadata: { level } });
                } else if (el.tagName === 'UL' || el.tagName === 'OL') {
                    const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '').join('\n');
                    newBlocks.push({ 
                        id, 
                        type: 'list', 
                        content: items, 
                        metadata: { listType: el.tagName === 'OL' ? 'number' : 'bullet' } 
                    });
                } else if (el.tagName === 'IMG') {
                    const img = el as HTMLImageElement;
                    newBlocks.push({ id, type: 'image', content: img.src, metadata: { alt: img.alt } });
                } else if (el.tagName === 'BLOCKQUOTE') {
                    newBlocks.push({ id, type: 'quote', content: el.innerHTML });
                } else if (el.tagName === 'HR') {
                    newBlocks.push({ id, type: 'divider', content: '' });
                } else if (el.tagName === 'PRE' || (el.tagName === 'CODE' && el.parentElement?.tagName === 'PRE')) {
                    const codeEl = el.tagName === 'CODE' ? el : el.querySelector('code');
                    const codeText = codeEl?.textContent || el.textContent || '';
                    newBlocks.push({ 
                        id, 
                        type: 'code', 
                        content: codeText,
                        metadata: { language: codeEl?.className?.replace('language-', '') || '' }
                    });
                } else if (el.tagName === 'P' && el.textContent?.trim()) {
                    newBlocks.push({ id, type: 'paragraph', content: el.textContent });
                }
            }
        }

        // Merge regular blocks with special blocks (preserve special blocks)
        // For now, append special blocks at the end - in a real implementation, 
        // you'd want to track their positions, but this is simpler
        return [...newBlocks, ...specialBlocks];
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder: 'Start writing your article...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-accent-brand underline cursor-pointer' },
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            Image.configure({
                inline: false,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full mx-auto my-4 cursor-pointer',
                },
            }),
        ],
        content: blocksToHtml(blocks),
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] p-6',
            },
            handleClick: (view, pos, event) => {
                const target = event.target as HTMLElement;
                if (target.tagName === 'IMG') {
                    const src = (target as HTMLImageElement).src;
                    setSelectedImage({ src, pos });
                    setImageAlt((target as HTMLImageElement).alt || '');
                    if (target.classList.contains('max-w-sm')) setImageSize('small');
                    else if (target.classList.contains('max-w-2xl')) setImageSize('medium');
                    else setImageSize('full');
                    return true;
                }
                return false;
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const newBlocks = htmlToBlocks(html, blocks);
            onChange(newBlocks);
        },
    });

    const setLink = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('URL', editor.getAttributes('link').href);
        if (url === null) return;
        if (url === '') { 
            editor.chain().focus().extendMarkRange('link').unsetLink().run(); 
            return; 
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const insertImage = useCallback((url: string) => {
        if (!editor) return;
        editor.chain().focus().setImage({ src: url }).run();
        setShowImageUploader(false);
        setShowInsertMenu(false);
    }, [editor]);

    const insertVideo = useCallback(() => {
        if (!editor || !videoUrl) return;
        const embedUrl = getEmbedUrl(videoUrl);
        const newBlock: ContentBlock = {
            id: `block-${Date.now()}`,
            type: 'video',
            content: embedUrl,
        };
        // Add video block directly to blocks array
        onChange([...blocks, newBlock]);
        setVideoUrl('');
        setShowVideoInput(false);
        setShowInsertMenu(false);
    }, [editor, videoUrl, blocks, onChange]);

    const insertGallery = useCallback(() => {
        if (!editor || galleryImages.length === 0) return;
        const newBlock: ContentBlock = {
            id: `block-${Date.now()}`,
            type: 'gallery',
            content: '',
            metadata: {
                galleryStyle: galleryType,
                images: galleryImages
            }
        };
        onChange([...blocks, newBlock]);
        setGalleryImages([]);
        setShowGalleryEditor(false);
        setShowInsertMenu(false);
    }, [editor, galleryImages, galleryType, blocks, onChange]);

    const insertCallout = useCallback(() => {
        if (!editor || !calloutText.trim()) return;
        const newBlock: ContentBlock = {
            id: `block-${Date.now()}`,
            type: 'callout',
            content: calloutText,
            metadata: { calloutType: calloutType }
        };
        onChange([...blocks, newBlock]);
        setCalloutText('');
        setShowCalloutEditor(false);
        setShowInsertMenu(false);
    }, [editor, calloutText, calloutType, blocks, onChange]);

    const insertAccordion = useCallback(() => {
        if (!editor || accordionItems.length === 0) return;
        const newBlock: ContentBlock = {
            id: `block-${Date.now()}`,
            type: 'accordion',
            content: '',
            metadata: { accordionItems: accordionItems }
        };
        onChange([...blocks, newBlock]);
        setAccordionItems([{ id: '1', title: 'Question', content: '' }]);
        setShowAccordionEditor(false);
        setShowInsertMenu(false);
    }, [editor, accordionItems, blocks, onChange]);

    const insertSpacer = useCallback((height: 'small' | 'medium' | 'large' = 'medium') => {
        if (!editor) return;
        const newBlock: ContentBlock = {
            id: `block-${Date.now()}`,
            type: 'spacer',
            content: '',
            metadata: { height }
        };
        onChange([...blocks, newBlock]);
        setShowInsertMenu(false);
    }, [editor, blocks, onChange]);

    const insertDivider = useCallback(() => {
        if (!editor) return;
        const newBlock: ContentBlock = {
            id: `block-${Date.now()}`,
            type: 'divider',
            content: ''
        };
        onChange([...blocks, newBlock]);
        setShowInsertMenu(false);
    }, [editor, blocks, onChange]);

    const insertCodeBlock = useCallback(() => {
        if (!editor || !codeContent.trim()) return;
        const newBlock: ContentBlock = {
            id: `block-${Date.now()}`,
            type: 'code',
            content: codeContent,
            metadata: { language: codeLanguage || 'text' }
        };
        onChange([...blocks, newBlock]);
        setCodeContent('');
        setCodeLanguage('');
        setShowCodeEditor(false);
        setShowInsertMenu(false);
    }, [editor, codeContent, codeLanguage, blocks, onChange]);

    const updateImage = useCallback(() => {
        if (!editor || !selectedImage) return;
        const sizeClass = imageSize === 'small' ? 'max-w-sm' : imageSize === 'medium' ? 'max-w-2xl' : 'max-w-full';
        editor.chain().focus()
            .setImage({ src: selectedImage.src, alt: imageAlt })
            .run();
        setSelectedImage(null);
    }, [editor, selectedImage, imageAlt, imageSize]);

    const deleteImage = useCallback(() => {
        if (!editor || !selectedImage) return;
        editor.chain().focus().deleteSelection().run();
        setSelectedImage(null);
    }, [editor, selectedImage]);

    if (!editor) return null;

    return (
        <div ref={containerRef} className="relative">
            {/* Simple Toolbar - Always Visible and Sticky */}
            <div className="sticky top-0 z-50 flex items-center gap-1 p-3 bg-gray-900 border-b-2 border-gray-700 rounded-t-xl overflow-x-auto shadow-lg">
                <button type="button" title="Bold (Ctrl+B)"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Bold className="w-4 h-4" />
                </button>
                <button type="button" title="Italic (Ctrl+I)"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Italic className="w-4 h-4" />
                </button>
                <button type="button" title="Underline (Ctrl+U)"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('underline') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <UnderlineIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-600" />
                <button type="button" title="Link"
                    onMouseDown={(e) => { e.preventDefault(); setLink(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('link') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Link2 className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-600" />
                <button type="button" title="Heading 1"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 1 }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Heading1 className="w-4 h-4" />
                </button>
                <button type="button" title="Heading 2"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Heading2 className="w-4 h-4" />
                </button>
                <button type="button" title="Heading 3"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 3 }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Heading3 className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-600" />
                <button type="button" title="Bullet List"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <List className="w-4 h-4" />
                </button>
                <button type="button" title="Numbered List"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <ListOrdered className="w-4 h-4" />
                </button>
                <button type="button" title="Quote"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('blockquote') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Quote className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-600" />
                <button type="button" title="Align Left"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <AlignLeft className="w-4 h-4" />
                </button>
                <button type="button" title="Align Center"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <AlignCenter className="w-4 h-4" />
                </button>
                <button type="button" title="Align Right"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <AlignRight className="w-4 h-4" />
                </button>
                <button type="button" title="Justify"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('justify').run(); }}
                    className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <AlignJustify className="w-4 h-4" />
                </button>
            </div>

            {/* Editor Content */}
            <div className="border border-gray-700 border-t-0 rounded-b-xl bg-gray-950 relative">
                <EditorContent editor={editor} />
            </div>

            {/* Floating Insert Button */}
            <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
                {showInsertMenu && (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 min-w-[180px] mb-1">
                        <div className="space-y-1">
                            <button type="button" onClick={() => { setShowImageUploader(true); setShowInsertMenu(false); }}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-white">
                                <ImageIcon className="w-4 h-4 text-gray-400" /> Image
                            </button>
                            <button type="button" onClick={() => { setShowGalleryEditor(true); setShowInsertMenu(false); }}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-white">
                                <LayoutGrid className="w-4 h-4 text-gray-400" /> Gallery
                            </button>
                            <button type="button" onClick={() => { setShowVideoInput(true); setShowInsertMenu(false); }}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-white">
                                <Film className="w-4 h-4 text-gray-400" /> Video
                            </button>
                            <div className="h-px bg-gray-700 my-1" />
                            <button type="button" onClick={() => { setShowCalloutEditor(true); setShowInsertMenu(false); }}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-white">
                                <AlertCircle className="w-4 h-4 text-gray-400" /> Callout
                            </button>
                            <button type="button" onClick={() => { setShowAccordionEditor(true); setShowInsertMenu(false); }}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-white">
                                <FoldVertical className="w-4 h-4 text-gray-400" /> Accordion
                            </button>
                            <button type="button" onClick={() => insertDivider()}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-white">
                                <Minus className="w-4 h-4 text-gray-400" /> Divider
                            </button>
                            <button type="button" onClick={() => insertSpacer('medium')}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-white">
                                <MoveVertical className="w-4 h-4 text-gray-400" /> Spacer
                            </button>
                            <div className="h-px bg-gray-700 my-1" />
                            <button type="button" onClick={() => { setShowCodeEditor(true); setShowInsertMenu(false); }}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-white">
                                <Code className="w-4 h-4 text-gray-400" /> Code Block
                            </button>
                        </div>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setShowInsertMenu(!showInsertMenu)}
                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${showInsertMenu ? 'bg-red-500 hover:bg-red-600 rotate-45' : 'bg-accent-brand hover:bg-accent-brand/80'
                        }`}
                    title="Insert Media or Special Block"
                >
                    <Plus className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Image Editor Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Settings className="w-5 h-5" /> Edit Image
                            </h3>
                            <button type="button" title="Close" onClick={() => setSelectedImage(null)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <img src={selectedImage.src} alt="" className="w-full max-h-48 object-contain rounded-lg mb-4 bg-gray-800" />
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Alt Text (SEO)</label>
                                <input
                                    type="text"
                                    value={imageAlt}
                                    onChange={(e) => setImageAlt(e.target.value)}
                                    placeholder="Describe the image..."
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-accent-brand focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Size</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setImageSize('small')}
                                        className={`flex-1 py-2 rounded-lg ${imageSize === 'small' ? 'bg-accent-brand text-white' : 'bg-gray-800 text-gray-300'}`}>
                                        Small
                                    </button>
                                    <button type="button" onClick={() => setImageSize('medium')}
                                        className={`flex-1 py-2 rounded-lg ${imageSize === 'medium' ? 'bg-accent-brand text-white' : 'bg-gray-800 text-gray-300'}`}>
                                        Medium
                                    </button>
                                    <button type="button" onClick={() => setImageSize('full')}
                                        className={`flex-1 py-2 rounded-lg ${imageSize === 'full' ? 'bg-accent-brand text-white' : 'bg-gray-800 text-gray-300'}`}>
                                        Full
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={updateImage}
                                    className="flex-1 py-2 bg-accent-brand text-white rounded-lg hover:bg-accent-brand/80">
                                    Save Changes
                                </button>
                                <button type="button" onClick={deleteImage}
                                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Uploader Modal */}
            {showImageUploader && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Insert Image</h3>
                            <button type="button" title="Close" onClick={() => setShowImageUploader(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <ImageUploader label="" value="" onChange={(url) => insertImage(url)} bucketName="blog" />
                    </div>
                </div>
            )}

            {/* Video Input Modal */}
            {showVideoInput && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Embed Video</h3>
                            <button type="button" title="Close" onClick={() => setShowVideoInput(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="Paste YouTube or Vimeo URL..."
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-accent-brand focus:outline-none mb-4"
                        />
                        <button type="button" onClick={insertVideo} disabled={!videoUrl}
                            className="w-full py-2 bg-accent-brand text-white rounded-lg hover:bg-accent-brand/80 disabled:opacity-50">
                            Insert Video
                        </button>
                    </div>
                </div>
            )}

            {/* Gallery Editor Modal */}
            {showGalleryEditor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-4 my-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Create Gallery</h3>
                            <button type="button" title="Close" onClick={() => { setShowGalleryEditor(false); setGalleryImages([]); }}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <button type="button" onClick={() => setGalleryType('grid')}
                                className={`px-4 py-2 rounded-lg ${galleryType === 'grid' ? 'bg-accent-brand text-white' : 'bg-gray-800 text-gray-300'}`}>
                                Grid
                            </button>
                            <button type="button" onClick={() => setGalleryType('carousel')}
                                className={`px-4 py-2 rounded-lg ${galleryType === 'carousel' ? 'bg-accent-brand text-white' : 'bg-gray-800 text-gray-300'}`}>
                                Carousel
                            </button>
                            <button type="button" onClick={() => setGalleryType('masonry')}
                                className={`px-4 py-2 rounded-lg ${galleryType === 'masonry' ? 'bg-accent-brand text-white' : 'bg-gray-800 text-gray-300'}`}>
                                Masonry
                            </button>
                        </div>

                        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                            {galleryImages.map((img, i) => (
                                <div key={i} className="p-3 bg-gray-800 rounded-lg space-y-2">
                                    <div className="flex items-center gap-3">
                                        <img src={img.url} alt="" className="w-20 h-20 object-cover rounded" />
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={img.caption || ''}
                                                onChange={(e) => {
                                                    const updated = [...galleryImages];
                                                    updated[i] = { ...img, caption: e.target.value };
                                                    setGalleryImages(updated);
                                                }}
                                                placeholder="Caption (optional)"
                                                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={img.alt || ''}
                                                onChange={(e) => {
                                                    const updated = [...galleryImages];
                                                    updated[i] = { ...img, alt: e.target.value };
                                                    setGalleryImages(updated);
                                                }}
                                                placeholder="Alt text (for SEO)"
                                                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-sm"
                                            />
                                        </div>
                                        <button type="button" title="Remove Image" onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                                            className="p-2 text-red-400 hover:text-red-300">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <ImageUploader
                            label="Add Image to Gallery"
                            value=""
                            onChange={(url) => setGalleryImages([...galleryImages, { url, caption: '', alt: '' }])}
                            bucketName="blog"
                        />

                        <button type="button" onClick={insertGallery} disabled={galleryImages.length === 0}
                            className="w-full mt-4 py-2 bg-accent-brand text-white rounded-lg hover:bg-accent-brand/80 disabled:opacity-50">
                            Insert Gallery ({galleryImages.length} images)
                        </button>
                    </div>
                </div>
            )}

            {/* Callout Editor Modal */}
            {showCalloutEditor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Insert Callout</h3>
                            <button type="button" title="Close" onClick={() => { setShowCalloutEditor(false); setCalloutText(''); }}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Callout Type</label>
                                <div className="flex gap-2">
                                    {(['info', 'warning', 'success', 'error'] as const).map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setCalloutType(type)}
                                            className={`flex-1 py-2 rounded-lg capitalize ${calloutType === type ? 'bg-accent-brand text-white' : 'bg-gray-800 text-gray-300'}`}>
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Message</label>
                                <textarea
                                    value={calloutText}
                                    onChange={(e) => setCalloutText(e.target.value)}
                                    placeholder="Enter your callout message..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-accent-brand focus:outline-none resize-none"
                                />
                            </div>
                            <button type="button" onClick={insertCallout} disabled={!calloutText.trim()}
                                className="w-full py-2 bg-accent-brand text-white rounded-lg hover:bg-accent-brand/80 disabled:opacity-50">
                                Insert Callout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Accordion Editor Modal */}
            {showAccordionEditor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-4 my-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Create Accordion (FAQ)</h3>
                            <button type="button" title="Close" onClick={() => { 
                                setShowAccordionEditor(false); 
                                setAccordionItems([{ id: '1', title: 'Question', content: '' }]); 
                            }}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                            {accordionItems.map((item, i) => (
                                <div key={item.id} className="p-4 bg-gray-800 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">Item {i + 1}</span>
                                        {accordionItems.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setAccordionItems(accordionItems.filter((_, idx) => idx !== i))}
                                                className="p-1 text-red-400 hover:text-red-300">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => {
                                            const updated = [...accordionItems];
                                            updated[i] = { ...item, title: e.target.value };
                                            setAccordionItems(updated);
                                        }}
                                        placeholder="Question or Title"
                                        className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-sm"
                                    />
                                    <textarea
                                        value={item.content}
                                        onChange={(e) => {
                                            const updated = [...accordionItems];
                                            updated[i] = { ...item, content: e.target.value };
                                            setAccordionItems(updated);
                                        }}
                                        placeholder="Answer or Content"
                                        rows={3}
                                        className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-sm resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setAccordionItems([...accordionItems, { id: `${Date.now()}`, title: '', content: '' }])}
                            className="w-full py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 mb-4">
                            + Add Item
                        </button>
                        <button type="button" onClick={insertAccordion} disabled={accordionItems.length === 0}
                            className="w-full py-2 bg-accent-brand text-white rounded-lg hover:bg-accent-brand/80 disabled:opacity-50">
                            Insert Accordion ({accordionItems.length} items)
                        </button>
                    </div>
                </div>
            )}

            {/* Code Block Editor Modal */}
            {showCodeEditor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Insert Code Block</h3>
                            <button type="button" title="Close" onClick={() => { 
                                setShowCodeEditor(false); 
                                setCodeContent('');
                                setCodeLanguage('');
                            }}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Language (optional)</label>
                                <input
                                    type="text"
                                    value={codeLanguage}
                                    onChange={(e) => setCodeLanguage(e.target.value)}
                                    placeholder="e.g., javascript, python, css, html"
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-accent-brand focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Code</label>
                                <textarea
                                    value={codeContent}
                                    onChange={(e) => setCodeContent(e.target.value)}
                                    placeholder="Paste your code here..."
                                    rows={12}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-accent-brand focus:outline-none resize-none font-mono text-sm"
                                />
                            </div>
                            <button type="button" onClick={insertCodeBlock} disabled={!codeContent.trim()}
                                className="w-full py-2 bg-accent-brand text-white rounded-lg hover:bg-accent-brand/80 disabled:opacity-50">
                                Insert Code Block
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

