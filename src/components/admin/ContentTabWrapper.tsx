/* eslint-disable react-refresh/only-export-components */

import { useWatch } from 'react-hook-form';
import React, { useState, useEffect, useCallback, useRef, useLayoutEffect, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';

// Re-export ContentBlock locally to fix missing property error while preserving existing imports
export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'video' | 'gallery' | 'list' | 'quote' | 'code' | 'spacer' | 'divider' | 'callout' | 'accordion' | 'file';
  content: string;
  metadata?: {
    level?: number;
    listType?: 'number' | 'bullet';
    align?: 'left' | 'center' | 'right' | 'full';
    size?: 'small' | 'medium' | 'large' | 'full';
    alt?: string;
    caption?: string;
    images?: Array<{ url: string; alt?: string; caption?: string }>;
    galleryStyle?: 'grid' | 'masonry' | 'carousel';
    galleryTitle?: string;
    galleryDescription?: string;
    videoType?: 'youtube' | 'vimeo' | 'custom';
    items?: Array<{ question: string; answer: string }>;
    calloutType?: 'info' | 'warning' | 'success' | 'error';
    fileName?: string;
    fileSize?: string;
    fileType?: string;
  };
}
import 'react-quill-new/dist/quill.snow.css';
import { ImageUploader, ImageGalleryManager } from './ImageUploader';
import { Image as ImageIcon, Video, LayoutGrid, X, Type } from 'lucide-react';

// Suppress ReactQuill deprecation warnings


// Convert blocks to HTML for Quill
export function blocksToHTML(blocks: ContentBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  return blocks.map(block => {
    switch (block.type) {
      case 'heading':
        const level = block.metadata?.level || 2;
        return `<h${level}>${block.content}</h${level}>`;
      case 'paragraph':
        // Always create paragraph tags, even if empty
        // Use <br> for empty paragraphs so they're visible and maintain spacing
        if (!block.content || block.content.trim() === '') {
          return `<p><br></p>`;
        }
        return `<p>${block.content}</p>`;
      case 'list':
        const items = block.content.split('\n').filter(i => i.trim());
        const listTag = block.metadata?.listType === 'number' ? 'ol' : 'ul';
        const listItems = items.map(item => `<li>${item}</li>`).join('');
        return `<${listTag}>${listItems}</${listTag}>`;
      case 'quote':
        return `<blockquote>${block.content}</blockquote>`;
      case 'image':
        const alt = block.metadata?.alt || '';
        const title = block.metadata?.caption || '';
        const align = block.metadata?.align || 'center';
        const size = block.metadata?.size || 'full';

        // Create alignment classes
        let alignClass = '';
        let sizeStyle = '';
        if (align === 'left') {
          alignClass = 'ql-align-left';
          sizeStyle = 'float: left; margin-right: 1rem; max-width: 50%;';
        } else if (align === 'right') {
          alignClass = 'ql-align-right';
          sizeStyle = 'float: right; margin-left: 1rem; max-width: 50%;';
        } else if (align === 'center') {
          alignClass = 'ql-align-center';
          sizeStyle = 'display: block; margin: 1rem auto;';
        } else {
          sizeStyle = 'display: block; width: 100%; margin: 1rem 0;';
        }

        // Add size constraints
        if (size === 'small') {
          sizeStyle += ' max-width: 400px;';
        } else if (size === 'medium') {
          sizeStyle += ' max-width: 800px;';
        } else if (size === 'large') {
          sizeStyle += ' max-width: 1200px;';
        }

        return `<figure class="${alignClass}" style="text-align: ${align}; margin: 1rem 0;"><img src="${block.content}" alt="${alt}" title="${title}" class="ql-image" style="${sizeStyle} height: auto; object-fit: contain;" />${title ? `<figcaption style="text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: #a1a1aa;">${title}</figcaption>` : ''}</figure>`;
      case 'video':
        return `<div class="ql-video-embed"><div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1rem 0;"><iframe src="${block.content}" frameborder="0" allowfullscreen="true" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"></iframe></div></div>`;
      case 'gallery':
        const images = block.metadata?.images || [];
        // Fix: Use 'galleryStyle' instead of non-existent 'galleryType' property; fallback to 'grid'
        const galleryType = block.metadata?.galleryStyle || 'grid';
        let galleryStyle = '';
        if (galleryType === 'masonry') {
          galleryStyle = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); grid-auto-rows: auto; gap: 1rem; margin: 1rem 0; min-height: 100px; padding: 1rem; border: 1px dashed #3f3f46; border-radius: 0.5rem; background: #18181b;';
        } else if (galleryType === 'carousel') {
          galleryStyle = 'display: flex; overflow-x: auto; gap: 1rem; margin: 1rem 0; scroll-snap-type: x mandatory; min-height: 100px; padding: 1rem; border: 1px dashed #3f3f46; border-radius: 0.5rem; background: #18181b;';
        } else {
          galleryStyle = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0; min-height: 100px; padding: 1rem; border: 1px dashed #3f3f46; border-radius: 0.5rem; background: #18181b;';
        }
        // Include both data-gallery and data-gallery-type for TipTap and Quill compatibility
        const galleryTitle = block.metadata?.galleryTitle ? `<h3 class="gallery-title" style="margin-bottom: 0.5rem;">${block.metadata.galleryTitle}</h3>` : '';
        const galleryDesc = block.metadata?.galleryDescription ? `<p class="gallery-description" style="margin-bottom: 1rem; color: #a1a1aa; font-size: 0.9rem;">${block.metadata.galleryDescription}</p>` : '';

        return `<div class="ql-gallery-wrapper" style="margin: 2rem 0;">${galleryTitle}${galleryDesc}<div class="ql-gallery tiptap-gallery tiptap-gallery-${galleryType}" data-gallery="${galleryType}" data-gallery-type="${galleryType}" data-gallery-title="${block.metadata?.galleryTitle || ''}" data-gallery-description="${block.metadata?.galleryDescription || ''}" style="${galleryStyle}">${images.map((img) => {
          const imgStyle = galleryType === 'carousel' ? 'max-width: 300px; height: auto; display: block; flex-shrink: 0; scroll-snap-align: start; object-fit: contain;' : 'max-width: 100%; height: auto; display: block; margin: 0.5rem auto; object-fit: contain;';
          const caption = img.caption ? `<figcaption style="text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: #a1a1aa;">${img.caption}</figcaption>` : '';
          return `<figure class="tiptap-gallery-item" style="margin: 0;"><img src="${img.url}" alt="${img.alt || ''}" class="ql-image" style="${imgStyle}" />${caption}</figure>`;
        }).join('')}</div></div>`;
      default:
        return `<p>${block.content || ''}</p>`;
    }
  }).join('');
}

