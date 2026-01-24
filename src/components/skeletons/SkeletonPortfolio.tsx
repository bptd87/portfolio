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

            {/* Bento Grid */}
            <div className="max-w-[1800px] mx-auto pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:auto-rows-[280px]">
                    {/* 1. Large 2x2 */}
                    <div className="col-span-1 lg:col-span-2 lg:row-span-2 min-h-[300px] lg:min-h-auto rounded-3xl overflow-hidden relative">
                        <Skeleton className="w-full h-full bg-neutral-900" />
                        <div className="absolute bottom-6 left-6 right-6 space-y-3">
                            <Skeleton className="h-3 w-24 bg-white/20" />
                            <Skeleton className="h-8 w-3/4 bg-white/20" />
                        </div>
                    </div>

                    {/* 2. Small 1x1 */}
                    <div className="col-span-1 min-h-[250px] lg:min-h-auto rounded-3xl overflow-hidden relative">
                        <Skeleton className="w-full h-full bg-neutral-900" />
                        <div className="absolute bottom-6 left-6 right-6 space-y-3">
                            <Skeleton className="h-3 w-16 bg-white/20" />
                            <Skeleton className="h-6 w-2/3 bg-white/20" />
                        </div>
                    </div>

                    {/* 3. Small 1x1 */}
                    <div className="col-span-1 min-h-[250px] lg:min-h-auto rounded-3xl overflow-hidden relative">
                        <Skeleton className="w-full h-full bg-neutral-900" />
                        <div className="absolute bottom-6 left-6 right-6 space-y-3">
                            <Skeleton className="h-3 w-16 bg-white/20" />
                            <Skeleton className="h-6 w-2/3 bg-white/20" />
                        </div>
                    </div>

                    {/* 4. Small 1x1 */}
                    <div className="col-span-1 min-h-[250px] lg:min-h-auto rounded-3xl overflow-hidden relative">
                        <Skeleton className="w-full h-full bg-neutral-900" />
                        <div className="absolute bottom-6 left-6 right-6 space-y-3">
                            <Skeleton className="h-3 w-16 bg-white/20" />
                            <Skeleton className="h-6 w-2/3 bg-white/20" />
                        </div>
                    </div>
                    {/* 5. Small 1x1 */}
                    <div className="col-span-1 min-h-[250px] lg:min-h-auto rounded-3xl overflow-hidden relative">
                        <Skeleton className="w-full h-full bg-neutral-900" />
                        <div className="absolute bottom-6 left-6 right-6 space-y-3">
                            <Skeleton className="h-3 w-16 bg-white/20" />
                            <Skeleton className="h-6 w-2/3 bg-white/20" />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
