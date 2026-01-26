/**
 * Supabase Image Optimizer
 *
 * Supabase Storage supports on-the-fly image transformations!
 * This utility generates optimized image URLs for better performance.
 *
 * Documentation: https://supabase.com/docs/guides/storage/serving/image-transformations
 *
 * Features:
 * - Automatic format conversion (WebP when supported)
 * - Resize to specific dimensions
 * - Quality optimization
 * - Responsive image srcsets
 * - Focal point support
 *
 * Note: Supabase uses Imgix for transformations. The API uses getPublicUrl with transform options.
 */

import { createClient } from "./supabase/client";

const SUPABASE_PROJECT_ID = "zuycsuajiuqsvopiioer";
const STORAGE_BASE_URL =
  `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public`;

export interface ImageTransformOptions {
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Quality (1-100, default: 80) */
  quality?: number;
  /** Format: 'auto', 'webp', 'jpeg', 'png' (default: 'auto' - uses WebP when supported) */
  format?: "auto" | "webp" | "jpeg" | "png";
  /** Resize mode: 'cover', 'contain', 'fill' (default: 'cover') */
  resize?: "cover" | "contain" | "fill";
  /** Focal point for smart cropping { x: 0-100, y: 0-100 } */
  focus?: { x: number; y: number };
  /** Enable blur placeholder generation */
  blur?: boolean;
}

/**
 * Check if a URL is a Supabase Storage URL
 */
export function isSupabaseStorageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes(".supabase.co/storage/v1/object/public");
}

/**
 * Extract the storage path from a Supabase Storage URL
 *
 * Example:
 * Input: "https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/image.jpg"
 * Output: "portfolio/Red Line Cafe/image.jpg"
 */
