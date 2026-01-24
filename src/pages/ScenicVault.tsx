
import React, { useState, useEffect } from 'react';
import {
  Download, Search, ArrowLeft, X, Filter, ChevronRight,
  Armchair, Theater, Building2, TreePine, Lamp, User, FolderOpen, Grid3X3,
  FileType, HardDrive, Calendar, Eye, Tag, Layers, Box, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';

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
  vwxFileUrl: string;
  previewImageUrl: string;
  glbFileUrl?: string;
  thumbnailUrl?: string;
  vwxVersion: string;
  backwardsCompatible?: string;
  referencePhotos: ReferencePhoto[];
  era?: string;
  style?: string;
  period?: string;
  notes?: string;
  tags: string[];
  downloadCount: number;
  featured: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  fileSize?: string;
}

interface VaultCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
}

// Default categories
const DEFAULT_CATEGORIES: VaultCategory[] = [
  { id: '1', name: 'Furniture', slug: 'furniture', description: 'Period and modern furniture', icon: 'armchair', order: 1 },
  { id: '2', name: 'Props', slug: 'props', description: 'Hand props and set dressing', icon: 'theater', order: 2 },
  { id: '3', name: 'Architectural', slug: 'architectural', description: 'Windows, doors, moldings', icon: 'building', order: 3 },
  { id: '4', name: 'Foliage', slug: 'foliage', description: 'Trees, plants, greenery', icon: 'tree', order: 4 },
  { id: '5', name: 'Lighting', slug: 'lighting', description: 'Practicals and fixtures', icon: 'lamp', order: 5 },
  { id: '6', name: '2D Symbols', slug: '2d-symbols', description: 'Figures and scale references', icon: 'user', order: 6 },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  armchair: Armchair, theater: Theater, building: Building2,
  tree: TreePine, lamp: Lamp, user: User, folder: FolderOpen,
};

// Mock assets for development preview if DB is empty
const MOCK_ASSETS: VaultAsset[] = [];

interface ScenicVaultProps {
  onNavigate: (page: string) => void;
}

