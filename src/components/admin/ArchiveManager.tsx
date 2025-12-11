import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { SimpleGalleryEditor } from './SimpleGalleryEditor';
import { supabase } from '../../lib/supabase';

interface ArchiveData {
    images: string[];
    captions: string[];
    cardImage?: string;
}

export function ArchiveManager() {
    const [data, setData] = useState<ArchiveData>({ images: [], captions: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: project, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', 'scenic-design-archive')
                .single() as any;

            if (error) throw error;

            if (project) {
                setData({
                    images: project.galleries?.process || [],
                    captions: project.galleries?.processCaptions || [],
                    cardImage: project.cardImage
                });
            }
        } catch (error) {
            console.error('Error loading archive:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        try {
            // Upsert (insert or update) the project
            const { error } = await supabase
                .from('projects')
                .upsert({
                    id: 'scenic-design-archive',
                    slug: 'scenic-design-archive',
                    title: 'Scenic Design Archive',
                    category: 'Design Documentation',
                    subcategory: 'Archive',
                    description: 'A curated archive of scenic design work from various productions.',
                    galleries: {
                        process: data.images,
                        processCaptions: data.captions
                    },
                    cardImage: data.cardImage,
                    featured: false,
                    order: 999,
                    updated_at: new Date().toISOString()
                } as any, {
                    onConflict: 'id'
                });

            if (error) throw error;

            setMessage('Archive saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">📸 Scenic Design Archive</h2>
                    <p className="text-sm text-gray-400">
                        Permanent gallery for production photos from shows throughout your career
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-brand hover:bg-accent-brand/90 disabled:opacity-50 rounded-lg transition-colors"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Success Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                    {message}
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-400 mb-2">💡 Caption Format</h3>
                <p className="text-xs text-blue-300/80">
                    Production Name<br />
                    Location: Theater Name, City, State<br />
                    Director: Name | Scenic Designer: Name
                </p>
            </div>

            {/* Gallery Editor */}
            <div className="bg-gray-900/50 rounded-lg p-6">
                <SimpleGalleryEditor
                    label="Archive Photos"
                    images={data.images}
                    captions={data.captions}
                    onChange={(images, captions) => setData({ ...data, images, captions })}
                    captionPlaceholder="Production Name&#10;Location: Theater, City, State&#10;Director: Name | Scenic Designer: Name"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{data.images.length}</div>
                    <div className="text-xs text-gray-400">Total Images</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                        {data.captions.filter(c => c && c.trim()).length}
                    </div>
                    <div className="text-xs text-gray-400">With Captions</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                        {data.captions.filter(c => !c || !c.trim()).length}
                    </div>
                    <div className="text-xs text-gray-400">Missing Captions</div>
                </div>
            </div>
        </div>
    );
}
