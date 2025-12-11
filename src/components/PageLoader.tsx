import React from 'react';
import { Skeleton } from './ui/skeleton';

export function PageLoader() {
  return (
    <div className="w-full max-w-[1800px] mx-auto px-6 py-32 animate-in fade-in duration-500">
      {/* Fake Header/Title Area */}
      <div className="max-w-4xl mx-auto text-center space-y-8 mb-20">
        <div className="flex justify-center">
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-12 w-3/4 md:w-1/2 rounded-lg" />
        </div>
        <div className="space-y-3 pt-2 max-w-2xl mx-auto">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
        </div>
      </div>

      {/* Fake Grid (Portfolio/Gallery style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden">
          <Skeleton className="w-full h-full" height="100%" />
        </div>
        <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden hidden md:block">
          <Skeleton className="w-full h-full" height="100%" />
        </div>
        <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden hidden lg:block">
          <Skeleton className="w-full h-full" height="100%" />
        </div>
      </div>
    </div>
  );
}
