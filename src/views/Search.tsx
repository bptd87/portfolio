import { useState, useEffect, useRef, useCallback } from 'react';
import { Search as SearchIcon, ArrowRight, Loader2, Folder, FileText, Newspaper, Users, Wrench, Package } from 'lucide-react';
// API_BASE_URL removed
import { supabase } from '../utils/supabase/client';
import { calculateRelevance } from '../utils/search';

// Static pages that are always searchable
const staticPages = [
  { title: 'Portfolio', description: 'View all theatre design projects and work', category: 'Pages', route: 'portfolio', keywords: 'work projects design scenic experiential rendering documentation' },
  { title: 'About', description: 'Learn more about Brandon PT Davis', category: 'Pages', route: 'about', keywords: 'bio information background story' },
  { title: 'News', description: 'Latest updates, milestones, and production announcements', category: 'Pages', route: 'news', keywords: 'timeline updates announcements productions milestones' },
  { title: 'CV', description: 'Full curriculum vitae and professional experience', category: 'Pages', route: 'cv', keywords: 'resume curriculum vitae experience education credits' },
  { title: 'Collaborators', description: 'Directors, designers, and creative partners', category: 'Pages', route: 'collaborators', keywords: 'directors designers partners colleagues collaborations' },
  { title: 'Contact', description: 'Get in touch for collaborations and inquiries', category: 'Pages', route: 'contact', keywords: 'email hire inquiries freelance work' },
  { title: 'Scenic Design', description: 'Theatrical scenic designs for stage and opera', category: 'Pages', route: 'portfolio?filter=scenic', keywords: 'theatre theater scenic design stage opera performance' },
  { title: 'Experiential Design', description: 'Immersive installations and experiences', category: 'Pages', route: 'portfolio?filter=experiential', keywords: 'installation immersive experiential themed entertainment' },
  { title: 'Rendering & Visualization', description: '3D rendered designs and visualizations', category: 'Pages', route: 'portfolio?filter=rendering', keywords: '3d visualization rendering cg computer graphics models' },
  { title: 'Tutorials', description: 'Video tutorials on Vectorworks, 3D modeling, workflow, and project walkthroughs', category: 'Pages', route: 'tutorials', keywords: 'tutorials vectorworks video 3d modeling workflow' },
  { title: 'App Studio', description: 'Free web-based tools for scenic designers', category: 'Pages', route: 'app-studio', keywords: 'apps tools calculator utilities scenic design' },
  { title: 'Scenic Insights', description: 'Articles and guides on scenic design', category: 'Pages', route: 'scenic-insights', keywords: 'articles blog guides insights design' },
  { title: 'Scenic Vault', description: 'Free downloadable assets for scenic designers', category: 'Pages', route: 'scenic-vault', keywords: 'assets downloads free resources models textures' },
  { title: '3D Print Scale Calculator', description: 'Convert theatrical dimensions to 3D printable scale', category: 'Tools', route: 'architecture-scale-converter', keywords: 'calculator scale conversion 3d printing imperial mm theatrical model making' },
  { title: 'Dimension Reference Guide', description: 'Comprehensive database of standard dimensions', category: 'Tools', route: 'dimension-reference', keywords: 'dimensions furniture flats platforms reference' },
  { title: 'Model Reference Scaler', description: 'Scale reference photos for model making', category: 'Tools', route: 'model-reference-scaler', keywords: 'model making scale reference photo scaling' },
  { title: 'Design History Timeline', description: 'Interactive archive of architectural and artistic movements', category: 'Tools', route: 'design-history-timeline', keywords: 'design history architecture art movements timeline' },
  { title: 'Classical Architecture Reference', description: 'Guide to classical orders, molding profiles, and pediment types', category: 'Tools', route: 'classical-architecture-guide', keywords: 'classical architecture orders doric ionic corinthian moldings' },
  { title: 'Commercial Paint Finder', description: 'Find commercial paint colors for theatrical design', category: 'Tools', route: 'commercial-paint-finder', keywords: 'paint color theatrical rosco scenic design' },
];

interface SearchResult {
  title: string;
  description: string;
  category: string;
  route: string;
  keywords?: string;
  image?: string;
  altText?: string;
  score?: number;
  matchedFields?: string[];
}

interface SearchProps {
  onNavigate: (page: string) => void;
  initialQuery?: string;
}