export function ScenicVault({ onNavigate }: ScenicVaultProps) {
  const [assets, setAssets] = useState<VaultAsset[]>(MOCK_ASSETS);
  const [categories, setCategories] = useState<VaultCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<VaultAsset | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

      if (!catError && catData && catData.length > 0) {
        setCategories(catData);
      }

      // Fetch Assets
      const { data: assetData, error: assetError } = await supabase
        .from('vault_assets')
        .select('*')
        .eq('enabled', true)
        .order('created_at', { ascending: false });

      if (!assetError && assetData) {
        // Map DB snake_case to frontend camelCase
        const mappedAssets: VaultAsset[] = assetData.map((a: any) => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          category: a.category,
          assetType: a.asset_type,
          vwxFileUrl: a.vwx_file_url,
          previewImageUrl: a.preview_image_url,
          glbFileUrl: a.glb_file_url,
          thumbnailUrl: a.thumbnail_url,
          vwxVersion: a.vwx_version || '2024',
          backwardsCompatible: a.backwards_compatible,
          referencePhotos: a.reference_photos || [],
          notes: a.description,
          tags: a.tags || [],
          downloadCount: a.downloads || 0,
          featured: a.featured,
          enabled: a.enabled,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          // Optional fields that might not be in DB schema yet but are in interface
          era: a.era,
          style: a.style,
          period: a.period,
          fileSize: a.file_size
        }));
        setAssets(mappedAssets);
      }
    } catch (error) {
      console.error('Error fetching vault data:', error);
      // Fallback to defaults currently in state
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (asset: VaultAsset) => {
    // Open file immediately
    window.open(asset.vwxFileUrl, '_blank');

    // Attempt to increment download count (fire and forget)
    try {
      // We can create an RPC for this later if we want strict counting, 
      // or just rely on RLS allowing update of 'downloads' column if we set it up.
      // For now, let's just use a simple RPC if it existed, or skip it.
      // Or if we want to be client-side only for now:
      /*
      await supabase.from('vault_assets')
          .update({ downloads: asset.downloadCount + 1 })
          .eq('id', asset.id);
      */
      // But RLS likely blocks public update.
      // We'll leave this empty for now until an RPC is made.
    } catch (error) {
      console.error('Failed to track download', error);
    }
  };

  const getCategoryIcon = (iconName: string) => CATEGORY_ICONS[iconName] || FolderOpen;
  const getCategoryName = (slug: string) => {
    const cat = displayCategories.find(c => c.slug === slug);
    return cat?.name || slug;
  };

  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      asset.era?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const getAllImages = (asset: VaultAsset) => {
    const images: { url: string; caption?: string }[] = [];
    if (asset.previewImageUrl) images.push({ url: asset.previewImageUrl, caption: 'Preview' });
    asset.referencePhotos?.forEach(photo => images.push({ url: photo.url, caption: photo.caption || 'Reference' }));
    return images;
  };

  const formatFileSize = (size?: string) => size || 'Unknown';
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
          <span className="font-sans text-muted-foreground text-sm">Loading assets...</span>
        </div>
      </div>
    );
  }

  // ==================== ASSET DETAIL VIEW ====================
  // ==================== ASSET DETAIL VIEW (GLASS STACK) ====================
  if (selectedAsset) {
    const allImages = getAllImages(selectedAsset);

    return (
      <div className="fixed inset-0 z-[100] bg-black text-white font-sans overflow-hidden">
        {/* Solid Black Background */}
        <div className="fixed inset-0 z-0 bg-black" />

        {/* 2. CLOSE & NAV BUTTONS (Floating Fixed) */}
        <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
          <div className="absolute top-6 left-6 pointer-events-auto">
            <button
              onClick={() => setSelectedAsset(null)}
              className="flex items-center gap-3 px-6 py-3 bg-white/20 dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/10 backdrop-blur-md rounded-full border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all duration-300 group shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-pixel text-[10px] tracking-[0.2em] uppercase">Back to Vault</span>
            </button>
          </div>
        </div>

        {/* 3. CENTERED SCROLLABLE CONTENT */}
        <div className="absolute inset-0 z-20 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="min-h-full w-full flex flex-col items-center py-24 px-6">
            <div className="w-full max-w-4xl mx-auto space-y-6">

              {/* Hero Title Card */}
              <div className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-8 md:p-12 shadow-none">

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 text-[9px] font-pixel tracking-[0.2em] uppercase text-black/80 dark:text-white/80">
                      {selectedAsset.assetType}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[9px] font-pixel tracking-[0.2em] uppercase text-black/50 dark:text-white/50">
                      {getCategoryName(selectedAsset.category)}
                    </span>
                  </div>

                  <h1 className="font-display text-4xl md:text-6xl lg:text-7xl italic leading-[0.95] mb-6 text-black dark:text-white text-shadow-sm">
                    {selectedAsset.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-black/60 dark:text-white/60 font-light">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 opacity-70" />
                      VW {selectedAsset.vwxVersion}
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 opacity-70" />
                      {formatFileSize(selectedAsset.fileSize)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 opacity-70" />
                      {selectedAsset.downloadCount} downloads
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata Card */}
              <div className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 p-6 shadow-none">
                <div className="text-black/60 dark:text-white/60 text-sm leading-relaxed max-w-xl">
                  {selectedAsset.notes || "No description provided for this asset."}
                </div>
                <button
                  onClick={() => handleDownload(selectedAsset)}
                  className="w-full sm:w-auto px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-black/80 dark:hover:bg-neutral-200 transition-colors shadow-lg flex items-center justify-center gap-3"
                >
                  <Download className="w-4 h-4" />
                  Download .VWX
                </button>
              </div>

              {/* Preview Card */}
              <div className="backdrop-blur-xl bg-neutral-900/60 rounded-3xl border border-white/10 overflow-hidden p-2 shadow-none">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/50">
                  {show3DViewer && selectedAsset.glbFileUrl ? (
                    <div className="w-full h-full relative group">
                      {React.createElement('model-viewer', {
                        src: selectedAsset.glbFileUrl,
                        'camera-controls': true,
                        'auto-rotate': true,
                        'shadow-intensity': '1',
                        style: { width: '100%', height: '100%' },
                      })}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white/70 pointer-events-none">
                        Interactive 3D
                      </div>
                      <button
                        onClick={() => setShow3DViewer(false)}
                        className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs text-white backdrop-blur-md transition-colors"
                      >
                        Exit 3D View
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-full h-full relative cursor-zoom-in group"
                      onClick={() => setLightboxImage(allImages[activeImageIndex]?.url)}
                    >
                      <ImageWithFallback
                        src={allImages[activeImageIndex]?.url || ''}
                        alt={selectedAsset.name}
                        className="w-full h-full object-contain"
                      />
                      {selectedAsset.glbFileUrl && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShow3DViewer(true); }}
                          className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                        >
                          <Box className="w-4 h-4" />
                          View 3D Model
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 p-2 mt-2 overflow-x-auto custom-scrollbar">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setActiveImageIndex(idx); setShow3DViewer(false); }}
                        aria-label={`View image ${idx + 1}`}
                        className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === idx && !show3DViewer
                          ? 'border-black/60 dark:border-white/60 opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-100'
                          }`}
                      >
                        <ImageWithFallback src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/5 dark:bg-white/5 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-[24px] p-6 md:p-8">
                  <h3 className="font-pixel text-[10px] tracking-[0.2em] uppercase text-black/40 dark:text-white/40 mb-6">Technical Specs</h3>
                  <div className="space-y-4">
                    <SpecRow icon={FileType} label="Format" value=".vwx (Vectorworks)" />
                    {selectedAsset.backwardsCompatible && <SpecRow icon={Layers} label="Compatible" value={`VW ${selectedAsset.backwardsCompatible}+`} />}
                    <SpecRow icon={Grid3X3} label="Type" value={selectedAsset.assetType === '3d' ? '3D Symbol' : selectedAsset.assetType === '2d' ? '2D Symbol' : 'Hybrid'} />
                  </div>
                </div>

                <div className="bg-black/5 dark:bg-white/5 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-[24px] p-6 md:p-8">
                  <h3 className="font-pixel text-[10px] tracking-[0.2em] uppercase text-black/40 dark:text-white/40 mb-6">Context</h3>
                  <div className="space-y-4">
                    {selectedAsset.era && <SpecRow icon={Calendar} label="Era" value={selectedAsset.era} />}
                    {selectedAsset.style && <SpecRow icon={Tag} label="Style" value={selectedAsset.style} />}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedAsset.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-black/5 dark:bg-white/5 rounded-md text-black/60 dark:text-white/60" role="status" aria-label={`Tag: ${tag}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-20" />
            </div>
          </div>
        </div>

        {/* LIGHTBOX */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-4 cursor-zoom-out"
              onClick={() => setLightboxImage(null)}
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                aria-label="Close lightbox"
                title="Close lightbox"
              >
                <X className="w-8 h-8" />
              </button>
              <ImageWithFallback src={lightboxImage} alt="" className="max-w-full max-h-full object-contain" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==================== MAIN GALLERY VIEW ====================
  return (
    <div className="min-h-screen bg-background">
      {/* Spacer for navbar */}
      <div className="h-20" />

      {/* Hero Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="max-w-2xl">
            <button
              onClick={() => onNavigate('studio')}
              //   href="/studio"
              className="font-pixel text-[11px] tracking-[0.3em] text-muted-foreground hover:text-foreground uppercase mb-4 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Scenic Studio
            </button>
            <h1 className="font-display text-4xl md:text-5xl italic text-foreground">Scenic Vault</h1>
            <p className="font-sans text-lg text-muted-foreground mt-4 leading-relaxed">
              Vectorworks symbols for theatrical scenic designers. Download, use, and modify for your productions.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3 mt-8">
            <div className="flex-1 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-sans w-full bg-muted border-0 rounded-xl pl-12 pr-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`font-sans px-5 py-3.5 rounded-xl transition-all flex items-center gap-2 font-medium ${showFilters || selectedCategory !== 'all'
                ? 'bg-foreground text-background'
                : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Category Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`font-sans px-4 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all'
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    All
                  </button>
                  {displayCategories.map(cat => {
                    const Icon = getCategoryIcon(cat.icon);
                    const count = assets.filter(a => a.category === cat.slug).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`font-sans px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${selectedCategory === cat.slug
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cat.name}
                        <span className="text-xs opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results Header */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <p className="font-sans text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredAssets.length}</span> {filteredAssets.length === 1 ? 'asset' : 'assets'}
            {selectedCategory !== 'all' && <span> in <span className="text-foreground">{getCategoryName(selectedCategory)}</span></span>}
            {searchQuery && <span> matching "<span className="text-foreground">{searchQuery}</span>"</span>}
          </p>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-24">
            <Box className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="font-display text-xl italic text-foreground mb-2">No assets found</h3>
            <p className="font-sans text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Check back soon for new additions'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="font-sans mt-4 text-sm text-foreground underline hover:no-underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onClick={() => setSelectedAsset(asset)}
                getCategoryName={getCategoryName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

function AssetCard({
  asset,
  onClick,
  getCategoryName
}: {
  asset: VaultAsset;
  onClick: () => void;
  getCategoryName: (slug: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* 16:9 Image */}
      <div className="relative aspect-video bg-muted rounded-xl overflow-hidden mb-4">
        {asset.previewImageUrl ? (
          <ImageWithFallback
            src={asset.previewImageUrl}
            alt={asset.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Box className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="font-pixel text-[10px] tracking-[0.15em] uppercase px-2 py-1 bg-black/60 backdrop-blur-sm text-white rounded-md">
            {asset.assetType}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="font-sans opacity-0 group-hover:opacity-100 transition-opacity px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full"
          >
            View Details
          </motion.span>
        </div>
      </div>

      {/* Card Content */}
      <div className="space-y-2">
        {/* Title */}
        <h3 className="font-display text-lg italic text-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
          {asset.name}
        </h3>

        {/* Category */}
        <p className="font-sans text-sm text-muted-foreground">
          {getCategoryName(asset.category)}
        </p>

        {/* Meta Row */}
        <div className="font-sans flex items-center gap-4 text-xs text-muted-foreground pt-1">
          {/* File Size */}
          {asset.fileSize && (
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              {asset.fileSize}
            </span>
          )}
          {/* Downloads */}
          <span className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            {asset.downloadCount.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function SpecRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 last:border-0">
      <div className="flex items-center gap-3 text-black/50 dark:text-white/50">
        <Icon className="w-4 h-4" />
        <span className="font-sans text-sm">{label}</span>
      </div>
      <span className="font-sans text-sm font-light text-black/90 dark:text-white/90">{value}</span>
    </div>
  );
}

export default ScenicVault;
