import React, { useEffect, useMemo, useState, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import UnderlineExt from '@tiptap/extension-underline';
import { Mark, Node, mergeAttributes, CommandProps, RawCommands } from '@tiptap/core';
import { AlignJustify, Bold, Heading2, Heading3, Image as ImageIcon, Italic, LayoutGrid, Link2, List, ListOrdered, Minus, Quote, Redo2, Square, Underline, Undo2, Video } from 'lucide-react';
import { htmlToBlocks, blocksToHTML } from './ContentTabWrapper';
import { ImageUploader, ImageGalleryManager } from './ImageUploader';
import { createClient } from '../../utils/supabase/client';
import { sanitizeFileName } from '../../utils/file-naming';
import { optimizeImage } from '../../utils/image-optimizer';
import { toast } from 'sonner';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dropcap: {
      toggleDropcap: () => ReturnType;
    };
    spacer: {
      insertSpacer: (height?: 'small' | 'medium' | 'large') => ReturnType;
    };
    gallery: {
      insertGallery: (images: Array<{ url: string; alt?: string; caption?: string }>, style?: 'grid' | 'carousel') => ReturnType;
    };
    videoEmbed: {
      insertVideo: (src: string) => ReturnType;
    };
    imageWithCaption: {
      setImageWithCaption: (options: { src: string; alt?: string; caption?: string }) => ReturnType;
    };
  }
}

// --- Custom Extensions ---

const ImageWithCaption = Node.create({
  name: 'imageWithCaption',
  group: 'block',
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      caption: { default: '' },
      width: { default: '100%' },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'figure[data-image-with-caption]',
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector('img');
          const caption = (el as HTMLElement).querySelector('figcaption');
          return {
            src: img?.getAttribute('src') || null,
            alt: img?.getAttribute('alt') || '',
            caption: caption?.textContent || '',
            width: (el as HTMLElement).getAttribute('data-width') || img?.style.width || '100%',
          };
        },
      },
      {
        tag: 'figure',
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector('img');
          if (!img) return false;
          const caption = (el as HTMLElement).querySelector('figcaption');
          return {
            src: img.getAttribute('src') || null,
            alt: img.getAttribute('alt') || '',
            caption: caption?.textContent || '',
            width: (el as HTMLElement).getAttribute('data-width') || img.style.width || '100%',
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption, width } = HTMLAttributes;
    const safeWidth = typeof width === 'string' && width.trim() ? width : '100%';
    const figure: any = ['figure', { 'data-image-with-caption': 'true', 'data-width': safeWidth, class: 'tiptap-image-figure', style: `width:${safeWidth};max-width:100%;` }];
    if (src) figure.push(['img', { src, alt: alt || '', style: `width:${safeWidth};max-width:100%;height:auto;` }]);
    if (caption) figure.push(['figcaption', { class: 'tiptap-image-caption' }, caption]);
    return figure;
  },
  addCommands(): Partial<RawCommands> {
    return {
      setImageWithCaption:
        (options) => ({ commands }: CommandProps) =>
          commands.insertContent({ type: this.name, attrs: options }),
    };
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('figure');
      dom.classList.add('tiptap-image-figure');
      dom.setAttribute('data-image-with-caption', 'true');
      dom.style.position = 'relative';
      dom.style.cursor = 'pointer';
      
      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      const width = node.attrs.width || '100%';
      img.style.width = width;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      dom.appendChild(img);
      
      if (node.attrs.caption) {
        const caption = document.createElement('figcaption');
        caption.classList.add('tiptap-image-caption');
        caption.textContent = node.attrs.caption;
        dom.appendChild(caption);
      }
      
      // Edit button overlay
      const editBtn = document.createElement('button');
      editBtn.innerHTML = '✏️ Edit';
      editBtn.style.cssText = 'position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; opacity: 0; transition: opacity 0.2s;';
      dom.appendChild(editBtn);
      
      dom.addEventListener('mouseenter', () => { editBtn.style.opacity = '1'; });
      dom.addEventListener('mouseleave', () => { editBtn.style.opacity = '0'; });
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newAlt = prompt('Alt text:', node.attrs.alt || '') || node.attrs.alt;
        const newCaption = prompt('Caption:', node.attrs.caption || '') || node.attrs.caption;
        const newWidth = prompt('Width (e.g. 100%, 75%, 640px):', node.attrs.width || '100%') || node.attrs.width;
        
        if (typeof getPos === 'function') {
          const pos = getPos();
          if (typeof pos === 'number') {
            editor.commands.setNodeSelection(pos);
            editor.commands.updateAttributes('imageWithCaption', { alt: newAlt, caption: newCaption, width: newWidth });
          }
        }
      });
      
      return { dom };
    };
  },
});

