import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Sparkles, ArrowRight, Loader2, BookOpen, Layers } from 'lucide-react';

interface Result {
    id: string;
    title: string;
    slug: string;
    type: 'project' | 'tutorial';
}

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: string) => void;
}

export function SearchOverlay({ isOpen, onClose, onNavigate }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ projects: Result[], tutorials: Result[], articles: Result[], news: Result[] }>({ projects: [], tutorials: [], articles: [], news: [] });
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            // Lock scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            setQuery('');
            setResults({ projects: [], tutorials: [], articles: [], news: [] });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                // Toggle search? This depends on how it's called
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (response.ok) {
                const data = await response.json();
                setResults({
                    projects: data.projects.map((p: any) => ({ ...p, type: 'project' })),
                    tutorials: data.tutorials.map((t: any) => ({ ...t, type: 'tutorial' })),
                    articles: data.articles.map((a: any) => ({ ...a, type: 'article' })),
                    news: data.news.map((n: any) => ({ ...n, type: 'news' })),
                });
            }
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResultClick = (result: Result | any) => {
        onClose();
        if (result.type === 'project') {
            onNavigate(`project/${result.slug}`);
        } else if (result.type === 'tutorial') {
            onNavigate(`tutorials/${result.slug}`);
        } else if (result.type === 'article') {
            onNavigate(`articles/${result.slug}`);
        } else if (result.type === 'news') {
            onNavigate(`news/${result.slug}`);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-6 md:px-0"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: -20, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -20, opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10"
                    >
                        <form onSubmit={handleSearch} className="p-6 border-b border-white/10 relative">
                            <div className="absolute left-10 top-1/2 -translate-y-1/2">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 text-accent-brand animate-spin" />
                                ) : (
                                    <Sparkles className="w-5 h-5 text-accent-brand" />
                                )}
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask my portfolio anything... (e.g. 'moody lighting' or '3D drafting')"
                                className="w-full bg-neutral-800/50 border-0 focus:ring-2 focus:ring-accent-brand rounded-2xl py-4 pl-14 pr-12 text-white placeholder-white/20 text-lg outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                                aria-label="Close search"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </form>

                        {/* Results Area */}
                        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                            {!query && (
                                <div className="py-12 text-center space-y-4">
                                    <p className="text-white/40 font-pixel text-[10px] tracking-[0.2em]">SUGGESTED SEARCHES</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {['Modern Drama', 'Musical Theatre', 'Drafting Tips', '3D Visualization'].map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    setQuery(tag);
                                                    // We should trigger search manually here too
                                                }}
                                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white/60 text-sm rounded-full transition-colors"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {query && results.projects.length === 0 && results.tutorials.length === 0 && results.articles.length === 0 && results.news.length === 0 && !isLoading && (
                                <div className="py-12 text-center">
                                    <p className="text-white/40 italic">No exact matches found. Try a different concept.</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {results.projects.length > 0 && (
                                    <div>
                                        <h3 className="px-4 mb-3 text-[10px] font-pixel tracking-[0.3em] text-white/20 uppercase">Projects</h3>
                                        {results.projects.map((project) => (
                                            <SearchResultItem
                                                key={project.id}
                                                result={project}
                                                onClick={() => handleResultClick(project)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {results.tutorials.length > 0 && (
                                    <div>
                                        <h3 className="px-4 mb-3 text-[10px] font-pixel tracking-[0.3em] text-white/20 uppercase">Tutorials</h3>
                                        {results.tutorials.map((tutorial) => (
                                            <SearchResultItem
                                                key={tutorial.id}
                                                result={tutorial}
                                                onClick={() => handleResultClick(tutorial)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {results.articles.length > 0 && (
                                    <div>
                                        <h3 className="px-4 mb-3 text-[10px] font-pixel tracking-[0.3em] text-white/20 uppercase">Articles</h3>
                                        {results.articles.map((article) => (
                                            <SearchResultItem
                                                key={article.id}
                                                result={article}
                                                onClick={() => handleResultClick(article)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {results.news.length > 0 && (
                                    <div>
                                        <h3 className="px-4 mb-3 text-[10px] font-pixel tracking-[0.3em] text-white/20 uppercase">News</h3>
                                        {results.news.map((item) => (
                                            <SearchResultItem
                                                key={item.id}
                                                result={item}
                                                onClick={() => handleResultClick(item)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-black/20 border-t border-white/10 flex items-center justify-between text-[10px] font-pixel tracking-wider text-white/20">
                            <div className="flex gap-4">
                                <span>ESC TO CLOSE</span>
                                <span>ENTER TO SEARCH</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>POWERED BY AI</span>
                                <Sparkles className="w-2.5 h-2.5" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function SearchResultItem({ result, onClick }: { result: Result, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full group flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center group-hover:bg-accent-brand/20 transition-colors">
                    {result.type === 'project' ? (
                        <Layers className="w-5 h-5 text-white/40 group-hover:text-accent-brand transition-colors" />
                    ) : (
                        <BookOpen className="w-5 h-5 text-white/40 group-hover:text-accent-brand transition-colors" />
                    )}
                </div>
                <div className="text-left">
                    <div className="text-white font-medium group-hover:text-accent-brand transition-colors">{result.title}</div>
                    <div className="text-white/20 text-xs uppercase tracking-widest">{result.type}</div>
                </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>
    );
}
