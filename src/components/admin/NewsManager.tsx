import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { NewsBlock, newsItems as hardcodedNews } from '../../data/news';
import { SquarespaceImporter } from './SquarespaceImporter';
import { ImageUploader } from './ImageUploader';
import { FocusPointPicker } from './FocusPointPicker';
import { useCategories } from '../../hooks/useCategories';
import { PrimaryButton, SaveButton, CancelButton, IconButton } from './AdminButtons';
import {
  DarkInput,
  DarkTextarea,
  DarkSelect,
  DarkLabel,
  formContainerClasses,
  listItemClasses
} from './DarkModeStyles';
import { InfoBanner } from './InfoBanner';
import { NewsBlockEditor } from './NewsBlockEditor';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  lastModified: string;
  category: string;
  excerpt: string;
  content?: string;
  blocks?: NewsBlock[];
  link?: string;
  location?: string;
  coverImage?: string;
  coverImageFocalPoint?: { x: number; y: number };
  images?: { url: string; caption?: string }[];
  tags: string[];
  slug?: string;
}

export function NewsManager() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<NewsItem>>({});
  const [showForm, setShowForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  const { categories } = useCategories();

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      // Use authenticated endpoint to get all news
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/news`,
        {
          headers: {
            'Authorization': `Bearer ${token || publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();

      if (data.success) {
        // Sort news by date (newest first)
        const sortedNews = (data.news || []).sort((a: NewsItem, b: NewsItem) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setNewsItems(sortedNews);
        toast.success(`Loaded ${sortedNews.length} news items from server`);
      } else {
        console.error('API return success: false, using local data');
        const sorted = [...hardcodedNews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNewsItems(sorted as any);
        toast.error('Failed to load news, using local data');
      }
    } catch (err) {
      console.error('API error, using local data as fallback:', err);
      const sorted = [...hardcodedNews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNewsItems(sorted as any);
      toast.error('Error loading news, using local data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      category: categories.news[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      excerpt: '',
      tags: [],
      images: [],
    });
    setEditingId('new');
    setShowForm(true);
  };

  const handleEdit = (item: NewsItem) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const isNew = editingId === 'new';

      // Generate slug if new
      let slug = formData.slug;
      if (isNew && formData.title) {
        slug = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      const url = isNew
        ? `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/news`
        : `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/news/${editingId}`;

      const dataToSave = {
        ...formData,
        slug,
        lastModified: new Date().toISOString().split('T')[0],
      };

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        await loadNews();
        setShowForm(false);
        setEditingId(null);
        setFormData({});
        toast.success('News item saved successfully');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        toast.error('Failed to save news item: ' + (errorData.error || response.statusText));
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save news item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return;

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/news/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadNews();
        toast.success('News item deleted');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete news item');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
  };

  if (loading) {
    return <div className="text-center py-12 opacity-60">Loading news...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Helpful Instructions Banner */}
      <InfoBanner
        title="News Manager"
        description="Manage news updates and announcements here. Perfect for awards, productions, and achievements."
        tips={[
          '<strong>Create:</strong> Click "New News Item" to add an announcement',
          '<strong>Edit:</strong> Click the edit icon to modify any news item',
          '<strong>Rich Content:</strong> Add images and formatted text with the block editor',
          '<strong>Instant Updates:</strong> Changes go live immediately after saving'
        ]}
        icon="📰"
        variant="purple"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl tracking-tight text-white">News & Updates</h2>
          <p className="text-sm text-gray-400 mt-1">{newsItems.length} total news items</p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowImporter(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary/30 hover:bg-secondary/50 text-white rounded-lg transition-colors border border-border"
            >
              <span className="text-sm">Import (Squarespace)</span>
            </button>
            <PrimaryButton onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase">New News Item</span>
            </PrimaryButton>
          </div>
        )}
      </div>

      {/* Importer Modal */}
      {showImporter && (
        <SquarespaceImporter
          target="news"
          onComplete={() => {
            setShowImporter(false);
            loadNews();
          }}
          onCancel={() => setShowImporter(false)}
        />
      )}

      {/* Form */}
      {showForm && (
        <div className={formContainerClasses}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="tracking-tight text-white">
              {editingId === 'new' ? 'Create New News Item' : 'Edit News Item'}
            </h3>
            <IconButton onClick={handleCancel}>
              <X className="w-5 h-5" />
            </IconButton>
          </div>

          <div className="space-y-4">
            <div>
              <DarkLabel>
                Title *
              </DarkLabel>
              <DarkInput
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="News title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <DarkLabel>
                  Category *
                </DarkLabel>
                <DarkSelect
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.news.length === 0 ? (
                    <option value="">No categories - create one in Categories tab</option>
                  ) : (
                    categories.news.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))
                  )}
                </DarkSelect>
              </div>

              <div>
                <DarkLabel>
                  Date *
                </DarkLabel>
                <DarkInput
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <DarkLabel>
                Excerpt *
              </DarkLabel>
              <DarkTextarea
                value={formData.excerpt || ''}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                placeholder="Brief description of the news"
              />
            </div>

            <div>
              <DarkLabel>
                Full Content (Optional)
              </DarkLabel>
              <DarkTextarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="font-mono text-sm"
                placeholder="Full article content (supports markdown or plain text)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <DarkLabel>
                  Location (Optional)
                </DarkLabel>
                <DarkInput
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., South Coast Rep, NYC, etc."
                />
              </div>

              <div>
                <DarkLabel>
                  External Link (Optional)
                </DarkLabel>
                <DarkInput
                  type="text"
                  value={formData.link || ''}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com/article"
                />
              </div>
            </div>

            <div>
              <ImageUploader
                value={formData.coverImage || ''}
                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                label="Cover Image"
              />
            </div>

            {formData.coverImage && (
              <div>
                <FocusPointPicker
                  imageUrl={formData.coverImage}
                  focusPoint={formData.coverImageFocalPoint || { x: 50, y: 50 }}
                  onFocusPointChange={(focalPoint) => setFormData({ ...formData, coverImageFocalPoint: focalPoint })}
                />
              </div>
            )}

            <div>
              <DarkLabel>
                Tags (comma-separated)
              </DarkLabel>
              <DarkInput
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map((t) => t.trim()),
                  })
                }
                placeholder="e.g., SCR, Musical Theatre"
              />
            </div>

            {/* Content Blocks */}
            <div className="border-t border-border pt-6 mt-6">
              <NewsBlockEditor
                blocks={formData.blocks || []}
                onChange={(blocks) => setFormData({ ...formData, blocks })}
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <SaveButton
                onClick={handleSave}
              >
                <Save className="w-4 h-4" />
                <span className="text-xs tracking-wider uppercase">Save</span>
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

      {/* List */}
      {!showForm && newsItems.length === 0 && (
        <div className="text-center py-12 opacity-40">
          <p>No news items yet. Create your first one!</p>
        </div>
      )}

      {!showForm && newsItems.length > 0 && (
        <div className="space-y-3">
          {newsItems.map((item) => (
            <div key={item.id} className={listItemClasses}>
              <div className="flex-1">
                <h4 className="tracking-tight mb-1">{item.title}</h4>
                <p className="text-xs opacity-60">{item.category} • {item.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <IconButton
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 className="w-4 h-4" />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
