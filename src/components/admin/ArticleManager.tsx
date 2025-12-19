import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Layout, Image, FileText, Search } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { getByPrefixFromKV } from '../../utils/supabase/client';
import { ImageUploader, ImageGalleryManager } from './ImageUploader';
import { ArticleSEOTools } from './ArticleSEOTools';
import { FocusPointPicker } from './FocusPointPicker';
import { SquarespaceImporter } from './SquarespaceImporter';
import { useCategories } from '../../hooks/useCategories';
import { SaveButton, CancelButton } from './AdminButtons';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Checkbox } from './ui/Checkbox';
import { toast } from 'sonner';
import { TagInput } from './ui/TagInput';
import { AdminPageHeader } from './shared/AdminPageHeader';
import { AdminListItem } from './shared/AdminListItem';
import { ContentTabWrapper } from './ContentTabWrapper';

// Simple schema
const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().optional(),
  readTime: z.string().optional(),
  excerpt: z.string().min(1, 'Excerpt is required'),
  featured: z.boolean(),
  status: z.enum(['draft', 'published']).optional(),
  coverImage: z.string().optional(),
  focusPoint: z.object({ x: z.number(), y: z.number() }).optional(),
  tags: z.array(z.string()).optional(),
  slug: z.string().optional(),
  content: z.union([z.array(z.any()), z.string()]).optional(),
  seoDescription: z.string().optional(),
  seoTitle: z.string().optional(),
  ogImage: z.string().optional(),
  images: z.array(z.any()).optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

const TABS = [
  { key: 'content', label: 'Content', icon: FileText },
  { key: 'basic', label: 'Basic Info', icon: Layout },
  { key: 'media', label: 'Media', icon: Image },
  { key: 'seo', label: 'SEO & Metadata', icon: Search },
] as const;

type TabKey = typeof TABS[number]["key"];

