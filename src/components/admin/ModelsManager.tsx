import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { SimpleGalleryEditor } from './SimpleGalleryEditor';
import { supabase } from '../../lib/supabase';

interface ModelsData {
    images: string[];
    captions: string[];
    cardImage?: string;
}

export function ModelsManager() {
    const [data, setData] = useState<ModelsData>({ images: [], captions: [] });
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
                .eq('id', 'scenic-models')
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
            console.error('Error loading models:', error);
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
                    id: 'scenic-models',
                    slug: 'scenic-models',
                    title: 'Scenic Models',
                    category: 'Design Documentation',
                    subcategory: 'Scale Models',
                    description: 'A gallery of scale models and physical mockups for scenic designs.',
                    galleries: {
                        process: data.images,
                        processCaptions: data.captions
                    },
                    cardImage: data.cardImage,
                    featured: false,
                    order: 998,
                    updated_at: new Date().toISOString()
                } as any, {
                    onConflict: 'id'
                });

            if (error) throw error;

            setMessage('Models saved successfully!');
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
                    <h2 className="text-2xl font-bold text-white mb-2">🏗️ Scenic Models</h2>
                    <p className="text-sm text-gray-400">
                        Permanent gallery for scenic design models showcasing the design development process
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
                    Production Name (Year)<br />
                    <br />
                    Materials: Foamcore, basswood, etc.<br />
                    Scale: 1/4" = 1'-0"<br />
                    <br />
                    Process: Brief description of construction
                </p>
            </div>

            {/* Gallery Editor */}
            <div className="bg-gray-900/50 rounded-lg p-6">
                <SimpleGalleryEditor
                    label="Model Photos"
                    images={data.images}
                    captions={data.captions}
                    onChange={(images, captions) => setData({ ...data, images, captions })}
                    captionPlaceholder="Production Name (Year)&#10;&#10;Materials: List materials&#10;Scale: 1/4&quot; = 1'-0&quot;&#10;&#10;Process: Describe construction"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{data.images.length}</div>
                    <div className="text-xs text-gray-400">Total Models</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                        {data.captions.filter(c => c && c.trim()).length}
                    </div>
                    <div className="text-xs text-gray-400">With Details</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                        {data.captions.filter(c => !c || !c.trim()).length}
                    </div>
                    <div className="text-xs text-gray-400">Missing Details</div>
                </div>
            </div>
        </div>
    );
}
