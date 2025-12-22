import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Layout, Image, FileText, Search } from 'lucide-react';
// import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';
import { ImageUploader, ImageGalleryManager } from './ImageUploader';
import { ArticleSEOTools } from './ArticleSEOTools';
import { FocusPointPicker } from './FocusPointPicker';
import { SquarespaceImporter } from './SquarespaceImporter';
import { useCategories } from '../../hooks/useCategories';
import { blogPosts } from '../../data/blog-posts';
import { SaveButton, CancelButton } from './AdminButtons';
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

const TABS = [
  { key: 'content', label: 'Content', icon: FileText },
  { key: 'basic', label: 'Basic Info', icon: Layout },
  { key: 'media', label: 'Media', icon: Image },
  { key: 'seo', label: 'SEO & Metadata', icon: Search },
] as const;

type TabKey = typeof TABS[number]["key"];

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
  const [activeTab, setActiveTab] = useState<TabKey>('content');
  const { categories } = useCategories();
  const autosaveTimer = useRef<number | undefined>(undefined);
  const [lastSavedAt, setLastSavedAt] = useState<string>('');

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
          .order('date', { ascending: false });

        if (error) throw error;

        console.log('🔵 ArticleManager: SQL articles loaded:', { count: sqlArticles?.length });

        // Normalize data
        const normalized = (sqlArticles || []).map((a: any) => ({
          ...a,
          id: a.id,
          coverImage: a.cover_image || a.coverImage || '',
          focusPoint: a.cover_image_focal_point || a.focusPoint || undefined,
          content: a.content || [],
          date: a.date || a.created_at || new Date().toISOString()
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
    setActiveTab('content');
  };

  const handleEdit = (article: any) => {
    const contentBlocks = normalizeContentBlocks(article);

    methods.reset({
      title: article.title || '',
      category: article.category || categories.articles[0]?.name || '',
      date: article.date || new Date().toISOString().split('T')[0],
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
    setActiveTab('content');
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

  const contentHtml = methods.watch('contentHtml' as any) || '';
  const contentIssues = useMemo(() => {
    const issues = { links: [] as string[], images: [] as string[] };
    if (typeof window === 'undefined' || !contentHtml) return issues;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(contentHtml, 'text/html');
      doc.querySelectorAll('a').forEach((a) => {
        const href = a.getAttribute('href') || '';
        const valid = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('#');
        if (!valid) issues.links.push(href || '(empty link)');
      });
      doc.querySelectorAll('img').forEach((img) => {
        const alt = img.getAttribute('alt') || '';
        const caption = img.getAttribute('title') || '';
        if (!alt && !caption) {
          issues.images.push(img.getAttribute('src') || '(missing src)');
        }
      });
    } catch (err) {
      console.warn('Content issue scan failed', err);
    }
    return issues;
  }, [contentHtml]);

  const onSubmit = async (data: ArticleFormData) => {
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: Array.isArray(data.content) ? data.content : [],
        category: data.category,
        cover_image: data.coverImage,
        cover_image_focal_point: data.focusPoint,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
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
      const { data: updatedData } = await supabase.from('articles').select('*').order('date', { ascending: false });
      const normalized = (updatedData || []).map((a: any) => ({
        ...a,
        id: a.id,
        coverImage: a.cover_image || a.coverImage || '',
        content: a.content || [],
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

      {showForm ? (
        <FormProvider {...methods}>
          <form
            data-article-form
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeTab === tab.key
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
                {lastSavedAt && (
                  <span className="text-xs text-zinc-400">Last saved {lastSavedAt}</span>
                )}
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
                      {(contentIssues.links.length > 0 || contentIssues.images.length > 0) && (
                        <div className="mb-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 space-y-1">
                          {contentIssues.links.length > 0 && (
                            <div>
                              <strong className="text-amber-200">Links to fix:</strong> {contentIssues.links.slice(0, 3).join(', ')}{contentIssues.links.length > 3 ? '…' : ''}
                            </div>
                          )}
                          {contentIssues.images.length > 0 && (
                            <div>
                              <strong className="text-amber-200">Images missing alt/caption:</strong> {contentIssues.images.slice(0, 3).join(', ')}{contentIssues.images.length > 3 ? '…' : ''}
                            </div>
                          )}
                        </div>
                      )}
                      <ProArticleEditor
                        initialBlocks={(() => {
                          const content = methods.watch('content');
                          return Array.isArray(content) ? content : [];
                        })()}
                        onChange={(blocks, html) => {
                          methods.setValue('content', blocks || [], { shouldDirty: true, shouldTouch: true });
                          // Optionally keep raw HTML for future use
                          methods.setValue('contentHtml' as any, html, { shouldDirty: true, shouldTouch: true });

                          // Auto-estimate read time when content changes
                          const excerpt = methods.getValues('excerpt') || '';
                          const estimated = estimateReadTime(blocks || [], excerpt);
                          if (estimated && methods.getValues('readTime') !== estimated) {
                            methods.setValue('readTime', estimated, { shouldDirty: true, shouldTouch: true });
                          }
                        }}
                      />
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
