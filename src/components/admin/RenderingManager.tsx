import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { AdminPageHeader } from './shared/AdminPageHeader';
import { AdminListItem } from './shared/AdminListItem';
import { UnifiedProjectForm } from './shared/UnifiedProjectForm';

export function RenderingManager() {
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
                .eq('category', 'Rendering & Visualization')
                .order('year', { ascending: false });

            if (error) throw error;

            const mapped = (data || []).map((p: any) => ({
                ...p,
                // Map DB fields to Unified Schema
                clientName: p.client_name,
                cardImage: p.card_image,
                cardImageAlt: p.card_image_alt,
                focusPoint: p.focus_point,
                projectOverview: p.project_overview,
                designNotes: p.design_notes?.[0] || '', // UnifiedForm expects string for single note or array? Form uses string. DB is array.
                // UnifiedForm expects string for designNotes in defaultValues (line 110 of UnifiedProjectForm.tsx)

                galleries: p.galleries || { hero: [], heroCaptions: [], heroAlt: [] },
                youtubeVideos: p.youtube_videos || [],
                tags: p.tags || [],
                seoTitle: p.seo_title,
                seoDescription: p.seo_description,
                seoKeywords: p.seo_keywords,
            }));
            setProjects(mapped);
        } catch (error) {
            console.error('Error loading renderings:', error);
            toast.error('Failed to load rendering projects');
        }
    };

    const handleCreate = () => {
        setEditingProject({ id: 'new' });
        setShowForm(true);
    };

    const handleEdit = (project: any) => {
        // Ensure designNotes is mapped types correctly for the form
        const formProject = {
            ...project,
            designNotes: Array.isArray(project.design_notes) ? project.design_notes[0] : project.design_notes
        };
        setEditingProject(formProject);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
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
                category="Rendering & Visualization"
                initialData={editingProject}
                onClose={handleClose}
                onSaveConfig={handleSave}
            />
        );
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Rendering & Visualization"
                description="3D Renders, Concepts, and Animations (Unified)"
                onCreate={handleCreate}
                createLabel="New Rendering"
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
                            { label: '', value: 'Rendering' },
                            { label: 'Client', value: p.clientName }
                        ]}
                        onEdit={() => handleEdit(p)}
                        onDelete={() => handleDelete(p.id)}
                    />
                ))}
                {projects.length === 0 && (
                    <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                        No rendering projects found.
                    </div>
                )}
            </div>
        </div>
    );
}
