
import { useState, useEffect } from 'react';
import { Save, X, Pencil, Trash2, FileText, Briefcase, Newspaper, Grid3x3, Plus } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { SaveButton, CancelButton, SecondaryButton, IconButton, PrimaryButton } from './AdminButtons';
import { AdminPageHeader } from './shared/AdminPageHeader';
import {
  DarkInput,
  DarkTextarea,
  DarkSelect,
  DarkLabel,
  formContainerClasses
} from './DarkModeStyles';

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  type: string;
  template?: string; // For portfolio categories: which layout template to use
}

interface CategorySet {
  portfolio: Category[];
  articles: Category[];
  news: Category[];
}

// Default categories to seed when empty
const DEFAULT_CATEGORIES: CategorySet = {
  portfolio: [
    { id: 'scenic', name: 'Scenic Design', slug: 'scenic', color: '#2563EB', type: 'portfolio', template: 'editorial' },
    { id: 'experiential', name: 'Experiential', slug: 'experiential', color: '#F59E0B', type: 'portfolio', template: 'blog-style' },
    { id: 'rendering', name: 'Rendering', slug: 'rendering', color: '#9333EA', type: 'portfolio', template: 'rendering' },
  ],
  articles: [
    { id: 'philosophy', name: 'Design Philosophy', slug: 'philosophy', color: '#3B82F6', type: 'articles' },
    { id: 'process', name: 'Scenic Design Process', slug: 'process', color: '#10B981', type: 'articles' },
    { id: 'tech', name: 'Technology & Tutorials', slug: 'tech', color: '#8B5CF6', type: 'articles' },
    { id: 'experiential', name: 'Experiential Design', slug: 'experiential', color: '#F59E0B', type: 'articles' },
  ],
  news: [
    { id: 'announcement', name: 'Announcement', slug: 'announcement', color: '#3B82F6', type: 'news' },
    { id: 'event', name: 'Event', slug: 'event', color: '#10B981', type: 'news' },
    { id: 'update', name: 'Update', slug: 'update', color: '#F59E0B', type: 'news' },
  ],
};

