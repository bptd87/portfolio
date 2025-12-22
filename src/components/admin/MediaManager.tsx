import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import {
  Image as ImageIcon,
  Trash2,
  Upload,
  Copy,
  Check,
  RefreshCw,
  Folder,
  Loader2,
  ExternalLink,
  Search,
  Sparkles,
  Settings,
  Edit,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminTokens } from '../../styles/admin-tokens';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { analyzeImage, getAIKey, setAIKey } from '../../utils/ai-service';
import { sanitizeFileName } from '../../utils/file-naming';

const BUCKETS = [
  { id: 'make-74296234-images', label: 'General Uploads' },
  { id: 'blog', label: 'Blog Images' },
  { id: 'projects', label: 'Project Images' },
  { id: 'news', label: 'News Images' },
  { id: 'about', label: 'About/Bio' },
  { id: 'software', label: 'Software/Apps' }
];

interface FileObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

interface MediaMetadata {
  alt_text: string;
  caption: string;
  seo_description: string;
  tags: string[];
}

export function MediaManager() {
  const [activeBucket, setActiveBucket] = useState(BUCKETS[0].id);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit State
  const [editingFile, setEditingFile] = useState<FileObject | null>(null);
  const [metadata, setMetadata] = useState<MediaMetadata>({
    alt_text: '',
    caption: '',
    seo_description: '',
    tags: []
  });
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    listFiles(activeBucket);
  }, [activeBucket]);

  // Fetch metadata when opening edit dialog
  useEffect(() => {
    if (editingFile) {
      fetchMetadata(editingFile);
    }
  }, [editingFile]);

  const fetchMetadata = async (file: FileObject) => {
    setLoadingMetadata(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .eq('bucket_id', activeBucket)
        .eq('file_path', file.name)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMetadata({
          alt_text: (data as any).alt_text || '',
          caption: (data as any).caption || '',
          seo_description: (data as any).seo_description || '',
          tags: (data as any).tags || []
        });
      } else {
        // Reset if no metadata exists yet
        setMetadata({
          alt_text: '',
          caption: '',
          seo_description: '',
          tags: []
        });
      }
    } catch (error) {
      toast.error('Failed to load image details');
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!editingFile) return;
    setSavingMetadata(true);

    try {
      // Use server endpoint to bypass RLS issues with anon user
      const token = sessionStorage.getItem('admin_token');
      if (!token) throw new Error('Not authenticated');

      // Use the cleaner path that matches our new server configuration
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/api/admin/media/metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token
        },
        body: JSON.stringify({
          bucket_id: activeBucket,
          file_path: editingFile.name,
          alt_text: metadata.alt_text,
          caption: metadata.caption,
          seo_description: metadata.seo_description,
          tags: metadata.tags
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save metadata');
      }

      toast.success('Image details saved');
      setEditingFile(null);
    } catch (error: any) {
      toast.error(`Failed to save details: ${error.message}`);
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleAnalyze = async () => {
    if (!editingFile) return;
    setAnalyzing(true);

    try {
      const publicUrl = getPublicUrl(editingFile.name);

      // Use the client-side AI service if the server endpoint fails or is not configured
      // This is a fallback since the server endpoint seems to be 404ing
      const key = getAIKey();

      if (key) {
        // Client-side analysis
        const result = await analyzeImage(publicUrl, key);
        setMetadata({
          alt_text: result.altText || '',
          caption: result.caption || '',
          seo_description: result.seoDescription || '',
          tags: result.tags || []
        });
        toast.success('AI Analysis complete (Client-side)!');
      } else {
        // Server-side analysis
        // The function name is 'server', so the path is /functions/v1/server
        // The internal route in Hono is /analyze-image
        // So the full URL is .../functions/v1/server/analyze-image

        const functionUrl = `https://${projectId}.supabase.co/functions/v1/server/analyze-image`;
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ imageUrl: publicUrl })
        }
        );

        if (!response.ok) {
          const errorText = await response.text();
          // Try the fallback route if the first one failed with 404
          if (response.status === 404) {
            const retryResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/server/make-server-74296234/api/admin/ai/analyze-image`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
                body: JSON.stringify({ imageUrl: publicUrl })
              }
            );

            if (retryResponse.ok) {
              const data = await retryResponse.json();
              if (data.success && data.result) {
                setMetadata({
                  alt_text: data.result.altText || '',
                  caption: data.result.caption || '',
                  seo_description: data.result.seoDescription || '',
                  tags: data.result.tags || []
                });
                toast.success('AI Analysis complete (Server-side)!');
                return;
              }
            }
          }

          throw new Error(`Server error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Analysis failed');
        }

        const result = data.result;

        setMetadata({
          alt_text: result.altText || '',
          caption: result.caption || '',
          seo_description: result.seoDescription || '',
          tags: result.tags || []
        });
        toast.success('AI Analysis complete!');
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const listFiles = async (bucket: string) => {
    setLoading(true);
    try {
      const supabase = createClient();

      // 1. Try listing root
      const { data: rootData, error: rootError } = await supabase
        .storage
        .from(bucket)
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      // 2. Try listing 'image' folder (FigmaMake default)
      const { data: folderData, error: folderError } = await supabase
        .storage
        .from(bucket)
        .list('image', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      // 3. Try listing 'images' folder (Common plural)
      const { data: imagesFolderData, error: imagesFolderError } = await supabase
        .storage
        .from(bucket)
        .list('images', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (rootError) throw rootError;

      // Combine files (and mark folder items with correct path)
      const allFiles = [
        ...(rootData || []).filter(f => !f.id), // Keep files, maybe filter folders if we are flattening? Actually folders usually have id=null or similar.
        // Let's just keep everything for now, but prioritize the deep fetch
        ...(folderData || []).map(f => ({ ...f, name: `image/${f.name}` })),
        ...(imagesFolderData || []).map(f => ({ ...f, name: `images/${f.name}` }))
      ];

      // Remove duplicates if any (e.g. if root listed the folder and we also listed contents)
      // Actually, root listing 'images' folder is just the folder entry. 
      // The contents are in imagesFolderData.
      // We should probably filter out the folder entries from rootData if we are showing contents.
      // Folders in Supabase storage list usually have `metadata: null` or `id: null`.

      // DEBUG: Removed the metadata filter to see if that was hiding files
      // const flatFiles = allFiles.filter(f => !!f.metadata); 
      const flatFiles = allFiles;

      setFiles((flatFiles as any) || []);
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setUploading(true);

    try {
      const supabase = createClient();
      const fileName = sanitizeFileName(file.name);
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(activeBucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      toast.success('Image uploaded successfully');
      listFiles(activeBucket);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!window.confirm('Are you sure you want to delete this image? This cannot be undone.')) return;

    try {
      // Use server endpoint to bypass RLS issues with anon user
      const token = sessionStorage.getItem('admin_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/api/admin/media/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token
        },
        body: JSON.stringify({
          bucket_id: activeBucket,
          file_path: fileName
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete image');
      }

      toast.success('Image deleted successfully');

      // Update local state immediately
      setFiles(prev => prev.filter(f => f.name !== fileName));
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const getPublicUrl = (fileName: string) => {
    const supabase = createClient();
    const { data } = supabase.storage.from(activeBucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-400" />
            Media Manager
          </h2>
          <p className={AdminTokens.text.secondary + " mt-1"}>Manage your images and assets across all buckets</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => listFiles(activeBucket)}
            className={`p-2 rounded-lg ${AdminTokens.bg.tertiary} ${AdminTokens.text.secondary} hover:text-white transition-colors`}
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <label className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Upload Image</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Debug Info */}
      <div className={`p-4 bg-black/50 rounded-lg font-mono text-xs ${AdminTokens.text.secondary} overflow-auto max-h-40 border ${AdminTokens.border.light}`}>
        <p className={`${AdminTokens.text.accent} font-bold mb-2`}>Debug Info:</p>
        <p>Active Bucket: {activeBucket}</p>
        <p>Files Found: {files.length}</p>
        <p>First File: {JSON.stringify(files[0] || 'None')}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {/* Sidebar - Buckets */}
        <div className={`md:col-span-1 space-y-2 ${AdminTokens.card.base} h-fit`}>
          <h3 className={`text-sm font-semibold ${AdminTokens.text.secondary} uppercase tracking-wider mb-4 px-2`}>Buckets</h3>
          {BUCKETS.map(bucket => (
            <button
              key={bucket.id}
              onClick={() => setActiveBucket(bucket.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeBucket === bucket.id
                ? `${AdminTokens.bg.accent} ${AdminTokens.text.accent} border ${AdminTokens.border.accent}`
                : `${AdminTokens.text.secondary} ${AdminTokens.bg.hover} hover:text-white`
                }`}
            >
              <Folder className={`w-4 h-4 ${activeBucket === bucket.id ? 'fill-blue-500/20' : ''}`} />
              <span className="font-medium">{bucket.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content - File Grid */}
        <div className="md:col-span-3 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${AdminTokens.text.tertiary}`} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${AdminTokens.input.base} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
            />
          </div>

          {loading ? (
            <div className={`flex flex-col items-center justify-center py-20 ${AdminTokens.text.tertiary}`}>
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-20 ${AdminTokens.card.base} border-dashed`}>
              <ImageIcon className={`w-12 h-12 ${AdminTokens.text.tertiary} mb-3`} />
              <p className={`${AdminTokens.text.secondary} text-lg`}>No files found in this bucket</p>
              <p className={`${AdminTokens.text.tertiary} text-sm`}>Upload an image to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => {
                const publicUrl = getPublicUrl(file.name);
                return (
                  <div key={file.id} className={`group relative rounded-xl overflow-hidden border ${AdminTokens.border.disabled} ${AdminTokens.bg.secondary} ${AdminTokens.border.accentHover} transition-all`}>
                    {/* Image Preview */}
                    <div className={`aspect-square ${AdminTokens.bg.primary} relative overflow-hidden`}>
                      <img
                        src={publicUrl}
                        alt={file.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingFile(file)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-full transition-colors"
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(publicUrl, '_blank')}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                          title="View Full Size"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.name)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="p-3">
                      <p className={`text-sm font-medium ${AdminTokens.text.secondary} truncate`} title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${AdminTokens.text.tertiary}`}>{formatBytes(file.metadata?.size || 0)}</span>
                        <button
                          onClick={() => copyToClipboard(publicUrl, file.id)}
                          className={`p-1.5 rounded-md transition-colors ${copiedId === file.id
                            ? `${AdminTokens.badge.success}`
                            : `${AdminTokens.bg.tertiary} ${AdminTokens.text.secondary} ${AdminTokens.bg.hover} hover:text-white`
                            }`}
                          title="Copy URL"
                        >
                          {copiedId === file.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Metadata Dialog */}
      <Dialog open={!!editingFile} onOpenChange={(open: boolean) => !open && setEditingFile(null)}>
        <DialogContent className={`${AdminTokens.bg.secondary} ${AdminTokens.border.disabled} border ${AdminTokens.text.primary} max-w-2xl`} aria-describedby="edit-image-description">
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
            <p id="edit-image-description" className="text-sm text-gray-400">
              Manage alt text, captions, and SEO metadata for this image.
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Preview */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-black border border-gray-800">
                {editingFile && (
                  <img
                    src={getPublicUrl(editingFile.name)}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate with AI</span>
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {loadingMetadata ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Alt Text</Label>
                    <Textarea
                      value={metadata.alt_text}
                      onChange={(e) => setMetadata({ ...metadata, alt_text: e.target.value })}
                      placeholder="Descriptive text for accessibility..."
                      className="bg-gray-800 border-gray-700 min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Caption</Label>
                    <Textarea
                      value={metadata.caption}
                      onChange={(e) => setMetadata({ ...metadata, caption: e.target.value })}
                      placeholder="Image caption..."
                      className="bg-gray-800 border-gray-700 min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>SEO Description</Label>
                    <Textarea
                      value={metadata.seo_description}
                      onChange={(e) => setMetadata({ ...metadata, seo_description: e.target.value })}
                      placeholder="Optimized description for search engines..."
                      className="bg-gray-800 border-gray-700 min-h-[80px]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setEditingFile(null)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveMetadata}
              disabled={savingMetadata || loadingMetadata}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {savingMetadata ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

