import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Quote, Code } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isInternalChange = useRef(false);
  const lastValue = useRef(value);

  // Only update innerHTML when value changes externally (not from user typing)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      // Only update if value actually changed from external source
      if (value !== lastValue.current) {
        editorRef.current.innerHTML = value || '';
        lastValue.current = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  // Set initial value on mount
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

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');

  const handleLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

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
      // If surroundContents fails, fall back to simple insertion
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
    } catch (e) {
      }
  };

  return (
    <div className={`border ${isFocused ? 'border-accent-brand' : 'border-border'} transition-colors`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-secondary/20">
        <button
          type="button"
          onClick={handleBold}
          className="p-2 hover:bg-secondary transition-colors rounded"
          title="Bold (Cmd/Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-2 hover:bg-secondary transition-colors rounded"
          title="Italic (Cmd/Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleUnderline}
          className="p-2 hover:bg-secondary transition-colors rounded"
          title="Underline (Cmd/Ctrl+U)"
        >
          <span className="text-sm font-bold underline">U</span>
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <button
          type="button"
          onClick={handleLink}
          className="p-2 hover:bg-secondary transition-colors rounded"
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <button
          type="button"
          onClick={handleUnorderedList}
          className="p-2 hover:bg-secondary transition-colors rounded"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleOrderedList}
          className="p-2 hover:bg-secondary transition-colors rounded"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <button
          type="button"
          onClick={handleBlockquote}
          className="p-2 hover:bg-secondary transition-colors rounded"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleCodeBlock}
          className="p-2 hover:bg-secondary transition-colors rounded"
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
        style={{
          textAlign: 'justify',
        }}
        data-placeholder={placeholder || 'Start writing...'}
        suppressContentEditableWarning
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(0, 0, 0, 0.3);
          pointer-events: none;
        }
        
        [contenteditable] {
          font-family: inherit;
          font-size: 15px;
          line-height: 1.6;
        }
        
        [contenteditable] p {
          text-align: justify;
          margin: 0.5em 0;
        }
        
        [contenteditable] strong {
          font-weight: 600;
          color: var(--accent-brand, #d97706);
        }
        
        [contenteditable] a {
          color: var(--accent-brand, #d97706);
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
          background: rgba(0, 0, 0, 0.05);
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
