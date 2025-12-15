import React from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { Plus, X, Upload, Wand2, GripVertical, Loader2 } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';
import { optimizeImage } from '../../utils/image-optimizer';
import { sanitizeFileName } from '../../utils/file-naming';
import { analyzeImage, getAIKey } from '../../utils/ai-service';
import { toast } from 'sonner';

// Simple URL list manager with captions AND upload
interface GalleryEditorProps {
  label: string;
  images: string[];
  captions: string[];
  altTexts?: string[]; // New optional prop
  projectContext?: string; // New: context for AI
  onChange: (images: string[], captions: string[], altTexts?: string[]) => void;
  currentCover?: string;
  onSetCover?: (url: string) => void;
}

interface GalleryItemProps {
  item: any;
  index: number;
  currentCover?: string;
  analyzingIndex: number | null;
  uploading: number | null;
  onUpdateImage: (index: number, value: string) => void;
  onUpdateCaption: (index: number, value: string) => void;
  onUpdateAltText: (index: number, value: string) => void;
  onGenerateAltText: (index: number, url: string) => void;
  onFileUpload: (index: number, file: File) => void;
  onSetCover?: (url: string) => void;
  onRemove: (index: number) => void;
}

function GalleryItem({
  item,
  index,
  currentCover,
  analyzingIndex,
  uploading,
  onUpdateImage,
  onUpdateCaption,
  onUpdateAltText,
  onGenerateAltText,
  onFileUpload,
  onSetCover,
  onRemove
}: GalleryItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      id={item.url}
      dragListener={false}
      dragControls={dragControls}
      className="relative"
    >
      <div className="flex items-center gap-3 border border-border p-3 bg-card/50">

        {/* Drag Handle */}
        <div
          className="cursor-move p-2 opacity-50 hover:opacity-100 touch-none"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Thumbnail preview */}
        <div className="w-20 h-20 flex-shrink-0 bg-black/5 dark:bg-white/5 border border-border overflow-hidden relative">
          {item.url ? (
            <>
              <img
                src={item.url}
                alt="Preview"
                className="w-full h-full object-cover"
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {currentCover === item.url && (
                <div className="absolute top-0 right-0 bg-accent-brand text-white px-1 text-[10px] tracking-wider uppercase z-10">
                  COVER
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs opacity-30">
              No image
            </div>
          )}
        </div>

        {/* Input and controls */}
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            value={item.url}
            onChange={(e) => onUpdateImage(index, e.target.value)}
            placeholder="Image URL"
            className="w-full px-3 py-1.5 bg-background border border-border focus:border-accent-brand focus:outline-none text-xs"
          />

          <div className="flex gap-2">
            <input
              type="text"
              value={item.caption}
              onChange={(e) => onUpdateCaption(index, e.target.value)}
              placeholder="Caption (Public Visible)"
              className="flex-1 px-3 py-1.5 bg-background border border-border focus:border-accent-brand focus:outline-none text-xs"
            />

            <div className="flex-1 flex items-center gap-1">
              <input
                type="text"
                value={item.alt}
                onChange={(e) => onUpdateAltText(index, e.target.value)}
                placeholder="Alt Text (SEO Hidden)"
                className="w-full px-3 py-1.5 bg-background border border-border border-dashed focus:border-accent-brand focus:outline-none text-xs text-muted-foreground"
              />

              {/* AI Button - Flex Item */}
              <button
                type="button"
                onClick={() => onGenerateAltText(index, item.url)}
                disabled={analyzingIndex === index || !item.url}
                className="p-1.5 border border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors disabled:opacity-30 h-full flex items-center justify-center bg-purple-500/5"
                title="Generate Alt Text with AI"
              >
                {analyzingIndex === index ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Upload button */}
          <div className="relative z-10">
            <input
              type="file"
              accept="image/*"
              aria-label="Upload image"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(index, file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={uploading === index}
            />
            <button
              type="button"
              disabled={uploading === index}
              className="relative p-2 bg-accent-brand/10 border border-accent-brand/20 text-accent-brand hover:bg-accent-brand/20 transition-colors disabled:opacity-50"
              title="Upload image"
            >
              <Upload className="w-3 h-3" />
            </button>
          </div>

          {/* Set as Cover button */}
          {onSetCover && item.url && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSetCover(item.url);
              }}
              disabled={currentCover === item.url}
              title={currentCover === item.url ? 'Current cover' : 'Set as cover'}
              className="relative z-20 px-2 py-2 border border-border hover:border-accent-brand hover:text-accent-brand transition-colors text-[10px] tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {currentCover === item.url ? '✓' : 'CVR'}
            </button>
          )}

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="relative z-20 p-2 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
            title="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}


