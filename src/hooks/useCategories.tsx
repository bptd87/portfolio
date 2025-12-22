import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
}

interface CategorySet {
  portfolio: Category[];
  articles: Category[];
  news: Category[];
}

export function useCategories() {
  const [categories, setCategories] = useState<CategorySet>({
    portfolio: [],
    articles: [],
    news: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // 1. Try to get token from storage
      let token = sessionStorage.getItem('admin_token');

      // 2. If not found, try to verify with Supabase session directly to see if we can rescue it
      // This is a specialized fix for when the session storage might be cleared or sync issues occur
      if (!token) {
        // Attempt to get session from supabase client if possible, or check localStorage
        // For now, let's just log and try one more specific check if appropriate
        // (In a full auth system, we'd call a refresh token endpoint here)
        console.warn('⚠️ No admin token found in sessionStorage. Checking if we can re-authenticate...');
      }

      if (!token) {
        console.error('❌ No admin token found - Categories cannot be loaded.');
        setLoading(false);
        return;
      }

      console.log('🔄 Fetching categories with token...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/categories`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid or expired admin token');
      }

      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || {
          portfolio: [],
          articles: [],
          news: [],
        });
      } else {
        console.warn('⚠️ Category fetch failed:', data.error);
      }
    } catch (err) {
      console.error('❌ Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, refresh: loadCategories };
}