// Convert HTML from Quill to blocks
export function htmlToBlocks(html: string): ContentBlock[] {
  if (!html || html === '<p><br></p>' || html === '<p></p>') return [];

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const blocks: ContentBlock[] = [];
  let blockId = 0;

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push({
          id: `block-${Date.now()}-${blockId++}`,
          type: 'paragraph',
          content: text
        });
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // Skip processing if this node is already part of a processed gallery
    // CRITICAL FIX: Must check for .ql-gallery as well
    if ((el.closest('.tiptap-gallery') || el.closest('.ql-gallery') || el.closest('[data-gallery]')) &&
      el !== el.closest('.tiptap-gallery') &&
      el !== el.closest('.ql-gallery') &&
      el !== el.closest('[data-gallery]')) return;

    if (tag.match(/^h[1-6]$/)) {
      const level = parseInt(tag.charAt(1));
      blocks.push({
        id: `block-${Date.now()}-${blockId++}`,
        type: 'heading',
        content: el.textContent || '',
        metadata: { level }
      });
    } else if (tag === 'p') {
      // Preserve all paragraphs to maintain spacing
      const text = el.textContent || '';
      // Always create a paragraph block, even if empty
      blocks.push({
        id: `block-${Date.now()}-${blockId++}`,
        type: 'paragraph',
        content: text.trim() || '' // Empty string is fine, we'll preserve it
      });
    } else if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '').filter(i => i);
      if (items.length > 0) {
        blocks.push({
          id: `block-${Date.now()}-${blockId++}`,
          type: 'list',
          content: items.join('\n'),
          metadata: { listType: tag === 'ol' ? 'number' : 'bullet' }
        });
      }
    } else if (tag === 'blockquote') {
      blocks.push({
        id: `block-${Date.now()}-${blockId++}`,
        type: 'quote',
        content: el.textContent || ''
      });
    } else if (tag === 'figure') {
      const img = el.querySelector('img');
      // If no image, fall through to process children (might be a weird figure or just text)
      if (img) {
        // This is an image figure
        // Check if this image is part of a gallery container - if so, skip it (will be handled by gallery processor)
        if (el.closest('.tiptap-gallery') || el.closest('.ql-gallery') || el.closest('[data-gallery]') || el.closest('[data-gallery-type]')) return;

        const imgEl = img as HTMLImageElement;
        const src = imgEl.getAttribute('src') || imgEl.src || '';
        const alt = imgEl.getAttribute('alt') || '';

        // Try to find caption
        const caption = el.querySelector('figcaption')?.textContent || '';

        // Detect alignment and size from the FIGURE element or the image
        let align: 'left' | 'center' | 'right' | 'full' = 'center';
        let size: 'small' | 'medium' | 'large' | 'full' = 'full';

        const style = window.getComputedStyle(el);
        const textAlign = style.textAlign || el.getAttribute('style')?.match(/text-align:\s*([^;]+)/)?.[1]?.trim();
        const imgStyle = window.getComputedStyle(imgEl);
        const imgWidth = imgEl.width || parseInt(imgStyle.width) || 0;
        const maxWidth = parseInt(imgStyle.maxWidth) || imgWidth;

        // Check classes
        if (el.classList.contains('ql-align-left') || textAlign === 'left') {
          align = 'left';
        } else if (el.classList.contains('ql-align-right') || textAlign === 'right') {
          align = 'right';
        } else if (el.classList.contains('ql-align-center') || textAlign === 'center') {
          align = 'center';
        } else {
          // Fallback to checking parent if figure doesn't have alignment
          const parent = el.parentElement;
          if (parent) {
            const parentStyle = window.getComputedStyle(parent);
            const parentAlign = parentStyle.textAlign || parent.getAttribute('style')?.match(/text-align:\s*([^;]+)/)?.[1]?.trim();
            if (parentAlign === 'left' || parent.classList.contains('ql-align-left')) align = 'left';
            else if (parentAlign === 'right' || parent.classList.contains('ql-align-right')) align = 'right';
            else if (parentAlign === 'center' || parent.classList.contains('ql-align-center')) align = 'center';
          }
        }

        // Determine size based on width
        if (maxWidth && maxWidth < 400) {
          size = 'small';
        } else if (maxWidth && maxWidth < 800) {
          size = 'medium';
        } else if (maxWidth && maxWidth < 1200) {
          size = 'large';
        } else {
          size = 'full';
        }

        if (src && src.trim() !== '' && !src.startsWith('data:') && src !== 'blob:') {
          blocks.push({
            id: `block-${Date.now()}-${blockId++}`,
            type: 'image',
            content: src,
            metadata: { alt, caption, align, size }
          });
        }
        return; // Stop recursion
      }
    } else if (tag === 'img') {
      // Check if this image is part of a gallery container - if so, skip it (will be handled by gallery processor)
      if (el.closest('.tiptap-gallery') || el.closest('.ql-gallery') || el.closest('[data-gallery]') || el.closest('[data-gallery-type]')) return;

      const imgEl = el as HTMLImageElement;
      const src = el.getAttribute('src') || imgEl.src || '';
      const alt = el.getAttribute('alt') || '';
      const title = el.getAttribute('title') || '';

      // Detect alignment from parent element
      const parent = el.parentElement;
      let align: 'left' | 'center' | 'right' | 'full' = 'center';
      let size: 'small' | 'medium' | 'large' | 'full' = 'full';

      if (parent) {
        const parentStyle = window.getComputedStyle(parent);
        const parentTextAlign = parentStyle.textAlign || parent.getAttribute('style')?.match(/text-align:\s*([^;]+)/)?.[1]?.trim();
        const imgStyle = window.getComputedStyle(imgEl);
        const imgWidth = imgEl.width || parseInt(imgStyle.width) || 0;
        const maxWidth = parseInt(imgStyle.maxWidth) || imgWidth;

        // Determine alignment
        if (parentTextAlign === 'left' || parent.classList.contains('ql-align-left')) {
          align = 'left';
        } else if (parentTextAlign === 'right' || parent.classList.contains('ql-align-right')) {
          align = 'right';
        } else if (parentTextAlign === 'center' || parent.classList.contains('ql-align-center')) {
          align = 'center';
        } else {
          align = 'full';
        }

        // Determine size based on width
        if (maxWidth < 400) {
          size = 'small';
        } else if (maxWidth < 800) {
          size = 'medium';
        } else if (maxWidth < 1200) {
          size = 'large';
        } else {
          size = 'full';
        }
      }

      // Only add image block if src is valid and not empty/data URI
      if (src && src.trim() !== '' && !src.startsWith('data:') && src !== 'blob:') {
        blocks.push({
          id: `block-${Date.now()}-${blockId++}`,
          type: 'image',
          content: src,
          metadata: { alt, caption: title, align, size }
        });
      }

    } else if (el.classList.contains('ql-gallery') || el.classList.contains('tiptap-gallery') || el.hasAttribute('data-gallery') || el.hasAttribute('data-gallery-type')) {
      const galleryTypeAttr = el.getAttribute('data-gallery') || el.getAttribute('data-gallery-type') || 'grid';
      const galleryTitle = el.getAttribute('data-gallery-title') || '';
      const galleryDescription = el.getAttribute('data-gallery-description') || '';
      const galleryType = (galleryTypeAttr === 'grid' || galleryTypeAttr === 'masonry' || galleryTypeAttr === 'carousel')
        ? galleryTypeAttr
        : 'grid' as 'grid' | 'masonry' | 'carousel';

      // Use efficient selector to find images ONLY within this gallery, not nested galleries
      // Query all images, then filter out those that belong to a nested gallery
      const allImages = Array.from(el.querySelectorAll('img'));
      const directImages = allImages.filter(img => {
        const closestGallery = img.closest('.ql-gallery, .tiptap-gallery, [data-gallery]');
        return closestGallery === el;
      });

      const images = directImages.map((img) => {
        const imgEl = img as HTMLImageElement;
        const figure = imgEl.closest('figure');
        const caption = figure ? figure.querySelector('figcaption')?.textContent || '' : '';
        return {
          url: imgEl.getAttribute('src') || '',
          alt: imgEl.getAttribute('alt') || '',
          caption: caption || ''
        };
      }).filter(img => img.url);

      if (images.length > 0) {
        blocks.push({
          id: `block-${Date.now()}-${blockId++}`,
          type: 'gallery',
          content: '',
          metadata: { images, galleryStyle: galleryType, galleryTitle, galleryDescription }
        });
      }
      return; // Stop recursion for gallery
    } else if (el.classList.contains('ql-video-embed') || el.classList.contains('ql-video') || el.hasAttribute('data-video') || el.hasAttribute('data-video-embed') || el.classList.contains('tiptap-video-wrapper') || tag === 'iframe') {
      const iframe = tag === 'iframe' ? el : el.querySelector('iframe');
      const src = iframe?.getAttribute('src') || el.getAttribute('data-video') || el.textContent || '';

      let videoType: 'youtube' | 'vimeo' | 'custom' = 'youtube';
      if (src.includes('vimeo')) videoType = 'vimeo';
      else if (!src.includes('youtube') && !src.includes('youtu.be')) videoType = 'custom';

      if (src) {
        blocks.push({
          id: `block-${Date.now()}-${blockId++}`,
          type: 'video',
          content: src,
          metadata: { videoType }
        });
      }
      return; // Stop recursion for video
    } else {
      // Process children
      if (node.hasChildNodes()) {
        Array.from(node.childNodes).forEach(processNode);
      }
    }
  };

  Array.from(tempDiv.childNodes).forEach(processNode);

  return blocks.length > 0 ? blocks : [];
}

