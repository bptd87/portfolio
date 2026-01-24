import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import type { SEOProps } from './SEOClient';

export function SEO(props: SEOProps) {
  const [ClientComponent, setClientComponent] = useState<ComponentType<SEOProps> | null>(null);

  useEffect(() => {
    let mounted = true;
    import('./SEOClient').then((mod) => {
      if (mounted) {
        setClientComponent(() => mod.SEOClient);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!ClientComponent) {
    return null;
  }

  return <ClientComponent {...props} />;
}