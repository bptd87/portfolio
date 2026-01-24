import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Video, Clock, Layout, List, Circle, ChevronDown, ChevronUp, Settings, Wand2, Loader2, Sparkles, ExternalLink, AlertCircle, X, Save, Play } from 'lucide-react';
// import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';
import { DEFAULT_CATEGORIES, TUTORIALS as STATIC_TUTORIALS, type TutorialCategory } from '../../data/tutorials';
import { BlockEditor, ContentBlock } from './BlockEditor';
import { ImageUploader } from './ImageUploader';
import { SecondaryButton, SaveButton, CancelButton, IconButton } from './AdminButtons';

import {
  DarkInput,
  DarkTextarea,
  DarkSelect,
  DarkLabel,
  // formContainerClasses,
  // listItemClasses,
  // badgeClasses
} from './DarkModeStyles';

interface Tutorial {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  publishDate: string;
  learningObjectives?: string[];
  tutorialContent?: ContentBlock[]; // Changed to blocks!
  keyShortcuts?: { name: string; shortcut: string }[];
  keyConcepts?: string[];
  commonPitfalls?: string[];
  proTips?: string[];
  resources?: {
    name: string;
    description: string;
    url: string;
  }[];
  relatedTutorials?: {
    title: string;
    slug: string;
    thumbnail: string;
    duration: string;
  }[];
}

const emptyTutorial: Tutorial = {
  id: '',
  slug: '',
  title: '',
  description: '',
  category: 'quick-tips',
  duration: '',
  thumbnail: '',
  videoUrl: '',
  publishDate: new Date().toISOString().split('T')[0],
  learningObjectives: [],
  tutorialContent: [],
  keyShortcuts: [],
  keyConcepts: [],
  commonPitfalls: [],
  proTips: [],
  resources: [],
  relatedTutorials: [],
};