// --- CUSTOM BLOT REGISTRATION ---
// Defined at module level to ensure availability before React lifecycle
let BlotsRegistered = false;

const registerCustomBlots = () => {
  if (typeof window === 'undefined' || !Quill || BlotsRegistered) return;

  try {
    // Find the correct base class (Quill 1.x vs 2.x support)
    let BlockEmbed: any;
    try { BlockEmbed = Quill.import('blots/block/embed'); } catch (e) { }
    if (!BlockEmbed) {
      try { BlockEmbed = Quill.import('blots/embed'); } catch (e) { }
    }

    if (!BlockEmbed) {
      console.error('CRITICAL: BlockEmbed not found');
      return;
    }

    // Register Gallery Blot
    class GalleryBlot extends BlockEmbed {
      static blotName = 'gallery';
      static tagName = 'div';
      static className = 'ql-gallery';
      static create(value: any) {
        console.log('🖼️ [GalleryBlot.create] CALLED with value:', value);
        const node = super.create();
        const type = value?.type || 'grid';
        const images = value?.images || [];
        const title = value?.galleryTitle || '';
        const description = value?.galleryDescription || '';

        console.log('🖼️ [GalleryBlot.create] Creating gallery with', images.length, 'images, type:', type);
        node.setAttribute('data-gallery-type', type);
        if (title) node.setAttribute('data-gallery-title', title);
        if (description) node.setAttribute('data-gallery-description', description);
        node.setAttribute('contenteditable', 'false');

        let style = '';
        if (type === 'masonry') style = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;';
        else if (type === 'carousel') style = 'display: flex; overflow-x: auto; gap: 1rem;';
        else style = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;';

        node.setAttribute('style', style);

        images.forEach((img: any) => {
          const figure = document.createElement('figure');
          figure.style.margin = '0';
          const imgEl = document.createElement('img');
          imgEl.setAttribute('src', img.url);
          imgEl.setAttribute('alt', img.alt || '');
          imgEl.className = 'ql-image';
          if (type === 'carousel') {
            imgEl.style.maxWidth = '300px';
            imgEl.style.height = '200px';
            imgEl.style.objectFit = 'cover';
          } else {
            imgEl.style.width = '100%';
            imgEl.style.height = 'auto';
          }
          figure.appendChild(imgEl);
          node.appendChild(figure);
        });
        return node;
      }

      static value(node: any) {
        const images: any[] = [];
        node.querySelectorAll('img').forEach((img: any) => {
          images.push({ url: img.getAttribute('src'), alt: img.getAttribute('alt') });
        });
        return {
          type: node.getAttribute('data-gallery-type'),
          images,
          galleryTitle: node.getAttribute('data-gallery-title') || '',
          galleryDescription: node.getAttribute('data-gallery-description') || ''
        };
      }
    }

    // Register Video Blot
    class CustomVideoBlot extends BlockEmbed {
      static blotName = 'video-embed';
      static tagName = 'div';
      static className = 'ql-video-embed';
      static create(value: any) {
        const node = super.create();
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', value.url);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('style', 'width: 100%; height: 100%; position: absolute; top:0; left:0;');

        const wrapper = document.createElement('div');
        wrapper.setAttribute('style', 'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; width: 100%;');
        wrapper.appendChild(iframe);

        node.appendChild(wrapper);
        node.setAttribute('contenteditable', 'false');
        return node;
      }
      static value(node: any) {
        const iframe = node.querySelector('iframe');
        return { url: iframe ? iframe.getAttribute('src') : '' };
      }
    }

    // Register with Quill - register blots directly (Quill 2.x style)
    Quill.register(GalleryBlot, true);
    Quill.register(CustomVideoBlot, true);

    BlotsRegistered = true;
    console.log('✅ Custom Blots Registered Successfully');

    // Verify registration worked
    console.log('📋 Registered formats:', Object.keys(Quill.imports || {}));
  } catch (e) {
    console.error('❌ Failed to register blots:', e);
  }
};

// Attempt immediate registration at module load
registerCustomBlots();


