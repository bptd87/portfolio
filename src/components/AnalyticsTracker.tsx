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

        // Fetch basic location data (client-side)
        let locationData = { city: null, region: null, country: null };
        try {
          const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
          if (res.ok) {
            const data = await res.json();
            locationData = {
              city: data.city || null,
              region: data.region || null,
              country: data.country || null
            };
          }
        } catch (e) {
          // Ignore location fetch errors
        }

        const { error } = await supabase.from('page_views').insert({
          path: window.location.pathname,
          page_type: currentPage,
          slug: slug || null,
          referrer: document.referrer || null,
          screen_width: window.innerWidth,
          user_agent: navigator.userAgent,
          ...locationData
        } as any);

        if (error) {
          console.error('Analytics Insert Error:', error);
        }

        lastTracked.current = currentPath;
      } catch (error) {
        console.error('Analytics Error:', error);
      }
    };

    // Small delay to ensure it's a real visit and not a rapid redirect
    const timer = setTimeout(trackView, 1000);

    return () => clearTimeout(timer);
  }, [currentPage, slug]);

  return null;
}
