import React from 'react';

interface PixelIconProps {
  size?: number;
  className?: string;
}

// 16-bit pixel art icons for App Studio
// Designed with chunky, clear silhouettes for maximum retro impact

export const PixelCalculator: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Calculator outline */}
      <rect x="8" y="4" width="16" height="24" fill="currentColor" />
      <rect x="10" y="6" width="12" height="20" fill="black" opacity="0.3" />
      
      {/* Display screen */}
      <rect x="10" y="6" width="12" height="5" fill="currentColor" />
      <rect x="11" y="7" width="10" height="3" fill="black" opacity="0.5" />
      
      {/* Buttons - 4x4 grid */}
      <rect x="11" y="13" width="2" height="2" fill="currentColor" />
      <rect x="14" y="13" width="2" height="2" fill="currentColor" />
      <rect x="17" y="13" width="2" height="2" fill="currentColor" />
      <rect x="20" y="13" width="2" height="2" fill="currentColor" />
      
      <rect x="11" y="16" width="2" height="2" fill="currentColor" />
      <rect x="14" y="16" width="2" height="2" fill="currentColor" />
      <rect x="17" y="16" width="2" height="2" fill="currentColor" />
      <rect x="20" y="16" width="2" height="2" fill="currentColor" />
      
      <rect x="11" y="19" width="2" height="2" fill="currentColor" />
      <rect x="14" y="19" width="2" height="2" fill="currentColor" />
      <rect x="17" y="19" width="2" height="2" fill="currentColor" />
      <rect x="20" y="19" width="2" height="2" fill="currentColor" />
      
      <rect x="11" y="22" width="2" height="2" fill="currentColor" />
      <rect x="14" y="22" width="2" height="2" fill="currentColor" />
      <rect x="17" y="22" width="5" height="2" fill="currentColor" /> {/* Wide = button */}
    </svg>
  );
};

export const PixelRuler: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Diagonal ruler */}
      <rect x="4" y="20" width="24" height="4" fill="currentColor" transform="rotate(-45 16 16)" />
      
      {/* Measurement marks along diagonal */}
      <rect x="7" y="23" width="1" height="3" fill="currentColor" transform="rotate(-45 16 16)" />
      <rect x="10" y="20" width="1" height="2" fill="currentColor" transform="rotate(-45 16 16)" />
      <rect x="13" y="17" width="1" height="3" fill="currentColor" transform="rotate(-45 16 16)" />
      <rect x="16" y="14" width="1" height="2" fill="currentColor" transform="rotate(-45 16 16)" />
      <rect x="19" y="11" width="1" height="3" fill="currentColor" transform="rotate(-45 16 16)" />
      <rect x="22" y="8" width="1" height="2" fill="currentColor" transform="rotate(-45 16 16)" />
      
      {/* Numbers */}
      <rect x="8" y="21" width="1" height="2" fill="black" />
      <rect x="14" y="15" width="1" height="2" fill="black" />
      <rect x="20" y="9" width="1" height="2" fill="black" />
    </svg>
  );
};

export const PixelClock: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Outer circle */}
      <rect x="10" y="6" width="12" height="2" fill="currentColor" />
      <rect x="8" y="8" width="2" height="2" fill="currentColor" />
      <rect x="22" y="8" width="2" height="2" fill="currentColor" />
      <rect x="6" y="10" width="2" height="12" fill="currentColor" />
      <rect x="24" y="10" width="2" height="12" fill="currentColor" />
      <rect x="8" y="22" width="2" height="2" fill="currentColor" />
      <rect x="22" y="22" width="2" height="2" fill="currentColor" />
      <rect x="10" y="24" width="12" height="2" fill="currentColor" />
      
      {/* Hour markers - 12, 3, 6, 9 */}
      <rect x="15" y="9" width="2" height="1" fill="currentColor" />
      <rect x="22" y="15" width="1" height="2" fill="currentColor" />
      <rect x="15" y="22" width="2" height="1" fill="currentColor" />
      <rect x="9" y="15" width="1" height="2" fill="currentColor" />
      
      {/* Clock hands */}
      <rect x="15" y="12" width="2" height="4" fill="currentColor" /> {/* Hour hand */}
      <rect x="16" y="16" width="5" height="2" fill="currentColor" /> {/* Minute hand */}
      
      {/* Center */}
      <rect x="15" y="15" width="2" height="2" fill="currentColor" />
    </svg>
  );
};