export function ContentTabWrapper({ methods }: { methods: any }) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<{ url: string; alt?: string; caption?: string }[]>([]);
  const [galleryType, setGalleryType] = useState<'grid' | 'masonry' | 'carousel'>('grid');
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const quillRef = useRef<ReactQuill>(null);
  const isInternalUpdate = useRef(false);
  const lastContentRef = useRef<any>(null);
  const isTypingRef = useRef(false);
  const changeTimeoutRef = useRef<NodeJS.Timeout>(undefined);
  const [editorReady, setEditorReady] = useState(false);

  // Poll for editor readiness - ensure we catch when ref becomes available
  useEffect(() => {
    if (editorReady) return;

    const interval = setInterval(() => {
      if (quillRef.current) {
        console.log('✅ [ContentTabWrapper] Editor ref found, marking ready');
        setEditorReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [editorReady]);

  const rawContent = useWatch({ control: methods.control, name: 'content' });

  // Force content load when editor becomes ready
  useEffect(() => {
    if (editorReady && quillRef.current) {
      console.log('🚀 [ContentTabWrapper] Editor ready - forcing initial content load');
      const quill = quillRef.current.getEditor();
      if (!quill) return;

      // Force a sync from rawContent
      const currentContent = methods.getValues('content');
      let html = '';
      if (Array.isArray(currentContent) && currentContent.length > 0) {
        html = blocksToHTML(currentContent);
      } else if (typeof currentContent === 'string' && currentContent.trim()) {
        html = currentContent;
      }

      if (html && quill.root.innerHTML !== html) {
        console.log('📝 [ContentTabWrapper] Initial content load:', html.substring(0, 50) + '...');
        isInternalUpdate.current = true;
        // Use clipboard for HTML to handle blots correctly
        quill.clipboard.dangerouslyPasteHTML(html);
        // Update ref to prevent immediate re-sync
        lastContentRef.current = currentContent;
        setTimeout(() => {
          isInternalUpdate.current = false;
        }, 100);
      }
    }
  }, [editorReady]);

  // Ensure custom blots are registered early
  useLayoutEffect(() => {
    registerCustomBlots();
  }, []);

  // Simplified toolbar - removed tools that conflict with published page styles
  // Removed: font, size, color, background (these are overridden by published page CSS)
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': ['', 'left', 'center', 'right', 'justify'] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'align', // Includes justify
    'blockquote', 'code-block',
    'link',
    'image', 'video',
    'dropcap',
    'gallery', 'video-embed'
  ];

  const [editingGalleryRange, setEditingGalleryRange] = useState<{ index: number, length: number } | null>(null);

  // Handle double click to edit gallery
  useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();

    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const galleryNode = target.closest('.ql-gallery');

      if (galleryNode) {
        e.preventDefault();
        e.stopPropagation();

        const blot = Quill.find(galleryNode);
        if (blot && 'length' in blot && typeof blot.length === 'function') {
          const index = quill.getIndex(blot);
          const length = blot.length();
          setEditingGalleryRange({ index, length });

          // Parse data
          const type = galleryNode.getAttribute('data-gallery-type') || 'grid';
          const images: any[] = [];
          galleryNode.querySelectorAll('img').forEach((img: HTMLImageElement) => {
            // Try to find caption in figure/figcaption
            const figure = img.closest('figure');
            const caption = figure?.querySelector('figcaption')?.textContent || '';
            images.push({
              url: img.src,
              alt: img.alt,
              caption: caption
            });
          });

          const galleryTitleAttr = galleryNode.getAttribute('data-gallery-title') || '';
          const galleryDescAttr = galleryNode.getAttribute('data-gallery-description') || '';

          setGalleryType(type as any);
          setGalleryImages(images);
          setGalleryTitle(galleryTitleAttr);
          setGalleryDescription(galleryDescAttr);
          setShowGalleryDialog(true);
        }
      }
    };

    const root = quill.root;
    root.addEventListener('dblclick', handleDblClick);
    return () => {
      root.removeEventListener('dblclick', handleDblClick);
    };
  }, []);

  // Debounced change handler to prevent interference with typing
  const handleChange = useCallback((content: string) => {
    if (isInternalUpdate.current) return;

    // Set typing flag immediately to prevent external sync
    isTypingRef.current = true;

    // Clear any pending update
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    // Longer debounce to allow natural typing without interference
    changeTimeoutRef.current = setTimeout(() => {
      isInternalUpdate.current = true;
      const blocks = htmlToBlocks(content);
      lastContentRef.current = blocks;
      methods.setValue('content', blocks, { shouldDirty: true, shouldTouch: true });
      isInternalUpdate.current = false;
      // Keep isTypingRef true for longer to prevent external sync from interfering
      // This ensures Enter key and natural typing work without interruption
      setTimeout(() => {
        isTypingRef.current = false;
      }, 1000); // Increased to 1 second to ensure no interference
    }, 500); // Increased to 500ms to allow natural typing
  }, [methods]);

  // Update Quill when content changes externally (ONLY when editor is NOT focused and NOT typing)
  useEffect(() => {
    console.log('🔄 [ContentTabWrapper] Sync effect triggered. Ready:', editorReady, 'Internal:', isInternalUpdate.current, 'Typing:', isTypingRef.current, 'RawContent:', typeof rawContent);

    if (!editorReady || !quillRef.current || isInternalUpdate.current || isTypingRef.current) {
      // If any of these flags are set, completely skip sync
      return;
    }

    const quill = quillRef.current.getEditor();
    if (!quill || !quill.root) return;

    // CRITICAL: Don't sync if editor is focused (user is typing) - this is critical for Enter key
    if (quill.hasFocus()) {
      // If focused, don't sync at all - let user type naturally
      // Also update lastContentRef to prevent sync when focus is lost
      lastContentRef.current = rawContent;
      return;
    }

    const contentChanged = JSON.stringify(rawContent) !== JSON.stringify(lastContentRef.current);
    if (!contentChanged) {
      // Even if content hasn't changed, update lastContentRef to prevent future false positives
      lastContentRef.current = rawContent;
      return;
    }

    let html = '';
    if (Array.isArray(rawContent) && rawContent.length > 0) {
      html = blocksToHTML(rawContent);
    } else if (typeof rawContent === 'string' && rawContent.trim()) {
      html = rawContent;
    } else {
      html = '';
    }

    const currentHTML = quill.root.innerHTML;

    // CRITICAL: Check if current HTML has galleries or videos - NEVER overwrite these with dangerouslyPasteHTML
    // Quill's clipboard module doesn't understand custom blots and will strip them!
    const currentHasGallery = currentHTML.includes('ql-gallery') || currentHTML.includes('data-gallery-type');
    const currentHasVideo = currentHTML.includes('ql-video-embed');

    if (currentHasGallery || currentHasVideo) {
      // NEVER sync if editor has galleries or videos - they would be destroyed
      // The content is already saved in form state, just update the ref to prevent re-sync
      console.log('Skipping sync - editor has gallery/video that would be destroyed');
      lastContentRef.current = rawContent;
      return;
    }

    // CRITICAL: Check if current HTML has images that would be lost
    const currentHasImages = currentHTML.includes('<img');
    const newHasImages = html.includes('<img');

    // If current HTML has images and new HTML doesn't, NEVER overwrite (preserve images)
    // This prevents images from disappearing when loading existing articles
    if (currentHasImages && !newHasImages) {
      // Don't overwrite - preserve existing images
      // This happens when loading an article - images are in editor but not yet in blocks
      // Update lastContentRef to prevent this check from triggering again
      lastContentRef.current = rawContent;
      return;
    }

    // If both have images, check if we're about to lose any
    if (currentHasImages && newHasImages) {
      const currentImgSrcs = Array.from(quill.root.querySelectorAll('img')).map(img => {
        const src = img.getAttribute('src') || img.src;
        return src.split('?')[0];
      }).filter(Boolean);

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const newImgSrcs = Array.from(tempDiv.querySelectorAll('img')).map(img => {
        const src = img.getAttribute('src') || img.src;
        return src.split('?')[0];
      }).filter(Boolean);

      // If current has images that new doesn't have, preserve them
      const lostImages = currentImgSrcs.filter(src => !newImgSrcs.includes(src));
      if (lostImages.length > 0) {
        // Some images would be lost - don't overwrite, preserve current
        lastContentRef.current = rawContent;
        return;
      }
    }

    // Only update if content is significantly different AND we're not losing images
    if (html !== currentHTML && (newHasImages || !currentHasImages)) {
      isInternalUpdate.current = true;

      // Update content without trying to restore selection (avoids range errors)
      quill.clipboard.dangerouslyPasteHTML(html);

      // Style images after paste and ensure they persist
      setTimeout(() => {
        const allImages = quill.root.querySelectorAll('img');
        allImages.forEach((img) => {
          const imgEl = img as HTMLImageElement;
          // Force image to be visible
          imgEl.style.visibility = 'visible';
          imgEl.style.opacity = '1';
          imgEl.style.display = 'block';
          imgEl.style.maxWidth = '100%';
          imgEl.style.width = 'auto';
          imgEl.style.height = 'auto';
          imgEl.style.margin = '1rem auto';
          imgEl.style.objectFit = 'contain';
          if (!imgEl.className.includes('ql-image')) {
            imgEl.className = `${imgEl.className} ql-image`.trim();
          }
          // Ensure image loads
          if (imgEl.src && !imgEl.complete) {
            imgEl.onload = () => {
              imgEl.style.opacity = '1';
              imgEl.style.visibility = 'visible';
            };
          }
        });

        // Re-check after a delay to ensure images are still there (prevent disappearing)
        setTimeout(() => {
          const stillHasImages = quill.root.innerHTML.includes('<img');
          if (!stillHasImages && currentHasImages) {
            // Images were lost - restore them from the original HTML
            console.warn('Images were lost during sync, restoring...');
            isInternalUpdate.current = true;
            quill.clipboard.dangerouslyPasteHTML(currentHTML);
            // Style them again
            setTimeout(() => {
              const restoredImages = quill.root.querySelectorAll('img');
              restoredImages.forEach((img) => {
                const imgEl = img as HTMLImageElement;
                imgEl.style.visibility = 'visible';
                imgEl.style.opacity = '1';
                imgEl.style.display = 'block';
                imgEl.style.maxWidth = '100%';
                imgEl.style.height = 'auto';
                imgEl.style.margin = '1rem auto';
                imgEl.style.objectFit = 'contain';
              });
              isInternalUpdate.current = false;
            }, 50);
          }
        }, 200);
      }, 50);

      lastContentRef.current = rawContent;
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 100);
    } else {
      lastContentRef.current = rawContent;
    }
  }, [rawContent, editorReady]);

  // Fix toolbar positioning, add focus/blur handlers, and prevent image removal
  useEffect(() => {
    if (!quillRef.current || !editorReady) return;

    const quill = quillRef.current.getEditor();
    if (!quill) return;

    // FORCE toolbar to be sticky and accessible - directly manipulate DOM
    const fixToolbar = () => {
      const toolbar = quill.container?.previousElementSibling as HTMLElement;
      if (toolbar && toolbar.classList.contains('ql-toolbar')) {
        // Make toolbar sticky so it's always accessible when scrolling
        toolbar.style.setProperty('position', 'sticky', 'important');
        toolbar.style.setProperty('top', '0', 'important');
        toolbar.style.setProperty('z-index', '200', 'important');
        toolbar.style.setProperty('background', '#27272a', 'important');
        toolbar.style.setProperty('border', '1px solid #3f3f46', 'important');
        toolbar.style.setProperty('border-bottom', '1px solid #3f3f46', 'important');
        toolbar.style.setProperty('border-radius', '8px 8px 0 0', 'important');
        toolbar.style.setProperty('margin', '0', 'important');
        toolbar.style.setProperty('transform', 'none', 'important');
        toolbar.style.setProperty('will-change', 'auto', 'important');
        toolbar.classList.add('ql-sticky');
      }
      // Ensure container can scroll
      if (quill.container) {
        quill.container.style.setProperty('overflow-y', 'auto', 'important');
        quill.container.style.setProperty('overflow-x', 'hidden', 'important');
        quill.container.style.setProperty('flex', '1', 'important');
        quill.container.style.setProperty('max-height', 'calc(800px - 42px)', 'important');
      }
    };

    // Fix immediately and on any changes
    fixToolbar();
    setTimeout(fixToolbar, 100);
    setTimeout(fixToolbar, 500);

    // Watch for toolbar changes
    const toolbarObserver = new MutationObserver(() => {
      fixToolbar();
    });

    if (quill.container?.parentElement) {
      toolbarObserver.observe(quill.container.parentElement, {
        childList: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    // Add focus/blur handlers to prevent external sync during typing
    const handleFocus = () => {
      isTypingRef.current = true;
    };

    const handleBlur = () => {
      setTimeout(() => {
        isTypingRef.current = false;
      }, 500);
    };

    quill.root.addEventListener('focus', handleFocus, true);
    quill.root.addEventListener('blur', handleBlur, true);

    // Prevent images from being removed - watch for image removal
    const imageObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              if (el.tagName === 'IMG' || el.querySelector('img')) {
                // Image was removed - check if we should prevent this
                const allImages = quill.root.querySelectorAll('img');
                if (allImages.length === 0 && !isInternalUpdate.current) {
                  // All images removed unexpectedly - restore from form state
                  const currentContent = methods.getValues('content');
                  if (Array.isArray(currentContent)) {
                    const imageBlocks = currentContent.filter((b: any) => b.type === 'image');
                    if (imageBlocks.length > 0) {
                      setTimeout(() => {
                        const html = blocksToHTML(currentContent);
                        isInternalUpdate.current = true;
                        quill.clipboard.dangerouslyPasteHTML(html);
                        setTimeout(() => {
                          isInternalUpdate.current = false;
                        }, 100);
                      }, 50);
                    }
                  }
                }
              }
            }
          });
        }
      });
    });

    imageObserver.observe(quill.root, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      quill.root.removeEventListener('focus', handleFocus, true);
      quill.root.removeEventListener('blur', handleBlur, true);
      toolbarObserver.disconnect();
      imageObserver.disconnect();
    };
  }, [methods, editorReady]);

  // Separate effect for styling images
  useEffect(() => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    if (!quill) return;

    const toolbar = quill.container.previousElementSibling as HTMLElement;
    if (toolbar) {
      // Add data-label attributes for pickers
      const pickers = toolbar.querySelectorAll('.ql-picker');
      pickers.forEach((picker) => {
        const label = picker.getAttribute('class')?.replace('ql-picker ql-', '').replace(/-/g, ' ') || '';
        (picker as HTMLElement).setAttribute('data-label', label.charAt(0).toUpperCase() + label.slice(1));
      });
    }

    // Style all existing images in the editor
    const styleImages = () => {
      const allImages = quill.root.querySelectorAll('img');
      allImages.forEach((img) => {
        const imgEl = img as HTMLImageElement;
        // Force image to be visible first
        imgEl.style.visibility = 'visible';
        imgEl.style.opacity = '1';
        imgEl.style.display = 'block';

        // Ensure image is properly styled
        imgEl.style.maxWidth = '100%';
        imgEl.style.width = 'auto';
        imgEl.style.height = 'auto';
        imgEl.style.margin = '1rem auto';
        imgEl.style.objectFit = 'contain';
        imgEl.style.borderRadius = '8px';

        // Ensure image loads and stays visible
        if (imgEl.src) {
          // Force reload if image failed
          if (!imgEl.complete) {
            imgEl.onload = () => {
              imgEl.style.opacity = '1';
              imgEl.style.visibility = 'visible';
              imgEl.style.display = 'block';
            };
            imgEl.onerror = () => {
              // Try reloading once
              const originalSrc = imgEl.src;
              setTimeout(() => {
                if (imgEl.src === originalSrc && !imgEl.complete) {
                  imgEl.src = originalSrc + '?t=' + Date.now();
                }
              }, 1000);
              imgEl.style.opacity = '0.7';
              imgEl.alt = imgEl.alt || 'Image failed to load';
            };
          } else {
            // Image already loaded, ensure it's visible
            imgEl.style.opacity = '1';
            imgEl.style.visibility = 'visible';
            imgEl.style.display = 'block';
          }
        }

        if (!imgEl.className.includes('ql-image')) {
          imgEl.className = `${imgEl.className} ql-image`.trim();
        }
      });
    };

    // Style images immediately and after content updates
    styleImages();

    // Also style images after a short delay to catch any that load asynchronously
    setTimeout(styleImages, 100);
    setTimeout(styleImages, 500);

    // Watch for new images being added
    const observer = new MutationObserver(() => {
      styleImages();
    });

    observer.observe(quill.root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  const addImage = useCallback(() => {
    if (!quillRef.current || !imageUrl) return;
    const quill = quillRef.current.getEditor();

    // Get current selection safely
    let index = quill.getLength() - 1;
    try {
      const range = quill.getSelection(true);
      if (range && range.index >= 0) {
        index = range.index;
      }
    } catch (e) {
      // Use default index if selection fails
    }

    // Prevent external sync while inserting image
    isInternalUpdate.current = true;
    isTypingRef.current = true;

    // Insert image as HTML directly (more reliable than insertEmbed)
    const imageHTML = `<img src="${imageUrl}" alt="${imageAlt || ''}" title="${imageDescription || ''}" class="ql-image" style="max-width: 100%; height: auto; display: block; margin: 1rem auto; object-fit: contain; visibility: visible; opacity: 1;" />`;

    try {
      // Get current selection
      const range = quill.getSelection(true);
      const insertIndex = range ? range.index : index;

      // Insert image as HTML
      quill.clipboard.dangerouslyPasteHTML(insertIndex, imageHTML);

      // Move cursor after image
      setTimeout(() => {
        try {
          quill.setSelection(insertIndex + 1);
        } catch (e) {
          // Ignore selection errors
        }
      }, 50);
    } catch (e) {
      console.error('Failed to insert image:', e);
      isInternalUpdate.current = false;
      isTypingRef.current = false;
      return;
    }

    // Verify and sync image after insertion
    setTimeout(() => {
      const html = quill.root.innerHTML;

      // Verify image is in the HTML
      if (!html.includes(imageUrl)) {
        // Image was lost, try again with a longer delay
        console.warn('Image not found in HTML, retrying...');
        setTimeout(() => {
          const retryHTML = `<img src="${imageUrl}" alt="${imageAlt || ''}" title="${imageDescription || ''}" class="ql-image" style="max-width: 100%; height: auto; display: block; margin: 1rem auto; object-fit: contain; visibility: visible; opacity: 1;" />`;
          try {
            const currentRange = quill.getSelection(true);
            const retryIndex = currentRange ? currentRange.index : index;
            quill.clipboard.dangerouslyPasteHTML(retryIndex, retryHTML);
          } catch (e) {
            console.error('Retry failed:', e);
          }
        }, 200);
        return;
      }

      // Find and style the inserted image
      const allImages = quill.root.querySelectorAll('img');
      allImages.forEach((img) => {
        const imgEl = img as HTMLImageElement;
        const src = imgEl.getAttribute('src') || imgEl.src;
        if (src === imageUrl || src.includes(imageUrl.split('/').pop() || '')) {
          // This is our image - ensure it's styled correctly
          imgEl.setAttribute('alt', imageAlt || '');
          if (imageDescription) {
            imgEl.setAttribute('title', imageDescription);
          }
          imgEl.style.visibility = 'visible';
          imgEl.style.opacity = '1';
          imgEl.style.display = 'block';
          imgEl.style.maxWidth = '100%';
          imgEl.style.width = 'auto';
          imgEl.style.height = 'auto';
          imgEl.style.margin = '1rem auto';
          imgEl.style.objectFit = 'contain';
          imgEl.style.borderRadius = '8px';
          imgEl.className = 'ql-image';
        }
      });

      // Update form state with the new content
      const blocks = htmlToBlocks(html);
      // Verify image block was created
      const hasImageBlock = blocks.some(b => b.type === 'image' && (b.content === imageUrl || b.content.includes(imageUrl.split('/').pop() || '')));

      if (hasImageBlock) {
        lastContentRef.current = blocks;
        methods.setValue('content', blocks, { shouldDirty: true, shouldTouch: true });
      } else {
        // Image block wasn't created - this shouldn't happen, but log it
        console.warn('Image block not created from HTML:', html.substring(0, 200));
      }

      // Keep flags set longer to prevent external sync
      setTimeout(() => {
        isInternalUpdate.current = false;
        isTypingRef.current = false;
      }, 1500); // Increased to 1.5 seconds to ensure image persists
    }, 200);

    // Move cursor after image
    setTimeout(() => {
      try {
        const newIndex = index + 1;
        const length = quill.getLength();
        if (newIndex < length) {
          quill.setSelection(newIndex);
        } else {
          quill.setSelection(length - 1);
        }
      } catch (e) {
        // Ignore selection errors
      }
    }, 300);

    setShowImageDialog(false);
    setImageUrl('');
    setImageAlt('');
    setImageDescription('');
  }, [imageUrl, imageAlt, imageDescription, handleChange]);

  const addVideo = useCallback(() => {
    if (!quillRef.current || !videoUrl) return;

    // Register (just in case)
    registerCustomBlots();

    const quill = quillRef.current.getEditor();

    // Focus first
    quill.focus();

    let index = quill.getLength() - 1;
    const range = quill.getSelection(true);
    if (range) {
      index = range.index;
    }

    // Prevent external sync while inserting video
    isInternalUpdate.current = true;
    isTypingRef.current = true;

    // Insert using the custom blot name 'video-embed'
    quill.insertEmbed(index, 'video-embed', { url: videoUrl }, 'user');

    // Move cursor after video and update form state
    setTimeout(() => {
      quill.setSelection(index + 1);

      // CRITICAL: Update form state after video insert
      const html = quill.root.innerHTML;
      const blocks = htmlToBlocks(html);
      console.log('Video inserted, saving blocks:', blocks.filter(b => b.type === 'video'));
      lastContentRef.current = blocks;
      methods.setValue('content', blocks, { shouldDirty: true, shouldTouch: true });

      // Reset flags after save
      setTimeout(() => {
        isInternalUpdate.current = false;
        isTypingRef.current = false;
      }, 500);
    }, 100);

    setShowVideoDialog(false);
    setVideoUrl('');
  }, [videoUrl, methods]);

  const addGallery = useCallback(() => {
    console.log('🖼️ [addGallery] Function called!', {
      hasQuillRef: !!quillRef.current,
      galleryImagesCount: galleryImages.length,
      galleryImages: galleryImages.map(i => i.url?.substring(0, 30) + '...')
    });
    if (!quillRef.current || galleryImages.length === 0) {
      console.log('🖼️ [addGallery] Early return - missing quillRef or no images');
      return;
    }
    const quill = quillRef.current.getEditor();
    console.log('🖼️ [addGallery] Got quill editor:', !!quill);
    let index = quill.getLength() - 1;
    try {
      const range = quill.getSelection(true);
      if (range && range.index >= 0) {
        index = range.index;
      }
    } catch (e) {
      // Use default index
    }

    // Prevent external sync while inserting gallery
    isInternalUpdate.current = true;
    isTypingRef.current = true;

    // Register (just in case)
    registerCustomBlots();

    // If editing, delete existing range first
    if (editingGalleryRange) {
      quill.deleteText(editingGalleryRange.index, editingGalleryRange.length);
      index = editingGalleryRange.index;
      setEditingGalleryRange(null); // Reset
    }

    let galleryStyle = '';
    if (galleryType === 'masonry') {
      galleryStyle = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); grid-auto-rows: auto; gap: 1rem; margin: 1rem 0;';
    } else if (galleryType === 'carousel') {
      galleryStyle = 'display: flex; overflow-x: auto; gap: 1rem; margin: 1rem 0; scroll-snap-type: x mandatory;';
    } else {
      galleryStyle = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0;';
    }

    const galleryData = {
      type: galleryType,
      images: galleryImages,
      galleryTitle,
      galleryDescription
    };

    try {
      // Use insertEmbed with data object
      const range = quill.getSelection(true);
      const index = range ? range.index : (quill.getLength() - 1);

      console.log('🖼️ [GALLERY INSERT] Starting gallery insertion...');
      console.log('🖼️ [GALLERY INSERT] Index:', index);
      console.log('🖼️ [GALLERY INSERT] Gallery data:', galleryData);
      console.log('🖼️ [GALLERY INSERT] Number of images:', galleryImages.length);

      // Check if gallery format is registered
      try {
        const galleryBlot = Quill.import('blots/gallery');
        console.log('🖼️ [GALLERY INSERT] Gallery blot registered:', galleryBlot ? 'YES' : 'NO');
      } catch (e) {
        console.log('🖼️ [GALLERY INSERT] Gallery blot lookup error:', e);
      }

      // Get HTML before insertion
      const htmlBefore = quill.root.innerHTML;
      console.log('🖼️ [GALLERY INSERT] HTML before (first 200 chars):', htmlBefore.substring(0, 200));

      // Insert the gallery
      quill.insertEmbed(index, 'gallery', galleryData, Quill.sources.USER);

      // Get HTML after insertion
      const htmlAfter = quill.root.innerHTML;
      console.log('🖼️ [GALLERY INSERT] HTML after (first 500 chars):', htmlAfter.substring(0, 500));

      // Check if ql-gallery class is present
      const hasGalleryClass = htmlAfter.includes('ql-gallery');
      console.log('🖼️ [GALLERY INSERT] Contains ql-gallery class:', hasGalleryClass);

      // Move cursor after
      setTimeout(() => {
        quill.setSelection(index + 1);
      }, 100);

      console.log('🖼️ [GALLERY INSERT] Gallery insertion completed');

    } catch (e: any) {
      console.error('❌ [GALLERY INSERT] Failed to insert gallery:', e);
      window.alert(`Failed to insert gallery: ${e.message || 'Unknown error'}`);
      isInternalUpdate.current = false;
      isTypingRef.current = false;
      return; // Exit early on error
    }

    // CRITICAL: Update form state after gallery insert
    setTimeout(() => {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const html = quill.root.innerHTML;
        const blocks = htmlToBlocks(html);
        console.log('Gallery inserted, saving blocks:', blocks.filter(b => b.type === 'gallery'));
        lastContentRef.current = blocks;
        methods.setValue('content', blocks, { shouldDirty: true, shouldTouch: true });
      }

      // Reset flags after save
      setTimeout(() => {
        isInternalUpdate.current = false;
        isTypingRef.current = false;
      }, 500);
    }, 200);

    setShowGalleryDialog(false);
    setGalleryImages([]);
    setGalleryType('grid');
  }, [galleryImages, galleryType, methods]);

  const toggleDropcap = useCallback(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    if (!range) return;
    // Find start of current line
    const [line] = quill.getLine(range.index);
    if (!line) return;
    const lineIndex = quill.getIndex(line);
    // Toggle dropcap on first character of the line
    const currentFormats = quill.getFormat(lineIndex, 1);
    const isActive = !!currentFormats.dropcap;
    quill.formatText(lineIndex, 1, 'dropcap', !isActive, Quill.sources.USER);
  }, []);

  if (!methods || !methods.control) {
    return (
      <div className="p-8 bg-red-500/10 border-2 border-red-500 rounded-lg text-red-400">
        <p className="font-bold">ERROR: Form context not available</p>
        <p className="text-xs mt-2">ContentTabWrapper requires react-hook-form FormProvider</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Custom Toolbar Buttons */}
      <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
        <button
          type="button"
          onClick={() => {
            setImageUrl('');
            setImageAlt('');
            setImageDescription('');
            setShowImageDialog(true);
          }}
          className="p-2 rounded hover:bg-zinc-700 transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4 text-white" />
        </button>
        <button
          type="button"
          onClick={() => setShowGalleryDialog(true)}
          className="p-2 rounded hover:bg-zinc-700 transition-colors"
          title="Insert Gallery"
        >
          <LayoutGrid className="w-4 h-4 text-white" />
        </button>
        <button
          type="button"
          onClick={() => setShowVideoDialog(true)}
          className="p-2 rounded hover:bg-zinc-700 transition-colors"
          title="Insert Video"
        >
          <Video className="w-4 h-4 text-white" />
        </button>
        <button
          type="button"
          onClick={() => {
            console.log('DEBUG: Checking Registry');
            if (!quillRef.current) return alert('No editor ref');
            const quill = quillRef.current.getEditor();
            console.log('Imports:', Quill.imports);
            const verified = Quill.imports['formats/gallery'];
            alert(verified ? '✅ Gallery registered' : '❌ Gallery NOT registered');
          }}
          className="p-2 rounded hover:bg-zinc-700 transition-colors bg-red-900/50"
          title="DEBUG: Verify System"
        >
          <span className="text-xs font-mono">DBG</span>
        </button>
        <button
          type="button"
          onClick={toggleDropcap}
          className="p-2 rounded hover:bg-zinc-700 transition-colors"
          title="Toggle Dropcap on current paragraph"
        >
          <Type className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Quill Editor */}
      {/* Note: ReactQuill uses findDOMNode which is deprecated in React 18.
          This is a known issue with react-quill library and will be fixed in a future update.
          The warning can be safely ignored as it doesn't affect functionality. */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden relative" style={{ isolation: 'isolate', maxHeight: '800px', display: 'flex', flexDirection: 'column' }}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          defaultValue={(() => {
            if (Array.isArray(rawContent) && rawContent.length > 0) {
              return blocksToHTML(rawContent);
            } else if (typeof rawContent === 'string') {
              return rawContent;
            }
            return '';
          })()}
          onChange={handleChange}
          modules={modules}
          placeholder="Start writing..."
          style={{
            backgroundColor: '#18181b',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        />
        <style>{`
          .ql-container {
            font-family: inherit;
            font-size: 14px;
            background: #18181b;
            color: white;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            flex: 1 !important;
            border-radius: 0 0 8px 8px !important;
            max-height: calc(800px - 42px) !important;
          }
          .ql-editor {
            min-height: 600px;
            color: white;
          }
          .ql-editor p {
            margin: 1em 0 !important;
            line-height: 1.6;
            min-height: 1.5em;
            display: block;
            font-size: 14px;
          }
          .ql-editor p:empty {
            min-height: 1.5em;
          }
          .ql-editor p:empty::before {
            content: '\\200B';
            display: inline-block;
          }
          .ql-editor p + p {
            margin-top: 1em !important;
          }
          .ql-editor br {
            display: block;
            margin: 0.5em 0;
            content: "";
          }
          .ql-editor.ql-blank::before {
            color: #71717a;
            font-style: normal;
          }
          .ql-toolbar,
          .ql-container .ql-toolbar,
          .ql-snow .ql-toolbar,
          div[class*="ql-toolbar"] {
            background: #27272a !important;
            border: 1px solid #3f3f46 !important;
            border-bottom: 1px solid #3f3f46 !important;
            border-radius: 8px 8px 0 0 !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 200 !important;
            transform: none !important;
            will-change: auto !important;
            margin: 0 !important;
            padding: 8px !important;
          }
          .ql-editor {
            text-align: left !important;
          }
          .ql-editor p[style*="text-align: justify"],
          .ql-editor p[style*="text-align:justify"],
          .ql-editor p.ql-align-justify {
            text-align: justify !important;
          }
          .ql-editor p.ql-align-left {
            text-align: left !important;
          }
          .ql-editor p.ql-align-center {
            text-align: center !important;
          }
          .ql-editor p.ql-align-right {
            text-align: right !important;
          }
          .ql-toolbar button {
            position: relative !important;
          }
          .ql-toolbar button::after {
            position: fixed !important;
            z-index: 999999 !important;
          }
          /* Ensure images maintain alignment */
          .ql-editor img {
            display: block;
            max-width: 100%;
            height: auto;
          }
          .ql-editor figure {
            margin: 1rem 0;
          }
          .ql-editor figure[style*="text-align: center"],
          .ql-editor figure[style*="text-align:center"] {
            text-align: center;
          }
          .ql-editor figure[style*="text-align: left"],
          .ql-editor figure[style*="text-align:left"] {
            text-align: left;
          }
          .ql-editor figure[style*="text-align: right"],
          .ql-editor figure[style*="text-align:right"] {
            text-align: right;
          }
          .ql-toolbar .ql-stroke {
            stroke: white;
          }
          .ql-toolbar .ql-fill {
            fill: white;
          }
          .ql-toolbar .ql-picker-label {
            color: white;
          }
          .ql-toolbar button:hover,
          .ql-toolbar button.ql-active {
            background: #3f3f46;
          }
          .ql-snow .ql-picker {
            color: white;
          }
          .ql-snow .ql-stroke {
            stroke: white;
          }
          .ql-snow .ql-fill {
            fill: white;
          }
          .ql-snow .ql-picker-options {
            background: #27272a;
            border: 1px solid #3f3f46;
          }
          .ql-snow .ql-picker-item {
            color: white;
          }
          .ql-snow .ql-picker-item:hover {
            background: #3f3f46;
          }
          .ql-editor img {
            max-width: 100% !important;
            width: auto !important;
            height: auto !important;
            border-radius: 8px;
            margin: 1rem auto !important;
            display: block !important;
            object-fit: contain;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .ql-editor img[src] {
            visibility: visible !important;
            opacity: 1 !important;
            display: block !important;
          }
          .ql-editor .ql-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
          }
          .ql-editor .ql-gallery img {
            width: 100%;
            height: auto;
            border-radius: 8px;
          }
          .ql-editor .dropcap {
            float: left;
            font-size: 3.2rem;
            line-height: 0.9;
            padding-right: 0.2em;
            padding-top: 0.05em;
            font-weight: 700;
          }
          .ql-editor .ql-video {
            margin: 1rem 0;
            padding: 1rem;
            background: #27272a;
            border-radius: 8px;
            border: 1px solid #3f3f46;
          }
          
          /* Tooltips for Quill toolbar buttons */
          .ql-toolbar button[data-value="1"]:hover::after,
          .ql-toolbar button[data-value="2"]:hover::after,
          .ql-toolbar button[data-value="3"]:hover::after {
            content: attr(data-value) " Heading";
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          
          /* Custom Blot Styles - ensuring visibility in Admin */
          .ql-editor .ql-video-embed {
             position: relative;
             width: 100%;
             margin: 1rem 0;
          }
          .ql-editor .ql-gallery {
             margin: 1rem 0;
             display: grid; /* Fallback */
             width: 100%;
          }
          
          .ql-toolbar button.ql-bold:hover::after {
            content: "Bold (Ctrl+B)";
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          .ql-toolbar button.ql-italic:hover::after {
            content: "Italic (Ctrl+I)";
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          .ql-toolbar button.ql-underline:hover::after {
            content: "Underline (Ctrl+U)";
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          .ql-toolbar button.ql-strike:hover::after {
            content: "Strikethrough";
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          .ql-toolbar button.ql-list[value="ordered"]:hover::after {
            content: "Numbered List";
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          .ql-toolbar button.ql-list[value="bullet"]:hover::after {
            content: "Bullet List";
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          .ql-toolbar button.ql-blockquote:hover::after {
            content: "Quote";
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          .ql-toolbar button.ql-code-block:hover::after {
            content: "Code Block";
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          .ql-toolbar button.ql-link:hover::after {
            content: "Insert Link";
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          .ql-toolbar button.ql-clean:hover::after {
            content: "Clear Formatting";
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          .ql-toolbar .ql-picker:hover::after {
            content: attr(data-label);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 4px;
            border: 1px solid #3f3f46;
            z-index: 999999 !important;
            pointer-events: none !important;
            isolation: isolate !important;
          }
          .ql-toolbar button {
            position: relative;
          }
          .ql-toolbar button:hover::after {
            pointer-events: auto !important;
          }
          /* Force Gallery Grid in Editor */
          .ql-editor .ql-gallery {
            display: grid;
            gap: 1rem;
            margin: 1rem 0;
            padding: 1rem;
            border: 1px dashed #3f3f46;
            border-radius: 0.5rem;
            background: #18181b;
          }
          .ql-editor .ql-gallery[data-gallery-type="masonry"] {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
          .ql-editor .ql-gallery[data-gallery-type="grid"] {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
          .ql-editor .ql-gallery[data-gallery-type="carousel"] {
            display: flex !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
          }
          .ql-editor .ql-gallery img {
            max-width: 100%;
            height: auto;
            object-fit: cover;
            border-radius: 4px;
          }
          .ql-editor .ql-video-embed iframe {
            pointer-events: none; /* Prevent clicking inside iframe in editor */
          }
        `}</style>
      </div>

      {/* Image Dialog - Enhanced with Alt Text and Description */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto" onClick={() => setShowImageDialog(false)}>
          <div className="bg-zinc-900 rounded-xl p-6 max-w-lg w-full border-2 border-zinc-500 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Insert Image</h3>
              <button
                type="button"
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl('');
                  setImageAlt('');
                  setImageDescription('');
                }}
                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                aria-label="Close dialog"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Image URL</label>
                <ImageUploader
                  label="Upload or paste image URL"
                  value={imageUrl}
                  onChange={(url) => {
                    setImageUrl(url);
                  }}
                  bucketName="blog"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Alt Text <span className="text-zinc-400 text-xs">(required for accessibility)</span>
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe the image for screen readers"
                  className="w-full px-4 py-2 bg-zinc-800 text-white border-2 border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description <span className="text-zinc-400 text-xs">(optional)</span>
                </label>
                <textarea
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  placeholder="Optional image description or caption"
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-800 text-white border-2 border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={addImage}
                disabled={!imageUrl}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Insert Image
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl('');
                  setImageAlt('');
                  setImageDescription('');
                }}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Dialog */}
      {showVideoDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Insert Video</h3>
              <button
                type="button"
                onClick={() => setShowVideoDialog(false)}
                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                aria-label="Close dialog"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <label className="block text-sm font-medium text-white mb-2">Video URL</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              className="w-full px-4 py-2 bg-zinc-800 text-white border-2 border-zinc-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addVideo();
                }
              }}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={addVideo}
                disabled={!videoUrl}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Insert
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVideoDialog(false);
                  setVideoUrl('');
                }}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Dialog */}
      {showGalleryDialog && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto"
          onClick={() => setShowGalleryDialog(false)}
        >
          <div
            className="bg-zinc-900 rounded-xl p-6 max-w-2xl w-full border-2 border-zinc-500 shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 10000, position: 'relative' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Create Gallery</h3>
              <button
                type="button"
                onClick={() => setShowGalleryDialog(false)}
                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                aria-label="Close dialog"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Gallery Title & Description & Type */}
              <div className="p-4 bg-zinc-800 rounded-lg border-2 border-zinc-600 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Gallery Title (Optional)</label>
                  <input
                    type="text"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    placeholder="E.g., Production Photos, Set Design"
                    className="w-full px-4 py-2 bg-zinc-900 text-white border-2 border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Description (Optional)</label>
                  <textarea
                    value={galleryDescription}
                    onChange={(e) => setGalleryDescription(e.target.value)}
                    placeholder="Brief description of this gallery..."
                    rows={2}
                    className="w-full px-4 py-2 bg-zinc-900 text-white border-2 border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="gallery-type-select" className="block text-sm font-medium text-white mb-2">Gallery Type</label>
                  <select
                    id="gallery-type-select"
                    name="gallery-type"
                    value={galleryType}
                    onChange={(e) => setGalleryType(e.target.value as 'grid' | 'masonry' | 'carousel')}
                    className="w-full px-4 py-2 bg-zinc-900 text-white border-2 border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Select gallery type"
                  >
                    <option value="grid">Grid (Equal Rows)</option>
                    <option value="masonry">Masonry (Variable Heights)</option>
                    <option value="carousel">Carousel (Horizontal Scroll)</option>
                  </select>
                </div>
              </div>

              <ImageGalleryManager
                label="Gallery Images"
                images={galleryImages}
                onChange={setGalleryImages}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Gallery button clicked', { galleryImages: galleryImages.length, hasAlt: galleryImages.every(img => img.alt && img.alt.trim()) });
                  if (galleryImages.length === 0) {
                    alert('Please add at least one image to the gallery');
                    return;
                  }
                  if (galleryImages.some(img => !img.alt || img.alt.trim() === '')) {
                    alert('All images must have alt text for accessibility');
                    return;
                  }
                  addGallery();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
                style={{ pointerEvents: 'auto', zIndex: 1000 }}
              >
                Insert Gallery ({galleryImages.length} images)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGalleryDialog(false);
                  setGalleryImages([]);
                  setGalleryType('grid');
                  setGalleryTitle('');
                  setGalleryDescription('');
                }}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
