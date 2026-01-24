import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function SkeletonAppStudio() {
    return (
        <div className="min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-black text-white">
            <div className="max-w-[1800px] mx-auto space-y-16">

                {/* Hero Section: Split Layout */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Text Content */}
                    <div className="space-y-8">
                        {/* Tag */}
                        <Skeleton className="h-8 w-48 rounded-full bg-neutral-800 border border-white/10" />

                        {/* Title & Desc */}
                        <div className="space-y-6">
                            <Skeleton className="h-20 w-3/4 bg-neutral-800" />
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-full bg-neutral-800" />
                                <Skeleton className="h-6 w-5/6 bg-neutral-800" />
                            </div>
                        </div>

                        {/* Tag line */}
                        <div className="flex items-center gap-3 pt-4">
                            <Skeleton className="w-5 h-5 rounded-sm bg-neutral-800" />
                            <Skeleton className="h-4 w-64 bg-neutral-800" />
                        </div>
                    </div>

                    {/* Right: Image Placeholder */}
                    <div className="rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 aspect-video lg:aspect-auto h-[400px] lg:h-[500px]">
                        <Skeleton className="w-full h-full bg-neutral-800/50" />
                    </div>
                </div>

                {/* Filter Section (Pills) */}
                <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-10 w-32 rounded-full bg-neutral-800 border border-white/10" />
                    ))}
                </div>

                {/* Apps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-3xl overflow-hidden border border-white/10 bg-neutral-900/50 h-[480px] flex flex-col">
                            {/* Top Image Half */}
                            <div className="h-1/2 p-1">
                                <Skeleton className="w-full h-full rounded-t-[20px] bg-neutral-800" />
                            </div>

                            {/* Bottom Content Half */}
                            <div className="h-1/2 p-8 flex flex-col justify-between">
                                <div className="space-y-4">
                                    {/* Icon + Category */}
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-8 h-8 rounded-lg bg-neutral-800" />
                                        <Skeleton className="h-3 w-24 bg-neutral-800" />
                                    </div>

                                    {/* Title */}
                                    <Skeleton className="h-8 w-3/4 bg-neutral-800" />

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-full bg-neutral-800" />
                                        <Skeleton className="h-3 w-full bg-neutral-800" />
                                        <Skeleton className="h-3 w-2/3 bg-neutral-800" />
                                    </div>
                                </div>

                                {/* Link CTA */}
                                <Skeleton className="h-4 w-24 bg-neutral-800" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA Banner */}
                <div className="border border-white/10 rounded-3xl p-12 md:p-16 text-center bg-neutral-900/30 flex flex-col items-center gap-6">
                    <Skeleton className="h-12 w-1/2 bg-neutral-800" />
                    <Skeleton className="h-6 w-2/3 bg-neutral-800" />
                    <Skeleton className="h-14 w-48 rounded-full bg-neutral-800 mt-4" />
                </div>

            </div>
        </div>
    );
}
