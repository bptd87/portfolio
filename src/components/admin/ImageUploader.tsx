import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Plus, Trash2, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';
import { optimizeImage } from '../../utils/image-optimizer';
import { sanitizeFileName } from '../../utils/file-naming';
import { toast } from 'sonner';

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

// Exponential backoff retry helper
const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Upload attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Upload failed after retries');
};

export function ImageUploader({ value, onChange, label, bucketName = 'blog', className = '' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const uploadFile = async (file: File, isRetry: boolean = false) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errMsg = 'Please upload an image file';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    // Validate file size (max 10MB before optimization)
    if (file.size > 10 * 1024 * 1024) {
      const errMsg = 'Image must be less than 10MB';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(10);

    const toastId = toast.loading(
      isRetry ? `Retrying upload (attempt ${retryCount + 1}/3)...` : 'Optimizing image...'
    );

    try {
      // 1. Optimize Image
      setProgress(20);
      const optimizedFile = await optimizeImage(file, {
        maxWidth: 1920,
        quality: 0.8,
        format: 'image/webp' // Convert to WebP for better compression
      });
      setProgress(40);

      // 2. Try Direct Upload to Supabase Storage (Preferred) with retry
      setProgress(50);
      try {
        await retryWithBackoff(async () => {
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

          setProgress(90);
          onChange(urlData.publicUrl);
          setProgress(100);
        }, 3, 1000);

        toast.success('Image uploaded successfully!', { id: toastId });
        setRetryCount(0);
        setLastFile(null);
        return; // Success! Exit function.

      } catch (directError) {
        console.warn('Direct upload failed, trying server endpoint:', directError);
        // Fallthrough to server endpoint
      }

      // 3. Fallback: Server Endpoint (Legacy) with retry
      setProgress(50);
      const adminToken = sessionStorage.getItem('admin_token');
      if (!adminToken) throw new Error('Not authenticated - please login again');

      await retryWithBackoff(async () => {
        const formData = new FormData();
        formData.append('image', optimizedFile);
        formData.append('bucket', bucketName);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/upload`,
          {
            method: 'POST',
            headers: {
              'X-Admin-Token': adminToken,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          let errorMsg = 'Upload failed';
          try {
            const errorData = JSON.parse(errorText);
            errorMsg = errorData.error || errorMsg;
          } catch {
            errorMsg = errorText || errorMsg;
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        if (!data.url) throw new Error('No URL returned from server');

        setProgress(90);
        onChange(data.url);
        setProgress(100);
      }, 3, 1000);

      toast.success('Image uploaded successfully!', { id: toastId });
      setRetryCount(0);
      setLastFile(null);

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errMsg);
      setLastFile(file);
      setRetryCount(prev => prev + 1);
      toast.error(`Upload failed: ${errMsg}`, { id: toastId });
    } finally {
      setUploading(false);
      setProgress(0);
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
    setError(null);
    setRetryCount(0);
  };

  const handleRetry = async () => {
    if (!lastFile) return;
    setError(null);
    await uploadFile(lastFile, true);
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
        <>
          <label
            className={`block border-2 border-dashed transition-colors cursor-pointer w-full h-full min-h-[100px] flex flex-col justify-center ${isDragging
              ? 'border-accent-brand bg-accent-brand/5'
              : error ? 'border-destructive bg-destructive/5'
                : 'border-border hover:border-accent-brand'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center justify-center py-4 px-4">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-accent-brand mb-2 animate-spin" />
                  <p className="text-xs text-gray-400 mb-1">Uploading...</p>
                  <div className="w-24 h-1 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-brand transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="w-8 h-8 text-destructive mb-2" />
                  <p className="text-xs text-destructive mb-1 text-center font-medium">Upload Failed</p>
                  <p className="text-xs text-gray-400 text-center">{error}</p>
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
              disabled={uploading || !!error}
            />
          </label>

          {error && lastFile && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={uploading}
              className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent-brand hover:bg-accent-brand-light disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Upload {retryCount > 0 && `(${retryCount}/3)`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Gallery Manager for multiple images with captions
export function ImageGalleryManager({ label, images, onChange }: ImageGalleryManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatuses, setUploadStatuses] = useState<Record<string, 'uploading' | 'success' | 'error'>>({});

  // Refs for stable access in async callbacks to prevent stale closures
  const onChangeRef = useRef(onChange);
  const imagesRef = useRef(images);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Concurrent upload queue (max 3 at a time)
  const uploadWithQueue = async (files: File[], maxConcurrent: number = 3) => {
    const newImages = [...imagesRef.current];
    let successCount = 0;
    const adminToken = sessionStorage.getItem('admin_token');
    if (!adminToken) throw new Error('Not authenticated');

    const uploadPromises: Promise<void>[] = [];
    let fileIndex = 0;

    const uploadFile = async () => {
      while (fileIndex < files.length) {
        const currentIndex = fileIndex++;
        const file = files[currentIndex];
        const fileId = `${file.name}-${currentIndex}`;

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setUploadStatuses(prev => ({ ...prev, [fileId]: 'error' }));
          continue;
        }

        // Validate file size (max 10MB before optimization)
        if (file.size > 10 * 1024 * 1024) {
          setUploadStatuses(prev => ({ ...prev, [fileId]: 'error' }));
          continue;
        }

        setUploadStatuses(prev => ({ ...prev, [fileId]: 'uploading' }));
        setUploadProgress(prev => ({ ...prev, [fileId]: 10 }));

        try {
          // Optimize image before upload
          setUploadProgress(prev => ({ ...prev, [fileId]: 25 }));
          const optimizedFile = await optimizeImage(file, {
            maxWidth: 1920,
            quality: 0.8,
            format: 'image/webp'
          });

          setUploadProgress(prev => ({ ...prev, [fileId]: 50 }));

          // Upload with retry
          await retryWithBackoff(async () => {
            const formData = new FormData();
            formData.append('image', optimizedFile);
            formData.append('bucket', 'blog');

            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/upload`,
              {
                method: 'POST',
                headers: {
                  'X-Admin-Token': adminToken,
                },
                body: formData,
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText || 'Upload failed');
            }

            const data = await response.json();
            if (!data.url) throw new Error('No URL returned');
            return data.url;
          }, 2, 1000).then(url => {
            setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
            newImages.push({ url, caption: '', alt: '' });
            setUploadStatuses(prev => ({ ...prev, [fileId]: 'success' }));
            successCount++;
            toast.success(`Uploaded: ${file.name}`);
          });

        } catch (err) {
          setUploadStatuses(prev => ({ ...prev, [fileId]: 'error' }));
          const errMsg = err instanceof Error ? err.message : 'Upload failed';
          toast.error(`Failed: ${file.name} - ${errMsg}`);
          console.error(`Upload failed for ${file.name}:`, err);
        }
      }
    };

    // Start concurrent uploads
    for (let i = 0; i < Math.min(maxConcurrent, files.length); i++) {
      uploadPromises.push(uploadFile());
    }

    await Promise.all(uploadPromises);
    return { successCount, total: files.length };
  };

  const handleFileUpload = async (files: FileList) => {
    // Validate onChange function exists
    if (typeof onChangeRef.current !== 'function') {
      const errMsg = 'Configuration error: onChange callback is missing';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress({});
    setUploadStatuses({});
    const toastId = toast.loading(`Uploading ${files.length} image(s)...`);

    try {
      const { successCount, total } = await uploadWithQueue(Array.from(files), 3);

      if (successCount > 0) {
        // Use ref to call latest onChange
        onChangeRef.current(imagesRef.current);
        toast.success(`Successfully uploaded ${successCount} of ${total} images`, { id: toastId });
      } else {
        setError('No images were successfully uploaded');
        toast.error('No images were successfully uploaded', { id: toastId });
      }

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errMsg);
      toast.error(errMsg, { id: toastId });
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
              <div className="w-32 h-24 flex-shrink-0 border border-border bg-black/50 overflow-hidden rounded-md relative">
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

        {/* Upload New Image with Status Display */}
        <label className={`block border-2 border-dashed transition-all cursor-pointer rounded-lg ${uploading ? 'border-accent-brand bg-accent-brand/5' : 'border-border hover:border-accent-brand hover:bg-accent-brand/5'}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center justify-center py-8 px-4">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-accent-brand mb-2 animate-spin" />
                <p className="text-sm text-gray-400 mb-3">Uploading images... (up to 3 concurrent)</p>
                <div className="w-full space-y-2 max-w-xs">
                  {Object.entries(uploadStatuses).map(([fileId, status]) => (
                    <div key={fileId} className="flex items-center gap-2 text-xs">
                      {status === 'uploading' && (
                        <>
                          <div className="w-3 h-3 rounded-full bg-accent-brand animate-pulse" />
                          <span className="text-gray-400">{fileId.split('-')[0]}...</span>
                          <span className="text-gray-500">{uploadProgress[fileId] || 0}%</span>
                        </>
                      )}
                      {status === 'success' && (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="text-gray-400">{fileId.split('-')[0]}...</span>
                        </>
                      )}
                      {status === 'error' && (
                        <>
                          <AlertCircle className="w-3 h-3 text-destructive" />
                          <span className="text-gray-400">{fileId.split('-')[0]}...</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Plus className="w-8 h-8 text-accent-brand mb-2" />
                <p className="text-sm font-medium mb-1">Add Images</p>
                <p className="text-xs opacity-50">Bulk upload supported (up to 3 at a time)</p>
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
        <p className="text-destructive text-xs mt-2">⚠️ {error}</p>
      )}
    </div>
  );
}
