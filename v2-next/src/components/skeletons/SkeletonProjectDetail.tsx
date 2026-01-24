import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export function SkeletonProjectDetail() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Full screen hero image placeholder */}
            <div className="fixed inset-0 z-0">
                <Skeleton className="w-full h-full bg-neutral-900" />
            </div>

            {/* Mock Navigation */}
            <div className="fixed top-8 left-8 z-50">
                <Skeleton className="w-12 h-12 rounded-full bg-neutral-800/80 backdrop-blur-xl border border-white/10" />
            </div>

            <div className="relative z-10 min-h-screen pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Title Card */}
                    <div className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-8 md:p-12">
                        <Skeleton className="h-4 w-32 mb-6 bg-white/10" />
                        <Skeleton className="h-16 w-3/4 mb-6 bg-white/10" />
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-24 bg-white/10" />
                            <Skeleton className="h-4 w-24 bg-white/10" />
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 flex justify-between items-center">
                        <div className="flex gap-4">
                            <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
                            <Skeleton className="h-8 w-16 rounded-full bg-white/10" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
                    </div>

                    {/* Content Placeholder */}
                    <div className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 space-y-4">
                        <div className="flex justify-between mb-4">
                            <Skeleton className="h-4 w-32 bg-white/10" />
                            <Skeleton className="h-4 w-4 bg-white/10" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <Skeleton className="aspect-square rounded-lg bg-white/5" />
                            <Skeleton className="aspect-square rounded-lg bg-white/5" />
                            <Skeleton className="aspect-square rounded-lg bg-white/5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
