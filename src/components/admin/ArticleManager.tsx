import { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Layout, Image, FileText, Search, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Code, Image as ImageIcon, Film, Link2, Undo, Redo, Grid3x3 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { blogPosts } from '../../data/blog-posts';
import { ContentBlock } from './WYSIWYGEditor';
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
  seoTitle: z.string().optional(),
  ogImage: z.string().optional(),
  images: z.array(z.any()).optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

const TABS = [
  { key: "content", label: "Content", icon: FileText },
  { key: "basic", label: "Basic Info", icon: Layout },
  { key: "media", label: "Media", icon: Image },
  { key: "seo", label: "SEO & Metadata", icon: Search },
] as const;

type TabKey = typeof TABS[number]["key"];

// Clean, modern editor - NOT block-based, just direct editing
function ModernArticleEditor({ value, onChange, placeholder = 'Start writing...' }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-400 underline hover:text-blue-300' },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[600px] p-8 text-zinc-100 leading-relaxed',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false, { preserveCursor: true });
    }
  }, [value, editor]);

  const handleImageUpload = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
      setShowImageDialog(false);
    }
  };

  const handleGalleryUpload = (images: Array<{ url: string; caption?: string; alt?: string }>) => {
    if (editor && images.length > 0) {
      // Insert images as a gallery grid
      const galleryHTML = `<div class="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
        ${images.map(img => `
          <figure class="m-0">
            <img src="${img.url}" alt="${img.alt || ''}" class="w-full h-auto rounded-lg" />
            ${img.caption ? `<figcaption class="text-sm text-zinc-400 mt-2 text-center">${img.caption}</figcaption>` : ''}
          </figure>
        `).join('')}
      </div>`;
      editor.chain().focus().insertContent(galleryHTML + '<p></p>').run();
      setShowGalleryDialog(false);
    }
  };

  const handleVideoInsert = () => {
    if (editor && videoUrl) {
      const embedUrl = getEmbedUrl(videoUrl);
      if (embedUrl) {
        editor.chain().focus().insertContent(`<div class="aspect-video my-8 rounded-lg overflow-hidden"><iframe src="${embedUrl}" frameborder="0" allowfullscreen class="w-full h-full"></iframe></div><p></p>`).run();
        setVideoUrl('');
        setShowVideoDialog(false);
      }
    }
  };

  const getEmbedUrl = (url: string): string | null => {
    const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
    if (youtubeMatch?.[1]) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com)\/(?:video\/|)(\d+)(?:\S+)?/);
    if (vimeoMatch?.[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
  };

  if (!editor) {
    return <div className="p-8 text-zinc-400 text-center">Loading editor...</div>;
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
      {/* Clean Toolbar */}
      <div className="flex items-center gap-2 p-4 bg-zinc-950/50 border-b border-zinc-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive('bold')
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive('italic')
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive('underline')
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-700 mx-1" />

        <select
          value={editor.isActive('heading', { level: 1 }) ? 'h1' : editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
          onChange={(e) => {
            if (e.target.value === 'p') {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: parseInt(e.target.value.replace('h', '')) as 1 | 2 | 3 }).run();
            }
          }}
          className="bg-zinc-800 text-zinc-300 text-sm border border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="p">Text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <div className="w-px h-6 bg-zinc-700 mx-1" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive('bulletList')
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive('orderedList')
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive('blockquote')
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-700 mx-1" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowImageDialog(true)}
            className="p-2 rounded-lg transition-all text-zinc-400 hover:bg-zinc-800 hover:text-white"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowGalleryDialog(true)}
            className="p-2 rounded-lg transition-all text-zinc-400 hover:bg-zinc-800 hover:text-white"
            title="Insert Image Gallery"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowVideoDialog(true)}
            className="p-2 rounded-lg transition-all text-zinc-400 hover:bg-zinc-800 hover:text-white"
            title="Insert Video"
          >
            <Film className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded-lg transition-all text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded-lg transition-all text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content - Clean, spacious */}
      <div className="bg-zinc-900">
        <EditorContent editor={editor} />
      </div>

      {/* Image Upload Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowImageDialog(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white">Upload Image</h3>
            <ImageUploader label="Choose image" value="" onChange={handleImageUpload} bucketName="blog" />
            <button
              type="button"
              onClick={() => setShowImageDialog(false)}
              className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gallery Upload Dialog */}
      {showGalleryDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowGalleryDialog(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white">Upload Image Gallery</h3>
            <ImageGalleryManager label="Choose images" images={[]} onChange={handleGalleryUpload} />
            <button
              type="button"
              onClick={() => setShowGalleryDialog(false)}
              className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Video Insert Dialog */}
      {showVideoDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowVideoDialog(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white">Insert Video</h3>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube or Vimeo URL"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleVideoInsert()}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleVideoInsert}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                Insert Video
              </button>
              <button
                type="button"
                onClick={() => setShowVideoDialog(false)}
                className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p {
          margin: 1em 0;
        }
        .ProseMirror h1 {
          font-size: 2.5em;
          font-weight: 700;
          margin: 1.5em 0 0.5em;
          line-height: 1.2;
        }
        .ProseMirror h2 {
          font-size: 2em;
          font-weight: 600;
          margin: 1.3em 0 0.5em;
          line-height: 1.3;
        }
        .ProseMirror h3 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 1.2em 0 0.5em;
          line-height: 1.4;
        }
        .ProseMirror ul, .ProseMirror ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        .ProseMirror li {
          margin: 0.5em 0;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5em;
          margin: 1.5em 0;
          font-style: italic;
          color: #a1a1aa;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 2em 0;
        }
        .ProseMirror code {
          background: #27272a;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .ProseMirror pre {
          background: #18181b;
          padding: 1.5em;
          border-radius: 8px;
          margin: 1.5em 0;
          overflow-x: auto;
        }
        .ProseMirror pre code {
          background: transparent;
          padding: 0;
        }
        .ProseMirror iframe {
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}


