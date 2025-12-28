
import React, { useState, useEffect } from 'react';
import { Building2, Code, Palette, BookOpen, FolderOpen, ExternalLink, Search } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { SEO } from '../components/SEO';

interface DirectoryLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category_slug: string;
  enabled: boolean;
  display_order: number;
}

interface DirectoryCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
}

const CATEGORY_ICONS: Record<string, any> = {
  building: Building2,
  code: Code,
  palette: Palette,
  book: BookOpen,
  folder: FolderOpen,
};

export function Directory() {
  const [links, setLinks] = useState<DirectoryLink[]>([]);
  const [categories, setCategories] = useState<DirectoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [linksRes, catsRes] = await Promise.all([
        supabase.from('directory_links').select('*').eq('enabled', true).order('display_order'),
        supabase.from('directory_categories').select('*').order('display_order')
      ]);

      if (linksRes.data) setLinks(linksRes.data);
      if (catsRes.data) setCategories(catsRes.data);
    } catch (error) {
      console.error('Error fetching directory data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter links based on search
  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    link.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group links by category
  const linksByCategory: Record<string, DirectoryLink[]> = {};
  filteredLinks.forEach(link => {
    if (!linksByCategory[link.category_slug]) {
      linksByCategory[link.category_slug] = [];
    }
    linksByCategory[link.category_slug].push(link);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <p className="font-pixel text-[10px] tracking-[0.3em] opacity-50">LOADING DIRECTORY</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <SEO 
        title="Directory | Brandon PT Davis"
        description="Curated list of scenic design resources, organizations, software, and suppliers."
      />

      {/* Header */}
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display italic text-4xl md:text-5xl mb-4">Directory</h1>
          <p className="font-sans text-foreground/60 max-w-xl mx-auto mb-8">
            A curated collection of resources, tools, and organizations for scenic designers and theatre practitioners.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-foreground/5 border border-foreground/10 rounded-full px-12 py-3 text-sm focus:outline-none focus:border-foreground/30 transition-colors"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-16">
        {categories.map(category => {
          const catLinks = linksByCategory[category.slug] || [];
          if (catLinks.length === 0) return null;

          const Icon = CATEGORY_ICONS[category.icon] || FolderOpen;

          return (
            <div key={category.id} className="scroll-mt-24" id={category.slug}>
              <div className="flex items-center gap-3 mb-6 border-b border-foreground/10 pb-4">
                <div className="bg-foreground/5 p-2 rounded-lg">
                  <Icon className="w-5 h-5 opacity-70" />
                </div>
                <div>
                  <h2 className="font-display text-xl">{category.name}</h2>
                  {category.description && (
                    <p className="text-xs text-foreground/50 font-sans">{category.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catLinks.map(link => (
                  <a 
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-foreground/5 hover:bg-foreground/10 border border-transparent hover:border-foreground/20 rounded-xl p-5 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium pr-2 group-hover:text-amber-500 transition-colors">
                        {link.title}
                      </h3>
                      <ExternalLink className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {link.description && (
                      <p className="text-sm text-foreground/60 leading-relaxed line-clamp-2">
                        {link.description}
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-foreground/5 flex items-center gap-2">
                      <span className="text-[10px] font-pixel tracking-wider opacity-40 uppercase">
                        {new URL(link.url).hostname.replace('www.', '')}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        {filteredLinks.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <p>No resources found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Directory;
