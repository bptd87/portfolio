import { useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
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
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, Settings
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';

interface ContentBlock {
    id: string;
    type: 'paragraph' | 'heading' | 'image' | 'gallery' | 'quote' | 'callout' | 'video' | 'list';
    content: string;
    metadata?: {
        level?: number;
        listType?: 'bullet' | 'number';
        alt?: string;
        size?: 'small' | 'medium' | 'full';
        galleryType?: 'single' | 'two-col' | 'three-col';
        images?: { url: string; alt?: string }[];
    };
}

interface MediumEditorProps {
    blocks: ContentBlock[];
    onChange: (blocks: ContentBlock[]) => void;
}

export function MediumEditor({ blocks = [], onChange }: MediumEditorProps) {
    const [showImageUploader, setShowImageUploader] = useState(false);
    const [showVideoInput, setShowVideoInput] = useState(false);
    const [showGalleryEditor, setShowGalleryEditor] = useState(false);
    const [showInsertMenu, setShowInsertMenu] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ src: string; pos: number } | null>(null);
    const [imageAlt, setImageAlt] = useState('');
    const [imageSize, setImageSize] = useState<'small' | 'medium' | 'full'>('full');
    const [videoUrl, setVideoUrl] = useState('');
    const [galleryImages, setGalleryImages] = useState<{ url: string; alt?: string }[]>([]);
    const [galleryType, setGalleryType] = useState<'single' | 'two-col' | 'three-col'>('two-col');
    const containerRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder: 'Start writing your story...',
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
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
            },
            handleClick: (view, pos, event) => {
                const target = event.target as HTMLElement;
                if (target.tagName === 'IMG') {
                    const src = (target as HTMLImageElement).src;
                    setSelectedImage({ src, pos });
                    setImageAlt((target as HTMLImageElement).alt || '');
                    // Determine size from class
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
            const newBlocks = htmlToBlocks(html);
            onChange(newBlocks);
        },
    });

    const setLink = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('URL', editor.getAttributes('link').href);
        if (url === null) return;
        if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
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
        editor.chain().focus().insertContent(`
            <div class="my-6 aspect-video rounded-lg overflow-hidden bg-gray-800">
                <iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
            </div>
        `).run();
        setVideoUrl('');
        setShowVideoInput(false);
        setShowInsertMenu(false);
    }, [editor, videoUrl]);

    const insertGallery = useCallback(() => {
        if (!editor || galleryImages.length === 0) return;
        const cols = galleryType === 'three-col' ? 3 : galleryType === 'two-col' ? 2 : 1;
        const imagesHtml = galleryImages.map(img => `<img src="${img.url}" alt="${img.alt || ''}" class="rounded-lg" />`).join('');
        editor.chain().focus().insertContent(`
            <div class="my-6 grid gap-4 grid-cols-${cols}">
                ${imagesHtml}
            </div>
        `).run();
        setGalleryImages([]);
        setShowGalleryEditor(false);
        setShowInsertMenu(false);
    }, [editor, galleryImages, galleryType]);

    const updateImage = useCallback(() => {
        if (!editor || !selectedImage) return;
        // Find and update the image in the editor
        const sizeClass = imageSize === 'small' ? 'max-w-sm' : imageSize === 'medium' ? 'max-w-2xl' : 'max-w-full';
        editor.chain().focus()
            .setImage({ src: selectedImage.src, alt: imageAlt })
            .run();
        // We need to manually update the image attributes
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
            {/* TipTap Bubble Menu - appears on text selection */}
            <BubbleMenu
                editor={editor}
                tippyOptions={{ duration: 100, placement: 'top' }}
                className="flex items-center gap-0.5 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl p-1"
            >
                <button type="button" title="Bold"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Bold className="w-3.5 h-3.5" />
                </button>
                <button type="button" title="Italic"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Italic className="w-3.5 h-3.5" />
                </button>
                <button type="button" title="Underline"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('underline') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <UnderlineIcon className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-5 bg-gray-600" />
                <button type="button" title="Link"
                    onMouseDown={(e) => { e.preventDefault(); setLink(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('link') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Link2 className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-5 bg-gray-600" />
                <button type="button" title="H1"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 1 }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button type="button" title="H2"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button type="button" title="H3"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 3 }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Heading3 className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-5 bg-gray-600" />
                <button type="button" title="Bullet List"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <List className="w-3.5 h-3.5" />
                </button>
                <button type="button" title="Numbered List"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button type="button" title="Quote"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('blockquote') ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <Quote className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-5 bg-gray-600" />
                <button type="button" title="Align Left"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button type="button" title="Align Center"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button type="button" title="Align Right"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button type="button" title="Justify"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('justify').run(); }}
                    className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-accent-brand text-white' : 'text-gray-300'}`}>
                    <AlignJustify className="w-3.5 h-3.5" />
                </button>
            </BubbleMenu>

            {/* Editor Content */}
            <div className="border border-gray-700 rounded-xl bg-gray-950 relative">
                <EditorContent editor={editor} />
            </div>

            {/* Floating Insert Button */}
            <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
                {showInsertMenu && (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 min-w-[160px] mb-1">
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
                        </div>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setShowInsertMenu(!showInsertMenu)}
                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${showInsertMenu ? 'bg-red-500 hover:bg-red-600 rotate-45' : 'bg-accent-brand hover:bg-accent-brand/80'
                        }`}
                    title="Insert Media"
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
                            <button type="button" onClick={() => setGalleryType('single')}
                                className={`px-4 py-2 rounded-lg ${galleryType === 'single' ? 'bg-accent-brand text-white' : 'bg-gray-800 text-gray-300'}`}>
                                1 Column
                            </button>
                            <button type="button" onClick={() => setGalleryType('two-col')}
                                className={`px-4 py-2 rounded-lg ${galleryType === 'two-col' ? 'bg-accent-brand text-white' : 'bg-gray-800 text-gray-300'}`}>
                                2 Columns
                            </button>
                            <button type="button" onClick={() => setGalleryType('three-col')}
                                className={`px-4 py-2 rounded-lg ${galleryType === 'three-col' ? 'bg-accent-brand text-white' : 'bg-gray-800 text-gray-300'}`}>
                                3 Columns
                            </button>
                        </div>

                        <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                            {galleryImages.map((img, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                    <img src={img.url} alt="" className="w-16 h-16 object-cover rounded" />
                                    <input
                                        type="text"
                                        value={img.alt || ''}
                                        onChange={(e) => {
                                            const updated = [...galleryImages];
                                            updated[i] = { ...img, alt: e.target.value };
                                            setGalleryImages(updated);
                                        }}
                                        placeholder="Alt text..."
                                        className="flex-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 text-sm"
                                    />
                                    <button type="button" title="Remove Image" onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                                        className="p-2 text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <ImageUploader
                            label="Add Image to Gallery"
                            value=""
                            onChange={(url) => setGalleryImages([...galleryImages, { url, alt: '' }])}
                            bucketName="blog"
                        />

                        <button type="button" onClick={insertGallery} disabled={galleryImages.length === 0}
                            className="w-full mt-4 py-2 bg-accent-brand text-white rounded-lg hover:bg-accent-brand/80 disabled:opacity-50">
                            Insert Gallery ({galleryImages.length} images)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function blocksToHtml(blocks: ContentBlock[]): string {
    if (!blocks || blocks.length === 0) return '<p></p>';
    return blocks.map(block => {
        if (block.type === 'heading') {
            const level = block.metadata?.level || 2;
            return `<h${level}>${block.content}</h${level}>`;
        }
        if (block.type === 'list') {
            const items = block.content.split('\n').map(item => `<li>${item}</li>`).join('');
            return block.metadata?.listType === 'number' ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
        }
        if (block.type === 'image') {
            return `<img src="${block.content}" alt="${block.metadata?.alt || ''}" />`;
        }
        if (block.type === 'quote') {
            return `<blockquote>${block.content}</blockquote>`;
        }
        return `<p>${block.content || ''}</p>`;
    }).join('') || '<p></p>';
}

function htmlToBlocks(html: string): ContentBlock[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = doc.body.children;
    const newBlocks: ContentBlock[] = [];

    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const id = `block-${Date.now()}-${i}`;

        if (el.tagName.match(/^H[1-6]$/)) {
            const level = parseInt(el.tagName[1]);
            newBlocks.push({ id, type: 'heading', content: el.innerHTML, metadata: { level } });
        } else if (el.tagName === 'UL' || el.tagName === 'OL') {
            const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '').join('\n');
            newBlocks.push({ id, type: 'list', content: items, metadata: { listType: el.tagName === 'OL' ? 'number' : 'bullet' } });
        } else if (el.tagName === 'IMG') {
            const img = el as HTMLImageElement;
            newBlocks.push({ id, type: 'image', content: img.src, metadata: { alt: img.alt } });
        } else if (el.tagName === 'BLOCKQUOTE') {
            newBlocks.push({ id, type: 'quote', content: el.innerHTML });
        } else {
            newBlocks.push({ id, type: 'paragraph', content: el.innerHTML });
        }
    }
    return newBlocks;
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
