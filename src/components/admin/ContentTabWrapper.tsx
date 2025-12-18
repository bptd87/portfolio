import { useWatch } from 'react-hook-form';
import { ContentBlock } from './WYSIWYGEditor';
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Image as ImageIcon, Film, Undo, Redo, Grid3x3 } from 'lucide-react';
import { ImageUploader, ImageGalleryManager } from './ImageUploader';

export function ContentTabWrapper({ methods }: { methods: any }) {
  const content = useWatch({ control: methods.control, name: 'content' }) || [];

  // Convert blocks to HTML for modern editor
  const blocksToHTML = (blocks: ContentBlock[]): string => {
    if (!blocks || blocks.length === 0) return '';
    if (typeof blocks === 'string') return blocks; // Already HTML
    
    return blocks.map(b => {
      if (b.type === 'paragraph') return `<p>${b.content || ''}</p>`;
      if (b.type === 'heading') {
        const level = b.metadata?.level || 2;
        return `<h${level}>${b.content || ''}</h${level}>`;
      }
      if (b.type === 'image') {
        return `<img src="${b.content}" alt="${b.metadata?.alt || ''}" />`;
      }
      if (b.type === 'list') {
        const items = (b.content || '').split('\n').filter(i => i.trim());
        const tag = b.metadata?.listType === 'number' ? 'ol' : 'ul';
        return `<${tag}>${items.map(item => `<li>${item}</li>`).join('')}</${tag}>`;
      }
      if (b.type === 'quote') {
        return `<blockquote>${b.content || ''}</blockquote>`;
      }
      return '';
    }).join('');
  };

  // Convert HTML to blocks for storage (backwards compatibility)
  const htmlToBlocks = (html: string): ContentBlock[] => {
    if (!html || html.trim() === '') {
      return [{ id: `block-${Date.now()}`, type: 'paragraph', content: '' }];
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const blocks: ContentBlock[] = [];
    
    Array.from(tempDiv.childNodes).forEach((node, idx) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        
        if (tag === 'p' && el.textContent?.trim()) {
          blocks.push({ 
            id: `block-${Date.now()}-${idx}`, 
            type: 'paragraph', 
            content: el.innerHTML 
          });
        } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
          blocks.push({ 
            id: `block-${Date.now()}-${idx}`, 
            type: 'heading', 
            content: el.textContent || '', 
            metadata: { level: parseInt(tag[1]) } 
          });
        } else if (tag === 'img') {
          blocks.push({ 
            id: `block-${Date.now()}-${idx}`, 
            type: 'image', 
            content: (el as HTMLImageElement).src, 
            metadata: { alt: (el as HTMLImageElement).alt } 
          });
        } else if (tag === 'ul' || tag === 'ol') {
          const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '').join('\n');
          blocks.push({
            id: `block-${Date.now()}-${idx}`,
            type: 'list',
            content: items,
            metadata: { listType: tag === 'ol' ? 'number' : 'bullet' }
          });
        } else if (tag === 'blockquote') {
          blocks.push({
            id: `block-${Date.now()}-${idx}`,
            type: 'quote',
            content: el.innerHTML
          });
        } else if (tag === 'pre' || tag === 'code') {
          blocks.push({
            id: `block-${Date.now()}-${idx}`,
            type: 'paragraph',
            content: `<code>${el.textContent || ''}</code>`
          });
        }
      }
    });
    
    return blocks.length > 0 ? blocks : [{ id: `block-${Date.now()}`, type: 'paragraph', content: '' }];
  };

  const htmlContent = Array.isArray(content) ? blocksToHTML(content) : (typeof content === 'string' ? content : '');

  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-400 underline hover:text-blue-300' },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
    ],
    content: htmlContent || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const blocks = htmlToBlocks(html);
      methods.setValue('content', blocks, { shouldDirty: true, shouldTouch: true });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[600px] p-8 text-zinc-100 leading-relaxed',
      },
    },
  });

  useEffect(() => {
    if (editor && htmlContent !== editor.getHTML()) {
      editor.commands.setContent(htmlContent || '');
    }
  }, [htmlContent, editor]);

  const handleImageUpload = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
      setShowImageDialog(false);
    }
  };

  const handleGalleryUpload = (images: Array<{ url: string; caption?: string; alt?: string }>) => {
    if (editor && images.length > 0) {
      const galleryHTML = `<div class="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
        ${images.map(img => `
          <figure class="m-0">
            <img src="${img.url}" alt="${img.alt || ''}" class="w-full h-auto rounded-lg" />
            ${img.caption ? `<figcaption class="text-sm text-zinc-400 mt-2 text-center">${img.caption}</figcaption>` : ''}
          </figure>
        `).join('')}
      </div>`;
      editor.chain().focus().insertContent(galleryHTML + '<p></p>').run();
      setShowGalleryDialog(false);
    }
  };

  const handleVideoInsert = () => {
    if (editor && videoUrl) {
      const youtubeMatch = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
      const vimeoMatch = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com)\/(?:video\/|)(\d+)(?:\S+)?/);
      let embedUrl = null;
      if (youtubeMatch?.[1]) embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      if (vimeoMatch?.[1]) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      if (embedUrl) {
        editor.chain().focus().insertContent(`<div class="aspect-video my-8 rounded-lg overflow-hidden"><iframe src="${embedUrl}" frameborder="0" allowfullscreen class="w-full h-full"></iframe></div><p></p>`).run();
        setVideoUrl('');
        setShowVideoDialog(false);
      }
    }
  };

  if (!editor) {
    return <div className="p-8 text-zinc-400 text-center">Loading editor...</div>;
  }

  return (
    <div className="space-y-4 h-full">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 bg-zinc-950/50 border-b border-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('bold')
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('italic')
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('underline')
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="w-px h-6 bg-zinc-700 mx-1" />
          <select
            aria-label="Text style"
            title="Text style"
            value={editor.isActive('heading', { level: 1 }) ? 'h1' : editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
            onChange={(e) => {
              if (e.target.value === 'p') {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: parseInt(e.target.value.replace('h', '')) as 1 | 2 | 3 }).run();
              }
            }}
            className="bg-zinc-800 text-zinc-300 text-sm border border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="p">Text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
          <div className="w-px h-6 bg-zinc-700 mx-1" />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('bulletList')
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('orderedList')
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('blockquote')
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>
          <div className="w-px h-6 bg-zinc-700 mx-1" />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowImageDialog(true)}
              className="p-2 rounded-lg transition-all text-zinc-400 hover:bg-zinc-800 hover:text-white"
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowGalleryDialog(true)}
              className="p-2 rounded-lg transition-all text-zinc-400 hover:bg-zinc-800 hover:text-white"
              title="Insert Image Gallery"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowVideoDialog(true)}
              className="p-2 rounded-lg transition-all text-zinc-400 hover:bg-zinc-800 hover:text-white"
              title="Insert Video"
            >
              <Film className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded-lg transition-all text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded-lg transition-all text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="bg-zinc-900">
          <EditorContent editor={editor} />
        </div>
        {showImageDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowImageDialog(false)}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-semibold text-white">Upload Image</h3>
              <ImageUploader label="Choose image" value="" onChange={handleImageUpload} bucketName="blog" />
              <button
                type="button"
                onClick={() => setShowImageDialog(false)}
                className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {showGalleryDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowGalleryDialog(false)}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-semibold text-white">Upload Image Gallery</h3>
              <ImageGalleryManager label="Choose images" images={[]} onChange={handleGalleryUpload} />
              <button
                type="button"
                onClick={() => setShowGalleryDialog(false)}
                className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {showVideoDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowVideoDialog(false)}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-semibold text-white">Insert Video</h3>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube or Vimeo URL"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleVideoInsert()}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleVideoInsert}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                >
                  Insert Video
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoDialog(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <style>{`
          .ProseMirror {
            outline: none;
          }
          .ProseMirror p {
            margin: 1em 0;
          }
          .ProseMirror h1 {
            font-size: 2.5em;
            font-weight: 700;
            margin: 1.5em 0 0.5em;
            line-height: 1.2;
          }
          .ProseMirror h2 {
            font-size: 2em;
            font-weight: 600;
            margin: 1.3em 0 0.5em;
            line-height: 1.3;
          }
          .ProseMirror h3 {
            font-size: 1.5em;
            font-weight: 600;
            margin: 1.2em 0 0.5em;
            line-height: 1.4;
          }
          .ProseMirror ul, .ProseMirror ol {
            margin: 1em 0;
            padding-left: 2em;
          }
          .ProseMirror li {
            margin: 0.5em 0;
          }
          .ProseMirror blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 1.5em;
            margin: 1.5em 0;
            font-style: italic;
            color: #a1a1aa;
          }
          .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            margin: 2em 0;
          }
          .ProseMirror code {
            background: #27272a;
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-size: 0.9em;
          }
          .ProseMirror pre {
            background: #18181b;
            padding: 1.5em;
            border-radius: 8px;
            margin: 1.5em 0;
            overflow-x: auto;
          }
          .ProseMirror pre code {
            background: transparent;
            padding: 0;
          }
          .ProseMirror iframe {
            border-radius: 12px;
          }
        `}</style>
      </div>
    </div>
  );
}