export function ArticleManager() {
  console.log("🧩 ArticleManager MOUNTED");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("content");
  const { categories } = useCategories();

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
      console.log('LOAD_ARTICLES response status:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('LOAD_ARTICLES response data:', data);
        const articlesList = data.success ? data.posts : data.posts || data;
        // Sort articles by date (newest first)
        const sortedArticles = articlesList.sort((a: any, b: any) => {
          const dateA = new Date(a.date || a.createdAt || 0);
          const dateB = new Date(b.date || b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        console.log('LOAD_ARTICLES setting articles:', sortedArticles.length, 'articles');
        setArticles(sortedArticles);
        toast.success(`Loaded ${articlesList.length} articles from server`);
      } else {
        const errorText = await response.text();
        console.error('LOAD_ARTICLES API failed, response:', errorText);
        setArticles(blogPosts);
        toast.error('Failed to load articles, using local data');
      }
    } catch (error) {
      console.error('LOAD_ARTICLES API error:', error);
      setArticles(blogPosts);
      toast.error('Error loading articles, using local data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const defaultValues = {
      title: '',
      category: categories.articles[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      featured: false,
      status: 'draft' as const,
      tags: [] as string[],
      content: '',
      excerpt: '',
      slug: '',
      coverImage: '',
      images: [] as any[],
      seoTitle: '',
      seoDescription: '',
      ogImage: '',
    };
    console.log('handleCreate: Resetting form with defaultValues:', defaultValues);
    methods.reset(defaultValues);
    setEditingId('new');
    setShowForm(true);
    setActiveTab('content');
    console.log('handleCreate: editingId set to "new", showForm set to true, activeTab set to "content"');
  };

  // Auto-save Logic
  useEffect(() => {
    if (!editingId || !showForm) return;

    const subscription = methods.watch((value) => {
      const draftKey = `article_draft_${editingId}`;
      localStorage.setItem(draftKey, JSON.stringify({
        ...value,
        timestamp: Date.now()
      }));
    });

    return () => subscription.unsubscribe();
  }, [editingId, showForm, methods]);

  // Debug: Check ContentTabWrapper import
  useEffect(() => {
    console.log('🔍 CTW import is', ContentTabWrapper);
    console.log('🔍 CTW type:', typeof ContentTabWrapper);
    if (!ContentTabWrapper) {
      console.error('❌ ContentTabWrapper is undefined!');
    }
  }, []);

  // Check for auto-save on edit
  const handleEdit = (article: any) => {
    const draftKey = `article_draft_${article.id}`;
    const draft = localStorage.getItem(draftKey);
    let initialData = { ...article };

    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const draftTime = new Date(parsed.timestamp).toLocaleString();
        if (confirm(`Found an unsaved draft from ${draftTime}. Would you like to restore it?`)) {
          initialData = { ...parsed, content: parsed.content || [] };
        }
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }

    methods.reset({
      ...initialData,
      content: initialData.content ? migrateContentToBlocks(initialData.content) : [],
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

      const payload = { ...formData, slug, lastModified: new Date().toISOString().split('T')[0] };
      console.log('SUBMIT payload', payload);
      console.log('SUBMIT payload includes:', {
        title: !!payload.title,
        slug: !!payload.slug,
        excerpt: !!payload.excerpt,
        content: !!payload.content,
        coverImage: !!payload.coverImage,
        images: !!payload.images,
        seoTitle: !!payload.seoTitle,
        seoDescription: !!payload.seoDescription,
        ogImage: !!payload.ogImage,
      });

      const url = isNew
        ? `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts`
        : `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts/${editingId}`;

      console.log('SUBMIT API call:', { method: isNew ? 'POST' : 'PUT', url });

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      console.log('SUBMIT response status:', response.status, response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('SUBMIT response data:', responseData);
        toast.success('Article saved successfully!');

        // Clear draft on success
        if (editingId) {
          localStorage.removeItem(`article_draft_${editingId}`);
        }

        // Refetch articles and get the updated article
        const articlesBefore = [...articles];
        await loadArticles();
        
        // Repopulate form if editing existing article
        if (!isNew && editingId) {
          console.log('SUBMIT repopulating form for article:', editingId);
          // Try to get from response first
          const savedArticle = responseData.post || responseData.article || responseData;
          if (savedArticle && savedArticle.id) {
            console.log('SUBMIT repopulating form with response data:', savedArticle);
            methods.reset({
              ...savedArticle,
              content: savedArticle.content || '',
            });
          } else {
            // Wait for state update, then find from updated articles
            setTimeout(async () => {
              // Re-fetch to ensure we have latest
              const token = sessionStorage.getItem('admin_token');
              const getResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/posts/${editingId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (getResponse.ok) {
                const getData = await getResponse.json();
                const fetchedArticle = getData.post || getData.article || getData;
                console.log('SUBMIT repopulating form with fetched article:', fetchedArticle);
                if (fetchedArticle && fetchedArticle.id) {
                  methods.reset({
                    ...fetchedArticle,
                    content: fetchedArticle.content || '',
                  });
                }
              }
            }, 200);
          }
        }
        
        setShowForm(false);
        setEditingId(null);
      } else {
        const errorData = await response.json();
        console.error('SUBMIT error response:', errorData);
        toast.error(`Failed to save article: ${errorData.error}`);
      }
    } catch (err) {
      console.error('SUBMIT exception:', err);
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
        localStorage.removeItem(`article_draft_${id}`);
        await loadArticles();
      } else {
        toast.error('Failed to delete article.');
      }
    } catch (err) {
      toast.error('An error occurred while deleting the article.');
    }
  };

  const handleCancel = () => {
    if (confirm('Unsaved changes will be kept in draft. Close editor?')) {
      setShowForm(false);
      setEditingId(null);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading articles...</div>;

  return (
    <div className="space-y-6">
      {!showForm && (
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
      )}

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
          <form onSubmit={methods.handleSubmit(onSubmit)} className="border border-border bg-card rounded-3xl flex flex-col h-[calc(100vh-200px)]">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <h3 className="tracking-tight font-medium">{editingId === 'new' ? 'Create New Article' : 'Edit Article'}</h3>
                <div className="h-4 w-px bg-border" />
                <div className="flex gap-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === tab.key
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
                <CancelButton onClick={handleCancel} className="h-8 px-3 text-xs">Cancel</CancelButton>
                <SaveButton type="submit" disabled={methods.formState.isSubmitting} className="h-8 px-4 text-xs">
                  {methods.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </SaveButton>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <div data-testid="EDITOR_MOUNT_CHECK" className="text-xs opacity-70 mb-2">EDITOR MOUNTED</div>
                <div className="text-xs opacity-70 mt-2">
                  editingId: {String(editingId)} | isNew: {String(editingId === 'new')} | hasMethods: {String(!!methods)}
                </div>
                <div className="text-xs opacity-70">
                  articles: {articles?.length ?? 0}
                </div>
                <div className="text-xs opacity-70">
                  activeTab: {activeTab}
                </div>
                <pre className="text-xs opacity-60 bg-muted/30 p-3 rounded border border-border max-h-40 overflow-auto mb-4">{JSON.stringify(methods.watch(), null, 2)}</pre>
                <div className="mt-6 min-h-[320px]">
                  {/* CONTENT TAB */}
                  {activeTab === 'content' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-4xl">
                      <div className="text-xs text-red-400 mb-2">DEBUG: Content tab rendering</div>
                      {/* Title */}
                      <Input name="title" label="Title" required placeholder="Article title" />
                      
                      {/* Slug with auto-generation */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <label className="text-sm font-medium text-foreground">Slug</label>
                          <button
                            type="button"
                            onClick={() => {
                              const title = methods.watch('title') || '';
                              if (title) {
                                const slug = title
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, '-')
                                  .replace(/(^-|-$)/g, '');
                                methods.setValue('slug', slug);
                              }
                            }}
                            className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Generate from title
                          </button>
                        </div>
                        <Input name="slug" placeholder="article-url-slug" />
                        <p className="text-xs text-muted-foreground mt-1">Leave empty to auto-generate from title</p>
                      </div>
                      
                      {/* Excerpt */}
                      <Textarea name="excerpt" label="Excerpt" required rows={4} placeholder="Brief description of the article" />
                      
                      {/* Body/Content Editor - Simple Textarea */}
                      <Textarea 
                        name="content" 
                        label="Body Content"
                        rows={20} 
                        placeholder="Write your article content here..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">Article body content</p>
                    </div>
                  )}

                  {/* BASIC INFO TAB */}
                  {activeTab === 'basic' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-2xl">
                      <div className="text-xs text-red-400 mb-2">DEBUG: Basic Info tab rendering</div>
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
                          label="Cover Image (Featured Image)"
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
                            imageUrl={methods.watch('coverImage') || ''}
                            focusPoint={methods.watch('focusPoint')}
                            onFocusPointChange={(point) => methods.setValue('focusPoint', point)}
                          />
                          <p className="text-xs text-muted-foreground mt-2">Click to set the focal point for cropping on different screen sizes.</p>
                        </div>
                      )}

                      <div className="bg-muted/30 p-6 rounded-xl border border-border">
                        <h4 className="text-sm font-medium mb-4">Additional Images</h4>
                        <ImageGalleryManager
                          label="Upload additional images"
                          images={methods.watch('images') || []}
                          onChange={(images) => methods.setValue('images', images)}
                        />
                        <p className="text-xs text-muted-foreground mt-2">Upload additional images for the article gallery</p>
                      </div>
                    </div>
                  )}

                {/* SEO TAB */}
                {activeTab === 'seo' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-2xl">
                    <ArticleSEOTools
                      title={methods.watch('title') || ''}
                      excerpt={methods.watch('excerpt') || ''}
                      content={methods.watch('content') || []}
                      currentTags={methods.watch('tags') || []}
                      currentDescription={methods.watch('seoDescription') || ''}
                      currentReadTime={methods.watch('readTime') || ''}
                      onTagsGenerated={(tags) => methods.setValue('tags', tags)}
                      onDescriptionGenerated={(desc) => methods.setValue('seoDescription', desc)}
                      onReadTimeGenerated={(time) => methods.setValue('readTime', time)}
                    />

                    <div className="h-px bg-border" />

                    <TagInput
                      label="Tags"
                      value={methods.watch('tags') || []}
                      onChange={(tags) => methods.setValue('tags', tags)}
                      placeholder="e.g., Design Philosophy, Creative Process"
                    />
                    <Textarea name="seoDescription" label="SEO Meta Description" rows={4} maxLength={160} placeholder="Custom meta description for search engines. If left empty, the excerpt will be used." />
                  </div>
                )}

                {/* Fallback: Always show at least Title if no tab matches */}
                {!['content', 'basic', 'media', 'seo'].includes(activeTab) && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-4xl">
                    <Input name="title" label="Title" required placeholder="Article title" />
                    <p className="text-xs text-muted-foreground">No tab matched. activeTab: {activeTab}</p>
                  </div>
                )}

              </div>
            </div>
          </form>
        </FormProvider>
      )}

      {!showForm && (
        <div className="space-y-3">
          {articles.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No articles yet. Create your first article to get started.</p>
            </div>
          ) : (
            articles.map((article) => (
              <AdminListItem
                key={article.id}
                title={article.title}
                subtitle={article.excerpt}
                thumbnail={article.coverImage}
                thumbnailFallback={<Image className="w-5 h-5" />}
                status={{
                  label: article.status || 'Draft',
                  variant: article.status === 'published' ? 'published' : 'draft'
                }}
                metadata={[
                  { label: '', value: article.category },
                  { label: '', value: article.date || 'No Date' }
                ]}
                onEdit={() => handleEdit(article)}
                onDelete={() => handleDelete(article.id)}
              />
            ))
          )}
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
