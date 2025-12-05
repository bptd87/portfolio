import React, { useState, useEffect } from 'react';
import { 
  Download, Search, ArrowLeft, X, Filter, ChevronLeft, ChevronRight,
  Armchair, Theater, Building2, TreePine, Lamp, User, FolderOpen, Grid3X3,
  FileType, HardDrive, Calendar, Eye, Tag, Layers, Box, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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
  { id: 'furniture', name: 'Furniture', slug: 'furniture', description: 'Period and modern furniture', icon: 'armchair', order: 1 },
  { id: 'props', name: 'Props', slug: 'props', description: 'Hand props and set dressing', icon: 'theater', order: 2 },
  { id: 'architectural', name: 'Architectural', slug: 'architectural', description: 'Windows, doors, moldings', icon: 'building', order: 3 },
  { id: 'foliage', name: 'Foliage', slug: 'foliage', description: 'Trees, plants, greenery', icon: 'tree', order: 4 },
  { id: 'lighting', name: 'Lighting', slug: 'lighting', description: 'Practicals and fixtures', icon: 'lamp', order: 5 },
  { id: '2d-symbols', name: '2D Symbols', slug: '2d-symbols', description: 'Figures and scale references', icon: 'user', order: 6 },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  armchair: Armchair, theater: Theater, building: Building2,
  tree: TreePine, lamp: Lamp, user: User, folder: FolderOpen,
};

