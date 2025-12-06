import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Heading1, Heading2, Heading3, Underline } from 'lucide-react';

interface UnifiedTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function UnifiedTextEditor({ value, onChange, placeholder, autoFocus }: UnifiedTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isInternalChange = useRef(false);
  const lastValue = useRef(value);

  // Only update innerHTML when value changes externally (not from user typing)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
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

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

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

  const handleHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          handleBold();
          break;
        case 'i':
          e.preventDefault();
          handleItalic();
          break;
        case 'u':
          e.preventDefault();
          handleUnderline();
          break;
        case 'k':
          e.preventDefault();
          handleLink();
          break;
      }
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${isFocused ? 'border-accent-brand ring-1 ring-accent-brand/20' : 'border-border'}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-secondary/10 flex-wrap">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={handleBold}
          className="p-2 hover:bg-accent-brand/20 transition-colors rounded"
          title="Bold (Ctrl/Cmd+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-2 hover:bg-accent-brand/20 transition-colors rounded"
          title="Italic (Ctrl/Cmd+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleUnderline}
          className="p-2 hover:bg-accent-brand/20 transition-colors rounded"
          title="Underline (Ctrl/Cmd+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Headings */}
        <button
          type="button"
          onClick={() => handleHeading(1)}
          className="p-2 hover:bg-accent-brand/20 transition-colors rounded"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleHeading(2)}
          className="p-2 hover:bg-accent-brand/20 transition-colors rounded"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleHeading(3)}
          className="p-2 hover:bg-accent-brand/20 transition-colors rounded"
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Lists */}
        <button
          type="button"
          onClick={handleUnorderedList}
          className="p-2 hover:bg-accent-brand/20 transition-colors rounded"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleOrderedList}
          className="p-2 hover:bg-accent-brand/20 transition-colors rounded"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Link */}
        <button
          type="button"
          onClick={handleLink}
          className="p-2 hover:bg-accent-brand/20 transition-colors rounded"
          title="Insert Link (Ctrl/Cmd+K)"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] max-h-[500px] overflow-y-auto p-4 focus:outline-none prose prose-invert max-w-none"
        style={{
          lineHeight: '1.6',
        }}
        data-placeholder={placeholder}
      />
      
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
        }
        
        /* Style the contenteditable area */
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        [contenteditable] li {
          margin: 0.5em 0;
        }
        
        [contenteditable] a {
          color: rgb(var(--accent-brand));
          text-decoration: underline;
        }
        
        [contenteditable] p {
          margin: 1em 0;
        }
        
        [contenteditable] strong {
          font-weight: 600;
        }
        
        [contenteditable] em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
