import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';
import { optimizeImage } from '../../utils/image-optimizer';

interface ImageUploaderProps {
  value?: string; // Current image URL
  onChange: (url: string) => void;
  label: string;
  bucketName?: string;
}

interface ImageGalleryManagerProps {
  label: string;
  images: Array<{ url: string; caption?: string }>;
  onChange: (images: Array<{ url: string; caption?: string }>) => void;
}

export function ImageUploader({ value, onChange, label, bucketName = 'make-74296234-images' }: ImageUploaderProps) {
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
        const fileExt = optimizedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error: uploadError } = await supabase.storage
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
    <div>
      <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
        {label}
      </label>

      {value ? (
        <div className="relative border border-border overflow-hidden group w-full max-w-[320px] aspect-video rounded-lg">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-black/80 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          className={`block border-2 border-dashed transition-colors cursor-pointer ${
            isDragging 
              ? 'border-accent-brand bg-accent-brand/5' 
              : 'border-border hover:border-accent-brand'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-12 px-4">
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-accent-brand mb-3 animate-spin" />
                <p className="text-sm text-gray-400">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className={`w-10 h-10 mb-3 ${isDragging ? 'text-accent-brand scale-110' : 'text-accent-brand'} transition-transform`} />
                <p className="text-sm opacity-80 mb-1">{isDragging ? 'Drop image here' : 'Click to upload or drag & drop'}</p>
                <p className="text-xs opacity-50">PNG, JPG, WebP up to 5MB</p>
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
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) continue;

        const formData = new FormData();
        formData.append('image', file);

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
            newImages.push({ url: data.url, caption: '' });
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

  const updateImage = (index: number, updates: Partial<{ url: string; caption?: string }>) => {
    if (typeof onChange !== 'function') {
      return;
    }
    const newImages = [...images];
    newImages[index] = { ...newImages[index], ...updates };
    onChange(newImages);
  };

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
          <div key={index} className="border border-border p-4 space-y-3">
            <div className="flex gap-3">
              <img
                src={image.url}
                alt={image.caption || `Image ${index + 1}`}
                className="w-32 h-24 object-cover border border-border flex-shrink-0"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={image.url}
                  onChange={(e) => updateImage(index, { url: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm font-mono"
                  placeholder="Image URL"
                />
                <input
                  type="text"
                  value={image.caption || ''}
                  onChange={(e) => updateImage(index, { caption: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  placeholder="Caption (optional)"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 self-start opacity-60 hover:opacity-100 hover:text-destructive transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload New Image */}
        <label className="block border-2 border-dashed border-border hover:border-accent-brand transition-colors cursor-pointer">
          <div className="flex flex-col items-center justify-center py-8 px-4">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-accent-brand mb-2 animate-spin" />
                <p className="text-sm text-gray-400">Uploading {uploading ? 'images...' : '...'}</p>
              </>
            ) : (
              <>
                <Plus className="w-8 h-8 text-accent-brand mb-2" />
                <p className="text-sm opacity-80 mb-1">Add Images</p>
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
