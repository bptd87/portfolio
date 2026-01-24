import React, { useState, useRef, useEffect } from 'react';
import { Target } from 'lucide-react';

interface FocusPointPickerProps {
  imageUrl: string;
  focusPoint?: { x: number; y: number }; // x and y as percentages (0-100)
  onFocusPointChange: (point: { x: number; y: number }) => void;
}

export function FocusPointPicker({ imageUrl, focusPoint, onFocusPointChange }: FocusPointPickerProps) {
  const [localFocusPoint, setLocalFocusPoint] = useState(focusPoint || { x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusPoint) {
      setLocalFocusPoint(focusPoint);
    }
  }, [focusPoint]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint = {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };

    setLocalFocusPoint(newPoint);
    onFocusPointChange(newPoint);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint = {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };

    setLocalFocusPoint(newPoint);
    onFocusPointChange(newPoint);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const resetToCenter = () => {
    const centerPoint = { x: 50, y: 50 };
    setLocalFocusPoint(centerPoint);
    onFocusPointChange(centerPoint);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs tracking-wider uppercase text-gray-300">
          Image Focus Point
        </label>
        <button
          type="button"
          onClick={resetToCenter}
          className="text-xs text-accent-brand hover:opacity-70 transition-opacity"
        >
          Reset to Center
        </button>
      </div>

      <div
        ref={imageRef}
        className="relative aspect-video bg-black/5 dark:bg-white/5 border border-border overflow-hidden cursor-crosshair select-none"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Background Image */}
        <img
          src={imageUrl}
          alt="Focus point preview"
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Overlay Grid */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Rule of thirds grid */}
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
        </div>

        {/* Focus Point Indicator */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${localFocusPoint.x}%`,
            top: `${localFocusPoint.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Outer ring */}
          <div className="relative">
            <div className="w-12 h-12 border-2 border-white rounded-full shadow-lg animate-pulse" />
            {/* Inner crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Target className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            {/* Coordinates label */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="px-2 py-1 bg-black/80 text-white text-[10px] font-mono rounded">
                {localFocusPoint.x.toFixed(1)}%, {localFocusPoint.y.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Click or drag to set the focus point. This determines which part of the image remains visible when cropped in different card layouts.
      </p>
    </div>
  );
}
