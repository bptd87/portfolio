import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { ImprovedBlockEditor } from './ImprovedBlockEditor';
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
  };

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
                    <ImageUploader
                      value=""
                      onChange={(url) => {
                        const newProcess = [...(data.process || [])];
                        const currentImages = newProcess[index].images || [];
                        const currentCaptions = newProcess[index].imageCaptions || [];
                        newProcess[index] = {
                          ...newProcess[index],
                          images: [...currentImages, url],
                          imageCaptions: [...currentCaptions, '']
                        };
                        onChange({ ...data, process: newProcess });
                      }}
                      label="📸 Add another image to this step"
                    />

                    {step.images && step.images.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {step.images.map((img, imgIndex) => (
                          <div key={imgIndex} className="flex items-center gap-2 p-2 bg-background rounded border border-border">
                            <img src={img} alt="" className="w-12 h-12 object-cover rounded" />
                            <input
                              type="text"
                              value={step.imageCaptions?.[imgIndex] || ''}
                              onChange={(e) => {
                                const newProcess = [...(data.process || [])];
                                const newCaptions = [...(newProcess[index].imageCaptions || [])];
                                newCaptions[imgIndex] = e.target.value;
                                newProcess[index] = { ...newProcess[index], imageCaptions: newCaptions };
                                onChange({ ...data, process: newProcess });
                              }}
                              placeholder="Image caption..."
                              className="flex-1 px-2 py-1 bg-background border border-border focus:border-accent-brand focus:outline-none text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newProcess = [...(data.process || [])];
                                newProcess[index] = {
                                  ...newProcess[index],
                                  images: step.images!.filter((_, i) => i !== imgIndex),
                                  imageCaptions: step.imageCaptions?.filter((_, i) => i !== imgIndex) || []
                                };
                                onChange({ ...data, process: newProcess });
                              }}
                              className="p-1 hover:text-destructive"
                              title="Remove image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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

      {/* Additional Content Blocks Section */}
      <div>
        <button type="button"
          onClick={() => toggleSection('content')}
          className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
        >
          <div className="text-left">
            <div className="text-xs tracking-wider uppercase font-medium">Additional Content Blocks ({(data.content || []).length})</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Advanced: Mix text, images, headings & videos (like a blog post)</div>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('content') ? 'rotate-180' : ''}`} />
        </button>

        {expandedSections.includes('content') && (
          <div className="border border-t-0 border-accent-brand/20 p-4 min-h-[500px]">
            {/* Rich Block Editor */}
            <ImprovedBlockEditor
              blocks={data.content || []}
              onChange={(newBlocks) => onChange({ ...data, content: newBlocks })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
