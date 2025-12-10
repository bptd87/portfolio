import React, { useState, useRef } from 'react';
import { Upload, Loader2, Check, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import { projectId } from '../../utils/supabase/info';
import { sanitizeFileName } from '../../utils/file-naming';
import { toast } from 'sonner';

interface ParsedPost {
    title: string;
    date: string;
    category: string;
    tags: string[];
    content: string;
    slug: string;
    inputImages: string[];
    status: 'pending' | 'processing' | 'success' | 'error';
    error?: string;
    selected?: boolean;
}

interface SquarespaceImporterProps {
    target: 'news' | 'articles';
    onComplete: () => void;
    onCancel: () => void;
}

export function SquarespaceImporter({ target, onComplete, onCancel }: SquarespaceImporterProps) {
    const [step, setStep] = useState<'upload' | 'analyze' | 'import'>('upload');
    const [parsedPosts, setParsedPosts] = useState<ParsedPost[]>([]);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            analyzeFile(selectedFile);
        }
    };

    const analyzeFile = async (file: File) => {
        setStep('analyze');
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');

        const items = xmlDoc.querySelectorAll('item');
        const posts: ParsedPost[] = [];

        items.forEach((item) => {
            const title = item.querySelector('title')?.textContent || 'Untitled';
            const link = item.querySelector('link')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';

            // Strictly filter for blog posts
            // 1. Check wp:post_type if available (standard Squarespace/WordPress export)
            const postType = item.getElementsByTagName('wp:post_type')[0]?.textContent;
            if (postType && postType !== 'post') {
                return; // Skip pages, attachments, nav_menu_item, etc.
            }

            // 2. Fallback: Check URL structure if post_type is missing
            // Squarespace blog posts usually have /blog/ or /news/ in the link
            if (!postType && link) {
                const isBlog = link.includes('/blog/') || link.includes('/news/') || link.includes('/journal/');
                // Also typical Squarespace format: /blog/2023/1/1/title
                const hasDate = /\/\d{4}\/\d{1,2}\/\d{1,2}\//.test(link);

                if (!isBlog && !hasDate) {
                    return; // Skip likely non-blog pages
                }
            }


            const pubDate = item.querySelector('pubDate')?.textContent;
            const date = pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

            const categories: string[] = [];
            const tags: string[] = [];

            item.querySelectorAll('category').forEach(cat => {
                const domain = cat.getAttribute('domain');
                if (domain === 'category') {
                    categories.push(cat.textContent || '');
                } else if (domain === 'post_tag') {
                    tags.push(cat.textContent || '');
                } else {
                    tags.push(cat.textContent || '');
                }
            });

            const mainCategory = categories.length > 0 ? categories[0] : (tags.length > 0 ? 'General' : 'Uncategorized');

            if (categories.length > 1) {
                tags.push(...categories.slice(1));
            }

            const contentEncoded = item.getElementsByTagName('content:encoded')[0]?.textContent || '';
            const content = contentEncoded || description || '';

            const imgRegex = /<img[^>]+src="([^">]+)"/g;
            const inputImages: string[] = [];
            let match;
            while ((match = imgRegex.exec(content)) !== null) {
                if (match[1] && !match[1].startsWith('data:')) {
                    inputImages.push(match[1]);
                }
            }

            const slug = item.querySelector('link')?.textContent?.split('/').pop() ||
                title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            posts.push({
                title,
                date,
                category: mainCategory,
                tags,
                content,
                slug,
                inputImages,
                status: 'pending',
                selected: true // Default to selected
            });
        });

        setParsedPosts(posts);
    };

    const toggleSelection = (index: number) => {
        const newPosts = [...parsedPosts];
        newPosts[index].selected = !newPosts[index].selected;
        setParsedPosts(newPosts);
    }

    const toggleAll = (select: boolean) => {
        const newPosts = parsedPosts.map(p => ({ ...p, selected: select }));
        setParsedPosts(newPosts);
    }

    const processImport = async () => {
        // Filter out unselected posts
        const postsToProcess = parsedPosts.filter(p => p.selected);

        if (postsToProcess.length === 0) {
            toast.error("Please select at least one post to import");
            return;
        }

        setImporting(true);
        setStep('import');
        setProgress({ current: 0, total: postsToProcess.length, status: 'Starting import...' });

        // Get admin token
        const token = sessionStorage.getItem('admin_token');
        if (!token) {
            toast.error("You must be logged in as admin to import posts");
            setImporting(false);
            return;
        }

        const supabase = createClient();

        for (let i = 0; i < postsToProcess.length; i++) {
            const post = postsToProcess[i];

            // Update status in UI - find index in main array
            const mainIndex = parsedPosts.indexOf(post);
            if (mainIndex !== -1) {
                const newPosts = [...parsedPosts];
                newPosts[mainIndex].status = 'processing';
                setParsedPosts(newPosts);
            }

            setProgress({
                current: i + 1,
                total: postsToProcess.length,
                status: `Importing "${post.title}"...`
            });

            try {
                let processedContent = post.content;

                if (post.inputImages.length > 0) {
                    for (const imgUrl of post.inputImages) {
                        try {
                            if (imgUrl.includes(projectId)) continue;

                            const response = await fetch(imgUrl);
                            if (!response.ok) throw new Error('Failed to fetch');

                            const blob = await response.blob();
                            const ext = imgUrl.split('.').pop()?.split('?')[0] || 'jpg';
                            const safeName = sanitizeFileName(post.title.substring(0, 20) + '-' + Math.random().toString(36).substring(7)) + '.' + ext;

                            // 1. Try Direct Upload first (fastest)
                            let publicUrl = '';

                            const { error: directUploadError } = await supabase.storage
                                .from('blog')
                                .upload(safeName, blob);

                            if (!directUploadError) {
                                const { data: publicUrlData } = supabase.storage
                                    .from('blog')
                                    .getPublicUrl(safeName);
                                publicUrl = publicUrlData.publicUrl;
                            } else {
                                // 2. Fallback to API Upload
                                const formData = new FormData();
                                formData.append('image', blob, safeName);
                                formData.append('bucket', 'blog');

                                const uploadRes = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/upload`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}` // Use admin token
                                    },
                                    body: formData
                                });

                                if (!uploadRes.ok) throw new Error('Failed to upload image via API');
                                const uploadData = await uploadRes.json();
                                publicUrl = uploadData.url;
                            }

                            if (publicUrl) {
                                processedContent = processedContent.split(imgUrl).join(publicUrl);
                            }

                        } catch (imgErr) {
                            console.warn(`Failed to process image ${imgUrl}:`, imgErr);
                        }
                    }
                }

                const contentBlocks = [
                    {
                        id: `block-${Date.now()}-${i}`,
                        type: 'paragraph',
                        content: processedContent,
                        metadata: { imported: true }
                    }
                ];

                const dbData: any = {
                    title: post.title,
                    slug: post.slug,
                    date: post.date,
                    category: post.category,
                    excerpt: post.content.substring(0, 160).replace(/<[^>]*>/g, '') + '...',
                    tags: post.tags,
                    status: 'draft',
                    content: target === 'articles' ? contentBlocks : processedContent,
                };

                if (target === 'articles') {
                    dbData.featured = false;
                } else {
                    dbData.blocks = [{ type: 'text', content: processedContent }];
                }

                // POST requests to the Admin API
                const endpoint = target === 'news'
                    ? `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/news`
                    : `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`;

                const apiRes = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(dbData)
                });

                if (!apiRes.ok) {
                    const errData = await apiRes.json();
                    throw new Error(errData.error || 'Failed to save post');
                }

                if (mainIndex !== -1) {
                    const newPosts = [...parsedPosts];
                    newPosts[mainIndex].status = 'success';
                    // We need to fetch fresh state because update might lag
                    setParsedPosts(prev => {
                        const next = [...prev];
                        const idx = next.findIndex(p => p.title === post.title); // Fallback lookup
                        if (idx !== -1) next[idx].status = 'success';
                        return next;
                    });
                }
            } catch (err: any) {
                console.error(err);
                setParsedPosts(prev => {
                    const next = [...prev];
                    const idx = next.findIndex(p => p.title === post.title);
                    if (idx !== -1) {
                        next[idx].status = 'error';
                        next[idx].error = err.message || 'Unknown error';
                    }
                    return next;
                });
            }
        }

        setImporting(false);
        toast.success(`Import completed! ${postsToProcess.length} processed.`);
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/10">
                    <div>
                        <h2 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-accent-brand" />
                            Squarespace Importer
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Migrate your blog posts and images automatically</p>
                    </div>
                    {!importing && (
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-secondary/30 rounded-full transition-colors"
                            title="Cancel Import"
                            aria-label="Cancel Import"
                        >
                            <AlertCircle className="w-5 h-5 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {step === 'upload' && (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl bg-secondary/5 hover:bg-secondary/10 hover:border-accent-brand transition-all cursor-pointer relative">
                            <input
                                type="file"
                                accept=".xml"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                title="Upload XML File"
                                aria-label="Upload XML File"
                            />
                            <Upload className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-lg font-medium text-white mb-2">Upload Squarespace XML</p>
                            <p className="text-sm text-gray-500">Drag and drop or click to select your export.xml file</p>
                        </div>
                    )}

                    {step === 'analyze' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-white">Found {parsedPosts.length} Posts</h3>
                                <div className="flex gap-3 text-sm">
                                    <button
                                        onClick={() => toggleAll(true)}
                                        className="text-accent-brand hover:underline cursor-pointer"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-gray-600">|</span>
                                    <button
                                        onClick={() => toggleAll(false)}
                                        className="text-gray-400 hover:text-white cursor-pointer"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                                <button
                                    onClick={() => setStep('upload')}
                                    className="text-sm text-gray-400 hover:text-white"
                                >
                                    Change File
                                </button>
                            </div>

                            <div className="space-y-2 border border-border rounded-xl overflow-hidden">
                                <div className="grid grid-cols-12 gap-4 p-3 bg-secondary/20 text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    <div className="col-span-1 text-center">#</div>
                                    <div className="col-span-1"></div>
                                    <div className="col-span-5">Title</div>
                                    <div className="col-span-3">Date</div>
                                    <div className="col-span-2">Images</div>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {parsedPosts.map((post, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => toggleSelection(idx)}
                                            className={`grid grid-cols-12 gap-4 p-3 border-t border-border/50 text-sm hover:bg-secondary/10 transition-colors cursor-pointer ${post.selected ? 'bg-accent-brand/5' : 'opacity-60'}`}
                                        >
                                            <div className="col-span-1 text-gray-500 text-xs flex items-center justify-center">{idx + 1}</div>
                                            <div className="col-span-1 flex items-center justify-center">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${post.selected ? 'bg-accent-brand border-accent-brand' : 'border-gray-600'}`}>
                                                    {post.selected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                            </div>
                                            <div className="col-span-5 font-medium truncate" title={post.title}>{post.title}</div>
                                            <div className="col-span-3 text-gray-400">{post.date}</div>
                                            <div className="col-span-2 flex items-center gap-2 text-gray-400">
                                                <ImageIcon className="w-3 h-3" />
                                                {post.inputImages.length}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'import' && (
                        <div className="space-y-6">
                            <div className="bg-secondary/10 border border-border rounded-xl p-6 text-center">
                                <div className="text-2xl font-bold text-white mb-2">
                                    {progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
                                    <div
                                        className="bg-accent-brand h-full transition-all duration-300"
                                        style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-400">{progress.status}</p>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {parsedPosts.filter(p => p.selected).map((post, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/50">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {post.status === 'pending' && <div className="w-2 h-2 rounded-full bg-gray-600" />}
                                            {post.status === 'processing' && <Loader2 className="w-4 h-4 text-accent-brand animate-spin" />}
                                            {post.status === 'success' && <Check className="w-4 h-4 text-green-500" />}
                                            {post.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                            <span className={`text-sm truncate ${post.status === 'processing' ? 'text-accent-brand' : 'text-gray-300'}`}>
                                                {post.title}
                                            </span>
                                        </div>
                                        {post.status === 'error' && (
                                            <span className="text-xs text-red-400 max-w-[200px] truncate">{post.error}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-secondary/10 flex justify-end gap-3">
                    {step === 'analyze' && (
                        <>
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={processImport}
                                disabled={parsedPosts.filter(p => p.selected).length === 0}
                                className="px-6 py-2 bg-accent-brand text-white text-sm font-medium rounded-lg hover:bg-accent-brand/90 transition-colors shadow-lg shadow-accent-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Start Import ({parsedPosts.filter(p => p.selected).length})
                            </button>
                        </>
                    )}
                    {step === 'import' && !importing && (
                        <button
                            onClick={onComplete}
                            className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Done
                        </button>
                    )}
                    {step === 'upload' && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
