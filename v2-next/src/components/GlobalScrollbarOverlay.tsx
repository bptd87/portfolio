import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme';

// A lightweight overlay scrollbar that sits on top of content
// and mirrors the scroll position of either the page or a main container.
// Pointer events are disabled so it never blocks interaction.

export function GlobalScrollbarOverlay() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [metrics, setMetrics] = useState({
    scrollTop: 0,
    scrollHeight: 1,
    clientHeight: 1,
  });
  const scrollElRef = useRef<HTMLElement | null>(null);
  const resizeObsRef = useRef<ResizeObserver | null>(null);

  const scrollEl = useMemo(() => {
    const container = document.getElementById('home-scroll-container');
    if (container && container.scrollHeight > container.clientHeight) {
      return container;
    }
    // Fallback to documentElement
    return document.documentElement as HTMLElement;
  }, []);

  useEffect(() => {
    const update = () => {
      const el = scrollElRef.current || scrollEl;
      if (!el) return;
      const scrollTop = el === document.documentElement ? window.scrollY : (el as HTMLElement).scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      setMetrics({ scrollTop, scrollHeight, clientHeight });
    };

    // Initial and on events
    update();
    const onScroll = () => update();
    if (scrollEl === document.documentElement) {
      window.addEventListener('scroll', onScroll, { passive: true });
    } else {
      scrollEl.addEventListener('scroll', onScroll, { passive: true });
    }

    // Observe size changes
    const ro = new ResizeObserver(() => update());
    ro.observe(scrollEl);
    resizeObsRef.current = ro;

    // Cleanup
    return () => {
      if (scrollEl === document.documentElement) {
        window.removeEventListener('scroll', onScroll);
      } else {
        scrollEl.removeEventListener('scroll', onScroll);
      }
      ro.disconnect();
    };
  }, [scrollEl]);

  const ratio = metrics.scrollHeight > metrics.clientHeight
    ? metrics.clientHeight / metrics.scrollHeight
    : 1;
  const thumbHeight = Math.max(40, Math.floor(window.innerHeight * ratio));
  const maxScroll = Math.max(1, metrics.scrollHeight - metrics.clientHeight);
  const thumbTop = Math.floor((metrics.scrollTop / maxScroll) * (window.innerHeight - thumbHeight));

  // Glass effect similar to navbar
  const scrollbarClasses = isDark 
    ? 'backdrop-blur-xl bg-white/20 border-white/30' 
    : 'backdrop-blur-xl bg-neutral-800/20 border-neutral-800/30';
  
  const thumbClasses = isDark
    ? 'backdrop-blur-xl bg-white/80 border-white shadow-lg shadow-white/50'
    : 'backdrop-blur-xl bg-neutral-800/80 border-neutral-800 shadow-lg';

  // Only show if there's scrollable content
  if (metrics.scrollHeight <= metrics.clientHeight) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="hidden md:block"
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        width: 14,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    >
      {/* Track */}
      <div
        className={scrollbarClasses}
        style={{
          position: 'absolute',
          top: 8,
          bottom: 8,
          right: 2,
          width: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderStyle: 'solid',
        }}
      />
      {/* Thumb */}
      <div
        className={thumbClasses}
        style={{
          position: 'absolute',
          top: 8 + thumbTop,
          right: 2,
          width: 12,
          height: thumbHeight,
          borderRadius: 12,
          borderWidth: 1.5,
          borderStyle: 'solid',
          transition: 'top 50ms linear',
        }}
      />
    </div>
  );
}
