import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { Plus, Edit2, Trash2, Save, X, Search, Image as ImageIcon, Link as LinkIcon, MapPin, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { PrimaryButton, IconButton, SaveButton, CancelButton } from './AdminButtons';
import { InfoBanner } from './InfoBanner';
import { ImageUploaderWithFocalPoint } from './ImageUploaderWithFocalPoint';
import { TagInput } from './ui/TagInput';
import { ArticleSEOTools } from './ArticleSEOTools';
import { SimpleContentEditor } from './SimpleContentEditor';

import { DarkInput, DarkTextarea, DarkSelect, DarkLabel, formContainerClasses, listItemClasses } from './DarkModeStyles';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt?: string;
  content?: string | any[];
  coverImage?: string;
  coverImageAltText?: string;
  coverImageFocalPoint?: { x: number; y: number };
  location?: string;
  tags?: string[];
  link?: string;
  slug?: string;
  link_text?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
}

export function NewsManager() {
  const [loading, setLoading] = useState(true);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<NewsItem> & { images?: any[] }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ news: any[] }>({ news: [] });

  useEffect(() => {
    loadCategories();
    loadNews();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'news')
      .order('name');

    if (data) {
      setCategories({ news: data });
    }
  };

  const loadNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map snake_case to camelCase
        const mappedNews = data.map((item: any) => ({
          ...item,
          coverImage: item.cover_image,
          coverImageAltText: item.cover_image_alt_text,
          coverImageFocalPoint: item.cover_image_focal_point,
          // content blocks might be stored in 'content' column as JSON or text
          // Handle both string (HTML/Markdown) and object/array (JSON blocks)
          content: (() => {
            const c = item.content;
            console.log(`📰 [NewsManager] Loading item ${item.id} content type:`, typeof c, c ? 'has-content' : 'null');
            return c || [];
          })(),
          link_text: item.link_text,
          date: item.date, // Ensure date is passed through
          seo_title: item.seo_title,
          seo_description: item.seo_description,
          seo_keywords: item.seo_keywords,
        }));
        setNewsItems(mappedNews);
      }
    } catch (err) {
      console.error('Error loading news:', err);
      toast.error('Error loading news');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      category: categories.news[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      excerpt: '',
      tags: [],
      images: [],
    });
    setEditingId('new');
    setShowForm(true);
  };

  const handleEdit = (item: any) => {
    console.log('📝 [NewsManager] Editing item:', item.id, 'Content:', item.content);
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const isNew = editingId === 'new';
      let slug = formData.slug;
      if (isNew && formData.title) {
        slug = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      const payload = {
        title: formData.title,
        slug,
        date: formData.date,
        category: formData.category,
        excerpt: formData.excerpt,
        content: formData.content, // storing blocks as JSON in content column
        location: formData.location,
        link: formData.link,
        cover_image: formData.coverImage,
        cover_image_alt_text: formData.coverImageAltText,
        cover_image_focal_point: formData.coverImageFocalPoint,
        tags: formData.tags,
        link_text: formData.link_text,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        seo_keywords: formData.seo_keywords,
        updated_at: new Date().toISOString()
      };

      let error;
      if (isNew) {
        const { error: insertError } = await supabase.from('news').insert([payload]);
        error = insertError;
      } else {
        const { error: updateError } = await supabase
          .from('news')
          .update(payload)
          .eq('id', editingId);
        error = updateError;
      }

      if (error) throw error;

      await loadNews();
      setShowForm(false);
      setEditingId(null);
      setFormData({});
      toast.success('News item saved successfully');

    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('Failed to save news item: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return;

    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;

      await loadNews();
      toast.success('News item deleted');
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error('Failed to delete news item');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
  };

  if (loading && !newsItems.length) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl tracking-tight text-white">News & Updates</h2>
          <p className="text-sm text-gray-400 mt-1">{newsItems.length} total news items</p>
        </div>
        {!showForm && (
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <PrimaryButton onClick={handleCreate} className="flex-1 sm:flex-none justify-center">
              <Plus className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase whitespace-nowrap">New Item</span>
            </PrimaryButton>
          </div>
        )}
      </div>

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

            <div>
              <DarkLabel>
                Slug (URL Path)
              </DarkLabel>
              <div className="flex gap-2">
                <DarkInput
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="custom-url-slug"
                  className="font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.title) {
                      const slug = formData.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                      setFormData({ ...formData, slug });
                    }
                  }}
                  className="px-3 py-2 bg-secondary/30 hover:bg-secondary/50 border border-border rounded-lg text-xs uppercase tracking-wider transition-colors"
                >
                  Generate
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Leave empty to auto-generate from title. Controls the URL: /news/[slug]
              </p>
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
                  value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
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
              <p className="text-xs text-gray-500 mt-2">
                {((formData.excerpt || '') as string).length} characters · Aim for 140–170
              </p>
            </div>

            {/* Rich Content Blocks */}
            <div>
              <DarkLabel>
                Content Blocks
              </DarkLabel>
              <p className="text-xs text-gray-400 mb-3">
                Add images, galleries, text, credits, quotes, videos, and more
              </p>
              <SimpleContentEditor
                value={formData.content || []}
                onChange={(blocks) => setFormData({ ...formData, content: blocks })}
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

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <DarkLabel>
                    Link Button Text
                  </DarkLabel>
                  <DarkInput
                    type="text"
                    value={formData.link_text || ''}
                    onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                    placeholder="e.g. Visit Link, Buy Tickets (Defaults to 'Read More')"
                  />
               </div>
            </div>

            <div>
              <ImageUploaderWithFocalPoint
                value={formData.coverImage || ''}
                focalPoint={formData.coverImageFocalPoint || { x: 50, y: 50 }}
                onChange={(url, focalPoint) => setFormData({
                  ...formData,
                  coverImage: url,
                  coverImageFocalPoint: focalPoint || { x: 50, y: 50 }
                })}
                label="Cover Image"
              />
            </div>

            {formData.coverImage && (
              <div className="mt-4">
                <DarkLabel>Cover Image Alt Text</DarkLabel>
                <DarkInput 
                  value={formData.coverImageAltText || ''}
                  onChange={(e) => setFormData({ ...formData, coverImageAltText: e.target.value })}
                  placeholder="Description for accessibility and SEO"
                />
              </div>
            )}

            <div>
              <TagInput
                label="Tags"
                value={formData.tags || []}
                onChange={(tags) => setFormData({ ...formData, tags })}
                placeholder="e.g., SCR, Musical Theatre"
              />
            </div>

            {/* AI SEO Tools */}
            <div className="mt-6">
              <ArticleSEOTools
                title={formData.title || ''}
                excerpt={formData.excerpt || ''}
                content={Array.isArray(formData.content) ? formData.content : []}
                currentTags={formData.tags || []}
                currentDescription={formData.seo_description || ''}
                currentReadTime="" 
                onTagsGenerated={(tags) => setFormData({ ...formData, tags })}
                onDescriptionGenerated={(description) => setFormData({ ...formData, excerpt: description, seo_description: description })}
                onReadTimeGenerated={() => {}} 
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
              {/* Thumbnail */}
              {item.coverImage && (
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: item.coverImageFocalPoint
                        ? `${item.coverImageFocalPoint.x}% ${item.coverImageFocalPoint.y}%`
                        : '50% 50%'
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="tracking-tight mb-1">{item.title}</h4>
                <p className="text-xs opacity-60">
                  {item.category} • {item.date ? new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No date'}
                </p>
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