export const PixelColumn: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Pedestal/capital */}
      <rect x="6" y="4" width="20" height="2" fill="currentColor" />
      <rect x="8" y="6" width="16" height="2" fill="currentColor" />
      
      {/* Column shaft with fluting */}
      <rect x="10" y="8" width="2" height="14" fill="currentColor" />
      <rect x="12" y="8" width="2" height="14" fill="currentColor" opacity="0.6" />
      <rect x="14" y="8" width="2" height="14" fill="currentColor" />
      <rect x="16" y="8" width="2" height="14" fill="currentColor" opacity="0.6" />
      <rect x="18" y="8" width="2" height="14" fill="currentColor" />
      <rect x="20" y="8" width="2" height="14" fill="currentColor" opacity="0.6" />
      
      {/* Base */}
      <rect x="8" y="22" width="16" height="2" fill="currentColor" />
      <rect x="6" y="24" width="20" height="2" fill="currentColor" />
      <rect x="10" y="26" width="12" height="2" fill="currentColor" />
    </svg>
  );
};

export const PixelScale: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Triangle/delta symbol for scale */}
      <rect x="15" y="6" width="2" height="2" fill="currentColor" />
      <rect x="13" y="8" width="6" height="2" fill="currentColor" />
      <rect x="11" y="10" width="10" height="2" fill="currentColor" />
      <rect x="9" y="12" width="14" height="2" fill="currentColor" />
      <rect x="7" y="14" width="18" height="2" fill="currentColor" />
      
      {/* Scale notation */}      
      <rect x="6" y="20" width="8" height="2" fill="currentColor" />
      <rect x="8" y="22" width="4" height="2" fill="currentColor" />
      
      {/* Arrow pointing right */}
      <rect x="16" y="21" width="4" height="2" fill="currentColor" />
      <rect x="20" y="20" width="2" height="1" fill="currentColor" />
      <rect x="20" y="23" width="2" height="1" fill="currentColor" />
      
      {/* Scaled down version */}
      <rect x="22" y="22" width="4" height="1" fill="currentColor" />
      <rect x="23" y="23" width="2" height="1" fill="currentColor" />
    </svg>
  );
};

export const PixelPalette: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Paint palette outline */}
      <rect x="8" y="10" width="14" height="2" fill="currentColor" />
      <rect x="6" y="12" width="2" height="8" fill="currentColor" />
      <rect x="22" y="12" width="2" height="4" fill="currentColor" />
      <rect x="8" y="20" width="14" height="2" fill="currentColor" />
      <rect x="10" y="8" width="10" height="2" fill="currentColor" />
      <rect x="10" y="22" width="10" height="2" fill="currentColor" />
      
      {/* Thumb hole */}
      <rect x="20" y="16" width="6" height="2" fill="currentColor" />
      <rect x="24" y="14" width="2" height="6" fill="currentColor" />
      <rect x="22" y="18" width="4" height="2" fill="currentColor" />
      
      {/* Paint dabs (different opacities for color variety) */}
      <rect x="10" y="12" width="3" height="3" fill="currentColor" opacity="0.4" />
      <rect x="15" y="12" width="3" height="3" fill="currentColor" opacity="0.7" />
      <rect x="10" y="16" width="3" height="3" fill="currentColor" opacity="0.5" />
      <rect x="15" y="16" width="3" height="3" fill="currentColor" opacity="0.9" />
    </svg>
  );
};

export const PixelMagnifier: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Magnifying glass circle */}
      <rect x="8" y="8" width="10" height="2" fill="currentColor" />
      <rect x="6" y="10" width="2" height="8" fill="currentColor" />
      <rect x="18" y="10" width="2" height="8" fill="currentColor" />
      <rect x="8" y="18" width="10" height="2" fill="currentColor" />
      
      {/* Glass shine effect */}
      <rect x="9" y="11" width="2" height="2" fill="currentColor" opacity="0.3" />
      
      {/* Handle */}
      <rect x="18" y="18" width="2" height="2" fill="currentColor" />
      <rect x="20" y="20" width="2" height="2" fill="currentColor" />
      <rect x="22" y="22" width="2" height="2" fill="currentColor" />
    </svg>
  );
};

export const PixelGrid: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* 3x3 Grid */}
      <rect x="6" y="6" width="6" height="6" fill="currentColor" />
      <rect x="13" y="6" width="6" height="6" fill="currentColor" opacity="0.6" />
      <rect x="20" y="6" width="6" height="6" fill="currentColor" />
      
      <rect x="6" y="13" width="6" height="6" fill="currentColor" opacity="0.6" />
      <rect x="13" y="13" width="6" height="6" fill="currentColor" />
      <rect x="20" y="13" width="6" height="6" fill="currentColor" opacity="0.6" />
      
      <rect x="6" y="20" width="6" height="6" fill="currentColor" />
      <rect x="13" y="20" width="6" height="6" fill="currentColor" opacity="0.6" />
      <rect x="20" y="20" width="6" height="6" fill="currentColor" />
    </svg>
  );
};

