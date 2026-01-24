import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function SkeletonHome() {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Hero Section */}
            <div className="h-screen w-full relative flex items-center justify-center">
                {/* Background Placeholders - Abstract Shapes */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <Skeleton className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20" />
                    <Skeleton className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-20" />
                </div>

                <div className="relative z-10 text-center max-w-4xl px-6 w-full flex flex-col items-center gap-8">
                    <Skeleton className="h-24 md:h-32 w-3/4 max-w-2xl rounded-lg bg-neutral-800/50" />
                    <Skeleton className="h-8 w-1/2 max-w-lg rounded-md bg-neutral-800/30" />
                    <Skeleton className="h-12 w-12 rounded-full mt-12 bg-neutral-800/30" />
                </div>
            </div>

            {/* Featured Project Placeholder */}
            <div className="h-screen w-full p-8 md:p-12 flex items-center justify-center">
                <div className="w-full h-full rounded-[3rem] bg-neutral-900 overflow-hidden relative border border-white/5">
                    <Skeleton className="absolute inset-0 w-full h-full bg-neutral-800/20" />

                    <div className="absolute inset-0 p-12 flex flex-col justify-between">
                        <div className="flex justify-between w-full">
                            <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
                            <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
                        </div>
                        <div>
                            <Skeleton className="h-24 w-2/3 mb-4 bg-white/10" />
                            <Skeleton className="h-6 w-48 bg-white/10" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
