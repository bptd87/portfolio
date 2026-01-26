import React, { useState } from 'react';
import { Search, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function SearchIndexer() {
    const [isIndexing, setIsIndexing] = useState(false);
    const [result, setResult] = useState<{ projects: number, tutorials: number, articles: number, news: number } | null>(null);

    const handleReindex = async () => {
        setIsIndexing(true);
        setResult(null);

        try {
            const response = await fetch('/api/admin/reindex', {
                method: 'POST',
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                throw new Error('Server returned an invalid response (500). Usually this means the OPENAI_API_KEY is missing from your .env.local file.');
            }

            if (response.ok) {
                setResult(data.indexed);
                toast.success('Successfully updated search embeddings');
            } else {
                const errorMsg = data.suggestion ? `${data.error}: ${data.suggestion}` : (data.error || 'Failed to re-index');
                throw new Error(errorMsg);
            }
        } catch (error: any) {
            toast.error(error.message, { duration: 6000 });
        } finally {
            setIsIndexing(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Search Indexer</h1>
                <p className="text-zinc-400">
                    Update the AI "brain" of your portfolio. This generates embeddings for all projects and tutorials so they can be found via semantic search.
                </p>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">
                    <strong>Note:</strong> If you don't have an OpenAI API key, your portfolio will automatically use <strong>Keyword Search</strong> instead. Semantic search is an optional "smart" upgrade.
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-accent-brand/10 border border-accent-brand/20">
                        <Search className="w-8 h-8 text-accent-brand" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Full Re-index</h3>
                        <p className="text-sm text-zinc-500">Generates fresh embeddings for everything. High accuracy, takes a few seconds.</p>
                    </div>
                </div>

                {result && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{result.projects}</div>
                            <div className="text-xs text-zinc-400 uppercase tracking-widest">Projects</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{result.tutorials}</div>
                            <div className="text-xs text-zinc-400 uppercase tracking-widest">Tutorials</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{result.articles}</div>
                            <div className="text-xs text-zinc-400 uppercase tracking-widest">Articles</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{result.news}</div>
                            <div className="text-xs text-zinc-400 uppercase tracking-widest">News</div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleReindex}
                    disabled={isIndexing}
                    className="w-full py-4 bg-accent-brand text-accent-brand-foreground rounded-xl font-semibold flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {isIndexing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Indexing Portfolio...</span>
                        </>
                    ) : (
                        <>
                            <RotateCcw className="w-5 h-5" />
                            <span>Run Search Indexer</span>
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-white font-medium">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>What is semantic search?</span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Unlike keyword search, semantic search understands concepts. If a user searches for "moody interiors", AI will find projects that feel moody even if you never used that exact word in the title.
                    </p>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-white font-medium">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <span>When to re-index?</span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        You should run the indexer after adding a new project or making major changes to a project's overview. This ensures the AI search stays up to date.
                    </p>
                </div>
            </div>
        </div>
    );
}