const Dropcap = Mark.create({
  name: 'dropcap',
  parseHTML() {
    return [{ tag: 'span.dropcap' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ class: 'dropcap' }, HTMLAttributes), 0];
  },
  addCommands(): Partial<RawCommands> {
    return {
      toggleDropcap:
        () => ({ commands }: CommandProps) => commands.toggleMark(this.name),
    };
  },
});

const Spacer = Node.create({
  name: 'spacer',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      height: { default: 'medium' },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-spacer]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const height = HTMLAttributes.height || 'medium';
    return ['div', { 'data-spacer': height, class: `tiptap-spacer tiptap-spacer-${height}` }];
  },
  addCommands(): Partial<RawCommands> {
    return {
      insertSpacer:
        (height = 'medium') => ({ commands }: CommandProps) => commands.insertContent({ type: this.name, attrs: { height } }),
    };
  },
});

const Gallery = Node.create({
  name: 'gallery',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      images: { default: [] },
      style: { default: 'grid' },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-gallery]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const images = HTMLAttributes.images || [];
    const galleryStyle = HTMLAttributes.style || 'grid';
    return [
      'div',
      { 'data-gallery': galleryStyle, class: `tiptap-gallery tiptap-gallery-${galleryStyle}` },
      ...images.map((img: any) => ['figure', { class: 'tiptap-gallery-item' }, ['img', { src: img.url || img, alt: img.alt || '' }], img.caption ? ['figcaption', {}, img.caption] : '']),
    ];
  },
  addCommands(): Partial<RawCommands> {
    return {
      insertGallery:
        (images: Array<{ url: string; alt?: string; caption?: string }>, style = 'grid') => ({ commands }: CommandProps) =>
          commands.insertContent({ type: this.name, attrs: { images, style } }),
    };
  },
});

const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: '' },
      title: { default: 'Embedded video' },
    };
  },
  parseHTML() {
    return [{ tag: 'iframe[data-video-embed]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src || '';
    return [
      'div',
      { class: 'tiptap-video-wrapper' },
      ['iframe', { 'data-video-embed': 'true', src, title: HTMLAttributes.title || 'Embedded video', allowfullscreen: 'true' }],
    ];
  },
  addCommands(): Partial<RawCommands> {
    return {
      insertVideo:
        (src: string) => ({ commands }: CommandProps) => commands.insertContent({ type: this.name, attrs: { src } }),
    };
  },
});

// --- Helpers ---

const toEmbedUrl = (url: string) => {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt && yt[1]) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo && vimeo[1]) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
};

const BUTTON_CLASS = 'p-2 rounded-lg text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors';

function normalizeInitialHTML(html: string): string {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  temp.querySelectorAll('figure').forEach((figure) => {
    const img = figure.querySelector('img');
    if (!img) return;
    const captionEl = figure.querySelector('figcaption');
    figure.setAttribute('data-image-with-caption', 'true');
    if (!img.getAttribute('alt')) img.setAttribute('alt', '');
    if (captionEl && !captionEl.getAttribute('class')) captionEl.setAttribute('class', 'tiptap-image-caption');
    figure.classList.add('tiptap-image-figure');
  });
  // Wrap stray <img> tags in a figure to preserve them
  temp.querySelectorAll('img').forEach((img) => {
    if (img.parentElement && img.parentElement.tagName.toLowerCase() === 'figure') return;
    const figure = document.createElement('figure');
    figure.setAttribute('data-image-with-caption', 'true');
    figure.classList.add('tiptap-image-figure');
    const parent = img.parentElement;
    parent?.insertBefore(figure, img);
    parent?.removeChild(img);
    figure.appendChild(img);
  });
  return temp.innerHTML;
}

interface ProArticleEditorProps {
  initialBlocks?: any[];
  onChange: (blocks: any[], html: string) => void;
  placeholder?: string;
}

