
import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Eye, EyeOff, Save, X, ChevronUp, ChevronDown, Pencil,
  Upload, Download, Image, File, Box, User, Armchair, Theater,
  Building2, TreePine, Lamp, FolderOpen, Search, ExternalLink,
  ImagePlus, Loader2
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
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
  asset_type: '2d' | '3d' | 'hybrid';

  // Files
  vwx_file_url: string;
  preview_image_url: string;
  glb_file_url?: string;
  thumbnail_url?: string;
  description?: string; // Mapped from DB

  // Version compatibility
  vwx_version: string;
  backwards_compatible?: string;

  // Historical reference
  reference_photos: ReferencePhoto[];

  // Metadata
  tags: string[];
  downloads: number;
  featured: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
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

const DEFAULT_CATEGORIES: Partial<VaultCategory>[] = [
  { name: 'Furniture', slug: 'furniture', description: 'Period & modern furniture symbols', icon: 'armchair', order: 0 },
  { name: 'Props', slug: 'props', description: 'Hand props and set dressing items', icon: 'theater', order: 1 },
  { name: 'Architectural', slug: 'architectural', description: 'Columns, moldings, doors, windows', icon: 'building', order: 2 },
  { name: 'Foliage', slug: 'foliage', description: 'Trees, plants, and greenery', icon: 'tree', order: 3 },
  { name: 'Lighting', slug: 'lighting', description: 'Practical fixtures', icon: 'lamp', order: 4 },
  { name: '2D Symbols', slug: '2d-symbols', description: 'Human figures and scale references', icon: 'user', order: 5 },
];

