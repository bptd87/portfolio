import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, FileText, AlertCircle, RotateCcw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';
import { sanitizeFileName } from '../../utils/file-naming';
import { toast } from 'sonner';

interface FileUploaderProps {
    value?: string; // Current file URL
    onChange: (url: string) => void;
    label: string;
    bucketName?: string;
    className?: string;
    accept?: string;
}

// Exponential backoff retry helper
const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err as Error;
            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Upload attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error('Upload failed after retries');
};

export function FileUploader({
    value,
    onChange,
    label,
    bucketName = 'misc', // Default to misc bucket for generic files
    className = '',
    accept = 'application/pdf'
}: FileUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [lastFile, setLastFile] = useState<File | null>(null);

    const uploadFile = async (file: File, isRetry: boolean = false) => {
        // Validate file type
        if (accept && !file.type.match(accept.replace('*', '.*'))) {
            const errMsg = `Invalid file type. Please upload ${accept}`;
            setError(errMsg);
            toast.error(errMsg);
            return;
        }

        // Validate file size (max 20MB for PDFs)
        if (file.size > 20 * 1024 * 1024) {
            const errMsg = 'File must be less than 20MB';
            setError(errMsg);
            toast.error(errMsg);
            return;
        }

        setError(null);
        setUploading(true);
        setProgress(10);

        const toastId = toast.loading(
            isRetry ? `Retrying upload (attempt ${retryCount + 1}/3)...` : 'Uploading file...'
        );

        try {
            // Direct Upload to Supabase Storage (Preferred) with retry
            setProgress(30);
            try {
                await retryWithBackoff(async () => {
                    const supabase = createClient();
                    // Use sanitized original filename
                    const fileName = sanitizeFileName(file.name);
                    // Add timestamp to prevent caching issues if overwriting same name
                    const filePath = `resumes/${Date.now()}-${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from(bucketName)
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    // Get Public URL
                    const { data: urlData } = supabase.storage
                        .from(bucketName)
                        .getPublicUrl(filePath);

                    setProgress(90);
                    onChange(urlData.publicUrl);
                    setProgress(100);
                }, 3, 1000);

                toast.success('File uploaded successfully!', { id: toastId });
                setRetryCount(0);
                setLastFile(null);
                return; // Success! Exit function.

            } catch (directError) {
                console.warn('Direct upload failed, trying server endpoint:', directError);
                // Fallthrough to server endpoint logic if we had one for generic files, 
                // but for now we rely on storage. 
                // If direct upload fails, it's likely a permission issue.
                throw directError;
            }

        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Upload failed';
            setError(errMsg);
            setLastFile(file);
            setRetryCount(prev => prev + 1);
            toast.error(`Upload failed: ${errMsg}`, { id: toastId });
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    const handleRemove = () => {
        onChange('');
        setError(null);
        setRetryCount(0);
    };

    const handleRetry = async () => {
        if (!lastFile) return;
        setError(null);
        await uploadFile(lastFile, true);
    };

    // Extract filename from URL for display
    const displayFilename = value ? value.split('/').pop()?.split('-').slice(1).join('-') || 'Uploaded File' : '';

    return (
        <div className={className}>
            <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
                {label}
            </label>

            {value ? (
                <div className="relative border border-zinc-800 bg-zinc-900/50 p-4 rounded-lg flex items-center gap-4 group">
                    <div className="p-3 bg-zinc-800 rounded-lg shrink-0">
                        <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate" title={displayFilename}>
                            {decodeURIComponent(displayFilename)}
                        </p>
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate block"
                        >
                            View File
                        </a>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                        title="Remove file"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <>
                    <label
                        className={`block border-2 border-dashed transition-colors cursor-pointer w-full h-full min-h-[100px] flex flex-col justify-center rounded-lg ${isDragging
                            ? 'border-blue-500 bg-blue-500/5'
                            : error ? 'border-red-500 bg-red-500/5'
                                : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/30'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center justify-center py-6 px-4">
                            {uploading ? (
                                <>
                                    <Loader2 className="w-6 h-6 text-blue-500 mb-2 animate-spin" />
                                    <p className="text-xs text-zinc-400 mb-1">Uploading...</p>
                                    <div className="w-24 h-1 bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                </>
                            ) : error ? (
                                <>
                                    <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
                                    <p className="text-xs text-red-400 mb-1 text-center font-medium">Upload Failed</p>
                                    <p className="text-xs text-zinc-500 text-center">{error}</p>
                                </>
                            ) : (
                                <>
                                    <Upload className={`w-6 h-6 mb-2 ${isDragging ? 'text-blue-500 scale-110' : 'text-zinc-500'} transition-transform`} />
                                    <p className="text-xs text-zinc-400 font-medium mb-1 text-center">
                                        {isDragging ? 'Drop PDF Here' : 'Click or Drop PDF'}
                                    </p>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
                                        Max 20MB
                                    </p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            accept={accept}
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={uploading || !!error}
                        />
                    </label>

                    {error && lastFile && (
                        <button
                            type="button"
                            onClick={handleRetry}
                            disabled={uploading}
                            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg transition-colors text-xs font-medium uppercase tracking-wider"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Retry Upload {retryCount > 0 && `(${retryCount}/3)`}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
