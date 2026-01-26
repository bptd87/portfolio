import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function SkeletonArticleGrid() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12 bg-white dark:bg-black">
            {/* Header Skeleton */}
            <div className="max-w-[1400px] mx-auto mb-12 w-full">
                <Skeleton className="h-4 w-32 mb-4 bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-16 w-64 mb-6 bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-6 w-full max-w-2xl bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Filters Skeleton */}
            <div className="sticky top-0 z-40 mb-12 bg-white/80 dark:bg-black/80 backdrop-blur-xl py-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-12 lg:px-12 border-y border-neutral-100 dark:border-white/10">
                <div className="max-w-[1400px] mx-auto">
                    <Skeleton className="h-3 w-20 mb-3 bg-neutral-200 dark:bg-neutral-800" />
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-8 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 relative">
                        <Skeleton className="absolute inset-0 w-full h-full bg-neutral-200/50 dark:bg-neutral-800/50" />
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                            <Skeleton className="h-4 w-20 mb-2 bg-white/20" />
                            <Skeleton className="h-8 w-full mb-2 bg-white/20" />
                            <Skeleton className="h-4 w-3/4 bg-white/20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
