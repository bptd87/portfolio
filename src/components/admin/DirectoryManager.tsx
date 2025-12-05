import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, ExternalLink, Save, X, ChevronUp, ChevronDown, Building2, Code, Palette, BookOpen, FolderOpen } from 'lucide-react';
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

// Get admin token from sessionStorage (same as other managers)
const getAdminToken = () => sessionStorage.getItem('admin_token') || '';

interface DirectoryLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  enabled: boolean;
  order: number;
}

interface DirectoryCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  building: Building2,
  code: Code,
  palette: Palette,
  book: BookOpen,
  folder: FolderOpen,
};

const ICON_OPTIONS = [
  { value: 'building', label: 'Building (Organizations)' },
  { value: 'code', label: 'Code (Software)' },
  { value: 'palette', label: 'Palette (Supplies)' },
  { value: 'book', label: 'Book (Research)' },
  { value: 'folder', label: 'Folder (General)' },
];

const DEFAULT_CATEGORIES: DirectoryCategory[] = [
  { id: 'organizations', name: 'Organizations', slug: 'organizations', description: 'Professional unions, societies, and industry groups', icon: 'building', order: 0 },
  { id: 'software', name: 'Software', slug: 'software', description: 'Essential design and drafting tools', icon: 'code', order: 1 },
  { id: 'supplies', name: 'Supplies & Materials', slug: 'supplies', description: 'Paint, fabric, hardware, and scenic materials', icon: 'palette', order: 2 },
  { id: 'research', name: 'Research & Inspiration', slug: 'research', description: 'Archives, publications, and design resources', icon: 'book', order: 3 },
];

