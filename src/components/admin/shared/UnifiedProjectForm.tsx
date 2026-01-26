
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, Layout, Image, Users, Tags, Video, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { SaveButton, IconButton } from '../AdminButtons';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { TagInput } from '../ui/TagInput';

import { ImageUploaderWithFocalPoint } from '../ImageUploaderWithFocalPoint';
import { AIAltTextGenerator } from '../AIImageEnhancers';
import { ProjectSEOTools } from '../ProjectSEOTools';
import { SEOImageFixer } from '../SEOImageFixer';
import { GalleryEditor } from '../ProjectTemplateFields';
import { YouTubeVideosEditor } from '../YouTubeVideosEditor';
// Unused imports regarding previous editors have been removed
// import { UnifiedPortfolioEditor } from '../UnifiedPortfolioEditor';
// import { SimpleGalleryEditor } from '../SimpleGalleryEditor';
import { supabase } from '../../../lib/supabase';

import { CreditsManager } from '../CreditsManager'; // Relative to shared folder: ../CreditsManager

// Unified Schema for Agency-Style Projects
// (Experiential, Rendering, Models, Scenic)
const unifiedSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    category: z.string(),
    subcategory: z.string().optional(),

    // Core Info
    year: z.coerce.number().min(1900).max(new Date().getFullYear() + 2),
    month: z.coerce.number().optional().nullable(),
    description: z.string().min(1, 'Short description is required'),

    // Details
    clientName: z.string().optional().nullable(),
    venue: z.string().optional().nullable(), // Added Venue
    location: z.string().optional().nullable(),
    role: z.string().optional().nullable(),
    credits: z.array(z.object({ role: z.string(), name: z.string() })).optional(), // Data preservation

    // Narrative
    projectOverview: z.string().optional().nullable().or(z.literal('')),
    // Legacy fields (kept for read-only or compatibility if needed, but we focus on overview)
    challenge: z.string().optional().nullable().or(z.literal('')),
    solution: z.string().optional().nullable().or(z.literal('')),
    designNotes: z.string().optional().nullable().or(z.literal('')),

    // Publishing
    featured: z.boolean(),
    published: z.boolean().optional(),

    // Visuals
    cardImage: z.string().optional(),
    cardImageAlt: z.string().optional(),
    focusPoint: z.object({ x: z.number(), y: z.number() }).optional(),

    // Content (Unified)
    galleries: z.any().optional(), // Expect { hero: [], heroCaptions: [], heroAlt: [] }
    youtubeVideos: z.array(z.string()).optional(),
    productionPhotos: z.array(z.string()).optional(),

    // SEO
    tags: z.array(z.string()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
});

type UnifiedFormData = z.infer<typeof unifiedSchema>;
type TabId = 'overview' | 'content' | 'narrative' | 'seo';

interface UnifiedProjectFormProps {
    category: string;
    subcategory?: string;
    lockSubcategory?: boolean;
    initialData?: any;
    onClose: () => void;
    onSaveConfig?: () => Promise<void>; // Any extra post-save actions
}

const DEFAULT_SUBCATEGORY_OPTIONS = [
    'Archive',
    'Case Study',
    'Comedy',
    'Commercial',
    'Drama',
    'Interior Design',
    'Models',
    'Musical Theatre',
    'Outdoor Theatre',
    'Shakespeare',
    'Venue Documentation'
];

