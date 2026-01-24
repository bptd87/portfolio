import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function SkeletonRendering() {
    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Gradient Background Placeholder */}
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-black z-0 pointer-events-none" />

            <div className="relative z-10 pt-32 px-6 md:px-12 max-w-4xl mx-auto space-y-6">

                {/* Hero Title Card (Glass) */}
                <div className="backdrop-blur-xl bg-neutral-800/40 rounded-3xl border border-white/10 p-8 md:p-12">
                    <Skeleton className="h-12 md:h-16 w-3/4 mb-6 bg-white/10" />
                    <div className="flex gap-6">
                        <Skeleton className="h-4 w-32 bg-white/10" />
                        <Skeleton className="h-4 w-24 bg-white/10" />
                        <Skeleton className="h-4 w-20 bg-white/5" />
                    </div>
                </div>

                {/* Metadata Card (Like/Share) */}
                <div className="backdrop-blur-xl bg-neutral-800/40 rounded-3xl border border-white/10 p-6 flex justify-between items-center">
                    <div className="flex gap-6">
                        <Skeleton className="h-10 w-24 rounded-full bg-white/10" />
                        <Skeleton className="h-5 w-16 self-center bg-white/5" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                </div>

                {/* Rendering Template: Hero Images (Stacked) */}
                <div className="space-y-6">
                    <Skeleton className="w-full aspect-video rounded-3xl bg-neutral-800/40 border border-white/5" />
                    <Skeleton className="w-full aspect-video rounded-3xl bg-neutral-800/40 border border-white/5 hidden md:block" />
                </div>

                {/* Rendering Template: Narrative/Description */}
                <div className="backdrop-blur-xl bg-neutral-800/40 rounded-3xl border border-white/10 p-8 md:p-12">
                    <div className="space-y-4">
                        {/* Drop cap simulation */}
                        <div className="flex gap-4">
                            <Skeleton className="h-20 w-16 bg-white/10 shrink-0" />
                            <div className="space-y-3 w-full pt-2">
                                <Skeleton className="h-4 w-full bg-white/5" />
                                <Skeleton className="h-4 w-full bg-white/5" />
                                <Skeleton className="h-4 w-full bg-white/5" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full bg-white/5" />
                        <Skeleton className="h-4 w-2/3 bg-white/5" />
                    </div>
                </div>
            </div>
        </div>
    );
}
