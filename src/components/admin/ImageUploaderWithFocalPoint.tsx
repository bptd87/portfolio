import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Move } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ImageUploaderWithFocalPointProps {
  value?: string;
  focalPoint?: { x: number; y: number };
  onChange: (url: string, focalPoint?: { x: number; y: number }) => void;
  label: string;
}

export function ImageUploaderWithFocalPoint({ 
  value, 
  focalPoint = { x: 50, y: 50 }, 
  onChange, 
  label 
}: ImageUploaderWithFocalPointProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localFocalPoint, setLocalFocalPoint] = useState(focalPoint);
  const [isSettingFocalPoint, setIsSettingFocalPoint] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Get admin token from sessionStorage
      const adminToken = sessionStorage.getItem('admin_token');
      
      if (!adminToken) {
        throw new Error('Not authenticated - Please log out and log back in to the admin panel');
      }

      // Upload to Supabase Storage via server endpoint
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': adminToken,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Upload failed');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      onChange(data.url, localFocalPoint);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
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
    setLocalFocalPoint({ x: 50, y: 50 });
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
              className={`w-full h-48 object-cover ${isSettingFocalPoint ? 'cursor-crosshair' : ''}`}
              onClick={handleImageClick}
              style={{
                objectPosition: `${localFocalPoint.x}% ${localFocalPoint.y}%`
              }}
            />
            
            {/* Focal Point Indicator */}
            {isSettingFocalPoint && (
              <div 
                className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-accent-brand bg-accent-brand/20 rounded-full pointer-events-none"
                style={{
                  left: `${localFocalPoint.x}%`,
                  top: `${localFocalPoint.y}%`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-accent-brand rounded-full" />
                </div>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-black/80 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSettingFocalPoint(!isSettingFocalPoint)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border transition-colors ${
                isSettingFocalPoint 
                  ? 'border-accent-brand bg-accent-brand/10 text-accent-brand' 
                  : 'border-border hover:border-accent-brand'
              }`}
            >
              <Move className="w-4 h-4" />
              {isSettingFocalPoint ? 'Click image to set focal point' : 'Set Focal Point'}
            </button>
            
            <span className="text-xs opacity-50">
              Current: {localFocalPoint.x}%, {localFocalPoint.y}%
            </span>
          </div>

          <p className="text-xs opacity-50">
            The focal point determines which part of the image stays centered when cropped on different screen sizes.
          </p>
        </div>
      ) : (
        <label className="block border-2 border-dashed border-border hover:border-accent-brand transition-colors cursor-pointer">
          <div className="flex flex-col items-center justify-center py-12 px-4">
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-accent-brand mb-3 animate-spin" />
                <p className="text-sm opacity-60">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-accent-brand mb-3" />
                <p className="text-sm opacity-80 mb-1">Click to upload image</p>
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