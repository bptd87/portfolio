import React from 'react'
import { cn } from './utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  style?: React.CSSProperties
  /**
   * Variant of the skeleton
   * - text: For text lines
   * - circular: For avatars/circular elements
   * - rectangular: For cards/images (default)
   */
  variant?: 'text' | 'circular' | 'rectangular'
  /**
   * Width of the skeleton (can be any CSS width value)
   */
  width?: string | number
  /**
   * Height of the skeleton (can be any CSS height value)
   */
  height?: string | number
  /**
   * Animation type
   * - pulse: Pulsing opacity (default)
   * - wave: Shimmer/wave effect
   * - none: No animation
   */
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Skeleton Component
 * 
 * Loading placeholder component that provides visual feedback
 * while content is being fetched or processed.
 * 
 * Examples:
 * 
 * Text line:
 * <Skeleton variant="text" width="100%" height="1rem" />
 * 
 * Avatar:
 * <Skeleton variant="circular" width="3rem" height="3rem" />
 * 
 * Card/Image:
 * <Skeleton variant="rectangular" width="100%" height="300px" />
 * 
 * Wave animation:
 * <Skeleton animation="wave" width="100%" height="200px" />
 */
export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  className,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1rem',
        backgroundSize: animation === 'wave' ? '200% 100%' : undefined,
        ...style,
      }}
      {...props}
    />
  )
}

/**
 * SkeletonCard Component
 * 
 * Pre-configured skeleton for card layouts
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 p-6', className)}>
      <Skeleton variant="rectangular" height="200px" animation="wave" />
      <Skeleton variant="text" width="60%" height="1.5rem" />
      <Skeleton variant="text" width="100%" height="1rem" />
      <Skeleton variant="text" width="100%" height="1rem" />
      <Skeleton variant="text" width="80%" height="1rem" />
    </div>
  )
}

/**
 * SkeletonText Component
 * 
 * Pre-configured skeleton for text content
 */
export function SkeletonText({ 
  lines = 3,
  className 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '80%' : '100%'}
          height="1rem"
        />
      ))}
    </div>
  )
}

/**
 * SkeletonAvatar Component
 * 
 * Pre-configured skeleton for avatar/profile pictures
 */
export function SkeletonAvatar({ 
  size = '3rem',
  className 
}: { 
  size?: string
  className?: string 
}) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  )
}

/**
 * SkeletonProjectCard Component
 * 
 * Skeleton specifically for project cards in portfolio
 */
export function SkeletonProjectCard({ className }: { className?: string }) {
  return (
    <div className={cn('backdrop-blur-xl bg-neutral-800/60 rounded-3xl overflow-hidden p-6', className)}>
      <Skeleton variant="rectangular" height="300px" animation="wave" className="mb-4 rounded-2xl" />
      <Skeleton variant="text" width="70%" height="1.5rem" className="mb-2" />
      <Skeleton variant="text" width="50%" height="1rem" />
    </div>
  )
}

/**
 * SkeletonBlogCard Component
 * 
 * Skeleton specifically for blog/article cards
 */
export function SkeletonBlogCard({ className }: { className?: string }) {
  return (
    <div className={cn('backdrop-blur-xl bg-neutral-800/60 rounded-3xl overflow-hidden', className)}>
      <Skeleton variant="rectangular" height="200px" animation="wave" />
      <div className="p-6 space-y-3">
        <Skeleton variant="text" width="40%" height="0.875rem" className="mb-2" />
        <Skeleton variant="text" width="90%" height="1.5rem" className="mb-2" />
        <Skeleton variant="text" width="100%" height="1rem" />
        <Skeleton variant="text" width="100%" height="1rem" />
        <Skeleton variant="text" width="60%" height="1rem" />
      </div>
    </div>
  )
}
