import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function SkeletonExperiential() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Split Screen Header */}
            <div className="h-screen w-full flex flex-col md:flex-row">
                {/* Left: Content */}
                <div className="w-full md:w-1/2 h-full p-12 flex flex-col justify-center gap-8 relative z-10 bg-black">
                    <Skeleton className="h-4 w-32 bg-neutral-800" />
                    <Skeleton className="h-24 w-full bg-neutral-800" />
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full bg-neutral-900" />
                        <Skeleton className="h-4 w-full bg-neutral-900" />
                        <Skeleton className="h-4 w-2/3 bg-neutral-900" />
                    </div>
                    <div className="flex gap-4 mt-8">
                        <Skeleton className="h-10 w-32 rounded-full bg-neutral-800" />
                        <Skeleton className="h-10 w-32 rounded-full bg-neutral-800" />
                    </div>
                </div>

                {/* Right: Image */}
                <div className="w-full md:w-1/2 h-full bg-neutral-900 relative overflow-hidden">
                    <Skeleton className="w-full h-full bg-neutral-800/50" />
                </div>
            </div>

            {/* Challenge / Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
                <div className="bg-neutral-900/50 p-12 border-r border-white/5">
                    <Skeleton className="h-8 w-48 mb-6 bg-neutral-800" />
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full bg-neutral-800/50" />
                        <Skeleton className="h-4 w-full bg-neutral-800/50" />
                        <Skeleton className="h-4 w-full bg-neutral-800/50" />
                        <Skeleton className="h-4 w-3/4 bg-neutral-800/50" />
                    </div>
                </div>
                <div className="bg-black p-12">
                    <Skeleton className="h-8 w-48 mb-6 bg-neutral-800" />
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full bg-neutral-800/50" />
                        <Skeleton className="h-4 w-full bg-neutral-800/50" />
                    </div>
                </div>
            </div>
        </div>
    );
}
