import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Move, RotateCcw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { optimizeImage } from '../../utils/image-optimizer';
import { createClient } from '../../utils/supabase/client';
import { sanitizeFileName } from '../../utils/file-naming';
import { toast } from 'sonner';

interface ImageUploaderWithFocalPointProps {
  value?: string;
  focalPoint?: { x: number; y: number };
  onChange: (url: string, focalPoint?: { x: number; y: number }) => void;
  label: string;
  bucketName?: string;
}

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
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Upload failed after retries');
};

export function ImageUploaderWithFocalPoint({
  value,
  focalPoint = { x: 50, y: 50 },
  onChange,
  label,
  bucketName = 'blog'
}: ImageUploaderWithFocalPointProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [localFocalPoint, setLocalFocalPoint] = useState(focalPoint);
  const [isSettingFocalPoint, setIsSettingFocalPoint] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const uploadFile = async (file: File, isRetry: boolean = false) => {

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
    setProgress(10);

    const toastId = toast.loading(
      isRetry ? `Retrying upload (attempt ${retryCount + 1}/3)...` : 'Optimizing image...'
    );

    try {
      setProgress(25);
      const optimizedFile = await optimizeImage(file, {
        maxWidth: 1920,
        quality: 0.8,
        format: 'image/webp'
      });
      setProgress(45);

      // Try direct upload first
      try {
        await retryWithBackoff(async () => {
          const supabase = createClient();
          const fileName = sanitizeFileName(optimizedFile.name);
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, optimizedFile);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

          setProgress(90);
          onChange(urlData.publicUrl, localFocalPoint);
          setProgress(100);
        }, 3, 1000);

        toast.success('Image uploaded successfully!', { id: toastId });
        setRetryCount(0);
        setLastFile(null);
        return;
      } catch (directError) {
        console.warn('Direct upload failed:', directError);
        throw directError;
      }
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

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isSettingFocalPoint || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newFocalPoint = { x: Math.round(x), y: Math.round(y) };
    setLocalFocalPoint(newFocalPoint);
    onChange(value!, newFocalPoint);
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
    setLocalFocalPoint({ x: 50, y: 50 });
  };

  const handleRetry = async () => {
    if (!lastFile) return;
    setError(null);
    await uploadFile(lastFile, true);
  };

  const updateFocalPoint = (next: { x: number; y: number }) => {
    const clamped = {
      x: Math.max(0, Math.min(100, Math.round(next.x))),
      y: Math.max(0, Math.min(100, Math.round(next.y))),
    };
    setLocalFocalPoint(clamped);
    if (value) {
      onChange(value, clamped);
    }
  };

  return (
    <div>
      <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
        {label}
      </label>

      {value ? (
        <div className="space-y-3">
          <div className="relative border border-border overflow-hidden group">
            <img
              ref={imageRef}
              src={value}
              alt="Preview"
              className={`w-full transition-all duration-300 ${isSettingFocalPoint
                ? 'h-auto max-h-[600px] object-contain cursor-crosshair bg-black/50'
                : 'h-48 object-cover'
                }`}
              onClick={handleImageClick}
              style={{
                objectPosition: `${localFocalPoint.x}% ${localFocalPoint.y}%`
              }}
            />

            {/* Focal Point Indicator - Only show if we can calculate position relative to image */}
            {isSettingFocalPoint && (
              <div
                className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-white bg-accent-brand shadow-[0_0_10px_rgba(0,0,0,0.5)] rounded-full pointer-events-none z-10 box-border"
                style={{
                  left: `${localFocalPoint.x}%`,
                  top: `${localFocalPoint.y}%`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-black/80 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100"
              title="Remove image"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSettingFocalPoint(!isSettingFocalPoint)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border transition-colors ${isSettingFocalPoint
                ? 'border-accent-brand bg-accent-brand/10 text-accent-brand'
                : 'border-border hover:border-accent-brand'
                }`}
            >
              <Move className="w-4 h-4" />
              {isSettingFocalPoint ? 'Click image to set focal point' : 'Set Focal Point (Expand Image)'}
            </button>

            <span className="text-xs opacity-50">
              Current: {localFocalPoint.x}%, {localFocalPoint.y}%
            </span>

            <button
              type="button"
              onClick={() => updateFocalPoint({ x: 50, y: 50 })}
              className="flex items-center gap-2 px-3 py-2 text-xs border border-border hover:border-accent-brand transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 max-w-xs">
            <label className="text-[11px] opacity-60">
              X (%):
              <input
                type="number"
                min={0}
                max={100}
                value={localFocalPoint.x}
                onChange={(e) => updateFocalPoint({ x: Number(e.target.value), y: localFocalPoint.y })}
                className="mt-1 w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs"
              />
            </label>
            <label className="text-[11px] opacity-60">
              Y (%):
              <input
                type="number"
                min={0}
                max={100}
                value={localFocalPoint.y}
                onChange={(e) => updateFocalPoint({ x: localFocalPoint.x, y: Number(e.target.value) })}
                className="mt-1 w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs"
              />
            </label>
          </div>

          <p className="text-xs opacity-50">
            The focal point determines which part of the image stays centered when cropped on different screen sizes.
          </p>
        </div>
      ) : (
        <label
          className={`block border-2 border-dashed transition-colors cursor-pointer ${isDragging ? 'border-accent-brand bg-accent-brand/5' : 'border-border hover:border-accent-brand'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-12 px-4">
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-accent-brand mb-3 animate-spin" />
                <p className="text-sm opacity-60">Uploading... {progress > 0 ? `${progress}%` : ''}</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-accent-brand mb-3" />
                <p className="text-sm opacity-80 mb-1">Click or drag to upload image</p>
                <p className="text-xs opacity-50">PNG, JPG, WebP up to 10MB</p>
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
        <div className="mt-2 space-y-2">
          <p className="text-destructive text-xs">{error}</p>
          {lastFile && (
            <button
              type="button"
              onClick={handleRetry}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Retry upload
            </button>
          )}
        </div>
      )}
    </div>
  );
}
