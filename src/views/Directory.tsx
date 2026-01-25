
import React, { useState, useEffect } from 'react';
import { Building2, Code, Palette, BookOpen, FolderOpen, ExternalLink, Search, Send, PlusCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { SEO } from '../components/SEO';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface DirectoryLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category_slug: string;
  enabled: boolean;
  display_order: number;
  likes?: number;
}

interface DirectoryCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
}

// Map icons to colors for "a little bit of color"
const CATEGORY_STYLES: Record<string, { icon: any, color: string, bg: string }> = {
  building: { icon: Building2, color: 'text-green-400', bg: 'bg-green-400/10' },
  code: { icon: Code, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  palette: { icon: Palette, color: 'text-red-400', bg: 'bg-red-400/10' },
  book: { icon: BookOpen, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  folder: { icon: FolderOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
};

export function Directory() {
  const [links, setLinks] = useState<DirectoryLink[]>([]);
  const [categories, setCategories] = useState<DirectoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Suggestion Form State
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({ title: '', url: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    // Load liked IDs from local storage to prevent spamming (basic client-side check)
    const stored = localStorage.getItem('directory_liked_ids');
    if (stored) {
      setLikedIds(new Set(JSON.parse(stored)));
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [linksRes, catsRes] = await Promise.all([
        supabase.from('directory_links').select('*').eq('enabled', true),
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

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent opening link
    e.stopPropagation();

    if (likedIds.has(id)) return; // Already liked

    // Optimistic Update
    setLinks(prev => prev.map(l => l.id === id ? { ...l, likes: (l.likes || 0) + 1 } : l));
    
    // Update Local State
    const newLiked = new Set(likedIds);
    newLiked.add(id);
    setLikedIds(newLiked);
    localStorage.setItem('directory_liked_ids', JSON.stringify(Array.from(newLiked)));

    try {
      const { error } = await supabase.rpc('increment_directory_link_likes', { link_id: id });
      if (error) throw error;
      toast.success('Thanks for the vote!');
    } catch (err) {
      console.error('Failed to like:', err);
      // Revert if needed, but for likes usually okay to just ignore error visually
    }
  };

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionForm.title || !suggestionForm.url) {
      toast.error('Please provide a title and URL.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('directory_suggestions').insert({
        title: suggestionForm.title,
        url: suggestionForm.url,
        description: suggestionForm.description,
        status: 'pending'
      });
      if (error) throw error;
      toast.success('Suggestion sent! Thank you for contributing.');
      setSuggestionForm({ title: '', url: '', description: '' });
      setSuggestionOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit suggestion.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter links
  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (link.description && link.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group by category and Sort
  const linksByCategory: Record<string, DirectoryLink[]> = {};
  filteredLinks.forEach(link => {
    if (!linksByCategory[link.category_slug]) {
      linksByCategory[link.category_slug] = [];
    }
    linksByCategory[link.category_slug].push(link);
  });

  // Sort each category: Likes DESC, then Title ASC
  Object.keys(linksByCategory).forEach(key => {
    linksByCategory[key].sort((a, b) => {
      const likesA = a.likes || 0;
      const likesB = b.likes || 0;
      if (likesA !== likesB) return likesB - likesA; // Highest likes first
      return a.title.localeCompare(b.title);
    });
  });

  // Generate structured data for the list
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Scenic Design Directory",
    "description": "A curated directory of scenic design resources, software, organizations, and research archives.",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": categories.flatMap((cat, catIndex) => {
          const catLinks = linksByCategory[cat.slug] || [];
          return catLinks.map((link, linkIndex) => ({
            "@type": "ListItem",
            "position": (catIndex * 100) + linkIndex + 1,
            "url": link.url,
            "name": link.title,
            "description": link.description
          }));
      })
    }
  };

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
        description="A curated directory of scenic design resources, software, organizations, and research archives."
        keywords={['scenic design', 'theatre directory', 'scenography resources', 'drafting software', 'prop suppliers']}
        structuredData={structuredData}
      />

      {/* Hero */}
      <div className="pt-32 pb-12 px-6 border-b border-foreground/5 dark:border-white/5">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display italic text-4xl md:text-6xl mb-4">Directory</h1>
          <p className="font-sans text-lg text-foreground/60 max-w-2xl mb-8">
             A living collection of tools, organizations, and resources for the scenic community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Filter resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-12 py-3 text-sm focus:outline-none focus:border-foreground/30 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            </div>
            
            {/* Suggest Button */}
            <button 
              onClick={() => setSuggestionOpen(!suggestionOpen)}
              className="px-6 py-3 rounded-xl bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 border border-yellow-400/20 transition-all text-sm font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              Suggest Resource
            </button>
          </div>
        </div>
      </div>

      {/* Suggestion Form Drawer */}
      <AnimatePresence>
        {suggestionOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-yellow-400/20 bg-yellow-400/5 overflow-hidden"
          >
            <div className="max-w-xl mx-auto py-8 px-6">
              <h3 className="font-display italic text-xl mb-4 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit to the Directory
              </h3>
              <form onSubmit={handleSuggest} className="space-y-4">
                <input 
                  required
                  placeholder="Resource Title"
                  value={suggestionForm.title}
                  onChange={e => setSuggestionForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-2 focus:ring-1 focus:ring-yellow-400 outline-none"
                />
                <input 
                  required
                  type="url"
                  placeholder="https://..."
                  value={suggestionForm.url}
                  onChange={e => setSuggestionForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-2 focus:ring-1 focus:ring-yellow-400 outline-none"
                />
                <textarea 
                  placeholder="Why is this useful? (Optional)"
                  rows={2}
                  value={suggestionForm.description}
                  onChange={e => setSuggestionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-2 focus:ring-1 focus:ring-yellow-400 outline-none resize-none"
                />
                <div className="flex justify-end gap-2">
                   <button 
                    type="button"
                    onClick={() => setSuggestionOpen(false)}
                    className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-white text-black font-bold rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Submit Suggestion'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main List */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {categories.map(category => {
          const catLinks = linksByCategory[category.slug] || [];
          if (catLinks.length === 0) return null;

          // Resolve style or fallback
          const style = CATEGORY_STYLES[category.icon] || CATEGORY_STYLES.folder;
          const Icon = style.icon;

          return (
            <div key={category.id} id={category.slug} className="scroll-mt-32">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${style.bg}`}>
                  <Icon className={`w-5 h-5 ${style.color}`} />
                </div>
                <h2 className="font-display text-2xl tracking-wide">{category.name}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-foreground/10 to-transparent ml-4" />
              </div>

              {/* List Group */}
              <div className="flex flex-col divide-y divide-foreground/5 border-l border-foreground/5 ml-3 pl-0">
                {catLinks.map(link => {
                  const isLiked = likedIds.has(link.id);
                  return (
                    <a 
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-4 px-4 hover:bg-foreground/5 -ml-px border-l border-transparent hover:border-l-yellow-400 transition-all duration-200"
                    >
                      {/* Title */}
                      <div className="sm:w-1/3 flex-shrink-0 font-medium text-lg leading-tight group-hover:text-yellow-400 transition-colors flex items-center gap-2">
                         {link.title}
                         <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </div>

                      {/* Description */}
                      <div className="flex-1 text-sm text-foreground/60 group-hover:text-foreground/80 leading-relaxed font-sans mt-1 sm:mt-0">
                        {link.description}
                      </div>

                      {/* Actions/Meta */}
                      <div className="flex items-center gap-4 self-start sm:self-center mt-2 sm:mt-0">
                        {/* Likes */}
                        <button
                          onClick={(e) => handleLike(link.id, e)}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-foreground/20 hover:text-red-500'}`}
                          title="Vote for this resource"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill={isLiked ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="w-4 h-4"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                          <span>{link.likes || 0}</span>
                        </button>

                        {/* Domain */}
                        <div className="hidden sm:block text-[10px] font-pixel uppercase tracking-widest opacity-20 group-hover:opacity-40 whitespace-nowrap">
                           {new URL(link.url).hostname.replace('www.', '')}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredLinks.length === 0 && (
          <div className="text-center py-20 opacity-50 flex flex-col items-center gap-4">
             <AlertCircle className="w-12 h-12 stroke-[1]" />
             <p>No resources found for "{searchQuery}"</p>
             <button onClick={() => setSearchQuery('')} className="text-amber-500 hover:underline">Clear search</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Directory;
