import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';

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
      scrollElRef.current = container as HTMLElement;
      return container;
    }
    // Fallback to documentElement
    scrollElRef.current = document.documentElement as HTMLElement;
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

  // Theme-aware colors
  const trackBg = isDark 
    ? 'rgba(255,255,255,0.12)' 
    : 'rgba(0,0,0,0.08)';
  const trackBorder = isDark
    ? 'rgba(255,255,255,0.15)'
    : 'rgba(0,0,0,0.1)';
  const thumbBg = isDark
    ? 'rgba(255,255,255,0.45)'
    : 'rgba(0,0,0,0.3)';
  const thumbBorder = isDark
    ? 'rgba(255,255,255,0.25)'
    : 'rgba(0,0,0,0.15)';
  const thumbShadow = isDark
    ? '0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)'
    : '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)';

  return (
    <div
      aria-hidden
      className="hidden md:block"
      style={{
        position: 'fixed',
        top: 12,
        bottom: 12,
        right: 10,
        width: 8,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 8,
          background: trackBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${trackBorder}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: thumbTop,
          right: 0,
          width: 8,
          height: thumbHeight,
          borderRadius: 8,
          background: thumbBg,
          boxShadow: thumbShadow,
          transition: 'top 50ms linear',
          border: `1px solid ${thumbBorder}`,
        }}
      />
    </div>
  );
}
