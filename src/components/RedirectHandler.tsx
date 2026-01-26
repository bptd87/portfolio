import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

// Hardcoded fallback redirects
const DEFAULT_REDIRECTS: Redirect[] = [
  { source: '/feed', destination: '/portfolio', permanent: true },
  { source: '/work', destination: '/portfolio', permanent: true },
  { source: '/privacy-policy', destination: '/privacy', permanent: true },
  { source: '/terms-of-use', destination: '/terms', permanent: true },
  { source: '/rss', destination: '/feed.xml', permanent: false },
];

export function RedirectHandler({ onNavigate }: { onNavigate: (page: string, slug?: string) => void }) {
  const [redirects, setRedirects] = useState<Redirect[]>(DEFAULT_REDIRECTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchRedirects = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/settings`,
          {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.settings && data.settings.redirects) {
            // Merge defaults with server redirects (server takes precedence if needed, or defaults? 
            // usually local overrides if we are fixing "missing" ones)
            // Let's combine them.
            setRedirects([...DEFAULT_REDIRECTS, ...data.settings.redirects]);
          }
        }
      } catch (error) {
        // Fallback to defaults already set
      } finally {
        setLoaded(true);
      }
    };

    fetchRedirects();
  }, []);



  // Separate effect to handle the redirect logic to avoid dependency issues with window.location
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Run logic whenever path changes
    const checkRedirect = () => {
      const currentPath = window.location.pathname;
      const normalizedPath = currentPath.length > 1 && currentPath.endsWith('/')
        ? currentPath.slice(0, -1)
        : currentPath;

      // 1. Exact Match Check
      const exactMatch = redirects.find(r => r.source === normalizedPath || r.source === currentPath);

      if (exactMatch) {
        performRedirect(exactMatch.destination);
        return;
      }

      // 2. Pattern Match Check (Custom Logic for Legacy Routes)
      // Fix for: /feed/tag/Name -> /news (or /search?q=Name)
      if (normalizedPath.startsWith('/feed/tag/') || normalizedPath.startsWith('/news/tag/')) {
        const tag = normalizedPath.split('/tag/')[1];
        // Redirect to search or news? User request implies these are "soft 404s", 
        // effectively they should go to News or the entity page. 
        // For now, redirecting to /news is safe, or /search?q=Tag
        // Let's redirect to /news to be safe and clean.
        performRedirect('/news');
        return;
      }

      // Fix for: /post/slug -> /articles/slug or /news/slug
      // Squarespace often used /post/
      if (normalizedPath.startsWith('/post/')) {
        const slug = normalizedPath.replace('/post/', '');
        performRedirect(`/articles/${slug}`); // Assume it is an article
        return;
      }
    };

    const performRedirect = (destination: string) => {
      if (destination.startsWith('http')) {
        window.location.href = destination;
      } else {
        // Internal redirect
        const dest = destination.startsWith('/') ? destination.substring(1) : destination;

        // Update URL immediately
        window.history.replaceState({}, '', destination);

        if (dest.includes('/')) {
          // Handle parameterized routes like /search?q=foo or /project/slug
          if (dest.includes('?')) {
            const [baseDest, query] = dest.split('?');
            if (baseDest === 'search') {
              onNavigate('search');
              return;
            }
          }

          // FIX: Pass the full path to onNavigate so App.tsx parses it as a route (e.g. articles/slug)
          // instead of splitting it here which triggers App.tsx to treat the second arg as a category filter.
          onNavigate(dest);
        } else {
          onNavigate(dest);
        }
      }
    };

    checkRedirect();
  }, [redirects]);

  return null;
}
