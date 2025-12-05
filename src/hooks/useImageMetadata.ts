import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';

interface MediaMetadata {
  alt_text?: string;
  caption?: string;
  seo_description?: string;
  tags?: string[];
}

// Simple in-memory cache to prevent redundant fetches
const metadataCache: Record<string, MediaMetadata> = {};

export function useImageMetadata(src: string) {
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!src) return;

    // 1. Check cache first
    if (metadataCache[src]) {
      setMetadata(metadataCache[src]);
      return;
    }

    // 2. Parse bucket and path from URL
    // Expected format: .../storage/v1/object/public/[bucket]/[path/to/file]
    try {
      const url = new URL(src);
      const pathParts = url.pathname.split('/storage/v1/object/public/');
      
      if (pathParts.length < 2) return; // Not a Supabase storage URL

      const fullPath = pathParts[1]; // e.g. "portfolio/project-1/image.jpg"
      const [bucket, ...rest] = fullPath.split('/');
      const filePath = rest.join('/'); // e.g. "project-1/image.jpg"

      if (!bucket || !filePath) return;

      const fetchMetadata = async () => {
        setLoading(true);
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('media_library')
          .select('alt_text, caption, seo_description, tags')
          .eq('bucket_id', bucket)
          .eq('file_path', filePath)
          .single();

        if (data && !error) {
          const row = data as { alt_text?: string; caption?: string; seo_description?: string; tags?: string[] };
          const meta: MediaMetadata = {
            alt_text: row.alt_text,
            caption: row.caption,
            seo_description: row.seo_description,
            tags: row.tags
          };
          metadataCache[src] = meta;
          setMetadata(meta);
        }
        setLoading(false);
      };

      fetchMetadata();
    } catch (e) {
      // Invalid URL or other error, ignore
    }
  }, [src]);

  return { metadata, loading };
}
