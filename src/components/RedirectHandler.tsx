import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

export function RedirectHandler({ onNavigate }: { onNavigate: (page: string, slug?: string) => void }) {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
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
            setRedirects(data.settings.redirects);
          }
        }
      } catch (error) {
        } finally {
        setLoaded(true);
      }
    };

    fetchRedirects();
  }, []);

  useEffect(() => {
    if (!loaded || redirects.length === 0) return;

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
        // We need to convert the path back to our app's routing format
        // e.g. /project/slug -> onNavigate('project', 'slug')
        // e.g. /about -> onNavigate('about')
        
        const dest = match.destination.startsWith('/') ? match.destination.substring(1) : match.destination;
        
        // Update URL immediately
        window.history.replaceState({}, '', match.destination);
        
        // Trigger app navigation
        // We can reuse the logic from App.tsx's deep linking, or just pass the path string
        // Since onNavigate takes (page, slug), we might need to parse it if we want to use that directly,
        // OR we can just reload the page if we want to be lazy, but that defeats the SPA purpose.
        // Better: Let App.tsx handle the string parsing.
        
        // Actually, App.tsx's handleNavigation expects (page, slug).
        // But we also have the "Deep Linking" logic in App.tsx that parses a string.
        // Let's try to parse it here simply.
        
        if (dest.includes('/')) {
          const [page, ...rest] = dest.split('/');
          const slug = rest.join('/');
          onNavigate(page, slug);
        } else {
          onNavigate(dest);
        }
      }
    }
  }, [loaded, redirects, window.location.pathname]);

  return null;
}
