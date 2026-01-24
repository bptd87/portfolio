import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Video, Layers } from 'lucide-react';
import { ImageGalleryManager } from './ImageUploader';
import { ContentBlock } from './BlockEditor';
import { GalleryEditor } from './ProjectTemplateFields';

interface KeyFeature {
  title: string;
  description: string;
}

interface ProcessStep {
  title: string;
  description: string;
  images?: string[];
  imageCaptions?: string[];
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

// Local interfaces for Experiential specific structured data
interface ExperientialProject {
  // Agency stats
  clientName?: string;
  role?: string;
  duration?: string;

  // Main content
  challenge?: string;
  solution?: string;

  // Key features
  keyFeatures?: KeyFeature[];

  // Process timeline
  process?: ProcessStep[];

  // Team
  team?: TeamMember[];

  // Metrics
  metrics?: Metric[];

  // Testimonial
  testimonial?: Testimonial;

  // Gallery
  galleries?: {
    hero?: string[];
    heroCaptions?: string[];
    additional?: AdditionalGallery[];
  };

  // Video Links
  videoUrls?: string[];

  // Additional content blocks
  content?: ContentBlock[];
}

interface ExperientialDesignEditorProps {
  data: ExperientialProject;
  onChange: (data: ExperientialProject) => void;
  currentCover?: string;
  onSetCover?: (url: string) => void;
}

export function ExperientialDesignEditor({
  data,
  onChange,
}: ExperientialDesignEditorProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['stats', 'challenge']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Video Handlers
  const addVideoUrl = () => {
    const newVideos = [...(data.videoUrls || []), ''];
    onChange({ ...data, videoUrls: newVideos });
  };

  const updateVideoUrl = (index: number, value: string) => {
    const newVideos = [...(data.videoUrls || [])];
    newVideos[index] = value;
    onChange({ ...data, videoUrls: newVideos });
  };

  const removeVideoUrl = (index: number) => {
    const newVideos = (data.videoUrls || []).filter((_, i) => i !== index);
    onChange({ ...data, videoUrls: newVideos });
  };

  // Additional Gallery Handlers
  const addAdditionalGallery = () => {
    const newGallery: AdditionalGallery = {
      id: crypto.randomUUID(),
      heading: 'New Gallery',
      description: '',
      images: [],
      layout: '3-col'
    };

    onChange({
      ...data,
      galleries: {
        ...data.galleries,
        additional: [...(data.galleries?.additional || []), newGallery]
      }
    });
  };

  const updateAdditionalGallery = (index: number, field: keyof AdditionalGallery, value: any) => {
    const newAdditional = [...(data.galleries?.additional || [])];
    newAdditional[index] = { ...newAdditional[index], [field]: value };

    onChange({
      ...data,
      galleries: {
        ...data.galleries,
        additional: newAdditional
      }
    });
  };

  const removeAdditionalGallery = (index: number) => {
    const newAdditional = (data.galleries?.additional || []).filter((_, i) => i !== index);
    onChange({
      ...data,
      galleries: {
        ...data.galleries,
        additional: newAdditional
      }
    });
  };

  const updateGalleryImages = (galleryIndex: number, newImages: Array<{ url: string; caption?: string; alt?: string; }>) => {
    const newAdditional = [...(data.galleries?.additional || [])];
    newAdditional[galleryIndex].images = newImages.map((img) => ({
      ...img,
      caption: img.caption || '',
    }));
    onChange({
      ...data,
      galleries: {
        ...data.galleries,
        additional: newAdditional
      }
    });
  };

  // Key Features handlers
  const addKeyFeature = () => {
    const newFeatures = [...(data.keyFeatures || []), { title: '', description: '' }];
    onChange({ ...data, keyFeatures: newFeatures });
  };

  const updateKeyFeature = (index: number, field: keyof KeyFeature, value: string) => {
    const newFeatures = [...(data.keyFeatures || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ ...data, keyFeatures: newFeatures });
  };

  const removeKeyFeature = (index: number) => {
    const newFeatures = (data.keyFeatures || []).filter((_, i) => i !== index);
    onChange({ ...data, keyFeatures: newFeatures });
  };

  // Process handlers
  const addProcessStep = () => {
    const newProcess = [...(data.process || []), { title: '', description: '', image: '' }];
    onChange({ ...data, process: newProcess });
  };

  const updateProcessStep = (index: number, field: keyof ProcessStep, value: string) => {
    const newProcess = [...(data.process || [])];
    newProcess[index] = { ...newProcess[index], [field]: value };
    onChange({ ...data, process: newProcess });
  };

  const removeProcessStep = (index: number) => {
    const newProcess = (data.process || []).filter((_, i) => i !== index);
    onChange({ ...data, process: newProcess });
  };

  const moveProcessStep = (index: number, direction: 'up' | 'down') => {
    const newProcess = [...(data.process || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newProcess.length) return;

    [newProcess[index], newProcess[targetIndex]] = [newProcess[targetIndex], newProcess[index]];
    onChange({ ...data, process: newProcess });
  };

  // Team handlers
  const addTeamMember = () => {
    const newTeam = [...(data.team || []), { name: '', role: '' }];
    onChange({ ...data, team: newTeam });
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const newTeam = [...(data.team || [])];
    newTeam[index] = { ...newTeam[index], [field]: value };
    onChange({ ...data, team: newTeam });
  };

  const removeTeamMember = (index: number) => {
    const newTeam = (data.team || []).filter((_, i) => i !== index);
    onChange({ ...data, team: newTeam });
  };

  // Metrics handlers
  const addMetric = () => {
    const newMetrics = [...(data.metrics || []), { value: '', label: '' }];
    onChange({ ...data, metrics: newMetrics });
  };

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const newMetrics = [...(data.metrics || [])];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    onChange({ ...data, metrics: newMetrics });
  };

  const removeMetric = (index: number) => {
    const newMetrics = (data.metrics || []).filter((_, i) => i !== index);
    onChange({ ...data, metrics: newMetrics });
  };


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
                  onChange={(e) => onChange({ ...data, clientName: e.target.value })}
                  placeholder="e.g., Global Tech Innovations"
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Your Role</label>
                <input
                  type="text"
                  value={data.role || ''}
                  onChange={(e) => onChange({ ...data, role: e.target.value })}
                  placeholder="e.g., Lead Experience Designer"
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Timeline/Duration</label>
                <input
                  type="text"
                  value={data.duration || ''}
                  onChange={(e) => onChange({ ...data, duration: e.target.value })}
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
              onChange={(e) => onChange({ ...data, challenge: e.target.value })}
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
              onChange={(e) => onChange({ ...data, solution: e.target.value })}
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
            {(data.keyFeatures || []).map((feature, index) => (
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
            {(data.process || []).map((step, index) => (
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
                      images={step.images?.map((url, i) => ({ url, caption: step.imageCaptions?.[i] || '' })) || []}
                      onChange={(newImages) => {
                        const newProcess = [...(data.process || [])];
                        newProcess[index] = {
                          ...newProcess[index],
                          images: newImages.map(img => img.url),
                          imageCaptions: newImages.map(img => img.caption || '')
                        };
                        onChange({ ...data, process: newProcess });
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
            {(data.team || []).map((member, index) => (
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
            {(data.metrics || []).map((metric, index) => (
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
                  ...data,
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
                    ...data,
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
                    ...data,
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

      {/* Project Galleries Section - NEW! */}
      <div>
        <button type="button"
          onClick={() => toggleSection('galleries')}
          className="w-full flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
        >
          <div className="text-left">
            <div className="text-xs tracking-wider uppercase font-medium text-blue-400">📸 Project Galleries (NEW!)</div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">Upload project photos - displays in image grid on page</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform ${expandedSections.includes('galleries') ? 'rotate-180' : ''}`} />
        </button>

        {expandedSections.includes('galleries') && (
          <div className="border border-t-0 border-blue-500/30 p-4 bg-blue-500/5">
            <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-xs text-blue-300">
                <strong>Tip:</strong> Upload project photos here for a simple image gallery.
                For more complex layouts with mixed content (text + images), use "Additional Content Blocks" below.
              </p>
            </div>
            <GalleryEditor
              label="Project Photos"
              images={data.galleries?.hero || []}
              captions={data.galleries?.heroCaptions || []}
              onChange={(images, captions) => {
                onChange({
                  ...data,
                  galleries: {
                    ...data.galleries,
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


      {/* ADDITIONAL GALLERIES */}
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

            {(data.galleries?.additional || []).map((gallery, gIndex) => (
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
                        onChange={(e) => updateAdditionalGallery(gIndex, 'layout', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-1.5 text-sm"
                        aria-label="Select gallery layout"
                        title="Select gallery layout"
                      >
                        <option value="1-col">1 Column (Full Width)</option>
                        <option value="2-col">2 Columns</option>
                        <option value="3-col">3 Columns</option>
                        <option value="masonry">Masonry</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={() => removeAdditionalGallery(gIndex)} className="text-red-400 hover:text-red-300 p-1" title="Remove video URL" aria-label="Remove video URL">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Images in this gallery - Using ImageGalleryManager for Bulk Upload & Alt Text */}
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

      {/* MEDIA / VIDEOS */}
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
              {(data.videoUrls || []).map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => updateVideoUrl(index, e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 bg-background border border-border px-3 py-2 text-sm rounded focus:border-accent-brand outline-none"
                  />
                  <button onClick={() => removeVideoUrl(index)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Remove video URL" title="Remove video URL">
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
