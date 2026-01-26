import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function SkeletonPortfolio() {
    return (
        <div className="min-h-screen bg-white dark:bg-black pt-32 px-6">

            {/* Hero Text */}
            <div className="max-w-7xl mx-auto text-center mb-12">
                <Skeleton className="h-16 w-64 md:w-96 mx-auto mb-6 bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-6 w-full max-w-2xl mx-auto bg-neutral-100 dark:bg-neutral-900" />
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center gap-2 mb-12">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-8 w-24 rounded-full bg-neutral-100 dark:bg-neutral-900" />
                ))}
            </div>

            {/* Uniform 3-Column Grid */}
            <div className="max-w-[1800px] mx-auto pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="aspect-[3/2] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 relative">
                            {/* Image Placeholder */}
                            <Skeleton className="w-full h-full bg-neutral-200/50 dark:bg-neutral-800/50" />

                            {/* Content Placeholder */}
                            <div className="absolute bottom-6 left-6 right-6 space-y-3">
                                <Skeleton className="h-3 w-24 bg-white/20" />
                                <Skeleton className="h-8 w-3/4 bg-white/20" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
