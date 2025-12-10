import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit2, Trash2, Save, X, Layout, Image, FileText, Search, Eye, EyeOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { blogPosts } from '../../data/blog-posts';
import { BlockEditor, ContentBlock } from './BlockEditor';
import { ImprovedBlockEditor } from './ImprovedBlockEditor';
import { ArticlePreview } from './ArticlePreview';
import { ImageUploader } from './ImageUploader';
import { ArticleSEOTools } from './ArticleSEOTools';
import { FocusPointPicker } from './FocusPointPicker';
import { ContentFormatter } from './ContentFormatter';
import { SquarespaceImporter } from './SquarespaceImporter';
import { useCategories } from '../../hooks/useCategories';
import { PrimaryButton, SaveButton, CancelButton, IconButton } from './AdminButtons';
import { InfoBanner } from './InfoBanner';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Checkbox } from './ui/Checkbox';
import { toast } from 'sonner';

// Zod schema for validation
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
  content: z.array(z.any()).optional(),
  seoDescription: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

type TabId = 'content' | 'basic' | 'media' | 'seo';

// Wrapper component that properly watches content changes using useWatch
function ContentTabWrapper({ methods, categories }: { methods: any; categories: any }) {
  const content = useWatch({ control: methods.control, name: 'content' }) || [];
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200 h-full">
      {/* Preview Toggle */}
      <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Editor Mode:</span>
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`px-3 py-1 text-sm rounded transition-colors ${!showPreview ? 'bg-accent-brand text-white' : 'bg-secondary/30 hover:bg-secondary/50'
              }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`px-3 py-1 text-sm rounded transition-colors ${showPreview ? 'bg-accent-brand text-white' : 'bg-secondary/30 hover:bg-secondary/50'
              }`}
          >
            Preview
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span>{showPreview ? 'Viewing as readers will see it' : 'Editing content'}</span>
        </div>
      </div>

      {showPreview ? (
        <ArticlePreview blocks={content} />
      ) : (
        <ImprovedBlockEditor
          blocks={content}
          onChange={(blocks) => {
            methods.setValue('content', blocks, { shouldDirty: true, shouldTouch: true });
          }}
        />
      )}
    </div>
  );
}

export function ArticleManager() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('content');
  const { categories, loading: categoriesLoading } = useCategories();

  const methods = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`, {
        headers: { 'Authorization': `Bearer ${token || publicAnonKey}` },
      });
      if (response.ok) {
        const data = await response.json();
        const articlesList = data.success ? data.posts : data.posts || data;
        // Sort articles by date (newest first)
        const sortedArticles = articlesList.sort((a: any, b: any) => {
          const dateA = new Date(a.date || a.createdAt || 0);
          const dateB = new Date(b.date || b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        setArticles(sortedArticles);
        toast.success(`Loaded ${articlesList.length} articles from server`);
      } else {
        console.error('API failed, using local data as fallback');
        setArticles(blogPosts);
        toast.error('Failed to load articles, using local data');
      }
    } catch (error) {
      console.error('API error, using local data as fallback:', error);
      setArticles(blogPosts);
      toast.error('Error loading articles, using local data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    methods.reset({
      title: '',
      category: categories.articles[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      featured: false,
      status: 'draft',
      tags: [],
      content: [],
    });
    setEditingId('new');
    setShowForm(true);
    setActiveTab('content');
  };

  const handleEdit = (article: any) => {
    methods.reset({
      ...article,
      content: migrateContentToBlocks(article.content),
    });
    setEditingId(article.id);
    setShowForm(true);
    setActiveTab('content');
  };

  const onSubmit = async (formData: ArticleFormData) => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const isNew = editingId === 'new';

      const slug = isNew ? (formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '') : formData.slug;

      const url = isNew
        ? `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`
        : `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts/${editingId}`;

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, slug, lastModified: new Date().toISOString().split('T')[0] }),
      });

      if (response.ok) {
        toast.success('Article saved successfully!');
        await loadArticles();
        setShowForm(false);
        setEditingId(null);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to save article: ${errorData.error}`);
      }
    } catch (err) {
      toast.error('An error occurred while saving the article.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success('Article deleted successfully!');
        await loadArticles();
      } else {
        toast.error('Failed to delete article.');
      }
    } catch (err) {
      toast.error('An error occurred while deleting the article.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading articles...</div>;

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'basic', label: 'Basic Info', icon: Layout },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'seo', label: 'SEO & Metadata', icon: Search },
  ];

  return (
    <div className="space-y-6">
      <InfoBanner title="Article Manager" description="Manage your blog articles here." icon="✍️" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl tracking-tight">Articles</h2>
          <p className="text-sm text-gray-400 mt-1">{articles.length} total articles</p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowImporter(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary/30 hover:bg-secondary/50 text-white rounded-lg transition-colors border border-border"
            >
              <span className="text-sm">Import (Squarespace)</span>
            </button>
            <PrimaryButton onClick={handleCreate}><Plus className="w-4 h-4" /><span>New Article</span></PrimaryButton>
            ```
          </div>
        )}
      </div>

      {showImporter && (
        <SquarespaceImporter
          target="articles"
          onComplete={() => {
            setShowImporter(false);
            loadArticles(); // Reload to show new posts
          }}
          onCancel={() => setShowImporter(false)}
        />
      )}

      {showForm && (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="border border-border bg-card rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <h3 className="tracking-tight font-medium">{editingId === 'new' ? 'Create New Article' : 'Edit Article'}</h3>
                <div className="h-4 w-px bg-border" />
                <div className="flex gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === tab.id
                        ? 'bg-accent-brand text-accent-brand-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      <tab.icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Preview">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-border mx-1" />
                <CancelButton onClick={handleCancel} className="h-8 px-3 text-xs">Cancel</CancelButton>
                <SaveButton type="submit" disabled={methods.formState.isSubmitting} className="h-8 px-4 text-xs">
                  {methods.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </SaveButton>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">

                {/* CONTENT TAB */}
                {activeTab === 'content' && (
                  <ContentTabWrapper methods={methods} categories={categories} />
                )}

                {/* BASIC INFO TAB */}
                {activeTab === 'basic' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-2xl">
                    <Input name="title" label="Title" required placeholder="Article title" />
                    <div className="grid grid-cols-2 gap-6">
                      <Select name="category" label="Category" required>
                        {categories.articles.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      </Select>
                      <Input name="date" label="Publication Date" type="date" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <Input name="readTime" label="Read Time" placeholder="e.g., 5 min read" />
                      <Select name="status" label="Status">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </Select>
                    </div>
                    <Textarea name="excerpt" label="Excerpt" required rows={4} placeholder="Brief description of the article" />
                    <div className="pt-4 border-t border-border">
                      <Checkbox name="featured" label="Featured Article (Show on Home Page)" />
                    </div>
                  </div>
                )}

                {/* MEDIA TAB */}
                {activeTab === 'media' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-2xl">
                    <div className="bg-muted/30 p-6 rounded-xl border border-border">
                      <ImageUploader
                        label="Cover Image"
                        value={methods.watch('coverImage')}
                        onChange={(url) => methods.setValue('coverImage', url)}
                        bucketName="blog"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Recommended size: 1920x1080px (16:9 aspect ratio)</p>
                    </div>

                    {methods.watch('coverImage') && (
                      <div className="bg-muted/30 p-6 rounded-xl border border-border">
                        <h4 className="text-sm font-medium mb-4">Image Focus Point</h4>
                        <FocusPointPicker
                          imageUrl={methods.watch('coverImage')}
                          focusPoint={methods.watch('focusPoint')}
                          onFocusPointChange={(point) => methods.setValue('focusPoint', point)}
                        />
                        <p className="text-xs text-muted-foreground mt-2">Click to set the focal point for cropping on different screen sizes.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* SEO TAB */}
                {activeTab === 'seo' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-2xl">
                    <ArticleSEOTools
                      title={methods.watch('title')}
                      excerpt={methods.watch('excerpt')}
                      content={methods.watch('content')}
                      currentTags={methods.watch('tags')}
                      currentDescription={methods.watch('seoDescription')}
                      currentReadTime={methods.watch('readTime')}
                      onTagsGenerated={(tags) => methods.setValue('tags', tags)}
                      onDescriptionGenerated={(desc) => methods.setValue('seoDescription', desc)}
                      onReadTimeGenerated={(time) => methods.setValue('readTime', time)}
                    />

                    <div className="h-px bg-border" />

                    <Input name="tags" label="Tags (comma-separated)" placeholder="e.g., Design Philosophy, Creative Process" />
                    <Textarea name="seoDescription" label="SEO Meta Description" rows={4} maxLength={160} placeholder="Custom meta description for search engines. If left empty, the excerpt will be used." />
                  </div>
                )}

              </div>
            </div>
          </form>
        </FormProvider>
      )}

      {!showForm && (
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="flex items-center justify-between p-4 border border-border hover:border-accent-brand/50 transition-colors rounded-2xl">
              <div className="flex-1">
                <h4 className="tracking-tight text-white">{article.title}</h4>
                <p className="text-xs text-gray-400">{article.category} • {article.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <IconButton onClick={() => handleEdit(article)}><Edit2 className="w-4 h-4" /></IconButton>
                <IconButton onClick={() => handleDelete(article.id)} variant="danger"><Trash2 className="w-4 h-4" /></IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function migrateContentToBlocks(oldContent: any): ContentBlock[] {
  if (Array.isArray(oldContent) && oldContent.length > 0 && oldContent[0].type) return oldContent;
  if (typeof oldContent === 'string' && oldContent.trim()) {
    const blocks: ContentBlock[] = [];
    const paragraphs = oldContent.split('\n\n').filter(p => p.trim());
    paragraphs.forEach((para, index) => {
      const trimmed = para.trim();
      if (trimmed.startsWith('#')) {
        const level = trimmed.match(/^#+/)?.[0].length || 2;
        blocks.push({ id: `block-${Date.now()}-${index}`, type: 'heading', content: trimmed.replace(/^#+\s*/, ''), metadata: { level: Math.min(level, 6) } });
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        blocks.push({ id: `block-${Date.now()}-${index}`, type: 'list', content: trimmed.split('\n').filter(l => l.trim()).map(i => i.replace(/^[-*]\s*/, '')).join('\n'), metadata: { listType: 'bullet' } });
      } else {
        blocks.push({ id: `block-${Date.now()}-${index}`, type: 'paragraph', content: trimmed });
      }
    });
    return blocks;
  }
  return [];
}
