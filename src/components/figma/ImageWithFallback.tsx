import React, { useState, useEffect, useRef } from 'react'
import { useImageMetadata } from '../../hooks/useImageMetadata';
import { generateResponsiveSrcset, isSupabaseStorageUrl } from '../../utils/supabase-image-optimizer';
import { buildOptimizedImageUrl } from '../../utils/image';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

// Simple blur placeholder - 1x1 transparent pixel
const BLUR_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const failedOptimizedWarnings = new Set<string>();

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Whether to enable lazy loading (default: true)
   * Images will only load when they're about to enter the viewport
   */
  lazy?: boolean
  /**
   * Whether to show skeleton loader while loading (default: true)
   */
  showSkeleton?: boolean
  /**
   * Whether to apply blur-up effect when loading (default: true)
   */
  blurUp?: boolean
  /**
   * Custom skeleton className
   */
  skeletonClassName?: string
  /**
   * Priority loading for LCP images (disables lazy, fade-in, and sets fetchPriority high)
   */
  priority?: boolean
  /**
   * Image optimization preset: 'thumbnail', 'card', 'hero', 'gallery', 'full'
   * Or provide custom width/height for optimization
   */
  optimize?: 'thumbnail' | 'card' | 'hero' | 'gallery' | 'full' | { width?: number; height?: number; quality?: number }
  /**
   * Focal point for smart cropping { x: 0-100, y: 0-100 }
   */
  focusPoint?: { x: number; y: number }
  /**
   * Enable responsive srcset for different screen sizes
   */
  responsive?: boolean
}


/**
 * ImageWithFallback Component
 * 
 * Enhanced image component with:
 * - Error handling with fallback UI
 * - Lazy loading (only loads when near viewport)
 * - Skeleton loading states
 * - Progressive blur-up effect
 * - Optimized performance
 * 
 * IMPORTANT FOR SEO:
 * - Always provide descriptive `alt` text for accessibility and SEO
 * - Alt text should describe the image content, not just say "image"
 * - Keep alt text concise but meaningful (under 125 characters)
 * 
 * Example:
 * <ImageWithFallback 
 *   src="/project.jpg" 
 *   alt="Scenic design rendering for Much Ado About Nothing at Theatre Name"
 *   lazy={true}
 *   showSkeleton={true}
 *   blurUp={true}
 * />
 */