export function GalleryEditor({ label, images, captions, altTexts = [], onChange, currentCover, onSetCover, projectContext }: GalleryEditorProps) {
  const [uploading, setUploading] = React.useState<number | null>(null);
  const [bulkUploading, setBulkUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [analyzingIndex, setAnalyzingIndex] = React.useState<number | null>(null);

  // Combine arrays into objects for Reorder to work smoothly
  const [items, setItems] = React.useState<any[]>([]);

  // Sync props to items state ONLY when significant changes occur (length change or key mismatch)
  // This prevents the parent's rapid re-renders from killing the drag state.
  React.useEffect(() => {
    // Check if items actually need update to avoid resetting drag state
    const currentUrls = items.map(i => i.url).join(',');
    const newUrls = images.join(',');

    // Also check captions/altTexts changes basically (simple check)
    // If length is different, definitely update.
    if (items.length !== images.length || currentUrls !== newUrls) {
      const newItems = images.map((url, i) => ({
        id: url || `empty-${i}-${Date.now()}`, // Fallback ID if URL empty
        url,
        caption: captions[i] || '',
        alt: altTexts[i] || '',
        key: `${url}-${i}` // Stable key
      }));
      setItems(newItems);
    }
  }, [images, captions, altTexts, items.length]);

  const handleReorder = (newItems: any[]) => {
    // 1. Update local state immediately for smooth UI
    setItems(newItems);

    // 2. Propagate to parent
    onChange(
      newItems.map(i => i.url),
      newItems.map(i => i.caption),
      newItems.map(i => i.alt)
    );
  };

  const uploadImageToBucket = async (file: File, bucket: string = 'projects') => {
    try {
      // Optimize
      const optimized = await optimizeImage(file, { maxWidth: 1920, quality: 0.8, format: 'image/webp' });

      // Direct Upload
      const supabase = createClient();
      const fileName = sanitizeFileName(optimized.name);

      const { error } = await supabase.storage.from(bucket).upload(fileName, optimized);
      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      // Fallback
      const token = sessionStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('image', file);
      formData.append('bucket', bucket);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success && data.url) return data.url;
      throw new Error(data.error || 'Upload failed');
    }
  };

  const addImage = () => {
    // Add to parent, useEffect will sync
    onChange([...images, ''], [...captions, ''], [...altTexts, '']);
  };

  const removeImage = (index: number) => {
    onChange(
      images.filter((_, i) => i !== index),
      captions.filter((_, i) => i !== index),
      altTexts.filter((_, i) => i !== index)
    );
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    onChange(newImages, captions, altTexts);
  };

  const updateCaption = (index: number, value: string) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;

    // Optimistic local update
    const newItems = [...items];
    if (newItems[index]) newItems[index].caption = value;
    setItems(newItems);

    onChange(images, newCaptions, altTexts);
  };

  const updateAltText = (index: number, value: string) => {
    const newAltTexts = [...altTexts];
    while (newAltTexts.length <= index) newAltTexts.push('');
    newAltTexts[index] = value;

    // Optimistic local update
    const newItems = [...items];
    if (newItems[index]) newItems[index].alt = value;
    setItems(newItems);

    onChange(images, captions, newAltTexts);
  };

  const generateAltText = async (index: number, url: string) => {
    console.log('✨ Magic Wand Clicked!', index, url);
    setAnalyzingIndex(index);
    try {
      const key = getAIKey();

      // If no key and we are local, prompt for it?
      // For now, rely on server if no key

      if (!key) {
        console.log('No local AI key, trying server proxy...');
        const token = sessionStorage.getItem('admin_token');
        if (!token) throw new Error('No API Key or Auth Token');

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/ai/analyze-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            imageUrl: url,
            context: projectContext
          })
        });

        const data = await response.json();
        if (data.success && data.result) {
          updateAltText(index, data.result.altText || data.result.caption);
          toast.success('Generated Alt Text!');
        } else {
          console.error('Server AI Error:', data);
          throw new Error(data.error || 'Failed to generate');
        }
        return;
      }

      // Client side AI
      console.log('Using local AI key...');
      const result = await analyzeImage(url, key, projectContext);
      updateAltText(index, result.altText || result.caption);
      toast.success('Generated Alt Text!');

    } catch (err) {
      toast.error('Failed to generate Alt Text');
      console.error(err);
    } finally {
      setAnalyzingIndex(null);
    }
  };

  const handleFileUpload = async (index: number, file: File) => {
    setUploading(index);
    try {
      const url = await uploadImageToBucket(file, 'projects');
      updateImage(index, url);
      if (onSetCover && index === 0) {
        onSetCover(url);
      }
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploading(null);
    }
  };

  const handleBulkUpload = async (files: FileList) => {
    setBulkUploading(true);
    const newImages = [...images];
    const newCaptions = [...captions];
    const newAltTexts = [...altTexts];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const url = await uploadImageToBucket(file, 'projects');
          newImages.push(url);
          newCaptions.push('');
          newAltTexts.push('');
        } catch (err) {
          console.error(err);
        }
      }

      onChange(newImages, newCaptions, newAltTexts);
    } catch (err) {
      alert('Some uploads failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setBulkUploading(false);
    }
  };

  // Drag and drop handlers (for file upload zone)
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        const fileList = new DataTransfer();
        imageFiles.forEach(file => fileList.items.add(file));
        await handleBulkUpload(fileList.files);
      }
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative ${isDragging ? 'ring-2 ring-accent-brand ring-offset-2' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <label className="block text-xs tracking-wider uppercase opacity-60">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {/* Bulk upload button */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              aria-label="Bulk upload images"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) handleBulkUpload(files);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={bulkUploading}
            />
            <button
              type="button"
              disabled={bulkUploading}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-accent-brand/10 border border-accent-brand/20 text-accent-brand hover:bg-accent-brand/20 transition-colors tracking-wider uppercase disabled:opacity-50"
            >
              <Upload className="w-3 h-3" />
              {bulkUploading ? 'Uploading...' : 'Bulk Upload'}
            </button>
          </div>

          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-1 px-2 py-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            <Plus className="w-3 h-3" />
            Add Image
          </button>
        </div>
      </div>

      <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3">
        {items.map((item, index) => (
          <GalleryItem
            key={item.key}
            item={item}
            index={index}
            currentCover={currentCover}
            analyzingIndex={analyzingIndex}
            uploading={uploading}
            onUpdateImage={updateImage}
            onUpdateCaption={updateCaption}
            onUpdateAltText={updateAltText}
            onGenerateAltText={generateAltText}
            onFileUpload={handleFileUpload}
            onSetCover={onSetCover}
            onRemove={removeImage}
          />
        ))}
      </Reorder.Group>

      {
        items.length === 0 && (
          <div className={`border-2 border-dashed ${isDragging ? 'border-accent-brand bg-accent-brand/5' : 'border-border'} p-12 text-center transition-colors`}>
            <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? 'text-accent-brand' : 'opacity-30'}`} />
            <p className="text-sm tracking-wider uppercase opacity-60 mb-1">
              {isDragging ? 'Drop images here' : 'Drag & Drop Images'}
            </p>
            <p className="text-xs opacity-40">
              or click "Bulk Upload" above
            </p>
          </div>
        )
      }
    </div >
  );
}

// Design Notes editor (array of paragraphs)
interface DesignNotesEditorProps {
  notes: string[];
  onChange: (notes: string[]) => void;
}

export function DesignNotesEditor({ notes, onChange }: DesignNotesEditorProps) {
  const addNote = () => {
    onChange([...notes, '']);
  };

  const removeNote = (index: number) => {
    onChange(notes.filter((_, i) => i !== index));
  };

  const updateNote = (index: number, value: string) => {
    const newNotes = [...notes];
    newNotes[index] = value;
    onChange(newNotes);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-xs tracking-wider uppercase opacity-60">
          Design Notes
        </label>
        <button
          type="button"
          onClick={addNote}
          className="flex items-center gap-1 px-2 py-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
        >
          <Plus className="w-3 h-3" />
          Add Paragraph
        </button>
      </div>
      <div className="space-y-3">
        {notes.map((note, index) => (
          <div key={index} className="flex items-start gap-2">
            <textarea
              value={note}
              onChange={(e) => updateNote(index, e.target.value)}
              placeholder="Design note paragraph..."
              rows={3}
              className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm resize-none"
            />
            <button
              type="button"
              onClick={() => removeNote(index)}
              aria-label="Remove note"
              className="p-1.5 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-xs opacity-40 text-center py-4">No design notes yet</p>
        )}
      </div>
    </div>
  );
}

// Collaborators editor
interface CollaboratorsEditorProps {
  collaborators: Array<{ name: string; role: string }>;
  onChange: (collaborators: Array<{ name: string; role: string }>) => void;
}

export function CollaboratorsEditor({ collaborators, onChange }: CollaboratorsEditorProps) {
  const addCollaborator = () => {
    onChange([...collaborators, { name: '', role: '' }]);
  };

  const removeCollaborator = (index: number) => {
    onChange(collaborators.filter((_, i) => i !== index));
  };

  const updateCollaborator = (index: number, field: 'name' | 'role', value: string) => {
    const newCollaborators = [...collaborators];
    newCollaborators[index][field] = value;
    onChange(newCollaborators);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-xs tracking-wider uppercase opacity-60">
          Creative Team / Credits
        </label>
        <button
          type="button"
          onClick={addCollaborator}
          className="flex items-center gap-1 px-2 py-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
        >
          <Plus className="w-3 h-3" />
          Add Person
        </button>
      </div>
      <div className="space-y-3">
        {collaborators.map((collab, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={collab.name}
              onChange={(e) => updateCollaborator(index, 'name', e.target.value)}
              placeholder="Name"
              className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
            />
            <input
              type="text"
              value={collab.role}
              onChange={(e) => updateCollaborator(index, 'role', e.target.value)}
              placeholder="Role"
              className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
            />
            <button
              type="button"
              onClick={() => removeCollaborator(index)}
              aria-label="Remove collaborator"
              className="p-1.5 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {collaborators.length === 0 && (
          <p className="text-xs opacity-40 text-center py-4">No collaborators yet</p>
        )}
      </div>
    </div>
  );
}

// Tags editor
interface TagsEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagsEditor({ tags, onChange }: TagsEditorProps) {
  const [inputValue, setInputValue] = React.useState('');

  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onChange([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <label className="block text-xs tracking-wider uppercase opacity-60 mb-3">
        Tags
      </label>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add tag and press Enter..."
            className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={addTag}
            aria-label="Add tag"
            className="px-4 py-2 border border-border hover:border-accent-brand text-xs tracking-wider uppercase opacity-60 hover:opacity-100 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 border border-border bg-background/50 group"
              >
                <span className="text-xs tracking-wider uppercase opacity-80">{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  aria-label="Remove tag"
                  className="opacity-40 hover:opacity-100 hover:text-destructive transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