export function extractStoragePath(url: string): string | null {
  if (!isSupabaseStorageUrl(url)) return null;

  try {
    // Extract the path after /object/public/
    // Only match public URLs to verify bucket access
    const match = url.match(/\/storage\/v1\/object\/public\/([^?]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  } catch (e) {
    console.error("Error extracting storage path:", e);
  }

  return null;
}

/**
 * Generate an optimized Supabase Storage image URL
 *
 * Uses Supabase's getPublicUrl with transform options (Imgix-based).
 * Falls back to query parameters if getPublicUrl transform doesn't work.
 *
 * @param url - Original Supabase Storage URL or storage path
 * @param options - Transformation options
 * @returns Optimized image URL
 *
 * @example
 * ```ts
 * const optimized = optimizeSupabaseImage(
 *   'https://...supabase.co/storage/v1/object/public/portfolio/image.jpg',
 *   { width: 800, quality: 85, format: 'webp' }
 * );
 * ```
 */
export function optimizeSupabaseImage(
  url: string | null | undefined,
  options: ImageTransformOptions = {},
): string | null {
  if (!url) return null;

  // If not a Supabase Storage URL, return as-is
  if (!isSupabaseStorageUrl(url)) {
    return url;
  }

  // If already optimized (manually via URL params), return as-is
  // This prevents double-optimization or overriding explicit sizing
  if (url.includes("width=") || url.includes("resize=")) {
    return url;
  }

  // Extract storage path and bucket
  const storagePath = extractStoragePath(url);
  if (!storagePath) return url;

  const [bucket, ...pathParts] = storagePath.split("/");
  const filePath = pathParts.join("/");

  if (!bucket || !filePath) return url;

  // Skip optimization for URLs that might cause 400 errors:
  // - Files with timestamp suffixes (often cause Supabase transform 400s)
  const filePathLength = filePath.length;
  // Check for timestamp suffix (hyphen followed by 10+ digits)
  const hasTimestampSuffix = /-\d{10,}\./.test(filePath);
  const hasProblematicChars = /[-]{3,}|[^\w\s./-]/g.test(filePath);

  if (filePathLength > 200 || hasProblematicChars || hasTimestampSuffix) {
    // Silently skip optimization for known problematic patterns to avoid console 400 errors
    return url;
  }

  // Try using Supabase client's getPublicUrl with transform (preferred method)
  // Supabase Pro plan supports image transformations via Imgix
  try {
    const supabase = createClient();

    // Build transform options - only include defined values
    const transformOptions: any = {};
    if (options.width) transformOptions.width = options.width;
    if (options.height) transformOptions.height = options.height;
    
    // Improved defaults for performance
    transformOptions.quality = options.quality || 75;
    transformOptions.format = (options.format && options.format !== "auto") ? options.format : 'webp';
    
    if (options.resize) transformOptions.resize = options.resize;

    // Only add transform if we have options
    const getPublicUrlOptions = Object.keys(transformOptions).length > 0
      ? { transform: transformOptions }
      : {};

    const { data } = supabase.storage.from(bucket).getPublicUrl(
      filePath,
      getPublicUrlOptions,
    );

    if (data?.publicUrl) {
      let optimizedUrl = data.publicUrl;

      // Add focal point if specified (Imgix supports this via query params)
      if (options.focus) {
        const separator = optimizedUrl.includes("?") ? "&" : "?";
        optimizedUrl =
          `${optimizedUrl}${separator}focal=${options.focus.x},${options.focus.y}`;
      }

      return optimizedUrl;
    }
  } catch (e) {
    // If transform fails, return original URL - don't break images!
    console.warn("Supabase transform error, using original image URL:", e);
    return url;
  }

  // Fallback: If we get here, return original URL to ensure images still load
  return url;
}

/**
 * Generate a responsive srcset for Supabase Storage images
 *
 * @param url - Original Supabase Storage URL
 * @param sizes - Array of widths to generate
 * @param options - Base transformation options
 * @returns srcset string and sizes attribute
 *
 * @example
 * ```ts
 * const { srcset, sizes } = generateResponsiveSrcset(
 *   imageUrl,
 *   [400, 800, 1200, 1600],
 *   { quality: 85, format: 'webp' }
 * );
 * ```
 */
export function generateResponsiveSrcset(
  url: string | null | undefined,
  sizes: number[] = [400, 800, 1200, 1600],
  options: Omit<ImageTransformOptions, "width" | "height"> = {},
): { srcset: string; sizes: string } {
  if (!url || !isSupabaseStorageUrl(url)) {
    return { srcset: url || "", sizes: "100vw" };
  }

  const srcsetParts = sizes.map((width) => {
    const optimizedUrl = optimizeSupabaseImage(url, {
      ...options,
      width,
    });
    return `${optimizedUrl} ${width}w`;
  });

  return {
    srcset: srcsetParts.join(", "),
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  };
}

/**
 * Generate a blur placeholder URL (low quality, small size)
 *
 * @param url - Original Supabase Storage URL
 * @returns Blur placeholder URL
 */
export function generateBlurPlaceholder(
  url: string | null | undefined,
): string | null {
  if (!url) return null;

  return optimizeSupabaseImage(url, {
    width: 20,
    height: 20,
    quality: 20,
    format: "jpeg",
    resize: "cover",
  });
}

/**
 * Get optimized image URL for a specific use case
 */
export const ImagePresets = {
  /** Thumbnail: 200x200, WebP, quality 75 */
  thumbnail: (url: string, focus?: { x: number; y: number }) =>
    optimizeSupabaseImage(url, {
      width: 200,
      height: 200,
      quality: 75,
      format: "webp",
      resize: "cover",
      focus,
    }),

  /** Card image: 600px wide, WebP, quality 80 */
  card: (url: string, focus?: { x: number; y: number }) =>
    optimizeSupabaseImage(url, {
      width: 600,
      quality: 80,
      format: "webp",
      resize: "cover",
      focus,
    }),

  /** Hero image: 1200px wide, WebP, quality 85 */
  hero: (url: string, focus?: { x: number; y: number }) =>
    optimizeSupabaseImage(url, {
      width: 1200,
      quality: 85,
      format: "webp",
      resize: "cover",
      focus,
    }),

  /** Gallery image: 1600px wide, WebP, quality 90 */
  gallery: (url: string, focus?: { x: number; y: number }) =>
    optimizeSupabaseImage(url, {
      width: 1600,
      quality: 90,
      format: "webp",
      resize: "cover",
      focus,
    }),

  /** Full size: Original quality, WebP, quality 95 */
  full: (url: string) =>
    optimizeSupabaseImage(url, {
      quality: 95,
      format: "webp",
    }),
};
