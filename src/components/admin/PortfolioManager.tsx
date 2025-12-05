import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Save, X, Trash2, Pencil, Layout, Image, Users, Tags, Upload, FileJson } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { projects as hardcodedProjects } from '../../data/projects';
import { useCategories } from '../../hooks/useCategories';
import { PrimaryButton, SaveButton, CancelButton, IconButton } from './AdminButtons';
import { InfoBanner } from './InfoBanner';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Checkbox } from './ui/Checkbox';
import { toast } from 'sonner';
import { CreditsManager } from './CreditsManager';
import { GalleryEditor, DesignNotesEditor, TagsEditor } from './ProjectTemplateFields';
import { YouTubeVideosEditor } from './YouTubeVideosEditor';
import { ProjectSEOTools } from './ProjectSEOTools';
import { ExperientialDesignEditor } from './ExperientialDesignEditor';
import { RenderingEditor } from './RenderingEditor';
import { ImageUploader } from './ImageUploader';

// Zod schema for validation
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  venue: z.string().optional(), // Made optional as it depends on category
  location: z.string().optional(),
  clientName: z.string().optional(), // For Experiential
  client: z.string().optional(), // For Rendering
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  month: z.number().min(1).max(12),
  featured: z.boolean(),
  published: z.boolean().optional(), // New field
  description: z.string().min(1, 'Description is required'),
  cardImage: z.string().optional(),
  credits: z.array(z.object({ role: z.string(), name: z.string() })).optional(),
  tags: z.array(z.string()).optional(),
  
  // Scenic Design specific
  galleries: z.any().optional(),
  youtubeVideos: z.array(z.string()).optional(),
  designNotes: z.array(z.string()).optional(),

  // Experiential specific
  role: z.string().optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  keyFeatures: z.any().optional(),
  process: z.any().optional(),
  team: z.any().optional(),
  metrics: z.any().optional(),
  testimonial: z.any().optional(),
  experientialContent: z.any().optional(), // Renamed to avoid conflict with generic content

  // Rendering specific
  softwareUsed: z.array(z.string()).optional(),
  projectOverview: z.string().optional(),
  videoUrls: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

type TabId = 'basic' | 'media' | 'details' | 'seo';

