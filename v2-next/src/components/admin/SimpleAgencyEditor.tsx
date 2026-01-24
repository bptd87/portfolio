import { useState } from 'react';
import { ChevronDown, Video, Layout, Info } from 'lucide-react';
import { GalleryEditor } from './ProjectTemplateFields';
import { YouTubeVideosEditor } from './YouTubeVideosEditor';

interface SimpleAgencyEditorProps {
    data: any;
    onChange: (updates: Record<string, any>) => void;
    projectContext?: string;
}

export function SimpleAgencyEditor({ data, onChange, projectContext = '' }: SimpleAgencyEditorProps) {
    const [expandedSections, setExpandedSections] = useState<string[]>(['description', 'gallery', 'videos']);

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const isRendering = data.category?.includes('Rendering');
    const videoField = isRendering ? 'videoUrls' : 'youtubeVideos';

    return (
        <div className="space-y-6">
            <div className="bg-accent-brand/5 border border-accent-brand/20 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-accent-brand mt-0.5" />
                <div>
                    <h4 className="text-sm font-medium text-accent-brand">Agency Style Editor</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                        This simplified editor is optimized for Experimental, Rendering, and Scenic Model projects.
                        All content here will be displayed in the project detail modal.
                    </p>
                </div>
            </div>

            {/* Description Section */}
            <div className="border border-border rounded-2xl overflow-hidden bg-card/30">
                <button
                    type="button"
                    onClick={() => toggleSection('description')}
                    className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-all border-b border-border"
                >
                    <div className="flex items-center gap-2">
                        <Layout className="w-4 h-4 text-accent-brand" />
                        <span className="text-xs tracking-wider uppercase font-semibold">Project Narrative</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('description') ? 'rotate-180' : ''}`} />
                </button>

                {expandedSections.includes('description') && (
                    <div className="p-4">
                        <textarea
                            value={data.description || data.projectOverview || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (isRendering) {
                                    onChange({ projectOverview: value, description: value });
                                } else {
                                    onChange({ description: value });
                                }
                            }}
                            placeholder="Tell the story of this project..."
                            rows={8}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-accent-brand focus:outline-none focus:ring-1 focus:ring-accent-brand resize-none font-serif text-base leading-relaxed"
                        />
                        <p className="text-[10px] text-muted-foreground mt-2 opacity-60">
                            * Note: Rendering projects use 'projectOverview' field, others use 'description'. Both are synced here for safety.
                        </p>
                    </div>
                )}
            </div>

            {/* Hero Gallery Section */}
            <div className="border border-border rounded-2xl overflow-hidden bg-card/30">
                <button
                    type="button"
                    onClick={() => toggleSection('gallery')}
                    className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-all border-b border-border"
                >
                    <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-400" />
                        <span className="text-xs tracking-wider uppercase font-semibold">Primary Gallery (Images)</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('gallery') ? 'rotate-180' : ''}`} />
                </button>

                {expandedSections.includes('gallery') && (
                    <div className="p-4">
                        <GalleryEditor
                            label="Project Images"
                            images={data.galleries?.hero || []}
                            captions={data.galleries?.heroCaptions || []}
                            altTexts={data.galleries?.heroAlt || []}
                            onChange={(images, captions, altTexts) => {
                                const galleries = data.galleries || {};
                                onChange({
                                    galleries: {
                                        ...galleries,
                                        hero: images,
                                        heroCaptions: captions,
                                        heroAlt: altTexts
                                    }
                                });
                            }}
                            projectContext={projectContext}
                        />
                    </div>
                )}
            </div>

            {/* Videos Section */}
            <div className="border border-border rounded-2xl overflow-hidden bg-card/30">
                <button
                    type="button"
                    onClick={() => toggleSection('videos')}
                    className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-all border-b border-border"
                >
                    <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-red-400" />
                        <span className="text-xs tracking-wider uppercase font-semibold">Project Videos (YouTube/Vimeo)</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('videos') ? 'rotate-180' : ''}`} />
                </button>

                {expandedSections.includes('videos') && (
                    <div className="p-4">
                        <YouTubeVideosEditor
                            videos={data[videoField] || []}
                            onChange={(videos) => onChange({ [videoField]: videos })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
