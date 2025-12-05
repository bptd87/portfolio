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
      const token = sessionStorage.getItem('admin_token');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/categories`,
        {
          headers: { 
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token || ''
          },
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories || {
          portfolio: [],
          articles: [],
          news: [],
        });
      }
    } catch (err) {
      } finally {
      setLoading(false);
    }
  };

  return { categories, loading, refresh: loadCategories };
}
