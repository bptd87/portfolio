import React, { useState, useEffect, useRef } from 'react'
import { useImageMetadata } from '../../hooks/useImageMetadata';
import { generateResponsiveSrcset } from '../../utils/supabase-image-optimizer';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

// Simple blur placeholder - 1x1 transparent pixel
const BLUR_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

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

const isSupabaseStorageUrl = (url: string) => url.includes('storage/v1/object/public')

const buildOptimizedSupabaseUrl = (
  url: string,
  optimize: ImageWithFallbackProps['optimize']
) => {
  if (!isSupabaseStorageUrl(url)) return url

  const preset = typeof optimize === 'string' ? optimize : undefined
  const custom = typeof optimize === 'object' ? optimize : undefined

  const width = custom?.width || (
    preset === 'thumbnail' ? 400 :
      preset === 'card' ? 900 :
        preset === 'hero' ? 1920 :
          preset === 'gallery' ? 1600 :
            preset === 'full' ? 2400 :
              1600
  )

  const quality = custom?.quality || 70

  const [base, hash] = url.split('#')
  const [path, existingQuery] = base.split('?')
  const params = new URLSearchParams(existingQuery || '')

  if (!params.has('format')) params.set('format', 'webp')
  if (!params.has('quality')) params.set('quality', quality.toString())
  if (!params.has('width') && width) params.set('width', width.toString())

  const optimizedUrl = `${path}?${params.toString()}`
  return hash ? `${optimizedUrl}#${hash}` : optimizedUrl
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

  const handleError = () => {
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
      lastSrcRef.current = src;
    }
  }, [src])

  // Error state
  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 dark:bg-gray-800 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    )
  }

  // Image optimization is temporarily disabled - using original src directly

  // Responsive srcset generation
  const { srcset, sizes } = responsive && isSupabaseStorageUrl(src || '')
    ? generateResponsiveSrcset(src!, [400, 800, 1200, 1600], { quality: 80, format: 'webp', focus: focusPoint })
    : { srcset: undefined, sizes: undefined };

  const optimizedSrc = src ? buildOptimizedSupabaseUrl(src, optimize) : null

  // Once image has loaded, always show it (don't revert to placeholder on re-render)
  // If src exists and we're not lazy loading, show it immediately
  // If lazy loading, only show when in view OR if it has loaded once
  const imageSrc = (!lazy || isInView || hasLoadedOnce) ? (optimizedSrc || src || null) : BLUR_PLACEHOLDER

  // LCP Optimization: If priority is true, show immediately without transition
  const isPriority = priority;
  const showTransition = !isPriority;
  const fetchPriority = isPriority ? 'high' : 'auto';

  // Extract rounded corner classes from className
  const roundedClasses = className?.match(/rounded-\[?\d+px?\]?|rounded-\w+/g)?.join(' ') || '';
  // Remove rounded classes from className to avoid duplication on img
  const imgClassName = className?.replace(/rounded-\[?\d+px?\]?|rounded-\w+/g, '').trim() || className || '';

  return (
    <div className={`relative inline-block w-full h-full overflow-hidden ${roundedClasses}`} style={style}>
      {/* Skeleton loader - shown while image is loading, disabled for priority to avoid flash */}
      {showSkeleton && isLoading && !isPriority && (
        <div
          className={`absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 animate-pulse ${skeletonClassName || ''
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
        sizes={sizes}
        alt={finalAlt}
        title={finalTitle}
        className={`${imgClassName} ${roundedClasses} ${blurUp && isLoading && isInView && showTransition ? 'blur-sm scale-105' : ''
          } ${isLoading && showTransition ? 'opacity-0' : 'opacity-100'} ${showTransition ? 'transition-all duration-500 ease-out' : ''}`}
        style={style}
        {...rest}
        onError={handleError}
        onLoad={handleLoad}
        loading={lazy && !isPriority && !isInView ? 'lazy' : 'eager'}
        decoding="async"
        // @ts-ignore
        fetchpriority={fetchPriority}
      />
    </div>
  )
}
