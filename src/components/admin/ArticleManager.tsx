import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft } from 'lucide-react';
// import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';
import { ImageUploader, ImageGalleryManager } from './ImageUploader';
import { ArticleSEOTools } from './ArticleSEOTools';
import { FocusPointPicker } from './FocusPointPicker';
import { SquarespaceImporter } from './SquarespaceImporter';
import { useCategories } from '../../hooks/useCategories';
import { SaveButton } from './AdminButtons';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Checkbox } from './ui/Checkbox';
import { toast } from 'sonner';
import { TagInput } from './ui/TagInput';
import { AdminPageHeader } from './shared/AdminPageHeader';
import { AdminListItem } from './shared/AdminListItem';
import { htmlToBlocks } from './ContentTabWrapper';
import { ProArticleEditor } from './ProArticleEditor';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || '';

const estimateReadTime = (blocks: any[], excerpt: string) => {
  const textFromBlocks = blocks
    .map((blk) => {
      if (typeof blk?.content === 'string') return blk.content;
      if (Array.isArray(blk?.content)) return blk.content.join(' ');
      return '';
    })
    .join(' ');

  const combined = `${excerpt || ''} ${textFromBlocks}`.trim();
  const words = combined ? combined.split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
};

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



// Collect potential image URLs from a variety of legacy fields
const collectImageCandidates = (a: any): string[] => {
  const urls: string[] = [];

  const push = (val?: any) => {
    if (typeof val === 'string' && val.trim()) urls.push(val.trim());
  };

  // Common single-value fields
  [
    a.coverImage,
    a.cover_image,
    a.ogImage,
    a.image,
    a.imageUrl,
    a.image_url,
    a.thumbnail,
    a.heroImage,
    a.hero_image,
    a.featuredImage,
    a.featured_image,
    a.photo,
  ].forEach(push);

  // Arrays of images
  const arrayFields = [a.images, a.gallery, a.galleryImages, a.gallery_images];
  arrayFields.forEach((arr: any) => {
    if (Array.isArray(arr)) {
      arr.forEach((item) => {
        if (typeof item === 'string') push(item);
        else if (item?.url) push(item.url);
        else if (item?.src) push(item.src);
        else if (item?.path) push(item.path);
      });
    }
  });

  // Objects of galleries (e.g., galleries: { main: [...], detail: [...] })
  if (a.galleries && typeof a.galleries === 'object') {
    Object.values(a.galleries).forEach((val: any) => {
      if (Array.isArray(val)) {
        val.forEach((item) => {
          if (typeof item === 'string') push(item);
          else if (item?.url) push(item.url);
        });
      }
    });
  }

  // Media objects
  if (a.media) {
    if (typeof a.media === 'string') push(a.media);
    if (Array.isArray(a.media)) {
      a.media.forEach((m: any) => push(m?.url || m));
    }
    if (a.media.url) push(a.media.url);
  }

  // Deduplicate while preserving order
  const seen = new Set<string>();
  return urls.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
};

// Normalize content blocks so the editor shows images/galleries like the published view
const normalizeContentBlocks = (article: any): any[] => {
  let blocks: any[] = Array.isArray(article.content) ? article.content : [];

  // Convert legacy HTML strings to blocks
  if ((!blocks || blocks.length === 0)) {
    const possibleHtml = typeof article.content === 'string' ? article.content
      : typeof article.body === 'string' ? article.body
        : typeof article.html === 'string' ? article.html
          : typeof article.contentHtml === 'string' ? article.contentHtml
            : '';
    if (possibleHtml && possibleHtml.trim().length > 0) {
      try {
        blocks = htmlToBlocks(possibleHtml);
      } catch (e) {
        console.warn('Failed to convert HTML to blocks', article.id || article.slug || article.title);
      }
    }
  }

  // If still empty, seed with images/galleries from available fields
  if (!blocks || blocks.length === 0) {
    const images = collectImageCandidates(article);
    if (images.length > 1) {
      blocks = [{
        id: `block-${Date.now()}`,
        type: 'gallery',
        content: '',
        metadata: {
          galleryStyle: 'grid',
          images: images.map((url) => ({ url, alt: article.title || '' })),
        },
      }];
    } else if (images.length === 1) {
      blocks = [{
        id: `block-${Date.now()}`,
        type: 'image',
        content: images[0],
        metadata: { alt: article.title || '', caption: '' },
      }];
    }
  }

  return blocks || [];
};