export function ImageWithFallback(props: ImageWithFallbackProps) {
  const {
    src,
    alt,
    style,
    className,
    lazy = true,
    showSkeleton = true,
    blurUp = true,
    skeletonClassName,
    optimize,
    focusPoint,
    responsive = false,
    priority, // Destructure priority so it's not in rest
    onLoad,
    ...rest
  } = props

  const [retryWithRaw, setRetryWithRaw] = useState(false)
  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInView, setIsInView] = useState(!lazy) // If not lazy, consider it in view immediately
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false) // Track if image has loaded at least once
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastSrcRef = useRef<string | undefined>(src)

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) {
      return
    }

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            // Once in view, we can disconnect the observer
            if (observerRef.current) {
              observerRef.current.disconnect()
            }
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    )

    // Observe the image element
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [lazy, src]) // Add src to dependencies to re-observe if src changes

  // Fetch metadata from Supabase if available
  const { metadata } = useImageMetadata(src || '');

  // Use metadata alt text if available, otherwise fallback to props
  const finalAlt = metadata?.alt_text || alt || 'Image';
  const finalTitle = metadata?.caption || props.title;

  // Determine object position from focal point (prop > metadata > default)
  const finalFocusX = focusPoint?.x ?? metadata?.focus_x ?? 50;
  const finalFocusY = focusPoint?.y ?? metadata?.focus_y ?? 50;
  const objectPosition = `${finalFocusX}% ${finalFocusY}%`;

  // Image optimization enabled
  const optimizedSrc = src ? buildOptimizedImageUrl(src, optimize, focusPoint) : null

  // Determine which source to use
  // 1. If we haven't retried with raw yet, try optimizedSrc (if available) or src
  // 2. If we ARE retrying with raw, use src
  const activeSrc = (!retryWithRaw && optimizedSrc) ? optimizedSrc : src;

  const handleError = () => {
    // If we were trying the optimized source and it failed, try the raw source
    if (optimizedSrc && !retryWithRaw && optimizedSrc !== src) {
      if (src && !failedOptimizedWarnings.has(src)) {
        console.warn('Optimized image failed, falling back to original:', src);
        failedOptimizedWarnings.add(src);
      }
      setRetryWithRaw(true);
      // Do NOT set isLoading to false yet, we are trying again
      return;
    }

    // If we've already tried raw or there was no optimized source, then it's a real error
    setDidError(true)
    setIsLoading(false)
  }

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false)
    setHasLoadedOnce(true) // Mark that image has loaded - this persists across re-renders
    setIsInView(true) // Ensure isInView is true once loaded
    // Disconnect observer once loaded to prevent any state changes
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    if (onLoad) {
      onLoad(e)
    }
  }

  // Reset hasLoadedOnce only if src actually changes to a different image
  useEffect(() => {
    if (src && src !== lastSrcRef.current) {
      // New image source - reset loading state
      setHasLoadedOnce(false);
      setIsLoading(true);
      setRetryWithRaw(false); // Reset retry state for new image
      setDidError(false);
      lastSrcRef.current = src;
    }
  }, [src])

  // Error state
  if (didError) {
    return (
      <div
        className={`inline-block bg-neutral-900 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          {" "}
          <img
            src={ERROR_IMG_SRC}
            alt="Error loading image"
            {...rest}
            data-original-url={src}
          />{" "}
        </div>
      </div>
    );
  }

  // Responsive srcset generation
  const { srcset, sizes } = responsive && isSupabaseStorageUrl(src || '') && !retryWithRaw
    ? generateResponsiveSrcset(src!, [400, 800, 1200, 1600], { quality: 80, format: 'auto', focus: focusPoint })
    : { srcset: undefined, sizes: undefined };

  // Once image has loaded, always show it (don't revert to placeholder on re-render)
  // If src exists and we're not lazy loading, show it immediately
  // If lazy loading, only show when in view OR if it has loaded once
  const imageSrc = (!lazy || isInView || hasLoadedOnce) ? (activeSrc || null) : BLUR_PLACEHOLDER

  // LCP Optimization: If priority is true, show immediately without transition
  const isPriority = priority;
  const showTransition = !isPriority;

  // Extract rounded corner classes from className
  const roundedClasses = className?.match(/rounded-\[?\d+px?\]?|rounded-\w+/g)?.join(' ') || '';
  // Remove rounded classes from className to avoid duplication on img
  const imgClassName = className?.replace(/rounded-\[?\d+px?\]?|rounded-\w+/g, '').trim() || className || '';

  return (
    <div className={`relative block w-full h-full overflow-hidden ${roundedClasses}`} style={style}>
      {/* Skeleton loader - shown while image is loading, disabled for priority to avoid flash */}
      {showSkeleton && isLoading && !isPriority && (
        <div
          className={`absolute inset-0 bg-neutral-900/50 animate-pulse ${skeletonClassName || ''
            } ${roundedClasses}`}
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={imageSrc || undefined}
        srcSet={srcset}
        sizes={props.sizes || sizes}
        alt={finalAlt}
        title={finalTitle}
        className={`${imgClassName} ${roundedClasses} ${blurUp && isLoading && isInView && showTransition ? 'blur-sm scale-105' : ''
          } ${isLoading && showTransition ? 'opacity-0' : 'opacity-100'} ${showTransition ? 'transition-all duration-500 ease-out' : ''}`}
        style={{ ...style, objectPosition }}
        {...rest}
        onError={handleError}
        onLoad={handleLoad}
        loading={lazy && !isPriority && !isInView ? 'lazy' : 'eager'}
        decoding="async"
        fetchPriority={isPriority ? 'high' : 'auto'}
      />
    </div>
  )
}