export const PixelDatabase: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Database cylinder - top */}
      <rect x="8" y="6" width="16" height="3" fill="currentColor" />
      <rect x="6" y="7" width="2" height="1" fill="currentColor" />
      <rect x="24" y="7" width="2" height="1" fill="currentColor" />
      
      {/* Middle section */}
      <rect x="6" y="9" width="2" height="6" fill="currentColor" />
      <rect x="24" y="9" width="2" height="6" fill="currentColor" />
      <rect x="8" y="14" width="16" height="2" fill="currentColor" />
      
      {/* Bottom section */}
      <rect x="6" y="16" width="2" height="6" fill="currentColor" />
      <rect x="24" y="16" width="2" height="6" fill="currentColor" />
      <rect x="8" y="21" width="16" height="2" fill="currentColor" />
      
      {/* Base */}
      <rect x="8" y="23" width="16" height="3" fill="currentColor" />
      <rect x="6" y="24" width="2" height="1" fill="currentColor" />
      <rect x="24" y="24" width="2" height="1" fill="currentColor" />
    </svg>
  );
};

export const PixelPhoto: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Photo frame */}
      <rect x="4" y="6" width="24" height="20" fill="currentColor" />
      <rect x="6" y="8" width="20" height="16" fill="black" opacity="0.3" />
      
      {/* Mountain/landscape scene */}
      <rect x="6" y="18" width="20" height="6" fill="currentColor" opacity="0.5" />
      <rect x="10" y="16" width="4" height="2" fill="currentColor" opacity="0.7" />
      <rect x="12" y="14" width="2" height="2" fill="currentColor" opacity="0.7" />
      <rect x="16" y="17" width="6" height="1" fill="currentColor" opacity="0.7" />
      <rect x="18" y="15" width="4" height="2" fill="currentColor" opacity="0.7" />
      
      {/* Sun */}
      <rect x="21" y="10" width="3" height="3" fill="currentColor" opacity="0.6" />
    </svg>
  );
};

// Unused icons kept for potential future use
export const PixelCamera: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Camera body */}
      <rect x="4" y="10" width="24" height="16" fill="currentColor" />
      <rect x="6" y="8" width="8" height="2" fill="currentColor" />
      
      {/* Lens */}
      <rect x="12" y="14" width="8" height="8" fill="currentColor" opacity="0.4" />
      <rect x="14" y="16" width="4" height="4" fill="currentColor" opacity="0.6" />
      
      {/* Flash */}
      <rect x="22" y="12" width="3" height="2" fill="currentColor" />
      
      {/* Viewfinder */}
      <rect x="24" y="8" width="2" height="2" fill="currentColor" opacity="0.7" />
    </svg>
  );
};

export const PixelPaintBrush: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Bristles */}
      <rect x="4" y="24" width="2" height="4" fill="currentColor" />
      <rect x="6" y="24" width="2" height="5" fill="currentColor" />
      <rect x="8" y="24" width="2" height="4" fill="currentColor" />
      
      {/* Ferrule */}
      <rect x="4" y="20" width="6" height="4" fill="currentColor" />
      
      {/* Handle */}
      <rect x="6" y="4" width="2" height="16" fill="currentColor" />
      <rect x="5" y="4" width="4" height="2" fill="currentColor" />
      <rect x="4" y="18" width="6" height="2" fill="currentColor" />
    </svg>
  );
};

export const PixelHammer: React.FC<PixelIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Hammer head */}
      <rect x="18" y="6" width="10" height="6" fill="currentColor" />
      <rect x="16" y="8" width="2" height="2" fill="currentColor" />
      
      {/* Handle */}
      <rect x="14" y="10" width="2" height="2" fill="currentColor" />
      <rect x="12" y="12" width="2" height="2" fill="currentColor" />
      <rect x="10" y="14" width="2" height="2" fill="currentColor" />
      <rect x="8" y="16" width="2" height="2" fill="currentColor" />
      <rect x="6" y="18" width="2" height="2" fill="currentColor" />
      <rect x="4" y="20" width="2" height="4" fill="currentColor" />
      <rect x="2" y="24" width="4" height="4" fill="currentColor" />
    </svg>
  );
};