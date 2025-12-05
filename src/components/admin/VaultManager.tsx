import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Eye, EyeOff, Save, X, ChevronUp, ChevronDown, 
  Upload, Download, Image, File, Box, User, Armchair, Theater, 
  Building2, TreePine, Lamp, FolderOpen, Search, ExternalLink,
  ImagePlus, Loader2
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { PrimaryButton, SecondaryButton, SaveButton, CancelButton, IconButton } from './AdminButtons';
import { 
  DarkInput, 
  DarkTextarea, 
  DarkSelect, 
  DarkLabel,
  formContainerClasses,
  listItemClasses,
  badgeClasses
} from './DarkModeStyles';

// Get admin token from sessionStorage
const getAdminToken = () => sessionStorage.getItem('admin_token') || '';

// Types
interface ReferencePhoto {
  url: string;
  caption?: string;
  source?: string;
}

interface VaultAsset {
  id: string;
  name: string;
  slug: string;
  category: string;
  assetType: '2d' | '3d' | 'hybrid';
  
  // Files
  vwxFileUrl: string;
  previewImageUrl: string;
  glbFileUrl?: string;
  thumbnailUrl?: string;
  
  // Version compatibility
  vwxVersion: string;
  backwardsCompatible?: string;
  
  // Historical reference
  referencePhotos: ReferencePhoto[];
  
  // Metadata
  era?: string;
  style?: string;
  period?: string;
  notes?: string;
  
  // Standard
  tags: string[];
  downloadCount: number;
  featured: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VaultCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  armchair: Armchair,
  theater: Theater,
  building: Building2,
  tree: TreePine,
  lamp: Lamp,
  user: User,
  folder: FolderOpen,
  box: Box,
};

const ICON_OPTIONS = [
  { value: 'armchair', label: 'Armchair (Furniture)' },
  { value: 'theater', label: 'Theater (Props)' },
  { value: 'building', label: 'Building (Architectural)' },
  { value: 'tree', label: 'Tree (Foliage)' },
  { value: 'lamp', label: 'Lamp (Lighting)' },
  { value: 'user', label: 'User (2D Symbols)' },
  { value: 'box', label: 'Box (General)' },
];

const VWX_VERSIONS = [
  '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'
];

const DEFAULT_CATEGORIES: VaultCategory[] = [
  { id: 'furniture', name: 'Furniture', slug: 'furniture', description: 'Period & modern furniture symbols', icon: 'armchair', order: 0 },
  { id: 'props', name: 'Props', slug: 'props', description: 'Hand props and set dressing items', icon: 'theater', order: 1 },
  { id: 'architectural', name: 'Architectural', slug: 'architectural', description: 'Columns, moldings, doors, windows', icon: 'building', order: 2 },
  { id: 'foliage', name: 'Foliage', slug: 'foliage', description: 'Trees, plants, and greenery', icon: 'tree', order: 3 },
  { id: 'lighting', name: 'Lighting', slug: 'lighting', description: 'Practical fixtures', icon: 'lamp', order: 4 },
  { id: '2d-symbols', name: '2D Symbols', slug: '2d-symbols', description: 'Human figures and scale references', icon: 'user', order: 5 },
];