export function VaultManager() {
  const [assets, setAssets] = useState<VaultAsset[]>([]);
  const [categories, setCategories] = useState<VaultCategory[]>([]);
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
    asset_type: '3d',
    vwx_version: '2026',
    backwards_compatible: '2024',
    tags: [],
    reference_photos: [],
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
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('vault_categories')
        .select('*')
        .order('order', { ascending: true });

      if (catError) {
        // If table doesn't exist yet, we might get an error, fail gracefully
        console.error('Error fetching categories:', catError);
      } else {
        setCategories(catData || []);
      }

      // Fetch Assets
      const { data: assetData, error: assetError } = await supabase
        .from('vault_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (assetError) {
        console.error('Error fetching assets:', assetError);
      } else {
        // Map DB columns to UI state (handling mismatch for old/migrated assets)
        const mappedAssets: VaultAsset[] = (assetData || []).map((item: any) => ({
          ...item,
          id: item.id,
          name: item.name || item.title || 'Untitled',
          slug: item.slug || (item.title || item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: item.category || 'furniture',
          asset_type: item.asset_type || '3d',

          // Files
          vwx_file_url: item.vwx_file_url || '',
          preview_image_url: item.preview_image_url || item.image_url || '',
          glb_file_url: item.glb_file_url,
          thumbnail_url: item.thumbnail_url || item.image_url,

          // Version
          vwx_version: item.vwx_version || '2024',
          backwards_compatible: item.backwards_compatible,

          // Metadata
          tags: item.tags || [],
          downloads: item.downloads || 0,
          featured: item.featured || false,
          enabled: item.enabled ?? item.published ?? true,
          created_at: item.created_at,
          updated_at: item.updated_at || item.created_at,
          reference_photos: item.reference_photos || [],
        }));
        setAssets(mappedAssets);
      }

    } catch (error) {
      console.error('Error fetching vault data:', error);
    } finally {
      setLoading(false);
    }
  };

  // File upload handler
  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    try {
      // Create a clean filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload Error:', error);
        alert(`Upload failed: ${error.message}`);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Critical Upload Error:', err);
      alert('Upload failed: Unknown error');
      return null;
    }
  };

  const handleVwxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.vwx')) {
      alert('Please upload a .vwx file');
      return;
    }

    setUploadingVwx(true);
    const url = await uploadFile(file, 'vault', 'vwx');
    if (url) {
      setAssetFormData(prev => ({ ...prev, vwx_file_url: url }));
    }
    setUploadingVwx(false);
  };

  const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPreview(true);
    const url = await uploadFile(file, 'vault', 'previews');
    if (url) {
      setAssetFormData(prev => ({ ...prev, preview_image_url: url, thumbnail_url: url }));
    }
    setUploadingPreview(false);
  };

  const handleGlbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      alert('Please upload a .glb or .gltf file');
      return;
    }

    setUploadingGlb(true);
    const url = await uploadFile(file, 'vault', 'glb');
    if (url) {
      setAssetFormData(prev => ({ ...prev, glb_file_url: url }));
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
        reference_photos: [...(prev.reference_photos || []), newPhoto]
      }));
      setNewReferenceCaption('');
      setNewReferenceSource('');
    }
    setUploadingReference(false);
  };

  const removeReferencePhoto = (index: number) => {
    setAssetFormData(prev => ({
      ...prev,
      reference_photos: (prev.reference_photos || []).filter((_, i) => i !== index)
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
    if (!assetFormData.name || !assetFormData.vwx_file_url || !assetFormData.preview_image_url) {
      alert('Please fill in name, upload VWX file, and upload preview image');
      return;
    }

    setSaving(true);
    try {
      const slug = assetFormData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Map UI state back to DB columns
      // Note: We use 'any' cast to allow dynamic properties for legacy schema compatibility
      const payload: any = {
        title: assetFormData.name, // Map name -> title
        image_url: assetFormData.preview_image_url, // Map preview -> image_url
        published: assetFormData.enabled, // Map enabled -> published

        // Include other fields that might exist or be added
        slug,
        category: assetFormData.category,
        tags: assetFormData.tags,
        featured: assetFormData.featured,

        // Attempt to save these if columns exist, but standard 'vault_assets' 
        // in this environment seems to lack them. Supabase might error if we send them.
        // We will try to send them if they are not empty, but ideally we'd check schema.
        // For now, we prioritize the known existing columns.
        description: assetFormData.description || '', // Add description if missing
      };

      // Only include file URLs if they are set, to avoid overwriting with nulls if not supported
      if (assetFormData.vwx_file_url) payload.vwx_file_url = assetFormData.vwx_file_url;
      if (assetFormData.glb_file_url) payload.glb_file_url = assetFormData.glb_file_url;
      if (assetFormData.asset_type) payload.asset_type = assetFormData.asset_type;
      if (assetFormData.vwx_version) payload.vwx_version = assetFormData.vwx_version;

      let result;
      if (editingAsset?.id) {
        result = await supabase
          .from('vault_assets')
          .update(payload)
          .eq('id', editingAsset.id);
      } else {
        result = await supabase
          .from('vault_assets')
          .insert([payload]);
      }

      if (result.error) throw result.error;

      await fetchData();
      resetAssetForm();

    } catch (error: any) {
      alert(`Failed to save asset: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const { error } = await supabase
        .from('vault_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      alert(`Failed to delete asset: ${error.message}`);
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
      asset_type: '3d',
      vwx_version: '2024',
      backwards_compatible: '2022',
      tags: [],
      reference_photos: [],
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

      const payload = {
        ...categoryFormData,
        slug,
        order: editingCategory?.order ?? categories.length,
      };

      let result;
      if (editingCategory?.id) {
        result = await supabase
          .from('vault_categories')
          .update(payload)
          .eq('id', editingCategory.id);
      } else {
        result = await supabase
          .from('vault_categories')
          .insert([payload]);
      }

      if (result.error) throw result.error;

      await fetchData();
      resetCategoryForm();
    } catch (error: any) {
      alert(`Failed to save category: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Assets in this category will become uncategorized.')) return;

    try {
      const { error } = await supabase
        .from('vault_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      alert(`Failed to delete category: ${error.message}`);
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
    setSeeding(true);

    try {
      for (const cat of DEFAULT_CATEGORIES) {
        // Upsert based on slug
        const { error } = await supabase
          .from('vault_categories')
          .upsert(cat, { onConflict: 'slug' });

        if (error) console.error('Error seeding category:', cat.name, error);
      }

      await fetchData();
      alert('Categories seeded successfully');
    } catch (error) {
      alert('Failed to seed categories');
    } finally {
      setSeeding(false);
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
            <SecondaryButton onClick={handleSeedCategories} disabled={seeding}>
              {seeding ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
              Seed Default Categories
            </SecondaryButton>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'assets'
            ? 'text-blue-400 border-blue-400'
            : 'text-gray-400 border-transparent hover:text-white'
            }`}
        >
          Assets ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'categories'
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

          {/* Asset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map(asset => (
              <div
                key={asset.id}
                className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/10 cursor-pointer"
                onClick={() => handleEditAsset(asset)}
              >
                {/* Preview Image */}
                <div className="relative aspect-[4/3] bg-gray-950">
                  <img
                    src={asset.preview_image_url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 cursor-default" onClick={e => e.stopPropagation()}>
                    {asset.featured && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] uppercase font-bold tracking-wider rounded border border-yellow-500/30 backdrop-blur-sm">
                        Featured
                      </span>
                    )}
                    {!asset.enabled && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] uppercase font-bold tracking-wider rounded border border-red-500/30 backdrop-blur-sm">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <IconButton
                        onClick={() => handleEditAsset(asset)}
                        className="bg-gray-900/80 hover:bg-blue-600 text-white border-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        variant="danger"
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="bg-gray-900/80 hover:bg-red-600 text-white border-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white truncate" title={asset.name}>{asset.name}</h3>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="uppercase tracking-wider">{asset.vwx_version}</span>
                    <span className="px-2 py-0.5 bg-gray-800 rounded text-gray-400 capitalize">{asset.asset_type}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredAssets.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                <Box className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No assets found</p>
              </div>
            )}
          </div>

          {/* Asset Form Modal */}
          {showAssetForm && (
            <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 overflow-y-auto py-8">
              <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl mx-4 relative">
                <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10 rounded-t-xl">
                  <h3 className="text-lg font-semibold text-white">
                    {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                  </h3>
                  <button type="button" onClick={resetAssetForm} className="text-gray-400 hover:text-white" title="Close Form" aria-label="Close Form">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
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
                          value={assetFormData.asset_type || '3d'}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, asset_type: e.target.value as '2d' | '3d' | 'hybrid' }))}
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
                              {assetFormData.vwx_file_url ? 'Replace VWX' : 'Upload .vwx file'}
                            </span>
                            <input
                              type="file"
                              accept=".vwx"
                              onChange={handleVwxUpload}
                              className="hidden"
                              disabled={uploadingVwx}
                            />
                          </label>
                          {assetFormData.vwx_file_url && (
                            <a
                              href={assetFormData.vwx_file_url}
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
                              {assetFormData.preview_image_url ? 'Replace preview' : 'Upload preview image'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePreviewUpload}
                              className="hidden"
                              disabled={uploadingPreview}
                            />
                          </label>
                          {assetFormData.preview_image_url && (
                            <img
                              src={assetFormData.preview_image_url}
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
                              {assetFormData.glb_file_url ? 'Replace GLB' : 'Upload .glb file'}
                            </span>
                            <input
                              type="file"
                              accept=".glb,.gltf"
                              onChange={handleGlbUpload}
                              className="hidden"
                              disabled={uploadingGlb}
                            />
                          </label>
                          {assetFormData.glb_file_url && (
                            <a
                              href={assetFormData.glb_file_url}
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

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <SaveButton onClick={handleSaveAsset} disabled={saving || uploadingVwx || uploadingPreview || uploadingGlb}>
                      {saving ? 'Saving...' : 'Save Asset'}
                    </SaveButton>
                    <CancelButton onClick={resetAssetForm}>
                      Cancel
                    </CancelButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Categories</h3>
            <PrimaryButton onClick={() => setShowCategoryForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </PrimaryButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              return (
                <div key={category.id} className="border border-gray-800 bg-gray-900/50 p-4 rounded-lg flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{category.name}</h4>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <IconButton onClick={() => handleEditCategory(category)}>
                      {/* <Pencil className="w-4 h-4" /> */}
                      <Plus className="w-4 h-4 rotate-45" /> {/* TODO: Fix icon */}
                    </IconButton>
                    <IconButton variant="danger" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category Form Modal */}
          {showCategoryForm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h3>

                <div>
                  <DarkLabel>Name</DarkLabel>
                  <DarkInput
                    value={categoryFormData.name || ''}
                    onChange={e => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <DarkLabel>Description</DarkLabel>
                  <DarkTextarea
                    value={categoryFormData.description || ''}
                    onChange={e => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <DarkLabel>Icon</DarkLabel>
                  <DarkSelect
                    value={categoryFormData.icon || 'folder'}
                    onChange={e => setCategoryFormData(prev => ({ ...prev, icon: e.target.value }))}
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </DarkSelect>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <CancelButton onClick={resetCategoryForm}>Cancel</CancelButton>
                  <SaveButton onClick={handleSaveCategory} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Category'}
                  </SaveButton>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
