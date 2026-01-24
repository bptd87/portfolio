import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function SkeletonArticle() {
    return (
        <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-6">

                {/* Hero Image */}
                <Skeleton className="w-full aspect-video md:aspect-[2/1] rounded-lg mb-12 bg-neutral-200 dark:bg-neutral-800" />

                {/* Content Container */}
                <div className="max-w-3xl mx-auto">
                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-6">
                        <Skeleton className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800" />
                        <Skeleton className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800" />
                    </div>

                    {/* Title */}
                    <Skeleton className="h-12 w-full mb-4 bg-neutral-300 dark:bg-neutral-700" />
                    <Skeleton className="h-12 w-3/4 mb-8 bg-neutral-300 dark:bg-neutral-700" />

                    {/* Author Row */}
                    <div className="flex items-center gap-4 py-8 border-t border-b border-neutral-100 dark:border-white/10 mb-12">
                        <Skeleton className="h-12 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-32 bg-neutral-200 dark:bg-neutral-800" />
                            <Skeleton className="h-3 w-24 bg-neutral-100 dark:bg-neutral-900" />
                        </div>
                    </div>

                    {/* Text Paragraphs */}
                    <div className="space-y-6">
                        <Skeleton className="h-4 w-full bg-neutral-200 dark:bg-neutral-800" />
                        <Skeleton className="h-4 w-full bg-neutral-200 dark:bg-neutral-800" />
                        <Skeleton className="h-4 w-full bg-neutral-200 dark:bg-neutral-800" />
                        <Skeleton className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                </div>
            </div>
        </div>
    );
}