// Mock assets for development preview
const MOCK_ASSETS: VaultAsset[] = [
  {
    id: '1', name: 'Victorian Settee', slug: 'victorian-settee', category: 'furniture',
    assetType: '3d', vwxFileUrl: '#', vwxVersion: '2024',
    previewImageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=450&fit=crop',
    referencePhotos: [], era: '1860-1900', style: 'Victorian',
    tags: ['sofa', 'seating', 'period'], downloadCount: 127, featured: true,
    enabled: true, createdAt: '2024-01-15', updatedAt: '2024-01-15', fileSize: '2.4 MB',
  },
  {
    id: '2', name: 'Art Deco Floor Lamp', slug: 'art-deco-floor-lamp', category: 'lighting',
    assetType: '3d', vwxFileUrl: '#', vwxVersion: '2024',
    previewImageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=450&fit=crop',
    referencePhotos: [], era: '1920-1940', style: 'Art Deco',
    tags: ['lamp', 'floor lamp', 'practical'], downloadCount: 89, featured: true,
    enabled: true, createdAt: '2024-02-10', updatedAt: '2024-02-10', fileSize: '1.8 MB',
  },
  {
    id: '3', name: 'Georgian Door Frame', slug: 'georgian-door-frame', category: 'architectural',
    assetType: '3d', vwxFileUrl: '#', vwxVersion: '2024',
    previewImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop',
    referencePhotos: [], era: '1714-1830', style: 'Georgian',
    tags: ['door', 'millwork', 'entrance'], downloadCount: 203, featured: true,
    enabled: true, createdAt: '2024-03-05', updatedAt: '2024-03-05', fileSize: '3.1 MB',
  },
  {
    id: '4', name: 'Potted Fern Collection', slug: 'potted-fern-collection', category: 'foliage',
    assetType: '3d', vwxFileUrl: '#', vwxVersion: '2024',
    previewImageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=450&fit=crop',
    referencePhotos: [], style: 'Natural',
    tags: ['plant', 'fern', 'greenery'], downloadCount: 156, featured: false,
    enabled: true, createdAt: '2024-03-20', updatedAt: '2024-03-20', fileSize: '4.2 MB',
  },
  {
    id: '5', name: 'Vintage Telephone', slug: 'vintage-telephone', category: 'props',
    assetType: '3d', vwxFileUrl: '#', vwxVersion: '2024',
    previewImageUrl: 'https://images.unsplash.com/photo-1558618047-f4b511eaa53a?w=800&h=450&fit=crop',
    referencePhotos: [], era: '1930-1960', style: 'Mid-Century',
    tags: ['phone', 'desk prop', 'period'], downloadCount: 78, featured: false,
    enabled: true, createdAt: '2024-04-01', updatedAt: '2024-04-01', fileSize: '0.9 MB',
  },
  {
    id: '6', name: 'Section Symbol Set', slug: 'section-symbol-set', category: '2d-symbols',
    assetType: '2d', vwxFileUrl: '#', vwxVersion: '2024',
    previewImageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=450&fit=crop',
    referencePhotos: [],
    tags: ['drafting', 'symbols', 'annotation'], downloadCount: 312, featured: false,
    enabled: true, createdAt: '2024-04-15', updatedAt: '2024-04-15', fileSize: '0.3 MB',
  },
  {
    id: '7', name: 'Tufted Chesterfield', slug: 'tufted-chesterfield', category: 'furniture',
    assetType: '3d', vwxFileUrl: '#', vwxVersion: '2024',
    previewImageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=450&fit=crop',
    referencePhotos: [], era: '1880-1920', style: 'Victorian',
    tags: ['sofa', 'leather', 'tufted'], downloadCount: 245, featured: false,
    enabled: true, createdAt: '2024-05-01', updatedAt: '2024-05-01', fileSize: '3.7 MB',
  },
  {
    id: '8', name: 'Crystal Chandelier', slug: 'crystal-chandelier', category: 'lighting',
    assetType: '3d', vwxFileUrl: '#', vwxVersion: '2024',
    previewImageUrl: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=800&h=450&fit=crop',
    referencePhotos: [], era: '1850-1920', style: 'Victorian',
    tags: ['chandelier', 'crystal', 'overhead'], downloadCount: 189, featured: false,
    enabled: true, createdAt: '2024-05-15', updatedAt: '2024-05-15', fileSize: '5.2 MB',
  },
];

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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/vault/public`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Use API data if available, otherwise keep mock data
          if (data.assets && data.assets.length > 0) {
            setAssets(data.assets);
          }
          const serverCategories = data.categories || [];
          setCategories(serverCategories.length > 0 ? serverCategories : DEFAULT_CATEGORIES);
        }
      }
    } catch (error) {
      // Keep mock assets and default categories on error
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (asset: VaultAsset) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/vault/assets/${asset.id}/download`,
        { method: 'POST', headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
    } catch (error) {
      }
    window.open(asset.vwxFileUrl, '_blank');
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
  if (selectedAsset) {
    const allImages = getAllImages(selectedAsset);
    const currentImage = allImages[activeImageIndex];

    return (
      <div className="min-h-screen bg-background">
        {/* Lightbox */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              onClick={() => setLightboxImage(null)}
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-6 right-6 text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <img src={lightboxImage} alt="" className="max-w-full max-h-full object-contain" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spacer for navbar */}
        <div className="h-20" />
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedAsset(null)}
            className="font-sans flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Vault</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Images (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Main Image */}
              <div 
                className="relative aspect-video bg-muted rounded-xl overflow-hidden cursor-zoom-in group"
                onClick={() => currentImage && setLightboxImage(currentImage.url)}
              >
                {show3DViewer && selectedAsset.glbFileUrl ? (
                  React.createElement('model-viewer', {
                    src: selectedAsset.glbFileUrl,
                    'camera-controls': true,
                    'auto-rotate': true,
                    'shadow-intensity': '1',
                    style: { width: '100%', height: '100%' },
                  })
                ) : currentImage ? (
                  <>
                    <ImageWithFallback
                      src={currentImage.url}
                      alt={selectedAsset.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-60 transition-opacity" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Box className="w-16 h-16" />
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setActiveImageIndex(idx); setShow3DViewer(false); }}
                      className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx && !show3DViewer
                          ? 'border-foreground'
                          : 'border-transparent hover:border-foreground/40'
                      }`}
                    >
                      <ImageWithFallback
                        src={img.url}
                        alt={img.caption || ''}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                  {selectedAsset.glbFileUrl && (
                    <button
                      onClick={() => setShow3DViewer(true)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg border-2 transition-all flex items-center justify-center gap-1 ${
                        show3DViewer
                          ? 'border-foreground bg-foreground/10'
                          : 'border-border hover:border-foreground/40 bg-muted'
                      }`}
                    >
                      <Box className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">3D</span>
                    </button>
                  )}
                </div>
              )}

              {/* Description */}
              {selectedAsset.notes && (
                <div className="bg-muted rounded-xl p-6">
                  <h3 className="font-sans text-foreground font-semibold mb-3">Description</h3>
                  <p className="font-sans text-muted-foreground leading-relaxed">{selectedAsset.notes}</p>
                </div>
              )}
            </div>

            {/* Right Column - Details (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Category */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-pixel text-[10px] tracking-[0.15em] px-2.5 py-1 bg-muted text-muted-foreground rounded-md uppercase">
                    {selectedAsset.assetType}
                  </span>
                </div>
                <h1 className="font-display text-3xl italic text-foreground mb-1">{selectedAsset.name}</h1>
                <p className="font-sans text-muted-foreground">{getCategoryName(selectedAsset.category)}</p>
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(selectedAsset)}
                className="font-sans w-full bg-foreground text-background font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5" />
                Download
              </button>

              {/* Specifications Table */}
              <div className="bg-muted rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-sans text-foreground font-semibold">Specifications</h3>
                </div>
                <div className="divide-y divide-border">
                  <SpecRow icon={FileType} label="Format" value=".vwx (Vectorworks)" />
                  <SpecRow icon={Layers} label="Version" value={`VW ${selectedAsset.vwxVersion}`} />
                  {selectedAsset.backwardsCompatible && (
                    <SpecRow icon={Layers} label="Compatible" value={`VW ${selectedAsset.backwardsCompatible}+`} />
                  )}
                  <SpecRow icon={HardDrive} label="File Size" value={formatFileSize(selectedAsset.fileSize)} />
                  <SpecRow icon={Grid3X3} label="Type" value={selectedAsset.assetType === '3d' ? '3D Symbol' : selectedAsset.assetType === '2d' ? '2D Symbol' : 'Hybrid'} />
                  {selectedAsset.era && <SpecRow icon={Calendar} label="Era/Period" value={selectedAsset.era} />}
                  {selectedAsset.style && <SpecRow icon={Tag} label="Style" value={selectedAsset.style} />}
                  <SpecRow icon={Download} label="Downloads" value={selectedAsset.downloadCount.toLocaleString()} />
                  <SpecRow icon={Calendar} label="Added" value={formatDate(selectedAsset.createdAt)} />
                </div>
              </div>

              {/* Tags */}
              {selectedAsset.tags && selectedAsset.tags.length > 0 && (
                <div className="bg-muted rounded-xl p-5">
                  <h3 className="font-sans text-foreground font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAsset.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="font-sans text-sm px-3 py-1.5 bg-background text-muted-foreground rounded-full hover:text-foreground transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Photos */}
              {selectedAsset.referencePhotos && selectedAsset.referencePhotos.length > 0 && (
                <div className="bg-muted rounded-xl p-5">
                  <h3 className="font-sans text-foreground font-semibold mb-3">Reference Sources</h3>
                  <div className="space-y-2">
                    {selectedAsset.referencePhotos.map((photo, idx) => (
                      photo.source && (
                        <a
                          key={idx}
                          href={photo.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {photo.caption || 'Source'}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Assets Section */}
          {(() => {
            const relatedAssets = assets
              .filter(a => a.id !== selectedAsset.id && (a.category === selectedAsset.category || a.style === selectedAsset.style))
              .slice(0, 4);
            
            if (relatedAssets.length === 0) return null;
            
            return (
              <div className="mt-16 pt-12 border-t border-border">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-2xl italic text-foreground">More Like This</h2>
                  <button
                    onClick={() => { setSelectedAsset(null); setSelectedCategory(selectedAsset.category); }}
                    className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    View all in {getCategoryName(selectedAsset.category)}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedAssets.map(asset => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onClick={() => { setSelectedAsset(asset); setActiveImageIndex(0); setShow3DViewer(false); }}
                      getCategoryName={getCategoryName}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
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
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`font-sans px-5 py-3.5 rounded-xl transition-all flex items-center gap-2 font-medium ${
                showFilters || selectedCategory !== 'all'
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
                    className={`font-sans px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === 'all'
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
                        className={`font-sans px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                          selectedCategory === cat.slug
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
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="font-sans text-sm">{label}</span>
      </div>
      <span className="font-sans text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default ScenicVault;
