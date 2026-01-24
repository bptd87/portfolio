import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Check, AlertTriangle, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface SEOImageFixerProps {
    project: any;
    onUpdate: (updatedProject: any) => void;
    onAutoSave?: (updatedProject: any) => Promise<void>;
}

interface ImageToFix {
    field: string;
    type: 'card' | 'hero' | 'process';
    index?: number;
    currentUrl: string;
    currentName: string;
    proposedName: string;
    proposedCaption?: string;
    status: 'pending' | 'fixing' | 'success' | 'error';
    error?: string;
}

// Helper to clean URL parameters (like tokens)
const cleanUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        return urlObj.origin + urlObj.pathname;
    } catch (e) {
        return url.split('?')[0]; // Fallback
    }
};

// Helper to ensure caption is a string (prevents [object Object])
const safeCaption = (val: any): string => {
    // 1. If it's already a clean string, check if it's stringified JSON
    if (typeof val === 'string') {
        if (val.trim().startsWith('{') && val.trim().endsWith('}')) {
            try {
                const parsed = JSON.parse(val);
                return safeCaption(parsed); // Recurse with object
            } catch (e) {
                return val; // Return original if parse fails
            }
        }
        return val;
    }

    if (typeof val === 'number') return val.toString();

    // 2. If it's an object, try to extract meaningful text
    if (typeof val === 'object' && val !== null) {
        // Priority: caption -> altText -> seoDescription -> result -> content -> message
        if (val.caption && typeof val.caption === 'string') return val.caption;
        if (val.altText && typeof val.altText === 'string') return val.altText;
        if (val.seoDescription && typeof val.seoDescription === 'string') return val.seoDescription;

        if (val.result && typeof val.result === 'string') return safeCaption(val.result); // Recurse
        if (val.content && typeof val.content === 'string') return val.content;
        if (val.message && typeof val.message === 'string') return val.message;

        console.warn('Received object for caption without known keys:', val);
        // Fallback: Return caption if it exists even if not string (unlikely)
        return '';
    }

    return '';
};

