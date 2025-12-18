import { useRef, useState, useEffect, useCallback } from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Code, Image as ImageIcon, Film, LayoutGrid } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { ImageGalleryManager } from './ImageUploader';

interface SimpleArticleEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SimpleArticleEditor({ value, onChange, placeholder }: SimpleArticleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const isInternalChange = useRef(false);
  const lastValue = useRef(value);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (value !== lastValue.current) {
        editorRef.current.innerHTML = value || '';
        lastValue.current = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
      lastValue.current = value;
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      isInternalChange.current = true;
      lastValue.current = newValue;
      onChange(newValue);
    }
  }, [onChange]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertHTML = (html: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      range.insertNode(fragment);
      handleInput();
      editorRef.current?.focus();
    }
  };

  const handleImageUpload = (url: string) => {
    insertHTML(`<img src="${url}" alt="" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0;" />`);
    setShowImageDialog(false);
  };

  const handleGalleryUpload = (images: Array<{ url: string; caption?: string; alt?: string }>) => {
    if (images.length === 0) return;
    const galleryHTML = `
      <div class="gallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5em 0;">
        ${images.map(img => `<img src="${img.url}" alt="${img.alt || ''}" style="width: 100%; height: auto; border-radius: 8px; object-fit: cover;" />`).join('')}
      </div>
    `;
    insertHTML(galleryHTML);
    setShowGalleryDialog(false);
  };

  const handleVideoInsert = () => {
    if (!videoUrl.trim()) return;
    
    // Convert YouTube/Vimeo URLs to embed format
    let embedUrl = videoUrl;
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    
    if (youtubeMatch) {
      embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    } else if (vimeoMatch) {
      embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    const videoHTML = `
      <div class="video-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5em 0; border-radius: 8px;">
        <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" frameborder="0" allowfullscreen></iframe>
      </div>
    `;
    insertHTML(videoHTML);
    setVideoUrl('');
    setShowVideoDialog(false);
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnorderedList = () => execCommand('insertUnorderedList');
  const handleOrderedList = () => execCommand('insertOrderedList');

  const handleBlockquote = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const blockquote = document.createElement('blockquote');
    blockquote.style.borderLeft = '3px solid currentColor';
    blockquote.style.paddingLeft = '12px';
    blockquote.style.fontStyle = 'italic';
    blockquote.style.opacity = '0.8';
    try {
      range.surroundContents(blockquote);
      handleInput();
    } catch (e) {
      execCommand('formatBlock', 'blockquote');
    }
  };

  const handleCodeBlock = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    pre.style.background = 'rgba(0, 0, 0, 0.05)';
    pre.style.padding = '12px';
    pre.style.borderRadius = '4px';
    pre.style.overflow = 'auto';
    pre.style.fontFamily = 'monospace';
    pre.style.fontSize = '14px';
    try {
      code.appendChild(range.extractContents());
      pre.appendChild(code);
      range.insertNode(pre);
      handleInput();
    } catch (e) {}
  };

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-zinc-700 bg-zinc-800 flex-wrap">
        <button
          type="button"
          onClick={handleBold}
          className="p-2 hover:bg-zinc-700 transition-colors rounded text-zinc-300 hover:text-white"
          title="Bold (Cmd/Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-2 hover:bg-zinc-700 transition-colors rounded text-zinc-300 hover:text-white"
          title="Italic (Cmd/Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        
        <button
          type="button"
          onClick={handleUnorderedList}
          className="p-2 hover:bg-zinc-700 transition-colors rounded text-zinc-300 hover:text-white"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleOrderedList}
          className="p-2 hover:bg-zinc-700 transition-colors rounded text-zinc-300 hover:text-white"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        
        <button
          type="button"
          onClick={handleBlockquote}
          className="p-2 hover:bg-zinc-700 transition-colors rounded text-zinc-300 hover:text-white"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleCodeBlock}
          className="p-2 hover:bg-zinc-700 transition-colors rounded text-zinc-300 hover:text-white"
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        
        <button
          type="button"
          onClick={() => setShowImageDialog(true)}
          className="p-2 hover:bg-zinc-700 transition-colors rounded text-zinc-300 hover:text-white"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowGalleryDialog(true)}
          className="p-2 hover:bg-zinc-700 transition-colors rounded text-zinc-300 hover:text-white"
          title="Insert Gallery"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowVideoDialog(true)}
          className="p-2 hover:bg-zinc-700 transition-colors rounded text-zinc-300 hover:text-white"
          title="Insert Video"
        >
          <Film className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] p-6 focus:outline-none text-zinc-200"
        style={{
          fontSize: '15px',
          lineHeight: '1.7',
        }}
        data-placeholder={placeholder || 'Start writing your article...'}
        suppressContentEditableWarning
      />

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Insert Image</h3>
            <ImageUploader
              label=""
              value=""
              onChange={handleImageUpload}
              bucketName="blog"
            />
            <button
              type="button"
              onClick={() => setShowImageDialog(false)}
              className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gallery Dialog */}
      {showGalleryDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-white">Insert Gallery</h3>
            <ImageGalleryManager
              label="Select Images for Gallery"
              images={[]}
              onChange={(urls) => handleGalleryUpload(urls)}
            />
            <button
              type="button"
              onClick={() => setShowGalleryDialog(false)}
              className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Video Dialog */}
      {showVideoDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Insert Video</h3>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube or Vimeo URL..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-blue-500 focus:outline-none text-white mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleVideoInsert}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                Insert Video
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVideoDialog(false);
                  setVideoUrl('');
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #71717a;
          pointer-events: none;
        }
        
        [contenteditable] p {
          margin: 0.75em 0;
        }
        
        [contenteditable] strong {
          font-weight: 600;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        [contenteditable] blockquote {
          border-left: 3px solid currentColor;
          padding-left: 12px;
          font-style: italic;
          opacity: 0.8;
          margin: 1em 0;
        }
        
        [contenteditable] pre {
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 4px;
          overflow: auto;
          margin: 1em 0;
        }
        
        [contenteditable] code {
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