export function VaultManager() {
  const [assets, setAssets] = useState<VaultAsset[]>([]);
  const [categories, setCategories] = useState<VaultCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assets' | 'categories'>('assets');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Asset form state
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<VaultAsset | null>(null);
  const [assetFormData, setAssetFormData] = useState<Partial<VaultAsset>>({
    name: '',
    category: 'furniture',
    assetType: '3d',
    vwxVersion: '2026',
    backwardsCompatible: '2024',
    tags: [],
    referencePhotos: [],
    featured: false,
    enabled: true,
  });
  
  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VaultCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<VaultCategory>>({
    name: '',
    slug: '',
    description: '',
    icon: 'folder',
  });
  
  // File upload states
  const [uploadingVwx, setUploadingVwx] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingGlb, setUploadingGlb] = useState(false);
  const [uploadingReference, setUploadingReference] = useState(false);
  
  // Reference photo form
  const [newReferenceCaption, setNewReferenceCaption] = useState('');
  const [newReferenceSource, setNewReferenceSource] = useState('');
  
  // Tag input
  const [newTag, setNewTag] = useState('');
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/vault`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssets(data.assets || []);
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          }
        }
      }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  // File upload handlers - Use server API for proper auth
  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    try {
      const adminToken = getAdminToken();
      if (!adminToken) {
        alert('Not authenticated');
        return null;
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('bucket', bucket);
      formData.append('folder', folder);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  };

  const handleVwxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.vwx')) {
      alert('Please upload a .vwx file');
      return;
    }

    setUploadingVwx(true);
    const url = await uploadFile(file, 'vault', 'vwx');
    if (url) {
      setAssetFormData(prev => ({ ...prev, vwxFileUrl: url }));
    }
    setUploadingVwx(false);
  };

  const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingPreview(true);
    const url = await uploadFile(file, 'vault', 'previews');
    if (url) {
      setAssetFormData(prev => ({ ...prev, previewImageUrl: url, thumbnailUrl: url }));
    }
    setUploadingPreview(false);
  };

  const handleGlbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      alert('Please upload a .glb or .gltf file');
      return;
    }

    setUploadingGlb(true);
    const url = await uploadFile(file, 'vault', 'glb');
    if (url) {
      setAssetFormData(prev => ({ ...prev, glbFileUrl: url }));
    }
    setUploadingGlb(false);
  };

  const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingReference(true);
    const url = await uploadFile(file, 'vault', 'references');
    if (url) {
      const newPhoto: ReferencePhoto = {
        url,
        caption: newReferenceCaption || undefined,
        source: newReferenceSource || undefined,
      };
      setAssetFormData(prev => ({
        ...prev,
        referencePhotos: [...(prev.referencePhotos || []), newPhoto]
      }));
      setNewReferenceCaption('');
      setNewReferenceSource('');
    }
    setUploadingReference(false);
  };

  const removeReferencePhoto = (index: number) => {
    setAssetFormData(prev => ({
      ...prev,
      referencePhotos: (prev.referencePhotos || []).filter((_, i) => i !== index)
    }));
  };

  // Tag handlers
  const addTag = () => {
    if (!newTag.trim()) return;
    const tag = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (!assetFormData.tags?.includes(tag)) {
      setAssetFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setAssetFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }));
  };

  // Asset CRUD
  const handleSaveAsset = async () => {
    if (!assetFormData.name || !assetFormData.vwxFileUrl || !assetFormData.previewImageUrl) {
      alert('Please fill in name, upload VWX file, and upload preview image');
      return;
    }

    setSaving(true);
    try {
      const slug = assetFormData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const endpoint = editingAsset 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/vault/assets/${editingAsset.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/vault/assets`;
      
      const response = await fetch(endpoint, {
        method: editingAsset ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'X-Admin-Token': getAdminToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...assetFormData,
          slug,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchData();
        resetAssetForm();
      } else {
        alert(data.message || 'Failed to save asset');
      }
    } catch (error) {
      alert('Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/vault/assets/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'X-Admin-Token': getAdminToken(),
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchData();
      } else {
        alert(data.message || 'Failed to delete asset');
      }
    } catch (error) {
      alert('Failed to delete asset');
    }
  };

  const handleEditAsset = (asset: VaultAsset) => {
    setEditingAsset(asset);
    setAssetFormData(asset);
    setShowAssetForm(true);
  };

  const resetAssetForm = () => {
    setShowAssetForm(false);
    setEditingAsset(null);
    setAssetFormData({
      name: '',
      category: 'furniture',
      assetType: '3d',
      vwxVersion: '2024',
      backwardsCompatible: '2022',
      tags: [],
      referencePhotos: [],
      featured: false,
      enabled: true,
    });
    setNewTag('');
    setNewReferenceCaption('');
    setNewReferenceSource('');
  };

  // Category CRUD
  const handleSaveCategory = async () => {
    if (!categoryFormData.name) {
      alert('Please fill in category name');
      return;
    }

    setSaving(true);
    try {
      const slug = categoryFormData.slug || categoryFormData.name?.toLowerCase().replace(/\s+/g, '-');
      
      const endpoint = editingCategory 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/vault/categories/${editingCategory.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/vault/categories`;
      
      const response = await fetch(endpoint, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'X-Admin-Token': getAdminToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...categoryFormData,
          slug,
          order: editingCategory?.order ?? categories.length,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchData();
        resetCategoryForm();
      } else {
        alert(data.message || 'Failed to save category');
      }
    } catch (error) {
      alert('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Assets in this category will become uncategorized.')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/vault/categories/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'X-Admin-Token': getAdminToken(),
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchData();
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const handleEditCategory = (category: VaultCategory) => {
    setEditingCategory(category);
    setCategoryFormData(category);
    setShowCategoryForm(true);
  };

  const resetCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'folder',
    });
  };

  // Seed default categories
  const handleSeedCategories = async () => {
    if (!confirm('This will add default categories. Continue?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/vault/seed`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'X-Admin-Token': getAdminToken(),
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchData();
        alert(data.message || 'Categories seeded successfully');
      } else {
        alert(data.message || 'Failed to seed categories');
      }
    } catch (error) {
      alert('Failed to seed categories');
    }
  };

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Get category icon component
  const getCategoryIcon = (iconName: string) => {
    const IconComponent = CATEGORY_ICONS[iconName] || FolderOpen;
    return IconComponent;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Scenic Vault</h2>
          <p className="text-gray-400 text-sm">Manage Vectorworks symbols and resources</p>
        </div>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <SecondaryButton onClick={handleSeedCategories}>
              Seed Default Categories
            </SecondaryButton>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'assets'
              ? 'text-blue-400 border-blue-400'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Assets ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'categories'
              ? 'text-blue-400 border-blue-400'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <DarkSelect
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-48"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </DarkSelect>
            <PrimaryButton onClick={() => setShowAssetForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </PrimaryButton>
          </div>

          {/* Asset Form Modal */}
          {showAssetForm && (
            <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 overflow-y-auto py-8">
              <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">
                    {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                  </h3>
                  <button type="button" onClick={resetAssetForm} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Basic Info</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <DarkLabel>Name *</DarkLabel>
                        <DarkInput
                          type="text"
                          value={assetFormData.name || ''}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Victorian Settee"
                        />
                      </div>
                      <div>
                        <DarkLabel>Category</DarkLabel>
                        <DarkSelect
                          value={assetFormData.category || 'furniture'}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, category: e.target.value }))}
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                          ))}
                        </DarkSelect>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <DarkLabel>Asset Type</DarkLabel>
                        <DarkSelect
                          value={assetFormData.assetType || '3d'}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, assetType: e.target.value as '2d' | '3d' | 'hybrid' }))}
                        >
                          <option value="2d">2D Symbol</option>
                          <option value="3d">3D Symbol</option>
                          <option value="hybrid">Hybrid (2D+3D)</option>
                        </DarkSelect>
                      </div>
                      <div>
                        <DarkLabel>Featured</DarkLabel>
                        <div className="flex items-center h-10">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={assetFormData.featured || false}
                              onChange={(e) => setAssetFormData(prev => ({ ...prev, featured: e.target.checked }))}
                              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-gray-300 text-sm">Feature this asset</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <DarkLabel>Enabled</DarkLabel>
                        <div className="flex items-center h-10">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={assetFormData.enabled !== false}
                              onChange={(e) => setAssetFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-gray-300 text-sm">Visible to public</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Files */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Files</h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {/* VWX File */}
                      <div>
                        <DarkLabel>VWX File *</DarkLabel>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                            {uploadingVwx ? (
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            ) : (
                              <Upload className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="text-gray-400 text-sm">
                              {assetFormData.vwxFileUrl ? 'Replace VWX' : 'Upload .vwx file'}
                            </span>
                            <input
                              type="file"
                              accept=".vwx"
                              onChange={handleVwxUpload}
                              className="hidden"
                              disabled={uploadingVwx}
                            />
                          </label>
                          {assetFormData.vwxFileUrl && (
                            <a
                              href={assetFormData.vwxFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-400 text-sm hover:underline"
                            >
                              <File className="w-4 h-4" />
                              View
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Preview Image */}
                      <div>
                        <DarkLabel>Preview Image *</DarkLabel>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                            {uploadingPreview ? (
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            ) : (
                              <Image className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="text-gray-400 text-sm">
                              {assetFormData.previewImageUrl ? 'Replace preview' : 'Upload preview image'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePreviewUpload}
                              className="hidden"
                              disabled={uploadingPreview}
                            />
                          </label>
                          {assetFormData.previewImageUrl && (
                            <img
                              src={assetFormData.previewImageUrl}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                            />
                          )}
                        </div>
                      </div>

                      {/* GLB File (Optional) */}
                      <div>
                        <DarkLabel>GLB File (for 3D viewer - optional)</DarkLabel>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                            {uploadingGlb ? (
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            ) : (
                              <Box className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="text-gray-400 text-sm">
                              {assetFormData.glbFileUrl ? 'Replace GLB' : 'Upload .glb file'}
                            </span>
                            <input
                              type="file"
                              accept=".glb,.gltf"
                              onChange={handleGlbUpload}
                              className="hidden"
                              disabled={uploadingGlb}
                            />
                          </label>
                          {assetFormData.glbFileUrl && (
                            <a
                              href={assetFormData.glbFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-400 text-sm hover:underline"
                            >
                              <Box className="w-4 h-4" />
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vectorworks Compatibility */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Vectorworks Compatibility</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <DarkLabel>Created In</DarkLabel>
                        <DarkSelect
                          value={assetFormData.vwxVersion || '2024'}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, vwxVersion: e.target.value }))}
                        >
                          {VWX_VERSIONS.map(v => (
                            <option key={v} value={v}>Vectorworks {v}</option>
                          ))}
                        </DarkSelect>
                      </div>
                      <div>
                        <DarkLabel>Works With (and newer)</DarkLabel>
                        <DarkSelect
                          value={assetFormData.backwardsCompatible || '2022'}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, backwardsCompatible: e.target.value }))}
                        >
                          {VWX_VERSIONS.map(v => (
                            <option key={v} value={v}>{v}+</option>
                          ))}
                        </DarkSelect>
                      </div>
                    </div>
                  </div>

                  {/* Historical Context */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Historical Context</h4>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <DarkLabel>Era</DarkLabel>
                        <DarkInput
                          type="text"
                          value={assetFormData.era || ''}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, era: e.target.value }))}
                          placeholder="Victorian"
                        />
                      </div>
                      <div>
                        <DarkLabel>Style</DarkLabel>
                        <DarkInput
                          type="text"
                          value={assetFormData.style || ''}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, style: e.target.value }))}
                          placeholder="Rococo Revival"
                        />
                      </div>
                      <div>
                        <DarkLabel>Period</DarkLabel>
                        <DarkInput
                          type="text"
                          value={assetFormData.period || ''}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, period: e.target.value }))}
                          placeholder="1850-1880"
                        />
                      </div>
                    </div>

                    <div>
                      <DarkLabel>Notes</DarkLabel>
                      <DarkTextarea
                        value={assetFormData.notes || ''}
                        onChange={(e) => setAssetFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Historical context, usage notes, or design information..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Reference Photos */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Reference Photos (Public Domain)</h4>
                    
                    {/* Existing photos */}
                    {assetFormData.referencePhotos && assetFormData.referencePhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {assetFormData.referencePhotos.map((photo, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={photo.url}
                              alt={photo.caption || 'Reference'}
                              className="w-full h-24 object-cover rounded-lg border border-gray-700"
                            />
                            <button
                              onClick={() => removeReferencePhoto(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                            <div className="mt-1">
                              <p className="text-xs text-gray-300 truncate">{photo.caption || 'No caption'}</p>
                              <p className="text-xs text-gray-500 truncate">{photo.source || 'No source'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new photo */}
                    <div className="p-4 bg-gray-800 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <DarkLabel>Caption</DarkLabel>
                          <DarkInput
                            type="text"
                            value={newReferenceCaption}
                            onChange={(e) => setNewReferenceCaption(e.target.value)}
                            placeholder="Museum example"
                          />
                        </div>
                        <div>
                          <DarkLabel>Source</DarkLabel>
                          <DarkInput
                            type="text"
                            value={newReferenceSource}
                            onChange={(e) => setNewReferenceSource(e.target.value)}
                            placeholder="Library of Congress"
                          />
                        </div>
                      </div>
                      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        {uploadingReference ? (
                          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        ) : (
                          <ImagePlus className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-gray-400 text-sm">Add Reference Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReferenceUpload}
                          className="hidden"
                          disabled={uploadingReference}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tags</h4>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {assetFormData.tags?.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="p-0.5 hover:bg-gray-700 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <DarkInput
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add a tag..."
                        className="flex-1"
                      />
                      <SecondaryButton onClick={addTag}>Add</SecondaryButton>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
                  <CancelButton onClick={resetAssetForm}>Cancel</CancelButton>
                  <SaveButton onClick={handleSaveAsset} disabled={saving}>
                    {saving ? 'Saving...' : (editingAsset ? 'Update Asset' : 'Create Asset')}
                  </SaveButton>
                </div>
              </div>
            </div>
          )}

          {/* Assets Grid */}
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
              <Box className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No assets yet</p>
              <p className="text-gray-500 text-sm mt-1">Click "Add Asset" to create your first Vectorworks symbol</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map(asset => {
                const CategoryIcon = getCategoryIcon(
                  categories.find(c => c.slug === asset.category)?.icon || 'folder'
                );
                
                return (
                  <div
                    key={asset.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors group"
                  >
                    {/* Preview Image */}
                    <div className="aspect-square bg-gray-800 relative">
                      {asset.previewImageUrl ? (
                        <img
                          src={asset.previewImageUrl}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Box className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      
                      {/* Overlay actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditAsset(asset)}
                          className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {asset.featured && (
                          <span className="px-2 py-0.5 bg-yellow-500/90 text-yellow-900 text-xs font-semibold rounded-full">
                            Featured
                          </span>
                        )}
                        {!asset.enabled && (
                          <span className="px-2 py-0.5 bg-gray-700/90 text-gray-300 text-xs rounded-full">
                            Hidden
                          </span>
                        )}
                      </div>

                      {/* Type badge */}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-gray-900/90 text-gray-300 text-xs rounded-full uppercase">
                          {asset.assetType}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-white text-sm truncate flex-1">{asset.name}</h3>
                        <CategoryIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">VW {asset.vwxVersion}</span>
                        <span className="text-xs text-gray-500">{asset.downloadCount || 0} downloads</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">Manage vault categories</p>
            <PrimaryButton onClick={() => setShowCategoryForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </PrimaryButton>
          </div>

          {/* Category Form Modal */}
          {showCategoryForm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md mx-4 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <DarkLabel>Name *</DarkLabel>
                    <DarkInput
                      type="text"
                      value={categoryFormData.name || ''}
                      onChange={(e) => setCategoryFormData(prev => ({ 
                        ...prev, 
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                      }))}
                      placeholder="Furniture"
                    />
                  </div>

                  <div>
                    <DarkLabel>Slug</DarkLabel>
                    <DarkInput
                      type="text"
                      value={categoryFormData.slug || ''}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="furniture"
                    />
                  </div>

                  <div>
                    <DarkLabel>Description</DarkLabel>
                    <DarkTextarea
                      value={categoryFormData.description || ''}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Period & modern furniture symbols"
                      rows={2}
                    />
                  </div>

                  <div>
                    <DarkLabel>Icon</DarkLabel>
                    <DarkSelect
                      value={categoryFormData.icon || 'folder'}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, icon: e.target.value }))}
                    >
                      {ICON_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </DarkSelect>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <CancelButton onClick={resetCategoryForm}>Cancel</CancelButton>
                  <SaveButton onClick={handleSaveCategory} disabled={saving}>
                    {saving ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                  </SaveButton>
                </div>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            {categories.map(category => {
              const IconComponent = getCategoryIcon(category.icon);
              const assetCount = assets.filter(a => a.category === category.slug).length;
              
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <IconComponent className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{assetCount} assets</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