export function DirectoryManager() {
  const [links, setLinks] = useState<DirectoryLink[]>([]);
  const [categories, setCategories] = useState<DirectoryCategory[]>(DEFAULT_CATEGORIES);
  const [dataFromServer, setDataFromServer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'links' | 'categories'>('links');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Link form state
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingLink, setEditingLink] = useState<DirectoryLink | null>(null);
  const [linkFormData, setLinkFormData] = useState<Partial<DirectoryLink>>({
    title: '',
    url: '',
    description: '',
    category: 'organizations',
    enabled: true,
  });
  
  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DirectoryCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<DirectoryCategory>>({
    name: '',
    slug: '',
    description: '',
    icon: 'folder',
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch directory links
      const linksResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (linksResponse.ok) {
        const data = await linksResponse.json();
        if (data.success) {
          setLinks(data.links || []);
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
            setDataFromServer(true);
          }
          if (data.links && data.links.length > 0) {
            setDataFromServer(true);
          }
        }
      }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  // Link CRUD operations
  const handleSaveLink = async () => {
    if (!linkFormData.title || !linkFormData.url) {
      alert('Please fill in title and URL');
      return;
    }

    setSaving(true);
    try {
      const endpoint = editingLink 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory/links/${editingLink.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory/links`;
      
      const response = await fetch(endpoint, {
        method: editingLink ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'X-Admin-Token': getAdminToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...linkFormData,
          order: editingLink?.order ?? links.length,
        }),
      });

      if (response.ok) {
        await fetchData();
        resetLinkForm();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save link');
      }
    } catch (error) {
      alert('Error saving link');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory/links/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}`, 'X-Admin-Token': getAdminToken() },
        }
      );

      if (response.ok) {
        setLinks(links.filter(l => l.id !== id));
      }
    } catch (error) {
      }
  };

  const handleToggleLink = async (link: DirectoryLink) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory/links/${link.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'X-Admin-Token': getAdminToken(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...link, enabled: !link.enabled }),
        }
      );

      if (response.ok) {
        setLinks(links.map(l => l.id === link.id ? { ...l, enabled: !l.enabled } : l));
      }
    } catch (error) {
      }
  };

  const handleMoveLink = async (link: DirectoryLink, direction: 'up' | 'down') => {
    const categoryLinks = links.filter(l => l.category === link.category).sort((a, b) => a.order - b.order);
    const currentIndex = categoryLinks.findIndex(l => l.id === link.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= categoryLinks.length) return;
    
    const targetLink = categoryLinks[targetIndex];
    
    // Swap orders
    const newLinks = links.map(l => {
      if (l.id === link.id) return { ...l, order: targetLink.order };
      if (l.id === targetLink.id) return { ...l, order: link.order };
      return l;
    });
    
    setLinks(newLinks);
    
    // Save to server
    try {
      await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory/links/${link.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${publicAnonKey}`, 'X-Admin-Token': getAdminToken(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...link, order: targetLink.order }),
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory/links/${targetLink.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${publicAnonKey}`, 'X-Admin-Token': getAdminToken(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...targetLink, order: link.order }),
        }),
      ]);
    } catch (error) {
      }
  };

  // Category CRUD operations
  const handleSaveCategory = async () => {
    if (!categoryFormData.name || !categoryFormData.slug) {
      alert('Please fill in name and slug');
      return;
    }

    setSaving(true);
    try {
      const endpoint = editingCategory 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory/categories/${editingCategory.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory/categories`;
      
      const response = await fetch(endpoint, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'X-Admin-Token': getAdminToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...categoryFormData,
          order: editingCategory?.order ?? categories.length,
        }),
      });

      if (response.ok) {
        await fetchData();
        resetCategoryForm();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save category');
      }
    } catch (error) {
      alert('Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const categoryLinks = links.filter(l => l.category === id);
    if (categoryLinks.length > 0) {
      alert(`Cannot delete category with ${categoryLinks.length} links. Move or delete the links first.`);
      return;
    }
    
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory/categories/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}`, 'X-Admin-Token': getAdminToken() },
        }
      );

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (error) {
      }
  };

  // Form helpers
  const resetLinkForm = () => {
    setShowLinkForm(false);
    setEditingLink(null);
    setLinkFormData({
      title: '',
      url: '',
      description: '',
      category: 'organizations',
      enabled: true,
    });
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

  const handleSeedDirectory = async () => {
    if (!confirm('This will add default categories and links. Continue?')) return;

    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/directory/seed`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${publicAnonKey}`, 'X-Admin-Token': getAdminToken() },
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Directory seeded successfully!');
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to seed directory');
      }
    } catch (error) {
      alert('Error seeding directory');
    } finally {
      setSaving(false);
    }
  };

  const startEditLink = (link: DirectoryLink) => {
    setEditingLink(link);
    setLinkFormData(link);
    setShowLinkForm(true);
  };

  const startEditCategory = (category: DirectoryCategory) => {
    setEditingCategory(category);
    setCategoryFormData(category);
    setShowCategoryForm(true);
  };

  // Filtered links
  const filteredLinks = selectedCategory === 'all' 
    ? links 
    : links.filter(l => l.category === selectedCategory);
  
  const sortedFilteredLinks = [...filteredLinks].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display italic text-white">Scenic Directory</h2>
          <p className="text-sm text-gray-400 mt-1">Manage industry resources and links</p>
        </div>
        {links.length === 0 && !dataFromServer && (
          <SecondaryButton onClick={handleSeedDirectory} disabled={saving}>
            {saving ? 'Seeding...' : 'Seed Default Data'}
          </SecondaryButton>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            activeTab === 'links' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Links ({links.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            activeTab === 'categories' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* Links Tab */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          {/* Filter & Add */}
          <div className="flex items-center justify-between gap-4">
            <DarkSelect
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="max-w-xs"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </DarkSelect>
            
            <PrimaryButton onClick={() => setShowLinkForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </PrimaryButton>
          </div>

          {/* Link Form */}
          {showLinkForm && (
            <div className={formContainerClasses}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  {editingLink ? 'Edit Link' : 'Add New Link'}
                </h3>
                <button onClick={resetLinkForm} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <DarkLabel>Title *</DarkLabel>
                  <DarkInput
                    value={linkFormData.title || ''}
                    onChange={(e) => setLinkFormData({ ...linkFormData, title: e.target.value })}
                    placeholder="e.g., United Scenic Artists"
                  />
                </div>
                <div>
                  <DarkLabel>URL *</DarkLabel>
                  <DarkInput
                    value={linkFormData.url || ''}
                    onChange={(e) => setLinkFormData({ ...linkFormData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <DarkLabel>Description</DarkLabel>
                  <DarkTextarea
                    value={linkFormData.description || ''}
                    onChange={(e) => setLinkFormData({ ...linkFormData, description: e.target.value })}
                    placeholder="Brief description of the resource"
                    rows={2}
                  />
                </div>
                <div>
                  <DarkLabel>Category *</DarkLabel>
                  <DarkSelect
                    value={linkFormData.category || 'organizations'}
                    onChange={(e) => setLinkFormData({ ...linkFormData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </DarkSelect>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="linkEnabled"
                    checked={linkFormData.enabled !== false}
                    onChange={(e) => setLinkFormData({ ...linkFormData, enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800"
                  />
                  <label htmlFor="linkEnabled" className="text-sm text-gray-300">
                    Enabled (visible on site)
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <CancelButton onClick={resetLinkForm}>Cancel</CancelButton>
                <SaveButton onClick={handleSaveLink} disabled={saving}>
                  {saving ? 'Saving...' : (editingLink ? 'Update Link' : 'Add Link')}
                </SaveButton>
              </div>
            </div>
          )}

          {/* Links List */}
          <div className="space-y-2">
            {sortedFilteredLinks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No links found. Add your first link above.
              </div>
            ) : (
              sortedFilteredLinks.map((link, index) => {
                const category = categories.find(c => c.slug === link.category);
                return (
                  <div key={link.id} className={listItemClasses}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveLink(link, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-white disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveLink(link, 'down')}
                          disabled={index === sortedFilteredLinks.length - 1}
                          className="p-1 text-gray-500 hover:text-white disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${link.enabled ? 'text-white' : 'text-gray-500'}`}>
                            {link.title}
                          </span>
                          <span className={badgeClasses}>
                            {category?.name || link.category}
                          </span>
                          {!link.enabled && (
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate">{link.description}</div>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 truncate block"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <IconButton 
                        onClick={() => handleToggleLink(link)}
                        title={link.enabled ? 'Hide' : 'Show'}
                      >
                        {link.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </IconButton>
                      <IconButton 
                        onClick={() => startEditLink(link)}
                        title="Edit"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteLink(link.id)}
                        title="Delete"
                        variant="danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <PrimaryButton onClick={() => setShowCategoryForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </PrimaryButton>
          </div>

          {/* Category Form */}
          {showCategoryForm && (
            <div className={formContainerClasses}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button onClick={resetCategoryForm} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <DarkLabel>Name *</DarkLabel>
                  <DarkInput
                    value={categoryFormData.name || ''}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    placeholder="e.g., Organizations"
                  />
                </div>
                <div>
                  <DarkLabel>Slug *</DarkLabel>
                  <DarkInput
                    value={categoryFormData.slug || ''}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g., organizations"
                  />
                </div>
                <div className="md:col-span-2">
                  <DarkLabel>Description</DarkLabel>
                  <DarkTextarea
                    value={categoryFormData.description || ''}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={2}
                  />
                </div>
                <div>
                  <DarkLabel>Icon</DarkLabel>
                  <DarkSelect
                    value={categoryFormData.icon || 'folder'}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
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
                  {saving ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                </SaveButton>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            {categories.map(category => {
              const IconComponent = CATEGORY_ICONS[category.icon] || FolderOpen;
              const linkCount = links.filter(l => l.category === category.slug).length;
              
              return (
                <div key={category.id} className={listItemClasses}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.description}</div>
                      <div className="text-xs text-gray-600">{linkCount} links</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <IconButton 
                      onClick={() => startEditCategory(category)}
                      title="Edit"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteCategory(category.id)}
                      title="Delete"
                      variant="danger"
                      disabled={linkCount > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
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