export function ArticleManager() {
  
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('content');
  const { categories } = useCategories();

  const methods = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      category: categories.articles[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      featured: false,
      status: 'draft',
      tags: [],
      content: [],
      excerpt: '',
      slug: '',
      coverImage: '',
      images: [],
      seoTitle: '',
      seoDescription: '',
      ogImage: '',
    },
  });

  // Load articles
  useEffect(() => {
    const loadArticles = async () => {
      try {
        // Load articles from KV store
        const articles = await getByPrefixFromKV('blog_post:');
        // Sort by date (newest first)
        const sorted = articles.sort((a: any, b: any) => {
          const dateA = a.createdAt || a.date || a.created_at || '';
          const dateB = b.createdAt || b.date || b.created_at || '';
          return dateB.localeCompare(dateA);
        });
        setArticles(sorted || []);
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  const handleCreate = () => {
    methods.reset({
      title: '',
      category: categories.articles[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      featured: false,
      status: 'draft',
      tags: [],
      content: [],
      excerpt: '',
      slug: '',
      coverImage: '',
      images: [],
      seoTitle: '',
      seoDescription: '',
      ogImage: '',
    });
    setEditingId('new');
    setShowForm(true);
    setActiveTab('content');
  };

  const handleEdit = (article: any) => {
    methods.reset({
      title: article.title || '',
      category: article.category || categories.articles[0]?.name || '',
      date: article.date || new Date().toISOString().split('T')[0],
      featured: article.featured || false,
      status: article.status || 'draft',
      tags: article.tags || [],
      content: article.content || [],
      excerpt: article.excerpt || '',
      slug: article.slug || '',
      coverImage: article.coverImage || '',
      images: article.images || [],
      seoTitle: article.seoTitle || '',
      seoDescription: article.seoDescription || '',
      ogImage: article.ogImage || '',
    });
    setEditingId(article.id);
    setShowForm(true);
    setActiveTab('content');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const onSubmit = async (data: ArticleFormData) => {
    try {
      const adminToken = sessionStorage.getItem('admin_token');
      if (!adminToken) {
        toast.error('Admin authentication required');
        return;
      }

      const payload = {
        ...data,
        id: editingId === 'new' ? undefined : editingId,
        content: Array.isArray(data.content) ? data.content : [],
        createdAt: editingId === 'new' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };

      // Use the correct API endpoint for KV store
      const endpoint = `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success(editingId === 'new' ? 'Article created successfully' : 'Article updated successfully');
        setShowForm(false);
        setEditingId(null);
        // Reload articles
        const articles = await getByPrefixFromKV('blog_post:');
        const sorted = articles.sort((a: any, b: any) => {
          const dateA = a.createdAt || a.date || a.created_at || '';
          const dateB = b.createdAt || b.date || b.created_at || '';
          return dateB.localeCompare(dateA);
        });
        setArticles(sorted || []);
      } else {
        toast.error(result.message || 'Failed to save article');
        console.error('Save error:', result);
      }
    } catch (err) {
      toast.error('Failed to save article');
      console.error(err);
    }
  };
  
  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading articles...</div>;
  }

  return (
    <div className="space-y-6 p-6">

      {!showForm && (
        <>
          <AdminPageHeader
            title="Articles"
            description={`${articles.length} total article${articles.length !== 1 ? 's' : ''}`}
            onCreate={handleCreate}
            createLabel="New Article"
            actions={
              <button
                onClick={() => setShowImporter(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-all"
              >
                <span>Import (Squarespace)</span>
              </button>
            }
          />

          {showImporter && (
            <SquarespaceImporter
              target="articles"
              onComplete={() => {
                setShowImporter(false);
                window.location.reload();
              }}
              onCancel={() => setShowImporter(false)}
            />
          )}

          <div className="space-y-3">
            {articles.map((article) => (
              <AdminListItem
                key={article.id}
                title={article.title || 'Untitled'}
                subtitle={article.excerpt}
                thumbnail={article.coverImage}
                status={{
                  label: article.status || 'draft',
                  variant: (article.status as any) || 'draft',
                }}
                metadata={[
                  { label: 'Category', value: article.category || 'Uncategorized' },
                  { label: 'Date', value: article.date || 'No date' },
                ]}
                onEdit={() => handleEdit(article)}
              />
            ))}
          </div>
        </>
      )}

      {showForm ? (
        <FormProvider {...methods}>
            <form 
              onSubmit={methods.handleSubmit(onSubmit)} 
              className="border border-zinc-700 bg-zinc-900 rounded-3xl flex flex-col"
              style={{ minHeight: '600px', position: 'relative', zIndex: 1 }}
            >
            {/* Header */}
            <div className="sticky top-0 z-[100] flex items-center justify-between p-4 border-b border-zinc-700 bg-zinc-900/95 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <h3 className="text-white font-medium text-base">
                  {editingId === 'new' ? 'Create New Article' : 'Edit Article'}
                </h3>
                <div className="flex gap-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        activeTab === tab.key
                          ? 'bg-blue-600 text-white'
                          : 'text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CancelButton onClick={handleCancel}>Cancel</CancelButton>
                <SaveButton type="submit">Save Changes</SaveButton>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-900" style={{ minHeight: '400px' }}>
              <div className="max-w-4xl mx-auto space-y-6">
                {activeTab === 'content' ? (
                  <div className="space-y-6">
                    <Input name="title" label="Title" required />
                    <Input name="slug" label="Slug" />
                    <Textarea name="excerpt" label="Excerpt" required rows={4} />
                    <div>
                      <label className="block text-xs font-medium text-white mb-2">
                        Body Content <span className="text-red-500">*</span>
                      </label>
                      <ContentTabWrapper methods={methods} />
                    </div>
                  </div>
                ) : activeTab === 'basic' ? (
                  <div className="space-y-6">
                    <Input name="title" label="Title" required />
                    <div className="grid grid-cols-2 gap-6">
                      <Select name="category" label="Category" required>
                        {categories.articles.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </Select>
                      <Input name="date" label="Publication Date" type="date" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <Input name="readTime" label="Read Time" />
                      <Select name="status" label="Status">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </Select>
                    </div>
                    <Textarea name="excerpt" label="Excerpt" required rows={4} />
                    <Checkbox name="featured" label="Featured Article" />
                  </div>
                ) : activeTab === 'media' ? (
                  <div className="space-y-6">
                    <ImageUploader
                      label="Cover Image"
                      value={methods.watch('coverImage')}
                      onChange={(url) => methods.setValue('coverImage', url)}
                      bucketName="blog"
                    />
                    {methods.watch('coverImage') && (
                      <FocusPointPicker
                        imageUrl={methods.watch('coverImage') || ''}
                        focusPoint={methods.watch('focusPoint')}
                        onFocusPointChange={(point) => methods.setValue('focusPoint', point)}
                      />
                    )}
                    <ImageGalleryManager
                      label="Additional Images"
                      images={methods.watch('images') || []}
                      onChange={(images) => methods.setValue('images', images)}
                    />
                  </div>
                ) : activeTab === 'seo' ? (
                  <div className="space-y-6">
                    <ArticleSEOTools
                      title={methods.watch('title') || ''}
                      excerpt={methods.watch('excerpt') || ''}
                      content={(() => {
                        const content = methods.watch('content');
                        return Array.isArray(content) ? content : [];
                      })()}
                      currentTags={methods.watch('tags') || []}
                      currentDescription={methods.watch('seoDescription') || ''}
                      currentReadTime={methods.watch('readTime') || ''}
                      onTagsGenerated={(tags) => methods.setValue('tags', tags)}
                      onDescriptionGenerated={(desc) => methods.setValue('seoDescription', desc)}
                      onReadTimeGenerated={(time) => methods.setValue('readTime', time)}
                    />
                    <TagInput
                      label="Tags"
                      value={methods.watch('tags') || []}
                      onChange={(tags) => methods.setValue('tags', tags)}
                    />
                    <Textarea name="seoDescription" label="SEO Meta Description" rows={4} />
                  </div>
                ) : (
                  <div className="p-8 bg-red-500/20 border-2 border-red-500 rounded-lg">
                    <p className="text-red-300 font-bold">ERROR: No tab matched!</p>
                    <p className="text-red-200 text-sm mt-2">activeTab = "{activeTab}"</p>
                    <p className="text-red-200 text-xs mt-1">Expected: content, basic, media, or seo</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      ) : null}
    </div>
  );
}
