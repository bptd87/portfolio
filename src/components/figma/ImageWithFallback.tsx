import React, { useState, useEffect, useRef } from 'react'
import { useImageMetadata } from '../../hooks/useImageMetadata';

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
  /**
   * Custom skeleton className
   */
  skeletonClassName?: string
  /**
   * Priority loading for LCP images (disables lazy, fade-in, and sets fetchPriority high)
   */
  priority?: boolean
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
    onLoad,
    ...rest
  } = props

  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInView, setIsInView] = useState(!lazy) // If not lazy, consider it in view immediately
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

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
  }, [lazy])

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
    if (onLoad) {
      onLoad(e)
    }
  }

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

  // Determine which src to use
  const imageSrc = isInView ? src : BLUR_PLACEHOLDER

  // LCP Optimization: If priority is true, show immediately without transition
  const isPriority = props.priority;
  const showTransition = !isPriority;

  return (
    <div className="relative inline-block w-full h-full" style={style}>
      {/* Skeleton loader - shown while image is loading, disabled for priority to avoid flash */}
      {showSkeleton && isLoading && !isPriority && (
        <div
          className={`absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 animate-pulse ${skeletonClassName || ''
            }`}
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={finalAlt}
        title={finalTitle}
        className={`${className ?? ''} ${blurUp && isLoading && isInView && showTransition ? 'blur-sm scale-105' : ''
          } ${isLoading && showTransition ? 'opacity-0' : 'opacity-100'} ${showTransition ? 'transition-all duration-500 ease-out' : ''}`}
        style={{
          ...style,
          ...(isLoading && showTransition ? { visibility: 'hidden' } : {}),
        }}
        {...rest}
        onError={handleError}
        onLoad={handleLoad}
        loading={lazy && !isPriority ? 'lazy' : 'eager'}
      // @ts-ignore - fetchPriority is standard but missing in some React types
      />
    </div>
  )
}