export function SEOImageFixer({ project, onUpdate, onAutoSave }: SEOImageFixerProps) {
    const [analyzing, setAnalyzing] = useState(false);
    const [imagesToFix, setImagesToFix] = useState<ImageToFix[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [fixing, setFixing] = useState(false);
    const [generatingCaption, setGeneratingCaption] = useState<number | null>(null);

    // Analyze project images and propose renames
    const analyzeImages = () => {
        setAnalyzing(true);
        const fixes: ImageToFix[] = [];
        const slug = project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Helper to generate smart filename
        const generateSmartName = (originalName: string, type: string, index?: number) => {
            const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
            const timestamp = Date.now().toString().slice(-6);

            // Build smart slug: "title-venue-scenic-design"
            const parts = [
                project.title,
                project.venue,
                "Brandon PT Davis Scenic Design",
                type
            ];

            if (index !== undefined) parts.push((index + 1).toString());

            const smartSlug = parts
                .filter(Boolean)
                .join('-')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .slice(0, 150); // Prevent excessively long names

            return `${smartSlug}-${timestamp}.${ext}`;
        };

        // Helper to generate smart caption
        const generateSmartCaption = (type: string) => {
            const base = `${project.title}`;
            const venue = project.venue ? ` at ${project.venue}` : '';
            const credit = `Scenic Design by Brandon PT Davis`;

            let detail = '';
            if (type === 'card') detail = ' - Production Thumbnail';
            else if (type === 'process') detail = ' - Process Photo';
            else if (type === 'hero') detail = ' - Production Photo';

            return `${base}${venue}. ${credit}.${detail}`;
        };

        // Helper to check if name is already good (starts with slug)
        const needsOptimization = (name: string) => {
            // Remove extension for check
            const baseName = name.substring(0, name.lastIndexOf('.'));
            return !baseName.includes(slug);
        };

        // Common logic for processing an image
        const processImage = (url: string, field: string, type: 'card' | 'hero' | 'process', index?: number) => {
            const cleanedUrl = cleanUrl(url);
            const name = cleanedUrl.split('/').pop() || '';
            const decodedName = decodeURIComponent(name);

            if (needsOptimization(decodedName)) {
                let currentCaption = '';
                if (type === 'hero' && index !== undefined && project.galleries?.heroCaptions) {
                    currentCaption = safeCaption(project.galleries.heroCaptions[index]);
                }
                if (type === 'process' && index !== undefined && project.galleries?.processCaptions) {
                    currentCaption = safeCaption(project.galleries.processCaptions[index]);
                }

                fixes.push({
                    field: index !== undefined ? `${field}.${index}` : field,
                    type,
                    index,
                    currentUrl: url,
                    currentName: decodedName,
                    proposedName: generateSmartName(decodedName, type, index),
                    proposedCaption: currentCaption || generateSmartCaption(type),
                    status: 'pending'
                });
            }
        };

        // 1. Card Image
        if (project.cardImage) {
            processImage(project.cardImage, 'cardImage', 'card');
        }

        // 2. Galleries (Hero)
        if (project.galleries?.hero) {
            project.galleries.hero.forEach((url: string, index: number) => {
                processImage(url, 'galleries.hero', 'hero', index);
            });
        }

        // 3. Galleries (Process)
        if (project.galleries?.process) {
            project.galleries.process.forEach((url: string, index: number) => {
                processImage(url, 'galleries.process', 'process', index);
            });
        }

        setImagesToFix(fixes);
        setAnalyzing(false);
        setShowConfirm(true);
    };

    const updateProposedName = (index: number, value: string) => {
        const newFixes = [...imagesToFix];
        newFixes[index].proposedName = value;
        setImagesToFix(newFixes);
    };

    const updateProposedCaption = (index: number, value: string) => {
        const newFixes = [...imagesToFix];
        newFixes[index].proposedCaption = value;
        setImagesToFix(newFixes);
    };

    const generateCaption = async (index: number) => {
        const item = imagesToFix[index];
        setGeneratingCaption(index);

        try {
            const token = sessionStorage.getItem('admin_token');
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/ai/analyze-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'X-Admin-Token': token || ''
                },
                body: JSON.stringify({ imageUrl: item.currentUrl })
            });

            const data = await response.json();
            if (data.success && data.result) {
                // Ensure the result is safe
                const safeResult = safeCaption(data.result);
                updateProposedCaption(index, safeResult);
                if (!safeResult) {
                    toast.warning('AI returned empty or invalid caption.');
                } else {
                    toast.success('Caption generated!');
                }
            } else {
                toast.error(data.error || 'Failed to generate caption');
                console.error('AI Error:', data);
            }
        } catch (err) {
            console.error(err);
            toast.error('Error generating caption');
        } finally {
            setGeneratingCaption(null);
        }
    };

    const executeFixes = async () => {
        setFixing(true);

        // Session Check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            toast.error('Session expired. Please refresh/login.');
            setFixing(false);
            return;
        }

        const updatedProject = JSON.parse(JSON.stringify(project)); // Deep copy
        let successCount = 0;

        const newFixes = [...imagesToFix];

        for (let i = 0; i < newFixes.length; i++) {
            const fix = newFixes[i];
            if (fix.status === 'success') continue;

            newFixes[i] = { ...fix, status: 'fixing' };
            setImagesToFix([...newFixes]);

            try {
                // 1. Rename File in Storage
                const cleanedUrl = cleanUrl(fix.currentUrl);

                let bucket = '';
                let oldPath = '';

                // ROBUST URL PARSING
                if (cleanedUrl.includes('/storage/v1/object/public/')) {
                    const pathAfterPublic = cleanedUrl.split('/storage/v1/object/public/')[1];
                    const parts = pathAfterPublic.split('/');
                    bucket = parts[0];
                    oldPath = parts.slice(1).join('/');
                } else if (cleanedUrl.includes('/storage/v1/object/sign/')) {
                    const pathAfterSign = cleanedUrl.split('/storage/v1/object/sign/')[1];
                    const parts = pathAfterSign.split('/');
                    bucket = parts[0];
                    oldPath = parts.slice(1).join('/');
                } else {
                    const urlObj = new URL(cleanedUrl);
                    const pathParts = urlObj.pathname.split('/');
                    const publicIndex = pathParts.indexOf('public');
                    const signIndex = pathParts.indexOf('sign');
                    const startIndex = Math.max(publicIndex, signIndex);

                    if (startIndex !== -1 && startIndex < pathParts.length - 1) {
                        bucket = pathParts[startIndex + 1];
                        oldPath = pathParts.slice(startIndex + 2).join('/');
                    } else {
                        // Attempt fallback for non-standard URLs if they exist in valid buckets
                        const knownBuckets = ['projects', 'make-74296234-images', 'blog', 'news', 'about', 'software'];
                        const pathString = urlObj.pathname;
                        for (const b of knownBuckets) {
                            if (pathString.includes(`/${b}/`)) {
                                bucket = b;
                                oldPath = pathString.split(`/${b}/`)[1];
                                break;
                            }
                        }
                        if (!bucket) throw new Error('Could not parse Supabase URL structure');
                    }
                }

                if (!bucket || !oldPath) throw new Error('Could not determine bucket or path');

                console.log(`Renaming: ${bucket}/${oldPath} -> ${fix.proposedName}`);

                const { error: moveError } = await supabase.storage
                    .from(bucket)
                    .move(oldPath, fix.proposedName);

                if (moveError) throw moveError;

                const { data: publicUrlData } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(fix.proposedName);

                const newUrl = publicUrlData.publicUrl;

                // 2. Update Project Data (URL + Caption)
                if (fix.type === 'card') {
                    updatedProject.cardImage = newUrl;
                } else if (fix.type === 'hero' || fix.type === 'process') {
                    if (updatedProject.galleries && updatedProject.galleries[fix.type] && Array.isArray(updatedProject.galleries[fix.type])) {
                        updatedProject.galleries[fix.type][fix.index!] = newUrl;
                    }

                    const captionKey = `${fix.type}Captions`;
                    const altKey = `${fix.type}Alt`;

                    if (!updatedProject.galleries[captionKey]) {
                        updatedProject.galleries[captionKey] = [];
                    }
                    if (!updatedProject.galleries[altKey]) {
                        updatedProject.galleries[altKey] = [];
                    }

                    if (fix.index !== undefined && fix.proposedCaption) {
                        // Ensure arrays are long enough
                        while (updatedProject.galleries[captionKey].length <= fix.index) {
                            updatedProject.galleries[captionKey].push('');
                        }
                        while (updatedProject.galleries[altKey].length <= fix.index) {
                            updatedProject.galleries[altKey].push('');
                        }

                        updatedProject.galleries[captionKey][fix.index] = fix.proposedCaption;
                        updatedProject.galleries[altKey][fix.index] = fix.proposedCaption;
                    }
                }

                newFixes[i] = { ...fix, status: 'success' };
                successCount++;

            } catch (err: any) {
                console.error('Rename failed:', err);

                // Auth Recovery Strategy
                const msg = err.message || err.details || '';
                const isAuthError =
                    msg.includes('JWT') ||
                    msg.includes('row-level security') ||
                    err.code === '401' ||
                    err.code === '403' ||
                    err.status === 401 ||
                    err.status === 403;

                if (isAuthError) {
                    console.error('🛑 Auth Error Detected. Forcing Logout/Refresh.');
                    toast.error('Session corrupted. Logging out...');

                    await supabase.auth.signOut();
                    sessionStorage.removeItem('admin_token');
                    sessionStorage.removeItem('supabase_token');

                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                    return;
                }

                newFixes[i] = { ...fix, status: 'error', error: msg || 'Unknown error' };
            }

            setImagesToFix([...newFixes]);
        }

        setFixing(false);

        if (successCount > 0) {
            // CRITICAL CHANGE: Auto-save or update
            if (onAutoSave) {
                toast.info('Saving changes to database...');
                await onAutoSave(updatedProject);
                toast.success(`Renamed ${successCount} images & saved project!`);
            } else {
                onUpdate(updatedProject);
                toast.success(`Renamed ${successCount} images. PLEASE SAVE PROJECT NOW.`);
            }
        } else {
            toast.error('Processing completed with errors.');
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-purple-400" />
                        AI Image Optimizer
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Automatically rename images and generate captions based on project metadata.
                    </p>
                </div>
                {!showConfirm && (
                    <button
                        onClick={analyzeImages}
                        disabled={analyzing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan & Optimize'}
                    </button>
                )}
            </div>

            {showConfirm && imagesToFix.length === 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    All images appear to have optimized filenames!
                </div>
            )}

            {showConfirm && imagesToFix.length > 0 && (
                <div className="space-y-4">
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {imagesToFix.map((fix, idx) => (
                            <div key={idx} className="bg-slate-800/50 rounded border border-slate-700 p-4 space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                    <span className="uppercase tracking-wider opacity-70 flex items-center gap-2">
                                        {fix.status === 'fixing' && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
                                        {fix.status === 'success' && <Check className="w-3 h-3 text-green-400" />}
                                        {fix.status === 'error' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                                        <span className="font-mono">{fix.field}</span>
                                    </span>
                                    {fix.status === 'error' && <span className="text-red-400">{fix.error}</span>}
                                </div>

                                <div className="flex gap-4">
                                    {/* THUMBNAIL PREVIEW */}
                                    {fix.currentUrl && (
                                        <div className="w-24 h-24 bg-slate-950 rounded border border-slate-700 overflow-hidden flex-shrink-0 relative group">
                                            <img
                                                src={fix.currentUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNDc1NTY5IiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIi8+PC9zdmc+';
                                                    (e.target as HTMLImageElement).classList.add('p-4');
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-3">
                                        {/* Filename Editor */}
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] text-red-300/50 truncate font-mono" title={fix.currentName}>
                                                Current: ...{fix.currentName.slice(-40)}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5 block">New Filename</label>
                                                    <input
                                                        type="text"
                                                        value={fix.proposedName}
                                                        onChange={(e) => updateProposedName(idx, e.target.value)}
                                                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-green-300 text-xs focus:ring-1 focus:ring-green-500 outline-none font-mono"
                                                        title="Proposed Filename"
                                                        aria-label="Proposed Filename"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Caption Editor */}
                                        {(fix.type === 'hero' || fix.type === 'process') && (
                                            <div className="border-t border-slate-700/50 pt-2">
                                                <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5 block flex justify-between items-end">
                                                    <span>Caption / Alt Text</span>
                                                    <button
                                                        onClick={() => generateCaption(idx)}
                                                        disabled={generatingCaption === idx}
                                                        className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20"
                                                    >
                                                        {generatingCaption === idx ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                                        <span className="text-[9px] font-medium">Generate with AI</span>
                                                    </button>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={fix.proposedCaption || ''}
                                                    onChange={(e) => updateProposedCaption(idx, e.target.value)}
                                                    placeholder="Enter caption..."
                                                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-300 text-xs focus:ring-1 focus:ring-blue-500 outline-none mt-1"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={executeFixes}
                            disabled={fixing}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {fixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            Apply Fixes & Generate Captions
                        </button>

                        <button
                            onClick={() => {
                                setShowConfirm(false);
                                setImagesToFix([]);
                            }}
                            disabled={fixing}
                            className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <p className="text-xs text-yellow-500/80 bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        <strong>Remember to click "Save Project" afterwards</strong> to persist changes to the database.
                    </p>
                </div>
            )}
        </div>
    );
}
