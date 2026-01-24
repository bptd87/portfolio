import { useEffect, useRef, useState } from 'react';
import { X, Search as SearchIcon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, filter?: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'article' | 'project' | 'page';
  page: string;
  filter?: string;
  description?: string;
}

export function SearchModal({ isOpen, onClose, onNavigate }: SearchModalProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  // Mock search results - expand with real data
  const allSearchable: SearchResult[] = [
    {
      id: '1',
      title: 'Scenic Design Portfolio',
      type: 'project',
      page: 'portfolio',
      filter: 'scenic',
      description: 'Browse scenic design work',
    },
    {
      id: '2',
      title: 'Experiential Projects',
      type: 'project',
      page: 'portfolio',
      filter: 'experiential',
      description: 'Explore experiential design',
    },
    {
      id: '3',
      title: 'Renderings',
      type: 'project',
      page: 'portfolio',
      filter: 'rendering',
      description: 'View 3D renderings',
    },
    {
      id: '4',
      title: 'Design Philosophy',
      type: 'article',
      page: 'articles',
      filter: 'design-philosophy',
      description: 'Articles about design philosophy',
    },
    {
      id: '5',
      title: 'Scenic Design Process',
      type: 'article',
      page: 'articles',
      filter: 'scenic-design-process',
      description: 'Learn the design process',
    },
    {
      id: '6',
      title: 'Technology & Tutorials',
      type: 'article',
      page: 'articles',
      filter: 'technology-tutorials',
      description: 'Technical guides and tutorials',
    },
    {
      id: '7',
      title: 'Experiential Design Articles',
      type: 'article',
      page: 'articles',
      filter: 'experiential-design',
      description: 'Experiential design insights',
    },
    {
      id: '8',
      title: 'Scenic Studio',
      type: 'page',
      page: 'scenic-studio',
      description: 'Access design tools and resources',
    },
    {
      id: '9',
      title: 'About',
      type: 'page',
      page: 'about',
      description: 'Learn more about Brandon',
    },
    {
      id: '10',
      title: 'Teaching Philosophy',
      type: 'page',
      page: 'teaching-philosophy',
      description: 'Teaching approach and values',
    },
  ];

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allSearchable.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );

    setResults(filtered);
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? results.length - 1 : prev - 1
        );
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        const result = results[selectedIndex];
        onNavigate(result.page, result.filter);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onNavigate, onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-start justify-center pt-20 px-4">
        <div
          className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ${
            isDark
              ? 'bg-neutral-900 border border-neutral-800/50'
              : 'bg-white border border-neutral-200/50'
          }`}
        >
          {/* Search Input */}
          <div
            className={`flex items-center gap-3 px-6 py-4 border-b ${
              isDark
                ? 'border-neutral-800/30'
                : 'border-neutral-200/30'
            }`}
          >
            <SearchIcon
              className={`w-5 h-5 flex-shrink-0 ${
                isDark ? 'text-white/40' : 'text-neutral-400'
              }`}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search articles, projects, pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none font-pixel text-sm tracking-[0.08em] placeholder-opacity-50 ${
                isDark
                  ? 'text-white placeholder-white/40'
                  : 'text-neutral-900 placeholder-neutral-400'
              }`}
            />
            <button
              onClick={onClose}
              className={`p-1 hover:opacity-70 transition-opacity ${
                isDark ? 'text-white/60' : 'text-neutral-600'
              }`}
              title="Close search"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      onNavigate(result.page, result.filter);
                      onClose();
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-150 font-pixel text-sm ${
                      index === selectedIndex
                        ? isDark
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-800/20 text-neutral-900'
                        : isDark
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-800/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        result.type === 'article'
                          ? isDark
                            ? 'bg-blue-900/40 text-blue-300'
                            : 'bg-blue-100 text-blue-700'
                          : result.type === 'project'
                          ? isDark
                            ? 'bg-purple-900/40 text-purple-300'
                            : 'bg-purple-100 text-purple-700'
                          : isDark
                          ? 'bg-green-900/40 text-green-300'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {result.type.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold">{result.title}</div>
                        {result.description && (
                          <div className={`text-xs mt-1 ${
                            isDark ? 'text-white/50' : 'text-neutral-500'
                          }`}>
                            {result.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className={`px-6 py-8 text-center ${
                isDark ? 'text-white/50' : 'text-neutral-500'
              }`}>
                <p className="font-pixel text-sm">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className={`px-6 py-8 text-center ${
                isDark ? 'text-white/50' : 'text-neutral-500'
              }`}>
                <p className="font-pixel text-sm mb-4">Start typing to search</p>
                <div className="space-y-2 text-xs">
                  <p>Try searching for:</p>
                  <ul className="list-disc list-inside">
                    <li>Portfolio types (scenic, experiential, renderings)</li>
                    <li>Article topics (design, philosophy, technology)</li>
                    <li>Pages (about, studio, contact)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className={`px-6 py-3 border-t text-xs text-center font-pixel tracking-[0.08em] ${
              isDark
                ? 'border-neutral-800/30 text-white/40'
                : 'border-neutral-200/30 text-neutral-500'
            }`}>
              ↑↓ NAVIGATE • ENTER SELECT • ESC CLOSE
            </div>
          )}
        </div>
      </div>
    </>
  );
}