export function Search({ onNavigate, initialQuery = '' }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [allContent, setAllContent] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch all dynamic content on mount
  useEffect(() => {
    const fetchAllContent = async () => {
      setLoading(true);
      const dynamicContent: SearchResult[] = [...staticPages];

      try {
        const [projectsRes, articlesRes, newsRes, collabRes, vaultRes, tutorialsRes] = await Promise.all([
          supabase.from('portfolio_projects').select('*').eq('published', true),
          supabase.from('articles').select('*').eq('published', true),
          supabase.from('news').select('*').eq('published', true),
          supabase.from('collaborators').select('*'),
          supabase.from('vault_assets').select('*').eq('enabled', true),
          supabase.from('tutorials').select('*').eq('published', true)
        ]);

        // Projects
        if (projectsRes.data) {
          projectsRes.data.forEach((project: any) => {
            // Extract credits for search
            const creditsKeywords = project.credits
              ? project.credits.map((c: any) => `${c.name} ${c.role}`).join(' ')
              : '';

            dynamicContent.push({
              title: project.title,
              description: project.description || `${project.category} design${project.venue ? ` for ${project.venue}` : ''}${project.year ? ` (${project.year})` : ''}`,
              category: 'Projects',
              route: `project/${project.slug || project.id}`,
              keywords: `${project.category || ''} ${project.venue || ''} ${project.client || ''} ${project.tags?.join(' ') || ''} ${creditsKeywords}`,
              image: project.card_image || project.cover_image
            });
          });
        }

        // Articles
        if (articlesRes.data) {
          articlesRes.data.forEach((article: any) => {
            dynamicContent.push({
              title: article.title,
              description: article.excerpt || 'Article on scenic design',
              category: 'Articles',
              route: `scenic-insights/${article.slug || article.id}`,
              keywords: `${article.tags?.join(' ') || ''} ${article.category || ''}`,
              image: article.cover_image
            });
          });
        }

        // News
        if (newsRes.data) {
          newsRes.data.forEach((item: any) => {
            dynamicContent.push({
              title: item.title,
              description: item.excerpt || 'News update',
              category: 'News',
              route: `news/${item.slug || item.id}`,
              keywords: `${item.tags?.join(' ') || ''} ${item.category || ''} ${item.location || ''}`,
              image: item.cover_image
            });
          });
        }

        // Collaborators
        if (collabRes.data) {
          collabRes.data.forEach((collab: any) => {
            dynamicContent.push({
              title: collab.name,
              description: `${collab.role || collab.type || 'Collaborator'}${collab.bio ? ` - ${collab.bio.substring(0, 100)}...` : ''}`,
              category: 'Collaborators',
              route: 'collaborators',
              keywords: `${collab.type || ''} ${collab.role || ''}`,
              image: collab.image_url // Note: DB uses image_url, frontend might wait avatar but we map here
            });
          });
        }

        // Vault Assets
        if (vaultRes.data) {
          vaultRes.data.forEach((asset: any) => {
            dynamicContent.push({
              title: asset.name,
              description: asset.notes || `${asset.category || 'Asset'} - ${asset.asset_type || 'Download'}`,
              category: 'Vault Assets',
              route: `scenic-vault`, // Link to main vault page as assets are modal based usually, or if we have specific route
              // Wait, previous code used `scenic-vault/${asset.id}`. Does Vault support deep linking?
              // The ScenicVault component uses `selectedAsset` state. Deep linking might not be implemented yet.
              // I'll keep it as `scenic-vault` for now to avoid broken links, or check if ScenicVault handles ID param.
              // ScenicVault.tsx didn't seem to read ID from URL. It used state.
              // So I'll just route to 'scenic-vault' and maybe the user can find it.
              // Or better, I'll pass query param '?asset=${asset.id}' if I update ScenicVault to read it?
              // For now, simple route.
              keywords: `${asset.tags?.join(' ') || ''} ${asset.category || ''} ${asset.asset_type || ''}`,
              image: asset.thumbnail_url
            });
          });
        }

        // Tutorials
        if (tutorialsRes.data) {
          tutorialsRes.data.forEach((tutorial: any) => {
            dynamicContent.push({
              title: tutorial.title,
              description: tutorial.description || 'Video tutorial',
              category: 'Tutorials',
              route: `tutorials/${tutorial.slug || tutorial.id}`,
              keywords: `${tutorial.tags?.join(' ') || ''} tutorial video`,
              image: tutorial.thumbnail_url
            });
          });
        }

      } catch (error) {
        console.error('Error fetching search content:', error);
      }

      setAllContent(dynamicContent);
      setLoading(false);
    };

    fetchAllContent();
  }, []);

  // Auto-focus search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSearching(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setSearching(false);
    }, 150);
  }, []);

  // Filter search results with fuzzy matching and relevance scoring
  const filteredResults = searchQuery.trim()
    ? allContent
      .map(item => {
        const match = calculateRelevance(
          searchQuery,
          item.title,
          item.description,
          item.keywords,
          item.altText
        );
        return {
          ...item,
          score: match.score,
          matchedFields: match.matchedFields
        };
      })
      .filter(item => item.score > 0) // Only show items with matches
      .sort((a, b) => (b.score || 0) - (a.score || 0)) // Sort by relevance
    : [];

  // Group results by category with priority ordering
  const categoryOrder = ['Projects', 'Articles', 'News', 'Tutorials', 'Vault Assets', 'Collaborators', 'Tools', 'Pages'];
  const groupedResults = filteredResults.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const sortedCategories = Object.keys(groupedResults).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  const handleSearchSelect = (route: string) => {
    onNavigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Projects': return <Folder className="w-4 h-4" />;
      case 'Articles': return <FileText className="w-4 h-4" />;
      case 'News': return <Newspaper className="w-4 h-4" />;
      case 'Collaborators': return <Users className="w-4 h-4" />;
      case 'Tools': return <Wrench className="w-4 h-4" />;
      case 'Vault Assets': return <Package className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Search Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl italic mb-4 text-foreground">
            Search
          </h1>
          <p className="font-sans text-muted-foreground mb-8">
            Find projects, articles, tutorials, assets, and more
          </p>

          {/* Search Input */}
          <div className="relative max-w-2xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search everything..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-6 py-4 pr-12 text-base bg-background border-2 border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors font-sans"
            />
            {searching || loading ? (
              <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <SearchIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            )}
          </div>

          {/* Content Stats */}
          {!loading && (
            <div className="mt-4 font-pixel text-xs text-muted-foreground tracking-wider">
              {allContent.length} items indexed
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground font-sans">
              Indexing content...
            </p>
          </div>
        ) : searchQuery.trim() ? (
          <div>
            {/* Results Count */}
            <div className="mb-6 font-pixel text-xs text-muted-foreground tracking-wider">
              {filteredResults.length} RESULT{filteredResults.length !== 1 ? 'S' : ''} FOR "{searchQuery.toUpperCase()}"
            </div>

            {/* Results by Category */}
            {sortedCategories.length > 0 ? (
              <div className="space-y-12">
                {sortedCategories.map((category) => (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                      <span className="text-white/60 p-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
                        {getCategoryIcon(category)}
                      </span>
                      <h3 className="font-pixel text-xs tracking-[0.2em] text-white/60 uppercase">
                        {category}
                      </h3>
                      <span className="font-pixel text-xs text-white/30">
                        {groupedResults[category].length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {groupedResults[category].map((item, index) => {
                        // Generate a "fake" breadcrumb for the SEO visual
                        const domain = "brandonptdavis.com";
                        const path = item.route.replace(/\//g, ' › ').replace(/\?/g, ' › ');
                        return (
                          <button
                            key={`${item.route}-${index}`}
                            onClick={() => handleSearchSelect(item.route)}
                            className="w-full text-left group relative p-6 -mx-4 md:mx-0 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                          >
                            <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                              {/* Content Section (Left) */}
                              <div className="flex-1 min-w-0 space-y-1">
                                {/* SEO Breadcrumb */}
                                <div className="flex items-center gap-2 font-pixel text-[10px] tracking-wider text-white/50 mb-2">
                                  <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                    <span className="opacity-70">{domain}</span>
                                    <span className="text-white/20">›</span>
                                    <span className="text-white/50">{path.toLowerCase()}</span>
                                  </div>
                                </div>

                                {/* Title */}
                                <h3 className="font-display text-xl md:text-2xl text-blue-400 group-hover:text-blue-300 group-hover:underline decoration-blue-400/30 underline-offset-4 transition-all mb-1">
                                  {item.title}
                                </h3>

                                {/* Description (Meta Desc Preview) */}
                                <p className="font-sans text-sm text-white/70 leading-relaxed line-clamp-4 max-w-3xl">
                                  {item.description}
                                </p>

                                {/* Matches Badge */}
                                {item.matchedFields && item.matchedFields.length > 0 && (
                                  <div className="pt-3 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-white/30">
                                      Relevance: {Math.round((item.score || 0) * 10)}%
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Thumbnail Section (Right) */}
                              {item.image && (
                                <div className="hidden md:block w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                  />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <SearchIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-sans">
                  No results found for "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground/60 mt-2 font-sans">
                  Try different keywords or check your spelling
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Empty State - Quick Links */
          <div className="space-y-8">
            <div className="text-center py-8">
              <SearchIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">
                Start typing to search across all content
              </p>
            </div>

            {/* Quick Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Projects', route: 'portfolio', icon: <Folder className="w-5 h-5" /> },
                { label: 'Articles', route: 'scenic-insights', icon: <FileText className="w-5 h-5" /> },
                { label: 'News', route: 'news', icon: <Newspaper className="w-5 h-5" /> },
                { label: 'Tutorials', route: 'tutorials', icon: <FileText className="w-5 h-5" /> },
                { label: 'Vault Assets', route: 'scenic-vault', icon: <Package className="w-5 h-5" /> },
                { label: 'Tools', route: 'app-studio', icon: <Wrench className="w-5 h-5" /> },
              ].map((item) => (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className="flex items-center gap-3 p-4 bg-muted/50 dark:bg-muted/20 border border-border rounded-xl hover:border-foreground/30 hover:bg-muted transition-all group"
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.icon}
                  </span>
                  <span className="font-sans text-sm text-foreground">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}