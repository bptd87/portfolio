import { useState, useEffect } from 'react';

interface ColorResult {
  primary: string;
  secondary: string;
  accent: string;
  isDark: boolean;
}

/**
 * Extract dominant colors from an image URL using Canvas API
 * Returns CSS color strings for use in gradients
 */
export function useImageColors(imageUrl: string | undefined): ColorResult | null {
  const [colors, setColors] = useState<ColorResult | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setColors(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Sample at a smaller size for performance
        const sampleSize = 50;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;

        // Collect color samples
        const colorBuckets: Map<string, { r: number; g: number; b: number; count: number }> = new Map();

        for (let i = 0; i < data.length; i += 4) {
          const r = Math.floor(data[i] / 32) * 32;
          const g = Math.floor(data[i + 1] / 32) * 32;
          const b = Math.floor(data[i + 2] / 32) * 32;
          const key = `${r},${g},${b}`;

          const existing = colorBuckets.get(key);
          if (existing) {
            existing.count++;
            existing.r += data[i];
            existing.g += data[i + 1];
            existing.b += data[i + 2];
          } else {
            colorBuckets.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
          }
        }

        // Sort by frequency
        const sortedColors = Array.from(colorBuckets.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .map(c => ({
            r: Math.round(c.r / c.count),
            g: Math.round(c.g / c.count),
            b: Math.round(c.b / c.count),
          }));

        if (sortedColors.length >= 2) {
          // Helper function to darken light colors
          const darkenIfTooLight = (color: { r: number; g: number; b: number }) => {
            // Calculate luminance (0 = black, 1 = white)
            const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
            
            // If color is too light (luminance > 0.6), darken it significantly
            if (luminance > 0.6) {
              // Darken by reducing RGB values proportionally
              const darkenFactor = 0.3; // Reduce to 30% of original brightness
              return {
                r: Math.round(color.r * darkenFactor),
                g: Math.round(color.g * darkenFactor),
                b: Math.round(color.b * darkenFactor),
              };
            }
            
            // If still somewhat light (0.4 < luminance <= 0.6), darken slightly
            if (luminance > 0.4) {
              const darkenFactor = 0.6; // Reduce to 60% of original brightness
              return {
                r: Math.round(color.r * darkenFactor),
                g: Math.round(color.g * darkenFactor),
                b: Math.round(color.b * darkenFactor),
              };
            }
            
            // Color is dark enough, return as-is
            return color;
          };

          const primary = darkenIfTooLight(sortedColors[0]);
          const secondary = darkenIfTooLight(sortedColors[1]);
          const accent = darkenIfTooLight(sortedColors[2] || sortedColors[1]);

          // Calculate luminance to determine if dark or light
          const luminance = (0.299 * primary.r + 0.587 * primary.g + 0.114 * primary.b) / 255;

          setColors({
            primary: `rgb(${primary.r}, ${primary.g}, ${primary.b})`,
            secondary: `rgb(${secondary.r}, ${secondary.g}, ${secondary.b})`,
            accent: `rgb(${accent.r}, ${accent.g}, ${accent.b})`,
            isDark: luminance < 0.5,
          });
        }
      } catch (error) {
        console.warn('Failed to extract image colors:', error);
        setColors(null);
      }
    };

    img.onerror = () => {
      setColors(null);
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return colors;
}
