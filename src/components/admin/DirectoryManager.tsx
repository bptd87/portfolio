import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, ExternalLink, Building2, Code, Palette, BookOpen, FolderOpen, GripVertical, X } from 'lucide-react';
import { Reorder } from 'motion/react';
import { toast } from 'sonner';
import { createClient } from '../../utils/supabase/client';
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

const supabase = createClient();

interface DirectoryLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category_slug: string;
  enabled: boolean;
  display_order: number;
}

interface DirectoryCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  building: Building2,
  code: Code,
  palette: Palette,
  book: BookOpen,
  folder: FolderOpen,
};

// Shared color mapping (matches Directory.tsx)
const ICON_COLORS: Record<string, string> = {
  building: 'text-green-400',
  code: 'text-blue-400',
  palette: 'text-red-400',
  book: 'text-yellow-400',
  folder: 'text-purple-400',
};

const ICON_OPTIONS = [
  { value: 'building', label: 'Building (Green - Organizations)' },
  { value: 'code', label: 'Code (Blue - Software)' },
  { value: 'palette', label: 'Palette (Red - Supplies)' },
  { value: 'book', label: 'Book (Yellow - Research)' },
  { value: 'folder', label: 'Folder (Purple - General)' },
];

const DEFAULT_CATEGORIES: Partial<DirectoryCategory>[] = [
  { name: 'Organizations', slug: 'organizations', description: 'Professional unions, societies, and industry groups', icon: 'building', display_order: 0 },
  { name: 'Software', slug: 'software', description: 'Essential design and drafting tools', icon: 'code', display_order: 1 },
  { name: 'Supplies & Materials', slug: 'supplies', description: 'Paint, fabric, hardware, and scenic materials', icon: 'palette', display_order: 2 },
  { name: 'Research & Inspiration', slug: 'research', description: 'Archives, publications, and design resources', icon: 'book', display_order: 3 },
];

export function DirectoryManager() {
  const [links, setLinks] = useState<DirectoryLink[]>([]);
  const [categories, setCategories] = useState<DirectoryCategory[]>([]);
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
    category_slug: 'organizations',
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
      const [linksRes, catsRes] = await Promise.all([
        supabase.from('directory_links').select('*').order('display_order'),
        supabase.from('directory_categories').select('*').order('display_order')
      ]);

      if (linksRes.data) setLinks(linksRes.data);
      if (catsRes.data) setCategories(catsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load directory data');
    } finally {
      setLoading(false);
    }
  };

  // Link CRUD operations
  const handleSaveLink = async () => {
    if (!linkFormData.title || !linkFormData.url) {
      toast.error('Please fill in title and URL');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...linkFormData,
        display_order: editingLink?.display_order ?? links.length,
      };

      let error;
      if (editingLink) {
        const { error: updateError } = await supabase
          .from('directory_links')
          .update(payload)
          .eq('id', editingLink.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('directory_links')
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingLink ? 'Link updated' : 'Link added');
      await fetchData();
      resetLinkForm();
    } catch (error: any) {
      toast.error(`Error saving link: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const { error } = await supabase.from('directory_links').delete().eq('id', id);
      if (error) throw error;
      setLinks(links.filter(l => l.id !== id));
      toast.success('Link deleted');
    } catch (error: any) {
      toast.error(`Error deleting link: ${error.message}`);
    }
  };

  const handleToggleLink = async (link: DirectoryLink) => {
    try {
      const { error } = await supabase
        .from('directory_links')
        .update({ enabled: !link.enabled })
        .eq('id', link.id);

      if (error) throw error;
      setLinks(links.map(l => l.id === link.id ? { ...l, enabled: !l.enabled } : l));
    } catch (error) {
      toast.error('Failed to toggle visibility');
    }
  };

  // Category CRUD operations
  const handleSaveCategory = async () => {
    if (!categoryFormData.name || !categoryFormData.slug) {
      toast.error('Please fill in name and slug');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...categoryFormData,
        display_order: editingCategory?.display_order ?? categories.length,
      };

      let error;
      if (editingCategory) {
        const { error: updateError } = await supabase
          .from('directory_categories')
          .update(payload)
          .eq('id', editingCategory.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('directory_categories')
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingCategory ? 'Category updated' : 'Category added');
      await fetchData();
      resetCategoryForm();
    } catch (error: any) {
      toast.error(`Error saving category: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, slug: string) => {
    const categoryLinks = links.filter(l => l.category_slug === slug);
    if (categoryLinks.length > 0) {
      toast.error(`Cannot delete category with ${categoryLinks.length} links. Move or delete them first.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase.from('directory_categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch (error: any) {
      toast.error(`Error deleting category: ${error.message}`);
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
      category_slug: categories[0]?.slug || '',
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
    if (!confirm('This will add default categories to the database. Continue?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('directory_categories')
        .insert(DEFAULT_CATEGORIES);

      if (error) throw error;
      toast.success('Default categories added!');
      await fetchData();
    } catch (error: any) {
      toast.error(`Error seeding directory: ${error.message}`);
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
    : links.filter(l => l.category_slug === selectedCategory);

  const sortedFilteredLinks = [...filteredLinks].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

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
        {categories.length === 0 && (
          <SecondaryButton onClick={handleSeedDirectory} disabled={saving}>
            {saving ? 'Seeding...' : 'Seed Default Categories'}
          </SecondaryButton>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'links'
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
        >
          Links ({links.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'categories'
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
                <button type="button" onClick={resetLinkForm} className="text-gray-400 hover:text-white" aria-label="Close">
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
                    value={linkFormData.category_slug || ''}
                    onChange={(e) => setLinkFormData({ ...linkFormData, category_slug: e.target.value })}
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
              <Reorder.Group
                axis="y"
                values={sortedFilteredLinks}
                onReorder={(newOrder) => {
                  setLinks(newOrder); // Optimistic update
                }}
                className="space-y-2"
              >
                {sortedFilteredLinks.map((link) => {
                  const category = categories.find(c => c.slug === link.category_slug);
                  return (
                    <Reorder.Item
                      key={link.id}
                      value={link}
                      className={listItemClasses}
                      onDragEnd={async () => {
                        // Drag reorder saving logic to be implemented if needed
                        // For now just local reorder
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Drag Handle */}
                        <div className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-white">
                          <GripVertical className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${link.enabled ? 'text-white' : 'text-gray-500'}`}>
                              {link.title}
                            </span>
                            <span className={badgeClasses}>
                              {category?.name || link.category_slug}
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
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
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
                <button type="button" onClick={resetCategoryForm} className="text-gray-400 hover:text-white" aria-label="Close">
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
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
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
              const linkCount = links.filter(l => l.category_slug === category.slug).length;
              const iconColor = ICON_COLORS[category.icon] || 'text-purple-400';

              return (
                <div key={category.id} className={listItemClasses}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <IconComponent className={`w-5 h-5 ${iconColor}`} />
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
                      onClick={() => handleDeleteCategory(category.id, category.slug)}
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
