import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { AdminPageHeader } from './shared/AdminPageHeader';
import { AdminListItem } from './shared/AdminListItem';
import { UnifiedProjectForm } from './shared/UnifiedProjectForm';

export function ScenicManager() {
    const [projects, setProjects] = useState<any[]>([]);
    const [editingProject, setEditingProject] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

    const SCENIC_CATEGORIES = ['Scenic Design', 'Opera', 'Theatre', 'Dance', 'Design Documentation'];

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('portfolio_projects')
                .select('*')
                .in('category', SCENIC_CATEGORIES)
                .neq('subcategory', 'Scenic Models') // Exclude Models
                .order('year', { ascending: false });

            if (error) throw error;

            const mapped = (data || []).map((p: any) => ({
                ...p,
                // Unified Schema Mapping
                clientName: p.client_name, // Scenic usually doesn't use this but we map it just in case
                venue: p.venue, // Pass raw venue
                location: p.location, // Pass raw location
                cardImage: p.card_image,
                cardImageAlt: p.card_image_alt,
                focusPoint: p.focus_point,
                projectOverview: p.project_overview || p.description, // Fallback to description if overview empty
                designNotes: Array.isArray(p.design_notes) ? p.design_notes.join('\n\n') : (p.design_notes || ''),

                galleries: p.galleries || { hero: [], heroCaptions: [], heroAlt: [] },
                productionPhotos: p.production_photos || p.productionPhotos || [],
                youtubeVideos: p.youtube_videos || [],
                tags: p.tags || [],
                seoTitle: p.seo_title,
                seoDescription: p.seo_description,
                seoKeywords: p.seo_keywords,

                // Keep track of credits in case UnifiedForm supports it later, but current UnifiedForm might ignore it
                credits: p.credits || []
            }));
            setProjects(mapped);
        } catch (error) {
            console.error('Error loading scenic projects:', error);
            toast.error('Failed to load scenic projects');
        }
    };

    const handleCreate = () => {
        setEditingProject({ id: 'new', category: 'Scenic Design' });
        setShowForm(true);
    };

    const handleEdit = (project: any) => {
        setEditingProject(project);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This cannot be undone.')) return;
        try {
            const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
            if (error) throw error;
            toast.success('Project deleted');
            loadProjects();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleClose = () => {
        setShowForm(false);
        setEditingProject(null);
    };

    const handleSave = async () => {
        await loadProjects();
    };

    const sortedProjects = [...projects].sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        const dateA = new Date(a.year, (a.month || 1) - 1);
        const dateB = new Date(b.year, (b.month || 1) - 1);
        return dateB.getTime() - dateA.getTime();
    });

    if (showForm) {
        // Pass dynamic category from the editing project (e.g. Opera) or default to Scenic Design
        // UnifiedForm uses this prop for "category" field lock-in.
        return (
            <UnifiedProjectForm
                category={editingProject?.category || "Scenic Design"}
                subcategory={editingProject?.subcategory}
                initialData={editingProject}
                onClose={handleClose}
                onSaveConfig={handleSave}
            />
        );
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Scenic Design"
                description="Manage core scenic design portfolio (Unified)"
                onCreate={handleCreate}
                createLabel="New Scenic Project"
                actions={
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Sort:</span>
                        <select
                            aria-label="Sort by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-zinc-300"
                        >
                            <option value="date">Date</option>
                            <option value="title">Title</option>
                        </select>
                    </div>
                }
            />

            <div className="space-y-3">
                {sortedProjects.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400">No scenic projects found.</div>
                ) : (
                    sortedProjects.map(p => (
                        <AdminListItem
                            key={p.id}
                            title={p.title}
                            subtitle={p.venue}
                            thumbnail={p.cardImage}
                            status={p.published ? { label: 'Published', variant: 'published' } : { label: 'Draft', variant: 'draft' }}
                            metadata={[
                                { label: '', value: p.category },
                                { label: '', value: p.year?.toString() }
                            ]}
                            onEdit={() => handleEdit(p)}
                            onDelete={() => handleDelete(p.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
