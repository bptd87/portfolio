import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Plus, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';
import { optimizeImage } from '../../utils/image-optimizer';
import { sanitizeFileName } from '../../utils/file-naming';

interface ImageUploaderProps {
  value?: string; // Current image URL
  onChange: (url: string) => void;
  label: string;
  bucketName?: string;
  className?: string;
}

interface ImageGalleryManagerProps {
  label: string;
  images: Array<{ url: string; caption?: string; alt?: string }>;
  onChange: (images: Array<{ url: string; caption?: string; alt?: string }>) => void;
}

export function ImageUploader({ value, onChange, label, bucketName = 'make-74296234-images', className = '' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB before optimization)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // 1. Optimize Image
      const optimizedFile = await optimizeImage(file, {
        maxWidth: 1920,
        quality: 0.8,
        format: 'image/webp' // Convert to WebP for better compression
      });

      // 2. Try Direct Upload to Supabase Storage (Preferred)
      try {
        const supabase = createClient();
        // Use sanitized original filename
        const fileName = sanitizeFileName(optimizedFile.name);
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, optimizedFile);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        onChange(urlData.publicUrl);
        return; // Success! Exit function.

      } catch (directError) {
        // Fallthrough to server endpoint
      }

      // 3. Fallback: Server Endpoint (Legacy)
      const adminToken = sessionStorage.getItem('admin_token');
      if (!adminToken) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('image', optimizedFile);
      // Note: Server endpoint might ignore bucketName, but we send it anyway just in case
      formData.append('bucket', bucketName);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.url);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={className}>
      <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
        {label}
      </label>

      {value ? (
        <div className="relative border border-border overflow-hidden group w-full h-full rounded-lg">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-black/80 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100 rounded-full"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          className={`block border-2 border-dashed transition-colors cursor-pointer w-full h-full min-h-[100px] flex flex-col justify-center ${isDragging
            ? 'border-accent-brand bg-accent-brand/5'
            : 'border-border hover:border-accent-brand'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-4 px-4">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-accent-brand mb-2 animate-spin" />
                <p className="text-xs text-gray-400">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-accent-brand scale-110' : 'text-accent-brand'} transition-transform`} />
                <p className="text-xs opacity-80 mb-1 text-center">{isDragging ? 'Drop' : 'Click/Drop'}</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}

      {error && (
        <p className="text-destructive text-xs mt-2">{error}</p>
      )}
    </div>
  );
}

// Gallery Manager for multiple images with captions
// Gallery Manager for multiple images with captions
export function ImageGalleryManager({ label, images, onChange }: ImageGalleryManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for stable access in async callbacks to prevent stale closures
  const onChangeRef = useRef(onChange);
  const imagesRef = useRef(images);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const handleFileUpload = async (files: FileList) => {
    // Validate onChange function exists
    if (typeof onChangeRef.current !== 'function') {
      setError('Configuration error: onChange callback is missing');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const adminToken = sessionStorage.getItem('admin_token');
      if (!adminToken) throw new Error('Not authenticated');

      // Use ref to get latest images
      const newImages = [...imagesRef.current];
      let successCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) continue;
        // Validate file size (max 10MB before optimization)
        if (file.size > 10 * 1024 * 1024) continue;

        // Optimize image before upload
        const optimizedFile = await optimizeImage(file, {
          maxWidth: 1920,
          quality: 0.8,
          format: 'image/webp'
        });

        const formData = new FormData();
        formData.append('image', optimizedFile);

        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/upload`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                // Token in Authorization header
              },
              body: formData,
            }
          );

          const data = await response.json();
          if (data.success && data.url) {
            newImages.push({ url: data.url, caption: '', alt: '' });
            successCount++;
          }
        } catch (err) {
        }
      }

      if (successCount > 0) {
        // Use ref to call latest onChange
        onChangeRef.current(newImages);
      } else {
        setError('No images were successfully uploaded');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await handleFileUpload(files);
  };

  // Safe update helper
  const updateImage = (index: number, updates: Partial<{ url: string; caption?: string; alt?: string }>) => {
    if (typeof onChange !== 'function') {
      return;
    }
    const newImages = [...images];
    // Ensure object exists and merge updates safely
    newImages[index] = { ...newImages[index], ...updates };
    onChange(newImages);
  };

  // Safe remove helper
  const removeImage = (index: number) => {
    if (typeof onChange !== 'function') {
      return;
    }
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">
        {label}
      </label>

      <div className="space-y-3">
        {images.map((image, index) => (
          <div key={index} className="border border-border p-4 space-y-3 bg-secondary/10 rounded-lg">
            <div className="flex gap-4 items-start">
              <div className="w-32 h-24 flex-shrink-0 border border-border bg-black/50 overflow-hidden rounded-md">
                <img
                  src={image.url}
                  alt={image.caption || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={image.url}
                  onChange={(e) => updateImage(index, { url: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-xs font-mono rounded"
                  placeholder="Image URL"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => updateImage(index, { caption: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm rounded"
                    placeholder="Caption (Public)"
                  />
                  <div className="relative">
                    <input
                      type="text"
                      value={image.alt || ''}
                      onChange={(e) => updateImage(index, { alt: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm rounded border-dashed text-gray-400 focus:text-white"
                      placeholder="Alt Text (SEO)"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 text-gray-500 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload New Image */}
        <label className="block border-2 border-dashed border-border hover:border-accent-brand hover:bg-accent-brand/5 transition-all cursor-pointer rounded-lg">
          <div className="flex flex-col items-center justify-center py-8 px-4">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-accent-brand mb-2 animate-spin" />
                <p className="text-sm text-gray-400">Uploading {uploading ? 'images...' : '...'}</p>
              </>
            ) : (
              <>
                <Plus className="w-8 h-8 text-accent-brand mb-2" />
                <p className="text-sm font-medium mb-1">Add Images</p>
                <p className="text-xs opacity-50">Bulk upload supported</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <p className="text-destructive text-xs mt-2">{error}</p>
      )}
    </div>
  );
}