export function TutorialsManager() {
  const supabase = createClient();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [categories, setCategories] = useState<TutorialCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  // const [legacyCount, setLegacyCount] = useState(0); 

  const [formData, setFormData] = useState<Tutorial>(emptyTutorial);

  // Fetch tutorials and categories
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch tutorials from SQL
      const { data: sqlTutorials, error: tutorialsError } = await supabase
        .from('tutorials')
        .select('*')
        .order('publish_date', { ascending: false });

      if (tutorialsError) throw tutorialsError;

      // Extract raw data from SQL and map to interface
      const mappedTutorials: Tutorial[] = (sqlTutorials || []).map((t: any) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        description: t.description || '',
        category: t.category || 'quick-tips',
        duration: t.duration || t.content?.duration || '',
        thumbnail: t.thumbnail_url || '',
        videoUrl: t.video_url || '',
        publishDate: t.publish_date || t.created_at || new Date().toISOString(),
        tutorialContent: t.content?.blocks || t.content || [],
        learningObjectives: t.content?.learningObjectives || [],
        // Ensure shortcuts are objects
        keyShortcuts: (t.content?.keyShortcuts || []).map((s: any) =>
          typeof s === 'string' ? { name: s, shortcut: '' } : s
        ),
        keyConcepts: t.content?.keyConcepts || [],
        commonPitfalls: t.content?.commonPitfalls || [],
        proTips: t.content?.proTips || [],
        resources: t.content?.resources || [],
        // relatedTutorials removed from manual management, but keeping in interface for now if needed for legacy display
        relatedTutorials: []
      }));
      setTutorials(mappedTutorials);
      setCategories(DEFAULT_CATEGORIES);

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImportStaticTutorials = async () => {
    if (!confirm(`This will import ${STATIC_TUTORIALS.length} static tutorials into the database. Continue?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      let importedCount = 0;
      let failedCount = 0;

      // Group upserts? Or one by one to count success?
      // One by one is safer for reporting
      for (const tutorial of STATIC_TUTORIALS) {
        try {
          // Map static tutorial to DB schema
          const payload = {
            title: tutorial.title,
            slug: tutorial.slug,
            description: tutorial.description,
            video_url: tutorial.videoUrl,
            thumbnail_url: tutorial.thumbnail,
            category: tutorial.category,
            content: {
              blocks: tutorial.tutorialContent || [],
              learningObjectives: tutorial.learningObjectives || [],
              keyShortcuts: tutorial.keyShortcuts || [],
              commonPitfalls: tutorial.commonPitfalls || [],
              proTips: tutorial.proTips || [],
              resources: tutorial.resources || [],
              relatedTutorials: tutorial.relatedTutorials || [],
              duration: tutorial.duration
            },
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('tutorials')
            .upsert(payload, { onConflict: 'slug' });

          if (error) throw error;
          importedCount++;
        } catch (err) {
          console.error('Import failed for', tutorial.title, err);
          failedCount++;
        }
      }

      setSuccess(`Import complete: ${importedCount} imported, ${failedCount} failed.`);
      await fetchData();
    } catch (err) {
      setError('Import process failed');
    } finally {
      setLoading(false);
    }
  };

  const ensureArray = (item: any) => {
    if (Array.isArray(item)) return item;
    return [];
  };

  const handleEdit = (tutorial: Tutorial) => {
    // Ensure tutorialContent is a valid array of blocks
    let content = tutorial.tutorialContent;
    if (!Array.isArray(content)) {
      if (typeof content === 'string' && content) {
        // Convert string content to a paragraph block
        content = [{
          id: Date.now().toString(),
          type: 'paragraph',
          content: content
        }];
      } else {
        content = [];
      }
    }

    setFormData({
      ...tutorial,
      learningObjectives: ensureArray(tutorial.learningObjectives),
      tutorialContent: content,
      keyShortcuts: ensureArray(tutorial.keyShortcuts).map((s: any) =>
        typeof s === 'string' ? { name: s, shortcut: '' } : s
      ),
      keyConcepts: ensureArray(tutorial.keyConcepts),
      commonPitfalls: ensureArray(tutorial.commonPitfalls),
      proTips: ensureArray(tutorial.proTips),
      resources: ensureArray(tutorial.resources),
      relatedTutorials: [], // Clear related tutorials as we automate them now
    });
    setEditingId(tutorial.id);
    setIsAdding(false);
    setError('');
    setSuccess('');
    setExpandedSections(new Set(['basic']));

    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdd = () => {
    const newId = Date.now().toString();
    setFormData({
      ...emptyTutorial,
      id: newId,
      publishDate: new Date().toISOString().split('T')[0],
    });
    setIsAdding(true);
    setEditingId(null);
    setError('');
    setSuccess('');
    setExpandedSections(new Set(['basic']));
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData(emptyTutorial);
    setError('');
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');

      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!formData.slug.trim()) {
        setError('Slug is required');
        return;
      }
      if (!formData.videoUrl.trim()) {
        setError('Video URL is required');
        return;
      }

      const payload = {
        ...formData,
        // Ensure complex fields are present
        tutorialContent: formData.tutorialContent || [],
        learningObjectives: formData.learningObjectives || [],
        keyShortcuts: formData.keyShortcuts || [],
        keyConcepts: formData.keyConcepts || [],
        commonPitfalls: formData.commonPitfalls || [],
        proTips: formData.proTips || [],
        resources: formData.resources || [],
        // relatedTutorials: formData.relatedTutorials || [], // Removed manual related tutorials
      };

      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication session expired. Please refresh and log in.');
        return;
      }

      if (isAdding) {
        // Create new via API
        const { data, error } = await supabase.functions.invoke('make-server-74296234/api/admin/tutorials', {
          method: 'POST',
          headers: { 'X-Admin-Token': token },
          body: payload
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

      } else {
        // Update existing via API
        const { data, error } = await supabase.functions.invoke(`make-server-74296234/api/admin/tutorials/${editingId}`, {
          method: 'PUT',
          headers: { 'X-Admin-Token': token },
          body: payload
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);
      }

      setSuccess(isAdding ? 'Tutorial added successfully!' : 'Tutorial updated successfully!');
      await fetchData();
      handleCancel();
      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save tutorial. Check console/permissions.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tutorial?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication session expired. Please refresh and log in.');
        return;
      }

      const { data, error } = await supabase.functions.invoke(`make-server-74296234/api/admin/tutorials/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token }
      });

      if (error) throw error;
      if (data && data.error) throw new Error(data.error);

      setSuccess('Tutorial deleted successfully');
      setTutorials(prev => prev.filter(t => t.id !== id));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to delete tutorial: ' + (err.message || 'Unknown error'));
      console.error(err);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const handleVideoUrlChange = (url: string) => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      setFormData({
        ...formData,
        videoUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnail: formData.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      });
    } else {
      setFormData({ ...formData, videoUrl: url });
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Array field helpers
  const addArrayItem = (field: keyof Tutorial, defaultValue: any) => {
    setFormData({
      ...formData,
      [field]: [...(formData[field] as any[] || []), defaultValue],
    });
  };

  const removeArrayItem = (field: keyof Tutorial, index: number) => {
    setFormData({
      ...formData,
      [field]: (formData[field] as any[]).filter((_, i) => i !== index),
    });
  };

  const updateArrayItem = (field: keyof Tutorial, index: number, value: any) => {
    const array = [...(formData[field] as any[])];
    array[index] = value;
    setFormData({
      ...formData,
      [field]: array,
    });
  };

  // AI Generation Functions
  const generateWithAI = async (type: string, context: string) => {
    setAiLoading(type);
    try {
      const token = sessionStorage.getItem('admin_token');

      const { data, error } = await supabase.functions.invoke('make-server-74296234/api/admin/ai/generate', {
        method: 'POST',
        headers: {
          'X-Admin-Token': token || '',
        },
        body: {
          type,
          context,
          prompt: formData.title + (formData.description ? ': ' + formData.description : '')
        }
      });

      if (error) throw error;

      if (data && data.success && data.result) {
        return data.result;
      } else {
        setError('AI generation failed: ' + (data?.error || 'Unknown error'));
        return null;
      }
    } catch (err: any) {
      console.error('AI Error:', err);
      setError('Failed to connect to AI service: ' + (err.message || 'Unknown error'));
      return null;
    } finally {
      setAiLoading(null);
    }
  };

  const handleAIGenerateObjectives = async () => {
    const result = await generateWithAI('tutorial-objectives', `Tutorial: ${formData.title}\n\nDescription: ${formData.description}\n\nGenerate 4 clear learning objectives for this tutorial.`);
    if (result) {
      // Parse result as array
      const objectives = result.split('\n').filter((line: string) => line.trim()).map((line: string) => line.replace(/^[-*•]\s*/, '').trim());
      setFormData({ ...formData, learningObjectives: objectives });
    }
  };

  const handleAIGenerateTips = async () => {
    const result = await generateWithAI('tutorial-tips', `Tutorial: ${formData.title}\n\nGenerate 3 pro tips for this tutorial about ${formData.description}`);
    if (result) {
      const tips = result.split('\n').filter((line: string) => line.trim()).map((line: string) => line.replace(/^[-*•]\s*/, '').trim());
      setFormData({ ...formData, proTips: tips });
    }
  };

  const handleAIGeneratePitfalls = async () => {
    const result = await generateWithAI('tutorial-pitfalls', `Tutorial: ${formData.title}\n\nGenerate 3-4 common mistakes or pitfalls students should avoid.`);
    if (result) {
      const pitfalls = result.split('\n').filter((line: string) => line.trim()).map((line: string) => line.replace(/^[-*•]\s*/, '').trim());
      setFormData({ ...formData, commonPitfalls: pitfalls });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-accent-brand border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-400">Loading tutorials...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl tracking-tight mb-2 text-white">Scenic Studio Tutorials</h2>
          <p className="text-sm text-gray-400">Manage video tutorials with rich content and AI assistance</p>
        </div>
        <div className="flex gap-3">
          {tutorials.length === 0 && (
            <SecondaryButton onClick={handleImportStaticTutorials} icon={Sparkles}>
              Import Static Data
            </SecondaryButton>
          )}
          <button
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:border-accent-brand transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs tracking-wider uppercase">Categories</span>
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs tracking-wider uppercase">Add Tutorial</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 px-4 py-3 bg-accent-brand/10 border border-accent-brand/20 text-accent-brand text-sm">
          {success}
        </div>
      )}

      {/* Category Manager */}
      {showCategoryManager && (
        <div className="mb-8 p-6 border border-border bg-secondary/20">
          <h3 className="text-lg tracking-tight mb-4">Manage Categories</h3>
          <div className="text-sm text-gray-400 mb-4">
            Categories are currently managed in code. Contact your developer to add new categories.
          </div>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="px-4 py-3 border border-border bg-background">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-mono text-sm text-gray-400">{cat.id}</div>
                    <div className="mt-1 text-white">{cat.name}</div>
                    {cat.description && <div className="text-sm text-gray-400 mt-1">{cat.description}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="mb-8 p-6 border border-accent-brand bg-accent-brand/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg tracking-tight">
                {isAdding ? 'Add New Tutorial' : 'Edit Tutorial'}
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-accent-brand/10 border border-accent-brand/20">
                <Sparkles className="w-3 h-3 text-accent-brand" />
                <span className="text-xs text-accent-brand">AI Assistant Available</span>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 opacity-60 hover:opacity-100 transition-opacity"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* BASIC INFO */}
            <div className="border border-border">
              <button
                onClick={() => toggleSection('basic')}
                className="w-full px-6 py-4 bg-secondary/50 flex items-center justify-between hover:bg-secondary/70 transition-colors"
              >
                <span className="text-sm tracking-wider uppercase">Basic Information</span>
                {expandedSections.has('basic') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.has('basic') && (
                <div className="p-6 space-y-6 bg-background">
                  <div>
                    <DarkLabel className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Title *</DarkLabel>
                    <DarkInput
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData({
                          ...formData,
                          title,
                          slug: formData.slug || generateSlug(title)
                        });
                      }}
                      className="w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none"
                      placeholder="Enter tutorial title"
                    />
                  </div>

                  <div>
                    <DarkLabel className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Slug *</DarkLabel>
                    <DarkInput
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none font-mono text-sm"
                      placeholder="my-tutorial-slug"
                    />
                  </div>

                  <div>
                    <DarkLabel className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Description</DarkLabel>
                    <DarkTextarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none min-h-[100px]"
                      placeholder="Brief description"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <DarkLabel className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Category</DarkLabel>
                      <DarkSelect
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </DarkSelect>
                    </div>

                    <div>
                      <DarkLabel className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Duration</DarkLabel>
                      <DarkInput
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none"
                        placeholder="10:45"
                      />
                    </div>
                  </div>

                  <div>
                    <DarkLabel className="block text-xs tracking-wider uppercase text-gray-300 mb-2">YouTube URL *</DarkLabel>
                    <DarkInput
                      type="text"
                      value={formData.videoUrl}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none"
                      placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                    />
                  </div>

                  <div>
                    <ImageUploader
                      value={formData.thumbnail}
                      onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                      label="Thumbnail Image"
                    />
                    <p className="text-xs opacity-50 mt-2">Auto-filled from YouTube, or upload custom thumbnail</p>
                  </div>

                  <div>
                    <DarkLabel className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Publish Date</DarkLabel>
                    <DarkInput
                      type="date"
                      value={formData.publishDate ? new Date(formData.publishDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* LEARNING OBJECTIVES */}
            <div className="border border-border">
              <button
                onClick={() => toggleSection('objectives')}
                className="w-full px-6 py-4 bg-secondary/50 flex items-center justify-between hover:bg-secondary/70 transition-colors"
              >
                <span className="text-sm tracking-wider uppercase">Learning Objectives</span>
                {expandedSections.has('objectives') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.has('objectives') && (
                <div className="p-6 space-y-4 bg-background">
                  <div className="flex justify-end">
                    <button
                      onClick={handleAIGenerateObjectives}
                      disabled={!formData.title || aiLoading === 'tutorial-objectives'}
                      className="flex items-center gap-2 px-3 py-2 bg-accent-brand text-accent-brand-foreground text-xs tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {aiLoading === 'tutorial-objectives' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Generate with AI
                    </button>
                  </div>
                  {(formData.learningObjectives || []).map((obj, index) => (
                    <div key={index} className="flex gap-3">
                      <DarkInput
                        type="text"
                        value={obj}
                        onChange={(e) => updateArrayItem('learningObjectives', index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none"
                        placeholder="What students will learn"
                      />
                      <button
                        onClick={() => removeArrayItem('learningObjectives', index)}
                        className="px-4 py-3 border border-border hover:border-destructive text-destructive transition-colors"
                        title="Remove learning objective"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('learningObjectives', '')}
                    className="text-xs tracking-wider uppercase text-accent-brand hover:opacity-80 transition-opacity"
                  >
                    + Add Learning Objective
                  </button>
                </div>
              )}
            </div>

            {/* TUTORIAL CONTENT - BLOCK EDITOR! */}
            <div className="border border-border">
              <button
                onClick={() => toggleSection('content')}
                className="w-full px-6 py-4 bg-secondary/50 flex items-center justify-between hover:bg-secondary/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm tracking-wider uppercase">Tutorial Content</span>
                  <span className="px-2 py-0.5 bg-accent-brand/20 text-accent-brand text-[10px] tracking-wider uppercase">Rich Editor</span>
                </div>
                {expandedSections.has('content') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.has('content') && (
                <div className="p-6 bg-background">
                  <p className="text-sm text-gray-400 mb-4">
                    Build your tutorial content with rich text blocks, images, videos, code snippets, and more. Drag and drop images to upload.
                  </p>
                  <BlockEditor
                    blocks={formData.tutorialContent || []}
                    onChange={(blocks) => setFormData({ ...formData, tutorialContent: blocks })}
                  />
                </div>
              )}
            </div>

            {/* PRO TIPS */}
            <div className="border border-border">
              <button
                onClick={() => toggleSection('tips')}
                className="w-full px-6 py-4 bg-secondary/50 flex items-center justify-between hover:bg-secondary/70 transition-colors"
              >
                <span className="text-sm tracking-wider uppercase">Pro Tips</span>
                {expandedSections.has('tips') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.has('tips') && (
                <div className="p-6 space-y-4 bg-background">
                  <div className="flex justify-end">
                    <button
                      onClick={handleAIGenerateTips}
                      disabled={!formData.title || aiLoading === 'tutorial-tips'}
                      className="flex items-center gap-2 px-3 py-2 bg-accent-brand text-accent-brand-foreground text-xs tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {aiLoading === 'tutorial-tips' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Generate with AI
                    </button>
                  </div>
                  {(formData.proTips || []).map((tip, index) => (
                    <div key={index} className="flex gap-3">
                      <DarkInput
                        type="text"
                        value={tip}
                        onChange={(e) => updateArrayItem('proTips', index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none"
                        placeholder="Pro tip text"
                      />
                      <button
                        onClick={() => removeArrayItem('proTips', index)}
                        className="px-4 py-3 border border-border hover:border-destructive text-destructive transition-colors"
                        title="Remove pro tip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('proTips', '')}
                    className="text-xs tracking-wider uppercase text-accent-brand hover:opacity-80 transition-opacity"
                  >
                    + Add Pro Tip
                  </button>
                </div>
              )}
            </div>

            {/* KEY SHORTCUTS */}
            <div className="border border-border">
              <button
                onClick={() => toggleSection('shortcuts')}
                className="w-full px-6 py-4 bg-secondary/50 flex items-center justify-between hover:bg-secondary/70 transition-colors"
              >
                <span className="text-sm tracking-wider uppercase">Key Shortcuts</span>
                {expandedSections.has('shortcuts') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.has('shortcuts') && (
                <div className="p-6 space-y-4 bg-background">
                  {/* Header labels */}
                  <div className="flex gap-3 px-1 text-xs uppercase tracking-wider text-gray-400">
                    <span className="w-48">Keyboard Shortcut</span>
                    <span className="flex-1">Description / Action</span>
                    <span className="w-10"></span>
                  </div>

                  {(formData.keyShortcuts || []).map((shortcut, index) => (
                    <div key={index} className="flex gap-3 items-center relative z-10">
                      <input
                        type="text"
                        value={shortcut.shortcut}
                        onChange={(e) => updateArrayItem('keyShortcuts', index, { ...shortcut, shortcut: e.target.value })}
                        className="w-48 px-4 py-3 bg-secondary/30 border border-border focus:border-accent-brand focus:outline-none rounded text-sm font-mono text-accent-brand"
                        placeholder="Cmd + S"
                      />
                      <input
                        type="text"
                        value={shortcut.name}
                        onChange={(e) => updateArrayItem('keyShortcuts', index, { ...shortcut, name: e.target.value })}
                        className="flex-1 px-4 py-3 bg-secondary/30 border border-border focus:border-accent-brand focus:outline-none rounded text-white"
                        placeholder="Save project"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('keyShortcuts', index)}
                        className="p-3 border border-border hover:border-destructive text-destructive transition-colors rounded hover:bg-destructive/10"
                        title="Remove shortcut"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('keyShortcuts', { name: '', shortcut: '' })}
                    className="w-full py-3 border border-dashed border-border text-accent-brand hover:bg-accent-brand/5 hover:border-accent-brand/50 transition-colors text-xs tracking-wider uppercase flex items-center justify-center gap-2 mt-4"
                  >
                    <Plus className="w-4 h-4" /> Add Shortcut
                  </button>
                </div>
              )}
            </div>

            {/* KEY CONCEPTS */}
            <div className="border border-border">
              <button
                onClick={() => toggleSection('concepts')}
                className="w-full px-6 py-4 bg-secondary/50 flex items-center justify-between hover:bg-secondary/70 transition-colors"
              >
                <span className="text-sm tracking-wider uppercase">Key Concepts</span>
                {expandedSections.has('concepts') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.has('concepts') && (
                <div className="p-6 space-y-4 bg-background">
                  <div className="flex justify-end">
                    <button
                      onClick={() => generateWithAI('tutorial-concepts', `Tutorial: ${formData.title}\n\nGenerate 3 key concepts covered in this tutorial.`)
                        .then(res => res && setFormData({ ...formData, keyConcepts: res.split('\n').filter((l: string) => l.trim()).map((l: string) => l.replace(/^[-*•]\s*/, '').trim()) }))}
                      disabled={!formData.title || aiLoading === 'tutorial-concepts'}
                      className="flex items-center gap-2 px-3 py-2 bg-accent-brand text-accent-brand-foreground text-xs tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {aiLoading === 'tutorial-concepts' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Generate with AI
                    </button>
                  </div>
                  {(formData.keyConcepts || []).map((concept, index) => (
                    <div key={index} className="flex gap-3">
                      <DarkInput
                        type="text"
                        value={concept}
                        onChange={(e) => updateArrayItem('keyConcepts', index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none"
                        placeholder="Key concept"
                      />
                      <button
                        onClick={() => removeArrayItem('keyConcepts', index)}
                        className="px-4 py-3 border border-border hover:border-destructive text-destructive transition-colors"
                        title="Remove concept"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('keyConcepts', '')}
                    className="w-full py-3 border border-dashed border-border text-accent-brand hover:bg-accent-brand/5 hover:border-accent-brand/50 transition-colors text-xs tracking-wider uppercase flex items-center justify-center gap-2 mt-4"
                  >
                    <Plus className="w-4 h-4" /> Add Key Concept
                  </button>
                </div>
              )}
            </div>

            {/* COMMON PITFALLS */}
            <div className="border border-border">
              <button
                onClick={() => toggleSection('pitfalls')}
                className="w-full px-6 py-4 bg-secondary/50 flex items-center justify-between hover:bg-secondary/70 transition-colors"
              >
                <span className="text-sm tracking-wider uppercase">Common Pitfalls</span>
                {expandedSections.has('pitfalls') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.has('pitfalls') && (
                <div className="p-6 space-y-4 bg-background">
                  <div className="flex justify-end">
                    <button
                      onClick={handleAIGeneratePitfalls}
                      disabled={!formData.title || aiLoading === 'tutorial-pitfalls'}
                      className="flex items-center gap-2 px-3 py-2 bg-accent-brand text-accent-brand-foreground text-xs tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {aiLoading === 'tutorial-pitfalls' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Generate with AI
                    </button>
                  </div>
                  {(formData.commonPitfalls || []).map((pitfall, index) => (
                    <div key={index} className="flex gap-3">
                      <DarkInput
                        type="text"
                        value={pitfall}
                        onChange={(e) => updateArrayItem('commonPitfalls', index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none"
                        placeholder="Common mistake to avoid"
                      />
                      <button
                        onClick={() => removeArrayItem('commonPitfalls', index)}
                        className="px-4 py-3 border border-border hover:border-destructive text-destructive transition-colors"
                        title="Remove pitfall"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('commonPitfalls', '')}
                    className="w-full py-3 border border-dashed border-border text-accent-brand hover:bg-accent-brand/5 hover:border-accent-brand/50 transition-colors text-xs tracking-wider uppercase flex items-center justify-center gap-2 mt-4"
                  >
                    <Plus className="w-4 h-4" /> Add Pitfall
                  </button>
                </div>
              )}
            </div>

            {/* RESOURCES */}
            <div className="border border-border">
              <button
                onClick={() => toggleSection('resources')}
                className="w-full px-6 py-4 bg-secondary/50 flex items-center justify-between hover:bg-secondary/70 transition-colors"
              >
                <span className="text-sm tracking-wider uppercase">Resources & Downloads</span>
                {expandedSections.has('resources') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.has('resources') && (
                <div className="p-6 space-y-4 bg-background">
                  {(formData.resources || []).map((resource, index) => (
                    <div key={index} className="border border-border p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs tracking-wider uppercase text-gray-400">Resource {index + 1}</span>
                        <button
                          onClick={() => removeArrayItem('resources', index)}
                          className="text-destructive hover:opacity-80 transition-opacity"
                          title="Remove resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <DarkInput
                        type="text"
                        value={resource.name}
                        onChange={(e) => updateArrayItem('resources', index, { ...resource, name: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none"
                        placeholder="Resource name"
                      />
                      <DarkTextarea
                        value={resource.description}
                        onChange={(e) => updateArrayItem('resources', index, { ...resource, description: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none"
                        placeholder="Description"
                      />
                      <DarkInput
                        type="text"
                        value={resource.url}
                        onChange={(e) => updateArrayItem('resources', index, { ...resource, url: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-accent-brand focus:outline-none font-mono text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('resources', { name: '', description: '', url: '' })}
                    className="text-xs tracking-wider uppercase text-accent-brand hover:opacity-80 transition-opacity"
                  >
                    + Add Resource
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <SaveButton
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-accent-brand text-accent-brand-foreground hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase">Save Tutorial</span>
            </SaveButton>
            <CancelButton
              onClick={handleCancel}
              className="px-6 py-3 border border-border hover:border-foreground transition-colors text-xs tracking-wider uppercase"
            >
              Cancel
            </CancelButton>
          </div>
        </div>
      )}

      {/* Tutorials List */}
      <div className="grid grid-cols-1 gap-3">
        {tutorials.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border">
            <Play className="w-12 h-12 opacity-20 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No tutorials yet</p>
            <button
              onClick={handleAdd}
              className="text-xs tracking-wider uppercase text-accent-brand hover:opacity-80 transition-opacity"
            >
              Add your first tutorial
            </button>
          </div>
        ) : (
          tutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className="flex items-center justify-between p-4 border transition-colors rounded-2xl bg-card/50 hover:bg-card border-border hover:border-accent-brand/50"
            >
              <div className="flex items-center gap-4">
                {tutorial.thumbnail ? (
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="w-20 aspect-video rounded-lg object-cover bg-muted"
                  />
                ) : (
                  <div className="w-20 aspect-video rounded-lg bg-muted flex items-center justify-center">
                    <Play className="w-6 h-6 opacity-20" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium tracking-tight text-white">{tutorial.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400">
                      {categories.find(c => c.id === tutorial.category)?.name}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-300">{tutorial.duration}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">{tutorial.publishDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={tutorial.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="View on YouTube"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <IconButton onClick={() => handleEdit(tutorial)}>
                  <Edit2 className="w-4 h-4" />
                </IconButton>
                <IconButton onClick={() => handleDelete(tutorial.id)} variant="danger">
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>
    </div >
  );
}
