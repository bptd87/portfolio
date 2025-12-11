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
  { source: '/privacy', destination: '/privacy-policy', permanent: true },
  { source: '/terms', destination: '/terms-of-use', permanent: true },
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

  useEffect(() => {
    // Even if not loaded from DB, we have defaults, so run immediately
    if (redirects.length === 0) return;

    const currentPath = window.location.pathname;
    // Normalize path: remove trailing slash unless it's root
    const normalizedPath = currentPath.length > 1 && currentPath.endsWith('/')
      ? currentPath.slice(0, -1)
      : currentPath;

    const match = redirects.find(r => {
      // Handle both with and without leading slash in config
      const source = r.source.startsWith('/') ? r.source : `/${r.source}`;
      return source === normalizedPath;
    });

    if (match) {
      // Check if destination is internal or external
      if (match.destination.startsWith('http')) {
        window.location.href = match.destination;
      } else {
        // Internal redirect
        const dest = match.destination.startsWith('/') ? match.destination.substring(1) : match.destination;

        // Update URL immediately
        window.history.replaceState({}, '', match.destination);

        if (dest.includes('/')) {
          const [page, ...rest] = dest.split('/');
          const slug = rest.join('/');
          onNavigate(page, slug);
        } else {
          onNavigate(dest);
        }
      }
    }
  }, [loaded, redirects, window.location.pathname]); // React to location changes

  return null;
}