export function PortfolioManager() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');
  const { categories, loading: categoriesLoading } = useCategories();

  const methods = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      galleries: { hero: [], heroCaptions: [], process: [], processCaptions: [] },
      credits: [],
      tags: [],
      youtubeVideos: [],
      designNotes: [],
      featured: false,
      published: true // Default to true
    }
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/projects`,
        {
          headers: {
            'Authorization': `Bearer ${token || publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Edge Function API failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Response:', errorText);
        setProjects(hardcodedProjects);
        toast.error('Failed to load projects from server, using local data');
      } else {
        const data = await response.json();
        const projectsList = data.success ? data.projects : data;
        setProjects(projectsList);
        toast.success(`Loaded ${projectsList.length} projects from server`);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects(hardcodedProjects);
      toast.error('Error connecting to server, using local data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    methods.reset({
      title: '',
      category: categories.portfolio[0]?.name || '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      featured: false,
      published: false, // Default to draft
      credits: [],
      tags: [],
      galleries: { hero: [], heroCaptions: [], process: [], processCaptions: [] },
      youtubeVideos: [],
      designNotes: []
    });
    setEditingId('new');
    setShowForm(true);
    setActiveTab('basic');
  };

  const handleEdit = (project: any) => {
    // Ensure galleries structure exists
    const safeProject = {
      ...project,
      galleries: project.galleries || { hero: [], heroCaptions: [], process: [], processCaptions: [] },
      credits: project.credits || [],
      tags: project.tags || [],
      youtubeVideos: project.youtubeVideos || [],
      designNotes: project.designNotes || [],
      published: project.published !== undefined ? project.published : true // Default to true for existing projects
    };
    methods.reset(safeProject);
    setEditingId(project.id);
    setShowForm(true);
    setActiveTab('basic');
  };

  const onSubmit = async (formData: ProjectFormData) => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const isNew = editingId === 'new';
      const slug = isNew ? (formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '') : projects.find(p => p.id === editingId)?.slug;

      const url = isNew
        ? `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/projects`
        : `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/projects/${editingId}`;

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}`, 'X-Admin-Token': token || '' },
        body: JSON.stringify({ ...formData, slug }),
      });

      if (response.ok) {
        toast.success('Project saved successfully!');
        await loadProjects();
        setShowForm(false);
        setEditingId(null);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to save project: ${errorData.error}`);
      }
    } catch (err) {
      toast.error('An error occurred while saving the project.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-Admin-Token': token || '' },
      });
      if (response.ok) {
        toast.success('Project deleted successfully!');
        await loadProjects();
      } else {
        toast.error('Failed to delete project.');
      }
    } catch (err) {
      toast.error('An error occurred while deleting the project.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleBulkImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json)) {
            // Handle array of projects
            toast.info(`Found ${json.length} projects. Import logic to be implemented.`);
          } else {
            // Handle single project
            methods.reset(json);
            setEditingId('new');
            setShowForm(true);
            toast.success('Project data loaded from JSON');
          }
        } catch (err) {
          toast.error('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };
  
  const category = methods.watch('category');

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Layout },
    { id: 'media', label: category === 'Experiential Design' ? 'Content' : 'Media & Gallery', icon: Image },
    { id: 'details', label: 'Credits & Notes', icon: Users },
    { id: 'seo', label: 'SEO & Tags', icon: Tags },
  ] as const;

  return (
    <div className="space-y-6">
      <InfoBanner title="Portfolio Manager" description="Manage your portfolio projects here." icon="💼" />
      <div className="flex items-center justify-between">
        <h2 className="text-xl tracking-tight">Portfolio Projects</h2>
        <div className="flex gap-2">
          {!showForm && (
            <>
              <div className="flex items-center gap-2 mr-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-background border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-accent-brand"
                >
                  <option value="date">Date (Newest)</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="category">Category</option>
                </select>
              </div>
              <button 
                onClick={handleBulkImport}
                className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-accent/50 rounded-3xl transition-colors text-xs tracking-wider uppercase"
              >
                <FileJson className="w-4 h-4" />
                <span>Import JSON</span>
              </button>
              <PrimaryButton onClick={handleCreate}>
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </PrimaryButton>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="border border-border bg-card rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="tracking-tight text-lg font-medium">{editingId === 'new' ? 'Create New Project' : 'Edit Project'}</h3>
              <div className="flex items-center gap-2">
                <SaveButton type="submit" disabled={methods.formState.isSubmitting}>
                  <Save className="w-4 h-4" />
                  <span>{methods.formState.isSubmitting ? 'Saving...' : 'Save'}</span>
                </SaveButton>
                <IconButton onClick={handleCancel}><X className="w-5 h-5" /></IconButton>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/30">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id 
                      ? 'text-foreground bg-background' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 min-h-[400px]">
              {activeTab === 'basic' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <Input name="title" label="Project Title" required placeholder="e.g. Million Dollar Quartet" />
                  <div className="grid grid-cols-2 gap-6">
                    <Select name="category" label="Category" required>
                      {categories.portfolio.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </Select>
                    <Input name="subcategory" label="Subcategory" placeholder="e.g. Musical, Play, Opera" />
                  </div>
                  
                  {/* Conditional Fields based on Category */}
                  {category === 'Experiential Design' ? (
                    <div className="grid grid-cols-2 gap-6">
                      <Input name="clientName" label="Client Name" required placeholder="e.g. Google" />
                      <Input name="location" label="Location" required placeholder="e.g. New York, NY" />
                    </div>
                  ) : category === 'Rendering & Visualization' ? (
                    <div className="grid grid-cols-2 gap-6">
                      <Input name="client" label="Client / Project Name" placeholder="e.g. Personal Project" />
                      <Input name="year" label="Year" type="number" required />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      <Input name="venue" label="Venue" required placeholder="e.g. Paper Mill Playhouse" />
                      <Input name="location" label="Location" required placeholder="e.g. Millburn, NJ" />
                    </div>
                  )}

                  {category !== 'Rendering & Visualization' && (
                    <div className="grid grid-cols-2 gap-6">
                      <Input name="year" label="Year" type="number" required />
                      <Select name="month" label="Month" required>
                        {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                      </Select>
                    </div>
                  )}

                  <Textarea name="description" label="Description" required rows={5} placeholder="Project description..." />
                  <div className="flex items-center gap-6">
                    <Checkbox name="featured" label="Featured Project (Show on Home Page)" />
                    <Checkbox name="published" label="Published (Visible on Site)" />
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="bg-muted/30 p-4 rounded-xl border border-border">
                    <ImageUploader 
                      label="Card Image (Thumbnail)" 
                      value={methods.watch('cardImage')} 
                      onChange={(url) => methods.setValue('cardImage', url)}
                      bucketName="projects"
                    />
                    <p className="text-xs text-muted-foreground mt-2">This image will be used on the portfolio grid.</p>
                  </div>
                  
                  {category === 'Experiential Design' ? (
                    <ExperientialDesignEditor 
                      data={methods.getValues() as any} 
                      onChange={(newData) => {
                        // Merge new data into form
                        Object.entries(newData).forEach(([key, value]) => {
                          methods.setValue(key as any, value);
                        });
                      }}
                      currentCover={methods.watch('cardImage')}
                      onSetCover={(url) => methods.setValue('cardImage', url)}
                    />
                  ) : category === 'Rendering & Visualization' ? (
                    <RenderingEditor 
                      data={methods.getValues() as any} 
                      onChange={(newData) => {
                        Object.entries(newData).forEach(([key, value]) => {
                          methods.setValue(key as any, value);
                        });
                      }}
                      currentCover={methods.watch('cardImage')}
                      onSetCover={(url) => methods.setValue('cardImage', url)}
                    />
                  ) : (
                    <>
                      <GalleryEditor 
                        label="Primary Gallery (Renderings & Design)" 
                        images={methods.watch('galleries.hero') || []} 
                        captions={methods.watch('galleries.heroCaptions') || []} 
                        onChange={(images, captions) => {
                          methods.setValue('galleries.hero', images);
                          methods.setValue('galleries.heroCaptions', captions);
                        }} 
                        currentCover={methods.watch('cardImage')} 
                        onSetCover={(url) => methods.setValue('cardImage', url)} 
                      />
                      
                      <div className="h-px bg-border" />
                      
                      <GalleryEditor 
                        label="Secondary Gallery (Production Photos)" 
                        images={methods.watch('galleries.process') || []} 
                        captions={methods.watch('galleries.processCaptions') || []} 
                        onChange={(images, captions) => {
                          methods.setValue('galleries.process', images);
                          methods.setValue('galleries.processCaptions', captions);
                        }} 
                        currentCover={methods.watch('cardImage')} 
                        onSetCover={(url) => methods.setValue('cardImage', url)} 
                      />

                      <div className="h-px bg-border" />

                      <YouTubeVideosEditor videos={methods.watch('youtubeVideos') || []} onChange={(videos) => methods.setValue('youtubeVideos', videos)} />
                    </>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {category === 'Experiential Design' ? (
                    <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border">
                      <p>Experiential projects manage team and details within the Content Editor (Media Tab).</p>
                    </div>
                  ) : (
                    <>
                      <CreditsManager credits={methods.watch('credits') || []} onChange={(credits) => methods.setValue('credits', credits)} />
                      <div className="h-px bg-border" />
                      <DesignNotesEditor notes={methods.watch('designNotes') || []} onChange={(notes) => methods.setValue('designNotes', notes)} />
                    </>
                  )}
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <ProjectSEOTools 
                    title={methods.watch('title')}
                    description={methods.watch('description')}
                    currentTags={methods.watch('tags') || []}
                    onTagsGenerated={(tags) => methods.setValue('tags', tags)}
                    onDescriptionGenerated={(desc) => {
                      // If description is empty or user wants to replace it, we could do it here.
                      // For now, we'll just show a toast or let them copy it from the tool.
                      // But the tool has a "Generated!" state.
                      // Let's append it to description if it's short, or just replace?
                      // Actually, let's just update the description field if it's empty, otherwise maybe append?
                      // The user asked for AI tools. The tool I built calls onDescriptionGenerated.
                      // Let's just set the description field for now.
                      methods.setValue('description', desc);
                    }}
                  />
                  <TagsEditor tags={methods.watch('tags') || []} onChange={(tags) => methods.setValue('tags', tags)} />
                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                    <h4 className="text-sm font-medium text-blue-400 mb-2">SEO Preview</h4>
                    <p className="text-xs text-muted-foreground">
                      The slug for this project will be automatically generated from the title: 
                      <code className="ml-2 bg-background px-2 py-1 rounded border border-border">
                        {methods.watch('title')?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '...'}
                      </code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </FormProvider>
      )}

      {!showForm && (
        <div className="grid grid-cols-1 gap-3">
          {[...projects]
            .sort((a, b) => {
              if (sortBy === 'date') {
                const dateA = new Date(a.year, (a.month || 1) - 1);
                const dateB = new Date(b.year, (b.month || 1) - 1);
                return dateB.getTime() - dateA.getTime();
              }
              if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
              if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
              return 0;
            })
            .map((project) => (
            <div key={project.id} className={`flex items-center justify-between p-4 border transition-colors rounded-2xl bg-card/50 hover:bg-card ${project.published === false ? 'border-dashed border-border opacity-70' : 'border-border hover:border-accent-brand/50'}`}>
              <div className="flex items-center gap-4">
                {project.cardImage ? (
                  <img src={project.cardImage} alt="" className="w-12 h-12 rounded-lg object-cover bg-muted" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <Image className="w-6 h-6 opacity-20" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="tracking-tight font-medium">{project.title}</h4>
                    {project.published === false && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-wider">Draft</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400">{project.category}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-300">{project.venue}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">{project.year}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconButton onClick={() => handleEdit(project)}><Pencil className="w-4 h-4" /></IconButton>
                <IconButton onClick={() => handleDelete(project.id)} variant="danger"><Trash2 className="w-4 h-4" /></IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
