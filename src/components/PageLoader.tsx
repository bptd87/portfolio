import React from 'react';

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        {/* Spinning loader */}
        <div className="inline-block w-12 h-12 border-4 border-[#B8860B] dark:border-[#FFD700] border-t-transparent rounded-full animate-spin mb-4"></div>
        
        {/* Loading text */}
        <p className="text-sm tracking-wider opacity-60">LOADING...</p>
      </div>
    </div>
  );
}
