import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Save, X, Trash2, Pencil, Layout, Image, Users, Tags, FileJson } from 'lucide-react';

import { useCategories } from '../../hooks/useCategories';
import { PrimaryButton, SaveButton, IconButton } from './AdminButtons';
import { InfoBanner } from './InfoBanner';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Checkbox } from './ui/Checkbox';
import { toast } from 'sonner';
import { CreditsManager } from './CreditsManager';
import { GalleryEditor, DesignNotesEditor } from './ProjectTemplateFields';
import { TagInput } from './ui/TagInput';
import { YouTubeVideosEditor } from './YouTubeVideosEditor';
import { ProjectSEOTools } from './ProjectSEOTools';
import { UnifiedPortfolioEditor } from './UnifiedPortfolioEditor';
import { ImageUploaderWithFocalPoint } from './ImageUploaderWithFocalPoint';
import { SimpleGalleryEditor } from './SimpleGalleryEditor';
import { SEOImageFixer } from './SEOImageFixer';
import { createClient } from '../../utils/supabase/client';

const supabase = createClient();


// Zod schema for validation
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  venue: z.string().optional(), // Made optional as it depends on category
  location: z.string().optional(),
  clientName: z.string().optional(), // For Experiential
  client: z.string().optional(), // For Rendering
  year: z.coerce.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  month: z.any().optional(), // Relaxed validation as it is conditional
  featured: z.boolean(),
  published: z.boolean().optional(), // New field
  description: z.string().min(1, 'Description is required'),
  cardImage: z.string().optional(),
  focusPoint: z.object({ x: z.number(), y: z.number() }).optional(),
  credits: z.array(z.object({ role: z.string(), name: z.string() })).optional(),
  tags: z.array(z.string()).optional(),

  // Scenic Design specific
  galleries: z.any().optional(),
  youtubeVideos: z.array(z.string()).optional(),
  designNotes: z.array(z.string()).optional(),

  // Experiential specific
  role: z.string().nullable().optional(),
  challenge: z.string().nullable().optional(),
  solution: z.string().nullable().optional(),
  keyFeatures: z.any().nullable().optional(),
  process: z.any().nullable().optional(),
  team: z.any().nullable().optional(),
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
  // loading state removed as unused currently, though typically used for UI
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');
  const { categories } = useCategories();


  const methods = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Scenic Design',
      subcategory: '',
      venue: '',
      location: '',
      clientName: '',
      client: '',
      year: new Date().getFullYear(),
      month: 1,
      cardImage: '',
      featured: false,
      published: true,
      galleries: {
        hero: [],
        heroCaptions: [],
        heroAlt: [],
        process: [],
        processCaptions: [],
        processAlt: []
      },
      credits: [],
      tags: [],
      youtubeVideos: [],
      designNotes: [],
      videoUrls: [],
      softwareUsed: [],
      projectOverview: '',
      keyFeatures: [],
      metrics: [],
      team: [],
      process: [],
      experientialContent: []
    }
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      // 1. Try fetching from SQL Table first
      const { data: sqlProjects, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('year', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects from database');
        return;
      }

      if (sqlProjects) {
        // Transform SQL snake_case to CamelCase if needed or use as is
        // Our schema uses snake_case in DB but we might need mapping
        // OR we updated our app to handle both.
        // For simplicity, let's map DB fields to our frontend structure
        const mappedProjects = sqlProjects.map((p: any) => ({
          ...p,
          cardImage: p.card_image || '',
          youtubeVideos: p.youtube_videos || [],
          videoUrls: p.youtube_videos || [],
          designNotes: p.design_notes || [],
          clientName: p.client_name || '',
          role: p.role || '',
          challenge: p.challenge || '',
          solution: p.solution || '',
          keyFeatures: p.key_features || [],
          softwareUsed: p.software_used || [], // Ensure array
          projectOverview: p.project_overview || '',
          process: p.process || [],
          team: p.team || [],
          metrics: p.metrics || [],
          testimonial: p.testimonial || null,
          experientialContent: p.content || [],
          // Safe defaults for others
          description: p.description || '',
          venue: p.venue || '',
          location: p.location || '',
          credits: p.credits || [],
          galleries: p.galleries || { hero: [], heroCaptions: [], process: [], processCaptions: [] },
          tags: p.tags || [],
          focusPoint: p.focus_point || { x: 50, y: 50 }
        }));

        setProjects(mappedProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Error connecting to server.');
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
      videoUrls: [],
      designNotes: [],
      softwareUsed: [],
      projectOverview: ''
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
      role: project.role || '',
      challenge: project.challenge || '',
      solution: project.solution || '',
      clientName: project.clientName || '',
      month: project.month || '', // Ensure not null for Select component
      published: project.published !== undefined ? project.published : true, // Default to true for existing projects
      videoUrls: project.videoUrls || [],
      softwareUsed: project.softwareUsed || [],
      projectOverview: project.projectOverview || '',
      keyFeatures: project.keyFeatures || [],
      metrics: project.metrics || [],
      team: project.team || [],
      process: project.process || []
    };
    methods.reset(safeProject);
    setEditingId(project.id);
    setShowForm(true);
    setActiveTab('basic');
  };

  const onSubmit = async (formData: ProjectFormData) => {
    try {
      const isNew = editingId === 'new';
      // Generate slug if new or missing, simplified logic
      let slug = formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';

      if (!isNew && editingId) {
        const loadedP = projects.find(p => p.id === editingId);
        if (loadedP && loadedP.slug) slug = loadedP.slug;
      }

      // Transform to DB Schema
      const dbPayload = {
        title: formData.title,
        slug: slug,
        category: formData.category,
        subcategory: formData.subcategory,
        venue: formData.venue,
        location: formData.location,
        year: formData.year,
        description: formData.description,
        featured: formData.featured,
        published: formData.published,
        card_image: formData.cardImage,
        credits: formData.credits,
        galleries: formData.galleries,
        tags: formData.tags,
        youtube_videos: formData.category?.includes('Rendering') ? formData.videoUrls : formData.youtubeVideos,
        month: parseInt(String(formData.month || 0)) || null,
        design_notes: formData.designNotes,

        // Experiential & Rendering Specific Mappings
        client_name: formData.clientName || formData.client, // Merge both frontend fields to single DB col
        role: formData.role,
        challenge: formData.challenge,
        solution: formData.solution,
        key_features: formData.keyFeatures,
        process: formData.process,
        team: formData.team,
        metrics: formData.metrics,
        testimonial: formData.testimonial,
        software_used: formData.softwareUsed,
        project_overview: formData.projectOverview,
        content: formData.experientialContent,
        focus_point: formData.focusPoint,
      };

      console.log('Saving Project Payload:', dbPayload);

      let error;
      if (isNew) {
        const { data, error: insertError } = await supabase
          .from('portfolio_projects' as any)
          .insert([dbPayload] as any)
          .select()
          .single();
        error = insertError;
        if (data) setEditingId((data as any).id);
      } else {
        const { error: updateError } = await supabase
          .from('portfolio_projects' as any)
          // @ts-ignore
          .update(dbPayload)
          .eq('id', editingId as string);
        error = updateError;
      }

      if (error) {
        console.error('Supabase Error Detail:', error);
        throw error;
      }

      toast.success('Project saved successfully!');
      await loadProjects();

    } catch (err: any) {
      console.error('Full Save Error:', err);
      toast.error(`Failed to save: ${err.message || err.details || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Project deleted successfully!');
      await loadProjects();
    } catch (err) {
      console.error(err);
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

  // Construct context for AI
  const contextTitle = methods.watch('title');
  const contextCredits = methods.watch('credits') || [];
  const contextDesigner = contextCredits.find((c: any) => c.role.toLowerCase().includes('scenic') || c.role.toLowerCase().includes('designer'))?.name;
  const projectContext = `${contextTitle} (${category})${contextDesigner ? ` - Design by ${contextDesigner}` : ''}`;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Layout },
    { id: 'media', label: category === 'Experiential Design' ? 'Content' : 'Media & Gallery', icon: Image },
    { id: 'details', label: 'Credits & Notes', icon: Users },
    { id: 'seo', label: 'SEO & Tags', icon: Tags },
  ] as const;

  const onError = (errors: any) => {
    console.error('Form Validation Errors:', errors);
    const missingFields = Object.keys(errors).join(', ');
    toast.error(`Please check the form. Missing/Invalid: ${missingFields}`);
  };

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
                  aria-label="Sort projects"
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
          <form onSubmit={methods.handleSubmit(onSubmit, onError)} className="border border-border bg-card rounded-3xl overflow-hidden">
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
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === tab.id
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
                      <option value="Scenic Design">Scenic Design</option>
                      <option value="Experiential Design">Experiential Design</option>
                      <option value="Rendering & Visualization">Rendering & Visualization</option>
                      <option value="Design Documentation">Design Documentation</option>
                      <option value="Archive">Archive</option>
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
                      {/* Year is common, removed duplicate from here */}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      <Input name="venue" label="Venue" required placeholder="e.g. Paper Mill Playhouse" />
                      <Input name="location" label="Location" required placeholder="e.g. Millburn, NJ" />
                    </div>
                  )}

                  {/* Common Year/Month for ALL categories now */}
                  <div className="grid grid-cols-2 gap-6">
                    <Input name="year" label="Year" type="number" required />
                    <Select name="month" label="Month" required={category !== 'Rendering & Visualization'}>
                      <option value="">Select month...</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </Select>
                  </div>

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
                    <ImageUploaderWithFocalPoint
                      label="Card Image (Thumbnail)"
                      value={methods.watch('cardImage')}
                      focalPoint={methods.watch('focusPoint')}
                      onChange={(url, point) => {
                        methods.setValue('cardImage', url);
                        if (point) methods.setValue('focusPoint', point);
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-2">This image will be used on the portfolio grid.</p>
                  </div>


                  {category?.includes('Documentation') ? (
                    <SimpleGalleryEditor
                      label="Gallery Images"
                      images={methods.watch('galleries.process') || []}
                      captions={methods.watch('galleries.processCaptions') || []}
                      onChange={(images, captions) => {
                        methods.setValue('galleries.process', images);
                        methods.setValue('galleries.processCaptions', captions);
                      }}
                      captionPlaceholder={
                        methods.watch('subcategory') === 'Archive'
                          ? "Production Name\nLocation: Theater, City, State\nDirector: Name | Scenic Designer: Name"
                          : "Production Name (Year)\n\nMaterials: List materials\nScale: 1/4\" = 1'-0\"\n\nProcess: Describe construction"
                      }
                    />
                  ) : (
                    <UnifiedPortfolioEditor
                      category={category || ''}
                      data={methods.watch() as any}
                      onChange={(updates) => {
                        // Merge updates into form
                        Object.entries(updates).forEach(([key, value]) => {
                          methods.setValue(key as any, value, { shouldValidate: true, shouldDirty: true });
                        });
                      }}
                      currentCover={methods.watch('cardImage')}
                      onSetCover={(url) => methods.setValue('cardImage', url)}
                      projectContext={projectContext}
                    />
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
                  <TagInput
                    label="Tags"
                    value={methods.watch('tags') || []}
                    onChange={(tags) => methods.setValue('tags', tags)}
                    placeholder="e.g., Lighting Design, Scenic"
                  />
                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                    <h4 className="text-sm font-medium text-blue-400 mb-2">SEO Preview</h4>
                    <p className="text-xs text-muted-foreground">
                      The slug for this project will be automatically generated from the title:
                      <code className="ml-2 bg-background px-2 py-1 rounded border border-border">
                        {methods.watch('title')?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '...'}
                      </code>
                    </p>
                  </div>

                  {/* AI Image Renamer & Caption Generator */}
                  {editingId !== 'new' ? (
                    <SEOImageFixer
                      project={{ ...methods.watch(), id: editingId }}
                      onUpdate={(updatedData) => {
                        methods.reset({ ...methods.getValues(), ...updatedData });
                        toast.success('Project form updated with new image URLs. Please Save.');
                      }}
                      onAutoSave={async (updatedData) => {
                        const newData = { ...methods.getValues(), ...updatedData };
                        methods.reset(newData);
                        await onSubmit(newData);
                      }}
                    />
                  ) : (
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 mb-2">
                        <Tags className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-200">Save Project to Enable AI Tools</h3>
                      <p className="text-xs text-slate-400 max-w-[300px] mx-auto">
                        The AI Image Optimizer requires the project to be saved first. Please save your progress to rename images and generate captions.
                      </p>
                    </div>
                  )}
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
