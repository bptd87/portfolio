import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function SkeletonNews() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12 bg-white dark:bg-black relative">

            {/* Header Skeleton */}
            <div className="relative z-10 max-w-[1400px] mx-auto mb-12 w-full">
                <Skeleton className="h-4 w-32 mb-4 bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-16 w-64 mb-4 bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-6 w-full max-w-2xl bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Filters Skeleton */}
            <div className="sticky top-0 z-40 mb-12 bg-white/80 dark:bg-black/80 backdrop-blur-xl py-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-12 lg:px-12 border-y border-neutral-100 dark:border-white/10">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6 md:items-center justify-between">
                    <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-8 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={`y-${i}`} className="h-6 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto">
                {/* HERO SKELETON */}
                <div className="mb-24">
                    <div className="w-full aspect-[4/3] md:aspect-[21/9] rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 relative">
                        <Skeleton className="absolute inset-0 w-full h-full bg-neutral-200/50 dark:bg-neutral-800/50" />
                        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3 space-y-4">
                            <Skeleton className="h-6 w-32 rounded-full bg-white/20" />
                            <Skeleton className="h-12 w-full bg-white/20" />
                            <Skeleton className="h-6 w-3/4 bg-white/20" />
                        </div>
                    </div>
                </div>

                {/* TIMELINE GRID SKELETON */}
                <div className="space-y-24">
                    {/* Fake Year Group */}
                    <div className="relative">
                        <div className="flex items-center gap-6 mb-12">
                            <Skeleton className="h-12 w-32 bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-grow" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex flex-col h-full">
                                    <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-6 relative">
                                        <Skeleton className="absolute inset-0 w-full h-full bg-neutral-200/50 dark:bg-neutral-800/50" />
                                    </div>
                                    <div className="space-y-3">
                                        <Skeleton className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800" />
                                        <Skeleton className="h-8 w-full bg-neutral-200 dark:bg-neutral-800" />
                                        <Skeleton className="h-4 w-full bg-neutral-200 dark:bg-neutral-800" />
                                        <Skeleton className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