export function ArticleManager() {
  const supabase = createClient();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'publishing' | 'media' | 'seo'>('write');
  const { categories } = useCategories();
  const autosaveTimer = useRef<number | undefined>(undefined);
  const [lastSavedAt, setLastSavedAt] = useState<string>('');

  const TABS = [
    { id: 'write', label: 'Write', icon: null },
    { id: 'publishing', label: 'Publishing', icon: null },
    { id: 'media', label: 'Media', icon: null },
    { id: 'seo', label: 'SEO', icon: null },
  ] as const;

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

  // Auto-generate slug from title when slug is empty
  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === 'title') {
        const currentSlug = methods.getValues('slug');
        if (!currentSlug) {
          methods.setValue('slug', slugify(value.title || ''), { shouldDirty: true, shouldTouch: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  // Autosave with debounce to localStorage
  useEffect(() => {
    if (!showForm) return;
    const draftKey = `article-draft-${editingId || 'new'}`;
    const subscription = methods.watch((value) => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
      autosaveTimer.current = window.setTimeout(() => {
        try {
          const payload = { data: value, savedAt: Date.now() };
          localStorage.setItem(draftKey, JSON.stringify(payload));
          setLastSavedAt(new Date(payload.savedAt).toLocaleTimeString());
        } catch (err) {
          console.warn('Autosave failed', err);
        }
      }, 800);
    });
    return () => {
      subscription.unsubscribe();
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    };
  }, [showForm, editingId, methods]);

  // Restore autosaved draft if available
  useEffect(() => {
    if (!showForm) return;
    const draftKey = `article-draft-${editingId || 'new'}`;
    const saved = localStorage.getItem(draftKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.data) {
        methods.reset(parsed.data);
        if (parsed.savedAt) setLastSavedAt(new Date(parsed.savedAt).toLocaleTimeString());
      }
    } catch (err) {
      console.warn('Failed to restore autosave', err);
    }
  }, [showForm, editingId, methods]);

  // Load articles
  // Load articles
  useEffect(() => {
    const loadArticles = async () => {
      if (showForm || showImporter) return;

      try {
        setLoading(true);
        const { data: sqlArticles, error } = await supabase
          .from('articles')
          .select('*')
          .order('published_at', { ascending: false });

        if (error) throw error;

        console.log('🔵 ArticleManager: SQL articles loaded:', { count: sqlArticles?.length });

        // Normalize data
        const normalized = (sqlArticles || []).map((a: any) => ({
          ...a,
          id: a.id,
          coverImage: a.cover_image || a.coverImage || '',
          focusPoint: a.cover_image_focal_point || a.focusPoint || undefined,
          content: a.content || [],
          // Map published (boolean) to status (string)
          status: a.published ? 'published' : 'draft',
          // Use published_at if available, otherwise created_at
          date: a.published_at || a.created_at || new Date().toISOString()
        }));

        setArticles(normalized);
      } catch (err) {
        console.error('Failed to load articles:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [showForm, showImporter]);

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
    setActiveTab('write');
  };

  const handleEdit = (article: any) => {
    const contentBlocks = normalizeContentBlocks(article);

    methods.reset({
      title: article.title || '',
      category: article.category || categories.articles[0]?.name || '',
      date: (article.date || new Date().toISOString()).split('T')[0],
      featured: article.featured || false,
      status: article.status || 'draft',
      tags: article.tags || [],
      content: contentBlocks || [],
      excerpt: article.excerpt || '',
      slug: article.slug || slugify(article.title || ''),
      coverImage: article.coverImage || '',
      images: article.images || [],
      seoTitle: article.seoTitle || '',
      seoDescription: article.seoDescription || '',
      ogImage: article.ogImage || '',
    });
    setEditingId(article.id);
    setShowForm(true);
    setActiveTab('write');

    // Scroll to top of form
    setTimeout(() => {
      const formElement = document.querySelector('[data-article-form]');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Also scroll the content area to top
        const contentArea = formElement.querySelector('.overflow-y-auto');
        if (contentArea) {
          contentArea.scrollTop = 0;
        }
      }
    }, 0);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };



  const onSubmit = async (data: ArticleFormData) => {
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: Array.isArray(data.content) ? data.content : [],
        category: data.category,
        cover_image: data.coverImage,
        // cover_image_focal_point: data.focusPoint, // Column does not exist
        published_at: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        read_time: data.readTime || estimateReadTime(Array.isArray(data.content) ? data.content : [], data.excerpt),
        tags: data.tags || [],
        published: data.status === 'published',
        updated_at: new Date().toISOString(),
      };

      let error;

      if (editingId === 'new') {
        const { error: insertError } = await supabase
          .from('articles')
          .insert([payload]);
        error = insertError;
      } else {
        const { error: updateError } = await supabase
          .from('articles')
          .update(payload)
          .eq('id', editingId);
        error = updateError;
      }

      if (error) throw error;

      toast.success(editingId === 'new' ? 'Article created successfully' : 'Article updated successfully');
      setShowForm(false);
      setEditingId(null);
      // Reload articles
      const { data: updatedData } = await supabase.from('articles').select('*').order('published_at', { ascending: false });
      const normalized = (updatedData || []).map((a: any) => ({
        ...a,
        id: a.id,
        coverImage: a.cover_image || a.coverImage || '',
        content: a.content || [],
        status: a.published ? 'published' : 'draft',
        date: a.date || a.created_at || new Date().toISOString()
      }));
      setArticles(normalized);
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save article');
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
      {showForm && createPortal(
        <FormProvider {...methods}>
          <form
            data-article-form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex flex-col h-full fixed inset-0 overflow-hidden admin-force-dark"
            style={{ zIndex: 99999, backgroundColor: '#09090b' }}
          >
            {/* Header */}
            <div 
              className="shrink-0 border-b border-zinc-800 relative"
              style={{ backgroundColor: '#09090b', zIndex: 10001 }}
            >
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    aria-label="Go back"
                    className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-white font-medium text-lg">
                      {editingId === 'new' ? 'New Article' : 'Edit Article'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <span>{methods.watch('status') === 'published' ? 'Published' : 'Draft'}</span>
                      {lastSavedAt && <span>• Saved {lastSavedAt}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SaveButton type="submit">
                    {methods.watch('status') === 'published' ? 'Update & Publish' : 'Save Draft'}
                  </SaveButton>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 px-6 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-white border-white'
                        : 'text-zinc-500 border-transparent hover:text-zinc-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto bg-[#09090b]">
              <div className="max-w-4xl mx-auto p-8">
                
                {/* WRITE TAB */}
                <div className={activeTab === 'write' ? 'block' : 'hidden'}>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Article Title"
                        className="w-full bg-transparent text-4xl font-bold text-white placeholder-zinc-600 border-none outline-none focus:ring-0 p-0"
                        {...methods.register('title')}
                      />
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span className="shrink-0">slug:</span>
                        <input
                          type="text"
                          className="bg-transparent border-none outline-none focus:ring-0 text-zinc-400 w-full hover:text-zinc-300 transition-colors"
                          {...methods.register('slug')}
                        />
                      </div>
                    </div>
                    
                    <div className="min-h-[500px]">
                      <ProArticleEditor
                        initialBlocks={(() => {
                          const content = methods.watch('content');
                          return Array.isArray(content) ? content : [];
                        })()}
                        onChange={(blocks, html) => {
                          methods.setValue('content', blocks || [], { shouldDirty: true, shouldTouch: true });
                          methods.setValue('contentHtml' as any, html, { shouldDirty: true, shouldTouch: true });
                          
                          // Auto-estimate read time
                          const excerpt = methods.getValues('excerpt') || '';
                          const estimated = estimateReadTime(blocks || [], excerpt);
                          if (estimated && methods.getValues('readTime') !== estimated) {
                            methods.setValue('readTime', estimated, { shouldDirty: true, shouldTouch: true });
                          }
                        }}
                        placeholder="Tell your story..."
                      />
                    </div>
                  </div>
                </div>

                {/* PUBLISHING TAB */}
                <div className={activeTab === 'publishing' ? 'block space-y-8' : 'hidden'}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
                        <h4 className="text-lg font-medium text-white">Status & Date</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-zinc-400 mb-1">Status</label>
                            <select
                              className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 outline-none focus:border-zinc-500"
                              {...methods.register('status')}
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                            </select>
                          </div>

                          <Input name="date" type="date" label="Publish Date" className="bg-zinc-950" />
                          
                          <div className="pt-2">
                             <Checkbox name="featured" label="Featured Article" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
                        <h4 className="text-lg font-medium text-white">Organization</h4>
                        <div className="space-y-4">
                           <Select name="category" label="Category">
                              {categories.articles.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                              ))}
                            </Select>
                            
                            <div className="space-y-2">
                              <label className="text-sm text-zinc-400">Tags</label>
                              <TagInput
                                value={methods.watch('tags') || []}
                                onChange={(tags) => methods.setValue('tags', tags)}
                              />
                            </div>
                        </div>
                      </div>
                   </div>

                   <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
                      <h4 className="text-lg font-medium text-white">Excerpt</h4>
                      <p className="text-sm text-zinc-400">A short summary used on title cards and SEO.</p>
                      <Textarea 
                         name="excerpt" 
                         label="Excerpt"
                         rows={4} 
                         className="bg-zinc-950" 
                         placeholder="Write a short summary..."
                      />
                   </div>
                </div>

                {/* MEDIA TAB */}
                <div className={activeTab === 'media' ? 'block space-y-8' : 'hidden'}>
                   <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-6">
                    <h4 className="text-lg font-medium text-white">Featured Image</h4>
                    <ImageUploader
                      label="Cover Image"
                      value={methods.watch('coverImage')}
                      onChange={(url) => methods.setValue('coverImage', url)}
                      bucketName="blog"
                    />
                    {methods.watch('coverImage') && (
                      <div className="pt-2">
                        <label className="block text-sm text-zinc-400 mb-2">Focal Point</label>
                        <FocusPointPicker
                          imageUrl={methods.watch('coverImage') || ''}
                          focusPoint={methods.watch('focusPoint')}
                          onFocusPointChange={(point) => methods.setValue('focusPoint', point)}
                        />
                      </div>
                    )}
                   </div>

                   <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-6">
                    <h4 className="text-lg font-medium text-white">Gallery</h4>
                    <ImageGalleryManager
                      label="Gallery Images"
                      images={methods.watch('images') || []}
                      onChange={(images) => methods.setValue('images', images)}
                    />
                   </div>
                </div>

                {/* SEO TAB */}
                <div className={activeTab === 'seo' ? 'block space-y-8' : 'hidden'}>
                   <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-6">
                      <h4 className="text-lg font-medium text-white">SEO Settings</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input name="seoTitle" label="Meta Title" placeholder={methods.watch('title')} />
                        <Input name="readTime" label="Read Time" />
                      </div>
                      <Textarea name="seoDescription" label="Meta Description" rows={3} />
                   </div>

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
                </div>

              </div>
            </div>
          </form>
        </FormProvider>
      , document.body)}
    </div>
  );
}