export function ProArticleEditor({ initialBlocks = [], onChange, placeholder = 'Start writing…' }: ProArticleEditorProps) {
  const initialHTML = useMemo(() => {
    if (Array.isArray(initialBlocks) && initialBlocks.length > 0) return normalizeInitialHTML(blocksToHTML(initialBlocks));
    return '';
  }, [initialBlocks]);

  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; alt?: string; caption?: string }>>([]);
  const [galleryStyle, setGalleryStyle] = useState<'grid' | 'masonry' | 'carousel'>('grid');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [stats, setStats] = useState({ words: 0, chars: 0, readTime: '1 min', updatedAt: '' });
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const uploadDroppedImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only images can be dropped');
      return null;
    }
    try {
      const optimized = await optimizeImage(file, { maxWidth: 1920, quality: 0.82, format: 'image/webp' });
      const supabase = createClient();
      const fileName = sanitizeFileName(optimized.name || file.name);
      const { error } = await supabase.storage.from('blog').upload(fileName, optimized);
      if (error) throw error;
      const { data } = supabase.storage.from('blog').getPublicUrl(fileName);
      return data.publicUrl || null;
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed');
      return null;
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'blockquote', 'listItem'] }),
      Link.configure({ openOnClick: true, autolink: true, linkOnPaste: true }),
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: false, allowBase64: false }),
      UnderlineExt,
      Dropcap,
      Spacer,
      Gallery,
      VideoEmbed,
      ImageWithCaption,
    ],
    content: initialHTML,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const blocks = htmlToBlocks(html);
      onChange(blocks, html);

      const text = editor.getText() || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      const minutes = Math.max(1, Math.round(words / 200));
      setStats({
        words,
        chars,
        readTime: `${minutes} min`,
        updatedAt: new Date().toLocaleTimeString(),
      });
    },
  });

  useEffect(() => {
    if (editor && initialHTML && editor.getHTML() !== initialHTML) {
      editor.commands.setContent(initialHTML, { emitUpdate: false });
    }
  }, [editor, initialHTML]);

  // Seed stats on mount
  useEffect(() => {
    if (editor) {
      const text = editor.getText() || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      const minutes = Math.max(1, Math.round(words / 200));
      setStats({ words, chars, readTime: `${minutes} min`, updatedAt: new Date().toLocaleTimeString() });
    }
  }, [editor]);

  if (!editor) return null;

  const toolbarButton = (label: string, onClick: () => void, icon?: React.ReactNode, isActive?: boolean) => {
    const handleClick = () => {
      const scrollPos = editorContainerRef.current?.scrollTop || 0;
      onClick();
      // Restore scroll position after command executes
      requestAnimationFrame(() => {
        if (editorContainerRef.current) {
          editorContainerRef.current.scrollTop = scrollPos;
        }
      });
    };
    
    const buttonClass = isActive 
      ? 'p-2 rounded-lg text-xs font-medium text-white bg-blue-600 border border-blue-500 transition-colors'
      : BUTTON_CLASS;
    
    return (
      <button type="button" onClick={handleClick} className={buttonClass}>
        <span className="flex items-center gap-1">{icon}{label && <span>{label}</span>}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col space-y-3 w-full text-zinc-100">
      <div 
        className="sticky top-0 z-50 bg-[#09090b] opacity-100 isolate border border-zinc-700 rounded-xl p-3 flex flex-wrap gap-2 shadow-lg"
        style={{ position: 'sticky', top: 0, backgroundColor: '#09090b' }}
      >
        {toolbarButton('', () => editor.chain().focus(false).undo().run(), <Undo2 className="w-4 h-4" />)}
        {toolbarButton('', () => editor.chain().focus(false).redo().run(), <Redo2 className="w-4 h-4" />)}
        {toolbarButton('', () => editor.chain().focus(false).toggleHeading({ level: 2 }).run(), <Heading2 className="w-4 h-4" />, editor.isActive('heading', { level: 2 }))}
        {toolbarButton('', () => editor.chain().focus(false).toggleHeading({ level: 3 }).run(), <Heading3 className="w-4 h-4" />, editor.isActive('heading', { level: 3 }))}
        {toolbarButton('', () => editor.chain().focus(false).toggleBold().run(), <Bold className="w-4 h-4" />, editor.isActive('bold'))}
        {toolbarButton('', () => editor.chain().focus(false).toggleItalic().run(), <Italic className="w-4 h-4" />, editor.isActive('italic'))}
        {toolbarButton('', () => editor.chain().focus(false).toggleUnderline().run(), <Underline className="w-4 h-4" />, editor.isActive('underline'))}
        {toolbarButton('', () => editor.chain().focus(false).toggleBulletList().run(), <List className="w-4 h-4" />, editor.isActive('bulletList'))}
        {toolbarButton('', () => editor.chain().focus(false).toggleOrderedList().run(), <ListOrdered className="w-4 h-4" />, editor.isActive('orderedList'))}
        {toolbarButton('Left', () => editor.chain().focus(false).setTextAlign('left').run(), undefined, editor.isActive({ textAlign: 'left' }))}
        {toolbarButton('Center', () => editor.chain().focus(false).setTextAlign('center').run(), undefined, editor.isActive({ textAlign: 'center' }))}
        {toolbarButton('Right', () => editor.chain().focus(false).setTextAlign('right').run(), undefined, editor.isActive({ textAlign: 'right' }))}
        {toolbarButton('Justify', () => editor.chain().focus(false).setTextAlign('justify').run(), <AlignJustify className="w-4 h-4" />, editor.isActive({ textAlign: 'justify' }))}
        {toolbarButton('', () => editor.chain().focus(false).toggleBlockquote().run(), <Quote className="w-4 h-4" />, editor.isActive('blockquote'))}
        {toolbarButton('', () => editor.chain().focus(false).setHorizontalRule().run(), <Minus className="w-4 h-4" />)}
        {toolbarButton('Spacer', () => editor.chain().focus(false).insertContent({ type: 'spacer', attrs: { height: 'medium' } }).run(), <Square className="w-4 h-4" />)}
        {toolbarButton('Dropcap', () => editor.chain().focus(false).command(({ commands }) => { commands.toggleMark('dropcap'); return true; }).run(), <Bold className="w-4 h-4" />, editor.isActive('dropcap'))}
        {toolbarButton('Link', () => {
          const url = window.prompt('Enter URL');
          if (!url) return;
          editor.chain().focus(false).extendMarkRange('link').setLink({ href: url }).run();
        }, <Link2 className="w-4 h-4" />, editor.isActive('link'))}
        {toolbarButton('Image', () => setShowImageDialog(true), <ImageIcon className="w-4 h-4" />)}
        {toolbarButton('Gallery', () => setShowGalleryDialog(true), <LayoutGrid className="w-4 h-4" />)}
        {toolbarButton('Video', () => setShowVideoDialog(true), <Video className="w-4 h-4" />)}
      </div>

      <div
        ref={editorContainerRef}
        className="min-h-[500px] bg-zinc-900 border border-zinc-700 rounded-xl flex flex-col prose prose-invert prose-zinc max-w-none text-zinc-100"
        onDragOver={(e) => {
          if (e.dataTransfer?.files?.length) e.preventDefault();
        }}
        onDrop={async (e) => {
          if (!e.dataTransfer?.files?.length) return;
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          const url = await uploadDroppedImage(file);
          if (url) {
            const alt = prompt('Alt text for the dropped image?', '') || '';
            editor.chain().focus(false).setImageWithCaption({ src: url, alt, caption: '' }).run();
          }
        }}
      >
        <EditorContent editor={editor} className="p-4 tiptap-editor flex-1 text-white [&_.ProseMirror]:text-zinc-100 [&_.ProseMirror_p]:text-zinc-100 [&_.ProseMirror_h1]:text-white [&_.ProseMirror_h2]:text-white [&_.ProseMirror_h3]:text-white" />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
        <span>Words: <strong className="text-white">{stats.words}</strong></span>
        <span>Chars: <strong className="text-white">{stats.chars}</strong></span>
        <span>Read time: <strong className="text-white">{stats.readTime}</strong></span>
        <span className="ml-auto">Last updated: <span className="text-white/80">{stats.updatedAt || '—'}</span></span>
      </div>

      {showImageDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowImageDialog(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white text-lg font-semibold mb-4">Insert Image</h3>
            <ImageUploader
              label="Upload or select image"
              value={imageUrl}
              onChange={(url) => setImageUrl(url || '')}
              bucketName="blog"
            />
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-white text-sm font-medium mb-1">Alt Text</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Caption (optional)</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Add a caption below the image"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                onClick={() => {
                  if (!imageUrl) return;
                  editor.chain().focus(false).setImageWithCaption({ src: imageUrl, alt: imageAlt, caption: imageCaption }).run();
                  setImageUrl('');
                  setImageAlt('');
                  setImageCaption('');
                  setShowImageDialog(false);
                }}
              >
                Insert Image
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                onClick={() => {
                  setImageUrl('');
                  setImageAlt('');
                  setImageCaption('');
                  setShowImageDialog(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showGalleryDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowGalleryDialog(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white text-lg font-semibold mb-4">Insert Gallery</h3>
            <ImageGalleryManager
              label="Select images"
              images={galleryImages}
              onChange={(imgs) => setGalleryImages(imgs as any)}
            />
            <div className="mt-4">
              <label className="block text-sm text-white mb-2" htmlFor="gallery-layout-select">Layout</label>
              <select
                id="gallery-layout-select"
                aria-label="Gallery layout"
                value={galleryStyle}
                onChange={(e) => setGalleryStyle(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              >
                <option value="grid">Grid</option>
                <option value="masonry">Masonry</option>
                <option value="carousel">Carousel</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                onClick={() => {
                  if (galleryImages.length === 0) return;
                  editor.chain().focus(false).insertContent({ type: 'gallery', attrs: { images: galleryImages, style: galleryStyle } }).run();
                  setGalleryImages([]);
                  setGalleryStyle('grid');
                  setShowGalleryDialog(false);
                }}
              >
                Insert Gallery ({galleryImages.length})
              </button>
              <button type="button" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg" onClick={() => setShowGalleryDialog(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showVideoDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowVideoDialog(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white text-lg font-semibold mb-4">Insert Video</h3>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube or Vimeo URL"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
            <div className="flex gap-3 mt-4">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                onClick={() => {
                  const embed = toEmbedUrl(videoUrl.trim());
                  if (!embed) return;
                  editor.chain().focus(false).insertContent({ type: 'videoEmbed', attrs: { src: embed } }).run();
                  setVideoUrl('');
                  setShowVideoDialog(false);
                }}
              >
                Insert Video
              </button>
              <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg" onClick={() => setShowVideoDialog(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tiptap-editor {
          min-height: 480px;
          color: white;
        }
        .tiptap-editor .ProseMirror {
          outline: none;
          min-height: 480px;
        }
        .tiptap-editor h2 {
          font-size: 1.875rem;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin-top: 3.5rem;
          margin-bottom: 1.5rem;
        }
        .tiptap-editor h2:first-child {
          margin-top: 0;
        }
        .tiptap-editor h3 {
          font-size: 1.5rem;
          font-weight: 500;
          line-height: 1.3;
          letter-spacing: -0.015em;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
        }
        .tiptap-editor p {
          font-size: 1.0625rem;
          line-height: 1.75;
          margin: 1.5rem 0;
          opacity: 0.88;
        }
        .tiptap-editor blockquote {
          border-left: 4px solid rgba(255, 255, 255, 0.2);
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          opacity: 0.85;
          color: rgba(255, 255, 255, 0.9);
        }
        .tiptap-editor blockquote p {
          margin: 0.75rem 0;
        }
        .tiptap-editor ul,
        .tiptap-editor ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        .tiptap-editor ul {
          list-style-type: disc;
        }
        .tiptap-editor ol {
          list-style-type: decimal;
        }
        .tiptap-editor li {
          margin: 0.5rem 0;
          line-height: 1.75;
          opacity: 0.88;
        }
        .tiptap-editor li p {
          margin: 0.25rem 0;
        }
        .tiptap-editor ul ul,
        .tiptap-editor ol ol,
        .tiptap-editor ul ol,
        .tiptap-editor ol ul {
          margin: 0.5rem 0;
        }
        .tiptap-editor .dropcap {
          float: left;
          font-size: 3.2rem;
          line-height: 0.9;
          padding-right: 0.2em;
          padding-top: 0.05em;
          font-weight: 700;
        }
        .tiptap-image-figure {
          margin: 2.5rem 0;
        }
        .tiptap-image-figure img {
          width: 100%;
          height: auto;
          border-radius: 12px;
          display: block;
        }
        .tiptap-image-caption {
          margin-top: 0.75rem;
          font-size: 0.875rem;
          text-align: center;
          opacity: 0.7;
          font-style: italic;
        }
        .tiptap-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin: 1.25rem 0;
        }
        .tiptap-gallery-masonry {
          column-count: 3;
          column-gap: 12px;
        }
        @media (max-width: 1024px) {
          .tiptap-gallery-masonry { column-count: 2; }
        }
        @media (max-width: 640px) {
          .tiptap-gallery-masonry { column-count: 1; }
        }
        .tiptap-gallery-masonry .tiptap-gallery-item {
          break-inside: avoid;
          margin-bottom: 12px;
        }
        .tiptap-gallery-carousel {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 4px;
          scroll-snap-type: x mandatory;
        }
        .tiptap-gallery-carousel .tiptap-gallery-item {
          flex: 0 0 240px;
          scroll-snap-align: start;
        }
        .tiptap-gallery-item img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          display: block;
        }
        .tiptap-video-wrapper {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          margin: 1.25rem 0;
          border-radius: 12px;
          background: #0f0f0f;
          border: 1px solid #27272a;
        }
        .tiptap-video-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 12px;
        }
        .tiptap-spacer { width: 100%; }
        .tiptap-spacer-small { height: 16px; }
        .tiptap-spacer-medium { height: 32px; }
        .tiptap-spacer-large { height: 64px; }
      `}</style>
    </div>
  );
}
