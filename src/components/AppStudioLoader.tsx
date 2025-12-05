import React, { useEffect, useState } from 'react';
import { Box, Cog, Zap } from 'lucide-react';

interface AppStudioLoaderProps {
  appName: string;
  onComplete: () => void;
}

export function AppStudioLoader({ appName, onComplete }: AppStudioLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('INITIALIZING SYSTEM');

  useEffect(() => {
    const loadingStages = [
      { text: 'INITIALIZING SYSTEM', duration: 300 },
      { text: 'LOADING ASSETS', duration: 400 },
      { text: 'COMPILING DATA', duration: 300 },
      { text: 'LAUNCHING APPLICATION', duration: 200 },
    ];

    let currentProgress = 0;
    let stageIndex = 0;

    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
      
      setProgress(currentProgress);

      // Update loading text based on progress
      const newStageIndex = Math.floor((currentProgress / 100) * loadingStages.length);
      if (newStageIndex !== stageIndex && newStageIndex < loadingStages.length) {
        stageIndex = newStageIndex;
        setLoadingText(loadingStages[stageIndex].text);
      }
    }, 150);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center font-retro">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="loader-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-accent-brand"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loader-grid)" />
        </svg>
      </div>

      {/* Scanline effect */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 4px)',
        }}
      />

      <div className="relative z-10 text-center max-w-md w-full px-6">
        {/* Logo/icon - NO ANIMATIONS */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Cog size={80} className="text-accent-brand/30" />
            </div>
            <div>
              <Box size={64} className="text-accent-brand relative z-10" />
            </div>
          </div>
        </div>

        {/* App name */}
        <div className="mb-8">
          <div className="text-xs text-accent-brand mb-2 tracking-widest">
            &#9608; THEATRICAL TECH LAB &#9608;
          </div>
          <h1 className="text-2xl md:text-3xl text-white mb-2">
            {appName}
          </h1>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="border-2 border-accent-brand/50 bg-black/80 p-4">
            {/* Progress bar container */}
            <div className="relative h-4 bg-black border-2 border-accent-brand/30 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-accent-brand"
                style={{ width: `${progress}%` }}
              >
                {/* Scanline on progress bar */}
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
                  }}
                />
              </div>
            </div>
            
            {/* Progress percentage */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-white/60">{Math.floor(progress)}%</span>
              <div className="text-accent-brand flex items-center gap-2">
                <div>
                  <Zap size={12} />
                </div>
                {loadingText}...
              </div>
            </div>
          </div>
        </div>

        {/* Loading messages */}
        <div className="text-xs text-white/40 space-y-1">
          <div>{'>'} Loading application modules</div>
          <div>{'>'} Initializing user interface</div>
          <div>{'>'} Preparing data structures</div>
        </div>
      </div>
    </div>
  );
}
