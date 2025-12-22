import { useState, useEffect, useRef, useCallback } from 'react';
import { Search as SearchIcon, ArrowRight, Loader2, Folder, FileText, Newspaper, Users, Wrench, Package } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';
import { publicAnonKey } from '../utils/supabase/info';
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
  { title: 'Scenic Studio', description: 'Video tutorials on Vectorworks, 3D modeling, workflow, and project walkthroughs', category: 'Pages', route: 'scenic-studio', keywords: 'tutorials vectorworks video 3d modeling workflow' },
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
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Fetch all dynamic content on mount
  useEffect(() => {
    const fetchAllContent = async () => {
      setLoading(true);
      const dynamicContent: SearchResult[] = [...staticPages];

      try {
        // Fetch projects
        const projectsRes = await fetch(`${API_BASE_URL}/api/projects`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          if (projectsData.success && projectsData.projects) {
            projectsData.projects
              .filter((p: any) => p.published !== false)
              .forEach((project: any) => {
                dynamicContent.push({
                  title: project.title,
                  description: project.description || `${project.category} design${project.venue ? ` for ${project.venue}` : ''}${project.year ? ` (${project.year})` : ''}`,
                  category: 'Projects',
                  route: `project/${project.slug || project.id}`,
                  keywords: `${project.category || ''} ${project.venue || ''} ${project.client || ''} ${project.tags?.join(' ') || ''}`,
                  image: project.cardImage || project.coverImage
                });
              });
          }
        }

        // Fetch articles
        const articlesRes = await fetch(`${API_BASE_URL}/api/articles`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (articlesRes.ok) {
          const articlesData = await articlesRes.json();
          if (articlesData.success && articlesData.articles) {
            articlesData.articles
              .filter((a: any) => a.published !== false)
              .forEach((article: any) => {
                dynamicContent.push({
                  title: article.title,
                  description: article.excerpt || article.description || 'Article on scenic design',
                  category: 'Articles',
                  route: `scenic-insights/${article.slug || article.id}`,
                  keywords: `${article.tags?.join(' ') || ''} ${article.category || ''}`,
                  image: article.coverImage
                });
              });
          }
        }

        // Fetch news
        const newsRes = await fetch(`${API_BASE_URL}/api/news`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          if (newsData.success && newsData.news) {
            newsData.news.forEach((item: any) => {
              dynamicContent.push({
                title: item.title,
                description: item.excerpt || item.description || 'News update',
                category: 'News',
                route: `news/${item.slug || item.id}`,
                keywords: `${item.tags?.join(' ') || ''} ${item.category || ''} ${item.location || ''}`,
                image: item.coverImage
              });
            });
          }
        }

        // Fetch collaborators
        const collabRes = await fetch(`${API_BASE_URL}/api/collaborators`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (collabRes.ok) {
          const collabData = await collabRes.json();
          if (collabData.collaborators) {
            collabData.collaborators.forEach((collab: any) => {
              dynamicContent.push({
                title: collab.name,
                description: `${collab.role || collab.type || 'Collaborator'}${collab.bio ? ` - ${collab.bio.substring(0, 100)}...` : ''}`,
                category: 'Collaborators',
                route: 'collaborators',
                keywords: `${collab.type || ''} ${collab.role || ''} ${collab.projects?.join(' ') || ''}`,
                image: collab.avatar
              });
            });
          }
        }

        // Fetch vault assets
        const vaultRes = await fetch(`${API_BASE_URL}/api/vault`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (vaultRes.ok) {
          const vaultData = await vaultRes.json();
          if (vaultData.assets) {
            vaultData.assets.forEach((asset: any) => {
              dynamicContent.push({
                title: asset.name,
                description: asset.description || `${asset.category || 'Asset'} - ${asset.fileType || 'Download'}`,
                category: 'Vault Assets',
                route: `scenic-vault/${asset.id}`,
                keywords: `${asset.tags?.join(' ') || ''} ${asset.category || ''} ${asset.fileType || ''}`,
                image: asset.thumbnail
              });
            });
          }
        }

        // Fetch tutorials
        const tutorialsRes = await fetch(`${API_BASE_URL}/api/tutorials`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (tutorialsRes.ok) {
          const tutorialsData = await tutorialsRes.json();
          if (tutorialsData.tutorials) {
            tutorialsData.tutorials
              .filter((t: any) => t.published !== false)
              .forEach((tutorial: any) => {
                dynamicContent.push({
                  title: tutorial.title,
                  description: tutorial.description || 'Video tutorial',
                  category: 'Tutorials',
                  route: `scenic-studio/${tutorial.slug || tutorial.id}`,
                  keywords: `${tutorial.tags?.join(' ') || ''} tutorial video`,
                  image: tutorial.thumbnail
                });
              });
          }
        }

      } catch (error) {
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
      .filter(item => activeFilters.length === 0 || activeFilters.includes(item.category)) // Apply category filters
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
              <div className="space-y-8">
                {sortedCategories.map((category) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-muted-foreground">{getCategoryIcon(category)}</span>
                      <h3 className="font-pixel text-xs tracking-[0.2em] text-muted-foreground">
                        {category.toUpperCase()}
                      </h3>
                      <span className="font-pixel text-xs text-muted-foreground/50">
                        ({groupedResults[category].length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groupedResults[category].map((item, index) => (
                        <button
                          key={`${item.route}-${index}`}
                          onClick={() => handleSearchSelect(item.route)}
                          className="w-full p-4 text-left bg-muted/50 dark:bg-muted/20 border border-border rounded-xl hover:border-foreground/30 hover:bg-muted transition-all group"
                        >
                          <div className="flex items-start gap-4">
                            {/* Thumbnail */}
                            {item.image && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h3 className="font-sans text-foreground font-medium mb-1 group-hover:text-foreground/80 transition-colors line-clamp-1">
                                {item.title}
                              </h3>
                              <p className="font-sans text-sm text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>
                            </div>

                            <ArrowRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-foreground/50 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                          </div>
                        </button>
                      ))}
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
                { label: 'Tutorials', route: 'scenic-studio', icon: <FileText className="w-5 h-5" /> },
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