export function CategoryManager() {
  const [categories, setCategories] = useState<CategorySet>({
    portfolio: [],
    articles: [],
    news: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'articles' | 'news'>('portfolio');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({});
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  // Seed default categories for a specific type
  const handleSeedDefaults = async (type: 'portfolio' | 'articles' | 'news') => {
    if (!confirm(`This will add default ${type} categories. Continue?`)) {
      return;
    }

    setSeeding(true);
    try {
      const defaultCats = DEFAULT_CATEGORIES[type];

      const { error } = await supabase
        .from('categories')
        .upsert(
          defaultCats.map(c => {
            const { id, ...rest } = c; // Let DB handle IDs for new inserts unless we want to force them
            return { ...rest, type }; // Ensure type is set
          }),
          { onConflict: 'type,slug' }
        );

      if (error) throw error;

      // Reload categories
      await loadCategories();
      alert(`Default ${type} categories added successfully!`);
    } catch (err: any) {
      alert(`Failed to seed categories: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const newCategories: CategorySet = {
          portfolio: [],
          articles: [],
          news: [],
        };

        data.forEach(cat => {
          if (cat.type === 'portfolio') newCategories.portfolio.push(cat);
          else if (cat.type === 'articles') newCategories.articles.push(cat);
          else if (cat.type === 'news') newCategories.news.push(cat);
        });

        setCategories(newCategories);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      slug: '',
      color: '#3B82F6',
      description: '',
      template: activeTab === 'portfolio' ? 'editorial' : undefined,
      type: activeTab,
    });
    setEditingId('new');
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setFormData(category);
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({});
    setEditingId(null);
    setShowForm(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const slug = formData.slug?.trim() || generateSlug(formData.name);

      const categoryData = {
        ...formData,
        slug,
        type: activeTab,
      };

      let result;
      if (editingId === 'new') {
        result = await supabase
          .from('categories')
          .insert([categoryData]);
      } else {
        result = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingId);
      }

      if (result.error) throw result.error;

      await loadCategories();
      handleCancel();

    } catch (err: any) {
      alert(`Failed to save category: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This may affect existing content.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      await loadCategories();

    } catch (err: any) {
      alert(`Failed to delete category: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading categories...</div>;
  }

  const currentCategories = categories[activeTab] || [];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-zinc-800">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-4 py-3 text-xs tracking-wider uppercase border-b-2 transition-all ${activeTab === 'portfolio'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-white'
              }`}
          >
            <Briefcase className="w-4 h-4" />
            Portfolio Categories
            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-xs">{categories.portfolio.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-4 py-3 text-xs tracking-wider uppercase border-b-2 transition-all ${activeTab === 'articles'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-white'
              }`}
          >
            <FileText className="w-4 h-4" />
            Article Categories
            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-xs">{categories.articles.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-2 px-4 py-3 text-xs tracking-wider uppercase border-b-2 transition-all ${activeTab === 'news'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-white'
              }`}
          >
            <Newspaper className="w-4 h-4" />
            News Categories
            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-xs">{categories.news.length}</span>
          </button>
        </div>
      </div>

      {!showForm && (
        <AdminPageHeader
          title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Categories`}
          description={`${currentCategories.length} ${currentCategories.length === 1 ? 'category' : 'categories'}`}
          onCreate={handleCreate}
          createLabel="New Category"
        />
      )}

      {/* Form */}
      {showForm && (
        <div className={formContainerClasses}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="tracking-tight text-white">
              {editingId === 'new' ? 'Create New Category' : 'Edit Category'}
            </h3>
            <button
              onClick={handleCancel}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <DarkLabel>
                Category Name *
              </DarkLabel>
              <DarkInput
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                })}
                placeholder="e.g., Lighting Design"
              />
            </div>

            <div>
              <DarkLabel>
                Slug (URL-friendly)
              </DarkLabel>
              <DarkInput
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="font-mono text-sm"
                placeholder="lighting-design"
              />
              <p className="text-xs text-zinc-500 mt-1">Auto-generated from name if left empty</p>
            </div>

            <div>
              <DarkLabel>
                Color
              </DarkLabel>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color || '#3B82F6'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 rounded border border-zinc-700 cursor-pointer"
                  title="Category color"
                  aria-label="Category color"
                />
                <DarkInput
                  type="text"
                  value={formData.color || '#3B82F6'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 font-mono text-sm"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <DarkLabel>
                Description (Optional)
              </DarkLabel>
              <DarkTextarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Brief description of this category..."
              />
            </div>

            {/* Template selector - only for portfolio categories */}
            {activeTab === 'portfolio' && (
              <div>
                <DarkLabel>
                  Template Layout *
                </DarkLabel>
                <DarkSelect
                  value={formData.template || 'editorial'}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                >
                  <option value="editorial">Editorial Split-Screen (Scenic Design)</option>
                  <option value="blog-style">Blog-Style Mixed Content (Experiential)</option>
                  <option value="rendering">Rendering Showcase</option>
                  <option value="gallery">Default Gallery</option>
                </DarkSelect>
                <p className="text-xs text-zinc-500 mt-1">
                  Determines how project detail pages are displayed
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <SaveButton
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                <span className="text-xs tracking-wider uppercase">
                  {saving ? 'Saving...' : 'Save Category'}
                </span>
              </SaveButton>
              <CancelButton
                onClick={handleCancel}
              >
                <span className="text-xs tracking-wider uppercase">Cancel</span>
              </CancelButton>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      {!showForm && currentCategories.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <Grid3x3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="mb-4">No categories yet. Create your first one or load defaults!</p>
          <SecondaryButton
            onClick={() => handleSeedDefaults(activeTab)}
            disabled={seeding}
          >
            {seeding ? 'Adding...' : `Load Default ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Categories`}
          </SecondaryButton>
        </div>
      )}

      {!showForm && currentCategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentCategories.map((category) => (
            <div
              key={category.id}
              className="border border-zinc-800 p-4 rounded-lg hover:border-zinc-700 transition-colors bg-zinc-900/50 backdrop-blur"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  />
                  <h4 className="tracking-tight font-medium text-white">{category.name}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="w-4 h-4" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(category.id)}
                    variant="danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider">Slug:</span>
                  <code className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{category.slug}</code>
                </div>
                {activeTab === 'portfolio' && category.template && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 uppercase tracking-wider">Template:</span>
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                      {category.template === 'editorial' && '📄 Editorial Split-Screen'}
                      {category.template === 'blog-style' && '📝 Blog-Style'}
                      {category.template === 'rendering' && '🎨 Rendering Showcase'}
                      {category.template === 'gallery' && '🖼️ Default Gallery'}
                    </span>
                  </div>
                )}
                {category.description && (
                  <p className="text-xs text-zinc-400">{category.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