export function UnifiedProjectForm({ category, subcategory, lockSubcategory = false, initialData, onClose, onSaveConfig }: UnifiedProjectFormProps) {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [subcategoryOptions, setSubcategoryOptions] = useState<string[]>(DEFAULT_SUBCATEGORY_OPTIONS);

    // Determine editing mode
    const isNew = !initialData?.id || initialData.id === 'new';
    const editingId = initialData?.id || 'new';

    const methods = useForm<UnifiedFormData>({
        resolver: zodResolver(unifiedSchema),
        defaultValues: {
            title: initialData?.title || '',
            category: category,
            subcategory: (lockSubcategory ? subcategory : (initialData?.subcategory || subcategory)) || '',
            year: initialData?.year || new Date().getFullYear(),
            month: initialData?.month || null,
            description: initialData?.description || '',


            clientName: initialData?.clientName || '',
            venue: initialData?.venue || '', // Added initial data map
            location: initialData?.location || '',
            role: initialData?.role || '',
            credits: initialData?.credits || [],

            projectOverview: initialData?.project_overview ||
                // Fallback: Combine legacy fields if new field is empty
                [
                    initialData?.challenge ? `**The Challenge**\n${initialData.challenge}` : null,
                    initialData?.solution ? `**The Solution**\n${initialData.solution}` : null,
                    initialData?.designNotes ? `**Design Notes**\n${initialData.designNotes}` : null
                ].filter(Boolean).join('\n\n') || '',

            challenge: initialData?.challenge || '',
            solution: initialData?.solution || '',
            designNotes: Array.isArray(initialData?.designNotes)
                ? initialData.designNotes.join('\n\n')
                : (initialData?.designNotes || ''),

            featured: initialData?.featured || false,
            published: initialData?.published !== false, // Default true

            cardImage: initialData?.cardImage || '',
            cardImageAlt: initialData?.cardImageAlt || '',
            focusPoint: initialData?.focusPoint || { x: 50, y: 50 },

            galleries: initialData?.galleries || { hero: [], heroCaptions: [], heroAlt: [] },
            youtubeVideos: initialData?.youtubeVideos || [],
            productionPhotos: initialData?.production_photos || initialData?.productionPhotos || [],

            tags: initialData?.tags || [],
            seoTitle: initialData?.seoTitle || '',
            seoDescription: initialData?.seoDescription || '',
            seoKeywords: initialData?.seoKeywords || [],
        }
    });

    useEffect(() => {
        const loadSubcategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('portfolio_projects')
                    .select('subcategory')
                    .not('subcategory', 'is', null);

                if (error) throw error;

                const existing = (data || [])
                    .map((item: any) => (item.subcategory || '').toString().trim())
                    .filter(Boolean);

                const merged = Array.from(new Set([...
                    DEFAULT_SUBCATEGORY_OPTIONS,
                ...existing
                ])).sort((a, b) => a.localeCompare(b));

                setSubcategoryOptions(merged);
            } catch (err) {
                console.error('Failed to load subcategories:', err);
            }
        };

        loadSubcategories();
    }, []);

    const onSubmit = async (formData: UnifiedFormData) => {
        try {
            let slug = formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';
            if (!isNew && initialData?.slug) slug = initialData.slug;

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                toast.error('Session expired. Please log in again.');
                return;
            }

            // Map Unified Schema to DB Schema "Agency Style"
            const dbPayload = {
                title: formData.title,
                slug,
                category: category, // Enforce locked props (or use dynamic if needed, but simplistic for now)
                subcategory: lockSubcategory ? subcategory : (formData.subcategory || subcategory),
                year: parseInt(String(formData.year)) || new Date().getFullYear(),
                month: formData.month ? parseInt(String(formData.month)) : null,
                description: formData.description, // Short desc

                client_name: formData.clientName,
                location: formData.location,
                venue: formData.venue, // Use direct venue field

                role: formData.role,
                credits: formData.credits, // Save credits!

                project_overview: formData.projectOverview, // New unified field

                // Sync projectOverview to design_notesArray for legacy compatibility
                // If projectOverview is set, use it. If not, empty array.
                design_notes: formData.projectOverview ? [formData.projectOverview] : [],

                // Legacy Field Satisfaction (Required by DB constraints)
                content: [],
                process: [],
                software_used: [],

                // challenge/solution are truly legacy now, consolidated into project_overview
                // leaving commented out so we don't overwrite with empty strings if they exist
                // challenge: formData.challenge,
                // solution: formData.solution,

                featured: formData.featured,
                published: formData.published,

                card_image: formData.cardImage,
                card_image_alt: formData.cardImageAlt,
                focus_point: formData.focusPoint,

                // Unified Content
                galleries: formData.galleries,
                youtube_videos: formData.youtubeVideos,
                // production_photos: formData.productionPhotos, // Removed: Column missing in DB schema. Saved via galleries.process instead.

                // SEO & Tags
                tags: formData.tags,
                seo_title: formData.seoTitle,
                seo_description: formData.seoDescription,
                seo_keywords: formData.seoKeywords,
            };

            if (isNew) {
                const { error } = await supabase.from('portfolio_projects').insert([dbPayload]);
                if (error) {
                    console.error('Supabase Insert Error:', error);
                    throw error;
                }
            } else {
                const { error } = await supabase.from('portfolio_projects').update(dbPayload).eq('id', editingId);
                if (error) {
                    console.error('Supabase Update Error:', error);
                    throw error;
                }
            }

            toast.success('Project saved successfully!');
            if (onSaveConfig) await onSaveConfig();
            onClose();
        } catch (err: any) {
            console.error('Error saving:', err);
            // Enhanced error reporting
            const msg = err.message || 'Unknown error';
            const details = err.details || err.hint || '';
            toast.error(`Failed to save: ${msg} ${details ? `(${details})` : ''}`);
        }
    };

    const onError = (errors: any) => {
        const missing = Object.keys(errors).join(', ');
        toast.error(`Missing fields: ${missing}`);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit, onError)} className="border border-border bg-card rounded-3xl overflow-hidden flex flex-col h-full max-h-[85vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-background z-10 sticky top-0">
                    <div>
                        <h3 className="text-lg font-medium">{isNew ? 'New Project' : 'Edit Project'}</h3>
                        <p className="text-sm text-muted-foreground">{category} {((lockSubcategory ? subcategory : methods.watch('subcategory')) || '') ? ` / ${lockSubcategory ? subcategory : methods.watch('subcategory')}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <SaveButton type="submit" disabled={methods.formState.isSubmitting}>
                            <Save className="w-4 h-4" />
                            <span>Save Project</span>
                        </SaveButton>
                        <IconButton onClick={onClose}><X className="w-5 h-5" /></IconButton>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border bg-muted/30">
                    {[
                        { id: 'overview', icon: Layout, label: 'Overview' },
                        { id: 'content', icon: Image, label: 'Gallery & Media' },
                        { id: 'narrative', icon: FileText, label: 'Narrative' },
                        { id: 'seo', icon: Tags, label: 'SEO' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as TabId)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium relative transition-colors ${activeTab === tab.id ? 'text-foreground bg-background' : 'text-muted-foreground hover:bg-background/50'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />}
                        </button>
                    ))}
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
                            <Input name="title" label="Project Title" required />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    name="subcategory"
                                    label="Secondary Category (Optional)"
                                    placeholder="e.g., Musical Theatre"
                                    list="portfolio-subcategory-options"
                                    disabled={lockSubcategory}
                                />
                                <div className="text-xs text-muted-foreground pt-7">
                                    {lockSubcategory
                                        ? 'This project is locked to a required subcategory.'
                                        : 'Start typing to choose an existing subcategory or create a new one.'}
                                </div>
                            </div>
                            <datalist id="portfolio-subcategory-options">
                                {subcategoryOptions.map(option => (
                                    <option key={option} value={option} />
                                ))}
                            </datalist>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input name="clientName" label="Client / Brand" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input name="venue" label="Venue" placeholder="Theater/Venue" />
                                    <Input name="location" label="City/Location" placeholder="City, State" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input name="year" label="Year" type="number" required />
                                <Select name="month" label="Month">
                                    <option value="">Select...</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </Select>
                                <Input name="role" label="My Role" placeholder="e.g. Lead Designer" />
                            </div>

                            <Textarea name="description" label="Short Description (Listing)" required rows={3} />

                            <div className="bg-muted/30 p-6 rounded-xl border border-border">
                                <h4 className="text-sm font-medium mb-4">Cover Image</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <ImageUploaderWithFocalPoint
                                            label="Thumbnail Image"
                                            value={methods.watch('cardImage')}
                                            focalPoint={(() => {
                                                const fp = methods.watch('focusPoint');
                                                return fp && typeof fp.x === 'number' && typeof fp.y === 'number'
                                                    ? { x: fp.x, y: fp.y }
                                                    : undefined;
                                            })()}
                                            onChange={(url, point) => {
                                                methods.setValue('cardImage', url);
                                                if (point) methods.setValue('focusPoint', point);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <AIAltTextGenerator
                                            imageUrl={methods.watch('cardImage') || ''}
                                            onAltTextGenerated={(txt) => methods.setValue('cardImageAlt', txt, { shouldDirty: true })}
                                            context={`${methods.watch('title')} (${category})`}
                                        />
                                        <Input name="cardImageAlt" label="Alt Text" />
                                        <div className="flex gap-6 mt-6">
                                            <Checkbox name="featured" label="Featured Home Page" />
                                            <Checkbox name="published" label="Published" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
                            {/* Unified Gallery using GalleryEditor (mapped to 'hero' key for simplicity in Unified Schema) */}
                            <div className="space-y-4">
                                <GalleryEditor
                                    label="Primary Gallery"
                                    images={methods.watch('galleries.hero') || []}
                                    captions={methods.watch('galleries.heroCaptions') || []}
                                    altTexts={methods.watch('galleries.heroAlt') || []}
                                    onSetCover={(url) => methods.setValue('cardImage', url, { shouldDirty: true })}
                                    currentCover={methods.watch('cardImage')}
                                    projectContext={methods.watch('title')}
                                    onChange={(images, captions, altTexts) => {
                                        methods.setValue('galleries', {
                                            ...(methods.getValues('galleries') || {}),
                                            hero: images,
                                            heroCaptions: captions,
                                            heroAlt: altTexts
                                        }, { shouldDirty: true });
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">Main project gallery (Renderings, Design, or primary photos).</p>
                            </div>

                            <div className="h-px bg-border" />

                            <div className="space-y-4">
                                <GalleryEditor
                                    label="Secondary Gallery"
                                    images={methods.watch('galleries.process') || methods.watch('productionPhotos') || []}
                                    captions={methods.watch('galleries.processCaptions') || []}
                                    altTexts={methods.watch('galleries.processAlt') || []}
                                    projectContext={methods.watch('title')}
                                    onChange={(images, captions, altTexts) => {
                                        methods.setValue('galleries', {
                                            ...(methods.getValues('galleries') || {}),
                                            process: images,
                                            processCaptions: captions,
                                            processAlt: altTexts,
                                        }, { shouldDirty: true });
                                        methods.setValue('productionPhotos', images, { shouldDirty: true });
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">Secondary gallery (Process, Production Photos, or additional angles).</p>
                            </div>

                            <div className="h-px bg-border" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Video className="w-4 h-4 text-red-500" />
                                    <h4 className="text-sm font-medium">Project Videos</h4>
                                </div>
                                <YouTubeVideosEditor
                                    videos={methods.watch('youtubeVideos') || []}
                                    onChange={(videos) => methods.setValue('youtubeVideos', videos, { shouldDirty: true })}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'narrative' && (
                        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
                            <p className="text-sm text-muted-foreground">Detailed project information for the case study view.</p>

                            <Textarea
                                name="projectOverview"
                                label="Project Overview / Narrative"
                                rows={12}
                                placeholder="Describe the project, challenge, solution, and outcomes. Supports Markdown (e.g., **bold**, *italic*)."
                            />
                            <p className="text-xs text-muted-foreground">
                                This unified field replaces the old "Challenge" and "Solution" boxes. You can use Markdown to format text.
                            </p>

                            <div className="bg-muted/30 p-4 rounded-xl border border-border mt-4">
                                <h4 className="text-sm font-medium mb-4">Project Credits & Notes</h4>
                                <div className="space-y-6">
                                    <CreditsManager
                                        credits={(methods.watch('credits') || []).map((credit: any) => ({
                                            role: credit?.role || '',
                                            name: credit?.name || '',
                                        }))}
                                        onChange={(c) => methods.setValue('credits', c, { shouldDirty: true })}
                                    />
                                    {/* Design Notes UI removed as requested - consolidated into Project Overview */}
                                    {/* Keeping logic for backward compatibility if needed, but hiding the field */}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
                            <ProjectSEOTools
                                title={methods.watch('title')}
                                description={methods.watch('description')}
                                currentTags={methods.watch('seoKeywords') || []}
                                onTagsGenerated={(t) => methods.setValue('seoKeywords', t, { shouldDirty: true })}
                                onDescriptionGenerated={(d) => methods.setValue('seoDescription', d, { shouldDirty: true })}
                            />

                            <div className="p-6 bg-muted/20 border border-border rounded-xl space-y-6">
                                <Input name="seoTitle" label="Meta Title" />
                                <Textarea name="seoDescription" label="Meta Description" />
                                <TagInput
                                    label="Keywords"
                                    value={methods.watch('seoKeywords') || []}
                                    onChange={(t) => methods.setValue('seoKeywords', t)}
                                />
                                <TagInput
                                    label="Project Tags (Internal)"
                                    value={methods.watch('tags') || []}
                                    onChange={(t) => methods.setValue('tags', t)}
                                />
                            </div>

                            {!isNew && (
                                <SEOImageFixer
                                    project={{ ...methods.getValues(), id: editingId }}
                                    onUpdate={(u) => methods.reset({ ...methods.getValues(), ...u })}
                                    onAutoSave={async (u) => {
                                        methods.reset({ ...methods.getValues(), ...u });
                                        // We don't verify auto-save here to avoid complexity, letting user explicit save.
                                    }}
                                />
                            )}
                        </div>
                    )}

                </div>
            </form>
        </FormProvider>
    );
}
