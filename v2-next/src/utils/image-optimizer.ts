/**
 * Client-side image optimization utility
 * Resizes and compresses images before upload to save bandwidth and storage.
 */

interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
  format?: 'image/jpeg' | 'image/webp';
}

export async function optimizeImage(file: File, options: OptimizationOptions = {}): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;

  // Skip optimization for small files or non-images
  if (file.size < 500 * 1024 && file.type === format) return file; // Skip if < 500KB and same format
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      // Draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Better quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Image compression failed'));
            return;
          }

          // Create new file
          const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + (format === 'image/webp' ? '.webp' : '.jpg'), {
            type: format,
            lastModified: Date.now(),
          });

          console.log(`Image optimized: ${Math.round(file.size / 1024)}KB -> ${Math.round(optimizedFile.size / 1024)}KB`);
          resolve(optimizedFile);
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for optimization'));
    };

    img.src = url;
  });
}
