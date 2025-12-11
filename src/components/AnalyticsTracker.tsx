import { useEffect, useRef } from 'react';
import { createClient } from '../utils/supabase/client';

interface AnalyticsTrackerProps {
  currentPage: string;
  slug?: string | null;
}

export function AnalyticsTracker({ currentPage, slug }: AnalyticsTrackerProps) {
  const lastTracked = useRef<string>('');

  useEffect(() => {
    // Construct a unique key for this view
    const currentPath = slug ? `${currentPage}/${slug}` : currentPage;

    // Prevent duplicate tracking of the same page (e.g. on re-renders)
    if (lastTracked.current === currentPath) return;

    // Don't track admin pages
    if (currentPage === 'admin') return;

    const trackView = async () => {
      try {
        const supabase = createClient();

        await supabase.from('page_views').insert({
          path: window.location.pathname,
          page_type: currentPage,
          slug: slug || null,
          referrer: document.referrer || null,
          screen_width: window.innerWidth,
          user_agent: navigator.userAgent
        } as any);

        lastTracked.current = currentPath;
      } catch (error) {
        // Suppress analytics errors (403/401) to prevent console noise
      }
    };

    // Small delay to ensure it's a real visit and not a rapid redirect
    const timer = setTimeout(trackView, 1000);

    return () => clearTimeout(timer);
  }, [currentPage, slug]);

  return null;
}
