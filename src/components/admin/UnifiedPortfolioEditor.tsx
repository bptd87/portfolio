import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Video, Layers, Image as ImageIcon, Star, X } from 'lucide-react';
import { ImageGalleryManager } from './ImageUploader';
import { ImageUploader } from './ImageUploader';
import { GalleryEditor } from './ProjectTemplateFields';
import { YouTubeVideosEditor } from './YouTubeVideosEditor';

// Shared interfaces
interface KeyFeature {
  title: string;
  description: string;
}

interface ProcessStep {
  title: string;
  description: string;
  images?: string[];
  imageCaptions?: string[];
  image?: string; // For Rendering (single image)
}

interface TeamMember {
  name: string;
  role: string;
}

interface Metric {
  value: string;
  label: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

interface AdditionalGallery {
  id: string;
  heading: string;
  description: string;
  images: Array<{
    url: string;
    caption: string;
    alt?: string;
  }>;
  layout: '1-col' | '2-col' | '3-col' | 'masonry';
}

interface RenderingGallery {
  heading: string;
  description: string;
  images: Array<{
    url: string;
    caption: string;
  }>;
  layout?: '1-col' | '2-col' | '3-col' | 'masonry';
}

interface UnifiedPortfolioEditorProps {
  category: string;
  data: any; // Full form data
  onChange: (updates: Record<string, any>) => void; // Updates specific fields
  currentCover?: string;
  onSetCover?: (url: string) => void;
  projectContext?: string;
}

export function UnifiedPortfolioEditor({
  category,
  data,
  onChange,
  currentCover,
  onSetCover,
  projectContext = '',
}: UnifiedPortfolioEditorProps) {
  const isExperiential = category?.includes('Experiential');
  const isRendering = category?.includes('Rendering');
  const isScenic = !isExperiential && !isRendering && !category?.includes('Documentation');
  const isDocumentation = category?.includes('Documentation');

  // Experiential-specific state
  const [expandedSections, setExpandedSections] = useState<string[]>(['stats', 'challenge']);
  
  // Rendering-specific state
  const [expandedGalleries, setExpandedGalleries] = useState<number[]>([0]);
  const [softwareInput, setSoftwareInput] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleGallery = (index: number) => {
    setExpandedGalleries(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };


  // EXPERIENTIAL DESIGN HANDLERS
  const addKeyFeature = () => {
    const newFeatures = [...(data.keyFeatures || []), { title: '', description: '' }];
    onChange({ keyFeatures: newFeatures });
  };

  const updateKeyFeature = (index: number, field: keyof KeyFeature, value: string) => {
    const newFeatures = [...(data.keyFeatures || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ keyFeatures: newFeatures });
  };

  const removeKeyFeature = (index: number) => {
    const newFeatures = (data.keyFeatures || []).filter((_: any, i: number) => i !== index);
    onChange({ keyFeatures: newFeatures });
  };

  const addProcessStep = () => {
    const newProcess = [...(data.process || []), isRendering 
      ? { title: '', description: '', image: '' }
      : { title: '', description: '', images: [], imageCaptions: [] }
    ];
    onChange({ process: newProcess });
  };

  const updateProcessStep = (index: number, field: keyof ProcessStep, value: any) => {
    const newProcess = [...(data.process || [])];
    newProcess[index] = { ...newProcess[index], [field]: value };
    onChange({ process: newProcess });
  };

  const removeProcessStep = (index: number) => {
    const newProcess = (data.process || []).filter((_: any, i: number) => i !== index);
    onChange({ process: newProcess });
  };

  const moveProcessStep = (index: number, direction: 'up' | 'down') => {
    const newProcess = [...(data.process || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProcess.length) return;
    [newProcess[index], newProcess[targetIndex]] = [newProcess[targetIndex], newProcess[index]];
    onChange({ process: newProcess });
  };

  const addTeamMember = () => {
    const newTeam = [...(data.team || []), { name: '', role: '' }];
    onChange({ team: newTeam });
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const newTeam = [...(data.team || [])];
    newTeam[index] = { ...newTeam[index], [field]: value };
    onChange({ team: newTeam });
  };

  const removeTeamMember = (index: number) => {
    const newTeam = (data.team || []).filter((_: any, i: number) => i !== index);
    onChange({ team: newTeam });
  };

  const addMetric = () => {
    const newMetrics = [...(data.metrics || []), { value: '', label: '' }];
    onChange({ metrics: newMetrics });
  };

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const newMetrics = [...(data.metrics || [])];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    onChange({ metrics: newMetrics });
  };

  const removeMetric = (index: number) => {
    const newMetrics = (data.metrics || []).filter((_: any, i: number) => i !== index);
    onChange({ metrics: newMetrics });
  };

  const addVideoUrl = () => {
    const videoField = isRendering ? 'videoUrls' : 'youtubeVideos';
    const newVideos = [...(data[videoField] || []), ''];
    onChange({ [videoField]: newVideos });
  };

  const updateVideoUrl = (index: number, value: string) => {
    const videoField = isRendering ? 'videoUrls' : 'youtubeVideos';
    const newVideos = [...(data[videoField] || [])];
    newVideos[index] = value;
    onChange({ [videoField]: newVideos });
  };

  const removeVideoUrl = (index: number) => {
    const videoField = isRendering ? 'videoUrls' : 'youtubeVideos';
    const newVideos = (data[videoField] || []).filter((_: any, i: number) => i !== index);
    onChange({ [videoField]: newVideos });
  };

  // Experiential: Additional Galleries
  const addAdditionalGallery = () => {
    const newGallery: AdditionalGallery = {
      id: crypto.randomUUID(),
      heading: 'New Gallery',
      description: '',
      images: [],
      layout: '3-col'
    };
    const galleries = data.galleries || {};
    onChange({
      galleries: {
        ...galleries,
        additional: [...(galleries.additional || []), newGallery]
      }
    });
  };

  const updateAdditionalGallery = (index: number, field: keyof AdditionalGallery, value: any) => {
    const galleries = data.galleries || {};
    const newAdditional = [...(galleries.additional || [])];
    newAdditional[index] = { ...newAdditional[index], [field]: value };
    onChange({
      galleries: {
        ...galleries,
        additional: newAdditional
      }
    });
  };

  const removeAdditionalGallery = (index: number) => {
    const galleries = data.galleries || {};
    const newAdditional = (galleries.additional || []).filter((_: any, i: number) => i !== index);
    onChange({
      galleries: {
        ...galleries,
        additional: newAdditional
      }
    });
  };

  const updateGalleryImages = (galleryIndex: number, newImages: Array<{ url: string; caption: string; alt?: string; }>) => {
    const galleries = data.galleries || {};
    const newAdditional = [...(galleries.additional || [])];
    newAdditional[galleryIndex].images = newImages;
    onChange({
      galleries: {
        ...galleries,
        additional: newAdditional
      }
    });
  };

  // Rendering: Galleries
  const addRenderingGallery = () => {
    const newGalleries = [
      ...(Array.isArray(data.galleries) ? data.galleries : []),
      {
        heading: 'New Render Gallery',
        description: '',
        images: [],
        layout: '1-col' as const,
      }
    ];
    onChange({ galleries: newGalleries });
    setExpandedGalleries([...expandedGalleries, newGalleries.length - 1]);
  };

  const updateRenderingGallery = (index: number, field: keyof RenderingGallery, value: any) => {
    const newGalleries = [...(Array.isArray(data.galleries) ? data.galleries : [])];
    newGalleries[index] = { ...newGalleries[index], [field]: value };
    onChange({ galleries: newGalleries });
  };

  const removeRenderingGallery = (index: number) => {
    const newGalleries = (Array.isArray(data.galleries) ? data.galleries : []).filter((_: any, i: number) => i !== index);
    onChange({ galleries: newGalleries });
    setExpandedGalleries(expandedGalleries.filter(i => i !== index));
  };

  const moveRenderingGallery = (index: number, direction: 'up' | 'down') => {
    const newGalleries = [...(Array.isArray(data.galleries) ? data.galleries : [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGalleries.length) return;
    [newGalleries[index], newGalleries[targetIndex]] = [newGalleries[targetIndex], newGalleries[index]];
    onChange({ galleries: newGalleries });
  };

  const updateRenderingImage = (galleryIndex: number, imageIndex: number, field: 'url' | 'caption', value: string) => {
    const newGalleries = [...(Array.isArray(data.galleries) ? data.galleries : [])];
    newGalleries[galleryIndex].images[imageIndex] = {
      ...newGalleries[galleryIndex].images[imageIndex],
      [field]: value,
    };
    onChange({ galleries: newGalleries });
  };

  const removeRenderingImage = (galleryIndex: number, imageIndex: number) => {
    const newGalleries = [...(Array.isArray(data.galleries) ? data.galleries : [])];
    newGalleries[galleryIndex].images = newGalleries[galleryIndex].images.filter((_: any, i: number) => i !== imageIndex);
    onChange({ galleries: newGalleries });
  };

  const addSoftware = () => {
    if (softwareInput.trim() && !data.softwareUsed?.includes(softwareInput.trim())) {
      const newSoftware = [...(data.softwareUsed || []), softwareInput.trim()];
      onChange({ softwareUsed: newSoftware });
      setSoftwareInput('');
    }
  };

  const removeSoftware = (item: string) => {
    const newSoftware = (data.softwareUsed || []).filter((s: string) => s !== item);
    onChange({ softwareUsed: newSoftware });
  };

  // Render based on category
  if (isExperiential) {
    return (
      <div className="space-y-8">
        {/* Header Info */}
        <div className="bg-accent-brand/5 border border-accent-brand/20 p-4">
          <p className="text-xs tracking-wider uppercase text-gray-400 mb-2">Experiential Design - Agency Template</p>
          <p className="text-sm text-gray-300">
            Complete agency-style case study format with stats, challenge, solution, process timeline, team, metrics, and testimonials.
          </p>
        </div>

        {/* Agency Stats Section */}
        <div>
          <button type="button"
            onClick={() => toggleSection('stats')}
            className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
          >
            <span className="text-xs tracking-wider uppercase font-medium">Hero Stats (Client, Role, Timeline)</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('stats') ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.includes('stats') && (
            <div className="border border-t-0 border-accent-brand/20 p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={data.clientName || ''}
                    onChange={(e) => onChange({ clientName: e.target.value })}
                    placeholder="e.g., Global Tech Innovations"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Your Role</label>
                  <input
                    type="text"
                    value={data.role || ''}
                    onChange={(e) => onChange({ role: e.target.value })}
                    placeholder="e.g., Lead Experience Designer"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Timeline/Duration</label>
                  <input
                    type="text"
                    value={data.duration || ''}
                    onChange={(e) => onChange({ duration: e.target.value })}
                    placeholder="e.g., 6 Months"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Challenge Section */}
        <div>
          <button type="button"
            onClick={() => toggleSection('challenge')}
            className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
          >
            <div className="text-left">
              <div className="text-xs tracking-wider uppercase font-medium">The Challenge</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Large italic heading on page</div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('challenge') ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.includes('challenge') && (
            <div className="border border-t-0 border-accent-brand/20 p-4">
              <textarea
                value={data.challenge || ''}
                onChange={(e) => onChange({ challenge: e.target.value })}
                placeholder="What was the main challenge or problem to solve? This will display in large italic text."
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
              />
            </div>
          )}
        </div>

        {/* Solution Section */}
        <div>
          <button type="button"
            onClick={() => toggleSection('solution')}
            className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
          >
            <span className="text-xs tracking-wider uppercase font-medium">Our Approach / Solution</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('solution') ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.includes('solution') && (
            <div className="border border-t-0 border-accent-brand/20 p-4">
              <textarea
                value={data.solution || ''}
                onChange={(e) => onChange({ solution: e.target.value })}
                placeholder="How did you approach the challenge? What was your solution? Use double line breaks (press Enter twice) to create multiple paragraphs."
                rows={6}
                className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
              />
            </div>
          )}
        </div>

        {/* Key Features Section */}
        <div>
          <button type="button"
            onClick={() => toggleSection('features')}
            className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
          >
            <span className="text-xs tracking-wider uppercase font-medium">Key Features ({(data.keyFeatures || []).length})</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('features') ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.includes('features') && (
            <div className="border border-t-0 border-accent-brand/20 p-4 space-y-4">
              {(data.keyFeatures || []).map((feature: KeyFeature, index: number) => (
                <div key={index} className="p-4 bg-background border border-border space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Feature {index + 1}</span>
                    <button type="button"
                      onClick={() => removeKeyFeature(index)}
                      className="p-1 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
                      title="Remove key feature"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateKeyFeature(index, 'title', e.target.value)}
                    placeholder="Feature title"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateKeyFeature(index, 'description', e.target.value)}
                    placeholder="Feature description"
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
                  />
                </div>
              ))}
              <button type="button"
                onClick={addKeyFeature}
                className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border hover:border-accent-brand transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Key Feature
              </button>
            </div>
          )}
        </div>

        {/* Process Timeline Section */}
        <div>
          <button type="button"
            onClick={() => toggleSection('process')}
            className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
          >
            <span className="text-xs tracking-wider uppercase font-medium">Process Timeline ({(data.process || []).length} steps)</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('process') ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.includes('process') && (
            <div className="border border-t-0 border-accent-brand/20 p-4 space-y-4">
              {(data.process || []).map((step: ProcessStep, index: number) => (
                <div key={index} className="p-4 bg-background border border-border space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Step {index + 1}</span>
                    <div className="flex items-center gap-2">
                      {index > 0 && (
                        <button type="button"
                          onClick={() => moveProcessStep(index, 'up')}
                          className="p-1 opacity-60 hover:opacity-100 transition-all"
                          title="Move step up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      )}
                      {index < (data.process || []).length - 1 && (
                        <button type="button"
                          onClick={() => moveProcessStep(index, 'down')}
                          className="p-1 opacity-60 hover:opacity-100 transition-all"
                          title="Move step down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                      <button type="button"
                        onClick={() => removeProcessStep(index)}
                        className="p-1 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
                        title="Remove process step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateProcessStep(index, 'title', e.target.value)}
                    placeholder="Step title"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                  <textarea
                    value={step.description}
                    onChange={(e) => updateProcessStep(index, 'description', e.target.value)}
                    placeholder="Step description"
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
                  />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs text-gray-400">Step Images (Optional)</label>
                      {step.images && step.images.length > 0 && (
                        <span className="text-xs text-blue-400">{step.images.length} image{step.images.length !== 1 ? 's' : ''} added</span>
                      )}
                    </div>
                    <div className="bg-muted/20 p-3 rounded-lg border border-border">
                      <ImageGalleryManager
                        label="Add another image to this step"
                        images={step.images?.map((url: string, i: number) => ({ url, caption: step.imageCaptions?.[i] || '' })) || []}
                        onChange={(newImages) => {
                          const newProcess = [...(data.process || [])];
                          newProcess[index] = {
                            ...newProcess[index],
                            images: newImages.map(img => img.url),
                            imageCaptions: newImages.map(img => img.caption || '')
                          };
                          onChange({ process: newProcess });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button"
                onClick={addProcessStep}
                className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border hover:border-accent-brand transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Process Step
              </button>
            </div>
          )}
        </div>

        {/* Team Section */}
        <div>
          <button type="button"
            onClick={() => toggleSection('team')}
            className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
          >
            <span className="text-xs tracking-wider uppercase font-medium">Team & Collaborators ({(data.team || []).length})</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('team') ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.includes('team') && (
            <div className="border border-t-0 border-accent-brand/20 p-4 space-y-3">
              {(data.team || []).map((member: TeamMember, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                    placeholder="Name"
                    className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                    placeholder="Role"
                    className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                  <button type="button"
                    onClick={() => removeTeamMember(index)}
                    className="p-2 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
                    title="Remove team member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button"
                onClick={addTeamMember}
                className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border hover:border-accent-brand transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Team Member
              </button>
            </div>
          )}
        </div>

        {/* Metrics Section */}
        <div>
          <button type="button"
            onClick={() => toggleSection('metrics')}
            className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
          >
            <span className="text-xs tracking-wider uppercase font-medium">Impact & Results Metrics ({(data.metrics || []).length})</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('metrics') ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.includes('metrics') && (
            <div className="border border-t-0 border-accent-brand/20 p-4 space-y-3">
              <p className="text-xs text-gray-400 mb-3">These display as large dramatic numbers with labels</p>
              {(data.metrics || []).map((metric: Metric, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={metric.value}
                    onChange={(e) => updateMetric(index, 'value', e.target.value)}
                    placeholder="e.g., 10,000+ or 94%"
                    className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={metric.label}
                    onChange={(e) => updateMetric(index, 'label', e.target.value)}
                    placeholder="e.g., VISITORS"
                    className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                  <button type="button"
                    onClick={() => removeMetric(index)}
                    className="p-2 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
                    title="Remove metric"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button"
                onClick={addMetric}
                className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border hover:border-accent-brand transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Metric
              </button>
            </div>
          )}
        </div>

        {/* Testimonial Section */}
        <div>
          <button type="button"
            onClick={() => toggleSection('testimonial')}
            className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
          >
            <span className="text-xs tracking-wider uppercase font-medium">Client Testimonial</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('testimonial') ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.includes('testimonial') && (
            <div className="border border-t-0 border-accent-brand/20 p-4 space-y-4">
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Quote</label>
                <textarea
                  value={data.testimonial?.quote || ''}
                  onChange={(e) => onChange({
                    testimonial: { ...(data.testimonial || { quote: '', author: '', role: '' }), quote: e.target.value }
                  })}
                  placeholder="The testimonial quote (without quotation marks)"
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Author Name</label>
                  <input
                    type="text"
                    value={data.testimonial?.author || ''}
                    onChange={(e) => onChange({
                      testimonial: { ...(data.testimonial || { quote: '', author: '', role: '' }), author: e.target.value }
                    })}
                    placeholder="e.g., Jennifer Martinez"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Author Role</label>
                  <input
                    type="text"
                    value={data.testimonial?.role || ''}
                    onChange={(e) => onChange({
                      testimonial: { ...(data.testimonial || { quote: '', author: '', role: '' }), role: e.target.value }
                    })}
                    placeholder="e.g., VP of Brand Experience"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Project Galleries Section */}
        <div>
          <button type="button"
            onClick={() => toggleSection('galleries')}
            className="w-full flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
          >
            <div className="text-left">
              <div className="text-xs tracking-wider uppercase font-medium text-blue-400">📸 Project Galleries</div>
              <div className="text-[10px] text-blue-300/70 mt-0.5">Upload project photos - displays in image grid on page</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform ${expandedSections.includes('galleries') ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.includes('galleries') && (
            <div className="border border-t-0 border-blue-500/30 p-4 bg-blue-500/5">
              <GalleryEditor
                label="Project Photos"
                images={data.galleries?.hero || []}
                captions={data.galleries?.heroCaptions || []}
                onChange={(images, captions) => {
                const galleries = data.galleries || {};
                onChange({
                  galleries: {
                    ...galleries,
                    hero: images,
                    heroCaptions: captions
                  }
                });
                }}
                currentCover=""
                onSetCover={() => { }}
              />
            </div>
          )}
        </div>

        {/* Additional Galleries */}
        <div>
          <button type="button"
            onClick={() => toggleSection('additionalGalleries')}
            className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
          >
            <div className="text-left flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-brand" />
              <div>
                <div className="text-xs tracking-wider uppercase font-medium">Additional Galleries ({(data.galleries?.additional || []).length})</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Renderings, Drafting, Live Event Photos, etc.</div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('additionalGalleries') ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.includes('additionalGalleries') && (
            <div className="border border-t-0 border-accent-brand/20 p-4 space-y-6">
              <div className="flex justify-end">
                <button type="button" onClick={addAdditionalGallery} className="flex items-center gap-2 px-3 py-1.5 bg-accent-brand text-white text-xs rounded hover:opacity-90">
                  <Plus className="w-3 h-3" /> Add Gallery Section
                </button>
              </div>

              {(data.galleries?.additional || []).map((gallery: AdditionalGallery, gIndex: number) => (
                <div key={gallery.id} className="border border-white/10 rounded bg-white/5 p-4">
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/10">
                    <div className="flex-1 grid grid-cols-2 gap-4 mr-4">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Gallery Title</label>
                        <input
                          type="text"
                          value={gallery.heading}
                          onChange={(e) => updateAdditionalGallery(gIndex, 'heading', e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded px-3 py-1.5 text-sm"
                          placeholder="e.g. Renderings"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Layout</label>
                        <select
                          value={gallery.layout}
                          onChange={(e) => updateAdditionalGallery(gIndex, 'layout', e.target.value as any)}
                          className="w-full bg-black/20 border border-white/10 rounded px-3 py-1.5 text-sm"
                        >
                          <option value="1-col">1 Column (Full Width)</option>
                          <option value="2-col">2 Columns</option>
                          <option value="3-col">3 Columns</option>
                          <option value="masonry">Masonry</option>
                        </select>
                      </div>
                    </div>
                    <button onClick={() => removeAdditionalGallery(gIndex)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <ImageGalleryManager
                      label="Gallery Images"
                      images={(gallery.images || []).map(img => ({ ...img, caption: img.caption || '' }))}
                      onChange={(newImages) => updateGalleryImages(gIndex, newImages)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Links */}
        <div>
          <button type="button"
            onClick={() => toggleSection('videos')}
            className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
          >
            <div className="text-left flex items-center gap-2">
              <Video className="w-4 h-4 text-accent-brand" />
              <div>
                <div className="text-xs tracking-wider uppercase font-medium">Video Links ({(data.videoUrls || []).length})</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">YouTube, Vimeo, etc.</div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('videos') ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.includes('videos') && (
            <div className="border border-t-0 border-accent-brand/20 p-4">
              <div className="space-y-3">
                {(data.videoUrls || []).map((url: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => updateVideoUrl(index, e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1 bg-background border border-border px-3 py-2 text-sm rounded focus:border-accent-brand outline-none"
                    />
                    <button onClick={() => removeVideoUrl(index)} className="p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVideoUrl}
                  className="w-full py-2 border border-dashed border-accent-brand/30 text-accent-brand text-xs font-medium uppercase tracking-wider hover:bg-accent-brand/5 transition-colors"
                >
                  + Add Video Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isRendering) {
    return (
      <div className="space-y-8">
        {/* Header Info */}
        <div className="bg-accent-brand/10 border-l-4 border-accent-brand p-6 rounded-r-lg">
          <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Rendering & Visualization Portfolio
          </h3>
          <p className="text-sm opacity-80 leading-relaxed mb-2">
            Images first, narrative second. Add gallery images below to showcase your work.
          </p>
          <p className="text-xs opacity-60">
            💡 Tip: Use 1-column layout for full-width impact. Group images into galleries (e.g., "Final Renders", "Process Shots").
          </p>
        </div>

        {/* Project Narrative */}
        <div className="border-2 border-accent-brand/30 rounded-lg p-6 bg-accent-brand/5">
          <label className="block text-sm font-medium mb-3 flex items-center gap-2">
            <span className="text-accent-brand">★</span>
            Project Narrative (Lead with Story)
          </label>
          <textarea
            value={data.projectOverview || ''}
            onChange={(e) => onChange({ projectOverview: e.target.value })}
            placeholder="Tell the story of this visualization... What was the vision? What challenges did you solve? What makes this work special? Write in a narrative voice that engages readers."
            rows={8}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent-brand focus:outline-none focus:ring-2 focus:ring-accent-brand/20 resize-none font-serif text-base leading-relaxed"
          />
          <p className="text-xs opacity-50 mt-2">This appears prominently below the hero image. Make it compelling and personal.</p>
        </div>

        {/* Technical Details */}
        <div className="border border-border rounded-lg p-6 bg-card">
          <h4 className="text-sm font-medium opacity-60 mb-4 uppercase tracking-wide">Technical Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs opacity-60 mb-2">Client / Project Name</label>
              <input
                type="text"
                value={data.client || ''}
                onChange={(e) => onChange({ client: e.target.value })}
                placeholder="e.g., Architectural Client, Theater Company"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-accent-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs opacity-60 mb-2">Software Used</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={softwareInput}
                  onChange={(e) => setSoftwareInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftware())}
                  placeholder="Cinema 4D, Vectorworks..."
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:border-accent-brand focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={addSoftware}
                  className="px-4 bg-accent-brand text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(data.softwareUsed || []).map((soft: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-secondary border border-border rounded-full text-xs">
                    {soft}
                    <button type="button" onClick={() => removeSoftware(soft)} className="hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Process & Wireframes */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm tracking-wider uppercase opacity-60 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Process & Wireframes
              </h3>
              <p className="text-xs opacity-40 mt-1">
                Show the evolution of the image (wireframes, lighting passes, etc.)
              </p>
            </div>
            <button type="button"
              onClick={addProcessStep}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent-brand text-white hover:opacity-90 transition-opacity text-xs tracking-wider uppercase"
            >
              <Plus className="w-3 h-3" />
              Add Step
            </button>
          </div>

          {(!data.process || data.process.length === 0) && (
            <div className="text-center py-6 border border-dashed border-border opacity-40">
              <p className="text-xs">No process steps added yet.</p>
            </div>
          )}

          <div className="space-y-4">
            {(data.process || []).map((step: ProcessStep, index: number) => (
              <div key={index} className="border border-border bg-card p-4">
                <div className="flex items-start gap-4">
                  <div className="w-32 h-24 bg-secondary border border-border flex-shrink-0">
                    {step.image ? (
                      <img src={step.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageUploader onChange={(url) => updateProcessStep(index, 'image', url)} label="Add" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between">
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateProcessStep(index, 'title', e.target.value)}
                        placeholder="Step Title (e.g. Wireframe)"
                        className="w-full font-medium bg-transparent border-b border-border focus:border-accent-brand focus:outline-none pb-1 mr-4"
                      />
                      <button type="button" onClick={() => removeProcessStep(index)} className="opacity-40 hover:opacity-100 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={step.description}
                      onChange={(e) => updateProcessStep(index, 'description', e.target.value)}
                      placeholder="Description of this step..."
                      rows={2}
                      className="w-full bg-secondary border border-border p-2 text-sm focus:border-accent-brand focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Galleries */}
        <div className="border-t-2 border-border pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium mb-1 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-accent-brand" />
                Image Galleries
              </h3>
              <p className="text-sm opacity-60">
                First image in first gallery becomes the hero image. Use 1-column for full-width impact.
              </p>
            </div>
            <button type="button"
              onClick={addRenderingGallery}
              className="flex items-center gap-2 px-4 py-2 bg-accent-brand text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Gallery
            </button>
          </div>

          {(!data.galleries || !Array.isArray(data.galleries) || data.galleries.length === 0) && (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-lg bg-secondary/20">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-base font-medium mb-2">No galleries yet</p>
              <p className="text-sm opacity-60 max-w-md mx-auto">Add your first gallery to showcase renders. The first image will be your hero image.</p>
            </div>
          )}

          <div className="space-y-4">
            {(Array.isArray(data.galleries) ? data.galleries : []).map((gallery: RenderingGallery, galleryIndex: number) => (
              <div key={galleryIndex} className="border border-border bg-card">
                <div className="flex items-center justify-between p-4 border-b border-border bg-secondary">
                  <button type="button"
                    onClick={() => toggleGallery(galleryIndex)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <ImageIcon className="w-4 h-4 opacity-60" />
                    <div>
                      <p className="font-medium">{gallery.heading || `Gallery ${galleryIndex + 1}`}</p>
                      <p className="text-xs opacity-60 mt-0.5">
                        {gallery.images?.length || 0} images • {gallery.layout || '1-col'}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1">
                    <button type="button"
                      onClick={() => moveRenderingGallery(galleryIndex, 'up')}
                      disabled={galleryIndex === 0}
                      className="p-1.5 opacity-40 hover:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button type="button"
                      onClick={() => moveRenderingGallery(galleryIndex, 'down')}
                      disabled={galleryIndex === (data.galleries?.length || 0) - 1}
                      className="p-1.5 opacity-40 hover:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button type="button"
                      onClick={() => removeRenderingGallery(galleryIndex)}
                      className="p-1.5 opacity-40 hover:opacity-100 hover:text-destructive"
                      title="Remove gallery"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedGalleries.includes(galleryIndex) && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">Gallery Title</label>
                        <input
                          type="text"
                          value={gallery.heading}
                          onChange={(e) => updateRenderingGallery(galleryIndex, 'heading', e.target.value)}
                          placeholder="e.g., Final Renderings"
                          className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">Layout Style</label>
                        <select
                          value={gallery.layout || '1-col'}
                          onChange={(e) => updateRenderingGallery(galleryIndex, 'layout', e.target.value)}
                          className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
                        >
                          <option value="1-col">Full Width (1 Column)</option>
                          <option value="2-col">Grid (2 Columns)</option>
                          <option value="3-col">Grid (3 Columns)</option>
                          <option value="masonry">Masonry (Dynamic Height)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">Description</label>
                      <textarea
                        value={gallery.description}
                        onChange={(e) => updateRenderingGallery(galleryIndex, 'description', e.target.value)}
                        placeholder="Describe this set of renderings..."
                        rows={3}
                        className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-xs tracking-wider uppercase opacity-60">Images</label>
                      </div>

                      {gallery.images && gallery.images.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {gallery.images.map((image, imageIndex) => (
                            <div key={imageIndex} className="border border-border p-3 bg-background space-y-2">
                              <div className="flex items-start gap-2">
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={image.caption}
                                    onChange={(e) => updateRenderingImage(galleryIndex, imageIndex, 'caption', e.target.value)}
                                    placeholder="Image caption (optional)"
                                    className="w-full px-3 py-1.5 bg-secondary border border-border focus:border-accent-brand focus:outline-none text-sm"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  {onSetCover && image.url && (
                                    <button type="button"
                                      onClick={() => onSetCover(image.url)}
                                      className={`p-1.5 border transition-colors ${currentCover === image.url
                                        ? 'bg-accent-brand text-white border-accent-brand'
                                        : 'border-border opacity-40 hover:opacity-100'
                                        }`}
                                      title={currentCover === image.url ? 'Current cover image' : 'Set as cover image'}
                                    >
                                      <Star className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button type="button"
                                    onClick={() => removeRenderingImage(galleryIndex, imageIndex)}
                                    className="p-1.5 opacity-40 hover:opacity-100 hover:text-destructive"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {image.url && (
                                <img
                                  src={image.url}
                                  alt={image.caption || `Preview ${imageIndex + 1}`}
                                  className="w-full h-48 object-cover border border-border"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <ImageUploader
                        label="Add Render to Gallery"
                        onChange={(url) => {
                          const newGalleries = [...(Array.isArray(data.galleries) ? data.galleries : [])];
                          if (!newGalleries[galleryIndex].images) {
                            newGalleries[galleryIndex].images = [];
                          }
                          newGalleries[galleryIndex].images.push({ url, caption: '' });
                          onChange({ galleries: newGalleries });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Video URLs */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm tracking-wider uppercase opacity-60">Flythroughs & Video</h3>
              <p className="text-xs opacity-40 mt-1">
                Add YouTube or Vimeo links for 3D flythroughs
              </p>
            </div>
            <button type="button"
              onClick={addVideoUrl}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent-brand text-white hover:opacity-90 transition-opacity text-xs tracking-wider uppercase"
            >
              <Plus className="w-3 h-3" />
              Add Video
            </button>
          </div>

          {(!data.videoUrls || data.videoUrls.length === 0) ? (
            <div className="text-center py-6 border border-dashed border-border opacity-40">
              <p className="text-xs">No videos yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.videoUrls.map((url: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => updateVideoUrl(index, e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
                  />
                  <button type="button"
                    onClick={() => removeVideoUrl(index)}
                    className="p-2 opacity-40 hover:opacity-100 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // SCENIC DESIGN (default)
  return (
    <div className="space-y-8">
      <GalleryEditor
        label="Primary Gallery (Renderings & Design)"
        images={data.galleries?.hero || []}
        captions={data.galleries?.heroCaptions || []}
        altTexts={data.galleries?.heroAlt || []}
        projectContext={projectContext}
        onChange={(images, captions, altTexts) => {
          onChange({
            galleries: {
              ...(data.galleries || {}),
              hero: images,
              heroCaptions: captions,
              heroAlt: altTexts
            }
          });
        }}
        currentCover={currentCover}
        onSetCover={onSetCover}
      />

      <div className="h-px bg-border" />

      <GalleryEditor
        label="Secondary Gallery (Production Photos)"
        images={data.galleries?.process || []}
        captions={data.galleries?.processCaptions || []}
        altTexts={data.galleries?.processAlt || []}
        projectContext={projectContext}
        onChange={(images, captions, altTexts) => {
          onChange({
            galleries: {
              ...(data.galleries || {}),
              process: images,
              processCaptions: captions,
              processAlt: altTexts
            }
          });
        }}
        currentCover={currentCover}
        onSetCover={onSetCover}
      />

      <div className="h-px bg-border" />

      <YouTubeVideosEditor 
        videos={data.youtubeVideos || []} 
        onChange={(videos) => onChange({ youtubeVideos: videos })} 
      />
    </div>
  );
}

