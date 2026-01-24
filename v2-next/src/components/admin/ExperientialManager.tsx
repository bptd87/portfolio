import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { AdminPageHeader } from './shared/AdminPageHeader';
import { AdminListItem } from './shared/AdminListItem';
import { UnifiedProjectForm } from './shared/UnifiedProjectForm';

export function ExperientialManager() {
    const [projects, setProjects] = useState<any[]>([]);
    const [editingProject, setEditingProject] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('portfolio_projects')
                .select('*')
                .eq('category', 'Experiential Design')
                .order('year', { ascending: false });

            if (error) throw error;

            const mapped = (data || []).map(p => ({
                ...p,
                // Unified mappings
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
            console.error('Error loading experiential:', error);
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
                category="Experiential Design"
                initialData={editingProject}
                onClose={handleClose}
                onSaveConfig={handleSave}
            />
        );
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Experiential Design"
                description="Manage brand activations and immersive projects."
                onCreate={handleCreate}
                createLabel="New Activation"
            />

            <div className="space-y-3">
                {projects.map(p => (
                    <AdminListItem
                        key={p.id}
                        title={p.title}
                        subtitle={p.clientName || p.location}
                        thumbnail={p.cardImage}
                        status={p.published ? { label: 'Published', variant: 'published' } : { label: 'Draft', variant: 'draft' }}
                        metadata={[
                            { label: '', value: 'Activation' },
                            { label: '', value: p.year?.toString() }
                        ]}
                        onEdit={() => handleEdit(p)}
                        onDelete={() => handleDelete(p.id)}
                    />
                ))}
                {projects.length === 0 && (
                    <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                        No projects found.
                    </div>
                )}
            </div>
        </div>
    );
}
