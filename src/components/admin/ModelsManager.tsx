import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { AdminPageHeader } from './shared/AdminPageHeader';
import { AdminListItem } from './shared/AdminListItem';
import { UnifiedProjectForm } from './shared/UnifiedProjectForm';

export function ModelsManager() {
    const [projects, setProjects] = useState<any[]>([]);
    const [editingProject, setEditingProject] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            // "Scenic Models" category or subcategory
            const { data, error } = await supabase
                .from('portfolio_projects')
                .select('*')
                .or('category.eq.Scenic Models,subcategory.eq.Scenic Models')
                .order('year', { ascending: false });

            if (error) throw error;

            const mapped = (data || []).map(p => ({
                ...p,
                galleries: p.galleries || { hero: [], heroCaptions: [], heroAlt: [] },
                cardImage: p.card_image,
                clientName: p.client_name,
                designNotes: p.design_notes,
                seoTitle: p.seo_title,
                seoDescription: p.seo_description,
                seoKeywords: p.seo_keywords,
                cardImageAlt: p.card_image_alt || '',
                youtubeVideos: p.youtube_videos || []
            }));

            setProjects(mapped);
        } catch (error) {
            console.error('Error loading models:', error);
            toast.error('Failed to load projects');
        }
    };

    const handleCreate = () => {
        setEditingProject({ id: 'new' });
        setShowForm(true);
    };

    const handleEdit = (project: any) => {
        setEditingProject(project);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This cannot be undone.')) return;
        try {
            await supabase.from('portfolio_projects').delete().eq('id', id);
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

    if (showForm) {
        return (
            <UnifiedProjectForm
                category="Scenic Models"
                subcategory="Scenic Models" // Enforce subcategory to match existing data
                lockSubcategory
                initialData={editingProject}
                onClose={handleClose}
                onSaveConfig={handleSave}
            />
        );
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Scenic Models (Physical)"
                description="Manage hand-crafted scale 1:48/1:25 models."
                onCreate={handleCreate}
                createLabel="New Model"
            />

            <div className="space-y-3">
                {projects.map(p => (
                    <AdminListItem
                        key={p.id}
                        title={p.title}
                        subtitle={p.year?.toString()}
                        thumbnail={p.cardImage}
                        status={p.published ? { label: 'Published', variant: 'published' } : { label: 'Draft', variant: 'draft' }}
                        metadata={[
                            { label: '', value: 'Model' }
                        ]}
                        onEdit={() => handleEdit(p)}
                        onDelete={() => handleDelete(p.id)}
                    />
                ))}
                {projects.length === 0 && (
                    <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                        No model projects found.
                    </div>
                )}
            </div>
        </div>
    );
}
